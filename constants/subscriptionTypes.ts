// Subscription Types and Constants for Payment & Subscriptions
// This file defines all subscription-related types, tiers, and features

import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

/**
 * Subscription Tier Types
 */
export type SubscriptionTier = 'free' | 'premium' | 'pro';

/**
 * Subscription Period
 */
export type SubscriptionPeriod = 'monthly' | 'yearly';

/**
 * Subscription Status
 */
export type SubscriptionStatus =
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'in_trial'
  | 'none';

/**
 * Subscription Plan Interface
 */
export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  period: SubscriptionPeriod;
  name: string;
  price: number;
  priceString: string;
  currency: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  savings?: string;
  revenueCatPackage?: PurchasesPackage;
}

/**
 * User Subscription Interface
 */
export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  subscription_period: SubscriptionPeriod | null;
  started_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
  revenue_cat_user_id: string;
  revenue_cat_entitlement_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Feature Access Map - Defines what features are available per tier
 */
export interface FeatureAccess {
  // Core Features
  basicLessons: boolean;
  advancedLessons: boolean;
  allLessons: boolean;

  // Dryland Features
  basicDryland: boolean;
  advancedDryland: boolean;
  customDryland: boolean;

  // AI Features
  aiFeedback: boolean;
  aiCoaching: boolean;
  aiAnalysis: boolean;

  // Community Features
  communityPosts: boolean;
  communityPostsPerDay: number;
  forumAccess: boolean;

  // Analytics
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  progressReports: boolean;

  // Journal
  journalEntries: boolean;
  journalEntriesPerMonth: number;
  voiceJournal: boolean;
  videoJournal: boolean;

  // Other Features
  offlineMode: boolean;
  adFree: boolean;
  prioritySupport: boolean;
  earlyAccess: boolean;
}

/**
 * Feature Access Configuration per Tier
 */
export const FEATURE_ACCESS: Record<SubscriptionTier, FeatureAccess> = {
  free: {
    basicLessons: true,
    advancedLessons: false,
    allLessons: false,
    basicDryland: true,
    advancedDryland: false,
    customDryland: false,
    aiFeedback: false,
    aiCoaching: false,
    aiAnalysis: false,
    communityPosts: true,
    communityPostsPerDay: 3,
    forumAccess: true,
    basicAnalytics: true,
    advancedAnalytics: false,
    progressReports: false,
    journalEntries: true,
    journalEntriesPerMonth: 10,
    voiceJournal: false,
    videoJournal: false,
    offlineMode: false,
    adFree: false,
    prioritySupport: false,
    earlyAccess: false,
  },
  premium: {
    basicLessons: true,
    advancedLessons: true,
    allLessons: true,
    basicDryland: true,
    advancedDryland: true,
    customDryland: false,
    aiFeedback: true,
    aiCoaching: true,
    aiAnalysis: false,
    communityPosts: true,
    communityPostsPerDay: 10,
    forumAccess: true,
    basicAnalytics: true,
    advancedAnalytics: true,
    progressReports: true,
    journalEntries: true,
    journalEntriesPerMonth: 50,
    voiceJournal: true,
    videoJournal: false,
    offlineMode: true,
    adFree: true,
    prioritySupport: false,
    earlyAccess: false,
  },
  pro: {
    basicLessons: true,
    advancedLessons: true,
    allLessons: true,
    basicDryland: true,
    advancedDryland: true,
    customDryland: true,
    aiFeedback: true,
    aiCoaching: true,
    aiAnalysis: true,
    communityPosts: true,
    communityPostsPerDay: -1, // unlimited
    forumAccess: true,
    basicAnalytics: true,
    advancedAnalytics: true,
    progressReports: true,
    journalEntries: true,
    journalEntriesPerMonth: -1, // unlimited
    voiceJournal: true,
    videoJournal: true,
    offlineMode: true,
    adFree: true,
    prioritySupport: true,
    earlyAccess: true,
  },
};

/**
 * Subscription Plan Configurations
 */
export const SUBSCRIPTION_PLANS: Omit<SubscriptionPlan, 'revenueCatPackage'>[] = [
  {
    id: 'premium_monthly',
    tier: 'premium',
    period: 'monthly',
    name: 'Premium Monthly',
    price: 9.99,
    priceString: '$9.99',
    currency: 'USD',
    description: 'Get full access to all premium features',
    features: [
      'All swimming lessons',
      'Advanced dryland routines',
      'AI-powered feedback',
      'Unlimited journal entries',
      'Offline mode',
      'Ad-free experience',
      'Advanced analytics',
    ],
    isPopular: false,
  },
  {
    id: 'premium_yearly',
    tier: 'premium',
    period: 'yearly',
    name: 'Premium Yearly',
    price: 79.99,
    priceString: '$79.99',
    currency: 'USD',
    description: 'Best value - Save 33% with annual billing',
    features: [
      'All swimming lessons',
      'Advanced dryland routines',
      'AI-powered feedback',
      'Unlimited journal entries',
      'Offline mode',
      'Ad-free experience',
      'Advanced analytics',
    ],
    isPopular: true,
    savings: 'Save $40/year',
  },
  {
    id: 'pro_monthly',
    tier: 'pro',
    period: 'monthly',
    name: 'Pro Monthly',
    price: 19.99,
    priceString: '$19.99',
    currency: 'USD',
    description: 'For serious swimmers who want the best',
    features: [
      'Everything in Premium',
      'Custom dryland builder',
      'Advanced AI analysis',
      'Video journal entries',
      'Priority support',
      'Early access to new features',
    ],
    isPopular: false,
  },
  {
    id: 'pro_yearly',
    tier: 'pro',
    period: 'yearly',
    name: 'Pro Yearly',
    price: 159.99,
    priceString: '$159.99',
    currency: 'USD',
    description: 'Ultimate swimming experience - Save 33%',
    features: [
      'Everything in Premium',
      'Custom dryland builder',
      'Advanced AI analysis',
      'Video journal entries',
      'Priority support',
      'Early access to new features',
    ],
    isPopular: false,
    savings: 'Save $80/year',
  },
];

/**
 * RevenueCat Configuration
 */
export const REVENUECAT_CONFIG = {
  // RevenueCat API Keys (these should be moved to environment variables in production)
  ANDROID_API_KEY: 'your_android_api_key_here',
  IOS_API_KEY: 'your_ios_api_key_here',

  // Entitlement IDs (configured in RevenueCat dashboard)
  ENTITLEMENT_IDS: {
    PREMIUM: 'premium',
    PRO: 'pro',
  },

  // Product IDs (configured in App Store Connect / Google Play Console)
  PRODUCT_IDS: {
    PREMIUM_MONTHLY: 'swimease_premium_monthly',
    PREMIUM_YEARLY: 'swimease_premium_yearly',
    PRO_MONTHLY: 'swimease_pro_monthly',
    PRO_YEARLY: 'swimease_pro_yearly',
  },
};

/**
 * Helper function to check if a feature is available for a given tier
 */
export const hasFeatureAccess = (
  tier: SubscriptionTier,
  feature: keyof FeatureAccess
): boolean | number => {
  return FEATURE_ACCESS[tier][feature];
};

/**
 * Helper function to get tier from entitlement
 */
export const getTierFromEntitlement = (entitlementId: string | null): SubscriptionTier => {
  if (!entitlementId) return 'free';
  if (entitlementId === REVENUECAT_CONFIG.ENTITLEMENT_IDS.PRO) return 'pro';
  if (entitlementId === REVENUECAT_CONFIG.ENTITLEMENT_IDS.PREMIUM) return 'premium';
  return 'free';
};

/**
 * Helper function to get subscription tier display name
 */
export const getSubscriptionTierName = (tier: SubscriptionTier): string => {
  const names: Record<SubscriptionTier, string> = {
    free: 'Free',
    premium: 'Premium',
    pro: 'Pro',
  };
  return names[tier];
};

/**
 * Helper function to get subscription status display name
 */
export const getSubscriptionStatusName = (status: SubscriptionStatus): string => {
  const names: Record<SubscriptionStatus, string> = {
    active: 'Active',
    expired: 'Expired',
    cancelled: 'Cancelled',
    in_trial: 'Trial',
    none: 'None',
  };
  return names[status];
};

export default {
  FEATURE_ACCESS,
  SUBSCRIPTION_PLANS,
  REVENUECAT_CONFIG,
  hasFeatureAccess,
  getTierFromEntitlement,
  getSubscriptionTierName,
  getSubscriptionStatusName,
};
