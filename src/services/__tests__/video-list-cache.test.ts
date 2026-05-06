import { vi } from "vitest";

import {
  clearVideoListCache,
  getCachedVideoList,
} from "../video-list-cache";

const mocks = vi.hoisted(() => ({
  listVideos: vi.fn(),
}));

vi.mock("../video-parser-api", () => ({
  listVideos: mocks.listVideos,
}));

describe("video-list-cache", () => {
  beforeEach(() => {
    clearVideoListCache();
    mocks.listVideos.mockReset();
  });

  it("shares an in-flight video list request", async () => {
    const videos = [
      { id: "v1", startTime: "2026-05-06", endTime: null, frameCount: 1, duration: null },
    ];
    mocks.listVideos.mockResolvedValue(videos);

    const [first, second] = await Promise.all([
      getCachedVideoList(),
      getCachedVideoList(),
    ]);

    expect(first).toBe(videos);
    expect(second).toBe(videos);
    expect(mocks.listVideos).toHaveBeenCalledTimes(1);
  });

  it("returns cached videos until a forced refresh is requested", async () => {
    const first = [
      { id: "v1", startTime: "2026-05-06", endTime: null, frameCount: 1, duration: null },
    ];
    const second = [
      { id: "v2", startTime: "2026-05-07", endTime: null, frameCount: 2, duration: null },
    ];
    mocks.listVideos.mockResolvedValueOnce(first).mockResolvedValueOnce(second);

    await expect(getCachedVideoList()).resolves.toBe(first);
    await expect(getCachedVideoList()).resolves.toBe(first);
    await expect(getCachedVideoList({ forceRefresh: true })).resolves.toBe(
      second,
    );

    expect(mocks.listVideos).toHaveBeenCalledTimes(2);
  });
});
