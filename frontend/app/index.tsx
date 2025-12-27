import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions, TextInput, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type AuthTab = 'google' | 'email' | 'phone';

export default function LoginScreen() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AuthTab>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user, loading]);

  const handleEmailLogin = () => {
    alert('Email/Password authentication coming soon! For now, please use Google Sign-In.');
  };

  const handlePhoneLogin = () => {
    if (!otpSent) {
      setOtpSent(true);
      alert('OTP sent to ' + phoneNumber);
    } else {
      alert('Phone authentication coming soon! For now, please use Google Sign-In.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Hero Section with Logo */}
      <View style={styles.heroSection}>
        <Image 
          source={require('../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        
        <Text style={styles.tagline}>Smart Tax Tracking for 1099 Contractors</Text>
        
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={styles.badgeText}>IRS Compliant • $0.67/mile</Text>
        </View>
      </View>

      {/* Auth Tabs */}
      <View style={styles.authSection}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'google' && styles.tabActive]}
            onPress={() => setActiveTab('google')}
          >
            <Ionicons name="logo-google" size={20} color={activeTab === 'google' ? '#14B8A6' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'google' && styles.tabTextActive]}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'email' && styles.tabActive]}
            onPress={() => setActiveTab('email')}
          >
            <Ionicons name="mail" size={20} color={activeTab === 'email' ? '#14B8A6' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'email' && styles.tabTextActive]}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'phone' && styles.tabActive]}
            onPress={() => setActiveTab('phone')}
          >
            <Ionicons name="phone-portrait" size={20} color={activeTab === 'phone' ? '#14B8A6' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'phone' && styles.tabTextActive]}>Phone</Text>
          </TouchableOpacity>
        </View>

        {/* Google Sign-In */}
        {activeTab === 'google' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Sign in with Google</Text>
            <Text style={styles.formDescription}>
              Quick and secure sign-in using your Google account
            </Text>

            <TouchableOpacity style={styles.googleButton} onPress={login}>
              <Ionicons name="logo-google" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Email/Password Sign-In */}
        {activeTab === 'email' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Sign in with Email</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleEmailLogin}>
              <Text style={styles.actionButtonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Phone/SMS Sign-In */}
        {activeTab === 'phone' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Sign in with Phone</Text>
            <Text style={styles.formDescription}>
              We'll send you a verification code via SMS
            </Text>

            {!otpSent ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="phone-portrait" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={handlePhoneLogin}>
                  <Text style={styles.actionButtonText}>Send Code</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Enter 6-digit code</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="keypad" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="123456"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={handlePhoneLogin}>
                  <Text style={styles.actionButtonText}>Verify Code</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resendButton}>
                  <Text style={styles.resendButtonText}>Resend Code</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
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
    backgroundColor: '#1E3A5F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E3A5F',
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
    backgroundColor: '#14B8A6',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#14B8A6',
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
