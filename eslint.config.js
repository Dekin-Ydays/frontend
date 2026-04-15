// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts", ".mjs"],
          mainFields: ["main", "module"],
        },
      },
    },
  },
  {
    ignores: ["dist/*"],
  },
  {
    files: [
      "src/components/mediapipe-demo.tsx",
      "src/components/native-pose-modules.ts",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
