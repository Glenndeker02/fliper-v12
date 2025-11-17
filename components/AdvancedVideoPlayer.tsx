import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  Camera,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Chapter {
  time: number;
  title: string;
  type: 'setup' | 'execution' | 'mistakes' | 'tips';
}

interface CameraAngle {
  id: string;
  label: string;
  videoUrl: string;
}

interface AdvancedVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  chapters?: Chapter[];
  cameraAngles?: CameraAngle[];
  onProgressUpdate?: (progress: number) => void;
  onComplete?: () => void;
  resumePosition?: number;
}

export default function AdvancedVideoPlayer({
  videoUrl,
  thumbnailUrl,
  duration = 0,
  chapters = [],
  cameraAngles = [],
  onProgressUpdate,
  onComplete,
  resumePosition = 0,
}: AdvancedVideoPlayerProps) {
  const { theme } = useTheme();
  const videoRef = useRef<Video>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(resumePosition);
  const [videoDuration, setVideoDuration] = useState(duration);
  const [isBuffering, setIsBuffering] = useState(false);

  // Controls state
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [quality, setQuality] = useState('auto');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Camera angle state
  const [selectedAngle, setSelectedAngle] = useState(cameraAngles[0]?.id || 'main');
  const [showAngleSelector, setShowAngleSelector] = useState(false);

  // Settings modal
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'speed' | 'quality' | 'captions'>('speed');

  // Auto-hide controls timer
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Format time as MM:SS
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get current chapter based on time
  const getCurrentChapter = () => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentPosition >= chapters[i].time * 1000) {
        return chapters[i];
      }
    }
    return null;
  };

  // Handle video status updates
  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('Video error:', status.error);
      }
      return;
    }

    setIsPlaying(status.isPlaying);
    setIsBuffering(status.isBuffering);
    setCurrentPosition(status.positionMillis);
    setVideoDuration(status.durationMillis || 0);

    // Call progress callback
    if (onProgressUpdate && status.durationMillis) {
      const progress = (status.positionMillis / status.durationMillis) * 100;
      onProgressUpdate(progress);
    }

    // Check if video completed
    if (status.didJustFinish && onComplete) {
      onComplete();
    }
  }, [onProgressUpdate, onComplete]);

  // Play/Pause toggle
  const togglePlayPause = async () => {
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
      // Auto-hide controls after 3 seconds when playing
      resetControlsTimer();
    }
  };

  // Skip backward 10 seconds
  const skipBackward = async () => {
    const newPosition = Math.max(0, currentPosition - 10000);
    await videoRef.current?.setPositionAsync(newPosition);
    setCurrentPosition(newPosition);
  };

  // Skip forward 10 seconds
  const skipForward = async () => {
    const newPosition = Math.min(videoDuration, currentPosition + 10000);
    await videoRef.current?.setPositionAsync(newPosition);
    setCurrentPosition(newPosition);
  };

  // Seek to position
  const handleSeek = async (value: number) => {
    await videoRef.current?.setPositionAsync(value);
    setCurrentPosition(value);
  };

  // Jump to chapter
  const jumpToChapter = async (chapterTime: number) => {
    await videoRef.current?.setPositionAsync(chapterTime * 1000);
    setCurrentPosition(chapterTime * 1000);
  };

  // Toggle mute
  const toggleMute = async () => {
    await videoRef.current?.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  // Change volume
  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    await videoRef.current?.setVolumeAsync(value);
    if (value > 0 && isMuted) {
      setIsMuted(false);
      await videoRef.current?.setIsMutedAsync(false);
    }
  };

  // Change playback speed
  const handleSpeedChange = async (speed: number) => {
    setPlaybackSpeed(speed);
    await videoRef.current?.setRateAsync(speed, true);
    setShowSettings(false);
  };

  // Change quality
  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
    // In production, this would switch video source URLs
    setShowSettings(false);
  };

  // Toggle captions
  const toggleCaptions = () => {
    setCaptionsEnabled(!captionsEnabled);
  };

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await videoRef.current?.dismissFullscreenPlayer();
    } else {
      await videoRef.current?.presentFullscreenPlayer();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Change camera angle
  const handleAngleChange = async (angleId: string) => {
    setSelectedAngle(angleId);
    setShowAngleSelector(false);

    // Get current position before switching
    const position = currentPosition;
    const wasPlaying = isPlaying;

    // Pause current video
    await videoRef.current?.pauseAsync();

    // Find new video URL
    const angle = cameraAngles.find(a => a.id === angleId);
    if (angle) {
      // Load new video source and resume at same position
      await videoRef.current?.unloadAsync();
      await videoRef.current?.loadAsync(
        { uri: angle.videoUrl },
        { positionMillis: position, shouldPlay: wasPlaying }
      );
    }
  };

  // Auto-hide controls
  const resetControlsTimer = () => {
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    setShowControls(true);
    controlsTimer.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Show controls on tap
  const handleTap = () => {
    if (!showControls) {
      setShowControls(true);
      if (isPlaying) {
        resetControlsTimer();
      }
    }
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, []);

  // Get chapter marker positions for timeline
  const getChapterMarkers = () => {
    return chapters.map(chapter => ({
      position: (chapter.time / (videoDuration / 1000)) * 100,
      chapter,
    }));
  };

  const currentAngle = cameraAngles.find(a => a.id === selectedAngle);
  const currentVideoUrl = currentAngle?.videoUrl || videoUrl;

  return (
    <View style={styles.container}>
      {/* Video */}
      <Pressable onPress={handleTap} style={styles.videoWrapper}>
        <Video
          ref={videoRef}
          source={{ uri: currentVideoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping={false}
          volume={volume}
          isMuted={isMuted}
          rate={playbackSpeed}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          progressUpdateIntervalMillis={500}
        />

        {/* Buffering indicator */}
        {isBuffering && (
          <View style={styles.bufferingOverlay}>
            <Text style={styles.bufferingText}>Loading...</Text>
          </View>
        )}

        {/* Controls overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top bar */}
            <View style={styles.topBar}>
              <Text style={styles.videoTitle}>
                {getCurrentChapter()?.title || 'Lesson Video'}
              </Text>
              <Pressable onPress={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize size={24} color={Colors.text.white} />
                ) : (
                  <Maximize size={24} color={Colors.text.white} />
                )}
              </Pressable>
            </View>

            {/* Center play button (when paused) */}
            {!isPlaying && (
              <Pressable style={styles.centerPlayButton} onPress={togglePlayPause}>
                <View style={styles.playButtonCircle}>
                  <Play size={40} color={Colors.text.white} fill={Colors.text.white} />
                </View>
              </Pressable>
            )}

            {/* Bottom bar */}
            <View style={styles.bottomBar}>
              {/* Progress slider with chapter markers */}
              <View style={styles.progressContainer}>
                <Slider
                  style={styles.progressSlider}
                  minimumValue={0}
                  maximumValue={videoDuration}
                  value={currentPosition}
                  onValueChange={handleSeek}
                  minimumTrackTintColor={Colors.primary.turquoise}
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor={Colors.primary.turquoise}
                />

                {/* Chapter markers */}
                <View style={styles.chaptersContainer}>
                  {getChapterMarkers().map((marker, index) => (
                    <Pressable
                      key={index}
                      style={[styles.chapterMarker, { left: `${marker.position}%` }]}
                      onPress={() => jumpToChapter(marker.chapter.time)}
                    >
                      <View style={[
                        styles.chapterDot,
                        { backgroundColor: getChapterColor(marker.chapter.type) }
                      ]} />
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Time display */}
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {formatTime(currentPosition)} / {formatTime(videoDuration)}
                </Text>
              </View>

              {/* Control buttons */}
              <View style={styles.controlButtons}>
                <Pressable onPress={skipBackward} style={styles.controlButton}>
                  <SkipBack size={24} color={Colors.text.white} />
                </Pressable>

                <Pressable onPress={togglePlayPause} style={styles.controlButton}>
                  {isPlaying ? (
                    <Pause size={28} color={Colors.text.white} />
                  ) : (
                    <Play size={28} color={Colors.text.white} fill={Colors.text.white} />
                  )}
                </Pressable>

                <Pressable onPress={skipForward} style={styles.controlButton}>
                  <SkipForward size={24} color={Colors.text.white} />
                </Pressable>

                <View style={styles.spacer} />

                <Pressable onPress={toggleMute} style={styles.controlButton}>
                  {isMuted || volume === 0 ? (
                    <VolumeX size={24} color={Colors.text.white} />
                  ) : (
                    <Volume2 size={24} color={Colors.text.white} />
                  )}
                </Pressable>

                {!isMuted && (
                  <Slider
                    style={styles.volumeSlider}
                    minimumValue={0}
                    maximumValue={1}
                    value={volume}
                    onValueChange={handleVolumeChange}
                    minimumTrackTintColor={Colors.text.white}
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor={Colors.text.white}
                  />
                )}

                <Pressable onPress={() => setShowSettings(true)} style={styles.controlButton}>
                  <Settings size={24} color={Colors.text.white} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </Pressable>

      {/* Camera Angle Selector */}
      {cameraAngles.length > 0 && (
        <View style={styles.angleSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {cameraAngles.map((angle) => (
              <Pressable
                key={angle.id}
                style={[
                  styles.angleButton,
                  selectedAngle === angle.id && styles.angleButtonActive,
                ]}
                onPress={() => handleAngleChange(angle.id)}
              >
                <Camera size={16} color={selectedAngle === angle.id ? Colors.text.white : Colors.text.secondary} />
                <Text
                  style={[
                    styles.angleButtonText,
                    selectedAngle === angle.id && styles.angleButtonTextActive,
                  ]}
                >
                  {angle.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSettings(false)}>
          <View style={styles.settingsModal}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Video Settings</Text>
            </View>

            <View style={styles.settingsTabs}>
              <Pressable
                style={[styles.settingsTab, settingsTab === 'speed' && styles.settingsTabActive]}
                onPress={() => setSettingsTab('speed')}
              >
                <Text style={[styles.settingsTabText, settingsTab === 'speed' && styles.settingsTabTextActive]}>
                  Speed
                </Text>
              </Pressable>
              <Pressable
                style={[styles.settingsTab, settingsTab === 'quality' && styles.settingsTabActive]}
                onPress={() => setSettingsTab('quality')}
              >
                <Text style={[styles.settingsTabText, settingsTab === 'quality' && styles.settingsTabTextActive]}>
                  Quality
                </Text>
              </Pressable>
              <Pressable
                style={[styles.settingsTab, settingsTab === 'captions' && styles.settingsTabActive]}
                onPress={() => setSettingsTab('captions')}
              >
                <Text style={[styles.settingsTabText, settingsTab === 'captions' && styles.settingsTabTextActive]}>
                  Captions
                </Text>
              </Pressable>
            </View>

            <View style={styles.settingsContent}>
              {settingsTab === 'speed' && (
                <View>
                  {[0.5, 0.75, 1.0, 1.25, 1.5].map((speed) => (
                    <Pressable
                      key={speed}
                      style={styles.settingsOption}
                      onPress={() => handleSpeedChange(speed)}
                    >
                      <Text style={styles.settingsOptionText}>
                        {speed}x {speed === 1.0 && '(Normal)'}
                      </Text>
                      {playbackSpeed === speed && (
                        <View style={styles.selectedIndicator} />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}

              {settingsTab === 'quality' && (
                <View>
                  {['Auto', '1080p', '720p', '480p'].map((q) => (
                    <Pressable
                      key={q}
                      style={styles.settingsOption}
                      onPress={() => handleQualityChange(q.toLowerCase())}
                    >
                      <Text style={styles.settingsOptionText}>{q}</Text>
                      {quality === q.toLowerCase() && (
                        <View style={styles.selectedIndicator} />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}

              {settingsTab === 'captions' && (
                <View>
                  <Pressable style={styles.settingsOption} onPress={toggleCaptions}>
                    <Text style={styles.settingsOptionText}>
                      {captionsEnabled ? 'On' : 'Off'}
                    </Text>
                    <View style={[
                      styles.toggle,
                      captionsEnabled && styles.toggleActive
                    ]} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// Helper function to get chapter marker color
function getChapterColor(type: string): string {
  switch (type) {
    case 'setup':
      return Colors.accent.info;
    case 'execution':
      return Colors.accent.success;
    case 'mistakes':
      return Colors.accent.error;
    case 'tips':
      return Colors.accent.warning;
    default:
      return Colors.text.white;
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.background.black,
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.background.black,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingText: {
    color: Colors.text.white,
    fontSize: 16,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  videoTitle: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  centerPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
  },
  playButtonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 8,
  },
  progressContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  progressSlider: {
    width: '100%',
    height: 40,
  },
  chaptersContainer: {
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    height: 4,
    pointerEvents: 'box-none',
  },
  chapterMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    marginTop: -8,
  },
  chapterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.text.white,
  },
  timeContainer: {
    marginBottom: 12,
  },
  timeText: {
    color: Colors.text.white,
    fontSize: 14,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    padding: 8,
  },
  spacer: {
    flex: 1,
  },
  volumeSlider: {
    width: 80,
    height: 40,
  },
  angleSelector: {
    backgroundColor: Colors.background.white,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  angleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: Colors.background.gray,
    gap: 6,
  },
  angleButtonActive: {
    backgroundColor: Colors.primary.turquoise,
  },
  angleButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  angleButtonTextActive: {
    color: Colors.text.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  settingsModal: {
    backgroundColor: Colors.background.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  settingsHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  settingsTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  settingsTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  settingsTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.turquoise,
  },
  settingsTabText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  settingsTabTextActive: {
    color: Colors.primary.turquoise,
    fontWeight: '600',
  },
  settingsContent: {
    padding: 20,
  },
  settingsOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  settingsOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary.turquoise,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background.gray,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: Colors.primary.turquoise,
  },
});
