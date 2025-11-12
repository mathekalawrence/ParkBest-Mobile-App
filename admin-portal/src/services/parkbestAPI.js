import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

// ParkBest Backend API Configuration with auto-detection
const ADMIN_API_URL = `${API_BASE_URL}/admin`;

const api = axios.create({
  baseURL: ADMIN_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add admin token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
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

export const parkbestAPI = {
  // Authentication
  register: async (username, password) => {
    try {
      const response = await api.post('/register', { username, password });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Registration failed'
      };
    }
  },

  // Bookings
  getBookings: async () => {
    try {
      const response = await api.get('/bookings');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch bookings'
      };
    }
  },

  // Payments
  getPayments: async () => {
    try {
      const response = await api.get('/payments');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch payments'
      };
    }
  },

  // Reports
  getReports: async () => {
    try {
      const response = await api.get('/reports');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch reports'
      };
    }
  },

  generateReport: async (type) => {
    try {
      const response = await api.post('/reports/generate', { report_type: type });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to generate report'
      };
    }
  },

  login: async (username, password) => {
    try {
      const response = await api.post('/login', { username, password });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Login failed'
      };
    }
  },

  // Dashboard Analytics
  getAnalytics: async () => {
    try {
      const response = await api.get('/analytics');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch analytics'
      };
    }
  },

  // User Management
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return { success: true, data: response.data.users };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch users'
      };
    }
  },

  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch user details'
      };
    }
  },

  // Zone Management (replaces parking spots)
  getZones: async () => {
    try {
      const response = await api.get('/zones');
      return { success: true, data: response.data.zones };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch zones'
      };
    }
  },

  createZone: async (zoneData) => {
    try {
      const response = await api.post('/zones', zoneData);
      return { success: true, data: response.data.zone };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to create zone'
      };
    }
  },

  updateZone: async (zoneId, zoneData) => {
    try {
      const response = await api.put(`/zones/${zoneId}`, zoneData);
      return { success: true, data: response.data.zone };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update zone'
      };
    }
  },

  getZoneSpots: async (zoneId) => {
    try {
      const response = await api.get(`/zones/${zoneId}/spots`);
      return { success: true, data: response.data.spots };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch zone spots'
      };
    }
  }
};

export default api;