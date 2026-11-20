import api from './api';

export const ownerService = {
  getDashboard: async () => {
    const response = await api.get('/owner/dashboard');
    return response.data;
  },

  getRatings: async (params) => {
    const response = await api.get('/owner/ratings', { params });
    return response.data;
  },
};
