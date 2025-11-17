-- ============================================================================
-- SWIMEASE COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This is the MASTER schema file that consolidates ALL database tables,
-- functions, triggers, policies, and storage configurations for the
-- SwimEase swimming learning application.
--
-- Last Updated: 2025-11-17
-- Version: 1.0
-- ============================================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- SECTION 1: CORE USER & AUTHENTICATION TABLES
-- ============================================================================

-- User Profiles Table - Core user data and gamification state
create table if not exists user_profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  email text,
  avatar_url text,
  bio text,

  -- Swimming skill tracking
  skill_level text check (skill_level in ('beginner-1', 'beginner-2', 'intermediate-1', 'intermediate-2', 'advanced')),
  current_module text,
  completed_lessons text[],

  -- Gamification
  streak integer default 0,
  longest_streak integer default 0,
  total_xp integer default 0,
  current_level integer default 1,
  last_active date,

  -- Preferences
  preferences jsonb,
  scheduling_preferences jsonb,
  notification_preferences jsonb,

  -- Privacy
  is_public boolean default true,
  show_leaderboard boolean default true
);

-- Assessment Data Table - User onboarding and skill assessment
create table if not exists assessment_data (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  assessment_type text check (assessment_type in ('onboarding', 'reassessment', 'skill-check')) default 'onboarding',

  -- Water comfort and swimming ability
  water_comfort text check (water_comfort in ('very-uncomfortable', 'uncomfortable', 'neutral', 'comfortable', 'very-comfortable')),
  swimming_ability text check (swimming_ability in ('non-swimmer', 'beginner', 'basic-swimmer', 'intermediate', 'advanced')),
  specific_skills text[],
  challenges text[],

  -- Fitness and physical state
  fitness_level text check (fitness_level in ('sedentary', 'lightly-active', 'moderately-active', 'very-active', 'athlete')),
  physical_limitations text[],
  medical_considerations text[],

  -- Learning context
  learning_goals text[],
  practice_environment text check (practice_environment in ('public-pool', 'gym-pool', 'home-pool', 'open-water', 'varied')),
  pool_access integer,
  session_duration text,

  -- Learning preferences
  learning_preferences text[],
  timeline text,
  commitment integer,

  completed boolean default false,
  score jsonb
);

-- ============================================================================
-- SECTION 2: LEARNING & PROGRESS TRACKING
-- ============================================================================

-- Lesson Progress Table - Detailed lesson completion tracking
create table if not exists lesson_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  lesson_id text not null,
  module_id integer not null,
  skill_level text check (skill_level in ('beginner-1', 'beginner-2', 'intermediate-1', 'intermediate-2', 'advanced')) not null,
  completion_date timestamp with time zone not null,
  performance text check (performance in ('excellent', 'good', 'needs_practice')) not null,
  feedback text[],
  time_spent integer not null,
  confidence integer check (confidence >= 1 and confidence <= 5) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Metrics
  attempts integer default 1,
  retry_count integer default 0,
  skipped boolean default false,
  xp_earned integer default 0
);

-- Skill Progress Table - Individual skill mastery tracking
create table if not exists skill_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  skill_name text not null,
  category text check (category in ('breathing', 'floating', 'kicking', 'arm-strokes', 'diving', 'endurance', 'safety')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  progress_percentage integer check (progress_percentage >= 0 and progress_percentage <= 100) default 0,
  level text check (level in ('beginner', 'intermediate', 'advanced', 'master')) default 'beginner',
  last_assessment_date timestamp with time zone,
  next_assessment_date timestamp with time zone,
  mastery_notes text,
  practice_count integer default 0,

  unique(user_id, skill_name)
);

-- Lesson Feedback Table - User feedback on lesson experience
create table if not exists lesson_feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  lesson_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  feedback_type text check (feedback_type in ('too-easy', 'just-right', 'too-hard')) not null,
  comments text,
  difficulty_rating integer check (difficulty_rating >= 1 and difficulty_rating <= 5),
  helpfulness_rating integer check (helpfulness_rating >= 1 and helpfulness_rating <= 5),
  technical_quality_rating integer check (technical_quality_rating >= 1 and technical_quality_rating <= 5),
  would_recommend boolean
);

-- ============================================================================
-- SECTION 3: ADAPTIVE LEARNING SYSTEM
-- ============================================================================

-- Learning Profiles Table - User learning style and preferences
create table if not exists learning_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Learning style
  learning_style text check (learning_style in ('visual', 'auditory', 'kinesthetic', 'mixed')) not null,
  preferred_pace text check (preferred_pace in ('slow', 'moderate', 'fast', 'adaptive')) not null,

  -- Focus areas
  focus_areas text[],
  strength_areas text[],
  improvement_areas text[],

  -- Metrics
  last_assessment_date timestamp with time zone,
  comprehension_level numeric(3,2),
  engagement_level numeric(3,2),
  practice_efficiency numeric(3,2),
  adaptivity_score numeric(3,2),

  -- Pattern detection
  optimal_session_length integer,
  best_time_of_day text,
  retention_rate numeric(3,2),

  unique(user_id)
);

-- Adaptive Progress Table - Lesson-by-lesson adaptive metrics
create table if not exists adaptive_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  lesson_id text not null,

  -- Progress metrics
  learning_path_progress numeric(5,2),
  comprehension_score numeric(3,2),
  engagement_score numeric(3,2),
  practice_efficiency numeric(3,2),
  difficulty_rating integer check (difficulty_rating >= 1 and difficulty_rating <= 5),

  -- Adaptive data
  adaptivity_metrics jsonb,
  recommendations text[],
  next_suggested_lesson text,
  estimated_completion_time integer
);

-- Learning Path Recommendations Table - Personalized learning paths
create table if not exists learning_path_recommendations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Recommendations
  next_lessons text[],
  practice_suggestions text[],
  focus_areas text[],
  estimated_time_to_mastery integer,
  confidence_building_activities text[],
  personalized_goals text[],
  recommended_resources jsonb,

  -- Algorithm metadata
  algorithm_version text,
  confidence_score numeric(3,2),

  unique(user_id)
);

-- ============================================================================
-- SECTION 4: SCHEDULING & CALENDAR
-- ============================================================================

-- Scheduled Lessons Table - Calendar scheduling with reminders
create table if not exists scheduled_lessons (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  lesson_id text not null,
  title text not null,
  skill_level text check (skill_level in ('beginner-1', 'beginner-2', 'intermediate-1', 'intermediate-2', 'advanced')) not null,
  module_id integer not null,
  lesson_type text check (lesson_type in ('pool', 'dryland')) not null,

  -- Scheduling
  scheduled_date date not null,
  scheduled_time time not null,
  duration integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Reminders
  reminder_enabled boolean default true,
  reminder_minutes integer default 30,
  reminder_sent boolean default false,

  -- Status tracking
  status text check (status in ('scheduled', 'completed', 'missed', 'cancelled')) default 'scheduled',
  completion_date timestamp with time zone,

  -- Additional data
  notes text,
  location text,
  rescheduled_from uuid references scheduled_lessons(id),
  rescheduled_reason text,
  calendar_event_id text,
  recurring_event_id text,
  recurrence_rule text
);

-- ============================================================================
-- SECTION 5: JOURNAL & REFLECTION
-- ============================================================================

-- Journals Table - User journal entries with AI analysis
create table if not exists journals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Entry content
  entry_type text check (entry_type in ('text', 'voice', 'video')) not null,
  title text,
  text_content text,
  audio_url text,
  video_url text,
  duration integer,

  -- AI analysis
  ai_analysis jsonb,
  sentiment_score numeric(3,2),
  sentiment_label text check (sentiment_label in ('very-negative', 'negative', 'neutral', 'positive', 'very-positive')),
  themes text[],
  tags text[],
  key_insights text[],

  -- Metadata
  is_private boolean default false,
  linked_lesson_id text,
  linked_session_id uuid,
  word_count integer,
  read_time integer
);

-- ============================================================================
-- SECTION 6: SAFETY & WELLNESS
-- ============================================================================

-- Safety Check-ins Table - Pre-swim safety checklist
create table if not exists safety_checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Pool conditions
  pool_conditions jsonb,
  water_temperature numeric(4,1),
  crowding_level integer check (crowding_level >= 1 and crowding_level <= 5),

  -- Personal gear
  gear_checklist jsonb,
  gear_complete boolean,

  -- Environment
  environment_rating integer check (environment_rating >= 1 and environment_rating <= 5),
  lifeguard_present boolean,
  swim_buddy_present boolean,

  -- Notes and rewards
  notes text,
  location text,
  xp_earned integer default 5,

  -- Session link
  linked_session_id uuid
);

-- ============================================================================
-- SECTION 7: GAMIFICATION
-- ============================================================================

-- Achievements Table - User unlocked badges and achievements
create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Achievement details
  achievement_id text not null,
  achievement_type text check (achievement_type in ('learning', 'practice', 'streak', 'social', 'mastery', 'milestone')) not null,
  tier text check (tier in ('bronze', 'silver', 'gold', 'platinum')) default 'bronze',
  title text not null,
  description text,

  -- Unlock details
  unlocked boolean default false,
  unlocked_at timestamp with time zone,
  xp_reward integer default 0,

  -- Progress
  current_progress integer default 0,
  required_progress integer,

  unique(user_id, achievement_id)
);

-- Leaderboard Table - Competitive XP rankings
create table if not exists leaderboard (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- XP tracking
  weekly_xp integer default 0,
  monthly_xp integer default 0,
  total_xp integer default 0,

  -- Streak
  streak integer default 0,
  longest_streak integer default 0,

  -- Rankings
  rank_weekly integer,
  rank_monthly integer,
  rank_all_time integer,

  -- Period tracking
  current_week_start date,
  current_month_start date,

  unique(user_id)
);

-- XP Transactions Table - Track all XP rewards and penalties
create table if not exists xp_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Transaction details
  amount integer not null,
  transaction_type text check (transaction_type in ('lesson_complete', 'achievement_unlock', 'streak_bonus', 'safety_checkin', 'journal_entry', 'community_post', 'daily_bonus', 'referral', 'manual_adjustment')) not null,
  reason text,

  -- Context
  linked_entity_type text,
  linked_entity_id uuid,

  -- Multipliers
  multiplier numeric(3,2) default 1.0,
  bonus_applied boolean default false
);

-- ============================================================================
-- SECTION 8: COMMUNITY & SOCIAL FEATURES
-- ============================================================================

-- Community Posts Table - User social posts
create table if not exists community_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Content
  content text not null,
  media_url text,
  media_type text check (media_type in ('image', 'video', 'none')) default 'none',

  -- Categorization
  post_type text check (post_type in ('achievement', 'progress', 'question', 'general')) default 'general',
  tags text[],

  -- Engagement
  likes_count integer default 0,
  comments_count integer default 0,
  shares_count integer default 0,
  views_count integer default 0,

  -- Moderation
  is_edited boolean default false,
  is_reported boolean default false,
  is_flagged boolean default false,
  is_verified boolean default false,

  -- Privacy
  visibility text check (visibility in ('public', 'followers', 'private')) default 'public',

  -- Metadata
  metadata jsonb,
  linked_achievement_id text,
  linked_lesson_id text
);

-- Post Comments Table - Comments on community posts
create table if not exists post_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references community_posts(id) on delete cascade not null,
  user_id uuid references user_profiles(id) on delete cascade not null,
  parent_comment_id uuid references post_comments(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Content
  content text not null,

  -- Engagement
  likes_count integer default 0,

  -- Moderation
  is_edited boolean default false,
  is_reported boolean default false,
  is_flagged boolean default false
);

-- Post Likes Table - Like tracking for posts
create table if not exists post_likes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references community_posts(id) on delete cascade not null,
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(post_id, user_id)
);

-- Comment Likes Table - Like tracking for comments
create table if not exists comment_likes (
  id uuid primary key default uuid_generate_v4(),
  comment_id uuid references post_comments(id) on delete cascade not null,
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(comment_id, user_id)
);

-- User Follows Table - User follow relationships
create table if not exists user_follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid references user_profiles(id) on delete cascade not null,
  following_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  notification_enabled boolean default true,

  unique(follower_id, following_id),
  check (follower_id != following_id)
);

-- Post Reports Table - Content moderation reports
create table if not exists post_reports (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references community_posts(id) on delete cascade not null,
  reported_by uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Report details
  reason text check (reason in ('spam', 'inappropriate', 'harassment', 'misinformation', 'other')) not null,
  description text,

  -- Moderation
  status text check (status in ('pending', 'reviewed', 'actioned', 'dismissed')) default 'pending',
  reviewed_at timestamp with time zone,
  reviewed_by uuid references user_profiles(id),
  moderator_notes text,
  action_taken text
);

-- ============================================================================
-- SECTION 9: Q&A FORUM
-- ============================================================================

-- Forum Topics Table - Q&A forum topics
create table if not exists forum_topics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Content
  title text not null,
  content text not null,

  -- Categorization
  category text check (category in ('beginner', 'technique', 'safety', 'equipment', 'training', 'general')) not null,
  tags text[],

  -- Q&A specific
  is_answered boolean default false,
  best_answer_id uuid,

  -- Moderation
  is_pinned boolean default false,
  is_locked boolean default false,
  is_reported boolean default false,

  -- Engagement
  views_count integer default 0,
  replies_count integer default 0,
  votes_count integer default 0,

  -- Activity tracking
  last_activity_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_reply_at timestamp with time zone,
  last_reply_by uuid references user_profiles(id)
);

-- Forum Replies Table - Replies to forum topics
create table if not exists forum_replies (
  id uuid primary key default uuid_generate_v4(),
  topic_id uuid references forum_topics(id) on delete cascade not null,
  user_id uuid references user_profiles(id) on delete cascade not null,
  parent_reply_id uuid references forum_replies(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Content
  content text not null,

  -- Q&A specific
  is_best_answer boolean default false,

  -- Engagement
  votes_count integer default 0,

  -- Moderation
  is_edited boolean default false,
  is_reported boolean default false,
  is_flagged boolean default false
);

-- Forum Topic Votes Table - Upvote/downvote for topics
create table if not exists forum_topic_votes (
  id uuid primary key default uuid_generate_v4(),
  topic_id uuid references forum_topics(id) on delete cascade not null,
  user_id uuid references user_profiles(id) on delete cascade not null,
  vote_type text check (vote_type in ('upvote', 'downvote')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(topic_id, user_id)
);

-- Forum Reply Votes Table - Upvote/downvote for replies
create table if not exists forum_reply_votes (
  id uuid primary key default uuid_generate_v4(),
  reply_id uuid references forum_replies(id) on delete cascade not null,
  user_id uuid references user_profiles(id) on delete cascade not null,
  vote_type text check (vote_type in ('upvote', 'downvote')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(reply_id, user_id)
);

-- ============================================================================
-- SECTION 10: SUBSCRIPTION & PAYMENTS
-- ============================================================================

-- User Subscriptions Table - RevenueCat subscription management
create table if not exists user_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Subscription details
  subscription_tier text check (subscription_tier in ('free', 'premium', 'pro')) default 'free' not null,
  subscription_status text check (subscription_status in ('active', 'expired', 'cancelled', 'in_trial', 'none')) default 'none' not null,
  subscription_period text check (subscription_period in ('monthly', 'yearly')),

  -- Dates
  started_at timestamp with time zone,
  expires_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  trial_ends_at timestamp with time zone,

  -- RevenueCat integration
  revenue_cat_user_id text not null,
  revenue_cat_entitlement_id text,
  revenue_cat_product_id text,

  -- Billing
  last_payment_date timestamp with time zone,
  next_billing_date timestamp with time zone,

  -- Metadata
  metadata jsonb,

  unique(user_id)
);

-- Subscription History Table - Audit trail of subscription changes
create table if not exists subscription_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Event details
  event_type text check (event_type in ('purchase', 'upgrade', 'downgrade', 'renewal', 'cancellation', 'expiration', 'trial_start', 'trial_end', 'refund')) not null,
  from_tier text check (from_tier in ('free', 'premium', 'pro')),
  to_tier text check (to_tier in ('free', 'premium', 'pro')) not null,

  -- Subscription details at time of event
  subscription_period text check (subscription_period in ('monthly', 'yearly')),
  amount numeric(10, 2),
  currency text default 'USD',

  -- RevenueCat details
  revenue_cat_transaction_id text,
  revenue_cat_receipt_id text,

  -- Metadata
  metadata jsonb,
  reason text
);

-- Subscription Usage Table - Monthly usage tracking for limits
create table if not exists subscription_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Usage period
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,

  -- Community usage
  posts_created integer default 0,
  comments_created integer default 0,

  -- Journal usage
  journal_entries_created integer default 0,
  voice_journal_entries integer default 0,
  video_journal_entries integer default 0,

  -- AI usage
  ai_feedback_requests integer default 0,
  ai_coaching_requests integer default 0,
  ai_analysis_requests integer default 0,

  -- Content access
  lessons_accessed integer default 0,
  dryland_accessed integer default 0,
  premium_lessons_accessed integer default 0,

  -- Feature usage
  offline_downloads integer default 0,
  custom_routines_created integer default 0,

  unique(user_id, period_start)
);

-- ============================================================================
-- SECTION 11: MARKETPLACE & SHOPPING
-- ============================================================================

-- Marketplace Products Table - Swimming gear product catalog
create table if not exists marketplace_products (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Product details
  title text not null,
  description text,
  category text check (category in ('goggles', 'swimwear', 'caps', 'fins', 'kickboards', 'pull-buoys', 'paddles', 'snorkels', 'gear-bags', 'accessories', 'training-aids', 'safety-equipment')) not null,
  sub_category text,
  brand text,

  -- External integration
  source text check (source in ('amazon', 'ebay', 'custom')) not null,
  external_product_id text,
  affiliate_link text not null,
  product_url text not null,

  -- Pricing (informational, actual price from external site)
  price_min numeric(10, 2),
  price_max numeric(10, 2),
  currency text default 'USD',

  -- Media
  image_url text,
  images text[],

  -- Metadata
  rating numeric(2,1),
  review_count integer default 0,
  is_featured boolean default false,
  is_active boolean default true,
  priority integer default 0,

  -- Search optimization
  keywords text[],
  tags text[],

  -- Recommendations
  recommended_for_skill_level text[],
  recommended_for_category text[]
);

-- Marketplace User Favorites Table - User saved products
create table if not exists marketplace_favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  product_id uuid references marketplace_products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text,

  unique(user_id, product_id)
);

-- Marketplace Click Tracking Table - Analytics for affiliate links
create table if not exists marketplace_clicks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade,
  product_id uuid references marketplace_products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Tracking
  clicked_link text not null,
  source_page text,
  user_agent text,
  ip_address inet,

  -- Conversion tracking
  converted boolean default false,
  conversion_date timestamp with time zone
);

-- Marketplace Product Reviews Table - User reviews (if not using external)
create table if not exists marketplace_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  product_id uuid references marketplace_products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Review content
  rating integer check (rating >= 1 and rating <= 5) not null,
  title text,
  review text not null,

  -- Verification
  verified_purchase boolean default false,

  -- Engagement
  helpful_count integer default 0,

  -- Moderation
  is_flagged boolean default false,
  is_approved boolean default true,

  unique(user_id, product_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Core user indexes
create index if not exists idx_user_profiles_id on user_profiles(id);
create index if not exists idx_user_profiles_email on user_profiles(email);
create index if not exists idx_user_profiles_skill_level on user_profiles(skill_level);
create index if not exists idx_user_profiles_last_active on user_profiles(last_active);

-- Assessment indexes
create index if not exists idx_assessment_data_user_id on assessment_data(user_id);
create index if not exists idx_assessment_data_type on assessment_data(assessment_type);

-- Learning progress indexes
create index if not exists idx_lesson_progress_user_id on lesson_progress(user_id);
create index if not exists idx_lesson_progress_lesson_id on lesson_progress(lesson_id);
create index if not exists idx_lesson_progress_completion_date on lesson_progress(completion_date);

create index if not exists idx_skill_progress_user_id on skill_progress(user_id);
create index if not exists idx_skill_progress_skill_name on skill_progress(skill_name);
create index if not exists idx_skill_progress_category on skill_progress(category);

create index if not exists idx_lesson_feedback_user_id on lesson_feedback(user_id);
create index if not exists idx_lesson_feedback_lesson_id on lesson_feedback(lesson_id);

-- Adaptive learning indexes
create index if not exists idx_learning_profiles_user_id on learning_profiles(user_id);
create index if not exists idx_adaptive_progress_user_id on adaptive_progress(user_id);
create index if not exists idx_adaptive_progress_lesson_id on adaptive_progress(lesson_id);
create index if not exists idx_learning_path_recommendations_user_id on learning_path_recommendations(user_id);

-- Scheduling indexes
create index if not exists idx_scheduled_lessons_user_id on scheduled_lessons(user_id);
create index if not exists idx_scheduled_lessons_date on scheduled_lessons(scheduled_date);
create index if not exists idx_scheduled_lessons_status on scheduled_lessons(status);
create index if not exists idx_scheduled_lessons_skill_level on scheduled_lessons(skill_level);

-- Journal indexes
create index if not exists idx_journals_user_id on journals(user_id);
create index if not exists idx_journals_created_at on journals(created_at desc);
create index if not exists idx_journals_entry_type on journals(entry_type);
create index if not exists idx_journals_tags on journals using gin(tags);

-- Safety indexes
create index if not exists idx_safety_checkins_user_id on safety_checkins(user_id);
create index if not exists idx_safety_checkins_created_at on safety_checkins(created_at desc);

-- Gamification indexes
create index if not exists idx_achievements_user_id on achievements(user_id);
create index if not exists idx_achievements_type on achievements(achievement_type);
create index if not exists idx_achievements_unlocked on achievements(unlocked);

create index if not exists idx_leaderboard_user_id on leaderboard(user_id);
create index if not exists idx_leaderboard_weekly_xp on leaderboard(weekly_xp desc);
create index if not exists idx_leaderboard_monthly_xp on leaderboard(monthly_xp desc);
create index if not exists idx_leaderboard_total_xp on leaderboard(total_xp desc);

create index if not exists idx_xp_transactions_user_id on xp_transactions(user_id);
create index if not exists idx_xp_transactions_created_at on xp_transactions(created_at desc);
create index if not exists idx_xp_transactions_type on xp_transactions(transaction_type);

-- Community indexes
create index if not exists idx_community_posts_user_id on community_posts(user_id);
create index if not exists idx_community_posts_created_at on community_posts(created_at desc);
create index if not exists idx_community_posts_post_type on community_posts(post_type);
create index if not exists idx_community_posts_visibility on community_posts(visibility);
create index if not exists idx_community_posts_tags on community_posts using gin(tags);

create index if not exists idx_post_comments_post_id on post_comments(post_id);
create index if not exists idx_post_comments_user_id on post_comments(user_id);
create index if not exists idx_post_comments_parent_id on post_comments(parent_comment_id);

create index if not exists idx_post_likes_post_id on post_likes(post_id);
create index if not exists idx_post_likes_user_id on post_likes(user_id);

create index if not exists idx_comment_likes_comment_id on comment_likes(comment_id);

create index if not exists idx_user_follows_follower_id on user_follows(follower_id);
create index if not exists idx_user_follows_following_id on user_follows(following_id);

create index if not exists idx_post_reports_status on post_reports(status);

-- Forum indexes
create index if not exists idx_forum_topics_user_id on forum_topics(user_id);
create index if not exists idx_forum_topics_category on forum_topics(category);
create index if not exists idx_forum_topics_created_at on forum_topics(created_at desc);
create index if not exists idx_forum_topics_last_activity on forum_topics(last_activity_at desc);
create index if not exists idx_forum_topics_is_answered on forum_topics(is_answered);
create index if not exists idx_forum_topics_tags on forum_topics using gin(tags);

create index if not exists idx_forum_replies_topic_id on forum_replies(topic_id);
create index if not exists idx_forum_replies_user_id on forum_replies(user_id);

create index if not exists idx_forum_topic_votes_topic_id on forum_topic_votes(topic_id);
create index if not exists idx_forum_reply_votes_reply_id on forum_reply_votes(reply_id);

-- Subscription indexes
create index if not exists idx_user_subscriptions_user_id on user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_tier on user_subscriptions(subscription_tier);
create index if not exists idx_user_subscriptions_status on user_subscriptions(subscription_status);
create index if not exists idx_user_subscriptions_expires_at on user_subscriptions(expires_at);

create index if not exists idx_subscription_history_user_id on subscription_history(user_id);
create index if not exists idx_subscription_history_event_type on subscription_history(event_type);
create index if not exists idx_subscription_history_created_at on subscription_history(created_at desc);

create index if not exists idx_subscription_usage_user_id on subscription_usage(user_id);
create index if not exists idx_subscription_usage_period on subscription_usage(period_start, period_end);

-- Marketplace indexes
create index if not exists idx_marketplace_products_category on marketplace_products(category);
create index if not exists idx_marketplace_products_source on marketplace_products(source);
create index if not exists idx_marketplace_products_is_featured on marketplace_products(is_featured);
create index if not exists idx_marketplace_products_priority on marketplace_products(priority desc);
create index if not exists idx_marketplace_products_tags on marketplace_products using gin(tags);

create index if not exists idx_marketplace_favorites_user_id on marketplace_favorites(user_id);
create index if not exists idx_marketplace_favorites_product_id on marketplace_favorites(product_id);

create index if not exists idx_marketplace_clicks_user_id on marketplace_clicks(user_id);
create index if not exists idx_marketplace_clicks_product_id on marketplace_clicks(product_id);
create index if not exists idx_marketplace_clicks_created_at on marketplace_clicks(created_at desc);

create index if not exists idx_marketplace_reviews_product_id on marketplace_reviews(product_id);
create index if not exists idx_marketplace_reviews_user_id on marketplace_reviews(user_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Universal updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
create trigger update_user_profiles_updated_at before update on user_profiles for each row execute procedure update_updated_at_column();
create trigger update_journals_updated_at before update on journals for each row execute procedure update_updated_at_column();
create trigger update_scheduled_lessons_updated_at before update on scheduled_lessons for each row execute procedure update_updated_at_column();
create trigger update_skill_progress_updated_at before update on skill_progress for each row execute procedure update_updated_at_column();
create trigger update_leaderboard_updated_at before update on leaderboard for each row execute procedure update_updated_at_column();
create trigger update_learning_profiles_updated_at before update on learning_profiles for each row execute procedure update_updated_at_column();
create trigger update_learning_path_recommendations_updated_at before update on learning_path_recommendations for each row execute procedure update_updated_at_column();
create trigger update_community_posts_updated_at before update on community_posts for each row execute procedure update_updated_at_column();
create trigger update_post_comments_updated_at before update on post_comments for each row execute procedure update_updated_at_column();
create trigger update_forum_topics_updated_at before update on forum_topics for each row execute procedure update_updated_at_column();
create trigger update_forum_replies_updated_at before update on forum_replies for each row execute procedure update_updated_at_column();
create trigger update_user_subscriptions_updated_at before update on user_subscriptions for each row execute procedure update_updated_at_column();
create trigger update_subscription_usage_updated_at before update on subscription_usage for each row execute procedure update_updated_at_column();
create trigger update_marketplace_products_updated_at before update on marketplace_products for each row execute procedure update_updated_at_column();
create trigger update_marketplace_reviews_updated_at before update on marketplace_reviews for each row execute procedure update_updated_at_column();

-- ============================================================================
-- BUSINESS LOGIC TRIGGERS
-- ============================================================================

-- Post likes counter trigger
create or replace function update_post_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update community_posts set likes_count = likes_count + 1 where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update community_posts set likes_count = likes_count - 1 where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_post_likes_count_trigger
after insert or delete on post_likes
for each row execute procedure update_post_likes_count();

-- Post comments counter trigger
create or replace function update_post_comments_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update community_posts set comments_count = comments_count + 1 where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update community_posts set comments_count = comments_count - 1 where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_post_comments_count_trigger
after insert or delete on post_comments
for each row execute procedure update_post_comments_count();

-- Comment likes counter trigger
create or replace function update_comment_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update post_comments set likes_count = likes_count + 1 where id = NEW.comment_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update post_comments set likes_count = likes_count - 1 where id = OLD.comment_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_comment_likes_count_trigger
after insert or delete on comment_likes
for each row execute procedure update_comment_likes_count();

-- Forum topic votes counter trigger
create or replace function update_forum_topic_votes_count()
returns trigger as $$
begin
  update forum_topics
  set votes_count = (
    select count(*) filter (where vote_type = 'upvote') - count(*) filter (where vote_type = 'downvote')
    from forum_topic_votes
    where topic_id = COALESCE(NEW.topic_id, OLD.topic_id)
  )
  where id = COALESCE(NEW.topic_id, OLD.topic_id);
  return COALESCE(NEW, OLD);
end;
$$ language plpgsql;

create trigger update_forum_topic_votes_count_trigger
after insert or update or delete on forum_topic_votes
for each row execute procedure update_forum_topic_votes_count();

-- Forum replies counter trigger
create or replace function update_forum_replies_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update forum_topics set replies_count = replies_count + 1, last_activity_at = now(), last_reply_at = now(), last_reply_by = NEW.user_id where id = NEW.topic_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update forum_topics set replies_count = replies_count - 1 where id = OLD.topic_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_forum_replies_count_trigger
after insert or delete on forum_replies
for each row execute procedure update_forum_replies_count();

-- Forum reply votes counter trigger
create or replace function update_forum_reply_votes_count()
returns trigger as $$
begin
  update forum_replies
  set votes_count = (
    select count(*) filter (where vote_type = 'upvote') - count(*) filter (where vote_type = 'downvote')
    from forum_reply_votes
    where reply_id = COALESCE(NEW.reply_id, OLD.reply_id)
  )
  where id = COALESCE(NEW.reply_id, OLD.reply_id);
  return COALESCE(NEW, OLD);
end;
$$ language plpgsql;

create trigger update_forum_reply_votes_count_trigger
after insert or update or delete on forum_reply_votes
for each row execute procedure update_forum_reply_votes_count();

-- Subscription tier change logging trigger
create or replace function log_subscription_change()
returns trigger as $$
begin
  if (TG_OP = 'UPDATE' and OLD.subscription_tier != NEW.subscription_tier) or (TG_OP = 'INSERT' and NEW.subscription_tier != 'free') then
    insert into subscription_history (
      user_id,
      event_type,
      from_tier,
      to_tier,
      subscription_period
    ) values (
      NEW.user_id,
      case
        when TG_OP = 'INSERT' and NEW.subscription_tier != 'free' then 'purchase'
        when OLD.subscription_tier = 'free' then 'upgrade'
        when NEW.subscription_tier = 'free' then 'downgrade'
        when OLD.subscription_tier < NEW.subscription_tier then 'upgrade'
        else 'downgrade'
      end,
      OLD.subscription_tier,
      NEW.subscription_tier,
      NEW.subscription_period
    );
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger log_subscription_change_trigger
after insert or update on user_subscriptions
for each row execute procedure log_subscription_change();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table user_profiles enable row level security;
alter table assessment_data enable row level security;
alter table lesson_progress enable row level security;
alter table skill_progress enable row level security;
alter table lesson_feedback enable row level security;
alter table learning_profiles enable row level security;
alter table adaptive_progress enable row level security;
alter table learning_path_recommendations enable row level security;
alter table scheduled_lessons enable row level security;
alter table journals enable row level security;
alter table safety_checkins enable row level security;
alter table achievements enable row level security;
alter table leaderboard enable row level security;
alter table xp_transactions enable row level security;
alter table community_posts enable row level security;
alter table post_comments enable row level security;
alter table post_likes enable row level security;
alter table comment_likes enable row level security;
alter table user_follows enable row level security;
alter table post_reports enable row level security;
alter table forum_topics enable row level security;
alter table forum_replies enable row level security;
alter table forum_topic_votes enable row level security;
alter table forum_reply_votes enable row level security;
alter table user_subscriptions enable row level security;
alter table subscription_history enable row level security;
alter table subscription_usage enable row level security;
alter table marketplace_products enable row level security;
alter table marketplace_favorites enable row level security;
alter table marketplace_clicks enable row level security;
alter table marketplace_reviews enable row level security;

-- User profiles policies
create policy "Users can view their own profile" on user_profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on user_profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on user_profiles for insert with check (auth.uid() = id);
create policy "Users can view public profiles" on user_profiles for select using (is_public = true);

-- Assessment data policies
create policy "Users can view own assessments" on assessment_data for select using (auth.uid() = user_id);
create policy "Users can insert own assessments" on assessment_data for insert with check (auth.uid() = user_id);
create policy "Users can update own assessments" on assessment_data for update using (auth.uid() = user_id);

-- Lesson progress policies
create policy "Users can view own lesson progress" on lesson_progress for select using (auth.uid() = user_id);
create policy "Users can insert own lesson progress" on lesson_progress for insert with check (auth.uid() = user_id);

-- Skill progress policies
create policy "Users can view own skill progress" on skill_progress for select using (auth.uid() = user_id);
create policy "Users can update own skill progress" on skill_progress for update using (auth.uid() = user_id);
create policy "System can insert skill progress" on skill_progress for insert with check (auth.uid() = user_id or auth.role() = 'service_role');

-- Lesson feedback policies
create policy "Users can view own feedback" on lesson_feedback for select using (auth.uid() = user_id);
create policy "Users can insert own feedback" on lesson_feedback for insert with check (auth.uid() = user_id);

-- Learning profiles policies
create policy "Users can view own learning profile" on learning_profiles for select using (auth.uid() = user_id);
create policy "Users can update own learning profile" on learning_profiles for update using (auth.uid() = user_id);
create policy "System can insert learning profiles" on learning_profiles for insert with check (auth.uid() = user_id or auth.role() = 'service_role');

-- Adaptive progress policies
create policy "Users can view own adaptive progress" on adaptive_progress for select using (auth.uid() = user_id);
create policy "System can insert adaptive progress" on adaptive_progress for insert with check (auth.uid() = user_id or auth.role() = 'service_role');

-- Learning path recommendations policies
create policy "Users can view own learning path recommendations" on learning_path_recommendations for select using (auth.uid() = user_id);
create policy "System can update learning path recommendations" on learning_path_recommendations for insert with check (auth.uid() = user_id or auth.role() = 'service_role');

-- Scheduled lessons policies
create policy "Users can view own scheduled lessons" on scheduled_lessons for select using (auth.uid() = user_id);
create policy "Users can insert own scheduled lessons" on scheduled_lessons for insert with check (auth.uid() = user_id);
create policy "Users can update own scheduled lessons" on scheduled_lessons for update using (auth.uid() = user_id);
create policy "Users can delete own scheduled lessons" on scheduled_lessons for delete using (auth.uid() = user_id);

-- Journals policies
create policy "Users can view own journals" on journals for select using (auth.uid() = user_id);
create policy "Users can insert own journals" on journals for insert with check (auth.uid() = user_id);
create policy "Users can update own journals" on journals for update using (auth.uid() = user_id);
create policy "Users can delete own journals" on journals for delete using (auth.uid() = user_id);

-- Safety checkins policies
create policy "Users can view own checkins" on safety_checkins for select using (auth.uid() = user_id);
create policy "Users can insert own checkins" on safety_checkins for insert with check (auth.uid() = user_id);

-- Achievements policies
create policy "Users can view own achievements" on achievements for select using (auth.uid() = user_id);

-- Leaderboard policies
create policy "Users can view leaderboard" on leaderboard for select using (true);
create policy "System can update leaderboard" on leaderboard for update using (auth.uid() = user_id or auth.role() = 'service_role');
create policy "Users can insert own leaderboard entry" on leaderboard for insert with check (auth.uid() = user_id);

-- XP transactions policies
create policy "Users can view own xp transactions" on xp_transactions for select using (auth.uid() = user_id);
create policy "System can insert xp transactions" on xp_transactions for insert with check (true);

-- Community posts policies
create policy "Users can view public posts" on community_posts for select using (visibility = 'public' or user_id = auth.uid());
create policy "Users can insert own posts" on community_posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on community_posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on community_posts for delete using (auth.uid() = user_id);

-- Post comments policies
create policy "Users can view comments on viewable posts" on post_comments for select using (true);
create policy "Users can insert own comments" on post_comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments" on post_comments for update using (auth.uid() = user_id);
create policy "Users can delete own comments" on post_comments for delete using (auth.uid() = user_id);

-- Post likes policies
create policy "Users can view all likes" on post_likes for select using (true);
create policy "Users can insert own likes" on post_likes for insert with check (auth.uid() = user_id);
create policy "Users can delete own likes" on post_likes for delete using (auth.uid() = user_id);

-- Comment likes policies
create policy "Users can view all comment likes" on comment_likes for select using (true);
create policy "Users can insert own comment likes" on comment_likes for insert with check (auth.uid() = user_id);
create policy "Users can delete own comment likes" on comment_likes for delete using (auth.uid() = user_id);

-- User follows policies
create policy "Users can view all follows" on user_follows for select using (true);
create policy "Users can follow others" on user_follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow others" on user_follows for delete using (auth.uid() = follower_id);

-- Post reports policies
create policy "Users can view own reports" on post_reports for select using (auth.uid() = reported_by);
create policy "Users can create reports" on post_reports for insert with check (auth.uid() = reported_by);

-- Forum topics policies
create policy "Anyone can view topics" on forum_topics for select using (true);
create policy "Authenticated users can create topics" on forum_topics for insert with check (auth.uid() = user_id);
create policy "Users can update own topics" on forum_topics for update using (auth.uid() = user_id);
create policy "Users can delete own topics" on forum_topics for delete using (auth.uid() = user_id);

-- Forum replies policies
create policy "Anyone can view replies" on forum_replies for select using (true);
create policy "Authenticated users can create replies" on forum_replies for insert with check (auth.uid() = user_id);
create policy "Users can update own replies" on forum_replies for update using (auth.uid() = user_id);
create policy "Users can delete own replies" on forum_replies for delete using (auth.uid() = user_id);

-- Forum votes policies
create policy "Anyone can view votes" on forum_topic_votes for select using (true);
create policy "Authenticated users can vote" on forum_topic_votes for insert with check (auth.uid() = user_id);
create policy "Users can change own votes" on forum_topic_votes for update using (auth.uid() = user_id);
create policy "Users can remove own votes" on forum_topic_votes for delete using (auth.uid() = user_id);

create policy "Anyone can view reply votes" on forum_reply_votes for select using (true);
create policy "Authenticated users can vote on replies" on forum_reply_votes for insert with check (auth.uid() = user_id);
create policy "Users can change own reply votes" on forum_reply_votes for update using (auth.uid() = user_id);
create policy "Users can remove own reply votes" on forum_reply_votes for delete using (auth.uid() = user_id);

-- Subscription policies
create policy "Users can view own subscription" on user_subscriptions for select using (auth.uid() = user_id);
create policy "Users can insert own subscription" on user_subscriptions for insert with check (auth.uid() = user_id);
create policy "Users can update own subscription" on user_subscriptions for update using (auth.uid() = user_id);

create policy "Users can view own subscription history" on subscription_history for select using (auth.uid() = user_id);
create policy "System can insert subscription history" on subscription_history for insert with check (true);

create policy "Users can view own usage" on subscription_usage for select using (auth.uid() = user_id);
create policy "Users can insert own usage" on subscription_usage for insert with check (auth.uid() = user_id);
create policy "Users can update own usage" on subscription_usage for update using (auth.uid() = user_id);

-- Marketplace policies
create policy "Anyone can view active products" on marketplace_products for select using (is_active = true);

create policy "Users can view own favorites" on marketplace_favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on marketplace_favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on marketplace_favorites for delete using (auth.uid() = user_id);

create policy "System can track clicks" on marketplace_clicks for insert with check (true);

create policy "Anyone can view approved reviews" on marketplace_reviews for select using (is_approved = true);
create policy "Users can insert own reviews" on marketplace_reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on marketplace_reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on marketplace_reviews for delete using (auth.uid() = user_id);

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to initialize usage period for a user
create or replace function initialize_usage_period(p_user_id uuid)
returns void as $$
declare
  v_period_start timestamp with time zone;
  v_period_end timestamp with time zone;
begin
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';

  insert into subscription_usage (
    user_id,
    period_start,
    period_end
  ) values (
    p_user_id,
    v_period_start,
    v_period_end
  )
  on conflict (user_id, period_start) do nothing;
end;
$$ language plpgsql;

-- Function to get current usage for a user
create or replace function get_current_usage(p_user_id uuid)
returns subscription_usage as $$
declare
  v_usage subscription_usage;
  v_period_start timestamp with time zone;
  v_period_end timestamp with time zone;
begin
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';

  select * into v_usage
  from subscription_usage
  where user_id = p_user_id
    and period_start = v_period_start;

  if v_usage is null then
    insert into subscription_usage (
      user_id,
      period_start,
      period_end
    ) values (
      p_user_id,
      v_period_start,
      v_period_end
    )
    returning * into v_usage;
  end if;

  return v_usage;
end;
$$ language plpgsql;

-- Function to increment usage counter
create or replace function increment_usage(
  p_user_id uuid,
  p_counter_name text
)
returns void as $$
declare
  v_period_start timestamp with time zone;
begin
  v_period_start := date_trunc('month', now());

  perform initialize_usage_period(p_user_id);

  execute format(
    'update subscription_usage set %I = %I + 1 where user_id = $1 and period_start = $2',
    p_counter_name,
    p_counter_name
  ) using p_user_id, v_period_start;
end;
$$ language plpgsql;

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Journal media bucket
insert into storage.buckets (id, name, public)
values ('journal-media', 'journal-media', true)
on conflict (id) do nothing;

-- Marketplace product images bucket
insert into storage.buckets (id, name, public)
values ('marketplace-images', 'marketplace-images', true)
on conflict (id) do nothing;

-- User profile avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies for journal media
create policy "Users can upload journal media"
on storage.objects for insert
with check (bucket_id = 'journal-media' and auth.uid() = owner);

create policy "Users can view their own journal media"
on storage.objects for select
using (bucket_id = 'journal-media' and auth.uid() = owner);

create policy "Users can delete their own journal media"
on storage.objects for delete
using (bucket_id = 'journal-media' and auth.uid() = owner);

-- Storage policies for marketplace images
create policy "Anyone can view marketplace images"
on storage.objects for select
using (bucket_id = 'marketplace-images');

create policy "Admins can upload marketplace images"
on storage.objects for insert
with check (bucket_id = 'marketplace-images' and auth.role() = 'service_role');

-- Storage policies for avatars
create policy "Anyone can view avatars"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
on storage.objects for insert
with check (bucket_id = 'avatars' and auth.uid() = owner);

create policy "Users can update own avatar"
on storage.objects for update
using (bucket_id = 'avatars' and auth.uid() = owner);

create policy "Users can delete own avatar"
on storage.objects for delete
using (bucket_id = 'avatars' and auth.uid() = owner);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
