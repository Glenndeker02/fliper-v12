import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Award, MapPin, Target } from 'lucide-react-native';
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
import { supabase, getCurrentUser } from '@/utils/supabase';
import type { AssessmentData, SkillLevel } from '@/constants/types';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const skillLevel = (params.skillLevel as SkillLevel) || 'beginner-1';

  useEffect(() => {
    loadAssessmentData();
  }, []);

  const loadAssessmentData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const { data, error } = await supabase
        .from('assessment_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setAssessment(data as AssessmentData);
    } catch (error) {
      console.error('Error loading assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    router.replace('/(tabs)/home');
  };

  const getSkillLevelInfo = (level: SkillLevel) => {
    switch (level) {
      case 'advanced':
        return {
          title: 'Advanced',
          description: 'Technique refinement & advanced skills'
        };
      case 'intermediate-2':
        return {
          title: 'Intermediate Level 2',
          description: 'Advanced stroke mechanics & endurance'
        };
      case 'intermediate-1':
        return {
          title: 'Intermediate Level 1',
          description: 'Multiple strokes & technique building'
        };
      case 'beginner-2':
        return {
          title: 'Beginner Level 2',
          description: 'Basic strokes & water confidence'
        };
      default:
        return {
          title: 'Beginner Level 1',
          description: 'Water confidence & basic skills'
        };
    }
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    // Water comfort recommendations
    if (assessment?.waterComfort === 'very-uncomfortable' || assessment?.waterComfort === 'uncomfortable') {
      recommendations.push('💪 Focus on dryland breathing exercises to build confidence');
    }

    // Fitness level recommendations
    if (assessment?.fitnessLevel === 'sedentary' || assessment?.fitnessLevel === 'lightly-active') {
      recommendations.push('🏃 Start with shorter sessions and gradually increase duration');
    }

    // Practice frequency recommendations
    const practiceFrequency = assessment?.poolAccess >= 3 
      ? '3x per week' 
      : assessment?.poolAccess >= 2 
        ? '2x per week' 
        : '1x per week';
    recommendations.push(`📅 Start with ${practiceFrequency} in-pool practice`);

    // Learning preferences based recommendations
    if (assessment?.learningPreferences?.includes('Video demonstrations')) {
      recommendations.push('📱 Watch technique videos before each session');
    }

    return recommendations;
  };

  return (
    <LinearGradient
      colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Your Personalized Swimming Journey</Text>
            <Text style={styles.subtitle}>
              Based on your assessment, we've created a customized learning path just for you
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.accent.black} />
              <Text style={styles.loadingText}>Loading your results...</Text>
            </View>
          ) : (
            <View style={styles.levelBadge}>
              <View style={styles.badgeIcon}>
                <Award size={48} color={Colors.accent.black} strokeWidth={1.5} />
              </View>
              <Text style={styles.badgeTitle}>{getSkillLevelInfo(skillLevel).title}</Text>
              <Text style={styles.badgeDescription}>{getSkillLevelInfo(skillLevel).description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={24} color={Colors.accent.black} />
              <Text style={styles.sectionTitle}>Your Starting Point</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Water Confidence & Safety</Text>
              <Text style={styles.cardDescription}>
                Begin with essential water comfort skills and safety awareness
              </Text>
              <View style={styles.lessonsPreview}>
                <Text style={styles.lessonItem}>1. Getting Comfortable in Water</Text>
                <Text style={styles.lessonItem}>2. Breathing Fundamentals</Text>
                <Text style={styles.lessonItem}>3. Floating on Front</Text>
                <Text style={styles.lessonItem}>4. Floating on Back</Text>
              </View>
              <View style={styles.estimateContainer}>
                <Text style={styles.estimateLabel}>Estimated completion:</Text>
                <Text style={styles.estimateValue}>2-4 weeks at your pace</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={24} color={Colors.accent.black} />
              <Text style={styles.sectionTitle}>Your Learning Path</Text>
            </View>
            <View style={styles.roadmap}>
              {(() => {
                let modules;
                switch (skillLevel) {
                  case 'advanced':
                    modules = [
                      { id: 1, title: 'Advanced Technique Analysis', status: 'current' as const },
                      { id: 2, title: 'Race Strategy & Turns', status: 'upcoming' as const },
                      { id: 3, title: 'Advanced Training Sets', status: 'upcoming' as const },
                      { id: 4, title: 'Competition Preparation', status: 'upcoming' as const },
                      { id: 5, title: 'Elite Performance', status: 'locked' as const },
                    ];
                    break;
                  case 'intermediate-2':
                    modules = [
                      { id: 1, title: 'Advanced Stroke Mechanics', status: 'current' as const },
                      { id: 2, title: 'Endurance Building', status: 'upcoming' as const },
                      { id: 3, title: 'Speed Development', status: 'upcoming' as const },
                      { id: 4, title: 'Advanced Drills', status: 'upcoming' as const },
                      { id: 5, title: 'Competition Skills', status: 'locked' as const },
                    ];
                    break;
                  case 'intermediate-1':
                    modules = [
                      { id: 1, title: 'Multiple Stroke Introduction', status: 'current' as const },
                      { id: 2, title: 'Breathing Patterns', status: 'upcoming' as const },
                      { id: 3, title: 'Stroke Efficiency', status: 'upcoming' as const },
                      { id: 4, title: 'Distance Swimming', status: 'upcoming' as const },
                      { id: 5, title: 'Advanced Techniques', status: 'locked' as const },
                    ];
                    break;
                  case 'beginner-2':
                    modules = [
                      { id: 1, title: 'Basic Freestyle', status: 'current' as const },
                      { id: 2, title: 'Breath Control', status: 'upcoming' as const },
                      { id: 3, title: 'Basic Backstroke', status: 'upcoming' as const },
                      { id: 4, title: 'Stroke Development', status: 'upcoming' as const },
                      { id: 5, title: 'Advanced Skills', status: 'locked' as const },
                    ];
                    break;
                  default:
                    modules = [
                      { id: 1, title: 'Water Confidence & Safety', status: 'current' as const },
                      { id: 2, title: 'Floating & Breathing', status: 'upcoming' as const },
                      { id: 3, title: 'Basic Movements', status: 'upcoming' as const },
                      { id: 4, title: 'Stroke Introduction', status: 'upcoming' as const },
                      { id: 5, title: 'Advanced Skills', status: 'locked' as const },
                    ];
                }
                return modules.map((module, index) => (
                <View key={module.id} style={styles.roadmapItem}>
                  <View style={styles.roadmapConnector}>
                    <View
                      style={[
                        styles.roadmapDot,
                        module.status === 'current' && styles.roadmapDotCurrent,
                        module.status === 'locked' && styles.roadmapDotLocked,
                      ]}
                    >
                      <Text style={styles.roadmapNumber}>{module.id}</Text>
                    </View>
                    {index < 4 && (
                      <View
                        style={[
                          styles.roadmapLine,
                          module.status === 'locked' && styles.roadmapLineLocked,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.roadmapContent}>
                    <Text
                      style={[
                        styles.roadmapTitle,
                        module.status === 'locked' && styles.roadmapTitleLocked,
                      ]}
                    >
                      {module.title}
                    </Text>
                    {module.status === 'current' && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Start Here</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))})()}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
            <View style={styles.recommendationsContainer}>
              {getRecommendations().map((recommendation, index) => (
                <View key={index} style={styles.recommendationCard}>
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={handleStart} style={styles.startButton}>
            <Text style={styles.startButtonText}>Start My Journey</Text>
            <View style={styles.arrowCircle}>
              <ArrowRight size={20} color={Colors.text.white} />
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginTop: 16,
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  levelBadge: {
    backgroundColor: Colors.background.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  badgeDescription: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  section: {
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
  card: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  lessonsPreview: {
    gap: 8,
    marginBottom: 16,
    paddingLeft: 8,
  },
  lessonItem: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  estimateContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
    flexDirection: 'row',
    gap: 8,
  },
  estimateLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  estimateValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  roadmap: {
    gap: 0,
  },
  roadmapItem: {
    flexDirection: 'row',
    gap: 16,
  },
  roadmapConnector: {
    alignItems: 'center',
  },
  roadmapDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    borderWidth: 2,
    borderColor: Colors.accent.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roadmapDotCurrent: {
    backgroundColor: Colors.accent.black,
  },
  roadmapDotLocked: {
    backgroundColor: Colors.background.light,
    borderColor: Colors.ui.border,
  },
  roadmapNumber: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  roadmapLine: {
    width: 2,
    height: 48,
    backgroundColor: Colors.accent.black,
  },
  roadmapLineLocked: {
    backgroundColor: Colors.ui.border,
  },
  roadmapContent: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
  roadmapTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  roadmapTitleLocked: {
    color: Colors.text.light,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent.black,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.white,
  },
  recommendationsContainer: {
    gap: 12,
  },
  recommendationCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendationText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: Colors.accent.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.white,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
