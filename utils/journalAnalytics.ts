import { Journal } from '@/constants/supabaseTypes';

interface JournalAnalysis {
  sentiment: number;
  key_themes: string[];
  learning_insights: string[];
  recommendations: string[];
}

interface EntryAnalytics {
  created_at: string;
  ai_analysis: JournalAnalysis | null;
  sentiment_score: number | null;
}

const THEMES = [
  'confidence',
  'progress',
  'challenge',
  'achievement',
  'technique',
  'comfort',
  'fear',
  'motivation',
  'practice',
  'improvement',
  'obstacles',
  'goals',
  'breakthroughs',
  'frustration',
  'enjoyment',
  'fitness',
  'endurance',
  'strength',
  'flexibility',
  'coordination',
];

import { performAdvancedAnalysis, AdvancedAnalysis } from './advancedAnalytics';
import { JournalEntry, LearningProfile, SkillProgress } from '@/constants/types';

export interface JournalAnalysis {
  sentiment: number;
  key_themes: string[];
  learning_insights: string[];
  recommendations: string[];
  advanced_metrics?: AdvancedAnalysis;
}

export const analyzeJournalText = async (
  text: string,
  currentEntry: JournalEntry,
  learningProfile: LearningProfile | null = null,
  skillProgress: SkillProgress | null = null,
  recentEntries: JournalEntry[] = []
): Promise<JournalAnalysis> => {
  // First, get basic analysis
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  // Simple sentiment analysis
  const positiveWords = ['happy', 'great', 'good', 'better', 'progress', 'confident', 'comfortable', 'achievement', 'success'];
  const negativeWords = ['frustrated', 'difficult', 'hard', 'scared', 'nervous', 'worried', 'struggle', 'problem', 'fear'];
  
  const positiveCount = words.filter(word => positiveWords.includes(word)).length;
  const negativeCount = words.filter(word => negativeWords.includes(word)).length;
  const totalEmotionalWords = positiveCount + negativeCount;
  
  const sentiment = totalEmotionalWords > 0 
    ? (positiveCount / totalEmotionalWords)
    : 0.5;

  // Theme detection
  const detectedThemes = THEMES.filter(theme => 
    lowerText.includes(theme) || 
    lowerText.includes(theme + 's') || 
    lowerText.includes(theme + 'ing')
  );

  // Generate insights based on themes and sentiment
  const insights: string[] = [];
  if (sentiment > 0.7) {
    insights.push('You\'re showing great confidence in your progress.');
  } else if (sentiment < 0.3) {
    insights.push('You seem to be facing some challenges. Remember that challenges are opportunities for growth.');
  }

  if (detectedThemes.includes('technique')) {
    insights.push('You\'re paying attention to proper technique, which is crucial for improvement.');
  }
  if (detectedThemes.includes('practice')) {
    insights.push('Regular practice is key to mastering swimming skills.');
  }

  // Get advanced analysis
  const advancedMetrics = await performAdvancedAnalysis(
    currentEntry,
    learningProfile,
    skillProgress,
    recentEntries
  );

  // Merge recommendations from both analyses
  const recommendations = [
    ...generateBasicRecommendations(sentiment, detectedThemes),
    ...advancedMetrics.recommendations.immediate,
    ...advancedMetrics.recommendations.shortTerm.slice(0, 2)
  ];

  // Enhance insights with advanced analysis
  if (advancedMetrics.learningPatterns.adaptationSpeed > 0.7) {
    insights.push('You\'re showing excellent adaptability in your swimming practice.');
  }

  if (advancedMetrics.progressIndicators.mentalResilience > 0.8) {
    insights.push('Your mental resilience is becoming a key strength in your swimming journey.');
  }

  const dominantEmotions = advancedMetrics.emotionalAnalysis.dominantEmotions;
  if (dominantEmotions.some(e => e.emotion === 'confidence' && e.intensity > 0.7)) {
    insights.push('Your growing confidence is evident in your reflections.');
  }

  return {
    sentiment,
    key_themes: [
      ...detectedThemes,
      ...advancedMetrics.skillAnalysis.focusAreas
    ].slice(0, 5), // Limit to top 5 unique themes
    learning_insights: insights,
    recommendations,
    advanced_metrics: advancedMetrics
  };
};

const generateBasicRecommendations = (sentiment: number, themes: string[]): string[] => {
  const recommendations: string[] = [];

  if (sentiment < 0.5) {
    recommendations.push('Consider breaking down challenging skills into smaller, manageable steps.');
    recommendations.push('Focus on celebrating small improvements and progress.');
  }

  if (themes.includes('fear') || themes.includes('comfort')) {
    recommendations.push('Practice relaxation techniques before entering the water.');
    recommendations.push('Start each session with confidence-building exercises.');
  }

  if (themes.includes('technique') || themes.includes('improvement')) {
    recommendations.push('Review technique videos in the library for proper form.');
    recommendations.push('Schedule a practice session focusing specifically on form.');
  }

  return recommendations;
};

export const calculateEntryFrequency = (entries: EntryAnalytics[]): number => {
  if (entries.length < 2) return 0;
  
  const dates = entries.map(entry => new Date(entry.created_at));
  const firstEntry = Math.min(...dates.map(d => d.getTime()));
  const lastEntry = Math.max(...dates.map(d => d.getTime()));
  const daysDiff = (lastEntry - firstEntry) / (1000 * 60 * 60 * 24);
  
  return entries.length / daysDiff;
};

export const extractCommonThemes = (entries: EntryAnalytics[]): string[] => {
  const themeCount: Record<string, number> = {};
  
  entries.forEach(entry => {
    const themes = entry.ai_analysis?.key_themes || [];
    themes.forEach(theme => {
      themeCount[theme] = (themeCount[theme] || 0) + 1;
    });
  });
  
  return Object.entries(themeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([theme]) => theme);
};

export const calculateConfidenceScore = (entries: EntryAnalytics[]): number => {
  if (entries.length === 0) return 0;
  
  const confidenceWords = ['confident', 'comfortable', 'ready', 'prepared', 'strong'];
  let totalScore = 0;
  
  entries.forEach(entry => {
    if (!entry.ai_analysis) return;
    
    // Consider sentiment as part of confidence
    totalScore += entry.sentiment_score || 0.5;
    
    // Check if confidence-related themes are present
    const hasConfidenceThemes = entry.ai_analysis.key_themes.some(theme => 
      confidenceWords.includes(theme.toLowerCase())
    );
    if (hasConfidenceThemes) totalScore += 0.5;
  });
  
  return Math.min(1, totalScore / entries.length);
};

export const calculateUnderstandingScore = (entries: EntryAnalytics[]): number => {
  if (entries.length === 0) return 0;
  
  const understandingWords = ['understand', 'learned', 'realized', 'technique', 'improvement'];
  let totalScore = 0;
  
  entries.forEach(entry => {
    if (!entry.ai_analysis) return;
    
    // Check for learning-related themes
    const hasUnderstandingThemes = entry.ai_analysis.key_themes.some(theme =>
      understandingWords.includes(theme.toLowerCase())
    );
    if (hasUnderstandingThemes) totalScore += 1;
    
    // Consider the length and quality of insights
    if (entry.ai_analysis.learning_insights.length > 0) {
      totalScore += 0.5;
    }
  });
  
  return Math.min(1, totalScore / entries.length);
};

export const calculateEngagementScore = (entries: EntryAnalytics[]): number => {
  if (entries.length === 0) return 0;
  
  let totalScore = 0;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Calculate recency score
  const recentEntries = entries.filter(entry => 
    new Date(entry.created_at) >= thirtyDaysAgo
  );
  const recencyScore = recentEntries.length / 30; // Ideal: 1 entry per day
  
  // Calculate consistency score
  const dates = entries.map(entry => new Date(entry.created_at));
  const gaps = dates.slice(1).map((date, i) => 
    (date.getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24)
  );
  const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b) / gaps.length : 30;
  const consistencyScore = Math.min(1, 7 / avgGap); // Ideal: At least once per week
  
  // Calculate detail score
  const detailScore = entries.reduce((score, entry) => {
    if (!entry.ai_analysis) return score;
    return score + (
      (entry.ai_analysis.key_themes.length / 5) + // Max 5 themes
      (entry.ai_analysis.learning_insights.length / 3) + // Max 3 insights
      (entry.ai_analysis.recommendations.length / 3) // Max 3 recommendations
    ) / 3;
  }, 0) / entries.length;
  
  totalScore = (recencyScore + consistencyScore + detailScore) / 3;
  return Math.min(1, totalScore);
};