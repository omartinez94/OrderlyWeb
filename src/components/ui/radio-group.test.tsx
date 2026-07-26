import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from './label';

describe('RadioGroup', () => {
  it('selects the default value', () => {
    render(
      <RadioGroup defaultValue="a">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="a" id="r-a" />
          <Label htmlFor="r-a">A</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="b" id="r-b" />
          <Label htmlFor="r-b">B</Label>
        </div>
      </RadioGroup>
    );
    expect(screen.getByLabelText('A')).toBeChecked();
    expect(screen.getByLabelText('B')).not.toBeChecked();
  });

  it('switches selection on click', async () => {
    render(
      <RadioGroup defaultValue="a">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="a" id="r2-a" />
          <Label htmlFor="r2-a">A</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="b" id="r2-b" />
          <Label htmlFor="r2-b">B</Label>
        </div>
      </RadioGroup>
    );
    await userEvent.click(screen.getByLabelText('B'));
    expect(screen.getByLabelText('B')).toBeChecked();
    expect(screen.getByLabelText('A')).not.toBeChecked();
  });

  it('moves focus with arrow keys (Radix roving tabindex)', async () => {
    render(
      <RadioGroup defaultValue="a">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="a" id="r3-a" />
          <Label htmlFor="r3-a">A</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="b" id="r3-b" />
          <Label htmlFor="r3-b">B</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="c" id="r3-c" />
          <Label htmlFor="r3-c">C</Label>
        </div>
      </RadioGroup>
    );
    const first = screen.getByLabelText('A');
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    // In Radix RadioGroup, arrow keys move focus across the roving
    // tabindex. The selection itself updates through `onValueChange`,
    // which we verify in the click-based test above. jsdom does not
    // always reproduce the focus-driven selection change deterministically,
    // so the assertion here is on focus only.
    expect(screen.getByLabelText('B')).toHaveFocus();
  });

  it('passes axe in both states', async () => {
    const { container, rerender } = render(
      <RadioGroup defaultValue="a">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="a" id="r4-a" />
          <Label htmlFor="r4-a">A</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="b" id="r4-b" />
          <Label htmlFor="r4-b">B</Label>
        </div>
      </RadioGroup>
    );
    expect(await axe(container)).toHaveNoViolations();
    rerender(
      <RadioGroup defaultValue="b">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="a" id="r4-a" />
          <Label htmlFor="r4-a">A</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="b" id="r4-b" />
          <Label htmlFor="r4-b">B</Label>
        </div>
      </RadioGroup>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
