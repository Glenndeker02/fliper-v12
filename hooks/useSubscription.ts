// useSubscription Hook
// Manages subscription state and provides subscription-related functionality

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  initializePurchases,
  getCurrentSubscriptionTier,
  getSubscriptionStatus,
  getSubscriptionPlans,
  purchaseSubscription,
  restorePurchases,
  getUserSubscription,
  refreshSubscriptionStatus,
} from '@/utils/purchases';
import {
  SubscriptionTier,
  SubscriptionStatus,
  SubscriptionPlan,
  UserSubscription,
} from '@/constants/subscriptionTypes';
import { getCurrentUser } from '@/utils/supabase';
import { PurchasesPackage } from 'react-native-purchases';

interface UseSubscriptionReturn {
  // Subscription data
  subscription: UserSubscription | null;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  availablePlans: SubscriptionPlan[];

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  purchasePlan: (plan: SubscriptionPlan) => Promise<{
    success: boolean;
    error?: string;
  }>;
  restoreSubscription: () => Promise<{ success: boolean; error?: string }>;
  refreshStatus: () => Promise<void>;

  // Mutations
  isPurchasing: boolean;
  isRestoring: boolean;
}

/**
 * Custom hook for managing user subscriptions
 */
export const useSubscription = (): UseSubscriptionReturn => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Initialize RevenueCat on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.id) {
          setCurrentUserId(user.id);
          await initializePurchases(user.id);
          setIsInitialized(true);
          console.log('[useSubscription] Initialized successfully');
        }
      } catch (error) {
        console.error('[useSubscription] Initialization error:', error);
      }
    };

    initialize();
  }, []);

  // Fetch user subscription from database
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ['user-subscription', currentUserId],
    queryFn: () => (currentUserId ? getUserSubscription(currentUserId) : null),
    enabled: !!currentUserId && isInitialized,
    staleTime: 30000, // 30 seconds
  });

  // Fetch subscription tier from RevenueCat
  const {
    data: subscriptionTier = 'free',
    isLoading: isLoadingTier,
  } = useQuery({
    queryKey: ['subscription-tier'],
    queryFn: getCurrentSubscriptionTier,
    enabled: isInitialized,
    staleTime: 30000,
  });

  // Fetch subscription status from RevenueCat
  const {
    data: subscriptionStatus = 'none',
    isLoading: isLoadingStatus,
  } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: getSubscriptionStatus,
    enabled: isInitialized,
    staleTime: 30000,
  });

  // Fetch available subscription plans
  const {
    data: availablePlans = [],
    isLoading: isLoadingPlans,
  } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: getSubscriptionPlans,
    enabled: isInitialized,
    staleTime: 300000, // 5 minutes
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (rcPackage: PurchasesPackage) => {
      const result = await purchaseSubscription(rcPackage);
      if (!result.success) {
        throw new Error(result.error || 'Purchase failed');
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate all subscription-related queries
      queryClient.invalidateQueries({ queryKey: ['subscription-tier'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      console.log('[useSubscription] Purchase successful');
    },
    onError: (error) => {
      console.error('[useSubscription] Purchase error:', error);
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async () => {
      const result = await restorePurchases();
      if (!result.success) {
        throw new Error(result.error || 'Restore failed');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-tier'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      console.log('[useSubscription] Restore successful');
    },
    onError: (error) => {
      console.error('[useSubscription] Restore error:', error);
    },
  });

  // Purchase plan action
  const purchasePlan = useCallback(
    async (plan: SubscriptionPlan): Promise<{ success: boolean; error?: string }> => {
      try {
        if (!plan.revenueCatPackage) {
          return { success: false, error: 'Invalid subscription package' };
        }

        await purchaseMutation.mutateAsync(plan.revenueCatPackage);
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to purchase subscription',
        };
      }
    },
    [purchaseMutation]
  );

  // Restore subscription action
  const restoreSubscription = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      await restoreMutation.mutateAsync();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to restore purchases',
      };
    }
  }, [restoreMutation]);

  // Refresh status action
  const refreshStatus = useCallback(async (): Promise<void> => {
    try {
      await refreshSubscriptionStatus();
      await refetchSubscription();
      queryClient.invalidateQueries({ queryKey: ['subscription-tier'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
    } catch (error) {
      console.error('[useSubscription] Error refreshing status:', error);
    }
  }, [queryClient, refetchSubscription]);

  const isLoading =
    isLoadingSubscription || isLoadingTier || isLoadingStatus || isLoadingPlans;

  return {
    subscription,
    subscriptionTier,
    subscriptionStatus,
    availablePlans,
    isLoading,
    isInitialized,
    purchasePlan,
    restoreSubscription,
    refreshStatus,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
};

export default useSubscription;
