# Video Parser API Frontend Integration

This document describes the current Expo/React Native integration with the
Video Parser API.

## Overview

The frontend supports:
- Recording a camera clip from the Camera tab
- Uploading the clip to the parser backend for precise pose extraction
- Tracking upload and extraction progress
- Comparing two processed videos
- Viewing scoring breakdowns and skeleton overlays

The old WebSocket landmark-streaming demo path has been removed. The product
flow is now record -> process -> compare.

## Main Modules

### Camera Recording

- Native route: `src/app/(tabs)/camera.tsx`
- Web view: `src/components/camera-web.tsx`
- Shared processing module: `src/services/recorded-video-processing.ts`

Native uses `react-native-vision-camera` to record a video file. Web uses
`MediaRecorder` and `@mediapipe/tasks-vision` for local preview overlay. Both
platforms call the same processing module after a clip is available.

### Parser Interface

- API module: `src/services/video-parser-api.ts`
- Endpoint resolution: `src/services/video-parser-endpoints.ts`
- Video-list cache: `src/services/video-list-cache.ts`

The parser module owns REST requests, upload progress via XHR, SSE extraction
events, and error normalization. Components should not construct parser URLs
or manage parser progress directly.

### Compare Flow

- Route: `src/app/compare.tsx`
- Form/results UI: `src/components/video-comparison.tsx`
- Overlay renderer: `src/components/frame-comparator.tsx`
- Native overlay renderer: `src/components/frame-comparator-native.tsx`

The Camera tab can route to Compare with a processed video prefilled as either
the reference or comparison video.

## Data Flow

```text
Camera clip
  -> processRecordedVideo
  -> POST /pose/video/process?jobId=...
  -> SSE /pose/extraction/events
  -> Processed video ID
  -> Compare route
  -> POST /pose/compare
  -> Score visualization + skeleton overlay
```

## Backend URL Configuration

The frontend resolves parser HTTP and WebSocket URLs from:

- `EXPO_PUBLIC_VIDEO_PARSER_BASE_URL`
- `EXPO_PUBLIC_VIDEO_PARSER_HOST`
- `EXPO_PUBLIC_VIDEO_PARSER_PORT`
- `EXPO_PUBLIC_VIDEO_PARSER_HTTP_SCHEME`
- `EXPO_PUBLIC_VIDEO_PARSER_WS_URL`
- `EXPO_PUBLIC_VIDEO_PARSER_WS_SCHEME`

When environment values are absent, the app derives a useful local development
host from Expo runtime metadata and falls back to `localhost` or Android
emulator loopback.

## Manual Verification

- Camera permission is requested.
- Recording creates a video and uploads it.
- Upload progress reaches processing state.
- Extraction progress updates when the backend emits frame events.
- Processed result can be sent to Compare as reference or comparison.
- Compare can select two videos, run scoring, and render the overlay.
- Server-unreachable and parser-not-ready states show useful errors.

## Related Documentation

- Backend API: `/video-parser/API_DOCUMENTATION.md`
- Pose Comparison Algorithm: `/video-parser/POSE_COMPARISON.md`
- Expo setup: `README.md`
