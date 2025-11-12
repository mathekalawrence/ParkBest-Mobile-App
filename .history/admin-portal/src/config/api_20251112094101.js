// Auto-detect API URL based on environment
const getApiUrl = () => {
  // Check if environment variable exists
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Auto-detect based on current host
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // If running on localhost, use localhost backend
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//localhost:3001/api`;
  }
  
  // If running on network IP, use same IP for backend
  return `${protocol}//${hostname}:3001/api`;
};

export const API_BASE_URL = getApiUrl();

console.log('🔗 Admin Portal using API URL:', API_BASE_URL);