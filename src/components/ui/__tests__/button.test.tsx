import { fireEvent, render, screen } from '@testing-library/react-native';
import { vi } from 'vitest';

import { Button } from '../button';

describe('Button', () => {
  it('renders the label and calls onPress when tapped', () => {
    const onPress = vi.fn();

    render(<Button variant="primary" label="Start" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'Start' }));

    expect(screen.getByText('Start')).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses fallback accessibility label when no label is provided', () => {
    render(<Button variant="secondary" onPress={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Button' })).toBeTruthy();
  });

  it('does not call onPress when disabled', () => {
    const onPress = vi.fn();

    render(
      <Button variant="secondary" label="Disabled" onPress={onPress} disabled />
    );
    fireEvent.press(screen.getByRole('button', { name: 'Disabled' }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('is inert when onPress is missing', () => {
    render(<Button variant="secondary" label="No handler" />);
    fireEvent.press(screen.getByRole('button', { name: 'No handler' }));
  });
});
