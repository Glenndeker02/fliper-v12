import { useRouter } from 'expo-router';
import { ArrowLeft, Filter, Trophy, Lock } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  SectionList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import AchievementBadge from '@/components/AchievementBadge';
import AchievementUnlockModal from '@/components/AchievementUnlockModal';
import {
  Achievement,
  AchievementCategory,
  AchievementTier,
  ACHIEVEMENTS,
  getAchievementsByCategory,
  calculateAchievementProgress,
  isAchievementUnlocked,
  getAchievementStats,
  getCategoryName,
  getCategoryIcon,
} from '@/utils/achievements';

export default function AchievementsScreen() {
  const router = useRouter();

  // Mock user stats - in production, load from Supabase
  const [userStats] = useState({
    lessons_completed: 3,
    pool_sessions_completed: 1,
    dryland_completed: 0,
    streak_days: 5,
    journals_created: 2,
    video_journals: 0,
    community_helpful: 0,
    reactions_received: 0,
    excellent_ratings: 0,
    strokes_learned: 1,
    safety_checklists: 10,
    long_session: 0,
    days_active: 5,
    level_reached: 2,
    total_xp: 450,
    early_session: 0,
    late_session: 0,
    weekend_sessions: 0,
    videos_watched: 3,
    module_mastered: 0,
    balanced_training: 0,
    comeback: 0,
  });

  // State
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<AchievementTier | 'all'>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Calculate stats
  const stats = useMemo(() => getAchievementStats(userStats), [userStats]);

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    let filtered = ACHIEVEMENTS;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    // Tier filter
    if (selectedTier !== 'all') {
      filtered = filtered.filter((a) => a.tier === selectedTier);
    }

    // Unlocked filter
    if (showUnlockedOnly) {
      filtered = filtered.filter((a) => isAchievementUnlocked(a, userStats));
    }

    // Hide secret achievements if locked
    filtered = filtered.filter(
      (a) => !a.isSecret || isAchievementUnlocked(a, userStats)
    );

    return filtered;
  }, [selectedCategory, selectedTier, showUnlockedOnly, userStats]);

  // Group achievements by category for SectionList
  const sections = useMemo(() => {
    const categories: AchievementCategory[] = [
      'learning',
      'practice',
      'streak',
      'social',
      'mastery',
      'milestone',
    ];

    return categories
      .map((category) => {
        const achievements = filteredAchievements.filter(
          (a) => a.category === category
        );
        if (achievements.length === 0) return null;

        return {
          title: getCategoryName(category),
          icon: getCategoryIcon(category),
          category,
          data: achievements,
        };
      })
      .filter(Boolean) as Array<{
      title: string;
      icon: string;
      category: AchievementCategory;
      data: Achievement[];
    }>;
  }, [filteredAchievements]);

  const handleAchievementPress = (achievement: Achievement) => {
    const unlocked = isAchievementUnlocked(achievement, userStats);
    if (unlocked) {
      setSelectedAchievement(achievement);
      setShowUnlockModal(true);
    }
  };

  const categories: Array<{ value: AchievementCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'learning', label: 'Learning' },
    { value: 'practice', label: 'Practice' },
    { value: 'streak', label: 'Streaks' },
    { value: 'social', label: 'Social' },
    { value: 'mastery', label: 'Mastery' },
    { value: 'milestone', label: 'Milestones' },
  ];

  const tiers: Array<{ value: AchievementTier | 'all'; label: string }> = [
    { value: 'all', label: 'All Tiers' },
    { value: 'bronze', label: 'Bronze' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' },
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
          <Text style={styles.headerTitle}>Achievements</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Trophy size={24} color={Colors.accent.warning} strokeWidth={2.5} />
            <View style={styles.statsContent}>
              <Text style={styles.statsNumber}>
                {stats.unlocked} / {stats.total}
              </Text>
              <Text style={styles.statsLabel}>Unlocked</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.tierStats}>
              <View style={styles.tierRow}>
                <Text style={styles.tierEmoji}>🥉</Text>
                <Text style={styles.tierCount}>{stats.byTier.bronze}</Text>
              </View>
              <View style={styles.tierRow}>
                <Text style={styles.tierEmoji}>🥈</Text>
                <Text style={styles.tierCount}>{stats.byTier.silver}</Text>
              </View>
              <View style={styles.tierRow}>
                <Text style={styles.tierEmoji}>🥇</Text>
                <Text style={styles.tierCount}>{stats.byTier.gold}</Text>
              </View>
              <View style={styles.tierRow}>
                <Text style={styles.tierEmoji}>💎</Text>
                <Text style={styles.tierCount}>{stats.byTier.platinum}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Category filter */}
            {categories.map((cat) => (
              <Pressable
                key={cat.value}
                style={[
                  styles.filterButton,
                  selectedCategory === cat.value && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedCategory(cat.value)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedCategory === cat.value && styles.filterButtonTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Tier and unlocked filters */}
          <View style={styles.secondaryFilters}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tiers.map((tier) => (
                <Pressable
                  key={tier.value}
                  style={[
                    styles.tierFilterButton,
                    selectedTier === tier.value && styles.tierFilterButtonActive,
                  ]}
                  onPress={() => setSelectedTier(tier.value)}
                >
                  <Text
                    style={[
                      styles.tierFilterText,
                      selectedTier === tier.value && styles.tierFilterTextActive,
                    ]}
                  >
                    {tier.label}
                  </Text>
                </Pressable>
              ))}

              <Pressable
                style={[
                  styles.tierFilterButton,
                  showUnlockedOnly && styles.tierFilterButtonActive,
                ]}
                onPress={() => setShowUnlockedOnly(!showUnlockedOnly)}
              >
                <Lock
                  size={14}
                  color={showUnlockedOnly ? Colors.text.white : Colors.text.secondary}
                  strokeWidth={2.5}
                />
                <Text
                  style={[
                    styles.tierFilterText,
                    showUnlockedOnly && styles.tierFilterTextActive,
                  ]}
                >
                  Unlocked Only
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>

        {/* Achievements List */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const unlocked = isAchievementUnlocked(item, userStats);
            const progress = calculateAchievementProgress(item, userStats);

            return (
              <View style={styles.achievementItem}>
                <AchievementBadge
                  achievement={item}
                  isUnlocked={unlocked}
                  progress={progress}
                  variant="default"
                  onPress={() => handleAchievementPress(item)}
                />
              </View>
            );
          }}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionCount}>
                {section.data.filter((a) => isAchievementUnlocked(a, userStats)).length} /{' '}
                {section.data.length}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Trophy size={48} color={Colors.text.muted} strokeWidth={1.5} />
              <Text style={styles.emptyText}>No achievements match your filters</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters to see more achievements
              </Text>
            </View>
          }
        />

        {/* Achievement Unlock Modal */}
        <AchievementUnlockModal
          visible={showUnlockModal}
          achievement={selectedAchievement}
          onClose={() => {
            setShowUnlockModal(false);
            setSelectedAchievement(null);
          }}
        />
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsContent: {
    flex: 1,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tierStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierRow: {
    alignItems: 'center',
    gap: 4,
  },
  tierEmoji: {
    fontSize: 20,
  },
  tierCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  filtersContainer: {
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    marginLeft: 8,
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
  secondaryFilters: {
    paddingLeft: 12,
  },
  tierFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background.white,
    marginRight: 8,
  },
  tierFilterButtonActive: {
    backgroundColor: Colors.accent.black,
  },
  tierFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tierFilterTextActive: {
    color: Colors.text.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  achievementItem: {
    marginBottom: 12,
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
