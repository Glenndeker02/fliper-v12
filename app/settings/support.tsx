import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Search,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

type FAQItemProps = {
  question: string;
  answer: string;
};

function FAQItem({ question, answer }: FAQItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <View
          style={[
            styles.faqChevron,
            expanded && styles.faqChevronExpanded,
          ]}
        >
          <ChevronRight size={20} color={Colors.text.secondary} />
        </View>
      </View>
      {expanded && (
        <Text style={styles.faqAnswer}>{answer}</Text>
      )}
    </Pressable>
  );
}

export default function SupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: 'How do I track my progress?',
      answer:
        'Your progress is automatically tracked as you complete lessons and practice sessions. View your detailed progress from the Home screen by tapping on your profile or checking the Progress section.',
    },
    {
      question: 'Can I download lessons for offline viewing?',
      answer:
        'Yes! Tap the download icon on any lesson to save it for offline viewing. Perfect for pool-side reference when you might not have internet connection.',
    },
    {
      question: 'How often should I practice?',
      answer:
        'For best results, we recommend 2-3 pool sessions per week, supplemented with 1-2 dryland training sessions. Consistency is more important than intensity when learning to swim.',
    },
    {
      question: 'What if I\'m afraid of water?',
      answer:
        'Water fear is completely normal! Start with our beginner level lessons that focus on water confidence. Take your time, practice in shallow water, and always have someone with you. Consider working with a local instructor for additional support.',
    },
    {
      question: 'Do I need any special equipment?',
      answer:
        'For basic lessons, you only need swimwear and access to a pool. Some intermediate lessons may suggest optional equipment like kickboards or fins, but these are not required.',
    },
    {
      question: 'Can I use this app if I already know how to swim?',
      answer:
        'Absolutely! Use the assessment to place yourself at the appropriate level. We have intermediate and advanced content focusing on technique refinement, additional strokes, and performance improvement.',
    },
    {
      question: 'How do I change my skill level?',
      answer:
        'Go to Settings > Account Settings > Retake Assessment to reassess your skill level. You can also manually adjust your level in your profile settings.',
    },
    {
      question: 'Is the app suitable for children?',
      answer:
        'This app is designed for adult learners and teens 13+. For children, we recommend in-person instruction with certified swim instructors who specialize in teaching kids.',
    },
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={Colors.text.light} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search help articles..."
                placeholderTextColor={Colors.text.light}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            
            <View style={styles.contactOptions}>
              <Pressable
                style={({ pressed }) => [
                  styles.contactCard,
                  pressed && styles.contactCardPressed,
                ]}
              >
                <View style={styles.contactIconContainer}>
                  <MessageCircle size={24} color={Colors.accent.black} />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactTitle}>Live Chat</Text>
                  <Text style={styles.contactDescription}>
                    Chat with our support team
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.text.light} />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.contactCard,
                  pressed && styles.contactCardPressed,
                ]}
              >
                <View style={styles.contactIconContainer}>
                  <Mail size={24} color={Colors.accent.black} />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactTitle}>Email Support</Text>
                  <Text style={styles.contactDescription}>
                    support@flippers.com
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.text.light} />
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            <View style={styles.faqContainer}>
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq, index) => (
                  <FAQItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))
              ) : (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💡 Quick Tip</Text>
              <Text style={styles.tipText}>
                Most questions are answered in our FAQ section. For urgent safety concerns,
                always contact emergency services first (911).
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Response Times</Text>
            <View style={styles.responseCard}>
              <View style={styles.responseItem}>
                <Text style={styles.responseLabel}>Live Chat:</Text>
                <Text style={styles.responseValue}>Immediate - 5 min</Text>
              </View>
              <View style={styles.responseDivider} />
              <View style={styles.responseItem}>
                <Text style={styles.responseLabel}>Email:</Text>
                <Text style={styles.responseValue}>Within 24 hours</Text>
              </View>
              <View style={styles.responseDivider} />
              <View style={styles.responseItem}>
                <Text style={styles.responseLabel}>Safety Emergencies:</Text>
                <Text style={styles.responseValue}>Priority response</Text>
              </View>
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
  searchContainer: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.primary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  contactOptions: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  contactCardPressed: {
    opacity: 0.7,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  faqContainer: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  faqItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginRight: 12,
  },
  faqChevron: {
    transform: [{ rotate: '0deg' }],
  },
  faqChevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  faqAnswer: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  noResults: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  tipCard: {
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
  tipTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  responseCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  responseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  responseLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  responseValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  responseDivider: {
    height: 1,
    backgroundColor: Colors.ui.border,
  },
});
