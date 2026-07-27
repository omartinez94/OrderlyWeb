import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';

describe('DropdownMenu', () => {
  it('opens on trigger click and shows the items', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Order</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Mark ready</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('Mark ready')).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Mark ready</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });

  it('passes axe when open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Mark ready</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
