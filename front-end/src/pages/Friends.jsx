import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { friendService } from '../api/friendService';
import { UserPlus, UserMinus, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';
import '../styles/Friends.css';
import { getAvatarUrl } from '../utils/constants';


const Friends = () => {
    const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'received', 'sent'
    const [friends, setFriends] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isUnfriendModalOpen, setIsUnfriendModalOpen] = useState(false);
    const [selectedFriendId, setSelectedFriendId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [friendsData, receivedData, sentData] = await Promise.all([
                friendService.getFriends(),
                friendService.getFriendRequestsReceived(),
                friendService.getFriendRequestsSent()
            ]);

            setFriends(friendsData.data || []);
            setReceivedRequests(receivedData.data || []);
            setSentRequests(sentData.data || []);
        } catch (error) {
            console.error("Error fetching friend data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAccept = async (e, reqId) => {
        e.preventDefault();
        try {
            await friendService.acceptFriendRequest(reqId);
            toast.success("Friend request accepted!");
            fetchData();
        } catch (error) {
            console.error("Failed to accept request", error);
            toast.error("Failed to accept friend request");
        }
    };

    const handleDecline = async (e, reqId) => {
        e.preventDefault();
        try {
            await friendService.declineFriendRequest(reqId);
            toast.success("Friend request declined");
            fetchData();
        } catch (error) {
            console.error("Failed to decline request", error);
            toast.error("Failed to decline request");
        }
    };

    const handleCancel = async (e, reqId) => {
        e.preventDefault();
        try {
            await friendService.cancelFriendRequest(reqId);
            toast.success("Friend request cancelled");
            fetchData();
        } catch (error) {
            console.error("Failed to cancel request", error);
            toast.error("Failed to cancel request");
        }
    };

    const openUnfriendModal = (e, userId) => {
        e.preventDefault();
        setSelectedFriendId(userId);
        setIsUnfriendModalOpen(true);
    };

    const handleUnfriendConfirm = async () => {
        if (!selectedFriendId) return;

        try {
            await friendService.unFriend(selectedFriendId);
            toast.success("Unfriended successfully");
            fetchData();
        } catch (error) {
            console.error("Failed to unfriend", error);
            toast.error("Failed to unfriend user");
        } finally {
            setIsUnfriendModalOpen(false);
            setSelectedFriendId(null);
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading...</div>;
        }

        if (activeTab === 'friends') {
            if (friends.length === 0) {
                return (
                    <div className="empty-state-large">
                        <h3>No friends yet</h3>
                        <p>Search for people to add them to your network.</p>
                        <NavLink to="/search" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>Find Friends</NavLink>
                    </div>
                );
            }
            return (
                <div className="friends-grid">
                    {friends.map(friend => (
                        <div key={friend.userId} className="friend-card">
                            <NavLink to={`/profile/${friend.username}`} style={{ width: '100%', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img
                                    src={friend.avatarUrl || getAvatarUrl(friend.fullName)}
                                    alt={friend.fullName}
                                    className="card-avatar"
                                    onError={(e) => { e.target.src = getAvatarUrl(friend.fullName) }}
                                />
                                <div className="card-name">{friend.fullName}</div>
                                <div className="card-username">@{friend.username}</div>
                            </NavLink>
                            <div className="card-actions">
                                <button className="action-btn btn-danger" onClick={(e) => openUnfriendModal(e, friend.userId)}>
                                    <UserMinus size={16} /> Unfriend
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (activeTab === 'received') {
            if (receivedRequests.length === 0) {
                return <div className="empty-state-large">No pending friend requests.</div>;
            }
            return (
                <div className="friends-grid">
                    {receivedRequests.map(req => (
                        <div key={req.id} className="friend-card">
                            <NavLink to={`/profile/${req.sender.username}`} style={{ width: '100%', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img
                                    src={req.sender.avatarUrl || getAvatarUrl(req.sender.fullName)}
                                    alt={req.sender.fullName}
                                    className="card-avatar"
                                    onError={(e) => { e.target.src = getAvatarUrl(req.sender.fullName) }}
                                />
                                <div className="card-name">{req.sender.fullName}</div>
                                <div className="card-username">Sent you a request</div>
                            </NavLink>
                            <div className="card-actions">
                                <button className="action-btn btn-primary" onClick={(e) => handleAccept(e, req.id)}>
                                    <Check size={16} /> Confirm
                                </button>
                                <button className="action-btn btn-secondary" onClick={(e) => handleDecline(e, req.id)}>
                                    <X size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (activeTab === 'sent') {
            if (sentRequests.length === 0) {
                return <div className="empty-state-large">No sent requests pending.</div>;
            }
            return (
                <div className="friends-grid">
                    {sentRequests.map(req => (
                        <div key={req.id} className="friend-card">
                            <NavLink to={`/profile/${req.receiver.username}`} style={{ width: '100%', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img
                                    src={req.receiver.avatarUrl || getAvatarUrl(req.receiver.fullName)}
                                    alt={req.receiver.fullName}
                                    className="card-avatar"
                                    onError={(e) => { e.target.src = getAvatarUrl(req.receiver.fullName) }}
                                />
                                <div className="card-name">{req.receiver.fullName}</div>
                                <div className="card-username">Request Pending</div>
                            </NavLink>
                            <div className="card-actions">
                                <button className="action-btn btn-danger" onClick={(e) => handleCancel(e, req.id)}>
                                    <X size={16} /> Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    };

    return (
        <MainLayout>
            <div className="friends-page-container">
                <div className="friends-page-header">
                    <h2>Friends</h2>
                </div>

                <div className="friends-page-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
                        onClick={() => setActiveTab('friends')}
                    >
                        My Friends ({friends.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
                        onClick={() => setActiveTab('received')}
                    >
                        Requests Received ({receivedRequests.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sent')}
                    >
                        Requests Sent ({sentRequests.length})
                    </button>
                </div>

                {renderContent()}

                <ConfirmModal
                    isOpen={isUnfriendModalOpen}
                    onClose={() => setIsUnfriendModalOpen(false)}
                    onConfirm={handleUnfriendConfirm}
                    title="Unfriend User"
                    message="Are you sure you want to remove this user from your friends list?"
                    confirmText="Yes, Unfriend"
                    cancelText="Cancel"
                    isDanger={true}
                />
            </div>
        </MainLayout>
    );
};

export default Friends;
