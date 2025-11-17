import { JournalEntry, LearningProfile, SkillProgress } from '@/constants/types';

interface SwimmingSkillKeywords {
  [key: string]: {
    keywords: string[];
    difficulty: number;
    category: 'technique' | 'confidence' | 'fitness' | 'safety' | 'mental';
  };
}

const SWIMMING_SKILLS: SwimmingSkillKeywords = {
  breathing: {
    keywords: ['breath', 'breathing', 'inhale', 'exhale', 'air', 'rhythm'],
    difficulty: 0.6,
    category: 'technique',
  },
  floating: {
    keywords: ['float', 'floating', 'buoyancy', 'surface', 'relax'],
    difficulty: 0.4,
    category: 'confidence',
  },
  kicking: {
    keywords: ['kick', 'kicking', 'legs', 'flutter', 'propulsion'],
    difficulty: 0.5,
    category: 'technique',
  },
  strokes: {
    keywords: ['stroke', 'freestyle', 'backstroke', 'breaststroke', 'butterfly'],
    difficulty: 0.8,
    category: 'technique',
  },
  endurance: {
    keywords: ['endurance', 'stamina', 'distance', 'laps', 'fatigue'],
    difficulty: 0.7,
    category: 'fitness',
  },
  waterComfort: {
    keywords: ['comfort', 'comfortable', 'relaxed', 'natural', 'ease'],
    difficulty: 0.3,
    category: 'confidence',
  },
  waterSafety: {
    keywords: ['safety', 'safe', 'depth', 'lifeguard', 'rules'],
    difficulty: 0.4,
    category: 'safety',
  },
  mentalPrep: {
    keywords: ['mental', 'focus', 'concentration', 'mindset', 'preparation'],
    difficulty: 0.5,
    category: 'mental',
  },
  coordination: {
    keywords: ['coordination', 'timing', 'rhythm', 'synchronize', 'combine'],
    difficulty: 0.7,
    category: 'technique',
  },
  turns: {
    keywords: ['turn', 'flip', 'wall', 'push-off', 'rotation'],
    difficulty: 0.8,
    category: 'technique',
  },
};

interface EmotionKeywords {
  [key: string]: {
    keywords: string[];
    sentiment: number;
    intensity: number;
  };
}

const EMOTIONS: EmotionKeywords = {
  joy: {
    keywords: ['happy', 'excited', 'thrilled', 'accomplished', 'proud'],
    sentiment: 1,
    intensity: 0.8,
  },
  confidence: {
    keywords: ['confident', 'capable', 'strong', 'ready', 'prepared'],
    sentiment: 0.8,
    intensity: 0.7,
  },
  determination: {
    keywords: ['determined', 'focused', 'committed', 'motivated', 'persistent'],
    sentiment: 0.6,
    intensity: 0.9,
  },
  frustration: {
    keywords: ['frustrated', 'annoyed', 'difficult', 'struggling', 'hard'],
    sentiment: 0.3,
    intensity: 0.6,
  },
  anxiety: {
    keywords: ['anxious', 'nervous', 'worried', 'scared', 'afraid'],
    sentiment: 0.2,
    intensity: 0.7,
  },
  satisfaction: {
    keywords: ['satisfied', 'pleased', 'content', 'achieved', 'improved'],
    sentiment: 0.9,
    intensity: 0.6,
  },
};

export interface AdvancedAnalysis {
  textMetrics: {
    wordCount: number;
    averageSentenceLength: number;
    vocabularyDiversity: number;
  };
  skillAnalysis: {
    identifiedSkills: {
      skillName: string;
      mentions: number;
      difficulty: number;
      category: string;
    }[];
    focusAreas: string[];
    technicalDepth: number;
  };
  emotionalAnalysis: {
    dominantEmotions: {
      emotion: string;
      intensity: number;
    }[];
    overallSentiment: number;
    emotionalRange: number;
  };
  progressIndicators: {
    skillProgression: number;
    confidenceGrowth: number;
    techniqueMastery: number;
    mentalResilience: number;
  };
  learningPatterns: {
    preferredTechniques: string[];
    challengeAreas: string[];
    adaptationSpeed: number;
    practiceConsistency: number;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    resources: string[];
  };
}

export const performAdvancedAnalysis = async (
  entry: JournalEntry,
  learningProfile: LearningProfile | null,
  skillProgress: SkillProgress | null,
  recentEntries: JournalEntry[]
): Promise<AdvancedAnalysis> => {
  const text = entry.text_content?.toLowerCase() || '';
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(Boolean);

  // Text Metrics Analysis
  const textMetrics = analyzeTextMetrics(words, sentences);

  // Skill Analysis
  const skillAnalysis = analyzeSkills(text, learningProfile);

  // Emotional Analysis
  const emotionalAnalysis = analyzeEmotions(text, recentEntries);

  // Progress Analysis
  const progressIndicators = analyzeProgress(
    entry,
    recentEntries,
    skillProgress
  );

  // Learning Patterns
  const learningPatterns = analyzeLearningPatterns(
    entry,
    recentEntries,
    learningProfile
  );

  // Generate Recommendations
  const recommendations = generateRecommendations(
    skillAnalysis,
    emotionalAnalysis,
    progressIndicators,
    learningProfile
  );

  return {
    textMetrics,
    skillAnalysis,
    emotionalAnalysis,
    progressIndicators,
    learningPatterns,
    recommendations,
  };
};

const analyzeTextMetrics = (words: string[], sentences: string[]) => {
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  
  return {
    wordCount: words.length,
    averageSentenceLength: sentences.length > 0 ? words.length / sentences.length : 0,
    vocabularyDiversity: uniqueWords.size / words.length,
  };
};

const analyzeSkills = (text: string, learningProfile: LearningProfile | null) => {
  const identifiedSkills = [];
  let technicalDepth = 0;

  for (const [skill, data] of Object.entries(SWIMMING_SKILLS)) {
    const mentions = data.keywords.reduce((count, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      return count + (text.match(regex) || []).length;
    }, 0);

    if (mentions > 0) {
      identifiedSkills.push({
        skillName: skill,
        mentions,
        difficulty: data.difficulty,
        category: data.category,
      });
      technicalDepth += mentions * data.difficulty;
    }
  }

  // Normalize technical depth to 0-1 range
  technicalDepth = Math.min(1, technicalDepth / 10);

  // Determine focus areas based on mention frequency and learning profile
  const focusAreas = identifiedSkills
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 3)
    .map(skill => skill.skillName);

  return {
    identifiedSkills,
    focusAreas,
    technicalDepth,
  };
};

const analyzeEmotions = (text: string, recentEntries: JournalEntry[]) => {
  const emotionScores = new Map<string, { count: number; intensity: number }>();
  let totalSentiment = 0;
  let totalEmotions = 0;

  // Analyze current entry
  for (const [emotion, data] of Object.entries(EMOTIONS)) {
    const mentions = data.keywords.reduce((count, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      return count + (text.match(regex) || []).length;
    }, 0);

    if (mentions > 0) {
      emotionScores.set(emotion, {
        count: mentions,
        intensity: data.intensity * mentions,
      });
      totalSentiment += data.sentiment * mentions;
      totalEmotions += mentions;
    }
  }

  // Calculate dominant emotions
  const dominantEmotions = Array.from(emotionScores.entries())
    .map(([emotion, score]) => ({
      emotion,
      intensity: score.intensity / totalEmotions,
    }))
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 3);

  // Calculate emotional range by comparing with recent entries
  const recentEmotions = new Set<string>();
  recentEntries.forEach(entry => {
    if (entry.ai_analysis) {
      const analysis = entry.ai_analysis as any;
      analysis.emotional_analysis?.dominant_emotions?.forEach((e: any) => {
        recentEmotions.add(e.emotion);
      });
    }
  });

  return {
    dominantEmotions,
    overallSentiment: totalEmotions > 0 ? totalSentiment / totalEmotions : 0.5,
    emotionalRange: recentEmotions.size / Object.keys(EMOTIONS).length,
  };
};

const analyzeProgress = (
  currentEntry: JournalEntry,
  recentEntries: JournalEntry[],
  skillProgress: SkillProgress | null
) => {
  // Initialize base metrics
  let skillProgression = 0.5;
  let confidenceGrowth = 0.5;
  let techniqueMastery = skillProgress?.progress_percentage ? skillProgress.progress_percentage / 100 : 0.5;
  let mentalResilience = 0.5;

  // Analyze skill progression
  const skillMentionsOverTime = trackSkillMentionsOverTime([currentEntry, ...recentEntries]);
  skillProgression = calculateSkillProgression(skillMentionsOverTime);

  // Analyze confidence growth
  const confidencePattern = trackConfidencePattern([currentEntry, ...recentEntries]);
  confidenceGrowth = calculateConfidenceGrowth(confidencePattern);

  // Analyze technique mastery
  if (currentEntry.text_content) {
    const techniqueAnalysis = analyzeSkills(currentEntry.text_content, null);
    techniqueMastery = Math.max(techniqueMastery, techniqueAnalysis.technicalDepth);
  }

  // Analyze mental resilience
  const emotionalAnalysis = analyzeEmotions(currentEntry.text_content || '', recentEntries);
  mentalResilience = calculateMentalResilience(emotionalAnalysis);

  return {
    skillProgression,
    confidenceGrowth,
    techniqueMastery,
    mentalResilience,
  };
};

const analyzeLearningPatterns = (
  currentEntry: JournalEntry,
  recentEntries: JournalEntry[],
  learningProfile: LearningProfile | null
) => {
  // Analyze preferred techniques
  const skillMentions = new Map<string, number>();
  [currentEntry, ...recentEntries].forEach(entry => {
    if (entry.text_content) {
      const analysis = analyzeSkills(entry.text_content, learningProfile);
      analysis.identifiedSkills.forEach(skill => {
        skillMentions.set(
          skill.skillName,
          (skillMentions.get(skill.skillName) || 0) + skill.mentions
        );
      });
    }
  });

  const preferredTechniques = Array.from(skillMentions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([skill]) => skill);

  // Identify challenge areas
  const challengeAreas = identifyChallengeAreas([currentEntry, ...recentEntries]);

  // Calculate adaptation speed
  const adaptationSpeed = calculateAdaptationSpeed(
    [currentEntry, ...recentEntries],
    challengeAreas
  );

  // Measure practice consistency
  const practiceConsistency = calculatePracticeConsistency(
    [currentEntry, ...recentEntries]
  );

  return {
    preferredTechniques,
    challengeAreas,
    adaptationSpeed,
    practiceConsistency,
  };
};

const generateRecommendations = (
  skillAnalysis: ReturnType<typeof analyzeSkills>,
  emotionalAnalysis: ReturnType<typeof analyzeEmotions>,
  progressIndicators: ReturnType<typeof analyzeProgress>,
  learningProfile: LearningProfile | null
) => {
  const immediate: string[] = [];
  const shortTerm: string[] = [];
  const longTerm: string[] = [];
  const resources: string[] = [];

  // Generate immediate recommendations based on emotional state
  if (emotionalAnalysis.overallSentiment < 0.4) {
    immediate.push(
      'Take a moment to acknowledge your progress, no matter how small.',
      'Try breaking down challenging skills into smaller, manageable steps.'
    );
  }

  // Generate technique-focused recommendations
  skillAnalysis.focusAreas.forEach(skill => {
    const skillData = SWIMMING_SKILLS[skill];
    if (skillData) {
      shortTerm.push(
        `Focus on improving your ${skill} technique through targeted drills.`
      );
      resources.push(
        `Check out the video tutorials on ${skill} in the library.`
      );
    }
  });

  // Generate long-term recommendations
  if (progressIndicators.skillProgression < 0.6) {
    longTerm.push(
      'Consider scheduling regular practice sessions focusing on specific skills.',
      'Set measurable goals for each swimming technique you want to improve.'
    );
  }

  // Add learning style-specific recommendations
  if (learningProfile?.learning_style === 'visual') {
    resources.push('Use the video analysis tool to review your technique.');
  } else if (learningProfile?.learning_style === 'kinesthetic') {
    immediate.push('Practice dryland exercises to reinforce proper form.');
  }

  return {
    immediate,
    shortTerm,
    longTerm,
    resources,
  };
};

// Helper functions
const trackSkillMentionsOverTime = (entries: JournalEntry[]) => {
  const mentions = entries.map(entry => {
    if (!entry.text_content) return new Map<string, number>();
    
    const skillMentions = new Map<string, number>();
    Object.entries(SWIMMING_SKILLS).forEach(([skill, data]) => {
      const count = data.keywords.reduce((acc, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        return acc + (entry.text_content?.match(regex) || []).length;
      }, 0);
      if (count > 0) skillMentions.set(skill, count);
    });
    return skillMentions;
  });
  return mentions;
};

const calculateSkillProgression = (skillMentionsOverTime: Map<string, number>[]) => {
  if (skillMentionsOverTime.length < 2) return 0.5;
  
  let progressionScore = 0;
  let totalSkills = 0;
  
  // Compare recent entries with older ones
  const recentMentions = skillMentionsOverTime[0];
  const olderMentions = skillMentionsOverTime[skillMentionsOverTime.length - 1];
  
  recentMentions.forEach((recent, skill) => {
    const older = olderMentions.get(skill) || 0;
    if (recent > older) progressionScore++;
    totalSkills++;
  });
  
  return totalSkills > 0 ? progressionScore / totalSkills : 0.5;
};

const trackConfidencePattern = (entries: JournalEntry[]) => {
  return entries.map(entry => {
    if (!entry.text_content) return 0.5;
    
    const confidenceWords = EMOTIONS.confidence.keywords;
    const total = confidenceWords.reduce((acc, word) => {
      const regex = new RegExp(word, 'gi');
      return acc + (entry.text_content?.match(regex) || []).length;
    }, 0);
    
    return Math.min(1, total / 5); // Normalize to 0-1
  });
};

const calculateConfidenceGrowth = (confidencePattern: number[]) => {
  if (confidencePattern.length < 2) return 0.5;
  
  const recent = confidencePattern.slice(0, Math.ceil(confidencePattern.length / 2));
  const older = confidencePattern.slice(Math.ceil(confidencePattern.length / 2));
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  return Math.max(0, Math.min(1, (recentAvg - olderAvg + 1) / 2));
};

const calculateMentalResilience = (emotionalAnalysis: ReturnType<typeof analyzeEmotions>) => {
  const resilienceScore = 
    emotionalAnalysis.emotionalRange * 0.4 + // Diversity of emotions
    emotionalAnalysis.overallSentiment * 0.3 + // Positive outlook
    (1 - Math.abs(0.5 - emotionalAnalysis.overallSentiment)) * 0.3; // Emotional balance
  
  return Math.max(0, Math.min(1, resilienceScore));
};

const identifyChallengeAreas = (entries: JournalEntry[]) => {
  const challengeMentions = new Map<string, number>();
  
  entries.forEach(entry => {
    if (!entry.text_content) return;
    
    Object.entries(SWIMMING_SKILLS).forEach(([skill, data]) => {
      const hasChallenge = entry.text_content?.toLowerCase().includes('challenge') || 
                          entry.text_content?.toLowerCase().includes('difficult');
      
      if (hasChallenge) {
        const skillMentions = data.keywords.reduce((acc, keyword) => {
          const regex = new RegExp(keyword, 'gi');
          return acc + (entry.text_content?.match(regex) || []).length;
        }, 0);
        
        if (skillMentions > 0) {
          challengeMentions.set(
            skill,
            (challengeMentions.get(skill) || 0) + skillMentions
          );
        }
      }
    });
  });
  
  return Array.from(challengeMentions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([skill]) => skill);
};

const calculateAdaptationSpeed = (entries: JournalEntry[], challengeAreas: string[]) => {
  if (entries.length < 2) return 0.5;
  
  const challengeProgress = new Map<string, number[]>();
  challengeAreas.forEach(area => {
    const progress = entries.map(entry => {
      if (!entry.text_content) return 0;
      
      const skillData = SWIMMING_SKILLS[area];
      const difficultyMentions = entry.text_content.toLowerCase().includes('difficult') ? 1 : 0;
      const improvementMentions = entry.text_content.toLowerCase().includes('improve') ? 1 : 0;
      
      return improvementMentions - difficultyMentions;
    });
    
    challengeProgress.set(area, progress);
  });
  
  const adaptationScores = Array.from(challengeProgress.values()).map(progress => {
    const trend = progress.reduce((acc, curr, i) => {
      if (i === 0) return 0;
      return acc + (curr - progress[i - 1]);
    }, 0);
    
    return Math.max(0, Math.min(1, (trend + progress.length) / (2 * progress.length)));
  });
  
  return adaptationScores.reduce((a, b) => a + b, 0) / adaptationScores.length;
};

const calculatePracticeConsistency = (entries: JournalEntry[]) => {
  if (entries.length < 2) return 0.5;
  
  const dates = entries.map(entry => new Date(entry.created_at));
  const intervals = [];
  
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.abs(dates[i].getTime() - dates[i - 1].getTime());
    intervals.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const consistencyScore = Math.max(0, Math.min(1, 7 / avgInterval)); // Normalize to 0-1, optimal = 1 entry per week
  
  return consistencyScore;
};