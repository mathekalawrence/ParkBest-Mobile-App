// Admin API Service for React Admin Portal
// Copy this file to your React admin project

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://192.168.100.5:8080/api/admin'; // Update with your backend URL

// Create axios instance
const adminAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add admin token
adminAPI.interceptors.request.use(
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
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AdminService {
  // Authentication
  async login(username, password) {
    try {
      const response = await adminAPI.post('/login', { username, password });
      const { token, admin } = response.data;
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(admin));
      
      return { success: true, data: { token, admin } };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Login failed'
      };
    }
  }

  async logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    return { success: true };
  }

  isLoggedIn() {
    return !!localStorage.getItem('adminToken');
  }

  getCurrentAdmin() {
    const adminData = localStorage.getItem('adminData');
    return adminData ? JSON.parse(adminData) : null;
  }

  // User Management
  async getUsers() {
    try {
      const response = await adminAPI.get('/users');
      return { success: true, data: response.data.users };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch users'
      };
    }
  }

  async getUserDetails(userId) {
    try {
      const response = await adminAPI.get(`/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch user details'
      };
    }
  }

  // Zone Management
  async getZones() {
    try {
      const response = await adminAPI.get('/zones');
      return { success: true, data: response.data.zones };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch zones'
      };
    }
  }

  async createZone(zoneData) {
    try {
      const response = await adminAPI.post('/zones', zoneData);
      return { success: true, data: response.data.zone };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to create zone'
      };
    }
  }

  async updateZone(zoneId, zoneData) {
    try {
      const response = await adminAPI.put(`/zones/${zoneId}`, zoneData);
      return { success: true, data: response.data.zone };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update zone'
      };
    }
  }

  async getZoneSpots(zoneId) {
    try {
      const response = await adminAPI.get(`/zones/${zoneId}/spots`);
      return { success: true, data: response.data.spots };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch zone spots'
      };
    }
  }

  // Analytics
  async getAnalytics() {
    try {
      const response = await adminAPI.get('/analytics');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch analytics'
      };
    }
  }
}

export default new AdminService();

// Example usage in React components:
/*
import AdminService from './admin-api-service';

// Login
const handleLogin = async (username, password) => {
  const result = await AdminService.login(username, password);
  if (result.success) {
    console.log('Login successful:', result.data);
  } else {
    console.error('Login failed:', result.message);
  }
};

// Get users
const loadUsers = async () => {
  const result = await AdminService.getUsers();
  if (result.success) {
    setUsers(result.data);
  }
};

// Create zone
const createZone = async (zoneData) => {
  const result = await AdminService.createZone(zoneData);
  if (result.success) {
    console.log('Zone created:', result.data);
  }
};
*/