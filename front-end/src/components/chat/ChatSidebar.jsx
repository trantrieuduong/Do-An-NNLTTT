import React from 'react';
import { Search, Plus } from 'lucide-react';
import { getAvatarUrl } from '../../utils/constants';

const ChatSidebar = ({ chats, onSelectChat, selectedChatId, onCreateGroup }) => {
    const formatLastMessageTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 24 * 60 * 60 * 1000) {
            return new Intl.DateTimeFormat('default', {
                hour: 'numeric',
                minute: 'numeric',
            }).format(date);
        } else {
            return new Intl.DateTimeFormat('default', {
                month: 'short',
                day: 'numeric',
            }).format(date);
        }
    };

    return (
        <div className="chat-sidebar">
            <div className="sidebar-header">
                <h2>Chats</h2>
                <button className="new-chat-button" onClick={onCreateGroup} title="New Group">
                    <Plus size={20} />
                </button>
            </div>
            <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search chats..." />
            </div>
            <div className="chat-list">
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
                        onClick={() => onSelectChat(chat)}
                    >
                        <div className="chat-avatar">
                            {chat.chatAvatarUrl ? (
                                <img src={chat.chatAvatarUrl} alt={chat.chatName} />
                            ) : (
                                <img src={getAvatarUrl(chat.chatName)} alt={chat.chatName} />
                            )}
                        </div>
                        <div className="chat-info">
                            <div className="chat-header-row">
                                <span className="chat-name">{chat.chatName}</span>
                            </div>
                            <div className="chat-preview-row">
                                <span className="last-message-preview">
                                    {/* Ideally the backend should provide a preview string */}
                                    {chat.type === 'GROUP' ? 'Group Chat' : 'Direct Message'}
                                </span>
                                {chat.unreadCount > 0 && (
                                    <span className="unread-badge">{chat.unreadCount}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatSidebar;
