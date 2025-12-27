import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function ReportsScreen() {
  const { user, sessionToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/');
    } else {
      loadReport('month');
    }
  }, [user]);

  const getPeriodDates = (period: 'month' | 'quarter' | 'year') => {
    const now = new Date();
    let start, end;

    switch (period) {
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'quarter':
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
    }

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  };

  const loadReport = async (period: 'month' | 'quarter' | 'year') => {
    setLoading(true);
    setSelectedPeriod(period);

    try {
      const dates = getPeriodDates(period);
      const response = await axios.get(
        `${BACKEND_URL}/api/reports/tax?start_date=${dates.start}&end_date=${dates.end}`,
        {
          headers: { Authorization: `Bearer ${sessionToken}` }
        }
      );
      setReport(response.data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    alert('PDF export feature coming soon! This will generate an IRS-compliant mileage log.');
  };

  const handleExportCSV = () => {
    alert('CSV export feature coming soon! This will create a TurboTax-compatible file.');
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
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Period Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Period</Text>
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'month' && styles.periodButtonActive
              ]}
              onPress={() => loadReport('month')}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'month' && styles.periodButtonTextActive
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'quarter' && styles.periodButtonActive
              ]}
              onPress={() => loadReport('quarter')}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'quarter' && styles.periodButtonTextActive
                ]}
              >
                Quarterly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'year' && styles.periodButtonActive
              ]}
              onPress={() => loadReport('year')}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'year' && styles.periodButtonTextActive
                ]}
              >
                Annual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {report && (
          <>
            {/* Summary Card */}
            <View style={styles.section}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Tax Summary</Text>
                <Text style={styles.summaryPeriod}>
                  {format(new Date(report.period_start), 'MMM dd, yyyy')} - {format(new Date(report.period_end), 'MMM dd, yyyy')}
                </Text>

                <View style={styles.summaryStats}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Business Miles</Text>
                    <Text style={styles.summaryValue}>{report.business_miles.toFixed(1)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Mileage Rate (2025 IRS)</Text>
                    <Text style={styles.summaryValue}>$0.67/mile</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Mileage Deduction</Text>
                    <Text style={styles.summaryValue}>${(report.business_miles * 0.67).toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Other Expenses</Text>
                    <Text style={styles.summaryValue}>${report.total_expenses.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                    <Text style={styles.summaryLabelBold}>Total Deduction</Text>
                    <Text style={styles.summaryValueBold}>${report.total_deduction.toFixed(2)}</Text>
                  </View>
                  <View style={styles.savingsBox}>
                    <Ionicons name="cash" size={24} color="#10B981" />
                    <View style={styles.savingsInfo}>
                      <Text style={styles.savingsLabel}>Estimated Tax Savings</Text>
                      <Text style={styles.savingsValue}>${report.total_tax_savings.toFixed(2)}</Text>
                      <Text style={styles.savingsNote}>Based on 25% tax bracket</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Export Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Export Report</Text>
              
              <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
                <View style={styles.exportButtonContent}>
                  <Ionicons name="document-text" size={24} color="#3B82F6" />
                  <View style={styles.exportButtonText}>
                    <Text style={styles.exportButtonTitle}>Export as PDF</Text>
                    <Text style={styles.exportButtonSubtitle}>IRS-compliant mileage log</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.exportButton} onPress={handleExportCSV}>
                <View style={styles.exportButtonContent}>
                  <Ionicons name="cloud-download" size={24} color="#10B981" />
                  <View style={styles.exportButtonText}>
                    <Text style={styles.exportButtonTitle}>Export as CSV</Text>
                    <Text style={styles.exportButtonSubtitle}>TurboTax compatible</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Ionicons name="information-circle" size={20} color="#6B7280" />
              <Text style={styles.disclaimerText}>
                This is not tax advice. Please consult with a tax professional for your specific situation.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#3B82F6',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryPeriod: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 24,
  },
  summaryStats: {
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryRowTotal: {
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryLabelBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryValueBold: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  savingsBox: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  savingsInfo: {
    marginLeft: 12,
    flex: 1,
  },
  savingsLabel: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  savingsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 4,
  },
  savingsNote: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  exportButton: {
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
  exportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exportButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  exportButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  exportButtonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  disclaimer: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
