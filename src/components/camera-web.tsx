import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import { MusicNote, RefreshDouble, Xmark } from "iconoir-react-native";
import type {
  PoseLandmarker,
  PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

import { AppText } from "./ui/app-text";
import { BottomBar } from "./ui/bottom-bar";
import { MusicPickerBottomSheet } from "./video/music-picker-bottom-sheet";
import { PipelineHealthBanner } from "./pipeline-health-banner";
import { TopBar } from "./ui/top-bar";
import { MOCK_THUMBNAIL_URI } from "@/mocks/videos";
import type { MusicItem } from "@/types/video";
import {
  processRecordedVideo,
  type RecordedVideoProcessingStatus,
} from "@/services/recorded-video-processing";
import { getVideo, type VideoFrame } from "@/services/video-parser-api";
import {
  REFERENCE_PLAYBACK_INTERVAL_MS,
  referenceFrameAtElapsedMs,
} from "@/utils/reference-playback";
import { drawSkeleton } from "@/utils/skeleton-renderer";
import { usePoseDetectionLoop } from "@/hooks/use-pose-detection-loop";

type Status =
  | { kind: "idle" }
  | { kind: "starting-camera" }
  | { kind: "ready" }
  | { kind: "recording"; startedAt: number }
  | RecordedVideoProcessingStatus;

interface CameraWebProps {
  referenceId?: string;
}

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

export function CameraWeb({ referenceId }: CameraWebProps = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recorderMimeRef = useRef<string | undefined>(undefined);

  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [musicModalVisible, setMusicModalVisible] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<MusicItem | null>(null);
  const [poseDetected, setPoseDetected] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [elapsedMs, setElapsedMs] = useState(0);
  const [processingElapsedMs, setProcessingElapsedMs] = useState(0);
  const [referenceFrames, setReferenceFrames] = useState<VideoFrame[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const guidedReferenceId = referenceId?.trim() ?? "";
  const hasGuidedReference = guidedReferenceId.length > 0;

  useEffect(() => {
    if (!guidedReferenceId) {
      setReferenceFrames([]);
      setReferenceError(null);
      setReferenceLoading(false);
      return;
    }

    let cancelled = false;
    setReferenceLoading(true);
    setReferenceError(null);
    setReferenceFrames([]);

    getVideo(guidedReferenceId)
      .then((video) => {
        if (cancelled) return;
        if (video.frames.length === 0) {
          setReferenceError("Reference video has no skeleton frames");
          return;
        }
        setReferenceFrames(video.frames);
      })
      .catch((err) => {
        if (cancelled) return;
        setReferenceError(
          err instanceof Error ? err.message : "Failed to load reference video",
        );
      })
      .finally(() => {
        if (!cancelled) setReferenceLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [guidedReferenceId]);

  const referenceFrame = useMemo(
    () =>
      referenceFrameAtElapsedMs(
        referenceFrames,
        status.kind === "recording" ? elapsedMs : 0,
      ),
    [elapsedMs, referenceFrames, status.kind],
  );

  const handleProcessingStatus = useCallback(
    (next: RecordedVideoProcessingStatus) => {
      setStatus(next);
      if (next.kind === "done" && guidedReferenceId) {
        router.push({
          pathname: "/compare",
          params: {
            reference: guidedReferenceId,
            comparison: next.result.videoId,
          },
        });
      }
    },
    [guidedReferenceId],
  );

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
        if (!hasGuidedReference) {
          for (const landmarks of list) {
            drawSkeleton(ctx, landmarks, { width, height });
          }
        }
      } else {
        setPoseDetected(false);
      }

      if (referenceFrame) {
        drawSkeleton(ctx, referenceFrame.landmarks, {
          width,
          height,
          lineColor: "#9BFF68",
          pointColor: "#FFFFFF",
          lineWidth: 4,
          pointRadius: 5,
          visibilityThreshold: 0.5,
          mirrorX: true,
        });
      }
    },
    [hasGuidedReference, referenceFrame],
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
    setPoseDetected(false);
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
    if (hasGuidedReference && referenceFrames.length === 0) {
      setStatus({
        kind: "error",
        message: referenceError ?? "Reference skeleton is not ready",
      });
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

      const ext = extensionFromMime(finalMime);
      const file = new File([blob], `recording-${Date.now()}.${ext}`, {
        type: finalMime,
      });
      try {
        await processRecordedVideo(file, {
          now: () => performance.now(),
          onStatus: handleProcessingStatus,
        });
      } catch {
        // processRecordedVideo emits the error status before rejecting.
      }
    };

    recorder.start();
    recorderRef.current = recorder;
    setStatus({ kind: "recording", startedAt: performance.now() });
    setElapsedMs(0);
  }, [
    handleProcessingStatus,
    hasGuidedReference,
    referenceError,
    referenceFrames.length,
  ]);

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
    }, REFERENCE_PLAYBACK_INTERVAL_MS);
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
    setStatus(streamRef.current ? { kind: "ready" } : { kind: "idle" });
  }, []);

  const resetCamera = useCallback(() => {
    releaseStream();
    setElapsedMs(0);
    setProcessingElapsedMs(0);
    setStatus({ kind: "idle" });
  }, [releaseStream]);

  const closeCamera = useCallback(() => {
    releaseStream();
    router.replace("/feed");
  }, [releaseStream]);

  const elapsedSeconds = useMemo(
    () => (elapsedMs / 1000).toFixed(1),
    [elapsedMs],
  );

  if (Platform.OS !== "web") {
    return null;
  }

  const cameraStarted = streamRef.current !== null;
  const isBusy = status.kind === "uploading" || status.kind === "processing";
  const referenceReady =
    !hasGuidedReference ||
    (!referenceLoading && !referenceError && referenceFrames.length > 0);
  const referenceStatus = referenceError
    ? `Reference error: ${referenceError}`
    : referenceLoading
      ? "Loading reference skeleton"
      : referenceFrames.length > 0
        ? `${referenceFrames.length} reference frames`
        : "Reference skeleton not ready";
  return (
    <View className="flex-1 bg-dark">
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
          <View className="absolute inset-0 items-center justify-center bg-dark">
            <AppText variant="title" className="text-center">
              NOUVELLE VIDEO
            </AppText>
            <AppText variant="secondaryText" className="mt-2 text-center">
              {modelReady
                ? "Appuyez sur le bouton central pour demarrer la camera"
                : modelError
                  ? "Le modele de detection n'a pas pu etre charge"
                  : "Chargement du modele de detection"}
            </AppText>
          </View>
        ) : null}
      </View>

      <TopBar>
        <View className="flex-row items-center gap-5">
          <Pressable
            onPress={closeCamera}
            accessibilityRole="button"
            accessibilityLabel="Fermer la camera"
          >
            <Xmark className="size-8 text-white" />
          </Pressable>
          <AppText variant="title">NOUVELLE VIDEO</AppText>
        </View>
        <Pressable
          className="flex-row items-center gap-1.5 h-8 px-5 rounded-full bg-white/10"
          onPress={() => setMusicModalVisible(true)}
        >
          <MusicNote className="size-5 text-white" />
          <AppText className="text-sm">
            {selectedMusic ? selectedMusic.title : "Musique"}
          </AppText>
        </Pressable>
      </TopBar>

      <View className="absolute top-28 left-4 right-4 gap-2">
        {modelError ? (
          <View className="bg-dark/80 border border-dangerous/50 rounded-2xl p-4">
            <AppText variant="baseText">Model error: {modelError}</AppText>
          </View>
        ) : (
          <PipelineHealthBanner />
        )}
        {hasGuidedReference ? (
          <View
            className={`bg-dark/80 border rounded-2xl p-3 ${
              referenceError ? "border-dangerous/50" : "border-white/10"
            }`}
          >
            <AppText variant="baseText">{referenceStatus}</AppText>
          </View>
        ) : null}
      </View>

      <View className="absolute left-4 right-4 bottom-32 items-center">
        {cameraStarted &&
        (status.kind === "ready" || status.kind === "recording") ? (
          <View className="bg-dark/80 border border-white/10 rounded-full px-5 py-2 flex-row items-center gap-2">
            <View
              className={`h-2.5 w-2.5 rounded-full ${
                status.kind === "recording"
                  ? "bg-dangerous"
                  : poseDetected
                    ? "bg-secondary"
                    : "bg-gray"
              }`}
            />
            <AppText variant="baseText">
              {status.kind === "recording"
                ? `REC ${elapsedSeconds}s`
                : poseDetected
                  ? "Pose detectee"
                  : "Cadre vide"}
            </AppText>
          </View>
        ) : null}

        {status.kind === "uploading" ? (
          <View className="bg-dark/80 border border-white/10 rounded-2xl p-4 gap-3 w-full max-w-[640px]">
            <AppText variant="bolderBaseText">
              Uploading... {Math.round(status.ratio * 100)}%
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
              {formatBytes(status.loaded ?? 0)} /{" "}
              {status.total === undefined
                ? "unknown"
                : formatBytes(status.total)}
            </AppText>
          </View>
        ) : null}

        {status.kind === "processing" ? (
          <View className="bg-dark/80 border border-white/10 rounded-2xl p-4 gap-3 w-full max-w-[640px]">
            <AppText variant="bolderBaseText">
              Running precise pose extraction...{" "}
              {(processingElapsedMs / 1000).toFixed(1)}s
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
        ) : null}

        {status.kind === "done" ? (
          <View className="bg-dark/80 border border-white/10 rounded-2xl p-4 gap-3 w-full max-w-[640px]">
            <AppText variant="bolderBaseText">
              Processed video {status.result.videoId}
            </AppText>
            <AppText variant="baseText">
              {status.result.frameCount} frames at{" "}
              {status.result.fps.toFixed(1)} fps ({status.result.width}x
              {status.result.height})
            </AppText>
            <View className="flex-row flex-wrap gap-2">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/compare",
                    params: { reference: status.result.videoId },
                  })
                }
                className="h-10 px-5 rounded-full bg-white/10 items-center justify-center"
              >
                <AppText variant="baseText">Use as reference</AppText>
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/compare",
                    params: { comparison: status.result.videoId },
                  })
                }
                className="h-10 px-5 rounded-full bg-white/10 items-center justify-center"
              >
                <AppText variant="baseText">Use as comparison</AppText>
              </Pressable>
              <Pressable
                onPress={reset}
                className="h-10 px-5 rounded-full bg-white/10 items-center justify-center"
              >
                <AppText variant="baseText">Record another</AppText>
              </Pressable>
            </View>
          </View>
        ) : null}

        {status.kind === "error" ? (
          <View className="bg-dark/80 border border-dangerous/50 rounded-2xl p-4 gap-3 w-full max-w-[640px]">
            <AppText variant="baseText">Error: {status.message}</AppText>
            <Pressable
              onPress={reset}
              className="h-10 px-5 rounded-full bg-white/10 items-center justify-center self-start"
            >
              <AppText variant="baseText">Dismiss</AppText>
            </Pressable>
          </View>
        ) : null}
      </View>

      <BottomBar className="!justify-between">
        <View className="rounded-full border-2 border-white overflow-hidden h-16 w-16">
          <Image
            source={{ uri: MOCK_THUMBNAIL_URI }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>

        {!cameraStarted ? (
          <Pressable
            onPress={startCamera}
            disabled={!modelReady || !!modelError}
            className={`h-16 w-16 rounded-full bg-dangerous items-center justify-center ${
              !modelReady || modelError ? "opacity-50" : ""
            }`}
            accessibilityRole="button"
            accessibilityLabel="Demarrer la camera"
          >
            <View className="h-12 w-12 rounded-full bg-dangerous border-2 border-white/70" />
          </Pressable>
        ) : status.kind === "recording" ? (
          <Pressable
            onPress={stopRecording}
            className="h-16 w-16 rounded-full bg-white border border-white/5 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Arreter l'enregistrement"
          >
            <View className="h-6 w-6 rounded-md bg-dangerous" />
          </Pressable>
        ) : isBusy ? (
          <View className="h-16 w-16 rounded-full bg-white/10 border border-white/5 items-center justify-center">
            <ActivityIndicator color="#fff" />
          </View>
        ) : status.kind === "done" || status.kind === "error" ? (
          <Pressable
            onPress={reset}
            className="h-16 w-16 rounded-full bg-white/10 border border-white/5 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Reinitialiser"
          >
            <RefreshDouble className="size-8 text-white" />
          </Pressable>
        ) : (
          <Pressable
            onPress={startRecording}
            disabled={!referenceReady}
            className={`h-16 w-16 rounded-full bg-dangerous items-center justify-center ${
              referenceReady ? "" : "opacity-50"
            }`}
            accessibilityRole="button"
            accessibilityLabel="Demarrer l'enregistrement"
          >
            <View className="h-12 w-12 rounded-full bg-dangerous border-2 border-white/70" />
          </Pressable>
        )}

        {status.kind === "recording" || isBusy ? (
          <View className="h-16 w-16" />
        ) : (
          <Pressable
            className="h-16 w-16 rounded-full bg-white/10 border border-white/5 backdrop-blur-sm items-center justify-center"
            onPress={resetCamera}
            accessibilityRole="button"
            accessibilityLabel="Reinitialiser la camera"
          >
            <RefreshDouble className="size-8 text-white" />
          </Pressable>
        )}
      </BottomBar>

      <MusicPickerBottomSheet
        visible={musicModalVisible}
        onClose={() => setMusicModalVisible(false)}
        onSelect={(item) => setSelectedMusic(item)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0E0E0E",
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0E0E0E",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressIndeterminate: {
    width: "60%",
    opacity: 0.5,
  },
});
