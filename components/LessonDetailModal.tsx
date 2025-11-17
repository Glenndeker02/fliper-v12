import { useRouter } from 'expo-router';
import { 
  BookOpen, 
  Clock, 
  Flame, 
  Shield, 
  Target, 
  ThumbsUp, 
  ThumbsDown, 
  Minus,
  Play,
  CheckCircle2
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Colors from '@/constants/colors';
import type { Lesson } from '@/constants/types';

interface LessonDetailModalProps {
  lesson: Lesson;
  onClose: () => void;
  onFeedback?: (feedback: 'too-easy' | 'just-right' | 'too-hard') => void;
}

export default function LessonDetailModal({ lesson, onClose, onFeedback }: LessonDetailModalProps) {
  const router = useRouter();
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);

  const handleFeedback = (feedback: 'too-easy' | 'just-right' | 'too-hard') => {
    setSelectedFeedback(feedback);
    if (onFeedback) {
      onFeedback(feedback);
    }
  };

  const handleStartLesson = () => {
    router.push(`/lessons/${lesson.id}`);
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
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
              <Target size={20} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Expected Outcomes</Text>
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

          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Flame size={24} color={Colors.accent.black} />
              <Text style={styles.statValue}>~{Math.floor(Math.random() * 50) + 30} cal</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <Shield size={24} color={Colors.accent.black} />
              <Text style={styles.statValue}>3 muscle groups</Text>
              <Text style={styles.statLabel}>Worked</Text>
            </View>
            <View style={styles.statCard}>
              <BookOpen size={24} color={Colors.accent.black} />
              <Text style={styles.statValue}>Beginner+</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Safety Reminders</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.safetyText}>
                • Always swim with a buddy or under supervision
                {'\n'}
                • Ensure proper pool depth for skill level
                {'\n'}
                • Take breaks as needed to avoid fatigue
                {'\n'}
                • Stay hydrated before and after session
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CheckCircle2 size={20} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Self-Assessment Checklist</Text>
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
            <Text style={styles.sectionTitle}>How was this lesson?</Text>
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackDescription}>
                Your feedback helps us personalize your learning experience.
              </Text>
              <View style={styles.feedbackButtons}>
                <Pressable 
                  style={[
                    styles.feedbackButton, 
                    selectedFeedback === 'too-hard' && styles.selectedFeedbackButton
                  ]}
                  onPress={() => handleFeedback('too-hard')}
                >
                  <ThumbsDown 
                    size={24} 
                    color={selectedFeedback === 'too-hard' ? Colors.text.white : Colors.text.primary} 
                  />
                  <Text style={[
                    styles.feedbackButtonText,
                    selectedFeedback === 'too-hard' && styles.selectedFeedbackButtonText
                  ]}>
                    Too Hard
                  </Text>
                </Pressable>
                <Pressable 
                  style={[
                    styles.feedbackButton, 
                    selectedFeedback === 'just-right' && styles.selectedFeedbackButton
                  ]}
                  onPress={() => handleFeedback('just-right')}
                >
                  <Minus 
                    size={24} 
                    color={selectedFeedback === 'just-right' ? Colors.text.white : Colors.text.primary} 
                  />
                  <Text style={[
                    styles.feedbackButtonText,
                    selectedFeedback === 'just-right' && styles.selectedFeedbackButtonText
                  ]}>
                    Just Right
                  </Text>
                </Pressable>
                <Pressable 
                  style={[
                    styles.feedbackButton, 
                    selectedFeedback === 'too-easy' && styles.selectedFeedbackButton
                  ]}
                  onPress={() => handleFeedback('too-easy')}
                >
                  <ThumbsUp 
                    size={24} 
                    color={selectedFeedback === 'too-easy' ? Colors.text.white : Colors.text.primary} 
                  />
                  <Text style={[
                    styles.feedbackButtonText,
                    selectedFeedback === 'too-easy' && styles.selectedFeedbackButtonText
                  ]}>
                    Too Easy
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Close</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={handleStartLesson}>
            <Play size={20} color={Colors.text.white} fill={Colors.text.white} />
            <Text style={styles.primaryButtonText}>Start Lesson</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.background.white,
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
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
    backgroundColor: Colors.background.light,
    borderRadius: 20,
    padding: 20,
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
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginVertical: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  safetyText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
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
  feedbackCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 20,
    padding: 20,
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
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.ui.border,
  },
  selectedFeedbackButton: {
    backgroundColor: Colors.accent.black,
    borderColor: Colors.accent.black,
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  selectedFeedbackButtonText: {
    color: Colors.text.white,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 0,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    paddingVertical: 18,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.white,
  },
});