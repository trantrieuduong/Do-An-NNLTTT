export const BASE_URL = 'http://localhost:8686';
export const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=random&color=fff&name=";
export const getAvatarUrl = (name) => `${DEFAULT_AVATAR}${encodeURIComponent(name || 'User')}`;
