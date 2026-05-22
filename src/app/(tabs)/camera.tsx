import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { MusicNote, RefreshDouble, Xmark } from "iconoir-react-native";
import { Canvas, Circle, Line, vec } from "@shopify/react-native-skia";

import { AppText } from "@/components/ui/app-text";
import { BottomBar } from "@/components/ui/bottom-bar";
import { CameraWeb } from "@/components/camera-web";
import { MusicPickerBottomSheet } from "@/components/video/music-picker-bottom-sheet";
import { PipelineHealthBanner } from "@/components/pipeline-health-banner";
import { TopBar } from "@/components/ui/top-bar";
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
import { projectSkeleton } from "@/utils/skeleton-renderer";

type VisionCameraModule = typeof import("react-native-vision-camera");
type CameraInstance = InstanceType<VisionCameraModule["Camera"]>;

let VisionCamera: VisionCameraModule | null = null;
try {
  VisionCamera = require("react-native-vision-camera");
} catch {
  // Module not linked in this build; fall back to web/unsupported UI.
}

type Status =
  | { kind: "idle" }
  | { kind: "recording"; startedAt: number }
  | RecordedVideoProcessingStatus;

export default function CameraScreen() {
  const isFocused = useIsFocused();
  const { reference } = useLocalSearchParams<{ reference?: string }>();
  const guidedReferenceId = useMemo(() => {
    const raw = Array.isArray(reference) ? reference[0] : reference;
    return raw?.trim() ?? "";
  }, [reference]);
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">(
    "back",
  );
  const [hasPermission, setHasPermission] = useState(false);
  const [musicModalVisible, setMusicModalVisible] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<MusicItem | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [elapsedMs, setElapsedMs] = useState(0);
  const [processingElapsedMs, setProcessingElapsedMs] = useState(0);
  const [referenceFrames, setReferenceFrames] = useState<VideoFrame[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
  const cameraRef = useRef<CameraInstance | null>(null);
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

  const handleOverlayLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setOverlaySize({ width, height });
  }, []);

  const referenceFrame = useMemo(
    () =>
      referenceFrameAtElapsedMs(
        referenceFrames,
        status.kind === "recording" ? elapsedMs : 0,
      ),
    [elapsedMs, referenceFrames, status.kind],
  );

  const referenceSkeleton = useMemo(
    () =>
      projectSkeleton(
        referenceFrame?.landmarks,
        overlaySize.width,
        overlaySize.height,
        {
          visibilityThreshold: 0.5,
          mirrorX: cameraPosition === "front",
        },
      ),
    [cameraPosition, overlaySize, referenceFrame],
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

  useEffect(() => {
    if (status.kind !== "recording") {
      setElapsedMs(0);
      return;
    }
    const id = setInterval(() => {
      setElapsedMs(Date.now() - status.startedAt);
    }, REFERENCE_PLAYBACK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status.kind !== "processing") {
      setProcessingElapsedMs(0);
      return;
    }
    const startedAt = status.startedAt;
    setProcessingElapsedMs(Math.max(0, Date.now() - startedAt));
    const id = setInterval(() => {
      setProcessingElapsedMs(Date.now() - startedAt);
    }, 500);
    return () => clearInterval(id);
  }, [status]);

  const useCameraDevice =
    VisionCamera?.useCameraDevice ?? ((_p: string) => undefined);
  const frontDevice = useCameraDevice("front");
  const backDevice = useCameraDevice("back");
  const device =
    cameraPosition === "back"
      ? backDevice ?? frontDevice
      : frontDevice ?? backDevice;

  useEffect(() => {
    (async () => {
      if (!VisionCamera) return;
      const cam = await VisionCamera.Camera.requestCameraPermission();
      setHasPermission(cam === "granted");
    })();
  }, []);

  const uploadRecording = useCallback(async (filePath: string) => {
    const uri = filePath.startsWith("file://") ? filePath : `file://${filePath}`;
    try {
      await processRecordedVideo(
        {
          uri,
          name: `recording-${Date.now()}.mp4`,
          type: "video/mp4",
        },
        { onStatus: handleProcessingStatus },
      );
    } catch {
      // processRecordedVideo emits the error status before rejecting.
    }
  }, [handleProcessingStatus]);

  const startRecording = useCallback(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    if (hasGuidedReference && referenceFrames.length === 0) {
      setStatus({
        kind: "error",
        message: referenceError ?? "Reference skeleton is not ready",
      });
      return;
    }
    setStatus({ kind: "recording", startedAt: Date.now() });
    cam.startRecording({
      onRecordingFinished: (video: { path: string }) => {
        void uploadRecording(video.path);
      },
      onRecordingError: (error: Error) => {
        setStatus({ kind: "error", message: error.message });
      },
    });
  }, [
    hasGuidedReference,
    referenceError,
    referenceFrames.length,
    uploadRecording,
  ]);

  const stopRecording = useCallback(async () => {
    const cam = cameraRef.current;
    if (!cam) return;
    try {
      await cam.stopRecording();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }, []);

  const resetStatus = useCallback(() => setStatus({ kind: "idle" }), []);
  const closeCamera = useCallback(() => router.replace("/feed"), []);
  const flipCamera = useCallback(() => {
    setCameraPosition((current) => (current === "back" ? "front" : "back"));
  }, []);
  const elapsedSeconds = useMemo(() => (elapsedMs / 1000).toFixed(1), [
    elapsedMs,
  ]);
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

  if (Platform.OS === "web") {
    return <CameraWeb referenceId={guidedReferenceId} />;
  }

  if (!VisionCamera) {
    return (
      <View className="flex-1 bg-dark items-center justify-center p-5">
        <AppText variant="baseText">
          Camera module unavailable. Use a development build.
        </AppText>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View className="flex-1 bg-dark items-center justify-center p-5">
        <AppText variant="baseText">
          Camera permission is required.
        </AppText>
      </View>
    );
  }

  if (!device) {
    return (
      <View className="flex-1 bg-dark items-center justify-center p-5">
        <AppText variant="baseText">No camera found.</AppText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark" onLayout={handleOverlayLayout}>
      <VisionCamera.Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && status.kind !== "done"}
        video
        audio={false}
      />

      {hasGuidedReference ? (
        <Canvas style={styles.referenceOverlay} pointerEvents="none">
          {referenceSkeleton.lines.map((line) => (
            <Line
              key={`reference-line-${line.key}`}
              p1={vec(line.p1.x, line.p1.y)}
              p2={vec(line.p2.x, line.p2.y)}
              strokeWidth={4}
              color="#9BFF68"
            />
          ))}
          {referenceSkeleton.joints.map((joint) => (
            <Circle
              key={`reference-joint-${joint.key}`}
              cx={joint.cx}
              cy={joint.cy}
              r={5}
              color="#FFFFFF"
            />
          ))}
        </Canvas>
      ) : null}

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
        <PipelineHealthBanner />
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
        {status.kind === "recording" ? (
          <View className="bg-dark/80 border border-white/10 rounded-full px-5 py-2 flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full bg-dangerous" />
            <AppText variant="baseText">REC {elapsedSeconds}s</AppText>
          </View>
        ) : null}

        {status.kind === "uploading" ? (
          <View className="bg-dark/80 border border-white/10 rounded-2xl p-4 gap-2 items-center">
            <ActivityIndicator size="large" color="#fff" />
            <AppText variant="baseText">
              Uploading... {Math.round(status.ratio * 100)}%
            </AppText>
          </View>
        ) : null}

        {status.kind === "processing" ? (
          <View className="bg-dark/80 border border-white/10 rounded-2xl p-4 gap-2 items-center">
            <ActivityIndicator size="large" color="#fff" />
            <AppText variant="baseText">
              Running precise pose extraction...{" "}
              {(processingElapsedMs / 1000).toFixed(1)}s
            </AppText>
            <AppText variant="baseText">
              {status.framesProcessed !== undefined
                ? status.totalFrames
                  ? `Processed ${status.framesProcessed} / ${status.totalFrames} frames`
                  : `Processed ${status.framesProcessed} frames`
                : "The server is re-analyzing every frame."}
            </AppText>
          </View>
        ) : null}

        {status.kind === "done" ? (
          <View className="bg-dark/80 border border-white/10 rounded-2xl p-4 gap-3 items-center">
            <AppText variant="baseText">
              Processed video {status.result.videoId}
            </AppText>
            <AppText variant="baseText">
              {status.result.frameCount} frames @{" "}
              {status.result.fps.toFixed(1)} fps
            </AppText>
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
              onPress={resetStatus}
              className="h-10 px-5 rounded-full bg-white/10 items-center justify-center"
            >
              <AppText variant="baseText">Record another</AppText>
            </Pressable>
          </View>
        ) : null}

        {status.kind === "error" ? (
          <View className="bg-dark/80 border border-dangerous/50 rounded-2xl p-4 gap-3 items-center">
            <AppText variant="baseText">Error: {status.message}</AppText>
            <Pressable
              onPress={resetStatus}
              className="h-10 px-5 rounded-full bg-white/10 items-center justify-center"
            >
              <AppText variant="baseText">Try again</AppText>
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

        {status.kind === "idle" ? (
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
        ) : null}

        {status.kind === "recording" ? (
          <Pressable
            onPress={stopRecording}
            className="h-16 w-16 rounded-full bg-white border border-white/5 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Arreter l'enregistrement"
          >
            <View className="h-6 w-6 rounded-md bg-dangerous" />
          </Pressable>
        ) : null}

        {status.kind === "uploading" || status.kind === "processing" ? (
          <View className="h-16 w-16 rounded-full bg-white/10 border border-white/5 items-center justify-center">
            <ActivityIndicator color="#fff" />
          </View>
        ) : null}

        {status.kind === "done" || status.kind === "error" ? (
          <Pressable
            onPress={resetStatus}
            className="h-16 w-16 rounded-full bg-white/10 border border-white/5 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Reinitialiser"
          >
            <RefreshDouble className="size-8 text-white" />
          </Pressable>
        ) : null}

        <Pressable
          className="h-16 w-16 rounded-full bg-white/10 border border-white/5 backdrop-blur-sm items-center justify-center"
          onPress={flipCamera}
          accessibilityRole="button"
          accessibilityLabel="Changer de camera"
        >
          <RefreshDouble className="size-8 text-white" />
        </Pressable>
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
  referenceOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
