import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Crown,
  Star,
  Shield,
  Calendar,
  CreditCard,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Check,
  Info,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/hooks/useSubscription';
import {
  getSubscriptionTierName,
  getSubscriptionStatusName,
  FEATURE_ACCESS,
} from '@/constants/subscriptionTypes';

export default function SubscriptionManagementScreen() {
  const { theme } = useTheme();
  const {
    subscription,
    subscriptionTier,
    subscriptionStatus,
    isLoading,
    refreshStatus,
  } = useSubscription();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleManageSubscription = () => {
    // Open platform-specific subscription management
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else if (Platform.OS === 'android') {
      Linking.openURL(
        'https://play.google.com/store/account/subscriptions'
      );
    }
  };

  const handleUpgrade = () => {
    router.push('/paywall');
  };

  const handleRefresh = async () => {
    await refreshStatus();
    Alert.alert('Success', 'Subscription status refreshed');
  };

  const getTierIcon = () => {
    switch (subscriptionTier) {
      case 'pro':
        return <Crown size={32} color="#9333EA" fill="#9333EA" />;
      case 'premium':
        return <Star size={32} color="#FFD700" fill="#FFD700" />;
      default:
        return <Shield size={32} color={theme.colors.text.muted} />;
    }
  };

  const getTierColor = () => {
    switch (subscriptionTier) {
      case 'pro':
        return '#9333EA';
      case 'premium':
        return '#FFD700';
      default:
        return theme.colors.text.muted;
    }
  };

  const getStatusColor = () => {
    switch (subscriptionStatus) {
      case 'active':
      case 'in_trial':
        return theme.colors.accent.success;
      case 'cancelled':
        return theme.colors.accent.warning;
      case 'expired':
        return theme.colors.accent.error;
      default:
        return theme.colors.text.muted;
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background.gray }}>
        <Stack.Screen
          options={{
            title: 'Subscription',
            headerStyle: { backgroundColor: theme.colors.background.white },
            headerTintColor: theme.colors.text.primary,
          }}
        />
        <ActivityIndicator size="large" color={theme.colors.primary.turquoise} />
      </View>
    );
  }

  const features = FEATURE_ACCESS[subscriptionTier];
  const isFree = subscriptionTier === 'free';

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background.gray }}>
      <Stack.Screen
        options={{
          title: 'Subscription',
          headerStyle: { backgroundColor: theme.colors.background.white },
          headerTintColor: theme.colors.text.primary,
          headerShadowVisible: false,
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Current Subscription Card */}
        <View className="p-4">
          <View
            className="p-6 rounded-2xl"
            style={{ backgroundColor: theme.colors.background.white }}
          >
            {/* Tier Badge */}
            <View className="items-center mb-4">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: getTierColor() + '20' }}
              >
                {getTierIcon()}
              </View>
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: theme.colors.text.primary }}
              >
                {getSubscriptionTierName(subscriptionTier)}
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: getStatusColor() + '20' }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: getStatusColor() }}
                >
                  {getSubscriptionStatusName(subscriptionStatus)}
                </Text>
              </View>
            </View>

            {/* Subscription Details */}
            {!isFree && subscription && (
              <View className="mt-4 space-y-3">
                {/* Period */}
                {subscription.subscription_period && (
                  <View className="flex-row items-center justify-between py-3 border-b" style={{ borderBottomColor: theme.colors.ui.border }}>
                    <View className="flex-row items-center">
                      <Calendar size={20} color={theme.colors.text.muted} />
                      <Text className="ml-3 text-base" style={{ color: theme.colors.text.muted }}>
                        Billing Period
                      </Text>
                    </View>
                    <Text className="text-base font-semibold" style={{ color: theme.colors.text.primary }}>
                      {subscription.subscription_period.charAt(0).toUpperCase() +
                        subscription.subscription_period.slice(1)}
                    </Text>
                  </View>
                )}

                {/* Start Date */}
                {subscription.started_at && (
                  <View className="flex-row items-center justify-between py-3 border-b" style={{ borderBottomColor: theme.colors.ui.border }}>
                    <View className="flex-row items-center">
                      <CreditCard size={20} color={theme.colors.text.muted} />
                      <Text className="ml-3 text-base" style={{ color: theme.colors.text.muted }}>
                        Started
                      </Text>
                    </View>
                    <Text className="text-base font-semibold" style={{ color: theme.colors.text.primary }}>
                      {formatDate(subscription.started_at)}
                    </Text>
                  </View>
                )}

                {/* Expiration Date */}
                {subscription.expires_at && (
                  <View className="flex-row items-center justify-between py-3">
                    <View className="flex-row items-center">
                      <Calendar size={20} color={theme.colors.text.muted} />
                      <Text className="ml-3 text-base" style={{ color: theme.colors.text.muted }}>
                        {subscriptionStatus === 'cancelled' ? 'Expires' : 'Renews'}
                      </Text>
                    </View>
                    <Text className="text-base font-semibold" style={{ color: theme.colors.text.primary }}>
                      {formatDate(subscription.expires_at)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Free Tier Message */}
            {isFree && (
              <View className="mt-2 p-4 rounded-lg" style={{ backgroundColor: theme.colors.primary.turquoise + '10' }}>
                <Text className="text-sm text-center" style={{ color: theme.colors.text.primary }}>
                  You're on the free plan. Upgrade to unlock all features!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-4 mb-4">
          {isFree ? (
            <TouchableOpacity
              className="py-4 rounded-xl flex-row items-center justify-center"
              style={{ backgroundColor: theme.colors.primary.turquoise }}
              onPress={handleUpgrade}
              activeOpacity={0.7}
            >
              <Star size={20} color="#FFFFFF" fill="#FFFFFF" />
              <Text className="text-white text-base font-bold ml-2">
                Upgrade to Premium
              </Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                className="mb-3 py-4 rounded-xl flex-row items-center justify-center border"
                style={{
                  backgroundColor: theme.colors.background.white,
                  borderColor: theme.colors.ui.border,
                }}
                onPress={handleManageSubscription}
                activeOpacity={0.7}
              >
                <ExternalLink size={20} color={theme.colors.text.primary} />
                <Text className="text-base font-semibold ml-2" style={{ color: theme.colors.text.primary }}>
                  Manage Subscription
                </Text>
              </TouchableOpacity>

              {subscriptionTier === 'premium' && (
                <TouchableOpacity
                  className="mb-3 py-4 rounded-xl flex-row items-center justify-center"
                  style={{ backgroundColor: '#9333EA' }}
                  onPress={handleUpgrade}
                  activeOpacity={0.7}
                >
                  <Crown size={20} color="#FFFFFF" fill="#FFFFFF" />
                  <Text className="text-white text-base font-bold ml-2">
                    Upgrade to Pro
                  </Text>
                  <ChevronRight size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity
            className="py-3 rounded-xl flex-row items-center justify-center"
            style={{ backgroundColor: theme.colors.background.white }}
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <RefreshCw size={18} color={theme.colors.text.muted} />
            <Text className="text-sm font-medium ml-2" style={{ color: theme.colors.text.muted }}>
              Refresh Status
            </Text>
          </TouchableOpacity>
        </View>

        {/* Your Benefits */}
        <View className="px-4 mb-4">
          <Text className="text-lg font-bold mb-3" style={{ color: theme.colors.text.primary }}>
            Your Benefits
          </Text>
          <View
            className="p-4 rounded-2xl"
            style={{ backgroundColor: theme.colors.background.white }}
          >
            {[
              { label: 'All Lessons', value: features.allLessons },
              { label: 'Advanced Dryland', value: features.advancedDryland },
              { label: 'AI Feedback', value: features.aiFeedback },
              { label: 'AI Coaching', value: features.aiCoaching },
              { label: 'Advanced Analytics', value: features.advancedAnalytics },
              { label: 'Offline Mode', value: features.offlineMode },
              { label: 'Ad-Free Experience', value: features.adFree },
              { label: 'Voice Journal', value: features.voiceJournal },
              { label: 'Video Journal', value: features.videoJournal },
              { label: 'Priority Support', value: features.prioritySupport },
            ].map((benefit, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between py-3"
                style={{
                  borderBottomWidth: index < 9 ? 1 : 0,
                  borderBottomColor: theme.colors.ui.border,
                }}
              >
                <Text className="text-base" style={{ color: theme.colors.text.primary }}>
                  {benefit.label}
                </Text>
                {benefit.value ? (
                  <Check size={20} color={theme.colors.accent.success} />
                ) : (
                  <View
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: theme.colors.ui.border }}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Info Section */}
        <View className="px-4 pb-8">
          <View
            className="p-4 rounded-xl flex-row"
            style={{ backgroundColor: theme.colors.background.white }}
          >
            <Info size={20} color={theme.colors.primary.turquoise} />
            <View className="flex-1 ml-3">
              <Text className="text-sm" style={{ color: theme.colors.text.muted }}>
                Subscriptions are managed through your {Platform.OS === 'ios' ? 'Apple' : 'Google'} account.
                You can cancel or change your subscription at any time in your account settings.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
