// Supabase Database Types
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string | null;
          email: string | null;
          skill_level: 'beginner-1' | 'beginner-2' | 'intermediate-1' | 'intermediate-2' | 'advanced' | null;
          current_module: string | null;
          completed_lessons: string[] | null;
          streak: number | null;
          total_xp: number | null;
          last_active: string | null;
          preferences: Json | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          name?: string | null;
          email?: string | null;
          skill_level?: 'beginner-1' | 'beginner-2' | 'intermediate-1' | 'intermediate-2' | 'advanced' | null;
          current_module?: string | null;
          completed_lessons?: string[] | null;
          streak?: number | null;
          total_xp?: number | null;
          last_active?: string | null;
          preferences?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string | null;
          email?: string | null;
          skill_level?: 'beginner-1' | 'beginner-2' | 'intermediate-1' | 'intermediate-2' | 'advanced' | null;
          current_module?: string | null;
          completed_lessons?: string[] | null;
          streak?: number | null;
          total_xp?: number | null;
          last_active?: string | null;
          preferences?: Json | null;
        };
      };
      assessment_data: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          water_comfort: 'very-uncomfortable' | 'uncomfortable' | 'neutral' | 'comfortable' | 'very-comfortable' | null;
          swimming_ability: 'non-swimmer' | 'beginner' | 'basic-swimmer' | 'intermediate' | 'advanced' | null;
          specific_skills: string[] | null;
          challenges: string[] | null;
          fitness_level: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'athlete' | null;
          physical_limitations: string[] | null;
          learning_goals: string[] | null;
          practice_environment: 'public-pool' | 'gym-pool' | 'home-pool' | 'open-water' | 'varied' | null;
          pool_access: number | null;
          session_duration: string | null;
          learning_preferences: string[] | null;
          timeline: string | null;
          commitment: number | null;
          completed: boolean | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          water_comfort?: 'very-uncomfortable' | 'uncomfortable' | 'neutral' | 'comfortable' | 'very-comfortable' | null;
          swimming_ability?: 'non-swimmer' | 'beginner' | 'basic-swimmer' | 'intermediate' | 'advanced' | null;
          specific_skills?: string[] | null;
          challenges?: string[] | null;
          fitness_level?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'athlete' | null;
          physical_limitations?: string[] | null;
          learning_goals?: string[] | null;
          practice_environment?: 'public-pool' | 'gym-pool' | 'home-pool' | 'open-water' | 'varied' | null;
          pool_access?: number | null;
          session_duration?: string | null;
          learning_preferences?: string[] | null;
          timeline?: string | null;
          commitment?: number | null;
          completed?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          water_comfort?: 'very-uncomfortable' | 'uncomfortable' | 'neutral' | 'comfortable' | 'very-comfortable' | null;
          swimming_ability?: 'non-swimmer' | 'beginner' | 'basic-swimmer' | 'intermediate' | 'advanced' | null;
          specific_skills?: string[] | null;
          challenges?: string[] | null;
          fitness_level?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'athlete' | null;
          physical_limitations?: string[] | null;
          learning_goals?: string[] | null;
          practice_environment?: 'public-pool' | 'gym-pool' | 'home-pool' | 'open-water' | 'varied' | null;
          pool_access?: number | null;
          session_duration?: string | null;
          learning_preferences?: string[] | null;
          timeline?: string | null;
          commitment?: number | null;
          completed?: boolean | null;
        };
      };
      journals: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          entry_type: 'text' | 'voice' | 'video';
          text_content: string | null;
          audio_url: string | null;
          video_url: string | null;
          ai_analysis: Json | null;
          sentiment_score: number | null;
          tags: string[] | null;
          is_private: boolean | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          entry_type: 'text' | 'voice' | 'video';
          text_content?: string | null;
          audio_url?: string | null;
          video_url?: string | null;
          ai_analysis?: Json | null;
          sentiment_score?: number | null;
          tags?: string[] | null;
          is_private?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          entry_type?: 'text' | 'voice' | 'video';
          text_content?: string | null;
          audio_url?: string | null;
          video_url?: string | null;
          ai_analysis?: Json | null;
          sentiment_score?: number | null;
          tags?: string[] | null;
          is_private?: boolean | null;
        };
      };
      lesson_feedback: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          created_at: string;
          feedback_type: 'too-easy' | 'just-right' | 'too-hard';
          comments: string | null;
          difficulty_rating: number | null;
          helpfulness_rating: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          created_at?: string;
          feedback_type: 'too-easy' | 'just-right' | 'too-hard';
          comments?: string | null;
          difficulty_rating?: number | null;
          helpfulness_rating?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          created_at?: string;
          feedback_type?: 'too-easy' | 'just-right' | 'too-hard';
          comments?: string | null;
          difficulty_rating?: number | null;
          helpfulness_rating?: number | null;
        };
      };
      scheduled_lessons: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          title: string;
          scheduled_date: string;
          scheduled_time: string;
          created_at: string;
          updated_at: string;
          notes: string | null;
          reminder_enabled: boolean | null;
          reminder_minutes: number | null;
          completed: boolean | null;
          completion_date: string | null;
          calendar_event_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          title: string;
          scheduled_date: string;
          scheduled_time: string;
          created_at?: string;
          updated_at?: string;
          notes?: string | null;
          reminder_enabled?: boolean | null;
          reminder_minutes?: number | null;
          completed?: boolean | null;
          completion_date?: string | null;
          calendar_event_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          title?: string;
          scheduled_date?: string;
          scheduled_time?: string;
          created_at?: string;
          updated_at?: string;
          notes?: string | null;
          reminder_enabled?: boolean | null;
          reminder_minutes?: number | null;
          completed?: boolean | null;
          completion_date?: string | null;
          calendar_event_id?: string | null;
        };
      };
      safety_checkins: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          pool_conditions: Json | null;
          gear_checklist: Json | null;
          environment_rating: number | null;
          notes: string | null;
          xp_earned: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          pool_conditions?: Json | null;
          gear_checklist?: Json | null;
          environment_rating?: number | null;
          notes?: string | null;
          xp_earned?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          pool_conditions?: Json | null;
          gear_checklist?: Json | null;
          environment_rating?: number | null;
          notes?: string | null;
          xp_earned?: number | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          achievement_type: string;
          title: string;
          description: string | null;
          xp_reward: number | null;
          unlocked: boolean | null;
          unlocked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          achievement_type: string;
          title: string;
          description?: string | null;
          xp_reward?: number | null;
          unlocked?: boolean | null;
          unlocked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          achievement_type?: string;
          title?: string;
          description?: string | null;
          xp_reward?: number | null;
          unlocked?: boolean | null;
          unlocked_at?: string | null;
        };
      };
      leaderboard: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          weekly_xp: number | null;
          monthly_xp: number | null;
          total_xp: number | null;
          streak: number | null;
          rank_weekly: number | null;
          rank_monthly: number | null;
          rank_all_time: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          weekly_xp?: number | null;
          monthly_xp?: number | null;
          total_xp?: number | null;
          streak?: number | null;
          rank_weekly?: number | null;
          rank_monthly?: number | null;
          rank_all_time?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          weekly_xp?: number | null;
          monthly_xp?: number | null;
          total_xp?: number | null;
          streak?: number | null;
          rank_weekly?: number | null;
          rank_monthly?: number | null;
          rank_all_time?: number | null;
        };
      };
      skill_progress: {
        Row: {
          id: string;
          user_id: string;
          skill_name: string;
          created_at: string;
          updated_at: string;
          progress_percentage: number | null;
          level: 'beginner' | 'intermediate' | 'advanced' | 'master' | null;
          last_assessment_date: string | null;
          next_assessment_date: string | null;
          mastery_notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_name: string;
          created_at?: string;
          updated_at?: string;
          progress_percentage?: number | null;
          level?: 'beginner' | 'intermediate' | 'advanced' | 'master' | null;
          last_assessment_date?: string | null;
          next_assessment_date?: string | null;
          mastery_notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_name?: string;
          created_at?: string;
          updated_at?: string;
          progress_percentage?: number | null;
          level?: 'beginner' | 'intermediate' | 'advanced' | 'master' | null;
          last_assessment_date?: string | null;
          next_assessment_date?: string | null;
          mastery_notes?: string | null;
        };
      };
      learning_profiles: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
          preferred_pace: 'slow' | 'moderate' | 'fast' | 'adaptive';
          focus_areas: string[];
          strength_areas: string[];
          last_assessment_date: string | null;
          comprehension_level: number;
          engagement_level: number;
          practice_efficiency: number;
          adaptivity_score: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
          preferred_pace: 'slow' | 'moderate' | 'fast' | 'adaptive';
          focus_areas?: string[];
          strength_areas?: string[];
          last_assessment_date?: string | null;
          comprehension_level?: number;
          engagement_level?: number;
          practice_efficiency?: number;
          adaptivity_score?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
          preferred_pace?: 'slow' | 'moderate' | 'fast' | 'adaptive';
          focus_areas?: string[];
          strength_areas?: string[];
          last_assessment_date?: string | null;
          comprehension_level?: number;
          engagement_level?: number;
          practice_efficiency?: number;
          adaptivity_score?: number;
        };
      };
      adaptive_progress: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          lesson_id: string;
          learning_path_progress: number;
          comprehension_score: number;
          engagement_score: number;
          practice_efficiency: number;
          difficulty_rating: number;
          adaptivity_metrics: Json;
          recommendations: string[];
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          lesson_id: string;
          learning_path_progress?: number;
          comprehension_score?: number;
          engagement_score?: number;
          practice_efficiency?: number;
          difficulty_rating?: number;
          adaptivity_metrics?: Json;
          recommendations?: string[];
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          lesson_id?: string;
          learning_path_progress?: number;
          comprehension_score?: number;
          engagement_score?: number;
          practice_efficiency?: number;
          difficulty_rating?: number;
          adaptivity_metrics?: Json;
          recommendations?: string[];
        };
      };
      learning_path_recommendations: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          next_lessons: string[];
          practice_suggestions: string[];
          focus_areas: string[];
          estimated_time_to_mastery: number;
          confidence_building_activities: string[];
          personalized_goals: string[];
          recommended_resources: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          next_lessons?: string[];
          practice_suggestions?: string[];
          focus_areas?: string[];
          estimated_time_to_mastery?: number;
          confidence_building_activities?: string[];
          personalized_goals?: string[];
          recommended_resources?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          next_lessons?: string[];
          practice_suggestions?: string[];
          focus_areas?: string[];
          estimated_time_to_mastery?: number;
          confidence_building_activities?: string[];
          personalized_goals?: string[];
          recommended_resources?: Json;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}