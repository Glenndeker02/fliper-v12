import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Heart, MessageCircle, Share2, MoreVertical, Send, Trophy } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCommunityFeed,
  togglePostLike,
  createComment,
  CommunityPost,
} from '@/utils/community';
import { getCurrentUser } from '@/utils/supabase';

export default function CommunityScreen() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [commentingOnPost, setCommentingOnPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const {
    data: posts,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['community-feed', currentUserId],
    queryFn: () => getCommunityFeed(20, 0, currentUserId || undefined),
    enabled: !!currentUserId,
  });

  const likeMutation = useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
      togglePostLike(postId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (data: { post_id: string; user_id: string; content: string }) =>
      createComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      setCommentText('');
      setCommentingOnPost(null);
    },
  });

  const handleLike = (postId: string) => {
    if (!currentUserId) return;
    likeMutation.mutate({ postId, userId: currentUserId });
  };

  const handleComment = (postId: string) => {
    if (!currentUserId || !commentText.trim()) return;

    commentMutation.mutate({
      post_id: postId,
      user_id: currentUserId,
      content: commentText.trim(),
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy size={16} color={theme.colors.primary.turquoise} />;
      default:
        return null;
    }
  };

  const getPostTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      achievement: { label: 'Achievement', color: theme.colors.primary.turquoise },
      progress: { label: 'Progress', color: theme.colors.accent.success },
      question: { label: 'Question', color: theme.colors.accent.warning },
      general: { label: 'General', color: theme.colors.text.muted },
    };

    return types[type] || types.general;
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background.gray }}>
      <Stack.Screen
        options={{
          title: 'Community',
          headerStyle: { backgroundColor: theme.colors.background.white },
          headerTintColor: theme.colors.text.primary,
          headerShadowVisible: false,
        }}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.colors.primary.turquoise} />
          <Text
            className="mt-4 text-base"
            style={{ color: theme.colors.text.muted }}
          >
            Loading community feed...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            className="text-lg font-bold mb-2"
            style={{ color: theme.colors.text.primary }}
          >
            Unable to Load Feed
          </Text>
          <Text
            className="text-base text-center mb-4"
            style={{ color: theme.colors.text.muted }}
          >
            Please check your connection and try again
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-lg"
            style={{ backgroundColor: theme.colors.primary.turquoise }}
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary.turquoise}
            />
          }
        >
          {!posts || posts.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20 px-8">
              <Text
                className="text-lg font-bold mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                No Posts Yet
              </Text>
              <Text
                className="text-base text-center"
                style={{ color: theme.colors.text.muted }}
              >
                Be the first to share your swimming journey!
              </Text>
            </View>
          ) : (
            <View className="px-4 py-4">
              {posts.map((post: CommunityPost) => {
                const postTypeBadge = getPostTypeBadge(post.post_type);

                return (
                  <View
                    key={post.id}
                    className="mb-4 p-4 rounded-xl"
                    style={{ backgroundColor: theme.colors.background.white }}
                  >
                    {/* Post Header */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: theme.colors.primary.turquoise + '20' }}
                        >
                          <Text
                            className="text-base font-bold"
                            style={{ color: theme.colors.primary.turquoise }}
                          >
                            {post.user_profiles?.name?.charAt(0) || 'U'}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-base font-semibold"
                            style={{ color: theme.colors.text.primary }}
                            numberOfLines={1}
                          >
                            {post.user_profiles?.name || 'Anonymous'}
                          </Text>
                          <Text
                            className="text-xs"
                            style={{ color: theme.colors.text.muted }}
                          >
                            {formatTimeAgo(post.created_at)}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-2">
                        {post.post_type !== 'general' && (
                          <View
                            className="px-2 py-1 rounded flex-row items-center gap-1"
                            style={{ backgroundColor: postTypeBadge.color + '20' }}
                          >
                            {getPostTypeIcon(post.post_type)}
                            <Text
                              className="text-xs font-medium"
                              style={{ color: postTypeBadge.color }}
                            >
                              {postTypeBadge.label}
                            </Text>
                          </View>
                        )}
                        <TouchableOpacity className="p-1">
                          <MoreVertical size={20} color={theme.colors.text.muted} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Post Content */}
                    <Text
                      className="text-base mb-3"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {post.content}
                    </Text>

                    {/* Post Actions */}
                    <View className="flex-row items-center gap-6 pt-3 border-t"
                      style={{ borderTopColor: theme.colors.ui.border }}
                    >
                      <TouchableOpacity
                        className="flex-row items-center gap-2"
                        onPress={() => handleLike(post.id)}
                      >
                        <Heart
                          size={20}
                          color={post.is_liked ? theme.colors.accent.error : theme.colors.text.muted}
                          fill={post.is_liked ? theme.colors.accent.error : 'none'}
                        />
                        <Text
                          className="text-sm font-medium"
                          style={{
                            color: post.is_liked
                              ? theme.colors.accent.error
                              : theme.colors.text.muted,
                          }}
                        >
                          {post.likes_count}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-row items-center gap-2"
                        onPress={() =>
                          setCommentingOnPost(commentingOnPost === post.id ? null : post.id)
                        }
                      >
                        <MessageCircle size={20} color={theme.colors.text.muted} />
                        <Text
                          className="text-sm font-medium"
                          style={{ color: theme.colors.text.muted }}
                        >
                          {post.comments_count}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity className="flex-row items-center gap-2">
                        <Share2 size={20} color={theme.colors.text.muted} />
                      </TouchableOpacity>
                    </View>

                    {/* Comment Input */}
                    {commentingOnPost === post.id && (
                      <View
                        className="mt-3 pt-3 border-t"
                        style={{ borderTopColor: theme.colors.ui.border }}
                      >
                        <View className="flex-row items-center gap-2">
                          <TextInput
                            className="flex-1 px-4 py-2 rounded-lg text-base"
                            style={{
                              backgroundColor: theme.colors.background.gray,
                              color: theme.colors.text.primary,
                            }}
                            placeholder="Write a comment..."
                            placeholderTextColor={theme.colors.text.muted}
                            value={commentText}
                            onChangeText={setCommentText}
                            multiline
                          />
                          <TouchableOpacity
                            className="p-2 rounded-lg"
                            style={{
                              backgroundColor: theme.colors.primary.turquoise,
                              opacity: commentText.trim() ? 1 : 0.5,
                            }}
                            onPress={() => handleComment(post.id)}
                            disabled={!commentText.trim() || commentMutation.isPending}
                          >
                            <Send size={20} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
