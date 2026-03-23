import apiClient from './apiClient';

export const notificationService = {
    /**
     * GET /notifications?page=0&size=20
     * Returns Page<NotificationResponse>
     */
    getNotifications: async (page = 0, size = 20) => {
        try {
            const response = await apiClient(`/notifications?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * GET /notifications/unread-count
     * Returns number (Long)
     */
    getUnreadCount: async () => {
        try {
            const response = await apiClient('/notifications/unread-count');
            return response.data ?? 0;
        } catch (error) {
            throw error;
        }
    },

    /**
     * POST /notifications/{notificationId}
     * Marks a single notification as read
     */
    readNotification: async (notificationId) => {
        try {
            const response = await apiClient(`/notifications/${notificationId}`, { method: 'POST' });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * POST /notifications/read-all
     * Marks all notifications as read
     */
    readAll: async () => {
        try {
            const response = await apiClient('/notifications/read-all', { method: 'POST' });
            return response;
        } catch (error) {
            throw error;
        }
    },
};
