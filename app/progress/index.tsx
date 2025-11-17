import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Flag,
  Star,
  Zap,
} from 'lucide-react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import {
  getUserProgress,
  getModuleProgress,
  LessonProgress,
  ModuleProgress,
} from '@/utils/progressTracker';

export default function ProgressDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(null);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    try {
      const progress = await getUserProgress(user!.id);
      setUserProgress(progress);

      const currentModuleProgress = await getModuleProgress(
        user!.id,
        progress.currentModule,
        progress.currentSkillLevel
      );
      setModuleProgress(currentModuleProgress);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSkillLevelLabel = (level: string) => {
    return level
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading || !userProgress) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading progress...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.title}>Progress Dashboard</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, styles.levelCard]}>
              <Star size={32} color={Colors.accent.black} />
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Current Level</Text>
                <Text style={styles.statValue}>
                  {getSkillLevelLabel(userProgress.currentSkillLevel)}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.halfCard]}>
                <Flag size={24} color={Colors.accent.black} />
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Lessons</Text>
                  <Text style={styles.statValue}>
                    {userProgress.totalLessonsCompleted}
                  </Text>
                </View>
              </View>

              <View style={[styles.statCard, styles.halfCard]}>
                <Zap size={24} color={Colors.accent.black} />
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Streak</Text>
                  <Text style={styles.statValue}>{userProgress.streakDays} days</Text>
                </View>
              </View>
            </View>
          </View>

          {moduleProgress && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Current Module Progress</Text>
                <Text style={styles.sectionSubtitle}>
                  {moduleProgress.completedLessons} of {moduleProgress.totalLessons} lessons
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(moduleProgress.completedLessons / moduleProgress.totalLessons) * 100}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.moduleStats}>
                <View style={styles.moduleStat}>
                  <Text style={styles.moduleStatLabel}>Performance</Text>
                  <Text style={styles.moduleStatValue}>
                    {Math.round(moduleProgress.avgPerformance * 100)}%
                  </Text>
                </View>

                <View style={styles.moduleStat}>
                  <Text style={styles.moduleStatLabel}>Confidence</Text>
                  <Text style={styles.moduleStatValue}>
                    {Math.round(moduleProgress.avgConfidence * 20)}/100
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <Pressable
                style={styles.viewAllButton}
                onPress={() => router.push('/achievements' as any)}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={16} color={Colors.text.secondary} />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.achievementsScroll}
              contentContainerStyle={styles.achievementsContent}
            >
              <View style={styles.achievementCard}>
                <Award size={32} color={Colors.accent.success} />
                <Text style={styles.achievementTitle}>First Lesson</Text>
                <Text style={styles.achievementDesc}>Completed your first lesson</Text>
              </View>

              <View style={styles.achievementCard}>
                <Zap size={32} color={Colors.accent.warning} />
                <Text style={styles.achievementTitle}>3 Day Streak</Text>
                <Text style={styles.achievementDesc}>Practice for 3 days in a row</Text>
              </View>

              <View style={styles.achievementCard}>
                <Star size={32} color={Colors.accent.info} />
                <Text style={styles.achievementTitle}>Level Up</Text>
                <Text style={styles.achievementDesc}>Reached Beginner Level 2</Text>
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Weekly Activity</Text>
            </View>

            <View style={styles.chartCard}>
              <BarChart
                data={{
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  datasets: [
                    {
                      data: [3, 2, 4, 1, 5, 3, 2],
                    },
                  ],
                }}
                width={320}
                height={180}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: Colors.background.white,
                  backgroundGradientFrom: Colors.background.white,
                  backgroundGradientTo: Colors.background.white,
                  decimalPlaces: 0,
                  color: (opacity = 1) => Colors.primary.main,
                  labelColor: (opacity = 1) => Colors.text.secondary,
                  style: {
                    borderRadius: 16,
                  },
                  barPercentage: 0.7,
                }}
                style={styles.chart}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsContainer: {
    marginBottom: 24,
  },
  levelCard: {
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  halfCard: {
    flex: 1,
  },
  statInfo: {
    marginLeft: 12,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background.light,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.success,
    borderRadius: 4,
  },
  moduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  moduleStat: {
    alignItems: 'center',
  },
  moduleStatLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  moduleStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  achievementsScroll: {
    marginHorizontal: -20,
  },
  achievementsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  achievementCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    width: 160,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});