import apiClient from './apiClient';

export const getMyChats = async (page = 0, size = 20) => {
    try {
        const response = await apiClient(`/chats?page=${page}&size=${size}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getChatMembers = async (chatId) => {
    try {
        const response = await apiClient(`/chats/${chatId}/members`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMessages = async (chatId, limit = 20, cursorSeq = null) => {
    try {
        const params = new URLSearchParams({ limit });
        if (cursorSeq !== null && cursorSeq !== undefined) {
            params.append('cursorSeq', cursorSeq);
        }
        const response = await apiClient(`/chats/${chatId}/messages?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ... existing code ...
export const createGroupChat = async (chatName, memberIds) => {
    try {
        const response = await apiClient('/chats/group', {
            method: 'POST',
            body: {
                chatName,
                memberIds
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUnreadCount = async () => {
    try {
        const response = await apiClient('/chats/unread-count');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateGroupInfo = async (chatId, data) => {
    try {
        const response = await apiClient(`/chats/group/${chatId}`, {
            method: 'PUT',
            body: data
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const leaveGroup = async (chatId) => {
    try {
        const response = await apiClient(`/chats/group/${chatId}/leave`, {
            method: 'POST'
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
