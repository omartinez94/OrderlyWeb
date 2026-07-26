import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';
import { Button } from './button';

describe('AlertDialog', () => {
  it('opens on trigger click', async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Cancel</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel order?</AlertDialogTitle>
            <AlertDialogDescription>Cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction>Cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('closes on Escape and returns focus', async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Cancel</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Cancel order?</AlertDialogTitle>
          <AlertDialogCancel>Keep</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    );
    const trigger = screen.getByRole('button', { name: 'Cancel' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('passes axe when open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Cancel</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Cancel order?</AlertDialogTitle>
          <AlertDialogDescription>Cannot be undone.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction>Cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
