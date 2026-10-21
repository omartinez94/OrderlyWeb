import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { DollarSign, Timer } from "lucide-react";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { MetricKpiCard } from "./MetricKpiCard";

describe("MetricKpiCard", () => {
  it("renders metric title, formatted value, delta badge, and passes axe check", async () => {
    const { container } = renderWithI18n(
      <MetricKpiCard
        title="Gross Sales"
        value="$4,820.50"
        icon={DollarSign}
        subtitle="142 orders processed"
        delta={12.8}
        deltaLabel="vs previous period"
      />,
      "en",
    );

    expect(screen.getByText("Gross Sales")).toBeInTheDocument();
    expect(screen.getByText("$4,820.50")).toBeInTheDocument();
    expect(screen.getByText("142 orders processed")).toBeInTheDocument();
    expect(screen.getByText("+12.8%")).toBeInTheDocument();
    expect(screen.getByText("vs previous period")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("handles inverted delta where negative is favorable (e.g. prep time)", async () => {
    renderWithI18n(
      <MetricKpiCard
        title="Avg Prep Time"
        value="12.4m"
        icon={Timer}
        delta={-6.2}
        deltaLabel="vs target"
        deltaInverted={true}
        target="Target: 12 min"
      />,
      "en",
    );

    expect(screen.getByText("Avg Prep Time")).toBeInTheDocument();
    expect(screen.getByText("12.4m")).toBeInTheDocument();
    expect(screen.getByText("-6.2%")).toBeInTheDocument();
    expect(screen.getByText("Target: 12 min")).toBeInTheDocument();
  });

  it("renders correctly under Spanish locale", async () => {
    const { container } = renderWithI18n(
      <MetricKpiCard
        title="Ventas Brutas"
        value="4.820,50 US$"
        icon={DollarSign}
        delta={8.4}
        deltaLabel="vs período anterior"
      />,
      "es",
    );

    expect(screen.getByText("Ventas Brutas")).toBeInTheDocument();
    expect(screen.getByText("4.820,50 US$")).toBeInTheDocument();
    expect(screen.getByText("+8.4%")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
