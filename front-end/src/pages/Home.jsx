import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2, RefreshCw, ArrowUp, Search, X, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { feedService } from '../api/feedService';
import { userService } from '../api/userService'; 
import { getAvatarUrl } from '../utils/constants';
import '../styles/Home.css';

const LIMIT = 20;

const Home = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    // Cursor state saved in refs to avoid stale closure issues
    const nextCursorTimeRef = useRef(null);
    const nextCursorIdRef = useRef(null);

    // Whether an auto-load is currently in flight
    const loadingMoreRef = useRef(false);

    // Sentinel element for IntersectionObserver
    const sentinelRef = useRef(null);

    // Search Logic (Debounced)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchQuery.trim()) {
                setSearchResults({ users: [], posts: [] });
                setIsSearching(false);
                return;
            }
            
            setIsSearching(true);
            try {
                // Fetch song song cả User và Post
                const [usersRes, postsRes] = await Promise.all([
                    userService.searchUsers(searchQuery).catch(() => ({ data: [] })),
                    feedService.searchPosts(searchQuery).catch(() => ({ data: { content: [] } }))
                ]);

                setSearchResults({
                    users: usersRes.data?.content || usersRes.data || [],
                    posts: postsRes.data?.content || postsRes.data || []
                });
            } catch (err) {
                console.error("Search error", err);
            } finally {
                setIsSearching(false);
            }
        }, 500); // Đợi 500ms sau khi ngừng gõ mới gọi API

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            setError('Failed to load feed. Try again later.');
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

    // Render
    return (
        <MainLayout>
            <div className="home-container">
                {/* --- Search Bar Section --- */}
                <div className="home-search-wrapper" ref={searchRef}>
                    <div className="home-search-bar">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search user, post..." 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                        />
                        {searchQuery && (
                            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Search Dropdown */}
                    {showDropdown && searchQuery.trim() && (
                        <div className="search-dropdown">
                            {isSearching ? (
                                <div className="search-loading"><Loader2 className="animate-spin" size={20} /></div>
                            ) : (
                                <>
                                    {/* Users Section */}
                                    {searchResults.users.length > 0 && (
                                        <div className="search-section">
                                            <h4><User size={14}/> Users</h4>
                                            {searchResults.users.slice(0, 5).map(user => (
                                                <div 
                                                    key={user.id} 
                                                    className="search-item user-item"
                                                    onClick={() => navigate(`/profile/${user.username}`)}
                                                >
                                                    <img src={user.avatarUrl || getAvatarUrl(user.fullName || user.username)} alt="" />
                                                    <div className="search-user-info">
                                                        <span className="name">{user.fullName}</span>
                                                        <span className="username">@{user.username}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Posts Section */}
                                    {searchResults.posts.length > 0 && (
                                        <div className="search-section">
                                            <h4><FileText size={14}/> Posts</h4>
                                            {searchResults.posts.slice(0, 5).map(post => (
                                                <div 
                                                    key={post.id} 
                                                    className="search-item post-item"
                                                    onClick={() => navigate(`/post/${post.id}`)}
                                                >
                                                    <span className="post-content-preview">
                                                        {post.content?.length > 50 ? post.content.substring(0, 50) + '...' : post.content}
                                                    </span>
                                                    <span className="post-author-preview">bởi @{post.username}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
                                        <div className="search-no-results">No search result</div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Create Post */}
                <CreatePost onPostCreated={handlePostCreated} />

                {/* Feed header */}
                <div className="home-feed-header">
                    <h2 className="home-feed-title">Feed</h2>
                    <button className="home-refresh-btn" onClick={handleRefresh} title="Làm mới">
                        <RefreshCw size={15} />
                        <span>Refresh</span>
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
                        <h3>Empty feed</h3>
                        <p>Please add friend or create first post!</p>
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
                                    <span>Loading more post...</span>
                                </div>
                            )}
                        </div>

                        {/* End of feed */}
                        {!hasMore && (
                            <div className="home-end-message">
                                <span>✦</span>
                                <p>No more feed to display</p>
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
