import { vi } from 'vitest';

import {
  SKELETON_CONNECTIONS,
  drawSkeleton,
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

describe('drawSkeleton', () => {
  let ctx: any;

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
    drawSkeleton(ctx, landmarks, options);

    // Should draw all connections
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();

    // Should draw points (showPoints defaults to true)
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();

    // Default line color
    expect(ctx.strokeStyle).toBe('#00FF00');
    expect(ctx.lineWidth).toBe(3);
  });

  it('scales landmark positions by width and height', () => {
    const simpleLandmarks: Landmark[] = Array.from({ length: 33 }, () => ({
      x: 0.5,
      y: 0.25,
    }));
    const options: DrawOptions = { width: 200, height: 400 };
    drawSkeleton(ctx, simpleLandmarks, options);

    // Check that moveTo/lineTo are called with scaled values
    expect(ctx.moveTo).toHaveBeenCalledWith(100, 100); // 0.5 * 200, 0.25 * 400
  });

  it('does not draw points when showPoints is false', () => {
    const options: DrawOptions = { width: 100, height: 100, showPoints: false };
    drawSkeleton(ctx, landmarks, options);

    // arc should not be called since we're skipping points
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it('uses custom pointColor when provided', () => {
    const options: DrawOptions = {
      width: 100,
      height: 100,
      pointColor: '#FF00FF',
    };
    drawSkeleton(ctx, landmarks, options);

    expect(ctx.fillStyle).toBe('#FF00FF');
  });

  it('uses color coding when no pointColor is given', () => {
    // Draw with a small set to check color coding logic
    const options: DrawOptions = { width: 100, height: 100 };
    drawSkeleton(ctx, landmarks, options);

    // The last landmark drawn is index 32 (leg range), so fillStyle should be yellow
    expect(ctx.fillStyle).toBe('#FFFF00');
  });

  it('applies custom lineColor and lineWidth', () => {
    const options: DrawOptions = {
      width: 100,
      height: 100,
      lineColor: '#0000FF',
      lineWidth: 5,
    };
    drawSkeleton(ctx, landmarks, options);

    expect(ctx.strokeStyle).toBe('#0000FF');
    expect(ctx.lineWidth).toBe(5);
  });

  it('handles empty landmarks without errors', () => {
    const options: DrawOptions = { width: 100, height: 100 };
    expect(() => drawSkeleton(ctx, [], options)).not.toThrow();
  });
});
