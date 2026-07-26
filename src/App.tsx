import type { ReactNode } from 'react';
import { StatusPill, type OrderStatus } from './components/StatusPill/StatusPill';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { Header } from './components/Header/Header';
import {
  MOCK_CURRENT_USER,
  MOCK_NOTIFICATIONS,
  MOCK_RESTAURANTS,
} from './components/Header/mockData';
import { brandPalette, servicePalette, type PaletteEntry } from './lib/tokens';

/**
 * Orderly Design System — palette & component showcase.
 *
 * All styling is Tailwind utilities referencing the theme tokens in
 * src/index.css (via @theme inline). Light/dark theme switcher toggles
 * `data-theme` on <html>, which re-binds the CSS variables — the whole
 * page repaints with no JS re-render of colors.
 */

const ALL_STATUSES: OrderStatus[] = [
  'new',
  'acknowledged',
  'preparing',
  'plating',
  'ready',
  'served',
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold mb-6 text-ink tracking-tight">
        {title}
      </h2>
      <hr className="border-t border-border-subtle mb-6 border-0 h-px bg-border-subtle" />
      {children}
    </section>
  );
}

function Swatch({ entry }: { entry: PaletteEntry }) {
  return (
    <div
      className={[
        'p-5 rounded-xl min-h-[130px] flex flex-col justify-between gap-1',
        'transition-transform duration-150 hover:-translate-y-0.5',
        entry.twBg,
        entry.twText,
        entry.border ? 'border border-border-subtle' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="text-sm font-bold tracking-wide">{entry.name}</span>
      <span className="text-[0.7rem] font-mono opacity-85 leading-tight">
        light {entry.light}
      </span>
      <span className="text-[0.7rem] font-mono opacity-85 leading-tight">
        dark {entry.dark}
      </span>
    </div>
  );
}

function HeaderPreview({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-8 last:mb-0">
      <div className="text-xs font-mono text-ink-subtle uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="rounded-xl border border-border-subtle overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-surface text-ink font-sans antialiased py-12 px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex items-start justify-between gap-6 mb-4">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight m-0">
              Orderly Design System
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-ink-muted m-0 max-w-2xl leading-relaxed">
            Blue-teal primary, tangerine accent, sage-tinted surface, service
            gradient for status. Click the toggle in the corner to flip
            between light and dark.
          </p>
        </header>

        <Section title="App Header — the global top bar">
          <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
            The Header is consumed by all three zone layouts (admin,
            kitchen, restaurant). Six slots, fixed at the top, flat at
            rest, hairline Linen Edge bottom border. The ops badge appears
            on the floor and kitchen only — the One-Voice Rule still
            binds; Burnt Tangerine on the ops badge is a service hue
            carrying status, not decoration.
          </p>

          <HeaderPreview label="Admin zone — no ops badge, 3 notifications">
            <Header
              zone="admin"
              currentRestaurantId="r-001"
              restaurants={MOCK_RESTAURANTS}
              notifications={MOCK_NOTIFICATIONS}
              user={MOCK_CURRENT_USER}
            />
          </HeaderPreview>

          <HeaderPreview label="Restaurant zone — 3 in progress (neutral)">
            <Header
              zone="restaurant"
              currentRestaurantId="r-001"
              restaurants={MOCK_RESTAURANTS}
              notifications={MOCK_NOTIFICATIONS}
              opsCount={3}
              user={MOCK_CURRENT_USER}
            />
          </HeaderPreview>

          <HeaderPreview label="Restaurant zone — 7 in progress (Saffron Amber)">
            <Header
              zone="restaurant"
              currentRestaurantId="r-001"
              restaurants={MOCK_RESTAURANTS}
              notifications={MOCK_NOTIFICATIONS}
              opsCount={7}
              user={MOCK_CURRENT_USER}
            />
          </HeaderPreview>

          <HeaderPreview label="Kitchen zone — 12 in kitchen (Burnt Tangerine)">
            <Header
              zone="kitchen"
              currentRestaurantId="r-001"
              restaurants={MOCK_RESTAURANTS}
              notifications={MOCK_NOTIFICATIONS}
              opsCount={12}
              user={MOCK_CURRENT_USER}
            />
          </HeaderPreview>

          <HeaderPreview label="Single-restaurant user (1 restaurant) — switcher is a static label">
            <Header
              zone="restaurant"
              currentRestaurantId="r-001"
              restaurants={[{ id: 'r-001', name: 'Acme Bistro — Downtown', role: 'Owner' }]}
              notifications={MOCK_NOTIFICATIONS}
              opsCount={4}
              user={MOCK_CURRENT_USER}
            />
          </HeaderPreview>

          <HeaderPreview label="Multi-restaurant — 8 restaurants (typeahead kicks in at 6+)">
            <Header
              zone="restaurant"
              currentRestaurantId="r-004"
              restaurants={MOCK_RESTAURANTS}
              notifications={MOCK_NOTIFICATIONS}
              opsCount={2}
              user={MOCK_CURRENT_USER}
            />
          </HeaderPreview>

          <HeaderPreview label="Empty notifications — bell has no badge">
            <Header
              zone="restaurant"
              currentRestaurantId="r-001"
              restaurants={MOCK_RESTAURANTS}
              notifications={[]}
              opsCount={1}
              user={MOCK_CURRENT_USER}
            />
          </HeaderPreview>
        </Section>

        <Section title="Brand tokens">
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            {brandPalette.map((entry) => (
              <Swatch key={entry.name} entry={entry} />
            ))}
          </div>
        </Section>

        <Section title="Service hues (status / order flow)">
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
            {servicePalette.map((entry) => (
              <Swatch key={entry.name} entry={entry} />
            ))}
          </div>
          <div className="mt-5 grid gap-3">
            <div className="p-8 rounded-xl min-h-[100px] flex items-end text-white font-bold text-base bg-gradient-service-cool">
              <span className="drop-shadow">
                gradient-service-cool — deep → teal → aqua (received flow)
              </span>
            </div>
            <div className="p-8 rounded-xl min-h-[100px] flex items-end text-ink font-bold text-base bg-gradient-service-warm">
              <span>
                gradient-service-warm — surface → amber → tangerine (ready flow)
              </span>
            </div>
          </div>
        </Section>

        <Section title="Status pills (live component)">
          <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
            Each status maps to one of the service-hue tokens. The
            background is a 12% tint; the dot and text use the full color.
          </p>
          <div className="flex flex-wrap gap-2.5 items-center mb-3">
            {ALL_STATUSES.map((status) => (
              <StatusPill key={status} status={status} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5 items-center">
            {ALL_STATUSES.slice(0, 5).map((status) => (
              <StatusPill key={`${status}-nodot`} status={status} hideDot />
            ))}
          </div>
        </Section>

        <Section title="Components">
          <div className="flex flex-wrap gap-3 items-center mb-8">
            <button className="px-6 py-3 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary-hover transition-colors">
              Primary action
            </button>
            <button className="px-6 py-3 rounded-lg font-semibold text-sm bg-accent text-accent-foreground hover:bg-accent-hover transition-colors">
              Accent action
            </button>
            <button className="px-6 py-3 rounded-lg font-semibold text-sm bg-transparent border border-border-strong text-ink hover:bg-surface-elevated hover:border-primary hover:text-primary transition-colors">
              Outline
            </button>
            <button className="px-6 py-3 rounded-lg font-semibold text-sm bg-transparent text-ink-muted hover:bg-surface-elevated hover:text-ink transition-colors">
              Ghost
            </button>
          </div>

          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <div className="bg-surface-elevated border border-border-strong p-6 rounded-xl">
              <h3 className="text-primary text-lg font-bold m-0 mb-1">
                Order #1284
              </h3>
              <p className="text-ink-muted m-0 mb-4 text-sm leading-relaxed">
                Margherita Pizza, Caesar Salad, two Tiramisu. Table 7.
              </p>
              <div className="flex items-center justify-between gap-3">
                <StatusPill status="preparing" />
                <span className="text-ink-subtle text-xs font-mono">
                  4m elapsed
                </span>
              </div>
            </div>

            <div className="bg-surface-elevated border border-border-strong p-6 rounded-xl">
              <h3 className="text-primary text-lg font-bold m-0 mb-1">
                Order #1285
              </h3>
              <p className="text-ink-muted m-0 mb-4 text-sm leading-relaxed">
                Risotto ai Funghi, Bruschetta. Table 12.
              </p>
              <div className="flex items-center justify-between gap-3">
                <StatusPill status="ready" />
                <span className="text-ink-subtle text-xs font-mono">
                  8m elapsed
                </span>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Glass effects">
          <p className="text-ink-muted m-0 mb-6 max-w-2xl leading-relaxed">
            Glass on a single-tone background is invisible. The panel below
            uses the warm service gradient so you can see all four glass
            variants on top of it.
          </p>
          <div className="bg-gradient-service-warm p-10 rounded-2xl grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            <div className="glass p-6">
              <h3 className="text-ink font-bold m-0 mb-2">glass</h3>
              <p className="text-ink m-0 text-sm leading-relaxed opacity-85">
                Default frosted surface, 24px blur, light tint.
              </p>
            </div>
            <div className="glass-strong p-6">
              <h3 className="text-ink font-bold m-0 mb-2">glass-strong</h3>
              <p className="text-ink m-0 text-sm leading-relaxed opacity-85">
                Heavier 40px blur, more opacity. Modals, command palettes.
              </p>
            </div>
            <div className="glass-primary p-6">
              <h3 className="text-ink font-bold m-0 mb-2">glass-primary</h3>
              <p className="text-ink m-0 text-sm leading-relaxed opacity-85">
                Brand-tinted. Feature cards in the primary accent zone.
              </p>
            </div>
            <div className="glass-accent p-6">
              <h3 className="text-ink font-bold m-0 mb-2">glass-accent</h3>
              <p className="text-ink m-0 text-sm leading-relaxed opacity-85">
                Tangerine-tinted. Active states, hot offers, urgent alerts.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

export default App;
