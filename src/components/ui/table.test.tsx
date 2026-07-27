import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

describe("Table", () => {
  it("renders caption, header, and rows", () => {
    render(
      <Table>
        <TableCaption>Order list</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Order</TableHead>
            <TableHead scope="col">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>#1284</TableCell>
            <TableCell>Ready</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText("Order list")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Order" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "#1284" })).toBeInTheDocument();
  });

  it("uses scope=col on header cells", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Order</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const th = screen.getByRole("columnheader");
    expect(th.tagName).toBe("TH");
  });

  it("passes axe with caption + scope", async () => {
    const { container } = render(
      <Table>
        <TableCaption>Order list</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Order</TableHead>
            <TableHead scope="col">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>#1284</TableCell>
            <TableCell>Ready</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
