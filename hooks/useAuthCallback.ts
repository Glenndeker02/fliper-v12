import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase, createUserProfile } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthCallback = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const handleAuthStateChange = async () => {
      try {
        // If we have a new user from OAuth
        if (user && segments[0] === 'onboarding' && segments[1] !== 'assessment') {
          // Create profile for OAuth user if they don't have one
          try {
            await createUserProfile({
              id: user.id,
              name: user.user_metadata?.full_name || user.user_metadata?.name || 'New User',
              email: user.email,
              skill_level: null,
              current_module: null,
              completed_lessons: [],
              streak: 0,
              total_xp: 0,
              last_active: new Date().toISOString()
            });
          } catch (error: any) {
            // If error is about duplicate key, profile already exists
            if (!error.message?.includes('duplicate key')) {
              console.error('Error creating user profile:', error);
            }
          }

          // Redirect to assessment
          router.replace('/onboarding/assessment');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
      }
    };

    handleAuthStateChange();
  }, [user, isLoading, segments, router]);
};

export default useAuthCallback;