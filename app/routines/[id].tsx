import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  CheckCircle,
  Clock,
  AlertTriangle,
  Dumbbell,
} from 'lucide-react-native';
import React, { useState, useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { DRYLAND_ROUTINES, DRYLAND_EXERCISES } from '@/constants/mockData';

export default function RoutinePlayerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const routine = DRYLAND_ROUTINES.find((r) => r.id === id);

  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseTime, setExerciseTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [showReadyModal, setShowReadyModal] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={Colors.accent.error} strokeWidth={2} />
          <Text style={styles.errorText}>Routine not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentRoutineExercise = routine.exercises[currentExerciseIndex];
  const currentExercise = DRYLAND_EXERCISES.find(
    (ex) => ex.id === currentRoutineExercise.exerciseId
  );
  const isLastExercise = currentExerciseIndex === routine.exercises.length - 1;
  const isCompleted = completedExercises.length === routine.exercises.length;

  // Timer logic
  useEffect(() => {
    if (isStarted && !isPaused && !isCompleted) {
      timerRef.current = setInterval(() => {
        if (isResting) {
          setRestTime((prev) => {
            const newTime = prev + 1;
            setTotalTime((t) => t + 1);

            // Check if rest is complete
            if (newTime >= currentRoutineExercise.restAfter) {
              handleNextExercise();
              return 0;
            }
            return newTime;
          });
        } else {
          setExerciseTime((prev) => {
            const newTime = prev + 1;
            setTotalTime((t) => t + 1);

            // Check if exercise is complete
            if (newTime >= currentRoutineExercise.duration) {
              if (currentRoutineExercise.restAfter > 0 && !isLastExercise) {
                setIsResting(true);
                return 0;
              } else {
                handleNextExercise();
                return 0;
              }
            }
            return newTime;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, isPaused, isResting, currentExerciseIndex, isCompleted]);

  const handleStart = () => {
    setShowReadyModal(false);
    setIsStarted(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleNextExercise = () => {
    // Mark current exercise as completed
    if (!completedExercises.includes(currentRoutineExercise.exerciseId)) {
      setCompletedExercises([...completedExercises, currentRoutineExercise.exerciseId]);
    }

    // Move to next exercise or complete
    if (!isLastExercise) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setExerciseTime(0);
      setRestTime(0);
      setIsResting(false);
    } else {
      // Routine complete
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsStarted(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    Alert.alert(
      'Routine Complete!',
      `Great job! You completed ${routine.title} in ${formatTime(totalTime)}.`,
      [
        {
          text: 'View Summary',
          onPress: () => {
            // In production, navigate to routine summary
            router.back();
          },
        },
        {
          text: 'Done',
          onPress: () => router.back(),
          style: 'cancel',
        },
      ]
    );
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Routine?',
      'Are you sure you want to exit? Your progress will not be saved.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Exit',
          onPress: () => router.back(),
          style: 'destructive',
        },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isResting
    ? (restTime / currentRoutineExercise.restAfter) * 100
    : (exerciseTime / currentRoutineExercise.duration) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={isStarted ? handleExit : () => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {routine.title}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Ready Modal */}
        <Modal
          visible={showReadyModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReadyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Get Ready!</Text>
              <Text style={styles.modalSubtitle}>
                {routine.exercises.length} exercises • {routine.duration} minutes
              </Text>

              <View style={styles.equipmentContainer}>
                <Text style={styles.equipmentTitle}>Equipment Needed:</Text>
                {routine.equipment.length > 0 ? (
                  routine.equipment.map((item, index) => (
                    <View key={index} style={styles.equipmentItem}>
                      <CheckCircle
                        size={16}
                        color={Colors.accent.success}
                        strokeWidth={2.5}
                      />
                      <Text style={styles.equipmentText}>{item}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.equipmentText}>No equipment required!</Text>
                )}
              </View>

              <Pressable style={styles.startButton} onPress={handleStart}>
                <Text style={styles.startButtonText}>Start Routine</Text>
              </Pressable>

              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setShowReadyModal(false);
                  router.back();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Main Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentExercise && (
            <>
              {/* Current Exercise Card */}
              <View style={styles.currentExerciseCard}>
                {/* Exercise Title */}
                <Text style={styles.exerciseTitle}>
                  {isResting ? '💧 Rest Time' : currentExercise.title}
                </Text>
                <Text style={styles.exerciseCategory}>
                  {isResting
                    ? 'Take a break and catch your breath'
                    : currentExercise.category.toUpperCase()}
                </Text>

                {/* Timer Display */}
                <View style={styles.timerContainer}>
                  <Clock size={32} color={Colors.text.primary} strokeWidth={2} />
                  <Text style={styles.timerText}>
                    {isResting
                      ? formatTime(restTime)
                      : formatTime(exerciseTime)}
                  </Text>
                  <Text style={styles.timerTotal}>
                    /{' '}
                    {isResting
                      ? formatTime(currentRoutineExercise.restAfter)
                      : formatTime(currentRoutineExercise.duration)}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <LinearGradient
                      colors={
                        isResting
                          ? [Colors.accent.warning, Colors.accent.warning]
                          : [Colors.primary.turquoise, Colors.primary.coral]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{Math.floor(progress)}%</Text>
                </View>

                {/* Reps/Sets Info */}
                {!isResting && (
                  <View style={styles.repsContainer}>
                    {currentRoutineExercise.reps && (
                      <View style={styles.repsBadge}>
                        <Text style={styles.repsText}>
                          {currentRoutineExercise.reps} reps
                        </Text>
                      </View>
                    )}
                    {currentRoutineExercise.sets && (
                      <View style={styles.repsBadge}>
                        <Text style={styles.repsText}>
                          {currentRoutineExercise.sets} sets
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Control Buttons */}
                <View style={styles.controlsRow}>
                  {!isStarted ? (
                    <Pressable style={styles.playButton} onPress={handleStart}>
                      <Play
                        size={32}
                        color={Colors.text.white}
                        fill={Colors.text.white}
                      />
                    </Pressable>
                  ) : (
                    <>
                      <Pressable style={styles.controlButton} onPress={handlePause}>
                        {isPaused ? (
                          <Play size={24} color={Colors.text.white} />
                        ) : (
                          <Pause size={24} color={Colors.text.white} />
                        )}
                      </Pressable>
                      <Pressable
                        style={styles.controlButton}
                        onPress={handleNextExercise}
                      >
                        <SkipForward size={24} color={Colors.text.white} />
                      </Pressable>
                    </>
                  )}
                </View>
              </View>

              {/* Exercise Details (only show when not resting) */}
              {!isResting && currentExercise.steps.length > 0 && (
                <View style={styles.stepsCard}>
                  <Text style={styles.sectionTitle}>How to Perform</Text>
                  {currentExercise.steps.map((step) => (
                    <View key={step.number} style={styles.stepItem}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{step.number}</Text>
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>{step.title}</Text>
                        <Text style={styles.stepDescription}>{step.description}</Text>
                        {step.breathing && (
                          <Text style={styles.stepBreathing}>
                            💨 {step.breathing}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Routine Progress */}
          <View style={styles.progressCard}>
            <Text style={styles.sectionTitle}>Routine Progress</Text>
            <View style={styles.progressList}>
              {routine.exercises.map((exercise, index) => {
                const exerciseData = DRYLAND_EXERCISES.find(
                  (ex) => ex.id === exercise.exerciseId
                );
                const isCompleted = completedExercises.includes(exercise.exerciseId);
                const isCurrent = index === currentExerciseIndex;

                return (
                  <View
                    key={index}
                    style={[
                      styles.progressItem,
                      isCurrent && styles.progressItemCurrent,
                    ]}
                  >
                    <View
                      style={[
                        styles.progressIndicator,
                        {
                          backgroundColor: isCompleted
                            ? Colors.accent.success
                            : isCurrent
                            ? Colors.primary.turquoise
                            : Colors.background.gray,
                        },
                      ]}
                    >
                      {isCompleted ? (
                        <CheckCircle size={16} color={Colors.text.white} />
                      ) : (
                        <Text style={styles.progressNumber}>{index + 1}</Text>
                      )}
                    </View>
                    <View style={styles.progressItemContent}>
                      <Text
                        style={[
                          styles.progressItemTitle,
                          isCurrent && styles.progressItemTitleCurrent,
                        ]}
                      >
                        {exerciseData?.title || 'Exercise'}
                      </Text>
                      <Text style={styles.progressItemDuration}>
                        {formatTime(exercise.duration)}
                        {exercise.reps && ` • ${exercise.reps} reps`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
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
  headerButton: {
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  currentExerciseCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.secondary,
    letterSpacing: 1,
    marginBottom: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  timerTotal: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: Colors.background.gray,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  repsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  repsBadge: {
    backgroundColor: Colors.primary.turquoise + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  repsText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary.turquoise,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary.turquoise,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.turquoise,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  stepsCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary.turquoise,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  stepBreathing: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent.info,
    marginTop: 6,
    fontStyle: 'italic',
  },
  progressCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  progressList: {
    gap: 12,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    opacity: 0.6,
  },
  progressItemCurrent: {
    opacity: 1,
  },
  progressIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.white,
  },
  progressItemContent: {
    flex: 1,
  },
  progressItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  progressItemTitleCurrent: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressItemDuration: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.background.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  equipmentContainer: {
    marginBottom: 24,
  },
  equipmentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  equipmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  startButton: {
    backgroundColor: Colors.primary.turquoise,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.white,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.primary.turquoise,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
});
