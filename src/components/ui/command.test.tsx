import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';

function renderCommand() {
  return render(
    <Command>
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Orders">
          <CommandItem>Order #1284</CommandItem>
          <CommandItem>Order #1285</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>,
  );
}

describe('Command', () => {
  it('shows the empty state when the query has no matches', async () => {
    const user = userEvent.setup();
    renderCommand();
    await user.type(screen.getByPlaceholderText('Search…'), 'zzz-no-match');
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('filters items by typed query', async () => {
    const user = userEvent.setup();
    renderCommand();
    await user.type(screen.getByPlaceholderText('Search…'), '1284');
    expect(screen.getByText('Order #1284')).toBeInTheDocument();
    expect(screen.queryByText('Order #1285')).not.toBeInTheDocument();
  });

  it('passes axe', async () => {
    const { container } = renderCommand();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
