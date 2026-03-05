import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import type { MediaPipePlatformViewProps } from "./mediapipe-demo.types";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { drawSkeleton } from "@/utils/skeleton-renderer";
import { usePoseDetectionLoop } from "@/hooks/use-pose-detection-loop";
import { useWebPoseSource } from "@/hooks/use-web-pose-source";

interface HeadOrientation {
  pitch: number;
  yaw: number;
  roll: number;
}

export function MediaPipeWebView({
  sendLandmarks,
  wsConnected,
}: MediaPipePlatformViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [poseDetected, setPoseDetected] = useState<boolean>(false);
  const [headOrientation, setHeadOrientation] = useState<HeadOrientation | null>(null);
  const lastOrientationUpdateRef = useRef<number>(0);

  const sendLandmarksRef = useRef(sendLandmarks);
  useEffect(() => {
    sendLandmarksRef.current = sendLandmarks;
  }, [sendLandmarks]);

  const drawLandmarks = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      landmarksList: any[],
      width: number,
      height: number,
    ) => {
      for (const landmarks of landmarksList) {
        const nose = landmarks[0];
        const leftEye = landmarks[2];
        const rightEye = landmarks[5];

        if (nose && leftEye && rightEye) {
          const now = Date.now();
          if (now - lastOrientationUpdateRef.current > 200) {
            lastOrientationUpdateRef.current = now;

            const eyeCenterX = (leftEye.x + rightEye.x) / 2;
            const yaw = Math.atan2(nose.x - eyeCenterX, 0.1) * (180 / Math.PI);
            const eyeCenterY = (leftEye.y + rightEye.y) / 2;
            const pitch = Math.atan2(nose.y - eyeCenterY, 0.1) * (180 / Math.PI);
            const roll =
              Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) *
              (180 / Math.PI);
            setHeadOrientation({ pitch, yaw, roll });
          }
        }

        drawSkeleton(ctx, landmarks, { width, height });
      }
    },
    [],
  );

  const handleDetectionResults = useCallback(
    ({
      ctx,
      results,
      width,
      height,
    }: {
      ctx: CanvasRenderingContext2D;
      results: { landmarks?: unknown[] };
      width: number;
      height: number;
    }) => {
      if (results.landmarks && results.landmarks.length > 0) {
        setPoseDetected(true);
        drawLandmarks(ctx, results.landmarks as any[], width, height);
        sendLandmarksRef.current(results.landmarks);
      } else {
        setPoseDetected(false);
        setHeadOrientation(null);
      }
    },
    [drawLandmarks],
  );

  const { startLoop, stopLoop, resetTimestamp } = usePoseDetectionLoop({
    videoRef,
    canvasRef,
    poseLandmarkerRef,
    onResults: handleDetectionResults,
  });

  const onSourceReset = useCallback(() => {
    setPoseDetected(false);
    setHeadOrientation(null);
  }, []);

  const {
    mode,
    selectedFileName,
    isLoading: sourceLoading,
    error: sourceError,
    loadFile,
    startCamera,
    cleanupSource,
  } = useWebPoseSource({
    videoRef,
    canvasRef,
    poseLandmarkerRef,
    startLoop,
    stopLoop,
    resetTimestamp,
    onSourceReset,
  });

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const { PoseLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
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
        console.error("Error initializing MediaPipe Web:", err);
        setModelError(err instanceof Error ? err.message : "Failed to initialize MediaPipe");
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      cleanupSource();
      if (poseLandmarkerRef.current) poseLandmarkerRef.current.close();
      poseLandmarkerRef.current = null;
    };
  }, [cleanupSource]);

  const handleUploadPress = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    event.target.value = "";
    await loadFile(file);
  };

  const handleUseCameraPress = async () => {
    await startCamera();
  };

  const error = modelError ?? sourceError;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Body Pose Tracking (Web)</ThemedText>
      <ThemedText style={{ color: wsConnected ? "green" : "red" }}>
        WS Status: {wsConnected ? "Connected" : "Disconnected"}
      </ThemedText>
      <View style={styles.sourceRow}>
        <TouchableOpacity
          style={[styles.sourceButton, mode === "camera" && styles.sourceButtonActive]}
          onPress={handleUseCameraPress}
          accessibilityLabel="Use camera"
        >
          <ThemedText style={styles.sourceButtonText}>Camera</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sourceButton, mode === "file" && styles.sourceButtonActive]}
          onPress={handleUploadPress}
          accessibilityLabel="Upload video"
        >
          <ThemedText style={styles.sourceButtonText}>Upload video</ThemedText>
        </TouchableOpacity>
        <input
          ref={fileInputRef as any}
          type="file"
          accept="video/*"
          onChange={handleFileSelected}
          style={{ display: "none" } as any}
        />
      </View>
      {selectedFileName && (
        <ThemedText style={styles.fileHint} numberOfLines={1}>
          Using: {selectedFileName}
        </ThemedText>
      )}
      <ThemedText>
        {!modelReady
          ? "Loading MediaPipe..."
          : sourceLoading
            ? "Preparing video..."
            : mode === "file" && !selectedFileName
              ? "Upload a video to start"
              : poseDetected
                ? "Pose detected!"
                : "No pose detected"}
      </ThemedText>
      {headOrientation && (
        <ThemedView style={styles.orientationContainer}>
          <ThemedText type="defaultSemiBold">Head Orientation:</ThemedText>
          <ThemedText>Pitch: {headOrientation.pitch.toFixed(1)}°</ThemedText>
          <ThemedText>Yaw: {headOrientation.yaw.toFixed(1)}°</ThemedText>
          <ThemedText>Roll: {headOrientation.roll.toFixed(1)}°</ThemedText>
        </ThemedView>
      )}
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      <View style={styles.videoContainer}>
        <video ref={videoRef as any} autoPlay playsInline style={{ display: "none" }} />
        <canvas ref={canvasRef as any} style={styles.canvas} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  sourceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  sourceButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.3)",
    backgroundColor: "rgba(128, 128, 128, 0.08)",
  },
  sourceButtonActive: {
    borderColor: "#007AFF",
    backgroundColor: "rgba(0, 122, 255, 0.12)",
  },
  sourceButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  fileHint: {
    opacity: 0.7,
  },
  videoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    maxWidth: "100%",
    height: "auto",
    borderRadius: 8,
  },
  error: {
    color: "#FF6B6B",
  },
  orientationContainer: {
    padding: 12,
    gap: 4,
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00FFFF",
  },
});
