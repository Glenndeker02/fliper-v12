import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Trophy,
  Users,
  Clock,
  Target,
  Award,
  Share2,
  CheckCircle2,
  Circle,
  Medal,
  Crown,
  Zap,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { CHALLENGES, getChallengeLeaderboard } from '@/constants/mockData';

export default function ChallengeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isParticipating, setIsParticipating] = useState(true);

  const challenge = useMemo(() => {
    return CHALLENGES.find(c => c.id === id);
  }, [id]);

  const leaderboard = useMemo(() => {
    if (!id) return [];
    return getChallengeLeaderboard(id);
  }, [id]);

  const currentUserEntry = leaderboard.find(entry => entry.isCurrentUser);

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Challenge not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(challenge.endDate);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`;
    return 'Ending soon';
  };

  const handleJoinLeave = () => {
    if (isParticipating) {
      Alert.alert(
        'Leave Challenge?',
        'Are you sure you want to leave this challenge? Your progress will be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => setIsParticipating(false),
          },
        ]
      );
    } else {
      setIsParticipating(true);
    }
  };

  const handleShare = () => {
    Alert.alert(
      'Share Challenge',
      'Challenge link copied to clipboard!',
      [{ text: 'OK' }]
    );
  };

  const renderLeaderboardEntry = (entry: any, index: number) => {
    const isTopThree = entry.rank <= 3;
    const isCurrentUser = entry.isCurrentUser;

    return (
      <View
        key={`${entry.user.id}-${index}`}
        style={[
          styles.leaderboardEntry,
          isCurrentUser && styles.leaderboardEntryHighlight,
        ]}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <View style={[styles.rankBadge, styles[`rankBadge${entry.rank}` as keyof typeof styles]]}>
              {entry.rank === 1 && <Crown size={16} color="#FFD700" strokeWidth={2.5} />}
              {entry.rank === 2 && <Medal size={16} color="#C0C0C0" strokeWidth={2.5} />}
              {entry.rank === 3 && <Medal size={16} color="#CD7F32" strokeWidth={2.5} />}
            </View>
          ) : (
            <Text style={styles.rankText}>#{entry.rank}</Text>
          )}
        </View>

        {/* User Info */}
        <Image source={{ uri: entry.user.avatarUrl }} style={styles.leaderboardAvatar} />
        <View style={styles.leaderboardUserInfo}>
          <Text style={styles.leaderboardUserName} numberOfLines={1}>
            {entry.user.name}
            {isCurrentUser && <Text style={styles.youBadge}> (You)</Text>}
          </Text>
          <Text style={styles.leaderboardUserStats}>
            {entry.progress.toFixed(0)} / {challenge.goal.target} {challenge.goal.unit}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.leaderboardProgressContainer}>
          <View
            style={[
              styles.leaderboardProgressBar,
              { width: `${Math.min(100, entry.progressPercentage)}%` },
            ]}
          />
        </View>

        {/* Completion Badge */}
        {entry.completedAt && (
          <CheckCircle2 size={20} color={Colors.accent.success} strokeWidth={2.5} />
        )}
      </View>
    );
  };

  const isActive = challenge.status === 'active';
  const isUpcoming = challenge.status === 'upcoming';
  const progressPercentage = currentUserEntry?.progressPercentage || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {challenge.imageUrl && (
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: challenge.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.heroGradient}
            />

            {/* Back Button */}
            <Pressable style={styles.heroBackButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text.white} />
            </Pressable>

            {/* Share Button */}
            <Pressable style={styles.shareButton} onPress={handleShare}>
              <Share2 size={20} color={Colors.text.white} strokeWidth={2.5} />
            </Pressable>

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
          </View>
        )}

        <View style={styles.contentContainer}>
          {/* Title & Difficulty */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{challenge.title}</Text>
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
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Users size={20} color={Colors.primary.turquoise} strokeWidth={2.5} />
              <Text style={styles.statValue}>
                {challenge.participantCount.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>

            <View style={styles.statCard}>
              <Clock size={20} color={Colors.accent.warning} strokeWidth={2.5} />
              <Text style={styles.statValue}>{getTimeRemaining()}</Text>
              <Text style={styles.statLabel}>Time Left</Text>
            </View>

            <View style={styles.statCard}>
              <Award size={20} color={Colors.accent.success} strokeWidth={2.5} />
              <Text style={styles.statValue}>{challenge.rewards.xp} XP</Text>
              <Text style={styles.statLabel}>Reward</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Challenge</Text>
            <Text style={styles.description}>{challenge.description}</Text>
          </View>

          {/* Goal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goal</Text>
            <View style={styles.goalCard}>
              <Target size={24} color={Colors.primary.turquoise} strokeWidth={2.5} />
              <View style={styles.goalContent}>
                <Text style={styles.goalText}>
                  {challenge.goal.target} {challenge.goal.unit}
                </Text>
                <Text style={styles.goalSubtext}>
                  {challenge.type === 'distance' && 'Total distance to swim'}
                  {challenge.type === 'time' && 'Total practice time'}
                  {challenge.type === 'streak' && 'Consecutive days'}
                  {challenge.type === 'lessons' && 'Lessons to complete'}
                  {challenge.type === 'dryland' && 'Dryland sessions'}
                </Text>
              </View>
            </View>
          </View>

          {/* User Progress (if participating) */}
          {isParticipating && currentUserEntry && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Progress</Text>
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>
                    {currentUserEntry.progress.toFixed(0)} / {challenge.goal.target}{' '}
                    {challenge.goal.unit}
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {progressPercentage.toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(100, progressPercentage)}%` },
                    ]}
                  />
                </View>
                {currentUserEntry.rank && (
                  <Text style={styles.rankInfo}>
                    You're ranked #{currentUserEntry.rank} out of{' '}
                    {challenge.participantCount.toLocaleString()}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Leaderboard */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Leaderboard</Text>
              <Trophy size={20} color={Colors.accent.warning} strokeWidth={2.5} />
            </View>
            <View style={styles.leaderboardContainer}>
              {leaderboard.slice(0, 10).map((entry, index) => renderLeaderboardEntry(entry, index))}
            </View>
          </View>

          {/* Rewards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rewards</Text>
            <View style={styles.rewardsContainer}>
              <View style={styles.rewardItem}>
                <View style={styles.rewardIcon}>
                  <Zap size={20} color={Colors.accent.warning} strokeWidth={2.5} />
                </View>
                <Text style={styles.rewardText}>{challenge.rewards.xp} XP</Text>
              </View>
              {challenge.rewards.badge && (
                <View style={styles.rewardItem}>
                  <View style={styles.rewardIcon}>
                    <Award size={20} color={Colors.primary.turquoise} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.rewardText}>
                    {challenge.rewards.badge.replace(/-/g, ' ')} Badge
                  </Text>
                </View>
              )}
              {challenge.rewards.title && (
                <View style={styles.rewardItem}>
                  <View style={styles.rewardIcon}>
                    <Crown size={20} color={Colors.accent.success} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.rewardText}>"{challenge.rewards.title}" Title</Text>
                </View>
              )}
            </View>
          </View>

          {/* Rules */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rules</Text>
            <View style={styles.rulesContainer}>
              {challenge.rules.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <CheckCircle2
                    size={18}
                    color={Colors.primary.turquoise}
                    strokeWidth={2.5}
                  />
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Join/Leave Button */}
      {isActive && (
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.actionButton,
              isParticipating ? styles.leaveButton : styles.joinButton,
            ]}
            onPress={handleJoinLeave}
          >
            <Text
              style={[
                styles.actionButtonText,
                isParticipating && styles.leaveButtonText,
              ]}
            >
              {isParticipating ? 'Leave Challenge' : 'Join Challenge'}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.white,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroBackButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: Colors.accent.success,
  },
  statusBadgeUpcoming: {
    backgroundColor: Colors.primary.turquoise,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.white,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 32,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  goalCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  goalContent: {
    flex: 1,
  },
  goalText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  goalSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  progressCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary.turquoise,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.background.white,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.turquoise,
    borderRadius: 4,
  },
  rankInfo: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  leaderboardContainer: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  leaderboardEntryHighlight: {
    borderWidth: 2,
    borderColor: Colors.primary.turquoise,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadge1: {
    backgroundColor: '#FFD70020',
  },
  rankBadge2: {
    backgroundColor: '#C0C0C020',
  },
  rankBadge3: {
    backgroundColor: '#CD7F3220',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
  },
  leaderboardUserInfo: {
    flex: 1,
  },
  leaderboardUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  youBadge: {
    color: Colors.primary.turquoise,
    fontWeight: '700',
  },
  leaderboardUserStats: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  leaderboardProgressContainer: {
    width: 60,
    height: 4,
    backgroundColor: Colors.background.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  leaderboardProgressBar: {
    height: '100%',
    backgroundColor: Colors.primary.turquoise,
    borderRadius: 2,
  },
  rewardsContainer: {
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    textTransform: 'capitalize',
  },
  rulesContainer: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.white,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
    padding: 20,
    paddingBottom: 32,
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButton: {
    backgroundColor: Colors.accent.black,
  },
  leaveButton: {
    backgroundColor: Colors.background.light,
    borderWidth: 2,
    borderColor: Colors.ui.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.white,
  },
  leaveButtonText: {
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.accent.black,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
});
