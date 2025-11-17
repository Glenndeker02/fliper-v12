import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Award, Trophy } from 'lucide-react-native';
import Colors from '@/constants/colors';
import {
  Achievement,
  AchievementType,
  getAchievementProgress,
  getRecentAchievements,
} from '@/utils/achievements';
import { getCurrentUser } from '@/utils/supabase';

interface AchievementsCardProps {
  onViewAll?: () => void;
}

export default function AchievementsCard({ onViewAll }: AchievementsCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [streakProgress, setStreakProgress] = useState<{
    current: number;
    next: Achievement | null;
    progress: number;
  }>({
    current: 0,
    next: null,
    progress: 0,
  });

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const [recent, streak] = await Promise.all([
        getRecentAchievements(user.id, 3),
        getAchievementProgress(user.id, 'streak' as AchievementType),
      ]);

      setRecentAchievements(recent);
      setStreakProgress(streak);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAchievementItem = (achievement: Achievement) => (
    <View key={achievement.id} style={styles.achievementItem}>
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <View style={styles.achievementInfo}>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDescription}>
          {achievement.description}
        </Text>
      </View>
      <View style={styles.xpBadge}>
        <Text style={styles.xpText}>+{achievement.xpReward} XP</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.accent.black} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Trophy size={24} color={Colors.accent.black} />
          <Text style={styles.title}>Recent Achievements</Text>
        </View>
        {onViewAll && (
          <Pressable onPress={onViewAll} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        )}
      </View>

      {streakProgress.next && (
        <View style={styles.nextAchievement}>
          <Award size={20} color={Colors.accent.black} />
          <View style={styles.nextAchievementInfo}>
            <Text style={styles.nextAchievementTitle}>Next Achievement</Text>
            <Text style={styles.nextAchievementDescription}>
              {streakProgress.next.description}
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${streakProgress.progress}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{streakProgress.progress}%</Text>
          </View>
        </View>
      )}

      <View style={styles.achievementsList}>
        {recentAchievements.length > 0 ? (
          recentAchievements.map(renderAchievementItem)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No achievements yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Complete lessons and stay consistent to earn achievements
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  viewAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary.lightBlue,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent.black,
  },
  nextAchievement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  nextAchievementInfo: {
    flex: 1,
  },
  nextAchievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent.black,
    marginBottom: 4,
  },
  nextAchievementDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  progressContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: Colors.background.white,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.black,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent.black,
  },
  achievementsList: {
    gap: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 16,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  xpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.accent.black,
    borderRadius: 8,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});