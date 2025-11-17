import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import {
  NotificationPreferences,
  getNotificationPreferences,
  updateNotificationPreferences,
  registerForPushNotifications,
  saveNotificationToken,
} from '@/utils/notifications';

type NotificationSetting = {
  key: keyof NotificationPreferences;
  title: string;
  description: string;
};

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    key: 'authEvents',
    title: 'Security Alerts',
    description: 'Get notified about sign-ins and account changes',
  },
  {
    key: 'lessonReminders',
    title: 'Lesson Reminders',
    description: 'Receive reminders before scheduled lessons',
  },
  {
    key: 'progressUpdates',
    title: 'Progress Updates',
    description: 'Stay updated on your learning progress',
  },
  {
    key: 'achievements',
    title: 'Achievements',
    description: 'Get notified when you unlock achievements',
  },
  {
    key: 'dailyTips',
    title: 'Daily Tips',
    description: 'Receive daily swimming tips and tricks',
  },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    authEvents: true,
    lessonReminders: true,
    progressUpdates: true,
    achievements: true,
    dailyTips: true,
  });

  useEffect(() => {
    if (user) {
      loadPreferences();
      setupNotifications();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences(user!.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      Alert.alert('Error', 'Failed to load notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const setupNotifications = async () => {
    try {
      const token = await registerForPushNotifications();
      if (token) {
        await saveNotificationToken(user!.id, token.data);
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const handleToggle = async (setting: keyof NotificationPreferences) => {
    try {
      const newPreferences = {
        ...preferences,
        [setting]: !preferences[setting],
      };

      await updateNotificationPreferences(user!.id, {
        [setting]: !preferences[setting],
      });

      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error updating notification preference:', error);
      Alert.alert('Error', 'Failed to update notification setting');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ArrowLeft
            size={24}
            color={Colors.text.primary}
            onPress={() => router.back()}
          />
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Bell size={20} color={Colors.text.primary} />
              <Text style={styles.sectionTitle}>Notification Preferences</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Choose which notifications you'd like to receive
            </Text>
          </View>

          <View style={styles.settingsContainer}>
            {NOTIFICATION_SETTINGS.map(setting => (
              <View key={setting.key} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={preferences[setting.key]}
                  onValueChange={() => handleToggle(setting.key)}
                  trackColor={{
                    false: Colors.ui.border,
                    true: Colors.accent.black,
                  }}
                  thumbColor={Colors.background.white}
                />
              </View>
            ))}
          </View>

          <Text style={styles.footer}>
            You can change these settings at any time
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  settingsContainer: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  footer: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 24,
  },
});