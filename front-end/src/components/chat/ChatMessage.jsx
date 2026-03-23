import React from 'react';
import { getAvatarUrl } from '../../utils/constants';
import { File } from 'lucide-react';

const ChatMessage = ({ message, isOwnMessage, onAvatarClick }) => {
    const formatTime = (dateString, now = new Date()) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return ""; // hoặc throw Error

        const diffMs = Math.abs(now - date);
        const oneDayMs = 24 * 60 * 60 * 1000;

        // “lớn hơn 1 ngày”
        const moreThan1Day = diffMs > oneDayMs;

        // “lớn hơn 1 năm” (xấp xỉ 365.25 ngày)
        const moreThan1Year = diffMs > 365.25 * oneDayMs;

        const options = {
            hour: "numeric",
            minute: "numeric",
            ...(moreThan1Day ? { day: "2-digit", month: "2-digit" } : {}),
            ...(moreThan1Year ? { year: "numeric" } : {}),
        };

        return new Intl.DateTimeFormat(undefined, options).format(date);
    };


    return (
        <div className={`chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
            {!isOwnMessage && (
                <div
                    className="message-avatar"
                    onClick={() => onAvatarClick(message.senderId)}
                    style={{ cursor: 'pointer' }}
                >
                    {message.senderAvatarUrl ? (
                        <img src={message.senderAvatarUrl} alt={message.senderFullName} />
                    ) : (
                        <img src={getAvatarUrl(message.senderFullName)} alt={message.senderFullName} />
                    )}
                </div>
            )}
            <div className="message-content-wrapper">
                <div className="message-header">
                    {!isOwnMessage && (
                        <span
                            className="sender-name"
                            onClick={() => onAvatarClick(message.senderId)}
                            style={{ cursor: 'pointer' }}
                        >
                            {message.senderFullName}
                        </span>
                    )}
                </div>
                <div className="message-bubble">
                    {message.type === 'IMAGE' ? (
                        <img src={message.content} alt="Shared image" className="message-image" />
                    ) : message.type === 'VIDEO' ? (
                        <video controls className="message-video">
                            <source src={message.content} />
                            Your browser does not support the video tag.
                        </video>
                    ) : message.type === 'FILE' ? (
                        <a
                            href={message.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="message-file"
                            title="Download File"
                        >
                            <File size={24} />
                            <span className="file-name">
                                {decodeURIComponent(message.content.split('/').pop().split('?')[0])}
                            </span>
                        </a>
                    ) : (
                        <p>{message.content}</p>
                    )}
                </div>
                <div className="message-footer">
                    <span className="message-time">{formatTime(message.createdAt)}</span>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
