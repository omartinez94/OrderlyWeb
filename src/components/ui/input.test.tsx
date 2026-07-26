import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Input } from './input';
import { Label } from './label';

describe('Input', () => {
  it('renders a labeled input', () => {
    render(
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
    );
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('supports `aria-invalid` via prop', () => {
    render(
      <>
        <Label htmlFor="bad">Email</Label>
        <Input id="bad" aria-invalid="true" />
      </>
    );
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('passes axe when paired with a label', async () => {
    const { container } = render(
      <>
        <Label htmlFor="ok">Email</Label>
        <Input id="ok" />
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe with `aria-invalid` and an error description', async () => {
    const { container } = render(
      <>
        <Label htmlFor="err">Email</Label>
        <Input
          id="err"
          aria-invalid="true"
          aria-describedby="err-msg"
        />
        <p id="err-msg">Enter a valid email address.</p>
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
