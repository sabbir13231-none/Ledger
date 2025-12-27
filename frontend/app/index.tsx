import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="book" size={48} color="#fff" />
          </View>
        </View>
        
        <Text style={styles.appName}>Driver Ledger</Text>
        <Text style={styles.tagline}>Your Smart Mileage & Expense Companion</Text>
        
        <View style={styles.badge}>
          <Ionicons name="trending-up" size={16} color="#10B981" />
          <Text style={styles.badgeText}>IRS Compliant • $0.67/mile</Text>
        </View>
      </View>

      {/* Value Props */}
      <View style={styles.valuePropsSection}>
        <View style={styles.valuePropCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="location" size={28} color="#3B82F6" />
          </View>
          <Text style={styles.valuePropTitle}>Auto-Track Miles</Text>
          <Text style={styles.valuePropDescription}>
            Background GPS tracking records every business trip automatically
          </Text>
        </View>

        <View style={styles.valuePropCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="receipt" size={28} color="#10B981" />
          </View>
          <Text style={styles.valuePropTitle}>Snap & Save</Text>
          <Text style={styles.valuePropDescription}>
            Capture receipts instantly with your camera for easy expense tracking
          </Text>
        </View>

        <View style={styles.valuePropCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="document-text" size={28} color="#F59E0B" />
          </View>
          <Text style={styles.valuePropTitle}>Tax Reports</Text>
          <Text style={styles.valuePropDescription}>
            Generate IRS-ready reports in seconds for maximum deductions
          </Text>
        </View>
      </View>

      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>$12K+</Text>
          <Text style={styles.statLabel}>Avg. Yearly Savings</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>100%</Text>
          <Text style={styles.statLabel}>IRS Compliant</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>24/7</Text>
          <Text style={styles.statLabel}>Auto Tracking</Text>
        </View>
      </View>

      {/* Perfect For Section */}
      <View style={styles.perfectForSection}>
        <Text style={styles.sectionTitle}>Perfect For</Text>
        <View style={styles.driverTypes}>
          <View style={styles.driverType}>
            <Ionicons name="car" size={20} color="#3B82F6" />
            <Text style={styles.driverTypeText}>Rideshare</Text>
          </View>
          <View style={styles.driverType}>
            <Ionicons name="bicycle" size={20} color="#10B981" />
            <Text style={styles.driverTypeText}>Delivery</Text>
          </View>
          <View style={styles.driverType}>
            <Ionicons name="bus" size={20} color="#F59E0B" />
            <Text style={styles.driverTypeText}>Taxi</Text>
          </View>
          <View style={styles.driverType}>
            <Ionicons name="briefcase" size={20} color="#8B5CF6" />
            <Text style={styles.driverTypeText}>Contractors</Text>
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <View style={styles.ctaSection}>
        <TouchableOpacity style={styles.loginButton} onPress={login}>
          <View style={styles.buttonContent}>
            <Ionicons name="logo-google" size={22} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.loginButtonText}>Get Started with Google</Text>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.privacyText}>
          Free to start • No credit card required
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made for independent drivers to maximize tax deductions
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 48,
  },
  features: {
    width: '100%',
    marginBottom: 48,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 12,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 24,
    textAlign: 'center',
  },
});
