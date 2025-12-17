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

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface DrawOptions {
  width: number;
  height: number;
  lineColor?: string;
  lineWidth?: number;
  showPoints?: boolean;
  pointRadius?: number;
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
  } = options;

  // Draw connections
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  for (const [start, end] of SKELETON_CONNECTIONS) {
    if (landmarks[start] && landmarks[end]) {
      ctx.beginPath();
      ctx.moveTo(landmarks[start].x * width, landmarks[start].y * height);
      ctx.lineTo(landmarks[end].x * width, landmarks[end].y * height);
      ctx.stroke();
    }
  }

  // Draw points
  if (showPoints) {
    for (let i = 0; i < landmarks.length; i++) {
      const landmark = landmarks[i];
      // Color coding: cyan (face 0-10), red (torso 11-22), yellow (legs 23-32)
      ctx.fillStyle = i <= 10 ? '#00FFFF' : i <= 22 ? '#FF0000' : '#FFFF00';
      ctx.beginPath();
      ctx.arc(
        landmark.x * width,
        landmark.y * height,
        pointRadius,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }
}
