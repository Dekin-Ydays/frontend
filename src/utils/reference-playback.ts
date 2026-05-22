import type { VideoFrame } from "@/services/video-parser-api";

export const REFERENCE_PLAYBACK_FPS = 30;
export const REFERENCE_PLAYBACK_INTERVAL_MS = 1000 / REFERENCE_PLAYBACK_FPS;

export function referenceFrameIndexAtElapsedMs(
  frames: VideoFrame[],
  elapsedMs: number,
): number {
  if (frames.length === 0) return -1;
  if (frames.length === 1) return 0;

  const firstTimestamp = frames[0]?.timestamp ?? 0;
  const targetTimestamp = firstTimestamp + Math.max(0, elapsedMs);

  if (targetTimestamp <= firstTimestamp) return 0;

  const lastIndex = frames.length - 1;
  const lastTimestamp = frames[lastIndex]?.timestamp ?? firstTimestamp;
  if (targetTimestamp >= lastTimestamp) return lastIndex;

  let low = 0;
  let high = lastIndex;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const timestamp = frames[mid]?.timestamp ?? firstTimestamp;

    if (timestamp <= targetTimestamp) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(0, high);
}

export function referenceFrameAtElapsedMs(
  frames: VideoFrame[],
  elapsedMs: number,
): VideoFrame | undefined {
  const index = referenceFrameIndexAtElapsedMs(frames, elapsedMs);
  return index < 0 ? undefined : frames[index];
}
