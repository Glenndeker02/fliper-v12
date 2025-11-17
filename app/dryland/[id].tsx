import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import {
  ArrowLeft,
  Play,
  Pause,
  Calendar,
  CheckCircle2,
  Dumbbell,
  Clock,
  Target,
  Activity,
  Lightbulb,
  AlertTriangle,
  Settings,
  Waves,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { DRYLAND_EXERCISES } from '@/constants/mockData';

const { width } = Dimensions.get('window');

export default function DrylandExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const videoRef = useRef<Video>(null);

  const exercise = DRYLAND_EXERCISES.find((ex) => ex.id === id);

  useEffect(() => {
    // Reset completion state when exercise changes
    setCompleted(false);
  }, [id]);

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Exercise not found</Text>
      </View>
    );
  }

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVideoStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
    }
  };

  const handleMarkComplete = () => {
    setCompleted(true);
    Alert.alert(
      'Exercise Completed! <‰',
      `Great job completing ${exercise.title}! You've earned 25 XP.`,
      [
        {
          text: 'Continue',
          style: 'default',
        },
      ]
    );
  };

  const handleAddToCalendar = () => {
    Alert.alert(
      'Add to Calendar',
      'Schedule this exercise for your workout routine',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: () => console.log('Add to calendar') },
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return Colors.accent.success;
      case 'intermediate':
        return Colors.accent.warning;
      case 'advanced':
        return Colors.accent.error;
      default:
        return Colors.accent.info;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'simulation':
        return <Waves size={16} color={Colors.text.white} />;
      case 'strength':
        return <Dumbbell size={16} color={Colors.text.white} />;
      case 'flexibility':
        return <Activity size={16} color={Colors.text.white} />;
      default:
        return <Target size={16} color={Colors.text.white} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.title}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Video Player */}
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: exercise.videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            onPlaybackStatusUpdate={handleVideoStatusUpdate}
          />
          <Pressable style={styles.playButton} onPress={handlePlayPause}>
            {isPlaying ? (
              <Pause size={32} color={Colors.text.white} fill={Colors.text.white} />
            ) : (
              <Play size={32} color={Colors.text.white} fill={Colors.text.white} />
            )}
          </Pressable>
        </View>

        {/* Exercise Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{exercise.title}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: getDifficultyColor(exercise.difficulty) }]}>
              <Text style={styles.badgeText}>
                {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
              </Text>
            </View>

            <View style={styles.badge}>
              {getCategoryIcon(exercise.category)}
              <Text style={[styles.badgeText, { marginLeft: 4 }]}>
                {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Clock size={18} color={Colors.primary.turquoise} />
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{exercise.duration}</Text>
            </View>

            <View style={styles.detailItem}>
              <Target size={18} color={Colors.primary.turquoise} />
              <Text style={styles.detailLabel}>Target</Text>
              <Text style={styles.detailValue}>{exercise.targetedMuscles[0]}</Text>
            </View>

            <View style={styles.detailItem}>
              <Dumbbell size={18} color={Colors.primary.turquoise} />
              <Text style={styles.detailLabel}>Equipment</Text>
              <Text style={styles.detailValue}>
                {exercise.equipment.length > 0 ? exercise.equipment[0] : 'None'}
              </Text>
            </View>
          </View>
        </View>

        {/* Targeted Muscles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color={Colors.accent.black} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Targeted Muscles</Text>
          </View>
          <View style={styles.musclesContainer}>
            {exercise.targetedMuscles.map((muscle, index) => (
              <View key={index} style={styles.muscleTag}>
                <Text style={styles.muscleText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Step-by-Step Instructions */}
        {exercise.steps && exercise.steps.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CheckCircle2 size={20} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Step-by-Step Instructions</Text>
            </View>
            {exercise.steps.map((step) => (
              <View key={step.number} style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.number}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>

                {step.breathing && (
                  <View style={styles.breathingContainer}>
                    <Text style={styles.breathingLabel}>=¨ Breathing:</Text>
                    <Text style={styles.breathingText}>{step.breathing}</Text>
                  </View>
                )}

                {step.reps && (
                  <View style={styles.repsContainer}>
                    <Text style={styles.repsLabel}><¯ Reps:</Text>
                    <Text style={styles.repsText}>{step.reps}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Form Tips */}
        {exercise.formTips && exercise.formTips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Lightbulb size={20} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Form Tips</Text>
            </View>
            <View style={styles.tipsContainer}>
              {exercise.formTips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Common Mistakes */}
        {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={20} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Common Mistakes to Avoid</Text>
            </View>
            <View style={styles.mistakesContainer}>
              {exercise.commonMistakes.map((mistake, index) => (
                <View key={index} style={styles.mistakeItem}>
                  <Text style={styles.mistakeIcon}>L</Text>
                  <Text style={styles.mistakeText}>{mistake}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Modifications */}
        {exercise.modifications && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Settings size={20} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Modifications</Text>
            </View>
            <View style={styles.modificationsContainer}>
              {exercise.modifications.easier && (
                <View style={styles.modificationCard}>
                  <View style={[styles.modificationHeader, { backgroundColor: Colors.accent.successLight }]}>
                    <Text style={[styles.modificationLabel, { color: Colors.accent.success }]}>
                       Easier
                    </Text>
                  </View>
                  <Text style={styles.modificationText}>{exercise.modifications.easier}</Text>
                </View>
              )}

              {exercise.modifications.harder && (
                <View style={styles.modificationCard}>
                  <View style={[styles.modificationHeader, { backgroundColor: Colors.accent.errorLight }]}>
                    <Text style={[styles.modificationLabel, { color: Colors.accent.error }]}>
                       Harder
                    </Text>
                  </View>
                  <Text style={styles.modificationText}>{exercise.modifications.harder}</Text>
                </View>
              )}

              {exercise.modifications.injury && (
                <View style={styles.modificationCard}>
                  <View style={[styles.modificationHeader, { backgroundColor: Colors.accent.warningLight }]}>
                    <Text style={[styles.modificationLabel, { color: Colors.accent.warning }]}>
                      >y Injury Adaptation
                    </Text>
                  </View>
                  <Text style={styles.modificationText}>{exercise.modifications.injury}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Swimming Connection */}
        {exercise.swimmingConnection && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Waves size={20} color={Colors.accent.black} strokeWidth={2} />
              <Text style={styles.sectionTitle}>How This Helps Your Swimming</Text>
            </View>
            <View style={styles.connectionCard}>
              <Text style={styles.connectionText}>{exercise.swimmingConnection}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={[styles.primaryButton, completed && styles.completedButton]}
            onPress={handleMarkComplete}
            disabled={completed}
          >
            <CheckCircle2 size={20} color={Colors.text.white} />
            <Text style={styles.primaryButtonText}>
              {completed ? 'Completed ' : 'Mark as Complete'}
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleAddToCalendar}>
            <Calendar size={20} color={Colors.primary.turquoise} />
            <Text style={styles.secondaryButtonText}>Add to Calendar</Text>
          </Pressable>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: Colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  videoContainer: {
    width: '100%',
    height: width * 0.5625, // 16:9 aspect ratio
    backgroundColor: Colors.accent.black,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.turquoise,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.white,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  musclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleTag: {
    backgroundColor: Colors.accent.infoLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  muscleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent.info,
  },
  stepCard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.turquoise,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.white,
  },
  stepTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  breathingContainer: {
    backgroundColor: Colors.accent.infoLight,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  breathingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent.info,
    marginBottom: 4,
  },
  breathingText: {
    fontSize: 13,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  repsContainer: {
    backgroundColor: Colors.accent.successLight,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  repsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent.success,
    marginBottom: 4,
  },
  repsText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  tipsContainer: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary.turquoise,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
  },
  mistakesContainer: {
    gap: 12,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.accent.errorLight,
    padding: 12,
    borderRadius: 8,
  },
  mistakeIcon: {
    fontSize: 16,
  },
  mistakeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
  },
  modificationsContainer: {
    gap: 12,
  },
  modificationCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  modificationHeader: {
    padding: 12,
  },
  modificationLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  modificationText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
    padding: 12,
  },
  connectionCard: {
    backgroundColor: Colors.primary.gradient2,
    borderRadius: 12,
    padding: 16,
  },
  connectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text.primary,
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary.turquoise,
    paddingVertical: 16,
    borderRadius: 12,
  },
  completedButton: {
    backgroundColor: Colors.accent.success,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.background.white,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary.turquoise,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary.turquoise,
  },
  bottomPadding: {
    height: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 100,
  },
});
