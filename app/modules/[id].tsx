import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Award, Book, Calendar, Clock, Play, Target } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { getCurrentUser } from '@/utils/supabase';
import { getModuleProgress } from '@/utils/progressTracker';
import { scheduleNextLesson } from '@/utils/lessonScheduler';
import SchedulingPreferencesModal from '@/components/SchedulingPreferencesModal';
import type { SkillLevel } from '@/constants/types';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  objectives: string[];
  difficulty: string;
  equipment: string[];
  prerequisites: string[];
  status: 'locked' | 'available' | 'completed';
}

export default function ModuleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const moduleId = parseInt(params.id as string, 10);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [moduleProgress, setModuleProgress] = useState<{
    completedLessons: number;
    totalLessons: number;
    avgPerformance: number;
    avgConfidence: number;
    startDate: Date;
    lastActivityDate: Date;
  } | null>(null);

  useEffect(() => {
    loadModuleData();
  }, []);

  const loadModuleData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please sign in to view module details');
        return;
      }

      // Get the user's current skill level from user_profiles
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('skill_level')
        .eq('id', user.id)
        .single();

      const progress = await getModuleProgress(user.id, moduleId, userData.skill_level);
      setModuleProgress(progress);

      // Get module lessons
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .eq('skill_level', userData.skill_level)
        .order('sequence_number', { ascending: true });

      setLessons(lessonData.map(lesson => ({
        ...lesson,
        status: progress?.completedLessons.includes(lesson.id) 
          ? 'completed'
          : lesson.prerequisites?.every(prereq => 
              progress?.completedLessons.includes(prereq)
            )
          ? 'available'
          : 'locked'
      })));
    } catch (error) {
      console.error('Error loading module data:', error);
      Alert.alert('Error', 'Failed to load module details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleLesson = async (preferences: SchedulingPreference) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const nextLesson = lessons.find(lesson => lesson.status === 'available');
      if (!nextLesson) {
        Alert.alert('No Available Lessons', 'Complete the prerequisites to unlock more lessons.');
        return;
      }

      const scheduled = await scheduleNextLesson(
        user.id,
        userData.skill_level,
        moduleId,
        preferences
      );

      if (scheduled) {
        Alert.alert('Success', 'Your next lesson has been scheduled!');
        router.push('/(tabs)/home');
      }
    } catch (error) {
      console.error('Error scheduling lesson:', error);
      Alert.alert('Error', 'Failed to schedule lesson');
    }
  };

  const handleLessonPress = (lesson: Lesson) => {
    if (lesson.status === 'locked') {
      Alert.alert('Lesson Locked', 'Complete the prerequisites to unlock this lesson.');
      return;
    }

    router.push(`/lessons/${lesson.id}`);
  };

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
          <Text style={styles.title}>Module Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent.black} />
            <Text style={styles.loadingText}>Loading module details...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Book size={24} color={Colors.accent.black} />
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle}>Module Progress</Text>
                  <Text style={styles.progressText}>
                    {moduleProgress?.completedLessons || 0} of {moduleProgress?.totalLessons || 0} lessons completed
                  </Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${((moduleProgress?.completedLessons || 0) / 
                        (moduleProgress?.totalLessons || 1)) * 100}%` 
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Award size={20} color={Colors.accent.black} />
                <Text style={styles.statValue}>
                  {Math.round((moduleProgress?.avgPerformance || 0) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Performance</Text>
              </View>
              <View style={styles.statCard}>
                <Target size={20} color={Colors.accent.black} />
                <Text style={styles.statValue}>
                  {Math.round((moduleProgress?.avgConfidence || 0) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Confidence</Text>
              </View>
              <View style={styles.statCard}>
                <Calendar size={20} color={Colors.accent.black} />
                <Text style={styles.statValue}>
                  {moduleProgress?.lastActivityDate
                    ? new Date(moduleProgress.lastActivityDate).toLocaleDateString()
                    : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Last Active</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Lessons</Text>

            <View style={styles.lessonsContainer}>
              {lessons.map((lesson, index) => (
                <Pressable
                  key={lesson.id}
                  style={styles.lessonCard}
                  onPress={() => handleLessonPress(lesson)}
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
                      <View style={styles.durationBadge}>
                        <Clock size={14} color={Colors.text.secondary} />
                        <Text style={styles.durationText}>{lesson.duration}</Text>
                      </View>
                    </View>

                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDescription} numberOfLines={2}>
                      {lesson.description}
                    </Text>

                    {lesson.status === 'locked' ? (
                      <View style={styles.lockedBanner}>
                        <Text style={styles.lockedText}>
                          Complete previous lessons to unlock
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.lessonFooter}>
                        <Text style={styles.footerText}>
                          {lesson.status === 'completed' ? 'Review Lesson' : 'Start Lesson'}
                        </Text>
                        <View style={styles.arrowCircle}>
                          <Play size={16} color={Colors.text.white} />
                        </View>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}

        <View style={styles.footer}>
          <Pressable 
            style={styles.scheduleButton}
            onPress={() => setShowSchedulingModal(true)}
          >
            <Text style={styles.scheduleButtonText}>Schedule Next Lesson</Text>
            <View style={styles.scheduleButtonIcon}>
              <Calendar size={20} color={Colors.text.white} />
            </View>
          </Pressable>
        </View>

        <SchedulingPreferencesModal
          visible={showSchedulingModal}
          onClose={() => setShowSchedulingModal(false)}
          onSave={handleScheduleLesson}
        />
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
  progressCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressInfo: {
    marginLeft: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.black,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  lessonsContainer: {
    gap: 16,
  },
  lessonCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
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
    fontWeight: '700',
    color: Colors.accent.black,
    letterSpacing: 0.5,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  lockedBanner: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.light,
  },
  lessonFooter: {
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
    backgroundColor: Colors.background.white,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    paddingVertical: 16,
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
  scheduleButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});