import apiClient from './client';

export const purchasedAPI = {
  getPackages: async () => {
    return await apiClient.get('/api/packages');
  },

  getPackageCourses: async (packageId) => {
    return await apiClient.get(`/api/packages/${packageId}/courses`);
  },

  getCourseSections: async (courseId) => {
    return await apiClient.get(`/api/courses/${courseId}/sections`);
  }
};