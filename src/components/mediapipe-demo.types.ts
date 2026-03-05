import type { PoseLandmarksPayload } from "@/types/pose-landmarks";

export type SendLandmarks = (data: PoseLandmarksPayload) => void;

export interface MediaPipePlatformViewProps {
  sendLandmarks: SendLandmarks;
  wsConnected: boolean;
  videoFps: number;
}
