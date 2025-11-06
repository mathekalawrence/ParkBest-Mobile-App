import { AuthProvider } from '../context/AuthContext';
import { ParkingProvider } from '../context/ParkingContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ParkingProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </ParkingProvider>
    </AuthProvider>
  );
}