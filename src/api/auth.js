import apiClient from './client';

export const authAPI = {
  login: async (username, password) => {
    console.log('📡 Sending login request...');
    const response = await apiClient.post('/api/auth/login', { username, password });
    console.log('📡 Login response received');
    return response;
  },

  verify: async () => {
    console.log('📡 Verifying token...');
    const response = await apiClient.get('/api/auth/verify');
    console.log('📡 Verification response received');
    return response;
  },

  logout: () => {
    localStorage.removeItem(import.meta.env.VITE_TOKEN_KEY || 'medlearn_token');
    localStorage.removeItem(import.meta.env.VITE_USER_KEY || 'medlearn_user');
  }
};