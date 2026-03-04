import { vi } from 'vitest';

import {
  COMPARISON_PRESETS,
  compareVideos,
  getLatestPose,
  getScoreColor,
  getScoreLabel,
  getVideo,
  listClients,
  listVideos,
} from '../video-parser-api';

vi.mock('@/services/video-parser-endpoints', () => ({
  getVideoParserHttpBaseUrl: () => 'http://api.test',
}));

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

afterEach(() => {
  mockFetch.mockReset();
});

describe('video-parser-api', () => {
  it('lists clients', async () => {
    const data = [{ clientId: 'client-1', lastSeenAt: 1700000000 }];
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });

    await expect(listClients()).resolves.toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith('http://api.test/pose/clients');
  });

  it('throws when listing videos fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(listVideos()).rejects.toThrow('Failed to fetch videos');
  });

  it('returns a specific error for missing latest pose', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(getLatestPose('missing')).rejects.toThrow(
      'No pose data available for this client'
    );
  });

  it('returns a specific error for missing video', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(getVideo('missing')).rejects.toThrow('Video not found');
  });

  it('sends compare request with JSON payload', async () => {
    const payload = {
      referenceVideoId: 'ref-1',
      comparisonVideoId: 'cmp-1',
      config: COMPARISON_PRESETS.sports,
    };
    const response = {
      overallScore: 88,
      frameScores: [88],
      breakdown: {
        positionScore: 90,
        angularScore: 86,
        timingScore: 88,
        statistics: { mean: 88, min: 88, max: 88, variance: 0 },
      },
    };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => response });

    await expect(compareVideos(payload)).resolves.toEqual(response);
    expect(mockFetch).toHaveBeenCalledWith('http://api.test/pose/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  });
});

describe('score helpers', () => {
  it('maps score ranges to expected color', () => {
    expect(getScoreColor(95)).toBe('#22c55e');
    expect(getScoreColor(70)).toBe('#eab308');
    expect(getScoreColor(50)).toBe('#f97316');
    expect(getScoreColor(49)).toBe('#ef4444');
  });

  it('maps score ranges to expected labels', () => {
    expect(getScoreLabel(95)).toBe('Excellent');
    expect(getScoreLabel(70)).toBe('Good');
    expect(getScoreLabel(50)).toBe('Fair');
    expect(getScoreLabel(49)).toBe('Needs Improvement');
  });
});
