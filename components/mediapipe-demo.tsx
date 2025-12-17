import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface HeadOrientation {
  pitch: number;
  yaw: number;
  roll: number;
}

export default function MediaPipeDemo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [poseDetected, setPoseDetected] = useState<boolean>(false);
  const [headOrientation, setHeadOrientation] = useState<HeadOrientation | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (Platform.OS === 'web') {
      initializeWebPoseDetection();
    } else {
      // For mobile, request camera permission
      if (permission?.granted) {
        initializeMobilePoseDetection();
      }
    }
  }, [permission]);

  async function initializeWebPoseDetection() {
    let poseLandmarker: any = null;
    let animationId: number;

    try {
      // Dynamically import MediaPipe Tasks Vision (web only)
      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

      // Initialize MediaPipe
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });

      // Get video stream
      const stream = await navigator.mediaDevices.getUserMedia({
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

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        async function detect() {
          if (!video || !canvas || !ctx || !poseLandmarker) return;

          const startTimeMs = performance.now();
          const results = poseLandmarker.detectForVideo(video, startTimeMs);

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw video frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Draw pose landmarks
          if (results.landmarks && results.landmarks.length > 0) {
            setPoseDetected(true);

            for (const landmarks of results.landmarks) {
              // Calculate head orientation using key face landmarks
              const nose = landmarks[0];
              const leftEye = landmarks[2];
              const rightEye = landmarks[5];

              if (nose && leftEye && rightEye) {
                // Calculate yaw (left/right rotation)
                const eyeCenterX = (leftEye.x + rightEye.x) / 2;
                const yaw = Math.atan2(nose.x - eyeCenterX, 0.1) * (180 / Math.PI);

                // Calculate pitch (up/down tilt)
                const eyeCenterY = (leftEye.y + rightEye.y) / 2;
                const pitch = Math.atan2(nose.y - eyeCenterY, 0.1) * (180 / Math.PI);

                // Calculate roll (side tilt)
                const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);

                setHeadOrientation({ pitch, yaw, roll });
              }

              // All pose connections (33 landmarks total)
              const connections = [
                // Face
                [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
                [9, 10],
                // Torso and shoulders
                [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
                [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
                // Body connection
                [11, 23], [12, 24], [23, 24],
                // Left leg
                [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
                // Right leg
                [24, 26], [26, 28], [28, 30], [30, 32], [28, 32],
              ];

              // Draw connections
              ctx.strokeStyle = '#00FF00';
              ctx.lineWidth = 3;

              for (const [start, end] of connections) {
                if (landmarks[start] && landmarks[end]) {
                  const startPoint = landmarks[start];
                  const endPoint = landmarks[end];

                  ctx.beginPath();
                  ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
                  ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
                  ctx.stroke();
                }
              }

              // Draw all landmarks with different colors
              for (let i = 0; i < landmarks.length; i++) {
                const landmark = landmarks[i];

                // Color code landmarks by body part
                if (i >= 0 && i <= 10) {
                  ctx.fillStyle = '#00FFFF'; // Cyan for face
                } else if (i >= 11 && i <= 22) {
                  ctx.fillStyle = '#FF0000'; // Red for upper body
                } else if (i >= 23 && i <= 24) {
                  ctx.fillStyle = '#FFFF00'; // Yellow for hips
                } else {
                  ctx.fillStyle = '#FF00FF'; // Magenta for legs/feet
                }

                ctx.beginPath();
                ctx.arc(
                  landmark.x * canvas.width,
                  landmark.y * canvas.height,
                  6,
                  0,
                  2 * Math.PI
                );
                ctx.fill();

                // Draw landmark number
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '10px Arial';
                ctx.fillText(
                  i.toString(),
                  landmark.x * canvas.width + 8,
                  landmark.y * canvas.height - 8
                );
              }
            }
          } else {
            setPoseDetected(false);
            setHeadOrientation(null);
          }

          animationId = requestAnimationFrame(detect);
        }

        detect();
      }

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
        if (poseLandmarker) {
          poseLandmarker.close();
        }
      };
    } catch (err) {
      console.error('Error initializing MediaPipe:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize MediaPipe');
      setIsLoading(false);
    }
  }

  async function initializeMobilePoseDetection() {
    try {
      setIsLoading(false);
      // Mobile implementation note: Full pose detection requires native modules
      // For now, showing camera feed. For production, consider:
      // 1. Using react-native-vision-camera with frame processors
      // 2. Using TensorFlow Lite with native bindings
      // 3. Using a backend service for pose detection
    } catch (err) {
      console.error('Error initializing mobile pose detection:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize camera');
      setIsLoading(false);
    }
  }

  // Mobile permission handling
  if (Platform.OS !== 'web') {
    if (!permission) {
      return (
        <ThemedView style={styles.container}>
          <ThemedText>Loading camera permissions...</ThemedText>
        </ThemedView>
      );
    }

    if (!permission.granted) {
      return (
        <ThemedView style={styles.container}>
          <ThemedText style={styles.message}>Camera permission is required for pose tracking</ThemedText>
          <ThemedText
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            Grant Camera Permission
          </ThemedText>
        </ThemedView>
      );
    }

    // Mobile camera view
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Body Pose Tracking (Mobile)</ThemedText>
        <ThemedText style={styles.message}>
          Camera is active. Note: Full pose detection on mobile requires additional native modules.
        </ThemedText>
        <ThemedText style={styles.infoText}>
          For production use, consider integrating:
          {'\n'}• TensorFlow Lite with native bindings
          {'\n'}• react-native-vision-camera with frame processors
          {'\n'}• MediaPipe native SDKs (iOS/Android)
        </ThemedText>
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="front"
          />
        </View>
      </ThemedView>
    );
  }

  // Web implementation
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Body Pose Tracking Demo</ThemedText>
      <ThemedText>
        {isLoading ? 'Loading MediaPipe...' : poseDetected ? 'Pose detected!' : 'No pose detected'}
      </ThemedText>
      {headOrientation && (
        <ThemedView style={styles.orientationContainer}>
          <ThemedText type="defaultSemiBold">Head Orientation:</ThemedText>
          <ThemedText>Pitch (up/down): {headOrientation.pitch.toFixed(1)}°</ThemedText>
          <ThemedText>Yaw (left/right): {headOrientation.yaw.toFixed(1)}°</ThemedText>
          <ThemedText>Roll (tilt): {headOrientation.roll.toFixed(1)}°</ThemedText>
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
        <canvas ref={canvasRef as any} style={styles.canvas} />
      </View>
      <ThemedView style={styles.legend}>
        <ThemedText style={styles.legendText}>
          🔵 Face (0-10)  🔴 Upper body (11-22)  🟡 Hips (23-24)  🟣 Legs (25-32)
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');

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
  legend: {
    padding: 8,
    alignItems: 'center',
  },
  legendText: {
    fontSize: 12,
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
  message: {
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 12,
  },
  permissionButton: {
    padding: 12,
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
