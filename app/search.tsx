import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Search, X, BookOpen, Dumbbell, Droplet, TrendingUp, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { MODULES, DRYLAND_EXERCISES, POOL_SESSIONS } from '@/constants/mockData';
import type { Lesson, DrylandExercise, PoolSession } from '@/constants/types';

type SearchResultType = 'lesson' | 'dryland' | 'pool' | 'achievement';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  category?: string;
  duration?: number;
  difficulty?: string;
  tags?: string[];
  relevanceScore: number;
}

export default function SearchScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'breathing technique',
    'freestyle',
    'beginner dryland',
  ]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | SearchResultType>('all');

  // Flatten all lessons from modules
  const allLessons = useMemo(() => {
    const lessons: (Lesson & { moduleId: number })[] = [];
    MODULES.forEach((module) => {
      module.lessons.forEach((lesson) => {
        lessons.push({ ...lesson, moduleId: module.id });
      });
    });
    return lessons;
  }, []);

  // Search function with relevance scoring
  const searchContent = useMemo(() => {
    if (!searchQuery.trim()) return [];

    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search Lessons
    allLessons.forEach((lesson) => {
      let score = 0;
      const titleMatch = lesson.title.toLowerCase().includes(query);
      const descMatch = lesson.description.toLowerCase().includes(query);
      const tagMatch = lesson.tags?.some((tag) => tag.toLowerCase().includes(query));

      if (titleMatch) score += 10;
      if (descMatch) score += 5;
      if (tagMatch) score += 3;

      if (score > 0) {
        results.push({
          id: lesson.id,
          type: 'lesson',
          title: lesson.title,
          description: lesson.description,
          category: lesson.category,
          duration: lesson.duration,
          difficulty: lesson.difficulty,
          tags: lesson.tags,
          relevanceScore: score,
        });
      }
    });

    // Search Dryland Exercises
    DRYLAND_EXERCISES.forEach((exercise) => {
      let score = 0;
      const titleMatch = exercise.name.toLowerCase().includes(query);
      const descMatch = exercise.description.toLowerCase().includes(query);
      const categoryMatch = exercise.category.toLowerCase().includes(query);
      const targetMatch = exercise.targetMuscles.some((muscle) =>
        muscle.toLowerCase().includes(query)
      );

      if (titleMatch) score += 10;
      if (descMatch) score += 5;
      if (categoryMatch) score += 4;
      if (targetMatch) score += 3;

      if (score > 0) {
        results.push({
          id: exercise.id,
          type: 'dryland',
          title: exercise.name,
          description: exercise.description,
          category: exercise.category,
          duration: exercise.duration,
          difficulty: exercise.difficulty,
          relevanceScore: score,
        });
      }
    });

    // Search Pool Sessions
    POOL_SESSIONS.forEach((session) => {
      let score = 0;
      const titleMatch = session.title.toLowerCase().includes(query);
      const descMatch = session.description.toLowerCase().includes(query);
      const focusMatch = session.focusAreas?.some((area) =>
        area.toLowerCase().includes(query)
      );

      if (titleMatch) score += 10;
      if (descMatch) score += 5;
      if (focusMatch) score += 4;

      if (score > 0) {
        results.push({
          id: session.id,
          type: 'pool',
          title: session.title,
          description: session.description,
          duration: session.totalDuration,
          difficulty: session.difficulty,
          relevanceScore: score,
        });
      }
    });

    // Sort by relevance score
    const sorted = results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    setIsSearching(false);
    return sorted;
  }, [searchQuery, allLessons]);

  // Filter results
  const filteredResults = useMemo(() => {
    if (selectedFilter === 'all') return searchContent;
    return searchContent.filter((result) => result.type === selectedFilter);
  }, [searchContent, selectedFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches((prev) => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    Keyboard.dismiss();

    // Navigate to appropriate screen
    if (result.type === 'lesson') {
      router.push(`/lessons/${result.id}`);
    } else if (result.type === 'dryland') {
      router.push(`/dryland/${result.id}`);
    } else if (result.type === 'pool') {
      router.push(`/pool/${result.id}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedFilter('all');
  };

  const getResultIcon = (type: SearchResultType) => {
    switch (type) {
      case 'lesson':
        return <BookOpen size={20} color={theme.colors.primary.turquoise} />;
      case 'dryland':
        return <Dumbbell size={20} color={theme.colors.primary.coral} />;
      case 'pool':
        return <Droplet size={20} color={theme.colors.primary.turquoise} />;
      default:
        return <TrendingUp size={20} color={theme.colors.text.muted} />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return theme.colors.accent.success;
      case 'intermediate':
        return theme.colors.accent.warning;
      case 'advanced':
        return theme.colors.accent.error;
      default:
        return theme.colors.text.muted;
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background.gray }}>
      <Stack.Screen
        options={{
          title: 'Search',
          headerShown: false,
        }}
      />

      {/* Search Header */}
      <View
        className="pt-12 pb-4 px-4"
        style={{ backgroundColor: theme.colors.background.white }}
      >
        {/* Search Input */}
        <View className="flex-row items-center gap-3 mb-3">
          <View
            className="flex-1 flex-row items-center px-4 py-3 rounded-xl"
            style={{ backgroundColor: theme.colors.background.gray }}
          >
            <Search size={20} color={theme.colors.text.muted} />
            <TextInput
              className="flex-1 ml-2 text-base"
              style={{ color: theme.colors.text.primary }}
              placeholder="Search lessons, exercises, sessions..."
              placeholderTextColor={theme.colors.text.muted}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} className="p-1">
                <X size={18} color={theme.colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        {searchQuery.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
          >
            <TouchableOpacity
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor:
                  selectedFilter === 'all'
                    ? theme.colors.primary.turquoise
                    : theme.colors.ui.border,
              }}
              onPress={() => setSelectedFilter('all')}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color:
                    selectedFilter === 'all' ? '#FFFFFF' : theme.colors.text.secondary,
                }}
              >
                All ({searchContent.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor:
                  selectedFilter === 'lesson'
                    ? theme.colors.primary.turquoise
                    : theme.colors.ui.border,
              }}
              onPress={() => setSelectedFilter('lesson')}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color:
                    selectedFilter === 'lesson' ? '#FFFFFF' : theme.colors.text.secondary,
                }}
              >
                Lessons ({searchContent.filter((r) => r.type === 'lesson').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor:
                  selectedFilter === 'dryland'
                    ? theme.colors.primary.coral
                    : theme.colors.ui.border,
              }}
              onPress={() => setSelectedFilter('dryland')}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color:
                    selectedFilter === 'dryland' ? '#FFFFFF' : theme.colors.text.secondary,
                }}
              >
                Dryland ({searchContent.filter((r) => r.type === 'dryland').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor:
                  selectedFilter === 'pool'
                    ? theme.colors.primary.turquoise
                    : theme.colors.ui.border,
              }}
              onPress={() => setSelectedFilter('pool')}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color:
                    selectedFilter === 'pool' ? '#FFFFFF' : theme.colors.text.secondary,
                }}
              >
                Pool ({searchContent.filter((r) => r.type === 'pool').length})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* Search Content */}
      <ScrollView className="flex-1 px-4 pt-4">
        {searchQuery.length === 0 ? (
          // Recent Searches and Popular Searches
          <View>
            {recentSearches.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: theme.colors.text.primary }}
                  >
                    Recent Searches
                  </Text>
                  <TouchableOpacity onPress={() => setRecentSearches([])}>
                    <Text
                      className="text-sm font-medium"
                      style={{ color: theme.colors.primary.turquoise }}
                    >
                      Clear
                    </Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center py-3 border-b"
                    style={{ borderBottomColor: theme.colors.ui.border }}
                    onPress={() => setSearchQuery(search)}
                  >
                    <Clock size={18} color={theme.colors.text.muted} />
                    <Text
                      className="ml-3 text-base"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {search}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Popular Searches */}
            <View>
              <Text
                className="text-lg font-bold mb-3"
                style={{ color: theme.colors.text.primary }}
              >
                Popular Searches
              </Text>
              {['breathing technique', 'freestyle', 'back float', 'dryland warmup', 'pool drills'].map(
                (search, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center py-3 border-b"
                    style={{ borderBottomColor: theme.colors.ui.border }}
                    onPress={() => setSearchQuery(search)}
                  >
                    <TrendingUp size={18} color={theme.colors.primary.turquoise} />
                    <Text
                      className="ml-3 text-base"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {search}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        ) : isSearching ? (
          // Loading State
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={theme.colors.primary.turquoise} />
            <Text
              className="mt-4 text-base"
              style={{ color: theme.colors.text.muted }}
            >
              Searching...
            </Text>
          </View>
        ) : filteredResults.length === 0 ? (
          // No Results
          <View className="flex-1 items-center justify-center py-20 px-8">
            <Search size={64} color={theme.colors.text.muted} />
            <Text
              className="mt-4 text-xl font-bold text-center"
              style={{ color: theme.colors.text.primary }}
            >
              No Results Found
            </Text>
            <Text
              className="mt-2 text-base text-center"
              style={{ color: theme.colors.text.muted }}
            >
              Try different keywords or browse by category
            </Text>
          </View>
        ) : (
          // Search Results
          <View className="pb-8">
            <Text
              className="text-sm font-medium mb-3"
              style={{ color: theme.colors.text.muted }}
            >
              {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
            </Text>
            {filteredResults.map((result) => (
              <TouchableOpacity
                key={`${result.type}-${result.id}`}
                className="flex-row p-4 mb-3 rounded-xl"
                style={{ backgroundColor: theme.colors.background.white }}
                onPress={() => handleResultPress(result)}
                activeOpacity={0.7}
              >
                {/* Icon */}
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center mr-3"
                  style={{
                    backgroundColor:
                      result.type === 'dryland'
                        ? theme.colors.primary.coral + '20'
                        : theme.colors.primary.turquoise + '20',
                  }}
                >
                  {getResultIcon(result.type)}
                </View>

                {/* Content */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text
                      className="text-base font-semibold flex-1"
                      style={{ color: theme.colors.text.primary }}
                      numberOfLines={1}
                    >
                      {result.title}
                    </Text>
                    {result.difficulty && (
                      <View
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: getDifficultyColor(result.difficulty) + '20' }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{ color: getDifficultyColor(result.difficulty) }}
                        >
                          {result.difficulty}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    className="text-sm mb-2"
                    style={{ color: theme.colors.text.secondary }}
                    numberOfLines={2}
                  >
                    {result.description}
                  </Text>

                  <View className="flex-row items-center gap-3">
                    {result.category && (
                      <Text
                        className="text-xs font-medium"
                        style={{ color: theme.colors.text.muted }}
                      >
                        {result.category}
                      </Text>
                    )}
                    {result.duration && (
                      <View className="flex-row items-center gap-1">
                        <Clock size={12} color={theme.colors.text.muted} />
                        <Text
                          className="text-xs"
                          style={{ color: theme.colors.text.muted }}
                        >
                          {result.duration} min
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
