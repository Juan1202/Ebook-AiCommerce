import api from './api';

export const getPricingList = () => api.get('/admin/pricing');

export const getPricingDetail = (bookId) => api.get(`/admin/pricing/${bookId}`);

export const getPricingHistory = (bookId) => api.get(`/admin/pricing/${bookId}/history`);

export const getPricingExplanation = (bookId) => api.get(`/admin/pricing/${bookId}/explanation`);

export const recalculatePrice = (payload) =>
  api.post('/admin/pricing/recalculate', payload);
