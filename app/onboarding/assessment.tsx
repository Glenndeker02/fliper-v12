import { useRouter } from 'expo-router';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { supabase, getCurrentUser } from '@/utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { ASSESSMENT_QUESTIONS } from '@/constants/mockData';
import type { AssessmentData, WaterComfort, SwimmingAbility, FitnessLevel } from '@/constants/types';

const TOTAL_STEPS = 7;

const calculateInitialSkillLevel = (assessment: Partial<AssessmentData>): SkillLevel => {
  // Calculate points based on water comfort and swimming ability
  let points = 0;

  // Water comfort points
  switch (assessment.waterComfort) {
    case 'very-comfortable':
      points += 4;
      break;
    case 'comfortable':
      points += 3;
      break;
    case 'neutral':
      points += 2;
      break;
    case 'uncomfortable':
      points += 1;
      break;
    case 'very-uncomfortable':
      points += 0;
      break;
  }

  // Swimming ability points
  switch (assessment.swimmingAbility) {
    case 'advanced':
      points += 4;
      break;
    case 'intermediate':
      points += 3;
      break;
    case 'basic-swimmer':
      points += 2;
      break;
    case 'beginner':
      points += 1;
      break;
    case 'non-swimmer':
      points += 0;
      break;
  }

  // Specific skills points (0.5 points per skill)
  points += (assessment.specificSkills?.length || 0) * 0.5;

  // Determine skill level based on total points
  if (points >= 7) return 'advanced';
  if (points >= 5) return 'intermediate-2';
  if (points >= 3) return 'intermediate-1';
  if (points >= 1) return 'beginner-2';
  return 'beginner-1';
};

export default function AssessmentScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState<Partial<AssessmentData>>({
    waterComfort: null,
    swimmingAbility: null,
    specificSkills: [],
    challenges: [],
    fitnessLevel: null,
    physicalLimitations: [],
    learningGoals: [],
    practiceEnvironment: null,
    poolAccess: 2,
    sessionDuration: '30-45 minutes',
    learningPreferences: [],
    timeline: 'moderate',
    commitment: 50,
  });

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        // Get current user
        const user = await getCurrentUser();
        if (!user) {
          console.error('No user found');
          return;
        }

        // Save assessment data
        await supabase
          .from('assessment_data')
          .insert({
            user_id: user.id,
            water_comfort: assessmentData.waterComfort,
            swimming_ability: assessmentData.swimmingAbility,
            specific_skills: assessmentData.specificSkills,
            challenges: assessmentData.challenges,
            fitness_level: assessmentData.fitnessLevel,
            physical_limitations: assessmentData.physicalLimitations,
            learning_goals: assessmentData.learningGoals,
            practice_environment: assessmentData.practiceEnvironment,
            pool_access: assessmentData.poolAccess,
            session_duration: assessmentData.sessionDuration,
            learning_preferences: assessmentData.learningPreferences,
            timeline: assessmentData.timeline,
            commitment: assessmentData.commitment,
            completed: true
          });

        // Calculate initial skill level based on assessment
        const skillLevel = calculateInitialSkillLevel(assessmentData);

        // Update user profile with skill level
        await supabase
          .from('user_profiles')
          .update({
            skill_level: skillLevel,
            current_module: `${skillLevel}-module-1`
          })
          .eq('id', user.id);

        // Navigate to results
        router.push({
          pathname: '/onboarding/results',
          params: { skillLevel }
        });
      } catch (error) {
        console.error('Error saving assessment:', error);
        Alert.alert(
          'Error',
          'Failed to save your assessment. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return assessmentData.waterComfort !== null;
      case 2:
        return assessmentData.swimmingAbility !== null;
      case 3:
        return true;
      case 4:
        return assessmentData.fitnessLevel !== null;
      case 5:
        return assessmentData.learningGoals && assessmentData.learningGoals.length > 0;
      case 6:
        return assessmentData.practiceEnvironment !== null;
      case 7:
        return assessmentData.learningPreferences && assessmentData.learningPreferences.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How comfortable are you in water?</Text>
            <View style={styles.optionsContainer}>
              {ASSESSMENT_QUESTIONS.waterComfort.options.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionCard,
                    assessmentData.waterComfort === option.value && styles.optionCardSelected,
                  ]}
                  onPress={() =>
                    setAssessmentData({ ...assessmentData, waterComfort: option.value as WaterComfort })
                  }
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Which best describes your swimming ability?</Text>
            <View style={styles.optionsContainer}>
              {ASSESSMENT_QUESTIONS.swimmingAbility.options.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionCard,
                    assessmentData.swimmingAbility === option.value && styles.optionCardSelected,
                  ]}
                  onPress={() =>
                    setAssessmentData({ ...assessmentData, swimmingAbility: option.value as SwimmingAbility })
                  }
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Can you do the following?</Text>
            <Text style={styles.stepSubtitle}>Select all that apply</Text>
            <View style={styles.checkboxContainer}>
              {[
                'Submerge face in water comfortably',
                'Float on back for 10+ seconds',
                'Float on front for 10+ seconds',
                'Hold breath underwater for 10+ seconds',
                'Open eyes underwater',
                'Tread water for 30+ seconds',
                'Jump into deep water confidently',
              ].map((skill) => (
                <Pressable
                  key={skill}
                  style={[
                    styles.checkboxItem,
                    assessmentData.specificSkills?.includes(skill) && styles.checkboxItemSelected,
                  ]}
                  onPress={() => {
                    const skills = assessmentData.specificSkills || [];
                    const newSkills = skills.includes(skill)
                      ? skills.filter((s) => s !== skill)
                      : [...skills, skill];
                    setAssessmentData({ ...assessmentData, specificSkills: newSkills });
                  }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      assessmentData.specificSkills?.includes(skill) && styles.checkboxChecked,
                    ]}
                  >
                    {assessmentData.specificSkills?.includes(skill) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{skill}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How would you rate your current fitness level?</Text>
            <View style={styles.optionsContainer}>
              {ASSESSMENT_QUESTIONS.fitnessLevel.options.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionCard,
                    assessmentData.fitnessLevel === option.value && styles.optionCardSelected,
                  ]}
                  onPress={() =>
                    setAssessmentData({ ...assessmentData, fitnessLevel: option.value as FitnessLevel })
                  }
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What do you want to achieve?</Text>
            <Text style={styles.stepSubtitle}>Select up to 3 goals</Text>
            <View style={styles.checkboxContainer}>
              {[
                { value: 'overcome-fear', label: '🌊 Overcome fear of water' },
                { value: 'learn-basic', label: '🏊 Learn basic swimming for safety' },
                { value: 'improve-fitness', label: '💪 Improve fitness through swimming' },
                { value: 'master-technique', label: '🏆 Master proper technique' },
                { value: 'build-endurance', label: '⏱️ Build swimming endurance' },
                { value: 'learn-strokes', label: '🎓 Learn all four competitive strokes' },
                { value: 'train-competition', label: '🏃♂️ Train for triathlon/competition' },
                { value: 'family-activities', label: '👨👩👧 Participate in family activities' },
              ].map((goal) => {
                const goals = assessmentData.learningGoals || [];
                const isSelected = goals.includes(goal.value as any);
                const isDisabled = goals.length >= 3 && !isSelected;

                return (
                  <Pressable
                    key={goal.value}
                    style={[
                      styles.checkboxItem,
                      isSelected && styles.checkboxItemSelected,
                      isDisabled && styles.checkboxItemDisabled,
                    ]}
                    onPress={() => {
                      if (isDisabled) return;
                      const newGoals = isSelected
                        ? goals.filter((g) => g !== goal.value)
                        : [...goals, goal.value as any];
                      setAssessmentData({ ...assessmentData, learningGoals: newGoals });
                    }}
                    disabled={isDisabled}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxChecked,
                      ]}
                    >
                      {isSelected && <View style={styles.checkboxInner} />}
                    </View>
                    <Text style={[styles.checkboxLabel, isDisabled && styles.checkboxLabelDisabled]}>
                      {goal.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Where will you primarily practice?</Text>
            <View style={styles.optionsContainer}>
              {[
                { value: 'public-pool', emoji: '🏊', label: 'Public Pool', description: 'Lap pool with lanes' },
                { value: 'gym-pool', emoji: '🏨', label: 'Gym Pool', description: 'Smaller fitness center pool' },
                { value: 'home-pool', emoji: '🏡', label: 'Home Pool', description: 'Private backyard pool' },
                { value: 'open-water', emoji: '🌊', label: 'Open Water', description: 'Lake, ocean, river' },
                { value: 'varied', emoji: '🤔', label: 'Varied', description: 'Multiple locations' },
              ].map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionCard,
                    assessmentData.practiceEnvironment === option.value && styles.optionCardSelected,
                  ]}
                  onPress={() =>
                    setAssessmentData({ ...assessmentData, practiceEnvironment: option.value as any })
                  }
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 7:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How do you learn best?</Text>
            <Text style={styles.stepSubtitle}>Select all that apply</Text>
            <View style={styles.checkboxContainer}>
              {[
                '📹 Video demonstrations',
                '📝 Written instructions',
                '🎤 Audio coaching',
                '📊 Visual diagrams',
                '👥 Community interaction',
              ].map((pref) => (
                <Pressable
                  key={pref}
                  style={[
                    styles.checkboxItem,
                    assessmentData.learningPreferences?.includes(pref) && styles.checkboxItemSelected,
                  ]}
                  onPress={() => {
                    const prefs = assessmentData.learningPreferences || [];
                    const newPrefs = prefs.includes(pref)
                      ? prefs.filter((p) => p !== pref)
                      : [...prefs, pref];
                    setAssessmentData({ ...assessmentData, learningPreferences: newPrefs });
                  }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      assessmentData.learningPreferences?.includes(pref) && styles.checkboxChecked,
                    ]}
                  >
                    {assessmentData.learningPreferences?.includes(pref) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{pref}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Step {currentStep} of {TOTAL_STEPS}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentStep / TOTAL_STEPS) * 100}%` },
                ]}
              />
            </View>
          </View>
          {currentStep > 1 && (
            <Pressable onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text.secondary} />
            </Pressable>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={handleNext}
            style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === TOTAL_STEPS ? 'See Results' : 'Continue'}
            </Text>
            <View style={styles.arrowCircle}>
              <ArrowRight size={20} color={Colors.text.white} />
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background.white,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.black,
    borderRadius: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  stepContent: {
    gap: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    marginTop: -12,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionCardSelected: {
    borderColor: Colors.accent.black,
    backgroundColor: '#F0F0F0',
  },
  optionEmoji: {
    fontSize: 40,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  checkboxContainer: {
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  checkboxItemSelected: {
    borderColor: Colors.accent.black,
    backgroundColor: '#F0F0F0',
  },
  checkboxItemDisabled: {
    opacity: 0.4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: Colors.accent.black,
    backgroundColor: Colors.accent.black,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: Colors.text.white,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  checkboxLabelDisabled: {
    color: Colors.text.light,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: Colors.accent.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.white,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
