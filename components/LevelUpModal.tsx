import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Sparkles, Trophy, Gift, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { LevelUpData, getLevelColor, getLevelIcon, formatXP } from '@/utils/gamification';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LevelUpModalProps {
  visible: boolean;
  levelUpData: LevelUpData | null;
  onClose: () => void;
}

export default function LevelUpModal({ visible, levelUpData, onClose }: LevelUpModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const [showPerks, setShowPerks] = useState(false);

  useEffect(() => {
    if (visible && levelUpData) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(confettiAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(confettiAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      // Auto-show perks after 1 second
      setTimeout(() => {
        setShowPerks(true);
      }, 1000);
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      confettiAnim.setValue(0);
      setShowPerks(false);
    }
  }, [visible, levelUpData]);

  if (!levelUpData) return null;

  const newLevelColor = getLevelColor(levelUpData.newLevel);
  const newLevelIcon = getLevelIcon(levelUpData.newLevel);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Confetti animation style
  const confettiStyle = {
    opacity: confettiAnim,
    transform: [
      {
        translateY: confettiAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, SCREEN_HEIGHT],
        }),
      },
    ],
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} />

        {/* Confetti effect */}
        <View style={styles.confettiContainer} pointerEvents="none">
          {[...Array(20)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.confetti,
                confettiStyle,
                {
                  left: `${(index * 5) % 100}%`,
                  backgroundColor: index % 3 === 0 ? newLevelColor : Colors.accent.warning,
                },
              ]}
            />
          ))}
        </View>

        {/* Main content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[newLevelColor, getLevelColor(levelUpData.newLevel + 1)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Sparkles decoration */}
            <View style={styles.sparklesContainer}>
              <Sparkles size={24} color={Colors.text.white} fill={Colors.text.white} />
            </View>

            {/* Level up badge */}
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>{newLevelIcon}</Text>
              </View>
              <View style={styles.levelRing}>
                <Text style={styles.levelNumber}>{levelUpData.newLevel}</Text>
              </View>
            </View>

            {/* Congratulations text */}
            <View style={styles.textContainer}>
              <Text style={styles.congratsText}>Level Up!</Text>
              <Text style={styles.levelTitle}>{levelUpData.newTitle}</Text>
              <Text style={styles.levelSubtitle}>
                You've reached level {levelUpData.newLevel}
              </Text>
            </View>

            {/* XP display */}
            <View style={styles.xpContainer}>
              <Trophy size={20} color={Colors.text.white} strokeWidth={2.5} />
              <Text style={styles.xpText}>{formatXP(levelUpData.totalXP)} Total XP</Text>
            </View>

            {/* Unlocked perks */}
            {showPerks && (
              <View style={styles.perksContainer}>
                <View style={styles.perksHeader}>
                  <Gift size={18} color={Colors.text.white} strokeWidth={2.5} />
                  <Text style={styles.perksTitle}>New Perks Unlocked!</Text>
                </View>

                <ScrollView style={styles.perksList} showsVerticalScrollIndicator={false}>
                  {levelUpData.unlockedPerks.map((perk, index) => (
                    <View key={index} style={styles.perkItem}>
                      <View style={styles.perkBullet}>
                        <ChevronRight size={14} color={newLevelColor} strokeWidth={3} />
                      </View>
                      <Text style={styles.perkText}>{perk}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Close button */}
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Continue</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  contentContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  gradient: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sparklesContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.text.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  badgeIcon: {
    fontSize: 56,
  },
  levelRing: {
    position: 'absolute',
    bottom: -10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.text.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.text.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.accent.black,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  congratsText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text.white,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.white,
    marginBottom: 6,
    textAlign: 'center',
  },
  levelSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 24,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.white,
  },
  perksContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    maxHeight: 200,
  },
  perksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  perksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  perksList: {
    maxHeight: 140,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  perkBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  perkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  closeButton: {
    width: '100%',
    backgroundColor: Colors.text.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accent.black,
  },
});
