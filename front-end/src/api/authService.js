import apiClient from './apiClient';

export const authService = {
    login: async (credentials) => {
        // credentials: { username, password }
        const response = await apiClient('/auth/login', {
            method: 'POST',
            body: credentials,
        });

        if (response.success && response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
        }

        return response;
    },

    register: async (userData) => {
        // userData: { username, email, password, fullName, birthday, gender }
        return apiClient('/auth/signup', {
            method: 'POST',
            body: userData,
        });
    },

    logout: async () => {
        await apiClient('/auth/logout', {
            method: 'POST',
        });
        localStorage.removeItem('token');
    }
};
