import { useRouter } from 'expo-router';
import { ArrowLeft, Mic, Square, Play, Pause, Save, Trash2 } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

export default function VoiceJournalScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      // In production, request microphone permission and start recording
      // const { status } = await Audio.requestPermissionsAsync();
      // if (status !== 'granted') {
      //   Alert.alert('Permission Required', 'Please allow microphone access');
      //   return;
      // }

      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // In production, start actual audio recording
      // const recording = new Audio.Recording();
      // await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      // await recording.startAsync();
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setHasRecording(true);

    // In production, stop actual audio recording
    // await recording.stopAndUnloadAsync();
    // const uri = recording.getURI();
  };

  const pauseRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPaused(true);

    // In production, pause actual recording
    // await recording.pauseAsync();
  };

  const resumeRecording = () => {
    setIsPaused(false);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    // In production, resume actual recording
    // await recording.startAsync();
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);

    // In production, play/pause the recording
    // if (!isPlaying) {
    //   const { sound } = await Audio.Sound.createAsync({ uri });
    //   await sound.playAsync();
    // } else {
    //   await sound.pauseAsync();
    // }
  };

  const deleteRecording = () => {
    Alert.alert(
      'Delete Recording?',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setHasRecording(false);
            setRecordingTime(0);
            setIsPlaying(false);
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!hasRecording) {
      Alert.alert('No Recording', 'Please record a voice note first');
      return;
    }

    setIsSaving(true);

    try {
      // In production, upload audio to Supabase Storage and create journal entry
      // const { data: uploadData } = await supabase.storage
      //   .from('journal-media')
      //   .upload(`audio/${userId}/${Date.now()}.m4a`, audioFile);
      //
      // await createJournal({
      //   user_id: userId,
      //   entry_type: 'voice',
      //   audio_url: uploadData.path,
      // });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Voice Note Saved!', 'Your voice note has been saved successfully.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving voice note:', error);
      Alert.alert('Error', 'Failed to save your voice note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Voice Journal</Text>
          {hasRecording ? (
            <Pressable
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Save size={20} color={Colors.text.white} strokeWidth={2.5} />
            </Pressable>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Recording Card */}
          <View style={styles.recordingCard}>
            {/* Waveform Visual (Simulated) */}
            <View style={styles.waveformContainer}>
              {isRecording && !isPaused ? (
                <View style={styles.waveformActive}>
                  {[...Array(20)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.waveformBar,
                        {
                          height: Math.random() * 60 + 20,
                          backgroundColor:
                            Math.random() > 0.5
                              ? Colors.primary.turquoise
                              : Colors.primary.coral,
                        },
                      ]}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.waveformInactive}>
                  <Mic size={64} color={Colors.text.muted} strokeWidth={1.5} />
                </View>
              )}
            </View>

            {/* Timer */}
            <Text style={styles.timer}>{formatTime(recordingTime)}</Text>

            {/* Status */}
            <View style={styles.statusContainer}>
              {isRecording && !isPaused && (
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.statusText}>Recording...</Text>
                </View>
              )}
              {isPaused && (
                <Text style={styles.statusText}>Paused</Text>
              )}
              {hasRecording && !isRecording && (
                <Text style={styles.statusText}>Recording Complete</Text>
              )}
              {!hasRecording && !isRecording && (
                <Text style={styles.statusText}>Tap to start recording</Text>
              )}
            </View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
              {!isRecording && !hasRecording && (
                <Pressable style={styles.recordButton} onPress={startRecording}>
                  <Mic size={32} color={Colors.text.white} strokeWidth={2.5} />
                </Pressable>
              )}

              {isRecording && (
                <View style={styles.recordingControls}>
                  {!isPaused ? (
                    <Pressable style={styles.pauseButton} onPress={pauseRecording}>
                      <Pause size={24} color={Colors.text.white} strokeWidth={2.5} />
                    </Pressable>
                  ) : (
                    <Pressable style={styles.resumeButton} onPress={resumeRecording}>
                      <Play
                        size={24}
                        color={Colors.text.white}
                        fill={Colors.text.white}
                        strokeWidth={2.5}
                      />
                    </Pressable>
                  )}
                  <Pressable style={styles.stopButton} onPress={stopRecording}>
                    <Square
                      size={24}
                      color={Colors.text.white}
                      fill={Colors.text.white}
                      strokeWidth={2.5}
                    />
                  </Pressable>
                </View>
              )}

              {hasRecording && !isRecording && (
                <View style={styles.playbackControls}>
                  <Pressable style={styles.deleteButton} onPress={deleteRecording}>
                    <Trash2 size={24} color={Colors.accent.error} strokeWidth={2.5} />
                  </Pressable>
                  <Pressable style={styles.playButton} onPress={togglePlayback}>
                    {isPlaying ? (
                      <Pause size={28} color={Colors.text.white} strokeWidth={2.5} />
                    ) : (
                      <Play
                        size={28}
                        color={Colors.text.white}
                        fill={Colors.text.white}
                        strokeWidth={2.5}
                      />
                    )}
                  </Pressable>
                  <Pressable style={styles.rerecordButton} onPress={() => {
                    setHasRecording(false);
                    setRecordingTime(0);
                    setIsPlaying(false);
                  }}>
                    <Mic size={24} color={Colors.primary.turquoise} strokeWidth={2.5} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>🎙️ Voice Recording Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipText}>
                • Find a quiet place to record
              </Text>
              <Text style={styles.tipText}>
                • Speak clearly and at a comfortable pace
              </Text>
              <Text style={styles.tipText}>
                • Describe your swimming experience in detail
              </Text>
              <Text style={styles.tipText}>
                • AI will transcribe and analyze your recording
              </Text>
            </View>
          </View>

          {/* Prompts */}
          <View style={styles.promptsCard}>
            <Text style={styles.promptsTitle}>💭 What to talk about:</Text>
            <View style={styles.promptsList}>
              <Text style={styles.promptItem}>• How you felt during practice</Text>
              <Text style={styles.promptItem}>• Challenges you encountered</Text>
              <Text style={styles.promptItem}>• Progress you noticed</Text>
              <Text style={styles.promptItem}>• Goals for next session</Text>
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
  backButton: {
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
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.turquoise,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.turquoise,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
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
  recordingCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 32,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  waveformContainer: {
    width: '100%',
    height: 120,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: '100%',
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  waveformInactive: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 24,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.error,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  controlsContainer: {
    width: '100%',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent.error,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: Colors.accent.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  recordingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  pauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  deleteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
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
  rerecordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  promptsCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  promptsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  promptsList: {
    gap: 8,
  },
  promptItem: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});
