import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function SettingsScreen() {
  const { user, logout, sessionToken } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    make: '',
    model: '',
    year: '',
    business_percentage: '100',
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
      const [vehiclesRes, subscriptionRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/vehicles`, {
          headers: { Authorization: `Bearer ${user?.user_id}` }
        }),
        axios.get(`${BACKEND_URL}/api/subscription/status`, {
          headers: { Authorization: `Bearer ${user?.user_id}` }
        })
      ]);
      setVehicles(vehiclesRes.data);
      setSubscription(subscriptionRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.name) {
      alert('Please enter a vehicle name');
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/vehicles`,
        {
          name: newVehicle.name,
          make: newVehicle.make,
          model: newVehicle.model,
          year: newVehicle.year ? parseInt(newVehicle.year) : null,
          business_percentage: parseInt(newVehicle.business_percentage),
        },
        {
          headers: { Authorization: `Bearer ${user?.user_id}` }
        }
      );

      setShowAddVehicleModal(false);
      setNewVehicle({
        name: '',
        make: '',
        model: '',
        year: '',
        business_percentage: '100',
      });
      loadData();
    } catch (error) {
      console.error('Failed to add vehicle:', error);
      alert('Failed to add vehicle');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BACKEND_URL}/api/vehicles/${vehicleId}`, {
                headers: { Authorization: `Bearer ${user?.user_id}` }
              });
              loadData();
            } catch (error) {
              console.error('Failed to delete vehicle:', error);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Subscription Section */}
        {subscription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <View>
                  <Text style={styles.subscriptionPlan}>{subscription.plan_type.toUpperCase()} Plan</Text>
                  <Text style={styles.subscriptionStatus}>
                    {subscription.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, subscription.is_active && styles.statusBadgeActive]}>
                  <Text style={[styles.statusBadgeText, subscription.is_active && styles.statusBadgeTextActive]}>
                    {subscription.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              <View style={styles.featuresList}>
                {subscription.features.map((feature: string, index: number) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.mockNote}>Mock subscription for testing</Text>
            </View>
          </View>
        )}

        {/* Vehicles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehicles</Text>
            <TouchableOpacity onPress={() => setShowAddVehicleModal(true)}>
              <Ionicons name="add-circle" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          
          {vehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-sport" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No vehicles added</Text>
            </View>
          ) : (
            vehicles.map((vehicle) => (
              <View key={vehicle.vehicle_id} style={styles.vehicleCard}>
                <View style={styles.vehicleInfo}>
                  <Ionicons name="car" size={24} color="#3B82F6" />
                  <View style={styles.vehicleDetails}>
                    <Text style={styles.vehicleName}>{vehicle.name}</Text>
                    {vehicle.make && vehicle.model && (
                      <Text style={styles.vehicleModel}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </Text>
                    )}
                    <Text style={styles.vehicleBusiness}>
                      {vehicle.business_percentage}% business use
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteVehicle(vehicle.vehicle_id)}>
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Tax Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Settings</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Tax Year</Text>
              <Text style={styles.settingValue}>2025</Text>
            </View>
          </View>
          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>IRS Mileage Rate</Text>
              <Text style={styles.settingValue}>$0.67 per mile</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Vehicle Modal */}
      <Modal
        visible={showAddVehicleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddVehicleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Vehicle</Text>
              <TouchableOpacity onPress={() => setShowAddVehicleModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Vehicle Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., My Honda Civic"
                value={newVehicle.name}
                onChangeText={(text) => setNewVehicle({ ...newVehicle, name: text })}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Make</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Honda"
                  value={newVehicle.make}
                  onChangeText={(text) => setNewVehicle({ ...newVehicle, make: text })}
                />
              </View>

              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Model</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Civic"
                  value={newVehicle.model}
                  onChangeText={(text) => setNewVehicle({ ...newVehicle, model: text })}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Year</Text>
              <TextInput
                style={styles.input}
                placeholder="2020"
                keyboardType="number-pad"
                value={newVehicle.year}
                onChangeText={(text) => setNewVehicle({ ...newVehicle, year: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Business Use Percentage</Text>
              <TextInput
                style={styles.input}
                placeholder="100"
                keyboardType="number-pad"
                value={newVehicle.business_percentage}
                onChangeText={(text) => setNewVehicle({ ...newVehicle, business_percentage: text })}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddVehicle}>
              <Text style={styles.saveButtonText}>Add Vehicle</Text>
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
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileInfo: {},
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subscriptionPlan: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subscriptionStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  statusBadgeActive: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusBadgeTextActive: {
    color: '#10B981',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  mockNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  vehicleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleDetails: {
    marginLeft: 12,
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  vehicleModel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  vehicleBusiness: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 4,
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  settingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
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
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
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
