import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Textarea } from './textarea';
import { Label } from './label';

describe('Textarea', () => {
  it('renders a labeled textarea', () => {
    render(
      <>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Anything else?" />
      </>
    );
    expect(screen.getByLabelText('Notes').tagName).toBe('TEXTAREA');
  });

  it('captures user input', async () => {
    render(
      <>
        <Label htmlFor="t2">Notes</Label>
        <Textarea id="t2" />
      </>
    );
    const ta = screen.getByLabelText('Notes');
    await userEvent.type(ta, 'No allergies');
    expect(ta).toHaveValue('No allergies');
  });

  it('passes axe when paired with a label', async () => {
    const { container } = render(
      <>
        <Label htmlFor="ok">Notes</Label>
        <Textarea id="ok" />
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
