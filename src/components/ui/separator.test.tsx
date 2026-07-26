import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Separator } from './separator';

describe('Separator', () => {
  it('decorative separator is hidden from screen readers', () => {
    render(<Separator data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveAttribute('role', 'none');
  });

  it('semantic separator exposes role and orientation', () => {
    render(<Separator decorative={false} orientation="vertical" data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveAttribute('role', 'separator');
    expect(sep).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('passes axe in both modes', async () => {
    const a = render(<Separator />);
    expect(await axe(a.container)).toHaveNoViolations();
    a.unmount();
    const b = render(<Separator decorative={false} orientation="vertical" />);
    expect(await axe(b.container)).toHaveNoViolations();
  });
});
