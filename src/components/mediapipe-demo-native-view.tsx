import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import type { CameraPosition } from "react-native-vision-camera";
import type {
  Delegate,
  DetectionCallbacks,
  DetectionError,
  Landmark as NativePoseLandmark,
  MediaPipeSolution,
  PoseDetectionOptions,
  PoseDetectionResultBundle,
  RunningMode,
  ViewCoordinator,
} from "react-native-mediapipe-posedetection";

import type { MediaPipePlatformViewProps } from "./mediapipe-demo.types";
import { AppText } from "./ui/app-text";
import SkeletonOverlay from "./skeleton-overlay";
import { type Landmark } from "@/utils/skeleton-renderer";

type VisionCameraModule = typeof import("react-native-vision-camera");
type MediaPipePoseDetectionModule =
  typeof import("react-native-mediapipe-posedetection");
type UsePoseDetectionHook = (
  callbacks: DetectionCallbacks<PoseDetectionResultBundle>,
  runningMode: RunningMode,
  modelAssetPath: string,
  options?: Partial<PoseDetectionOptions>,
) => PoseSolutionLike;

let VisionCamera: VisionCameraModule | null = null;
let MediaPipePoseDetection: MediaPipePoseDetectionModule | null = null;
let nativeModulesLoadError: string | null = null;

try {
  VisionCamera = require("react-native-vision-camera");
} catch (error) {
  if (!nativeModulesLoadError) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    nativeModulesLoadError = `react-native-vision-camera: ${message}`;
  }
}

try {
  MediaPipePoseDetection = require("react-native-mediapipe-posedetection");
} catch (error) {
  if (!nativeModulesLoadError) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    nativeModulesLoadError = `react-native-mediapipe-posedetection: ${message}`;
  }
}

if (!VisionCamera || !MediaPipePoseDetection) {
  console.warn("Failed to load native modules:", nativeModulesLoadError);
}

type PoseLandmarkPayload = Landmark & { presence?: number };

type PoseSolutionLike = Partial<MediaPipeSolution>;

const FALLBACK_POSE_SOLUTION: PoseSolutionLike = {
  frameProcessor: undefined,
  cameraViewLayoutChangeHandler: () => {},
  cameraDeviceChangeHandler: () => {},
  cameraOrientationChangedHandler: () => {},
  resizeModeChangeHandler: () => {},
  cameraViewDimensions: { width: 0, height: 0 },
};

const FALLBACK_RUNNING_MODE = 2 as RunningMode;
const FALLBACK_DELEGATE = 1 as Delegate;

const useFallbackPoseDetection: UsePoseDetectionHook = () =>
  FALLBACK_POSE_SOLUTION;

export function MediaPipeNativeView({
  sendLandmarks,
  wsConnected,
  videoFps,
}: MediaPipePlatformViewProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [nativeLandmarks, setNativeLandmarks] = useState<PoseLandmarkPayload[]>(
    [],
  );
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const loggedNativeResultsRef = useRef(false);
  const emptyResultCountRef = useRef(0);

  const useCameraDevice =
    VisionCamera?.useCameraDevice ?? ((_position: CameraPosition) => undefined);
  const frontDevice = useCameraDevice("front");
  const backDevice = useCameraDevice("back");
  const device = frontDevice ?? backDevice;

  const usePoseDetection =
    (MediaPipePoseDetection?.usePoseDetection as
      | UsePoseDetectionHook
      | undefined) ?? useFallbackPoseDetection;
  const runningMode =
    MediaPipePoseDetection?.RunningMode?.LIVE_STREAM ?? FALLBACK_RUNNING_MODE;
  const delegate = MediaPipePoseDetection?.Delegate?.GPU ?? FALLBACK_DELEGATE;

  const onPoseResults = useCallback(
    (result: PoseDetectionResultBundle, viewCoordinator: ViewCoordinator) => {
      const poseLandmarks = result.results.flatMap((entry) => entry.landmarks);
      const firstPose = poseLandmarks[0];

      if (!loggedNativeResultsRef.current) {
        loggedNativeResultsRef.current = true;
        console.log("Native pose result received.", {
          poseCount: poseLandmarks.length,
          firstPoseLandmarkCount: firstPose?.length ?? 0,
          hasResultsBundle: result.results.length > 0,
        });
      }

      if (!firstPose || firstPose.length === 0) {
        emptyResultCountRef.current += 1;
        if (emptyResultCountRef.current % 60 === 0) {
          console.log(
            "Native pose still empty after frames:",
            emptyResultCountRef.current,
          );
        }
        setNativeLandmarks((previous) =>
          previous.length === 0 ? previous : [],
        );
        return;
      }
      emptyResultCountRef.current = 0;

      const parserLandmarks: PoseLandmarkPayload[] = firstPose
        .map((landmark: NativePoseLandmark) => {
          const x = Number(landmark.x);
          const y = Number(landmark.y);
          const z = Number(landmark.z);
          const visibility = Number(landmark.visibility);
          const presence = Number(landmark.presence);

          return {
            x,
            y,
            z: Number.isFinite(z) ? z : undefined,
            visibility: Number.isFinite(visibility) ? visibility : undefined,
            presence: Number.isFinite(presence) ? presence : undefined,
          };
        })
        .filter(
          (landmark) =>
            Number.isFinite(landmark.x) && Number.isFinite(landmark.y),
        );

      if (parserLandmarks.length < 33) {
        setNativeLandmarks((previous) =>
          previous.length === 0 ? previous : [],
        );
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

  const onPoseError = useCallback((error: DetectionError) => {
    console.error("MediaPipe native detection error:", error.message, error);
  }, []);

  const poseCallbacks = useMemo<DetectionCallbacks<PoseDetectionResultBundle>>(
    () => ({ onResults: onPoseResults, onError: onPoseError }),
    [onPoseResults, onPoseError],
  );

  const poseOptions: Partial<PoseDetectionOptions> = useMemo(
    () => ({
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      shouldOutputSegmentationMasks: false,
      delegate,
      mirrorMode: "mirror-front-only",
      fpsMode: videoFps,
    }),
    [delegate, videoFps],
  );

  const poseSolution = usePoseDetection(
    poseCallbacks,
    runningMode,
    "pose_landmarker_lite.task",
    poseOptions,
  );

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
      <View style={styles.container}>
        <AppText variant="baseText">
          {runningInExpoGo
            ? "Native modules are unavailable in Expo Go. Open this app in the iOS development build."
            : "Native modules not loaded."}
        </AppText>
        {nativeModulesLoadError ? (
          <AppText variant="baseText">{nativeModulesLoadError}</AppText>
        ) : null}
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <AppText variant="baseText">Requesting permission...</AppText>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <AppText variant="baseText">
          {Platform.OS === "ios" && !Constants.isDevice
            ? "No camera found in iOS Simulator. Run this on a physical iPhone (development build)."
            : "No camera found"}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppText variant="bolderBaseText">Native Pose Detection</AppText>
      <Text style={{ color: wsConnected ? "green" : "red" }}>
        WS Status: {wsConnected ? "Connected" : "Disconnected"}
      </Text>
      <AppText variant="baseText">
        Pose landmarks:{" "}
        {nativeLandmarks.length > 0 ? nativeLandmarks.length : 0}
      </AppText>

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
          onOutputOrientationChanged={
            poseSolution.cameraOrientationChangedHandler
          }
          pixelFormat="rgb"
          photo={true}
        />
        {nativeLandmarks.length > 0 &&
        previewSize.width > 0 &&
        previewSize.height > 0 ? (
          <SkeletonOverlay
            landmarks={nativeLandmarks}
            width={previewSize.width}
            height={previewSize.height}
            mirrored={device?.position === "front"}
          />
        ) : null}
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
