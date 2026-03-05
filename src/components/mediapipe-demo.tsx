import React, { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

import { encodePoseLandmarksPacket } from "@/services/pose-landmarks-protobuf";
import { getVideoParserWsUrl } from "@/services/video-parser-endpoints";
import { useReconnectingWebSocket } from "@/hooks/use-reconnecting-websocket";
import type { PoseLandmarksPayload } from "@/types/pose-landmarks";
import type { MediaPipePlatformViewProps } from "./mediapipe-demo.types";

const WS_URL = getVideoParserWsUrl("/ws");
const VIDEO_FPS = 10;

function resolvePlatformView(): React.ComponentType<MediaPipePlatformViewProps> {
  if (Platform.OS === "web") {
    return require("./mediapipe-demo-web-view").MediaPipeWebView;
  }

  return require("./mediapipe-demo-native-view").MediaPipeNativeView;
}

const PlatformMediaPipeView = resolvePlatformView();

export default function MediaPipeDemo() {
  const lastSendTimeRef = useRef<number>(0);

  const { connectionState, isConnected: wsConnected, sendBinary } =
    useReconnectingWebSocket({
      url: WS_URL,
      reconnectBaseDelayMs: 3000,
      reconnectMaxDelayMs: 20000,
      reconnectBackoffFactor: 1.5,
      onOpen: () => {
        console.log("Connected to WebSocket server");
      },
      onClose: () => {
        console.log("Disconnected from WebSocket server");
      },
      onError: (event) => {
        console.error("WebSocket error:", event);
      },
    });

  useEffect(() => {
    if (connectionState === "connecting") {
      console.log("Connecting to WebSocket server:", WS_URL);
    }

    if (connectionState === "reconnecting") {
      console.log("Reconnecting to WebSocket server:", WS_URL);
    }
  }, [connectionState]);

  const sendLandmarks = useCallback(
    (landmarks: PoseLandmarksPayload) => {
      const now = Date.now();
      if (now - lastSendTimeRef.current < 1000 / VIDEO_FPS) {
        return;
      }

      const packet = encodePoseLandmarksPacket(landmarks, now);
      if (!packet) {
        return;
      }

      const sent = sendBinary(packet);
      if (sent) {
        lastSendTimeRef.current = now;
      }
    },
    [sendBinary],
  );

  return (
    <PlatformMediaPipeView
      sendLandmarks={sendLandmarks}
      wsConnected={wsConnected}
      videoFps={VIDEO_FPS}
    />
  );
}
