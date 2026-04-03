import React from "react";
import { Platform } from "react-native";

import type { PoseCameraProps } from "./pose-camera.types";

function resolvePlatformView(): React.ComponentType<PoseCameraProps> {
  if (Platform.OS === "web") {
    return require("./pose-camera-web").PoseCameraWeb;
  }

  return require("./pose-camera-native").PoseCameraNative;
}

const PlatformPoseCamera = resolvePlatformView();

export function PoseCamera(props: PoseCameraProps) {
  return <PlatformPoseCamera {...props} />;
}
