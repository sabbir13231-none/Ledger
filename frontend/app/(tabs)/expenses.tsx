import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

const EXPENSE_CATEGORIES = [
  { id: 'fuel', label: 'Fuel', icon: 'flame' },
  { id: 'maintenance', label: 'Maintenance', icon: 'build' },
  { id: 'insurance', label: 'Insurance', icon: 'shield-checkmark' },
  { id: 'phone', label: 'Phone', icon: 'phone-portrait' },
  { id: 'parking', label: 'Parking & Tolls', icon: 'car' },
  { id: 'licensing', label: 'Licensing', icon: 'document' },
  { id: 'rideshare_fees', label: 'Rideshare Fees', icon: 'cash' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function ExpensesScreen() {
  const { user, sessionToken } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: '',
    notes: '',
    vehicle_id: '',
    receipt_image_base64: '',
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
      const [expensesRes, vehiclesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/expenses`, {
          headers: { Authorization: `Bearer ${sessionToken}` }
        }),
        axios.get(`${BACKEND_URL}/api/vehicles`, {
          headers: { Authorization: `Bearer ${sessionToken}` }
        })
      ]);
      setExpenses(expensesRes.data);
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setNewExpense({ 
        ...newExpense, 
        receipt_image_base64: `data:image/jpeg;base64,${result.assets[0].base64}` 
      });
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!newExpense.category) {
      alert('Please select a category');
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/expenses`,
        {
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          notes: newExpense.notes,
          vehicle_id: newExpense.vehicle_id || null,
          receipt_image_base64: newExpense.receipt_image_base64,
          date: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${sessionToken}` }
        }
      );

      setShowAddModal(false);
      setNewExpense({
        amount: '',
        category: '',
        notes: '',
        vehicle_id: '',
        receipt_image_base64: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert('Failed to add expense');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === category);
    return cat ? cat.icon : 'cash';
  };

  const getCategoryLabel = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === category);
    return cat ? cat.label : category;
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
        <Text style={styles.headerTitle}>Expenses</Text>
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
        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No expenses yet</Text>
            <Text style={styles.emptyStateSubtext}>Track your business expenses for tax deductions</Text>
          </View>
        ) : (
          expenses.map((expense) => (
            <View key={expense.expense_id} style={styles.expenseCard}>
              <View style={styles.expenseHeader}>
                <View style={styles.expenseIconContainer}>
                  <Ionicons 
                    name={getCategoryIcon(expense.category) as any} 
                    size={24} 
                    color="#3B82F6" 
                  />
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseCategory}>{getCategoryLabel(expense.category)}</Text>
                  <Text style={styles.expenseDate}>
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </Text>
                </View>
                <View style={styles.expenseActions}>
                  <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
                  <TouchableOpacity onPress={() => handleDeleteExpense(expense.expense_id)}>
                    <Ionicons name="trash" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              {expense.notes && (
                <Text style={styles.expenseNotes}>{expense.notes}</Text>
              )}
              {expense.receipt_image_base64 && (
                <View style={styles.receiptContainer}>
                  <Image 
                    source={{ uri: expense.receipt_image_base64 }} 
                    style={styles.receiptImage}
                  />
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Expense</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount *</Text>
                <View style={styles.amountInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={newExpense.amount}
                    onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.categoriesGrid}>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        newExpense.category === category.id && styles.categoryChipActive
                      ]}
                      onPress={() => setNewExpense({ ...newExpense, category: category.id })}
                    >
                      <Ionicons 
                        name={category.icon as any} 
                        size={20} 
                        color={newExpense.category === category.id ? '#fff' : '#3B82F6'} 
                      />
                      <Text 
                        style={[
                          styles.categoryChipText,
                          newExpense.category === category.id && styles.categoryChipTextActive
                        ]}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add any details..."
                  multiline
                  numberOfLines={3}
                  value={newExpense.notes}
                  onChangeText={(text) => setNewExpense({ ...newExpense, notes: text })}
                />
              </View>

              {vehicles.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Vehicle (Optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                      style={[
                        styles.vehicleChip,
                        !newExpense.vehicle_id && styles.vehicleChipActive
                      ]}
                      onPress={() => setNewExpense({ ...newExpense, vehicle_id: '' })}
                    >
                      <Text style={styles.vehicleChipText}>None</Text>
                    </TouchableOpacity>
                    {vehicles.map((vehicle) => (
                      <TouchableOpacity
                        key={vehicle.vehicle_id}
                        style={[
                          styles.vehicleChip,
                          newExpense.vehicle_id === vehicle.vehicle_id && styles.vehicleChipActive
                        ]}
                        onPress={() => setNewExpense({ ...newExpense, vehicle_id: vehicle.vehicle_id })}
                      >
                        <Text style={styles.vehicleChipText}>{vehicle.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Receipt Photo</Text>
                <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                  <Ionicons name="camera" size={24} color="#3B82F6" />
                  <Text style={styles.photoButtonText}>
                    {newExpense.receipt_image_base64 ? 'Photo Added' : 'Take Photo'}
                  </Text>
                </TouchableOpacity>
                {newExpense.receipt_image_base64 && (
                  <Image 
                    source={{ uri: newExpense.receipt_image_base64 }} 
                    style={styles.previewImage}
                  />
                )}
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleAddExpense}>
                <Text style={styles.saveButtonText}>Save Expense</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  expenseCard: {
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
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  expenseDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  expenseActions: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  expenseNotes: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  receiptContainer: {
    marginTop: 12,
  },
  receiptImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalScroll: {
    flex: 1,
    marginTop: 100,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 600,
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
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 6,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#fff',
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
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
  },
  photoButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    marginLeft: 8,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 12,
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
