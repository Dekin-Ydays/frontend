const SUPPRESSED_PATTERNS = [/^onResults event received:/];

const originalLog = console.log.bind(console);
console.log = (...args: unknown[]) => {
  const first = args[0];
  if (typeof first === "string" && SUPPRESSED_PATTERNS.some((p) => p.test(first))) {
    return;
  }
  originalLog(...args);
};
