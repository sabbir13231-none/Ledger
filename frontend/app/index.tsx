import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions, TextInput, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type AuthTab = 'google' | 'email' | 'phone';

export default function WelcomeScreen() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
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

  if (showAuth) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Auth Header */}
        <View style={styles.authHeader}>
          <TouchableOpacity onPress={() => setShowAuth(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1E3A5F" />
          </TouchableOpacity>
          <Image 
            source={require('../assets/logo.png')}
            style={styles.authLogo}
            resizeMode="contain"
          />
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

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image 
          source={require('../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        
        <Text style={styles.heroTitle}>Track Every Mile,{'\n'}Maximize Every Deduction</Text>
        <Text style={styles.heroSubtitle}>
          The #1 tax tracking app for 1099 contractors, rideshare drivers, and delivery professionals
        </Text>
        
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>$12K+</Text>
            <Text style={styles.heroStatLabel}>Avg. Yearly Savings</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>100%</Text>
            <Text style={styles.heroStatLabel}>IRS Compliant</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>24/7</Text>
            <Text style={styles.heroStatLabel}>Auto Tracking</Text>
          </View>
        </View>
      </View>

      {/* Key Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Everything You Need</Text>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIcon} style={{backgroundColor: '#DBEAFE'}}>
            <Ionicons name="navigate" size={32} color="#3B82F6" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Automatic GPS Tracking</Text>
            <Text style={styles.featureDescription}>
              Background tracking records every business trip automatically. Set it and forget it!
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon} style={{backgroundColor: '#D1FAE5'}}>
            <Ionicons name="camera" size={32} color="#10B981" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Snap & Track Expenses</Text>
            <Text style={styles.featureDescription}>
              Capture receipts instantly. Track fuel, maintenance, insurance, phone bills, and more.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon} style={{backgroundColor: '#FEF3C7'}}>
            <Ionicons name="document-text" size={32} color="#F59E0B" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>IRS-Ready Tax Reports</Text>
            <Text style={styles.featureDescription}>
              Generate compliant reports for quarterly or annual tax filing. Export to PDF or CSV.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon} style={{backgroundColor: '#E0E7FF'}}>
            <Ionicons name="car" size={32} color="#6366F1" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Multiple Vehicle Support</Text>
            <Text style={styles.featureDescription}>
              Track expenses and mileage for all your vehicles. Set business-use percentage per vehicle.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon} style={{backgroundColor: '#FCE7F3'}}>
            <Ionicons name="card" size={32} color="#EC4899" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Bank Account Linking</Text>
            <Text style={styles.featureDescription}>
              Connect your bank accounts to automatically categorize business expenses with AI.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon} style={{backgroundColor: '#DBEAFE'}}>
            <Ionicons name="analytics" size={32} color="#0EA5E9" />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Real-Time Analytics</Text>
            <Text style={styles.featureDescription}>
              Track your miles, expenses, and potential tax savings in real-time on your dashboard.
            </Text>
          </View>
        </View>
      </View>

      {/* IRS Compliance Badge */}
      <View style={styles.complianceSection}>
        <View style={styles.complianceBadge}>
          <Ionicons name="shield-checkmark" size={48} color="#10B981" />
          <View style={styles.complianceText}>
            <Text style={styles.complianceTitle}>IRS Compliant Tracking</Text>
            <Text style={styles.complianceDescription}>
              2025 Standard Rate: $0.67 per mile
            </Text>
            <Text style={styles.complianceDescription}>
              Meets all IRS requirements for mileage logs
            </Text>
          </View>
        </View>
      </View>

      {/* Perfect For */}
      <View style={styles.audienceSection}>
        <Text style={styles.sectionTitle}>Perfect For</Text>
        <View style={styles.audienceGrid}>
          <View style={styles.audienceCard}>
            <Ionicons name="car" size={32} color="#3B82F6" />
            <Text style={styles.audienceTitle}>Rideshare</Text>
            <Text style={styles.audienceText}>Uber, Lyft drivers</Text>
          </View>
          <View style={styles.audienceCard}>
            <Ionicons name="bicycle" size={32} color="#10B981" />
            <Text style={styles.audienceTitle}>Delivery</Text>
            <Text style={styles.audienceText}>DoorDash, Instacart</Text>
          </View>
          <View style={styles.audienceCard}>
            <Ionicons name="bus" size={32} color="#F59E0B" />
            <Text style={styles.audienceTitle}>Taxi</Text>
            <Text style={styles.audienceText}>Independent cabs</Text>
          </View>
          <View style={styles.audienceCard}>
            <Ionicons name="briefcase" size={32} color="#8B5CF6" />
            <Text style={styles.audienceTitle}>Contractors</Text>
            <Text style={styles.audienceText}>Any 1099 worker</Text>
          </View>
        </View>
      </View>

      {/* Pricing Preview */}
      <View style={styles.pricingSection}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        <View style={styles.pricingCards}>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingPlan}>Basic</Text>
            <Text style={styles.pricingPrice}>Free</Text>
            <Text style={styles.pricingFeature}>✓ Manual tracking</Text>
            <Text style={styles.pricingFeature}>✓ Basic reports</Text>
            <Text style={styles.pricingFeature}>✓ 1 vehicle</Text>
          </View>
          <View style={[styles.pricingCard, styles.pricingCardPopular]}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>POPULAR</Text>
            </View>
            <Text style={styles.pricingPlan}>Mid-Tier</Text>
            <Text style={styles.pricingPrice}>$4.99/mo</Text>
            <Text style={styles.pricingFeature}>✓ Auto GPS tracking</Text>
            <Text style={styles.pricingFeature}>✓ Receipt photos</Text>
            <Text style={styles.pricingFeature}>✓ Up to 3 vehicles</Text>
          </View>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingPlan}>Premium</Text>
            <Text style={styles.pricingPrice}>$12.99/mo</Text>
            <Text style={styles.pricingFeature}>✓ Everything in Mid</Text>
            <Text style={styles.pricingFeature}>✓ PDF/CSV export</Text>
            <Text style={styles.pricingFeature}>✓ Unlimited vehicles</Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Save on Taxes?</Text>
        <Text style={styles.ctaSubtitle}>Join thousands of drivers maximizing their deductions</Text>
        
        <TouchableOpacity style={styles.ctaButton} onPress={() => setShowAuth(true)}>
          <Text style={styles.ctaButtonText}>Get Started Free</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.ctaNote}>No credit card required • Free plan available</Text>
      </View>

      {/* Footer */}
      <View style={styles.footerSection}>
        <Text style={styles.footerText}>
          Made for 1099 contractors to maximize tax deductions
        </Text>
        <Text style={styles.footerDisclaimer}>
          Not tax advice. Consult with a tax professional for your specific situation.
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
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  logoImage: {
    width: width * 0.6,
    height: 120,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
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
  
  // Auth Section
  authSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#14B8A6',
  },
  
  // Form Container
  formContainer: {
    backgroundColor: '#FFFFFF',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  
  // Input Fields
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  
  // Buttons
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButton: {
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#14B8A6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#14B8A6',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  
  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
// Styles will be appended to index.tsx
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  logoImage: {
    width: width * 0.5,
    height: 100,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A5F',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#F9FAFB',
    paddingVertical: 20,
    borderRadius: 16,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#14B8A6',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Features Section
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  
  // Compliance Section
  complianceSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  complianceBadge: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  complianceText: {
    marginLeft: 16,
    flex: 1,
  },
  complianceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 4,
  },
  complianceDescription: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  
  // Audience Section
  audienceSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#F9FAFB',
  },
  audienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  audienceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  audienceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginTop: 12,
    marginBottom: 4,
  },
  audienceText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Pricing Section
  pricingSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  pricingCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  pricingCardPopular: {
    backgroundColor: '#EFF6FF',
    borderColor: '#14B8A6',
  },
  popularBadge: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pricingPlan: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14B8A6',
    marginBottom: 12,
  },
  pricingFeature: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  
  // CTA Section
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 32,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: '#14B8A6',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaNote: {
    fontSize: 14,
    color: '#CBD5E1',
    marginTop: 16,
    textAlign: 'center',
  },
  
  // Footer Section
  footerSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerDisclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Auth Screen Styles
  authHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  authLogo: {
    flex: 1,
    height: 60,
    marginLeft: 16,
  },
  authSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#14B8A6',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButton: {
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#14B8A6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#14B8A6',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#14B8A6',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
});
