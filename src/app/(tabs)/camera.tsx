import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { AppText } from "@/components/ui/app-text";
import { CameraWeb } from "@/components/camera-web";
import { PipelineHealthBanner } from "@/components/pipeline-health-banner";
import {
  newJobId,
  processVideo,
  ProcessedVideo,
  subscribeExtractionProgress,
} from "@/services/video-parser-api";

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
  | { kind: "recording" }
  | { kind: "uploading"; ratio: number }
  | {
      kind: "processing";
      startedAt: number;
      framesProcessed?: number;
      totalFrames?: number;
    }
  | { kind: "done"; result: ProcessedVideo }
  | { kind: "error"; message: string };

export default function CameraScreen() {
  const isFocused = useIsFocused();
  const [hasPermission, setHasPermission] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [processingElapsedMs, setProcessingElapsedMs] = useState(0);
  const cameraRef = useRef<CameraInstance | null>(null);

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
  const device = backDevice ?? frontDevice;

  useEffect(() => {
    (async () => {
      if (!VisionCamera) return;
      const cam = await VisionCamera.Camera.requestCameraPermission();
      const mic = await VisionCamera.Camera.requestMicrophonePermission();
      setHasPermission(cam === "granted");
      setHasMicPermission(mic === "granted");
    })();
  }, []);

  const uploadRecording = useCallback(async (filePath: string) => {
    setStatus({ kind: "uploading", ratio: 0 });
    const uri = filePath.startsWith("file://") ? filePath : `file://${filePath}`;
    const jobId = newJobId();
    const unsubscribeProgress = subscribeExtractionProgress((evt) => {
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
    try {
      const result = await processVideo(
        {
          uri,
          name: `recording-${Date.now()}.mp4`,
          type: "video/mp4",
        },
        (event) => {
          if (event.phase === "uploading") {
            setStatus({ kind: "uploading", ratio: event.ratio });
          } else {
            setStatus({ kind: "processing", startedAt: Date.now() });
          }
        },
        jobId,
      );
      setStatus({ kind: "done", result });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      unsubscribeProgress();
    }
  }, []);

  const startRecording = useCallback(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    setStatus({ kind: "recording" });
    cam.startRecording({
      onRecordingFinished: (video: { path: string }) => {
        void uploadRecording(video.path);
      },
      onRecordingError: (error: Error) => {
        setStatus({ kind: "error", message: error.message });
      },
    });
  }, [uploadRecording]);

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

  if (Platform.OS === "web") {
    return <CameraWeb />;
  }

  if (!VisionCamera) {
    return (
      <View style={styles.message}>
        <AppText variant="baseText">
          Camera module unavailable. Use a development build.
        </AppText>
      </View>
    );
  }

  if (!hasPermission || !hasMicPermission) {
    return (
      <View style={styles.message}>
        <AppText variant="baseText">
          Camera and microphone permissions are required.
        </AppText>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.message}>
        <AppText variant="baseText">No camera found.</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VisionCamera.Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && status.kind !== "done"}
        video={true}
        audio={true}
      />

      <View style={styles.overlay}>
        <View style={styles.bannerSlot}>
          <PipelineHealthBanner />
        </View>

        {status.kind === "uploading" ? (
          <View style={styles.statusBox}>
            <ActivityIndicator size="large" color="#fff" />
            <AppText variant="baseText">
              Uploading… {Math.round(status.ratio * 100)}%
            </AppText>
          </View>
        ) : null}

        {status.kind === "processing" ? (
          <View style={styles.statusBox}>
            <ActivityIndicator size="large" color="#fff" />
            <AppText variant="baseText">
              Running precise pose extraction… {(processingElapsedMs / 1000).toFixed(1)}s
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
          <View style={styles.statusBox}>
            <AppText variant="baseText">
              Processed video {status.result.videoId}
            </AppText>
            <AppText variant="baseText">
              {status.result.frameCount} frames @ {status.result.fps.toFixed(1)} fps
            </AppText>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/compare",
                  params: { reference: status.result.videoId },
                })
              }
              style={styles.secondaryButton}
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
              style={styles.secondaryButton}
            >
              <AppText variant="baseText">Use as comparison →</AppText>
            </Pressable>
            <Pressable onPress={resetStatus} style={styles.secondaryButton}>
              <AppText variant="baseText">Record another</AppText>
            </Pressable>
          </View>
        ) : null}

        {status.kind === "error" ? (
          <View style={styles.statusBox}>
            <AppText variant="baseText">Error: {status.message}</AppText>
            <Pressable onPress={resetStatus} style={styles.secondaryButton}>
              <AppText variant="baseText">Try again</AppText>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.controls}>
          {status.kind === "idle" || status.kind === "error" ? (
            <Pressable onPress={startRecording} style={styles.recordButton}>
              <View style={styles.recordInner} />
            </Pressable>
          ) : null}

          {status.kind === "recording" ? (
            <Pressable onPress={stopRecording} style={styles.stopButton}>
              <View style={styles.stopInner} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60,
  },
  bannerSlot: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
  },
  controls: {
    alignItems: "center",
    justifyContent: "center",
  },
  recordButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  recordInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ef4444",
  },
  stopButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  stopInner: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#ef4444",
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  statusBox: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    gap: 6,
  },
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },
});
