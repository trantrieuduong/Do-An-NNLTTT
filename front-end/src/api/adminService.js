import apiClient from './apiClient';

export const adminService = {
    getDashboardStats: async (year) => {
        // Vì Backend dùng @RequestParam decision, ta nối vào Query String
        const queryString = year ? `?year=${year}` : '';
        return apiClient(`/admin/dashboard${queryString}`);
    },

    getPostsForModeration: async (status = 'UNDER_REVIEW', page = 0, size = 10) => {
        const url = `/admin/posts?status=${status}&page=${page}&size=${size}&sort=createdAt,desc`;
        return apiClient(url);
    },

    updatePostStatus: async (postId, decision) => {
        return apiClient(`/admin/posts/${postId}/decision?decision=${decision}`, {
            method: 'PUT',
        });
    },
};
