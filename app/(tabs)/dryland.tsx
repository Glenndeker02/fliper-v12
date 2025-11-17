import { useRouter } from 'expo-router';
import { Search, Filter } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
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
import { DRYLAND_EXERCISES } from '@/constants/mockData';
import FloatingJournalButton from '@/components/FloatingJournalButton';

export default function DrylandScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'simulation', label: 'Simulation' },
    { id: 'strength', label: 'Strength' },
    { id: 'flexibility', label: 'Flexibility' },
    { id: 'breathing', label: 'Breathing' },
    { id: 'balance', label: 'Balance' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>Dryland Training</Text>
          <Text style={styles.subtitle}>
            Build strength and technique outside the pool
          </Text>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={Colors.text.light} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={Colors.text.light}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Pressable style={styles.filterButton}>
              <Filter size={20} color={Colors.text.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.filtersRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.filterChip,
                  category.id === 'all' && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    category.id === 'all' && styles.filterChipTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.exercisesGrid}>
            {DRYLAND_EXERCISES.map((exercise) => (
              <Pressable
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => router.push(`/dryland/${exercise.id}`)}
              >
                <Image
                  source={{ uri: exercise.thumbnailUrl }}
                  style={styles.exerciseImage}
                  resizeMode="cover"
                />
                <View style={styles.exerciseContent}>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {exercise.category.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>
                        {'⭐'.repeat(
                          exercise.difficulty === 'beginner'
                            ? 1
                            : exercise.difficulty === 'intermediate'
                            ? 2
                            : 3
                        )}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  <View style={styles.exerciseMeta}>
                    <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                    <Text style={styles.exerciseMuscles}>
                      {exercise.targetedMuscles.join(', ')}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Dryland Training Tips</Text>
            <Text style={styles.infoText}>
              • Practice 2-3 times per week for best results{'\n'}
              • Focus on proper form over speed{'\n'}
              • Warm up before starting exercises{'\n'}
              • Stay hydrated throughout your workout
            </Text>
          </View>
        </ScrollView>
        <FloatingJournalButton />
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
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filtersRow: {
    marginBottom: 24,
  },
  filtersScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: Colors.accent.black,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  filterChipTextActive: {
    color: Colors.text.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  exercisesGrid: {
    gap: 16,
    marginBottom: 32,
  },
  exerciseCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  exerciseImage: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.background.light,
  },
  exerciseContent: {
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.accent.black,
    letterSpacing: 0.5,
  },
  difficultyBadge: {
    flexDirection: 'row',
  },
  difficultyText: {
    fontSize: 12,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  exerciseMeta: {
    gap: 4,
  },
  exerciseDuration: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  exerciseMuscles: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.text.light,
  },
  infoCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.black,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
});
