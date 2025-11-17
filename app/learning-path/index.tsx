import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Brain,
  Clock,
  FlaskConical,
  Lightbulb,
  Star,
  Target,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import {
  LearnerProfile,
  LearningPathRecommendation,
  PerformanceMetrics,
  analyzeLearnerProfile,
  calculatePerformanceMetrics,
  generateLearningPathRecommendations,
} from '@/utils/ml/learningEngine';

export default function AdaptiveLearningScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<LearningPathRecommendation | null>(
    null
  );

  useEffect(() => {
    if (user) {
      loadLearningPath();
    }
  }, [user]);

  const loadLearningPath = async () => {
    try {
      const profile = await analyzeLearnerProfile(user!.id);
      setLearnerProfile(profile);

      const performanceMetrics = await calculatePerformanceMetrics(user!.id);
      setMetrics(performanceMetrics);

      const pathRecommendations = await generateLearningPathRecommendations(
        user!.id,
        profile,
        performanceMetrics
      );
      setRecommendations(pathRecommendations);
    } catch (error) {
      console.error('Error loading learning path:', error);
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

  if (isLoading || !learnerProfile || !metrics || !recommendations) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Analyzing your learning style...</Text>
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
            <ArrowLeft size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.title}>Personalized Learning</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileCard}>
            <Brain size={32} color={Colors.accent.black} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileTitle}>Your Learning Style</Text>
              <Text style={styles.profileDetail}>
                {learnerProfile.learningStyle.charAt(0).toUpperCase() +
                  learnerProfile.learningStyle.slice(1)}{' '}
                Learner
              </Text>
              <Text style={styles.profileSubtext}>
                {learnerProfile.preferredPace.charAt(0).toUpperCase() +
                  learnerProfile.preferredPace.slice(1)}{' '}
                paced • Level {getSkillLevelLabel(learnerProfile.skillLevel)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color={Colors.text.primary} />
              <Text style={styles.sectionTitle}>Focus Areas</Text>
            </View>
            <View style={styles.focusAreasContainer}>
              {learnerProfile.focusAreas.map((area, index) => (
                <View key={index} style={styles.focusArea}>
                  <Text style={styles.focusAreaText}>{area}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={Colors.text.primary} />
              <Text style={styles.sectionTitle}>Performance Insights</Text>
            </View>
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {Math.round(metrics.lessonCompletionRate)}%
                </Text>
                <Text style={styles.metricLabel}>Completion Rate</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {Math.round(metrics.skillMasteryRate)}%
                </Text>
                <Text style={styles.metricLabel}>Skill Mastery</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{metrics.averageConfidence}/5</Text>
                <Text style={styles.metricLabel}>Confidence</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Lightbulb size={20} color={Colors.text.primary} />
              <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
            </View>
            <View style={styles.recommendationsContainer}>
              {recommendations.nextLessons.map((lessonId, index) => (
                <Pressable
                  key={index}
                  style={styles.lessonCard}
                  onPress={() => router.push(`/lessons/${lessonId}` as any)}
                >
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>Lesson {index + 1}</Text>
                    <Text style={styles.lessonDesc}>
                      Difficulty: {recommendations.difficultyLevel}/5
                    </Text>
                  </View>
                  <View style={styles.lessonAction}>
                    <Text style={styles.actionText}>Start</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FlaskConical size={20} color={Colors.text.primary} />
              <Text style={styles.sectionTitle}>Practice Suggestions</Text>
            </View>
            <View style={styles.suggestionsContainer}>
              {recommendations.practiceSuggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.timeEstimate}>
              <Clock size={20} color={Colors.text.primary} />
              <Text style={styles.timeEstimateText}>
                Estimated time to next level:{' '}
                <Text style={styles.timeEstimateValue}>
                  {recommendations.estimatedTimeToMastery} days
                </Text>
              </Text>
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
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileDetail: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent.black,
    marginBottom: 4,
  },
  profileSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  focusAreasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  focusArea: {
    backgroundColor: Colors.primary.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  focusAreaText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent.black,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    flex: 1,
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
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  recommendationsContainer: {
    gap: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  lessonDesc: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  lessonAction: {
    backgroundColor: Colors.accent.black,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.white,
  },
  suggestionsContainer: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 16,
    padding: 16,
  },
  timeEstimateText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  timeEstimateValue: {
    fontWeight: '700',
    color: Colors.accent.black,
  },
});