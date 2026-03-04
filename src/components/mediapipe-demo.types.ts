export type SendLandmarks = (data: unknown) => void;

export interface MediaPipePlatformViewProps {
  sendLandmarks: SendLandmarks;
  wsConnected: boolean;
  videoFps: number;
}
