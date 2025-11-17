import { useRouter } from 'expo-router';
import { 
  ArrowRight, 
  Award, 
  BookOpen, 
  Dumbbell, 
  User, 
  Flame,
  TrendingUp,
  Calendar,
  Target,
  Trophy,
  Shield
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { MODULES, DRYLAND_EXERCISES } from '@/constants/mockData';
import FloatingJournalButton from '@/components/FloatingJournalButton';
import XPDisplay from '@/components/XPDisplay';
import LevelUpModal from '@/components/LevelUpModal';
import XPRewardToast from '@/components/XPRewardToast';
import { useTheme } from '@/contexts/ThemeContext';
import { getCurrentUser } from '@/utils/supabase';
import { getUpcomingLessons, LessonSchedule } from '@/utils/lessonScheduler';
import { getUserProgress } from '@/utils/progressTracker';
import { LevelUpData } from '@/utils/gamification';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingLessons, setUpcomingLessons] = useState<LessonSchedule[]>([]);
  const [userProgress, setUserProgress] = useState<{
    currentModule: number;
    currentSkillLevel: SkillLevel;
    totalLessonsCompleted: number;
    avgConfidence: number;
    streakDays: number;
    lastActivity: Date;
  } | null>(null);
  const [currentModule] = useState(MODULES[0]);

  // Gamification state
  const [totalXP, setTotalXP] = useState(450); // Example XP - load from user profile in production
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [xpReward, setXPReward] = useState<{ visible: boolean; amount: number; description: string }>({
    visible: false,
    amount: 0,
    description: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const [lessons, progress] = await Promise.all([
        getUpcomingLessons(user.id),
        getUserProgress(user.id)
      ]);

      setUpcomingLessons(lessons);
      setUserProgress(progress);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextLessons = upcomingLessons.slice(0, 3);
  
  const weekActivities = [
    { day: 'M', hasLesson: true, hasPool: true, hasDryland: false },
    { day: 'T', hasLesson: false, hasPool: false, hasDryland: true },
    { day: 'W', hasLesson: true, hasPool: false, hasDryland: false },
    { day: 'T', hasLesson: false, hasPool: true, hasDryland: true },
    { day: 'F', hasLesson: true, hasPool: true, hasDryland: false },
    { day: 'S', hasLesson: false, hasPool: false, hasDryland: false },
    { day: 'S', hasLesson: false, hasPool: true, hasDryland: false },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Hello, Swimmer!</Text>
              <Text style={styles.subtitle}>Ready to make waves today?</Text>
            </View>
            <View style={styles.headerRight}>
              <XPDisplay totalXP={totalXP} variant="mini" onPress={() => router.push('/progress')} />
              <Pressable style={styles.profileButton}>
                <User size={24} color={Colors.text.primary} />
              </Pressable>
            </View>
          </View>

          {/* XP Progress Card */}
          <View style={styles.xpSection}>
            <XPDisplay totalXP={totalXP} variant="compact" onPress={() => router.push('/progress')} />
          </View>

          <View style={styles.progressCard}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.accent.black} />
              </View>
            ) : (
              <>
                <View style={styles.progressHeader}>
                  <View>
                    <Text style={styles.progressLabel}>Current Module</Text>
                    <Text style={styles.progressTitle}>{currentModule.title}</Text>
                  </View>
                  <View style={styles.levelBadge}>
                    <Award size={20} color={Colors.accent.black} strokeWidth={2} />
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(userProgress?.totalLessonsCompleted || 0) / (currentModule.lessons.length) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {userProgress?.totalLessonsCompleted || 0} of {currentModule.lessons.length} lessons completed
                  </Text>
                </View>
              </>
            )}

            <Pressable
              style={styles.continueButton}
              onPress={() => router.push('/lessons/floating-front')}
            >
              <Text style={styles.continueButtonText}>Continue Learning</Text>
              <View style={styles.arrowCircle}>
                <ArrowRight size={16} color={Colors.text.white} />
              </View>
            </Pressable>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={24} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Your Next Lessons</Text>
            </View>

            {nextLessons.map((lesson) => (
              <Pressable
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => router.push(`/lessons/${lesson.id}`)}
              >
                <Image
                  source={{ uri: lesson.thumbnailUrl }}
                  style={styles.lessonImage}
                  resizeMode="cover"
                />
                <View style={styles.lessonContent}>
                  <View style={styles.lessonHeader}>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>
                        {lesson.difficulty.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                  </View>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDescription} numberOfLines={2}>
                    {lesson.description}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Dumbbell size={24} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Dryland Training</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.exercisesScroll}
            >
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
                    <View style={styles.exerciseBadge}>
                      <Text style={styles.exerciseBadgeText}>
                        {exercise.category.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.exerciseTitle} numberOfLines={2}>
                      {exercise.title}
                    </Text>
                    <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Flame size={24} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Streak & Goals</Text>
            </View>

            <View style={styles.streakCard}>
              <View style={styles.streakLeft}>
                <View style={styles.streakIcon}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                </View>
                <View>
                  <Text style={styles.streakValue}>8-day streak</Text>
                  <Text style={styles.streakLabel}>Keep it going!</Text>
                </View>
              </View>
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeText}>Active</Text>
              </View>
            </View>

            <View style={styles.xpCard}>
              <View style={styles.xpHeader}>
                <View style={styles.xpIcon}>
                  <Text style={styles.xpEmoji}>⭐</Text>
                </View>
                <View>
                  <Text style={styles.xpValue}>1,250 XP</Text>
                  <Text style={styles.xpLabel}>Next level: 500 XP</Text>
                </View>
              </View>
              <View style={styles.xpProgressBar}>
                <View style={[styles.xpProgressFill, { width: '70%' }]} />
              </View>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Target size={20} color={Colors.accent.black} strokeWidth={2} />
                <Text style={styles.goalTitle}>Weekly Goal</Text>
              </View>
              <Text style={styles.goalDescription}>3 practice sessions this week</Text>
              <View style={styles.goalProgressBar}>
                <View style={[styles.goalProgressFill, { width: '66%' }]} />
              </View>
              <Text style={styles.goalProgressText}>2 of 3 sessions completed</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={24} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>This Week</Text>
            </View>

            <View style={styles.weekGrid}>
              {weekActivities.map((day, index) => {
                const hasActivity = day.hasLesson || day.hasPool || day.hasDryland;
                return (
                  <View key={index} style={styles.dayCard}>
                    <Text style={[styles.dayLabel, hasActivity && styles.dayLabelActive]}>
                      {day.day}
                    </Text>
                    <View style={[styles.dayIndicator, hasActivity && styles.dayIndicatorActive]}>
                      {hasActivity ? (
                        <View style={styles.activityDots}>
                          {day.hasLesson && <View style={styles.activityDot} />}
                          {day.hasPool && <View style={styles.activityDot} />}
                          {day.hasDryland && <View style={styles.activityDot} />}
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.weekSummary}>
              <View style={styles.weekStat}>
                <BookOpen size={16} color={Colors.accent.black} />
                <Text style={styles.weekStatValue}>{upcomingLessons.length}</Text>
                <Text style={styles.weekStatLabel}>Lessons</Text>
              </View>
              <View style={styles.weekStatDivider} />
              <View style={styles.weekStat}>
                <View style={styles.poolIcon}>
                  <Text style={styles.poolIconText}>🏊</Text>
                </View>
                <Text style={styles.weekStatValue}>
                  {upcomingLessons.filter(lesson => lesson.lessonType === 'pool').length}
                </Text>
                <Text style={styles.weekStatLabel}>Pool</Text>
              </View>
              <View style={styles.weekStatDivider} />
              <View style={styles.weekStat}>
                <Dumbbell size={16} color={Colors.accent.black} />
                <Text style={styles.weekStatValue}>
                  {upcomingLessons.filter(lesson => lesson.lessonType === 'dryland').length}
                </Text>
                <Text style={styles.weekStatLabel}>Dryland</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Trophy size={24} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Achievements</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsScroll}
            >
              {[
                { 
                  icon: '🔥', 
                  title: `${userProgress?.streakDays || 0}-Day Streak`, 
                  date: userProgress?.streakDays ? 'Active' : 'Start Today', 
                  xp: '+50 XP' 
                },
                { 
                  icon: '🎯', 
                  title: `${userProgress?.totalLessonsCompleted || 0} Lessons`, 
                  date: userProgress?.lastActivity ? new Date(userProgress.lastActivity).toLocaleDateString() : 'Not Started', 
                  xp: '+100 XP' 
                },
                { 
                  icon: '💪', 
                  title: 'Level Progress', 
                  date: userProgress?.currentSkillLevel || 'beginner-1', 
                  xp: '+200 XP' 
                },
                { 
                  icon: '🏊', 
                  title: 'Confidence Level', 
                  date: `${Math.round((userProgress?.avgConfidence || 0) * 100)}%`, 
                  xp: '+150 XP' 
                },
              ].map((achievement, index) => (
                <View key={index} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDate}>{achievement.date}</Text>
                  <View style={styles.xpBadge}>
                    <Text style={styles.xpBadgeText}>{achievement.xp}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={24} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Safety & Gear Check</Text>
            </View>
            <View style={styles.safetyCard}>
              <Text style={styles.safetyTitle}>All set for a safe and fun swim today?</Text>
              <Text style={styles.safetyText}>
                Check your gear and environment before diving in
              </Text>
              
              <View style={styles.checklist}>
                <View style={styles.checklistItem}>
                  <View style={styles.checkbox}>
                    <View style={styles.checkboxInner} />
                  </View>
                  <Text style={styles.checklistText}>Pool is clean and supervised</Text>
                </View>
                <View style={styles.checklistItem}>
                  <View style={styles.checkbox}>
                    <View style={styles.checkboxInner} />
                  </View>
                  <Text style={styles.checklistText}>Swim cap and goggles ready</Text>
                </View>
                <View style={styles.checklistItem}>
                  <View style={styles.checkbox}>
                    <View style={styles.checkboxInner} />
                  </View>
                  <Text style={styles.checklistText}>Water shoes if needed</Text>
                </View>
                <View style={styles.checklistItem}>
                  <View style={styles.checkbox}>
                    <View style={styles.checkboxInner} />
                  </View>
                  <Text style={styles.checklistText}>Towel and water bottle</Text>
                </View>
              </View>
              
              <Pressable style={styles.safetyButton}>
                <Text style={styles.safetyButtonText}>I'm Ready to Swim! (+1 XP)</Text>
              </Pressable>
            </View>
          </View>
          
          <View style={styles.section}>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💡 {`Today's`} Tip</Text>
              <Text style={styles.tipText}>
                Practice breathing exercises on dry land before your pool session. This helps build
                confidence and muscle memory for rhythmic breathing.
              </Text>
            </View>
          </View>
        </ScrollView>
        <FloatingJournalButton />

        {/* Gamification overlays */}
        <XPRewardToast
          visible={xpReward.visible}
          amount={xpReward.amount}
          description={xpReward.description}
          onHide={() => setXPReward({ ...xpReward, visible: false })}
        />
        <LevelUpModal
          visible={showLevelUpModal}
          levelUpData={levelUpData}
          onClose={() => setShowLevelUpModal(false)}
        />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  xpSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 32,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background.light,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.black,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    paddingVertical: 14,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.white,
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  lessonCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  lessonImage: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.background.light,
  },
  lessonContent: {
    padding: 20,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.accent.black,
    letterSpacing: 0.5,
  },
  lessonDuration: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  exercisesScroll: {
    paddingRight: 24,
    gap: 16,
  },
  exerciseCard: {
    width: 220,
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
    height: 140,
    backgroundColor: Colors.background.light,
  },
  exerciseContent: {
    padding: 16,
  },
  exerciseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  exerciseBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: Colors.accent.black,
    letterSpacing: 0.5,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
    height: 40,
  },
  exerciseDuration: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  tipCard: {
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
  tipTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  streakCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  streakBadge: {
    backgroundColor: Colors.accent.success,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.white,
  },
  xpCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  xpIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpEmoji: {
    fontSize: 24,
  },
  xpValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  xpLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: Colors.background.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: Colors.accent.black,
    borderRadius: 4,
  },
  goalCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  goalDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: Colors.background.light,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: Colors.accent.black,
    borderRadius: 4,
  },
  goalProgressText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  dayCard: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.light,
  },
  dayLabelActive: {
    color: Colors.text.primary,
  },
  dayIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayIndicatorActive: {
    backgroundColor: Colors.accent.black,
  },
  activityDots: {
    flexDirection: 'row',
    gap: 3,
  },
  activityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.text.white,
  },
  weekSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weekStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  weekStatValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  weekStatLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  weekStatDivider: {
    width: 1,
    backgroundColor: Colors.ui.border,
    marginHorizontal: 12,
  },
  poolIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poolIconText: {
    fontSize: 12,
  },
  achievementsScroll: {
    paddingRight: 24,
    gap: 12,
  },
  achievementCard: {
    width: 120,
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: Colors.text.light,
  },
  xpBadge: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  xpBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.accent.black,
    letterSpacing: 0.5,
  },
  safetyCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  checklist: {
    gap: 16,
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: Colors.accent.black,
  },
  checklistText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  safetyButton: {
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  safetyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.white,
  },
});
