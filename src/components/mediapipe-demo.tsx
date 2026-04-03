import React from "react";
import { Platform } from "react-native";

import { usePoseLandmarkStreaming } from "@/hooks/use-pose-landmark-streaming";
import type { MediaPipePlatformViewProps } from "./mediapipe-demo.types";

const VIDEO_FPS = 10;

function resolvePlatformView(): React.ComponentType<MediaPipePlatformViewProps> {
  if (Platform.OS === "web") {
    return require("./mediapipe-demo-web-view").MediaPipeWebView;
  }

  return require("./mediapipe-demo-native-view").MediaPipeNativeView;
}

const PlatformMediaPipeView = resolvePlatformView();

export default function MediaPipeDemo() {
  const { sendLandmarks, wsConnected } = usePoseLandmarkStreaming({
    fps: VIDEO_FPS,
  });

  return (
    <PlatformMediaPipeView
      sendLandmarks={sendLandmarks}
      wsConnected={wsConnected}
      videoFps={VIDEO_FPS}
    />
  );
}
