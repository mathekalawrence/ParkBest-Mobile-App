# ParkBest Integration Setup Guide

## 🚀 Quick Setup Instructions

Follow these steps to integrate your React Native app with the Express backend:

### Step 1: Install Required Dependencies

```bash
# Navigate to your React Native project
cd ParkBest-Mobile-App

# Install required packages
npm install @react-native-async-storage/async-storage axios

# If you don't have these already, install them too:
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
```

### Step 2: Update Your App Entry Point

Replace your current `app/index.js` with the updated version that includes context providers:

```javascript
// app/index.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from '../context/AuthContext';
import { ParkingProvider } from '../context/ParkingContext';

// Import your existing screens
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
            {/* Your existing screens */}
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

### Step 3: Start Your Backend Server

```bash
# In a new terminal, navigate to backend
cd express-backend

# Install dependencies if not done already
npm install

# Start the development server
npm run dev
```

The backend should start on `http://localhost:5000`

### Step 4: Test the Integration

1. **Start React Native App:**
   ```bash
   # In your main project directory
   npm start
   ```

2. **Test Authentication:**
   - Go to Login screen
   - Try logging in with test credentials
   - Check if JWT token is stored properly

3. **Test API Connection:**
   - The app will automatically try to connect to `http://localhost:5000/api`
   - Check Metro bundler logs for any network errors

### Step 5: Update Existing Screens (Optional)

You can replace your current `BookParkingScreen.js` with the new integrated version:

```bash
# Backup your current file
cp screens/BookParkingScreen.js screens/BookParkingScreen.backup.js

# Use the new integrated version
cp screens/UpdatedBookParkingScreen.js screens/BookParkingScreen.js
```

## 🔧 Configuration

### API Base URL Configuration

The API client automatically detects development vs production:

```javascript
// services/api.js
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Development
  : 'https://your-production-domain.com/api';  // Production
```

### Environment Variables (Optional)

Create a `.env` file in your React Native project root:

```env
# .env
API_BASE_URL=http://localhost:5000/api
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 📱 Testing Checklist

### ✅ Authentication Flow
- [ ] User can register new account
- [ ] User can login with credentials
- [ ] JWT token is stored in AsyncStorage
- [ ] Protected routes work correctly
- [ ] Logout clears stored data

### ✅ Parking Features
- [ ] Parking zones load from backend
- [ ] Available spots display correctly
- [ ] Booking creation works
- [ ] Payment integration functions
- [ ] Real-time updates work

### ✅ Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Invalid credentials show proper alerts
- [ ] Loading states display correctly
- [ ] Offline behavior is graceful

## 🐛 Troubleshooting

### Common Issues

**1. Network Request Failed**
```
Solution: Make sure backend is running on localhost:5000
Check: curl http://localhost:5000/
```

**2. CORS Errors**
```
Solution: Backend already configured for CORS
Check: express-backend/server.js has cors() middleware
```

**3. AsyncStorage Errors**
```
Solution: Make sure @react-native-async-storage/async-storage is installed
Run: npm install @react-native-async-storage/async-storage
```

**4. Context Provider Errors**
```
Solution: Make sure AuthProvider and ParkingProvider wrap your app
Check: app/index.js has proper provider structure
```

### Debug Network Requests

Enable network debugging in React Native:

```javascript
// Add to your app entry point for debugging
if (__DEV__) {
  global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
  global.FormData = global.originalFormData || global.FormData;
}
```

### Check Backend Logs

Monitor your backend terminal for API requests:

```bash
# Backend logs will show:
🚀 ParkBest Backend Server running on port 5000
POST /api/auth/login - 200 - Login successful
GET /api/parking/zones - 200 - Zones fetched
```

## 📋 Next Steps

After successful integration:

1. **Test All Features:** Go through each screen and test functionality
2. **Add Error Boundaries:** Implement React error boundaries for better UX
3. **Optimize Performance:** Add loading states and caching
4. **Add Push Notifications:** Integrate Firebase for real-time notifications
5. **Prepare for Production:** Update API URLs and deploy backend

## 🎯 Success Indicators

Your integration is successful when:

- ✅ Users can register and login
- ✅ Parking zones load from database
- ✅ Bookings can be created and stored
- ✅ Payments can be initiated (M-Pesa)
- ✅ Real-time features work
- ✅ No console errors in development

## 📞 Support

If you encounter issues:

1. Check the `INTEGRATION_GUIDE.md` for detailed explanations
2. Review backend logs for API errors
3. Check React Native Metro bundler for frontend errors
4. Verify all dependencies are installed correctly

Your ParkBest app is now ready for full backend integration! 🚀