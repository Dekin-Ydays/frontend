import { Landmark } from './skeleton-renderer';

/**
 * MoveNet index → MediaPipe index mapping.
 * MoveNet has 17 keypoints; MediaPipe has 33.
 */
const MOVENET_TO_MEDIAPIPE: Record<number, number> = {
  0: 0,   // nose
  1: 2,   // left eye
  2: 5,   // right eye
  3: 7,   // left ear
  4: 8,   // right ear
  5: 11,  // left shoulder
  6: 12,  // right shoulder
  7: 13,  // left elbow
  8: 14,  // right elbow
  9: 15,  // left wrist
  10: 16, // right wrist
  11: 23, // left hip
  12: 24, // right hip
  13: 25, // left knee
  14: 26, // right knee
  15: 27, // left ankle
  16: 28, // right ankle
};

const MEDIAPIPE_LANDMARK_COUNT = 33;

/**
 * Maps 17 MoveNet keypoints to a 33-element MediaPipe landmark array.
 * Unmapped slots get {x:0, y:0, z:0, visibility:0} so the backend
 * skips them via the visibility threshold.
 */
export function mapMoveNetToMediaPipe(
  keypoints: { x: number; y: number; visibility?: number }[]
): Landmark[] {
  const landmarks: Landmark[] = Array.from({ length: MEDIAPIPE_LANDMARK_COUNT }, () => ({
    x: 0,
    y: 0,
    z: 0,
    visibility: 0,
  }));

  for (let i = 0; i < keypoints.length && i < 17; i++) {
    const mediapipeIdx = MOVENET_TO_MEDIAPIPE[i];
    if (mediapipeIdx !== undefined) {
      landmarks[mediapipeIdx] = {
        x: keypoints[i].x,
        y: keypoints[i].y,
        z: 0,
        visibility: keypoints[i].visibility ?? 1,
      };
    }
  }

  return landmarks;
}

/**
 * Parses the 195-float tensor output from pose_landmark_lite.tflite
 * into 33 landmarks. Each landmark is encoded as 5 floats:
 * [x, y, z, visibility, presence].
 */
export function parsePoseLandmarkLiteOutput(output: ArrayLike<number>): Landmark[] {
  const landmarks: Landmark[] = [];

  for (let i = 0; i < MEDIAPIPE_LANDMARK_COUNT; i++) {
    const offset = i * 5;
    landmarks.push({
      x: output[offset],
      y: output[offset + 1],
      z: output[offset + 2],
      visibility: output[offset + 3],
    });
  }

  return landmarks;
}
