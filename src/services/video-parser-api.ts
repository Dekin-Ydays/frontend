/**
 * Video Parser API Service
 *
 * Service for interacting with the Video Parser API endpoints.
 * Base URL is resolved at runtime from Expo host or EXPO_PUBLIC_* overrides.
 */

import { getVideoParserHttpBaseUrl } from '@/services/video-parser-endpoints';

// API Base URL
const API_BASE_URL = getVideoParserHttpBaseUrl();

// Type definitions matching the API documentation
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

/**
 * Get list of all connected WebSocket clients
 */
export async function listClients(): Promise<Client[]> {
  const response = await fetch(`${API_BASE_URL}/pose/clients`);
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  return response.json();
}

/**
 * Get list of all available videos
 */
export async function listVideos(): Promise<VideoMetadata[]> {
  const response = await fetch(`${API_BASE_URL}/pose/videos`);
  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }
  return response.json();
}

/**
 * Get the latest pose frame for a specific client
 */
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

/**
 * Get a complete video with all frames by video ID
 */
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

/**
 * Upload an original source video file to the parser.
 */
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

/**
 * Upload a video file and trigger server-side MediaPipe pose extraction.
 * Accepts either a web File or a React Native file descriptor ({ uri, name, type }).
 */
export async function processVideo(
  file: File | { uri: string; name: string; type: string },
): Promise<ProcessedVideo> {
  const formData = new FormData();
  formData.append('file', file as unknown as Blob);

  const response = await fetch(`${API_BASE_URL}/pose/video/process`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Failed to process video: ${response.status} ${text}`);
  }

  return response.json();
}

/**
 * Compare two videos and get scoring results
 */
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

/**
 * Get score color based on score value
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e'; // green
  if (score >= 70) return '#eab308'; // yellow
  if (score >= 50) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * Get score label based on score value
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Default comparison configuration for different use cases
 */
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
