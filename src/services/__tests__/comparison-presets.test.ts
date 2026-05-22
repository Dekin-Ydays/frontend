import {
  COMPARISON_PRESETS,
  getComparisonPresetConfig,
} from '../comparison-presets';

describe('comparison presets', () => {
  it('keeps product labels and parser configs together', () => {
    expect(COMPARISON_PRESETS.dance.label).toBe('Dance');
    expect(COMPARISON_PRESETS.yoga.description).toBe(
      'Focus on angles, rotation-invariant',
    );
    expect(getComparisonPresetConfig('sports')).toEqual({
      normalization: {
        center: true,
        scale: true,
        rotation: false,
      },
      positionWeight: 0.7,
      angularWeight: 0.3,
      visibilityThreshold: 0.7,
    });
  });
});
