# ParkBest Mobile App - Backend Integration Guide

## 🎯 Overview

This guide documents the complete integration between the ParkBest React Native mobile app and the Node.js Express backend. It covers API integration, authentication flow, state management, and real-time features.

## 📱 Current Mobile App Structure

```
ParkBest-Mobile-App/
├── app/
│   └── index.js              # Main navigation setup
├── screens/
│   ├── WelcomeScreen.js      # Landing page
│   ├── LoginScreen.js        # User authentication
│   ├── SignupScreen.js       # User registration
│   ├── ReportScreen.js       # Main dashboard
│   ├── BookParkingScreen.js  # Parking booking
│   └── [other screens]
├── services/                 # API integration layer (to be created)
├── context/                  # State management (to be created)
├── utils/                    # Helper functions (to be created)
└── express-backend/          # Backend API server
```

## 🔧 Integration Architecture

### Data Flow
```
React Native App ↔ API Service Layer ↔ Express Backend ↔ PostgreSQL Database
```

### Authentication Flow
```
Login Screen → API Call → JWT Token → AsyncStorage → Protected Routes
```

### Booking Flow
```
Zones List → Spot Selection → Booking Creation → Payment → Confirmation
```

## 📋 Step-by-Step Integration Implementation

### Step 1: Create API Service Layer

First, we'll create a centralized API service to handle all backend communication.

#### 1.1 Create API Configuration
```javascript
// services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Development
  : 'https://your-production-domain.com/api';  // Production

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### 1.2 Create Authentication Service
```javascript
// services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

class AuthService {
  // User Registration
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        full_name: userData.fullName,
        phone: userData.phone,
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Registration successful'
      };
    } catch (error) {
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
```

#### 1.3 Create Parking Service
```javascript
// services/parkingService.js
import apiClient from './api';

class ParkingService {
  // Get all parking zones
  async getParkingZones() {
    try {
      const response = await apiClient.get('/parking/zones');
      return {
        success: true,
        data: response.data.zones
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch parking zones'
      };
    }
  }

  // Get available spots in a zone
  async getAvailableSpots(zoneId) {
    try {
      const response = await apiClient.get(`/parking/zones/${zoneId}/spots`);
      return {
        success: true,
        data: response.data.spots
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch available spots'
      };
    }
  }

  // Create a booking
  async createBooking(bookingData) {
    try {
      const response = await apiClient.post('/parking/book', {
        parking_spot_id: bookingData.spotId,
        vehicle_plate: bookingData.vehiclePlate,
        duration_hours: bookingData.duration,
      });
      
      return {
        success: true,
        data: response.data.booking
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to create booking'
      };
    }
  }

  // Get user's booking history
  async getUserBookings() {
    try {
      const response = await apiClient.get('/parking/bookings');
      return {
        success: true,
        data: response.data.bookings
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch bookings'
      };
    }
  }

  // Check in to parking spot
  async checkIn(bookingId) {
    try {
      const response = await apiClient.post('/realtime/checkin', {
        booking_id: bookingId
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Check-in failed'
      };
    }
  }

  // Check out from parking spot
  async checkOut(bookingId) {
    try {
      const response = await apiClient.post('/realtime/checkout', {
        booking_id: bookingId
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Check-out failed'
      };
    }
  }
}

export default new ParkingService();
```

#### 1.4 Create Payment Service
```javascript
// services/paymentService.js
import apiClient from './api';

class PaymentService {
  // Initiate M-Pesa payment
  async initiatePayment(paymentData) {
    try {
      const response = await apiClient.post('/payments/mpesa/stkpush', {
        booking_id: paymentData.bookingId,
        phone: paymentData.phone,
        amount: paymentData.amount,
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Payment initiation failed'
      };
    }
  }

  // Check payment status
  async checkPaymentStatus(checkoutRequestId) {
    try {
      const response = await apiClient.get(`/payments/status/${checkoutRequestId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to check payment status'
      };
    }
  }
}

export default new PaymentService();
```

#### 1.5 Create Maps Service
```javascript
// services/mapsService.js
import apiClient from './api';

class MapsService {
  // Get directions to parking spot
  async getDirections(destination) {
    try {
      const response = await apiClient.get('/maps/directions', {
        params: {
          destination: destination,
          origin: 'current_location' // Will be replaced with actual coordinates
        }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to get directions'
      };
    }
  }

  // Find nearby places
  async getNearbyPlaces(location, type = 'restaurant') {
    try {
      const response = await apiClient.get('/maps/nearby', {
        params: {
          location: location,
          type: type
        }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to find nearby places'
      };
    }
  }

  // Geocode address
  async geocodeAddress(address) {
    try {
      const response = await apiClient.get('/maps/geocode', {
        params: { address }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Geocoding failed'
      };
    }
  }
}

export default new MapsService();
```

### Step 2: Create State Management with Context

#### 2.1 Authentication Context
```javascript
// context/AuthContext.js
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

const initialState = {
  isLoading: true,
  isLoggedIn: false,
  user: null,
  token: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        isLoading: false,
        isLoggedIn: !!action.token,
        token: action.token,
        user: action.user,
      };
    case 'SIGN_IN':
      return {
        ...state,
        isLoading: false,
        isLoggedIn: true,
        token: action.token,
        user: action.user,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isLoading: false,
        isLoggedIn: false,
        token: null,
        user: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is already logged in
    const bootstrapAsync = async () => {
      try {
        const isLoggedIn = await authService.isLoggedIn();
        if (isLoggedIn) {
          const user = await authService.getCurrentUser();
          const token = await AsyncStorage.getItem('userToken');
          dispatch({ type: 'RESTORE_TOKEN', token, user });
        } else {
          dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
        }
      } catch (e) {
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    ...state,
    signIn: async (email, password) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const result = await authService.login(email, password);
      
      if (result.success) {
        dispatch({
          type: 'SIGN_IN',
          token: result.data.token,
          user: result.data.user,
        });
      }
      
      dispatch({ type: 'SET_LOADING', loading: false });
      return result;
    },
    signOut: async () => {
      await authService.logout();
      dispatch({ type: 'SIGN_OUT' });
    },
    signUp: async (userData) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const result = await authService.register(userData);
      dispatch({ type: 'SET_LOADING', loading: false });
      return result;
    },
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### 2.2 Parking Context
```javascript
// context/ParkingContext.js
import React, { createContext, useContext, useReducer } from 'react';
import parkingService from '../services/parkingService';

const ParkingContext = createContext();

const initialState = {
  zones: [],
  selectedZone: null,
  availableSpots: [],
  selectedSpot: null,
  bookings: [],
  currentBooking: null,
  loading: false,
};

function parkingReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ZONES':
      return { ...state, zones: action.zones };
    case 'SET_SELECTED_ZONE':
      return { ...state, selectedZone: action.zone };
    case 'SET_AVAILABLE_SPOTS':
      return { ...state, availableSpots: action.spots };
    case 'SET_SELECTED_SPOT':
      return { ...state, selectedSpot: action.spot };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.bookings };
    case 'SET_CURRENT_BOOKING':
      return { ...state, currentBooking: action.booking };
    case 'ADD_BOOKING':
      return { 
        ...state, 
        bookings: [action.booking, ...state.bookings],
        currentBooking: action.booking 
      };
    default:
      return state;
  }
}

export function ParkingProvider({ children }) {
  const [state, dispatch] = useReducer(parkingReducer, initialState);

  const parkingContext = {
    ...state,
    
    loadZones: async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const result = await parkingService.getParkingZones();
      
      if (result.success) {
        dispatch({ type: 'SET_ZONES', zones: result.data });
      }
      
      dispatch({ type: 'SET_LOADING', loading: false });
      return result;
    },

    selectZone: (zone) => {
      dispatch({ type: 'SET_SELECTED_ZONE', zone });
    },

    loadAvailableSpots: async (zoneId) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const result = await parkingService.getAvailableSpots(zoneId);
      
      if (result.success) {
        dispatch({ type: 'SET_AVAILABLE_SPOTS', spots: result.data });
      }
      
      dispatch({ type: 'SET_LOADING', loading: false });
      return result;
    },

    selectSpot: (spot) => {
      dispatch({ type: 'SET_SELECTED_SPOT', spot });
    },

    createBooking: async (bookingData) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const result = await parkingService.createBooking(bookingData);
      
      if (result.success) {
        dispatch({ type: 'ADD_BOOKING', booking: result.data });
      }
      
      dispatch({ type: 'SET_LOADING', loading: false });
      return result;
    },

    loadUserBookings: async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const result = await parkingService.getUserBookings();
      
      if (result.success) {
        dispatch({ type: 'SET_BOOKINGS', bookings: result.data });
      }
      
      dispatch({ type: 'SET_LOADING', loading: false });
      return result;
    },

    checkIn: async (bookingId) => {
      const result = await parkingService.checkIn(bookingId);
      
      if (result.success) {
        // Update booking status in state
        const updatedBookings = state.bookings.map(booking =>
          booking.id === bookingId 
            ? { ...booking, status: 'active' }
            : booking
        );
        dispatch({ type: 'SET_BOOKINGS', bookings: updatedBookings });
      }
      
      return result;
    },

    checkOut: async (bookingId) => {
      const result = await parkingService.checkOut(bookingId);
      
      if (result.success) {
        // Update booking status in state
        const updatedBookings = state.bookings.map(booking =>
          booking.id === bookingId 
            ? { ...booking, status: 'completed' }
            : booking
        );
        dispatch({ type: 'SET_BOOKINGS', bookings: updatedBookings });
      }
      
      return result;
    },
  };

  return (
    <ParkingContext.Provider value={parkingContext}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
}
```

### Step 3: Update Existing Screens

#### 3.1 Updated Login Screen
```javascript
// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const result = await signIn(email, password);
    
    if (result.success) {
      Alert.alert('Success', 'Login successful!');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Report' }],
      });
    } else {
      Alert.alert('Login Failed', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          <Text style={styles.header}>Login to Your Account</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
          
          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back to Welcome</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#1a237e',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 16,
  },
  signupLink: {
    color: '#1a237e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 30,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#1a237e',
    fontSize: 16,
  },
});
```

### Step 4: Create Required Dependencies

#### 4.1 Install Required Packages
```bash
# Navigate to your React Native project root
cd ParkBest-Mobile-App

# Install required packages
npm install @react-native-async-storage/async-storage
npm install axios
npm install react-native-maps
npm install @react-native-community/geolocation
```

#### 4.2 Update App Entry Point
```javascript
// app/index.js - Updated with Context Providers
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from '../context/AuthContext';
import { ParkingProvider } from '../context/ParkingContext';

// Import screens
import BookParkingScreen from '../screens/BookParkingScreen.js';
import CheckTrafficScreen from '../screens/CheckTrafficScreen';
import LoginScreen from '../screens/LoginScreen';
import ReportIncidentScreen from '../screens/ReportIncidentScreen.js';
import ReportScreen from '../screens/ReportScreen.js';
import SignupScreen from '../screens/SignupScreen';
import SmartRouterScreen from '../screens/SmartRouterScreen.js';
import WelcomeScreen from '../screens/WelcomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <ParkingProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Welcome"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1a237e',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ title: 'Login' }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen}
              options={{ title: 'Create Account' }}
            />
            <Stack.Screen 
              name="Report" 
              component={ReportScreen}
              options={{ 
                title: 'ParkBest',
                headerLeft: null,
                gestureEnabled: false
              }}
            />
            <Stack.Screen 
              name="ReportIncident" 
              component={ReportIncidentScreen}
              options={{ title: 'Report Accident' }} 
            />
            <Stack.Screen
              name="BookParking"
              component={BookParkingScreen}
              options={{ title: 'Book Parking'}}
            />
            <Stack.Screen
              name="CheckTraffic"
              component={CheckTrafficScreen}
              options={{ title: 'State of Traffic'}}
            />
            <Stack.Screen
              name="SmartRouter"
              component={SmartRouterScreen}
              options={{ title: 'Smart Router'}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ParkingProvider>
    </AuthProvider>
  );
}
```

## 🔄 Real-time Features Implementation

### WebSocket Integration (Optional Enhancement)
```javascript
// services/websocketService.js
import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io('ws://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('parking_update', (data) => {
      // Handle real-time parking updates
      console.log('Parking update received:', data);
    });

    this.socket.on('booking_update', (data) => {
      // Handle booking status updates
      console.log('Booking update received:', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToZone(zoneId) {
    if (this.socket) {
      this.socket.emit('subscribe_zone', zoneId);
    }
  }

  unsubscribeFromZone(zoneId) {
    if (this.socket) {
      this.socket.emit('unsubscribe_zone', zoneId);
    }
  }
}

export default new WebSocketService();
```

## 📱 Testing the Integration

### 1. Backend Setup
```bash
# Start the backend server
cd express-backend
npm run dev
```

### 2. Mobile App Setup
```bash
# Start the React Native app
cd ParkBest-Mobile-App
npm start
```

### 3. Test Flow
1. **Registration**: Create new user account
2. **Login**: Authenticate with credentials
3. **Browse Zones**: View available parking zones
4. **Book Parking**: Select spot and create booking
5. **Payment**: Process M-Pesa payment
6. **Navigation**: Get directions to parking spot
7. **Check-in/out**: Manage parking session

## 🚀 Deployment Configuration

### Environment Variables
```javascript
// config/environment.js
const ENV = {
  development: {
    API_URL: 'http://localhost:5000/api',
    WEBSOCKET_URL: 'ws://localhost:5000',
  },
  production: {
    API_URL: 'https://your-production-api.com/api',
    WEBSOCKET_URL: 'wss://your-production-api.com',
  }
};

export default ENV[__DEV__ ? 'development' : 'production'];
```

## 📋 Integration Checklist

### ✅ Completed
- [x] API service layer created
- [x] Authentication flow implemented
- [x] State management with Context API
- [x] Login screen integration
- [x] Error handling and loading states

### 🔄 In Progress
- [ ] Complete all screen integrations
- [ ] Payment flow implementation
- [ ] Maps integration
- [ ] Real-time updates
- [ ] Push notifications

### 📝 Next Steps
1. **Complete Screen Integration**: Update all remaining screens
2. **Payment Testing**: Test M-Pesa integration thoroughly
3. **Maps Implementation**: Add Google Maps for navigation
4. **Real-time Features**: Implement WebSocket for live updates
5. **Push Notifications**: Add Firebase for notifications
6. **Testing**: Comprehensive end-to-end testing
7. **Deployment**: Prepare for production deployment

## 🔧 Troubleshooting

### Common Issues
1. **Network Errors**: Check API URL and network connectivity
2. **Authentication Failures**: Verify JWT token handling
3. **CORS Issues**: Configure backend CORS settings
4. **AsyncStorage Errors**: Handle storage permissions

### Debug Tools
- React Native Debugger
- Flipper for network inspection
- Backend API logs
- Device console logs

This integration guide provides a complete foundation for connecting your React Native app with the Express backend. Follow the steps sequentially and test each component thoroughly.