import * as FileSystem from 'expo-file-system';
import { VideoDownload, DownloadQueueItem, DownloadStats } from '@/constants/types';

// Directory for downloaded videos
const DOWNLOADS_DIR = `${FileSystem.documentDirectory}downloads/`;

// Ensure downloads directory exists
export const initializeDownloadsDirectory = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
  }
};

// Format bytes to human-readable size
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

// Estimate file size based on duration and quality
export const estimateFileSize = (durationInSeconds: number, quality: string): number => {
  // Average bitrates in bits per second
  const bitrates = {
    low: 500_000, // 500 kbps
    medium: 1_500_000, // 1.5 Mbps
    high: 3_000_000, // 3 Mbps
    auto: 1_500_000, // Default to medium
  };

  const bitrate = bitrates[quality as keyof typeof bitrates] || bitrates.medium;
  return (durationInSeconds * bitrate) / 8; // Convert bits to bytes
};

// Get storage info
export const getStorageInfo = async (): Promise<{
  totalSpace: number;
  freeSpace: number;
  usedByDownloads: number;
}> => {
  try {
    await initializeDownloadsDirectory();

    // Get free disk space
    const freeSpace = await FileSystem.getFreeDiskStorageAsync();
    const totalSpace = await FileSystem.getTotalDiskCapacityAsync();

    // Calculate space used by downloads
    const files = await FileSystem.readDirectoryAsync(DOWNLOADS_DIR);
    let usedByDownloads = 0;

    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${DOWNLOADS_DIR}${file}`);
      if (fileInfo.exists && 'size' in fileInfo) {
        usedByDownloads += fileInfo.size;
      }
    }

    return {
      totalSpace,
      freeSpace,
      usedByDownloads,
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      totalSpace: 0,
      freeSpace: 0,
      usedByDownloads: 0,
    };
  }
};

// Start download
export const startDownload = async (
  download: VideoDownload,
  onProgress: (progress: number, downloadedBytes: number) => void
): Promise<string> => {
  await initializeDownloadsDirectory();

  const localUri = `${DOWNLOADS_DIR}${download.id}.mp4`;

  try {
    // In a real app, this would be the actual video URL from your backend
    // For now, using a placeholder
    const videoUrl = `https://example.com/videos/${download.videoId}.mp4`;

    const downloadResumable = FileSystem.createDownloadResumable(
      videoUrl,
      localUri,
      {},
      (downloadProgress) => {
        const progress = (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100;
        onProgress(progress, downloadProgress.totalBytesWritten);
      }
    );

    const result = await downloadResumable.downloadAsync();

    if (result) {
      return result.uri;
    }

    throw new Error('Download failed');
  } catch (error) {
    console.error('Error downloading video:', error);
    throw error;
  }
};

// Pause download (for future implementation)
export const pauseDownload = async (downloadId: string): Promise<void> => {
  // Implementation would use FileSystem.createDownloadResumable's pause method
  console.log('Pause download:', downloadId);
};

// Resume download (for future implementation)
export const resumeDownload = async (downloadId: string): Promise<void> => {
  // Implementation would use FileSystem.createDownloadResumable's resume method
  console.log('Resume download:', downloadId);
};

// Cancel download
export const cancelDownload = async (download: VideoDownload): Promise<void> => {
  const localUri = `${DOWNLOADS_DIR}${download.id}.mp4`;

  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localUri);
    }
  } catch (error) {
    console.error('Error canceling download:', error);
  }
};

// Delete download
export const deleteDownload = async (download: VideoDownload): Promise<void> => {
  if (!download.localUri) return;

  try {
    const fileInfo = await FileSystem.getInfoAsync(download.localUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(download.localUri);
    }
  } catch (error) {
    console.error('Error deleting download:', error);
    throw error;
  }
};

// Check if video is downloaded
export const isVideoDownloaded = async (downloadId: string): Promise<boolean> => {
  const localUri = `${DOWNLOADS_DIR}${downloadId}.mp4`;

  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    return fileInfo.exists;
  } catch (error) {
    return false;
  }
};

// Get all downloaded videos
export const getAllDownloads = async (): Promise<string[]> => {
  try {
    await initializeDownloadsDirectory();
    const files = await FileSystem.readDirectoryAsync(DOWNLOADS_DIR);
    return files.filter(file => file.endsWith('.mp4'));
  } catch (error) {
    console.error('Error getting downloads:', error);
    return [];
  }
};

// Calculate download stats
export const calculateDownloadStats = (downloads: VideoDownload[]): DownloadStats => {
  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const activeDownloads = downloads.filter(
    d => d.status === 'downloading' || d.status === 'pending'
  );

  const totalSize = downloads.reduce((sum, d) => sum + d.fileSize, 0);
  const usedStorage = completedDownloads.reduce((sum, d) => sum + d.fileSize, 0);

  return {
    totalDownloads: downloads.length,
    completedDownloads: completedDownloads.length,
    totalSize,
    usedStorage,
    activeDownloads: activeDownloads.length,
  };
};

// Clear all downloads
export const clearAllDownloads = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(DOWNLOADS_DIR);
      await initializeDownloadsDirectory();
    }
  } catch (error) {
    console.error('Error clearing downloads:', error);
    throw error;
  }
};
