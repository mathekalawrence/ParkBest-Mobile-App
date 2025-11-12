import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

const ADMIN_API_URL = `${API_BASE_URL}/admin`;

const api = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Auth
  login: (email, password) => api.post('/login', { email, password }),
  
  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats'),
  
  // Users
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  
  // Parking Spots
  getParkingSpots: () => api.get('/parking-spots'),
  createParkingSpot: (data) => api.post('/parking-spots', data),
  updateParkingSpot: (id, data) => api.put(`/parking-spots/${id}`, data),
  deleteParkingSpot: (id) => api.delete(`/parking-spots/${id}`),
  
  // Attendants
  getAttendants: () => api.get('/attendants'),
  createAttendant: (data) => api.post('/attendants', data),
  updateAttendant: (id, data) => api.put(`/attendants/${id}`, data),
  deleteAttendant: (id) => api.delete(`/attendants/${id}`),
  
  // Bookings
  getBookings: () => api.get('/bookings'),
  getRecentBookings: () => api.get('/bookings/recent'),
};

export default api;