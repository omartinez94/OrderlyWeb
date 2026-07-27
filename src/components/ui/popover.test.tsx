import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';

describe('Popover', () => {
  it('opens on trigger click and renders the content', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Hello world</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('Hello world')).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });

  it('passes axe when open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
