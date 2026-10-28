import * as path from "node:path";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Effect from "effect/Effect";
import { Infrastructure } from "./Infrastructure.ts";
import { VideoParser } from "./VideoParser.ts";

export const Web = Effect.gen(function* () {
  const infrastructure = yield* Infrastructure;
  const videoParser = yield* VideoParser;

  return yield* Cloudflare.Website.StaticSite("Web", {
    name: infrastructure.frontendWorkerName,
    cwd: path.resolve(import.meta.dirname, "../.."),
    command: "bun run build:web",
    outdir: "dist",
    memo: {
      include: [
        "src/**",
        "public/**",
        "assets/**",
        "app.json",
        "babel.config.js",
        "metro.config.js",
        "tailwind.config.js",
        "tsconfig.json",
        "workbox-config.js",
        "package.json",
      ],
      lockfile: true,
    },
    assets: { notFoundHandling: "single-page-application" },
    env: {
      EXPO_PUBLIC_VIDEO_PARSER_BASE_URL: videoParser.url,
      EXPO_PUBLIC_VIDEO_PARSER_WS_URL: videoParser.wsUrl,
    },
  });
});
