import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ScrollArea } from './scroll-area';

describe('ScrollArea', () => {
  it('renders its children inside the scrollable viewport', () => {
    render(
      <ScrollArea>
        <p>Line 1</p>
        <p>Line 2</p>
      </ScrollArea>,
    );
    expect(screen.getByText('Line 1')).toBeInTheDocument();
    expect(screen.getByText('Line 2')).toBeInTheDocument();
  });

  it('passes axe', async () => {
    const { container } = render(
      <ScrollArea>
        <p>Content</p>
      </ScrollArea>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
