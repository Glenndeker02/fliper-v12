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
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Download,
  Trash2,
  Pause,
  Play,
  RefreshCw,
  HardDrive,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useDownloads } from '@/contexts/DownloadsContext';
import { formatBytes } from '@/utils/downloadManager';

export default function DownloadsScreen() {
  const router = useRouter();
  const {
    downloads,
    stats,
    storageInfo,
    removeDownload,
    pauseDownload,
    resumeDownload,
    retryDownload,
    clearAllDownloads,
  } = useDownloads();

  const [filter, setFilter] = useState<'all' | 'completed' | 'downloading'>('all');

  const filteredDownloads = downloads.filter(download => {
    if (filter === 'all') return true;
    if (filter === 'completed') return download.status === 'completed';
    if (filter === 'downloading')
      return download.status === 'downloading' || download.status === 'pending';
    return true;
  });

  const handleDelete = (downloadId: string, title: string) => {
    Alert.alert(
      'Delete Download',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeDownload(downloadId),
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (stats.completedDownloads === 0) {
      Alert.alert('No Downloads', 'You have no completed downloads to clear.');
      return;
    }

    Alert.alert(
      'Clear All Downloads',
      `This will delete ${stats.completedDownloads} completed download(s) and free up ${formatBytes(stats.usedStorage)}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllDownloads,
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={20} color={Colors.accent.success} strokeWidth={2.5} />;
      case 'downloading':
      case 'pending':
        return <Download size={20} color={Colors.primary.turquoise} strokeWidth={2.5} />;
      case 'failed':
        return <AlertCircle size={20} color={Colors.accent.error} strokeWidth={2.5} />;
      case 'paused':
        return <Pause size={20} color={Colors.accent.warning} strokeWidth={2.5} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Downloaded';
      case 'downloading':
        return 'Downloading...';
      case 'pending':
        return 'Queued';
      case 'failed':
        return 'Failed';
      case 'paused':
        return 'Paused';
      default:
        return status;
    }
  };

  const renderDownload = (download: any) => {
    const isActive = download.status === 'downloading' || download.status === 'pending';
    const isCompleted = download.status === 'completed';
    const isFailed = download.status === 'failed';
    const isPaused = download.status === 'paused';

    return (
      <View key={download.id} style={styles.downloadCard}>
        {/* Thumbnail */}
        {download.thumbnailUrl ? (
          <Image
            source={{ uri: download.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Download size={24} color={Colors.text.light} strokeWidth={2.5} />
          </View>
        )}

        {/* Content */}
        <View style={styles.downloadContent}>
          {/* Title & Status */}
          <View style={styles.headerRow}>
            <Text style={styles.downloadTitle} numberOfLines={2}>
              {download.title}
            </Text>
            {getStatusIcon(download.status)}
          </View>

          {/* Progress Bar */}
          {isActive && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${download.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(download.progress)}%</Text>
            </View>
          )}

          {/* Info Row */}
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>
              {download.quality.toUpperCase()} • {download.fileSizeFormatted}
            </Text>
            {isCompleted && download.downloadedAt && (
              <Text style={styles.dateText}>
                {new Date(download.downloadedAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          {/* Status Text */}
          <Text style={[styles.statusText, isFailed && styles.statusTextError]}>
            {getStatusText(download.status)}
            {isFailed && download.error && `: ${download.error}`}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {isActive && (
              <Pressable
                style={styles.actionButton}
                onPress={() => pauseDownload(download.id)}
              >
                <Pause size={16} color={Colors.primary.turquoise} strokeWidth={2.5} />
                <Text style={styles.actionButtonText}>Pause</Text>
              </Pressable>
            )}

            {isPaused && (
              <Pressable
                style={styles.actionButton}
                onPress={() => resumeDownload(download.id)}
              >
                <Play size={16} color={Colors.primary.turquoise} strokeWidth={2.5} />
                <Text style={styles.actionButtonText}>Resume</Text>
              </Pressable>
            )}

            {isFailed && (
              <Pressable
                style={styles.actionButton}
                onPress={() => retryDownload(download.id)}
              >
                <RefreshCw size={16} color={Colors.primary.turquoise} strokeWidth={2.5} />
                <Text style={styles.actionButtonText}>Retry</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(download.id, download.title)}
            >
              <Trash2 size={16} color={Colors.accent.error} strokeWidth={2.5} />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
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
          <Text style={styles.headerTitle}>Downloads</Text>
          <Pressable style={styles.clearButton} onPress={handleClearAll}>
            <Trash2 size={20} color={Colors.text.primary} strokeWidth={2.5} />
          </Pressable>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Download size={20} color={Colors.primary.turquoise} strokeWidth={2.5} />
            <Text style={styles.statValue}>{stats.totalDownloads}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={styles.statCard}>
            <CheckCircle2 size={20} color={Colors.accent.success} strokeWidth={2.5} />
            <Text style={styles.statValue}>{stats.completedDownloads}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statCard}>
            <HardDrive size={20} color={Colors.accent.warning} strokeWidth={2.5} />
            <Text style={styles.statValue}>{formatBytes(stats.usedStorage)}</Text>
            <Text style={styles.statLabel}>Used</Text>
          </View>
        </View>

        {/* Storage Info */}
        {storageInfo.totalSpace > 0 && (
          <View style={styles.storageCard}>
            <View style={styles.storageHeader}>
              <HardDrive size={18} color={Colors.text.primary} strokeWidth={2.5} />
              <Text style={styles.storageTitle}>Storage</Text>
            </View>
            <View style={styles.storageBar}>
              <View
                style={[
                  styles.storageBarFill,
                  {
                    width: `${(storageInfo.usedByDownloads / storageInfo.totalSpace) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.storageInfo}>
              <Text style={styles.storageText}>
                {formatBytes(storageInfo.usedByDownloads)} of {formatBytes(storageInfo.totalSpace)}
              </Text>
              <Text style={styles.storageText}>
                {formatBytes(storageInfo.freeSpace)} free
              </Text>
            </View>
          </View>
        )}

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <Pressable
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[styles.filterText, filter === 'all' && styles.filterTextActive]}
            >
              All ({downloads.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, filter === 'completed' && styles.filterChipActive]}
            onPress={() => setFilter('completed')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'completed' && styles.filterTextActive,
              ]}
            >
              Completed ({stats.completedDownloads})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, filter === 'downloading' && styles.filterChipActive]}
            onPress={() => setFilter('downloading')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'downloading' && styles.filterTextActive,
              ]}
            >
              Active ({stats.activeDownloads})
            </Text>
          </Pressable>
        </View>

        {/* Downloads List */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredDownloads.length > 0 ? (
            filteredDownloads.map(download => renderDownload(download))
          ) : (
            <View style={styles.emptyState}>
              <Download size={48} color={Colors.text.light} strokeWidth={2} />
              <Text style={styles.emptyText}>
                {filter === 'all' && 'No downloads yet'}
                {filter === 'completed' && 'No completed downloads'}
                {filter === 'downloading' && 'No active downloads'}
              </Text>
              <Text style={styles.emptySubtext}>
                Download lessons to watch offline
              </Text>
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
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  storageCard: {
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  storageBar: {
    height: 8,
    backgroundColor: Colors.background.light,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.turquoise,
    borderRadius: 4,
  },
  storageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storageText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.white,
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
  downloadCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    gap: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.background.light,
  },
  thumbnailPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  downloadTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 20,
    marginRight: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.background.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.turquoise,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.turquoise,
    minWidth: 35,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.light,
  },
  statusText: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  statusTextError: {
    color: Colors.accent.error,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.background.light,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary.turquoise,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  deleteButtonText: {
    color: Colors.accent.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.light,
  },
});
