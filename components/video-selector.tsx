import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { listVideos, VideoMetadata } from '@/services/video-parser-api';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface VideoSelectorProps {
  selectedVideoId: string | null;
  onSelectVideo: (videoId: string) => void;
}

const formatDuration = (ms: number | null): string => {
  if (!ms) return 'In progress';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export function VideoSelector({ selectedVideoId, onSelectVideo }: VideoSelectorProps) {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);

    try {
      const videoList = await listVideos();
      setVideos(videoList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = async (id: string) => {
    await Clipboard.setStringAsync(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedVideo = videos.find((v) => v.id === selectedVideoId);

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        type="defaultSemiBold"
        style={styles.label}
      >
        Select Video
      </ThemedText>

      <TouchableOpacity
        style={styles.selector}
        onPress={() => setExpanded(!expanded)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#007AFF"
          />
        ) : selectedVideo ? (
          <View style={styles.selectedVideoInfo}>
            <View style={styles.selectedVideoHeader}>
              <ThemedText
                style={styles.selectedVideoText}
                numberOfLines={1}
              >
                {formatTimestamp(selectedVideo.startTime)}
              </ThemedText>
              <ThemedText style={styles.selectedVideoMeta}>
                {selectedVideo.frameCount} frames • {formatDuration(selectedVideo.duration)}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.copyIdContainer}
              onPress={(e) => {
                e.stopPropagation();
                handleCopyId(selectedVideo.id);
              }}
            >
              <ThemedText
                style={styles.selectedVideoId}
                numberOfLines={1}
              >
                ID: {selectedVideo.id}
              </ThemedText>
              <IconSymbol
                name="doc.on.doc.fill"
                size={14}
                color={copiedId === selectedVideo.id ? '#34C759' : '#808080'}
              />
              {copiedId === selectedVideo.id && <ThemedText style={styles.copiedText}>Copied!</ThemedText>}
            </TouchableOpacity>
          </View>
        ) : (
          <ThemedText style={styles.placeholder}>{error ? 'Error loading videos' : 'Choose a video...'}</ThemedText>
        )}
        <ThemedText style={styles.arrow}>{expanded ? '▲' : '▼'}</ThemedText>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchVideos}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {expanded && !loading && !error && (
        <ScrollView
          style={styles.dropdown}
          nestedScrollEnabled
        >
          {videos.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No videos available</ThemedText>
              <ThemedText style={styles.emptySubtext}>Record some poses to see videos here</ThemedText>
            </View>
          ) : (
            videos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={[styles.videoItem, selectedVideoId === video.id && styles.videoItemSelected]}
                onPress={() => {
                  onSelectVideo(video.id);
                  setExpanded(false);
                }}
              >
                <View style={styles.videoItemHeader}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.videoItemTitle}
                  >
                    {formatTimestamp(video.startTime)}
                  </ThemedText>
                  {!video.endTime && (
                    <View style={styles.recordingBadge}>
                      <ThemedText style={styles.recordingBadgeText}>Recording</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={styles.videoItemMeta}>
                  {video.frameCount} frames • {formatDuration(video.duration)}
                </ThemedText>
                <View style={styles.videoItemIdContainer}>
                  <ThemedText
                    style={styles.videoItemId}
                    numberOfLines={1}
                  >
                    ID: {video.id}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleCopyId(video.id);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <IconSymbol
                      name="doc.on.doc.fill"
                      size={12}
                      color={copiedId === video.id ? '#34C759' : '#808080'}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 8,
    minHeight: 48,
  },
  selectedVideoInfo: {
    flex: 1,
    gap: 4,
  },
  selectedVideoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedVideoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedVideoMeta: {
    fontSize: 12,
    opacity: 0.6,
  },
  copyIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedVideoId: {
    fontSize: 11,
    opacity: 0.5,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  copiedText: {
    fontSize: 10,
    color: '#34C759',
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    fontSize: 14,
    opacity: 0.5,
  },
  arrow: {
    fontSize: 12,
    opacity: 0.6,
    marginLeft: 8,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dropdown: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 8,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  videoItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
    gap: 4,
  },
  videoItemSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  videoItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  videoItemTitle: {
    fontSize: 14,
  },
  recordingBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  recordingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  videoItemMeta: {
    fontSize: 12,
    opacity: 0.6,
  },
  videoItemIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  videoItemId: {
    fontSize: 10,
    opacity: 0.4,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
});
