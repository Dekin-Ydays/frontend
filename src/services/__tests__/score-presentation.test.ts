import { getScoreColor, getScoreLabel } from '../score-presentation';

describe('score presentation', () => {
  it('maps score ranges to expected color', () => {
    expect(getScoreColor(95)).toBe('#22c55e');
    expect(getScoreColor(70)).toBe('#eab308');
    expect(getScoreColor(50)).toBe('#f97316');
    expect(getScoreColor(49)).toBe('#ef4444');
  });

  it('maps score ranges to expected labels', () => {
    expect(getScoreLabel(95)).toBe('Excellent');
    expect(getScoreLabel(70)).toBe('Good');
    expect(getScoreLabel(50)).toBe('Fair');
    expect(getScoreLabel(49)).toBe('Needs Improvement');
  });
});
