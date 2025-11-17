import { useRouter } from 'expo-router';
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { supabase, signUp, createUserProfile } from '@/utils/supabase';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

export default function AccountScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate input
      if (!name || !email || !password) {
        setError('Please fill in all fields');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // Create user account
      const { user } = await signUp(email, password);

      if (!user) {
        setError('Error creating account. Please try again.');
        return;
      }

      // Create user profile
      await createUserProfile({
        id: user.id,
        name,
        email,
        skill_level: null,
        current_module: null,
        completed_lessons: [],
        streak: 0,
        total_xp: 0,
        last_active: new Date().toISOString()
      });

      // Navigate to assessment
      router.push('/onboarding/assessment');
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create anonymous session
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: `guest_${Date.now()}@temporary.com`,
        password: crypto.randomUUID()
      });

      if (authError || !user) {
        throw new Error('Failed to create guest session');
      }

      // Create guest profile
      await createUserProfile({
        id: user.id,
        name: 'Guest User',
        email: null,
        skill_level: null,
        current_module: null,
        completed_lessons: [],
        streak: 0,
        total_xp: 0,
        last_active: new Date().toISOString()
      });

      // Navigate to assessment
      router.push('/onboarding/assessment');
    } catch (err) {
      console.error('Guest session error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Save your progress and access your personalized learning path
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <User size={20} color={Colors.text.secondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={Colors.text.light}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  testID="name-input"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Mail size={20} color={Colors.text.secondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={Colors.text.light}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  testID="email-input"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Lock size={20} color={Colors.text.secondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.text.light}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  testID="password-input"
                />
              </View>

              <Pressable 
                onPress={() => router.push('/auth/forgot-password')}
                style={styles.forgotPasswordLink}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <Pressable 
                onPress={handleContinue} 
                style={[
                  styles.continueButton,
                  isLoading && styles.buttonDisabled
                ]}
                disabled={isLoading}
              >
                <Text style={styles.continueButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
                <View style={styles.arrowCircle}>
                  <ArrowRight size={20} color={Colors.text.white} />
                </View>
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <Pressable 
                  style={[styles.socialButton, isLoading && styles.buttonDisabled]}
                  onPress={async () => {
                    try {
                      setIsLoading(true);
                      setError(null);
                      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: 'flipper://onboarding/assessment'
                        }
                      });
                      
                      if (signInError) throw signInError;
                      
                      // Profile will be created in the auth callback
                    } catch (err) {
                      console.error('Google sign in error:', err);
                      setError('Failed to sign in with Google');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.socialButton, isLoading && styles.buttonDisabled]}
                  onPress={async () => {
                    try {
                      setIsLoading(true);
                      setError(null);
                      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
                        provider: 'apple',
                        options: {
                          redirectTo: 'flipper://onboarding/assessment'
                        }
                      });
                      
                      if (signInError) throw signInError;
                      
                      // Profile will be created in the auth callback
                    } catch (err) {
                      console.error('Apple sign in error:', err);
                      setError('Failed to sign in with Apple');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  <Text style={styles.socialButtonText}>Continue with Apple</Text>
                </Pressable>
              </View>

              <Pressable onPress={handleGuest} style={styles.guestButton}>
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              </Pressable>

              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: Colors.text.primary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.accent.black,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 8,
    shadowColor: Colors.accent.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.ui.border,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.light,
    marginHorizontal: 16,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  guestButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  termsText: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.text.light,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  termsLink: {
    color: Colors.text.primary,
    fontWeight: '600' as const,
  },
});
