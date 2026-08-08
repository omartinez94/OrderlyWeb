export interface StatItem {
  value: string;
  label: string;
  detail?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 4, className = "" }: StatsGridProps) {
  const colClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
        ? "grid-cols-1 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-4";

  return (
    <section
      aria-label="Key Performance Indicators"
      className={`border-border-subtle bg-surface-elevated/60 border-y py-12 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`grid gap-8 ${colClass}`}>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="group border-primary/30 hover:border-primary flex flex-col border-l-2 pl-4 transition-all duration-300 hover:translate-x-1 sm:pl-6"
            >
              <span className="text-primary font-mono text-3xl font-extrabold tracking-tight transition-transform group-hover:scale-105 sm:text-4xl">
                {stat.value}
              </span>
              <span className="font-display text-ink mt-1 text-sm font-bold">{stat.label}</span>
              {stat.detail && (
                <span className="text-ink-muted font-sans text-xs">{stat.detail}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
