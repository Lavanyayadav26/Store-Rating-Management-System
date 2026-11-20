import api from './api';

export const ratingService = {
  submitRating: async (data) => {
    const response = await api.post('/ratings', data);
    return response.data;
  },

  updateRating: async (id, data) => {
    const response = await api.put(`/ratings/${id}`, data);
    return response.data;
  },

  getMyRatings: async (params) => {
    const response = await api.get('/ratings/my-ratings', { params });
    return response.data;
  },
};
