import { useRouter } from 'expo-router';
import { 
  BookOpen, 
  Dumbbell, 
  Droplet, 
  TrendingUp, 
  Search,
  Play,
  ChevronRight,
  Award,
  Target,
  Clock
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { MODULES, DRYLAND_EXERCISES } from '@/constants/mockData';
import FloatingJournalButton from '@/components/FloatingJournalButton';

type TabOption = 'library' | 'dryland' | 'practice' | 'progress';

export default function LessonsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabOption>('library');
  const [searchQuery, setSearchQuery] = useState('');

  const allLessons = MODULES.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleTitle: module.title,
    }))
  );

  const filteredLessons = searchQuery
    ? allLessons.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allLessons;

  const filteredExercises = searchQuery
    ? DRYLAND_EXERCISES.filter(
        (exercise) =>
          exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exercise.targetedMuscles.some(muscle => 
            muscle.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : DRYLAND_EXERCISES;

  const renderTabButton = (tab: TabOption, icon: React.ReactNode, label: string) => (
    <Pressable
      onPress={() => setActiveTab(tab)}
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
    >
      {icon}
      <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>Training Hub</Text>
          <Text style={styles.subtitle}>
            Everything you need to become a confident swimmer
          </Text>

          <View style={styles.searchBar}>
            <Search size={20} color={Colors.text.light} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search lessons, exercises, drills..."
              placeholderTextColor={Colors.text.light}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {renderTabButton(
              'library',
              <BookOpen size={20} color={activeTab === 'library' ? Colors.text.white : Colors.text.primary} />,
              'Video Library'
            )}
            {renderTabButton(
              'dryland',
              <Dumbbell size={20} color={activeTab === 'dryland' ? Colors.text.white : Colors.text.primary} />,
              'Dryland'
            )}
            {renderTabButton(
              'practice',
              <Droplet size={20} color={activeTab === 'practice' ? Colors.text.white : Colors.text.primary} />,
              'Pool Practice'
            )}
            {renderTabButton(
              'progress',
              <TrendingUp size={20} color={activeTab === 'progress' ? Colors.text.white : Colors.text.primary} />,
              'Progress'
            )}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'library' && (
            <View>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <BookOpen size={24} color={Colors.accent.black} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Video Lessons</Text>
                </View>
                <Text style={styles.sectionCount}>{filteredLessons.length} lessons</Text>
              </View>

              {filteredLessons.length > 0 ? (
                MODULES.map((module) => {
                  const moduleLessons = module.lessons.filter(lesson =>
                    searchQuery ? filteredLessons.some(fl => fl.id === lesson.id) : true
                  );

                  if (moduleLessons.length === 0) return null;

                  return (
                    <View key={module.id} style={styles.moduleSection}>
                      <View style={styles.moduleSectionHeader}>
                        <View>
                          <Text style={styles.moduleSectionTitle}>{module.title}</Text>
                          <Text style={styles.moduleSectionSubtitle}>
                            {moduleLessons.length} lessons · {module.duration}
                          </Text>
                        </View>
                      </View>

                      {moduleLessons.map((lesson) => (
                        <Pressable
                          key={lesson.id}
                          style={styles.lessonCard}
                          onPress={() => router.push(`/lessons/${lesson.id}` as any)}
                        >
                          <Image
                            source={{ uri: lesson.thumbnailUrl }}
                            style={styles.lessonImage}
                            resizeMode="cover"
                          />
                          <View style={styles.playButton}>
                            <Play size={20} color={Colors.text.white} fill={Colors.text.white} />
                          </View>
                          <View style={styles.lessonContent}>
                            <View style={styles.lessonHeader}>
                              <View style={styles.difficultyBadge}>
                                <Text style={styles.difficultyText}>
                                  {lesson.difficulty.toUpperCase()}
                                </Text>
                              </View>
                              <View style={styles.durationBadge}>
                                <Clock size={12} color={Colors.text.secondary} />
                                <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                              </View>
                            </View>
                            <Text style={styles.lessonTitle}>{lesson.title}</Text>
                            <Text style={styles.lessonDescription} numberOfLines={2}>
                              {lesson.description}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <BookOpen size={48} color={Colors.text.light} />
                  <Text style={styles.emptyStateText}>No lessons found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Try adjusting your search
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'dryland' && (
            <View>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Dumbbell size={24} color={Colors.accent.black} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Dryland Exercises</Text>
                </View>
                <Text style={styles.sectionCount}>{filteredExercises.length} exercises</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>💪 Why Dryland Training?</Text>
                <Text style={styles.infoText}>
                  Build swimming-specific strength, improve flexibility, and develop muscle memory before entering the water.
                </Text>
              </View>

              {filteredExercises.length > 0 ? (
                <View style={styles.exercisesGrid}>
                  {filteredExercises.map((exercise) => (
                    <Pressable
                      key={exercise.id}
                      style={styles.exerciseCard}
                      onPress={() => router.push(`/dryland/${exercise.id}` as any)}
                    >
                      <Image
                        source={{ uri: exercise.thumbnailUrl }}
                        style={styles.exerciseImage}
                        resizeMode="cover"
                      />
                      <View style={styles.exerciseContent}>
                        <View style={styles.exerciseHeader}>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>
                              {exercise.category.toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.difficultyStars}>
                            <Text style={styles.starsText}>
                              {'⭐'.repeat(
                                exercise.difficulty === 'beginner'
                                  ? 1
                                  : exercise.difficulty === 'intermediate'
                                  ? 2
                                  : 3
                              )}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                        <View style={styles.exerciseMeta}>
                          <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                          <Text style={styles.exerciseMuscles} numberOfLines={1}>
                            {exercise.targetedMuscles.join(', ')}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Dumbbell size={48} color={Colors.text.light} />
                  <Text style={styles.emptyStateText}>No exercises found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Try adjusting your search
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'practice' && (
            <View>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Droplet size={24} color={Colors.accent.black} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Pool Practice</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>🏊 In-Pool Guided Workouts</Text>
                <Text style={styles.infoText}>
                  Transform lessons into structured practice sessions with real-time audio coaching and interval timing.
                </Text>
              </View>

              <Pressable style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Target size={32} color={Colors.text.white} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Custom Session Builder</Text>
                  <Text style={styles.featureDescription}>
                    Create personalized pool workouts based on your goals and time
                  </Text>
                </View>
                <ChevronRight size={24} color={Colors.text.light} />
              </Pressable>

              <View style={styles.practiceSessionsSection}>
                <Text style={styles.subsectionTitle}>Pre-Built Sessions</Text>
                {[
                  {
                    title: 'First Time in Pool',
                    duration: '20 min',
                    level: 'Beginner',
                    description: 'Water confidence focus with gentle encouragement',
                  },
                  {
                    title: 'Freestyle Fundamentals',
                    duration: '30 min',
                    level: 'Beginner-Intermediate',
                    description: 'Freestyle skill drills and technique practice',
                  },
                  {
                    title: 'Endurance Builder',
                    duration: '45 min',
                    level: 'Intermediate',
                    description: 'Distance and stamina building workout',
                  },
                ].map((session, index) => (
                  <Pressable key={index} style={styles.sessionCard}>
                    <View style={styles.sessionContent}>
                      <View style={styles.sessionHeader}>
                        <View style={styles.levelBadgeSmall}>
                          <Text style={styles.levelBadgeText}>{session.level}</Text>
                        </View>
                        <Text style={styles.sessionDuration}>{session.duration}</Text>
                      </View>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <Text style={styles.sessionDescription}>{session.description}</Text>
                    </View>
                    <ChevronRight size={20} color={Colors.text.light} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'progress' && (
            <View>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <TrendingUp size={24} color={Colors.accent.black} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Your Progress</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View style={styles.statIcon}>
                    <BookOpen size={24} color={Colors.accent.black} />
                  </View>
                  <Text style={styles.statValue}>24</Text>
                  <Text style={styles.statLabel}>Lessons Completed</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statIcon}>
                    <Droplet size={24} color={Colors.accent.black} />
                  </View>
                  <Text style={styles.statValue}>18</Text>
                  <Text style={styles.statLabel}>Pool Sessions</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statIcon}>
                    <Dumbbell size={24} color={Colors.accent.black} />
                  </View>
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Dryland Workouts</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statIcon}>
                    <Award size={24} color={Colors.accent.black} />
                  </View>
                  <Text style={styles.statValue}>8</Text>
                  <Text style={styles.statLabel}>Badges Earned</Text>
                </View>
              </View>

              <View style={styles.progressModulesSection}>
                <Text style={styles.subsectionTitle}>Module Progress</Text>
                {MODULES.map((module) => {
                  const completedLessons = Math.floor(Math.random() * module.lessons.length);
                  const progress = (completedLessons / module.lessons.length) * 100;

                  return (
                    <View key={module.id} style={styles.moduleProgressCard}>
                      <View style={styles.moduleProgressHeader}>
                        <Text style={styles.moduleProgressTitle}>{module.title}</Text>
                        <Text style={styles.moduleProgressPercent}>{Math.round(progress)}%</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                      </View>
                      <Text style={styles.moduleProgressText}>
                        {completedLessons} of {module.lessons.length} lessons completed
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
        <FloatingJournalButton />
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
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  searchBar: {
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
    ...(Platform.OS === 'web' && { outlineStyle: 'none' as any }),
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonActive: {
    backgroundColor: Colors.accent.black,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  tabLabelActive: {
    color: Colors.text.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
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
    fontSize: 20,
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
  playButton: {
    position: 'absolute',
    top: 80,
    left: '50%',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -28,
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
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  exercisesGrid: {
    paddingHorizontal: 24,
    gap: 16,
  },
  exerciseCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  exerciseImage: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.background.light,
  },
  exerciseContent: {
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.accent.black,
    letterSpacing: 0.5,
  },
  difficultyStars: {
    flexDirection: 'row',
  },
  starsText: {
    fontSize: 12,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  exerciseMeta: {
    gap: 4,
  },
  exerciseDuration: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  exerciseMuscles: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.text.light,
  },
  infoCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.black,
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
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  emptyState: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.light,
    marginTop: 4,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    gap: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  practiceSessionsSection: {
    paddingHorizontal: 24,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  sessionContent: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelBadgeSmall: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.accent.black,
    letterSpacing: 0.5,
  },
  sessionDuration: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sessionDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
  },
  progressModulesSection: {
    paddingHorizontal: 24,
  },
  moduleProgressCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  moduleProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleProgressTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  moduleProgressPercent: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.accent.black,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background.light,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.black,
    borderRadius: 4,
  },
  moduleProgressText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
});
