import { useRouter } from 'expo-router';
import { ArrowRight, Award, Book, Check, Lock, Play } from 'lucide-react-native';
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
import { getUserProgress } from '@/utils/progressTracker';
import { getCurrentUser } from '@/utils/supabase';
import type { SkillLevel } from '@/constants/types';

interface Module {
  id: number;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  skillLevel: SkillLevel;
  status: 'locked' | 'in-progress' | 'completed';
  progress: number;
}

export default function LearningPathScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [userProgress, setUserProgress] = useState<{
    currentModule: number;
    currentSkillLevel: SkillLevel;
    totalLessonsCompleted: number;
  } | null>(null);

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please sign in to view your learning path');
        return;
      }

      const progress = await getUserProgress(user.id);
      setUserProgress(progress);

      // Generate modules based on skill level
      const generatedModules = generateModules(progress.currentSkillLevel, progress.currentModule);
      setModules(generatedModules);
    } catch (error) {
      console.error('Error loading progress:', error);
      Alert.alert('Error', 'Failed to load your learning path');
    } finally {
      setIsLoading(false);
    }
  };

  const generateModules = (skillLevel: SkillLevel, currentModule: number): Module[] => {
    const modulesByLevel = {
      'beginner-1': [
        {
          id: 1,
          title: 'Water Confidence & Safety',
          description: 'Build comfort and basic safety skills in the water',
          lessons: 4,
          duration: '2-4 weeks',
        },
        {
          id: 2,
          title: 'Floating & Breathing',
          description: 'Master fundamental water skills and breathing techniques',
          lessons: 4,
          duration: '2-4 weeks',
        },
        {
          id: 3,
          title: 'Basic Movements',
          description: 'Learn essential swimming movements and coordination',
          lessons: 5,
          duration: '3-5 weeks',
        },
      ],
      'beginner-2': [
        {
          id: 1,
          title: 'Basic Freestyle',
          description: 'Learn proper freestyle technique and form',
          lessons: 5,
          duration: '3-5 weeks',
        },
        {
          id: 2,
          title: 'Breath Control',
          description: 'Develop advanced breathing patterns and control',
          lessons: 4,
          duration: '2-4 weeks',
        },
        {
          id: 3,
          title: 'Basic Backstroke',
          description: 'Introduction to backstroke technique',
          lessons: 5,
          duration: '3-5 weeks',
        },
      ],
      'intermediate-1': [
        {
          id: 1,
          title: 'Multiple Stroke Introduction',
          description: 'Learn breaststroke and butterfly basics',
          lessons: 6,
          duration: '4-6 weeks',
        },
        {
          id: 2,
          title: 'Breathing Patterns',
          description: 'Master bilateral breathing and stroke-specific patterns',
          lessons: 4,
          duration: '2-4 weeks',
        },
        {
          id: 3,
          title: 'Stroke Efficiency',
          description: 'Improve technique and reduce energy expenditure',
          lessons: 5,
          duration: '3-5 weeks',
        },
      ],
      'intermediate-2': [
        {
          id: 1,
          title: 'Advanced Stroke Mechanics',
          description: 'Perfect all four competitive strokes',
          lessons: 6,
          duration: '4-6 weeks',
        },
        {
          id: 2,
          title: 'Endurance Building',
          description: 'Increase distance and stamina in all strokes',
          lessons: 5,
          duration: '3-5 weeks',
        },
        {
          id: 3,
          title: 'Speed Development',
          description: 'Build power and speed in your swimming',
          lessons: 5,
          duration: '3-5 weeks',
        },
      ],
      'advanced': [
        {
          id: 1,
          title: 'Advanced Technique Analysis',
          description: 'Fine-tune technique for maximum efficiency',
          lessons: 6,
          duration: '4-6 weeks',
        },
        {
          id: 2,
          title: 'Race Strategy & Turns',
          description: 'Master competitive techniques and race planning',
          lessons: 5,
          duration: '3-5 weeks',
        },
        {
          id: 3,
          title: 'Advanced Training Sets',
          description: 'Complex training for peak performance',
          lessons: 6,
          duration: '4-6 weeks',
        },
      ],
    };

    return modulesByLevel[skillLevel].map(module => ({
      ...module,
      skillLevel,
      status: module.id < currentModule ? 'completed' 
        : module.id === currentModule ? 'in-progress' 
        : 'locked',
      progress: module.id < currentModule ? 100 
        : module.id === currentModule ? 25 
        : 0,
    }));
  };

  const handleModulePress = (module: Module) => {
    if (module.status === 'locked') {
      Alert.alert('Module Locked', 'Complete the previous modules to unlock this one.');
      return;
    }

    router.push(`/modules/${module.id}`);
  };

  return (
    <LinearGradient
      colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Learning Path</Text>
          <Text style={styles.subtitle}>
            Progress through modules designed for your skill level
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent.black} />
            <Text style={styles.loadingText}>Loading your learning path...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.skillLevelCard}>
              <Award size={24} color={Colors.accent.black} />
              <View style={styles.skillLevelInfo}>
                <Text style={styles.skillLevelLabel}>Current Level</Text>
                <Text style={styles.skillLevelValue}>
                  {userProgress?.currentSkillLevel.replace('-', ' ').split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </Text>
              </View>
              <View style={styles.lessonsCompletedBadge}>
                <Book size={16} color={Colors.accent.black} />
                <Text style={styles.lessonsCompletedText}>
                  {userProgress?.totalLessonsCompleted || 0} lessons
                </Text>
              </View>
            </View>

            <View style={styles.modulesContainer}>
              {modules.map((module, index) => (
                <Pressable
                  key={module.id}
                  style={styles.moduleCard}
                  onPress={() => handleModulePress(module)}
                >
                  <View style={styles.moduleHeader}>
                    <View style={styles.moduleIcon}>
                      {module.status === 'locked' ? (
                        <Lock size={24} color={Colors.text.light} />
                      ) : module.status === 'completed' ? (
                        <Check size={24} color={Colors.accent.success} />
                      ) : (
                        <Play size={24} color={Colors.accent.black} />
                      )}
                    </View>
                    <View style={styles.moduleInfo}>
                      <Text style={styles.moduleTitle}>{module.title}</Text>
                      <Text style={styles.moduleDuration}>{module.duration}</Text>
                    </View>
                  </View>

                  <Text style={styles.moduleDescription}>{module.description}</Text>

                  <View style={styles.moduleStats}>
                    <View style={styles.statItem}>
                      <Book size={16} color={Colors.text.secondary} />
                      <Text style={styles.statText}>{module.lessons} lessons</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[styles.progressFill, { width: `${module.progress}%` }]}
                      />
                    </View>
                  </View>

                  {module.status !== 'locked' && (
                    <View style={styles.moduleFooter}>
                      <Text style={styles.footerText}>
                        {module.status === 'completed' ? 'Review Module' : 'Continue Learning'}
                      </Text>
                      <View style={styles.arrowCircle}>
                        <ArrowRight size={16} color={Colors.text.white} />
                      </View>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.text.secondary,
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
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  skillLevelCard: {
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
  skillLevelInfo: {
    flex: 1,
    marginLeft: 16,
  },
  skillLevelLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  skillLevelValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  lessonsCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  lessonsCompletedText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent.black,
  },
  modulesContainer: {
    gap: 16,
  },
  moduleCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  moduleDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  moduleDescription: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  moduleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.background.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.black,
    borderRadius: 2,
  },
  moduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent.black,
    borderRadius: 12,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
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
});