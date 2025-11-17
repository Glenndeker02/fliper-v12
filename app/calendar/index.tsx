import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { Calendar as CalendarIcon, ChevronLeft, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { LessonSchedule } from '@/utils/lessonScheduler';
import { useAuth } from '@/contexts/AuthContext';
import { getUpcomingLessons } from '@/utils/lessonScheduler';

export default function LessonCalendarScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingLessons, setUpcomingLessons] = useState<LessonSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    loadLessons();
  }, [user]);

  const loadLessons = async () => {
    if (!user) return;

    try {
      const lessons = await getUpcomingLessons(user.id);
      setUpcomingLessons(lessons);

      // Mark dates with lessons
      const marks = lessons.reduce((acc, lesson) => {
        const date = new Date(lesson.scheduledDate).toISOString().split('T')[0];
        acc[date] = {
          marked: true,
          dotColor: Colors.accent.success,
          selectedColor: Colors.primary.main,
        };
        return acc;
      }, {});

      setMarkedDates(marks);
    } catch (error) {
      console.error('Error loading lessons:', error);
      Alert.alert('Error', 'Failed to load lesson schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const getDayLessons = (date: string) => {
    return upcomingLessons.filter(
      lesson => 
        new Date(lesson.scheduledDate).toISOString().split('T')[0] === date
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.title}>Lesson Calendar</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.calendarContainer}>
          <RNCalendar
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                ...markedDates[selectedDate],
                selected: true,
              },
            }}
            onDayPress={day => handleDateSelect(day.dateString)}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: Colors.text.primary,
              selectedDayBackgroundColor: Colors.primary.main,
              selectedDayTextColor: Colors.text.white,
              todayTextColor: Colors.primary.main,
              dayTextColor: Colors.text.primary,
              textDisabledColor: Colors.text.light,
              dotColor: Colors.accent.success,
              monthTextColor: Colors.text.primary,
              textMonthFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {selectedDate && (
          <View style={styles.scheduleContainer}>
            <View style={styles.scheduleHeader}>
              <CalendarIcon size={20} color={Colors.text.primary} />
              <Text style={styles.scheduleDate}>
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>

            <View style={styles.lessonsList}>
              {getDayLessons(selectedDate).length > 0 ? (
                getDayLessons(selectedDate).map(lesson => (
                  <Pressable
                    key={lesson.id}
                    style={styles.lessonCard}
                    onPress={() => router.push(`/lessons/${lesson.lessonId}` as any)}
                  >
                    <View style={styles.lessonTime}>
                      <Clock size={16} color={Colors.text.secondary} />
                      <Text style={styles.timeText}>
                        {formatTime(new Date(lesson.scheduledDate))}
                      </Text>
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>
                        Swimming Lesson
                      </Text>
                      <Text style={styles.lessonStatus}>
                        {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusIndicator,
                        {
                          backgroundColor:
                            lesson.status === 'completed'
                              ? Colors.accent.success
                              : lesson.status === 'missed'
                              ? Colors.accent.error
                              : Colors.accent.warning,
                        },
                      ]}
                    />
                  </Pressable>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No lessons scheduled for this day
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  calendarContainer: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: Colors.background.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scheduleDate: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  lessonsList: {
    flex: 1,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  lessonTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  lessonStatus: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});