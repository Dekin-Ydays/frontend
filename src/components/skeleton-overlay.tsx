import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Line, Circle, vec } from '@shopify/react-native-skia';
import { SKELETON_CONNECTIONS, Landmark } from '@/utils/skeleton-renderer';

const VISIBILITY_THRESHOLD = 0.5;

interface SkeletonOverlayProps {
  landmarks: Landmark[];
  width: number;
  height: number;
  mirrored?: boolean;
}

function getJointColor(index: number): string {
  if (index <= 10) return '#00FFFF'; // face - cyan
  if (index <= 22) return '#FF0000'; // torso - red
  return '#FFFF00';                  // legs - yellow
}

export default function SkeletonOverlay({ landmarks, width, height, mirrored = false }: SkeletonOverlayProps) {
  const { lines, joints } = useMemo(() => {
    const ls: { p1: { x: number; y: number }; p2: { x: number; y: number }; key: string }[] = [];
    const js: { cx: number; cy: number; color: string; key: string }[] = [];

    if (!landmarks || landmarks.length < 33 || width === 0) return { lines: ls, joints: js };

    const tx = (x: number) => (mirrored ? (1 - x) * width : x * width);
    const ty = (y: number) => y * height;

    for (let ci = 0; ci < SKELETON_CONNECTIONS.length; ci++) {
      const [si, ei] = SKELETON_CONNECTIONS[ci];
      const a = landmarks[si];
      const b = landmarks[ei];
      if (!a || !b) continue;
      if ((a.visibility ?? 0) < VISIBILITY_THRESHOLD || (b.visibility ?? 0) < VISIBILITY_THRESHOLD) continue;
      ls.push({
        p1: { x: tx(a.x), y: ty(a.y) },
        p2: { x: tx(b.x), y: ty(b.y) },
        key: `l${ci}`,
      });
    }

    for (let i = 0; i < landmarks.length; i++) {
      const l = landmarks[i];
      if ((l.visibility ?? 0) < VISIBILITY_THRESHOLD) continue;
      js.push({
        cx: tx(l.x),
        cy: ty(l.y),
        color: getJointColor(i),
        key: `j${i}`,
      });
    }

    return { lines: ls, joints: js };
  }, [landmarks, width, height, mirrored]);

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {lines.map((l) => (
        <Line key={l.key} p1={vec(l.p1.x, l.p1.y)} p2={vec(l.p2.x, l.p2.y)} strokeWidth={3} color="#00FF00" />
      ))}
      {joints.map((j) => (
        <Circle key={j.key} cx={j.cx} cy={j.cy} r={5} color={j.color} />
      ))}
    </Canvas>
  );
}
