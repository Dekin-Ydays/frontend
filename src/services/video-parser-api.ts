import { getVideoParserHttpBaseUrl } from '@/services/video-parser-endpoints';

const API_BASE_URL = getVideoParserHttpBaseUrl();

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
  presence?: number;
}

export interface PoseFrame {
  timestamp: number;
  landmarks: Landmark[];
  rawType?: string;
}

export interface VideoFrame {
  landmarks: Landmark[];
  timestamp: number;
}

export interface Video {
  frames: VideoFrame[];
}

export interface VideoMetadata {
  id: string;
  startTime: string;
  endTime: string | null;
  frameCount: number;
  duration: number | null;
}

export interface Client {
  clientId: string;
  lastSeenAt: number | null;
}

export interface UploadedVideoFile {
  id: string;
  objectKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface ComparisonConfig {
  normalization?: {
    center?: boolean;
    scale?: boolean;
    rotation?: boolean;
  };
  positionWeight?: number;
  angularWeight?: number;
  visibilityThreshold?: number;
}

export interface ScoringResult {
  overallScore: number;
  frameScores: number[];
  breakdown: {
    positionScore: number;
    angularScore: number;
    timingScore: number;
    statistics: {
      mean: number;
      min: number;
      max: number;
      variance: number;
    };
  };
}

export interface CompareVideosRequest {
  referenceVideoId: string;
  comparisonVideoId: string;
  config?: ComparisonConfig;
}

export interface StorageStatus {
  ready: boolean;
  endpoint: string;
  bucket: string;
  error?: string;
}

export interface PoseExtractionHealth {
  ready: boolean;
  workerScript: { path: string; present: boolean };
  model: { path: string; present: boolean };
  pythonBin: string;
  storage?: StorageStatus;
}

export async function getPoseHealth(): Promise<PoseExtractionHealth> {
  const response = await fetch(`${API_BASE_URL}/pose/health`);
  if (!response.ok) {
    throw new Error('Failed to fetch pose health');
  }
  return response.json();
}

export async function listClients(): Promise<Client[]> {
  const response = await fetch(`${API_BASE_URL}/pose/clients`);
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  return response.json();
}

export async function listVideos(): Promise<VideoMetadata[]> {
  const response = await fetch(`${API_BASE_URL}/pose/videos`);
  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }
  return response.json();
}

export async function getLatestPose(clientId: string): Promise<PoseFrame> {
  const response = await fetch(`${API_BASE_URL}/pose/latest/${clientId}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No pose data available for this client');
    }
    throw new Error('Failed to fetch latest pose');
  }
  return response.json();
}

export async function getVideo(videoId: string): Promise<Video> {
  const response = await fetch(`${API_BASE_URL}/pose/video/${videoId}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Video not found');
    }
    throw new Error('Failed to fetch video');
  }
  return response.json();
}

export async function uploadVideoFile(file: File): Promise<UploadedVideoFile> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/pose/video`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload video file');
  }

  return response.json();
}

export interface ProcessedVideo {
  videoId: string;
  frameCount: number;
  fps: number;
  width: number;
  height: number;
  sourceVideo: UploadedVideoFile;
}

export type ProcessVideoProgress =
  | { phase: 'uploading'; loaded: number; total: number; ratio: number }
  | { phase: 'processing'; framesProcessed?: number; totalFrames?: number };

export function newJobId(): string {
  const cryptoObj = (globalThis as { crypto?: Crypto }).crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }
  // Fallback (RN/older browsers): RFC4122-shape v4 from Math.random.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface ExtractionProgressEvent {
  jobId: string;
  phase: 'started' | 'frames' | 'completed' | 'failed';
  framesProcessed?: number;
  totalFrames?: number;
  error?: string;
  at: number;
}

/**
 * Subscribe to server-side extraction progress events via SSE.
 * If `jobId` is provided, only events with a matching jobId are forwarded.
 * Returns an unsubscribe function. Returns a no-op closer if EventSource
 * is unavailable (e.g. React Native, where there is no global EventSource).
 */
export function subscribeExtractionProgress(
  onEvent: (event: ExtractionProgressEvent) => void,
  jobId?: string,
): () => void {
  if (typeof EventSource === 'undefined') {
    return () => {};
  }
  const source = new EventSource(`${API_BASE_URL}/pose/extraction/events`);
  const handler = (raw: MessageEvent) => {
    try {
      const parsed = JSON.parse(raw.data) as ExtractionProgressEvent;
      if (jobId && parsed.jobId !== jobId) return;
      onEvent(parsed);
    } catch {
      // ignore malformed payloads
    }
  };
  source.addEventListener('extraction-progress', handler as EventListener);
  source.addEventListener('message', handler as EventListener);
  return () => {
    source.removeEventListener('extraction-progress', handler as EventListener);
    source.removeEventListener('message', handler as EventListener);
    source.close();
  };
}

/**
 * Upload a video file and trigger server-side MediaPipe pose extraction.
 * Accepts either a web File or a React Native file descriptor ({ uri, name, type }).
 * Emits progress: an "uploading" phase with byte counts, then a "processing"
 * phase once bytes are flushed and the server is running heavy-model extraction.
 */
export function processVideo(
  file: File | { uri: string; name: string; type: string },
  onProgress?: (event: ProcessVideoProgress) => void,
  jobId?: string,
): Promise<ProcessedVideo> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = jobId
      ? `${API_BASE_URL}/pose/video/process?jobId=${encodeURIComponent(jobId)}`
      : `${API_BASE_URL}/pose/video/process`;
    xhr.open('POST', url);

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return;
      if (event.lengthComputable) {
        onProgress({
          phase: 'uploading',
          loaded: event.loaded,
          total: event.total,
          ratio: event.total > 0 ? event.loaded / event.total : 0,
        });
      }
    };

    xhr.upload.onload = () => {
      onProgress?.({ phase: 'processing' });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as ProcessedVideo);
        } catch (err) {
          reject(
            err instanceof Error ? err : new Error('Invalid response payload'),
          );
        }
      } else {
        reject(
          new Error(
            `Failed to process video: ${xhr.status} ${xhr.responseText || ''}`.trim(),
          ),
        );
      }
    };

    xhr.onerror = () => reject(new Error('Network error during video upload'));
    xhr.ontimeout = () => reject(new Error('Video upload timed out'));

    const formData = new FormData();
    formData.append('file', file as unknown as Blob);
    xhr.send(formData);
  });
}

export async function compareVideos(
  request: CompareVideosRequest
): Promise<ScoringResult> {
  const response = await fetch(`${API_BASE_URL}/pose/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('One or both videos not found');
    }
    throw new Error('Failed to compare videos');
  }

  return response.json();
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e'; // green
  if (score >= 70) return '#eab308'; // yellow
  if (score >= 50) return '#f97316'; // orange
  return '#ef4444'; // red
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Improvement';
}

export const COMPARISON_PRESETS = {
  dance: {
    normalization: {
      center: true,
      scale: true,
      rotation: false,
    },
    positionWeight: 0.5,
    angularWeight: 0.5,
  },
  yoga: {
    normalization: {
      center: true,
      scale: true,
      rotation: true,
    },
    positionWeight: 0.4,
    angularWeight: 0.6,
  },
  sports: {
    normalization: {
      center: true,
      scale: true,
      rotation: false,
    },
    positionWeight: 0.7,
    angularWeight: 0.3,
    visibilityThreshold: 0.7,
  },
} as const;
