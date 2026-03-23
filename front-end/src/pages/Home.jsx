import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2, RefreshCw, ArrowUp } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { feedService } from '../api/feedService';
import '../styles/Home.css';

const LIMIT = 20;

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState(null);

    // Cursor state saved in refs to avoid stale closure issues
    const nextCursorTimeRef = useRef(null);
    const nextCursorIdRef = useRef(null);

    // Whether an auto-load is currently in flight
    const loadingMoreRef = useRef(false);

    // Sentinel element for IntersectionObserver
    const sentinelRef = useRef(null);

    // ─── Core fetch ──────────────────────────────────────────────────────────
    /**
     * Fetch one page from /feed.
     * @param {boolean} reset  true = fresh load from the top
     */
    const fetchFeed = useCallback(async (reset = false) => {
        const cursorTime = reset ? null : nextCursorTimeRef.current;
        const cursorId = reset ? null : nextCursorIdRef.current;

        try {
            const res = await feedService.getFeed(cursorTime, cursorId, LIMIT);
            const feedData = res.data ?? res;                       // {items, nextCursorTime, nextCursorId}
            const {
                items = [],
                nextCursorTime = null,
                nextCursorId = null,
            } = feedData;

            // Update posts list
            if (reset) {
                setPosts(items);
            } else {
                setPosts(prev => {
                    const seen = new Set(prev.map(p => p.id));
                    return [...prev, ...items.filter(p => !seen.has(p.id))];
                });
            }

            // Save cursors for next page
            nextCursorTimeRef.current = nextCursorTime;
            nextCursorIdRef.current = nextCursorId;

            // hasMore = server still has data to give us
            setHasMore(nextCursorTime != null && nextCursorId != null);
        } catch (err) {
            console.error('Failed to load feed:', err);
            setError('Không thể tải bảng tin. Vui lòng thử lại.');
        }
    }, []);

    // ─── Initial load ─────────────────────────────────────────────────────────
    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchFeed(true).finally(() => setLoading(false));
    }, [fetchFeed]);

    // ─── Infinite scroll via IntersectionObserver ─────────────────────────────
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && hasMore && !loadingMoreRef.current) {
                    loadingMoreRef.current = true;
                    setLoadingMore(true);
                    await fetchFeed(false);
                    setLoadingMore(false);
                    loadingMoreRef.current = false;
                }
            },
            { rootMargin: '200px' }   // trigger 200px before sentinel hits the viewport
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, fetchFeed]);

    // ─── Actions ──────────────────────────────────────────────────────────────
    const handleLike = useCallback(async (e, post) => {
        e.stopPropagation();
        try {
            if (post.liked) {
                await feedService.unlikePost(post.id);
                setPosts(prev => prev.map(p =>
                    p.id === post.id ? { ...p, liked: false, likesCount: p.likesCount - 1 } : p
                ));
            } else {
                await feedService.likePost(post.id);
                setPosts(prev => prev.map(p =>
                    p.id === post.id ? { ...p, liked: true, likesCount: p.likesCount + 1 } : p
                ));
            }
        } catch (err) {
            console.error('Like failed:', err);
        }
    }, []);

    const handlePostCreated = useCallback((newPost) => {
        setPosts(prev => [newPost, ...prev]);
    }, []);

    const handleRefresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        await fetchFeed(true);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [fetchFeed]);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <MainLayout>
            <div className="home-container">
                {/* Create Post */}
                <CreatePost onPostCreated={handlePostCreated} />

                {/* Feed header */}
                <div className="home-feed-header">
                    <h2 className="home-feed-title">Bảng tin</h2>
                    <button className="home-refresh-btn" onClick={handleRefresh} title="Làm mới">
                        <RefreshCw size={15} />
                        <span>Làm mới</span>
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="home-error">
                        <p>{error}</p>
                        <button className="home-retry-btn" onClick={handleRefresh}>Thử lại</button>
                    </div>
                )}

                {/* Skeleton — first load */}
                {loading && (
                    <div className="home-loading">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="home-skeleton">
                                <div className="skeleton-avatar" />
                                <div className="skeleton-lines">
                                    <div className="skeleton-line w-40" />
                                    <div className="skeleton-line w-20" />
                                    <div className="skeleton-line w-80 mt" />
                                    <div className="skeleton-line w-60" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && posts.length === 0 && (
                    <div className="home-empty">
                        <div className="home-empty-icon">📭</div>
                        <h3>Bảng tin trống</h3>
                        <p>Hãy kết bạn thêm hoặc tạo bài viết đầu tiên!</p>
                    </div>
                )}

                {/* Posts — dùng PostCard component giống Profile */}
                {!loading && posts.length > 0 && (
                    <div className="home-posts">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={handleLike}
                            />
                        ))}

                        {/* ── Sentinel: IntersectionObserver bám vào đây ── */}
                        <div ref={sentinelRef} className="home-sentinel" aria-hidden="true">
                            {loadingMore && (
                                <div className="home-load-more-indicator">
                                    <Loader2 size={22} className="home-spinner" />
                                    <span>Đang tải thêm bài viết...</span>
                                </div>
                            )}
                        </div>

                        {/* End of feed */}
                        {!hasMore && (
                            <div className="home-end-message">
                                <span>✦</span>
                                <p>Bạn đã xem hết bảng tin</p>
                                <span>✦</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Scroll to top */}
            <button
                className="home-scroll-top"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                title="Lên đầu trang"
            >
                <ArrowUp size={20} />
            </button>
        </MainLayout>
    );
};

export default Home;
