-- Subscription Database Schema
-- This file contains tables for managing user subscriptions and payments

-- User Subscriptions Table
create table if not exists user_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Subscription Details
  subscription_tier text check (subscription_tier in ('free', 'premium', 'pro')) default 'free' not null,
  subscription_status text check (subscription_status in ('active', 'expired', 'cancelled', 'in_trial', 'none')) default 'none' not null,
  subscription_period text check (subscription_period in ('monthly', 'yearly')),

  -- Dates
  started_at timestamp with time zone,
  expires_at timestamp with time zone,
  cancelled_at timestamp with time zone,

  -- RevenueCat Integration
  revenue_cat_user_id text not null,
  revenue_cat_entitlement_id text,

  -- Metadata
  metadata jsonb
);

-- Subscription History Table (for tracking tier changes and purchases)
create table if not exists subscription_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Event Details
  event_type text check (event_type in ('purchase', 'upgrade', 'downgrade', 'renewal', 'cancellation', 'expiration', 'trial_start', 'trial_end')) not null,
  from_tier text check (from_tier in ('free', 'premium', 'pro')),
  to_tier text check (to_tier in ('free', 'premium', 'pro')) not null,

  -- Subscription Details at time of event
  subscription_period text check (subscription_period in ('monthly', 'yearly')),
  amount numeric(10, 2),
  currency text default 'USD',

  -- RevenueCat Details
  revenue_cat_transaction_id text,

  -- Metadata
  metadata jsonb
);

-- Usage Tracking Table (for enforcing limits on free tier)
create table if not exists subscription_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Usage Counts (reset monthly)
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,

  -- Community Usage
  posts_created integer default 0,
  comments_created integer default 0,

  -- Journal Usage
  journal_entries_created integer default 0,
  voice_journal_entries integer default 0,
  video_journal_entries integer default 0,

  -- AI Usage
  ai_feedback_requests integer default 0,
  ai_coaching_requests integer default 0,

  -- Other
  lessons_accessed integer default 0,
  dryland_accessed integer default 0,

  unique(user_id, period_start)
);

-- Create Indexes
create index if not exists idx_user_subscriptions_user_id on user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_tier on user_subscriptions(subscription_tier);
create index if not exists idx_user_subscriptions_status on user_subscriptions(subscription_status);
create index if not exists idx_user_subscriptions_expires_at on user_subscriptions(expires_at);

create index if not exists idx_subscription_history_user_id on subscription_history(user_id);
create index if not exists idx_subscription_history_event_type on subscription_history(event_type);
create index if not exists idx_subscription_history_created_at on subscription_history(created_at desc);

create index if not exists idx_subscription_usage_user_id on subscription_usage(user_id);
create index if not exists idx_subscription_usage_period on subscription_usage(period_start, period_end);

-- Updated_at Trigger
create trigger update_user_subscriptions_updated_at before update
    on user_subscriptions for each row
    execute procedure update_updated_at_column();

create trigger update_subscription_usage_updated_at before update
    on subscription_usage for each row
    execute procedure update_updated_at_column();

-- Row Level Security
alter table user_subscriptions enable row level security;
alter table subscription_history enable row level security;
alter table subscription_usage enable row level security;

-- User Subscriptions Policies
create policy "Users can view own subscription"
on user_subscriptions for select
using (auth.uid() = user_id);

create policy "Users can insert own subscription"
on user_subscriptions for insert
with check (auth.uid() = user_id);

create policy "Users can update own subscription"
on user_subscriptions for update
using (auth.uid() = user_id);

-- Subscription History Policies
create policy "Users can view own subscription history"
on subscription_history for select
using (auth.uid() = user_id);

create policy "System can insert subscription history"
on subscription_history for insert
with check (true); -- Allow inserts from backend services

-- Subscription Usage Policies
create policy "Users can view own usage"
on subscription_usage for select
using (auth.uid() = user_id);

create policy "Users can insert own usage"
on subscription_usage for insert
with check (auth.uid() = user_id);

create policy "Users can update own usage"
on subscription_usage for update
using (auth.uid() = user_id);

-- Function to create or update subscription history on tier changes
create or replace function log_subscription_change()
returns trigger as $$
begin
  -- Only log if tier actually changed
  if (TG_OP = 'UPDATE' and OLD.subscription_tier != NEW.subscription_tier) or TG_OP = 'INSERT' then
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
        else 'upgrade'
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

-- Function to initialize current period usage tracking
create or replace function initialize_usage_period(p_user_id uuid)
returns void as $$
declare
  v_period_start timestamp with time zone;
  v_period_end timestamp with time zone;
begin
  -- Calculate current period (monthly)
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';

  -- Insert if not exists
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

  -- Get or create current period usage
  select * into v_usage
  from subscription_usage
  where user_id = p_user_id
    and period_start = v_period_start;

  -- Create if doesn't exist
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

  -- Initialize period if needed
  perform initialize_usage_period(p_user_id);

  -- Increment the specified counter
  execute format(
    'update subscription_usage set %I = %I + 1 where user_id = $1 and period_start = $2',
    p_counter_name,
    p_counter_name
  ) using p_user_id, v_period_start;
end;
$$ language plpgsql;
