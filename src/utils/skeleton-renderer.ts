import type { Landmark } from "@/types/pose-landmarks";

export type { Landmark };

export const SKELETON_CONNECTIONS = [
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
] as const;

export interface ProjectedSkeleton {
  lines: {
    p1: { x: number; y: number };
    p2: { x: number; y: number };
    key: string;
  }[];
  joints: { cx: number; cy: number; key: string; index: number }[];
}

export interface ProjectOptions {
  visibilityThreshold?: number;
}

/**
 * Pure projection from normalized landmark coordinates (0..1) to pixel-space
 * lines + joints. Drops connections/joints whose visibility is below the
 * threshold. No dependencies on canvas/Skia — safe to use everywhere.
 */
export function projectSkeleton(
  landmarks: Landmark[] | undefined,
  width: number,
  height: number,
  options: ProjectOptions = {},
): ProjectedSkeleton {
  const { visibilityThreshold = 0.5 } = options;
  const out: ProjectedSkeleton = { lines: [], joints: [] };
  if (!landmarks || landmarks.length === 0) return out;
  if (width <= 0 || height <= 0) return out;

  for (let ci = 0; ci < SKELETON_CONNECTIONS.length; ci++) {
    const [si, ei] = SKELETON_CONNECTIONS[ci];
    const a = landmarks[si];
    const b = landmarks[ei];
    if (!a || !b) continue;
    if (
      (a.visibility ?? 1) < visibilityThreshold ||
      (b.visibility ?? 1) < visibilityThreshold
    ) {
      continue;
    }
    out.lines.push({
      p1: { x: a.x * width, y: a.y * height },
      p2: { x: b.x * width, y: b.y * height },
      key: `l${ci}`,
    });
  }

  for (let i = 0; i < landmarks.length; i++) {
    const l = landmarks[i];
    if ((l.visibility ?? 1) < visibilityThreshold) continue;
    out.joints.push({
      cx: l.x * width,
      cy: l.y * height,
      key: `j${i}`,
      index: i,
    });
  }

  return out;
}

export interface DrawOptions {
  width: number;
  height: number;
  lineColor?: string;
  lineWidth?: number;
  showPoints?: boolean;
  pointRadius?: number;
  pointColor?: string;
  /**
   * Visibility floor for joints and connections. Defaults to 0 so
   * `drawSkeleton` keeps its historical "draw everything if a landmark
   * exists" semantics. Pass 0.5 to match `projectSkeleton`'s default.
   */
  visibilityThreshold?: number;
}

function defaultJointColor(index: number): string {
  // cyan for face (0-10), red for torso (11-22), yellow for legs (23-32)
  return index <= 10 ? '#00FFFF' : index <= 22 ? '#FF0000' : '#FFFF00';
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  options: DrawOptions
): void {
  const {
    width,
    height,
    lineColor = '#00FF00',
    lineWidth = 3,
    showPoints = true,
    pointRadius = 6,
    pointColor,
    visibilityThreshold = 0,
  } = options;

  const projected = projectSkeleton(landmarks, width, height, {
    visibilityThreshold,
  });

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  for (const line of projected.lines) {
    ctx.beginPath();
    ctx.moveTo(line.p1.x, line.p1.y);
    ctx.lineTo(line.p2.x, line.p2.y);
    ctx.stroke();
  }

  if (showPoints) {
    for (const joint of projected.joints) {
      ctx.fillStyle = pointColor ?? defaultJointColor(joint.index);
      ctx.beginPath();
      ctx.arc(joint.cx, joint.cy, pointRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}
