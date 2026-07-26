import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Toggle } from './toggle';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

describe('Toggle', () => {
  it('toggles pressed state on click', async () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    const t = screen.getByRole('button', { name: 'Bold' });
    expect(t).toHaveAttribute('data-state', 'off');
    await userEvent.click(t);
    expect(t).toHaveAttribute('data-state', 'on');
  });

  it('passes axe in both states (separate renders to avoid the controlled/uncontrolled switch)', async () => {
    const a = render(<Toggle aria-label="off">off</Toggle>);
    expect(await axe(a.container)).toHaveNoViolations();
    a.unmount();
    const b = render(
      <Toggle aria-label="on" pressed>
        on
      </Toggle>
    );
    expect(await axe(b.container)).toHaveNoViolations();
  });
});

describe('ToggleGroup', () => {
  it('selects one item at a time (single mode renders as radio role)', async () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="day" aria-label="Day">
          Day
        </ToggleGroupItem>
        <ToggleGroupItem value="week" aria-label="Week">
          Week
        </ToggleGroupItem>
      </ToggleGroup>
    );
    const day = screen.getByRole('radio', { name: 'Day' });
    const week = screen.getByRole('radio', { name: 'Week' });
    await userEvent.click(week);
    expect(week).toHaveAttribute('data-state', 'on');
    expect(day).toHaveAttribute('data-state', 'off');
  });

  it('passes axe', async () => {
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
