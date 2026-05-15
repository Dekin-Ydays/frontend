module.exports = {
  globDirectory: "dist",
  globPatterns: ["**/*.{css,html,ico,js,json,png,ttf,woff,woff2}"],
  globIgnores: ["sw.js", "workbox-*.js"],
  swDest: "dist/sw.js",
  cleanupOutdatedCaches: true,
  clientsClaim: false,
  skipWaiting: false,
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
};
