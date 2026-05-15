import { describe, expect, it } from "vitest";

import {
  referenceFrameAtElapsedMs,
  referenceFrameIndexAtElapsedMs,
} from "../../src/utils/reference-playback";
import type { VideoFrame } from "../../src/services/video-parser-api";

const frames: VideoFrame[] = [
  { timestamp: 100, landmarks: [] },
  { timestamp: 133, landmarks: [] },
  { timestamp: 166, landmarks: [] },
  { timestamp: 233, landmarks: [] },
];

describe("reference playback", () => {
  it("returns -1 when there are no reference frames", () => {
    expect(referenceFrameIndexAtElapsedMs([], 0)).toBe(-1);
    expect(referenceFrameAtElapsedMs([], 0)).toBeUndefined();
  });

  it("keeps the first frame for negative and zero elapsed time", () => {
    expect(referenceFrameIndexAtElapsedMs(frames, -50)).toBe(0);
    expect(referenceFrameIndexAtElapsedMs(frames, 0)).toBe(0);
  });

  it("selects exact and between-frame timestamps relative to the first frame", () => {
    expect(referenceFrameIndexAtElapsedMs(frames, 33)).toBe(1);
    expect(referenceFrameIndexAtElapsedMs(frames, 40)).toBe(1);
    expect(referenceFrameIndexAtElapsedMs(frames, 66)).toBe(2);
  });

  it("freezes on the last frame after the reference ends", () => {
    expect(referenceFrameIndexAtElapsedMs(frames, 10_000)).toBe(3);
    expect(referenceFrameAtElapsedMs(frames, 10_000)).toBe(frames[3]);
  });
});
