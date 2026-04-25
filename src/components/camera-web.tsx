import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import type {
  PoseLandmarker,
  PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

import { AppText } from "./ui/app-text";
import { PipelineHealthBanner } from "./pipeline-health-banner";
import {
  newJobId,
  processVideo,
  ProcessedVideo,
  subscribeExtractionProgress,
} from "@/services/video-parser-api";
import { drawSkeleton } from "@/utils/skeleton-renderer";
import { usePoseDetectionLoop } from "@/hooks/use-pose-detection-loop";

type Status =
  | { kind: "idle" }
  | { kind: "starting-camera" }
  | { kind: "ready" }
  | { kind: "recording"; startedAt: number }
  | { kind: "uploading"; ratio: number; loaded: number; total: number }
  | {
      kind: "processing";
      startedAt: number;
      framesProcessed?: number;
      totalFrames?: number;
    }
  | { kind: "done"; result: ProcessedVideo }
  | { kind: "error"; message: string };

function formatBytes(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} KB`;
  return `${n} B`;
}

const PREFERRED_MIME_TYPES = [
  "video/mp4;codecs=avc1",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  for (const candidate of PREFERRED_MIME_TYPES) {
    try {
      if (MediaRecorder.isTypeSupported(candidate)) return candidate;
    } catch {
      // some browsers throw on isTypeSupported with codecs
    }
  }
  return undefined;
}

function extensionFromMime(mime: string | undefined): string {
  if (!mime) return "webm";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";
  return "webm";
}

export function CameraWeb() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recorderMimeRef = useRef<string | undefined>(undefined);

  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [poseDetected, setPoseDetected] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [elapsedMs, setElapsedMs] = useState(0);
  const [processingElapsedMs, setProcessingElapsedMs] = useState(0);

  const handleDetectionResults = useCallback(
    ({
      ctx,
      results,
      width,
      height,
    }: {
      ctx: CanvasRenderingContext2D;
      results: PoseLandmarkerResult;
      width: number;
      height: number;
    }) => {
      const list = results.landmarks ?? [];
      if (list.length > 0) {
        setPoseDetected(true);
        for (const landmarks of list) {
          drawSkeleton(ctx, landmarks, { width, height });
        }
      } else {
        setPoseDetected(false);
      }
    },
    [],
  );

  const { startLoop, stopLoop, resetTimestamp } = usePoseDetectionLoop({
    videoRef,
    canvasRef,
    poseLandmarkerRef,
    onResults: handleDetectionResults,
  });

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      try {
        const { PoseLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );
        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
          },
        );
        if (cancelled) return;
        setModelReady(true);
      } catch (err) {
        setModelError(
          err instanceof Error ? err.message : "Failed to initialize MediaPipe",
        );
      }
    };
    void initialize();
    return () => {
      cancelled = true;
      poseLandmarkerRef.current?.close();
      poseLandmarkerRef.current = null;
    };
  }, []);

  const releaseStream = useCallback(() => {
    stopLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }, [stopLoop]);

  useEffect(() => releaseStream, [releaseStream]);

  const startCamera = useCallback(async () => {
    if (streamRef.current) return;
    if (!poseLandmarkerRef.current) {
      setStatus({ kind: "error", message: "Pose model is not ready yet" });
      return;
    }

    setStatus({ kind: "starting-camera" });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setStatus({ kind: "error", message: "Video element not available" });
        return;
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve) => {
        const onLoaded = () => {
          video.removeEventListener("loadeddata", onLoaded);
          resolve();
        };
        video.addEventListener("loadeddata", onLoaded);
      });

      try {
        await video.play();
      } catch {
        // autoplay may be blocked; user interaction will resume
      }

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      resetTimestamp();
      startLoop();
      setStatus({ kind: "ready" });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Failed to access camera",
      });
    }
  }, [resetTimestamp, startLoop]);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) {
      setStatus({ kind: "error", message: "Camera not started" });
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setStatus({
        kind: "error",
        message: "MediaRecorder is not supported in this browser",
      });
      return;
    }

    chunksRef.current = [];
    const mimeType = pickSupportedMimeType();
    recorderMimeRef.current = mimeType;

    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch (err) {
      setStatus({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Failed to create MediaRecorder",
      });
      return;
    }

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const finalMime = recorderMimeRef.current ?? "video/webm";
      const blob = new Blob(chunksRef.current, { type: finalMime });
      chunksRef.current = [];
      if (blob.size === 0) {
        setStatus({ kind: "error", message: "Recording produced no data" });
        return;
      }

      setStatus({
        kind: "uploading",
        ratio: 0,
        loaded: 0,
        total: blob.size,
      });
      const ext = extensionFromMime(finalMime);
      const file = new File([blob], `recording-${Date.now()}.${ext}`, {
        type: finalMime,
      });
      const jobId = newJobId();
      let unsubscribeProgress: (() => void) | null = null;
      try {
        unsubscribeProgress = subscribeExtractionProgress((evt) => {
          if (evt.phase === "frames") {
            setStatus((prev) =>
              prev.kind === "processing"
                ? {
                    kind: "processing",
                    startedAt: prev.startedAt,
                    framesProcessed: evt.framesProcessed,
                    totalFrames: evt.totalFrames ?? prev.totalFrames,
                  }
                : prev,
            );
          }
        }, jobId);

        const result = await processVideo(
          file,
          (event) => {
            if (event.phase === "uploading") {
              setStatus({
                kind: "uploading",
                ratio: event.ratio,
                loaded: event.loaded,
                total: event.total,
              });
            } else {
              setStatus({ kind: "processing", startedAt: performance.now() });
            }
          },
          jobId,
        );
        setStatus({ kind: "done", result });
      } catch (err) {
        setStatus({
          kind: "error",
          message:
            err instanceof Error ? err.message : "Failed to upload video",
        });
      } finally {
        unsubscribeProgress?.();
      }
    };

    recorder.start();
    recorderRef.current = recorder;
    setStatus({ kind: "recording", startedAt: performance.now() });
    setElapsedMs(0);
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state !== "inactive") {
      recorder.stop();
    }
    recorderRef.current = null;
  }, []);

  useEffect(() => {
    if (status.kind !== "recording") return;
    const id = window.setInterval(() => {
      setElapsedMs(performance.now() - status.startedAt);
    }, 250);
    return () => window.clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status.kind !== "processing") {
      setProcessingElapsedMs(0);
      return;
    }
    const startedAt = status.startedAt;
    setProcessingElapsedMs(Math.max(0, performance.now() - startedAt));
    const id = window.setInterval(() => {
      setProcessingElapsedMs(performance.now() - startedAt);
    }, 500);
    return () => window.clearInterval(id);
  }, [status]);

  const reset = useCallback(() => {
    setStatus({ kind: "ready" });
  }, []);

  const elapsedSeconds = useMemo(() => (elapsedMs / 1000).toFixed(1), [
    elapsedMs,
  ]);

  if (Platform.OS !== "web") {
    return null;
  }

  const cameraStarted = streamRef.current !== null;

  return (
    <View style={styles.container}>
      <AppText variant="bolderBaseText">Record &amp; Analyze (Web)</AppText>
      {!modelReady && !modelError ? (
        <AppText variant="baseText">Loading lite pose model…</AppText>
      ) : null}
      {modelError ? (
        <AppText variant="baseText">Model error: {modelError}</AppText>
      ) : null}

      <PipelineHealthBanner />

      <View style={styles.stage}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ display: "none" }}
        />
        <canvas ref={canvasRef} style={styles.canvas} />
        {!cameraStarted ? (
          <View style={styles.placeholder} pointerEvents="none">
            <AppText variant="baseText">
              Click &quot;Start camera&quot; to begin
            </AppText>
          </View>
        ) : null}

        {status.kind === "recording" ? (
          <View style={styles.recordingBadge} pointerEvents="none">
            <View style={styles.recordingDot} />
            <AppText variant="baseText">REC {elapsedSeconds}s</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.statusRow}>
        <AppText variant="baseText">
          {modelReady && cameraStarted
            ? poseDetected
              ? "Pose detected"
              : "No pose detected — step into frame"
            : "Camera idle"}
        </AppText>
      </View>

      <View style={styles.controls}>
        {!cameraStarted ? (
          <Pressable
            onPress={startCamera}
            disabled={!modelReady}
            style={[
              styles.primaryButton,
              !modelReady && styles.buttonDisabled,
            ]}
          >
            <AppText variant="baseText">Start camera</AppText>
          </Pressable>
        ) : status.kind === "recording" ? (
          <Pressable onPress={stopRecording} style={styles.stopButton}>
            <AppText variant="baseText">Stop &amp; upload</AppText>
          </Pressable>
        ) : status.kind === "uploading" ? (
          <View style={styles.statusBox}>
            <AppText variant="bolderBaseText">
              Uploading… {Math.round(status.ratio * 100)}%
            </AppText>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(status.ratio * 100)}%` },
                ]}
              />
            </View>
            <AppText variant="baseText">
              {formatBytes(status.loaded)} / {formatBytes(status.total)}
            </AppText>
          </View>
        ) : status.kind === "processing" ? (
          <View style={styles.statusBox}>
            <AppText variant="bolderBaseText">
              Running precise pose extraction… {(processingElapsedMs / 1000).toFixed(1)}s
            </AppText>
            <AppText variant="baseText">
              {status.framesProcessed !== undefined
                ? status.totalFrames
                  ? `Processed ${status.framesProcessed} / ${status.totalFrames} frames`
                  : `Processed ${status.framesProcessed} frames`
                : "The server is re-analyzing every frame with the heavy model."}
            </AppText>
            <View style={styles.progressTrack}>
              {status.framesProcessed !== undefined &&
              status.totalFrames !== undefined &&
              status.totalFrames > 0 ? (
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        100,
                        Math.round(
                          (status.framesProcessed / status.totalFrames) * 100,
                        ),
                      )}%`,
                    },
                  ]}
                />
              ) : (
                <View
                  style={[styles.progressFill, styles.progressIndeterminate]}
                />
              )}
            </View>
          </View>
        ) : status.kind === "done" ? (
          <View style={styles.statusBox}>
            <AppText variant="bolderBaseText">
              Processed video {status.result.videoId}
            </AppText>
            <AppText variant="baseText">
              {status.result.frameCount} frames at{" "}
              {status.result.fps.toFixed(1)} fps (
              {status.result.width}×{status.result.height})
            </AppText>
            <View style={styles.ctaRow}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/compare",
                    params: { reference: status.result.videoId },
                  })
                }
                style={styles.primaryButton}
              >
                <AppText variant="baseText">Use as reference →</AppText>
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/compare",
                    params: { comparison: status.result.videoId },
                  })
                }
                style={styles.primaryButton}
              >
                <AppText variant="baseText">Use as comparison →</AppText>
              </Pressable>
            </View>
            <Pressable onPress={reset} style={styles.secondaryButton}>
              <AppText variant="baseText">Record another</AppText>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={startRecording} style={styles.recordButton}>
            <AppText variant="baseText">Start recording</AppText>
          </Pressable>
        )}

        {status.kind === "error" ? (
          <View style={styles.statusBox}>
            <AppText variant="baseText">Error: {status.message}</AppText>
            <Pressable onPress={reset} style={styles.secondaryButton}>
              <AppText variant="baseText">Dismiss</AppText>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  stage: {
    position: "relative",
    backgroundColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    width: "100%",
    maxWidth: 640,
    height: "auto",
    borderRadius: 12,
    backgroundColor: "#000",
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
  },
  statusRow: {
    minHeight: 20,
  },
  controls: {
    gap: 12,
  },
  ctaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  recordButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
  stopButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#ef4444",
    alignItems: "center",
  },
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(128,128,128,0.15)",
    alignSelf: "flex-start",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  statusBox: {
    backgroundColor: "rgba(128,128,128,0.1)",
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  progressIndeterminate: {
    width: "60%",
    opacity: 0.5,
  },
});
