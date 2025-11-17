import { JournalEntry, AdaptiveNotification, LearningProfile } from '@/constants/types';

const JOURNALING_INTERVALS = {
  LOW_ENGAGEMENT: 7, // days
  MEDIUM_ENGAGEMENT: 3, // days
  HIGH_ENGAGEMENT: 1, // day
};

const NOTIFICATION_PRIORITIES = {
  OVERDUE: 'high',
  UPCOMING: 'medium',
  SUGGESTION: 'low',
} as const;

export const generateJournalingNotification = (
  lastEntry: JournalEntry | null,
  learningProfile: LearningProfile | null
): AdaptiveNotification | null => {
  if (!learningProfile) return null;

  const now = new Date();
  const lastEntryDate = lastEntry ? new Date(lastEntry.created_at) : null;
  
  // Determine journaling interval based on engagement level
  let interval = JOURNALING_INTERVALS.MEDIUM_ENGAGEMENT;
  if (learningProfile.engagement_level >= 0.8) {
    interval = JOURNALING_INTERVALS.HIGH_ENGAGEMENT;
  } else if (learningProfile.engagement_level <= 0.4) {
    interval = JOURNALING_INTERVALS.LOW_ENGAGEMENT;
  }

  // If no last entry or overdue
  if (!lastEntryDate || (now.getTime() - lastEntryDate.getTime()) > interval * 24 * 60 * 60 * 1000) {
    return {
      id: `journal-reminder-${now.getTime()}`,
      type: 'reminder',
      title: 'Time to Reflect',
      message: getJournalingMessage(learningProfile),
      priority: NOTIFICATION_PRIORITIES.OVERDUE,
      context: {
        trigger: 'journal_overdue',
        action_url: '/journal/new',
      },
      status: 'pending',
    };
  }

  // Upcoming reminder (12 hours before next due date)
  const nextDueDate = new Date(lastEntryDate.getTime() + interval * 24 * 60 * 60 * 1000);
  const timeUntilDue = nextDueDate.getTime() - now.getTime();
  if (timeUntilDue <= 12 * 60 * 60 * 1000 && timeUntilDue > 0) {
    return {
      id: `journal-upcoming-${now.getTime()}`,
      type: 'reminder',
      title: 'Journal Entry Due Soon',
      message: 'Keep your learning momentum going with a reflection on your progress.',
      priority: NOTIFICATION_PRIORITIES.UPCOMING,
      context: {
        trigger: 'journal_upcoming',
        action_url: '/journal/new',
      },
      status: 'pending',
    };
  }

  return null;
};

export const generateInsightNotification = (
  recentEntries: JournalEntry[],
  learningProfile: LearningProfile | null
): AdaptiveNotification | null => {
  if (!learningProfile || recentEntries.length === 0) return null;

  const now = new Date();
  const themes = new Set<string>();
  const insights: string[] = [];
  
  // Collect themes and insights from recent entries
  recentEntries.forEach(entry => {
    if (entry.ai_analysis) {
      const analysis = entry.ai_analysis as any; // Type assertion due to JSON storage
      analysis.key_themes?.forEach((theme: string) => themes.add(theme));
      analysis.learning_insights?.forEach((insight: string) => insights.push(insight));
    }
  });

  // Generate personalized message based on themes and profile
  const message = generatePersonalizedInsight(
    Array.from(themes),
    insights,
    learningProfile
  );

  if (message) {
    return {
      id: `insight-${now.getTime()}`,
      type: 'feedback',
      title: 'Your Swimming Journey Insights',
      message,
      priority: NOTIFICATION_PRIORITIES.SUGGESTION,
      context: {
        trigger: 'journal_insight',
        action_url: '/journal/history',
      },
      status: 'pending',
    };
  }

  return null;
};

export const generateMilestoneNotification = (
  entries: JournalEntry[],
  learningProfile: LearningProfile | null
): AdaptiveNotification | null => {
  if (!learningProfile || entries.length === 0) return null;

  const now = new Date();
  const milestones = checkJournalingMilestones(entries, learningProfile);

  if (milestones.length > 0) {
    const milestone = milestones[0]; // Take the most significant milestone
    return {
      id: `milestone-${now.getTime()}`,
      type: 'milestone',
      title: 'Journaling Milestone Achieved! 🎉',
      message: milestone,
      priority: NOTIFICATION_PRIORITIES.SUGGESTION,
      context: {
        trigger: 'journal_milestone',
        action_url: '/journal/history',
      },
      status: 'pending',
    };
  }

  return null;
};

// Helper functions
const getJournalingMessage = (profile: LearningProfile): string => {
  const messages = [
    `Time to reflect on your ${profile.focus_areas[0] || 'swimming'} progress.`,
    'Document your swimming journey and insights.',
    'Take a moment to record your thoughts and progress.',
    'Keep track of your swimming development with a quick journal entry.',
  ];

  if (profile.engagement_level < 0.5) {
    messages.push(
      'Regular reflection helps improve your swimming technique.',
      'Build your swimming confidence through consistent journaling.'
    );
  }

  return messages[Math.floor(Math.random() * messages.length)];
};

const generatePersonalizedInsight = (
  themes: string[],
  insights: string[],
  profile: LearningProfile
): string => {
  // If there are recurring themes, highlight them
  if (themes.length >= 2) {
    return `Your recent entries show focus on ${themes.slice(0, 2).join(' and ')}. ` +
           `This aligns well with your ${profile.focus_areas[0] || 'swimming'} goals.`;
  }

  // If there are meaningful insights, share them
  if (insights.length > 0) {
    return insights[Math.floor(Math.random() * insights.length)];
  }

  // Default encouraging message
  return `Keep documenting your swimming journey! Regular reflection helps reinforce your learning.`;
};

const checkJournalingMilestones = (
  entries: JournalEntry[],
  profile: LearningProfile
): string[] => {
  const milestones: string[] = [];
  const streakLength = calculateCurrentStreak(entries);
  
  // Streak milestones
  if (streakLength >= 7) {
    milestones.push(`You've maintained a 7-day journaling streak! 🔥`);
  }
  
  // Entry count milestones
  const entryCount = entries.length;
  if (entryCount === 10) {
    milestones.push(`You've completed 10 journal entries! 📝`);
  } else if (entryCount === 25) {
    milestones.push(`25 journal entries - you're becoming a reflection pro! 🌟`);
  } else if (entryCount === 50) {
    milestones.push(`Incredible! You've reached 50 journal entries! 🏆`);
  }
  
  // Insight milestones
  const insightfulEntries = entries.filter(entry => 
    entry.ai_analysis && (entry.ai_analysis as any).learning_insights?.length > 0
  );
  if (insightfulEntries.length >= 5) {
    milestones.push(`You've generated 5 meaningful insights about your swimming journey! 💡`);
  }

  return milestones;
};

const calculateCurrentStreak = (entries: JournalEntry[]): number => {
  if (entries.length === 0) return 0;

  const now = new Date();
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  let streak = 1;
  let currentDate = new Date(sortedEntries[0].created_at);

  // Check if the most recent entry is from today or yesterday
  const daysSinceLastEntry = Math.floor((now.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));
  if (daysSinceLastEntry > 1) return 0;

  // Calculate streak
  for (let i = 1; i < sortedEntries.length; i++) {
    const prevDate = new Date(sortedEntries[i].created_at);
    const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysDiff === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
};