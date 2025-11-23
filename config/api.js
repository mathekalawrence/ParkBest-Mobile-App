import { Platform } from 'react-native';

// Auto-detect API URL for React Native
const getApiUrl = () => {
  // Always use localhost for development
  return 'http://localhost:3001/api';
};

export const API_BASE_URL = getApiUrl();

// Usage in your API calls
export const apiClient = {
  get: (endpoint) => fetch(`${API_BASE_URL}${endpoint}`),
  post: (endpoint, data) => fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
};

console.log('🔗 Mobile App using API URL:', API_BASE_URL);