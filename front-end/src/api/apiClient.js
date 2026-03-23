import { BASE_URL } from '../utils/constants';

const apiClient = async (endpoint, options = {}) => {
    const { method = 'GET', body, headers = {}, ...rest } = options;

    const token = localStorage.getItem('token');
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...headers,
        },
        ...rest,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            // Token hết hạn hoặc không hợp lệ → xóa token và đá sang trang đăng nhập
            if (response.status === 403 && data.message === 'Incorrect or expired token') {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

export default apiClient;
