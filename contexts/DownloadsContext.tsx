import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoDownload, DownloadStats } from '@/constants/types';
import {
  initializeDownloadsDirectory,
  startDownload,
  deleteDownload,
  calculateDownloadStats,
  formatBytes,
  estimateFileSize,
  getStorageInfo,
} from '@/utils/downloadManager';

interface DownloadsContextType {
  downloads: VideoDownload[];
  stats: DownloadStats;
  storageInfo: {
    totalSpace: number;
    freeSpace: number;
    usedByDownloads: number;
  };
  addDownload: (
    videoId: string,
    lessonId: string,
    title: string,
    duration: number,
    quality: 'low' | 'medium' | 'high' | 'auto',
    thumbnailUrl?: string
  ) => Promise<void>;
  removeDownload: (downloadId: string) => Promise<void>;
  pauseDownload: (downloadId: string) => void;
  resumeDownload: (downloadId: string) => void;
  retryDownload: (downloadId: string) => Promise<void>;
  clearAllDownloads: () => Promise<void>;
  isVideoDownloaded: (videoId: string) => boolean;
  getDownloadByVideoId: (videoId: string) => VideoDownload | undefined;
  refreshStorageInfo: () => Promise<void>;
}

const DownloadsContext = createContext<DownloadsContextType | undefined>(undefined);

const DOWNLOADS_STORAGE_KEY = '@swimease_downloads';

export const DownloadsProvider = ({ children }: { children: ReactNode }) => {
  const [downloads, setDownloads] = useState<VideoDownload[]>([]);
  const [stats, setStats] = useState<DownloadStats>({
    totalDownloads: 0,
    completedDownloads: 0,
    totalSize: 0,
    usedStorage: 0,
    activeDownloads: 0,
  });
  const [storageInfo, setStorageInfo] = useState({
    totalSpace: 0,
    freeSpace: 0,
    usedByDownloads: 0,
  });

  // Load downloads from storage
  useEffect(() => {
    const loadDownloads = async () => {
      try {
        await initializeDownloadsDirectory();
        const stored = await AsyncStorage.getItem(DOWNLOADS_STORAGE_KEY);
        if (stored) {
          const parsedDownloads = JSON.parse(stored);
          setDownloads(parsedDownloads);
          setStats(calculateDownloadStats(parsedDownloads));
        }
      } catch (error) {
        console.error('Error loading downloads:', error);
      }
    };

    loadDownloads();
  }, []);

  // Save downloads to storage whenever they change
  useEffect(() => {
    const saveDownloads = async () => {
      try {
        await AsyncStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(downloads));
        setStats(calculateDownloadStats(downloads));
      } catch (error) {
        console.error('Error saving downloads:', error);
      }
    };

    if (downloads.length > 0) {
      saveDownloads();
    }
  }, [downloads]);

  // Refresh storage info
  const refreshStorageInfo = async () => {
    const info = await getStorageInfo();
    setStorageInfo(info);
  };

  useEffect(() => {
    refreshStorageInfo();
  }, [downloads]);

  // Add new download
  const addDownload = async (
    videoId: string,
    lessonId: string,
    title: string,
    duration: number,
    quality: 'low' | 'medium' | 'high' | 'auto',
    thumbnailUrl?: string
  ) => {
    // Check if already downloaded or downloading
    const existing = downloads.find(d => d.videoId === videoId);
    if (existing) {
      console.log('Video already in downloads');
      return;
    }

    const fileSize = estimateFileSize(duration, quality);
    const downloadId = `download-${Date.now()}-${videoId}`;

    const newDownload: VideoDownload = {
      id: downloadId,
      videoId,
      lessonId,
      title,
      thumbnailUrl,
      duration,
      quality,
      fileSize,
      fileSizeFormatted: formatBytes(fileSize),
      status: 'pending',
      progress: 0,
      downloadedBytes: 0,
    };

    setDownloads(prev => [...prev, newDownload]);

    // Start download
    setTimeout(() => {
      handleStartDownload(newDownload);
    }, 100);
  };

  // Handle download start
  const handleStartDownload = async (download: VideoDownload) => {
    setDownloads(prev =>
      prev.map(d =>
        d.id === download.id
          ? { ...d, status: 'downloading' as const }
          : d
      )
    );

    try {
      const localUri = await startDownload(
        download,
        (progress, downloadedBytes) => {
          setDownloads(prev =>
            prev.map(d =>
              d.id === download.id
                ? { ...d, progress, downloadedBytes }
                : d
            )
          );
        }
      );

      setDownloads(prev =>
        prev.map(d =>
          d.id === download.id
            ? {
                ...d,
                status: 'completed' as const,
                progress: 100,
                localUri,
                downloadedAt: new Date().toISOString(),
              }
            : d
        )
      );
    } catch (error) {
      setDownloads(prev =>
        prev.map(d =>
          d.id === download.id
            ? {
                ...d,
                status: 'failed' as const,
                error: error instanceof Error ? error.message : 'Download failed',
              }
            : d
        )
      );
    }
  };

  // Remove download
  const removeDownload = async (downloadId: string) => {
    const download = downloads.find(d => d.id === downloadId);
    if (!download) return;

    try {
      if (download.status === 'completed') {
        await deleteDownload(download);
      }
      setDownloads(prev => prev.filter(d => d.id !== downloadId));
    } catch (error) {
      console.error('Error removing download:', error);
    }
  };

  // Pause download
  const pauseDownload = (downloadId: string) => {
    setDownloads(prev =>
      prev.map(d =>
        d.id === downloadId && d.status === 'downloading'
          ? { ...d, status: 'paused' as const, pausedAt: new Date().toISOString() }
          : d
      )
    );
  };

  // Resume download
  const resumeDownload = (downloadId: string) => {
    const download = downloads.find(d => d.id === downloadId);
    if (download && download.status === 'paused') {
      handleStartDownload(download);
    }
  };

  // Retry failed download
  const retryDownload = async (downloadId: string) => {
    const download = downloads.find(d => d.id === downloadId);
    if (download && download.status === 'failed') {
      setDownloads(prev =>
        prev.map(d =>
          d.id === downloadId
            ? { ...d, status: 'pending' as const, progress: 0, error: undefined }
            : d
        )
      );
      setTimeout(() => {
        handleStartDownload(download);
      }, 100);
    }
  };

  // Clear all downloads
  const clearAllDownloads = async () => {
    try {
      // Delete all completed downloads
      for (const download of downloads) {
        if (download.status === 'completed') {
          await deleteDownload(download);
        }
      }
      setDownloads([]);
      await AsyncStorage.removeItem(DOWNLOADS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing downloads:', error);
    }
  };

  // Check if video is downloaded
  const isVideoDownloaded = (videoId: string): boolean => {
    const download = downloads.find(d => d.videoId === videoId);
    return download?.status === 'completed';
  };

  // Get download by video ID
  const getDownloadByVideoId = (videoId: string): VideoDownload | undefined => {
    return downloads.find(d => d.videoId === videoId);
  };

  const value: DownloadsContextType = {
    downloads,
    stats,
    storageInfo,
    addDownload,
    removeDownload,
    pauseDownload,
    resumeDownload,
    retryDownload,
    clearAllDownloads,
    isVideoDownloaded,
    getDownloadByVideoId,
    refreshStorageInfo,
  };

  return <DownloadsContext.Provider value={value}>{children}</DownloadsContext.Provider>;
};

export const useDownloads = (): DownloadsContextType => {
  const context = useContext(DownloadsContext);
  if (!context) {
    throw new Error('useDownloads must be used within a DownloadsProvider');
  }
  return context;
};
