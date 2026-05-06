import { useCallback, useEffect, useState } from "react";

import { getCachedVideoList } from "@/services/video-list-cache";
import type { VideoMetadata } from "@/services/video-parser-api";

export function useVideoList() {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      setVideos(await getCachedVideoList({ forceRefresh }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVideos();
  }, [loadVideos]);

  const refresh = useCallback(() => {
    void loadVideos(true);
  }, [loadVideos]);

  return {
    videos,
    loading,
    error,
    refresh,
  };
}
