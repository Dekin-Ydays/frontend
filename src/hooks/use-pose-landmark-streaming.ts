import { useCallback, useEffect, useRef } from "react";

import { useReconnectingWebSocket } from "@/hooks/use-reconnecting-websocket";
import { encodePoseLandmarksPacket } from "@/services/pose-landmarks-protobuf";
import { getVideoParserWsUrl } from "@/services/video-parser-endpoints";
import type { PoseLandmarksPayload } from "@/types/pose-landmarks";

const DEFAULT_WS_URL = getVideoParserWsUrl("/ws");

interface UsePoseLandmarkStreamingParams {
  fps?: number;
  url?: string;
  enabled?: boolean;
}

interface UsePoseLandmarkStreamingResult {
  sendLandmarks: (landmarks: PoseLandmarksPayload) => void;
  wsConnected: boolean;
}

export function usePoseLandmarkStreaming({
  fps = 10,
  url = DEFAULT_WS_URL,
  enabled = true,
}: UsePoseLandmarkStreamingParams = {}): UsePoseLandmarkStreamingResult {
  const lastSendTimeRef = useRef<number>(0);

  const { connectionState, isConnected, sendBinary } = useReconnectingWebSocket({
    url,
    reconnectBaseDelayMs: 3000,
    reconnectMaxDelayMs: 20000,
    reconnectBackoffFactor: 1.5,
  });

  useEffect(() => {
    if (!enabled) return;
    if (connectionState === "connecting") {
      console.log("Connecting to WebSocket server:", url);
    } else if (connectionState === "reconnecting") {
      console.log("Reconnecting to WebSocket server:", url);
    }
  }, [connectionState, url, enabled]);

  const sendLandmarks = useCallback(
    (landmarks: PoseLandmarksPayload) => {
      if (!enabled) return;

      const now = Date.now();
      if (now - lastSendTimeRef.current < 1000 / fps) return;

      const packet = encodePoseLandmarksPacket(landmarks, now);
      if (!packet) return;

      if (sendBinary(packet)) {
        lastSendTimeRef.current = now;
      }
    },
    [enabled, fps, sendBinary],
  );

  return {
    sendLandmarks,
    wsConnected: isConnected,
  };
}
