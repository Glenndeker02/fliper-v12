import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Alert } from 'react-native';
import Colors from '@/constants/colors';
import JournalModal from './JournalModal';

interface FloatingJournalButtonProps {
  onPress?: () => void;
  learningProfile?: {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    focusAreas: string[];
    comprehensionLevel: number;
    engagementLevel: number;
  };
  journalStats?: {
    lastJournalType?: 'text' | 'voice' | 'video';
    streak: number;
    totalEntries: number;
  };
}

export default function FloatingJournalButton({ 
  onPress,
  learningProfile,
  journalStats,
}: FloatingJournalButtonProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const generateAISuggestions = () => {
    if (!learningProfile) return undefined;

    const suggestions = {
      promptText: '',
      focusAreas: [] as string[],
      reflectionPoints: [] as string[],
    };

    // Generate personalized prompt based on learning style
    switch (learningProfile.learningStyle) {
      case 'visual':
        suggestions.promptText = 'Visualize your swimming movements and describe what you see.';
        break;
      case 'auditory':
        suggestions.promptText = 'Think about the rhythm and sounds of your swimming.';
        break;
      case 'kinesthetic':
        suggestions.promptText = 'Focus on how your body feels during different strokes.';
        break;
      case 'mixed':
        suggestions.promptText = 'Reflect on your overall swimming experience today.';
        break;
    }

    // Add focus areas
    suggestions.focusAreas = learningProfile.focusAreas;

    // Generate reflection points based on metrics
    if (learningProfile.comprehensionLevel < 0.7) {
      suggestions.reflectionPoints.push('What concepts are you finding challenging?');
    }
    if (learningProfile.engagementLevel < 0.7) {
      suggestions.reflectionPoints.push('What would make your practice more engaging?');
    }
    suggestions.reflectionPoints.push('What progress did you notice today?');

    return suggestions;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setModalVisible(true);
    }
  };

  const handleTextJournal = () => {
    setModalVisible(false);
    router.push({
      pathname: '/journal/[type]',
      params: { type: 'text' }
    });
  };

  const handleVoiceNote = () => {
    setModalVisible(false);
    router.push({
      pathname: '/journal/[type]',
      params: { type: 'voice' }
    });
  };

  const handleVideoJournal = () => {
    setModalVisible(false);
    router.push({
      pathname: '/journal/[type]',
      params: { type: 'video' }
    });
  };

  return (
    <>
      <Pressable style={styles.floatingButton} onPress={handlePress}>
        <Plus size={24} color={Colors.text.white} />
      </Pressable>
      <JournalModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onTextJournal={handleTextJournal}
        onVoiceNote={handleVoiceNote}
        onVideoJournal={handleVideoJournal}
        learningStyle={learningProfile?.learningStyle}
        lastJournalType={journalStats?.lastJournalType}
        journalStreak={journalStats?.streak}
        aiSuggestions={generateAISuggestions()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
});