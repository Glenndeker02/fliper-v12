import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  Target, 
  Clock,
  Droplet,
  Dumbbell,
  BookOpen,
  Activity
} from 'lucide-react-native';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();

  const weekData = [
    { day: 'M', lessons: 1, pool: 1, dryland: 0 },
    { day: 'T', lessons: 0, pool: 0, dryland: 1 },
    { day: 'W', lessons: 2, pool: 0, dryland: 0 },
    { day: 'T', lessons: 0, pool: 1, dryland: 1 },
    { day: 'F', lessons: 1, pool: 1, dryland: 0 },
    { day: 'S', lessons: 0, pool: 0, dryland: 0 },
    { day: 'S', lessons: 0, pool: 1, dryland: 0 },
  ];

  const skillsData = [
    { skill: 'Freestyle Breathing', mastery: 75, sessions: 12 },
    { skill: 'Front Float', mastery: 90, sessions: 8 },
    { skill: 'Body Position', mastery: 65, sessions: 10 },
    { skill: 'Kicking Technique', mastery: 55, sessions: 6 },
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
            <Text style={styles.headerTitle}>Analytics & Insights</Text>
            <Text style={styles.headerSubtitle}>Track your improvement over time</Text>
          </View>

          <View style={styles.streakCard}>
            <View style={styles.streakIcon}>
              <Text style={styles.streakEmoji}>🔥</Text>
            </View>
            <View style={styles.streakContent}>
              <Text style={styles.streakValue}>8-day streak</Text>
              <Text style={styles.streakLabel}>Keep it going!</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>Active</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>This Week</Text>
            </View>

            <View style={styles.weekChart}>
              {weekData.map((day, index) => {
                const totalActivities = day.lessons + day.pool + day.dryland;
                const maxHeight = 100;
                const height = totalActivities > 0 ? (totalActivities / 4) * maxHeight : 4;

                return (
                  <View key={index} style={styles.dayColumn}>
                    <View style={styles.dayBar}>
                      <View
                        style={[
                          styles.activityBar,
                          { 
                            height: Math.max(height, 4),
                            backgroundColor: totalActivities > 0 ? Colors.accent.black : Colors.ui.border,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.dayLabel}>{day.day}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.weekStats}>
              <View style={styles.weekStatItem}>
                <BookOpen size={16} color={Colors.accent.black} />
                <Text style={styles.weekStatValue}>4</Text>
                <Text style={styles.weekStatLabel}>Lessons</Text>
              </View>
              <View style={styles.weekStatDivider} />
              <View style={styles.weekStatItem}>
                <Droplet size={16} color={Colors.accent.black} />
                <Text style={styles.weekStatValue}>4</Text>
                <Text style={styles.weekStatLabel}>Pool</Text>
              </View>
              <View style={styles.weekStatDivider} />
              <View style={styles.weekStatItem}>
                <Dumbbell size={16} color={Colors.accent.black} />
                <Text style={styles.weekStatValue}>2</Text>
                <Text style={styles.weekStatLabel}>Dryland</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Activity size={20} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Overall Stats</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <Clock size={20} color={Colors.accent.black} />
                  <Text style={styles.statCardValue}>18h 34m</Text>
                </View>
                <Text style={styles.statCardLabel}>Total Practice Time</Text>
                <Text style={styles.statCardChange}>+2h from last week</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <Target size={20} color={Colors.accent.black} />
                  <Text style={styles.statCardValue}>2.4 km</Text>
                </View>
                <Text style={styles.statCardLabel}>Distance Swum</Text>
                <Text style={styles.statCardChange}>+400m from last week</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <Award size={20} color={Colors.accent.black} />
                  <Text style={styles.statCardValue}>8</Text>
                </View>
                <Text style={styles.statCardLabel}>Badges Earned</Text>
                <Text style={styles.statCardChange}>2 new this week</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <TrendingUp size={20} color={Colors.accent.success} />
                  <Text style={styles.statCardValue}>25%</Text>
                </View>
                <Text style={styles.statCardLabel}>Improvement Rate</Text>
                <Text style={styles.statCardChange}>Faster than average</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <Activity size={20} color={Colors.accent.info} />
                  <Text style={styles.statCardValue}>1,240</Text>
                </View>
                <Text style={styles.statCardLabel}>Calories Burnt</Text>
                <Text style={styles.statCardChange}>This week</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Skill Mastery</Text>
            </View>

            <View style={styles.skillsContainer}>
              {skillsData.map((item, index) => (
                <View key={index} style={styles.skillCard}>
                  <View style={styles.skillCardHeader}>
                    <Text style={styles.skillName}>{item.skill}</Text>
                    <Text style={styles.skillPercent}>{item.mastery}%</Text>
                  </View>
                  <View style={styles.skillProgressBar}>
                    <View 
                      style={[
                        styles.skillProgressFill, 
                        { 
                          width: `${item.mastery}%`,
                          backgroundColor: item.mastery >= 80 
                            ? Colors.accent.success 
                            : item.mastery >= 60
                            ? Colors.accent.warning
                            : Colors.accent.info
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.skillSessions}>{item.sessions} practice sessions</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Insights</Text>
            </View>

            <View style={styles.insightsContainer}>
              <View style={styles.insightCard}>
                <Text style={styles.insightIcon}>💪</Text>
                <Text style={styles.insightText}>
                  Your in-pool performance improves 18% on days following dryland workouts
                </Text>
              </View>

              <View style={styles.insightCard}>
                <Text style={styles.insightIcon}>⏰</Text>
                <Text style={styles.insightText}>
                  You practice most consistently on Tuesday and Thursday evenings
                </Text>
              </View>

              <View style={styles.insightCard}>
                <Text style={styles.insightIcon}>📈</Text>
                <Text style={styles.insightText}>
                  {`You're learning 25% faster than average for your level`}
                </Text>
              </View>

              <View style={styles.insightCard}>
                <Text style={styles.insightIcon}>🎯</Text>
                <Text style={styles.insightText}>
                  {`You've completed 12 freestyle practice sessions - time to try backstroke!`}
                </Text>
              </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 32,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakEmoji: {
    fontSize: 28,
  },
  streakContent: {
    flex: 1,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: 14,
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  weekChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    paddingBottom: 12,
    height: 160,
    marginBottom: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayBar: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 100,
    marginBottom: 8,
  },
  activityBar: {
    width: 24,
    borderRadius: 12,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  weekStats: {
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
  weekStatItem: {
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  statCardLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  statCardChange: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.accent.success,
  },
  skillsContainer: {
    gap: 12,
  },
  skillCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  skillCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  skillPercent: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.accent.black,
  },
  skillProgressBar: {
    height: 8,
    backgroundColor: Colors.background.light,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  skillProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  skillSessions: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.light,
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightIcon: {
    fontSize: 24,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text.primary,
    lineHeight: 22,
  },
});
