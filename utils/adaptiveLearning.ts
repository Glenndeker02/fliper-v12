import { supabase } from './supabase';
import { Lesson, Module, SkillLevel } from '@/constants/types';
import { LessonProgress } from './progressTracker';

export type FeedbackType = 'too-easy' | 'just-right' | 'too-hard';

export interface LessonFeedback {
  lessonId: string;
  feedback: FeedbackType;
  timestamp: Date;
}

export interface UserProgress {
  completedLessons: string[];
  lessonFeedback: LessonFeedback[];
  currentModuleId: string;
  skillLevel: SkillLevel;
  averagePerformance: number;
  confidence: number;
  streakDays: number;
}

export interface LearningParameters {
  difficulty: number; // 1-5 scale
  complexity: number; // 1-5 scale
  repetitions: number; // Number of times to practice
  focusAreas: string[];
  lastPerformance: 'excellent' | 'good' | 'needs_practice';
  confidence: number; // 1-5 scale
}

export const getUserProgress = async (userId: string): Promise<UserProgress> => {
  try {
    // Get completed lessons
    const { data: completions, error: completionsError } = await supabase
      .from('lesson_completions')
      .select('lesson_id')
      .eq('user_id', userId);

    if (completionsError) throw completionsError;

    // Get lesson feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('lesson_feedback')
      .select('*')
      .eq('user_id', userId);

    if (feedbackError) throw feedbackError;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_module_id, skill_level')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get performance metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('learning_metrics')
      .select('average_performance, confidence, streak_days')
      .eq('user_id', userId)
      .single();

    if (metricsError) throw metricsError;

    return {
      completedLessons: completions.map(c => c.lesson_id),
      lessonFeedback: feedback.map(f => ({
        lessonId: f.lesson_id,
        feedback: f.feedback_type,
        timestamp: new Date(f.created_at),
      })),
      currentModuleId: profile.current_module_id,
      skillLevel: profile.skill_level,
      averagePerformance: metrics.average_performance,
      confidence: metrics.confidence,
      streakDays: metrics.streak_days,
    };
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

// Function to adjust lesson difficulty based on feedback
export const adjustLessonDifficulty = (
  lessons: Lesson[],
  feedbackHistory: LessonFeedback[]
): Lesson[] => {
  // Count feedback types for each difficulty level
  const difficultyFeedback: Record<string, Record<FeedbackType, number>> = {};
  
  // Initialize counters
  lessons.forEach(lesson => {
    if (!difficultyFeedback[lesson.difficulty]) {
      difficultyFeedback[lesson.difficulty] = {
        'too-easy': 0,
        'just-right': 0,
        'too-hard': 0
      };
    }
  });
  
  // Count feedback for each difficulty level
  feedbackHistory.forEach(feedback => {
    const lesson = lessons.find(l => l.id === feedback.lessonId);
    if (lesson) {
      difficultyFeedback[lesson.difficulty][feedback.feedback]++;
    }
  });
  
  // For now, return lessons as-is since we can't modify the type
  // In a real implementation, we would store tags in the database
  return lessons;
};

// Function to recommend next lessons based on feedback
export const recommendNextLessons = (
  modules: Module[],
  userProgress: UserProgress
): Lesson[] => {
  const { completedLessons, lessonFeedback, currentModuleId } = userProgress;
  
  // Find the current module
  const currentModule = modules.find(m => m.id === currentModuleId);
  if (!currentModule) return [];
  
  // Get lessons from current module that haven't been completed
  const uncompletedLessons = currentModule.lessons.filter(
    lesson => !completedLessons.includes(lesson.id)
  );
  
  // Adjust difficulty based on feedback
  const adjustedLessons = adjustLessonDifficulty(uncompletedLessons, lessonFeedback);
  
  // Sort by feedback - prioritize "just-right" lessons, then "too-easy", then "too-hard"
  const feedbackPriority: Record<FeedbackType, number> = {
    'too-hard': 1,
    'just-right': 2,
    'too-easy': 3
  };
  
  // Count feedback types for each lesson
  const lessonFeedbackMap: Record<string, FeedbackType> = {};
  lessonFeedback.forEach(feedback => {
    // If there are multiple feedbacks for a lesson, keep the most recent
    const existingFeedback = lessonFeedbackMap[feedback.lessonId];
    if (!existingFeedback || feedback.timestamp > new Date()) {
      lessonFeedbackMap[feedback.lessonId] = feedback.feedback;
    }
  });
  
  // Sort lessons based on feedback and prerequisites
  return adjustedLessons.sort((a, b) => {
    // Check if prerequisites are met
    const aPrereqsMet = a.prerequisites.every(prereq => completedLessons.includes(prereq));
    const bPrereqsMet = b.prerequisites.every(prereq => completedLessons.includes(prereq));
    
    // Lessons with prerequisites met come first
    if (aPrereqsMet && !bPrereqsMet) return -1;
    if (!aPrereqsMet && bPrereqsMet) return 1;
    
    // If both have prerequisites met or both don't, sort by feedback
    const aFeedback = lessonFeedbackMap[a.id] || 'just-right';
    const bFeedback = lessonFeedbackMap[b.id] || 'just-right';
    
    return feedbackPriority[aFeedback] - feedbackPriority[bFeedback];
  });
};

// Function to suggest foundational lessons when feedback is "too-hard"
export const suggestFoundationalLessons = (
  modules: Module[],
  lessonId: string,
  completedLessons: string[]
): Lesson[] => {
  const allLessons = modules.flatMap(m => m.lessons);
  const targetLesson = allLessons.find(l => l.id === lessonId);
  
  if (!targetLesson) return [];
  
  // Find prerequisite lessons that haven't been completed
  const missingPrerequisites = targetLesson.prerequisites.filter(
    prereq => !completedLessons.includes(prereq)
  );
  
  // Return those lessons
  return allLessons.filter(lesson => missingPrerequisites.includes(lesson.id));
};

// Function to suggest advanced lessons when feedback is "too-easy"
export const suggestAdvancedLessons = (
  modules: Module[],
  lessonId: string,
  completedLessons: string[]
): Lesson[] => {
  const allLessons = modules.flatMap(m => m.lessons);
  
  // Find lessons that have the completed lesson as a prerequisite
  return allLessons.filter(lesson => 
    lesson.prerequisites.includes(lessonId) && 
    !completedLessons.includes(lesson.id)
  );
};

export default {
  getUserProgress,
  adjustLessonDifficulty,
  recommendNextLessons,
  suggestFoundationalLessons,
  suggestAdvancedLessons
};