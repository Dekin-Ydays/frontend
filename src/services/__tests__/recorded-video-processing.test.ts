import { vi } from "vitest";

import {
  processRecordedVideo,
  type RecordedVideoProcessingStatus,
} from "../recorded-video-processing";
import type {
  ExtractionProgressEvent,
  ProcessVideoProgress,
} from "../video-parser-api";

const mocks = vi.hoisted(() => ({
  newJobId: vi.fn(),
  processVideo: vi.fn(),
  subscribeExtractionProgress: vi.fn(),
}));

vi.mock("../video-parser-api", () => ({
  newJobId: mocks.newJobId,
  processVideo: mocks.processVideo,
  subscribeExtractionProgress: mocks.subscribeExtractionProgress,
}));

describe("processRecordedVideo", () => {
  beforeEach(() => {
    mocks.newJobId.mockReturnValue("job-1");
    mocks.processVideo.mockReset();
    mocks.subscribeExtractionProgress.mockReset();
  });

  function makeFile(): File {
    return new File([new Uint8Array([1, 2, 3, 4])], "clip.mp4", {
      type: "video/mp4",
    });
  }

  it("emits upload, processing progress, done status, and unsubscribes", async () => {
    const unsubscribe = vi.fn();
    let extractionHandler: ((event: ExtractionProgressEvent) => void) | null =
      null;
    const statuses: RecordedVideoProcessingStatus[] = [];
    const result = {
      videoId: "video-1",
      frameCount: 12,
      fps: 30,
      width: 640,
      height: 480,
      sourceVideo: {
        id: "file-1",
        objectKey: "source/file-1.mp4",
        fileName: "clip.mp4",
        mimeType: "video/mp4",
        size: 4,
        uploadedAt: "2026-05-06T00:00:00.000Z",
      },
    };

    mocks.subscribeExtractionProgress.mockImplementation((handler, jobId) => {
      extractionHandler = handler;
      expect(jobId).toBe("job-1");
      return unsubscribe;
    });
    mocks.processVideo.mockImplementation(async (_file, onProgress, jobId) => {
      expect(jobId).toBe("job-1");
      onProgress?.({
        phase: "uploading",
        loaded: 2,
        total: 4,
        ratio: 0.5,
      } satisfies ProcessVideoProgress);
      onProgress?.({ phase: "processing" } satisfies ProcessVideoProgress);
      extractionHandler?.({
        jobId: "job-1",
        phase: "frames",
        framesProcessed: 3,
        totalFrames: 12,
        at: 1,
      });
      return result;
    });

    await expect(
      processRecordedVideo(makeFile(), {
        now: () => 1000,
        onStatus: (status) => statuses.push(status),
      }),
    ).resolves.toEqual(result);

    expect(statuses).toEqual([
      { kind: "uploading", ratio: 0, loaded: 0, total: 4 },
      { kind: "uploading", ratio: 0.5, loaded: 2, total: 4 },
      { kind: "processing", startedAt: 1000 },
      {
        kind: "processing",
        startedAt: 1000,
        framesProcessed: 3,
        totalFrames: 12,
      },
      { kind: "done", result },
    ]);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("emits error status, rejects, and unsubscribes on upload failure", async () => {
    const unsubscribe = vi.fn();
    const statuses: RecordedVideoProcessingStatus[] = [];
    mocks.subscribeExtractionProgress.mockReturnValue(unsubscribe);
    mocks.processVideo.mockRejectedValue(new Error("server exploded"));

    await expect(
      processRecordedVideo(makeFile(), {
        onStatus: (status) => statuses.push(status),
      }),
    ).rejects.toThrow("server exploded");

    expect(statuses[statuses.length - 1]).toEqual({
      kind: "error",
      message: "server exploded",
    });
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("emits an error status from failed extraction events", async () => {
    let extractionHandler: ((event: ExtractionProgressEvent) => void) | null =
      null;
    const statuses: RecordedVideoProcessingStatus[] = [];
    const result = {
      videoId: "video-1",
      frameCount: 0,
      fps: 0,
      width: 0,
      height: 0,
      sourceVideo: {
        id: "file-1",
        objectKey: "source/file-1.mp4",
        fileName: "clip.mp4",
        mimeType: "video/mp4",
        size: 4,
        uploadedAt: "2026-05-06T00:00:00.000Z",
      },
    };
    mocks.subscribeExtractionProgress.mockImplementation((handler) => {
      extractionHandler = handler;
      return vi.fn();
    });
    mocks.processVideo.mockImplementation(async () => {
      extractionHandler?.({
        jobId: "job-1",
        phase: "failed",
        error: "bad model",
        at: 1,
      });
      return result;
    });

    await processRecordedVideo(makeFile(), {
      onStatus: (status) => statuses.push(status),
    });

    expect(statuses).toContainEqual({ kind: "error", message: "bad model" });
  });
});
