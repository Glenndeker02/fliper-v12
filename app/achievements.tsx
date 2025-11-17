import { useRouter } from 'expo-router';
import { ArrowLeft, Award, Trophy } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import {
  Achievement,
  AchievementType,
  getAchievementProgress,
} from '@/utils/achievements';
import { getCurrentUser } from '@/utils/supabase';

export default function AchievementsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [achievementProgress, setAchievementProgress] = useState<{
    [key in AchievementType]?: {
      current: number;
      next: Achievement | null;
      progress: number;
    };
  }>({});

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please sign in to view achievements');
        return;
      }

      const types: AchievementType[] = [
        'streak',
        'lessons_completed',
        'module_completed',
        'skill_mastered',
        'level_up',
      ];

      const progress = await Promise.all(
        types.map(async type => ({
          type,
          progress: await getAchievementProgress(user.id, type),
        }))
      );

      const progressMap = progress.reduce(
        (acc, { type, progress }) => ({
          ...acc,
          [type]: progress,
        }),
        {}
      );

      setAchievementProgress(progressMap);
    } catch (error) {
      console.error('Error loading achievements:', error);
      Alert.alert('Error', 'Failed to load achievements');
    } finally {
      setIsLoading(false);
    }
  };

  const getAchievementTypeLabel = (type: AchievementType): string => {
    switch (type) {
      case 'streak':
        return 'Practice Streaks';
      case 'lessons_completed':
        return 'Lesson Progress';
      case 'module_completed':
        return 'Module Mastery';
      case 'skill_mastered':
        return 'Skill Mastery';
      case 'level_up':
        return 'Level Progression';
      default:
        return type.split('_').map(capitalize).join(' ');
    }
  };

  const capitalize = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <LinearGradient
      colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.title}>Achievements</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent.black} />
            <Text style={styles.loadingText}>Loading achievements...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summaryCard}>
              <Trophy size={32} color={Colors.accent.black} />
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryTitle}>Achievement Hunter</Text>
                <Text style={styles.summaryText}>
                  {Object.values(achievementProgress).reduce(
                    (sum, progress) => sum + (progress?.current || 0),
                    0
                  )}{' '}
                  achievements unlocked
                </Text>
              </View>
            </View>

            {(Object.entries(achievementProgress) as [AchievementType, any][]).map(
              ([type, progress]) => (
                <View key={type} style={styles.achievementSection}>
                  <Text style={styles.sectionTitle}>
                    {getAchievementTypeLabel(type)}
                  </Text>

                  <View style={styles.achievementCard}>
                    <View style={styles.cardHeader}>
                      <Award size={24} color={Colors.accent.black} />
                      <View style={styles.headerInfo}>
                        <Text style={styles.achievementCount}>
                          {progress.current} unlocked
                        </Text>
                        {progress.next && (
                          <Text style={styles.nextAchievement}>
                            Next: {progress.next.title}
                          </Text>
                        )}
                      </View>
                    </View>

                    {progress.next && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressInfo}>
                          <Text style={styles.progressLabel}>Progress</Text>
                          <Text style={styles.progressPercent}>
                            {progress.progress}%
                          </Text>
                        </View>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${progress.progress}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressDescription}>
                          {progress.next.description}
                        </Text>
                        <View style={styles.rewardBadge}>
                          <Text style={styles.rewardText}>
                            +{progress.next.xpReward} XP
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryInfo: {
    marginLeft: 16,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  achievementSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  achievementCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    marginLeft: 12,
  },
  achievementCount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  nextAchievement: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  progressContainer: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 16,
    padding: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent.black,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.accent.black,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background.white,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.black,
    borderRadius: 4,
  },
  progressDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  rewardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent.black,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.white,
  },
});