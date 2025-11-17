import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Trophy,
  Users,
  Clock,
  Target,
  Award,
  ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { CHALLENGES } from '@/constants/mockData';
import { Challenge } from '@/constants/types';

export default function ChallengesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('all');

  const filteredChallenges = useMemo(() => {
    if (filter === 'all') return CHALLENGES;
    return CHALLENGES.filter(c => c.status === filter);
  }, [filter]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return Colors.accent.success;
      case 'intermediate':
        return Colors.accent.warning;
      case 'advanced':
        return Colors.accent.error;
      default:
        return Colors.primary.turquoise;
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 1) return `${diffDays} days left`;
    if (diffHours > 1) return `${diffHours} hours left`;
    return 'Ending soon';
  };

  const renderChallenge = (challenge: Challenge) => {
    const isActive = challenge.status === 'active';
    const isUpcoming = challenge.status === 'upcoming';

    return (
      <Pressable
        key={challenge.id}
        style={styles.challengeCard}
        onPress={() => router.push(`/challenges/${challenge.id}`)}
      >
        {challenge.imageUrl && (
          <Image
            source={{ uri: challenge.imageUrl }}
            style={styles.challengeImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.challengeContent}>
          {/* Status Badge */}
          {isActive && (
            <View style={[styles.statusBadge, styles.statusBadgeActive]}>
              <Text style={styles.statusText}>ACTIVE</Text>
            </View>
          )}
          {isUpcoming && (
            <View style={[styles.statusBadge, styles.statusBadgeUpcoming]}>
              <Text style={styles.statusText}>UPCOMING</Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.challengeTitle}>{challenge.title}</Text>

          {/* Description */}
          <Text style={styles.challengeDescription} numberOfLines={2}>
            {challenge.description}
          </Text>

          {/* Goal */}
          <View style={styles.goalContainer}>
            <Target size={18} color={Colors.primary.turquoise} strokeWidth={2.5} />
            <Text style={styles.goalText}>
              Goal: {challenge.goal.target} {challenge.goal.unit}
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Users size={16} color={Colors.text.secondary} strokeWidth={2.5} />
              <Text style={styles.statText}>
                {challenge.participantCount.toLocaleString()}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Clock size={16} color={Colors.text.secondary} strokeWidth={2.5} />
              <Text style={styles.statText}>
                {isUpcoming ? 'Starts soon' : getTimeRemaining(challenge.endDate)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Award size={16} color={Colors.text.secondary} strokeWidth={2.5} />
              <Text style={styles.statText}>{challenge.rewards.xp} XP</Text>
            </View>
          </View>

          {/* Difficulty Badge */}
          <View style={styles.footer}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: `${getDifficultyColor(challenge.difficulty)}20` },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(challenge.difficulty) },
                ]}
              >
                {challenge.difficulty.toUpperCase()}
              </Text>
            </View>

            <ChevronRight size={20} color={Colors.text.secondary} strokeWidth={2.5} />
          </View>
        </View>
      </Pressable>
    );
  };

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
          <Text style={styles.headerTitle}>Challenges</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <Pressable
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.filterTextActive,
              ]}
            >
              All ({CHALLENGES.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, filter === 'active' && styles.filterChipActive]}
            onPress={() => setFilter('active')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'active' && styles.filterTextActive,
              ]}
            >
              Active ({CHALLENGES.filter(c => c.status === 'active').length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, filter === 'upcoming' && styles.filterChipActive]}
            onPress={() => setFilter('upcoming')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'upcoming' && styles.filterTextActive,
              ]}
            >
              Upcoming ({CHALLENGES.filter(c => c.status === 'upcoming').length})
            </Text>
          </Pressable>
        </View>

        {/* Challenges List */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Trophy size={24} color={Colors.accent.warning} strokeWidth={2.5} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Compete & Earn Rewards</Text>
              <Text style={styles.infoText}>
                Join challenges to compete with the community, track your progress, and earn
                bonus XP and badges!
              </Text>
            </View>
          </View>

          {/* Challenges */}
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map(challenge => renderChallenge(challenge))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No {filter} challenges</Text>
              <Text style={styles.emptySubtext}>Check back later!</Text>
            </View>
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
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 40,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
  },
  filterChipActive: {
    backgroundColor: Colors.accent.black,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  filterTextActive: {
    color: Colors.text.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  challengeCard: {
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
  challengeImage: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.background.light,
  },
  challengeContent: {
    padding: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusBadgeActive: {
    backgroundColor: `${Colors.accent.success}20`,
  },
  statusBadgeUpcoming: {
    backgroundColor: `${Colors.primary.turquoise}20`,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent.success,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.light,
  },
});
