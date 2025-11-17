-- Supabase Schema for Swimming Learning App
-- This file defines the database structure for all new features

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- User Profiles Table
create table if not exists user_profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  email text,
  skill_level text check (skill_level in ('beginner-1', 'beginner-2', 'intermediate-1', 'intermediate-2', 'advanced')),
  current_module text,
  completed_lessons text[],
  streak integer default 0,
  total_xp integer default 0,
  last_active date,
  preferences jsonb,
  scheduling_preferences jsonb
);

-- Lesson Progress Table
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Assessment Data Table
create table if not exists assessment_data (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  water_comfort text check (water_comfort in ('very-uncomfortable', 'uncomfortable', 'neutral', 'comfortable', 'very-comfortable')),
  swimming_ability text check (swimming_ability in ('non-swimmer', 'beginner', 'basic-swimmer', 'intermediate', 'advanced')),
  specific_skills text[],
  challenges text[],
  fitness_level text check (fitness_level in ('sedentary', 'lightly-active', 'moderately-active', 'very-active', 'athlete')),
  physical_limitations text[],
  learning_goals text[],
  practice_environment text check (practice_environment in ('public-pool', 'gym-pool', 'home-pool', 'open-water', 'varied')),
  pool_access integer,
  session_duration text,
  learning_preferences text[],
  timeline text,
  commitment integer,
  completed boolean default false
);

-- Journals Table
create table if not exists journals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  entry_type text check (entry_type in ('text', 'voice', 'video')) not null,
  text_content text,
  audio_url text,
  video_url text,
  ai_analysis jsonb,
  sentiment_score numeric(3,2),
  tags text[],
  is_private boolean default false
);

-- Lesson Feedback Table
create table if not exists lesson_feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  lesson_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  feedback_type text check (feedback_type in ('too-easy', 'just-right', 'too-hard')) not null,
  comments text,
  difficulty_rating integer check (difficulty_rating >= 1 and difficulty_rating <= 5),
  helpfulness_rating integer check (helpfulness_rating >= 1 and helpfulness_rating <= 5)
);

-- Scheduled Lessons Table
create table if not exists scheduled_lessons (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  lesson_id text not null,
  title text not null,
  skill_level text check (skill_level in ('beginner-1', 'beginner-2', 'intermediate-1', 'intermediate-2', 'advanced')) not null,
  module_id integer not null,
  lesson_type text check (lesson_type in ('pool', 'dryland')) not null,
  scheduled_date date not null,
  scheduled_time time not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  duration integer not null,
  notes text,
  reminder_enabled boolean default true,
  reminder_minutes integer default 30,
  status text check (status in ('scheduled', 'completed', 'missed', 'cancelled')) default 'scheduled',
  completion_date timestamp with time zone,
  rescheduled_reason text,
  calendar_event_id text
);

-- Safety Check-ins Table
create table if not exists safety_checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  pool_conditions jsonb,
  gear_checklist jsonb,
  environment_rating integer check (environment_rating >= 1 and environment_rating <= 5),
  notes text,
  xp_earned integer default 0
);

-- Achievements Table
create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  achievement_type text not null,
  title text not null,
  description text,
  xp_reward integer,
  unlocked boolean default false,
  unlocked_at timestamp with time zone
);

-- Leaderboard Table
create table if not exists leaderboard (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  weekly_xp integer default 0,
  monthly_xp integer default 0,
  total_xp integer default 0,
  streak integer default 0,
  rank_weekly integer,
  rank_monthly integer,
  rank_all_time integer
);

-- Skill Progress Table
create table if not exists skill_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  skill_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  progress_percentage integer check (progress_percentage >= 0 and progress_percentage <= 100) default 0,
  level text check (level in ('beginner', 'intermediate', 'advanced', 'master')) default 'beginner',
  last_assessment_date timestamp with time zone,
  next_assessment_date timestamp with time zone,
  mastery_notes text
);

-- Create indexes for better query performance
create index if not exists idx_user_profiles_id on user_profiles(id);
create index if not exists idx_lesson_progress_user_id on lesson_progress(user_id);
create index if not exists idx_lesson_progress_lesson_id on lesson_progress(lesson_id);
create index if not exists idx_lesson_progress_completion_date on lesson_progress(completion_date);
create index if not exists idx_scheduled_lessons_skill_level on scheduled_lessons(skill_level);
create index if not exists idx_scheduled_lessons_module_id on scheduled_lessons(module_id);
create index if not exists idx_journals_user_id on journals(user_id);
create index if not exists idx_journals_created_at on journals(created_at);
create index if not exists idx_lesson_feedback_user_id on lesson_feedback(user_id);
create index if not exists idx_lesson_feedback_lesson_id on lesson_feedback(lesson_id);
create index if not exists idx_scheduled_lessons_user_id on scheduled_lessons(user_id);
create index if not exists idx_scheduled_lessons_date on scheduled_lessons(scheduled_date);
create index if not exists idx_safety_checkins_user_id on safety_checkins(user_id);
create index if not exists idx_achievements_user_id on achievements(user_id);
create index if not exists idx_leaderboard_user_id on leaderboard(user_id);
create index if not exists idx_skill_progress_user_id on skill_progress(user_id);
create index if not exists idx_skill_progress_skill_name on skill_progress(skill_name);

-- Create updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language 'plpgsql';

create trigger update_user_profiles_updated_at before update
    on user_profiles for each row
    execute procedure update_updated_at_column();

create trigger update_journals_updated_at before update
    on journals for each row
    execute procedure update_updated_at_column();

create trigger update_scheduled_lessons_updated_at before update
    on scheduled_lessons for each row
    execute procedure update_updated_at_column();

create trigger update_skill_progress_updated_at before update
    on skill_progress for each row
    execute procedure update_updated_at_column();

create trigger update_leaderboard_updated_at before update
    on leaderboard for each row
    execute procedure update_updated_at_column();

-- Row Level Security (RLS) Policies
alter table user_profiles enable row level security;
alter table assessment_data enable row level security;
alter table journals enable row level security;
alter table lesson_feedback enable row level security;
alter table scheduled_lessons enable row level security;
alter table safety_checkins enable row level security;
alter table achievements enable row level security;
alter table leaderboard enable row level security;
alter table skill_progress enable row level security;

-- RLS Policies for user_profiles
create policy "Users can view their own profile"
    on user_profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on user_profiles for update
    using (auth.uid() = id);

create policy "Users can insert their own profile"
    on user_profiles for insert
    with check (auth.uid() = id);

-- RLS Policies for journals
create policy "Users can view their own journals"
    on journals for select
    using (auth.uid() = user_id);

create policy "Users can insert their own journals"
    on journals for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own journals"
    on journals for update
    using (auth.uid() = user_id);

create policy "Users can delete their own journals"
    on journals for delete
    using (auth.uid() = user_id);

-- RLS Policies for lesson_feedback
create policy "Users can view their own feedback"
    on lesson_feedback for select
    using (auth.uid() = user_id);

create policy "Users can insert their own feedback"
    on lesson_feedback for insert
    with check (auth.uid() = user_id);

-- RLS Policies for lesson_progress
create policy "Users can view their own lesson progress"
    on lesson_progress for select
    using (auth.uid() = user_id);

create policy "Users can insert their own lesson progress"
    on lesson_progress for insert
    with check (auth.uid() = user_id);

-- RLS Policies for scheduled_lessons
create policy "Users can view their own scheduled lessons"
    on scheduled_lessons for select
    using (auth.uid() = user_id);

create policy "Users can insert their own scheduled lessons"
    on scheduled_lessons for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own scheduled lessons"
    on scheduled_lessons for update
    using (auth.uid() = user_id);

create policy "Users can delete their own scheduled lessons"
    on scheduled_lessons for delete
    using (auth.uid() = user_id);

-- RLS Policies for safety_checkins
create policy "Users can view their own checkins"
    on safety_checkins for select
    using (auth.uid() = user_id);

create policy "Users can insert their own checkins"
    on safety_checkins for insert
    with check (auth.uid() = user_id);

-- RLS Policies for achievements
create policy "Users can view their own achievements"
    on achievements for select
    using (auth.uid() = user_id);

-- RLS Policies for leaderboard
create policy "Users can view leaderboard"
    on leaderboard for select
    using (true);

create policy "System can update leaderboard"
    on leaderboard for update
    using (auth.uid() = user_id or auth.role() = 'service_role');

-- RLS Policies for skill_progress
create policy "Users can view their own skill progress"
    on skill_progress for select
    using (auth.uid() = user_id);

create policy "Users can update their own skill progress"
    on skill_progress for update
    using (auth.uid() = user_id);

create policy "System can update skill progress"
    on skill_progress for insert
    with check (auth.uid() = user_id or auth.role() = 'service_role');

-- Adaptive Learning Tables

-- Learning Profiles Table
create table if not exists learning_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  learning_style text check (learning_style in ('visual', 'auditory', 'kinesthetic', 'mixed')) not null,
  preferred_pace text check (preferred_pace in ('slow', 'moderate', 'fast', 'adaptive')) not null,
  focus_areas text[],
  strength_areas text[],
  last_assessment_date timestamp with time zone,
  comprehension_level numeric(3,2),
  engagement_level numeric(3,2),
  practice_efficiency numeric(3,2),
  adaptivity_score numeric(3,2)
);

-- Adaptive Progress Table
create table if not exists adaptive_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  lesson_id text not null,
  learning_path_progress numeric(5,2),
  comprehension_score numeric(3,2),
  engagement_score numeric(3,2),
  practice_efficiency numeric(3,2),
  difficulty_rating integer check (difficulty_rating >= 1 and difficulty_rating <= 5),
  adaptivity_metrics jsonb,
  recommendations text[]
);

-- Learning Path Recommendations Table
create table if not exists learning_path_recommendations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  next_lessons text[],
  practice_suggestions text[],
  focus_areas text[],
  estimated_time_to_mastery integer,
  confidence_building_activities text[],
  personalized_goals text[],
  recommended_resources jsonb
);

-- Create indexes for adaptive learning tables
create index if not exists idx_learning_profiles_user_id on learning_profiles(user_id);
create index if not exists idx_adaptive_progress_user_id on adaptive_progress(user_id);
create index if not exists idx_adaptive_progress_lesson_id on adaptive_progress(lesson_id);
create index if not exists idx_learning_path_recommendations_user_id on learning_path_recommendations(user_id);

-- Create updated_at trigger for learning_profiles
create trigger update_learning_profiles_updated_at before update
    on learning_profiles for each row
    execute procedure update_updated_at_column();

-- Create updated_at trigger for learning_path_recommendations
create trigger update_learning_path_recommendations_updated_at before update
    on learning_path_recommendations for each row
    execute procedure update_updated_at_column();

-- RLS Policies for learning_profiles
alter table learning_profiles enable row level security;

create policy "Users can view their own learning profile"
    on learning_profiles for select
    using (auth.uid() = user_id);

create policy "Users can update their own learning profile"
    on learning_profiles for update
    using (auth.uid() = user_id);

create policy "System can insert learning profiles"
    on learning_profiles for insert
    with check (auth.uid() = user_id or auth.role() = 'service_role');

-- RLS Policies for adaptive_progress
alter table adaptive_progress enable row level security;

create policy "Users can view their own adaptive progress"
    on adaptive_progress for select
    using (auth.uid() = user_id);

create policy "System can insert adaptive progress"
    on adaptive_progress for insert
    with check (auth.uid() = user_id or auth.role() = 'service_role');

-- RLS Policies for learning_path_recommendations
alter table learning_path_recommendations enable row level security;

create policy "Users can view their own learning path recommendations"
    on learning_path_recommendations for select
    using (auth.uid() = user_id);

create policy "System can update learning path recommendations"
    on learning_path_recommendations for insert
    with check (auth.uid() = user_id or auth.role() = 'service_role');

-- Storage buckets for media files
insert into storage.buckets (id, name, public)
values ('journal-media', 'journal-media', true)
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