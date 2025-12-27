import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function DashboardScreen() {
  const { user, sessionToken, logout } = useAuth();
  const { isTracking, startTracking, stopTracking } = useLocation();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/');
    } else {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
  }, []);

  const handleTrackingToggle = async () => {
    try {
      if (isTracking) {
        await stopTracking();
      } else {
        await startTracking();
      }
      loadStats();
    } catch (error) {
      console.error('Failed to toggle tracking:', error);
      alert('Failed to toggle tracking. Please check location permissions.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}!</Text>
          <Text style={styles.subtitle}>Ready to track some miles?</Text>
        </View>
      </View>

      {/* Tracking Button */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.trackingButton, isTracking && styles.trackingButtonActive]}
          onPress={handleTrackingToggle}
        >
          <View style={styles.trackingButtonContent}>
            <Ionicons 
              name={isTracking ? "stop-circle" : "play-circle"} 
              size={48} 
              color="#fff" 
            />
            <View style={styles.trackingButtonText}>
              <Text style={styles.trackingButtonTitle}>
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </Text>
              <Text style={styles.trackingButtonSubtitle}>
                {isTracking ? 'Tap to stop recording' : 'Automatic GPS tracking'}
              </Text>
            </View>
          </View>
          {isTracking && (
            <View style={styles.trackingIndicator}>
              <View style={styles.pulsingDot} />
              <Text style={styles.trackingIndicatorText}>Recording...</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Year</Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardLarge]}>
            <Ionicons name="navigate" size={32} color="#3B82F6" />
            <Text style={styles.statValue}>{stats?.year_miles?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statLabel}>Total Miles</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="cash" size={24} color="#10B981" />
            <Text style={styles.statValue}>${stats?.mileage_deduction?.toFixed(0) || '0'}</Text>
            <Text style={styles.statLabel}>Mileage Deduction</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="receipt" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>${stats?.total_expenses?.toFixed(0) || '0'}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
        </View>

        <View style={styles.savingsCard}>
          <Text style={styles.savingsLabel}>Estimated Tax Savings</Text>
          <Text style={styles.savingsValue}>${stats?.estimated_tax_savings?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.savingsNote}>Based on 25% tax bracket</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/mileage')}
          >
            <Ionicons name="add-circle" size={24} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Add Trip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/expenses')}
          >
            <Ionicons name="card" size={24} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Add Expense</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/reports')}
          >
            <Ionicons name="document-text" size={24} color="#3B82F6" />
            <Text style={styles.actionButtonText}>View Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  trackingButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trackingButtonActive: {
    backgroundColor: '#EF4444',
  },
  trackingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingButtonText: {
    marginLeft: 16,
    flex: 1,
  },
  trackingButtonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  trackingButtonSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  trackingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  trackingIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    flex: 1,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardLarge: {
    width: '100%',
    flex: 'none',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  savingsCard: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  savingsLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  savingsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  savingsNote: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    margin: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
});
