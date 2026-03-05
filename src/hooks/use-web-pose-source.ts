import { useCallback, useEffect, useRef, useState } from "react";

type SourceMode = "camera" | "file";

interface PoseLandmarkerLike {
  detectForVideo: (video: HTMLVideoElement, timestampMs: number) => unknown;
}

interface UseWebPoseSourceParams {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  poseLandmarkerRef: React.RefObject<PoseLandmarkerLike | null>;
  startLoop: () => void;
  stopLoop: () => void;
  resetTimestamp: () => void;
  onSourceReset: () => void;
}

interface UseWebPoseSourceResult {
  mode: SourceMode;
  selectedFileName: string | null;
  isLoading: boolean;
  error: string | null;
  loadFile: (file: File) => Promise<void>;
  startCamera: () => Promise<void>;
  cleanupSource: () => void;
}

function canRunDetection(poseLandmarkerRef: React.RefObject<PoseLandmarkerLike | null>) {
  return poseLandmarkerRef.current !== null;
}

export function useWebPoseSource({
  videoRef,
  canvasRef,
  poseLandmarkerRef,
  startLoop,
  stopLoop,
  resetTimestamp,
  onSourceReset,
}: UseWebPoseSourceParams): UseWebPoseSourceResult {
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const modeRef = useRef<SourceMode>("file");

  const [mode, setMode] = useState<SourceMode>("file");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetVideoElement = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.srcObject = null;
    video.removeAttribute("src");
    video.load();
  }, [videoRef]);

  const cleanupSource = useCallback(() => {
    stopLoop();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    resetVideoElement();
  }, [resetVideoElement, stopLoop]);

  const prepareSource = useCallback(() => {
    cleanupSource();
    onSourceReset();
    setError(null);
    setIsLoading(true);
  }, [cleanupSource, onSourceReset]);

  const loadFile = useCallback(
    async (file: File) => {
      const video = videoRef.current;
      if (!video) return;

      if (!canRunDetection(poseLandmarkerRef)) {
        setError("Pose model is not ready yet");
        return;
      }

      prepareSource();
      modeRef.current = "file";
      setMode("file");
      setSelectedFileName(file.name);

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
          // Autoplay can be blocked; detection continues once user interacts.
        }

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        resetTimestamp();
        startLoop();
      };

      video.addEventListener("loadeddata", onLoadedData, { once: true });
      video.load();
    },
    [
      canvasRef,
      poseLandmarkerRef,
      prepareSource,
      resetTimestamp,
      startLoop,
      videoRef,
    ],
  );

  const startCamera = useCallback(async () => {
    if (modeRef.current === "camera") {
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (!canRunDetection(poseLandmarkerRef)) {
      setError("Pose model is not ready yet");
      return;
    }

    prepareSource();
    modeRef.current = "camera";
    setMode("camera");
    setSelectedFileName(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });

      streamRef.current = stream;
      video.srcObject = stream;

      const onLoadedData = () => {
        setIsLoading(false);

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        resetTimestamp();
        startLoop();
      };

      video.addEventListener("loadeddata", onLoadedData, { once: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start camera");
      setIsLoading(false);
    }
  }, [
    canvasRef,
    poseLandmarkerRef,
    prepareSource,
    resetTimestamp,
    startLoop,
    videoRef,
  ]);

  useEffect(() => cleanupSource, [cleanupSource]);

  return {
    mode,
    selectedFileName,
    isLoading,
    error,
    loadFile,
    startCamera,
    cleanupSource,
  };
}
