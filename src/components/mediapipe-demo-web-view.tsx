import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type {
  NormalizedLandmark,
  PoseLandmarker,
  PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

import type { MediaPipePlatformViewProps } from "./mediapipe-demo.types";
import { AppText } from "./ui/app-text";
import { uploadVideoFile } from "@/services/video-parser-api";
import { drawSkeleton } from "@/utils/skeleton-renderer";
import { usePoseDetectionLoop } from "@/hooks/use-pose-detection-loop";
import { useWebPoseSource } from "@/hooks/use-web-pose-source";

interface HeadOrientation {
  pitch: number;
  yaw: number;
  roll: number;
}

type SourceVideoUploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; fileId: string; fileName: string }
  | { status: "error"; message: string };

export function MediaPipeWebView({
  sendLandmarks,
  wsConnected,
}: MediaPipePlatformViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [poseDetected, setPoseDetected] = useState<boolean>(false);
  const [headOrientation, setHeadOrientation] =
    useState<HeadOrientation | null>(null);
  const [shouldUploadOriginalVideo, setShouldUploadOriginalVideo] =
    useState(false);
  const [sourceVideoUploadState, setSourceVideoUploadState] =
    useState<SourceVideoUploadState>({ status: "idle" });
  const lastOrientationUpdateRef = useRef<number>(0);

  const sendLandmarksRef = useRef(sendLandmarks);
  useEffect(() => {
    sendLandmarksRef.current = sendLandmarks;
  }, [sendLandmarks]);

  const drawLandmarks = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      landmarksList: NormalizedLandmark[][],
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
            const pitch =
              Math.atan2(nose.y - eyeCenterY, 0.1) * (180 / Math.PI);
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
      results: PoseLandmarkerResult;
      width: number;
      height: number;
    }) => {
      if (results.landmarks && results.landmarks.length > 0) {
        setPoseDetected(true);
        drawLandmarks(ctx, results.landmarks, width, height);
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
  } = useWebPoseSource<PoseLandmarkerResult>({
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
        const { PoseLandmarker, FilesetResolver } =
          await import("@mediapipe/tasks-vision");
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
        setModelError(
          err instanceof Error ? err.message : "Failed to initialize MediaPipe",
        );
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

  const handleSourceVideoUpload = useCallback(async (file: File) => {
    setSourceVideoUploadState({ status: "uploading" });

    try {
      const uploadedVideo = await uploadVideoFile(file);
      setSourceVideoUploadState({
        status: "success",
        fileId: uploadedVideo.id,
        fileName: uploadedVideo.fileName,
      });
    } catch (err) {
      setSourceVideoUploadState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Failed to upload source video",
      });
    }
  }, []);

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    event.target.value = "";
    if (shouldUploadOriginalVideo) {
      void handleSourceVideoUpload(file);
    } else {
      setSourceVideoUploadState({ status: "idle" });
    }
    await loadFile(file);
  };

  const handleUseCameraPress = async () => {
    await startCamera();
  };

  const error = modelError ?? sourceError;

  return (
    <View style={styles.container}>
      <AppText variant="bolderBaseText">Body Pose Tracking (Web)</AppText>
      <Text style={{ color: wsConnected ? "green" : "red" }}>
        WS Status: {wsConnected ? "Connected" : "Disconnected"}
      </Text>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#ffffff",
          fontSize: 14,
        }}
      >
        <input
          type="checkbox"
          checked={shouldUploadOriginalVideo}
          onChange={(event) => {
            setShouldUploadOriginalVideo(event.target.checked);
            setSourceVideoUploadState({ status: "idle" });
          }}
        />
        Send original video file to the parser
      </label>
      <View style={styles.sourceRow}>
        <TouchableOpacity
          style={[
            styles.sourceButton,
            mode === "camera" && styles.sourceButtonActive,
          ]}
          onPress={handleUseCameraPress}
          accessibilityLabel="Use camera"
        >
          <AppText variant="baseText">Camera</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sourceButton,
            mode === "file" && styles.sourceButtonActive,
          ]}
          onPress={handleUploadPress}
          accessibilityLabel="Upload video"
        >
          <AppText variant="baseText">Upload video</AppText>
        </TouchableOpacity>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelected}
          style={{ display: "none" }}
        />
      </View>
      {selectedFileName && (
        <AppText variant="baseText" numberOfLines={1}>
          Using: {selectedFileName}
        </AppText>
      )}
      {sourceVideoUploadState.status === "uploading" && (
        <AppText variant="baseText">Uploading original video file...</AppText>
      )}
      {sourceVideoUploadState.status === "success" && (
        <AppText variant="baseText">
          Source file uploaded: {sourceVideoUploadState.fileName} (
          {sourceVideoUploadState.fileId})
        </AppText>
      )}
      {sourceVideoUploadState.status === "error" && (
        <AppText variant="baseText">
          Source upload failed: {sourceVideoUploadState.message}
        </AppText>
      )}
      <AppText variant="baseText">
        {!modelReady
          ? "Loading MediaPipe..."
          : sourceLoading
            ? "Preparing video..."
            : mode === "file" && !selectedFileName
              ? "Upload a video to start"
              : poseDetected
                ? "Pose detected!"
                : "No pose detected"}
      </AppText>
      {headOrientation && (
        <View style={styles.orientationContainer}>
          <AppText variant="bolderBaseText">Head Orientation:</AppText>
          <AppText variant="baseText">
            Pitch: {headOrientation.pitch.toFixed(1)}°
          </AppText>
          <AppText variant="baseText">
            Yaw: {headOrientation.yaw.toFixed(1)}°
          </AppText>
          <AppText variant="baseText">
            Roll: {headOrientation.roll.toFixed(1)}°
          </AppText>
        </View>
      )}
      {error && <AppText variant="baseText">{error}</AppText>}
      <View style={styles.videoContainer}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ display: "none" }}
        />
        <canvas ref={canvasRef} style={styles.canvas} />
      </View>
    </View>
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
