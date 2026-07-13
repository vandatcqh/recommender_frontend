import axios from 'axios';
import { API_BASE } from './config';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export const register = (username, password) =>
  api.post('/auth/register', { username, password });

export const login = (username, password) =>
  api.post('/auth/login', { username, password });

export const getMe = () => api.get('/auth/me');

// --- Items ---
export const getItems = (category, page = 1, limit = 24, subcategory = '', search = '') =>
  api.get('/items', { params: { category, page, limit, subcategory, search } });

export const getSubcategories = (category) =>
  api.get(`/categories/${category}/subcategories`);

// --- Ratings ---
export const submitRating = (data) => api.post('/ratings', data);

export const getMyRatings = () => api.get('/ratings/my');

// --- Recommendations ---
export const getRecommendationsStatus = () => api.get('/recommendations/status');

export const getRecommendations = (categoryId, occasion, weather) =>
  api.get('/recommendations', {
    params: { category_id: categoryId, occasion, weather },
  });

export const logRecommenderEvents = (events) =>
  api.post('/recommender/events', { events }).catch(() => {});

export const getRecommenderMetrics = () => api.get('/recommender/metrics');

export const getRecommenderMetricsJsonBlob = () =>
  api.get('/recommender/metrics', { params: { download: 1 }, responseType: 'blob' });

export const getRecommenderMetricsCsvBlob = () =>
  api.get('/recommender/metrics.csv', { responseType: 'blob' });

export const getAdminUsers = () => api.get('/admin/users');

export const updateAdminUser = (userId, isAdmin) =>
  api.patch(`/admin/users/${userId}`, { is_admin: isAdmin });

export const getAdminUserActivity = () => api.get('/admin/user-activity');

export const getAdminUserActivityDetail = (params) =>
  api.get('/admin/user-activity/detail', { params });

// --- Admin ---
export const listRatingFiles = () => api.get('/ratings/files');

export const exportRatingsCsv = () => api.post('/ratings/export-csv');

export const downloadRatingFile = (filename) =>
  api.get(`/ratings/files/${filename}`, { responseType: 'blob' });

export const getRecommenderTrainStatus = (filename) =>
  api.get(`/recommender/status/${filename}`);

export const trainRecommender = (filename) =>
  api.post(`/recommender/train/${filename}`);

export const predictRecommender = (payload) =>
  api.post('/recommender/predict', payload);

export const getRecommenderResult = (jobId) =>
  api.get(`/recommender/result/${jobId}`);

export default api;
