import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { resendVerificationEmail } from '@/utils/supabase';

export default function EmailConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = async () => {
    if (!params.email) {
      setError('Email address not found');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await resendVerificationEmail(params.email as string);
      setResendSuccess(true);
    } catch (err) {
      console.error('Resend verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Verify Your Email</Text>
          
          <Text style={styles.message}>
            We've sent a verification email to{' '}
            <Text style={styles.emailText}>{params.email}</Text>
          </Text>
          
          <Text style={styles.instructions}>
            Please check your email and click the verification link to complete your registration.
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {resendSuccess ? (
            <Text style={styles.successText}>
              Verification email has been resent. Please check your inbox.
            </Text>
          ) : (
            <Text style={styles.noEmailText}>
              Didn't receive the email?{' '}
              <Text
                onPress={handleResendEmail}
                style={[
                  styles.resendLink,
                  isLoading && styles.linkDisabled
                ]}
              >
                {isLoading ? 'Sending...' : 'Resend'}
              </Text>
            </Text>
          )}

          <Pressable
            onPress={() => router.replace('/onboarding/account')}
            style={styles.returnButton}
          >
            <Text style={styles.returnButtonText}>Return to Sign In</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  instructions: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  noEmailText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 32,
  },
  resendLink: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  linkDisabled: {
    opacity: 0.6,
  },
  returnButton: {
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: Colors.accent.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  returnButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.white,
  },
});