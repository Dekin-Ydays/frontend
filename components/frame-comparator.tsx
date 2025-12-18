import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { getVideo, VideoFrame } from '@/services/video-parser-api';
import { drawSkeleton } from '@/utils/skeleton-renderer';
import { VideoSelector } from './video-selector';
import { FrameControls } from './frame-controls';
import { useVideoPlayer } from '@/hooks/use-video-player';

interface FrameComparatorState {
  video1Id: string | null;
  video2Id: string | null;
  frames1: VideoFrame[];
  frames2: VideoFrame[];
  loading1: boolean;
  loading2: boolean;
  error: string | null;
}

interface VideoSelectorSectionProps {
  label: string;
  selectedVideoId: string | null;
  onSelectVideo: (id: string) => void;
}

const VideoSelectorSection = ({ label, selectedVideoId, onSelectVideo }: VideoSelectorSectionProps) => (
  <View style={styles.selectorWrapper}>
    <ThemedText style={styles.selectorLabel}>{label}</ThemedText>
    <VideoSelector
      selectedVideoId={selectedVideoId}
      onSelectVideo={onSelectVideo}
    />
  </View>
);

export function FrameComparator() {
  const [state, setState] = useState<FrameComparatorState>({
    video1Id: null,
    video2Id: null,
    frames1: [],
    frames2: [],
    loading1: false,
    loading2: false,
    error: null,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 480;

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

  const maxFrames = Math.max(state.frames1.length, state.frames2.length);

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
    totalFrames: maxFrames,
    onFrameChange: (index) => renderFrame(index, state.frames1, state.frames2),
  });

  const loadVideo = async (videoId: string, isFirst: boolean) => {
    setState((prev) => ({
      ...prev,
      [isFirst ? 'loading1' : 'loading2']: true,
      error: null,
    }));
    
    // Stop playback and reset
    jumpToStart();

    try {
      const video = await getVideo(videoId);
      
      setState((prev) => {
        const nextState = {
            ...prev,
            [isFirst ? 'video1Id' : 'video2Id']: videoId,
            [isFirst ? 'frames1' : 'frames2']: video.frames,
            [isFirst ? 'loading1' : 'loading2']: false,
        };
        
        // Render initial frame with new data immediately
        renderFrame(0, nextState.frames1, nextState.frames2);
        
        return nextState;
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : `Failed to load video ${isFirst ? '1' : '2'}`,
        [isFirst ? 'loading1' : 'loading2']: false,
      }));
    }
  };

  const handleSelectVideo1 = (videoId: string) => loadVideo(videoId, true);
  const handleSelectVideo2 = (videoId: string) => loadVideo(videoId, false);

  if (Platform.OS !== 'web') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.platformWarning}>
          Frame comparator is currently only supported on web.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.selectorsContainer}>
        <VideoSelectorSection
          label="Reference (Green)"
          selectedVideoId={state.video1Id}
          onSelectVideo={handleSelectVideo1}
        />
        <VideoSelectorSection
          label="Comparison (Red)"
          selectedVideoId={state.video2Id}
          onSelectVideo={handleSelectVideo2}
        />
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
            isPlaying={isPlaying}
            currentFrame={currentFrameIndex}
            totalFrames={maxFrames}
            onPlayPause={togglePlayPause}
            onSeek={seek}
            onNextFrame={nextFrame}
            onPreviousFrame={prevFrame}
            onJumpToStart={jumpToStart}
            onJumpToEnd={jumpToEnd}
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
