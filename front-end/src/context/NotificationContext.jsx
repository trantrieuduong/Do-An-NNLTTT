import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { notificationService } from '../api/notificationService';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children, stompClient, isConnected }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const subscriptionRef = useRef(null);

    // Parse payload string -> object safely
    const parsePayload = (n) => {
        if (!n) return n;
        if (typeof n.payload === 'string') {
            try { return { ...n, payload: JSON.parse(n.payload) }; }
            catch { return n; }
        }
        return n;
    };

    // Fetch unread count from API
    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(Number(count) || 0);
        } catch (err) {
            console.error('Failed to fetch notification unread count', err);
        }
    }, []);

    // Initial unread count fetch when user is logged in or token changes
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        fetchUnreadCount();
    }, [fetchUnreadCount, localStorage.getItem('token')]);

    // Subscribe to WebSocket /user/queue/notification when stompClient is ready
    useEffect(() => {
        if (!stompClient || !isConnected) return;

        // Cleanup previous subscription
        if (subscriptionRef.current) {
            try { subscriptionRef.current.unsubscribe(); } catch (_) { }
        }

        subscriptionRef.current = stompClient.subscribe(
            '/user/queue/notification',
            (message) => {
                try {
                    const raw = JSON.parse(message.body);
                    const notif = parsePayload(raw);
                    console.log('NotificationContext: received realtime notification', notif);
                    setNotifications(prev => [notif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                } catch (e) {
                    console.error('Failed to parse notification message', e);
                }
            }
        );

        return () => {
            if (subscriptionRef.current) {
                try { subscriptionRef.current.unsubscribe(); } catch (_) { }
                subscriptionRef.current = null;
            }
        };
    }, [stompClient, isConnected]);

    // Load notifications page from API
    const loadNotifications = useCallback(async (reset = false) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const currentPage = reset ? 0 : page;
            const pageData = await notificationService.getNotifications(currentPage, 20);
            // pageData is a Spring Page object: { content, last, totalElements, ... }
            const content = (pageData?.content ?? []).map(parsePayload);

            if (reset) {
                setNotifications(content);
                setPage(1);
            } else {
                setNotifications(prev => [...prev, ...content]);
                setPage(prev => prev + 1);
            }
            setHasMore(!(pageData?.last ?? true));
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, page]);

    // Mark a single notification as read
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notificationService.readNotification(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.readAll();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all notifications as read', err);
        }
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
        setPage(0);
        setHasMore(true);
    }, []);

    const value = {
        notifications,
        unreadCount,
        isLoading,
        hasMore,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        fetchUnreadCount,
        clearNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
