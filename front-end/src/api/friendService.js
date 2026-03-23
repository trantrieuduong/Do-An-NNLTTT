import apiClient from './apiClient';

export const friendService = {
    getFriends: async () => {
        return apiClient('/friends');
    },

    getFriendRequestsReceived: async () => {
        return apiClient('/friends/received');
    },

    getFriendRequestsSent: async () => {
        return apiClient('/friends/sent');
    },

    sendFriendRequest: async (toUserIdOrUsername) => {
        return apiClient(`/friends/request/${toUserIdOrUsername}`, {
            method: 'POST',
        });
    },

    acceptFriendRequest: async (friendRequestId) => {
        return apiClient(`/friends/accept/${friendRequestId}`, {
            method: 'POST',
        });
    },

    declineFriendRequest: async (friendRequestId) => {
        return apiClient(`/friends/decline/${friendRequestId}`, {
            method: 'POST',
        });
    },

    cancelFriendRequest: async (friendRequestId) => {
        return apiClient(`/friends/cancel/${friendRequestId}`, {
            method: 'POST',
        });
    },

    unFriend: async (anotherUserIdOrUsername) => {
        return apiClient(`/friends/unfriend/${anotherUserIdOrUsername}`, {
            method: 'POST',
        });
    }
};
