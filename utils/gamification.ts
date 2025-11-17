/**
 * Gamification utilities for XP, levels, points, and rewards
 * Based on SwimEase PRD gamification requirements
 */

export interface Level {
  level: number;
  minXP: number;
  maxXP: number;
  title: string;
  icon: string;
  color: string;
  perks: string[];
}

export interface XPReward {
  source: string;
  amount: number;
  description: string;
  timestamp: Date;
}

export interface LevelUpData {
  previousLevel: number;
  newLevel: number;
  newTitle: string;
  unlockedPerks: string[];
  totalXP: number;
}

// Level progression system (exponential growth)
export const LEVELS: Level[] = [
  {
    level: 1,
    minXP: 0,
    maxXP: 100,
    title: 'Water Novice',
    icon: '🌊',
    color: '#60A5FA', // blue-400
    perks: ['Access to Beginner Level 1 lessons'],
  },
  {
    level: 2,
    minXP: 100,
    maxXP: 250,
    title: 'Water Explorer',
    icon: '🏊',
    color: '#3B82F6', // blue-500
    perks: ['Access to Beginner Level 2 lessons', 'Basic dryland exercises'],
  },
  {
    level: 3,
    minXP: 250,
    maxXP: 500,
    title: 'Pool Apprentice',
    icon: '🏊‍♂️',
    color: '#2563EB', // blue-600
    perks: ['First pool practice session unlocked', 'AI feedback on videos'],
  },
  {
    level: 4,
    minXP: 500,
    maxXP: 850,
    title: 'Stroke Student',
    icon: '🎯',
    color: '#1D4ED8', // blue-700
    perks: ['Intermediate Level 1 unlocked', 'Custom practice builder'],
  },
  {
    level: 5,
    minXP: 850,
    maxXP: 1300,
    title: 'Confident Swimmer',
    icon: '💪',
    color: '#14B8A6', // teal-500
    perks: ['Advanced drills unlocked', 'Community posting enabled'],
  },
  {
    level: 6,
    minXP: 1300,
    maxXP: 1850,
    title: 'Technique Refiner',
    icon: '⚡',
    color: '#0D9488', // teal-600
    perks: ['Intermediate Level 2 unlocked', 'Video upload for feedback'],
  },
  {
    level: 7,
    minXP: 1850,
    maxXP: 2500,
    title: 'Form Master',
    icon: '🎓',
    color: '#0F766E', // teal-700
    perks: ['Advanced Level 1 unlocked', 'Personal training plans'],
  },
  {
    level: 8,
    minXP: 2500,
    maxXP: 3300,
    title: 'Multi-Stroke Swimmer',
    icon: '🌟',
    color: '#F59E0B', // amber-500
    perks: ['All stroke modules unlocked', 'Expert challenges'],
  },
  {
    level: 9,
    minXP: 3300,
    maxXP: 4300,
    title: 'Advanced Athlete',
    icon: '🏆',
    color: '#D97706', // amber-600
    perks: ['Advanced Level 2 unlocked', 'Competitive training programs'],
  },
  {
    level: 10,
    minXP: 4300,
    maxXP: 5500,
    title: 'Swimming Champion',
    icon: '👑',
    color: '#B45309', // amber-700
    perks: ['All content unlocked', 'Elite community access', 'Coach certification path'],
  },
];

// XP reward amounts for different activities
export const XP_REWARDS = {
  // Lessons
  LESSON_WATCHED: 50,
  LESSON_COMPLETED: 100,
  LESSON_MASTERED: 150, // All checklistItems checked
  LESSON_REVIEWED: 25,

  // Practice
  POOL_SESSION_STARTED: 30,
  POOL_SESSION_COMPLETED: 100,
  DRYLAND_WORKOUT_COMPLETED: 75,
  CUSTOM_PRACTICE_COMPLETED: 80,

  // Streaks
  STREAK_DAY: 20, // Per day of streak
  STREAK_MILESTONE_7: 200, // 7-day streak bonus
  STREAK_MILESTONE_30: 500, // 30-day streak bonus
  STREAK_MILESTONE_100: 1000, // 100-day streak bonus

  // Assessments
  INITIAL_ASSESSMENT: 100,
  SKILL_ASSESSMENT: 50,
  PROGRESS_CHECK: 75,

  // Journal
  JOURNAL_TEXT: 30,
  JOURNAL_VOICE: 40,
  JOURNAL_VIDEO: 50,
  JOURNAL_REFLECTION: 60, // Longer, detailed entry

  // Community
  POST_CREATED: 25,
  HELPFUL_COMMENT: 15,
  COMMUNITY_REACTION: 5,

  // Achievements
  ACHIEVEMENT_UNLOCKED: 100, // Base, varies by achievement

  // Safety
  SAFETY_ORIENTATION: 100,
  SAFETY_CHECKLIST: 10,

  // Challenges
  CHALLENGE_JOINED: 50,
  CHALLENGE_COMPLETED: 200,
  CHALLENGE_WON: 500,

  // Milestones
  FIRST_LESSON: 150,
  FIRST_POOL_SESSION: 200,
  FIRST_WEEK: 250,
  FIRST_MONTH: 500,
} as const;

/**
 * Calculate level and progress from total XP
 */
export function calculateLevel(totalXP: number): {
  level: Level;
  progress: number; // Percentage (0-100)
  xpInLevel: number;
  xpToNextLevel: number;
} {
  // Find current level
  let currentLevel = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) {
      currentLevel = LEVELS[i];
      break;
    }
  }

  // Calculate XP progress within current level
  const xpInLevel = totalXP - currentLevel.minXP;
  const levelRange = currentLevel.maxXP - currentLevel.minXP;
  const progress = (xpInLevel / levelRange) * 100;
  const xpToNextLevel = currentLevel.maxXP - totalXP;

  return {
    level: currentLevel,
    progress: Math.min(Math.max(progress, 0), 100),
    xpInLevel,
    xpToNextLevel: Math.max(xpToNextLevel, 0),
  };
}

/**
 * Check if user leveled up after adding XP
 */
export function checkLevelUp(
  previousXP: number,
  newXP: number
): LevelUpData | null {
  const previousLevelData = calculateLevel(previousXP);
  const newLevelData = calculateLevel(newXP);

  if (newLevelData.level.level > previousLevelData.level.level) {
    // User leveled up!
    return {
      previousLevel: previousLevelData.level.level,
      newLevel: newLevelData.level.level,
      newTitle: newLevelData.level.title,
      unlockedPerks: newLevelData.level.perks,
      totalXP: newXP,
    };
  }

  return null;
}

/**
 * Award XP and return updated total
 */
export function awardXP(
  currentXP: number,
  rewardAmount: number,
  source: string
): {
  newXP: number;
  reward: XPReward;
  levelUp: LevelUpData | null;
} {
  const newXP = currentXP + rewardAmount;

  const reward: XPReward = {
    source,
    amount: rewardAmount,
    description: getXPRewardDescription(source, rewardAmount),
    timestamp: new Date(),
  };

  const levelUp = checkLevelUp(currentXP, newXP);

  return {
    newXP,
    reward,
    levelUp,
  };
}

/**
 * Get human-readable description for XP reward
 */
function getXPRewardDescription(source: string, amount: number): string {
  const descriptions: Record<string, string> = {
    LESSON_WATCHED: `Watched a lesson`,
    LESSON_COMPLETED: `Completed a lesson`,
    LESSON_MASTERED: `Mastered a lesson`,
    POOL_SESSION_COMPLETED: `Completed pool practice`,
    DRYLAND_WORKOUT_COMPLETED: `Completed dryland workout`,
    STREAK_DAY: `Daily streak`,
    STREAK_MILESTONE_7: `7-day streak milestone!`,
    STREAK_MILESTONE_30: `30-day streak milestone!`,
    JOURNAL_VIDEO: `Recorded video journal`,
    ACHIEVEMENT_UNLOCKED: `Achievement unlocked`,
    SAFETY_ORIENTATION: `Completed safety orientation`,
    CHALLENGE_COMPLETED: `Completed challenge`,
    FIRST_LESSON: `First lesson milestone!`,
    FIRST_POOL_SESSION: `First pool session milestone!`,
  };

  return descriptions[source] || `Earned ${amount} XP`;
}

/**
 * Calculate points for activities (different from XP)
 * Points are used for leaderboards and competitions
 */
export function calculatePoints(activityType: string, details?: any): number {
  const pointsMap: Record<string, number> = {
    LESSON_COMPLETED: 100,
    POOL_SESSION_COMPLETED: 150,
    DRYLAND_COMPLETED: 75,
    CHALLENGE_WON: 500,
    CHALLENGE_TOP_10: 200,
    COMMUNITY_POST: 25,
    HELPFUL_ANSWER: 50,
    SKILL_MASTERED: 200,
  };

  let basePoints = pointsMap[activityType] || 0;

  // Add bonuses based on details
  if (details?.difficulty === 'advanced') {
    basePoints *= 1.5;
  }
  if (details?.perfectScore) {
    basePoints *= 1.2;
  }
  if (details?.firstTime) {
    basePoints *= 2;
  }

  return Math.floor(basePoints);
}

/**
 * Format XP with commas (e.g., 1,234 XP)
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString();
}

/**
 * Format points with commas
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}

/**
 * Get level color for UI
 */
export function getLevelColor(level: number): string {
  const levelData = LEVELS.find((l) => l.level === level);
  return levelData?.color || LEVELS[0].color;
}

/**
 * Get level icon emoji
 */
export function getLevelIcon(level: number): string {
  const levelData = LEVELS.find((l) => l.level === level);
  return levelData?.icon || LEVELS[0].icon;
}

/**
 * Get next level info
 */
export function getNextLevelInfo(currentLevel: number): Level | null {
  const nextLevel = LEVELS.find((l) => l.level === currentLevel + 1);
  return nextLevel || null;
}

/**
 * Get all perks for a user's level
 */
export function getAllPerks(level: number): string[] {
  return LEVELS.filter((l) => l.level <= level).flatMap((l) => l.perks);
}
