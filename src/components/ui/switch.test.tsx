import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Switch } from './switch';
import { Label } from './label';

describe('Switch', () => {
  it('toggles on click', async () => {
    render(
      <>
        <Label htmlFor="s1">Notifications</Label>
        <Switch id="s1" />
      </>,
    );
    const sw = screen.getByLabelText('Notifications');
    expect(sw).toHaveAttribute('data-state', 'unchecked');
    await userEvent.click(sw);
    expect(sw).toHaveAttribute('data-state', 'checked');
  });

  it('toggles on Space key', async () => {
    render(
      <>
        <Label htmlFor="s2">Kbd</Label>
        <Switch id="s2" />
      </>,
    );
    const sw = screen.getByLabelText('Kbd');
    sw.focus();
    await userEvent.keyboard(' ');
    expect(sw).toHaveAttribute('data-state', 'checked');
  });

  it('passes axe in both states', async () => {
    const { container, rerender } = render(
      <>
        <Label htmlFor="sa1">A</Label>
        <Switch id="sa1" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
    rerender(
      <>
        <Label htmlFor="sa1">A</Label>
        <Switch id="sa1" defaultChecked />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
