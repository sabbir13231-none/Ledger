import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function SubscriptionScreen() {
  const { user, sessionToken } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/');
    } else {
      loadPlans();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const [plansRes, statusRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/subscription/plans`),
        axios.get(`${BACKEND_URL}/api/subscription/status`, {
          headers: { Authorization: `Bearer ${sessionToken}` }
        })
      ]);
      setPlans(plansRes.data.plans);
      setCurrentPlan(statusRes.data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    alert(`In production, this would open Apple In-App Purchase for the ${planId} plan`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Select the plan that best fits your driving needs
        </Text>

        {plans.map((plan) => (
          <View 
            key={plan.id} 
            style={[
              styles.planCard,
              currentPlan?.plan_type === plan.id && styles.planCardActive,
              plan.popular && styles.planCardPopular
            ]}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                {plan.price === 0 ? (
                  <Text style={styles.priceText}>Free</Text>
                ) : (
                  <>
                    <Text style={styles.priceSymbol}>$</Text>
                    <Text style={styles.priceText}>{plan.price}</Text>
                    <Text style={styles.priceInterval}>/{plan.interval}</Text>
                  </>
                )}
              </View>
            </View>

            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>Features:</Text>
              {plan.features.map((feature: string, index: number) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              
              {plan.limitations && plan.limitations.length > 0 && (
                <>
                  <Text style={styles.limitationsTitle}>Not included:</Text>
                  {plan.limitations.map((limitation: string, index: number) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="close-circle" size={20} color={colors.inactive} />
                      <Text style={styles.limitationText}>{limitation}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.selectButton,
                currentPlan?.plan_type === plan.id && styles.selectButtonActive,
                plan.popular && !currentPlan?.plan_type && styles.selectButtonPopular
              ]}
              onPress={() => handleSelectPlan(plan.id)}
              disabled={currentPlan?.plan_type === plan.id}
            >
              <Text style={styles.selectButtonText}>
                {currentPlan?.plan_type === plan.id ? 'Current Plan' : 'Select Plan'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All plans include IRS-compliant mileage tracking and reporting
          </Text>
          <Text style={styles.footerTextSmall}>
            Subscription renews automatically. Cancel anytime from your Apple account settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  planCardActive: {
    borderColor: colors.success,
  },
  planCardPopular: {
    borderColor: colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  planHeader: {
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  priceText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  priceInterval: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  featuresSection: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 10,
    flex: 1,
  },
  limitationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 12,
  },
  limitationText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginLeft: 10,
    flex: 1,
  },
  selectButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonActive: {
    backgroundColor: colors.success,
  },
  selectButtonPopular: {
    backgroundColor: colors.primary,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  footerTextSmall: {
    fontSize: 12,
    color: colors.inactive,
    textAlign: 'center',
    lineHeight: 18,
  },
});