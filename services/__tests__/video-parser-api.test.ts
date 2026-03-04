import {
  getScoreColor,
  getScoreLabel,
  COMPARISON_PRESETS,
  listClients,
  listVideos,
  getLatestPose,
  getVideo,
  compareVideos,
} from '../video-parser-api';

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: { select: (opts: Record<string, string>) => opts.default },
}));

// ---- Pure function tests ----

describe('getScoreColor', () => {
  it('returns green for scores >= 90', () => {
    expect(getScoreColor(90)).toBe('#22c55e');
    expect(getScoreColor(100)).toBe('#22c55e');
    expect(getScoreColor(95)).toBe('#22c55e');
  });

  it('returns yellow for scores >= 70 and < 90', () => {
    expect(getScoreColor(70)).toBe('#eab308');
    expect(getScoreColor(89)).toBe('#eab308');
  });

  it('returns orange for scores >= 50 and < 70', () => {
    expect(getScoreColor(50)).toBe('#f97316');
    expect(getScoreColor(69)).toBe('#f97316');
  });

  it('returns red for scores < 50', () => {
    expect(getScoreColor(49)).toBe('#ef4444');
    expect(getScoreColor(0)).toBe('#ef4444');
    expect(getScoreColor(-1)).toBe('#ef4444');
  });
});

describe('getScoreLabel', () => {
  it('returns Excellent for scores >= 90', () => {
    expect(getScoreLabel(90)).toBe('Excellent');
    expect(getScoreLabel(100)).toBe('Excellent');
  });

  it('returns Good for scores >= 70 and < 90', () => {
    expect(getScoreLabel(70)).toBe('Good');
    expect(getScoreLabel(89)).toBe('Good');
  });

  it('returns Fair for scores >= 50 and < 70', () => {
    expect(getScoreLabel(50)).toBe('Fair');
    expect(getScoreLabel(69)).toBe('Fair');
  });

  it('returns Needs Improvement for scores < 50', () => {
    expect(getScoreLabel(49)).toBe('Needs Improvement');
    expect(getScoreLabel(0)).toBe('Needs Improvement');
  });
});

describe('COMPARISON_PRESETS', () => {
  it('has dance preset with expected config', () => {
    const { dance } = COMPARISON_PRESETS;
    expect(dance.normalization.center).toBe(true);
    expect(dance.normalization.scale).toBe(true);
    expect(dance.normalization.rotation).toBe(false);
    expect(dance.positionWeight).toBe(0.5);
    expect(dance.angularWeight).toBe(0.5);
  });

  it('has yoga preset with rotation enabled', () => {
    const { yoga } = COMPARISON_PRESETS;
    expect(yoga.normalization.center).toBe(true);
    expect(yoga.normalization.scale).toBe(true);
    expect(yoga.normalization.rotation).toBe(true);
    expect(yoga.positionWeight).toBe(0.4);
    expect(yoga.angularWeight).toBe(0.6);
  });

  it('has sports preset with visibility threshold', () => {
    const { sports } = COMPARISON_PRESETS;
    expect(sports.normalization.center).toBe(true);
    expect(sports.normalization.scale).toBe(true);
    expect(sports.normalization.rotation).toBe(false);
    expect(sports.positionWeight).toBe(0.7);
    expect(sports.angularWeight).toBe(0.3);
    expect(sports.visibilityThreshold).toBe(0.7);
  });
});

// ---- API function tests (mock fetch) ----

const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

afterEach(() => {
  mockFetch.mockReset();
});

describe('listClients', () => {
  it('returns clients on success', async () => {
    const data = [{ clientId: 'abc', lastSeenAt: 123 }];
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });

    const result = await listClients();
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/pose/clients');
  });

  it('throws on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(listClients()).rejects.toThrow('Failed to fetch clients');
  });
});

describe('listVideos', () => {
  it('returns videos on success', async () => {
    const data = [{ id: '1', startTime: '2026-01-01', endTime: null, frameCount: 10, duration: null }];
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });

    const result = await listVideos();
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/pose/videos');
  });

  it('throws on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(listVideos()).rejects.toThrow('Failed to fetch videos');
  });
});

describe('getLatestPose', () => {
  it('returns pose data on success', async () => {
    const data = { timestamp: 123, landmarks: [] };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });

    const result = await getLatestPose('client1');
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/pose/latest/client1');
  });

  it('throws specific message on 404', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(getLatestPose('missing')).rejects.toThrow('No pose data available for this client');
  });

  it('throws generic message on other errors', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(getLatestPose('client1')).rejects.toThrow('Failed to fetch latest pose');
  });
});

describe('getVideo', () => {
  it('returns video on success', async () => {
    const data = { frames: [] };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });

    const result = await getVideo('vid1');
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/pose/video/vid1');
  });

  it('throws specific message on 404', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(getVideo('missing')).rejects.toThrow('Video not found');
  });

  it('throws generic message on other errors', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(getVideo('vid1')).rejects.toThrow('Failed to fetch video');
  });
});

describe('compareVideos', () => {
  it('returns scoring result on success', async () => {
    const data = {
      overallScore: 85,
      frameScores: [80, 90],
      breakdown: {
        positionScore: 82,
        angularScore: 88,
        timingScore: 85,
        statistics: { mean: 85, min: 80, max: 90, variance: 25 },
      },
    };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });

    const result = await compareVideos({
      referenceVideoId: 'ref1',
      comparisonVideoId: 'comp1',
    });
    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/pose/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referenceVideoId: 'ref1', comparisonVideoId: 'comp1' }),
    });
  });

  it('throws specific message on 404', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(
      compareVideos({ referenceVideoId: 'a', comparisonVideoId: 'b' })
    ).rejects.toThrow('One or both videos not found');
  });

  it('throws generic message on other errors', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(
      compareVideos({ referenceVideoId: 'a', comparisonVideoId: 'b' })
    ).rejects.toThrow('Failed to compare videos');
  });
});
