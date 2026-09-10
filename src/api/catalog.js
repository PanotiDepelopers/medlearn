import apiClient from './client';

export const catalogAPI = {
  getAll: async () => {
    return await apiClient.get('/api/catalog/all');
  },

  getPackage: async (packageId) => {
    return await apiClient.get(`/api/catalog/package/${packageId}`);
  },

  getCourse: async (courseId) => {
    return await apiClient.get(`/api/catalog/course/${courseId}`);
  }
};