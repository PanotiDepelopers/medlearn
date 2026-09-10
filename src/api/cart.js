import apiClient from './client';

export const cartAPI = {
  getCart: async () => {
    return await apiClient.get('/api/cart');
  },

  addItem: async (item) => {
    return await apiClient.post('/api/cart/add', item);
  },

  removeItem: async (itemId) => {
    return await apiClient.post('/api/cart/remove', { item_id: itemId });
  },

  checkout: async (items, total) => {
    return await apiClient.post('/api/cart/checkout', { items, total });
  }
};