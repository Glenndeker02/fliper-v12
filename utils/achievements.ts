import { supabase } from './supabase';

export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt: Date | null;
}

export type AchievementType =
  | 'streak'
  | 'lessons_completed'
  | 'module_completed'
  | 'skill_mastered'
  | 'level_up'
  | 'pool_sessions'
  | 'dryland_workouts'
  | 'perfect_form'
  | 'consistency'
  | 'milestone';

const ACHIEVEMENTS = {
  streak: [
    {
      type: 'streak',
      title: '3-Day Streak',
      description: 'Practice three days in a row',
      icon: '🔥',
      xpReward: 50,
      condition: (days: number) => days >= 3,
    },
    {
      type: 'streak',
      title: '7-Day Streak',
      description: 'Maintain your practice streak for a week',
      icon: '🔥',
      xpReward: 100,
      condition: (days: number) => days >= 7,
    },
    {
      type: 'streak',
      title: '30-Day Streak',
      description: 'A month of consistent practice',
      icon: '🔥',
      xpReward: 500,
      condition: (days: number) => days >= 30,
    },
  ],
  lessons_completed: [
    {
      type: 'lessons_completed',
      title: 'First Lesson',
      description: 'Complete your first swimming lesson',
      icon: '🎯',
      xpReward: 50,
      condition: (count: number) => count >= 1,
    },
    {
      type: 'lessons_completed',
      title: '5 Lessons',
      description: 'Complete 5 swimming lessons',
      icon: '📚',
      xpReward: 100,
      condition: (count: number) => count >= 5,
    },
    {
      type: 'lessons_completed',
      title: '25 Lessons',
      description: 'Complete 25 swimming lessons',
      icon: '🏆',
      xpReward: 500,
      condition: (count: number) => count >= 25,
    },
  ],
  module_completed: [
    {
      type: 'module_completed',
      title: 'Module Master',
      description: 'Complete your first module',
      icon: '🌟',
      xpReward: 200,
      condition: (count: number) => count >= 1,
    },
    {
      type: 'module_completed',
      title: 'Advanced Learner',
      description: 'Complete 3 modules',
      icon: '🎓',
      xpReward: 500,
      condition: (count: number) => count >= 3,
    },
  ],
  skill_mastered: [
    {
      type: 'skill_mastered',
      title: 'Skill Mastery',
      description: 'Master your first swimming skill',
      icon: '💪',
      xpReward: 100,
      condition: (count: number) => count >= 1,
    },
  ],
  level_up: [
    {
      type: 'level_up',
      title: 'Level Up',
      description: 'Advance to the next skill level',
      icon: '⭐',
      xpReward: 300,
      condition: () => true,
    },
  ],
};

export const checkAchievements = async (userId: string): Promise<Achievement[]> => {
  try {
    // Get user's progress data
    const [progressData, existingAchievements] = await Promise.all([
      getUserProgressData(userId),
      getExistingAchievements(userId),
    ]);

    const newAchievements: Achievement[] = [];

    // Check streak achievements
    const streakAchievements = ACHIEVEMENTS.streak.filter(
      achievement => 
        achievement.condition(progressData.streakDays) &&
        !existingAchievements.some(a => a.title === achievement.title)
    );

    // Check lessons completed achievements
    const lessonsAchievements = ACHIEVEMENTS.lessons_completed.filter(
      achievement =>
        achievement.condition(progressData.completedLessons.length) &&
        !existingAchievements.some(a => a.title === achievement.title)
    );

    // Check module completed achievements
    const completedModules = Object.values(progressData.moduleProgress).filter(
      m => m.completed
    ).length;
    const moduleAchievements = ACHIEVEMENTS.module_completed.filter(
      achievement =>
        achievement.condition(completedModules) &&
        !existingAchievements.some(a => a.title === achievement.title)
    );

    // Check skill mastery achievements
    const masteredSkills = Object.values(progressData.skillProgress || {}).filter(
      s => s.level === 'master'
    ).length;
    const skillAchievements = ACHIEVEMENTS.skill_mastered.filter(
      achievement =>
        achievement.condition(masteredSkills) &&
        !existingAchievements.some(a => a.title === achievement.title)
    );

    // Combine all new achievements
    const allNewAchievements = [
      ...streakAchievements,
      ...lessonsAchievements,
      ...moduleAchievements,
      ...skillAchievements,
    ].map(achievement => ({
      userId,
      ...achievement,
      id: crypto.randomUUID(),
      unlockedAt: new Date(),
    }));

    if (allNewAchievements.length > 0) {
      // Save new achievements
      const { error } = await supabase
        .from('achievements')
        .insert(allNewAchievements);

      if (error) throw error;

      // Update user's total XP
      const totalXpReward = allNewAchievements.reduce(
        (sum, achievement) => sum + achievement.xpReward,
        0
      );

      await updateUserXP(userId, totalXpReward);
    }

    return allNewAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

const getUserProgressData = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      streak,
      completed_lessons,
      module_progress,
      skill_progress,
      total_xp
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

const getExistingAchievements = async (userId: string): Promise<Achievement[]> => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as Achievement[];
};

const updateUserXP = async (userId: string, xpToAdd: number) => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      total_xp: supabase.raw(`total_xp + ${xpToAdd}`),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
};

export const getRecentAchievements = async (
  userId: string,
  limit: number = 5
): Promise<Achievement[]> => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Achievement[];
  } catch (error) {
    console.error('Error fetching recent achievements:', error);
    return [];
  }
};

export const getAchievementProgress = async (
  userId: string,
  achievementType: AchievementType
): Promise<{
  current: number;
  next: Achievement | null;
  progress: number;
}> => {
  try {
    const [userData, achievements] = await Promise.all([
      getUserProgressData(userId),
      getExistingAchievements(userId),
    ]);

    const typeAchievements = ACHIEVEMENTS[achievementType];
    const unlockedCount = achievements.filter(
      a => a.type === achievementType
    ).length;

    const nextAchievement = typeAchievements.find(
      a => !achievements.some(ua => ua.title === a.title)
    );

    let progress = 0;
    if (nextAchievement) {
      switch (achievementType) {
        case 'streak':
          progress = (userData.streak / nextAchievement.condition(Infinity)) * 100;
          break;
        case 'lessons_completed':
          progress = (userData.completed_lessons.length / nextAchievement.condition(Infinity)) * 100;
          break;
        case 'module_completed': {
          const completedModules = Object.values(userData.module_progress).filter(
            m => m.completed
          ).length;
          progress = (completedModules / nextAchievement.condition(Infinity)) * 100;
          break;
        }
        default:
          progress = 0;
      }
    }

    return {
      current: unlockedCount,
      next: nextAchievement || null,
      progress: Math.min(Math.round(progress), 100),
    };
  } catch (error) {
    console.error('Error getting achievement progress:', error);
    return {
      current: 0,
      next: null,
      progress: 0,
    };
  }
};