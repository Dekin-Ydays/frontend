import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface FrameControlsProps {
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  onPlayPause: () => void;
  onSeek: (frame: number) => void;
  onNextFrame: () => void;
  onPreviousFrame: () => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
}

export function FrameControls({
  isPlaying,
  currentFrame,
  totalFrames,
  onPlayPause,
  onSeek,
  onNextFrame,
  onPreviousFrame,
  onJumpToStart,
  onJumpToEnd,
}: FrameControlsProps) {
  const maxFrame = Math.max(0, totalFrames - 1);
  const atStart = currentFrame <= 0;
  const atEnd = currentFrame >= maxFrame;

  return (
    <ThemedView style={styles.container}>
      {/* Navigation Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, atStart && styles.buttonDisabled]}
          onPress={onJumpToStart}
          disabled={atStart}
          accessibilityLabel="Jump to start"
        >
          <ThemedText style={styles.buttonText}>⏮</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, atStart && styles.buttonDisabled]}
          onPress={onPreviousFrame}
          disabled={atStart}
          accessibilityLabel="Previous frame"
        >
          <ThemedText style={styles.buttonText}>◄</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playButton}
          onPress={onPlayPause}
          disabled={totalFrames === 0}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        >
          <ThemedText style={styles.playButtonText}>
            {isPlaying ? '⏸' : '▶'}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, atEnd && styles.buttonDisabled]}
          onPress={onNextFrame}
          disabled={atEnd}
          accessibilityLabel="Next frame"
        >
          <ThemedText style={styles.buttonText}>►</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, atEnd && styles.buttonDisabled]}
          onPress={onJumpToEnd}
          disabled={atEnd}
          accessibilityLabel="Jump to end"
        >
          <ThemedText style={styles.buttonText}>⏭</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Timeline Slider */}
      <View style={styles.sliderContainer}>
        {Platform.OS === 'web' ? (
          <input
            aria-label="Frame timeline"
            type="range"
            min={0}
            max={maxFrame}
            step={1}
            value={Math.max(0, Math.min(currentFrame, maxFrame))}
            onChange={(e) => onSeek(Number(e.target.value))}
            style={{ width: '100%', height: 40, accentColor: '#007AFF' } as any}
            disabled={totalFrames === 0}
          />
        ) : (
          <ThemedText style={styles.nativeSliderHint}>
            Timeline scrubbing is currently available on web.
          </ThemedText>
        )}
      </View>

      {/* Frame Counter */}
      <View style={styles.infoRow}>
        <ThemedText style={styles.infoText}>
          Frame: {currentFrame + 1} / {totalFrames}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 18,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  nativeSliderHint: {
    textAlign: 'center',
    opacity: 0.6,
    paddingVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    opacity: 0.8,
  },
});
