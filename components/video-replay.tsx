import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { getVideo, VideoFrame } from '@/services/video-parser-api';
import { drawSkeleton } from '@/utils/skeleton-renderer';
import { VideoSelector } from './video-selector';
import { FrameControls } from './frame-controls';

interface VideoReplayState {
  selectedVideoId: string | null;
  frames: VideoFrame[];
  loading: boolean;
  error: string | null;
  isPlaying: boolean;
  currentFrameIndex: number;
}

export function VideoReplay() {
  const [state, setState] = useState<VideoReplayState>({
    selectedVideoId: null,
    frames: [],
    loading: false,
    error: null,
    isPlaying: false,
    currentFrameIndex: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 480;
  const TARGET_FPS = 30; // MediaPipe default frame rate

  // Load video when selected
  const handleSelectVideo = async (videoId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null, isPlaying: false }));

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    lastFrameTimeRef.current = 0;

    try {
      const video = await getVideo(videoId);
      setState((prev) => ({
        ...prev,
        selectedVideoId: videoId,
        frames: video.frames,
        loading: false,
        currentFrameIndex: 0,
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

  // Animation loop for playback
  useEffect(() => {
    if (!state.isPlaying || state.frames.length === 0) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const frameInterval = 1000 / TARGET_FPS;

    const animate = (currentTime: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = currentTime;
      }

      const elapsed = currentTime - lastFrameTimeRef.current;

      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = currentTime;

        setState((prev) => {
          const nextIndex = prev.currentFrameIndex + 1;
          if (nextIndex >= prev.frames.length) {
            const lastIndex = Math.max(0, prev.frames.length - 1);
            renderFrame(lastIndex, prev.frames);
            return { ...prev, isPlaying: false, currentFrameIndex: lastIndex };
          }

          renderFrame(nextIndex, prev.frames);
          return { ...prev, currentFrameIndex: nextIndex };
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isPlaying, state.frames, renderFrame]);

  // Playback control handlers
  const handlePlayPause = () => {
    setState((prev) => {
      const maxIndex = Math.max(0, prev.frames.length - 1);
      const nextIsPlaying = !prev.isPlaying;

      if (!nextIsPlaying) return { ...prev, isPlaying: false };

      lastFrameTimeRef.current = 0;

      if (prev.currentFrameIndex >= maxIndex && prev.frames.length > 0) {
        renderFrame(0, prev.frames);
        return { ...prev, isPlaying: true, currentFrameIndex: 0 };
      }

      return { ...prev, isPlaying: true };
    });
  };

  const handleSeek = (frameIndex: number) => {
    const normalizedIndex = Math.floor(Math.max(0, Math.min(frameIndex, state.frames.length - 1)));
    lastFrameTimeRef.current = 0;
    setState((prev) => ({ ...prev, currentFrameIndex: normalizedIndex, isPlaying: false }));
    renderFrame(normalizedIndex, state.frames);
  };

  const handleNextFrame = () => {
    const nextIndex = Math.min(state.currentFrameIndex + 1, state.frames.length - 1);
    handleSeek(nextIndex);
  };

  const handlePreviousFrame = () => {
    const prevIndex = Math.max(state.currentFrameIndex - 1, 0);
    handleSeek(prevIndex);
  };

  const handleJumpToStart = () => {
    handleSeek(0);
  };

  const handleJumpToEnd = () => {
    handleSeek(state.frames.length - 1);
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
            isPlaying={state.isPlaying}
            currentFrame={state.currentFrameIndex}
            totalFrames={state.frames.length}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onNextFrame={handleNextFrame}
            onPreviousFrame={handlePreviousFrame}
            onJumpToStart={handleJumpToStart}
            onJumpToEnd={handleJumpToEnd}
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
