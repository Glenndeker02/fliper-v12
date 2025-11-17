import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Modal, 
  Dimensions 
} from 'react-native';
import { Type, Mic, Video, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface JournalModalProps {
  visible: boolean;
  onClose: () => void;
  onTextJournal: () => void;
  onVoiceNote: () => void;
  onVideoJournal: () => void;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  lastJournalType?: 'text' | 'voice' | 'video';
  journalStreak?: number;
  aiSuggestions?: {
    promptText: string;
    focusAreas: string[];
    reflectionPoints: string[];
  };
}

export default function JournalModal({
  visible,
  onClose,
  onTextJournal,
  onVoiceNote,
  onVideoJournal,
  learningStyle,
  lastJournalType,
  journalStreak,
  aiSuggestions
}: JournalModalProps) {
  const getRecommendedMethod = () => {
    if (!learningStyle) return null;
    
    switch (learningStyle) {
      case 'visual':
        return 'video';
      case 'auditory':
        return 'voice';
      case 'kinesthetic':
        return 'text';
      default:
        return lastJournalType || 'text';
    }
  };

  const recommendedMethod = getRecommendedMethod();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.text.secondary} />
          </Pressable>
          
          <Text style={styles.modalTitle}>How would you like to journal?</Text>
          <Text style={styles.modalSubtitle}>Choose a way to record your swimming experience</Text>

          {journalStreak && journalStreak > 0 && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakText}>
                🔥 {journalStreak} day{journalStreak > 1 ? 's' : ''} journaling streak!
              </Text>
            </View>
          )}

          {aiSuggestions && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>AI Coach Suggestions</Text>
              <Text style={styles.promptText}>{aiSuggestions.promptText}</Text>
              
              {aiSuggestions.focusAreas.length > 0 && (
                <View style={styles.focusAreasContainer}>
                  <Text style={styles.focusAreasTitle}>Focus Areas:</Text>
                  {aiSuggestions.focusAreas.map((area, index) => (
                    <View key={index} style={styles.focusAreaTag}>
                      <Text style={styles.focusAreaText}>{area}</Text>
                    </View>
                  ))}
                </View>
              )}

              {aiSuggestions.reflectionPoints.length > 0 && (
                <View style={styles.reflectionPointsContainer}>
                  {aiSuggestions.reflectionPoints.map((point, index) => (
                    <Text key={index} style={styles.reflectionPoint}>
                      • {point}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
          
          <View style={styles.optionsContainer}>
            <Pressable 
              style={[
                styles.optionButton,
                recommendedMethod === 'text' && styles.recommendedOption
              ]} 
              onPress={onTextJournal}
            >
              <View style={styles.optionIconContainer}>
                <Type size={24} color={Colors.text.white} />
              </View>
              <Text style={styles.optionTitle}>Text Journal</Text>
              <Text style={styles.optionDescription}>Write down your thoughts and reflections</Text>
              {recommendedMethod === 'text' && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}
            </Pressable>
            
            <Pressable 
              style={[
                styles.optionButton,
                recommendedMethod === 'voice' && styles.recommendedOption
              ]} 
              onPress={onVoiceNote}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: Colors.accent.warning }]}>
                <Mic size={24} color={Colors.text.white} />
              </View>
              <Text style={styles.optionTitle}>Voice Note</Text>
              <Text style={styles.optionDescription}>Record your voice while reflecting</Text>
              {recommendedMethod === 'voice' && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}
            </Pressable>
            
            <Pressable 
              style={[
                styles.optionButton,
                recommendedMethod === 'video' && styles.recommendedOption
              ]} 
              onPress={onVideoJournal}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: Colors.accent.info }]}>
                <Video size={24} color={Colors.text.white} />
              </View>
              <Text style={styles.optionTitle}>Video Journal</Text>
              <Text style={styles.optionDescription}>Capture a video of your swimming experience</Text>
              {recommendedMethod === 'video' && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 32,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  streakContainer: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.accent.black,
  },
  suggestionsContainer: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  focusAreasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  focusAreasTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginRight: 8,
  },
  focusAreaTag: {
    backgroundColor: Colors.primary.lightBlue,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  focusAreaText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent.black,
  },
  reflectionPointsContainer: {
    gap: 8,
  },
  reflectionPoint: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  recommendedOption: {
    borderWidth: 2,
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.lightBlue,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.text.white,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});