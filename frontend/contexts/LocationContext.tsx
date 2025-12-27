import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useAuth } from './AuthContext';
import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';
const LOCATION_TASK_NAME = 'background-location-task';

interface LocationContextType {
  isTracking: boolean;
  currentTrip: any | null;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { sessionToken } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<any | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestPermission = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      const granted = backgroundStatus === 'granted';
      setHasPermission(granted);
      return granted;
    }
    
    return false;
  };

  const startTracking = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        throw new Error('Location permission not granted');
      }
    }

    try {
      // Start a new trip
      const location = await Location.getCurrentPositionAsync({});
      
      const response = await axios.post(
        `${BACKEND_URL}/api/trips`,
        {
          start_time: new Date().toISOString(),
          distance: 0,
          start_location: `${location.coords.latitude},${location.coords.longitude}`,
          is_business: true,
          is_automatic: true
        },
        {
          headers: { Authorization: `Bearer ${sessionToken}` }
        }
      );

      setCurrentTrip(response.data);
      setIsTracking(true);

      // Start background location tracking
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000, // 1 minute
        distanceInterval: 100, // 100 meters
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Tracking Mileage',
          notificationBody: 'Recording your trip for tax deduction',
        },
      });
    } catch (error) {
      console.error('Failed to start tracking:', error);
      throw error;
    }
  };

  const stopTracking = async () => {
    try {
      if (currentTrip) {
        const location = await Location.getCurrentPositionAsync({});
        
        // Calculate distance (simplified - in production use proper distance calculation)
        const distance = 5.0; // Mock distance for now
        
        await axios.put(
          `${BACKEND_URL}/api/trips/${currentTrip.trip_id}`,
          {
            end_time: new Date().toISOString(),
            end_location: `${location.coords.latitude},${location.coords.longitude}`,
            distance: distance
          },
          {
            headers: { Authorization: `Bearer ${sessionToken}` }
          }
        );
      }

      // Stop background tracking
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isTaskRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      setIsTracking(false);
      setCurrentTrip(null);
    } catch (error) {
      console.error('Failed to stop tracking:', error);
      throw error;
    }
  };

  return (
    <LocationContext.Provider
      value={{
        isTracking,
        currentTrip,
        startTracking,
        stopTracking,
        hasPermission,
        requestPermission
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

// Background location task (must be defined at root level)
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data as any;
    console.log('Background location update:', locations);
    // Here you could update the trip distance in real-time
  }
});
