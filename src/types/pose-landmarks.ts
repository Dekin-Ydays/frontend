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
