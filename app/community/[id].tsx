import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Trophy,
  Target,
  BookOpen,
  CheckCircle,
  Flame,
  PartyPopper,
  ThumbsUp,
  Zap,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { COMMUNITY_POSTS } from '@/constants/mockData';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const post = COMMUNITY_POSTS.find(p => p.id === id);

  const [userReactions, setUserReactions] = useState<Set<string>>(
    new Set(post?.reactions.filter(r => r.userReacted).map(r => r.type) || [])
  );

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
          <Pressable style={styles.backButtonError} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const getSkillLevelColor = (level: string) => {
    if (level.includes('beginner')) return Colors.accent.success;
    if (level.includes('intermediate')) return Colors.accent.warning;
    if (level.includes('advanced')) return Colors.accent.error;
    return Colors.text.secondary;
  };

  const getSkillLevelLabel = (level: string) => {
    const parts = level.split('-');
    if (parts.length === 2) {
      return `${parts[0].charAt(0).toUpperCase()}${parts[0].slice(1)} ${parts[1]}`;
    }
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return ['#CD7F32', '#B87333'];
      case 'silver':
        return ['#C0C0C0', '#A8A8A8'];
      case 'gold':
        return ['#FFD700', '#FFA500'];
      case 'platinum':
        return ['#E5E4E2', '#BCC6CC'];
      default:
        return [Colors.primary.turquoise, Colors.primary.coral];
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const handleReaction = (reactionType: string) => {
    const newReactions = new Set(userReactions);
    if (newReactions.has(reactionType)) {
      newReactions.delete(reactionType);
    } else {
      newReactions.add(reactionType);
    }
    setUserReactions(newReactions);

    // In production, this would call an API to save the reaction
    Alert.alert('Reaction Added!', `You reacted with ${reactionType}`);
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={24} color={Colors.accent.error} strokeWidth={2.5} />;
      case 'celebrate':
        return <PartyPopper size={24} color={Colors.accent.warning} strokeWidth={2.5} />;
      case 'support':
        return <ThumbsUp size={24} color={Colors.primary.turquoise} strokeWidth={2.5} />;
      case 'motivate':
        return <Zap size={24} color={Colors.primary.coral} strokeWidth={2.5} />;
      default:
        return null;
    }
  };

  const totalReactions = post.reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primary.gradient1, Colors.primary.gradient2]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.postCard}>
            {/* Author Header */}
            <View style={styles.postHeader}>
              <Image
                source={{ uri: post.author.avatarUrl || 'https://via.placeholder.com/150' }}
                style={styles.avatar}
              />
              <View style={styles.authorInfo}>
                <View style={styles.authorName}>
                  <Text style={styles.nameText}>{post.author.name}</Text>
                  {post.author.isVerified && (
                    <CheckCircle
                      size={18}
                      color={Colors.primary.turquoise}
                      fill={Colors.primary.turquoise}
                    />
                  )}
                </View>
                <View style={styles.metaRow}>
                  <View
                    style={[
                      styles.skillBadge,
                      { backgroundColor: `${getSkillLevelColor(post.author.skillLevel)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.skillText,
                        { color: getSkillLevelColor(post.author.skillLevel) },
                      ]}
                    >
                      {getSkillLevelLabel(post.author.skillLevel)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Timestamp */}
            <Text style={styles.timestamp}>{formatTimestamp(post.createdAt)}</Text>

            {/* Achievement Display */}
            {post.achievement && (
              <View style={styles.achievementContainer}>
                <LinearGradient
                  colors={getTierGradient(post.achievement.tier)}
                  style={styles.achievementGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.achievementIcon}>{post.achievement.icon}</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{post.achievement.title}</Text>
                    <Text style={styles.achievementTier}>
                      {post.achievement.tier.toUpperCase()} ACHIEVEMENT
                    </Text>
                  </View>
                  <Trophy size={32} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                </LinearGradient>
              </View>
            )}

            {/* Milestone Display */}
            {post.milestone && (
              <View style={styles.milestoneContainer}>
                <View style={styles.milestoneIcon}>
                  {post.milestone.type === 'streak' && (
                    <Flame size={32} color={Colors.accent.error} strokeWidth={2.5} />
                  )}
                  {post.milestone.type === 'distance' && (
                    <Target size={32} color={Colors.primary.turquoise} strokeWidth={2.5} />
                  )}
                  {post.milestone.type === 'lesson' && (
                    <BookOpen size={32} color={Colors.primary.coral} strokeWidth={2.5} />
                  )}
                  {post.milestone.type === 'level' && (
                    <Trophy size={32} color={Colors.accent.warning} strokeWidth={2.5} />
                  )}
                </View>
                <View style={styles.milestoneInfo}>
                  <Text style={styles.milestoneLabel}>{post.milestone.label}</Text>
                  <Text style={styles.milestoneValue}>{post.milestone.value}</Text>
                </View>
              </View>
            )}

            {/* Content */}
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <View style={styles.mediaContainer}>
                {post.media.map((item, index) => (
                  <Image
                    key={index}
                    source={{ uri: item.url }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {post.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Engagement Stats */}
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>{totalReactions} reactions</Text>
              <Text style={styles.statsText}>{post.commentCount} comments</Text>
            </View>

            {/* Reaction Buttons */}
            <View style={styles.reactionsBar}>
              {post.reactions.map((reaction) => (
                <Pressable
                  key={reaction.type}
                  style={[
                    styles.reactionButton,
                    userReactions.has(reaction.type) && styles.reactionButtonActive,
                  ]}
                  onPress={() => handleReaction(reaction.type)}
                >
                  {getReactionIcon(reaction.type)}
                  <Text
                    style={[
                      styles.reactionLabel,
                      userReactions.has(reaction.type) && styles.reactionLabelActive,
                    ]}
                  >
                    {reaction.emoji} {reaction.type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsSectionHeader}>
              <MessageCircle size={20} color={Colors.text.primary} strokeWidth={2.5} />
              <Text style={styles.commentsSectionTitle}>
                Comments ({post.commentCount})
              </Text>
            </View>

            <View style={styles.commentsPlaceholder}>
              <Text style={styles.commentsPlaceholderText}>
                Comments feature coming soon!
              </Text>
              <Text style={styles.commentsPlaceholderSubtext}>
                In the next update, you'll be able to read and write comments.
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  postCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.light,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  achievementContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  achievementGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  achievementIcon: {
    fontSize: 48,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.white,
    marginBottom: 4,
  },
  achievementTier: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  milestoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 20,
  },
  milestoneIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  milestoneValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  mediaContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.background.light,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.background.light,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.ui.border,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  reactionsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background.light,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.background.light,
  },
  reactionButtonActive: {
    borderColor: Colors.primary.turquoise,
    backgroundColor: `${Colors.primary.turquoise}10`,
  },
  reactionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  reactionLabelActive: {
    color: Colors.primary.turquoise,
  },
  commentsSection: {
    backgroundColor: Colors.background.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  commentsPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  commentsPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  commentsPlaceholderSubtext: {
    fontSize: 14,
    color: Colors.text.light,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  backButtonError: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.accent.black,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
});
