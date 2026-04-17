import type {
  Delegate,
  DetectionCallbacks,
  MediaPipeSolution,
  PoseDetectionOptions,
  PoseDetectionResultBundle,
  RunningMode,
} from "react-native-mediapipe-posedetection";

type VisionCameraModule = typeof import("react-native-vision-camera");
type MediaPipePoseDetectionModule =
  typeof import("react-native-mediapipe-posedetection");

export type UsePoseDetectionHook = (
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

export const FALLBACK_POSE_SOLUTION: Partial<MediaPipeSolution> = {
  frameProcessor: undefined,
  cameraViewLayoutChangeHandler: () => {},
  cameraDeviceChangeHandler: () => {},
  cameraOrientationChangedHandler: () => {},
  resizeModeChangeHandler: () => {},
  cameraViewDimensions: { width: 0, height: 0 },
};

export const FALLBACK_RUNNING_MODE = 2 as RunningMode;
export const FALLBACK_DELEGATE = 1 as Delegate;

export const useFallbackPoseDetection: UsePoseDetectionHook = () =>
  FALLBACK_POSE_SOLUTION;

export {
  VisionCamera,
  MediaPipePoseDetection,
  nativeModulesLoadError,
};
