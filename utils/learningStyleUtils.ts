import { LearningProfile } from '@/constants/types';

const LEARNING_STYLE_WEIGHTS = {
  text: {
    visual: 0.4,
    auditory: 0.3,
    kinesthetic: 0.3,
    mixed: 0.5,
  },
  voice: {
    visual: 0.3,
    auditory: 0.8,
    kinesthetic: 0.4,
    mixed: 0.6,
  },
  video: {
    visual: 0.9,
    auditory: 0.6,
    kinesthetic: 0.7,
    mixed: 0.8,
  },
};

export const calculateLearningStyleMatch = (
  entryType: 'text' | 'voice' | 'video',
  learningProfile: LearningProfile | null
): number => {
  if (!learningProfile) return 0.5;

  const weights = LEARNING_STYLE_WEIGHTS[entryType];
  return weights[learningProfile.learning_style] || 0.5;
};