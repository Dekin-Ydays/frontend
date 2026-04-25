import { vi } from 'vitest';

import {
  SKELETON_CONNECTIONS,
  drawSkeleton,
  projectSkeleton,
  Landmark,
  DrawOptions,
} from '../../src/utils/skeleton-renderer';

describe('SKELETON_CONNECTIONS', () => {
  it('is a non-empty array of pairs', () => {
    expect(SKELETON_CONNECTIONS.length).toBeGreaterThan(0);
    for (const conn of SKELETON_CONNECTIONS) {
      expect(conn).toHaveLength(2);
      expect(typeof conn[0]).toBe('number');
      expect(typeof conn[1]).toBe('number');
    }
  });

  it('contains expected face connections', () => {
    expect(SKELETON_CONNECTIONS).toContainEqual([0, 1]);
    expect(SKELETON_CONNECTIONS).toContainEqual([9, 10]);
  });

  it('contains expected torso connections', () => {
    expect(SKELETON_CONNECTIONS).toContainEqual([11, 12]);
    expect(SKELETON_CONNECTIONS).toContainEqual([11, 23]);
    expect(SKELETON_CONNECTIONS).toContainEqual([12, 24]);
  });

  it('contains expected leg connections', () => {
    expect(SKELETON_CONNECTIONS).toContainEqual([23, 25]);
    expect(SKELETON_CONNECTIONS).toContainEqual([24, 26]);
  });
});

type MockCanvasContext = {
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  strokeStyle: string;
  lineWidth: number;
  fillStyle: string;
};

const asCanvasCtx = (mock: MockCanvasContext): CanvasRenderingContext2D =>
  mock as unknown as CanvasRenderingContext2D;

describe('drawSkeleton', () => {
  let ctx: MockCanvasContext;

  beforeEach(() => {
    ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      strokeStyle: '',
      lineWidth: 0,
      fillStyle: '',
    };
  });

  const landmarks: Landmark[] = Array.from({ length: 33 }, (_, i) => ({
    x: i / 33,
    y: i / 33,
  }));

  it('draws connections and points with default options', () => {
    const options: DrawOptions = { width: 100, height: 100 };
    drawSkeleton(asCanvasCtx(ctx), landmarks, options);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();

    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();

    expect(ctx.strokeStyle).toBe('#00FF00');
    expect(ctx.lineWidth).toBe(3);
  });

  it('scales landmark positions by width and height', () => {
    const simpleLandmarks: Landmark[] = Array.from({ length: 33 }, () => ({
      x: 0.5,
      y: 0.25,
    }));
    const options: DrawOptions = { width: 200, height: 400 };
    drawSkeleton(asCanvasCtx(ctx), simpleLandmarks, options);

    expect(ctx.moveTo).toHaveBeenCalledWith(100, 100);
  });

  it('does not draw points when showPoints is false', () => {
    const options: DrawOptions = { width: 100, height: 100, showPoints: false };
    drawSkeleton(asCanvasCtx(ctx), landmarks, options);

    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it('uses custom pointColor when provided', () => {
    const options: DrawOptions = {
      width: 100,
      height: 100,
      pointColor: '#FF00FF',
    };
    drawSkeleton(asCanvasCtx(ctx), landmarks, options);

    expect(ctx.fillStyle).toBe('#FF00FF');
  });

  it('uses color coding when no pointColor is given', () => {
    const options: DrawOptions = { width: 100, height: 100 };
    drawSkeleton(asCanvasCtx(ctx), landmarks, options);

    // Last drawn landmark is index 32 (legs range → yellow).
    expect(ctx.fillStyle).toBe('#FFFF00');
  });

  it('applies custom lineColor and lineWidth', () => {
    const options: DrawOptions = {
      width: 100,
      height: 100,
      lineColor: '#0000FF',
      lineWidth: 5,
    };
    drawSkeleton(asCanvasCtx(ctx), landmarks, options);

    expect(ctx.strokeStyle).toBe('#0000FF');
    expect(ctx.lineWidth).toBe(5);
  });

  it('handles empty landmarks without errors', () => {
    const options: DrawOptions = { width: 100, height: 100 };
    expect(() => drawSkeleton(asCanvasCtx(ctx), [], options)).not.toThrow();
  });

  it('emits exactly one moveTo/lineTo per projected line and one arc per projected joint', () => {
    const partial = Array.from({ length: 33 }, (_, i) => ({
      x: i / 33,
      y: i / 33,
      visibility: i === 5 ? 0.1 : 1,
    }));
    const options: DrawOptions = {
      width: 100,
      height: 100,
      visibilityThreshold: 0.5,
    };

    const projected = projectSkeleton(partial, 100, 100, {
      visibilityThreshold: 0.5,
    });
    drawSkeleton(asCanvasCtx(ctx), partial, options);

    expect(ctx.moveTo).toHaveBeenCalledTimes(projected.lines.length);
    expect(ctx.lineTo).toHaveBeenCalledTimes(projected.lines.length);
    expect(ctx.arc).toHaveBeenCalledTimes(projected.joints.length);
  });
});

describe('projectSkeleton', () => {
  function fullBody(visibility = 1): Landmark[] {
    const arr: Landmark[] = [];
    for (let i = 0; i < 33; i++) {
      arr.push({ x: 0.25, y: 0.5, z: 0, visibility });
    }
    return arr;
  }

  it('returns empty result for missing or zero-sized inputs', () => {
    expect(projectSkeleton(undefined, 100, 100)).toEqual({
      lines: [],
      joints: [],
    });
    expect(projectSkeleton([], 100, 100)).toEqual({ lines: [], joints: [] });
    expect(projectSkeleton(fullBody(), 0, 100)).toEqual({
      lines: [],
      joints: [],
    });
    expect(projectSkeleton(fullBody(), 100, 0)).toEqual({
      lines: [],
      joints: [],
    });
  });

  it('multiplies normalized coords by the canvas size', () => {
    const projected = projectSkeleton(fullBody(), 200, 100);
    expect(projected.joints[0]).toMatchObject({ cx: 50, cy: 50, index: 0 });
    expect(projected.joints).toHaveLength(33);
    expect(projected.lines.length).toBe(SKELETON_CONNECTIONS.length);
    expect(projected.lines[0]).toMatchObject({
      p1: { x: 50, y: 50 },
      p2: { x: 50, y: 50 },
    });
  });

  it('drops joints whose visibility falls below the threshold', () => {
    const visible = fullBody(1);
    visible[0] = { ...visible[0], visibility: 0.1 };
    const projected = projectSkeleton(visible, 100, 100, {
      visibilityThreshold: 0.5,
    });
    expect(projected.joints.find((j) => j.index === 0)).toBeUndefined();
  });

  it('drops connections whose endpoint visibility is below threshold', () => {
    const partial = fullBody(1);
    partial[0] = { ...partial[0], visibility: 0.1 };
    const projected = projectSkeleton(partial, 100, 100);
    // SKELETON_CONNECTIONS[0] is [0, 1] — must be dropped because of joint 0
    expect(projected.lines.find((l) => l.key === 'l0')).toBeUndefined();
  });

  it('treats undefined visibility as fully visible', () => {
    const noVis: Landmark[] = Array.from({ length: 33 }, () => ({
      x: 0.5,
      y: 0.5,
    }));
    const projected = projectSkeleton(noVis, 50, 50);
    expect(projected.joints).toHaveLength(33);
    expect(projected.lines.length).toBe(SKELETON_CONNECTIONS.length);
  });
});
