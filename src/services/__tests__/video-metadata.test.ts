import {
  formatVideoDuration,
  formatVideoTimestamp,
  isUsableReferenceVideo,
} from '../video-metadata';
import type { VideoMetadata } from '../video-parser-api';

describe('video metadata', () => {
  it('formats durations and supports caller-specific null fallback text', () => {
    expect(formatVideoDuration(65_000)).toBe('1:05');
    expect(formatVideoDuration(0)).toBe('0:00');
    expect(formatVideoDuration(null)).toBe('In progress');
    expect(formatVideoDuration(null, '0:00')).toBe('0:00');
  });

  it('formats timestamps with local date and time', () => {
    const timestamp = '2026-05-22T10:30:00.000Z';

    expect(formatVideoTimestamp(timestamp)).toBe(
      `${new Date(timestamp).toLocaleDateString()} ${new Date(timestamp).toLocaleTimeString()}`,
    );
  });

  it('identifies videos that can be used as guided references', () => {
    const base: VideoMetadata = {
      id: 'video-1',
      startTime: '2026-05-22T10:30:00.000Z',
      endTime: '2026-05-22T10:31:00.000Z',
      frameCount: 120,
      duration: 60_000,
    };

    expect(isUsableReferenceVideo(base)).toBe(true);
    expect(isUsableReferenceVideo({ ...base, endTime: null })).toBe(false);
    expect(isUsableReferenceVideo({ ...base, frameCount: 0 })).toBe(false);
    expect(isUsableReferenceVideo({ ...base, duration: null })).toBe(false);
  });
});
