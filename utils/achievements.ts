/**
 * Comprehensive achievements system for SwimEase
 * Tracks user milestones, progress, and unlockable badges
 * Based on newprd.md Section 4.6 - Gamification
 */

import { supabase } from './supabase';
import { XP_REWARDS } from './gamification';

export type AchievementCategory =
  | 'learning'
  | 'practice'
  | 'streak'
  | 'social'
  | 'mastery'
  | 'milestone';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  xpReward: number;
  requirement: {
    type: string;
    count: number;
    target?: string;
  };
  isSecret?: boolean; // Hidden until unlocked
  unlockedAt?: Date;
  progress?: number; // 0-100
}

export interface AchievementProgress {
  achievementId: string;
  currentCount: number;
  requiredCount: number;
  percentage: number;
}

// Comprehensive achievement definitions - 35 total achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Learning Achievements (7)
  {
    id: 'first-lesson',
    title: 'First Splash',
    description: 'Complete your first swimming lesson',
    category: 'learning',
    tier: 'bronze',
    icon: '🌊',
    xpReward: XP_REWARDS.FIRST_LESSON,
    requirement: { type: 'lessons_completed', count: 1 },
  },
  {
    id: 'lesson-master-5',
    title: 'Quick Learner',
    description: 'Complete 5 swimming lessons',
    category: 'learning',
    tier: 'bronze',
    icon: '📚',
    xpReward: 200,
    requirement: { type: 'lessons_completed', count: 5 },
  },
  {
    id: 'lesson-master-10',
    title: 'Dedicated Student',
    description: 'Complete 10 swimming lessons',
    category: 'learning',
    tier: 'silver',
    icon: '🎓',
    xpReward: 300,
    requirement: { type: 'lessons_completed', count: 10 },
  },
  {
    id: 'lesson-master-25',
    title: 'Swimming Scholar',
    description: 'Complete 25 swimming lessons',
    category: 'learning',
    tier: 'gold',
    icon: '👨‍🎓',
    xpReward: 500,
    requirement: { type: 'lessons_completed', count: 25 },
  },
  {
    id: 'lesson-master-50',
    title: 'Master of Knowledge',
    description: 'Complete 50 swimming lessons',
    category: 'learning',
    tier: 'platinum',
    icon: '🏆',
    xpReward: 1000,
    requirement: { type: 'lessons_completed', count: 50 },
  },
  {
    id: 'breathing-master',
    title: 'Breath Control Expert',
    description: 'Master all breathing technique lessons',
    category: 'learning',
    tier: 'gold',
    icon: '💨',
    xpReward: 400,
    requirement: { type: 'module_mastered', count: 1, target: 'breathing' },
  },
  {
    id: 'freestyle-master',
    title: 'Freestyle Champion',
    description: 'Master all freestyle stroke lessons',
    category: 'learning',
    tier: 'gold',
    icon: '🏊',
    xpReward: 500,
    requirement: { type: 'module_mastered', count: 1, target: 'freestyle' },
  },

  // Practice Achievements (5)
  {
    id: 'first-pool-session',
    title: 'Pool Debut',
    description: 'Complete your first pool practice session',
    category: 'practice',
    tier: 'bronze',
    icon: '🏊‍♂️',
    xpReward: XP_REWARDS.FIRST_POOL_SESSION,
    requirement: { type: 'pool_sessions_completed', count: 1 },
  },
  {
    id: 'pool-warrior-10',
    title: 'Pool Warrior',
    description: 'Complete 10 pool practice sessions',
    category: 'practice',
    tier: 'silver',
    icon: '💪',
    xpReward: 400,
    requirement: { type: 'pool_sessions_completed', count: 10 },
  },
  {
    id: 'pool-champion-25',
    title: 'Pool Champion',
    description: 'Complete 25 pool practice sessions',
    category: 'practice',
    tier: 'gold',
    icon: '⚡',
    xpReward: 600,
    requirement: { type: 'pool_sessions_completed', count: 25 },
  },
  {
    id: 'dryland-dedication',
    title: 'Dryland Dedication',
    description: 'Complete 15 dryland workouts',
    category: 'practice',
    tier: 'silver',
    icon: '🏋️',
    xpReward: 350,
    requirement: { type: 'dryland_completed', count: 15 },
  },
  {
    id: 'balanced-training',
    title: 'Balanced Athlete',
    description: 'Complete 20 pool sessions and 20 dryland workouts',
    category: 'practice',
    tier: 'gold',
    icon: '⚖️',
    xpReward: 700,
    requirement: { type: 'balanced_training', count: 20 },
  },

  // Streak Achievements (4)
  {
    id: 'week-streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day practice streak',
    category: 'streak',
    tier: 'bronze',
    icon: '🔥',
    xpReward: XP_REWARDS.STREAK_MILESTONE_7,
    requirement: { type: 'streak_days', count: 7 },
  },
  {
    id: 'month-streak',
    title: 'Monthly Momentum',
    description: 'Maintain a 30-day practice streak',
    category: 'streak',
    tier: 'silver',
    icon: '🔥🔥',
    xpReward: XP_REWARDS.STREAK_MILESTONE_30,
    requirement: { type: 'streak_days', count: 30 },
  },
  {
    id: 'century-streak',
    title: 'Century Swimmer',
    description: 'Maintain a 100-day practice streak',
    category: 'streak',
    tier: 'platinum',
    icon: '🔥🔥🔥',
    xpReward: XP_REWARDS.STREAK_MILESTONE_100,
    requirement: { type: 'streak_days', count: 100 },
    isSecret: true,
  },
  {
    id: 'comeback-kid',
    title: 'Comeback Kid',
    description: 'Return to training after a 7+ day break',
    category: 'streak',
    tier: 'bronze',
    icon: '💪',
    xpReward: 100,
    requirement: { type: 'comeback', count: 1 },
  },

  // Social Achievements (5)
  {
    id: 'first-journal',
    title: 'Reflective Swimmer',
    description: 'Create your first journal entry',
    category: 'social',
    tier: 'bronze',
    icon: '📝',
    xpReward: 100,
    requirement: { type: 'journals_created', count: 1 },
  },
  {
    id: 'journal-habit',
    title: 'Journal Keeper',
    description: 'Create 20 journal entries',
    category: 'social',
    tier: 'silver',
    icon: '📔',
    xpReward: 300,
    requirement: { type: 'journals_created', count: 20 },
  },
  {
    id: 'video-analyzer',
    title: 'Video Analyst',
    description: 'Upload 5 video journals for AI feedback',
    category: 'social',
    tier: 'gold',
    icon: '🎥',
    xpReward: 400,
    requirement: { type: 'video_journals', count: 5 },
  },
  {
    id: 'community-contributor',
    title: 'Community Helper',
    description: 'Make 10 helpful community contributions',
    category: 'social',
    tier: 'silver',
    icon: '🤝',
    xpReward: 250,
    requirement: { type: 'community_helpful', count: 10 },
  },
  {
    id: 'motivator',
    title: 'Motivator',
    description: 'Receive 50 reactions on your posts',
    category: 'social',
    tier: 'gold',
    icon: '⭐',
    xpReward: 350,
    requirement: { type: 'reactions_received', count: 50 },
  },

  // Mastery Achievements (4)
  {
    id: 'technique-perfectionist',
    title: 'Technique Perfectionist',
    description: 'Get "Excellent" rating on 10 technique assessments',
    category: 'mastery',
    tier: 'gold',
    icon: '✨',
    xpReward: 500,
    requirement: { type: 'excellent_ratings', count: 10 },
  },
  {
    id: 'multi-stroke-swimmer',
    title: 'Multi-Stroke Swimmer',
    description: 'Complete lessons in all 4 main strokes',
    category: 'mastery',
    tier: 'silver',
    icon: '🌊',
    xpReward: 600,
    requirement: { type: 'strokes_learned', count: 4 },
  },
  {
    id: 'safety-first',
    title: 'Safety Champion',
    description: 'Complete safety orientation and 50 safety checklists',
    category: 'mastery',
    tier: 'silver',
    icon: '🛡️',
    xpReward: 300,
    requirement: { type: 'safety_checklists', count: 50 },
  },
  {
    id: 'endurance-beast',
    title: 'Endurance Beast',
    description: 'Complete a 60-minute pool session',
    category: 'mastery',
    tier: 'platinum',
    icon: '💎',
    xpReward: 800,
    requirement: { type: 'long_session', count: 1, target: '60min' },
    isSecret: true,
  },

  // Milestone Achievements (10)
  {
    id: 'first-week',
    title: 'Welcome Aboard',
    description: 'Complete your first week with SwimEase',
    category: 'milestone',
    tier: 'bronze',
    icon: '🎉',
    xpReward: XP_REWARDS.FIRST_WEEK,
    requirement: { type: 'days_active', count: 7 },
  },
  {
    id: 'first-month',
    title: 'Monthly Milestone',
    description: 'Reach your one-month anniversary',
    category: 'milestone',
    tier: 'silver',
    icon: '🎊',
    xpReward: XP_REWARDS.FIRST_MONTH,
    requirement: { type: 'days_active', count: 30 },
  },
  {
    id: 'level-5',
    title: 'Confident Swimmer',
    description: 'Reach Level 5',
    category: 'milestone',
    tier: 'silver',
    icon: '🏅',
    xpReward: 500,
    requirement: { type: 'level_reached', count: 5 },
  },
  {
    id: 'level-10',
    title: 'Swimming Champion',
    description: 'Reach the maximum level',
    category: 'milestone',
    tier: 'platinum',
    icon: '👑',
    xpReward: 1500,
    requirement: { type: 'level_reached', count: 10 },
    isSecret: true,
  },
  {
    id: 'xp-collector-1000',
    title: 'XP Collector',
    description: 'Earn 1,000 total XP',
    category: 'milestone',
    tier: 'silver',
    icon: '💰',
    xpReward: 200,
    requirement: { type: 'total_xp', count: 1000 },
  },
  {
    id: 'xp-collector-5000',
    title: 'XP Master',
    description: 'Earn 5,000 total XP',
    category: 'milestone',
    tier: 'platinum',
    icon: '💎',
    xpReward: 500,
    requirement: { type: 'total_xp', count: 5000 },
    isSecret: true,
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete a session before 7 AM',
    category: 'milestone',
    tier: 'bronze',
    icon: '🌅',
    xpReward: 150,
    requirement: { type: 'early_session', count: 1 },
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete a session after 10 PM',
    category: 'milestone',
    tier: 'bronze',
    icon: '🌙',
    xpReward: 150,
    requirement: { type: 'late_session', count: 1 },
  },
  {
    id: 'weekend-warrior',
    title: 'Weekend Warrior',
    description: 'Complete 10 weekend practice sessions',
    category: 'milestone',
    tier: 'bronze',
    icon: '🎯',
    xpReward: 200,
    requirement: { type: 'weekend_sessions', count: 10 },
  },
  {
    id: 'video-viewer',
    title: 'Video Enthusiast',
    description: 'Watch 20 complete lesson videos',
    category: 'milestone',
    tier: 'bronze',
    icon: '📺',
    xpReward: 150,
    requirement: { type: 'videos_watched', count: 20 },
  },
];

/**
 * Get tier color for UI styling
 */
export function getTierColor(tier: AchievementTier): string {
  switch (tier) {
    case 'bronze':
      return '#CD7F32';
    case 'silver':
      return '#C0C0C0';
    case 'gold':
      return '#FFD700';
    case 'platinum':
      return '#E5E4E2';
    default:
      return '#CD7F32';
  }
}

/**
 * Get tier gradient colors for backgrounds
 */
export function getTierGradient(tier: AchievementTier): [string, string] {
  switch (tier) {
    case 'bronze':
      return ['#CD7F32', '#A0522D'];
    case 'silver':
      return ['#C0C0C0', '#A9A9A9'];
    case 'gold':
      return ['#FFD700', '#FFA500'];
    case 'platinum':
      return ['#E5E4E2', '#B0C4DE'];
    default:
      return ['#CD7F32', '#A0522D'];
  }
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: AchievementCategory): string {
  switch (category) {
    case 'learning':
      return '📚';
    case 'practice':
      return '🏊';
    case 'streak':
      return '🔥';
    case 'social':
      return '👥';
    case 'mastery':
      return '⭐';
    case 'milestone':
      return '🎯';
    default:
      return '🏆';
  }
}

/**
 * Get category name for display
 */
export function getCategoryName(category: AchievementCategory): string {
  switch (category) {
    case 'learning':
      return 'Learning';
    case 'practice':
      return 'Practice';
    case 'streak':
      return 'Streaks';
    case 'social':
      return 'Social';
    case 'mastery':
      return 'Mastery';
    case 'milestone':
      return 'Milestones';
    default:
      return 'Achievement';
  }
}

/**
 * Calculate achievement progress
 */
export function calculateAchievementProgress(
  achievement: Achievement,
  userStats: Record<string, number>
): AchievementProgress {
  const requiredCount = achievement.requirement.count;
  const currentCount = userStats[achievement.requirement.type] || 0;
  const percentage = Math.min((currentCount / requiredCount) * 100, 100);

  return {
    achievementId: achievement.id,
    currentCount,
    requiredCount,
    percentage,
  };
}

/**
 * Check if achievement is unlocked
 */
export function isAchievementUnlocked(
  achievement: Achievement,
  userStats: Record<string, number>
): boolean {
  const progress = calculateAchievementProgress(achievement, userStats);
  return progress.percentage >= 100;
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(
  category: AchievementCategory
): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

/**
 * Get achievements by tier
 */
export function getAchievementsByTier(tier: AchievementTier): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.tier === tier);
}

/**
 * Get unlocked achievements
 */
export function getUnlockedAchievements(
  userStats: Record<string, number>
): Achievement[] {
  return ACHIEVEMENTS.filter((a) => isAchievementUnlocked(a, userStats));
}

/**
 * Get locked achievements (excluding secrets)
 */
export function getLockedAchievements(
  userStats: Record<string, number>
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !isAchievementUnlocked(a, userStats) && !a.isSecret
  );
}

/**
 * Get secret achievements (unlocked only)
 */
export function getSecretAchievements(
  userStats: Record<string, number>
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => a.isSecret && isAchievementUnlocked(a, userStats)
  );
}

/**
 * Get total achievement statistics
 */
export function getAchievementStats(userStats: Record<string, number>) {
  const unlocked = getUnlockedAchievements(userStats);
  const total = ACHIEVEMENTS.filter((a) => !a.isSecret).length;
  const totalWithSecrets = ACHIEVEMENTS.length;
  const byTier = {
    bronze: unlocked.filter((a) => a.tier === 'bronze').length,
    silver: unlocked.filter((a) => a.tier === 'silver').length,
    gold: unlocked.filter((a) => a.tier === 'gold').length,
    platinum: unlocked.filter((a) => a.tier === 'platinum').length,
  };

  return {
    unlocked: unlocked.length,
    total,
    totalWithSecrets,
    percentage: (unlocked.length / totalWithSecrets) * 100,
    byTier,
  };
}

/**
 * Get recently unlocked achievements (sorted by unlock date)
 */
export function getRecentlyUnlockedAchievements(
  unlockedAchievements: Achievement[],
  limit: number = 5
): Achievement[] {
  return unlockedAchievements
    .filter((a) => a.unlockedAt)
    .sort((a, b) => {
      if (!a.unlockedAt || !b.unlockedAt) return 0;
      return b.unlockedAt.getTime() - a.unlockedAt.getTime();
    })
    .slice(0, limit);
}

/**
 * Get achievements close to unlocking (>= 75% progress)
 */
export function getAlmostUnlockedAchievements(
  userStats: Record<string, number>,
  threshold: number = 75
): Array<Achievement & { progress: number }> {
  return ACHIEVEMENTS.filter((a) => {
    if (a.isSecret) return false;
    const progress = calculateAchievementProgress(a, userStats);
    return progress.percentage >= threshold && progress.percentage < 100;
  }).map((a) => ({
    ...a,
    progress: calculateAchievementProgress(a, userStats).percentage,
  }));
}
