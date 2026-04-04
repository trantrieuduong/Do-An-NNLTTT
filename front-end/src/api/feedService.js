import apiClient from './apiClient';

export const feedService = {
    getPost: async (postId) => {
        return apiClient(`/posts/${postId}`);
    },

    likePost: async (postId) => {
        return apiClient(`/posts/${postId}/like`, { method: 'POST' });
    },

    unlikePost: async (postId) => {
        return apiClient(`/posts/${postId}/unlike`, { method: 'POST' });
    },

    createComment: async (postId, content) => {
        return apiClient('/comments', {
            method: 'POST',
            body: { postId, content },
        });
    },

    getComments: async (postId, page = 0, size = 20) => {
        return apiClient(`/posts/${postId}/comments?page=${page}&size=${size}`);
    },

    updateComment: async (commentId, content) => {
        return apiClient(`/comments/${commentId}`, {
            method: 'PUT',
            body: { content },
        });
    },

    deleteComment: async (commentId) => {
        return apiClient(`/comments/${commentId}`, { method: 'DELETE' });
    },

    updatePost: async (postId, content) => {
        return apiClient(`/posts/${postId}`, {
            method: 'PUT',
            body: { content },
        });
    },

    deletePost: async (postId) => {
        return apiClient(`/posts/${postId}`, { method: 'DELETE' });
    },

    createPost: async (content, media = []) => {
        return apiClient('/posts', {
            method: 'POST',
            body: { content, media },
        });
    },

    getPostsByUser: async (userId, page = 0, size = 10) => {
        return apiClient(`/posts/user/${userId}?page=${page}&size=${size}`);
    },

    /**
     * Cursor-based feed: GET /feed
     * @param {string|null} cursorTime  – ISO-8601 Instant, e.g. "2024-01-01T00:00:00Z"
     * @param {string|null} cursorId    – last post ID from previous page
     * @param {number}      limit       – số lượng items mỗi trang (default 20)
     * @returns {Promise<{success, data: {items, nextCursorTime, nextCursorId}}>}
     */
    getFeed: async (cursorTime = null, cursorId = null, limit = 20) => {
        const params = new URLSearchParams({ limit });
        if (cursorTime) params.set('cursorTime', cursorTime);
        if (cursorId) params.set('cursorId', cursorId);
        return apiClient(`/feed?${params.toString()}`);
    },

    searchPosts: async (keyword) => {
        return apiClient(`/posts/search?keyword=${encodeURIComponent(keyword)}`);
    }
};
