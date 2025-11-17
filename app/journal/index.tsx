import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Type,
  Mic,
  Video,
  TrendingUp,
  Filter,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import JournalModal from '@/components/JournalModal';

// Mock data - in production, fetch from Supabase
const MOCK_JOURNALS = [
  {
    id: '1',
    entry_type: 'text' as const,
    text_content: 'Today I finally felt confident floating on my back! The breathing exercises really helped.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    ai_analysis: {
      sentiment: 0.85,
      confidence_trend: 'improving',
      key_insights: ['Breakthrough in back floating', 'Breathing confidence'],
      recommended_next: 'Practice floating for longer durations',
    },
    tags: ['floating', 'breathing', 'confidence'],
  },
  {
    id: '2',
    entry_type: 'voice' as const,
    audio_url: 'mock-audio.mp3',
    text_content: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    ai_analysis: {
      sentiment: 0.65,
      confidence_trend: 'stable',
      key_insights: ['Struggled with breathing rhythm'],
      recommended_next: 'Focus on rhythmic breathing drills',
    },
    tags: ['breathing', 'freestyle'],
  },
  {
    id: '3',
    entry_type: 'video' as const,
    video_url: 'mock-video.mp4',
    text_content: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    ai_analysis: {
      sentiment: 0.72,
      confidence_trend: 'improving',
      key_insights: ['Good arm extension', 'Head position needs work'],
      recommended_next: 'Practice head neutral position',
    },
    tags: ['technique', 'freestyle', 'form'],
  },
];

export default function JournalListScreen() {
  const router = useRouter();
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'text' | 'voice' | 'video'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredJournals = filter === 'all'
    ? MOCK_JOURNALS
    : MOCK_JOURNALS.filter((j) => j.entry_type === filter);

  const onRefresh = () => {
    setRefreshing(true);
    // In production, fetch from Supabase
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleTextJournal = () => {
    setShowJournalModal(false);
    router.push('/journal/text');
  };

  const handleVoiceNote = () => {
    setShowJournalModal(false);
    router.push('/journal/voice');
  };

  const handleVideoJournal = () => {
    setShowJournalModal(false);
    router.push('/journal/video');
  };

  const handleJournalPress = (journalId: string) => {
    router.push(`/journal/${journalId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return Type;
      case 'voice':
        return Mic;
      case 'video':
        return Video;
      default:
        return Type;
    }
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return Colors.primary.turquoise;
      case 'voice':
        return Colors.primary.coral;
      case 'video':
        return Colors.accent.info;
      default:
        return Colors.text.secondary;
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.7) return Colors.accent.success;
    if (sentiment >= 0.4) return Colors.accent.warning;
    return Colors.accent.error;
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 0.7) return 'Positive';
    if (sentiment >= 0.4) return 'Neutral';
    return 'Challenging';
  };

  const filterOptions: Array<{ value: typeof filter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'text', label: 'Text' },
    { value: 'voice', label: 'Voice' },
    { value: 'video', label: 'Video' },
  ];

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
          <Text style={styles.headerTitle}>My Journal</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => setShowJournalModal(true)}
          >
            <Plus size={24} color={Colors.text.white} />
          </Pressable>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Calendar size={20} color={Colors.primary.turquoise} strokeWidth={2.5} />
            <View>
              <Text style={styles.statValue}>{MOCK_JOURNALS.length}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <TrendingUp size={20} color={Colors.accent.success} strokeWidth={2.5} />
            <View>
              <Text style={styles.statValue}>5 days</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filterOptions.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.filterButton,
                filter === option.value && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(option.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === option.value && styles.filterButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Journal List */}
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredJournals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Type size={48} color={Colors.text.muted} strokeWidth={1.5} />
              <Text style={styles.emptyText}>No journal entries yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the + button to create your first entry
              </Text>
            </View>
          ) : (
            filteredJournals.map((journal) => {
              const EntryIcon = getEntryTypeIcon(journal.entry_type);
              const entryColor = getEntryTypeColor(journal.entry_type);
              const sentimentColor = getSentimentColor(journal.ai_analysis.sentiment);

              return (
                <Pressable
                  key={journal.id}
                  style={styles.journalCard}
                  onPress={() => handleJournalPress(journal.id)}
                >
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.entryTypeIcon,
                          { backgroundColor: entryColor + '20' },
                        ]}
                      >
                        <EntryIcon size={16} color={entryColor} strokeWidth={2.5} />
                      </View>
                      <Text style={styles.entryTypeText}>
                        {journal.entry_type.charAt(0).toUpperCase() +
                          journal.entry_type.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>{formatDate(journal.created_at)}</Text>
                  </View>

                  {/* Content Preview */}
                  {journal.text_content && (
                    <Text style={styles.contentPreview} numberOfLines={2}>
                      {journal.text_content}
                    </Text>
                  )}

                  {journal.entry_type === 'voice' && (
                    <View style={styles.mediaPreview}>
                      <Mic size={20} color={Colors.text.secondary} strokeWidth={2} />
                      <Text style={styles.mediaPreviewText}>Voice recording</Text>
                    </View>
                  )}

                  {journal.entry_type === 'video' && (
                    <View style={styles.mediaPreview}>
                      <Video size={20} color={Colors.text.secondary} strokeWidth={2} />
                      <Text style={styles.mediaPreviewText}>Video recording</Text>
                    </View>
                  )}

                  {/* AI Analysis Preview */}
                  {journal.ai_analysis && (
                    <View style={styles.analysisPreview}>
                      <View
                        style={[
                          styles.sentimentBadge,
                          { backgroundColor: sentimentColor + '20' },
                        ]}
                      >
                        <View
                          style={[
                            styles.sentimentDot,
                            { backgroundColor: sentimentColor },
                          ]}
                        />
                        <Text
                          style={[styles.sentimentText, { color: sentimentColor }]}
                        >
                          {getSentimentLabel(journal.ai_analysis.sentiment)}
                        </Text>
                      </View>
                      {journal.ai_analysis.key_insights[0] && (
                        <Text style={styles.insightPreview} numberOfLines={1}>
                          💡 {journal.ai_analysis.key_insights[0]}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Tags */}
                  {journal.tags && journal.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {journal.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </ScrollView>

        {/* Journal Modal */}
        <JournalModal
          visible={showJournalModal}
          onClose={() => setShowJournalModal(false)}
          onTextJournal={handleTextJournal}
          onVoiceNote={handleVoiceNote}
          onVideoJournal={handleVideoJournal}
          journalStreak={5}
        />
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.turquoise,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.turquoise,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.background.gray,
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.accent.black,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  filterButtonTextActive: {
    color: Colors.text.white,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  journalCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryTypeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  contentPreview: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.text.primary,
    lineHeight: 22,
    marginBottom: 12,
  },
  mediaPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    marginBottom: 12,
  },
  mediaPreviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  analysisPreview: {
    gap: 8,
    marginBottom: 12,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sentimentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  insightPreview: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.background.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
