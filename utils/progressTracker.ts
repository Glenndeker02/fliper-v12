import { supabase } from './supabase';
import type { SkillLevel } from '@/constants/types';

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  moduleId: number;
  skillLevel: SkillLevel;
  completionDate: Date;
  performance: 'excellent' | 'good' | 'needs_practice';
  feedback: string[];
  timeSpent: number; // in minutes
  confidence: number; // 1-5 scale
  adaptiveMetrics: {
    learningStyle: string;
    difficultyRating: number;
    comprehensionScore: number;
    engagementLevel: number;
    practiceEfficiency: number;
  };
}

export interface ModuleProgress {
  moduleId: number;
  skillLevel: SkillLevel;
  completedLessons: number;
  totalLessons: number;
  avgPerformance: number;
  avgConfidence: number;
  startDate: Date;
  lastActivityDate: Date;
}

export const saveLessonProgress = async (
  userId: string,
  lessonId: string,
  progress: Omit<LessonProgress, 'id' | 'userId' | 'lessonId'>
): Promise<LessonProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('lesson_progress')
      .insert({
        user_id: userId,
        lesson_id: lessonId,
        ...progress
      })
      .select()
      .single();

    if (error) throw error;
    return data as LessonProgress;
  } catch (error) {
    console.error('Error saving lesson progress:', error);
    return null;
  }
};

export const getModuleProgress = async (
  userId: string,
  moduleId: number,
  skillLevel: SkillLevel
): Promise<ModuleProgress | null> => {
  try {
    // Get all completed lessons for this module
    const { data: lessonData, error: lessonError } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('skill_level', skillLevel);

    if (lessonError) throw lessonError;

    // Get total lessons in the module
    const { count: totalLessons, error: countError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', moduleId)
      .eq('skill_level', skillLevel);

    if (countError) throw countError;
    if (!lessonData || totalLessons === null) return null;

    const completedLessons = lessonData.length;
    const avgPerformance = calculateAveragePerformance(lessonData);
    const avgConfidence = calculateAverageConfidence(lessonData);
    const startDate = new Date(Math.min(...lessonData.map((l: LessonProgress) => new Date(l.completionDate).getTime())));
    const lastActivityDate = new Date(Math.max(...lessonData.map((l: LessonProgress) => new Date(l.completionDate).getTime())));

    return {
      moduleId,
      skillLevel,
      completedLessons,
      totalLessons,
      avgPerformance,
      avgConfidence,
      startDate,
      lastActivityDate
    };
  } catch (error) {
    console.error('Error fetching module progress:', error);
    return null;
  }
};

export interface AdaptiveProgress {
  learningPathProgress: number;
  recommendedNextSteps: string[];
  focusAreas: string[];
  strengthAreas: string[];
  preferredLearningStyle: string;
  adaptivityScore: number;
  personalizedGoals: string[];
}

export const getUserProgress = async (userId: string): Promise<{
  currentModule: number;
  currentSkillLevel: SkillLevel;
  totalLessonsCompleted: number;
  avgConfidence: number;
  streakDays: number;
  lastActivity: Date;
  adaptiveProgress: AdaptiveProgress;
}> => {
  try {
    const { data: progressData, error: progressError } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .order('completion_date', { ascending: false });

    if (progressError) throw progressError;
    if (!progressData?.length) {
      return {
        currentModule: 1,
        currentSkillLevel: 'beginner-1',
        totalLessonsCompleted: 0,
        avgConfidence: 0,
        streakDays: 0,
        lastActivity: new Date(),
        adaptiveProgress: {
          learningPathProgress: 0,
          recommendedNextSteps: [],
          focusAreas: [],
          strengthAreas: [],
          preferredLearningStyle: 'visual',
          adaptivityScore: 0,
          personalizedGoals: [],
        }
      };
    }

    // Calculate streak
    const streakDays = calculateStreak(progressData);

    // Get latest module and skill level
    const latestProgress = progressData[0];
    
    // Calculate adaptive progress
    const adaptiveProgress = await calculateAdaptiveProgress(userId, progressData);

    return {
      currentModule: latestProgress.moduleId,
      currentSkillLevel: latestProgress.skillLevel,
      totalLessonsCompleted: progressData.length,
      avgConfidence: calculateAverageConfidence(progressData),
      streakDays,
      lastActivity: new Date(latestProgress.completionDate),
      adaptiveProgress
    };
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return {
      currentModule: 1,
      currentSkillLevel: 'beginner-1',
      totalLessonsCompleted: 0,
      avgConfidence: 0,
      streakDays: 0,
      lastActivity: new Date()
    };
  }
};

const calculateAveragePerformance = (progressData: LessonProgress[]): number => {
  const performanceValues = {
    excellent: 1,
    good: 0.7,
    needs_practice: 0.3
  };

  return progressData.reduce((acc, curr) => 
    acc + performanceValues[curr.performance], 0) / progressData.length;
};

const calculateAverageConfidence = (progressData: LessonProgress[]): number => {
  return progressData.reduce((acc, curr) => 
    acc + curr.confidence, 0) / progressData.length;
};

const calculateStreak = (progressData: LessonProgress[]): number => {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activityDates = progressData
    .map(p => new Date(p.completionDate))
    .sort((a, b) => b.getTime() - a.getTime()) // Sort descending
    .map(date => {
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

  // No activity
  if (activityDates.length === 0) return 0;

  // Check if there's activity today
  const hasActivityToday = activityDates[0] === today.getTime();
  let currentDate = hasActivityToday ? today : new Date(activityDates[0]);
  
  for (let i = 0; i < activityDates.length; i++) {
    if (activityDates[i] === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

const calculateAdaptiveProgress = async (
  userId: string,
  progressData: LessonProgress[]
): Promise<AdaptiveProgress> => {
  try {
    // Calculate learning path progress
    const learningPathProgress = calculateLearningPathProgress(progressData);

    // Get recommended next steps
    const recommendedNextSteps = await getRecommendedNextSteps(userId, progressData);

    // Analyze focus and strength areas
    const { focusAreas, strengthAreas } = analyzeSkillAreas(progressData);

    // Determine preferred learning style
    const preferredLearningStyle = determinePreferredLearningStyle(progressData);

    // Calculate adaptivity score
    const adaptivityScore = calculateAdaptivityScore(progressData);

    // Generate personalized goals
    const personalizedGoals = generatePersonalizedGoals(progressData);

    return {
      learningPathProgress,
      recommendedNextSteps,
      focusAreas,
      strengthAreas,
      preferredLearningStyle,
      adaptivityScore,
      personalizedGoals,
    };
  } catch (error) {
    console.error('Error calculating adaptive progress:', error);
    return {
      learningPathProgress: 0,
      recommendedNextSteps: [],
      focusAreas: [],
      strengthAreas: [],
      preferredLearningStyle: 'visual',
      adaptivityScore: 0,
      personalizedGoals: [],
    };
  }
};

const calculateLearningPathProgress = (progressData: LessonProgress[]): number => {
  if (progressData.length === 0) return 0;

  const weightedProgress = progressData.reduce((acc, curr) => {
    const performance = curr.performance === 'excellent' ? 1 : 
                       curr.performance === 'good' ? 0.7 : 0.4;
    const adaptiveWeight = (
      curr.adaptiveMetrics.comprehensionScore +
      curr.adaptiveMetrics.engagementLevel +
      curr.adaptiveMetrics.practiceEfficiency
    ) / 3;
    
    return acc + (performance * adaptiveWeight);
  }, 0);

  return (weightedProgress / progressData.length) * 100;
};

const getRecommendedNextSteps = async (
  userId: string,
  progressData: LessonProgress[]
): Promise<string[]> => {
  const recentProgress = progressData.slice(0, 5);
  const recommendations = [];

  // Analyze recent performance trends
  const needsPractice = recentProgress.filter(p => p.performance === 'needs_practice');
  if (needsPractice.length > 0) {
    recommendations.push(`Practice ${needsPractice[0].lessonId} concepts`);
  }

  // Check for skill gaps
  const lowConfidence = recentProgress.filter(p => p.confidence < 3);
  if (lowConfidence.length > 0) {
    recommendations.push(`Review fundamentals of ${lowConfidence[0].lessonId}`);
  }

  // Consider learning style
  const preferredStyle = determinePreferredLearningStyle(progressData);
  recommendations.push(`Try ${preferredStyle}-based learning activities`);

  return recommendations;
};

const analyzeSkillAreas = (progressData: LessonProgress[]): {
  focusAreas: string[];
  strengthAreas: string[];
} => {
  const skillAnalysis = new Map<string, {
    attempts: number;
    successes: number;
    confidence: number;
  }>();

  // Analyze each lesson's contribution to skills
  progressData.forEach(progress => {
    const lessonSkills = ['technique', 'endurance', 'form']; // Example skills
    lessonSkills.forEach(skill => {
      const current = skillAnalysis.get(skill) || {
        attempts: 0,
        successes: 0,
        confidence: 0,
      };

      current.attempts++;
      if (progress.performance === 'excellent' || progress.performance === 'good') {
        current.successes++;
      }
      current.confidence += progress.confidence;

      skillAnalysis.set(skill, current);
    });
  });

  const focusAreas: string[] = [];
  const strengthAreas: string[] = [];

  // Evaluate each skill
  skillAnalysis.forEach((stats, skill) => {
    const successRate = stats.successes / stats.attempts;
    const avgConfidence = stats.confidence / stats.attempts;

    if (successRate < 0.7 || avgConfidence < 3) {
      focusAreas.push(skill);
    } else if (successRate > 0.8 && avgConfidence > 4) {
      strengthAreas.push(skill);
    }
  });

  return { focusAreas, strengthAreas };
};

const determinePreferredLearningStyle = (progressData: LessonProgress[]): string => {
  if (progressData.length === 0) return 'visual';

  const styleCounts = progressData.reduce((acc, curr) => {
    const style = curr.adaptiveMetrics.learningStyle;
    acc[style] = (acc[style] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredStyle = Object.entries(styleCounts).reduce((prev, curr) => 
    styleCounts[prev[0]] > styleCounts[curr[0]] ? prev : curr
  )[0];

  return preferredStyle;
};

const calculateAdaptivityScore = (progressData: LessonProgress[]): number => {
  if (progressData.length === 0) return 0;

  return progressData.reduce((acc, curr) => {
    const adaptiveMetrics = curr.adaptiveMetrics;
    const score = (
      adaptiveMetrics.comprehensionScore +
      adaptiveMetrics.engagementLevel +
      adaptiveMetrics.practiceEfficiency +
      (curr.confidence / 5)
    ) / 4;
    
    return acc + score;
  }, 0) / progressData.length * 100;
};

const generatePersonalizedGoals = (progressData: LessonProgress[]): string[] => {
  const goals: string[] = [];
  
  // Analyze recent progress
  const recentProgress = progressData.slice(0, 5);
  const avgConfidence = recentProgress.reduce((acc, curr) => 
    acc + curr.confidence, 0) / recentProgress.length;

  // Generate confidence-based goals
  if (avgConfidence < 3) {
    goals.push('Build confidence through guided practice sessions');
  }

  // Add performance-based goals
  const needsPractice = recentProgress.filter(p => 
    p.performance === 'needs_practice').length;
  if (needsPractice > 2) {
    goals.push('Focus on mastering fundamental techniques');
  }

  // Add streak-based goals
  if (progressData.length > 0) {
    goals.push('Maintain daily practice streak');
  }

  return goals;
};