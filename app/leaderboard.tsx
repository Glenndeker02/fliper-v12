import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, TrendingUp, Crown, Award } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getLeaderboard,
  getUserRank,
  getLeaderboardEntry,
  LeaderboardPeriod,
} from '@/utils/supabase';
import { supabase } from '@/utils/supabase';

export default function LeaderboardScreen() {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('all-time');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // Fetch leaderboard data
  const {
    data: leaderboardData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['leaderboard', selectedPeriod],
    queryFn: () => getLeaderboard(selectedPeriod, 100),
    staleTime: 30000, // 30 seconds
  });

  // Fetch user's rank
  const { data: userRank } = useQuery({
    queryKey: ['user-rank', selectedPeriod, currentUserId],
    queryFn: () => (currentUserId ? getUserRank(currentUserId, selectedPeriod) : null),
    enabled: !!currentUserId,
  });

  // Fetch user's leaderboard entry
  const { data: userEntry } = useQuery({
    queryKey: ['user-leaderboard-entry', currentUserId],
    queryFn: () => (currentUserId ? getLeaderboardEntry(currentUserId) : null),
    enabled: !!currentUserId,
  });

  const handlePeriodChange = (period: LeaderboardPeriod) => {
    setSelectedPeriod(period);
  };

  const getPeriodXP = (entry: any) => {
    if (selectedPeriod === 'weekly') return entry.weekly_xp || 0;
    if (selectedPeriod === 'monthly') return entry.monthly_xp || 0;
    return entry.total_xp || 0;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={24} color="#FFD700" />;
    if (rank === 2) return <Medal size={24} color="#C0C0C0" />;
    if (rank === 3) return <Medal size={24} color="#CD7F32" />;
    return <Award size={20} color={theme.colors.text.muted} />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return theme.colors.text.secondary;
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background.gray }}>
      <Stack.Screen
        options={{
          title: 'Leaderboard',
          headerStyle: { backgroundColor: theme.colors.background.white },
          headerTintColor: theme.colors.text.primary,
          headerShadowVisible: false,
        }}
      />

      {/* Period Selector Tabs */}
      <View
        className="flex-row p-4 gap-2"
        style={{ backgroundColor: theme.colors.background.white }}
      >
        <TouchableOpacity
          className="flex-1 py-3 rounded-lg items-center"
          style={{
            backgroundColor:
              selectedPeriod === 'weekly'
                ? theme.colors.primary.turquoise
                : theme.colors.ui.border,
          }}
          onPress={() => handlePeriodChange('weekly')}
        >
          <Text
            className="font-semibold"
            style={{
              color:
                selectedPeriod === 'weekly'
                  ? '#FFFFFF'
                  : theme.colors.text.secondary,
            }}
          >
            Weekly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-3 rounded-lg items-center"
          style={{
            backgroundColor:
              selectedPeriod === 'monthly'
                ? theme.colors.primary.turquoise
                : theme.colors.ui.border,
          }}
          onPress={() => handlePeriodChange('monthly')}
        >
          <Text
            className="font-semibold"
            style={{
              color:
                selectedPeriod === 'monthly'
                  ? '#FFFFFF'
                  : theme.colors.text.secondary,
            }}
          >
            Monthly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 py-3 rounded-lg items-center"
          style={{
            backgroundColor:
              selectedPeriod === 'all-time'
                ? theme.colors.primary.turquoise
                : theme.colors.ui.border,
          }}
          onPress={() => handlePeriodChange('all-time')}
        >
          <Text
            className="font-semibold"
            style={{
              color:
                selectedPeriod === 'all-time'
                  ? '#FFFFFF'
                  : theme.colors.text.secondary,
            }}
          >
            All-Time
          </Text>
        </TouchableOpacity>
      </View>

      {/* User's Rank Card */}
      {currentUserId && userRank && userEntry && (
        <View
          className="mx-4 mt-4 p-4 rounded-xl"
          style={{
            backgroundColor: theme.colors.primary.turquoise,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-sm font-medium mb-1">Your Rank</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-white text-3xl font-bold">#{userRank}</Text>
                <TrendingUp size={24} color="#FFFFFF" />
              </View>
            </View>
            <View className="items-end">
              <Text className="text-white text-sm font-medium mb-1">
                {selectedPeriod === 'weekly'
                  ? 'Weekly XP'
                  : selectedPeriod === 'monthly'
                  ? 'Monthly XP'
                  : 'Total XP'}
              </Text>
              <Text className="text-white text-2xl font-bold">
                {getPeriodXP(userEntry).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Leaderboard List */}
      <ScrollView
        className="flex-1 mt-4"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary.turquoise}
          />
        }
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={theme.colors.primary.turquoise} />
            <Text
              className="mt-4 text-base"
              style={{ color: theme.colors.text.muted }}
            >
              Loading leaderboard...
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-20 px-8">
            <Trophy size={64} color={theme.colors.text.muted} />
            <Text
              className="mt-4 text-lg font-semibold text-center"
              style={{ color: theme.colors.text.primary }}
            >
              Unable to Load Leaderboard
            </Text>
            <Text
              className="mt-2 text-base text-center"
              style={{ color: theme.colors.text.muted }}
            >
              Please check your connection and try again.
            </Text>
            <TouchableOpacity
              className="mt-6 px-6 py-3 rounded-lg"
              style={{ backgroundColor: theme.colors.primary.turquoise }}
              onPress={() => refetch()}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : !leaderboardData || leaderboardData.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-8">
            <Trophy size={64} color={theme.colors.text.muted} />
            <Text
              className="mt-4 text-lg font-semibold text-center"
              style={{ color: theme.colors.text.primary }}
            >
              No Leaderboard Data
            </Text>
            <Text
              className="mt-2 text-base text-center"
              style={{ color: theme.colors.text.muted }}
            >
              Start earning XP to appear on the leaderboard!
            </Text>
          </View>
        ) : (
          <View className="px-4 pb-8">
            {/* Top 3 Podium (if at least 3 users) */}
            {leaderboardData.length >= 3 && (
              <View className="mb-6">
                <Text
                  className="text-xl font-bold mb-4"
                  style={{ color: theme.colors.text.primary }}
                >
                  Top 3 Champions
                </Text>
                <View className="flex-row justify-between items-end gap-2">
                  {/* 2nd Place */}
                  <View className="flex-1 items-center">
                    <View
                      className="w-16 h-16 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: '#C0C0C0' }}
                    >
                      <Medal size={32} color="#FFFFFF" />
                    </View>
                    <Text
                      className="font-bold text-base text-center"
                      style={{ color: theme.colors.text.primary }}
                      numberOfLines={1}
                    >
                      {leaderboardData[1]?.user_profiles?.name || 'Anonymous'}
                    </Text>
                    <Text
                      className="text-sm font-semibold mt-1"
                      style={{ color: '#C0C0C0' }}
                    >
                      #{2}
                    </Text>
                    <Text
                      className="text-xs mt-1"
                      style={{ color: theme.colors.text.muted }}
                    >
                      {getPeriodXP(leaderboardData[1]).toLocaleString()} XP
                    </Text>
                  </View>

                  {/* 1st Place */}
                  <View className="flex-1 items-center">
                    <View
                      className="w-20 h-20 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: '#FFD700' }}
                    >
                      <Crown size={40} color="#FFFFFF" />
                    </View>
                    <Text
                      className="font-bold text-lg text-center"
                      style={{ color: theme.colors.text.primary }}
                      numberOfLines={1}
                    >
                      {leaderboardData[0]?.user_profiles?.name || 'Anonymous'}
                    </Text>
                    <Text
                      className="text-base font-semibold mt-1"
                      style={{ color: '#FFD700' }}
                    >
                      #{1}
                    </Text>
                    <Text
                      className="text-sm font-bold mt-1"
                      style={{ color: '#FFD700' }}
                    >
                      {getPeriodXP(leaderboardData[0]).toLocaleString()} XP
                    </Text>
                  </View>

                  {/* 3rd Place */}
                  <View className="flex-1 items-center">
                    <View
                      className="w-16 h-16 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: '#CD7F32' }}
                    >
                      <Medal size={32} color="#FFFFFF" />
                    </View>
                    <Text
                      className="font-bold text-base text-center"
                      style={{ color: theme.colors.text.primary }}
                      numberOfLines={1}
                    >
                      {leaderboardData[2]?.user_profiles?.name || 'Anonymous'}
                    </Text>
                    <Text
                      className="text-sm font-semibold mt-1"
                      style={{ color: '#CD7F32' }}
                    >
                      #{3}
                    </Text>
                    <Text
                      className="text-xs mt-1"
                      style={{ color: theme.colors.text.muted }}
                    >
                      {getPeriodXP(leaderboardData[2]).toLocaleString()} XP
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Full Leaderboard List */}
            <View>
              <Text
                className="text-lg font-bold mb-3"
                style={{ color: theme.colors.text.primary }}
              >
                All Rankings
              </Text>
              {leaderboardData.map((entry, index) => {
                const isCurrentUser = entry.user_id === currentUserId;
                const rank = index + 1;

                return (
                  <View
                    key={entry.id}
                    className="flex-row items-center p-4 mb-2 rounded-lg"
                    style={{
                      backgroundColor: isCurrentUser
                        ? theme.colors.primary.turquoise + '20'
                        : theme.colors.background.white,
                      borderWidth: isCurrentUser ? 2 : 0,
                      borderColor: isCurrentUser
                        ? theme.colors.primary.turquoise
                        : 'transparent',
                    }}
                  >
                    {/* Rank */}
                    <View className="w-12 items-center">
                      {rank <= 3 ? (
                        getRankIcon(rank)
                      ) : (
                        <Text
                          className="text-base font-bold"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          #{rank}
                        </Text>
                      )}
                    </View>

                    {/* User Name */}
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-base font-semibold"
                        style={{
                          color: isCurrentUser
                            ? theme.colors.primary.turquoise
                            : theme.colors.text.primary,
                        }}
                        numberOfLines={1}
                      >
                        {entry.user_profiles?.name || 'Anonymous'}
                        {isCurrentUser && ' (You)'}
                      </Text>
                      {entry.streak > 0 && (
                        <Text
                          className="text-xs mt-1"
                          style={{ color: theme.colors.text.muted }}
                        >
                          🔥 {entry.streak}-day streak
                        </Text>
                      )}
                    </View>

                    {/* XP */}
                    <View className="items-end">
                      <Text
                        className="text-base font-bold"
                        style={{
                          color: rank <= 3 ? getRankColor(rank) : theme.colors.text.primary,
                        }}
                      >
                        {getPeriodXP(entry).toLocaleString()}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: theme.colors.text.muted }}
                      >
                        XP
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
