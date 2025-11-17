import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Audio, Video } from 'expo-av';
import { Camera } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Save,
  Trash2,
  Mic,
  Square,
  Play,
  Pause,
  Video as VideoIcon,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createJournal,
  getSkillProgress,
  getLearningProfile,
  updateLearningProfile,
  recordAdaptiveProgress,
  getJournalEntries,
} from '@/utils/supabase';
import {
  generateMilestoneNotification,
  generateInsightNotification,
  calculateCurrentStreak,
} from '@/utils/adaptiveNotifications';

export default function JournalEntry() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [isVideoRecording, setIsVideoRecording] = useState(false);

  useEffect(() => {
    (async () => {
      if (type === 'voice' || type === 'video') {
        const { status } = await Audio.requestPermissionsAsync();
        setAudioPermission(status === 'granted');
      }
      if (type === 'video') {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setCameraPermission(status === 'granted');
      }
    })();
  }, [type]);

  const startRecording = async () => {
    try {
      if (type === 'voice') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
      } else if (type === 'video' && camera) {
        const video = await camera.recordAsync();
        setVideoUri(video.uri);
      }
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (type === 'voice' && recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setRecording(null);
      } else if (type === 'video' && camera) {
        await camera.stopRecording();
      }
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const playAudio = async () => {
    if (!audioUri) return;

    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri: audioUri });
      setIsPlaying(true);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Get current learning profile and skill progress
      const learningProfile = await getLearningProfile(user.id);
      const skillProgress = await getSkillProgress(user.id, 'swimming');
      const recentEntries = await getJournalEntries(user.id);

      // Prepare journal data
      const journalData = {
        user_id: user.id,
        entry_type: type,
        text_content: type === 'text' ? textContent : null,
        audio_url: type === 'voice' ? audioUri : null,
        video_url: type === 'video' ? videoUri : null,
        ai_analysis: null, // Will be processed by backend
        tags: learningProfile?.focus_areas || [],
        is_private: false,
      };

      // Create journal entry
      const newEntry = await createJournal(journalData);

      // Update learning profile
      if (learningProfile) {
        const streakLength = calculateCurrentStreak([newEntry, ...recentEntries]);
        const engagementBoost = 0.1 * (streakLength >= 3 ? 1.5 : 1); // 50% bonus for 3+ day streaks
        
        await updateLearningProfile(learningProfile.id, {
          engagement_level: Math.min(1, learningProfile.engagement_level + engagementBoost),
          practice_efficiency: Math.min(1, learningProfile.practice_efficiency + 0.05),
        });
      }

      // Record adaptive progress
      await recordAdaptiveProgress({
        user_id: user.id,
        lesson_id: 'journal',
        comprehension_score: skillProgress?.progress_percentage ? skillProgress.progress_percentage / 100 : 0.5,
        engagement_score: learningProfile?.engagement_level || 0.5,
        practice_efficiency: learningProfile?.practice_efficiency || 0.5,
        difficulty_rating: 3,
        adaptivity_metrics: {
          journaling_consistency: true,
          reflection_quality: type === 'text' ? Math.min(1, textContent.length / 500) : 0.7,
          media_usage: type !== 'text',
          learning_style_match: type === 'text' ? 0.8 : type === 'voice' ? 0.9 : 1.0,
        },
      });

      // Generate notifications based on the new entry
      if (learningProfile) {
        const milestoneNotification = generateMilestoneNotification(
          [newEntry, ...recentEntries],
          learningProfile
        );

        if (milestoneNotification) {
          // TODO: Send milestone notification to notification system
          console.log('Milestone achieved:', milestoneNotification);
        }

        const insightNotification = generateInsightNotification(
          [newEntry, ...recentEntries.slice(0, 4)], // Last 5 entries including new one
          learningProfile
        );

        if (insightNotification) {
          // TODO: Send insight notification to notification system
          console.log('New insight generated:', insightNotification);
        }
      }

      router.back();
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const renderContent = () => {
    switch (type) {
      case 'text':
        return (
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Write your thoughts here..."
            value={textContent}
            onChangeText={setTextContent}
          />
        );

      case 'voice':
        return (
          <View style={styles.recordingContainer}>
            {!audioUri ? (
              <Pressable
                style={[styles.recordButton, isRecording && styles.recordingActive]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Mic size={32} color={Colors.text.white} />
                <Text style={styles.recordButtonText}>
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Text>
              </Pressable>
            ) : (
              <Pressable style={styles.playButton} onPress={playAudio}>
                {isPlaying ? (
                  <Pause size={32} color={Colors.text.white} />
                ) : (
                  <Play size={32} color={Colors.text.white} />
                )}
              </Pressable>
            )}
          </View>
        );

      case 'video':
        return (
          <View style={styles.cameraContainer}>
            {!videoUri ? (
              <Camera
                style={styles.camera}
                ref={(ref) => setCamera(ref)}
                type={Camera.Constants.Type.front}
              >
                <View style={styles.cameraControls}>
                  <Pressable
                    style={[styles.recordButton, isRecording && styles.recordingActive]}
                    onPress={isRecording ? stopRecording : startRecording}
                  >
                    <VideoIcon size={32} color={Colors.text.white} />
                    <Text style={styles.recordButtonText}>
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Text>
                  </Pressable>
                </View>
              </Camera>
            ) : (
              <Video
                style={styles.videoPlayback}
                source={{ uri: videoUri }}
                useNativeControls
                resizeMode="contain"
              />
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={handleCancel} style={styles.headerButton}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.title}>
            {type.charAt(0).toUpperCase() + type.slice(1)} Journal
          </Text>
          <Pressable
            onPress={handleSave}
            style={[styles.headerButton, !isLoading && styles.saveButton]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.text.white} />
            ) : (
              <Save size={24} color={Colors.text.white} />
            )}
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: Colors.accent.black,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.text.primary,
    textAlignVertical: 'top',
  },
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accent.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: Colors.accent.error,
  },
  recordButtonText: {
    color: Colors.text.white,
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    minHeight: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayback: {
    flex: 1,
    borderRadius: 20,
  },
});