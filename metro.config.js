const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const deployDir = path.join(__dirname, "deploy").replace(/[/\\^$.*+?()[\]{}|]/g, "\\$&");
config.resolver.blockList = [
  ...[].concat(config.resolver.blockList ?? []),
  new RegExp(`^${deployDir}[/\\\\].*`),
];

module.exports = withNativeWind(config, { input: "./src/global.css" });
