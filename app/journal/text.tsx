import { useRouter } from 'expo-router';
import { ArrowLeft, Save, Sparkles, Tag } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const AI_PROMPTS = [
  'How did you feel in the water today?',
  'What was your biggest challenge?',
  'What are you most proud of?',
  'What would you like to improve next time?',
  'Describe your swimming session in one sentence',
];

const SUGGESTED_TAGS = [
  'breathing',
  'floating',
  'freestyle',
  'backstroke',
  'breaststroke',
  'technique',
  'confidence',
  'fear',
  'progress',
  'dryland',
];

export default function TextJournalScreen() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving');
      return;
    }

    setIsSaving(true);

    try {
      // In production, call Supabase createJournal function
      // const result = await createJournal({
      //   user_id: userId,
      //   entry_type: 'text',
      //   text_content: content,
      //   tags: selectedTags,
      //   is_private: isPrivate,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        'Journal Saved!',
        'Your entry has been saved and is being analyzed by AI.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving journal:', error);
      Alert.alert('Error', 'Failed to save your journal entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const insertPrompt = (prompt: string) => {
    setContent((prev) => {
      if (prev.trim()) {
        return prev + '\n\n' + prompt + ' ';
      }
      return prompt + ' ';
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Text Journal</Text>
          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Save size={20} color={Colors.text.white} strokeWidth={2.5} />
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* AI Prompts */}
            <View style={styles.promptsCard}>
              <View style={styles.promptsHeader}>
                <Sparkles size={18} color={Colors.primary.turquoise} strokeWidth={2.5} />
                <Text style={styles.promptsTitle}>AI Writing Prompts</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promptsList}
              >
                {AI_PROMPTS.map((prompt, index) => (
                  <Pressable
                    key={index}
                    style={styles.promptButton}
                    onPress={() => insertPrompt(prompt)}
                  >
                    <Text style={styles.promptButtonText}>{prompt}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Text Input */}
            <View style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                placeholder="How was your swimming session today? What did you learn or discover?"
                placeholderTextColor={Colors.text.muted}
                multiline
                value={content}
                onChangeText={setContent}
                autoFocus
                textAlignVertical="top"
              />
              <View style={styles.inputFooter}>
                <Text style={styles.characterCount}>{content.length} characters</Text>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.tagsCard}>
              <View style={styles.tagsHeader}>
                <Tag size={18} color={Colors.text.primary} strokeWidth={2.5} />
                <Text style={styles.tagsTitle}>Add Tags</Text>
              </View>
              <View style={styles.tagsList}>
                {SUGGESTED_TAGS.map((tag) => (
                  <Pressable
                    key={tag}
                    style={[
                      styles.tagButton,
                      selectedTags.includes(tag) && styles.tagButtonActive,
                    ]}
                    onPress={() => handleTagToggle(tag)}
                  >
                    <Text
                      style={[
                        styles.tagButtonText,
                        selectedTags.includes(tag) && styles.tagButtonTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Privacy Toggle */}
            <View style={styles.privacyCard}>
              <View style={styles.privacyInfo}>
                <Text style={styles.privacyTitle}>Private Entry</Text>
                <Text style={styles.privacySubtitle}>
                  Only you can see this entry
                </Text>
              </View>
              <Pressable
                style={[styles.toggle, isPrivate && styles.toggleActive]}
                onPress={() => setIsPrivate(!isPrivate)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    isPrivate && styles.toggleThumbActive,
                  ]}
                />
              </Pressable>
            </View>

            {/* Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Journaling Tips</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipText}>
                  • Be honest about your feelings and experiences
                </Text>
                <Text style={styles.tipText}>
                  • Note specific challenges or breakthroughs
                </Text>
                <Text style={styles.tipText}>
                  • Reflect on what you'd like to improve
                </Text>
                <Text style={styles.tipText}>
                  • AI will analyze your entry and provide insights
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary.turquoise,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: Colors.primary.turquoise,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  promptsCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  promptsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  promptsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  promptsList: {
    gap: 8,
  },
  promptButton: {
    backgroundColor: Colors.background.light,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.turquoise + '30',
  },
  promptButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  inputCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 300,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.text.primary,
    lineHeight: 24,
  },
  inputFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.background.gray,
    paddingTop: 12,
    marginTop: 12,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tagsCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tagsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.background.gray,
  },
  tagButtonActive: {
    backgroundColor: Colors.primary.turquoise,
    borderColor: Colors.primary.turquoise,
  },
  tagButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  tagButtonTextActive: {
    color: Colors.text.white,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  privacyInfo: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  privacySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.gray,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.primary.turquoise,
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.text.white,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  tipsCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});
