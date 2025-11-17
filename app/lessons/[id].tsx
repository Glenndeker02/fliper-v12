import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Play, CheckCircle2, BookOpen, Target, ThumbsUp, ThumbsDown, Minus, Lightbulb } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { MODULES } from '@/constants/mockData';
import { suggestFoundationalLessons, suggestAdvancedLessons } from '@/utils/adaptiveLearning';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LessonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Array<{id: string, title: string, reason: string}>>([]);

  const lesson = MODULES.flatMap((m) => m.lessons).find((l) => l.id === id);

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text>Lesson not found</Text>
      </View>
    );
  }

  const handlePlayPress = () => {
    if (isPlaying) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleFeedback = (feedback: 'too-easy' | 'just-right' | 'too-hard') => {
    setSelectedFeedback(feedback);
    
    // In a real app, this would be saved to Supabase
    console.log('Lesson feedback:', { lessonId: lesson.id, feedback });
    
    // Generate recommendations based on feedback
    let newRecommendations: Array<{id: string, title: string, reason: string}> = [];
    
    if (feedback === 'too-hard') {
      // Suggest foundational lessons
      const foundationalLessons = suggestFoundationalLessons(MODULES, lesson.id, ['getting-comfortable']);
      newRecommendations = foundationalLessons.map(l => ({
        id: l.id,
        title: l.title,
        reason: 'Review this foundational skill to build confidence'
      }));
    } else if (feedback === 'too-easy') {
      // Suggest advanced lessons
      const advancedLessons = suggestAdvancedLessons(MODULES, lesson.id, ['getting-comfortable', 'breathing-fundamentals']);
      newRecommendations = advancedLessons.map(l => ({
        id: l.id,
        title: l.title,
        reason: 'Try this more advanced skill to keep progressing'
      }));
    }
    
    setRecommendations(newRecommendations);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
          style={styles.gradient}
        >
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={{ uri: lesson.videoUrl }}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping={false}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded) {
                  setIsPlaying(status.isPlaying);
                }
              }}
            />
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text.white} />
            </Pressable>
            {!isPlaying && (
              <Pressable style={styles.playOverlay} onPress={handlePlayPress}>
                <View style={styles.playButton}>
                  <Play size={32} color={Colors.text.white} fill={Colors.text.white} />
                </View>
              </Pressable>
            )}
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{lesson.difficulty.toUpperCase()}</Text>
                </View>
                <Text style={styles.duration}>{lesson.duration}</Text>
              </View>
              <Text style={styles.title}>{lesson.title}</Text>
              <Text style={styles.description}>{lesson.description}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <BookOpen size={20} color={Colors.accent.black} strokeWidth={2} />
                <Text style={styles.sectionTitle}>What You'll Learn</Text>
              </View>
              <View style={styles.card}>
                {lesson.skills.map((skill, index) => (
                  <View key={index} style={styles.skillItem}>
                    <View style={styles.skillBullet} />
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={20} color={Colors.accent.black} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Self-Assessment</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardDescription}>
                  Check off each skill as you master it:
                </Text>
                {lesson.checklistItems.map((item, index) => (
                  <Pressable key={index} style={styles.checklistItem}>
                    <View style={styles.checkbox}>
                      <CheckCircle2 size={24} color={Colors.ui.border} />
                    </View>
                    <Text style={styles.checklistText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Practice Tips</Text>
              <View style={styles.tipCard}>
                <Text style={styles.tipText}>
                  💡 Practice this skill in shallow water first where you can stand comfortably.
                  {'\n\n'}
                  🌊 Focus on relaxation - tension makes floating harder.
                  {'\n\n'}
                  ⏱️ Start with short holds (10-15 seconds) and gradually increase duration.
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How was this lesson?</Text>
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackDescription}>
                  Your feedback helps us personalize your learning experience.
                </Text>
                <View style={styles.feedbackButtons}>
                  <Pressable 
                    style={[styles.feedbackButton, selectedFeedback === 'too-hard' && styles.selectedFeedbackButton]}
                    onPress={() => handleFeedback('too-hard')}
                  >
                    <ThumbsDown 
                      size={24} 
                      color={selectedFeedback === 'too-hard' ? Colors.text.white : Colors.text.primary} 
                    />
                    <Text style={[styles.feedbackButtonText, selectedFeedback === 'too-hard' && styles.selectedFeedbackButtonText]}>
                      Too Hard
                    </Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.feedbackButton, selectedFeedback === 'just-right' && styles.selectedFeedbackButton]}
                    onPress={() => handleFeedback('just-right')}
                  >
                    <Minus 
                      size={24} 
                      color={selectedFeedback === 'just-right' ? Colors.text.white : Colors.text.primary} 
                    />
                    <Text style={[styles.feedbackButtonText, selectedFeedback === 'just-right' && styles.selectedFeedbackButtonText]}>
                      Just Right
                    </Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.feedbackButton, selectedFeedback === 'too-easy' && styles.selectedFeedbackButton]}
                    onPress={() => handleFeedback('too-easy')}
                  >
                    <ThumbsUp 
                      size={24} 
                      color={selectedFeedback === 'too-easy' ? Colors.text.white : Colors.text.primary} 
                    />
                    <Text style={[styles.feedbackButtonText, selectedFeedback === 'too-easy' && styles.selectedFeedbackButtonText]}>
                      Too Easy
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {recommendations.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Lightbulb size={20} color={Colors.accent.black} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Recommended for You</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.recommendationsText}>
                    Based on your feedback, we've suggested these lessons:
                  </Text>
                  {recommendations.map((recommendedLesson, index) => (
                    <Pressable 
                      key={index}
                      style={styles.recommendationItem}
                      onPress={() => router.push(`/lessons/${recommendedLesson.id}` as any)}
                    >
                      <Text style={styles.recommendationTitle}>{recommendedLesson.title}</Text>
                      <Text style={styles.recommendationReason}>
                        {recommendedLesson.reason}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <Pressable style={styles.completeButton}>
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
              <View style={styles.checkCircle}>
                <CheckCircle2 size={20} color={Colors.text.white} />
              </View>
            </Pressable>
          </ScrollView>
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.5625,
    backgroundColor: Colors.accent.black,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    padding: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  difficultyBadge: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.accent.black,
    letterSpacing: 0.5,
  },
  duration: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  card: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardDescription: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  skillBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent.black,
    marginTop: 7,
  },
  skillText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  checkbox: {
    width: 28,
    height: 28,
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.black,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  tipText: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    paddingVertical: 18,
    marginHorizontal: 24,
    marginTop: 8,
    shadowColor: Colors.accent.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.white,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  feedbackDescription: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  selectedFeedbackButton: {
    backgroundColor: Colors.accent.black,
  },
  selectedFeedbackButtonText: {
    color: Colors.text.white,
  },
  recommendationsText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  recommendationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  recommendationReason: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
});
