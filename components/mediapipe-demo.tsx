import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

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
  android: 'ws://10.0.2.2:3001', // Android Emulator localhost
  default: 'ws://localhost:3001/ws',
});

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
    if (now - lastSendTimeRef.current < 200) {
      // Limit to 5 FPS (1000ms / 5 = 200ms)
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
  const device = VisionCamera?.useCameraDevice ? VisionCamera.useCameraDevice('front') : null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [poseDetected, setPoseDetected] = useState<boolean>(false);
  const [headOrientation, setHeadOrientation] = useState<HeadOrientation | null>(null);

  // We use a ref to hold the latest sendLandmarks function to avoid stale closures in the animation loop
  const sendLandmarksRef = useRef(sendLandmarks);
  useEffect(() => {
    sendLandmarksRef.current = sendLandmarks;
  }, [sendLandmarks]);

  useEffect(() => {
    initializeWebPoseDetection();
    return () => {
      /* cleanup handled in closure */
    };
  }, []);

  async function initializeWebPoseDetection() {
    let poseLandmarker: any = null;
    let animationId: number;
    let stream: MediaStream | null = null;

    try {
      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
      );

      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });

      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
          setIsLoading(false);
          detectPose();
        });
      }

      function detectPose() {
        if (!videoRef.current || !canvasRef.current || !poseLandmarker) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        async function detect() {
          if (!video || !canvas || !ctx || !poseLandmarker) return;
          const startTimeMs = performance.now();
          const results = poseLandmarker.detectForVideo(video, startTimeMs);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          if (results.landmarks && results.landmarks.length > 0) {
            setPoseDetected(true);
            drawLandmarks(ctx, results.landmarks, canvas.width, canvas.height);

            // Send to WebSocket
            sendLandmarksRef.current(results.landmarks);
          } else {
            setPoseDetected(false);
            setHeadOrientation(null);
          }
          animationId = requestAnimationFrame(detect);
        }
        detect();
      }

      return () => {
        if (animationId) cancelAnimationFrame(animationId);
        if (stream) stream.getTracks().forEach((t) => t.stop());
        if (poseLandmarker) poseLandmarker.close();
      };
    } catch (err) {
      console.error('Error initializing MediaPipe Web:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize MediaPipe');
      setIsLoading(false);
    }
  }

  function drawLandmarks(ctx: CanvasRenderingContext2D, landmarksList: any[], width: number, height: number) {
    for (const landmarks of landmarksList) {
      // Calculate head orientation
      const nose = landmarks[0];
      const leftEye = landmarks[2];
      const rightEye = landmarks[5];

      if (nose && leftEye && rightEye) {
        const eyeCenterX = (leftEye.x + rightEye.x) / 2;
        const yaw = Math.atan2(nose.x - eyeCenterX, 0.1) * (180 / Math.PI);
        const eyeCenterY = (leftEye.y + rightEye.y) / 2;
        const pitch = Math.atan2(nose.y - eyeCenterY, 0.1) * (180 / Math.PI);
        const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);
        setHeadOrientation({ pitch, yaw, roll });
      }

      // Connections
      const connections = [
        // Face
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 7],
        [0, 4],
        [4, 5],
        [5, 6],
        [6, 8],
        [9, 10],
        // Torso
        [11, 12],
        [11, 13],
        [13, 15],
        [15, 17],
        [15, 19],
        [15, 21],
        [12, 14],
        [14, 16],
        [16, 18],
        [16, 20],
        [16, 22],
        [11, 23],
        [12, 24],
        [23, 24],
        // Legs
        [23, 25],
        [25, 27],
        [27, 29],
        [29, 31],
        [27, 31],
        [24, 26],
        [26, 28],
        [28, 30],
        [30, 32],
        [28, 32],
      ];

      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;
      for (const [start, end] of connections) {
        if (landmarks[start] && landmarks[end]) {
          ctx.beginPath();
          ctx.moveTo(landmarks[start].x * width, landmarks[start].y * height);
          ctx.lineTo(landmarks[end].x * width, landmarks[end].y * height);
          ctx.stroke();
        }
      }

      // Points
      for (let i = 0; i < landmarks.length; i++) {
        const l = landmarks[i];
        ctx.fillStyle = i <= 10 ? '#00FFFF' : i <= 22 ? '#FF0000' : '#FFFF00';
        ctx.beginPath();
        ctx.arc(l.x * width, l.y * height, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Body Pose Tracking (Web)</ThemedText>
      <ThemedText style={{ color: wsConnected ? 'green' : 'red' }}>
        WS Status: {wsConnected ? 'Connected' : 'Disconnected'}
      </ThemedText>
      <ThemedText>
        {isLoading ? 'Loading MediaPipe...' : poseDetected ? 'Pose detected!' : 'No pose detected'}
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
  videoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    maxWidth: '100%',
    height: 'auto',
    border: '2px solid #00FF00',
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
