import type { VideoMetadata } from './video-parser-api';

export function formatVideoDuration(
  durationMs: number | null,
  fallback = 'In progress',
): string {
  if (durationMs === null) return fallback;

  const seconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatVideoTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export function isUsableReferenceVideo(video: VideoMetadata): boolean {
  return video.endTime !== null && video.frameCount > 0 && video.duration !== null;
}
