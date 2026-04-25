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
  newJobId,
  processVideo,
  subscribeExtractionProgress,
  uploadVideoFile,
  type ExtractionProgressEvent,
  type ProcessVideoProgress,
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

  it('uploads a source video file with multipart form data', async () => {
    const response = {
      id: 'video-file-1',
      objectKey: 'uploads/video-file-1/demo.mp4',
      fileName: 'demo.mp4',
      mimeType: 'video/mp4',
      size: 5,
      uploadedAt: '2026-03-25T10:00:00.000Z',
    };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => response });

    const file = new File([new Uint8Array([1, 2, 3, 4, 5])], 'demo.mp4', {
      type: 'video/mp4',
    });

    await expect(uploadVideoFile(file)).resolves.toEqual(response);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://api.test/pose/video',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );

    const uploadRequest = mockFetch.mock.calls[0]?.[1] as {
      body: FormData;
    };
    expect(uploadRequest.body.get('file')).toBe(file);
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

  it('throws when source video upload fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const file = new File([new Uint8Array([1])], 'broken.mp4', {
      type: 'video/mp4',
    });

    await expect(uploadVideoFile(file)).rejects.toThrow(
      'Failed to upload video file',
    );
  });
});

describe('subscribeExtractionProgress', () => {
  type Listener = (event: { data: string }) => void;

  class FakeEventSource {
    static instances: FakeEventSource[] = [];
    listeners = new Map<string, Set<Listener>>();
    closed = false;
    constructor(public url: string) {
      FakeEventSource.instances.push(this);
    }
    addEventListener(name: string, fn: Listener) {
      const set = this.listeners.get(name) ?? new Set();
      set.add(fn);
      this.listeners.set(name, set);
    }
    removeEventListener(name: string, fn: Listener) {
      this.listeners.get(name)?.delete(fn);
    }
    close() {
      this.closed = true;
    }
    emit(name: string, data: unknown) {
      const payload = { data: JSON.stringify(data) };
      this.listeners.get(name)?.forEach((fn) => fn(payload));
    }
  }

  let originalEventSource: unknown;

  beforeEach(() => {
    originalEventSource = (globalThis as { EventSource?: unknown }).EventSource;
    (globalThis as { EventSource: unknown }).EventSource = FakeEventSource;
    FakeEventSource.instances = [];
  });

  afterEach(() => {
    (globalThis as { EventSource: unknown }).EventSource = originalEventSource;
  });

  it('forwards every event when no jobId is provided', () => {
    const events: ExtractionProgressEvent[] = [];
    const unsubscribe = subscribeExtractionProgress((evt) => events.push(evt));
    const source = FakeEventSource.instances[0]!;
    source.emit('extraction-progress', {
      jobId: 'a',
      phase: 'started',
      at: 1,
    });
    source.emit('extraction-progress', {
      jobId: 'b',
      phase: 'frames',
      framesProcessed: 10,
      at: 2,
    });
    expect(events.map((e) => e.jobId)).toEqual(['a', 'b']);
    unsubscribe();
    expect(source.closed).toBe(true);
  });

  it('drops events that do not match the requested jobId', () => {
    const events: ExtractionProgressEvent[] = [];
    subscribeExtractionProgress((evt) => events.push(evt), 'mine');
    const source = FakeEventSource.instances[0]!;
    source.emit('extraction-progress', {
      jobId: 'someone-else',
      phase: 'started',
      at: 1,
    });
    source.emit('extraction-progress', {
      jobId: 'mine',
      phase: 'frames',
      framesProcessed: 5,
      at: 2,
    });
    expect(events).toEqual([
      { jobId: 'mine', phase: 'frames', framesProcessed: 5, at: 2 },
    ]);
  });

  it('returns a no-op unsubscribe when EventSource is unavailable', () => {
    (globalThis as { EventSource?: unknown }).EventSource = undefined;
    const unsubscribe = subscribeExtractionProgress(() => {});
    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe()).not.toThrow();
  });
});

describe('processVideo', () => {
  type Handler = ((event?: unknown) => void) | null;

  class FakeXHR {
    static instances: FakeXHR[] = [];
    method = '';
    url = '';
    body: unknown = null;
    status = 0;
    responseText = '';
    onload: Handler = null;
    onerror: Handler = null;
    ontimeout: Handler = null;
    upload: { onprogress: Handler; onload: Handler } = {
      onprogress: null,
      onload: null,
    };
    constructor() {
      FakeXHR.instances.push(this);
    }
    open(method: string, url: string) {
      this.method = method;
      this.url = url;
    }
    send(body: unknown) {
      this.body = body;
    }
  }

  let originalXHR: unknown;

  beforeEach(() => {
    originalXHR = (globalThis as { XMLHttpRequest?: unknown }).XMLHttpRequest;
    (globalThis as { XMLHttpRequest: unknown }).XMLHttpRequest = FakeXHR;
    FakeXHR.instances = [];
  });

  afterEach(() => {
    (globalThis as { XMLHttpRequest: unknown }).XMLHttpRequest = originalXHR;
  });

  function makeFile(): File {
    return new File([new Uint8Array([1, 2, 3])], 'clip.mp4', {
      type: 'video/mp4',
    });
  }

  it('appends the jobId as a query string when provided', () => {
    void processVideo(makeFile(), undefined, 'abc-123');
    const xhr = FakeXHR.instances[0]!;
    expect(xhr.method).toBe('POST');
    expect(xhr.url).toBe(
      'http://api.test/pose/video/process?jobId=abc-123',
    );
    expect(xhr.body).toBeInstanceOf(FormData);
  });

  it('omits the query string when no jobId is given', () => {
    void processVideo(makeFile());
    expect(FakeXHR.instances[0]!.url).toBe(
      'http://api.test/pose/video/process',
    );
  });

  it('emits uploading progress, then processing once the upload completes, and resolves with the parsed result', async () => {
    const events: ProcessVideoProgress[] = [];
    const result = { videoId: 'v1', frameCount: 12, fps: 30, width: 640, height: 480, sourceVideo: {} };
    const promise = processVideo(makeFile(), (e) => events.push(e));
    const xhr = FakeXHR.instances[0]!;

    // Two upload-progress events, then upload complete, then HTTP response.
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 100 });
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 100, total: 100 });
    xhr.upload.onload?.();
    xhr.status = 200;
    xhr.responseText = JSON.stringify(result);
    xhr.onload?.();

    await expect(promise).resolves.toEqual(result);
    expect(events.map((e) => e.phase)).toEqual([
      'uploading',
      'uploading',
      'processing',
    ]);
    const first = events[0] as Extract<
      ProcessVideoProgress,
      { phase: 'uploading' }
    >;
    expect(first.ratio).toBe(0.5);
    expect(first.loaded).toBe(50);
    expect(first.total).toBe(100);
  });

  it('rejects with a descriptive error on a non-2xx response', async () => {
    const promise = processVideo(makeFile());
    const xhr = FakeXHR.instances[0]!;
    xhr.status = 500;
    xhr.responseText = 'boom';
    xhr.onload?.();
    await expect(promise).rejects.toThrow(/Failed to process video: 500.*boom/);
  });

  it('rejects on network errors', async () => {
    const promise = processVideo(makeFile());
    FakeXHR.instances[0]!.onerror?.();
    await expect(promise).rejects.toThrow(/Network error/);
  });
});

describe('newJobId', () => {
  it('produces unique RFC4122-shaped strings', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) ids.add(newJobId());
    expect(ids.size).toBe(50);
    for (const id of ids) {
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    }
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
