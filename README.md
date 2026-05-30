# Dekin Frontend Setup

> Nouveau mainteneur : commencer par la passation française canonique dans le repo infrastructure : https://github.com/Dekin-Ydays/infrastructure/blob/main/HANDOVER_FR.md
>
> Ce repo est le frontend Expo de Dekin. En production web, le backend parser est configuré via `EXPO_PUBLIC_VIDEO_PARSER_BASE_URL` et `EXPO_PUBLIC_VIDEO_PARSER_WS_URL`.

This is the essential setup for running the Expo frontend locally.

## 1. Prerequisites

Install these first:
- Node.js 20 LTS (recommended)
- npm (comes with Node)
- Watchman (recommended on macOS): `brew install watchman`

For iOS native modules:
- macOS + Xcode
- CocoaPods (`sudo gem install cocoapods` or `brew install cocoapods`)
- iPhone device recommended (simulator has no camera)

## 2. Clone Repository

Standalone:

```bash
git clone https://github.com/Dekin-Ydays/frontend.git
cd frontend
```

Si les repos Dekin sont déjà clonés côte à côte, se placer simplement dans `frontend/`.

## 3. Install Dependencies

```bash
npm install
```

## 4. Start Frontend

Start Metro:

```bash
npx expo start --clear
```

### Web

Press `w` in Expo CLI.

### iOS (native modules)

Important: Expo Go cannot run the native camera module used here (`react-native-vision-camera`).

Use a development build:

```bash
npx expo run:ios
```

Then run:

```bash
npx expo start --dev-client
```

Open the app with the development client (not Expo Go).

## 5. Quick Verification

When everything is running:
- App opens from Expo web/simulator/device without red screen errors
- Camera features are tested on a physical iPhone development build

## 6. Troubleshooting

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

### iOS simulator camera unavailable
Expected behavior. Use a physical iPhone for camera-based pose tracking.

## Useful Commands

Frontend:

```bash
npm run lint
npm run test
npm run test:coverage
npm run workflow:test
```
