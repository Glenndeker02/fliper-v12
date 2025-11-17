import { useRouter } from 'expo-router';
import {
  CheckCircle,
  Shield,
  AlertTriangle,
  Heart,
  Users,
  Waves,
  ArrowRight,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { supabase, getCurrentUser } from '@/utils/supabase';

// Safety Topic Type
interface SafetyTopic {
  id: number;
  title: string;
  icon: React.ComponentType<any>;
  videoUrl: string;
  keyTakeaways: string[];
  quizQuestion: string;
  quizOptions: string[];
  correctAnswer: number;
}

// Safety Topics Data (from PRD)
const SAFETY_TOPICS: SafetyTopic[] = [
  {
    id: 1,
    title: 'Never Swim Alone',
    icon: Users,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Placeholder
    keyTakeaways: [
      'Always swim with a buddy or where lifeguards are present',
      'Even experienced swimmers can have emergencies',
      'Tell someone your swim schedule',
      'Know where emergency equipment is located',
    ],
    quizQuestion: 'What should you do before entering the pool?',
    quizOptions: [
      'Jump right in',
      'Tell someone you\'re swimming and when you\'ll be done',
      'Make sure no one else is around',
      'Swim as fast as possible',
    ],
    correctAnswer: 1,
  },
  {
    id: 2,
    title: 'Know Your Limits',
    icon: Heart,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', // Placeholder
    keyTakeaways: [
      'Start in shallow water where you can stand',
      'Recognize signs of fatigue (heavy arms, difficulty breathing)',
      'Rest frequently, especially when learning',
      'Gradual progression prevents injury and builds confidence',
      'If tired, switch to floating or exit the pool',
    ],
    quizQuestion: 'What\'s a sign you should take a break?',
    quizOptions: [
      'You\'re still feeling energetic',
      'Your arms feel heavy and breathing is difficult',
      'You just started swimming',
      'Other people are swimming',
    ],
    correctAnswer: 1,
  },
  {
    id: 3,
    title: 'Pool Safety Rules',
    icon: Shield,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Placeholder
    keyTakeaways: [
      'Never dive in shallow water (check depth markers)',
      'Walk, don\'t run, on pool deck',
      'Know where emergency exits are',
      'Respect lane etiquette when sharing',
      'Follow facility-specific rules',
    ],
    quizQuestion: 'What should you check before diving?',
    quizOptions: [
      'Water temperature',
      'Water depth',
      'What color the water is',
      'How many people are swimming',
    ],
    correctAnswer: 1,
  },
  {
    id: 4,
    title: 'Breathing Emergencies',
    icon: AlertTriangle,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', // Placeholder
    keyTakeaways: [
      'Stay calm if you swallow or inhale water',
      'Cough it out while holding onto wall or floating',
      'Exit pool if persistent coughing',
      'Seek medical attention if difficulty breathing continues',
      '"Dry drowning" is rare but if symptoms persist hours later, seek help',
    ],
    quizQuestion: 'What should you do if you accidentally inhale water?',
    quizOptions: [
      'Panic and flail',
      'Hold your breath',
      'Stay calm, cough it out while holding the wall',
      'Continue swimming immediately',
    ],
    correctAnswer: 2,
  },
  {
    id: 5,
    title: 'Panic Management',
    icon: Waves,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', // Placeholder
    keyTakeaways: [
      'If panicking: Roll to back, float, and breathe',
      'The body naturally floats when relaxed',
      'Signal for help: Wave one arm overhead',
      'Practice floating in shallow water first',
      'Know where lifeguards/help is located',
    ],
    quizQuestion: 'If you panic in water, what should you do first?',
    quizOptions: [
      'Scream and thrash',
      'Try to swim as fast as possible',
      'Roll onto your back and float while breathing',
      'Give up',
    ],
    correctAnswer: 2,
  },
];

export default function SafetyOrientationScreen() {
  const router = useRouter();
  const [currentTopic, setCurrentTopic] = useState(0);
  const [acknowledged, setAcknowledged] = useState<boolean[]>(new Array(5).fill(false));
  const [quizAnswered, setQuizAnswered] = useState<boolean[]>(new Array(5).fill(false));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [videoStatus, setVideoStatus] = useState<'loading' | 'playing' | 'completed'>('loading');
  const [isCompleting, setIsCompleting] = useState(false);

  const topic = SAFETY_TOPICS[currentTopic];
  const isLastTopic = currentTopic === SAFETY_TOPICS.length - 1;
  const canProceed = acknowledged[currentTopic] && quizAnswered[currentTopic];
  const allTopicsComplete = acknowledged.every((ack) => ack) && quizAnswered.every((quiz) => quiz);

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);

    if (answerIndex === topic.correctAnswer) {
      // Correct answer
      const newQuizAnswered = [...quizAnswered];
      newQuizAnswered[currentTopic] = true;
      setQuizAnswered(newQuizAnswered);

      setTimeout(() => {
        Alert.alert('Correct!', 'Great job! You understand this safety principle.', [
          { text: 'Continue', onPress: () => setSelectedAnswer(null) },
        ]);
      }, 300);
    } else {
      // Wrong answer
      setTimeout(() => {
        Alert.alert(
          'Not quite',
          'Please review the key takeaways and try again.',
          [{ text: 'OK', onPress: () => setSelectedAnswer(null) }]
        );
      }, 300);
    }
  };

  const handleAcknowledge = () => {
    const newAcknowledged = [...acknowledged];
    newAcknowledged[currentTopic] = true;
    setAcknowledged(newAcknowledged);
  };

  const handleNextTopic = () => {
    if (canProceed && !isLastTopic) {
      setCurrentTopic(currentTopic + 1);
      setSelectedAnswer(null);
      setVideoStatus('loading');
    }
  };

  const handlePreviousTopic = () => {
    if (currentTopic > 0) {
      setCurrentTopic(currentTopic - 1);
      setSelectedAnswer(null);
      setVideoStatus('loading');
    }
  };

  const handleComplete = async () => {
    if (!allTopicsComplete) {
      Alert.alert('Not Yet', 'Please complete all safety topics before finishing.');
      return;
    }

    setIsCompleting(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'User not found');
        return;
      }

      // Award 100 XP for completing safety orientation
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('total_xp')
        .eq('user_id', user.id)
        .single();

      const newXP = (profile?.total_xp || 0) + 100;

      await supabase
        .from('user_profiles')
        .update({
          total_xp: newXP,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      // Mark safety orientation as complete (you could add a flag to user_profiles if needed)
      // For now, we'll just navigate to home

      // Show success message
      Alert.alert(
        '🎖️ Safety Certification Earned!',
        'You\'ve completed the SwimEase Safety Orientation and earned 100 XP!\n\nYou can review these guidelines anytime in Settings > Safety.',
        [
          {
            text: 'Start First Lesson',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]
      );
    } catch (error) {
      console.error('Error completing safety orientation:', error);
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Shield size={28} color={Colors.primary.turquoise} strokeWidth={2} />
          <Text style={styles.headerTitle}>Safety Orientation</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Topic {currentTopic + 1} of {SAFETY_TOPICS.length}
        </Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {SAFETY_TOPICS.map((t, index) => (
          <View
            key={t.id}
            style={[
              styles.progressDot,
              index === currentTopic && styles.progressDotActive,
              acknowledged[index] && quizAnswered[index] && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Topic Title */}
        <View style={styles.topicHeader}>
          <View style={styles.topicIconContainer}>
            <topic.icon size={32} color={Colors.primary.turquoise} strokeWidth={2} />
          </View>
          <Text style={styles.topicTitle}>{topic.title}</Text>
        </View>

        {/* Video Player */}
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: topic.videoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            onLoad={() => setVideoStatus('playing')}
            onPlaybackStatusUpdate={(status: any) => {
              if (status.didJustFinish) {
                setVideoStatus('completed');
              }
            }}
          />
          {videoStatus === 'loading' && (
            <View style={styles.videoOverlay}>
              <ActivityIndicator size="large" color={Colors.primary.turquoise} />
            </View>
          )}
        </View>

        <Text style={styles.videoDuration}>Duration: ~60 seconds</Text>

        {/* Key Takeaways */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Takeaways</Text>
          <View style={styles.takeawaysList}>
            {topic.keyTakeaways.map((takeaway, index) => (
              <View key={index} style={styles.takeawayItem}>
                <CheckCircle size={20} color={Colors.accent.success} strokeWidth={2} />
                <Text style={styles.takeawayText}>{takeaway}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quiz Question */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Check</Text>
          <Text style={styles.quizQuestion}>{topic.quizQuestion}</Text>
          <View style={styles.quizOptions}>
            {topic.quizOptions.map((option, index) => (
              <Pressable
                key={index}
                style={[
                  styles.quizOption,
                  selectedAnswer === index && index === topic.correctAnswer && styles.quizOptionCorrect,
                  selectedAnswer === index && index !== topic.correctAnswer && styles.quizOptionWrong,
                ]}
                onPress={() => handleQuizAnswer(index)}
                disabled={quizAnswered[currentTopic]}
              >
                <View style={styles.quizOptionRadio}>
                  {selectedAnswer === index && (
                    <View
                      style={[
                        styles.quizOptionRadioInner,
                        index === topic.correctAnswer
                          ? styles.quizOptionRadioInnerCorrect
                          : styles.quizOptionRadioInnerWrong,
                      ]}
                    />
                  )}
                </View>
                <Text style={styles.quizOptionText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Acknowledgment */}
        {quizAnswered[currentTopic] && (
          <View style={styles.section}>
            <Pressable
              style={styles.acknowledgmentContainer}
              onPress={handleAcknowledge}
              disabled={acknowledged[currentTopic]}
            >
              <View
                style={[
                  styles.acknowledgmentCheckbox,
                  acknowledged[currentTopic] && styles.acknowledgmentCheckboxChecked,
                ]}
              >
                {acknowledged[currentTopic] && (
                  <CheckCircle size={20} color={Colors.accent.success} strokeWidth={3} />
                )}
              </View>
              <Text style={styles.acknowledgmentText}>
                I understand the importance of {topic.title.toLowerCase()}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          {currentTopic > 0 && (
            <Pressable style={styles.backButton} onPress={handlePreviousTopic}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          )}

          {!isLastTopic ? (
            <Pressable
              style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
              onPress={handleNextTopic}
              disabled={!canProceed}
            >
              <Text style={styles.nextButtonText}>Next Topic</Text>
              <ArrowRight size={20} color={Colors.text.white} />
            </Pressable>
          ) : (
            <Pressable
              style={[styles.completeButton, !allTopicsComplete && styles.completeButtonDisabled]}
              onPress={handleComplete}
              disabled={!allTopicsComplete || isCompleting}
            >
              {isCompleting ? (
                <ActivityIndicator color={Colors.text.white} />
              ) : (
                <>
                  <Text style={styles.completeButtonText}>Complete Orientation</Text>
                  <CheckCircle size={20} color={Colors.text.white} strokeWidth={2.5} />
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.white,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginLeft: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ui.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary.turquoise,
  },
  progressDotCompleted: {
    backgroundColor: Colors.accent.success,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  topicHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  topicIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  takeawaysList: {
    gap: 12,
  },
  takeawayItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  takeawayText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.primary,
    lineHeight: 22,
  },
  quizQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  quizOptions: {
    gap: 12,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.white,
  },
  quizOptionCorrect: {
    borderColor: Colors.accent.success,
    backgroundColor: Colors.accent.successLight,
  },
  quizOptionWrong: {
    borderColor: Colors.accent.error,
    backgroundColor: Colors.accent.errorLight,
  },
  quizOptionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizOptionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  quizOptionRadioInnerCorrect: {
    backgroundColor: Colors.accent.success,
  },
  quizOptionRadioInnerWrong: {
    backgroundColor: Colors.accent.error,
  },
  quizOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  acknowledgmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.light,
  },
  acknowledgmentCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acknowledgmentCheckboxChecked: {
    borderColor: Colors.accent.success,
    backgroundColor: Colors.background.white,
  },
  acknowledgmentText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary.turquoise,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.ui.border,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.accent.success,
  },
  completeButtonDisabled: {
    backgroundColor: Colors.ui.border,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
});
