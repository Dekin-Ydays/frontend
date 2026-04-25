import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from "react-native";
import { Canvas, Circle, Line, vec } from "@shopify/react-native-skia";

import { AppText } from "./ui/app-text";
import { VideoSelector } from "./video-selector";
import { FrameControls } from "./frame-controls";
import { useVideoPlayer } from "@/hooks/use-video-player";
import { getVideo, VideoFrame } from "@/services/video-parser-api";
import { projectSkeleton } from "@/utils/skeleton-renderer";

const CANVAS_ASPECT_RATIO = 4 / 3;

interface FrameComparatorNativeProps {
  initialReferenceId?: string;
  initialComparisonId?: string;
}

export function FrameComparatorNative({
  initialReferenceId,
  initialComparisonId,
}: FrameComparatorNativeProps = {}) {
  const [referenceId, setReferenceId] = useState<string | null>(
    initialReferenceId ?? null,
  );
  const [comparisonId, setComparisonId] = useState<string | null>(
    initialComparisonId ?? null,
  );
  const [referenceFrames, setReferenceFrames] = useState<VideoFrame[]>([]);
  const [comparisonFrames, setComparisonFrames] = useState<VideoFrame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const handleCanvasLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setCanvasSize({ width, height: width / CANVAS_ASPECT_RATIO });
    }
  }, []);

  const loadFrames = useCallback(
    async (id: string, target: "reference" | "comparison") => {
      setError(null);
      setLoading(true);
      try {
        const video = await getVideo(id);
        if (target === "reference") {
          setReferenceFrames(video.frames);
          setReferenceId(id);
        } else {
          setComparisonFrames(video.frames);
          setComparisonId(id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to load ${target} video`,
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (initialReferenceId) {
      void loadFrames(initialReferenceId, "reference");
    }
    if (initialComparisonId) {
      void loadFrames(initialComparisonId, "comparison");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxFrames = Math.max(referenceFrames.length, comparisonFrames.length);

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
    onFrameChange: () => {},
  });

  const referenceDrawn = useMemo(
    () =>
      projectSkeleton(
        referenceFrames[currentFrameIndex]?.landmarks,
        canvasSize.width,
        canvasSize.height,
      ),
    [referenceFrames, currentFrameIndex, canvasSize],
  );
  const comparisonDrawn = useMemo(
    () =>
      projectSkeleton(
        comparisonFrames[currentFrameIndex]?.landmarks,
        canvasSize.width,
        canvasSize.height,
      ),
    [comparisonFrames, currentFrameIndex, canvasSize],
  );

  const hasContent =
    referenceFrames.length > 0 || comparisonFrames.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.selectorWrapper}>
        <AppText variant="baseText">Reference (green)</AppText>
        <VideoSelector
          selectedVideoId={referenceId}
          onSelectVideo={(id) => void loadFrames(id, "reference")}
        />
      </View>
      <View style={styles.selectorWrapper}>
        <AppText variant="baseText">Comparison (red)</AppText>
        <VideoSelector
          selectedVideoId={comparisonId}
          onSelectVideo={(id) => void loadFrames(id, "comparison")}
        />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#007AFF" />
          <AppText variant="baseText">Loading frames…</AppText>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <AppText variant="baseText">{error}</AppText>
        </View>
      ) : null}

      {hasContent ? (
        <>
          <View
            style={styles.canvasWrapper}
            onLayout={handleCanvasLayout}
          >
            <Canvas style={styles.canvas} pointerEvents="none">
              {referenceDrawn.lines.map((l) => (
                <Line
                  key={`ref-${l.key}`}
                  p1={vec(l.p1.x, l.p1.y)}
                  p2={vec(l.p2.x, l.p2.y)}
                  strokeWidth={3}
                  color="#00FF00"
                />
              ))}
              {referenceDrawn.joints.map((j) => (
                <Circle
                  key={`ref-${j.key}`}
                  cx={j.cx}
                  cy={j.cy}
                  r={4}
                  color="#00CC00"
                />
              ))}
              {comparisonDrawn.lines.map((l) => (
                <Line
                  key={`cmp-${l.key}`}
                  p1={vec(l.p1.x, l.p1.y)}
                  p2={vec(l.p2.x, l.p2.y)}
                  strokeWidth={3}
                  color="#FF4500"
                />
              ))}
              {comparisonDrawn.joints.map((j) => (
                <Circle
                  key={`cmp-${j.key}`}
                  cx={j.cx}
                  cy={j.cy}
                  r={4}
                  color="#FF0000"
                />
              ))}
            </Canvas>
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
      ) : !loading && !error ? (
        <AppText variant="baseText">
          Pick two videos above to compare their skeletons.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  selectorWrapper: {
    gap: 4,
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  errorBox: {
    padding: 16,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.4)",
    borderWidth: 1,
    borderRadius: 8,
  },
  canvasWrapper: {
    width: "100%",
    aspectRatio: CANVAS_ASPECT_RATIO,
    backgroundColor: "#000",
    borderRadius: 8,
    alignSelf: "center",
    overflow: "hidden",
  },
  canvas: {
    flex: 1,
  },
});
