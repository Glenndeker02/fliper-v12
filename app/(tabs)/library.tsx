import { useRouter } from 'expo-router';
import { Search, Filter } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
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
import { MODULES } from '@/constants/mockData';

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const allLessons = MODULES.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleTitle: module.title,
    }))
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>Video Library</Text>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={Colors.text.light} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search lessons, techniques..."
                placeholderTextColor={Colors.text.light}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Pressable style={styles.filterButton}>
              <Filter size={20} color={Colors.text.primary} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.filtersRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScroll}
            >
              <Pressable style={[styles.filterChip, styles.filterChipActive]}>
                <Text style={[styles.filterChipText, styles.filterChipTextActive]}>
                  All Lessons
                </Text>
              </Pressable>
              <Pressable style={styles.filterChip}>
                <Text style={styles.filterChipText}>Beginner</Text>
              </Pressable>
              <Pressable style={styles.filterChip}>
                <Text style={styles.filterChipText}>Intermediate</Text>
              </Pressable>
              <Pressable style={styles.filterChip}>
                <Text style={styles.filterChipText}>Advanced</Text>
              </Pressable>
              <Pressable style={styles.filterChip}>
                <Text style={styles.filterChipText}>Freestyle</Text>
              </Pressable>
              <Pressable style={styles.filterChip}>
                <Text style={styles.filterChipText}>Backstroke</Text>
              </Pressable>
            </ScrollView>
          </View>

          {MODULES.map((module) => (
            <View key={module.id} style={styles.moduleSection}>
              <View style={styles.moduleSectionHeader}>
                <View>
                  <Text style={styles.moduleSectionTitle}>{module.title}</Text>
                  <Text style={styles.moduleSectionSubtitle}>
                    {module.lessons.length} lessons · {module.duration}
                  </Text>
                </View>
              </View>

              {module.lessons.map((lesson) => (
                <Pressable
                  key={lesson.id}
                  style={styles.lessonCard}
                  onPress={() => router.push(`/lessons/${lesson.id}`)}
                >
                  <Image
                    source={{ uri: lesson.thumbnailUrl }}
                    style={styles.lessonImage}
                    resizeMode="cover"
                  />
                  <View style={styles.lessonContent}>
                    <View style={styles.lessonHeader}>
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>
                          {lesson.difficulty.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                    </View>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDescription} numberOfLines={2}>
                      {lesson.description}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
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
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  filtersRow: {
    marginBottom: 24,
  },
  filtersScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: Colors.accent.black,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  filterChipTextActive: {
    color: Colors.text.white,
  },
  moduleSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  moduleSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  moduleSectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  moduleSectionSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  lessonCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  lessonImage: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.background.light,
  },
  lessonContent: {
    padding: 20,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.accent.black,
    letterSpacing: 0.5,
  },
  lessonDuration: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});
