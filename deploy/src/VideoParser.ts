import * as Alchemy from "alchemy";

// Mirrors outputs of the `dekin-video-parser` stack in the
// Dekin-Ydays/video-parser repo; keep both in sync.
export class VideoParser extends Alchemy.Stack<
  VideoParser,
  { url: string; wsUrl: string }
>()("dekin-video-parser") {}
