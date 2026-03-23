import React, { useState, useRef } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { uploadFile } from '../../api/fileService';

const MessageInput = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message, 'TEXT');
            setMessage('');
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const fileUrl = await uploadFile(file);

            let type = 'FILE';
            if (file.type.startsWith('image/')) {
                type = 'IMAGE';
            } else if (file.type.startsWith('video/')) {
                type = 'VIDEO';
            }

            onSendMessage(fileUrl, type);
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Failed to send file. Please try again.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleAttachmentClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <form className="message-input-container" onSubmit={handleSubmit}>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            <button
                type="button"
                className="attachment-button"
                onClick={handleAttachmentClick}
                disabled={isUploading}
                title="Send File"
            >
                {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
            </button>

            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
                disabled={isUploading}
            />

            <button
                type="submit"
                className="send-button"
                disabled={!message.trim() || isUploading}
            >
                <Send size={20} />
            </button>
        </form>
    );
};

export default MessageInput;
