import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Send, ArrowLeft, Clock, Loader2, AlertCircle, Trash2, Edit2, X, Check, Search, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';
import { feedService } from '../api/feedService';
import { reportService } from '../api/reportService';
import '../styles/PostDetail.css';
import MainLayout from '../components/MainLayout';
import { getAvatarUrl } from '../utils/constants';

const PostDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState(false);
    const [error, setError] = useState('');
    const [commentContent, setCommentContent] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    // Pagination state
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Infinite scroll observer for comments
    const observer = useRef();
    const lastCommentElementRef = useCallback(node => {
        if (loadingComments) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                handleLoadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [loadingComments, hasMore, page]);

    // User state
    const [currentUser, setCurrentUser] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editPostContent, setEditPostContent] = useState('');

    const [isUpdatingPost, setIsUpdatingPost] = useState(false);

    const [reportData, setReportData] = useState({
        reason: '',
        details: ''
    });

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
        targetType: null, // 'POST' hoặc 'COMMENT'
    });

    useEffect(() => {
        fetchCurrentUser();
        fetchPost();
        // Initial load of comments
        setComments([]);
        setPage(0);
        setHasMore(true);
        fetchComments(0);
    }, [postId]);

    const fetchCurrentUser = async () => {
        try {
            // Need to import userService
            const { userService } = await import('../api/userService');
            const res = await userService.getMyProfile();
            if (res.success) {
                setCurrentUser(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch current user", error);
        }
    };

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await feedService.getPost(postId);
            if (response.success) {
                setPost(response.data);
            } else {
                setError(response.message || 'Failed to fetch post');
            }
        } catch (err) {
            setError(err.message || 'Error fetching post');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (pageNum, isLoadMore = false) => {
        if (loadingComments) return;

        try {
            setLoadingComments(true);
            const response = await feedService.getComments(postId, pageNum);
            if (response.success) {
                const newComments = response.data.content || [];
                const totalPages = response.data.totalPages || 0;

                if (isLoadMore) {
                    setComments(prev => [...prev, ...newComments]);
                } else {
                    setComments(newComments);
                }

                setHasMore(pageNum < totalPages - 1);
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingComments && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchComments(nextPage, true);
        }
    };

    const handleLikeToggle = async () => {
        if (!post || isLiking) return;
        setIsLiking(true);
        try {
            if (post.liked) {
                await feedService.unlikePost(postId);
                setPost({ ...post, liked: false, likesCount: post.likesCount - 1 });
            } else {
                await feedService.likePost(postId);
                setPost({ ...post, liked: true, likesCount: post.likesCount + 1 });
            }
        } catch (err) {
            console.error('Error toggling like:', err);
        } finally {
            setIsLiking(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentContent.trim() || isSubmittingComment) return;

        setIsSubmittingComment(true);
        try {
            const response = await feedService.createComment(postId, commentContent);
            if (response.success) {
                setCommentContent('');
                setPost({ ...post, commentsCount: post.commentsCount + 1 });
                // Reset comments and fetch page 0
                setComments([]);
                setPage(0);
                setHasMore(true);
                fetchComments(0);
            }
        } catch (err) {
            console.error('Error posting comment:', err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteCommentClick = (commentId) => {
        setConfirmation({
            isOpen: true,
            type: 'DELETE_COMMENT',
            payload: commentId,
            title: 'Delete Comment',
            message: 'Are you sure you want to delete this comment?'
        });
    };

    const confirmDeleteComment = async (commentId) => {
        try {
            await feedService.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
            setPost({ ...post, commentsCount: Math.max(0, post.commentsCount - 1) });
            toast.success("Comment deleted");
        } catch (error) {
            console.error("Failed to delete comment", error);
            toast.error("Failed to delete comment");
        }
    };

    const handleEditClick = (comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
    };

    const handleUpdateComment = async (e) => {
        e.preventDefault();
        if (!editContent.trim()) return;

        try {
            await feedService.updateComment(editingCommentId, editContent);
            setComments(comments.map(c =>
                c.id === editingCommentId ? { ...c, content: editContent } : c
            ));
            setEditingCommentId(null);
            setEditContent('');
        } catch (error) {
            console.error("Failed to update comment", error);
        }
    };

    const handleEditPostClick = () => {
        setIsEditingPost(true);
        setEditPostContent(post.content);
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        if (!editPostContent.trim() || isUpdatingPost) return;

        setIsUpdatingPost(true);
        try {
            const response = await feedService.updatePost(postId, editPostContent);
            if (response.success) {
                setPost({ ...post, content: editPostContent });
                setIsEditingPost(false);
            }
        } catch (error) {
            console.error("Failed to update post", error);
        } finally {
            setIsUpdatingPost(false);
        }
    };

    const handleDeletePostClick = () => {
        setConfirmation({
            isOpen: true,
            type: 'DELETE_POST',
            payload: null,
            title: 'Delete Post',
            message: 'Are you sure you want to delete this post? This action cannot be undone.'
        });
    };

    const confirmDeletePost = async () => {
        try {
            const response = await feedService.deletePost(postId);
            if (response.success) {
                toast.success("Post deleted");
                navigate('/');
            }
        } catch (error) {
            console.error("Failed to delete post", error);
            toast.error("Failed to delete post");
        }
    };

    const handleConfirmAction = () => {
        if (confirmation.type === 'DELETE_COMMENT') {
            confirmDeleteComment(confirmation.payload);
        } else if (confirmation.type === 'DELETE_POST') {
            confirmDeletePost();
        }
        setConfirmation({ ...confirmation, isOpen: false });
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditContent('');
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
                <div className="post-detail-container loading">
                    <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                    <p>Loading post...</p>
                </div>
            </MainLayout>
        );
    }

    if (error || !post) {
        return (
            <MainLayout>
                <div className="post-detail-container error">
                    <AlertCircle size={48} color="#ef4444" />
                    <h2>Oops!</h2>
                    <p>{error || 'Post not found'}</p>
                    <button onClick={() => navigate(-1)} className="back-btn-alt">
                        Go Back
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="post-detail-container">
                <header className="post-detail-header">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <ArrowLeft size={24} />
                    </button>
                </header>

                <article className="post-card">
                    <div className="post-author">
                        <div
                            className="author-avatar"
                            onClick={() => navigate(`/profile/${post.username}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <img
                                src={post.userAvatarUrl || getAvatarUrl(post.userFullName || post.username)}
                                alt={post.userFullName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                onError={(e) => { e.target.src = getAvatarUrl(post.userFullName || post.username) }}
                            />
                        </div>
                        <div className="author-info">
                            <span
                                className="author-name"
                                onClick={() => navigate(`/profile/${post.username}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                {post.userFullName}
                                <span className="username-tag" style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal', marginLeft: '0.5rem' }}>@{post.username}</span>
                            </span>
                            <span className="post-date">
                                <Clock size={12} />
                                {new Date(post.createdAt).toLocaleString()}
                                {post.status && post.status !== 'PUBLISHED' && (
                                    <span
                                        className={`post-card-status post-card-status--${post.status?.toLowerCase()}`}
                                        title={post.status}
                                    >
                                        {post.status === 'PENDING' && <><Clock size={11} /> Pending</>}
                                        {post.status === 'UNDER_REVIEW' && <><Search size={11} /> Under Review</>}
                                        {post.status === 'REJECTED' && <><XCircle size={11} /> Rejected</>}
                                    </span>
                                )}
                            </span>
                            
                        </div>
                            <div className="post-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                                {currentUser && (currentUser.id === post.userId || currentUser.userId === post.userId) ?(
                                    <>
                                <button onClick={handleEditPostClick} className="post-action-btn edit" title="Edit post">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={handleDeletePostClick} className="post-action-btn delete" title="Delete post">
                                    <Trash2 size={18} />
                                </button>
                                    </>
                                ) : (
                                // Nút báo cáo cho bài viết của người khác
                                <button 
                                    onClick={() => setReportModal({ isOpen: true, targetId: post.id, targetType: 'POST' })} 
                                    className="post-action-btn report" 
                                    title="Report post"
                                >
                                    <AlertCircle size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="post-content">
                        {isEditingPost ? (
                            <form onSubmit={handleUpdatePost} className="edit-post-form">
                                <textarea
                                    value={editPostContent}
                                    onChange={(e) => setEditPostContent(e.target.value)}
                                    autoFocus
                                    className="edit-post-textarea"
                                />
                                <div className="edit-post-actions">
                                    <button type="button" onClick={() => setIsEditingPost(false)} className="cancel-btn-small">
                                        <X size={16} /> Cancel
                                    </button>
                                    <button type="submit" disabled={isUpdatingPost || !editPostContent.trim()} className="save-btn-small">
                                        {isUpdatingPost ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Save
                                    </button>
                                </div>
                            </form>
                        ) : (
                            post.content
                        )}
                    </div>

                    {post.media && post.media.length > 0 && (
                        <div className="post-media-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: post.media.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '0.5rem',
                            marginTop: '0',
                            marginBottom: '2rem',
                            borderRadius: '16px',
                            overflow: 'hidden'
                        }}>
                            {post.media.map((m, i) => (
                                <div key={i} style={{ position: 'relative', paddingTop: post.media.length === 1 ? '' : '100%', height: post.media.length === 1 ? 'auto' : '0' }}>
                                    {m.type === 'IMAGE' ? (
                                        <img
                                            src={m.mediaUrl}
                                            alt=""
                                            style={{
                                                position: post.media.length === 1 ? 'relative' : 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: post.media.length === 1 ? 'auto' : '100%',
                                                maxHeight: post.media.length === 1 ? '800px' : 'none',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <video
                                            src={m.mediaUrl}
                                            controls
                                            style={{
                                                position: post.media.length === 1 ? 'relative' : 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: post.media.length === 1 ? 'auto' : '100%',
                                                maxHeight: post.media.length === 1 ? '800px' : 'none',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="post-stats">
                        <button
                            className={`stat-btn like-btn ${post.liked ? 'active' : ''}`}
                            onClick={handleLikeToggle}
                            disabled={isLiking}
                        >
                            <Heart size={20} fill={post.liked ? "#ef4444" : "none"} />
                            <span>{post.likesCount}</span>
                        </button>
                        <div className="stat-btn">
                            <MessageCircle size={20} />
                            <span>{post.commentsCount}</span>
                        </div>
                    </div>
                </article>

                <section className="comments-section">
                    <h3>Comments</h3>
                    <div className="comment-form-container">
                        <form onSubmit={handleCommentSubmit} className="comment-form">
                            <textarea
                                placeholder="Write a comment..."
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={isSubmittingComment || !commentContent.trim()}>
                                {isSubmittingComment ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            </button>
                        </form>
                    </div>

                    <div className="comments-list">
                        {comments.length > 0 ? (
                            <>
                                {comments.map((comment, index) => (
                                    <div key={comment.id} className="comment-item" ref={index === comments.length - 1 ? lastCommentElementRef : null}>
                                        <div
                                            className="comment-avatar"
                                            onClick={() => navigate(`/profile/${comment.username}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <img
                                                src={comment.userAvatarUrl || getAvatarUrl(comment.userFullName || comment.username)}
                                                alt={comment.userFullName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                                onError={(e) => { e.target.src = getAvatarUrl(comment.userFullName || comment.username) }}
                                            />
                                        </div>
                                        <div className="comment-body" style={{ width: '100%' }}>
                                            {editingCommentId === comment.id ? (
                                                <form onSubmit={handleUpdateComment} className="edit-comment-form">
                                                    <input
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        autoFocus
                                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                        <button type="button" onClick={handleCancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                                            <X size={16} />
                                                        </button>
                                                        <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5' }}>
                                                            <Check size={16} />
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    <div className="comment-header">
                                                        <span
                                                            className="comment-user"
                                                            onClick={() => navigate(`/profile/${comment.username}`)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            {comment.userFullName}
                                                            <span className="username-tag" style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal', marginLeft: '0.4rem' }}>@{comment.username}</span>
                                                        </span>
                                                        <span className="comment-time">
                                                            {new Date(comment.createdAt).toLocaleString()}
                                                        </span>
                                                        {currentUser && (currentUser.id === comment.userId || currentUser.userId === comment.userId) ? (
                                                            <div className="comment-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                                                                <button onClick={() => handleEditClick(comment)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button onClick={() => handleDeleteCommentClick(comment.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                className="comment-report-btn"
                                                                onClick={() => setReportModal({ isOpen: true, targetId: comment.id, targetType: 'COMMENT' })}
                                                                title="Report comment"
                                                            >
                                                                <AlertCircle size={14} />
                                                            </button>
                                                        )}                                                                                                     
                                                        </div>
                                                    <div className="comment-text">{comment.content}</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {hasMore && (
                                    <div className="load-more-container">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingComments}
                                            className="load-more-btn"
                                        >
                                            {loadingComments ? <Loader2 className="animate-spin" size={16} /> : 'Load More'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : loadingComments ? (
                            <div className="no-comments">Loading comments...</div>
                        ) : (
                            <div className="no-comments">No comments yet. Be the first to comment!</div>
                        )}
                    </div>
                </section>
            </div>
            <ConfirmModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                onConfirm={handleConfirmAction}
                title={confirmation.title}
                message={confirmation.message}
                confirmText="Delete"
                isDanger={true}
            />
            {reportModal.isOpen && (
                <div className="custom-modal-overlay">
                    <div className="report-modal">
                        <h3>Report {reportModal.targetType === 'POST' ? 'Post' : 'Comment'}</h3>
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

export default PostDetail;
