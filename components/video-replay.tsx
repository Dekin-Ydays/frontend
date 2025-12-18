import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { getVideo, VideoFrame } from '@/services/video-parser-api';
import { drawSkeleton } from '@/utils/skeleton-renderer';
import { VideoSelector } from './video-selector';
import { FrameControls } from './frame-controls';
import { useVideoPlayer } from '@/hooks/use-video-player';

interface VideoReplayState {
  selectedVideoId: string | null;
  frames: VideoFrame[];
  loading: boolean;
  error: string | null;
}

export function VideoReplay() {
  const [state, setState] = useState<VideoReplayState>({
    selectedVideoId: null,
    frames: [],
    loading: false,
    error: null,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 480;

  // Render a specific frame
  const renderFrame = useCallback((frameIndex: number, frames: VideoFrame[]) => {
    if (!canvasRef.current || !frames[frameIndex]) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw skeleton
    drawSkeleton(ctx, frames[frameIndex].landmarks, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    });
  }, []);

  const {
    isPlaying,
    currentFrameIndex,
    togglePlayPause,
    seek,
    nextFrame,
    prevFrame,
    jumpToStart,
    jumpToEnd,
  } = useVideoPlayer({
    totalFrames: state.frames.length,
    onFrameChange: (index) => renderFrame(index, state.frames),
  });

  // Load video when selected
  const handleSelectVideo = async (videoId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    
    // Stop playback and reset
    jumpToStart();

    try {
      const video = await getVideo(videoId);
      setState((prev) => ({
        ...prev,
        selectedVideoId: videoId,
        frames: video.frames,
        loading: false,
      }));

      // Render first frame
      if (video.frames.length > 0) {
        renderFrame(0, video.frames);
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load video',
        loading: false,
      }));
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.platformWarning}>
          Video replay is currently only supported on web. Native support coming soon!
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <VideoSelector
        selectedVideoId={state.selectedVideoId}
        onSelectVideo={handleSelectVideo}
      />

      {state.loading && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading video...</ThemedText>
        </View>
      )}

      {state.error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{state.error}</ThemedText>
        </View>
      )}

      {!state.loading && !state.error && state.frames.length > 0 && (
        <>
          <View style={styles.canvasContainer}>
            <canvas
              ref={canvasRef as any}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={styles.canvas}
            />
          </View>

          <FrameControls
            isPlaying={isPlaying}
            currentFrame={currentFrameIndex}
            totalFrames={state.frames.length}
            onPlayPause={togglePlayPause}
            onSeek={seek}
            onNextFrame={nextFrame}
            onPreviousFrame={prevFrame}
            onJumpToStart={jumpToStart}
            onJumpToEnd={jumpToEnd}
          />
        </>
      )}

      {!state.loading && !state.error && state.selectedVideoId && state.frames.length === 0 && (
        <View style={styles.centerContent}>
          <ThemedText style={styles.emptyText}>This video has no frames</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            The recording may have been incomplete
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    opacity: 0.6,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
  canvasContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  canvas: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  platformWarning: {
    padding: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
