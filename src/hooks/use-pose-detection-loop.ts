import { useCallback, useEffect, useRef } from "react";

interface DetectForVideoRunner<TResult> {
  detectForVideo: (video: HTMLVideoElement, timestampMs: number) => TResult;
}

interface UsePoseDetectionLoopParams<TResult> {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  poseLandmarkerRef: React.RefObject<DetectForVideoRunner<TResult> | null>;
  onResults: (params: {
    ctx: CanvasRenderingContext2D;
    results: TResult;
    width: number;
    height: number;
  }) => void;
  mirrorX?: boolean;
}

interface UsePoseDetectionLoopResult {
  startLoop: () => void;
  stopLoop: () => void;
  resetTimestamp: () => void;
}

export function drawVideoFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
  mirrorX = false,
): void {
  if (!mirrorX) {
    ctx.drawImage(video, 0, 0, width, height);
    return;
  }

  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, width, height);
  ctx.restore();
}

export function usePoseDetectionLoop<TResult>({
  videoRef,
  canvasRef,
  poseLandmarkerRef,
  onResults,
  mirrorX = false,
}: UsePoseDetectionLoopParams<TResult>): UsePoseDetectionLoopResult {
  const animationIdRef = useRef<number | null>(null);
  const lastTimestampMsRef = useRef<number>(-Infinity);
  const onResultsRef = useRef(onResults);

  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  const stopLoop = useCallback(() => {
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  }, []);

  const resetTimestamp = useCallback(() => {
    lastTimestampMsRef.current = -Infinity;
  }, []);

  const startLoop = useCallback(() => {
    stopLoop();

    const detect = () => {
      const currentVideo = videoRef.current;
      const currentCanvas = canvasRef.current;
      const currentCtx = currentCanvas?.getContext("2d");
      const currentLandmarker = poseLandmarkerRef.current;

      if (!currentVideo || !currentCanvas || !currentCtx || !currentLandmarker) {
        return;
      }

      const proposed = performance.now();
      const last = lastTimestampMsRef.current;
      const timestampMs = proposed > last ? proposed : last + 1;
      lastTimestampMsRef.current = timestampMs;

      const results = currentLandmarker.detectForVideo(currentVideo, timestampMs);

      currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
      drawVideoFrame(
        currentCtx,
        currentVideo,
        currentCanvas.width,
        currentCanvas.height,
        mirrorX,
      );

      onResultsRef.current({
        ctx: currentCtx,
        results,
        width: currentCanvas.width,
        height: currentCanvas.height,
      });

      animationIdRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, [canvasRef, mirrorX, poseLandmarkerRef, stopLoop, videoRef]);

  useEffect(() => stopLoop, [stopLoop]);

  return {
    startLoop,
    stopLoop,
    resetTimestamp,
  };
}
