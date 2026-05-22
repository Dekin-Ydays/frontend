import type { ComparisonConfig } from './video-parser-api';

export const COMPARISON_PRESETS = {
  dance: {
    label: 'Dance',
    description: 'Position & angles balanced (50/50)',
    config: {
      normalization: {
        center: true,
        scale: true,
        rotation: false,
      },
      positionWeight: 0.5,
      angularWeight: 0.5,
    },
  },
  yoga: {
    label: 'Yoga',
    description: 'Focus on angles, rotation-invariant',
    config: {
      normalization: {
        center: true,
        scale: true,
        rotation: true,
      },
      positionWeight: 0.4,
      angularWeight: 0.6,
    },
  },
  sports: {
    label: 'Sports',
    description: 'Focus on position, higher visibility threshold',
    config: {
      normalization: {
        center: true,
        scale: true,
        rotation: false,
      },
      positionWeight: 0.7,
      angularWeight: 0.3,
      visibilityThreshold: 0.7,
    },
  },
} as const satisfies Record<
  string,
  { label: string; description: string; config: ComparisonConfig }
>;

export type ComparisonPreset = keyof typeof COMPARISON_PRESETS;

export function getComparisonPresetConfig(
  preset: ComparisonPreset,
): ComparisonConfig {
  return COMPARISON_PRESETS[preset].config;
}
