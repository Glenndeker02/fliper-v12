export interface ScheduledLesson {
  id: string;
  lessonId: string;
  title: string;
  date: Date;
  time: string;
  notes: string;
  reminderEnabled: boolean;
  reminderTime: number; // minutes before lesson
  completed: boolean;
}

// Mock function to simulate fetching scheduled lessons from Supabase
export const getScheduledLessons = async (): Promise<ScheduledLesson[]> => {
  // In a real implementation, this would fetch from Supabase
  return [
    {
      id: '1',
      lessonId: 'floating-front',
      title: 'Floating on Front',
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      time: '09:00',
      notes: 'Focus on relaxation techniques',
      reminderEnabled: true,
      reminderTime: 30,
      completed: false
    },
    {
      id: '2',
      lessonId: 'breathing-fundamentals',
      title: 'Breathing Fundamentals',
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      time: '10:30',
      notes: 'Practice rhythmic breathing',
      reminderEnabled: true,
      reminderTime: 60,
      completed: false
    }
  ];
};

// Mock function to simulate saving a scheduled lesson to Supabase
export const saveScheduledLesson = async (lesson: Omit<ScheduledLesson, 'id'>): Promise<ScheduledLesson> => {
  // In a real implementation, this would save to Supabase
  console.log('Saving scheduled lesson:', lesson);
  
  // Return the lesson with an ID (simulating database insertion)
  return {
    ...lesson,
    id: Math.random().toString(36).substring(7)
  };
};

// Mock function to simulate updating a scheduled lesson
export const updateScheduledLesson = async (lesson: ScheduledLesson): Promise<ScheduledLesson> => {
  // In a real implementation, this would update in Supabase
  console.log('Updating scheduled lesson:', lesson);
  return lesson;
};

// Mock function to simulate deleting a scheduled lesson
export const deleteScheduledLesson = async (id: string): Promise<void> => {
  // In a real implementation, this would delete from Supabase
  console.log('Deleting scheduled lesson:', id);
};

// Function to check if a lesson is due for a reminder
export const isLessonDueForReminder = (lesson: ScheduledLesson): boolean => {
  if (!lesson.reminderEnabled) return false;
  
  const now = new Date();
  const lessonDateTime = new Date(lesson.date);
  const [hours, minutes] = lesson.time.split(':').map(Number);
  lessonDateTime.setHours(hours, minutes, 0, 0);
  
  // Calculate reminder time
  const reminderTime = new Date(lessonDateTime);
  reminderTime.setMinutes(reminderTime.getMinutes() - lesson.reminderTime);
  
  // Check if we're within the reminder window (5 minutes)
  const windowEnd = new Date(reminderTime);
  windowEnd.setMinutes(windowEnd.getMinutes() + 5);
  
  return now >= reminderTime && now <= windowEnd;
};

// Function to get upcoming lessons
export const getUpcomingLessons = async (daysAhead: number = 7): Promise<ScheduledLesson[]> => {
  const lessons = await getScheduledLessons();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
  
  return lessons
    .filter(lesson => new Date(lesson.date) <= cutoffDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Function to mark a lesson as completed
export const markLessonAsCompleted = async (id: string): Promise<ScheduledLesson> => {
  const lessons = await getScheduledLessons();
  const lesson = lessons.find(l => l.id === id);
  
  if (lesson) {
    const updatedLesson = { ...lesson, completed: true };
    return updateScheduledLesson(updatedLesson);
  }
  
  throw new Error('Lesson not found');
};

export default {
  getScheduledLessons,
  saveScheduledLesson,
  updateScheduledLesson,
  deleteScheduledLesson,
  isLessonDueForReminder,
  getUpcomingLessons,
  markLessonAsCompleted
};