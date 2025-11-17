import { useRouter } from 'expo-router';
import { AlertTriangle, ChevronLeft, Phone, Shield } from 'lucide-react-native';
import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

type SafetyTopicProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  points: string[];
};

function SafetyTopic({ icon, title, description, points }: SafetyTopicProps) {
  return (
    <View style={styles.topicCard}>
      <View style={styles.topicHeader}>
        <View style={styles.topicIconContainer}>
          <Text>{icon}</Text>
        </View>
        <Text style={styles.topicTitle}>{title}</Text>
      </View>
      <Text style={styles.topicDescription}>{description}</Text>
      <View style={styles.pointsList}>
        {points.map((point, index) => (
          <View key={index} style={styles.pointItem}>
            <View style={styles.pointBullet} />
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SafetyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleEmergencyCall = () => {
    Linking.openURL('tel:911');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={Colors.accent.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Safety Resources</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emergencyCard}>
            <Shield size={32} color={Colors.accent.error} />
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>Your Safety First</Text>
              <Text style={styles.emergencyText}>
                Always prioritize your safety while learning to swim. Never practice alone and
                know your limits.
              </Text>
            </View>
          </View>

          <View style={styles.emergencyButtonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.emergencyButton,
                pressed && styles.emergencyButtonPressed,
              ]}
              onPress={handleEmergencyCall}
            >
              <Phone size={20} color={Colors.text.white} />
              <Text style={styles.emergencyButtonText}>Emergency: 911</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Critical Safety Information</Text>

            <SafetyTopic
              icon="🏊"
              title="Never Swim Alone"
              description="The buddy system is essential for water safety"
              points={[
                'Always practice with a friend, family member, or lifeguard present',
                'Ensure someone on deck is watching you at all times',
                'Know where lifeguards are stationed and their schedules',
                'Have a phone nearby in case of emergency',
                'Tell someone your practice schedule',
              ]}
            />

            <SafetyTopic
              icon="⚠️"
              title="Know Your Limits"
              description="Understand your abilities and progress gradually"
              points={[
                'Start in shallow water where you can stand comfortably',
                'Don\'t attempt skills beyond your current level',
                'Take breaks when feeling tired or cold',
                'Recognize signs of fatigue: heavy breathing, muscle weakness',
                'Exit the water immediately if experiencing any distress',
              ]}
            />

            <SafetyTopic
              icon="🚫"
              title="Pool Safety Rules"
              description="Essential rules for safe swimming practice"
              points={[
                'Never dive into shallow water (minimum 9 feet for diving)',
                'Read and follow all posted pool rules',
                'Stay in designated swimming areas',
                'Don\'t run on pool deck - wet surfaces are slippery',
                'Know where emergency exits and equipment are located',
                'Respect lane etiquette and other swimmers',
              ]}
            />

            <SafetyTopic
              icon="💨"
              title="Breathing Emergencies"
              description="What to do if you inhale water"
              points={[
                'Stay calm - most water aspiration resolves quickly',
                'Exit the water immediately',
                'Cough naturally to clear airways',
                'Breathe slowly and steadily',
                'Seek medical attention if: persistent coughing, chest pain, difficulty breathing, or any concerns',
                'Don\'t resume swimming until fully recovered',
              ]}
            />

            <SafetyTopic
              icon="😰"
              title="Panic Management"
              description="How to handle panic in water"
              points={[
                'Immediately switch to floating on your back',
                'Take slow, deep breaths to calm down',
                'Don\'t thrash or fight the water',
                'Signal for help by raising one arm',
                'Move slowly toward shallow water or pool edge',
                'It\'s okay to grab the wall or lane rope',
              ]}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Procedures</Text>
            
            <View style={styles.procedureCard}>
              <View style={styles.procedureHeader}>
                <AlertTriangle size={24} color={Colors.accent.error} />
                <Text style={styles.procedureTitle}>If Someone Is Drowning</Text>
              </View>
              <View style={styles.procedureSteps}>
                <View style={styles.procedureStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Call 911 immediately</Text>
                </View>
                <View style={styles.procedureStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Throw flotation device if available (ring buoy, rescue tube)
                  </Text>
                </View>
                <View style={styles.procedureStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Do NOT enter water unless you are a trained lifeguard
                  </Text>
                </View>
                <View style={styles.procedureStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.stepText}>
                    If victim is out of water, begin CPR if trained
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewText}>
                Review these safety guidelines regularly and before each practice session.
              </Text>
              <Text style={styles.reviewSubtext}>
                When in doubt, always err on the side of caution.
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  emergencyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.error,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  emergencyContent: {
    flex: 1,
    marginLeft: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  emergencyButtonContainer: {
    marginBottom: 32,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent.error,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.accent.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emergencyButtonPressed: {
    opacity: 0.8,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  topicCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  topicDescription: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  pointsList: {
    gap: 12,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent.black,
    marginTop: 7,
    marginRight: 12,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  procedureCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.error,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  procedureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  procedureTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  procedureSteps: {
    gap: 16,
  },
  procedureStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.white,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.primary,
    lineHeight: 20,
    paddingTop: 4,
  },
  reviewCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  reviewText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  reviewSubtext: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
