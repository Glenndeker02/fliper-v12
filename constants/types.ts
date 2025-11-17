// Basic Types
export type SkillLevel = 
  | 'beginner-1' 
  | 'beginner-2' 
  | 'intermediate-1' 
  | 'intermediate-2' 
  | 'advanced';

export type WaterComfort = 
  | 'very-uncomfortable' 
  | 'uncomfortable' 
  | 'neutral' 
  | 'comfortable' 
  | 'very-comfortable';

export type SwimmingAbility = 
  | 'non-swimmer' 
  | 'beginner' 
  | 'basic-swimmer' 
  | 'intermediate' 
  | 'advanced';

export type FitnessLevel = 
  | 'sedentary' 
  | 'lightly-active' 
  | 'moderately-active' 
  | 'very-active' 
  | 'athlete';

export type LearningGoal = 
  | 'overcome-fear' 
  | 'learn-basic' 
  | 'improve-fitness' 
  | 'master-technique' 
  | 'build-endurance' 
  | 'learn-strokes' 
  | 'train-competition' 
  | 'family-activities';

export type PracticeEnvironment = 
  | 'public-pool' 
  | 'gym-pool' 
  | 'home-pool' 
  | 'open-water' 
  | 'varied';

// User and Assessment Types
export interface AssessmentData {
  waterComfort: WaterComfort | null;
  swimmingAbility: SwimmingAbility | null;
  specificSkills: string[];
  challenges: string[];
  fitnessLevel: FitnessLevel | null;
  physicalLimitations: string[];
  learningGoals: LearningGoal[];
  practiceEnvironment: PracticeEnvironment | null;
  poolAccess: number;
  sessionDuration: string;
  learningPreferences: string[];
  timeline: string;
  commitment: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  skillLevel: SkillLevel;
  assessmentData: AssessmentData;
  completedLessons: string[];
  currentModule: number;
  streak: number;
  totalXP: number;
  lastActive: Date;
  createdAt: Date;
  preferences: {
    reminders: boolean;
    reminderTime: string;
    poolAccess: number;
    learningPreferences: string[];
    schedulingPreferences: {
      preferredDays: string[];
      preferredTimes: string[];
      sessionDuration: number;
      weeklyFrequency: number;
    };
  };
}

// Learning and Progress Types
export interface LearningProgress {
  userId: string;
  skillLevel: SkillLevel;
  currentModule: number;
  completedLessons: string[];
  moduleProgress: {
    [key: number]: {
      completed: boolean;
      progress: number;
      lastActivity: Date;
    };
  };
  streakDays: number;
  totalXP: number;
  avgConfidence: number;
  achievements: string[];
}

export interface Module {
  id: number;
  skillLevel: SkillLevel;
  title: string;
  description: string;
  duration: string;
  prerequisites: string[];
  lessons: Lesson[];
  status: 'locked' | 'in-progress' | 'completed';
  progress: number;
}

export interface Lesson {
  id: string;
  moduleId: number;
  title: string;
  description: string;
  skillLevel: SkillLevel;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  videoUrl?: string;
  thumbnailUrl: string;
  objectives: string[];
  equipment: string[];
  prerequisites: string[];
  sequence_number: number;
  status: 'locked' | 'available' | 'completed';
  type: 'pool' | 'dryland';
  steps: LessonStep[];
  drills: Drill[];
  commonMistakes: CommonMistake[];
  checklistItems: string[];
}

export interface LessonStep {
  number: number;
  title: string;
  instruction: string;
  keyPoints: string[];
  safetyNote?: string;
  imageUrl?: string;
  description?: string; // deprecated, use instruction
  proTip?: string;
  warning?: string;
}

export interface Drill {
  id: string;
  title: string;
  setup: string;
  exercise: string;
  goal: string;
  duration: string;
  videoUrl?: string;
  progression?: string;
  safetyNote?: string;
}

export interface CommonMistake {
  id: string;
  wrongDescription: string;
  wrongImageUrl: string;
  rightDescription: string;
  rightImageUrl: string;
}

// Exercise Types
export interface Exercise {
  id: string;
  title: string;
  category: 'flexibility' | 'strength' | 'breathing' | 'simulation' | 'balance';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  targetedMuscles: string[];
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
  steps: ExerciseStep[];
  formTips: string[];
  commonMistakes: string[];
  modifications: {
    easier: string;
    harder: string;
    injury: string;
  };
  swimmingConnection: string;
}

export interface ExerciseStep {
  number: number;
  title: string;
  description: string;
  imageUrl: string;
  breathing?: string;
  reps?: string;
}

// Journal Types
export interface JournalEntry {
  id: string;
  user_id: string;
  created_at: string;
  entry_type: 'text' | 'voice' | 'video';
  text_content: string | null;
  audio_url: string | null;
  video_url: string | null;
  ai_analysis: {
    sentiment: number;
    key_themes: string[];
    learning_insights: string[];
    recommendations: string[];
  } | null;
  sentiment_score: number | null;
  tags: string[] | null;
  is_private: boolean;
}

export interface JournalEntryWithAnalytics extends JournalEntry {
  analytics: {
    sentiment_trend: number[];
    word_count: number;
    common_themes: string[];
    progress_indicators: {
      confidence: number;
      understanding: number;
      engagement: number;
    };
  };
}

// Adaptive Learning Types
export interface AdaptiveMetrics {
  journaling_consistency: boolean;
  reflection_quality: number;
  media_usage: boolean;
  learning_style_match: number;
  pace_alignment: number;
}

export interface AIFeedback {
  id: string;
  content: string;
  context: {
    source: 'journal' | 'lesson' | 'practice';
    entry_id: string;
    focus_areas: string[];
  };
  suggestions: string[];
  learning_insights: {
    patterns?: string[];
    strengths?: string[];
    improvement_areas?: string[];
  };
}

export interface AdaptiveNotification {
  id: string;
  type: 'reminder' | 'milestone' | 'suggestion' | 'feedback';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  context: {
    trigger: string;
    related_entity_id?: string;
    action_url?: string;
  };
  status: 'pending' | 'sent' | 'read' | 'acted_upon';
}

// Pool Practice Session Types
export interface PoolSessionInterval {
  id: string;
  type: 'warmup' | 'drill' | 'practice' | 'rest' | 'cooldown';
  title: string;
  description: string;
  duration: number; // in seconds
  instructions: string[];
  audioCoaching: string[]; // Audio prompts to play during interval
  targetHeartRate?: {
    min: number;
    max: number;
  };
}

export interface PoolSession {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'beginner-intermediate' | 'intermediate' | 'advanced';
  duration: number; // total duration in minutes
  focusAreas: string[];
  equipment: string[];
  safetyChecklist: string[];
  intervals: PoolSessionInterval[];
  thumbnailUrl?: string;
  estimatedCalories?: number;
  estimatedDistance?: number; // in meters
}

export interface PoolSessionProgress {
  sessionId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  status: 'not-started' | 'in-progress' | 'paused' | 'completed' | 'abandoned';
  currentIntervalIndex: number;
  completedIntervals: string[];
  totalDuration: number; // actual time spent in seconds
  notes?: string;
  difficulty?: 'too-easy' | 'just-right' | 'too-hard';
  metrics?: {
    heartRateAvg?: number;
    heartRateMax?: number;
    restsTaken?: number;
    distance?: number;
  };
}
