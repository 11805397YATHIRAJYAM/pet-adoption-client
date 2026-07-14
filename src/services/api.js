import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.put('/auth/change-password', data),
  resendVerification: () => api.post('/auth/resend-verification'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteAccount: () => api.delete('/users'),
  getFavorites: (params) => api.get('/users/favorites', { params }),
  getApplications: (params) => api.get('/users/applications', { params }),
  getNotifications: (params) => api.get('/users/notifications', { params }),
  markNotificationRead: (id) => api.put(`/users/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/users/notifications/read-all'),
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
};

// Pet API
export const petAPI = {
  getAll: (params) => api.get('/pets', { params }),
  getById: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post('/pets', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/pets/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/pets/${id}`),
  deleteImage: (petId, publicId) => api.delete(`/pets/${petId}/images/${publicId}`),
  getShelterPets: (shelterId, params) => api.get(`/pets/shelter/${shelterId}`, { params }),
};

// Application API
export const applicationAPI = {
  create: (data) => api.post('/applications', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  update: (id, data) => api.put(`/applications/${id}`, data),
};

// Review API
export const reviewAPI = {
  create: (data) => api.post('/reviews', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/reviews', { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.put(`/reviews/${id}/helpful`),
  moderate: (id, data) => api.put(`/reviews/${id}/moderate`, data),
};

// Favorite API
export const favoriteAPI = {
  getAll: () => api.get('/favorites'),
  add: (petId) => api.post('/favorites', { petId }),
  remove: (petId) => api.delete(`/favorites/${petId}`),
  check: (petId) => api.get(`/favorites/check/${petId}`),
};

// Message API
export const messageAPI = {
  createOrGetConversation: (data) => api.post('/messages/conversations', data),
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId, params) => api.get(`/messages/conversations/${conversationId}`, { params }),
  send: (data) => api.post('/messages', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/messages/${id}`),
};

// Appointment API
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  update: (id, data) => api.put(`/appointments/${id}`, data),
};

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Shelter API
export const shelterAPI = {
  getAll: (params) => api.get('/shelters', { params }),
  getById: (id) => api.get(`/shelters/${id}`),
  getMy: () => api.get('/shelters/my/profile'),
  create: (data) => api.post('/shelters', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/shelters/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/shelters/${id}`),
  approve: (id) => api.put(`/shelters/${id}/approve`),
  getAnalytics: (id) => api.get(`/shelters/${id}/analytics`),
};

// Foster API
export const fosterAPI = {
  apply: (data) => api.post('/foster/apply', data),
  getApplications: (params) => api.get('/foster/applications', { params }),
  getById: (id) => api.get(`/foster/applications/${id}`),
  update: (id, data) => api.put(`/foster/applications/${id}`, data),
  addProgress: (id, data) => api.post(`/foster/applications/${id}/progress`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  addMedical: (id, data) => api.post(`/foster/applications/${id}/medical`, data),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  suspendUser: (id, data) => api.put(`/admin/users/${id}/suspend`, data),
  changeRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
  getShelters: (params) => api.get('/admin/shelters', { params }),
  getPets: (params) => api.get('/admin/pets', { params }),
  deletePet: (id) => api.delete(`/admin/pets/${id}`),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  moderateReview: (id, data) => api.put(`/admin/reviews/${id}/moderate`, data),
  approveShelter: (id) => api.put(`/admin/shelters/${id}/approve`),
};

export default api;
