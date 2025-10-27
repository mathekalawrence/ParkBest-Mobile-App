
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookParkingScreen from '../screens/BookParkingScreen.js';
import CheckTrafficScreen from '../screens/CheckTrafficScreen';
import LoginScreen from '../screens/LoginScreen';
import ReportIncidentScreen from '../screens/ReportIncidentScreen.js';
import ReportScreen from '../screens/ReportScreen.js';
import SignupScreen from '../screens/SignupScreen';
import SmartRouterScreen from '../screens/SmartRouterScreen.js';
import WelcomeScreen from '../screens/WelcomeScreen';

// Creating stack navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    //<NavigationContainer></NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
          backgroundColor: '#1a237e', // Navy blue
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
          options={{ headerShown: false }} // Hides header for welcome screen to make it more presentable
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
          headerLeft: null, // Removes back button on Report screen
          gestureEnabled: false // Disables swipe back for better interactivity
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
    
  );
}

/*
import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

*/


