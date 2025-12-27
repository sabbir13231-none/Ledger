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
            <Ionicons name="document-text" size={48} color="#fff" />
          </View>
        </View>
        
        <Text style={styles.appName}>1099 Ledger</Text>
        <Text style={styles.tagline}>Smart Tax Tracking for 1099 Contractors</Text>
        
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  
  // Hero Section
  heroSection: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 48,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
  },
  
  // Value Props
  valuePropsSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#F9FAFB',
    gap: 16,
  },
  valuePropCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  valuePropTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  valuePropDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Stats Banner
  statsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginVertical: 32,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  
  // Perfect For Section
  perfectForSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  driverTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  driverType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  driverTypeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  
  // CTA Section
  ctaSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  privacyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
  
  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
