import { useState, useRef, useEffect, useCallback } from 'react';

interface UseVideoPlayerProps {
  totalFrames: number;
  fps?: number;
  onFrameChange?: (frameIndex: number) => void;
}

export function useVideoPlayer({ totalFrames, fps = 30, onFrameChange }: UseVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const handleSeek = useCallback((frameIndex: number) => {
    const normalizedIndex = Math.floor(Math.max(0, Math.min(frameIndex, totalFrames - 1)));
    lastFrameTimeRef.current = 0;
    
    // Stop playing if we seek manually
    setIsPlaying(false);
    stopAnimation();
    
    setCurrentFrameIndex(normalizedIndex);
    onFrameChange?.(normalizedIndex);
  }, [totalFrames, stopAnimation, onFrameChange]);

  const handleNextFrame = useCallback(() => {
    handleSeek(currentFrameIndex + 1);
  }, [currentFrameIndex, handleSeek]);

  const handlePreviousFrame = useCallback(() => {
    handleSeek(currentFrameIndex - 1);
  }, [currentFrameIndex, handleSeek]);

  const handleJumpToStart = useCallback(() => {
    handleSeek(0);
  }, [handleSeek]);

  const handleJumpToEnd = useCallback(() => {
    handleSeek(totalFrames - 1);
  }, [totalFrames, handleSeek]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prevIsPlaying) => {
      const shouldPlay = !prevIsPlaying;

      if (!shouldPlay) {
        stopAnimation();
        return false;
      }

      // If we are at the end, restart from beginning
      if (currentFrameIndex >= totalFrames - 1 && totalFrames > 0) {
        setCurrentFrameIndex(0);
        onFrameChange?.(0);
      }
      
      lastFrameTimeRef.current = 0;
      return true;
    });
  }, [currentFrameIndex, totalFrames, stopAnimation, onFrameChange]);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying || totalFrames === 0) {
      stopAnimation();
      return;
    }

    const frameInterval = 1000 / fps;

    const animate = (currentTime: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = currentTime;
      }

      const elapsed = currentTime - lastFrameTimeRef.current;

      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = currentTime;

        setCurrentFrameIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          
          if (nextIndex >= totalFrames) {
            // Reached end
            setIsPlaying(false);
            stopAnimation();
            const lastIndex = Math.max(0, totalFrames - 1);
            onFrameChange?.(lastIndex);
            return lastIndex;
          }

          onFrameChange?.(nextIndex);
          return nextIndex;
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => stopAnimation();
  }, [isPlaying, totalFrames, fps, stopAnimation, onFrameChange]);

  return {
    isPlaying,
    currentFrameIndex,
    togglePlayPause,
    seek: handleSeek,
    nextFrame: handleNextFrame,
    prevFrame: handlePreviousFrame,
    jumpToStart: handleJumpToStart,
    jumpToEnd: handleJumpToEnd,
  };
}
