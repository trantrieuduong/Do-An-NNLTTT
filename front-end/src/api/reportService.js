import apiClient from './apiClient';

export const reportService = {
    createReport: async (targetId, targetType, reason, details = "") => {
        return apiClient('/reports', {
            method: 'POST',
            body: { 
                targetId, 
                targetType, 
                reason, 
                details 
            },
        });
    },

    getReports: async (status = 'PENDING', page = 0, size = 10) => {
        try {
            const url = `/admin/reports?status=${status}&page=${page}&size=${size}&sort=createdAt,desc`;
            return apiClient(url);
        } catch (error) {
            console.error('getReports error:', error);
            throw error;
        }
    },

    resolveReport: async (reportId, resolution) => {
        return apiClient(`/admin/reports/${reportId}/resolve?resolution=${resolution}`, {
            method: 'PUT',
        });
    }
};