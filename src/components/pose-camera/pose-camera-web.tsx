import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import type {
  PoseLandmarker,
  PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

import SkeletonOverlay from "@/components/skeleton-overlay";
import { AppText } from "@/components/ui/app-text";
import { usePoseDetectionLoop } from "@/hooks/use-pose-detection-loop";
import { type Landmark } from "@/utils/skeleton-renderer";
import type { PoseCameraProps } from "./pose-camera.types";

export function PoseCameraWeb({ onLandmarks }: PoseCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isFocused = useIsFocused();
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });

  const onLandmarksRef = useRef(onLandmarks);
  useEffect(() => {
    onLandmarksRef.current = onLandmarks;
  }, [onLandmarks]);

  const fpsStartTimeRef = useRef<number | null>(null);
  const fpsFrameCountRef = useRef(0);
  const fpsLoggedRef = useRef(false);

  useEffect(() => {
    if (!isFocused) {
      fpsStartTimeRef.current = null;
      fpsFrameCountRef.current = 0;
      fpsLoggedRef.current = false;
    }
  }, [isFocused]);

  const handleDetectionResults = useCallback(
    ({ results }: { results: PoseLandmarkerResult }) => {
      if (!fpsLoggedRef.current) {
        const now = performance.now();
        if (fpsStartTimeRef.current === null) {
          fpsStartTimeRef.current = now;
          fpsFrameCountRef.current = 0;
        }
        fpsFrameCountRef.current += 1;
        const elapsed = now - fpsStartTimeRef.current;
        if (elapsed >= 1000) {
          const fps = (fpsFrameCountRef.current * 1000) / elapsed;
          console.log(`[PoseCamera] measured FPS: ${fps.toFixed(1)}`);
          fpsLoggedRef.current = true;
        }
      }

      const first = results.landmarks?.[0];
      if (!first || first.length < 33) {
        setLandmarks((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      const mapped: Landmark[] = first.map((l) => ({
        x: l.x,
        y: l.y,
        z: l.z,
        visibility: l.visibility,
      }));

      setLandmarks(mapped);
      onLandmarksRef.current?.(mapped);
    },
    [],
  );

  const { startLoop, stopLoop, resetTimestamp } = usePoseDetectionLoop({
    videoRef,
    canvasRef,
    poseLandmarkerRef,
    onResults: handleDetectionResults,
  });

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const { PoseLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
          },
        );

        if (cancelled) return;
        setModelReady(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize MediaPipe",
        );
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      stopLoop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
      poseLandmarkerRef.current = null;
    };
  }, [stopLoop]);

  useEffect(() => {
    if (!modelReady) return;
    if (!isFocused) {
      stopLoop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setLandmarks([]);
      return;
    }

    let cancelled = false;

    const startCamera = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;

        video.addEventListener(
          "loadeddata",
          () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            setOverlaySize({
              width: video.videoWidth,
              height: video.videoHeight,
            });
            resetTimestamp();
            startLoop();
            void video.play().catch(() => {});
          },
          { once: true },
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start camera");
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
    };
  }, [modelReady, isFocused, resetTimestamp, startLoop, stopLoop]);

  return (
    <View style={styles.container}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={styles.video as React.CSSProperties}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {overlaySize.width > 0 && landmarks.length > 0 ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <SkeletonOverlay
            landmarks={landmarks}
            width={overlaySize.width}
            height={overlaySize.height}
            mirrored
          />
        </View>
      ) : null}
      {!modelReady && !error ? (
        <View style={styles.statusOverlay} pointerEvents="none">
          <AppText variant="baseText">Loading MediaPipe...</AppText>
        </View>
      ) : null}
      {error ? (
        <View style={styles.statusOverlay} pointerEvents="none">
          <AppText variant="baseText">{error}</AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: "scaleX(-1)",
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
