import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Clock,
  Flame,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Share2,
  ChevronRight,
} from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

type TimePeriod = 'week' | 'month' | '3months' | 'year' | 'all';

// Mock data - in production, fetch from Supabase
const generateMockData = (period: TimePeriod) => {
  const getDataPoints = () => {
    switch (period) {
      case 'week':
        return 7;
      case 'month':
        return 30;
      case '3months':
        return 12; // weeks
      case 'year':
        return 12; // months
      case 'all':
        return 24; // months
      default:
        return 7;
    }
  };

  const points = getDataPoints();
  return Array.from({ length: points }, (_, i) => ({
    label:
      period === 'week'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]
        : period === 'month'
        ? `${i + 1}`
        : `W${i + 1}`,
    value: Math.floor(Math.random() * 100) + 20,
    lessons: Math.floor(Math.random() * 3),
    pool: Math.floor(Math.random() * 2),
    dryland: Math.floor(Math.random() * 2),
  }));
};

export default function DetailedAnalyticsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const chartData = useMemo(
    () => generateMockData(selectedPeriod),
    [selectedPeriod]
  );

  const periods: Array<{ value: TimePeriod; label: string }> = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: '3months', label: '3M' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All' },
  ];

  const statsData = {
    totalTime: { value: '48h 32m', change: +15, trend: 'up' as const },
    totalDistance: { value: '12.8 km', change: +22, trend: 'up' as const },
    avgSession: { value: '42 min', change: -5, trend: 'down' as const },
    consistency: { value: '85%', change: +8, trend: 'up' as const },
    caloriesBurned: { value: '3,240', change: +18, trend: 'up' as const },
    xpEarned: { value: '2,850', change: +25, trend: 'up' as const },
  };

  const skills Data = [
    { skill: 'Freestyle', mastery: 82, trend: 'up' as const, change: 12 },
    { skill: 'Breathing', mastery: 75, trend: 'up' as const, change: 8 },
    { skill: 'Body Position', mastery: 68, trend: 'up' as const, change: 15 },
    { skill: 'Kicking', mastery: 58, trend: 'up' as const, change: 10 },
    { skill: 'Floating', mastery: 92, trend: 'stable' as const, change: 2 },
    { skill: 'Turns', mastery: 45, trend: 'up' as const, change: 18 },
  ];

  const goalsData = [
    {
      goal: 'Swim 3x per week',
      current: 2,
      target: 3,
      unit: 'times',
      icon: '🏊',
    },
    {
      goal: 'Master freestyle breathing',
      current: 75,
      target: 100,
      unit: '%',
      icon: '💨',
    },
    {
      goal: 'Complete 20 lessons',
      current: 14,
      target: 20,
      unit: 'lessons',
      icon: '📚',
    },
    {
      goal: 'Earn 3000 XP',
      current: 2850,
      target: 3000,
      unit: 'XP',
      icon: '⭐',
    },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.value));

  const handleExport = () => {
    Alert.alert(
      'Export Analytics',
      'Choose export format',
      [
        { text: 'PDF Report', onPress: () => {} },
        { text: 'CSV Data', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Share Progress', 'Share your swimming progress with others');
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderTrendIcon = (trend: 'up' | 'down' | 'stable', change: number) => {
    if (trend === 'up') {
      return (
        <View style={[styles.trendBadge, styles.trendUp]}>
          <TrendingUp size={12} color={Colors.accent.success} strokeWidth={3} />
          <Text style={[styles.trendText, styles.trendTextUp]}>+{change}%</Text>
        </View>
      );
    }
    if (trend === 'down') {
      return (
        <View style={[styles.trendBadge, styles.trendDown]}>
          <TrendingDown size={12} color={Colors.accent.error} strokeWidth={3} />
          <Text style={[styles.trendText, styles.trendTextDown]}>{change}%</Text>
        </View>
      );
    }
    return (
      <View style={[styles.trendBadge, styles.trendStable]}>
        <Text style={[styles.trendText, styles.trendTextStable]}>—</Text>
      </View>
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
          <Text style={styles.headerTitle}>Detailed Analytics</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} onPress={handleShare}>
              <Share2 size={20} color={Colors.text.primary} strokeWidth={2.5} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleExport}>
              <Download size={20} color={Colors.text.primary} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Time Period Selector */}
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <Pressable
                key={period.value}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.value && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.value)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.value && styles.periodButtonTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Progress Chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>Activity Overview</Text>
                <Text style={styles.chartSubtitle}>
                  Total sessions this {selectedPeriod}
                </Text>
              </View>
              <BarChart3 size={24} color={Colors.primary.turquoise} strokeWidth={2} />
            </View>

            <View style={styles.chart}>
              {chartData.map((point, index) => {
                const height = (point.value / maxValue) * 120;
                return (
                  <View key={index} style={styles.chartColumn}>
                    <View style={styles.chartBar}>
                      <LinearGradient
                        colors={[Colors.primary.turquoise, Colors.primary.coral]}
                        style={[styles.chartBarFill, { height }]}
                      />
                    </View>
                    <Text style={styles.chartLabel}>{point.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Key Metrics Grid */}
          <View style={styles.metricsGrid}>
            {Object.entries(statsData).map(([key, data]) => (
              <View key={key} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricValue}>{data.value}</Text>
                  {renderTrendIcon(data.trend, data.change)}
                </View>
                <Text style={styles.metricLabel}>
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                </Text>
              </View>
            ))}
          </View>

          {/* Goals Section */}
          <Pressable
            style={styles.expandableSection}
            onPress={() => toggleSection('goals')}
          >
            <View style={styles.sectionHeader}>
              <Target size={20} color={Colors.primary.turquoise} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Goals Progress</Text>
              <ChevronRight
                size={20}
                color={Colors.text.secondary}
                style={{
                  transform: [
                    { rotate: expandedSection === 'goals' ? '90deg' : '0deg' },
                  ],
                }}
              />
            </View>
          </Pressable>

          {expandedSection === 'goals' && (
            <View style={styles.goalsContainer}>
              {goalsData.map((goal, index) => {
                const progress = (goal.current / goal.target) * 100;
                return (
                  <View key={index} style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                      <Text style={styles.goalIcon}>{goal.icon}</Text>
                      <View style={styles.goalInfo}>
                        <Text style={styles.goalName}>{goal.goal}</Text>
                        <Text style={styles.goalProgress}>
                          {goal.current} / {goal.target} {goal.unit}
                        </Text>
                      </View>
                      <Text style={styles.goalPercent}>{Math.round(progress)}%</Text>
                    </View>
                    <View style={styles.goalProgressBar}>
                      <LinearGradient
                        colors={[Colors.primary.turquoise, Colors.primary.coral]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.goalProgressFill, { width: `${progress}%` }]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Skills Mastery Section */}
          <Pressable
            style={styles.expandableSection}
            onPress={() => toggleSection('skills')}
          >
            <View style={styles.sectionHeader}>
              <Activity size={20} color={Colors.primary.turquoise} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Skills Mastery</Text>
              <ChevronRight
                size={20}
                color={Colors.text.secondary}
                style={{
                  transform: [
                    { rotate: expandedSection === 'skills' ? '90deg' : '0deg' },
                  ],
                }}
              />
            </View>
          </Pressable>

          {expandedSection === 'skills' && (
            <View style={styles.skillsContainer}>
              {skillsData.map((skill, index) => (
                <View key={index} style={styles.skillCard}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName}>{skill.skill}</Text>
                    <View style={styles.skillMeta}>
                      {renderTrendIcon(skill.trend, skill.change)}
                      <Text style={styles.skillMastery}>{skill.mastery}%</Text>
                    </View>
                  </View>
                  <View style={styles.skillProgressBar}>
                    <LinearGradient
                      colors={
                        skill.mastery >= 80
                          ? [Colors.accent.success, Colors.accent.success]
                          : skill.mastery >= 60
                          ? [Colors.accent.warning, Colors.accent.warning]
                          : [Colors.accent.info, Colors.accent.info]
                      }
                      style={[
                        styles.skillProgressFill,
                        { width: `${skill.mastery}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Detailed Insights */}
          <Pressable
            style={styles.expandableSection}
            onPress={() => toggleSection('insights')}
          >
            <View style={styles.sectionHeader}>
              <Flame size={20} color={Colors.primary.turquoise} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>AI-Powered Insights</Text>
              <ChevronRight
                size={20}
                color={Colors.text.secondary}
                style={{
                  transform: [
                    { rotate: expandedSection === 'insights' ? '90deg' : '0deg' },
                  ],
                }}
              />
            </View>
          </Pressable>

          {expandedSection === 'insights' && (
            <View style={styles.insightsContainer}>
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>🚀</Text>
                  <Text style={styles.insightTitle}>Peak Performance Time</Text>
                </View>
                <Text style={styles.insightText}>
                  Your best sessions happen on Tuesday and Thursday evenings.
                  Consider scheduling more practice during these times.
                </Text>
              </View>

              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>💪</Text>
                  <Text style={styles.insightTitle}>Dryland Impact</Text>
                </View>
                <Text style={styles.insightText}>
                  Pool performance improves 23% on days following dryland workouts.
                  Keep up the cross-training!
                </Text>
              </View>

              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>⚡</Text>
                  <Text style={styles.insightTitle}>Skill Focus Recommendation</Text>
                </View>
                <Text style={styles.insightText}>
                  Your freestyle has improved significantly (+12%). Time to focus on
                  backstroke technique to maintain balanced progress.
                </Text>
              </View>

              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>📈</Text>
                  <Text style={styles.insightTitle}>Learning Velocity</Text>
                </View>
                <Text style={styles.insightText}>
                  {`You're progressing 28% faster than the average learner at your level.
                  Excellent consistency!`}
                </Text>
              </View>

              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>🎯</Text>
                  <Text style={styles.insightTitle}>Next Milestone</Text>
                </View>
                <Text style={styles.insightText}>
                  {`You're 6 sessions away from mastering freestyle breathing.
                  Complete 2 more this week to stay on track!`}
                </Text>
              </View>
            </View>
          )}

          {/* Activity Breakdown */}
          <Pressable
            style={styles.expandableSection}
            onPress={() => toggleSection('breakdown')}
          >
            <View style={styles.sectionHeader}>
              <PieChart size={20} color={Colors.primary.turquoise} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Activity Breakdown</Text>
              <ChevronRight
                size={20}
                color={Colors.text.secondary}
                style={{
                  transform: [
                    { rotate: expandedSection === 'breakdown' ? '90deg' : '0deg' },
                  ],
                }}
              />
            </View>
          </Pressable>

          {expandedSection === 'breakdown' && (
            <View style={styles.breakdownContainer}>
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownBar}>
                  <View
                    style={[styles.breakdownFill, { width: '60%', backgroundColor: Colors.primary.turquoise }]}
                  />
                </View>
                <View style={styles.breakdownInfo}>
                  <Text style={styles.breakdownLabel}>Video Lessons</Text>
                  <Text style={styles.breakdownValue}>24 sessions • 60%</Text>
                </View>
              </View>

              <View style={styles.breakdownItem}>
                <View style={styles.breakdownBar}>
                  <View
                    style={[styles.breakdownFill, { width: '25%', backgroundColor: Colors.primary.coral }]}
                  />
                </View>
                <View style={styles.breakdownInfo}>
                  <Text style={styles.breakdownLabel}>Pool Practice</Text>
                  <Text style={styles.breakdownValue}>10 sessions • 25%</Text>
                </View>
              </View>

              <View style={styles.breakdownItem}>
                <View style={styles.breakdownBar}>
                  <View
                    style={[styles.breakdownFill, { width: '15%', backgroundColor: Colors.accent.warning }]}
                  />
                </View>
                <View style={styles.breakdownInfo}>
                  <Text style={styles.breakdownLabel}>Dryland Routines</Text>
                  <Text style={styles.breakdownValue}>6 sessions • 15%</Text>
                </View>
              </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.accent.black,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  periodButtonTextActive: {
    color: Colors.text.white,
  },
  chartCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  chartBar: {
    width: '80%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 120,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendUp: {
    backgroundColor: Colors.accent.success + '20',
  },
  trendDown: {
    backgroundColor: Colors.accent.error + '20',
  },
  trendStable: {
    backgroundColor: Colors.background.gray,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trendTextUp: {
    color: Colors.accent.success,
  },
  trendTextDown: {
    color: Colors.accent.error,
  },
  trendTextStable: {
    color: Colors.text.secondary,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  expandableSection: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  goalsContainer: {
    gap: 12,
    marginTop: 16,
  },
  goalCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 24,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  goalProgress: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  goalPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: Colors.background.white,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  skillsContainer: {
    gap: 12,
    marginTop: 16,
  },
  skillCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  skillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillMastery: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  skillProgressBar: {
    height: 8,
    backgroundColor: Colors.background.white,
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightsContainer: {
    gap: 12,
    marginTop: 16,
  },
  insightCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  insightIcon: {
    fontSize: 24,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  insightText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  breakdownContainer: {
    gap: 16,
    marginTop: 16,
  },
  breakdownItem: {
    gap: 10,
  },
  breakdownBar: {
    height: 12,
    backgroundColor: Colors.background.light,
    borderRadius: 6,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 6,
  },
  breakdownInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
});
