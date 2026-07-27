import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";
import { Button } from "./button";
import { useZodForm } from "@/lib/forms";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

function EmailForm({ onSubmit }: { onSubmit?: (v: { email: string }) => void }) {
  const form = useZodForm(schema, { defaultValues: { email: "" } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => onSubmit?.(v))} noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormDescription>Used for the receipt.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  it("links the label to the input via `htmlFor`/`id`", () => {
    render(<EmailForm />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id");
  });

  it("renders the description when the field is valid", () => {
    render(<EmailForm />);
    expect(screen.getByText("Used for the receipt.")).toBeInTheDocument();
  });

  it("shows the error message and `aria-invalid` after a failed submit", async () => {
    render(<EmailForm />);
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
  });

  it("wires the error message into `aria-describedby` on the input", async () => {
    render(<EmailForm />);
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    const input = screen.getByLabelText("Email");
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    // The FormControl wires both the description and the message ids.
    const descriptionId = input.getAttribute("id")?.replace("-form-item", "-form-item-description");
    const messageId = input.getAttribute("id")?.replace("-form-item", "-form-item-message");
    expect(describedBy).toContain(descriptionId);
    expect(describedBy).toContain(messageId);
  });

  it("clears the error and submits with a valid value", async () => {
    const onSubmit = vi.fn();
    render(<EmailForm onSubmit={onSubmit} />);
    const input = screen.getByLabelText("Email");
    await userEvent.type(input, "staff@acme.com");
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(input).not.toHaveAttribute("aria-invalid", "true");
    expect(onSubmit).toHaveBeenCalledWith({ email: "staff@acme.com" });
  });

  it("passes axe in valid state", async () => {
    const { container } = render(<EmailForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("passes axe in error state", async () => {
    const { container } = render(<EmailForm />);
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
