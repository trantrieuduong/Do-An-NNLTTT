import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { userService } from '../api/userService';
import { reportService } from '../api/reportService';
import { Loader2, Calendar, Mars, Venus, VenusAndMars, Edit2, UserPlus, UserCheck, UserX, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';
import ImageUploader from '../components/common/ImageUploader';
import PostCard from '../components/PostCard';
import '../styles/Profile.css';

import { friendService } from '../api/friendService';
import { feedService } from '../api/feedService';
import CreatePost from '../components/CreatePost';
import { getAvatarUrl } from '../utils/constants';


const Profile = () => {
    const { userId } = useParams(); // userId from route /profile/:userId (or undefined for /my-profile)
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMyProfile, setIsMyProfile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Pagination state
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);

    const handlePostCreated = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    // Modal state
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        type: null,
        payload: null,
        title: '',
        message: ''
    });

    const [reportModal, setReportModal] = useState({
            isOpen: false,
            targetId: null,
            targetType: null,
    });

    const [reportData, setReportData] = useState({
        reason: '',
        details: ''
    });

    // Infinite scroll observer
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loadingPosts) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loadingPosts, hasMore]);


    // Edit Form State
    const [editForm, setEditForm] = useState({
        fullName: '',
        bio: '',
        gender: '',
        birthday: '',
        avatarUrl: '',
        coverImageUrl: '',
        visibility: 'PUBLIC'
    });


    useEffect(() => {
        setPosts([]);
        setPage(0);
        setHasMore(true);
        fetchInitialData();
    }, [userId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Always fetch current user first to know who is logged in
            const meRes = await userService.getMyProfile();
            const me = meRes.data;
            setCurrentUser(me);

            let profileData;
            // If no userId param → /my-profile route → show own profile
            if (!userId) {
                profileData = me;
                setIsMyProfile(true);
            } else {
                // userId param  → /profile/:userId → fetch that user
                const res = await userService.getUserProfile(userId);
                profileData = res.data;
                // Check if the fetched profile belongs to the logged-in user
                const myId = me.userId || me.id;
                const theirId = profileData.userId || profileData.id;
                setIsMyProfile(String(myId) === String(theirId));
            }

            setProfile(profileData);
            setEditForm({
                fullName: profileData.fullName || '',
                bio: profileData.bio || '',
                gender: profileData.gender || 'MALE',
                birthday: profileData.birthday || '',
                avatarUrl: profileData.avatarUrl || '',
                coverImageUrl: profileData.coverImageUrl || '',
                visibility: profileData.visibility || 'PUBLIC'
            });
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile) {
            fetchPosts(page);
        }
    }, [page, profile?.userId]);

    const fetchPosts = async (pageNum) => {
        const targetId = profile?.userId;
        if (!targetId || loadingPosts) return;

        setLoadingPosts(true);
        try {
            const postsRes = await userService.getPostsByUser(targetId, pageNum);
            const newPosts = postsRes.data.content || [];
            const totalPages = postsRes.data.totalPages || 0;

            setPosts(prev => pageNum === 0 ? newPosts : [...prev, ...newPosts]);
            setHasMore(pageNum < totalPages - 1);
        } catch (error) {
            console.error("Error loading posts:", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await userService.updateProfile(editForm);
            setProfile(res.data);
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile");
        }
    };

    const handleLikePost = async (e, post) => {
        e.stopPropagation();
        try {
            if (post.liked) {
                await feedService.unlikePost(post.id);
                setPosts(posts.map(p => p.id === post.id ? { ...p, liked: false, likesCount: p.likesCount - 1 } : p));
            } else {
                await feedService.likePost(post.id);
                setPosts(posts.map(p => p.id === post.id ? { ...p, liked: true, likesCount: p.likesCount + 1 } : p));
            }
        } catch (error) {
            console.error("Failed to toggle like", error);
        }
    };

    const handleDeletePostClick = (e, postId) => {
        e.stopPropagation();
        setConfirmation({
            isOpen: true,
            type: 'DELETE_POST',
            payload: postId,
            title: 'Delete Post',
            message: 'Are you sure you want to delete this post? This action cannot be undone.'
        });
    };

    const confirmDeletePost = async (postId) => {
        try {
            const res = await feedService.deletePost(postId);
            if (res.success) {
                setPosts(posts.filter(p => p.id !== postId));
                toast.success("Post deleted");
            }
        } catch (error) {
            console.error("Failed to delete post", error);
            toast.error("Failed to delete post");
        }
    };

    const handleSendFriendRequest = async () => {
        try {
            const res = await friendService.sendFriendRequest(profile?.userId);
            if (res.success) {
                // Refresh profile to get the updated friend request status
                fetchInitialData();
                toast.success("Friend request sent");
            }
        } catch (error) {
            console.error("Failed to send friend request", error);
            toast.error("Failed to send friend request");
        }
    };

    const handleAcceptFriendRequest = async () => {
        if (!profile.friendRequest) return;
        try {
            const res = await friendService.acceptFriendRequest(profile.friendRequest.id);
            if (res.success) {
                fetchInitialData();
            }
        } catch (error) {
            console.error("Failed to accept friend request", error);
        }
    };

    const handleDeclineFriendRequest = async () => {
        if (!profile.friendRequest) return;
        try {
            const res = await friendService.declineFriendRequest(profile.friendRequest.id);
            if (res.success) {
                fetchInitialData();
            }
        } catch (error) {
            console.error("Failed to decline friend request", error);
        }
    };

    const handleCancelFriendRequest = async () => {
        if (!profile.friendRequest) return;
        try {
            const res = await friendService.cancelFriendRequest(profile.friendRequest.id);
            if (res.success) {
                fetchInitialData();
            }
        } catch (error) {
            console.error("Failed to cancel friend request", error);
        }
    };

    const handleUnFriendClick = () => {
        setConfirmation({
            isOpen: true,
            type: 'UNFRIEND',
            payload: profile?.userId,
            title: 'Unfriend',
            message: `Are you sure you want to unfriend ${profile.fullName}?`
        });
    };

    const confirmUnFriend = async (userId) => {
        try {
            const res = await friendService.unFriend(userId);
            if (res.success) {
                fetchInitialData();
                toast.success("Unfriended successfully");
            }
        } catch (error) {
            console.error("Failed to unfriend", error);
            toast.error("Failed to unfriend");
        }
    };

    const handleConfirmAction = () => {
        if (confirmation.type === 'DELETE_POST') {
            confirmDeletePost(confirmation.payload);
        } else if (confirmation.type === 'UNFRIEND') {
            confirmUnFriend(confirmation.payload);
        }
        setConfirmation({ ...confirmation, isOpen: false });
    };

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };

    const handleSendReport = async (e) => {
        if (e) e.preventDefault();
        if (!reportData.reason) {
            toast.error("Please select a reason");
            return;
        }

        try {
            const response = await reportService.createReport(
                reportModal.targetId,
                reportModal.targetType,
                reportData.reason,
                reportData.details
            );

            if (response.success) {
                toast.success("Thank you for your report!");
                setReportModal({ ...reportModal, isOpen: false });
                setReportData({ reason: '', details: '' }); // Reset form
            }
        } catch (error) {
            toast.error(error.message || "Failed to send report");
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                    <Loader2 className="animate-spin" size={32} color="#4f46e5" />
                </div>
            </MainLayout>
        );
    }

    if (!profile) {
        return (
            <MainLayout>
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>User not found</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="profile-header">
                {isEditing ? (
                    <form className="edit-form" onSubmit={handleUpdateProfile}>
                        <h2>Edit Profile</h2>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Bio</label>
                            <textarea
                                value={editForm.bio}
                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                rows={3}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Gender</label>
                                <select
                                    value={editForm.gender}
                                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Birthday</label>
                                <input
                                    type="date"
                                    value={editForm.birthday}
                                    onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Profile Visibility</label>
                            <select
                                value={editForm.visibility}
                                onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}
                            >
                                <option value="PUBLIC">Everyone can see your posts</option>
                                <option value="FRIEND_ONLY">Only friends can see your posts</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Avatar Image</label>
                            <ImageUploader
                                currentImage={editForm.avatarUrl}
                                onImageUpload={(url) => setEditForm({ ...editForm, avatarUrl: url })}
                                type="avatar"
                            />
                        </div>

                        <div className="form-group">
                            <label>Cover Image</label>
                            <ImageUploader
                                currentImage={editForm.coverImageUrl}
                                onImageUpload={(url) => setEditForm({ ...editForm, coverImageUrl: url })}
                                type="cover"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="profile-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button type="submit" className="edit-btn">Save Changes</button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-wrapper" style={{ width: '100%' }}>
                        {/* Cover Image */}
                        <div className="profile-cover" style={{
                            height: '200px',
                            width: '100%',
                            borderRadius: '16px 16px 0 0',
                            background: profile.coverImageUrl ? `url(${profile.coverImageUrl}) center/cover no-repeat` : 'linear-gradient(to right, #4f46e5, #9333ea)',
                            marginBottom: '-50px'
                        }}></div>

                        <div className="profile-info" style={{
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '1rem',
                            padding: '0 2rem 2rem',
                            marginTop: '0'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}>
                                <div className="profile-avatar" style={{
                                    width: '120px',
                                    height: '120px',
                                    border: '4px solid white',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    backgroundColor: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <img
                                        src={profile.avatarUrl || getAvatarUrl(profile.fullName)}
                                        alt="Avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = getAvatarUrl(profile.fullName) }}
                                    />
                                </div>

                                {isMyProfile ? (
                                    <button className="edit-btn" onClick={() => setIsEditing(true)} style={{ marginBottom: '1rem' }}>
                                        <Edit2 size={16} style={{ marginRight: '0.5rem' }} />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="friend-actions" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        {profile.friend ? (
                                            <button className="friend-btn friend" onClick={handleUnFriendClick}>
                                                <UserCheck size={16} />
                                                <span>Friends</span>
                                            </button>
                                        ) : profile.friendRequest ? (
                                            profile.friendRequest.sender.userId === currentUser?.id || profile.friendRequest.sender.userId === currentUser?.userId ? (
                                                <button className="friend-btn pending" onClick={handleCancelFriendRequest}>
                                                    <Clock size={16} />
                                                    <span>Request Sent</span>
                                                </button>
                                            ) : (
                                                <>
                                                    <button className="friend-btn accept" onClick={handleAcceptFriendRequest}>
                                                        <UserCheck size={16} />
                                                        <span>Accept</span>
                                                    </button>
                                                    <button className="friend-btn decline" onClick={handleDeclineFriendRequest}>
                                                        <UserX size={16} />
                                                        <span>Decline</span>
                                                    </button>
                                                </>
                                            )
                                        ) : (
                                            <button className="friend-btn add" onClick={handleSendFriendRequest}>
                                                <UserPlus size={16} />
                                                <span>Add Friend</span>
                                            </button>
                                        )}

                                        <button 
                                            className="friend-btn" 
                                            style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem' }}
                                            onClick={() => setReportModal({ isOpen: true, targetId: profile.userId || profile.id, targetType: 'USER' })}
                                            title="Report User"
                                        >
                                            <AlertCircle size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="profile-details" style={{ paddingLeft: '0.5rem' }}>
                                <h1 style={{ margin: '0 0 0.2rem 0' }}>{profile.fullName}</h1>
                                <div style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1rem' }}>@{profile.username}</div>
                                {profile.bio && <p className="profile-desc" style={{ marginBottom: '1rem' }}>{profile.bio}</p>}

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                                    {profile.birthday && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Calendar size={18} />
                                            Born {new Date(profile.birthday).toLocaleDateString()}
                                        </span>
                                    )}
                                    {profile.gender && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'capitalize' }}>
                                            {profile.gender === 'MALE' ? <Mars size={18} /> : profile.gender === 'FEMALE' ? <Venus size={18} /> : <VenusAndMars size={18} />} {profile.gender.toLowerCase()}
                                        </span>
                                    )}
                                    {/* MapPin used for Gender temporarily as generic icon or user icon */}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="posts-section">
                <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Posts</h3>

                {isMyProfile && (
                    <div style={{ marginBottom: '2rem' }}>
                        <CreatePost onPostCreated={handlePostCreated} currentUser={currentUser} />
                    </div>
                )}

                <div className="posts-grid">
                    {posts.length > 0 ? (
                        <>
                            {posts.map((post, index) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onLike={handleLikePost}
                                    onDelete={isMyProfile ? handleDeletePostClick : undefined}
                                    cardRef={index === posts.length - 1 ? lastPostElementRef : null}
                                />
                            ))}
                            {loadingPosts && (
                                <div style={{ textAlign: 'center', padding: '1rem' }}>
                                    <Loader2 className="animate-spin" size={24} color="#4f46e5" />
                                </div>
                            )}
                            {!loadingPosts && hasMore && (
                                <div style={{ textAlign: 'center', padding: '1rem' }}>
                                    <button
                                        onClick={() => setPage(prev => prev + 1)}
                                        style={{
                                            padding: '0.5rem 1.5rem',
                                            borderRadius: '20px',
                                            border: '1px solid #e2e8f0',
                                            background: 'white',
                                            color: '#64748b',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Tải thêm
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p style={{ color: '#94a3b8', textAlign: 'center' }}>No post or you don't have permission</p>
                    )}
                </div>
            </div>
            <ConfirmModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                onConfirm={handleConfirmAction}
                title={confirmation.title}
                message={confirmation.message}
                confirmText={confirmation.type === 'DELETE_POST' ? 'Delete' : 'Unfriend'}
                isDanger={true}
            />
            {reportModal.isOpen && (
                <div className="custom-modal-overlay">
                    <div className="report-modal">
                        <h3>Report User</h3>
                        <p>Help us understand what's happening.</p>
                        
                        <div className="reason-list-grid">
                            {['SPAM', 'VIOLENCE', 'HARASSMENT', 'HATE_SPEECH', 'NUDITY', 'OTHER'].map(r => (
                                <button 
                                    key={r} 
                                    type="button"
                                    className={`reason-chip ${reportData.reason === r ? 'active' : ''}`}
                                    onClick={() => setReportData({ ...reportData, reason: r })}
                                >
                                    {r.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="report-details-field">
                            <label>Additional Details (Optional):</label>
                            <textarea 
                                placeholder="Tell us more about the violation..."
                                value={reportData.details}
                                onChange={(e) => setReportData({ ...reportData, details: e.target.value })}
                                rows={4}
                            />
                        </div>
                        
                        <div className="report-modal-actions">
                            <button 
                                onClick={() => {
                                    setReportModal({ ...reportModal, isOpen: false });
                                    setReportData({ reason: '', details: '' });
                                }} 
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSendReport}
                                disabled={!reportData.reason}
                                className="submit-report-btn"
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default Profile;
