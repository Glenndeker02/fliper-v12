import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Crown,
  Check,
  X,
  Sparkles,
  Zap,
  Shield,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionPlan, SubscriptionTier } from '@/constants/subscriptionTypes';

export default function PaywallScreen() {
  const { theme } = useTheme();
  const {
    subscriptionTier,
    availablePlans,
    isLoading,
    purchasePlan,
    restoreSubscription,
    isPurchasing,
    isRestoring,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Handle plan selection
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  // Handle purchase
  const handlePurchase = async () => {
    if (!selectedPlan) {
      Alert.alert('No Plan Selected', 'Please select a subscription plan');
      return;
    }

    const result = await purchasePlan(selectedPlan);

    if (result.success) {
      Alert.alert(
        'Success!',
        'Your subscription is now active. Enjoy all premium features!',
        [
          {
            text: 'Start Learning',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      if (result.error !== 'Purchase cancelled') {
        Alert.alert('Purchase Failed', result.error || 'Please try again');
      }
    }
  };

  // Handle restore purchases
  const handleRestore = async () => {
    Alert.alert(
      'Restore Purchases',
      'This will restore any previous purchases made with this Apple ID / Google account.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Restore',
          onPress: async () => {
            const result = await restoreSubscription();
            if (result.success) {
              Alert.alert('Success', 'Your purchases have been restored!');
            } else {
              Alert.alert('No Purchases Found', result.error || 'No previous purchases found');
            }
          },
        },
      ]
    );
  };

  // Get tier icon
  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'premium':
        return <Star size={28} color="#FFD700" fill="#FFD700" />;
      case 'pro':
        return <Crown size={28} color="#9333EA" fill="#9333EA" />;
      default:
        return null;
    }
  };

  // Get tier color
  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'premium':
        return '#FFD700';
      case 'pro':
        return '#9333EA';
      default:
        return theme.colors.text.muted;
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background.gray }}>
        <Stack.Screen
          options={{
            title: 'Subscription Plans',
            headerStyle: { backgroundColor: theme.colors.background.white },
            headerTintColor: theme.colors.text.primary,
          }}
        />
        <ActivityIndicator size="large" color={theme.colors.primary.turquoise} />
        <Text className="mt-4 text-base" style={{ color: theme.colors.text.muted }}>
          Loading subscription plans...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background.gray }}>
      <Stack.Screen
        options={{
          title: 'Subscription Plans',
          headerStyle: { backgroundColor: theme.colors.background.white },
          headerTintColor: theme.colors.text.primary,
          headerShadowVisible: false,
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-6 pt-6 pb-4" style={{ backgroundColor: theme.colors.background.white }}>
          <View className="items-center mb-4">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: theme.colors.primary.turquoise + '20' }}
            >
              <Sparkles size={40} color={theme.colors.primary.turquoise} />
            </View>
            <Text
              className="text-2xl font-bold text-center mb-2"
              style={{ color: theme.colors.text.primary }}
            >
              Unlock Your Full Potential
            </Text>
            <Text
              className="text-base text-center"
              style={{ color: theme.colors.text.muted }}
            >
              Get unlimited access to all lessons, AI coaching, and advanced features
            </Text>
          </View>

          {/* Current Tier Badge */}
          {subscriptionTier !== 'free' && (
            <View
              className="mt-2 p-3 rounded-lg flex-row items-center justify-center"
              style={{ backgroundColor: getTierColor(subscriptionTier) + '20' }}
            >
              <Shield size={20} color={getTierColor(subscriptionTier)} />
              <Text
                className="ml-2 text-sm font-semibold"
                style={{ color: getTierColor(subscriptionTier) }}
              >
                Current Plan: {subscriptionTier.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Subscription Plans */}
        <View className="px-4 py-6">
          {availablePlans.map((plan, index) => {
            const isSelected = selectedPlan?.id === plan.id;
            const isCurrentTier = subscriptionTier === plan.tier;
            const tierColor = getTierColor(plan.tier);

            return (
              <TouchableOpacity
                key={plan.id}
                className="mb-4 rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: theme.colors.background.white,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? theme.colors.primary.turquoise : theme.colors.ui.border,
                }}
                onPress={() => handleSelectPlan(plan)}
                disabled={isCurrentTier}
                activeOpacity={0.7}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <View
                    className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg z-10"
                    style={{ backgroundColor: theme.colors.primary.turquoise }}
                  >
                    <Text className="text-xs font-bold text-white">MOST POPULAR</Text>
                  </View>
                )}

                {/* Current Plan Badge */}
                {isCurrentTier && (
                  <View
                    className="absolute top-0 left-0 right-0 px-4 py-2"
                    style={{ backgroundColor: tierColor + '20' }}
                  >
                    <Text
                      className="text-xs font-bold text-center"
                      style={{ color: tierColor }}
                    >
                      CURRENT PLAN
                    </Text>
                  </View>
                )}

                <View className={`p-4 ${isCurrentTier ? 'pt-12' : 'pt-4'}`}>
                  {/* Plan Header */}
                  <View className="flex-row items-center mb-3">
                    {getTierIcon(plan.tier)}
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-xl font-bold"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {plan.name}
                      </Text>
                      <Text className="text-sm" style={{ color: theme.colors.text.muted }}>
                        {plan.description}
                      </Text>
                    </View>
                  </View>

                  {/* Pricing */}
                  <View className="flex-row items-baseline mb-3">
                    <Text
                      className="text-3xl font-bold"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {plan.priceString}
                    </Text>
                    <Text className="ml-1 text-base" style={{ color: theme.colors.text.muted }}>
                      /{plan.period === 'monthly' ? 'month' : 'year'}
                    </Text>
                  </View>

                  {/* Savings Badge */}
                  {plan.savings && (
                    <View
                      className="mb-3 px-3 py-1 rounded-full self-start"
                      style={{ backgroundColor: theme.colors.accent.success + '20' }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: theme.colors.accent.success }}
                      >
                        {plan.savings}
                      </Text>
                    </View>
                  )}

                  {/* Features */}
                  <View className="mt-2">
                    {plan.features.map((feature, idx) => (
                      <View key={idx} className="flex-row items-center mb-2">
                        <Check size={18} color={theme.colors.accent.success} />
                        <Text
                          className="ml-2 text-sm flex-1"
                          style={{ color: theme.colors.text.primary }}
                        >
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Features Comparison */}
        <View className="px-4 pb-32">
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: theme.colors.text.primary }}
          >
            Why Subscribe?
          </Text>

          {[
            {
              icon: <Zap size={24} color={theme.colors.primary.turquoise} />,
              title: 'Unlimited Learning',
              description: 'Access all lessons and dryland exercises without restrictions',
            },
            {
              icon: <Sparkles size={24} color={theme.colors.primary.turquoise} />,
              title: 'AI-Powered Coaching',
              description: 'Get personalized feedback and coaching from our AI assistant',
            },
            {
              icon: <Shield size={24} color={theme.colors.primary.turquoise} />,
              title: 'Advanced Analytics',
              description: 'Track your progress with detailed reports and insights',
            },
          ].map((benefit, index) => (
            <View
              key={index}
              className="mb-3 p-4 rounded-xl flex-row items-center"
              style={{ backgroundColor: theme.colors.background.white }}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.colors.primary.turquoise + '20' }}
              >
                {benefit.icon}
              </View>
              <View className="flex-1 ml-4">
                <Text
                  className="text-base font-semibold mb-1"
                  style={{ color: theme.colors.text.primary }}
                >
                  {benefit.title}
                </Text>
                <Text className="text-sm" style={{ color: theme.colors.text.muted }}>
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t"
        style={{
          backgroundColor: theme.colors.background.white,
          borderTopColor: theme.colors.ui.border,
        }}
      >
        <TouchableOpacity
          className="py-4 rounded-xl flex-row items-center justify-center mb-3"
          style={{
            backgroundColor: selectedPlan
              ? theme.colors.primary.turquoise
              : theme.colors.ui.border,
          }}
          onPress={handlePurchase}
          disabled={!selectedPlan || isPurchasing || isRestoring}
          activeOpacity={0.7}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text className="text-white text-base font-bold mr-2">
                {selectedPlan ? `Subscribe to ${selectedPlan.name}` : 'Select a Plan'}
              </Text>
              {selectedPlan && <ChevronRight size={20} color="#FFFFFF" />}
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="py-2 items-center"
          onPress={handleRestore}
          disabled={isPurchasing || isRestoring}
        >
          {isRestoring ? (
            <ActivityIndicator size="small" color={theme.colors.text.muted} />
          ) : (
            <Text className="text-sm" style={{ color: theme.colors.text.muted }}>
              Restore Previous Purchases
            </Text>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text className="text-xs text-center mt-2" style={{ color: theme.colors.text.muted }}>
          Subscriptions auto-renew unless cancelled 24 hours before the end of the current period
        </Text>
      </View>
    </View>
  );
}
