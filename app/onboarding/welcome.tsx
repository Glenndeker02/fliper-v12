import { useRouter } from 'expo-router';
import { ArrowRight, Droplets, Target, Users, Video } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CarouselSlide {
  id: number;
  headline: string;
  description: string;
  icon: React.ReactNode;
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    headline: 'Never Too Late to Learn',
    description: 'Over 180,000 people drown annually worldwide. Swimming isn\'t just recreation—it\'s a life skill. Start your journey today.',
    icon: <Droplets size={64} color={Colors.accent.black} strokeWidth={1.5} />,
  },
  {
    id: 2,
    headline: 'Learn at Your Own Pace',
    description: 'Progressive lessons, expert demonstrations, and dryland training—all designed to take you from nervous beginner to confident swimmer.',
    icon: <Target size={64} color={Colors.accent.black} strokeWidth={1.5} />,
  },
  {
    id: 3,
    headline: 'Everything You Need',
    description: 'Video lessons, dryland training, skill tracking, and community support—all in one app.',
    icon: <Video size={64} color={Colors.accent.black} strokeWidth={1.5} />,
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setCurrentSlide(slideIndex);
      },
    }
  );

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentSlide + 1) * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      router.push('/onboarding/account');
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/account');
  };

  return (
    <LinearGradient
      colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {slides.map((slide) => (
            <View key={slide.id} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              <View style={styles.slideContent}>
                <View style={styles.iconContainer}>
                  <View style={styles.iconCircle}>
                    {slide.icon}
                  </View>
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.headline}>{slide.headline}</Text>
                  <Text style={styles.description}>{slide.description}</Text>
                </View>

                {slide.id === 3 && (
                  <View style={styles.featuresGrid}>
                    <View style={styles.featureCard}>
                      <Video size={24} color={Colors.accent.black} />
                      <Text style={styles.featureTitle}>Video Lessons</Text>
                      <Text style={styles.featureText}>Multi-angle demos</Text>
                    </View>
                    <View style={styles.featureCard}>
                      <Users size={24} color={Colors.accent.black} />
                      <Text style={styles.featureTitle}>Dryland Training</Text>
                      <Text style={styles.featureText}>Build strength</Text>
                    </View>
                    <View style={styles.featureCard}>
                      <Target size={24} color={Colors.accent.black} />
                      <Text style={styles.featureTitle}>Skill Tracking</Text>
                      <Text style={styles.featureText}>Monitor progress</Text>
                    </View>
                    <View style={styles.featureCard}>
                      <Users size={24} color={Colors.accent.black} />
                      <Text style={styles.featureTitle}>Community</Text>
                      <Text style={styles.featureText}>Connect & learn</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {slides.map((_, index) => {
              const inputRange = [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ];

              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.paginationDot,
                    {
                      width: dotWidth,
                      opacity,
                    },
                  ]}
                />
              );
            })}
          </View>

          <Pressable onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 32,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    gap: 16,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 32,
    justifyContent: 'center',
  },
  featureCard: {
    width: (SCREEN_WIDTH - 88) / 2,
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    gap: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.black,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
