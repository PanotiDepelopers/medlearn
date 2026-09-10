import apiClient from './client';

export const streamAPI = {
  getStream: async (videoId, sessionId) => {
    return await apiClient.post(`/api/stream/${videoId}`, {}, {
      headers: {
        'X-Session-ID': sessionId
      }
    });
  },

  getSectionVideos: async (sectionId) => {
    return await apiClient.get(`/api/sections/${sectionId}/videos`);
  },

  getSubsectionVideos: async (subsectionId) => {
    return await apiClient.get(`/api/subsections/${subsectionId}/videos`);
  },

  getProxyStats: async () => {
    return await apiClient.get('/api/proxy/stats');
  }
};