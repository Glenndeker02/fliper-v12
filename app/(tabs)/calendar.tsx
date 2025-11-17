import { useRouter } from 'expo-router';
import { Calendar as CalendarIcon, Plus, Flame, BookOpen, Bell, BellOff } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { getScheduledLessons, ScheduledLesson } from '@/utils/scheduledLessons';

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduledLessons, setScheduledLessons] = useState<ScheduledLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheduledLessons();
  }, []);

  const loadScheduledLessons = async () => {
    try {
      const lessons = await getScheduledLessons();
      setScheduledLessons(lessons);
    } catch (error) {
      console.error('Failed to load scheduled lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toDateString();
    const lessonsForDate = scheduledLessons.filter(lesson => 
      new Date(lesson.date).toDateString() === dateString
    );
    
    if (lessonsForDate.length === 0) return null;
    
    return {
      date: date,
      lessons: lessonsForDate.map(lesson => ({
        id: lesson.lessonId,
        title: lesson.title,
        time: lesson.time,
        reminder: lesson.reminderEnabled,
        completed: lesson.completed
      }))
    };
  };

  const renderCalendarDay = (day: Date, index: number) => {
    const hasEvents = getEventsForDate(day);
    const isToday = day.toDateString() === new Date().toDateString();
    const isSelected = day.toDateString() === selectedDate.toDateString();

    return (
      <Pressable
        key={index}
        style={[
          styles.dayContainer,
          isToday && styles.todayContainer,
          isSelected && styles.selectedContainer
        ]}
        onPress={() => setSelectedDate(day)}
      >
        <Text style={[
          styles.dayNumber,
          isToday && styles.todayText,
          isSelected && styles.selectedText
        ]}>
          {day.getDate()}
        </Text>
        {hasEvents && <View style={styles.eventIndicator} />}
      </Pressable>
    );
  };

  // Generate days for the current month
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get days from previous month to fill first week
    const startDayIndex = firstDay.getDay();
    const days = [];
    
    // Previous month days
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Next month days to fill last week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const eventsForSelectedDate = getEventsForDate(selectedDate);

  // Function to show schedule lesson modal
  const showScheduleLesson = () => {
    Alert.alert(
      'Schedule Lesson',
      'This feature would open a modal to schedule lessons',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Calendar</Text>
              <Text style={styles.subtitle}>Plan your swimming journey</Text>
            </View>
            <Pressable 
              style={styles.addButton}
              onPress={showScheduleLesson}
            >
              <Plus size={20} color={Colors.text.white} />
            </Pressable>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarContainer}>
            <View style={styles.weekDaysContainer}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Text key={index} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.calendarGrid}>
              {days.map((day, index) => renderCalendarDay(day, index))}
            </View>
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Text style={styles.progressSubtitle}>This Month</Text>
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatValue}>8</Text>
                <Text style={styles.progressStatLabel}>Lessons</Text>
              </View>
              <View style={styles.progressStatItem}>
                <Flame size={20} color={Colors.accent.warning} />
                <Text style={styles.progressStatValue}>5</Text>
                <Text style={styles.progressStatLabel}>Day Streak</Text>
              </View>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatValue}>72%</Text>
                <Text style={styles.progressStatLabel}>Completed</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '72%' }]} />
            </View>
          </View>

          {/* Upcoming Lessons Heading */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Lessons</Text>
          </View>

          {/* Selected Date Events */}
          <View style={styles.eventsSection}>
            <View style={styles.sectionHeader}>
              <CalendarIcon size={24} color={Colors.accent.black} />
              <Text style={styles.sectionTitle}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            </View>

            {eventsForSelectedDate ? (
              <View style={styles.eventsContainer}>
                {eventsForSelectedDate.lessons.map((lesson, index) => (
                  <Pressable 
                    key={index} 
                    style={styles.eventCard}
                    onPress={() => router.push(`/lessons/${lesson.id}`)}
                  >
                    <View style={styles.eventHeader}>
                      <BookOpen size={16} color={Colors.accent.black} />
                      <Text style={styles.eventTitle}>{lesson.title}</Text>
                      {lesson.reminder && (
                        <Bell size={16} color={Colors.accent.black} />
                      )}
                    </View>
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventTime}>{lesson.time}</Text>
                      {lesson.completed ? (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedText}>Completed</Text>
                        </View>
                      ) : (
                        <Pressable 
                          style={styles.reminderButton}
                          onPress={() => console.log('Toggle reminder for', lesson.id)}
                        >
                          {lesson.reminder ? (
                            <Bell size={16} color={Colors.text.primary} />
                          ) : (
                            <BellOff size={16} color={Colors.text.light} />
                          )}
                        </Pressable>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>No lessons scheduled for this day</Text>
                <Pressable 
                  style={styles.scheduleButton}
                  onPress={showScheduleLesson}
                >
                  <Text style={styles.scheduleButtonText}>Schedule a Lesson</Text>
                </Pressable>
              </View>
            )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarContainer: {
    backgroundColor: Colors.background.white,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 32,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  todayContainer: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 20,
  },
  selectedContainer: {
    backgroundColor: Colors.accent.black,
    borderRadius: 20,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  todayText: {
    color: Colors.text.primary,
  },
  selectedText: {
    color: Colors.text.white,
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent.black,
  },
  eventsSection: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
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
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventStatText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  skillsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  skillBadge: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skillText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.accent.black,
  },
  noEventsContainer: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noEventsText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  scheduleButton: {
    backgroundColor: Colors.accent.black,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  scheduleButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.white,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  completedBadge: {
    backgroundColor: Colors.accent.success,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.white,
  },
  reminderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  progressSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressStatItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginRight: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.background.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent.success,
    borderRadius: 4,
  },
});