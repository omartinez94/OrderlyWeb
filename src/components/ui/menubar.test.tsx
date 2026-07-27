import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from './menubar';

describe('Menubar', () => {
  it('renders the trigger and the items', async () => {
    const user = userEvent.setup();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New order</MenubarItem>
            <MenubarItem>Open recent</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    await user.click(screen.getByRole('menubar', { name: '' }).querySelector('button')!);
    expect(await screen.findByText('New order')).toBeInTheDocument();
  });

  it('passes axe', async () => {
    const { container } = render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New order</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
