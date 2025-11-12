import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

class AuthService {
  // User Registration
  async register(userData) {
    try {
      console.log('🔄 Attempting registration to:', apiClient.defaults.baseURL);
      const response = await apiClient.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        full_name: userData.fullName,
        phone: userData.phone,
      });
      
      console.log('✅ Registration successful:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Registration successful'
      };
    } catch (error) {
      console.log('❌ Registration error:', error.message);
      console.log('❌ Error code:', error.code);
      return {
        success: false,
        message: error.response?.data?.error || 'Registration failed'
      };
    }
  }

  // User Login
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      
      // Store token and user data
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      return {
        success: true,
        data: { token, user },
        message: 'Login successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Login failed'
      };
    }
  }

  // Logout
  async logout() {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Logout failed' };
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Get current user data
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();