import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { getVideo, VideoFrame } from '@/services/video-parser-api';
import { drawSkeleton } from '@/utils/skeleton-renderer';
import { VideoSelector } from './video-selector';
import { FrameControls } from './frame-controls';

interface FrameComparatorState {
  video1Id: string | null;
  video2Id: string | null;
  frames1: VideoFrame[];
  frames2: VideoFrame[];
  loading1: boolean;
  loading2: boolean;
  error: string | null;
  isPlaying: boolean;
  currentFrameIndex: number;
}

export function FrameComparator() {
  const [state, setState] = useState<FrameComparatorState>({
    video1Id: null,
    video2Id: null,
    frames1: [],
    frames2: [],
    loading1: false,
    loading2: false,
    error: null,
    isPlaying: false,
    currentFrameIndex: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 480;
  const TARGET_FPS = 30;

  const handleSelectVideo1 = async (videoId: string) => {
    setState((prev) => ({ ...prev, loading1: true, error: null, isPlaying: false }));
    try {
      const video = await getVideo(videoId);
      setState((prev) => ({
        ...prev,
        video1Id: videoId,
        frames1: video.frames,
        loading1: false,
        currentFrameIndex: 0,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load video 1',
        loading1: false,
      }));
    }
  };

  const handleSelectVideo2 = async (videoId: string) => {
    setState((prev) => ({ ...prev, loading2: true, error: null, isPlaying: false }));
    try {
      const video = await getVideo(videoId);
      setState((prev) => ({
        ...prev,
        video2Id: videoId,
        frames2: video.frames,
        loading2: false,
        currentFrameIndex: 0,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load video 2',
        loading2: false,
      }));
    }
  };

  const renderFrame = useCallback((frameIndex: number, frames1: VideoFrame[], frames2: VideoFrame[]) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Video 1 (Reference) - Green
    if (frames1[frameIndex]) {
      drawSkeleton(ctx, frames1[frameIndex].landmarks, {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        lineColor: '#00FF00', // Green
        pointColor: '#00CC00',
      });
    }

    // Draw Video 2 (Comparison) - Red/Orange
    // If frames2 is shorter, it just won't draw after its end
    if (frames2[frameIndex]) {
      drawSkeleton(ctx, frames2[frameIndex].landmarks, {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        lineColor: '#FF4500', // OrangeRed
        pointColor: '#FF0000',
      });
    }
  }, []);

  // Effect to render initial frame when videos are loaded
  useEffect(() => {
    if (!state.isPlaying && (state.frames1.length > 0 || state.frames2.length > 0)) {
        renderFrame(state.currentFrameIndex, state.frames1, state.frames2);
    }
  }, [state.frames1, state.frames2, state.currentFrameIndex, renderFrame, state.isPlaying]);


  useEffect(() => {
    if (!state.isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const maxFrames = Math.max(state.frames1.length, state.frames2.length);
    if (maxFrames === 0) return;

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
          const maxLen = Math.max(prev.frames1.length, prev.frames2.length);
          
          if (nextIndex >= maxLen) {
             // Loop or stop? Let's stop at end.
             const lastIndex = Math.max(0, maxLen - 1);
             renderFrame(lastIndex, prev.frames1, prev.frames2);
             return { ...prev, isPlaying: false, currentFrameIndex: lastIndex };
          }

          renderFrame(nextIndex, prev.frames1, prev.frames2);
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
  }, [state.isPlaying, state.frames1, state.frames2, renderFrame]);

  const handlePlayPause = () => {
    setState((prev) => {
      const maxLen = Math.max(prev.frames1.length, prev.frames2.length);
      const nextIsPlaying = !prev.isPlaying;

      if (!nextIsPlaying) return { ...prev, isPlaying: false };

      lastFrameTimeRef.current = 0;

      if (prev.currentFrameIndex >= maxLen - 1 && maxLen > 0) {
        renderFrame(0, prev.frames1, prev.frames2);
        return { ...prev, isPlaying: true, currentFrameIndex: 0 };
      }

      return { ...prev, isPlaying: true };
    });
  };

  const handleSeek = (frameIndex: number) => {
    const maxLen = Math.max(state.frames1.length, state.frames2.length);
    const normalizedIndex = Math.floor(Math.max(0, Math.min(frameIndex, maxLen - 1)));
    lastFrameTimeRef.current = 0;
    setState((prev) => ({ ...prev, currentFrameIndex: normalizedIndex, isPlaying: false }));
    renderFrame(normalizedIndex, state.frames1, state.frames2);
  };

  const handleNextFrame = () => {
    const maxLen = Math.max(state.frames1.length, state.frames2.length);
    const nextIndex = Math.min(state.currentFrameIndex + 1, maxLen - 1);
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
    const maxLen = Math.max(state.frames1.length, state.frames2.length);
    handleSeek(maxLen - 1);
  };

  if (Platform.OS !== 'web') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.platformWarning}>
          Frame comparator is currently only supported on web.
        </ThemedText>
      </ThemedView>
    );
  }

  const maxFrames = Math.max(state.frames1.length, state.frames2.length);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.selectorsContainer}>
        <View style={styles.selectorWrapper}>
            <ThemedText style={styles.selectorLabel}>Reference (Green)</ThemedText>
            <VideoSelector
                selectedVideoId={state.video1Id}
                onSelectVideo={handleSelectVideo1}
            />
        </View>
        <View style={styles.selectorWrapper}>
            <ThemedText style={styles.selectorLabel}>Comparison (Red)</ThemedText>
            <VideoSelector
                selectedVideoId={state.video2Id}
                onSelectVideo={handleSelectVideo2}
            />
        </View>
      </View>

      {(state.loading1 || state.loading2) && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading videos...</ThemedText>
        </View>
      )}

      {state.error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{state.error}</ThemedText>
        </View>
      )}

      {!state.loading1 && !state.loading2 && !state.error && (state.frames1.length > 0 || state.frames2.length > 0) && (
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
            totalFrames={maxFrames}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onNextFrame={handleNextFrame}
            onPreviousFrame={handlePreviousFrame}
            onJumpToStart={handleJumpToStart}
            onJumpToEnd={handleJumpToEnd}
          />
        </>
      )}
      
       {!state.loading1 && !state.loading2 && !state.error && state.frames1.length === 0 && state.frames2.length === 0 && (
         <View style={styles.centerContent}>
            <ThemedText style={styles.emptySubtext}>Select videos to compare them</ThemedText>
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
  selectorsContainer: {
    gap: 12,
  },
  selectorWrapper: {
    gap: 4,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
