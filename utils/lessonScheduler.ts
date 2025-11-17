import { supabase } from './supabase';
import type { SkillLevel } from '@/constants/types';

export interface LessonSchedule {
  id: string;
  userId: string;
  lessonId: string;
  scheduledDate: Date;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  skillLevel: SkillLevel;
  moduleId: number;
}

export interface SchedulingPreference {
  preferredDays: string[];
  preferredTimes: string[];
  sessionDuration: number;
  weeklyFrequency: number;
}

export const scheduleNextLesson = async (
  userId: string, 
  skillLevel: SkillLevel, 
  moduleId: number,
  preferences: SchedulingPreference
): Promise<LessonSchedule | null> => {
  try {
    // Get the next available lesson for the user's skill level and module
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('skill_level', skillLevel)
      .eq('module_id', moduleId)
      .order('sequence_number', { ascending: true })
      .limit(1)
      .single();

    if (lessonError) throw lessonError;
    if (!lessonData) return null;

    // Find the next available slot based on user preferences
    const nextSlot = calculateNextAvailableSlot(preferences);

    // Create the lesson schedule
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('lesson_schedules')
      .insert({
        user_id: userId,
        lesson_id: lessonData.id,
        scheduled_date: nextSlot,
        status: 'scheduled',
        skill_level: skillLevel,
        module_id: moduleId
      })
      .select()
      .single();

    if (scheduleError) throw scheduleError;
    return scheduleData as LessonSchedule;

  } catch (error) {
    console.error('Error scheduling lesson:', error);
    return null;
  }
};

export const calculateNextAvailableSlot = (preferences: SchedulingPreference): Date => {
  const now = new Date();
  let nextSlot = new Date(now);

  // Find the next preferred day
  while (!preferences.preferredDays.includes(nextSlot.toLocaleDateString('en-US', { weekday: 'long' }))) {
    nextSlot.setDate(nextSlot.getDate() + 1);
  }

  // Set the preferred time
  const [hours, minutes] = preferences.preferredTimes[0].split(':');
  nextSlot.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  // If the calculated time is in the past, move to the next preferred day
  if (nextSlot < now) {
    nextSlot.setDate(nextSlot.getDate() + 1);
    while (!preferences.preferredDays.includes(nextSlot.toLocaleDateString('en-US', { weekday: 'long' }))) {
      nextSlot.setDate(nextSlot.getDate() + 1);
    }
  }

  return nextSlot;
};

export const getUpcomingLessons = async (userId: string): Promise<LessonSchedule[]> => {
  try {
    const { data, error } = await supabase
      .from('lesson_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .gte('scheduled_date', new Date().toISOString())
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    return data as LessonSchedule[];
  } catch (error) {
    console.error('Error fetching upcoming lessons:', error);
    return [];
  }
};

export const updateLessonStatus = async (
  scheduleId: string, 
  status: LessonSchedule['status']
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lesson_schedules')
      .update({ status })
      .eq('id', scheduleId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating lesson status:', error);
    return false;
  }
};

export const rescheduleLesson = async (
  scheduleId: string,
  newDate: Date,
  reason?: string
): Promise<LessonSchedule | null> => {
  try {
    const { data, error } = await supabase
      .from('lesson_schedules')
      .update({ 
        scheduled_date: newDate,
        rescheduled_reason: reason 
      })
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) throw error;
    return data as LessonSchedule;
  } catch (error) {
    console.error('Error rescheduling lesson:', error);
    return null;
  }
};