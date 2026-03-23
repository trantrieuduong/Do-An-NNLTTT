import React, { useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';
import ChatMessage from './ChatMessage';
import { getAvatarUrl } from '../../utils/constants';
import { MoreVertical, User, CheckCheck, Users, Info, LogOut } from 'lucide-react';
import GroupInfoModal from './GroupInfoModal';

const ChatWindow = ({
    chat,
    messages,
    onSendMessage,
    currentUserId,
    onAutoMarkRead,
    onViewProfile,
    hasMoreMessages,
    isLoadingOldMessages,
    onLoadMoreMessages
}) => {
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const observer = useRef(null);
    const topObserverRef = useRef(null); // For detecting scroll to top
    const topSentinelRef = useRef(null); // Element at the top to observe
    const isLoadingRef = useRef(false); // Prevent duplicate loading
    const [showMenu, setShowMenu] = useState(false);
    const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
    const menuRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Simple scroll to bottom on new messages. 
        // Improvement: Only scroll if already at bottom or if it's my message.
        scrollToBottom();
    }, [messages]);

    // Intersection Observer for auto-read (only last message if unread)
    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        // Only observe if there are unread messages
        if (!chat || !chat.unreadCount || chat.unreadCount === 0) {
            return;
        }

        observer.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const seq = entry.target.dataset.seq;
                    const senderId = entry.target.dataset.senderid;
                    if (seq && senderId !== currentUserId) {
                        onAutoMarkRead(seq);
                    }
                }
            });
        }, {
            root: messagesContainerRef.current,
            threshold: 0.5 // Message is 50% visible
        });

        // Only observe the last message if it's not from current user
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.senderId !== currentUserId) {
                // Find the DOM element for the last message
                // We scope the search to the container to avoid conflicts
                const lastEl = messagesContainerRef.current?.querySelector(`.message-wrapper[data-seq="${lastMsg.seq}"]`);
                if (lastEl) {
                    observer.current.observe(lastEl);
                }
            }
        }

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [messages, onAutoMarkRead, currentUserId, chat]);

    // Reverse Infinite Scroll: IntersectionObserver for detecting scroll to top
    useEffect(() => {
        if (!hasMoreMessages || isLoadingOldMessages) return;

        if (topObserverRef.current) {
            topObserverRef.current.disconnect();
        }

        topObserverRef.current = new IntersectionObserver(
            async (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !isLoadingRef.current && hasMoreMessages) {
                    isLoadingRef.current = true;

                    // Save scroll position before loading
                    const container = messagesContainerRef.current;
                    const scrollHeightBefore = container.scrollHeight;
                    const scrollTopBefore = container.scrollTop;

                    await onLoadMoreMessages();

                    // Restore scroll position after loading
                    // Wait for next tick to ensure DOM is updated
                    setTimeout(() => {
                        const scrollHeightAfter = container.scrollHeight;
                        const heightDifference = scrollHeightAfter - scrollHeightBefore;
                        container.scrollTop = scrollTopBefore + heightDifference;
                        isLoadingRef.current = false;
                    }, 50);
                }
            },
            {
                root: messagesContainerRef.current,
                threshold: 0.1,
                rootMargin: '20px'
            }
        );

        if (topSentinelRef.current) {
            topObserverRef.current.observe(topSentinelRef.current);
        }

        return () => {
            if (topObserverRef.current) {
                topObserverRef.current.disconnect();
            }
        };
    }, [hasMoreMessages, isLoadingOldMessages, onLoadMoreMessages]);

    // Scroll handler as backup for detecting scroll to top
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = async () => {
            if (isLoadingRef.current || !hasMoreMessages) return;

            // Detect if scrolled near the top
            if (container.scrollTop < 100) {
                isLoadingRef.current = true;

                const scrollHeightBefore = container.scrollHeight;
                const scrollTopBefore = container.scrollTop;

                await onLoadMoreMessages();

                setTimeout(() => {
                    const scrollHeightAfter = container.scrollHeight;
                    const heightDifference = scrollHeightAfter - scrollHeightBefore;
                    container.scrollTop = scrollTopBefore + heightDifference;
                    isLoadingRef.current = false;
                }, 50);
            }
        };

        container.addEventListener('scroll', handleScroll);

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [hasMoreMessages, onLoadMoreMessages]);

    // Sync isLoadingRef with isLoadingOldMessages prop
    useEffect(() => {
        if (!isLoadingOldMessages) {
            isLoadingRef.current = false;
        }
    }, [isLoadingOldMessages]);

    // ... menu outside click effect ...
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!chat) {
        return (
            <div className="chat-window empty">
                <div className="empty-state">
                    <h3>Select a chat to start messaging</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="header-info">
                    <div className="header-avatar">
                        {chat.chatAvatarUrl ? (
                            <img src={chat.chatAvatarUrl} alt={chat.chatName} />
                        ) : (
                            <img src={getAvatarUrl(chat.chatName)} alt={chat.chatName} />
                        )}
                    </div>
                    <div className="header-text">
                        <h3>{chat.chatName}</h3>
                        <span className="status-text">{chat.type === 'GROUP' ? 'Group' : ''}</span>
                    </div>
                </div>
                <div className="header-actions" style={{ position: 'relative' }} ref={menuRef}>
                    <button className="icon-button" onClick={() => setShowMenu(!showMenu)}>
                        <MoreVertical size={20} />
                    </button>
                    {showMenu && (
                        <div className="chat-menu-dropdown">
                            {chat.type === 'GROUP' ? (
                                <button onClick={() => { setIsGroupInfoOpen(true); setShowMenu(false); }}>
                                    <Info size={16} />
                                    <span>Group Info</span>
                                </button>
                            ) : (
                                <button onClick={() => { onViewProfile(); setShowMenu(false); }}>
                                    <User size={16} />
                                    <span>View Profile</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <GroupInfoModal
                chat={chat}
                isOpen={isGroupInfoOpen}
                onClose={() => setIsGroupInfoOpen(false)}
                onUpdateGroup={(updatedChat) => {
                    // Ideally update chat name in parent or context, but here at least close modal
                    console.log("Updated chat:", updatedChat);
                }}
                onLeaveGroup={(chatId) => {
                    // Handle leaving group logic, maybe navigate away or refresh
                    console.log("Left group:", chatId);
                    window.location.reload(); // Simple refresh for now to clear state
                }}
            />

            <div className="messages-area" ref={messagesContainerRef}>
                {/* Sentinel element for IntersectionObserver at the top */}
                <div ref={topSentinelRef} style={{ height: '1px' }} />

                {/* Loading indicator */}
                {isLoadingOldMessages && (
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                        <span>Loading older messages...</span>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={msg.id || index}
                        data-seq={msg.seq}
                        data-senderid={msg.senderId}
                        className={`message-wrapper ${msg.senderId === currentUserId ? 'own' : 'other'}`}
                    >
                        <ChatMessage
                            message={msg}
                            isOwnMessage={msg.senderId === currentUserId}
                            onAvatarClick={onViewProfile}
                        />
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <MessageInput onSendMessage={onSendMessage} />
            </div>
        </div>
    );
};

export default ChatWindow;
