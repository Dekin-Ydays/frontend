import { listVideos, type VideoMetadata } from "@/services/video-parser-api";

let cachedVideos: VideoMetadata[] | null = null;
let pendingVideos: Promise<VideoMetadata[]> | null = null;

interface GetVideoListOptions {
  forceRefresh?: boolean;
}

export function clearVideoListCache() {
  cachedVideos = null;
  pendingVideos = null;
}

export async function getCachedVideoList({
  forceRefresh = false,
}: GetVideoListOptions = {}): Promise<VideoMetadata[]> {
  if (!forceRefresh && cachedVideos) {
    return cachedVideos;
  }

  if (!forceRefresh && pendingVideos) {
    return pendingVideos;
  }

  pendingVideos = listVideos()
    .then((videos) => {
      cachedVideos = videos;
      return videos;
    })
    .finally(() => {
      pendingVideos = null;
    });

  return pendingVideos;
}
