import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

describe('Accordion', () => {
  it('expands a panel on click', async () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Section A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Section B</AccordionTrigger>
          <AccordionContent>Content B</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole('button', { name: 'Section A' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Content A')).toBeVisible();
  });

  it('passes axe in closed and open states', async () => {
    const a = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Section A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(await axe(a.container)).toHaveNoViolations();
    a.unmount();
    const b = render(
      <Accordion type="single" collapsible defaultValue="a">
        <AccordionItem value="a">
          <AccordionTrigger>Section A</AccordionTrigger>
          <AccordionContent>Content A</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(await axe(b.container)).toHaveNoViolations();
  });
});
