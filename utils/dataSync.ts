import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { Journal, LessonFeedback, ScheduledLesson, SafetyCheckin } from '@/utils/supabase';

// Types for offline data
export interface OfflineData {
  journals: Journal[];
  lessonFeedback: LessonFeedback[];
  scheduledLessons: ScheduledLesson[];
  safetyCheckins: SafetyCheckin[];
  lastSync: string | null;
}

// Storage keys
const OFFLINE_DATA_KEY = 'offline_data';
const LAST_SYNC_KEY = 'last_sync';

// Initialize offline data structure
const initializeOfflineData = async (): Promise<OfflineData> => {
  const existingData = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
  if (existingData) {
    return JSON.parse(existingData);
  }
  
  const newData: OfflineData = {
    journals: [],
    lessonFeedback: [],
    scheduledLessons: [],
    safetyCheckins: [],
    lastSync: null
  };
  
  await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(newData));
  return newData;
};

// Save data to offline storage
export const saveOfflineData = async (data: Partial<OfflineData>) => {
  try {
    const currentData = await initializeOfflineData();
    const updatedData = { ...currentData, ...data };
    await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(updatedData));
    return updatedData;
  } catch (error) {
    console.error('Failed to save offline data:', error);
    throw error;
  }
};

// Get offline data
export const getOfflineData = async (): Promise<OfflineData> => {
  try {
    return await initializeOfflineData();
  } catch (error) {
    console.error('Failed to get offline data:', error);
    throw error;
  }
};

// Clear offline data
export const clearOfflineData = async () => {
  try {
    await AsyncStorage.removeItem(OFFLINE_DATA_KEY);
    await AsyncStorage.removeItem(LAST_SYNC_KEY);
  } catch (error) {
    console.error('Failed to clear offline data:', error);
    throw error;
  }
};

// Check network connectivity (simplified implementation)
export const isOnline = async (): Promise<boolean> => {
  // In a real implementation, you would use NetInfo or a network check
  // For now, we'll assume online for demo purposes
  return true;
};

// Sync offline data with Supabase
export const syncOfflineData = async (userId: string): Promise<boolean> => {
  try {
    const online = await isOnline();
    if (!online) {
      console.log('Device is offline, skipping sync');
      return false;
    }
    
    console.log('Starting data sync...');
    const offlineData = await getOfflineData();
    
    // Sync journals
    for (const journal of offlineData.journals) {
      if (!journal.id) {
        // New journal - create it
        try {
          await supabase.from('journals').insert({
            user_id: userId,
            entry_type: journal.entry_type,
            text_content: journal.text_content,
            audio_url: journal.audio_url,
            video_url: journal.video_url,
            ai_analysis: journal.ai_analysis,
            sentiment_score: journal.sentiment_score,
            tags: journal.tags,
            is_private: journal.is_private
          });
        } catch (error) {
          console.error('Failed to sync journal:', error);
        }
      }
    }
    
    // Sync lesson feedback
    for (const feedback of offlineData.lessonFeedback) {
      if (!feedback.id) {
        // New feedback - create it
        try {
          await supabase.from('lesson_feedback').insert({
            user_id: userId,
            lesson_id: feedback.lesson_id,
            feedback_type: feedback.feedback_type,
            comments: feedback.comments,
            difficulty_rating: feedback.difficulty_rating,
            helpfulness_rating: feedback.helpfulness_rating
          });
        } catch (error) {
          console.error('Failed to sync lesson feedback:', error);
        }
      }
    }
    
    // Sync scheduled lessons
    for (const lesson of offlineData.scheduledLessons) {
      if (!lesson.id) {
        // New scheduled lesson - create it
        try {
          await supabase.from('scheduled_lessons').insert({
            user_id: userId,
            lesson_id: lesson.lesson_id,
            title: lesson.title,
            scheduled_date: lesson.scheduled_date,
            scheduled_time: lesson.scheduled_time,
            notes: lesson.notes,
            reminder_enabled: lesson.reminder_enabled,
            reminder_minutes: lesson.reminder_minutes,
            completed: lesson.completed,
            completion_date: lesson.completion_date,
            calendar_event_id: lesson.calendar_event_id
          });
        } catch (error) {
          console.error('Failed to sync scheduled lesson:', error);
        }
      }
    }
    
    // Sync safety check-ins
    for (const checkin of offlineData.safetyCheckins) {
      if (!checkin.id) {
        // New check-in - create it
        try {
          await supabase.from('safety_checkins').insert({
            user_id: userId,
            pool_conditions: checkin.pool_conditions,
            gear_checklist: checkin.gear_checklist,
            environment_rating: checkin.environment_rating,
            notes: checkin.notes,
            xp_earned: checkin.xp_earned
          });
        } catch (error) {
          console.error('Failed to sync safety check-in:', error);
        }
      }
    }
    
    // Clear offline data after successful sync
    await clearOfflineData();
    
    // Update last sync time
    const syncTime = new Date().toISOString();
    await AsyncStorage.setItem(LAST_SYNC_KEY, syncTime);
    
    console.log('Data sync completed successfully');
    return true;
  } catch (error) {
    console.error('Data sync failed:', error);
    return false;
  }
};

// Queue data for offline storage
export const queueForOffline = async (
  dataType: keyof OfflineData,
  data: any
) => {
  try {
    const offlineData = await getOfflineData();
    
    // Add to appropriate array
    switch (dataType) {
      case 'journals':
        offlineData.journals.push(data);
        break;
      case 'lessonFeedback':
        offlineData.lessonFeedback.push(data);
        break;
      case 'scheduledLessons':
        offlineData.scheduledLessons.push(data);
        break;
      case 'safetyCheckins':
        offlineData.safetyCheckins.push(data);
        break;
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
    
    await saveOfflineData(offlineData);
    console.log(`Data queued for offline storage: ${dataType}`);
  } catch (error) {
    console.error('Failed to queue data for offline storage:', error);
    throw error;
  }
};

// Get last sync time
export const getLastSyncTime = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LAST_SYNC_KEY);
  } catch (error) {
    console.error('Failed to get last sync time:', error);
    return null;
  }
};

// Auto-sync when connection is restored
// Note: This requires @react-native-netinfo to be installed
export const setupAutoSync = (userId: string) => {
  // In a real implementation:
  // NetInfo.addEventListener((state: any) => {
  //   if (state.isConnected && state.isInternetReachable) {
  //     console.log('Network connection restored, attempting sync...');
  //     syncOfflineData(userId);
  //   }
  // });
  console.log('Auto-sync setup (requires @react-native-netinfo)');
};

// Periodic sync function
export const setupPeriodicSync = (userId: string, intervalMinutes: number = 30) => {
  setInterval(async () => {
    const online = await isOnline();
    if (online) {
      syncOfflineData(userId);
    }
  }, intervalMinutes * 60 * 1000);
};

export default {
  saveOfflineData,
  getOfflineData,
  clearOfflineData,
  isOnline,
  syncOfflineData,
  queueForOffline,
  getLastSyncTime,
  setupAutoSync,
  setupPeriodicSync
};