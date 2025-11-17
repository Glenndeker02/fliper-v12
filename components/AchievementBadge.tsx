import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import {
  Achievement,
  getTierGradient,
  getTierColor,
  AchievementProgress,
} from '@/utils/achievements';
import { formatXP } from '@/utils/gamification';

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: AchievementProgress;
  variant?: 'default' | 'compact' | 'large';
  onPress?: () => void;
}

export default function AchievementBadge({
  achievement,
  isUnlocked,
  progress,
  variant = 'default',
  onPress,
}: AchievementBadgeProps) {
  const [gradientStart, gradientEnd] = getTierGradient(achievement.tier);
  const tierColor = getTierColor(achievement.tier);

  if (variant === 'compact') {
    return (
      <Pressable
        style={[styles.compactContainer, !isUnlocked && styles.locked]}
        onPress={onPress}
        disabled={!isUnlocked && achievement.isSecret}
      >
        <View style={[styles.compactIconContainer, { backgroundColor: tierColor }]}>
          {isUnlocked ? (
            <Text style={styles.compactIcon}>{achievement.icon}</Text>
          ) : (
            <Lock size={16} color={Colors.text.white} />
          )}
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {isUnlocked || !achievement.isSecret ? achievement.title : '???'}
          </Text>
          {progress && !isUnlocked && (
            <View style={styles.compactProgressBar}>
              <View
                style={[
                  styles.compactProgressFill,
                  {
                    width: `${progress.percentage}%`,
                    backgroundColor: tierColor,
                  },
                ]}
              />
            </View>
          )}
        </View>
      </Pressable>
    );
  }

  if (variant === 'large') {
    return (
      <Pressable
        style={[styles.largeContainer, !isUnlocked && styles.locked]}
        onPress={onPress}
        disabled={!isUnlocked && achievement.isSecret}
      >
        <LinearGradient
          colors={isUnlocked ? [gradientStart, gradientEnd] : ['#E5E5E5', '#D1D1D1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.largeGradient}
        >
          <View style={styles.largeIconContainer}>
            {isUnlocked ? (
              <Text style={styles.largeIcon}>{achievement.icon}</Text>
            ) : (
              <Lock size={32} color={Colors.text.white} />
            )}
          </View>

          <Text style={styles.largeTitle}>
            {isUnlocked || !achievement.isSecret ? achievement.title : 'Secret Achievement'}
          </Text>

          {(isUnlocked || !achievement.isSecret) && (
            <Text style={styles.largeDescription} numberOfLines={2}>
              {achievement.description}
            </Text>
          )}

          <View style={styles.largeReward}>
            <Star size={14} color={Colors.text.white} fill={Colors.text.white} />
            <Text style={styles.largeRewardText}>+{formatXP(achievement.xpReward)} XP</Text>
          </View>

          {progress && !isUnlocked && (
            <View style={styles.largeProgressContainer}>
              <View style={styles.largeProgressBar}>
                <View
                  style={[
                    styles.largeProgressFill,
                    { width: `${progress.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.largeProgressText}>
                {progress.currentCount} / {progress.requiredCount}
              </Text>
            </View>
          )}

          {isUnlocked && achievement.unlockedAt && (
            <Text style={styles.largeUnlockedDate}>
              Unlocked {achievement.unlockedAt.toLocaleDateString()}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  // Default variant
  return (
    <Pressable
      style={[styles.container, !isUnlocked && styles.locked]}
      onPress={onPress}
      disabled={!isUnlocked && achievement.isSecret}
    >
      <View style={[styles.iconContainer, { backgroundColor: isUnlocked ? tierColor : '#D1D1D1' }]}>
        {isUnlocked ? (
          <Text style={styles.icon}>{achievement.icon}</Text>
        ) : (
          <Lock size={20} color={Colors.text.white} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {isUnlocked || !achievement.isSecret ? achievement.title : 'Secret Achievement'}
          </Text>
          <View style={[styles.tierBadge, { backgroundColor: isUnlocked ? tierColor : '#D1D1D1' }]}>
            <Text style={styles.tierText}>{achievement.tier.toUpperCase()}</Text>
          </View>
        </View>

        {(isUnlocked || !achievement.isSecret) && (
          <Text style={styles.description} numberOfLines={2}>
            {achievement.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.reward}>
            <Star size={12} color={Colors.accent.warning} fill={Colors.accent.warning} />
            <Text style={styles.rewardText}>+{formatXP(achievement.xpReward)} XP</Text>
          </View>

          {progress && !isUnlocked && (
            <Text style={styles.progressText}>
              {Math.floor(progress.percentage)}% ({progress.currentCount}/{progress.requiredCount})
            </Text>
          )}
        </View>

        {progress && !isUnlocked && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress.percentage}%`,
                  backgroundColor: tierColor,
                },
              ]}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  compactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactIcon: {
    fontSize: 20,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  compactProgressBar: {
    height: 4,
    backgroundColor: Colors.background.gray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Large variant
  largeContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  largeGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 200,
  },
  largeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.text.white,
  },
  largeIcon: {
    fontSize: 40,
  },
  largeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  largeDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  largeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  largeRewardText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.white,
  },
  largeProgressContainer: {
    width: '100%',
    marginTop: 8,
  },
  largeProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  largeProgressFill: {
    height: '100%',
    backgroundColor: Colors.text.white,
    borderRadius: 4,
  },
  largeProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  largeUnlockedDate: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },

  // Default variant
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locked: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginRight: 8,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text.white,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.background.gray,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
