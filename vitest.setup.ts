import { vi } from 'vitest';

// Compatibility for libraries/tests expecting `jest`.
Object.defineProperty(globalThis, 'jest', {
  value: vi,
  writable: true,
  configurable: true,
});
