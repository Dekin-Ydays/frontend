# Dekin Frontend Setup

This guide covers a full local setup for:
- `frontend` (Expo / React Native app)
- `video-parser` (NestJS backend used by the app over HTTP + WebSocket)

## 1. Prerequisites

Install these first:
- Node.js 20 LTS (recommended)
- npm (comes with Node)
- pnpm (`npm i -g pnpm`) for `video-parser`
- Watchman (recommended on macOS): `brew install watchman`

For iOS native modules:
- macOS + Xcode
- CocoaPods (`sudo gem install cocoapods` or `brew install cocoapods`)
- iPhone device recommended (simulator has no camera)

## 2. Clone Repositories

```bash
mkdir dekin && cd dekin
git clone https://github.com/Dekin-Ydays/frontend.git
git clone https://github.com/Dekin-Ydays/video-parser.git
```

If you already cloned only this repo, just clone `video-parser` next to it.

## 3. Install Dependencies

### Frontend

```bash
cd frontend
npm install
```

### Backend (`video-parser`)

```bash
cd ../video-parser
pnpm install
```

`video-parser/.env` should contain:

```env
DATABASE_URL="file:./dev.db"
```

## 4. Start `video-parser`

From `video-parser`:

```bash
pnpm run start:dev
```

Backend endpoints:
- HTTP: `http://localhost:3000`
- WebSocket: `ws://localhost:3000/ws`

Keep this terminal running.

## 5. Start Frontend

In a new terminal:

```bash
cd frontend
npx expo start --clear
```

### Web

Press `w` in Expo CLI.

### iOS (native modules)

Important: Expo Go cannot run custom native modules used here (`react-native-vision-camera`, `react-native-mediapipe-posedetection`, etc.).

Use a development build:

```bash
cd frontend
npx expo run:ios
```

Then run:

```bash
npx expo start --dev-client
```

Open the app with the development client (not Expo Go).

## 6. Optional Environment Overrides (Frontend)

If auto host detection is wrong on your network, set explicit values in `frontend/.env`:

```env
EXPO_PUBLIC_VIDEO_PARSER_HOST=YOUR_LAN_IP
EXPO_PUBLIC_VIDEO_PARSER_PORT=3000
# Optional full overrides:
# EXPO_PUBLIC_VIDEO_PARSER_BASE_URL=http://YOUR_LAN_IP:3000
# EXPO_PUBLIC_VIDEO_PARSER_WS_URL=ws://YOUR_LAN_IP:3000/ws
```

Restart Expo after changing env vars.

## 7. Quick Verification

When everything is running:
- Frontend log should show `Connected to WebSocket server`
- `video-parser` should log websocket client connections
- Opening camera screen in dev build should start pose processing

## 8. Troubleshooting

### "Native modules not loaded" or similar in Expo Go
Use development build (`expo run:ios` / `expo run:android`), not Expo Go.

### `MODEL_NOT_FOUND`
Model asset not bundled in native app. Rebuild native app:

```bash
cd frontend
npx expo prebuild --platform ios
npx pod-install
npx expo run:ios --no-build-cache
```

### WebSocket fails on phone (`ws://localhost:3000/ws`)
`localhost` on a phone is the phone itself. Set `EXPO_PUBLIC_VIDEO_PARSER_HOST` to your computer LAN IP.

### iOS simulator camera unavailable
Expected behavior. Use a physical iPhone for camera-based pose tracking.

## Useful Commands

Frontend:

```bash
npm run lint
npm run test
```

Backend:

```bash
cd ../video-parser
pnpm run lint
pnpm run test
```
