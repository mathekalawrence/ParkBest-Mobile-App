import { Platform } from 'react-native';

// Auto-detect API URL for React Native
const getApiUrl = () => {
  // Check if environment variable exists
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // For mobile development
  if (Platform.OS === 'web') {
    // Web version - auto-detect
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//localhost:3001/api`;
    }
    return `${protocol}//${hostname}:3001/api`;
  } else {
    // Mobile version - use localhost for simulator, IP for device
    return __DEV__ ? 'http://localhost:3001/api' : 'http://YOUR_IP:3001/api';
  }
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