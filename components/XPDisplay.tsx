import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { TrendingUp, Star, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { calculateLevel, formatXP, getLevelColor, getLevelIcon } from '@/utils/gamification';
import { useTheme } from '@/contexts/ThemeContext';

interface XPDisplayProps {
  totalXP: number;
  variant?: 'full' | 'compact' | 'mini';
  onPress?: () => void;
}

export default function XPDisplay({ totalXP, variant = 'full', onPress }: XPDisplayProps) {
  const { theme } = useTheme();
  const { level, progress, xpInLevel, xpToNextLevel } = calculateLevel(totalXP);

  if (variant === 'mini') {
    return (
      <Pressable style={styles.miniContainer} onPress={onPress}>
        <View style={[styles.miniLevelBadge, { backgroundColor: level.color }]}>
          <Text style={styles.miniLevelText}>{level.level}</Text>
        </View>
        <View style={styles.miniXPContainer}>
          <Star size={12} color={Colors.accent.warning} fill={Colors.accent.warning} />
          <Text style={styles.miniXPText}>{formatXP(totalXP)}</Text>
        </View>
      </Pressable>
    );
  }

  if (variant === 'compact') {
    return (
      <Pressable style={styles.compactContainer} onPress={onPress}>
        <View style={styles.compactLeft}>
          <Text style={styles.compactLevelIcon}>{level.icon}</Text>
          <View>
            <Text style={styles.compactLevelText}>Level {level.level}</Text>
            <Text style={styles.compactTitleText}>{level.title}</Text>
          </View>
        </View>
        <View style={styles.compactRight}>
          <Text style={styles.compactXPText}>{formatXP(totalXP)} XP</Text>
          <View style={styles.compactProgressContainer}>
            <View style={styles.compactProgressBackground}>
              <LinearGradient
                colors={[level.color, getLevelColor(level.level + 1)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.compactProgressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.compactProgressText}>{Math.floor(progress)}%</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // Full variant
  return (
    <Pressable style={styles.fullContainer} onPress={onPress}>
      <LinearGradient
        colors={[level.color, getLevelColor(level.level + 1)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fullGradient}
      >
        <View style={styles.fullHeader}>
          <View style={styles.fullLevelBadge}>
            <Text style={styles.fullLevelIcon}>{level.icon}</Text>
            <Text style={styles.fullLevelNumber}>{level.level}</Text>
          </View>
          <View style={styles.fullTitleContainer}>
            <Text style={styles.fullLevelTitle}>{level.title}</Text>
            <Text style={styles.fullXPText}>{formatXP(totalXP)} XP</Text>
          </View>
        </View>

        <View style={styles.fullProgressSection}>
          <View style={styles.fullProgressInfo}>
            <View style={styles.fullProgressLabelContainer}>
              <TrendingUp size={14} color={Colors.text.white} strokeWidth={2.5} />
              <Text style={styles.fullProgressLabel}>Progress to Level {level.level + 1}</Text>
            </View>
            <Text style={styles.fullProgressPercent}>{Math.floor(progress)}%</Text>
          </View>

          <View style={styles.fullProgressBarContainer}>
            <View style={styles.fullProgressBarBackground}>
              <View style={[styles.fullProgressBarFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <View style={styles.fullXPInfo}>
            <Text style={styles.fullXPInfoText}>
              {formatXP(xpInLevel)} / {formatXP(xpInLevel + xpToNextLevel)} XP
            </Text>
            <Text style={styles.fullXPRemainingText}>{formatXP(xpToNextLevel)} to go</Text>
          </View>
        </View>

        <View style={styles.fullStatsRow}>
          <View style={styles.fullStatItem}>
            <Award size={16} color={Colors.text.white} strokeWidth={2} />
            <Text style={styles.fullStatLabel}>Level</Text>
            <Text style={styles.fullStatValue}>{level.level}</Text>
          </View>
          <View style={styles.fullStatDivider} />
          <View style={styles.fullStatItem}>
            <Star size={16} color={Colors.text.white} fill={Colors.text.white} strokeWidth={2} />
            <Text style={styles.fullStatLabel}>Total XP</Text>
            <Text style={styles.fullStatValue}>{formatXP(totalXP)}</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Mini variant
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniLevelBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniLevelText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.white,
  },
  miniXPContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniXPText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactLevelIcon: {
    fontSize: 32,
  },
  compactLevelText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  compactTitleText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  compactRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  compactXPText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  compactProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactProgressBackground: {
    width: 80,
    height: 6,
    backgroundColor: Colors.background.gray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  compactProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    width: 35,
  },

  // Full variant
  fullContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  fullGradient: {
    padding: 20,
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  fullLevelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.text.white,
  },
  fullLevelIcon: {
    fontSize: 24,
    position: 'absolute',
    top: -8,
  },
  fullLevelNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.white,
    marginTop: 12,
  },
  fullTitleContainer: {
    flex: 1,
  },
  fullLevelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.white,
    marginBottom: 4,
  },
  fullXPText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  fullProgressSection: {
    marginBottom: 16,
  },
  fullProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fullProgressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fullProgressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.white,
  },
  fullProgressPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.white,
  },
  fullProgressBarContainer: {
    marginBottom: 8,
  },
  fullProgressBarBackground: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fullProgressBarFill: {
    height: '100%',
    backgroundColor: Colors.text.white,
    borderRadius: 6,
  },
  fullXPInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullXPInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  fullXPRemainingText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  fullStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    paddingTop: 16,
  },
  fullStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  fullStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  fullStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  fullStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.white,
  },
});
