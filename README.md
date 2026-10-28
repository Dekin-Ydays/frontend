# Dekin Frontend Setup

> Ce repo est le frontend Expo de Dekin. En production web, le backend parser est configuré via `EXPO_PUBLIC_VIDEO_PARSER_BASE_URL` et `EXPO_PUBLIC_VIDEO_PARSER_WS_URL`.
>
> Déploiement web : site statique Cloudflare décrit dans `deploy/alchemy.run.ts` (Alchemy), déployé par `.github/workflows/deploy.yml` ; les deux variables ci-dessus y sont injectées depuis la stack `dekin-video-parser`. Voir `infrastructure/README.md`.

This is the essential setup for running the Expo frontend locally.

## 1. Prerequisites

Install these first:
- Node.js 20 LTS (recommended)
- Bun 1.3+ (`curl -fsSL https://bun.sh/install | bash`)
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
bun install
```

## 4. Start Frontend

Start Metro:

```bash
bunx expo start --clear
```

### Web

Press `w` in Expo CLI.

### iOS (native modules)

Important: Expo Go cannot run the native camera module used here (`react-native-vision-camera`).

Use a development build:

```bash
bunx expo run:ios
```

Then run:

```bash
bunx expo start --dev-client
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
bunx expo prebuild --platform ios
bunx pod-install
bunx expo run:ios --no-build-cache
```

### iOS simulator camera unavailable
Expected behavior. Use a physical iPhone for camera-based pose tracking.

## Useful Commands

Frontend:

```bash
bun run lint
bun run test
bun run test:coverage
bun run workflow:test
```
