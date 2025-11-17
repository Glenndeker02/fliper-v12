import { supabase } from './supabase';
import type { SkillLevel } from '@/constants/types';

interface LearnerProfile {
  userId: string;
  skillLevel: SkillLevel;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  preferredPace: 'slow' | 'moderate' | 'fast';
  focusAreas: string[];
  strengths: string[];
  weaknesses: string[];
}

interface PerformanceMetrics {
  lessonCompletionRate: number;
  averageConfidence: number;
  skillMasteryRate: number;
  consistencyScore: number;
  engagementScore: number;
}

interface LearningPathRecommendation {
  nextLessons: string[];
  suggestedSkills: string[];
  difficultyLevel: number;
  estimatedTimeToMastery: number;
  practiceSuggestions: string[];
}

export async function analyzeLearnerProfile(userId: string): Promise<LearnerProfile> {
  try {
    // Get user's assessment data
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (assessmentError) throw assessmentError;

    // Get historical performance data
    const { data: performance, error: performanceError } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId);

    if (performanceError) throw performanceError;

    // Analyze learning style based on lesson interactions
    const learningStyle = determineLearningStyle(performance);

    // Analyze learning pace
    const preferredPace = analyzeLearningPace(performance);

    // Identify focus areas, strengths, and weaknesses
    const { focusAreas, strengths, weaknesses } = analyzeSkillDistribution(performance);

    return {
      userId,
      skillLevel: assessment.skill_level,
      learningStyle,
      preferredPace,
      focusAreas,
      strengths,
      weaknesses,
    };
  } catch (error) {
    console.error('Error analyzing learner profile:', error);
    throw error;
  }
}

export async function calculatePerformanceMetrics(userId: string): Promise<PerformanceMetrics> {
  try {
    // Get lesson completion data
    const { data: completions, error: completionsError } = await supabase
      .from('lesson_completions')
      .select('*')
      .eq('user_id', userId);

    if (completionsError) throw completionsError;

    // Get skill mastery data
    const { data: skillMastery, error: skillError } = await supabase
      .from('skill_mastery')
      .select('*')
      .eq('user_id', userId);

    if (skillError) throw skillError;

    // Calculate metrics
    const lessonCompletionRate = calculateCompletionRate(completions);
    const averageConfidence = calculateAverageConfidence(completions);
    const skillMasteryRate = calculateSkillMasteryRate(skillMastery);
    const consistencyScore = calculateConsistencyScore(completions);
    const engagementScore = calculateEngagementScore(completions);

    return {
      lessonCompletionRate,
      averageConfidence,
      skillMasteryRate,
      consistencyScore,
      engagementScore,
    };
  } catch (error) {
    console.error('Error calculating performance metrics:', error);
    throw error;
  }
}

export async function generateLearningPathRecommendations(
  userId: string,
  profile: LearnerProfile,
  metrics: PerformanceMetrics
): Promise<LearningPathRecommendation> {
  try {
    // Get available lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('skill_level', profile.skillLevel);

    if (lessonsError) throw lessonsError;

    // Calculate optimal learning path
    const nextLessons = recommendNextLessons(lessons, profile, metrics);
    
    // Identify skills to focus on
    const suggestedSkills = identifySkillGaps(profile);

    // Calculate appropriate difficulty level
    const difficultyLevel = calculateOptimalDifficulty(metrics);

    // Estimate time to mastery
    const estimatedTimeToMastery = calculateTimeToMastery(profile, metrics);

    // Generate practice suggestions
    const practiceSuggestions = generatePracticePlan(profile, metrics);

    return {
      nextLessons,
      suggestedSkills,
      difficultyLevel,
      estimatedTimeToMastery,
      practiceSuggestions,
    };
  } catch (error) {
    console.error('Error generating learning path recommendations:', error);
    throw error;
  }
}

function determineLearningStyle(performanceData: any[]): 'visual' | 'auditory' | 'kinesthetic' {
  const interactions = performanceData.reduce((acc, curr) => {
    acc.visual = (acc.visual || 0) + (curr.visual_interactions || 0);
    acc.auditory = (acc.auditory || 0) + (curr.audio_interactions || 0);
    acc.kinesthetic = (acc.kinesthetic || 0) + (curr.practice_time || 0);
    return acc;
  }, {});

  const max = Math.max(interactions.visual, interactions.auditory, interactions.kinesthetic);
  
  if (max === interactions.visual) return 'visual';
  if (max === interactions.auditory) return 'auditory';
  return 'kinesthetic';
}

function analyzeLearningPace(performanceData: any[]): 'slow' | 'moderate' | 'fast' {
  const avgCompletionTime = performanceData.reduce(
    (acc, curr) => acc + curr.completion_time,
    0
  ) / performanceData.length;

  if (avgCompletionTime < 30) return 'fast';
  if (avgCompletionTime > 60) return 'slow';
  return 'moderate';
}

function analyzeSkillDistribution(performanceData: any[]) {
  const skillScores = performanceData.reduce((acc, curr) => {
    curr.skills_practiced.forEach((skill: string) => {
      if (!acc[skill]) acc[skill] = [];
      acc[skill].push(curr.performance_score);
    });
    return acc;
  }, {});

  const avgScores = Object.entries(skillScores).reduce((acc, [skill, scores]) => {
    acc[skill] = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    return acc;
  }, {});

  const sortedSkills = Object.entries(avgScores).sort(([,a], [,b]) => b - a);
  
  return {
    strengths: sortedSkills.slice(0, 3).map(([skill]) => skill),
    weaknesses: sortedSkills.slice(-3).map(([skill]) => skill),
    focusAreas: sortedSkills.slice(-5).map(([skill]) => skill),
  };
}

function calculateCompletionRate(completions: any[]): number {
  const total = completions.length;
  const completed = completions.filter(c => c.status === 'completed').length;
  return (completed / total) * 100;
}

function calculateAverageConfidence(completions: any[]): number {
  return completions.reduce(
    (acc, curr) => acc + curr.confidence_rating,
    0
  ) / completions.length;
}

function calculateSkillMasteryRate(skillMastery: any[]): number {
  const total = skillMastery.length;
  const mastered = skillMastery.filter(s => s.proficiency >= 0.9).length;
  return (mastered / total) * 100;
}

function calculateConsistencyScore(completions: any[]): number {
  // Calculate average time between practice sessions
  const timestamps = completions
    .map(c => new Date(c.completion_date).getTime())
    .sort();
  
  const intervals = timestamps.slice(1).map((time, i) => 
    time - timestamps[i]
  );

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const stdDev = Math.sqrt(
    intervals.reduce((acc, curr) => 
      acc + Math.pow(curr - avgInterval, 2), 0
    ) / intervals.length
  );

  // Lower standard deviation means more consistent practice
  return Math.max(0, 100 - (stdDev / (24 * 60 * 60 * 1000))); // Normalize to 0-100
}

function calculateEngagementScore(completions: any[]): number {
  // Consider factors like:
  // - Practice frequency
  // - Session duration
  // - Interactive elements used
  // - Additional practice attempts
  const factors = {
    frequency: calculatePracticeFrequency(completions),
    duration: calculateAverageDuration(completions),
    interaction: calculateInteractionRate(completions),
    extraPractice: calculateExtraPracticeRate(completions),
  };

  return Object.values(factors).reduce((a, b) => a + b, 0) / 4;
}

function calculatePracticeFrequency(completions: any[]): number {
  const daysBetweenFirstAndLast = (
    new Date(completions[completions.length - 1].completion_date).getTime() -
    new Date(completions[0].completion_date).getTime()
  ) / (24 * 60 * 60 * 1000);

  return (completions.length / daysBetweenFirstAndLast) * 100;
}

function calculateAverageDuration(completions: any[]): number {
  const avgDuration = completions.reduce(
    (acc, curr) => acc + curr.duration,
    0
  ) / completions.length;

  // Normalize to 0-100 scale (assuming 60 minutes is optimal)
  return Math.min(100, (avgDuration / 60) * 100);
}

function calculateInteractionRate(completions: any[]): number {
  return completions.reduce(
    (acc, curr) => acc + (curr.interactions / curr.max_interactions) * 100,
    0
  ) / completions.length;
}

function calculateExtraPracticeRate(completions: any[]): number {
  const withExtraPractice = completions.filter(c => c.additional_practice_time > 0).length;
  return (withExtraPractice / completions.length) * 100;
}

function recommendNextLessons(
  lessons: any[],
  profile: LearnerProfile,
  metrics: PerformanceMetrics
): string[] {
  // Filter lessons by skill level and prerequisites
  const eligibleLessons = lessons.filter(lesson =>
    lesson.skill_level === profile.skillLevel &&
    lesson.prerequisites.every((prereq: string) => profile.strengths.includes(prereq))
  );

  // Score each lesson based on:
  // - Focus on weak areas
  // - Appropriate difficulty
  // - Learning style match
  // - Pace alignment
  const scoredLessons = eligibleLessons.map(lesson => ({
    id: lesson.id,
    score: calculateLessonScore(lesson, profile, metrics),
  }));

  // Return top 3 recommended lessons
  return scoredLessons
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(lesson => lesson.id);
}

function calculateLessonScore(
  lesson: any,
  profile: LearnerProfile,
  metrics: PerformanceMetrics
): number {
  const weights = {
    weaknessAlignment: 0.35,
    difficultyMatch: 0.25,
    learningStyleMatch: 0.20,
    paceAlignment: 0.20,
  };

  const scores = {
    weaknessAlignment: calculateWeaknessAlignmentScore(lesson, profile.weaknesses),
    difficultyMatch: calculateDifficultyMatchScore(lesson, metrics),
    learningStyleMatch: calculateLearningStyleMatchScore(lesson, profile.learningStyle),
    paceAlignment: calculatePaceAlignmentScore(lesson, profile.preferredPace),
  };

  return Object.entries(weights).reduce(
    (total, [factor, weight]) => total + scores[factor] * weight,
    0
  );
}

function calculateWeaknessAlignmentScore(lesson: any, weaknesses: string[]): number {
  const targetSkills = lesson.target_skills || [];
  const alignmentCount = targetSkills.filter(skill => weaknesses.includes(skill)).length;
  return (alignmentCount / targetSkills.length) * 100;
}

function calculateDifficultyMatchScore(lesson: any, metrics: PerformanceMetrics): number {
  const optimalDifficulty = calculateOptimalDifficulty(metrics);
  const difficultyDiff = Math.abs(lesson.difficulty - optimalDifficulty);
  return Math.max(0, 100 - (difficultyDiff * 20));
}

function calculateLearningStyleMatchScore(
  lesson: any,
  learningStyle: 'visual' | 'auditory' | 'kinesthetic'
): number {
  const styleScores = {
    visual: lesson.visual_content_ratio || 0,
    auditory: lesson.audio_content_ratio || 0,
    kinesthetic: lesson.practice_ratio || 0,
  };

  return styleScores[learningStyle] * 100;
}

function calculatePaceAlignmentScore(
  lesson: any,
  preferredPace: 'slow' | 'moderate' | 'fast'
): number {
  const paceScores = {
    slow: lesson.estimated_duration > 45 ? 100 : 50,
    moderate: lesson.estimated_duration > 25 && lesson.estimated_duration <= 45 ? 100 : 50,
    fast: lesson.estimated_duration <= 25 ? 100 : 50,
  };

  return paceScores[preferredPace];
}

function calculateOptimalDifficulty(metrics: PerformanceMetrics): number {
  // Scale: 1-5
  const baseLevel = 3;
  let adjustment = 0;

  // Adjust based on performance metrics
  if (metrics.lessonCompletionRate > 80) adjustment += 0.5;
  if (metrics.averageConfidence > 4) adjustment += 0.5;
  if (metrics.skillMasteryRate > 70) adjustment += 0.5;
  if (metrics.consistencyScore > 80) adjustment += 0.5;

  if (metrics.lessonCompletionRate < 50) adjustment -= 0.5;
  if (metrics.averageConfidence < 3) adjustment -= 0.5;
  if (metrics.skillMasteryRate < 40) adjustment -= 0.5;
  if (metrics.consistencyScore < 50) adjustment -= 0.5;

  return Math.max(1, Math.min(5, baseLevel + adjustment));
}

function identifySkillGaps(profile: LearnerProfile): string[] {
  // Combine focus areas and weaknesses, remove duplicates
  return Array.from(new Set([...profile.focusAreas, ...profile.weaknesses]));
}

function calculateTimeToMastery(profile: LearnerProfile, metrics: PerformanceMetrics): number {
  // Base estimate in days
  let baseEstimate = 30;

  // Adjust based on performance metrics
  if (metrics.lessonCompletionRate > 80) baseEstimate *= 0.8;
  if (metrics.skillMasteryRate > 70) baseEstimate *= 0.8;
  if (metrics.consistencyScore > 80) baseEstimate *= 0.8;
  if (metrics.engagementScore > 80) baseEstimate *= 0.8;

  // Adjust based on learning pace
  const paceMultipliers = {
    fast: 0.8,
    moderate: 1,
    slow: 1.2,
  };

  return Math.round(baseEstimate * paceMultipliers[profile.preferredPace]);
}

function generatePracticePlan(profile: LearnerProfile, metrics: PerformanceMetrics): string[] {
  const suggestions: string[] = [];

  // Add frequency-based suggestions
  if (metrics.consistencyScore < 70) {
    suggestions.push('Schedule regular practice sessions 3-4 times per week');
  }

  // Add skill-focused suggestions
  profile.weaknesses.forEach(skill => {
    suggestions.push(`Focus on improving ${skill} through targeted exercises`);
  });

  // Add learning style suggestions
  const styleBasedSuggestions = {
    visual: 'Review technique videos before practice sessions',
    auditory: 'Listen to guided swimming instructions',
    kinesthetic: 'Practice movements on land before entering water',
  };
  suggestions.push(styleBasedSuggestions[profile.learningStyle]);

  // Add pace-based suggestions
  if (profile.preferredPace === 'slow') {
    suggestions.push('Break down complex movements into smaller steps');
  }

  return suggestions;
}