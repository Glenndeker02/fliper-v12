-- Q&A Forum Database Schema
-- This file contains tables for Q&A forum features

-- Forum Topics Table
create table if not exists forum_topics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text not null,
  category text check (category in ('beginner', 'technique', 'safety', 'equipment', 'training', 'general')) not null,
  is_answered boolean default false,
  is_pinned boolean default false,
  is_locked boolean default false,
  views_count integer default 0,
  replies_count integer default 0,
  votes_count integer default 0,
  best_answer_id uuid,
  tags text[]
);

-- Forum Replies Table
create table if not exists forum_replies (
  id uuid primary key default uuid_generate_v4(),
  topic_id uuid references forum_topics(id) on delete cascade not null,
  user_id uuid references user_profiles(id) on delete cascade not null,
  parent_reply_id uuid references forum_replies(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  is_edited boolean default false,
  votes_count integer default 0,
  is_best_answer boolean default false
);

-- Forum Topic Votes Table
create table if not exists forum_topic_votes (
  id uuid primary key default uuid_generate_v4(),
  topic_id uuid references forum_topics(id) on delete cascade not null,
  user_id uuid references user_profiles(id) on delete cascade not null,
  vote_type text check (vote_type in ('upvote', 'downvote')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(topic_id, user_id)
);

-- Forum Reply Votes Table
create table if not exists forum_reply_votes (
  id uuid primary key default uuid_generate_v4(),
  reply_id uuid references forum_replies(id) on delete cascade not null,
  user_id uuid references user_profiles(id) on delete cascade not null,
  vote_type text check (vote_type in ('upvote', 'downvote')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(reply_id, user_id)
);

-- Create Indexes
create index if not exists idx_forum_topics_user_id on forum_topics(user_id);
create index if not exists idx_forum_topics_category on forum_topics(category);
create index if not exists idx_forum_topics_created_at on forum_topics(created_at desc);
create index if not exists idx_forum_topics_is_answered on forum_topics(is_answered);
create index if not exists idx_forum_replies_topic_id on forum_replies(topic_id);
create index if not exists idx_forum_replies_user_id on forum_replies(user_id);
create index if not exists idx_forum_topic_votes_topic_id on forum_topic_votes(topic_id);
create index if not exists idx_forum_reply_votes_reply_id on forum_reply_votes(reply_id);

-- Updated_at Triggers
create trigger update_forum_topics_updated_at before update
    on forum_topics for each row
    execute procedure update_updated_at_column();

create trigger update_forum_replies_updated_at before update
    on forum_replies for each row
    execute procedure update_updated_at_column();

-- Row Level Security
alter table forum_topics enable row level security;
alter table forum_replies enable row level security;
alter table forum_topic_votes enable row level security;
alter table forum_reply_votes enable row level security;

-- Forum Topics Policies
create policy "Anyone can view topics"
on forum_topics for select
using (true);

create policy "Authenticated users can create topics"
on forum_topics for insert
with check (auth.uid() = user_id);

create policy "Users can update own topics"
on forum_topics for update
using (auth.uid() = user_id);

create policy "Users can delete own topics"
on forum_topics for delete
using (auth.uid() = user_id);

-- Forum Replies Policies
create policy "Anyone can view replies"
on forum_replies for select
using (true);

create policy "Authenticated users can create replies"
on forum_replies for insert
with check (auth.uid() = user_id);

create policy "Users can update own replies"
on forum_replies for update
using (auth.uid() = user_id);

create policy "Users can delete own replies"
on forum_replies for delete
using (auth.uid() = user_id);

-- Votes Policies
create policy "Anyone can view votes"
on forum_topic_votes for select
using (true);

create policy "Authenticated users can vote"
on forum_topic_votes for insert
with check (auth.uid() = user_id);

create policy "Users can change own votes"
on forum_topic_votes for update
using (auth.uid() = user_id);

create policy "Users can remove own votes"
on forum_topic_votes for delete
using (auth.uid() = user_id);

create policy "Anyone can view reply votes"
on forum_reply_votes for select
using (true);

create policy "Authenticated users can vote on replies"
on forum_reply_votes for insert
with check (auth.uid() = user_id);

create policy "Users can change own reply votes"
on forum_reply_votes for update
using (auth.uid() = user_id);

create policy "Users can remove own reply votes"
on forum_reply_votes for delete
using (auth.uid() = user_id);

-- Functions for updating counters
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

create or replace function update_forum_replies_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update forum_topics
    set replies_count = replies_count + 1
    where id = NEW.topic_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update forum_topics
    set replies_count = replies_count - 1
    where id = OLD.topic_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_forum_replies_count_trigger
after insert or delete on forum_replies
for each row execute procedure update_forum_replies_count();

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
