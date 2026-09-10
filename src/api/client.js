import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://medserver.vercel.app';
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'medlearn_token';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding token to request:', config.url);
    } else {
      console.log('⚠️ No token found for request:', config.url);
    }
    // Add cache buster for GET requests
    if (config.method === 'get') {
      const separator = config.url.includes('?') ? '&' : '?';
      config.url += `${separator}_=${Date.now()}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.message);
    
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized, clearing token');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(import.meta.env.VITE_USER_KEY || 'medlearn_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;