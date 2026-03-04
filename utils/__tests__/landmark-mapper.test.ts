import { mapMoveNetToMediaPipe, parsePoseLandmarkLiteOutput } from '../landmark-mapper';

describe('mapMoveNetToMediaPipe', () => {
  const movenetKeypoints = Array.from({ length: 17 }, (_, i) => ({
    x: (i + 1) / 100,
    y: (i + 1) / 200,
    visibility: 0.9,
  }));

  it('returns an array of 33 landmarks', () => {
    const result = mapMoveNetToMediaPipe(movenetKeypoints);
    expect(result).toHaveLength(33);
  });

  it('maps MoveNet indices to correct MediaPipe indices', () => {
    const result = mapMoveNetToMediaPipe(movenetKeypoints);

    // nose: MoveNet 0 → MediaPipe 0
    expect(result[0].x).toBe(movenetKeypoints[0].x);

    // left shoulder: MoveNet 5 → MediaPipe 11
    expect(result[11].x).toBe(movenetKeypoints[5].x);
    expect(result[11].y).toBe(movenetKeypoints[5].y);

    // right shoulder: MoveNet 6 → MediaPipe 12
    expect(result[12].x).toBe(movenetKeypoints[6].x);

    // left hip: MoveNet 11 → MediaPipe 23
    expect(result[23].x).toBe(movenetKeypoints[11].x);

    // right hip: MoveNet 12 → MediaPipe 24
    expect(result[24].x).toBe(movenetKeypoints[12].x);

    // left elbow: MoveNet 7 → MediaPipe 13
    expect(result[13].x).toBe(movenetKeypoints[7].x);

    // left knee: MoveNet 13 → MediaPipe 25
    expect(result[25].x).toBe(movenetKeypoints[13].x);

    // left ankle: MoveNet 15 → MediaPipe 27
    expect(result[27].x).toBe(movenetKeypoints[15].x);
  });

  it('fills unmapped slots with visibility 0', () => {
    const result = mapMoveNetToMediaPipe(movenetKeypoints);

    // Indices that have no MoveNet source (e.g. hands 17-22, face detail 1,3,4,6)
    const unmappedIndices = [1, 3, 4, 6, 9, 10, 17, 18, 19, 20, 21, 22, 29, 30, 31, 32];
    for (const idx of unmappedIndices) {
      expect(result[idx].visibility).toBe(0);
      expect(result[idx].x).toBe(0);
      expect(result[idx].y).toBe(0);
    }
  });

  it('sets z to 0 on all landmarks (MoveNet is 2D)', () => {
    const result = mapMoveNetToMediaPipe(movenetKeypoints);
    for (const lm of result) {
      expect(lm.z).toBe(0);
    }
  });

  it('handles empty keypoints array', () => {
    const result = mapMoveNetToMediaPipe([]);
    expect(result).toHaveLength(33);
    for (const lm of result) {
      expect(lm.visibility).toBe(0);
    }
  });

  it('defaults visibility to 1 when not provided', () => {
    const keypoints = [{ x: 0.5, y: 0.5 }];
    const result = mapMoveNetToMediaPipe(keypoints);
    // nose: MoveNet 0 → MediaPipe 0
    expect(result[0].visibility).toBe(1);
  });
});

describe('parsePoseLandmarkLiteOutput', () => {
  it('parses 195 floats into 33 landmarks', () => {
    // 33 landmarks * 5 values each = 165 ... actually the model outputs 195 = 39*5
    // but we only read the first 33 landmarks (165 floats)
    const output = new Float32Array(195);
    for (let i = 0; i < 33; i++) {
      output[i * 5 + 0] = i / 33;       // x
      output[i * 5 + 1] = (i + 1) / 33; // y
      output[i * 5 + 2] = 0.1;          // z
      output[i * 5 + 3] = 0.95;         // visibility
      output[i * 5 + 4] = 0.99;         // presence (not used)
    }

    const result = parsePoseLandmarkLiteOutput(output);
    expect(result).toHaveLength(33);

    expect(result[0].x).toBeCloseTo(0 / 33);
    expect(result[0].y).toBeCloseTo(1 / 33);
    expect(result[0].z).toBeCloseTo(0.1);
    expect(result[0].visibility).toBeCloseTo(0.95);

    expect(result[32].x).toBeCloseTo(32 / 33);
  });

  it('each landmark has x, y, z, and visibility properties', () => {
    const output = new Float32Array(195);
    const result = parsePoseLandmarkLiteOutput(output);

    for (const lm of result) {
      expect(lm).toHaveProperty('x');
      expect(lm).toHaveProperty('y');
      expect(lm).toHaveProperty('z');
      expect(lm).toHaveProperty('visibility');
    }
  });
});
