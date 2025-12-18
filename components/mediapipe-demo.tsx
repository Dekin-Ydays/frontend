import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { drawSkeleton } from '@/utils/skeleton-renderer';

// Dynamic imports handling for Web vs Native
let VisionCamera: any = null;
let FastTflite: any = null;
let Worklets: any = null;

if (Platform.OS !== 'web') {
  try {
    VisionCamera = require('react-native-vision-camera');
    FastTflite = require('react-native-fast-tflite');
    Worklets = require('react-native-worklets-core');
  } catch (e) {
    console.warn('Failed to load native modules:', e);
  }
}

interface HeadOrientation {
  pitch: number;
  yaw: number;
  roll: number;
}

// WebSocket Configuration
const WS_URL = Platform.select({
  android: 'ws://10.0.2.2:3000/ws', // Android Emulator localhost
  default: 'ws://localhost:3000/ws',
});

const VIDEO_FPS = 10; // Limit sending to 5 FPS

export default function MediaPipeDemo() {
  // Shared WebSocket logic could go here, but for simplicity/separation,
  // I'll implement it inside each view or pass it down.
  // Passing it down is cleaner.

  const wsRef = useRef<WebSocket | null>(null);
  const lastSendTimeRef = useRef<number>(0);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket;

    const connect = () => {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('Connected to WebSocket server');
        setWsConnected(true);
      };

      ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
        setWsConnected(false);
        // Simple reconnect logic (optional, keeping it simple for now)
        setTimeout(connect, 3000);
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const sendLandmarks = useCallback((landmarks: any) => {
    const now = Date.now();
    if (now - lastSendTimeRef.current < 1000 / VIDEO_FPS) {
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'pose-landmarks', data: landmarks }));
      lastSendTimeRef.current = now;
    }
  }, []);

  if (Platform.OS === 'web') {
    return (
      <WebPoseView
        sendLandmarks={sendLandmarks}
        wsConnected={wsConnected}
      />
    );
  } else {
    return (
      <NativePoseView
        sendLandmarks={sendLandmarks}
        wsConnected={wsConnected}
      />
    );
  }
}

// ----------------------------------------------------------------------
// NATIVE IMPLEMENTATION (iOS/Android)
// ----------------------------------------------------------------------
function NativePoseView({ sendLandmarks, wsConnected }: { sendLandmarks: (data: any) => void; wsConnected: boolean }) {
  const [hasPermission, setHasPermission] = useState(false);
  const useCameraDevice = VisionCamera?.useCameraDevice ?? ((..._args: any[]) => null);
  const device = useCameraDevice('front');
  const { useTensorflowModel } = FastTflite || { useTensorflowModel: () => ({ state: 'error' }) };
  const { useFrameProcessor } = VisionCamera || { useFrameProcessor: () => null };

  // Note: For native, you would need to:
  // 1. Download the model from https://www.tensorflow.org/lite/models/pose_estimation
  // 2. Add it to assets/models/ directory
  // 3. Then require it: const modelAsset = require('../assets/models/pose_landmark_lite.tflite');
  const modelAsset = null;
  const model = useTensorflowModel(modelAsset) || { state: 'error' };

  // Wrap sendLandmarks in a Worklet-safe wrapper if possible,
  // but usually we need to call it via runOnJS.
  // Since sendLandmarks is a JS function, we need to create a wrapper that the worklet can call.
  // Ideally, we pass a function that explicitly calls runOnJS.

  const handlePoseDetected = Worklets ? Worklets.createRunOnJS(sendLandmarks) : sendLandmarks;

  useEffect(() => {
    (async () => {
      if (VisionCamera) {
        const status = await VisionCamera.Camera.requestCameraPermission();
        setHasPermission(status === 'granted');
      }
    })();
  }, []);

  const frameProcessor = useFrameProcessor(
    (frame: any) => {
      'worklet';
      if (model.state !== 'loaded' || !model.model) return;

      try {
        const outputs = model.model.runSync([frame]);

        // For demonstration, we are just sending the raw output count or basic info
        // In a real app, you would parse 'outputs' into a landmark object here.
        // Parsing tensors is complex and model-specific.
        // We'll simulate sending data structure for now or send raw if small.

        // Example: Assuming outputs[0] is landmarks
        const rawData = outputs.length > 0 ? 'Pose Detected (Raw Tensor)' : null;

        if (rawData) {
          handlePoseDetected(rawData);
        }

        console.log(`Model ran! Output count: ${outputs.length}`);
      } catch (e) {
        console.error('Model run failed:', e);
      }
    },
    [model, handlePoseDetected],
  );

  if (!VisionCamera) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.error}>Native modules not loaded.</ThemedText>
      </ThemedView>
    );
  }

  if (!hasPermission)
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting permission...</ThemedText>
      </ThemedView>
    );
  if (device == null)
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No camera found</ThemedText>
      </ThemedView>
    );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Native Pose Detection</ThemedText>
      <ThemedText style={{ color: wsConnected ? 'green' : 'red' }}>
        WS Status: {wsConnected ? 'Connected' : 'Disconnected'}
      </ThemedText>
      <ThemedText>Model State: {model.state}</ThemedText>

      <View style={styles.cameraContainer}>
        <VisionCamera.Camera
          style={styles.camera}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          pixelFormat="yuv"
        />
      </View>
    </ThemedView>
  );
}

// ----------------------------------------------------------------------
// WEB IMPLEMENTATION
// ----------------------------------------------------------------------
function WebPoseView({ sendLandmarks, wsConnected }: { sendLandmarks: (data: any) => void; wsConnected: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const modeRef = useRef<'camera' | 'file'>('file');
  const lastTimestampMsRef = useRef<number>(-Infinity);
  const [mode, setMode] = useState<'camera' | 'file'>('file');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poseDetected, setPoseDetected] = useState<boolean>(false);
  const [headOrientation, setHeadOrientation] = useState<HeadOrientation | null>(null);
  const lastOrientationUpdateRef = useRef<number>(0);

  // We use a ref to hold the latest sendLandmarks function to avoid stale closures in the animation loop
  const sendLandmarksRef = useRef(sendLandmarks);
  useEffect(() => {
    sendLandmarksRef.current = sendLandmarks;
  }, [sendLandmarks]);

  useEffect(() => {
    let cancelled = false;

    const stopActiveSource = () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      const video = videoRef.current;
      if (video) {
        video.pause();
        video.srcObject = null;
        video.removeAttribute('src');
        video.load();
      }
    };

    const initialize = async () => {
      try {
        const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );

        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });

        if (cancelled) return;
        setModelReady(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing MediaPipe Web:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize MediaPipe');
        setIsLoading(false);
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      stopActiveSource();
      if (poseLandmarkerRef.current) poseLandmarkerRef.current.close();
      poseLandmarkerRef.current = null;
    };
  }, []);

  function drawLandmarks(ctx: CanvasRenderingContext2D, landmarksList: any[], width: number, height: number) {
    for (const landmarks of landmarksList) {
      // Calculate head orientation
      const nose = landmarks[0];
      const leftEye = landmarks[2];
      const rightEye = landmarks[5];

      if (nose && leftEye && rightEye) {
        const now = Date.now();
        if (now - lastOrientationUpdateRef.current > 200) {
          lastOrientationUpdateRef.current = now;

          const eyeCenterX = (leftEye.x + rightEye.x) / 2;
          const yaw = Math.atan2(nose.x - eyeCenterX, 0.1) * (180 / Math.PI);
          const eyeCenterY = (leftEye.y + rightEye.y) / 2;
          const pitch = Math.atan2(nose.y - eyeCenterY, 0.1) * (180 / Math.PI);
          const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);
          setHeadOrientation({ pitch, yaw, roll });
        }
      }

      drawSkeleton(ctx, landmarks, { width, height });
    }
  }

  const handleUploadPress = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    const video = videoRef.current;
    if (!video) return;

    if (!poseLandmarkerRef.current) {
      setError('Pose model is not ready yet');
      return;
    }

    // Reset input so selecting the same file twice triggers onChange.
    event.target.value = '';

    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    animationIdRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    lastTimestampMsRef.current = -Infinity;

    modeRef.current = 'file';
    setMode('file');
    setSelectedFileName(file.name);
    setError(null);
    setIsLoading(true);
    setPoseDetected(false);
    setHeadOrientation(null);

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    video.srcObject = null;
    video.src = url;
    video.playsInline = true;
    video.loop = true;
    video.muted = true;

    const onLoadedData = async () => {
      setIsLoading(false);
      try {
        await video.play();
      } catch {
        // Autoplay can be blocked; detection will still run once user interacts.
      }

      // Ensure canvas sizes are ready.
      if (canvasRef.current) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
      }

      // Start detection loop.
      const start = () => {
        if (!videoRef.current || !canvasRef.current || !poseLandmarkerRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        lastTimestampMsRef.current = -Infinity;

        const detect = () => {
          const currentVideo = videoRef.current;
          const currentCanvas = canvasRef.current;
          const currentCtx = currentCanvas?.getContext('2d');
          const currentLandmarker = poseLandmarkerRef.current;
          if (!currentVideo || !currentCanvas || !currentCtx || !currentLandmarker) return;

          const proposed = performance.now();
          const last = lastTimestampMsRef.current;
          const timestampMs = proposed > last ? proposed : last + 1;
          lastTimestampMsRef.current = timestampMs;
          const results = currentLandmarker.detectForVideo(currentVideo, timestampMs);

          currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
          currentCtx.drawImage(currentVideo, 0, 0, currentCanvas.width, currentCanvas.height);

          if (results.landmarks && results.landmarks.length > 0) {
            setPoseDetected(true);
            drawLandmarks(currentCtx, results.landmarks, currentCanvas.width, currentCanvas.height);
            sendLandmarksRef.current(results.landmarks);
          } else {
            setPoseDetected(false);
            setHeadOrientation(null);
          }

          animationIdRef.current = requestAnimationFrame(detect);
        };

        detect();
      };

      start();
    };

    video.addEventListener('loadeddata', onLoadedData, { once: true });
    video.load();
  };

  const handleUseCameraPress = async () => {
    if (modeRef.current === 'camera') return;
    // Re-run the same initialization effect logic by starting camera directly.
    // This is safe because we keep the landmarker in a ref.
    const video = videoRef.current;
    if (!video) return;
    if (!poseLandmarkerRef.current) {
      setError('Pose model is not ready yet');
      return;
    }

    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    animationIdRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    modeRef.current = 'camera';
    setMode('camera');
    setSelectedFileName(null);
    setError(null);
    setIsLoading(true);
    lastTimestampMsRef.current = -Infinity;
    setPoseDetected(false);
    setHeadOrientation(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      video.srcObject = stream;
      const onLoadedData = () => {
        setIsLoading(false);
        if (!videoRef.current || !canvasRef.current) return;
        if (!poseLandmarkerRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        lastTimestampMsRef.current = -Infinity;

        const detect = () => {
          const currentVideo = videoRef.current;
          const currentCanvas = canvasRef.current;
          const currentCtx = currentCanvas?.getContext('2d');
          const currentLandmarker = poseLandmarkerRef.current;
          if (!currentVideo || !currentCanvas || !currentCtx || !currentLandmarker) return;

          const proposed = performance.now();
          const last = lastTimestampMsRef.current;
          const timestampMs = proposed > last ? proposed : last + 1;
          lastTimestampMsRef.current = timestampMs;
          const results = currentLandmarker.detectForVideo(currentVideo, timestampMs);

          currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
          currentCtx.drawImage(currentVideo, 0, 0, currentCanvas.width, currentCanvas.height);

          if (results.landmarks && results.landmarks.length > 0) {
            setPoseDetected(true);
            drawLandmarks(currentCtx, results.landmarks, currentCanvas.width, currentCanvas.height);
            sendLandmarksRef.current(results.landmarks);
          } else {
            setPoseDetected(false);
            setHeadOrientation(null);
          }

          animationIdRef.current = requestAnimationFrame(detect);
        };

        detect();
      };

      video.addEventListener('loadeddata', onLoadedData, { once: true });
    } catch (err) {
      console.error('Error starting camera:', err);
      setError(err instanceof Error ? err.message : 'Failed to start camera');
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Body Pose Tracking (Web)</ThemedText>
      <ThemedText style={{ color: wsConnected ? 'green' : 'red' }}>
        WS Status: {wsConnected ? 'Connected' : 'Disconnected'}
      </ThemedText>
      <View style={styles.sourceRow}>
        <TouchableOpacity
          style={[styles.sourceButton, mode === 'camera' && styles.sourceButtonActive]}
          onPress={handleUseCameraPress}
          accessibilityLabel="Use camera"
        >
          <ThemedText style={styles.sourceButtonText}>Camera</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sourceButton, mode === 'file' && styles.sourceButtonActive]}
          onPress={handleUploadPress}
          accessibilityLabel="Upload video"
        >
          <ThemedText style={styles.sourceButtonText}>Upload video</ThemedText>
        </TouchableOpacity>
        <input
          ref={fileInputRef as any}
          type="file"
          accept="video/*"
          onChange={handleFileSelected}
          style={{ display: 'none' } as any}
        />
      </View>
      {selectedFileName && (
        <ThemedText
          style={styles.fileHint}
          numberOfLines={1}
        >
          Using: {selectedFileName}
        </ThemedText>
      )}
      <ThemedText>
        {!modelReady
          ? 'Loading MediaPipe...'
          : isLoading
            ? 'Preparing video...'
            : mode === 'file' && !selectedFileName
              ? 'Upload a video to start'
              : poseDetected
                ? 'Pose detected!'
                : 'No pose detected'}
      </ThemedText>
      {headOrientation && (
        <ThemedView style={styles.orientationContainer}>
          <ThemedText type="defaultSemiBold">Head Orientation:</ThemedText>
          <ThemedText>Pitch: {headOrientation.pitch.toFixed(1)}°</ThemedText>
          <ThemedText>Yaw: {headOrientation.yaw.toFixed(1)}°</ThemedText>
          <ThemedText>Roll: {headOrientation.roll.toFixed(1)}°</ThemedText>
        </ThemedView>
      )}
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      <View style={styles.videoContainer}>
        <video
          ref={videoRef as any}
          autoPlay
          playsInline
          style={{ display: 'none' }}
        />
        <canvas
          ref={canvasRef as any}
          style={styles.canvas}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  sourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  sourceButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    backgroundColor: 'rgba(128, 128, 128, 0.08)',
  },
  sourceButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
  },
  sourceButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileHint: {
    opacity: 0.7,
  },
  videoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 8,
  },
  error: {
    color: '#FF6B6B',
  },
  orientationContainer: {
    padding: 12,
    gap: 4,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  cameraContainer: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },
  camera: {
    flex: 1,
  },
});
