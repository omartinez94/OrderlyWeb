import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

describe('Card', () => {
  it('renders compound parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Order #1284</CardTitle>
          <CardDescription>Table 7 — 2 covers</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Margherita, Caesar, two Tiramisu.</p>
        </CardContent>
      </Card>,
    );
    expect(screen.getByText('Order #1284')).toBeInTheDocument();
    expect(screen.getByText('Table 7 — 2 covers')).toBeInTheDocument();
  });

  it('renders each variant without a11y violations', async () => {
    const variants = ['default', 'bordered', 'quiet', 'surface', 'glass', 'muted'] as const;
    for (const variant of variants) {
      const { container, unmount } = render(
        <Card variant={variant}>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Body</CardContent>
        </Card>,
      );
      const results = await axe(container);
      expect(results, `variant "${variant}"`).toHaveNoViolations();
      unmount();
    }
  });
});
