import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Book, Mic, Video, Trash2 } from 'lucide-react-native';
import { Audio, Video as ExpoVideo } from 'expo-av';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getJournalEntry, deleteJournalEntry } from '@/utils/supabase';
import { JournalEntry } from '@/constants/supabaseTypes';

export default function JournalEntryDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    if (!user || !id) return;
    try {
      const journalEntry = await getJournalEntry(id as string);
      setEntry(journalEntry);
    } catch (error) {
      console.error('Error loading journal entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry || !user) return;
    setIsDeleting(true);

    try {
      await deleteJournalEntry(entry.id);
      router.back();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      setIsDeleting(false);
    }
  };

  const playAudio = async () => {
    if (!entry?.audio_url) return;

    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri: entry.audio_url });
      setIsPlaying(true);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Book size={24} color={Colors.text.primary} />;
      case 'voice':
        return <Mic size={24} color={Colors.text.primary} />;
      case 'video':
        return <Video size={24} color={Colors.text.primary} />;
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderContent = () => {
    if (!entry) return null;

    switch (entry.entry_type) {
      case 'text':
        return (
          <Text style={styles.textContent}>{entry.text_content}</Text>
        );

      case 'voice':
        return (
          <Pressable
            style={styles.audioButton}
            onPress={playAudio}
          >
            <Mic size={24} color={Colors.text.white} />
            <Text style={styles.audioButtonText}>
              {isPlaying ? 'Playing...' : 'Play Audio'}
            </Text>
          </Pressable>
        );

      case 'video':
        return (
          <ExpoVideo
            style={styles.video}
            source={{ uri: entry.video_url! }}
            useNativeControls
            resizeMode="contain"
          />
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.black} />
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Journal entry not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Journal Entry</Text>
        <Pressable
          onPress={handleDelete}
          style={[styles.headerButton, styles.deleteButton]}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color={Colors.text.white} />
          ) : (
            <Trash2 size={24} color={Colors.text.white} />
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.entryHeader}>
          <View style={styles.entryIcon}>
            {getEntryIcon(entry.entry_type)}
          </View>
          <View style={styles.entryInfo}>
            <Text style={styles.entryType}>
              {entry.entry_type.charAt(0).toUpperCase() + entry.entry_type.slice(1)} Entry
            </Text>
            <Text style={styles.entryDate}>
              {formatDate(entry.created_at)}
            </Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          {renderContent()}
        </View>

        {entry.ai_analysis && (
          <View style={styles.aiAnalysis}>
            <Text style={styles.aiAnalysisTitle}>AI Insights</Text>
            <Text style={styles.aiAnalysisText}>{entry.ai_analysis}</Text>
          </View>
        )}

        {entry.tags && entry.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsTitle}>Focus Areas</Text>
            <View style={styles.tagsList}>
              {entry.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.accent.error,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  entryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  entryInfo: {
    flex: 1,
  },
  entryType: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  contentWrapper: {
    marginBottom: 24,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent.black,
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  audioButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  aiAnalysis: {
    backgroundColor: Colors.background.light,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  aiAnalysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  aiAnalysisText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text.primary,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tag: {
    backgroundColor: Colors.background.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  tagText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
});