import { clearVideoListCache } from "@/services/video-list-cache";
import {
  newJobId,
  processVideo,
  type ProcessedVideo,
  type ProcessVideoProgress,
  subscribeExtractionProgress,
} from "@/services/video-parser-api";

export type RecordedVideoInput =
  | File
  | { uri: string; name: string; type: string };

export type RecordedVideoProcessingStatus =
  | { kind: "uploading"; ratio: number; loaded?: number; total?: number }
  | {
      kind: "processing";
      startedAt: number;
      framesProcessed?: number;
      totalFrames?: number;
    }
  | { kind: "done"; result: ProcessedVideo }
  | { kind: "error"; message: string };

interface ProcessRecordedVideoOptions {
  jobId?: string;
  now?: () => number;
  onStatus?: (status: RecordedVideoProcessingStatus) => void;
}

function uploadSize(input: RecordedVideoInput): number | undefined {
  if (typeof File !== "undefined" && input instanceof File) {
    return input.size;
  }

  return undefined;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export async function processRecordedVideo(
  input: RecordedVideoInput,
  {
    jobId = newJobId(),
    now = Date.now,
    onStatus,
  }: ProcessRecordedVideoOptions = {},
): Promise<ProcessedVideo> {
  const total = uploadSize(input);
  let processingStartedAt: number | null = null;
  const emit = (status: RecordedVideoProcessingStatus) => onStatus?.(status);
  const ensureProcessingStartedAt = () => {
    processingStartedAt ??= now();
    return processingStartedAt;
  };

  emit({
    kind: "uploading",
    ratio: 0,
    ...(total === undefined ? {} : { loaded: 0, total }),
  });

  const unsubscribeProgress = subscribeExtractionProgress((evt) => {
    if (evt.phase === "frames") {
      emit({
        kind: "processing",
        startedAt: ensureProcessingStartedAt(),
        framesProcessed: evt.framesProcessed,
        totalFrames: evt.totalFrames,
      });
      return;
    }

    if (evt.phase === "failed") {
      emit({
        kind: "error",
        message: evt.error ?? "Video processing failed",
      });
    }
  }, jobId);

  try {
    const result = await processVideo(
      input,
      (event: ProcessVideoProgress) => {
        if (event.phase === "uploading") {
          emit({
            kind: "uploading",
            ratio: event.ratio,
            loaded: event.loaded,
            total: event.total,
          });
          return;
        }

        emit({
          kind: "processing",
          startedAt: ensureProcessingStartedAt(),
          framesProcessed: event.framesProcessed,
          totalFrames: event.totalFrames,
        });
      },
      jobId,
    );

    clearVideoListCache();
    emit({ kind: "done", result });
    return result;
  } catch (err) {
    emit({ kind: "error", message: errorMessage(err) });
    throw err;
  } finally {
    unsubscribeProgress();
  }
}
