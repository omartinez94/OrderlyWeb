import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';
import { Button } from './button';

describe('Sheet', () => {
  it('opens on trigger click and renders the side', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Side panel</SheetTitle>
            <SheetDescription>Drawer content.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('data-side', 'right');
  });

  it('closes on Escape and returns focus', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Side panel</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('passes axe in open state', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Side panel</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
