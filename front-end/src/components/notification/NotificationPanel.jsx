import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    Bell, CheckCheck, UserPlus, Users,
    Heart, MessageSquare, Megaphone, X
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import '../../styles/Notification.css';

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
    FRIEND_REQUEST: { icon: UserPlus, color: '#6366f1', label: 'Friend Request' },
    NEW_FRIEND: { icon: Users, color: '#10b981', label: 'New Friend' },
    LIKE_POST: { icon: Heart, color: '#ef4444', label: 'Like' },
    COMMENT_POST: { icon: MessageSquare, color: '#f59e0b', label: 'Comment' },
    SYSTEM_ANNOUNCEMENT: { icon: Megaphone, color: '#8b5cf6', label: 'System' },
};

// ── Navigation resolver ───────────────────────────────────────────────────────
const resolveNav = (type, payload) => {
    switch (type) {
        case 'FRIEND_REQUEST':
            return payload?.requesterId ? `/profile/${payload.requesterId}` : '/friends';
        case 'NEW_FRIEND':
            return payload?.friendId ? `/profile/${payload.friendId}` : '/friends';
        case 'LIKE_POST':
        case 'COMMENT_POST':
            return payload?.postId ? `/post/${payload.postId}` : '/';
        case 'SYSTEM_ANNOUNCEMENT':
            return payload?.targetId ? `/post/${payload.targetId}` : '/';
        default:
            return '/';
    }
};

// ── Time formatter ────────────────────────────────────────────────────────────
const formatTime = (createdAt) => {
    if (!createdAt) return '';
    const diff = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

// ── Single notification item ──────────────────────────────────────────────────
const NotificationItem = ({ notification, onNavigate }) => {
    const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.SYSTEM_ANNOUNCEMENT;
    const IconCmp = cfg.icon;
    const payload = notification.payload ?? {};

    return (
        <div
            className={`notif-item ${notification.read ? 'notif-read' : 'notif-unread'}`}
            onClick={() => onNavigate(notification)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate(notification)}
        >
            <div className="notif-avatar-wrap">
                <div
                    className="notif-avatar-placeholder"
                    style={{ background: cfg.color + '20' }}
                >
                    <IconCmp size={18} color={cfg.color} />
                </div>
                <span className="notif-type-icon" style={{ background: cfg.color }}>
                    <IconCmp size={10} color="#fff" />
                </span>
            </div>

            <div className="notif-content">
                <p className="notif-title">
                    {notification.message || payload.reviewTitle || 'Notification'}
                </p>
                <span className="notif-time">{formatTime(notification.createdAt)}</span>
            </div>

            {!notification.read && <span className="notif-dot" />}
        </div>
    );
};

// ── Main panel (Portal) ───────────────────────────────────────────────────────
const NotificationPanel = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        isLoading,
        hasMore,
        loadNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotification();

    const [isOpen, setIsOpen] = useState(false);
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
    const bellRef = useRef(null);  // ref on the bell button
    const panelRef = useRef(null);  // ref on the portal panel
    const hasLoadedRef = useRef(false);

    // ── Compute panel position relative to the bell button ──────────────────
    const PANEL_W = 360;
    const PANEL_H = 560;

    const computePosition = useCallback(() => {
        if (!bellRef.current) return;
        const rect = bellRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Prefer right of sidebar; fallback left if not enough room
        let left = rect.right + 8;
        if (left + PANEL_W > vw - 8) left = rect.left - PANEL_W - 8;
        left = Math.max(8, left);

        // Align top with bell button; clamp so panel stays on screen
        let top = rect.top;
        if (top + PANEL_H > vh - 8) top = vh - PANEL_H - 8;
        top = Math.max(8, top);

        setPanelPos({ top, left });
    }, []);

    // ── Close on outside click (works across portal boundary) ───────────────
    useEffect(() => {
        if (!isOpen) return;
        const handleOutside = (e) => {
            const clickedBell = bellRef.current?.contains(e.target);
            const clickedPanel = panelRef.current?.contains(e.target);
            if (!clickedBell && !clickedPanel) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [isOpen]);

    // ── Close on Escape ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen]);

    // ── Update position on scroll / resize while open ───────────────────────
    useEffect(() => {
        if (!isOpen) return;
        const update = () => computePosition();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [isOpen, computePosition]);

    // ── Toggle ───────────────────────────────────────────────────────────────
    const handleToggle = () => {
        const next = !isOpen;
        if (next) computePosition();
        setIsOpen(next);
        if (next && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadNotifications(true);
        }
    };

    // ── Navigate + mark read ─────────────────────────────────────────────────
    const handleNavigate = async (notif) => {
        setIsOpen(false);
        if (!notif.read) await markAsRead(notif.id);
        navigate(resolveNav(notif.type, notif.payload));
    };

    const handleMarkAll = (e) => {
        e.stopPropagation();
        markAllAsRead();
    };

    // ── Portal panel content ─────────────────────────────────────────────────
    const panelContent = isOpen && createPortal(
        <div
            ref={panelRef}
            className="notif-panel"
            style={{ top: panelPos.top, left: panelPos.left }}
        >
            {/* Header */}
            <div className="notif-panel-header">
                <span className="notif-panel-title">
                    Notifications
                    {unreadCount > 0 && (
                        <span className="notif-panel-count">{unreadCount}</span>
                    )}
                </span>
                <div className="notif-header-actions">
                    {unreadCount > 0 && (
                        <button className="notif-icon-btn" onClick={handleMarkAll} title="Mark all as read">
                            <CheckCheck size={16} />
                        </button>
                    )}
                    <button className="notif-icon-btn notif-close-btn" onClick={() => setIsOpen(false)} title="Close">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="notif-list">
                {notifications.length === 0 && !isLoading && (
                    <div className="notif-empty">
                        <Bell size={40} className="notif-empty-icon" />
                        <p>No notifications yet</p>
                    </div>
                )}

                {notifications.map((notif) => (
                    <NotificationItem
                        key={notif.id}
                        notification={notif}
                        onNavigate={handleNavigate}
                    />
                ))}

                {isLoading && (
                    <div className="notif-loading">
                        <span className="notif-spinner" />
                    </div>
                )}

                {!isLoading && hasMore && notifications.length > 0 && (
                    <button className="notif-load-more" onClick={() => loadNotifications(false)}>
                        Load more
                    </button>
                )}

                {!hasMore && notifications.length > 0 && (
                    <p className="notif-end">You're all caught up ✓</p>
                )}
            </div>
        </div>,
        document.body   // ← rendered outside sidebar's DOM tree
    );

    return (
        <div className="notif-wrapper">
            {/* Bell trigger */}
            <button
                ref={bellRef}
                className={`notif-bell-btn${isOpen ? ' active' : ''}`}
                onClick={handleToggle}
                aria-label="Notifications"
                aria-expanded={isOpen}
            >
                <span className="notif-bell-icon-wrap">
                    <Bell size={20} />
                </span>
                <span>Notifications</span>
                {unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {/* Portal panel — rendered into document.body */}
            {panelContent}
        </div>
    );
};

export default NotificationPanel;
