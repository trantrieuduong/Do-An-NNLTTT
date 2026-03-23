
import React, { useState, useEffect } from 'react';
import { X, Search, Users, Check, Loader2 } from 'lucide-react';
import { friendService } from '../../api/friendService';
import { getAvatarUrl } from '../../utils/constants';
import '../../styles/CreateGroupModal.css';

const CreateGroupModal = ({ isOpen, onClose, onCreate }) => {
    const [chatName, setChatName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFriends();
            setChatName('');
            setSearchQuery('');
            setSelectedFriends([]);
        }
    }, [isOpen]);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const response = await friendService.getFriends();
            setFriends(response.data || []);
        } catch (error) {
            console.error("Failed to fetch friends", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFriendSelection = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!chatName.trim() || selectedFriends.length === 0) return;

        setCreating(true);
        try {
            await onCreate(chatName, selectedFriends);
            onClose();
        } catch (error) {
            console.error("Failed to create group", error);
        } finally {
            setCreating(false);
        }
    };

    const filteredFriends = friends.filter(friend =>
        friend.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content create-group-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-container">
                        <Users size={24} className="text-primary" />
                        <h3>Create Group Chat</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>Group Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Project Team, Weekend Plans..."
                            value={chatName}
                            onChange={(e) => setChatName(e.target.value)}
                            className="group-name-input"
                            autoFocus
                        />
                    </div>

                    <div className="friends-selection-section">
                        <label>Add Members ({selectedFriends.length})</label>
                        <div className="search-box">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search friends..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="group-friends-list">
                            {loading ? (
                                <div className="loading-state">
                                    <Loader2 className="animate-spin" size={24} />
                                </div>
                            ) : filteredFriends.length > 0 ? (
                                filteredFriends.map(friend => (
                                    <div
                                        key={friend.userId}
                                        className={`group-friend-item ${selectedFriends.includes(friend.userId) ? 'selected' : ''}`}
                                        onClick={() => toggleFriendSelection(friend.userId)}
                                    >
                                        <div className="group-friend-avatar">
                                            <img
                                                src={friend.avatarUrl || getAvatarUrl(friend.fullName)}
                                                alt={friend.fullName}
                                                onError={(e) => { e.target.src = getAvatarUrl(friend.fullName) }}
                                            />
                                            {selectedFriends.includes(friend.userId) && (
                                                <div className="selection-indicator">
                                                    <Check size={12} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="group-friend-info">
                                            <div className="group-friend-name">{friend.fullName}</div>
                                            <div className="group-friend-username">@{friend.username}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    No friends found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn btn-secondary" onClick={onClose} disabled={creating}>
                        Cancel
                    </button>
                    <button
                        className="modal-btn btn-primary"
                        onClick={handleSubmit}
                        disabled={creating || !chatName.trim() || selectedFriends.length === 0}
                    >
                        {creating ? <Loader2 className="animate-spin" size={16} /> : 'Create Group'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
