// Forum API Utilities
// Complete CRUD operations for Q&A forum functionality

import { supabase } from './supabase';

/**
 * Forum Topic Types
 */
export type ForumCategory = 'beginner' | 'technique' | 'safety' | 'equipment' | 'training' | 'general';
export type VoteType = 'upvote' | 'downvote';

export interface ForumTopic {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  category: ForumCategory;
  tags?: string[];
  is_answered: boolean;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  votes_count: number;
  best_answer_id?: string;
  last_activity_at: string;
  last_reply_at?: string;
  last_reply_by?: string;
  user_profiles?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  user_vote?: VoteType | null;
}

export interface ForumReply {
  id: string;
  topic_id: string;
  user_id: string;
  parent_reply_id?: string;
  created_at: string;
  updated_at: string;
  content: string;
  is_best_answer: boolean;
  votes_count: number;
  is_edited: boolean;
  user_profiles?: {
    name: string;
    avatar_url?: string;
  };
  user_vote?: VoteType | null;
}

/**
 * Get forum topics with pagination and filtering
 */
export const getForumTopics = async ({
  category,
  limit = 20,
  offset = 0,
  sortBy = 'recent',
  unansweredOnly = false,
  userId,
}: {
  category?: ForumCategory;
  limit?: number;
  offset?: number;
  sortBy?: 'recent' | 'popular' | 'votes' | 'unanswered';
  unansweredOnly?: boolean;
  userId?: string;
}): Promise<ForumTopic[]> => {
  try {
    let query = supabase
      .from('forum_topics')
      .select('*, user_profiles(name, email, avatar_url)');

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Filter by unanswered
    if (unansweredOnly) {
      query = query.eq('is_answered', false);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        query = query.order('views_count', { ascending: false });
        break;
      case 'votes':
        query = query.order('votes_count', { ascending: false });
        break;
      case 'unanswered':
        query = query.eq('is_answered', false).order('created_at', { ascending: false });
        break;
      case 'recent':
      default:
        query = query.order('last_activity_at', { ascending: false });
        break;
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    // Check user votes if userId provided
    if (userId && data) {
      const topicIds = data.map((topic) => topic.id);
      const { data: votes } = await supabase
        .from('forum_topic_votes')
        .select('topic_id, vote_type')
        .eq('user_id', userId)
        .in('topic_id', topicIds);

      const voteMap = new Map(votes?.map((v) => [v.topic_id, v.vote_type]) || []);

      return data.map((topic) => ({
        ...topic,
        user_vote: voteMap.get(topic.id) || null,
      }));
    }

    return data || [];
  } catch (error) {
    console.error('[Forum] Error fetching topics:', error);
    return [];
  }
};

/**
 * Get a single forum topic with user vote status
 */
export const getForumTopic = async (
  topicId: string,
  userId?: string
): Promise<ForumTopic | null> => {
  try {
    const { data, error } = await supabase
      .from('forum_topics')
      .select('*, user_profiles(name, email, avatar_url)')
      .eq('id', topicId)
      .single();

    if (error) throw error;

    // Increment view count
    await supabase
      .from('forum_topics')
      .update({ views_count: data.views_count + 1 })
      .eq('id', topicId);

    // Check user vote
    if (userId) {
      const { data: vote } = await supabase
        .from('forum_topic_votes')
        .select('vote_type')
        .eq('topic_id', topicId)
        .eq('user_id', userId)
        .single();

      return {
        ...data,
        views_count: data.views_count + 1,
        user_vote: vote?.vote_type || null,
      };
    }

    return { ...data, views_count: data.views_count + 1, user_vote: null };
  } catch (error) {
    console.error('[Forum] Error fetching topic:', error);
    return null;
  }
};

/**
 * Create a new forum topic
 */
export const createForumTopic = async (topic: {
  user_id: string;
  title: string;
  content: string;
  category: ForumCategory;
  tags?: string[];
}): Promise<ForumTopic | null> => {
  try {
    const { data, error } = await supabase
      .from('forum_topics')
      .insert(topic)
      .select('*, user_profiles(name, email, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Forum] Error creating topic:', error);
    return null;
  }
};

/**
 * Update a forum topic
 */
export const updateForumTopic = async (
  topicId: string,
  updates: {
    title?: string;
    content?: string;
    tags?: string[];
  }
): Promise<ForumTopic | null> => {
  try {
    const { data, error } = await supabase
      .from('forum_topics')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', topicId)
      .select('*, user_profiles(name, email, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Forum] Error updating topic:', error);
    return null;
  }
};

/**
 * Delete a forum topic
 */
export const deleteForumTopic = async (topicId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('forum_topics').delete().eq('id', topicId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Forum] Error deleting topic:', error);
    return false;
  }
};

/**
 * Get replies for a topic
 */
export const getTopicReplies = async (
  topicId: string,
  userId?: string
): Promise<ForumReply[]> => {
  try {
    const { data, error } = await supabase
      .from('forum_replies')
      .select('*, user_profiles(name, avatar_url)')
      .eq('topic_id', topicId)
      .is('parent_reply_id', null)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Check user votes if userId provided
    if (userId && data) {
      const replyIds = data.map((reply) => reply.id);
      const { data: votes } = await supabase
        .from('forum_reply_votes')
        .select('reply_id, vote_type')
        .eq('user_id', userId)
        .in('reply_id', replyIds);

      const voteMap = new Map(votes?.map((v) => [v.reply_id, v.vote_type]) || []);

      return data.map((reply) => ({
        ...reply,
        user_vote: voteMap.get(reply.id) || null,
      }));
    }

    return data || [];
  } catch (error) {
    console.error('[Forum] Error fetching replies:', error);
    return [];
  }
};

/**
 * Create a reply to a topic
 */
export const createForumReply = async (reply: {
  topic_id: string;
  user_id: string;
  content: string;
  parent_reply_id?: string;
}): Promise<ForumReply | null> => {
  try {
    const { data, error } = await supabase
      .from('forum_replies')
      .insert(reply)
      .select('*, user_profiles(name, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Forum] Error creating reply:', error);
    return null;
  }
};

/**
 * Update a reply
 */
export const updateForumReply = async (
  replyId: string,
  content: string
): Promise<ForumReply | null> => {
  try {
    const { data, error } = await supabase
      .from('forum_replies')
      .update({
        content,
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', replyId)
      .select('*, user_profiles(name, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Forum] Error updating reply:', error);
    return null;
  }
};

/**
 * Delete a reply
 */
export const deleteForumReply = async (replyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('forum_replies').delete().eq('id', replyId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Forum] Error deleting reply:', error);
    return false;
  }
};

/**
 * Vote on a topic (upvote/downvote)
 */
export const voteOnTopic = async (
  topicId: string,
  userId: string,
  voteType: VoteType
): Promise<{ success: boolean; newVoteCount: number }> => {
  try {
    // Check existing vote
    const { data: existingVote } = await supabase
      .from('forum_topic_votes')
      .select('id, vote_type')
      .eq('topic_id', topicId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote (toggle off)
        await supabase.from('forum_topic_votes').delete().eq('id', existingVote.id);
      } else {
        // Change vote
        await supabase
          .from('forum_topic_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
      }
    } else {
      // Add new vote
      await supabase
        .from('forum_topic_votes')
        .insert({ topic_id: topicId, user_id: userId, vote_type: voteType });
    }

    // Get updated vote count
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('votes_count')
      .eq('id', topicId)
      .single();

    return { success: true, newVoteCount: topic?.votes_count || 0 };
  } catch (error) {
    console.error('[Forum] Error voting on topic:', error);
    return { success: false, newVoteCount: 0 };
  }
};

/**
 * Vote on a reply (upvote/downvote)
 */
export const voteOnReply = async (
  replyId: string,
  userId: string,
  voteType: VoteType
): Promise<{ success: boolean; newVoteCount: number }> => {
  try {
    // Check existing vote
    const { data: existingVote } = await supabase
      .from('forum_reply_votes')
      .select('id, vote_type')
      .eq('reply_id', replyId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote (toggle off)
        await supabase.from('forum_reply_votes').delete().eq('id', existingVote.id);
      } else {
        // Change vote
        await supabase
          .from('forum_reply_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
      }
    } else {
      // Add new vote
      await supabase
        .from('forum_reply_votes')
        .insert({ reply_id: replyId, user_id: userId, vote_type: voteType });
    }

    // Get updated vote count
    const { data: reply } = await supabase
      .from('forum_replies')
      .select('votes_count')
      .eq('id', replyId)
      .single();

    return { success: true, newVoteCount: reply?.votes_count || 0 };
  } catch (error) {
    console.error('[Forum] Error voting on reply:', error);
    return { success: false, newVoteCount: 0 };
  }
};

/**
 * Mark a reply as the best answer
 */
export const markBestAnswer = async (
  topicId: string,
  replyId: string
): Promise<boolean> => {
  try {
    // Update topic with best answer
    await supabase
      .from('forum_topics')
      .update({
        best_answer_id: replyId,
        is_answered: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', topicId);

    // Mark reply as best answer
    await supabase
      .from('forum_replies')
      .update({ is_best_answer: true })
      .eq('id', replyId);

    // Unmark other replies
    await supabase
      .from('forum_replies')
      .update({ is_best_answer: false })
      .eq('topic_id', topicId)
      .neq('id', replyId);

    return true;
  } catch (error) {
    console.error('[Forum] Error marking best answer:', error);
    return false;
  }
};

/**
 * Pin/Unpin a topic
 */
export const toggleTopicPin = async (topicId: string, isPinned: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('forum_topics')
      .update({ is_pinned: isPinned })
      .eq('id', topicId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Forum] Error toggling pin:', error);
    return false;
  }
};

/**
 * Lock/Unlock a topic
 */
export const toggleTopicLock = async (topicId: string, isLocked: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('forum_topics')
      .update({ is_locked: isLocked })
      .eq('id', topicId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Forum] Error toggling lock:', error);
    return false;
  }
};

/**
 * Search forum topics
 */
export const searchForumTopics = async (
  query: string,
  category?: ForumCategory,
  limit: number = 20
): Promise<ForumTopic[]> => {
  try {
    let dbQuery = supabase
      .from('forum_topics')
      .select('*, user_profiles(name, email, avatar_url)');

    // Add category filter if provided
    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    // Search in title and content
    dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);

    // Order by relevance (topics with query in title first)
    dbQuery = dbQuery.order('created_at', { ascending: false }).limit(limit);

    const { data, error } = await dbQuery;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Forum] Error searching topics:', error);
    return [];
  }
};

/**
 * Get trending topics (most active in last 7 days)
 */
export const getTrendingTopics = async (
  limit: number = 10,
  userId?: string
): Promise<ForumTopic[]> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('forum_topics')
      .select('*, user_profiles(name, email, avatar_url)')
      .gte('last_activity_at', sevenDaysAgo.toISOString())
      .order('replies_count', { ascending: false })
      .order('votes_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Check user votes if userId provided
    if (userId && data) {
      const topicIds = data.map((topic) => topic.id);
      const { data: votes } = await supabase
        .from('forum_topic_votes')
        .select('topic_id, vote_type')
        .eq('user_id', userId)
        .in('topic_id', topicIds);

      const voteMap = new Map(votes?.map((v) => [v.topic_id, v.vote_type]) || []);

      return data.map((topic) => ({
        ...topic,
        user_vote: voteMap.get(topic.id) || null,
      }));
    }

    return data || [];
  } catch (error) {
    console.error('[Forum] Error fetching trending topics:', error);
    return [];
  }
};

/**
 * Get user's topics
 */
export const getUserTopics = async (
  userId: string,
  limit: number = 20
): Promise<ForumTopic[]> => {
  try {
    const { data, error } = await supabase
      .from('forum_topics')
      .select('*, user_profiles(name, email, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Forum] Error fetching user topics:', error);
    return [];
  }
};

export default {
  getForumTopics,
  getForumTopic,
  createForumTopic,
  updateForumTopic,
  deleteForumTopic,
  getTopicReplies,
  createForumReply,
  updateForumReply,
  deleteForumReply,
  voteOnTopic,
  voteOnReply,
  markBestAnswer,
  toggleTopicPin,
  toggleTopicLock,
  searchForumTopics,
  getTrendingTopics,
  getUserTopics,
};
