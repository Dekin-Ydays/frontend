import { act, renderHook } from '@testing-library/react-native';

import { useVideoPlayer } from '../use-video-player';

const originalRequestAnimationFrame = global.requestAnimationFrame;
const originalCancelAnimationFrame = global.cancelAnimationFrame;

beforeEach(() => {
  jest.useFakeTimers();

  let now = 0;
  global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    return setTimeout(() => {
      now += 17;
      callback(now);
    }, 16) as unknown as number;
  }) as typeof requestAnimationFrame;

  global.cancelAnimationFrame = ((id: number) => {
    clearTimeout(id as unknown as NodeJS.Timeout);
  }) as typeof cancelAnimationFrame;
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

afterAll(() => {
  global.requestAnimationFrame = originalRequestAnimationFrame;
  global.cancelAnimationFrame = originalCancelAnimationFrame;
});

describe('useVideoPlayer', () => {
  it('starts paused at frame 0', () => {
    const { result } = renderHook(() => useVideoPlayer({ totalFrames: 5 }));

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentFrameIndex).toBe(0);
  });

  it('clamps seek to valid frame bounds', () => {
    const onFrameChange = jest.fn();
    const { result } = renderHook(() =>
      useVideoPlayer({ totalFrames: 5, onFrameChange })
    );

    act(() => result.current.seek(999));
    expect(result.current.currentFrameIndex).toBe(4);
    expect(onFrameChange).toHaveBeenCalledWith(4);

    act(() => result.current.seek(-10));
    expect(result.current.currentFrameIndex).toBe(0);
    expect(onFrameChange).toHaveBeenCalledWith(0);
  });

  it('handles next, previous and jump helpers', () => {
    const { result } = renderHook(() => useVideoPlayer({ totalFrames: 10 }));

    act(() => result.current.seek(4));
    act(() => result.current.nextFrame());
    expect(result.current.currentFrameIndex).toBe(5);

    act(() => result.current.prevFrame());
    expect(result.current.currentFrameIndex).toBe(4);

    act(() => result.current.jumpToEnd());
    expect(result.current.currentFrameIndex).toBe(9);

    act(() => result.current.jumpToStart());
    expect(result.current.currentFrameIndex).toBe(0);
  });

  it('restarts from frame 0 when playing from the end', () => {
    const onFrameChange = jest.fn();
    const { result } = renderHook(() =>
      useVideoPlayer({ totalFrames: 5, onFrameChange })
    );

    act(() => result.current.jumpToEnd());
    expect(result.current.currentFrameIndex).toBe(4);

    act(() => result.current.togglePlayPause());

    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentFrameIndex).toBe(0);
    expect(onFrameChange).toHaveBeenCalledWith(0);
  });

  it('advances frames while playing and stops at last frame', () => {
    const onFrameChange = jest.fn();
    const { result } = renderHook(() =>
      useVideoPlayer({ totalFrames: 3, fps: 30, onFrameChange })
    );

    act(() => result.current.togglePlayPause());
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.currentFrameIndex).toBe(2);
    expect(result.current.isPlaying).toBe(false);
    expect(onFrameChange).toHaveBeenCalledWith(1);
    expect(onFrameChange).toHaveBeenCalledWith(2);
  });
});
