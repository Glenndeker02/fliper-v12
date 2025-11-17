// RevenueCat Purchases Utility
// This file handles all RevenueCat SDK integration for subscriptions and purchases

import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  PurchasesStoreProduct,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import {
  REVENUECAT_CONFIG,
  SubscriptionTier,
  SubscriptionStatus,
  getTierFromEntitlement,
  UserSubscription,
  SubscriptionPlan,
  SUBSCRIPTION_PLANS,
} from '@/constants/subscriptionTypes';
import { supabase } from './supabase';

/**
 * Initialize RevenueCat SDK
 * Should be called once when app starts
 */
export const initializePurchases = async (userId: string): Promise<void> => {
  try {
    const apiKey =
      Platform.OS === 'ios'
        ? REVENUECAT_CONFIG.IOS_API_KEY
        : REVENUECAT_CONFIG.ANDROID_API_KEY;

    await Purchases.configure({
      apiKey,
      appUserID: userId,
    });

    console.log('[Purchases] RevenueCat initialized for user:', userId);
  } catch (error) {
    console.error('[Purchases] Error initializing RevenueCat:', error);
    throw error;
  }
};

/**
 * Get current customer info from RevenueCat
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('[Purchases] Error getting customer info:', error);
    return null;
  }
};

/**
 * Get current subscription tier based on RevenueCat entitlements
 */
export const getCurrentSubscriptionTier = async (): Promise<SubscriptionTier> => {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return 'free';

    const { entitlements } = customerInfo;

    // Check for Pro entitlement first
    if (
      entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_IDS.PRO] !== undefined
    ) {
      return 'pro';
    }

    // Check for Premium entitlement
    if (
      entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_IDS.PREMIUM] !== undefined
    ) {
      return 'premium';
    }

    return 'free';
  } catch (error) {
    console.error('[Purchases] Error getting subscription tier:', error);
    return 'free';
  }
};

/**
 * Get subscription status
 */
export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return 'none';

    const { entitlements } = customerInfo;
    const activeEntitlements = Object.keys(entitlements.active);

    if (activeEntitlements.length === 0) {
      return 'none';
    }

    // Check if in trial period
    const entitlement = entitlements.active[activeEntitlements[0]];
    if (entitlement?.periodType === 'trial') {
      return 'in_trial';
    }

    // Check if will renew
    if (entitlement?.willRenew) {
      return 'active';
    }

    // Check if expired
    const expirationDate = entitlement?.expirationDate;
    if (expirationDate) {
      const now = new Date();
      const expiration = new Date(expirationDate);
      if (expiration < now) {
        return 'expired';
      }
    }

    return 'active';
  } catch (error) {
    console.error('[Purchases] Error getting subscription status:', error);
    return 'none';
  }
};

/**
 * Get available offerings from RevenueCat
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null) {
      return offerings.current;
    }
    return null;
  } catch (error) {
    console.error('[Purchases] Error getting offerings:', error);
    return null;
  }
};

/**
 * Get subscription plans with RevenueCat packages attached
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const offering = await getOfferings();
    if (!offering) {
      return SUBSCRIPTION_PLANS.map((plan) => ({ ...plan }));
    }

    // Map RevenueCat packages to our subscription plans
    const plansWithPackages: SubscriptionPlan[] = SUBSCRIPTION_PLANS.map((plan) => {
      const rcPackage = offering.availablePackages.find(
        (pkg) => pkg.product.identifier === REVENUECAT_CONFIG.PRODUCT_IDS[
          plan.id.toUpperCase().replace('_', '_') as keyof typeof REVENUECAT_CONFIG.PRODUCT_IDS
        ]
      );

      if (rcPackage) {
        return {
          ...plan,
          price: rcPackage.product.price,
          priceString: rcPackage.product.priceString,
          currency: rcPackage.product.currencyCode,
          revenueCatPackage: rcPackage,
        };
      }

      return { ...plan };
    });

    return plansWithPackages;
  } catch (error) {
    console.error('[Purchases] Error getting subscription plans:', error);
    return SUBSCRIPTION_PLANS.map((plan) => ({ ...plan }));
  }
};

/**
 * Purchase a subscription package
 */
export const purchaseSubscription = async (
  rcPackage: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(rcPackage);

    // Sync subscription to Supabase
    await syncSubscriptionToDatabase(customerInfo);

    return { success: true, customerInfo };
  } catch (error: any) {
    console.error('[Purchases] Error purchasing subscription:', error);

    // User cancelled
    if (error.userCancelled) {
      return { success: false, error: 'Purchase cancelled' };
    }

    return { success: false, error: error.message || 'Purchase failed' };
  }
};

/**
 * Restore purchases
 */
export const restorePurchases = async (): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> => {
  try {
    const customerInfo = await Purchases.restorePurchases();

    // Sync subscription to Supabase
    await syncSubscriptionToDatabase(customerInfo);

    return { success: true, customerInfo };
  } catch (error: any) {
    console.error('[Purchases] Error restoring purchases:', error);
    return { success: false, error: error.message || 'Restore failed' };
  }
};

/**
 * Sync subscription data from RevenueCat to Supabase database
 */
export const syncSubscriptionToDatabase = async (
  customerInfo: CustomerInfo
): Promise<void> => {
  try {
    const { originalAppUserId, entitlements } = customerInfo;

    // Get active entitlement
    const activeEntitlements = Object.keys(entitlements.active);
    const entitlementId = activeEntitlements.length > 0 ? activeEntitlements[0] : null;

    // Determine tier and status
    const tier = getTierFromEntitlement(entitlementId);
    const status = await getSubscriptionStatus();

    // Get expiration date
    let expiresAt = null;
    if (entitlementId && entitlements.active[entitlementId]) {
      const expiration = entitlements.active[entitlementId]?.expirationDate;
      if (expiration) {
        expiresAt = new Date(expiration).toISOString();
      }
    }

    // Determine period
    let period: 'monthly' | 'yearly' | null = null;
    if (entitlementId && entitlements.active[entitlementId]) {
      const identifier = entitlements.active[entitlementId]?.productIdentifier;
      if (identifier?.includes('monthly')) period = 'monthly';
      if (identifier?.includes('yearly')) period = 'yearly';
    }

    // Upsert to database
    const { error } = await supabase.from('user_subscriptions').upsert(
      {
        user_id: originalAppUserId,
        subscription_tier: tier,
        subscription_status: status,
        subscription_period: period,
        expires_at: expiresAt,
        revenue_cat_user_id: originalAppUserId,
        revenue_cat_entitlement_id: entitlementId,
        started_at: tier !== 'free' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error) throw error;

    console.log('[Purchases] Subscription synced to database:', tier, status);
  } catch (error) {
    console.error('[Purchases] Error syncing subscription to database:', error);
  }
};

/**
 * Check if user has active subscription
 */
export const hasActiveSubscription = async (): Promise<boolean> => {
  try {
    const tier = await getCurrentSubscriptionTier();
    return tier === 'premium' || tier === 'pro';
  } catch (error) {
    console.error('[Purchases] Error checking active subscription:', error);
    return false;
  }
};

/**
 * Get user subscription from database
 */
export const getUserSubscription = async (
  userId: string
): Promise<UserSubscription | null> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no subscription record exists, create a free tier one
      if (error.code === 'PGRST116') {
        const { data: newSub, error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            subscription_tier: 'free',
            subscription_status: 'none',
            revenue_cat_user_id: userId,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newSub;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Purchases] Error getting user subscription:', error);
    return null;
  }
};

/**
 * Refresh subscription status from RevenueCat
 */
export const refreshSubscriptionStatus = async (): Promise<void> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    if (customerInfo) {
      await syncSubscriptionToDatabase(customerInfo);
    }
  } catch (error) {
    console.error('[Purchases] Error refreshing subscription status:', error);
  }
};

export default {
  initializePurchases,
  getCustomerInfo,
  getCurrentSubscriptionTier,
  getSubscriptionStatus,
  getOfferings,
  getSubscriptionPlans,
  purchaseSubscription,
  restorePurchases,
  syncSubscriptionToDatabase,
  hasActiveSubscription,
  getUserSubscription,
  refreshSubscriptionStatus,
};
