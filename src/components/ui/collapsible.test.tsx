import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible';

describe('Collapsible', () => {
  it('reveals content on trigger click', async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Show</CollapsibleTrigger>
        <CollapsibleContent>Hidden body</CollapsibleContent>
      </Collapsible>
    );
    const trigger = screen.getByRole('button', { name: 'Show' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Hidden body')).toBeVisible();
  });

  it('passes axe', async () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Show</CollapsibleTrigger>
        <CollapsibleContent>Hidden body</CollapsibleContent>
      </Collapsible>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
