import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, TrendingUp, Award } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { formatXP } from '@/utils/gamification';

interface XPRewardToastProps {
  visible: boolean;
  amount: number;
  description: string;
  onHide?: () => void;
}

export default function XPRewardToast({
  visible,
  amount,
  description,
  onHide,
}: XPRewardToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: Platform.OS === 'ios' ? 60 : 20,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) {
        onHide();
      }
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient
        colors={[Colors.primary.turquoise, Colors.primary.coral]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <Star size={24} color={Colors.text.white} fill={Colors.text.white} strokeWidth={2} />
        </View>

        <View style={styles.content}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountPrefix}>+</Text>
            <Text style={styles.amountText}>{formatXP(amount)}</Text>
            <Text style={styles.xpLabel}>XP</Text>
            <View style={styles.trendingIconContainer}>
              <TrendingUp size={14} color={Colors.text.white} strokeWidth={3} />
            </View>
          </View>
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        </View>

        <View style={styles.decoration}>
          <Award size={16} color="rgba(255, 255, 255, 0.5)" strokeWidth={2} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    elevation: 9999,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  amountPrefix: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text.white,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.white,
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  trendingIconContainer: {
    marginLeft: 4,
  },
  description: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  decoration: {
    marginLeft: 8,
  },
});
