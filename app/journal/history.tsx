import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Book, Mic, Video } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getJournalEntries } from '@/utils/supabase';
import { JournalEntry } from '@/constants/supabaseTypes';

export default function JournalHistory() {
  const router = useRouter();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    if (!user) return;
    try {
      const journalEntries = await getJournalEntries(user.id);
      setEntries(journalEntries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setIsLoading(false);
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <Pressable
      style={styles.entryCard}
      onPress={() => router.push(`/journal/${item.id}`)}
    >
      <View style={styles.entryIcon}>{getEntryIcon(item.entry_type)}</View>
      <View style={styles.entryContent}>
        <Text style={styles.entryType}>
          {item.entry_type.charAt(0).toUpperCase() + item.entry_type.slice(1)} Entry
        </Text>
        <Text style={styles.entryDate}>{formatDate(item.created_at)}</Text>
        {item.ai_analysis && (
          <Text style={styles.aiInsight} numberOfLines={2}>
            {item.ai_analysis}
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Journal History</Text>
        <View style={styles.headerButton} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.black} />
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No journal entries yet</Text>
            </View>
          }
        />
      )}
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  entryCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  entryContent: {
    flex: 1,
  },
  entryType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  aiInsight: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});