import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  registerForPushNotifications,
  saveNotificationToken,
  scheduleNotification,
  scheduleLessonReminder,
  scheduleAdaptiveLearningNotifications,
  sendAchievementNotification,
} from '@/utils/notifications';
import {
  generateJournalingNotification,
  generateInsightNotification,
  generateMilestoneNotification,
} from '@/utils/adaptiveNotifications';
import { getJournalEntries, getLearningProfile, getCurrentUser } from '@/utils/supabase';
import type { AdaptiveNotification } from '@/constants/types';

interface SmartNotificationsState {
  isInitialized: boolean;
  pendingNotifications: AdaptiveNotification[];
  optimalTimes: {
    morning: number; // hour (0-23)
    afternoon: number;
    evening: number;
  };
}

/**
 * Smart Notifications Hook
 * Intelligently schedules notifications based on user behavior and preferences
 */
export function useSmartNotifications() {
  const [state, setState] = useState<SmartNotificationsState>({
    isInitialized: false,
    pendingNotifications: [],
    optimalTimes: {
      morning: 9,
      afternoon: 14,
      evening: 18,
    },
  });

  useEffect(() => {
    initializeSmartNotifications();

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const initializeSmartNotifications = async () => {
    try {
      // Register for push notifications
      const token = await registerForPushNotifications();

      if (token) {
        const user = await getCurrentUser();
        if (user) {
          await saveNotificationToken(user.id, token.data);
          await loadUserNotificationPreferences(user.id);
          await scheduleSmartNotifications(user.id);
        }
      }

      setState((prev) => ({ ...prev, isInitialized: true }));
    } catch (error) {
      console.error('Error initializing smart notifications:', error);
    }
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // Refresh notifications when app comes to foreground
      const user = await getCurrentUser();
      if (user) {
        await scheduleSmartNotifications(user.id);
      }
    }
  };

  const loadUserNotificationPreferences = async (userId: string) => {
    try {
      // Get user's historical activity to determine optimal notification times
      const journals = await getJournalEntries(userId);

      if (journals && journals.length > 0) {
        // Analyze when user is most active
        const activityHours = journals.map((entry) => {
          const date = new Date(entry.created_at);
          return date.getHours();
        });

        // Find peak activity times
        const hourCounts = activityHours.reduce((acc, hour) => {
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        const sortedHours = Object.entries(hourCounts)
          .sort(([, a], [, b]) => b - a)
          .map(([hour]) => parseInt(hour));

        // Set optimal times based on user activity
        if (sortedHours.length >= 3) {
          setState((prev) => ({
            ...prev,
            optimalTimes: {
              morning: sortedHours[0],
              afternoon: sortedHours[1],
              evening: sortedHours[2],
            },
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user notification preferences:', error);
    }
  };

  const scheduleSmartNotifications = async (userId: string) => {
    try {
      const [journals, learningProfile] = await Promise.all([
        getJournalEntries(userId),
        getLearningProfile(userId),
      ]);

      const notifications: AdaptiveNotification[] = [];

      // Generate journaling reminder
      const journalNotif = generateJournalingNotification(
        journals && journals.length > 0 ? journals[0] : null,
        learningProfile
      );
      if (journalNotif) notifications.push(journalNotif);

      // Generate insight notification (weekly)
      const recentJournals = journals?.slice(0, 7) || [];
      const insightNotif = generateInsightNotification(recentJournals, learningProfile);
      if (insightNotif) notifications.push(insightNotif);

      // Generate milestone notification
      const milestoneNotif = generateMilestoneNotification(
        journals || [],
        learningProfile
      );
      if (milestoneNotif) notifications.push(milestoneNotif);

      // Schedule notifications at optimal times
      for (const notif of notifications) {
        const triggerTime = getOptimalTriggerTime(notif.priority, state.optimalTimes);

        await scheduleNotification({
          title: notif.title,
          body: notif.message,
          data: notif.context,
          trigger: { date: triggerTime },
        });
      }

      setState((prev) => ({ ...prev, pendingNotifications: notifications }));
    } catch (error) {
      console.error('Error scheduling smart notifications:', error);
    }
  };

  const getOptimalTriggerTime = (
    priority: string,
    optimalTimes: { morning: number; afternoon: number; evening: number }
  ): Date => {
    const now = new Date();
    const triggerDate = new Date();

    // High priority: schedule for next optimal morning time
    if (priority === 'high') {
      if (now.getHours() < optimalTimes.morning) {
        triggerDate.setHours(optimalTimes.morning, 0, 0, 0);
      } else {
        triggerDate.setDate(triggerDate.getDate() + 1);
        triggerDate.setHours(optimalTimes.morning, 0, 0, 0);
      }
    }
    // Medium priority: schedule for next optimal afternoon time
    else if (priority === 'medium') {
      if (now.getHours() < optimalTimes.afternoon) {
        triggerDate.setHours(optimalTimes.afternoon, 0, 0, 0);
      } else {
        triggerDate.setDate(triggerDate.getDate() + 1);
        triggerDate.setHours(optimalTimes.afternoon, 0, 0, 0);
      }
    }
    // Low priority: schedule for next optimal evening time
    else {
      if (now.getHours() < optimalTimes.evening) {
        triggerDate.setHours(optimalTimes.evening, 0, 0, 0);
      } else {
        triggerDate.setDate(triggerDate.getDate() + 1);
        triggerDate.setHours(optimalTimes.evening, 0, 0, 0);
      }
    }

    return triggerDate;
  };

  return {
    isInitialized: state.isInitialized,
    pendingNotifications: state.pendingNotifications,
    optimalTimes: state.optimalTimes,
    refreshNotifications: async () => {
      const user = await getCurrentUser();
      if (user) {
        await scheduleSmartNotifications(user.id);
      }
    },
  };
}

export default useSmartNotifications;
