import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Trophy,
  Target,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  Flame,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { COMMUNITY_POSTS } from '@/constants/mockData';
import { CommunityPost, CommunityFilter } from '@/constants/types';

const FILTERS: CommunityFilter[] = [
  { type: 'all', label: 'All' },
  { type: 'stories', label: 'Stories' },
  { type: 'achievements', label: 'Achievements' },
  { type: 'milestones', label: 'Milestones' },
  { type: 'questions', label: 'Questions' },
  { type: 'tips', label: 'Tips' },
];

export default function CommunityFeedScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<CommunityFilter['type']>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredPosts = useMemo(() => {
    if (selectedFilter === 'all') {
      return COMMUNITY_POSTS;
    }
    return COMMUNITY_POSTS.filter(post => post.type === selectedFilter);
  }, [selectedFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy size={16} color={Colors.accent.warning} strokeWidth={2.5} />;
      case 'milestone':
        return <Target size={16} color={Colors.primary.turquoise} strokeWidth={2.5} />;
      case 'story':
        return <BookOpen size={16} color={Colors.primary.coral} strokeWidth={2.5} />;
      case 'question':
        return <HelpCircle size={16} color={Colors.text.secondary} strokeWidth={2.5} />;
      case 'tip':
        return <Lightbulb size={16} color={Colors.accent.warning} strokeWidth={2.5} />;
      default:
        return null;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return Colors.accent.warning;
      case 'milestone':
        return Colors.primary.turquoise;
      case 'story':
        return Colors.primary.coral;
      case 'question':
        return Colors.text.secondary;
      case 'tip':
        return Colors.accent.warning;
      default:
        return Colors.text.secondary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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

  const renderPost = (post: CommunityPost) => {
    const totalReactions = post.reactions.reduce((sum, r) => sum + r.count, 0);

    return (
      <Pressable
        key={post.id}
        style={[styles.postCard, post.isPinned && styles.pinnedPost]}
        onPress={() => router.push(`/community/${post.id}`)}
      >
        {/* Pinned indicator */}
        {post.isPinned && (
          <View style={styles.pinnedBadge}>
            <Lightbulb size={14} color={Colors.accent.warning} strokeWidth={2.5} />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}

        {/* Author header */}
        <View style={styles.postHeader}>
          <Image
            source={{ uri: post.author.avatarUrl || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <View style={styles.authorInfo}>
            <View style={styles.authorName}>
              <Text style={styles.nameText}>{post.author.name}</Text>
              {post.author.isVerified && (
                <CheckCircle size={16} color={Colors.primary.turquoise} fill={Colors.primary.turquoise} />
              )}
            </View>
            <View style={styles.metaRow}>
              <View style={[styles.skillBadge, { backgroundColor: `${getSkillLevelColor(post.author.skillLevel)}20` }]}>
                <Text style={[styles.skillText, { color: getSkillLevelColor(post.author.skillLevel) }]}>
                  {getSkillLevelLabel(post.author.skillLevel)}
                </Text>
              </View>
              <Text style={styles.timestamp}> • {formatTimestamp(post.createdAt)}</Text>
            </View>
          </View>
          <View style={[styles.typeBadge, { borderColor: getPostTypeColor(post.type) }]}>
            {getPostTypeIcon(post.type)}
          </View>
        </View>

        {/* Achievement display */}
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
              <Trophy size={24} color="rgba(255,255,255,0.8)" strokeWidth={2} />
            </LinearGradient>
          </View>
        )}

        {/* Milestone display */}
        {post.milestone && (
          <View style={styles.milestoneContainer}>
            <View style={styles.milestoneIcon}>
              {post.milestone.type === 'streak' && <Flame size={24} color={Colors.accent.error} strokeWidth={2.5} />}
              {post.milestone.type === 'distance' && <Target size={24} color={Colors.primary.turquoise} strokeWidth={2.5} />}
              {post.milestone.type === 'lesson' && <BookOpen size={24} color={Colors.primary.coral} strokeWidth={2.5} />}
              {post.milestone.type === 'level' && <Trophy size={24} color={Colors.accent.warning} strokeWidth={2.5} />}
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
                source={{ uri: item.thumbnailUrl || item.url }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            ))}
          </View>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {post.tags.length > 3 && (
              <Text style={styles.moreTags}>+{post.tags.length - 3} more</Text>
            )}
          </View>
        )}

        {/* Reactions and Comments */}
        <View style={styles.engagementRow}>
          <View style={styles.reactionsContainer}>
            {post.reactions.slice(0, 3).map((reaction, index) => (
              <View key={index} style={styles.reactionBadge}>
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                <Text style={styles.reactionCount}>{reaction.count}</Text>
              </View>
            ))}
            {totalReactions > 0 && (
              <Text style={styles.totalReactions}>{totalReactions} reactions</Text>
            )}
          </View>
          <View style={styles.commentsContainer}>
            <MessageCircle size={16} color={Colors.text.secondary} strokeWidth={2.5} />
            <Text style={styles.commentCount}>{post.commentCount}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

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
          <Text style={styles.headerTitle}>Community</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTERS.map((filter) => (
            <Pressable
              key={filter.type}
              style={[
                styles.filterChip,
                selectedFilter === filter.type && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.type)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.type && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Posts List */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{COMMUNITY_POSTS.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {COMMUNITY_POSTS.reduce((sum, p) => sum + p.reactions.reduce((s, r) => s + r.count, 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Reactions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {COMMUNITY_POSTS.reduce((sum, p) => sum + p.commentCount, 0)}
              </Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
          </View>

          {/* Posts */}
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => renderPost(post))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No {selectedFilter} posts yet</Text>
              <Text style={styles.emptySubtext}>Check back later for updates!</Text>
            </View>
          )}
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
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.accent.black,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  filterTextActive: {
    color: Colors.text.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.ui.border,
  },
  postCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pinnedPost: {
    borderWidth: 2,
    borderColor: Colors.accent.warning,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: `${Colors.accent.warning}20`,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent.warning,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.light,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  typeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.white,
  },
  achievementContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  achievementGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  achievementIcon: {
    fontSize: 40,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.white,
    marginBottom: 4,
  },
  achievementTier: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  milestoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  milestoneIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  milestoneValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  mediaContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.background.light,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.background.light,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  moreTags: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.background.light,
    borderRadius: 12,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  totalReactions: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  commentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  commentCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.light,
  },
});
