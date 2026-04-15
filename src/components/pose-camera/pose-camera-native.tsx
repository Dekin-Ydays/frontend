import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { useIsFocused } from "@react-navigation/native";
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

import SkeletonOverlay from "@/components/skeleton-overlay";
import { AppText } from "@/components/ui/app-text";
import { type Landmark } from "@/utils/skeleton-renderer";
import type { PoseCameraProps } from "./pose-camera.types";

type VisionCameraModule = typeof import("react-native-vision-camera");
type MediaPipePoseDetectionModule =
  typeof import("react-native-mediapipe-posedetection");
type UsePoseDetectionHook = (
  callbacks: DetectionCallbacks<PoseDetectionResultBundle>,
  runningMode: RunningMode,
  modelAssetPath: string,
  options?: Partial<PoseDetectionOptions>,
) => Partial<MediaPipeSolution>;

let VisionCamera: VisionCameraModule | null = null;
let MediaPipePoseDetection: MediaPipePoseDetectionModule | null = null;
let nativeModulesLoadError: string | null = null;

try {
  VisionCamera = require("react-native-vision-camera");
} catch (error) {
  nativeModulesLoadError = `react-native-vision-camera: ${
    error instanceof Error ? error.message : JSON.stringify(error)
  }`;
}

try {
  MediaPipePoseDetection = require("react-native-mediapipe-posedetection");
} catch (error) {
  if (!nativeModulesLoadError) {
    nativeModulesLoadError = `react-native-mediapipe-posedetection: ${
      error instanceof Error ? error.message : JSON.stringify(error)
    }`;
  }
}

const FALLBACK_POSE_SOLUTION: Partial<MediaPipeSolution> = {
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

export function PoseCameraNative({ onLandmarks }: PoseCameraProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const isFocused = useIsFocused();

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
      if (!fpsLoggedRef.current) {
        const now = Date.now();
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

      const poseLandmarks = result.results.flatMap((entry) => entry.landmarks);
      const firstPose = poseLandmarks[0];

      if (!firstPose || firstPose.length < 33) {
        setLandmarks((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      const parserLandmarks: Landmark[] = firstPose
        .map((landmark: NativePoseLandmark) => {
          const x = Number(landmark.x);
          const y = Number(landmark.y);
          const z = Number(landmark.z);
          const visibility = Number(landmark.visibility);

          return {
            x,
            y,
            z: Number.isFinite(z) ? z : undefined,
            visibility: Number.isFinite(visibility) ? visibility : undefined,
          };
        })
        .filter((l) => Number.isFinite(l.x) && Number.isFinite(l.y));

      if (parserLandmarks.length < 33) {
        setLandmarks((prev) => (prev.length === 0 ? prev : []));
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
        overlayLandmarks = parserLandmarks.map((l) => {
          const point = viewCoordinator.convertPoint(frameDims, {
            x: l.x,
            y: l.y,
          });
          return {
            ...l,
            x: point.x / previewSize.width,
            y: point.y / previewSize.height,
          };
        });
      }

      setLandmarks(overlayLandmarks);
      onLandmarksRef.current?.(parserLandmarks);
    },
    [previewSize.height, previewSize.width],
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
      fpsMode: "none",
    }),
    [delegate],
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
    poseSolution?.cameraDeviceChangeHandler?.(device ?? undefined);
  }, [poseSolution, device]);

  useEffect(() => {
    poseSolution?.resizeModeChangeHandler?.("cover");
  }, [poseSolution]);

  if (!VisionCamera || !MediaPipePoseDetection) {
    const runningInExpoGo = Constants.appOwnership === "expo";
    return (
      <View style={styles.message}>
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
      <View style={styles.message}>
        <AppText variant="baseText">Requesting camera permission...</AppText>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.message}>
        <AppText variant="baseText">
          {Platform.OS === "ios" && !Constants.isDevice
            ? "No camera found in iOS Simulator. Run on a physical device."
            : "No camera found"}
        </AppText>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setPreviewSize({ width, height });
        poseSolution.cameraViewLayoutChangeHandler?.(event);
      }}
    >
      <VisionCamera.Camera
        style={StyleSheet.absoluteFill}
        device={device}
        resizeMode="cover"
        isActive={isFocused}
        frameProcessor={poseSolution.frameProcessor}
        onOutputOrientationChanged={poseSolution.cameraOrientationChangedHandler}
        pixelFormat="rgb"
        photo={true}
      />
      {landmarks.length > 0 &&
      previewSize.width > 0 &&
      previewSize.height > 0 ? (
        <SkeletonOverlay
          landmarks={landmarks}
          width={previewSize.width}
          height={previewSize.height}
          mirrored={device?.position === "front"}
        />
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
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },
});
