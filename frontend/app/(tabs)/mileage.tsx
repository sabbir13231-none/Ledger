import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { format } from 'date-fns';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function MileageScreen() {
  const { user, sessionToken } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrip, setNewTrip] = useState({
    distance: '',
    purpose: '',
    vehicle_id: '',
    start_time: new Date().toISOString(),
  });

  useEffect(() => {
    if (!user) {
      router.replace('/');
    } else {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [tripsRes, vehiclesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/trips`, {
          headers: { Authorization: `Bearer ${sessionToken}` }
        }),
        axios.get(`${BACKEND_URL}/api/vehicles`, {
          headers: { Authorization: `Bearer ${sessionToken}` }
        })
      ]);
      setTrips(tripsRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleAddTrip = async () => {
    if (!newTrip.distance || parseFloat(newTrip.distance) <= 0) {
      alert('Please enter a valid distance');
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/trips`,
        {
          distance: parseFloat(newTrip.distance),
          purpose: newTrip.purpose,
          vehicle_id: newTrip.vehicle_id || null,
          start_time: newTrip.start_time,
          end_time: new Date().toISOString(),
          is_business: true,
          is_automatic: false,
        },
        {
          headers: { Authorization: `Bearer ${sessionToken}` }
        }
      );

      setShowAddModal(false);
      setNewTrip({
        distance: '',
        purpose: '',
        vehicle_id: '',
        start_time: new Date().toISOString(),
      });
      loadData();
    } catch (error) {
      console.error('Failed to add trip:', error);
      alert('Failed to add trip');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete trip:', error);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mileage</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {trips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-sport" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No trips yet</Text>
            <Text style={styles.emptyStateSubtext}>Start tracking or add a trip manually</Text>
          </View>
        ) : (
          trips.map((trip) => (
            <View key={trip.trip_id} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripDistance}>{trip.distance.toFixed(1)} miles</Text>
                  <Text style={styles.tripDate}>
                    {format(new Date(trip.start_time), 'MMM dd, yyyy')}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteTrip(trip.trip_id)}>
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
              {trip.purpose && (
                <Text style={styles.tripPurpose}>{trip.purpose}</Text>
              )}
              <View style={styles.tripFooter}>
                <View style={styles.tripBadge}>
                  <Ionicons 
                    name={trip.is_automatic ? "navigate" : "create"} 
                    size={12} 
                    color="#3B82F6" 
                  />
                  <Text style={styles.tripBadgeText}>
                    {trip.is_automatic ? 'Auto' : 'Manual'}
                  </Text>
                </View>
                <Text style={styles.tripDeduction}>
                  ${(trip.distance * 0.67).toFixed(2)} deduction
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Trip Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Trip</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Distance (miles) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.0"
                keyboardType="decimal-pad"
                value={newTrip.distance}
                onChangeText={(text) => setNewTrip({ ...newTrip, distance: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Purpose</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Delivery to downtown"
                value={newTrip.purpose}
                onChangeText={(text) => setNewTrip({ ...newTrip, purpose: text })}
              />
            </View>

            {vehicles.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Vehicle (Optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.vehicleChip,
                      !newTrip.vehicle_id && styles.vehicleChipActive
                    ]}
                    onPress={() => setNewTrip({ ...newTrip, vehicle_id: '' })}
                  >
                    <Text style={styles.vehicleChipText}>None</Text>
                  </TouchableOpacity>
                  {vehicles.map((vehicle) => (
                    <TouchableOpacity
                      key={vehicle.vehicle_id}
                      style={[
                        styles.vehicleChip,
                        newTrip.vehicle_id === vehicle.vehicle_id && styles.vehicleChipActive
                      ]}
                      onPress={() => setNewTrip({ ...newTrip, vehicle_id: vehicle.vehicle_id })}
                    >
                      <Text style={styles.vehicleChipText}>{vehicle.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleAddTrip}>
              <Text style={styles.saveButtonText}>Save Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripInfo: {
    flex: 1,
  },
  tripDistance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tripDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  tripPurpose: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tripBadgeText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
    fontWeight: '600',
  },
  tripDeduction: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  vehicleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  vehicleChipActive: {
    backgroundColor: '#3B82F6',
  },
  vehicleChipText: {
    fontSize: 14,
    color: '#4B5563',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
