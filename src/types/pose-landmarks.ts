export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
}

export type PoseLandmarkList = PoseLandmark[];
export type PoseLandmarkNestedList = PoseLandmark[][];
export type PoseLandmarkCollection = PoseLandmarkList | PoseLandmarkNestedList;

export interface PoseLandmarksEnvelope {
  type?: string;
  timestamp?: number;
  landmarks?: PoseLandmarkCollection;
  poseLandmarks?: PoseLandmarkCollection;
  points?: PoseLandmarkCollection;
  data?: PoseLandmarkCollection;
}

export type PoseLandmarksPayload = PoseLandmarkCollection | PoseLandmarksEnvelope;

/**
 * Rendering-oriented landmark shape used by the skeleton renderer and overlay
 * components. Compatible with MediaPipe's `NormalizedLandmark` output.
 */
export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}
