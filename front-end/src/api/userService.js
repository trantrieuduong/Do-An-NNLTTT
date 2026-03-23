import apiClient from './apiClient';

export const userService = {
    getMyProfile: async () => {
        return apiClient('/profiles/my-profile');
    },

    getUserProfile: async (userIdOrUsername) => {
        return apiClient(`/profiles/${userIdOrUsername}`);
    },

    getPostsByUser: async (userIdOrUsername, page = 0, size = 20) => {
        return apiClient(`/profiles/${userIdOrUsername}/posts?page=${page}&size=${size}`);
    },

    updateProfile: async (data) => {
        return apiClient('/profiles/my-profile', {
            method: 'PUT',
            body: data,
        });
    },

    changePassword: async (data) => {
        return apiClient('/users/change-password', {
            method: 'POST',
            body: data,
        });
    },

    changeUsername: async (data) => {
        return apiClient('/users/change-username', {
            method: 'POST',
            body: data,
        });
    }
};
