import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Constants from "expo-constants";

import type { MediaPipePlatformViewProps } from "./mediapipe-demo.types";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import SkeletonOverlay from "./skeleton-overlay";
import { type Landmark } from "@/utils/skeleton-renderer";

let VisionCamera: any = null;
let MediaPipePoseDetection: any = null;
let nativeModulesLoadError: string | null = null;

try {
  VisionCamera = require("react-native-vision-camera");
} catch (error) {
  if (!nativeModulesLoadError) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    nativeModulesLoadError = `react-native-vision-camera: ${message}`;
  }
}

try {
  MediaPipePoseDetection = require("react-native-mediapipe-posedetection");
} catch (error) {
  if (!nativeModulesLoadError) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    nativeModulesLoadError = `react-native-mediapipe-posedetection: ${message}`;
  }
}

if (!VisionCamera || !MediaPipePoseDetection) {
  console.warn("Failed to load native modules:", nativeModulesLoadError);
}

type PoseLandmarkPayload = Landmark & { presence?: number };

const FALLBACK_POSE_SOLUTION = {
  frameProcessor: undefined,
  cameraViewLayoutChangeHandler: () => {},
  cameraDeviceChangeHandler: () => {},
  cameraOrientationChangedHandler: () => {},
  resizeModeChangeHandler: () => {},
  cameraViewDimensions: { width: 0, height: 0 },
} as const;

export function MediaPipeNativeView({
  sendLandmarks,
  wsConnected,
  videoFps,
}: MediaPipePlatformViewProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [nativeLandmarks, setNativeLandmarks] = useState<PoseLandmarkPayload[]>([]);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const loggedNativeResultsRef = useRef(false);
  const emptyResultCountRef = useRef(0);

  const useCameraDevice = VisionCamera?.useCameraDevice ?? ((..._args: any[]) => null);
  const frontDevice = useCameraDevice("front");
  const backDevice = useCameraDevice("back");
  const device = frontDevice ?? backDevice;

  const usePoseDetection =
    MediaPipePoseDetection?.usePoseDetection ??
    ((_callbacks: any, _runningMode: any, _model: string, _options: any) =>
      FALLBACK_POSE_SOLUTION);
  const runningMode = MediaPipePoseDetection?.RunningMode?.LIVE_STREAM ?? "LIVE_STREAM";
  const delegate = MediaPipePoseDetection?.Delegate?.GPU ?? "GPU";

  const onPoseResults = useCallback(
    (result: any, viewCoordinator?: any) => {
      const resultEntries = Array.isArray(result?.results) ? result.results : [];
      const bundleLandmarks = resultEntries.flatMap((entry: any) =>
        Array.isArray(entry?.landmarks) ? entry.landmarks : [],
      );
      const topLevelLandmarks = Array.isArray(result?.landmarks)
        ? result.landmarks
        : [];
      const poseLandmarks = bundleLandmarks.length > 0 ? bundleLandmarks : topLevelLandmarks;
      const firstPose = Array.isArray(poseLandmarks[0]) ? poseLandmarks[0] : null;

      if (!loggedNativeResultsRef.current) {
        loggedNativeResultsRef.current = true;
        console.log("Native pose result received.", {
          poseCount: poseLandmarks.length,
          firstPoseLandmarkCount: Array.isArray(firstPose) ? firstPose.length : 0,
          hasResultsBundle: resultEntries.length > 0,
        });
      }

      if (!Array.isArray(firstPose) || firstPose.length === 0) {
        emptyResultCountRef.current += 1;
        if (emptyResultCountRef.current % 60 === 0) {
          console.log("Native pose still empty after frames:", emptyResultCountRef.current);
        }
        setNativeLandmarks((previous) => (previous.length === 0 ? previous : []));
        return;
      }
      emptyResultCountRef.current = 0;

      const parserLandmarks: PoseLandmarkPayload[] = firstPose
        .map((landmark: any) => {
          const x = Number(landmark?.x);
          const y = Number(landmark?.y);
          const z = Number(landmark?.z);
          const visibility = Number(landmark?.visibility);
          const presence = Number(landmark?.presence);

          return {
            x,
            y,
            z: Number.isFinite(z) ? z : undefined,
            visibility: Number.isFinite(visibility) ? visibility : undefined,
            presence: Number.isFinite(presence) ? presence : undefined,
          };
        })
        .filter((landmark) => Number.isFinite(landmark.x) && Number.isFinite(landmark.y));

      if (parserLandmarks.length < 33) {
        setNativeLandmarks((previous) => (previous.length === 0 ? previous : []));
        return;
      }

      let overlayLandmarks = parserLandmarks;
      if (
        typeof viewCoordinator?.convertPoint === "function" &&
        typeof viewCoordinator?.getFrameDims === "function" &&
        previewSize.width > 0 &&
        previewSize.height > 0
      ) {
        const frameDims = viewCoordinator.getFrameDims(result);
        overlayLandmarks = parserLandmarks.map((landmark) => {
          const point = viewCoordinator.convertPoint(frameDims, {
            x: landmark.x,
            y: landmark.y,
          });

          return {
            ...landmark,
            x: point.x / previewSize.width,
            y: point.y / previewSize.height,
          };
        });
      }

      setNativeLandmarks(overlayLandmarks);
      sendLandmarks(parserLandmarks);
    },
    [previewSize.height, previewSize.width, sendLandmarks],
  );

  const onPoseError = useCallback((error: any) => {
    const message =
      error && typeof error === "object" && "message" in error
        ? (error as { message?: string }).message
        : String(error);
    console.error("MediaPipe native detection error:", message, error);
  }, []);

  const poseCallbacks = useMemo(
    () => ({ onResults: onPoseResults, onError: onPoseError }),
    [onPoseResults, onPoseError],
  );

  const poseSolution =
    usePoseDetection(
      poseCallbacks,
      runningMode,
      "pose_landmarker_lite.task",
      {
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        shouldOutputSegmentationMasks: false,
        delegate,
        mirrorMode: "mirror-front-only",
        fpsMode: videoFps,
      },
    ) || FALLBACK_POSE_SOLUTION;

  useEffect(() => {
    (async () => {
      if (VisionCamera) {
        const status = await VisionCamera.Camera.requestCameraPermission();
        setHasPermission(status === "granted");
      }
    })();
  }, []);

  useEffect(() => {
    if (poseSolution?.cameraDeviceChangeHandler) {
      poseSolution.cameraDeviceChangeHandler(device ?? undefined);
    }
  }, [poseSolution, device]);

  useEffect(() => {
    poseSolution?.resizeModeChangeHandler?.("cover");
  }, [poseSolution]);

  if (!VisionCamera || !MediaPipePoseDetection) {
    const runningInExpoGo = Constants.appOwnership === "expo";
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.error}>
          {runningInExpoGo
            ? "Native modules are unavailable in Expo Go. Open this app in the iOS development build."
            : "Native modules not loaded."}
        </ThemedText>
        {nativeModulesLoadError ? (
          <ThemedText style={styles.error}>{nativeModulesLoadError}</ThemedText>
        ) : null}
      </ThemedView>
    );
  }

  if (!hasPermission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting permission...</ThemedText>
      </ThemedView>
    );
  }

  if (device == null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>
          {Platform.OS === "ios" && !Constants.isDevice
            ? "No camera found in iOS Simulator. Run this on a physical iPhone (development build)."
            : "No camera found"}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Native Pose Detection</ThemedText>
      <ThemedText style={{ color: wsConnected ? "green" : "red" }}>
        WS Status: {wsConnected ? "Connected" : "Disconnected"}
      </ThemedText>
      <ThemedText>
        Pose landmarks: {nativeLandmarks.length > 0 ? nativeLandmarks.length : 0}
      </ThemedText>

      <View
        style={styles.cameraContainer}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setPreviewSize({ width, height });
          poseSolution.cameraViewLayoutChangeHandler?.(event);
        }}
      >
        <VisionCamera.Camera
          style={styles.camera}
          device={device}
          resizeMode="cover"
          isActive={true}
          frameProcessor={poseSolution.frameProcessor}
          onOutputOrientationChanged={poseSolution.cameraOrientationChangedHandler}
          pixelFormat="rgb"
          photo={true}
        />
        {nativeLandmarks.length > 0 && previewSize.width > 0 && previewSize.height > 0 ? (
          <SkeletonOverlay
            landmarks={nativeLandmarks}
            width={previewSize.width}
            height={previewSize.height}
            mirrored={device?.position === "front"}
          />
        ) : null}
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
  error: {
    color: "#FF6B6B",
  },
  cameraContainer: {
    width: "100%",
    height: 400,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 16,
  },
  camera: {
    flex: 1,
  },
});
