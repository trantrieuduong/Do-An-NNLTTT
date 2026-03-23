import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getUnreadCount } from '../api/chatService';
import { BASE_URL } from '../utils/constants';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [lastChatUpdate, setLastChatUpdate] = useState(null);
    const stompClientRef = useRef(null);
    const activeChatIdRef = useRef(null);

    useEffect(() => {
        const initChat = async () => {
            try {
                // Check if user is logged in
                const token = localStorage.getItem('token');
                if (!token) return;

                // Fetch initial unread count
                const count = await getUnreadCount();
                setUnreadCount(count || 0);

                connectWebSocket(token);
            } catch (error) {
                console.error("Failed to initialize chat context", error);
            }
        };

        if (!stompClientRef.current) {
            initChat();
        }

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
                setIsConnected(false);
            }
        };
    }, []);

    const connectWebSocket = (token) => {
        if (stompClientRef.current) return;

        // TODO: Replace with environment variable
        const socket = new SockJS(`${BASE_URL}/ws?access_token=${encodeURIComponent(token)}`);

        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('ChatContext: Connected to WebSocket');
                setIsConnected(true);

                // Subscribe to global chat updates
                client.subscribe('/user/queue/chats', (message) => {
                    handleChatUpdate(JSON.parse(message.body));
                });
            },
            onStompError: (frame) => {
                console.error('ChatContext: Broker reported error: ' + frame.headers['message']);
                console.error('ChatContext: Additional details: ' + frame.body);
            },
            onWebSocketClose: () => {
                console.log('ChatContext: WebSocket closed');
                setIsConnected(false);
            }
        });

        client.activate();
        stompClientRef.current = client;
    };

    const handleChatUpdate = (updateEvent) => {
        console.log("ChatContext: Received update", updateEvent);

        if (updateEvent.chatEvent === 'NEW_MESSAGE') {
            // Fetch accurate count from backend instead of incrementing locally
            // to stay in sync even when multiple tabs or chat is already open
            getUnreadCount()
                .then(count => setUnreadCount(count ?? 0))
                .catch(err => console.error('Failed to refresh unread count', err));
            // Trigger update for Chat page (to bump list)
            setLastChatUpdate(updateEvent);
        }
    };

    const setActiveChatId = (chatId) => {
        activeChatIdRef.current = chatId;
        if (chatId) {
            // Re-fetch after opening a chat so badge reflects messages just marked read
            getUnreadCount()
                .then(count => setUnreadCount(count ?? 0))
                .catch(console.error);
        }
    };

    const value = {
        unreadCount,
        isConnected,
        stompClient: stompClientRef.current,
        lastChatUpdate,
        setActiveChatId,
        connect: (token) => connectWebSocket(token),
        disconnect: () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
                setIsConnected(false);
                setUnreadCount(0);
            }
        },
        refreshUnreadCount: async () => {
            const count = await getUnreadCount();
            setUnreadCount(count ?? 0);
        }
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
