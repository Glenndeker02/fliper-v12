// useFeatureAccess Hook
// Provides feature gating and access control based on subscription tier

import { useCallback } from 'react';
import {
  FeatureAccess,
  FEATURE_ACCESS,
  hasFeatureAccess as checkFeatureAccess,
  SubscriptionTier,
} from '@/constants/subscriptionTypes';
import { useSubscription } from './useSubscription';

interface UseFeatureAccessReturn {
  // Current tier
  tier: SubscriptionTier;

  // Feature access checks
  hasAccess: (feature: keyof FeatureAccess) => boolean;
  getFeatureLimit: (feature: keyof FeatureAccess) => boolean | number;
  canAccessLesson: (lessonType: 'basic' | 'advanced' | 'all') => boolean;
  canAccessDryland: (drylandType: 'basic' | 'advanced' | 'custom') => boolean;
  canAccessAIFeature: (aiFeature: 'feedback' | 'coaching' | 'analysis') => boolean;
  canCreatePost: (currentPostsToday: number) => boolean;
  canCreateJournalEntry: (currentEntriesThisMonth: number) => boolean;

  // Subscription status
  isPremium: boolean;
  isPro: boolean;
  isFree: boolean;

  // Loading state
  isLoading: boolean;
}

/**
 * Custom hook for checking feature access based on subscription tier
 */
export const useFeatureAccess = (): UseFeatureAccessReturn => {
  const { subscriptionTier, isLoading } = useSubscription();

  // Check if user has access to a specific feature
  const hasAccess = useCallback(
    (feature: keyof FeatureAccess): boolean => {
      const access = checkFeatureAccess(subscriptionTier, feature);
      return typeof access === 'boolean' ? access : false;
    },
    [subscriptionTier]
  );

  // Get feature limit (returns boolean for boolean features, number for limited features)
  const getFeatureLimit = useCallback(
    (feature: keyof FeatureAccess): boolean | number => {
      return checkFeatureAccess(subscriptionTier, feature);
    },
    [subscriptionTier]
  );

  // Check lesson access
  const canAccessLesson = useCallback(
    (lessonType: 'basic' | 'advanced' | 'all'): boolean => {
      if (lessonType === 'basic') return hasAccess('basicLessons');
      if (lessonType === 'advanced') return hasAccess('advancedLessons');
      if (lessonType === 'all') return hasAccess('allLessons');
      return false;
    },
    [hasAccess]
  );

  // Check dryland access
  const canAccessDryland = useCallback(
    (drylandType: 'basic' | 'advanced' | 'custom'): boolean => {
      if (drylandType === 'basic') return hasAccess('basicDryland');
      if (drylandType === 'advanced') return hasAccess('advancedDryland');
      if (drylandType === 'custom') return hasAccess('customDryland');
      return false;
    },
    [hasAccess]
  );

  // Check AI feature access
  const canAccessAIFeature = useCallback(
    (aiFeature: 'feedback' | 'coaching' | 'analysis'): boolean => {
      if (aiFeature === 'feedback') return hasAccess('aiFeedback');
      if (aiFeature === 'coaching') return hasAccess('aiCoaching');
      if (aiFeature === 'analysis') return hasAccess('aiAnalysis');
      return false;
    },
    [hasAccess]
  );

  // Check if user can create a post (based on daily limit)
  const canCreatePost = useCallback(
    (currentPostsToday: number): boolean => {
      const limit = getFeatureLimit('communityPostsPerDay');
      if (typeof limit === 'number') {
        if (limit === -1) return true; // unlimited
        return currentPostsToday < limit;
      }
      return false;
    },
    [getFeatureLimit]
  );

  // Check if user can create a journal entry (based on monthly limit)
  const canCreateJournalEntry = useCallback(
    (currentEntriesThisMonth: number): boolean => {
      const limit = getFeatureLimit('journalEntriesPerMonth');
      if (typeof limit === 'number') {
        if (limit === -1) return true; // unlimited
        return currentEntriesThisMonth < limit;
      }
      return false;
    },
    [getFeatureLimit]
  );

  // Tier checks
  const isPremium = subscriptionTier === 'premium';
  const isPro = subscriptionTier === 'pro';
  const isFree = subscriptionTier === 'free';

  return {
    tier: subscriptionTier,
    hasAccess,
    getFeatureLimit,
    canAccessLesson,
    canAccessDryland,
    canAccessAIFeature,
    canCreatePost,
    canCreateJournalEntry,
    isPremium,
    isPro,
    isFree,
    isLoading,
  };
};

/**
 * Helper component for feature gating
 * Renders children only if user has access to the feature
 */
export const FeatureGate = ({
  feature,
  tier,
  fallback = null,
  children,
}: {
  feature: keyof FeatureAccess;
  tier: SubscriptionTier;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}): React.ReactNode => {
  const access = checkFeatureAccess(tier, feature);
  const hasAccess = typeof access === 'boolean' ? access : false;

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

export default useFeatureAccess;
