import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  CheckCircle,
  Clock,
  AlertTriangle,
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
import { POOL_SESSIONS } from '@/constants/mockData';
import { PoolSessionInterval } from '@/constants/types';

export default function PoolSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const session = POOL_SESSIONS.find((s) => s.id === id);

  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [intervalTime, setIntervalTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [completedIntervals, setCompletedIntervals] = useState<string[]>([]);
  const [showSafetyModal, setShowSafetyModal] = useState(true);
  const [audioCoachingIndex, setAudioCoachingIndex] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={Colors.accent.error} strokeWidth={2} />
          <Text style={styles.errorText}>Session not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentInterval = session.intervals[currentIntervalIndex];
  const progress = (intervalTime / currentInterval.duration) * 100;
  const isLastInterval = currentIntervalIndex === session.intervals.length - 1;
  const isCompleted = completedIntervals.length === session.intervals.length;

  // Timer logic
  useEffect(() => {
    if (isStarted && !isPaused && !isCompleted) {
      timerRef.current = setInterval(() => {
        setIntervalTime((prev) => {
          const newTime = prev + 1;
          setTotalTime((t) => t + 1);

          // Check if interval is complete
          if (newTime >= currentInterval.duration) {
            // Auto-advance to next interval
            handleNextInterval();
            return 0;
          }

          // Audio coaching triggers (at 25%, 50%, 75% of interval)
          const percentage = (newTime / currentInterval.duration) * 100;
          if (
            (percentage >= 25 && percentage < 26 && audioCoachingIndex < 1) ||
            (percentage >= 50 && percentage < 51 && audioCoachingIndex < 2) ||
            (percentage >= 75 && percentage < 76 && audioCoachingIndex < 3)
          ) {
            setAudioCoachingIndex((prev) => prev + 1);
            // In production, trigger actual audio playback here
          }

          return newTime;
        });
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
  }, [isStarted, isPaused, currentInterval, isCompleted]);

  const handleStart = () => {
    setShowSafetyModal(false);
    setIsStarted(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleNextInterval = () => {
    // Mark current interval as completed
    if (!completedIntervals.includes(currentInterval.id)) {
      setCompletedIntervals([...completedIntervals, currentInterval.id]);
    }

    // Move to next interval or complete
    if (!isLastInterval) {
      setCurrentIntervalIndex(currentIntervalIndex + 1);
      setIntervalTime(0);
      setAudioCoachingIndex(0);
    } else {
      // Session complete
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
      'Session Complete!',
      `Great job! You completed ${session.title} in ${formatTime(totalTime)}.`,
      [
        {
          text: 'View Summary',
          onPress: () => {
            // In production, navigate to session summary
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
      'Exit Session?',
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

  const getIntervalTypeColor = (type: PoolSessionInterval['type']) => {
    switch (type) {
      case 'warmup':
        return Colors.accent.success;
      case 'drill':
        return Colors.primary.turquoise;
      case 'practice':
        return Colors.primary.coral;
      case 'rest':
        return Colors.accent.warning;
      case 'cooldown':
        return Colors.accent.info;
      default:
        return Colors.text.secondary;
    }
  };

  const getIntervalTypeIcon = (type: PoolSessionInterval['type']) => {
    switch (type) {
      case 'warmup':
        return '🔥';
      case 'drill':
        return '🎯';
      case 'practice':
        return '💪';
      case 'rest':
        return '💧';
      case 'cooldown':
        return '😌';
      default:
        return '⏱️';
    }
  };

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
            {session.title}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Safety Checklist Modal */}
        <Modal
          visible={showSafetyModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSafetyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Safety Checklist</Text>
              <Text style={styles.modalSubtitle}>
                Before starting, please confirm:
              </Text>

              <View style={styles.checklistContainer}>
                {session.safetyChecklist.map((item, index) => (
                  <View key={index} style={styles.checklistItem}>
                    <CheckCircle
                      size={20}
                      color={Colors.accent.success}
                      strokeWidth={2.5}
                    />
                    <Text style={styles.checklistText}>{item}</Text>
                  </View>
                ))}
              </View>

              <Pressable style={styles.startButton} onPress={handleStart}>
                <Text style={styles.startButtonText}>I Confirm - Start Session</Text>
              </Pressable>

              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setShowSafetyModal(false);
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
          {/* Current Interval Card */}
          <View style={styles.currentIntervalCard}>
            {/* Interval Type Badge */}
            <View style={styles.intervalTypeBadge}>
              <Text style={styles.intervalTypeIcon}>
                {getIntervalTypeIcon(currentInterval.type)}
              </Text>
              <Text style={styles.intervalTypeText}>
                {currentInterval.type.toUpperCase()}
              </Text>
            </View>

            {/* Interval Title */}
            <Text style={styles.intervalTitle}>{currentInterval.title}</Text>
            <Text style={styles.intervalDescription}>
              {currentInterval.description}
            </Text>

            {/* Timer Display */}
            <View style={styles.timerContainer}>
              <Clock size={32} color={Colors.text.primary} strokeWidth={2} />
              <Text style={styles.timerText}>{formatTime(intervalTime)}</Text>
              <Text style={styles.timerTotal}>
                / {formatTime(currentInterval.duration)}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={[
                    getIntervalTypeColor(currentInterval.type),
                    Colors.primary.coral,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{Math.floor(progress)}%</Text>
            </View>

            {/* Control Buttons */}
            <View style={styles.controlsRow}>
              {!isStarted ? (
                <Pressable style={styles.playButton} onPress={handleStart}>
                  <Play size={32} color={Colors.text.white} fill={Colors.text.white} />
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
                    onPress={handleNextInterval}
                  >
                    <SkipForward size={24} color={Colors.text.white} />
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {currentInterval.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionBullet}>
                  <Text style={styles.instructionBulletText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {/* Audio Coaching */}
          {currentInterval.audioCoaching.length > 0 && (
            <View style={styles.audioCoachingCard}>
              <Text style={styles.sectionTitle}>Audio Coaching</Text>
              <View style={styles.audioCoachingContent}>
                <Text style={styles.audioCoachingIcon}>🎤</Text>
                <Text style={styles.audioCoachingText}>
                  {currentInterval.audioCoaching[Math.min(audioCoachingIndex, currentInterval.audioCoaching.length - 1)]}
                </Text>
              </View>
            </View>
          )}

          {/* Interval Progress */}
          <View style={styles.progressCard}>
            <Text style={styles.sectionTitle}>Session Progress</Text>
            <View style={styles.progressList}>
              {session.intervals.map((interval, index) => {
                const isCompleted = completedIntervals.includes(interval.id);
                const isCurrent = index === currentIntervalIndex;

                return (
                  <View
                    key={interval.id}
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
                            ? getIntervalTypeColor(interval.type)
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
                        {interval.title}
                      </Text>
                      <Text style={styles.progressItemDuration}>
                        {formatTime(interval.duration)}
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
  currentIntervalCard: {
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
  intervalTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  intervalTypeIcon: {
    fontSize: 20,
  },
  intervalTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.secondary,
    letterSpacing: 1,
  },
  intervalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  intervalDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 20,
    lineHeight: 22,
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
  instructionsCard: {
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
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  instructionBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary.turquoise,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  instructionBulletText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.white,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  audioCoachingCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  audioCoachingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioCoachingIcon: {
    fontSize: 32,
  },
  audioCoachingText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    fontStyle: 'italic',
    lineHeight: 22,
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
  checklistContainer: {
    gap: 12,
    marginBottom: 24,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    lineHeight: 20,
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
