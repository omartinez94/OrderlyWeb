import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Progress } from './progress';

describe('Progress', () => {
  it('renders determinate progress with role and aria-valuenow', () => {
    render(<Progress value={42} aria-label="Prep" />);
    const bar = screen.getByRole('progressbar', { name: 'Prep' });
    expect(bar).toHaveAttribute('aria-valuenow', '42');
  });

  it('renders indeterminate progress with aria-valuetext', () => {
    render(
      <Progress
        aria-label="Syncing"
        aria-valuetext="Loading"
        value={null as unknown as number}
      />
    );
    const bar = screen.getByRole('progressbar', { name: 'Syncing' });
    expect(bar).toHaveAttribute('data-state', 'indeterminate');
  });

  it('passes axe', async () => {
    const { container } = render(
      <Progress value={64} aria-label="Prep" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
