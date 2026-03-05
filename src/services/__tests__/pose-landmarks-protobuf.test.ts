import { Reader } from 'protobufjs/minimal';

import { encodePoseLandmarksPacket } from '../pose-landmarks-protobuf';
import type { PoseLandmarksPayload } from '@/types/pose-landmarks';

type DecodedLandmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
  presence?: number;
};

type DecodedPacket = {
  type: string;
  timestamp: number;
  landmarks: DecodedLandmark[];
};

function decodeInt64(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber();
  }

  throw new Error('Invalid int64 value');
}

function decodeLandmark(reader: Reader, end: number): DecodedLandmark {
  const landmark: DecodedLandmark = { x: 0, y: 0, z: 0 };

  while (reader.pos < end) {
    const tag = reader.uint32();
    switch (tag >>> 3) {
      case 1:
        landmark.x = reader.float();
        break;
      case 2:
        landmark.y = reader.float();
        break;
      case 3:
        landmark.z = reader.float();
        break;
      case 4:
        landmark.visibility = reader.float();
        break;
      case 5:
        landmark.presence = reader.float();
        break;
      default:
        reader.skipType(tag & 7);
        break;
    }
  }

  return landmark;
}

function decodePacket(buffer: Uint8Array): DecodedPacket {
  const reader = Reader.create(buffer);
  const packet: DecodedPacket = {
    type: '',
    timestamp: 0,
    landmarks: [],
  };

  while (reader.pos < reader.len) {
    const tag = reader.uint32();
    switch (tag >>> 3) {
      case 1:
        packet.timestamp = decodeInt64(reader.int64());
        break;
      case 2:
        packet.type = reader.string();
        break;
      case 3: {
        const end = reader.uint32() + reader.pos;
        packet.landmarks.push(decodeLandmark(reader, end));
        break;
      }
      default:
        reader.skipType(tag & 7);
        break;
    }
  }

  return packet;
}

describe('encodePoseLandmarksPacket', () => {
  it('encodes pose landmarks payload to protobuf bytes', () => {
    const payload = {
      type: 'pose-landmarks',
      data: [
        [{ x: 0.1, y: 0.2, z: -0.3, visibility: 0.9, presence: 0.7 }],
      ],
    };

    const encoded = encodePoseLandmarksPacket(payload, 123_456);

    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(encoded).not.toBeNull();

    const decoded = decodePacket(encoded as Uint8Array);
    expect(decoded.type).toBe('pose-landmarks');
    expect(decoded.timestamp).toBe(123_456);
    expect(decoded.landmarks).toHaveLength(1);
    expect(decoded.landmarks[0].x).toBeCloseTo(0.1);
    expect(decoded.landmarks[0].y).toBeCloseTo(0.2);
    expect(decoded.landmarks[0].z).toBeCloseTo(-0.3);
    expect(decoded.landmarks[0].visibility).toBeCloseTo(0.9);
    expect(decoded.landmarks[0].presence).toBeCloseTo(0.7);
  });

  it('defaults z to 0 when it is missing', () => {
    const encoded = encodePoseLandmarksPacket(
      { landmarks: [{ x: 1, y: 2 }] },
      99,
    );

    expect(encoded).not.toBeNull();
    const decoded = decodePacket(encoded as Uint8Array);
    expect(decoded.landmarks[0].z).toBe(0);
  });

  it('returns null when no valid landmarks are present', () => {
    expect(
      encodePoseLandmarksPacket({
        landmarks: [{ foo: 'bar' }],
      } as unknown as PoseLandmarksPayload),
    ).toBeNull();
    expect(encodePoseLandmarksPacket('invalid' as unknown as PoseLandmarksPayload)).toBeNull();
  });
});
