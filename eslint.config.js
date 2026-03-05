// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: [
      "src/components/mediapipe-demo.tsx",
      "src/components/mediapipe-demo-native-view.tsx",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
