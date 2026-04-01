import React, { useState, useEffect } from "react";
import { adminService } from "../api/adminService";
import toast from "react-hot-toast";
import "../styles/Admin.css";

const ModerationPanel = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState("UNDER_REVIEW");
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [processingPostId, setProcessingPostId] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    loadPosts();
  }, [page, statusFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPostsForModeration(
        statusFilter,
        page,
        PAGE_SIZE,
      );
      setPosts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      toast.error("Failed to load posts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (postId, decisionStatus) => {
    try {
      setProcessingPostId(postId);
      await adminService.updatePostStatus(postId, decisionStatus);
      toast.success(`Post is now ${decisionStatus}`);
      loadPosts();
    } catch (error) {
      toast.error("Failed to update post status");
      console.error(error);
    } finally {
      setProcessingPostId(null);
    }
  };

  const toggleExpanded = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="moderation-panel loading">
        Loading posts under review...
      </div>
    );
  }

  return (
    <div className="moderation-panel">
      <div className="panel-header">
        <h1>Post Moderation</h1>
        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="filter-select"
          >
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="job-count">
        Showing {posts.length} of {totalElements} items
      </div>

      {posts.length === 0 ? (
        <div className="no-jobs">
          <p>No posts found for this status.</p>
        </div>
      ) : (
        <div className="job-list">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`job-card job-status-${post.status.toLowerCase()}`}
            >
              <div
                className="job-header"
                onClick={() => toggleExpanded(post.id)}
              >
                <div className="job-info">
                  <span className="job-type badge">POST</span>
                  <span
                    className={`job-status badge status-${post.status.toLowerCase()}`}
                  >
                    {post.status}
                  </span>
                  <span className="job-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="job-toggle">
                  {expandedPostId === post.id ? "▼" : "▶"}
                </div>
              </div>

              {expandedPostId === post.id && (
                <div className="job-details">
                  <div className="author-section">
                    <img
                      src={post.authorAvatarUrl || "/default-avatar.png"}
                      alt={post.authorName}
                      className="author-avatar"
                    />
                    <div className="author-info">
                      <span className="author-name">{post.authorName}</span>
                      <span className="author-id">ID: {post.authorId}</span>
                    </div>
                  </div>

                  <div className="content-section">
                    <h4>Content:</h4>
                    <p className="content-text">{post.content}</p>

                    {post.postMedia && post.postMedia.length > 0 && (
                      <div className="admin-media-container">
                        {post.postMedia.map((media, index) => (
                          <div key={index} className="admin-media-item">
                            {media.type === "IMAGE" ? (
                              <img
                                src={media.mediaUrl}
                                alt="Post media"
                                className="moderation-img"
                                onClick={() =>
                                  window.open(media.mediaUrl, "_blank")
                                } // Click để xem ảnh to
                              />
                            ) : (
                              <video
                                src={media.mediaUrl}
                                controls
                                className="moderation-video"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {post.status !== "PUBLISHED" && (
                    <button
                      className="btn btn-approve"
                      onClick={() => handleDecision(post.id, "PUBLISHED")}
                      disabled={processingPostId === post.id}
                    >
                      {processingPostId === post.id ? "..." : "Approve"}
                    </button>
                  )}

                  {post.status !== "UNDER_REVIEW" && (
                    <button
                      className="btn btn-review"
                      onClick={() => handleDecision(post.id, "UNDER_REVIEW")}
                      disabled={processingPostId === post.id}
                    >
                      {processingPostId === post.id ? "..." : "Send to Review"}
                    </button>
                  )}

                  {post.status !== "REJECTED" && (
                    <button
                      className="btn btn-block"
                      onClick={() => handleDecision(post.id, "REJECTED")}
                      disabled={processingPostId === post.id}
                    >
                      {processingPostId === post.id ? "..." : "Reject"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="page-btn"
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="page-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ModerationPanel;
