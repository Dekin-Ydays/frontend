import { vi } from 'vitest';

// Compatibility for libraries/tests expecting `jest`.
(globalThis as { jest?: typeof vi }).jest = vi;
