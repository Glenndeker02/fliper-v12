import { useRouter } from 'expo-router';
import { ArrowLeft, Video as VideoIcon, Square, Play, Save, Trash2, RotateCcw } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function VideoJournalScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      // In production, request camera permission and start recording
      // const { status } = await Camera.requestCameraPermissionsAsync();
      // if (status !== 'granted') {
      //   Alert.alert('Permission Required', 'Please allow camera access');
      //   return;
      // }

      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // In production, start actual video recording
      // await cameraRef.current?.recordAsync();
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

    // In production, stop actual video recording
    // const video = await cameraRef.current?.stopRecording();
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);

    // In production, play/pause the video
    // if (!isPlaying) {
    //   await videoRef.current?.playAsync();
    // } else {
    //   await videoRef.current?.pauseAsync();
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

  const toggleCamera = () => {
    setCameraType((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  const handleSave = async () => {
    if (!hasRecording) {
      Alert.alert('No Recording', 'Please record a video first');
      return;
    }

    setIsSaving(true);

    try {
      // In production, upload video to Supabase Storage and create journal entry
      // const { data: uploadData } = await supabase.storage
      //   .from('journal-media')
      //   .upload(`video/${userId}/${Date.now()}.mp4`, videoFile);
      //
      // await createJournal({
      //   user_id: userId,
      //   entry_type: 'video',
      //   video_url: uploadData.path,
      // });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Video Saved!', 'Your video journal has been saved successfully.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving video:', error);
      Alert.alert('Error', 'Failed to save your video. Please try again.');
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
          <Text style={styles.headerTitle}>Video Journal</Text>
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
          {/* Camera/Preview Card */}
          <View style={styles.videoCard}>
            <View style={styles.videoContainer}>
              {!hasRecording ? (
                // Camera Preview (simulated)
                <View style={styles.cameraPreview}>
                  <VideoIcon size={64} color={Colors.text.white} strokeWidth={1.5} />
                  <Text style={styles.cameraText}>
                    {cameraType === 'front' ? 'Front Camera' : 'Back Camera'}
                  </Text>
                </View>
              ) : (
                // Video Preview (simulated)
                <View style={styles.videoPreview}>
                  <VideoIcon size={64} color={Colors.text.white} strokeWidth={1.5} />
                  <Text style={styles.videoPreviewText}>Video Preview</Text>
                </View>
              )}

              {/* Timer Overlay */}
              {isRecording && (
                <View style={styles.timerOverlay}>
                  <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>REC {formatTime(recordingTime)}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Controls */}
            <View style={styles.videoControls}>
              {!isRecording && !hasRecording && (
                <>
                  <Pressable style={styles.flipButton} onPress={toggleCamera}>
                    <RotateCcw size={24} color={Colors.text.primary} strokeWidth={2.5} />
                  </Pressable>
                  <Pressable style={styles.recordButton} onPress={startRecording}>
                    <VideoIcon size={32} color={Colors.text.white} strokeWidth={2.5} />
                  </Pressable>
                  <View style={styles.controlSpacer} />
                </>
              )}

              {isRecording && (
                <>
                  <View style={styles.controlSpacer} />
                  <Pressable style={styles.stopButton} onPress={stopRecording}>
                    <Square
                      size={28}
                      color={Colors.text.white}
                      fill={Colors.text.white}
                      strokeWidth={2.5}
                    />
                  </Pressable>
                  <Text style={styles.recordingTimeText}>{formatTime(recordingTime)}</Text>
                </>
              )}

              {hasRecording && !isRecording && (
                <>
                  <Pressable style={styles.deleteButton} onPress={deleteRecording}>
                    <Trash2 size={24} color={Colors.accent.error} strokeWidth={2.5} />
                  </Pressable>
                  <Pressable style={styles.playButton} onPress={togglePlayback}>
                    {isPlaying ? (
                      <Play
                        size={32}
                        color={Colors.text.white}
                        fill={Colors.text.white}
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Play
                        size={32}
                        color={Colors.text.white}
                        fill={Colors.text.white}
                        strokeWidth={2.5}
                      />
                    )}
                  </Pressable>
                  <Pressable
                    style={styles.rerecordButton}
                    onPress={() => {
                      setHasRecording(false);
                      setRecordingTime(0);
                      setIsPlaying(false);
                    }}
                  >
                    <VideoIcon size={24} color={Colors.primary.turquoise} strokeWidth={2.5} />
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>📹 Video Recording Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipText}>
                • Record in landscape mode for best viewing
              </Text>
              <Text style={styles.tipText}>
                • Ensure good lighting (natural light works best)
              </Text>
              <Text style={styles.tipText}>
                • Show your technique or describe your progress
              </Text>
              <Text style={styles.tipText}>
                • AI will analyze your form and provide feedback
              </Text>
            </View>
          </View>

          {/* Suggestions */}
          <View style={styles.suggestionsCard}>
            <Text style={styles.suggestionsTitle}>💡 What to record:</Text>
            <View style={styles.suggestionsList}>
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionBullet}>•</Text>
                <Text style={styles.suggestionText}>
                  Record your stroke technique for AI analysis
                </Text>
              </View>
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionBullet}>•</Text>
                <Text style={styles.suggestionText}>
                  Show your progress on a specific skill
                </Text>
              </View>
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionBullet}>•</Text>
                <Text style={styles.suggestionText}>
                  Explain challenges you're facing
                </Text>
              </View>
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionBullet}>•</Text>
                <Text style={styles.suggestionText}>
                  Demonstrate a drill or exercise
                </Text>
              </View>
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
  videoCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  videoContainer: {
    width: '100%',
    height: width * 0.75, // 4:3 aspect ratio
    backgroundColor: Colors.accent.black,
    position: 'relative',
  },
  cameraPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  cameraText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
    marginTop: 16,
  },
  videoPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  videoPreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
    marginTop: 16,
  },
  timerOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.error,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.white,
  },
  videoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  controlSpacer: {
    width: 56,
  },
  flipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
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
    width: 80,
    height: 80,
    borderRadius: 40,
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
  suggestionsCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  suggestionsList: {
    gap: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  suggestionBullet: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});
