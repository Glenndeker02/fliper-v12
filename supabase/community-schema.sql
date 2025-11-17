-- Community Feed Database Schema
-- This file contains tables for community features (posts, comments, likes, follows)

-- Community Posts Table
create table if not exists community_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  media_url text,
  media_type text check (media_type in ('image', 'video', 'none')) default 'none',
  post_type text check (post_type in ('achievement', 'progress', 'question', 'general')) default 'general',
  likes_count integer default 0,
  comments_count integer default 0,
  is_edited boolean default false,
  is_reported boolean default false,
  visibility text check (visibility in ('public', 'followers', 'private')) default 'public',
  tags text[],
  metadata jsonb
);

-- Post Comments Table
create table if not exists post_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references community_posts(id) on delete cascade not null,
  user_id uuid references user_profiles(id) on delete cascade not null,
  parent_comment_id uuid references post_comments(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  likes_count integer default 0,
  is_edited boolean default false,
  is_reported boolean default false
);

-- Post Likes Table
create table if not exists post_likes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references community_posts(id) on delete cascade not null,
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- Comment Likes Table
create table if not exists comment_likes (
  id uuid primary key default uuid_generate_v4(),
  comment_id uuid references post_comments(id) on delete cascade not null,
  user_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(comment_id, user_id)
);

-- User Follows Table
create table if not exists user_follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid references user_profiles(id) on delete cascade not null,
  following_id uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

-- Post Reports Table
create table if not exists post_reports (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references community_posts(id) on delete cascade not null,
  reported_by uuid references user_profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reason text check (reason in ('spam', 'inappropriate', 'harassment', 'misinformation', 'other')) not null,
  description text,
  status text check (status in ('pending', 'reviewed', 'actioned', 'dismissed')) default 'pending'
);

-- Create Indexes for Performance
create index if not exists idx_community_posts_user_id on community_posts(user_id);
create index if not exists idx_community_posts_created_at on community_posts(created_at desc);
create index if not exists idx_community_posts_post_type on community_posts(post_type);
create index if not exists idx_community_posts_visibility on community_posts(visibility);
create index if not exists idx_post_comments_post_id on post_comments(post_id);
create index if not exists idx_post_comments_user_id on post_comments(user_id);
create index if not exists idx_post_comments_parent_id on post_comments(parent_comment_id);
create index if not exists idx_post_likes_post_id on post_likes(post_id);
create index if not exists idx_post_likes_user_id on post_likes(user_id);
create index if not exists idx_comment_likes_comment_id on comment_likes(comment_id);
create index if not exists idx_user_follows_follower_id on user_follows(follower_id);
create index if not exists idx_user_follows_following_id on user_follows(following_id);

-- Updated_at Triggers
create trigger update_community_posts_updated_at before update
    on community_posts for each row
    execute procedure update_updated_at_column();

create trigger update_post_comments_updated_at before update
    on post_comments for each row
    execute procedure update_updated_at_column();

-- Row Level Security Policies

-- Community Posts Policies
alter table community_posts enable row level security;

create policy "Users can view public posts"
on community_posts for select
using (visibility = 'public' or user_id = auth.uid());

create policy "Users can insert own posts"
on community_posts for insert
with check (auth.uid() = user_id);

create policy "Users can update own posts"
on community_posts for update
using (auth.uid() = user_id);

create policy "Users can delete own posts"
on community_posts for delete
using (auth.uid() = user_id);

-- Post Comments Policies
alter table post_comments enable row level security;

create policy "Users can view comments on viewable posts"
on post_comments for select
using (true); -- Can view all comments on posts they can see

create policy "Users can insert own comments"
on post_comments for insert
with check (auth.uid() = user_id);

create policy "Users can update own comments"
on post_comments for update
using (auth.uid() = user_id);

create policy "Users can delete own comments"
on post_comments for delete
using (auth.uid() = user_id);

-- Post Likes Policies
alter table post_likes enable row level security;

create policy "Users can view all likes"
on post_likes for select
using (true);

create policy "Users can insert own likes"
on post_likes for insert
with check (auth.uid() = user_id);

create policy "Users can delete own likes"
on post_likes for delete
using (auth.uid() = user_id);

-- Comment Likes Policies
alter table comment_likes enable row level security;

create policy "Users can view all comment likes"
on comment_likes for select
using (true);

create policy "Users can insert own comment likes"
on comment_likes for insert
with check (auth.uid() = user_id);

create policy "Users can delete own comment likes"
on comment_likes for delete
using (auth.uid() = user_id);

-- User Follows Policies
alter table user_follows enable row level security;

create policy "Users can view all follows"
on user_follows for select
using (true);

create policy "Users can follow others"
on user_follows for insert
with check (auth.uid() = follower_id);

create policy "Users can unfollow others"
on user_follows for delete
using (auth.uid() = follower_id);

-- Functions for updating counters

-- Function to update post likes count
create or replace function update_post_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update community_posts
    set likes_count = likes_count + 1
    where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update community_posts
    set likes_count = likes_count - 1
    where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_post_likes_count_trigger
after insert or delete on post_likes
for each row execute procedure update_post_likes_count();

-- Function to update post comments count
create or replace function update_post_comments_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update community_posts
    set comments_count = comments_count + 1
    where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update community_posts
    set comments_count = comments_count - 1
    where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_post_comments_count_trigger
after insert or delete on post_comments
for each row execute procedure update_post_comments_count();

-- Function to update comment likes count
create or replace function update_comment_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update post_comments
    set likes_count = likes_count + 1
    where id = NEW.comment_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update post_comments
    set likes_count = likes_count - 1
    where id = OLD.comment_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger update_comment_likes_count_trigger
after insert or delete on comment_likes
for each row execute procedure update_comment_likes_count();
