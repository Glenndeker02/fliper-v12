import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, TrendingUp, Zap, Droplets } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { POOL_SESSIONS } from '@/constants/mockData';
import { PoolSession } from '@/constants/types';

export default function PoolSessionsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'beginner' | 'beginner-intermediate' | 'intermediate' | 'advanced'>('all');

  const filteredSessions = filter === 'all'
    ? POOL_SESSIONS
    : POOL_SESSIONS.filter(session => session.level === filter);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return Colors.accent.success;
      case 'beginner-intermediate':
        return Colors.primary.turquoise;
      case 'intermediate':
        return Colors.accent.warning;
      case 'advanced':
        return Colors.accent.error;
      default:
        return Colors.text.secondary;
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Beginner';
      case 'beginner-intermediate':
        return 'Beg-Int';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      default:
        return level;
    }
  };

  const handleSessionPress = (sessionId: string) => {
    router.push(`/pool/${sessionId}`);
  };

  const filterOptions: Array<{ value: typeof filter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'beginner-intermediate', label: 'Beg-Int' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Pool Practice</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Droplets size={20} color={Colors.text.primary} strokeWidth={2.5} />
          <Text style={styles.subtitle}>Guided pool sessions with audio coaching</Text>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filterOptions.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.filterButton,
                filter === option.value && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(option.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === option.value && styles.filterButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Sessions List */}
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredSessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Droplets size={48} color={Colors.text.muted} strokeWidth={1.5} />
              <Text style={styles.emptyText}>No sessions found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters to see more sessions
              </Text>
            </View>
          ) : (
            filteredSessions.map((session) => (
              <Pressable
                key={session.id}
                style={styles.sessionCard}
                onPress={() => handleSessionPress(session.id)}
              >
                {/* Thumbnail */}
                {session.thumbnailUrl && (
                  <Image
                    source={{ uri: session.thumbnailUrl }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                )}

                {/* Content */}
                <View style={styles.cardContent}>
                  {/* Title and Level */}
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {session.title}
                    </Text>
                    <View
                      style={[
                        styles.levelBadge,
                        { backgroundColor: getDifficultyColor(session.level) },
                      ]}
                    >
                      <Text style={styles.levelText}>
                        {getDifficultyLabel(session.level)}
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {session.description}
                  </Text>

                  {/* Meta Info */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color={Colors.text.secondary} strokeWidth={2} />
                      <Text style={styles.metaText}>{session.duration} min</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Zap size={14} color={Colors.text.secondary} strokeWidth={2} />
                      <Text style={styles.metaText}>{session.estimatedCalories} cal</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <TrendingUp size={14} color={Colors.text.secondary} strokeWidth={2} />
                      <Text style={styles.metaText}>
                        {session.intervals.length} intervals
                      </Text>
                    </View>
                  </View>

                  {/* Focus Areas */}
                  <View style={styles.focusAreasContainer}>
                    {session.focusAreas.slice(0, 3).map((area, index) => (
                      <View key={index} style={styles.focusAreaTag}>
                        <Text style={styles.focusAreaText}>{area}</Text>
                      </View>
                    ))}
                    {session.focusAreas.length > 3 && (
                      <View style={styles.focusAreaTag}>
                        <Text style={styles.focusAreaText}>
                          +{session.focusAreas.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.accent.black,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  filterButtonTextActive: {
    color: Colors.text.white,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sessionCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  thumbnail: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.white,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  focusAreasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  focusAreaTag: {
    backgroundColor: Colors.background.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  focusAreaText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
