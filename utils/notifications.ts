import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationPreferences {
  authEvents: boolean;
  lessonReminders: boolean;
  progressUpdates: boolean;
  achievements: boolean;
  dailyTips: boolean;
}

export async function registerForPushNotifications() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PROJECT_ID,
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

export async function saveNotificationToken(userId: string, token: string) {
  try {
    const { error } = await supabase
      .from('notification_tokens')
      .upsert({
        user_id: userId,
        token,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving notification token:', error);
  }
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
) {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
  }
}

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      authEvents: data?.auth_events ?? true,
      lessonReminders: data?.lesson_reminders ?? true,
      progressUpdates: data?.progress_updates ?? true,
      achievements: data?.achievements ?? true,
      dailyTips: data?.daily_tips ?? true,
    };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return {
      authEvents: true,
      lessonReminders: true,
      progressUpdates: true,
      achievements: true,
      dailyTips: true,
    };
  }
}

export async function scheduleNotification({
  title,
  body,
  data,
  trigger,
}: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  trigger?: Notifications.NotificationTriggerInput;
}) {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: trigger || null,
    });
    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

export async function cancelNotification(id: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

// Auth event notifications
export async function sendAuthEventNotification(
  userId: string,
  event: 'login' | 'signup' | 'password_reset' | 'email_change'
) {
  try {
    const prefs = await getNotificationPreferences(userId);
    if (!prefs.authEvents) return;

    const messages = {
      login: {
        title: 'New Sign In',
        body: 'A new sign in was detected on your account.',
      },
      signup: {
        title: 'Welcome to Flippers!',
        body: 'Your account has been successfully created.',
      },
      password_reset: {
        title: 'Password Reset',
        body: 'Your password has been successfully reset.',
      },
      email_change: {
        title: 'Email Updated',
        body: 'Your email address has been successfully updated.',
      },
    };

    await scheduleNotification(messages[event]);
  } catch (error) {
    console.error('Error sending auth event notification:', error);
  }
}

// Lesson reminder notifications
export async function scheduleLessonReminder(
  userId: string,
  lessonId: string,
  scheduledDate: Date
) {
  try {
    const prefs = await getNotificationPreferences(userId);
    if (!prefs.lessonReminders) return;

    // Schedule 1 hour before
    const reminderDate = new Date(scheduledDate);
    reminderDate.setHours(reminderDate.getHours() - 1);

    return await scheduleNotification({
      title: 'Upcoming Lesson',
      body: 'Your swimming lesson starts in 1 hour. Get ready!',
      data: { lessonId },
      trigger: reminderDate,
    });
  } catch (error) {
    console.error('Error scheduling lesson reminder:', error);
    return null;
  }
}

// Progress update notifications
export async function sendProgressUpdateNotification(
  userId: string,
  update: {
    type: 'level_up' | 'module_complete' | 'skill_mastered';
    details: string;
  }
) {
  try {
    const prefs = await getNotificationPreferences(userId);
    if (!prefs.progressUpdates) return;

    const messages = {
      level_up: {
        title: 'Level Up!',
        body: `Congratulations! ${update.details}`,
      },
      module_complete: {
        title: 'Module Completed',
        body: `Great job! ${update.details}`,
      },
      skill_mastered: {
        title: 'Skill Mastered',
        body: `Amazing progress! ${update.details}`,
      },
    };

    await scheduleNotification(messages[update.type]);
  } catch (error) {
    console.error('Error sending progress update notification:', error);
  }
}

// Achievement notifications
export async function sendAchievementNotification(
  userId: string,
  achievement: {
    title: string;
    description: string;
    xpReward: number;
  }
) {
  try {
    const prefs = await getNotificationPreferences(userId);
    if (!prefs.achievements) return;

    await scheduleNotification({
      title: 'New Achievement Unlocked!',
      body: `${achievement.title} - ${achievement.description} (+${achievement.xpReward} XP)`,
    });
  } catch (error) {
    console.error('Error sending achievement notification:', error);
  }
}

// Daily tip notifications
export async function scheduleDailyTip(userId: string) {
  try {
    const prefs = await getNotificationPreferences(userId);
    if (!prefs.dailyTips) return;

    // Schedule for 9 AM next day
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    return await scheduleNotification({
      title: 'Daily Swimming Tip',
      body: 'Check today\'s tip to improve your swimming technique!',
      trigger: tomorrow,
    });
  } catch (error) {
    console.error('Error scheduling daily tip:', error);
    return null;
  }
}

// Adaptive learning notifications
export async function scheduleAdaptiveLearningNotifications(
  userId: string,
  recommendations: {
    nextLessons: string[];
    practiceSuggestions: string[];
    focusAreas: string[];
    estimatedTimeToMastery: number;
  }
) {
  try {
    const prefs = await getNotificationPreferences(userId);
    if (!prefs.progressUpdates) return;

    // Schedule focus area practice reminder
    if (recommendations.focusAreas.length > 0) {
      const focusArea = recommendations.focusAreas[0];
      const practiceTime = new Date();
      practiceTime.setHours(practiceTime.getHours() + 4); // 4 hours from now

      await scheduleNotification({
        title: 'Practice Reminder',
        body: `Time to practice ${focusArea}! This is one of your focus areas for improvement.`,
        trigger: { date: practiceTime },
      });
    }

    // Schedule next lesson reminder
    if (recommendations.nextLessons.length > 0) {
      const nextLesson = recommendations.nextLessons[0];
      const lessonTime = new Date();
      lessonTime.setDate(lessonTime.getDate() + 1); // Tomorrow
      lessonTime.setHours(10, 0, 0, 0); // 10 AM

      await scheduleNotification({
        title: 'Recommended Lesson',
        body: `Your next personalized lesson is ready! Based on your progress, we recommend focusing on Lesson ${nextLesson}.`,
        trigger: { date: lessonTime },
      });
    }

    // Schedule mastery progress update
    if (recommendations.estimatedTimeToMastery > 0) {
      const progressCheckTime = new Date();
      progressCheckTime.setDate(progressCheckTime.getDate() + 7); // Weekly check
      progressCheckTime.setHours(18, 0, 0, 0); // 6 PM

      await scheduleNotification({
        title: 'Learning Progress Update',
        body: `You're ${Math.round((1 - recommendations.estimatedTimeToMastery / 30) * 100)}% of the way to mastering your current level! Keep going!`,
        trigger: { date: progressCheckTime },
      });
    }

    // Schedule practice suggestion
    if (recommendations.practiceSuggestions.length > 0) {
      const suggestion = recommendations.practiceSuggestions[0];
      const suggestionTime = new Date();
      suggestionTime.setHours(suggestionTime.getHours() + 2); // 2 hours from now

      await scheduleNotification({
        title: 'Personalized Practice Tip',
        body: suggestion,
        trigger: { date: suggestionTime },
      });
    }
  } catch (error) {
    console.error('Error scheduling adaptive learning notifications:', error);
  }
}