import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Button } from './button';

function renderTooltip(ui: React.ReactNode) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe('Tooltip', () => {
  it('appears on hover and is a plain text surface', async () => {
    const user = userEvent.setup();
    renderTooltip(
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Hover</Button>
        </TooltipTrigger>
        <TooltipContent>Helpful text</TooltipContent>
      </Tooltip>,
    );
    await user.hover(screen.getByRole('button', { name: 'Hover' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Helpful text');
  });

  it('warns in DEV when given an interactive child', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderTooltip(
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button>Trigger</Button>
        </TooltipTrigger>
        <TooltipContent>
          <button type="button">Inner button</button>
        </TooltipContent>
      </Tooltip>,
    );
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('passes axe when open', async () => {
    const { container } = renderTooltip(
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button>Trigger</Button>
        </TooltipTrigger>
        <TooltipContent>Helpful text</TooltipContent>
      </Tooltip>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
