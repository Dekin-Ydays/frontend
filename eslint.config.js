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
    files: ["src/app/(tabs)/camera.tsx"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
