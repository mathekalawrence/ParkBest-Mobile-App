import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import authService from '../services/authService';
import reportingService from '../services/reportingService';

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
      
      // Log authentication event
      await reportingService.logAuthEvent('LOGIN', {
        email,
        success: result.success,
        message: result.message
      });
      
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
      const currentUser = await authService.getCurrentUser();
      await reportingService.logAuthEvent('LOGOUT', {
        email: currentUser?.email || 'unknown',
        success: true,
        message: 'User logged out'
      });
      await authService.logout();
      dispatch({ type: 'SIGN_OUT' });
    },
    signUp: async (userData) => {
      dispatch({ type: 'SET_LOADING', loading: true });
      const result = await authService.register(userData);
      
      // Log registration event
      await reportingService.logAuthEvent('REGISTER', {
        email: userData.email,
        success: result.success,
        message: result.message
      });
      
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