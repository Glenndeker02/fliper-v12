import { useRouter } from 'expo-router';
import { ArrowLeft, Search, ShoppingCart, Star, Heart } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

type Product = {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  favorite: boolean;
};

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Pro Swim Goggles',
    price: 29.99,
    rating: 4.8,
    image: '',
    category: 'Goggles',
    favorite: false,
  },
  {
    id: '2',
    name: 'Training Fins',
    price: 45.99,
    rating: 4.6,
    image: '',
    category: 'Accessories',
    favorite: true,
  },
  {
    id: '3',
    name: 'Swim Cap',
    price: 12.99,
    rating: 4.3,
    image: '',
    category: 'Accessories',
    favorite: false,
  },
  {
    id: '4',
    name: 'Water Bottle',
    price: 19.99,
    rating: 4.7,
    image: '',
    category: 'Gear',
    favorite: false,
  },
  {
    id: '5',
    name: 'Swim Shorts',
    price: 34.99,
    rating: 4.5,
    image: '',
    category: 'Clothing',
    favorite: true,
  },
  {
    id: '6',
    name: 'Kickboard',
    price: 15.99,
    rating: 4.2,
    image: '',
    category: 'Training',
    favorite: false,
  },
];

export default function MarketplaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(
    mockProducts.filter(p => p.favorite).map(p => p.id)
  );

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            placeholder="Search gear, goggles, accessories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.light}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Gear</Text>
            <View style={styles.productsGrid}>
              {filteredProducts.map(product => (
                <View key={product.id} style={styles.productCard}>
                  <Pressable 
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(product.id)}
                  >
                    <Heart 
                      size={20} 
                      color={favorites.includes(product.id) ? Colors.accent.error : Colors.text.light} 
                      fill={favorites.includes(product.id) ? Colors.accent.error : 'none'} 
                    />
                  </Pressable>
                  <View style={styles.productImagePlaceholder} />
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.productInfo}>
                    <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                    <View style={styles.ratingContainer}>
                      <Star size={14} color={Colors.accent.warning} fill={Colors.accent.warning} />
                      <Text style={styles.ratingText}>{product.rating}</Text>
                    </View>
                  </View>
                  <Pressable style={styles.addToCartButton}>
                    <ShoppingCart size={16} color={Colors.text.white} />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
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
});