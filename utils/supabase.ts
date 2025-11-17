import { createClient } from '@supabase/supabase-js';
import { Database } from '@/constants/supabaseTypes';
import { JournalEntry, LearningProfile as AppLearningProfile } from '@/constants/types';
import { 
  analyzeJournalText,
  calculateEntryFrequency,
  extractCommonThemes,
  calculateConfidenceScore,
  calculateUnderstandingScore,
  calculateEngagementScore,
  JournalAnalysis,
} from './journalAnalytics';
import { calculateLearningStyleMatch } from './learningStyleUtils';

// Types
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Journal = Database['public']['Tables']['journals']['Row'];
export type LessonFeedback = Database['public']['Tables']['lesson_feedback']['Row'];
export type ScheduledLesson = Database['public']['Tables']['scheduled_lessons']['Row'];
export type SafetyCheckin = Database['public']['Tables']['safety_checkins']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type SkillProgress = Database['public']['Tables']['skill_progress']['Row'];
export type LearningProfile = Database['public']['Tables']['learning_profiles']['Row'];
export type AdaptiveProgress = Database['public']['Tables']['adaptive_progress']['Row'];
export type LearningPathRecommendation = Database['public']['Tables']['learning_path_recommendations']['Row'];

// Create a single supabase client for the whole app
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// User Profile Functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const createUserProfile = async (profile: Database['public']['Tables']['user_profiles']['Insert']) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profile)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: Database['public']['Tables']['user_profiles']['Update']) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Journal Functions
export const getJournalEntries = async (userId: string) => {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getJournalEntry = async (journalId: string) => {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('id', journalId)
    .single();
  
  if (error) throw error;
  return data;
};

export const createJournal = async (entry: Database['public']['Tables']['journals']['Insert']) => {
  // Get recent entries for context
  const recentEntries = await getJournalEntries(entry.user_id);
  const learningProfile = await getLearningProfile(entry.user_id);
  const skillProgress = await getSkillProgress(entry.user_id, 'swimming');

  // Generate AI analysis if text content is provided
  let aiAnalysis = null;
  if (entry.text_content) {
    try {
      aiAnalysis = await analyzeJournalText(
        entry.text_content,
        entry as JournalEntry,
        learningProfile,
        skillProgress,
        recentEntries
      );
    } catch (error) {
      console.error('Error analyzing journal text:', error);
    }
  }

  const { data, error } = await supabase
    .from('journals')
    .insert({
      ...entry,
      ai_analysis: aiAnalysis,
      sentiment_score: aiAnalysis?.sentiment || 0.5,
    })
    .select()
    .single();
  
  if (error) throw error;

  // Record adaptive progress after journal creation
  try {
    const adaptiveMetrics = aiAnalysis?.advanced_metrics;
    await recordAdaptiveProgress({
      user_id: entry.user_id,
      lesson_id: 'journal',
      learning_path_progress: adaptiveMetrics?.progressIndicators.skillProgression || 0,
      comprehension_score: adaptiveMetrics?.progressIndicators.techniqueMastery || 0.5,
      engagement_score: adaptiveMetrics?.learningPatterns.practiceConsistency || 0.8,
      practice_efficiency: adaptiveMetrics?.progressIndicators.skillProgression || 0.7,
      difficulty_rating: 3,
      adaptivity_metrics: {
        journaling_consistency: true,
        reflection_quality: adaptiveMetrics?.textMetrics.vocabularyDiversity || 0.5,
        media_usage: entry.entry_type !== 'text',
        learning_style_match: calculateLearningStyleMatch(entry.entry_type, learningProfile),
        pace_alignment: adaptiveMetrics?.learningPatterns.adaptationSpeed || 0.5,
      },
      recommendations: [
        ...(adaptiveMetrics?.recommendations.immediate || []),
        ...(adaptiveMetrics?.recommendations.shortTerm || []),
      ],
    });

    // Update learning profile with new insights
    if (learningProfile && adaptiveMetrics) {
      await updateLearningProfile(learningProfile.id, {
        engagement_level: Math.min(1, learningProfile.engagement_level + 0.1),
        practice_efficiency: adaptiveMetrics.progressIndicators.skillProgression,
        focus_areas: adaptiveMetrics.skillAnalysis.focusAreas,
        strength_areas: adaptiveMetrics.learningPatterns.preferredTechniques,
        comprehension_level: adaptiveMetrics.progressIndicators.techniqueMastery,
        adaptivity_score: adaptiveMetrics.learningPatterns.adaptationSpeed,
      });
    }
  } catch (error) {
    console.error('Error recording adaptive progress:', error);
  }

  return data;
};

export const updateJournalEntry = async (journalId: string, updates: Database['public']['Tables']['journals']['Update']) => {
  // Get current entry and context
  const currentEntry = await getJournalEntry(journalId);
  if (!currentEntry) throw new Error('Journal entry not found');

  const recentEntries = await getJournalEntries(currentEntry.user_id);
  const learningProfile = await getLearningProfile(currentEntry.user_id);
  const skillProgress = await getSkillProgress(currentEntry.user_id, 'swimming');

  // Re-analyze text content if it's being updated
  if (updates.text_content) {
    try {
      const analysis = await analyzeJournalText(
        updates.text_content,
        { ...currentEntry, ...updates } as JournalEntry,
        learningProfile,
        skillProgress,
        recentEntries.filter((e: Database['public']['Tables']['journals']['Row']) => e.id !== journalId)
      );
      updates.ai_analysis = {
        sentiment: analysis.sentiment,
        key_themes: analysis.key_themes,
        learning_insights: analysis.learning_insights,
        recommendations: analysis.recommendations
      } as unknown as Database['public']['Tables']['journals']['Row']['ai_analysis'];
      updates.sentiment_score = analysis.sentiment;
    } catch (error) {
      console.error('Error analyzing updated journal text:', error);
    }
  }

  const { data, error } = await supabase
    .from('journals')
    .update(updates)
    .eq('id', journalId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteJournalEntry = async (journalId: string) => {
  const { error } = await supabase
    .from('journals')
    .delete()
    .eq('id', journalId);
  
  if (error) throw error;
};

export const getJournalAnalytics = async (userId: string) => {
  const { data: entries, error } = await supabase
    .from('journals')
    .select('created_at, ai_analysis, sentiment_score')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const analytics = {
    sentiment_trend: entries.map((entry: Database['public']['Tables']['journals']['Row']) => entry.sentiment_score || 0.5),
    entry_frequency: calculateEntryFrequency(entries),
    common_themes: extractCommonThemes(entries),
    progress_indicators: {
      confidence: calculateConfidenceScore(entries),
      understanding: calculateUnderstandingScore(entries),
      engagement: calculateEngagementScore(entries),
    },
  };

  return analytics;
};

// Lesson Feedback Functions
export const getLessonFeedback = async (userId: string, lessonId: string) => {
  const { data, error } = await supabase
    .from('lesson_feedback')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
  return data;
};

export const createLessonFeedback = async (feedback: Database['public']['Tables']['lesson_feedback']['Insert']) => {
  const { data, error } = await supabase
    .from('lesson_feedback')
    .insert(feedback)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateLessonFeedback = async (feedbackId: string, updates: Database['public']['Tables']['lesson_feedback']['Update']) => {
  const { data, error } = await supabase
    .from('lesson_feedback')
    .update(updates)
    .eq('id', feedbackId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Scheduled Lessons Functions
export const getScheduledLessons = async (userId: string) => {
  const { data, error } = await supabase
    .from('scheduled_lessons')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const createScheduledLesson = async (lesson: Database['public']['Tables']['scheduled_lessons']['Insert']) => {
  const { data, error } = await supabase
    .from('scheduled_lessons')
    .insert(lesson)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateScheduledLesson = async (lessonId: string, updates: Database['public']['Tables']['scheduled_lessons']['Update']) => {
  const { data, error } = await supabase
    .from('scheduled_lessons')
    .update(updates)
    .eq('id', lessonId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteScheduledLesson = async (lessonId: string) => {
  const { error } = await supabase
    .from('scheduled_lessons')
    .delete()
    .eq('id', lessonId);
  
  if (error) throw error;
};

// Safety Check-ins Functions
export const getSafetyCheckins = async (userId: string) => {
  const { data, error } = await supabase
    .from('safety_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createSafetyCheckin = async (checkin: Database['public']['Tables']['safety_checkins']['Insert']) => {
  const { data, error } = await supabase
    .from('safety_checkins')
    .insert(checkin)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Achievements Functions
export const getAchievements = async (userId: string) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const unlockAchievement = async (achievementId: string) => {
  const { data, error } = await supabase
    .from('achievements')
    .update({ unlocked: true, unlocked_at: new Date().toISOString() })
    .eq('id', achievementId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Skill Progress Functions
export const getSkillProgress = async (userId: string, skillName: string) => {
  const { data, error } = await supabase
    .from('skill_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('skill_name', skillName)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
  return data;
};

export const updateSkillProgress = async (userId: string, skillName: string, updates: Database['public']['Tables']['skill_progress']['Update']) => {
  // First try to update existing record
  const { data: updateData, error: updateError } = await supabase
    .from('skill_progress')
    .update(updates)
    .eq('user_id', userId)
    .eq('skill_name', skillName)
    .select()
    .single();
  
  // If no record exists, create a new one
  if (updateError && updateError.code === 'PGRST116') {
    const { data: insertData, error: insertError } = await supabase
      .from('skill_progress')
      .insert({
        user_id: userId,
        skill_name: skillName,
        ...updates
      } as Database['public']['Tables']['skill_progress']['Insert'])
      .select()
      .single();
    
    if (insertError) throw insertError;
    return insertData;
  }
  
  if (updateError) throw updateError;
  return updateData;
};

// Leaderboard Functions
export const getLeaderboard = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*, user_profiles(name)')
    .order('total_xp', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
};

// Authentication Functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'flipper://auth/confirm-email'
    }
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'flipper://auth/reset-password'
  });
  
  if (error) throw error;
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) throw error;
};

export const resendVerificationEmail = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: 'flipper://auth/confirm-email'
    }
  });
  
  if (error) throw error;
};

// Adaptive Learning Functions
export const getLearningProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('learning_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createLearningProfile = async (profile: Database['public']['Tables']['learning_profiles']['Insert']) => {
  const { data, error } = await supabase
    .from('learning_profiles')
    .insert(profile)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateLearningProfile = async (profileId: string, updates: Database['public']['Tables']['learning_profiles']['Update']) => {
  const { data, error } = await supabase
    .from('learning_profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const recordAdaptiveProgress = async (progress: Database['public']['Tables']['adaptive_progress']['Insert']) => {
  const { data, error } = await supabase
    .from('adaptive_progress')
    .insert(progress)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getAdaptiveProgress = async (userId: string, lessonId: string) => {
  const { data, error } = await supabase
    .from('adaptive_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const getLearningPathRecommendations = async (userId: string) => {
  const { data, error } = await supabase
    .from('learning_path_recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateLearningPathRecommendations = async (
  userId: string,
  recommendations: Database['public']['Tables']['learning_path_recommendations']['Insert']
) => {
  const { data, error } = await supabase
    .from('learning_path_recommendations')
    .upsert({
      ...recommendations,
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Alias exports for backward compatibility
export const getJournals = getJournalEntries;
export const updateJournal = updateJournalEntry;
export const deleteJournal = deleteJournalEntry;

export default {
  supabase,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal,
  getLessonFeedback,
  createLessonFeedback,
  updateLessonFeedback,
  getScheduledLessons,
  createScheduledLesson,
  updateScheduledLesson,
  deleteScheduledLesson,
  getSafetyCheckins,
  createSafetyCheckin,
  getAchievements,
  unlockAchievement,
  getSkillProgress,
  updateSkillProgress,
  getLeaderboard,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getLearningProfile,
  createLearningProfile,
  updateLearningProfile,
  recordAdaptiveProgress,
  getAdaptiveProgress,
  getLearningPathRecommendations,
  updateLearningPathRecommendations,
};