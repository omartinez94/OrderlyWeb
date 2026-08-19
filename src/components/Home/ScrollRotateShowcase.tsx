import { useTranslate } from "../../hooks/useTranslate";
import { useScrollProgress } from "../../hooks";
import "./ScrollRotateShowcase.css";

interface FaceProps {
  translate: any;
}

/** Front Face: Active/Preparing ticket */
function TicketPrepFace({ translate }: FaceProps) {
  return (
    <div className="flex h-full flex-col justify-between font-sans text-xs">
      <div>
        {/* Ticket header */}
        <div className="border-border-strong mb-2 flex items-start justify-between border-b border-dashed pb-2">
          <div className="text-left">
            <span className="text-ink font-mono font-bold">
              {translate("home.scrollShowcase.ticket.order")}
            </span>
            <p className="text-ink-subtle mt-0.5 font-mono text-[9px]">
              {translate("home.scrollShowcase.ticket.header")}
            </p>
          </div>
          <span className="bg-service-aqua/15 text-service-aqua shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold">
            {translate("home.scrollShowcase.ticket.statusPrep")}
          </span>
        </div>

        {/* Ticket content */}
        <div className="space-y-1.5">
          <div className="text-ink-subtle text-left font-mono text-[10px]">
            {translate("home.scrollShowcase.ticket.table")}
          </div>
          <ul className="text-ink-muted space-y-1.5 text-left">
            <li className="flex items-center gap-2">
              <span className="border-border-strong flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border" />
              <span className="truncate text-[10px]">{translate("home.scrollShowcase.ticket.item1")}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="border-border-strong flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border" />
              <span className="truncate text-[10px]">{translate("home.scrollShowcase.ticket.item2")}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="border-border-strong flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border" />
              <span className="truncate text-[10px]">{translate("home.scrollShowcase.ticket.item3")}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Ticket footer */}
      <div className="border-border-strong text-ink-subtle mt-2 flex items-center justify-between border-t border-dashed pt-2 font-mono text-[10px]">
        <span>KDS: ACTIVE</span>
        <span className="text-accent animate-pulse font-semibold">
          {translate("home.scrollShowcase.ticket.timePrep")}
        </span>
      </div>
    </div>
  );
}

/** Back Face: Served/Completed ticket with stamp overlay */
function TicketServedFace({ translate }: FaceProps) {
  return (
    <div className="relative flex h-full flex-col justify-between font-sans text-xs">
      {/* Stamped QC overlay */}
      <div className="border-success text-success bg-surface-overlay absolute top-[45%] left-[50%] z-20 -translate-x-[50%] -translate-y-[50%] -rotate-12 rounded border-2 border-dashed px-3 py-1 font-mono text-[13px] font-black whitespace-nowrap opacity-85 shadow-sm select-none">
        {translate("home.scrollShowcase.ticket.qcStamp")}
      </div>

      <div className="opacity-40">
        {/* Ticket header */}
        <div className="border-border-strong mb-2 flex items-start justify-between border-b border-dashed pb-2">
          <div className="text-left">
            <span className="text-ink font-mono font-bold">
              {translate("home.scrollShowcase.ticket.order")}
            </span>
            <p className="text-ink-subtle mt-0.5 font-mono text-[9px]">
              {translate("home.scrollShowcase.ticket.header")}
            </p>
          </div>
          <span className="bg-success/15 text-success shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold">
            {translate("home.scrollShowcase.ticket.statusServed")}
          </span>
        </div>

        {/* Ticket content */}
        <div className="space-y-1.5">
          <div className="text-ink-subtle text-left font-mono text-[10px]">
            {translate("home.scrollShowcase.ticket.table")}
          </div>
          <ul className="text-ink-muted space-y-1.5 text-left">
            <li className="flex items-center gap-2 line-through">
              <span className="border-success bg-success/10 text-success flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[9px] font-bold">
                ✓
              </span>
              <span className="truncate text-[10px]">{translate("home.scrollShowcase.ticket.item1")}</span>
            </li>
            <li className="flex items-center gap-2 line-through">
              <span className="border-success bg-success/10 text-success flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[9px] font-bold">
                ✓
              </span>
              <span className="truncate text-[10px]">{translate("home.scrollShowcase.ticket.item2")}</span>
            </li>
            <li className="flex items-center gap-2 line-through">
              <span className="border-success bg-success/10 text-success flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[9px] font-bold">
                ✓
              </span>
              <span className="truncate text-[10px]">{translate("home.scrollShowcase.ticket.item3")}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Ticket footer */}
      <div className="border-border-strong text-ink-subtle mt-2 flex items-center justify-between border-t border-dashed pt-2 font-mono text-[10px] opacity-50">
        <span>KDS: ARCHIVED</span>
        <span className="text-success font-bold">{translate("home.scrollShowcase.ticket.timeServed")}</span>
      </div>
    </div>
  );
}

/**
 * Scroll-driven 3D rotating card section.
 *
 * A digital receipt paper ticket moves down a virtual conveyor lane and
 * flips 180 degrees around the X-axis from a KDS Active "Preparing" ticket
 * into a completed "Served" ticket, illustrating the Orderly workflow.
 */
export function ScrollRotateShowcase() {
  const translate = useTranslate("common");
  const { ref, progress } = useScrollProgress<HTMLDivElement>();

  // Calculations for vertical translation and 3D rotations
  const translateY = progress * 240; // Travel 240px downwards
  const rotateX = progress * 180; // Flip 180 degrees on X-axis (up to down)
  const rotateY = Math.sin(progress * Math.PI) * 15; // Side-sway for depth look

  return (
    <section
      ref={ref}
      className="bg-surface relative min-h-[180vh]"
      aria-label={translate("home.scrollShowcase.heading")}
    >
      {/* Sticky frame — stays pinned while scrolling the runway */}
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-4 md:px-8">
        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-12 md:grid-cols-2">
          {/* Left Side: Descriptions for active preparation vs served */}
          <div className="flex flex-col justify-center gap-6 text-left">
            <h2 className="font-display text-primary text-3xl font-bold tracking-tight md:text-4xl">
              {translate("home.scrollShowcase.heading")}
            </h2>

            <div className="relative flex flex-col gap-6">
              {/* Prep Station (Active < 0.5) */}
              <div
                className="border-l-2 py-1 pl-4 transition-all duration-300"
                style={{
                  borderColor:
                    progress < 0.5 ? "var(--color-accent)" : "var(--color-border-subtle)",
                  opacity: progress < 0.5 ? 1 : 0.4,
                  transform: progress < 0.5 ? "translateX(4px)" : "none",
                }}
              >
                <span className="text-accent font-mono text-[10px] font-bold tracking-widest uppercase">
                  {translate("home.scrollShowcase.prep.label")}
                </span>
                <h3 className="font-display text-ink mt-1 text-lg font-bold">
                  {translate("home.scrollShowcase.prep.title")}
                </h3>
                <p className="text-ink-muted mt-1.5 font-sans text-sm leading-relaxed">
                  {translate("home.scrollShowcase.prep.description")}
                </p>
              </div>

              {/* Served Station (Active >= 0.5) */}
              <div
                className="border-l-2 py-1 pl-4 transition-all duration-300"
                style={{
                  borderColor:
                    progress >= 0.5 ? "var(--color-primary)" : "var(--color-border-subtle)",
                  opacity: progress >= 0.5 ? 1 : 0.4,
                  transform: progress >= 0.5 ? "translateX(4px)" : "none",
                }}
              >
                <span className="text-primary font-mono text-[10px] font-bold tracking-widest uppercase">
                  {translate("home.scrollShowcase.served.label")}
                </span>
                <h3 className="font-display text-ink mt-1 text-lg font-bold">
                  {translate("home.scrollShowcase.served.title")}
                </h3>
                <p className="text-ink-muted mt-1.5 font-sans text-sm leading-relaxed">
                  {translate("home.scrollShowcase.served.description")}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Vertical track conveyor corridor */}
          <div className="relative flex h-[520px] w-full items-center justify-center">
            {/* The vertical connection line */}
            <div className="border-border-strong absolute top-[60px] bottom-[60px] w-[2px] border-l-2 border-dashed opacity-40" />

            {/* Top station marker */}
            <div className="border-accent/20 bg-accent/[0.01] absolute top-2 flex h-[180px] w-[220px] flex-col items-center justify-start rounded-xl border border-dashed p-3 select-none">
              <span className="text-accent/60 font-mono text-[9px] font-bold tracking-widest uppercase">
                {translate("home.scrollShowcase.prep.label")}
              </span>
            </div>

            {/* Bottom station marker */}
            <div className="border-primary/20 bg-primary/[0.01] absolute bottom-2 flex h-[180px] w-[220px] flex-col items-center justify-end rounded-xl border border-dashed p-3 select-none">
              <span className="text-primary/60 font-mono text-[9px] font-bold tracking-widest uppercase">
                {translate("home.scrollShowcase.served.label")}
              </span>
            </div>

            {/* The 3D Ticket Card container */}
            <div
              className="scroll-rotate-perspective absolute top-2 h-[280px] w-[200px]"
              style={{
                transform: `translateY(${translateY}px)`,
              }}
            >
              <div
                className="scroll-rotate-card relative h-full w-full"
                style={{
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                }}
              >
                {/* Front Face: Preparing */}
                <div className="scroll-rotate-face bg-surface-overlay border-border-strong shadow-elevation-card absolute inset-0 flex flex-col overflow-hidden rounded-xl border p-4 select-none">
                  {/* Ticket top jagged cutout decoration */}
                  <div
                    className="bg-surface absolute top-0 right-0 left-0 h-2.5"
                    style={{
                      clipPath:
                        "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)",
                    }}
                  />
                  <div className="h-full pt-1.5">
                    <TicketPrepFace translate={translate} />
                  </div>
                </div>

                {/* Back Face: Completed */}
                <div className="scroll-rotate-face scroll-rotate-face--back bg-surface-overlay border-border-strong shadow-elevation-card absolute inset-0 flex flex-col overflow-hidden rounded-xl border p-4 select-none">
                  {/* Ticket top jagged cutout decoration */}
                  <div
                    className="bg-surface absolute top-0 right-0 left-0 h-2.5"
                    style={{
                      clipPath:
                        "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)",
                    }}
                  />
                  <div className="h-full pt-1.5">
                    <TicketServedFace translate={translate} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
