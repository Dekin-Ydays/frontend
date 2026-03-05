import { Writer } from 'protobufjs/minimal';
import type {
  PoseLandmark,
  PoseLandmarkCollection,
  PoseLandmarkList,
  PoseLandmarksEnvelope,
  PoseLandmarksPayload,
} from '@/types/pose-landmarks';

type LandmarkRecord = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
  presence?: number;
};

function isNonNullObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function mapLandmark(landmark: PoseLandmark): LandmarkRecord | null {
  const x = landmark.x;
  const y = landmark.y;
  const z = landmark.z;
  if (!isFiniteNumber(x) || !isFiniteNumber(y)) {
    return null;
  }

  const mapped: LandmarkRecord = {
    x,
    y,
    z: isFiniteNumber(z) ? z : 0,
  };

  const visibility = landmark.visibility;
  if (isFiniteNumber(visibility)) {
    mapped.visibility = visibility;
  }

  const presence = landmark.presence;
  if (isFiniteNumber(presence)) {
    mapped.presence = presence;
  }

  return mapped;
}

function pickLandmarkList(value: PoseLandmarkCollection | undefined): PoseLandmarkList | null {
  if (!value || value.length === 0) {
    return null;
  }

  const firstEntry = value[0];
  if (Array.isArray(firstEntry)) {
    for (let i = value.length - 1; i >= 0; i -= 1) {
      const candidate = value[i];
      if (!Array.isArray(candidate)) {
        continue;
      }

      if (candidate.some((entry) => mapLandmark(entry) !== null)) {
        return candidate;
      }
    }
    return null;
  }

  return value as PoseLandmarkList;
}

function extractLandmarkCandidate(payload: PoseLandmarksPayload): PoseLandmarkCollection | undefined {
  if (Array.isArray(payload)) {
    return payload as PoseLandmarkCollection;
  }

  if (!isNonNullObject(payload)) {
    return undefined;
  }

  const envelope = payload as PoseLandmarksEnvelope;
  return envelope.landmarks ?? envelope.poseLandmarks ?? envelope.points ?? envelope.data;
}

function normalizeLandmarks(payload: PoseLandmarksPayload): LandmarkRecord[] {
  const candidate = extractLandmarkCandidate(payload);
  const picked = pickLandmarkList(candidate);
  if (!picked) {
    return [];
  }

  const landmarks: LandmarkRecord[] = [];
  for (const entry of picked) {
    const mapped = mapLandmark(entry);
    if (mapped) {
      landmarks.push(mapped);
    }
  }

  return landmarks;
}

function encodeLandmark(landmark: LandmarkRecord, writer: Writer): Writer {
  writer.uint32(13).float(landmark.x);
  writer.uint32(21).float(landmark.y);
  writer.uint32(29).float(landmark.z);

  if (isFiniteNumber(landmark.visibility)) {
    writer.uint32(37).float(landmark.visibility);
  }

  if (isFiniteNumber(landmark.presence)) {
    writer.uint32(45).float(landmark.presence);
  }

  return writer;
}

export function encodePoseLandmarksPacket(
  payload: PoseLandmarksPayload,
  timestamp: number = Date.now(),
): Uint8Array | null {
  const landmarks = normalizeLandmarks(payload);
  if (landmarks.length === 0) {
    return null;
  }

  const writer = Writer.create();
  writer.uint32(10).string('pose-landmarks');
  writer.uint32(16).int64(Math.trunc(timestamp));

  for (const landmark of landmarks) {
    encodeLandmark(landmark, writer.uint32(26).fork()).ldelim();
  }

  return writer.finish();
}
