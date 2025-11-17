import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Star,
  Heart,
  ExternalLink,
  X,
  ShoppingBag,
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import {
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  toggleProductFavorite,
  trackProductClick,
  MarketplaceProduct,
  ProductCategory,
  CATEGORY_NAMES,
  CATEGORY_ICONS,
} from '@/utils/marketplace';
import { getCurrentUser } from '@/utils/supabase';

export default function MarketplaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  // Fetch featured products
  const {
    data: featuredProducts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => getFeaturedProducts(20),
    staleTime: 300000,
  });

  // Search query
  const {
    data: searchResults,
    isLoading: isSearching,
  } = useQuery({
    queryKey: ['search-products', searchQuery],
    queryFn: () => searchProducts(searchQuery),
    enabled: searchQuery.length > 2,
  });

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: ({ productId, userId }: { productId: string; userId: string }) =>
      toggleProductFavorite(productId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
    },
  });

  const toggleFavorite = (productId: string) => {
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please sign in to save favorites');
      return;
    }
    favoriteMutation.mutate({ productId, userId: currentUserId });
  };

  const handleProductClick = (product: MarketplaceProduct) => {
    // Track click
    if (currentUserId) {
      trackProductClick(product.id, product.affiliate_link, currentUserId, 'marketplace');
    }

    // Open external link
    Linking.openURL(product.product_url).catch(() => {
      Alert.alert('Error', 'Unable to open product link');
    });
  };

  const displayProducts = searchQuery.length > 2 ? searchResults : featuredProducts;
  const loading = searchQuery.length > 2 ? isSearching : isLoading;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search swimming gear from Amazon & eBay..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.light}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={20} color={Colors.text.secondary} />
            </Pressable>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary.turquoise}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary.turquoise} />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : !displayProducts || displayProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ShoppingBag size={64} color={Colors.text.light} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery.length > 2
                  ? 'Try a different search term'
                  : 'Check back soon for new products'}
              </Text>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {searchQuery.length > 2 ? `Search Results (${displayProducts.length})` : 'Featured Swimming Gear'}
              </Text>
              <View style={styles.productsGrid}>
                {displayProducts.map((product) => (
                  <Pressable
                    key={product.id}
                    style={styles.productCard}
                    onPress={() => handleProductClick(product)}
                  >
                    <Pressable
                      style={styles.favoriteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                    >
                      <Heart
                        size={20}
                        color={product.is_favorited ? Colors.accent.error : Colors.text.light}
                        fill={product.is_favorited ? Colors.accent.error : 'none'}
                      />
                    </Pressable>

                    {/* Source Badge */}
                    <View style={[
                      styles.sourceBadge,
                      { backgroundColor: product.source === 'amazon' ? '#FF9900' : '#E53238' }
                    ]}>
                      <Text style={styles.sourceBadgeText}>
                        {product.source === 'amazon' ? 'Amazon' : 'eBay'}
                      </Text>
                    </View>

                    {/* Product Image */}
                    {product.image_url ? (
                      <Image source={{ uri: product.image_url }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.productImagePlaceholder}>
                        <ShoppingBag size={32} color={Colors.text.light} />
                      </View>
                    )}

                    <Text style={styles.productName} numberOfLines={2}>{product.title}</Text>

                    {product.brand && (
                      <Text style={styles.productBrand} numberOfLines={1}>{product.brand}</Text>
                    )}

                    <View style={styles.productInfo}>
                      {product.price_min && (
                        <Text style={styles.productPrice}>
                          ${product.price_min.toFixed(2)}
                          {product.price_max && product.price_max !== product.price_min && (
                            <Text style={styles.productPriceRange}> - ${product.price_max.toFixed(2)}</Text>
                          )}
                        </Text>
                      )}
                      {product.rating && (
                        <View style={styles.ratingContainer}>
                          <Star size={14} color={Colors.accent.warning} fill={Colors.accent.warning} />
                          <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                        </View>
                      )}
                    </View>

                    <Pressable style={styles.viewProductButton} onPress={() => handleProductClick(product)}>
                      <ExternalLink size={16} color={Colors.text.white} />
                      <Text style={styles.viewProductText}>
                        View on {product.source === 'amazon' ? 'Amazon' : 'eBay'}
                      </Text>
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Info Banner */}
          {displayProducts && displayProducts.length > 0 && (
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerTitle}>🛒 Shopping Made Easy</Text>
              <Text style={styles.infoBannerText}>
                We partner with Amazon and eBay to bring you the best swimming gear at competitive prices.
                Click "View on Amazon/eBay" to purchase directly from trusted sellers.
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteButton: {
    alignSelf: 'flex-end',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent.black,
    borderRadius: 12,
    paddingVertical: 8,
    gap: 8,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.white,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  sourceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
  },
  sourceBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.text.white,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  productBrand: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  productPriceRange: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  viewProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.turquoise,
    borderRadius: 12,
    paddingVertical: 8,
    gap: 8,
  },
  viewProductText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.white,
  },
  infoBanner: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  infoBannerText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});