import { supabase } from './supabase';

export type CommunityPost = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  content: string;
  media_url?: string;
  media_type: 'image' | 'video' | 'none';
  post_type: 'achievement' | 'progress' | 'question' | 'general';
  likes_count: number;
  comments_count: number;
  is_edited: boolean;
  visibility: 'public' | 'followers' | 'private';
  tags?: string[];
  user_profiles?: {
    name: string;
    email: string;
  };
  is_liked?: boolean;
};

export type PostComment = {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  content: string;
  likes_count: number;
  is_edited: boolean;
  user_profiles?: {
    name: string;
  };
  is_liked?: boolean;
};

// Get community feed (public posts, paginated)
export const getCommunityFeed = async (
  limit: number = 20,
  offset: number = 0,
  userId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, user_profiles(name, email)')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Check if posts are liked by current user
    if (userId && data) {
      const postIds = data.map((post) => post.id);
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds);

      const likedPostIds = new Set(likes?.map((like) => like.post_id) || []);

      return data.map((post) => ({
        ...post,
        is_liked: likedPostIds.has(post.id),
      }));
    }

    return data;
  } catch (error) {
    console.error('Error fetching community feed:', error);
    return [];
  }
};

// Create a new post
export const createPost = async (post: {
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'none';
  post_type?: 'achievement' | 'progress' | 'question' | 'general';
  visibility?: 'public' | 'followers' | 'private';
  tags?: string[];
}) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        ...post,
        media_type: post.media_type || 'none',
        post_type: post.post_type || 'general',
        visibility: post.visibility || 'public',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
};

// Update a post
export const updatePost = async (
  postId: string,
  updates: {
    content?: string;
    media_url?: string;
    visibility?: 'public' | 'followers' | 'private';
    tags?: string[];
  }
) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .update({ ...updates, is_edited: true, updated_at: new Date().toISOString() })
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating post:', error);
    return null;
  }
};

// Delete a post
export const deletePost = async (postId: string) => {
  try {
    const { error } = await supabase.from('community_posts').delete().eq('id', postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};

// Like/Unlike a post
export const togglePostLike = async (postId: string, userId: string) => {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase.from('post_likes').delete().eq('id', existingLike.id);
      if (error) throw error;
      return { liked: false };
    } else {
      // Like
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });
      if (error) throw error;
      return { liked: true };
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    return null;
  }
};

// Get comments for a post
export const getPostComments = async (postId: string, userId?: string) => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, user_profiles(name)')
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Check if comments are liked by current user
    if (userId && data) {
      const commentIds = data.map((comment) => comment.id);
      const { data: likes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId)
        .in('comment_id', commentIds);

      const likedCommentIds = new Set(likes?.map((like) => like.comment_id) || []);

      return data.map((comment) => ({
        ...comment,
        is_liked: likedCommentIds.has(comment.id),
      }));
    }

    return data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Create a comment
export const createComment = async (comment: {
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating comment:', error);
    return null;
  }
};

// Delete a comment
export const deleteComment = async (commentId: string) => {
  try {
    const { error } = await supabase.from('post_comments').delete().eq('id', commentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

// Toggle comment like
export const toggleCommentLike = async (commentId: string, userId: string) => {
  try {
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existingLike.id);
      if (error) throw error;
      return { liked: false };
    } else {
      const { error } = await supabase
        .from('comment_likes')
        .insert({ comment_id: commentId, user_id: userId });
      if (error) throw error;
      return { liked: true };
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return null;
  }
};

// Follow/Unfollow a user
export const toggleUserFollow = async (followerId: string, followingId: string) => {
  try {
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existingFollow) {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('id', existingFollow.id);
      if (error) throw error;
      return { following: false };
    } else {
      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: followerId, following_id: followingId });
      if (error) throw error;
      return { following: true };
    }
  } catch (error) {
    console.error('Error toggling user follow:', error);
    return null;
  }
};

// Report a post
export const reportPost = async (report: {
  post_id: string;
  reported_by: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
  description?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('post_reports')
      .insert(report)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error reporting post:', error);
    return null;
  }
};

// Get user's posts
export const getUserPosts = async (userId: string, limit: number = 20) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, user_profiles(name, email)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
};

export default {
  getCommunityFeed,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  getPostComments,
  createComment,
  deleteComment,
  toggleCommentLike,
  toggleUserFollow,
  reportPost,
  getUserPosts,
};
