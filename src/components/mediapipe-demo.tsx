import React, { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

import { getVideoParserWsUrl } from "@/services/video-parser-endpoints";
import { useReconnectingWebSocket } from "@/hooks/use-reconnecting-websocket";
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
  const receivedAckRef = useRef(false);

  const handleServerMessage = useCallback((data: unknown) => {
    try {
      const payload = typeof data === "string" ? JSON.parse(data) : data;

      if (
        payload &&
        typeof payload === "object" &&
        (payload as any).type === "error"
      ) {
        console.error("Video parser rejected payload:", (payload as any).message);
      }

      if (
        payload &&
        typeof payload === "object" &&
        (payload as any).type === "ack" &&
        !receivedAckRef.current
      ) {
        receivedAckRef.current = true;
        console.log("Video parser acknowledged pose frames.", payload as any);
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, []);

  const { connectionState, isConnected: wsConnected, sendJson } =
    useReconnectingWebSocket({
      url: WS_URL,
      reconnectBaseDelayMs: 3000,
      reconnectMaxDelayMs: 20000,
      reconnectBackoffFactor: 1.5,
      onOpen: () => {
        receivedAckRef.current = false;
        console.log("Connected to WebSocket server");
      },
      onClose: () => {
        console.log("Disconnected from WebSocket server");
      },
      onError: (event) => {
        console.error("WebSocket error:", event);
      },
      onMessage: handleServerMessage,
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
    (landmarks: unknown) => {
      const now = Date.now();
      if (now - lastSendTimeRef.current < 1000 / VIDEO_FPS) {
        return;
      }

      const sent = sendJson({ type: "pose-landmarks", data: landmarks });
      if (sent) {
        lastSendTimeRef.current = now;
      }
    },
    [sendJson],
  );

  return (
    <PlatformMediaPipeView
      sendLandmarks={sendLandmarks}
      wsConnected={wsConnected}
      videoFps={VIDEO_FPS}
    />
  );
}
