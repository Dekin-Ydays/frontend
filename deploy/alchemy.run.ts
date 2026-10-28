import * as Alchemy from "alchemy";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Effect from "effect/Effect";
import { Web } from "./src/Web.ts";

export default Alchemy.Stack(
  "dekin-frontend",
  { providers: Cloudflare.providers(), state: Cloudflare.state() },
  Effect.gen(function* () {
    const web = yield* Web;
    return { url: web.url };
  }),
);
