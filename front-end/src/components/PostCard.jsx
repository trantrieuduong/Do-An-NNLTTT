import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Clock, XCircle, Search } from 'lucide-react';
import { getAvatarUrl } from '../utils/constants';
import '../styles/PostCard.css';

/**
 * PostCard — shared post card component used in both Home feed and Profile page.
 *
 * Props:
 *  - post        {object}   PostResponse from backend
 *  - onLike      {function} (e, post) => void   — toggles like
 *  - onDelete    {function} (e, postId) => void  — optional delete (profile only)
 *  - cardRef     {ref}      optional ref for last-element infinite scroll
 */
const PostCard = ({ post, onLike, onDelete, cardRef }) => {
    const navigate = useNavigate();

    /* ── helpers ──────────────────────────────────────────────── */
    const formatDate = (instantStr) => {
        if (!instantStr) return '';
        const d = new Date(instantStr);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
        return d.toLocaleDateString('vi-VN');
    };

    const handleCardClick = () => navigate(`/post/${post.id}`);
    const handleAvatarClick = (e) => {
        e.stopPropagation();
        navigate(`/profile/${post.username}`);
    };
    const handleNameClick = (e) => {
        e.stopPropagation();
        navigate(`/profile/${post.username}`);
    };
    const handleLike = (e) => {
        e.stopPropagation();
        if (onLike) onLike(e, post);
    };
    const handleComment = (e) => {
        e.stopPropagation();
        navigate(`/post/${post.id}`);
    };
    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete(e, post.id);
    };

    /* ── media grid class based on count ─────────────────────── */
    const mediaCount = post.media?.length ?? 0;
    const gridClass = mediaCount > 0
        ? `post-card-media post-card-media--${Math.min(mediaCount, 4)}`
        : '';

    return (
        <div
            className="post-card-shared"
            onClick={handleCardClick}
            ref={cardRef}
        >
            {/* ── Author ────────────────────────────────────── */}
            <div className="post-card-author">
                <div
                    className="post-card-avatar"
                    onClick={handleAvatarClick}
                    title={`View profile ${post.userFullName}`}
                >
                    <img
                        src={post.userAvatarUrl || getAvatarUrl(post.userFullName || post.username)}
                        alt={post.userFullName}
                        onError={(e) => { e.target.src = getAvatarUrl(post.userFullName || post.username); }}
                    />
                </div>

                <div className="post-card-author-info">
                    <div className="post-card-author-top">
                        <span className="post-card-fullname" onClick={handleNameClick}>
                            {post.userFullName}
                        </span>
                        <span className="post-card-username">@{post.username}</span>
                    </div>
                    <div className="post-card-meta">
                        <span className="post-card-time">{formatDate(post.createdAt)}</span>
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
                    </div>
                </div>
            </div>

            {/* ── Content ───────────────────────────────────── */}
            {post.content && (
                <p className="post-card-content">{post.content}</p>
            )}

            {/* ── Media grid ────────────────────────────────── */}
            {mediaCount > 0 && (
                <div
                    className={gridClass}
                    onClick={(e) => e.stopPropagation()}
                >
                    {post.media.slice(0, 4).map((m, i) => {
                        const isOverlay = i === 3 && mediaCount > 4;
                        return (
                            <div
                                key={i}
                                className={[
                                    'post-card-media-item',
                                    mediaCount === 1 ? 'post-card-media-item--single' : '',
                                ].join(' ').trim()}
                            >
                                {m.type === 'IMAGE' ? (
                                    <img src={m.mediaUrl} alt="" loading="lazy" />
                                ) : (
                                    <video src={m.mediaUrl} controls />
                                )}
                                {isOverlay && (
                                    <div className="post-card-media-overlay">
                                        +{mediaCount - 4}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Footer: like + comment ─────────────────────── */}
            <div className="post-card-footer">
                <button
                    className={`post-card-action-btn post-card-like-btn ${post.liked ? 'post-card-like-btn--active' : ''}`}
                    onClick={handleLike}
                    title={post.liked ? 'Unlike' : 'Like'}
                >
                    <Heart
                        size={18}
                        fill={post.liked ? '#ef4444' : 'none'}
                        strokeWidth={post.liked ? 0 : 1.75}
                    />
                    <span>{post.likesCount > 0 ? post.likesCount : 0} Like</span>
                </button>

                <button
                    className="post-card-action-btn post-card-comment-btn"
                    onClick={handleComment}
                    title="Comment"
                >
                    <MessageCircle size={18} />
                    <span>{post.commentsCount > 0 ? post.commentsCount : 0} Comment</span>
                </button>
            </div>
        </div>
    );
};

export default PostCard;
