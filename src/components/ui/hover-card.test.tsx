import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

describe('HoverCard', () => {
  it('opens on hover and shows the content', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard open>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Bio content</HoverCardContent>
      </HoverCard>,
    );
    await user.hover(screen.getByText('Hover me'));
    expect(await screen.findByText('Bio content')).toBeInTheDocument();
  });

  it('passes axe when open', async () => {
    const { container } = render(
      <HoverCard open>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Bio content</HoverCardContent>
      </HoverCard>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
