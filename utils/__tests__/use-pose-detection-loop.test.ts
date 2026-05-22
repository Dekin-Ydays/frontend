import { vi } from 'vitest';

import { drawVideoFrame } from '../../src/hooks/use-pose-detection-loop';

type MockCanvasContext = Pick<
  CanvasRenderingContext2D,
  'drawImage' | 'restore' | 'save' | 'scale' | 'translate'
>;

function createContext(): MockCanvasContext {
  return {
    drawImage: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
  } as unknown as MockCanvasContext;
}

function callOrder(fn: unknown): number {
  return (fn as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
}

const asCanvasCtx = (mock: MockCanvasContext): CanvasRenderingContext2D =>
  mock as unknown as CanvasRenderingContext2D;

const video = {} as HTMLVideoElement;

describe('drawVideoFrame', () => {
  it('draws the camera frame without transforms by default', () => {
    const ctx = createContext();

    drawVideoFrame(asCanvasCtx(ctx), video, 640, 480);

    expect(ctx.save).not.toHaveBeenCalled();
    expect(ctx.translate).not.toHaveBeenCalled();
    expect(ctx.scale).not.toHaveBeenCalled();
    expect(ctx.drawImage).toHaveBeenCalledWith(video, 0, 0, 640, 480);
    expect(ctx.restore).not.toHaveBeenCalled();
  });

  it('mirrors the camera frame horizontally when requested', () => {
    const ctx = createContext();

    drawVideoFrame(asCanvasCtx(ctx), video, 640, 480, true);

    expect(ctx.translate).toHaveBeenCalledWith(640, 0);
    expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
    expect(ctx.drawImage).toHaveBeenCalledWith(video, 0, 0, 640, 480);
    expect(callOrder(ctx.save)).toBeLessThan(callOrder(ctx.translate));
    expect(callOrder(ctx.translate)).toBeLessThan(callOrder(ctx.scale));
    expect(callOrder(ctx.scale)).toBeLessThan(callOrder(ctx.drawImage));
    expect(callOrder(ctx.drawImage)).toBeLessThan(callOrder(ctx.restore));
  });
});
