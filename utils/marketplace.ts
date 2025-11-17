// Marketplace API Utilities
// Swimming gear marketplace with Amazon/eBay integration

import { supabase } from './supabase';

/**
 * Product Category Types
 */
export type ProductCategory =
  | 'goggles'
  | 'swimwear'
  | 'caps'
  | 'fins'
  | 'kickboards'
  | 'pull-buoys'
  | 'paddles'
  | 'snorkels'
  | 'gear-bags'
  | 'accessories'
  | 'training-aids'
  | 'safety-equipment';

export type ProductSource = 'amazon' | 'ebay' | 'custom';

/**
 * Product Interface
 */
export interface MarketplaceProduct {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
  category: ProductCategory;
  sub_category?: string;
  brand?: string;
  source: ProductSource;
  external_product_id?: string;
  affiliate_link: string;
  product_url: string;
  price_min?: number;
  price_max?: number;
  currency: string;
  image_url?: string;
  images?: string[];
  rating?: number;
  review_count?: number;
  is_featured: boolean;
  is_active: boolean;
  priority: number;
  keywords?: string[];
  tags?: string[];
  recommended_for_skill_level?: string[];
  recommended_for_category?: string[];
  is_favorited?: boolean;
}

/**
 * User Favorite
 */
export interface ProductFavorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  notes?: string;
}

/**
 * Product Review
 */
export interface ProductReview {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  rating: number;
  title?: string;
  review: string;
  verified_purchase: boolean;
  helpful_count: number;
  is_flagged: boolean;
  is_approved: boolean;
  user_profiles?: {
    name: string;
    avatar_url?: string;
  };
}

/**
 * Get featured products
 */
export const getFeaturedProducts = async (
  limit: number = 10
): Promise<MarketplaceProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Marketplace] Error fetching featured products:', error);
    return [];
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (
  category: ProductCategory,
  limit: number = 20,
  offset: number = 0,
  userId?: string
): Promise<MarketplaceProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Check if user has favorited
    if (userId && data) {
      const productIds = data.map((p) => p.id);
      const { data: favorites } = await supabase
        .from('marketplace_favorites')
        .select('product_id')
        .eq('user_id', userId)
        .in('product_id', productIds);

      const favoritedIds = new Set(favorites?.map((f) => f.product_id) || []);

      return data.map((product) => ({
        ...product,
        is_favorited: favoritedIds.has(product.id),
      }));
    }

    return data || [];
  } catch (error) {
    console.error('[Marketplace] Error fetching products by category:', error);
    return [];
  }
};

/**
 * Search products
 */
export const searchProducts = async (
  query: string,
  category?: ProductCategory,
  limit: number = 20
): Promise<MarketplaceProduct[]> => {
  try {
    let dbQuery = supabase
      .from('marketplace_products')
      .select('*')
      .eq('is_active', true);

    // Add category filter
    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    // Search in title, description, brand, and keywords
    dbQuery = dbQuery.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`
    );

    dbQuery = dbQuery.order('rating', { ascending: false }).limit(limit);

    const { data, error } = await dbQuery;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Marketplace] Error searching products:', error);
    return [];
  }
};

/**
 * Get recommended products for skill level
 */
export const getRecommendedProducts = async (
  skillLevel: string,
  limit: number = 10,
  userId?: string
): Promise<MarketplaceProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select('*')
      .eq('is_active', true)
      .contains('recommended_for_skill_level', [skillLevel])
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Check if user has favorited
    if (userId && data) {
      const productIds = data.map((p) => p.id);
      const { data: favorites } = await supabase
        .from('marketplace_favorites')
        .select('product_id')
        .eq('user_id', userId)
        .in('product_id', productIds);

      const favoritedIds = new Set(favorites?.map((f) => f.product_id) || []);

      return data.map((product) => ({
        ...product,
        is_favorited: favoritedIds.has(product.id),
      }));
    }

    return data || [];
  } catch (error) {
    console.error('[Marketplace] Error fetching recommended products:', error);
    return [];
  }
};

/**
 * Get user's favorite products
 */
export const getUserFavorites = async (userId: string): Promise<MarketplaceProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_favorites')
      .select('product_id, marketplace_products(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (
      data?.map((fav: any) => ({
        ...fav.marketplace_products,
        is_favorited: true,
      })) || []
    );
  } catch (error) {
    console.error('[Marketplace] Error fetching user favorites:', error);
    return [];
  }
};

/**
 * Toggle product favorite
 */
export const toggleProductFavorite = async (
  productId: string,
  userId: string
): Promise<{ success: boolean; isFavorited: boolean }> => {
  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from('marketplace_favorites')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from('marketplace_favorites')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;
      return { success: true, isFavorited: false };
    } else {
      // Add favorite
      const { error } = await supabase
        .from('marketplace_favorites')
        .insert({ product_id: productId, user_id: userId });

      if (error) throw error;
      return { success: true, isFavorited: true };
    }
  } catch (error) {
    console.error('[Marketplace] Error toggling favorite:', error);
    return { success: false, isFavorited: false };
  }
};

/**
 * Track product click
 */
export const trackProductClick = async (
  productId: string,
  clickedLink: string,
  userId?: string,
  sourcePage?: string
): Promise<void> => {
  try {
    await supabase.from('marketplace_clicks').insert({
      product_id: productId,
      user_id: userId,
      clicked_link: clickedLink,
      source_page: sourcePage,
    });
  } catch (error) {
    console.error('[Marketplace] Error tracking click:', error);
  }
};

/**
 * Get product reviews
 */
export const getProductReviews = async (
  productId: string,
  limit: number = 20
): Promise<ProductReview[]> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_reviews')
      .select('*, user_profiles(name, avatar_url)')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Marketplace] Error fetching reviews:', error);
    return [];
  }
};

/**
 * Create product review
 */
export const createProductReview = async (review: {
  user_id: string;
  product_id: string;
  rating: number;
  title?: string;
  review: string;
  verified_purchase?: boolean;
}): Promise<ProductReview | null> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_reviews')
      .insert({
        ...review,
        verified_purchase: review.verified_purchase || false,
      })
      .select('*, user_profiles(name, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Marketplace] Error creating review:', error);
    return null;
  }
};

/**
 * Get all categories with product counts
 */
export const getCategoriesWithCounts = async (): Promise<
  { category: ProductCategory; count: number }[]
> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select('category')
      .eq('is_active', true);

    if (error) throw error;

    // Count products per category
    const counts = data?.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<ProductCategory, number>);

    return Object.entries(counts || {}).map(([category, count]) => ({
      category: category as ProductCategory,
      count,
    }));
  } catch (error) {
    console.error('[Marketplace] Error fetching category counts:', error);
    return [];
  }
};

/**
 * Generate Amazon affiliate link
 */
export const generateAmazonLink = (productId: string, affiliateTag: string): string => {
  return `https://www.amazon.com/dp/${productId}?tag=${affiliateTag}`;
};

/**
 * Generate eBay affiliate link
 */
export const generateEbayLink = (itemId: string, campaignId: string): string => {
  return `https://www.ebay.com/itm/${itemId}?mkcid=${campaignId}`;
};

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<ProductCategory, string> = {
  goggles: 'Goggles',
  swimwear: 'Swimwear',
  caps: 'Swim Caps',
  fins: 'Fins',
  kickboards: 'Kickboards',
  'pull-buoys': 'Pull Buoys',
  paddles: 'Hand Paddles',
  snorkels: 'Snorkels',
  'gear-bags': 'Gear Bags',
  accessories: 'Accessories',
  'training-aids': 'Training Aids',
  'safety-equipment': 'Safety Equipment',
};

/**
 * Category icons (emoji for visual representation)
 */
export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  goggles: '🥽',
  swimwear: '🩱',
  caps: '🧢',
  fins: '🦶',
  kickboards: '🏄',
  'pull-buoys': '🎈',
  paddles: '🏓',
  snorkels: '🤿',
  'gear-bags': '🎒',
  accessories: '🛍️',
  'training-aids': '🎯',
  'safety-equipment': '🛟',
};

export default {
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getRecommendedProducts,
  getUserFavorites,
  toggleProductFavorite,
  trackProductClick,
  getProductReviews,
  createProductReview,
  getCategoriesWithCounts,
  generateAmazonLink,
  generateEbayLink,
  CATEGORY_NAMES,
  CATEGORY_ICONS,
};
