import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Play,
  Pause,
  StopCircle,
  ChevronRight,
  CheckCircle,
  Clock,
  Droplet,
  Award,
  TrendingUp,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import Colors from '@/constants/colors';
import { POOL_SESSIONS } from '@/constants/mockData';
import { PoolSession, PoolSessionInterval } from '@/constants/types';
import { supabase, getCurrentUser } from '@/utils/supabase';

type SessionStage = 'safety-check' | 'active' | 'completed';
type SessionStatus = 'ready' | 'playing' | 'paused';

export default function PoolSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [session, setSession] = useState<PoolSession | null>(null);
  const [stage, setStage] = useState<SessionStage>('safety-check');
  const [status, setStatus] = useState<SessionStatus>('ready');
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [completedIntervals, setCompletedIntervals] = useState<string[]>([]);
  const [safetyChecked, setSafetyChecked] = useState<boolean[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioCoachingIndex, setAudioCoachingIndex] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Load session data
  useEffect(() => {
    const foundSession = POOL_SESSIONS.find((s) => s.id === id);
    if (foundSession) {
      setSession(foundSession);
      setSafetyChecked(new Array(foundSession.safetyChecklist.length).fill(false));
    } else {
      Alert.alert('Error', 'Session not found', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [id]);

  // Current interval
  const currentInterval = session?.intervals[currentIntervalIndex];

  // Timer logic
  useEffect(() => {
    if (status === 'playing' && stage === 'active') {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Interval completed
            handleIntervalComplete();
            return 0;
          }
          return prev - 1;
        });
        setTotalTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, stage]);

  // Progress animation
  useEffect(() => {
    if (currentInterval) {
      const progress = 1 - timeRemaining / currentInterval.duration;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [timeRemaining, currentInterval]);

  // Audio coaching
  useEffect(() => {
    if (
      status === 'playing' &&
      stage === 'active' &&
      currentInterval &&
      audioEnabled &&
      currentInterval.audioCoaching.length > 0
    ) {
      const intervalDuration = currentInterval.duration;
      const coachingCount = currentInterval.audioCoaching.length;
      const speakInterval = Math.floor(intervalDuration / coachingCount);

      // Speak at intervals
      if (timeRemaining === intervalDuration) {
        // Start of interval
        speakText(currentInterval.audioCoaching[0]);
        setAudioCoachingIndex(1);
      } else if (
        audioCoachingIndex < coachingCount &&
        timeRemaining === intervalDuration - speakInterval * audioCoachingIndex
      ) {
        speakText(currentInterval.audioCoaching[audioCoachingIndex]);
        setAudioCoachingIndex((prev) => prev + 1);
      }

      // Countdown audio for last 5 seconds
      if (timeRemaining <= 5 && timeRemaining > 0) {
        speakText(`${timeRemaining}`);
      }
    }
  }, [timeRemaining, status, stage, currentInterval, audioEnabled, audioCoachingIndex]);

  const speakText = (text: string) => {
    if (audioEnabled) {
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    }
  };

  const handleIntervalComplete = useCallback(() => {
    if (!currentInterval || !session) return;

    Vibration.vibrate(500);
    setCompletedIntervals((prev) => [...prev, currentInterval.id]);

    if (currentIntervalIndex < session.intervals.length - 1) {
      // Move to next interval
      const nextIndex = currentIntervalIndex + 1;
      const nextInterval = session.intervals[nextIndex];
      setCurrentIntervalIndex(nextIndex);
      setTimeRemaining(nextInterval.duration);
      setAudioCoachingIndex(0);

      // Auto-pause between intervals
      setStatus('paused');
      speakText(`${currentInterval.title} complete! Next up: ${nextInterval.title}. Press play when ready.`);
    } else {
      // Session complete
      handleSessionComplete();
    }
  }, [currentInterval, currentIntervalIndex, session]);

  const handleSessionComplete = async () => {
    setStatus('ready');
    setStage('completed');
    Speech.stop();

    speakText('Congratulations! Session complete!');
    Vibration.vibrate([500, 200, 500]);

    // Save session to database
    try {
      const user = await getCurrentUser();
      if (user && session) {
        // Award XP based on session duration
        const xpEarned = Math.floor(session.duration * 5); // 5 XP per minute

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('total_xp')
          .eq('user_id', user.id)
          .single();

        await supabase
          .from('user_profiles')
          .update({
            total_xp: (profile?.total_xp || 0) + xpEarned,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        // Save session progress (would need to add this table to schema)
        // For now, we'll just track in user_profiles or create a simple log
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleStartSession = () => {
    if (!session) return;

    const allChecked = safetyChecked.every((checked) => checked);
    if (!allChecked) {
      Alert.alert('Safety First', 'Please complete all safety checks before starting.');
      return;
    }

    setStage('active');
    setSessionStartTime(new Date());
    setTimeRemaining(session.intervals[0].duration);
    setStatus('playing');
  };

  const handleTogglePlayPause = () => {
    if (status === 'playing') {
      setStatus('paused');
      Speech.pause();
    } else {
      setStatus('playing');
      Speech.resume();
    }
  };

  const handleStopSession = () => {
    Alert.alert(
      'Stop Session?',
      'Are you sure you want to stop? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            setStatus('ready');
            Speech.stop();
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            router.back();
          },
        },
      ]
    );
  };

  const handleToggleSafetyCheck = (index: number) => {
    const newChecked = [...safetyChecked];
    newChecked[index] = !newChecked[index];
    setSafetyChecked(newChecked);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIntervalTypeColor = (type: PoolSessionInterval['type']) => {
    switch (type) {
      case 'warmup':
        return Colors.accent.info;
      case 'drill':
        return Colors.primary.turquoise;
      case 'practice':
        return Colors.primary.coral;
      case 'rest':
        return Colors.accent.success;
      case 'cooldown':
        return Colors.accent.info;
      default:
        return Colors.text.secondary;
    }
  };

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // SAFETY CHECK SCREEN
  if (stage === 'safety-check') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <LinearGradient
          colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>Safety Check</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Session Info */}
            <View style={styles.sessionInfoCard}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <Text style={styles.sessionDescription}>{session.description}</Text>
              <View style={styles.sessionMeta}>
                <View style={styles.metaItem}>
                  <Clock size={16} color={Colors.text.secondary} />
                  <Text style={styles.metaText}>{session.duration} min</Text>
                </View>
                <View style={styles.metaItem}>
                  <Droplet size={16} color={Colors.text.secondary} />
                  <Text style={styles.metaText}>{session.level}</Text>
                </View>
                <View style={styles.metaItem}>
                  <TrendingUp size={16} color={Colors.text.secondary} />
                  <Text style={styles.metaText}>{session.estimatedCalories} cal</Text>
                </View>
              </View>
            </View>

            {/* Equipment */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Equipment Needed</Text>
              <View style={styles.equipmentList}>
                {session.equipment.map((item, index) => (
                  <View key={index} style={styles.equipmentChip}>
                    <Text style={styles.equipmentText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Safety Checklist */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Safety Checklist</Text>
              <Text style={styles.sectionSubtitle}>
                Complete all checks before starting
              </Text>
              <View style={styles.checklistContainer}>
                {session.safetyChecklist.map((item, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.checklistItem,
                      safetyChecked[index] && styles.checklistItemChecked,
                    ]}
                    onPress={() => handleToggleSafetyCheck(index)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        safetyChecked[index] && styles.checkboxChecked,
                      ]}
                    >
                      {safetyChecked[index] && (
                        <CheckCircle size={20} color={Colors.accent.success} strokeWidth={2.5} />
                      )}
                    </View>
                    <Text style={styles.checklistText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Focus Areas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Focus Areas</Text>
              <View style={styles.focusAreasList}>
                {session.focusAreas.map((area, index) => (
                  <View key={index} style={styles.focusChip}>
                    <Text style={styles.focusText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Start Button */}
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.startButton,
                !safetyChecked.every((c) => c) && styles.startButtonDisabled,
              ]}
              onPress={handleStartSession}
              disabled={!safetyChecked.every((c) => c)}
            >
              <Text style={styles.startButtonText}>Start Session</Text>
              <ChevronRight size={20} color={Colors.text.white} />
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // ACTIVE SESSION SCREEN
  if (stage === 'active' && currentInterval) {
    const progress = session.intervals.reduce((acc, interval, index) => {
      if (index < currentIntervalIndex) return acc + interval.duration;
      if (index === currentIntervalIndex) return acc + (interval.duration - timeRemaining);
      return acc;
    }, 0);
    const totalDuration = session.intervals.reduce((acc, interval) => acc + interval.duration, 0);
    const overallProgress = progress / totalDuration;

    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.activeSessionContainer}>
          {/* Header */}
          <View style={styles.activeHeader}>
            <Pressable onPress={() => setAudioEnabled(!audioEnabled)} style={styles.audioButton}>
              {audioEnabled ? (
                <Volume2 size={24} color={Colors.text.white} />
              ) : (
                <VolumeX size={24} color={Colors.text.white} />
              )}
            </Pressable>
            <Text style={styles.sessionTitleActive}>{session.title}</Text>
            <Pressable onPress={handleStopSession} style={styles.stopButton}>
              <X size={24} color={Colors.text.white} />
            </Pressable>
          </View>

          {/* Overall Progress */}
          <View style={styles.overallProgressContainer}>
            <Text style={styles.overallProgressLabel}>Session Progress</Text>
            <View style={styles.overallProgressBar}>
              <View
                style={[styles.overallProgressFill, { width: `${overallProgress * 100}%` }]}
              />
            </View>
            <Text style={styles.overallProgressText}>
              Interval {currentIntervalIndex + 1} of {session.intervals.length}
            </Text>
          </View>

          {/* Current Interval */}
          <View style={styles.currentIntervalCard}>
            <View
              style={[
                styles.intervalTypeBadge,
                { backgroundColor: getIntervalTypeColor(currentInterval.type) },
              ]}
            >
              <Text style={styles.intervalTypeText}>
                {currentInterval.type.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.currentIntervalTitle}>{currentInterval.title}</Text>
            <Text style={styles.currentIntervalDescription}>
              {currentInterval.description}
            </Text>

            {/* Timer */}
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              <View style={styles.timerProgressContainer}>
                <Animated.View
                  style={[
                    styles.timerProgress,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Instructions:</Text>
              {currentInterval.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionBullet} />
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <Pressable
              style={styles.playPauseButton}
              onPress={handleTogglePlayPause}
            >
              {status === 'playing' ? (
                <Pause size={40} color={Colors.text.white} fill={Colors.text.white} />
              ) : (
                <Play size={40} color={Colors.text.white} fill={Colors.text.white} />
              )}
            </Pressable>
          </View>

          {/* Status Text */}
          <Text style={styles.statusText}>
            {status === 'playing' ? 'Session in progress' : 'Paused - Press play to continue'}
          </Text>

          {/* Interval List */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.intervalsList}
            contentContainerStyle={styles.intervalsListContent}
          >
            {session.intervals.map((interval, index) => (
              <View
                key={interval.id}
                style={[
                  styles.intervalChip,
                  index === currentIntervalIndex && styles.intervalChipActive,
                  completedIntervals.includes(interval.id) && styles.intervalChipCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.intervalChipText,
                    index === currentIntervalIndex && styles.intervalChipTextActive,
                    completedIntervals.includes(interval.id) && styles.intervalChipTextCompleted,
                  ]}
                >
                  {interval.title}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // COMPLETION SCREEN
  if (stage === 'completed') {
    const completionTimeMin = Math.floor(totalTimeElapsed / 60);
    const xpEarned = Math.floor(session.duration * 5);

    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <LinearGradient
          colors={[Colors.accent.success, Colors.accent.successLight]}
          style={styles.gradient}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.completionContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Celebration */}
            <View style={styles.celebrationContainer}>
              <Award size={80} color={Colors.text.white} strokeWidth={2} />
              <Text style={styles.celebrationTitle}>Session Complete!</Text>
              <Text style={styles.celebrationSubtitle}>
                Outstanding work in the pool today
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Clock size={32} color={Colors.primary.turquoise} />
                <Text style={styles.statValue}>{completionTimeMin} min</Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>
              <View style={styles.statCard}>
                <Droplet size={32} color={Colors.primary.turquoise} />
                <Text style={styles.statValue}>{session.estimatedDistance || 0}m</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={32} color={Colors.primary.turquoise} />
                <Text style={styles.statValue}>{session.estimatedCalories}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
              <View style={styles.statCard}>
                <Award size={32} color={Colors.primary.turquoise} />
                <Text style={styles.statValue}>+{xpEarned}</Text>
                <Text style={styles.statLabel}>XP Earned</Text>
              </View>
            </View>

            {/* Intervals Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Intervals Completed</Text>
              {session.intervals.map((interval, index) => (
                <View key={interval.id} style={styles.summaryItem}>
                  <CheckCircle size={20} color={Colors.accent.success} />
                  <Text style={styles.summaryItemText}>{interval.title}</Text>
                  <Text style={styles.summaryItemTime}>{formatTime(interval.duration)}</Text>
                </View>
              ))}
            </View>

            {/* Achievements */}
            <View style={styles.achievementCard}>
              <Text style={styles.achievementTitle}>🎉 Great Job!</Text>
              <Text style={styles.achievementText}>
                You completed {session.intervals.length} intervals and stayed committed to your
                swimming journey. Keep up the excellent work!
              </Text>
            </View>
          </ScrollView>

          {/* Done Button */}
          <View style={styles.footer}>
            <Pressable style={styles.doneButton} onPress={() => router.back()}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.white,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sessionInfoCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentChip: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  equipmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  checklistContainer: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.ui.border,
  },
  checklistItemChecked: {
    borderColor: Colors.accent.success,
    backgroundColor: Colors.accent.successLight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: Colors.accent.success,
    backgroundColor: Colors.background.white,
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  focusAreasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  focusChip: {
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  focusText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: Colors.accent.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonDisabled: {
    backgroundColor: Colors.ui.border,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.white,
  },
  activeSessionContainer: {
    flex: 1,
    backgroundColor: Colors.accent.black,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionTitleActive: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallProgressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  overallProgressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.white,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  overallProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary.turquoise,
  },
  overallProgressText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.white,
    opacity: 0.8,
  },
  currentIntervalCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 24,
    padding: 24,
    margin: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  intervalTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  intervalTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.white,
    letterSpacing: 1,
  },
  currentIntervalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  currentIntervalDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  timerProgressContainer: {
    width: '100%',
    height: 12,
    backgroundColor: Colors.background.light,
    borderRadius: 6,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    backgroundColor: Colors.primary.turquoise,
  },
  instructionsContainer: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  instructionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary.turquoise,
    marginTop: 6,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.turquoise,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.turquoise,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  intervalsList: {
    paddingHorizontal: 20,
  },
  intervalsListContent: {
    gap: 8,
    paddingBottom: 20,
  },
  intervalChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  intervalChipActive: {
    backgroundColor: Colors.primary.turquoise,
  },
  intervalChipCompleted: {
    backgroundColor: Colors.accent.success,
  },
  intervalChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.white,
    opacity: 0.6,
  },
  intervalChipTextActive: {
    opacity: 1,
    fontWeight: '700',
  },
  intervalChipTextCompleted: {
    opacity: 1,
  },
  completionContent: {
    padding: 20,
  },
  celebrationContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  celebrationTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.white,
    marginTop: 24,
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.white,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  summaryCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  summaryItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  summaryItemTime: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  achievementCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  achievementText: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  doneButton: {
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.accent.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.white,
  },
});
