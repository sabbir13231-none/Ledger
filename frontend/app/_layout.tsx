import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { LocationProvider } from '../contexts/LocationContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
