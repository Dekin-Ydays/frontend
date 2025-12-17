# Video Parser API Frontend Integration

This document describes the frontend implementation for the Video Parser API integration in the Expo/React Native application.

## Overview

The frontend provides a complete interface for:
- Recording body poses using MediaPipe
- Streaming pose data to the backend via WebSocket
- Viewing connected clients and their recorded videos
- Comparing two videos with detailed scoring
- Visualizing comparison results with interactive charts

## Architecture

### Components

#### 1. **API Service** (`services/video-parser-api.ts`)
Central service for all Video Parser API interactions.

**Functions:**
- `listClients()` - Get all connected WebSocket clients
- `getLatestPose(clientId)` - Get the latest pose frame for a client
- `getVideo(videoId)` - Fetch a complete video by ID
- `compareVideos(request)` - Compare two videos and get scoring results

**Helpers:**
- `getScoreColor(score)` - Get color based on score (green/yellow/orange/red)
- `getScoreLabel(score)` - Get label based on score (Excellent/Good/Fair/Needs Improvement)
- `COMPARISON_PRESETS` - Pre-configured comparison settings for dance, yoga, and sports

#### 2. **MediaPipe Demo** (`components/mediapipe-demo.tsx`)
Existing component enhanced with WebSocket streaming.

**Features:**
- Real-time pose detection using MediaPipe (web only)
- Camera access on native (requires development build)
- Automatic WebSocket connection to backend
- Pose data streaming (throttled to 5 FPS)
- Visual feedback with skeleton overlay

#### 3. **Clients List** (`components/clients-list.tsx`)
Displays all connected WebSocket clients.

**Features:**
- Real-time client status (active/recent/inactive)
- Last seen timestamp with relative formatting
- Client ID display (used as video ID)
- Auto-refresh capability
- Empty state and error handling

#### 4. **Video Comparison** (`components/video-comparison.tsx`)
Main comparison interface.

**Features:**
- Input fields for reference and comparison video IDs
- Preset selection (Dance/Yoga/Sports)
- Loading states and error handling
- Results display with score visualization
- Clear/reset functionality

#### 5. **Score Visualization** (`components/score-visualization.tsx`)
Detailed scoring results display.

**Features:**
- Overall score with color-coded label
- Breakdown scores (Position, Angular, Timing)
- Progress bars for each metric
- Statistics (Mean, Min, Max, Variance)
- Frame-by-frame chart (horizontal scroll)

### Data Flow

```
User Action (Record Poses)
  ↓
MediaPipe Detection
  ↓
WebSocket Stream (ws://localhost:3000/ws)
  ↓
Backend (Video Parser API)
  ↓
Database (SQLite - videos & frames)

User Action (Compare Videos)
  ↓
Video Comparison Component
  ↓
API Service (compareVideos)
  ↓
Backend Processing
  ↓
Score Visualization Component
```

## Usage Guide

### Recording Poses

1. Open the app and navigate to the "Explore" tab
2. Expand "📹 Record Poses"
3. **On Web:**
   - Grant camera permissions
   - MediaPipe will detect your body pose
   - Pose data streams automatically to the backend
4. **On Mobile:**
   - Shows warning that development build is required
   - Full functionality needs native camera modules

### Viewing Connected Clients

1. Expand "👥 Connected Clients"
2. View list of all connected clients
3. Each client shows:
   - Connection status (colored dot)
   - Client ID (UUID)
   - Last seen timestamp
4. Use the refresh button (⟳) to update the list
5. Note: Client ID = Video ID for comparison

### Comparing Videos

1. Expand "⚖️ Compare Videos"
2. Enter two video IDs:
   - **Reference Video ID**: The "teacher" or target video
   - **Comparison Video ID**: The "student" or video to analyze
3. Select a preset:
   - **Dance**: Balanced position and angles (50/50)
   - **Yoga**: Focus on angles, rotation-invariant
   - **Sports**: Focus on position, higher visibility threshold
4. Tap "Compare Videos"
5. View detailed results:
   - Overall score (0-100%)
   - Position, Angular, and Timing scores
   - Statistics (mean, min, max, variance)
   - Frame-by-frame chart

### Understanding Scores

#### Overall Score
- **95-100%**: Nearly perfect match
- **85-95%**: Very good match, minor differences
- **70-85%**: Good match, noticeable differences
- **50-70%**: Moderate match, significant differences
- **<50%**: Poor match, very different poses

#### Position Score
Measures 3D spatial similarity of body landmarks.
- Accounts for body part importance (legs > upper body > face)
- Normalized for screen position and camera distance

#### Angular Score
Measures joint angle similarity at key joints.
- Elbow, knee, and hip angles
- Independent of body position

#### Timing Score
Measures video length matching.
- Formula: `(shorter length / longer length) × 100`

## API Configuration

### WebSocket URL
```typescript
Platform.select({
  android: 'ws://10.0.2.2:3000/ws', // Android Emulator
  default: 'ws://localhost:3000/ws', // iOS/Web
})
```

### REST API Base URL
```typescript
Platform.select({
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
})
```

### Updating URLs
To change the backend URL, edit:
- `components/mediapipe-demo.tsx` - Line 28-31 (WebSocket)
- `services/video-parser-api.ts` - Line 11-14 (REST API)

## TypeScript Types

All types are fully typed and match the API documentation:

```typescript
interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
  presence?: number;
}

interface ScoringResult {
  overallScore: number;
  frameScores: number[];
  breakdown: {
    positionScore: number;
    angularScore: number;
    timingScore: number;
    statistics: {
      mean: number;
      min: number;
      max: number;
      variance: number;
    };
  };
}
```

## Styling

All components use:
- `ThemedView` and `ThemedText` for automatic light/dark mode support
- Consistent spacing (8px, 12px, 16px, 20px, 24px)
- Color palette:
  - Primary: `#007AFF` (iOS blue)
  - Success: `#22c55e` (green)
  - Warning: `#eab308` (yellow)
  - Error: `#ef4444` (red)
  - Gray: `rgba(128, 128, 128, 0.x)`

## Error Handling

All API calls include:
- Try-catch blocks
- User-friendly error messages
- Loading states
- Retry mechanisms where appropriate

Example:
```typescript
try {
  const result = await compareVideos(request);
  setResult(result);
} catch (error) {
  Alert.alert(
    'Comparison Failed',
    error instanceof Error ? error.message : 'Unknown error'
  );
}
```

## Performance Considerations

### WebSocket Throttling
Pose data is throttled to 5 FPS (200ms interval) to:
- Reduce network bandwidth
- Prevent backend overload
- Maintain smooth UI

### Lazy Loading
- Components are only rendered when collapsible is expanded
- API calls are triggered on demand, not on mount
- Frame charts use horizontal scroll to handle large datasets

### Memory Management
- WebSocket connection cleanup on unmount
- Event listener removal
- State reset on navigation

## Testing

### Manual Testing Checklist

- [ ] WebSocket connects successfully
- [ ] Pose data streams to backend
- [ ] Clients list updates correctly
- [ ] Video comparison works with valid IDs
- [ ] Score visualization displays correctly
- [ ] Frame chart scrolls smoothly
- [ ] Error handling works (invalid IDs, network errors)
- [ ] Dark mode styling is correct
- [ ] Mobile responsiveness

### Test Video IDs

After recording some poses, you can get video IDs from:
1. The Clients List component (Client ID = Video ID)
2. Backend logs when a video session ends
3. Direct database query: `SELECT id FROM Video;`

## Troubleshooting

### WebSocket Won't Connect
- Check backend is running on port 3000
- Verify URL matches your environment (localhost vs 10.0.2.2)
- Check firewall settings

### "Video not found" Error
- Verify video ID is correct (UUID format)
- Check video was fully recorded (has frames)
- Use Clients List to see available videos

### Comparison Takes Too Long
- Large videos (>1000 frames) may take 5-10 seconds
- Progress indicator shows loading state
- Consider recording shorter videos for testing

### Mobile Camera Not Working
- MediaPipe requires web environment
- Native implementation needs development build
- See AGENTS.md for building native modules

## Future Enhancements

Potential improvements:
- Video preview before comparison
- Video recording controls (start/stop/save)
- Export comparison reports
- Real-time comparison as you record
- Video library/management
- Shareable comparison links
- Multi-video comparison
- Historical score tracking

## Related Documentation

- Backend API: `/video-parser/API_DOCUMENTATION.md`
- Pose Comparison Algorithm: `/video-parser/POSE_COMPARISON.md`
- Expo Setup: `AGENTS.md`
- MediaPipe Docs: https://developers.google.com/mediapipe
