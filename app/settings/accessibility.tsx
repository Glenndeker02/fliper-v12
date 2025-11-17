import { useRouter } from 'expo-router';
import { ChevronLeft, Eye, Type, Volume2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
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

type SettingRowProps = {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SettingRow({ title, description, value, onValueChange }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: Colors.ui.border,
          true: Colors.accent.black,
        }}
        thumbColor={Colors.background.white}
      />
    </View>
  );
}

type TextSizeOption = 'small' | 'medium' | 'large' | 'extra-large';

export default function AccessibilityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [closedCaptions, setClosedCaptions] = useState(true);
  const [audioDescriptions, setAudioDescriptions] = useState(false);
  const [boldText, setBoldText] = useState(false);
  const [textSize, setTextSize] = useState<TextSizeOption>('medium');

  const textSizes: { value: TextSizeOption; label: string }[] = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'extra-large', label: 'Extra Large' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={Colors.accent.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Accessibility</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Type size={24} color={Colors.accent.black} />
              <Text style={styles.sectionTitle}>Text & Display</Text>
            </View>

            <View style={styles.card}>
              <SettingRow
                title="Large Text"
                description="Increase text size throughout the app"
                value={largeText}
                onValueChange={setLargeText}
              />
              <View style={styles.divider} />
              <SettingRow
                title="Bold Text"
                description="Make text bolder for easier reading"
                value={boldText}
                onValueChange={setBoldText}
              />
              <View style={styles.divider} />
              <SettingRow
                title="High Contrast"
                description="Increase contrast for better visibility"
                value={highContrast}
                onValueChange={setHighContrast}
              />
            </View>

            <View style={styles.textSizeCard}>
              <Text style={styles.textSizeLabel}>Text Size</Text>
              <View style={styles.textSizeOptions}>
                {textSizes.map((size) => (
                  <Pressable
                    key={size.value}
                    style={[
                      styles.textSizeButton,
                      textSize === size.value && styles.textSizeButtonActive,
                    ]}
                    onPress={() => setTextSize(size.value)}
                  >
                    <Text
                      style={[
                        styles.textSizeButtonText,
                        textSize === size.value && styles.textSizeButtonTextActive,
                      ]}
                    >
                      {size.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.textPreview}>
                <Text
                  style={[
                    styles.previewText,
                    textSize === 'small' && { fontSize: 14 },
                    textSize === 'medium' && { fontSize: 16 },
                    textSize === 'large' && { fontSize: 18 },
                    textSize === 'extra-large' && { fontSize: 20 },
                  ]}
                >
                  This is a preview of your selected text size
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Eye size={24} color={Colors.accent.black} />
              <Text style={styles.sectionTitle}>Visual</Text>
            </View>

            <View style={styles.card}>
              <SettingRow
                title="Reduce Motion"
                description="Minimize animations and transitions"
                value={reduceMotion}
                onValueChange={setReduceMotion}
              />
              <View style={styles.divider} />
              <SettingRow
                title="Screen Reader Support"
                description="Optimize for screen reader use"
                value={screenReader}
                onValueChange={setScreenReader}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Volume2 size={24} color={Colors.accent.black} />
              <Text style={styles.sectionTitle}>Audio & Captions</Text>
            </View>

            <View style={styles.card}>
              <SettingRow
                title="Closed Captions"
                description="Show captions on all videos"
                value={closedCaptions}
                onValueChange={setClosedCaptions}
              />
              <View style={styles.divider} />
              <SettingRow
                title="Audio Descriptions"
                description="Hear detailed descriptions during videos"
                value={audioDescriptions}
                onValueChange={setAudioDescriptions}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>About Accessibility</Text>
              <Text style={styles.infoText}>
                We&apos;re committed to making Flippers accessible to everyone. These settings help
                customize your experience. If you have suggestions for improving accessibility,
                please contact our support team.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                💡 Changes take effect immediately and are saved automatically
              </Text>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  card: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.ui.border,
  },
  textSizeCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  textSizeLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  textSizeOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  textSizeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.background.light,
    alignItems: 'center',
  },
  textSizeButtonActive: {
    backgroundColor: Colors.accent.black,
  },
  textSizeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  textSizeButtonTextActive: {
    color: Colors.text.white,
  },
  textPreview: {
    padding: 16,
    backgroundColor: Colors.background.light,
    borderRadius: 12,
  },
  previewText: {
    fontWeight: '400' as const,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.info,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
