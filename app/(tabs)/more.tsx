import { useRouter } from 'expo-router';
import {
  Shield,
  HelpCircle,
  AlertCircle,
  Bell,
  Moon,
  Globe,
  Lock,
  User,
  LogOut,
  ChevronRight,
  Users,
  MessageCircle,
  Trophy,
  Share2,
  ShoppingBag,
  Download,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

type SettingItemProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightComponent?: React.ReactNode;
};

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  rightComponent,
}: SettingItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        pressed && styles.settingItemPressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.settingItemContent}>
          <Text style={styles.settingItemTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightComponent ||
        (showChevron && onPress && (
          <ChevronRight size={20} color={Colors.text.light} />
        ))}
    </Pressable>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          router.replace('/onboarding/splash');
        },
      },
    ]);
  };

  // Function to navigate to marketplace
  const openMarketplace = () => {
    router.push('/marketplace' as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>More</Text>
            <Text style={styles.headerSubtitle}>
              Community, settings, and support
            </Text>
          </View>

          <Pressable style={styles.profileCard} onPress={() => {}}>
            <View style={styles.profileAvatar}>
              <User size={32} color={Colors.text.white} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Alex Swimmer</Text>
              <Text style={styles.profileLevel}>Beginner Level 1</Text>
              <View style={styles.profileStats}>
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatValue}>24</Text>
                  <Text style={styles.profileStatLabel}>Lessons</Text>
                </View>
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatValue}>18</Text>
                  <Text style={styles.profileStatLabel}>Sessions</Text>
                </View>
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatValue}>8</Text>
                  <Text style={styles.profileStatLabel}>Badges</Text>
                </View>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.text.light} />
          </Pressable>

          {/* Marketplace Card */}
          <View style={styles.section}>
            <Pressable
              style={styles.marketplaceCard}
              onPress={openMarketplace}
            >
              <View style={styles.marketplaceCardContent}>
                <ShoppingBag size={24} color={Colors.accent.black} />
                <View style={styles.marketplaceTextContainer}>
                  <Text style={styles.marketplaceTitle}>Marketplace</Text>
                  <Text style={styles.marketplaceDescription}>
                    Discover, shop and equip yourself with all you need for your swimming experience.
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.text.light} />
              </View>
            </Pressable>
          </View>

          {/* Downloads Card */}
          <View style={styles.section}>
            <Pressable
              style={styles.marketplaceCard}
              onPress={() => router.push('/downloads' as any)}
            >
              <View style={styles.marketplaceCardContent}>
                <Download size={24} color={Colors.primary.turquoise} />
                <View style={styles.marketplaceTextContainer}>
                  <Text style={styles.marketplaceTitle}>Downloads</Text>
                  <Text style={styles.marketplaceDescription}>
                    Manage your offline videos and watch lessons anywhere.
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.text.light} />
              </View>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community</Text>
            <View style={styles.settingsCard}>
              <SettingItem
                icon={<Users size={20} color={Colors.accent.info} />}
                title="Community Feed"
                subtitle="Connect with fellow swimmers"
                onPress={() => {}}
              />
              <View style={styles.divider} />
              <SettingItem
                icon={<MessageCircle size={20} color={Colors.accent.info} />}
                title="Q&A Forum"
                subtitle="Ask questions and share tips"
                onPress={() => {}}
              />
              <View style={styles.divider} />
              <SettingItem
                icon={<Trophy size={20} color={Colors.accent.warning} />}
                title="Challenges"
                subtitle="Join competitions and earn rewards"
                onPress={() => router.push('/challenges' as any)}
              />
              <View style={styles.divider} />
              <SettingItem
                icon={<Share2 size={20} color={Colors.accent.success} />}
                title="Find Swim Buddies"
                subtitle="Connect with accountability partners"
                onPress={() => {}}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety & Support</Text>
            <View style={styles.settingsCard}>
              <SettingItem
                icon={<Shield size={20} color={Colors.accent.error} />}
                title="Safety Resources"
                subtitle="Emergency procedures and water safety"
                onPress={() => router.push('/settings/safety' as any)}
              />
              <View style={styles.divider} />
              <SettingItem
                icon={<HelpCircle size={20} color={Colors.accent.info} />}
                title="Help & Support"
                subtitle="FAQs, tutorials, and contact support"
                onPress={() => router.push('/settings/support' as any)}
              />
              <View style={styles.divider} />
              <SettingItem
                icon={<AlertCircle size={20} color={Colors.accent.warning} />}
                title="Accessibility"
                subtitle="Text size, contrast, and more"
                onPress={() => router.push('/settings/accessibility' as any)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.settingsCard}>
              <SettingItem
                icon={<Bell size={20} color={Colors.accent.black} />}
                title="Notifications"
                subtitle={notifications ? 'Enabled' : 'Disabled'}
                showChevron={false}
                rightComponent={
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{
                      false: Colors.ui.border,
                      true: Colors.accent.black,
                    }}
                    thumbColor={Colors.background.white}
                  />
                }
              />
              <View style={styles.divider} />
              <SettingItem
                icon={<Moon size={20} color={Colors.accent.black} />}
                title="Dark Mode"
                subtitle={darkMode ? 'On' : 'Off'}
                showChevron={false}
                rightComponent={
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{
                      false: Colors.ui.border,
                      true: Colors.accent.black,
                    }}
                    thumbColor={Colors.background.white}
                  />
                }
              />
              <View style={styles.divider} />
              <SettingItem
                icon={<Globe size={20} color={Colors.accent.black} />}
                title="Language"
                subtitle="English"
                onPress={() => {}}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.settingsCard}>
              <SettingItem
                icon={<Lock size={20} color={Colors.accent.black} />}
                title="Privacy"
                subtitle="Control your data and visibility"
                onPress={() => {}}
              />
              <View style={styles.divider} />
              <SettingItem
                icon={<User size={20} color={Colors.accent.black} />}
                title="Account Settings"
                subtitle="Email, password, and more"
                onPress={() => {}}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
              onPress={handleLogout}
            >
              <LogOut size={20} color={Colors.accent.error} />
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Flippers v1.0.0</Text>
            <View style={styles.footerLinks}>
              <Text style={styles.footerLink}>Terms of Service</Text>
              <Text style={styles.footerSeparator}>•</Text>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileLevel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 16,
  },
  profileStatItem: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  profileStatLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.text.light,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    overflow: 'hidden',
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
    padding: 16,
  },
  settingItemPressed: {
    backgroundColor: Colors.background.light,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.ui.border,
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutButtonPressed: {
    opacity: 0.7,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.accent.error,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.light,
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  footerSeparator: {
    fontSize: 14,
    color: Colors.text.light,
  },
  marketplaceCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  marketplaceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  marketplaceTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  marketplaceTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  marketplaceDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  subscriptionCard: {
    backgroundColor: Colors.primary.turquoise,
    borderRadius: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  subscriptionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  subscriptionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.white,
    marginBottom: 4,
  },
  subscriptionDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});