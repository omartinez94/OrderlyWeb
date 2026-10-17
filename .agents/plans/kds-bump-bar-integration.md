# KDS Bump Bar & Virtual Hardware Simulator — Implementation Plan

> Scope: Design and implement physical Bump Bar (USB HID) hardware support, a standalone popup Virtual Bump Bar (KB9000 replica) for zero-hardware deployments, keyboard-driven navigation, audio feedback, and station-specific key mapping for the Kitchen Display System (KDS) in `OrderlyWeb`.

---

## Status

> **Plan version**: `v1.0` (2026-10-11) — `MINOR` increments after each phase completion; `MAJOR` is reserved for breaking restructures of the plan itself.
> **Current state**: ⏸ Not started

| Phase | Name | Status |
|:-----:|---|:-----:|
| 1 | Unified Input Engine (`useBumpBar`) & `BroadcastChannel` Protocol | ⏸ Pending |
| 2 | Standalone Virtual Bump Bar Popup (`/site/kitchen/virtual-bumpbar`) | 🔒 Blocked |
| 3 | Active Ticket Grid Selection & Visual Hotkey Indicators | 🔒 Blocked |
| 4 | Audio Feedback Engine (Web Audio API Synthesizer) | 🔒 Blocked |
| 5 | Station Hardware Profiles, Calibration UI & E2E Verification | 🔒 Blocked |

> **Legend**: ✅ Done · 🚧 In progress · ⏸ Pending · 🔒 Blocked

> **Commit messages**: Conventional Commits (`feat(kds):`, `docs(kds):`, `chore(kds):`, `test(kds):`, `fix(kds):`). Short subject, ≤50 chars, imperative mood, no trailing period.

> **Update rule**: **on every phase completion, the plan MUST be updated in the same commit as the phase work.** The plan is the source of truth for what was decided and what shipped; a phase that ships without a plan update is a phase that drifted.

---

## 0. Skill & documentation conventions

### 0.1 Skill mandate
> **All implementation work on this plan MUST follow `OrderlyWeb/AGENTS.md` and `DESIGN.md`.** New UI components must use Radix UI primitives from `src/components/ui/`, Tailwind CSS tokens (`src/index.css`), Sonner toasts, and Vitest/Playwright tests.

### 0.2 Code-quality guard rails
- **TypeScript strict mode**: No `any` outside generated DTO shims; all event messages and keymap dictionaries strictly typed.
- **Linters and formatters**: Must pass `pnpm lint` (`oxlint`) and `pnpm format:check` (`oxfmt`).
- **Test coverage**: Every hook, channel helper, and synthesizer module must have a colocated `*.test.ts(x)` suite run with `pnpm test:run`.
- **Zod schemas**: Hardware calibration payloads and `BroadcastChannel` inter-window messages must be validated using Zod.
- **Component primitives**: No raw buttons or ad-hoc style tags—use `Button`, `Dialog`, `Badge` from `src/components/ui/`.

---

## 1. Context

Commercial kitchens operate in hot, high-speed, and greasy environments where touchscreens quickly become dirty, unhygienic, or unresponsive to cooks wearing gloves.

### 1.1 Physical Hardware: Logic Controls KB9000
Industry-standard bump bars (Logic Controls / Bematech KB9000, MicroTouch) are **programmable USB HID keyboards**. Research into factory firmware and Epson TrueOrder / Oracle Micros KDS setups confirms:
- **Scan Code Mapping**: Physical buttons emit standard USB keyboard scan codes.
- **Factory / Default Key Codes**:
  - `BUMP`: Dispatches `Control` or `Enter` (`code: Enter`, `code: ControlLeft`).
  - `RECALL`: Dispatches `NumpadSubtract` (`-`), `F12`, or `KeyR`.
  - `SUMMARY / COUNTS`: Dispatches `Space` or `KeyS`.
  - `PAGE / SCROLL`: Dispatches `ArrowDown` / `ArrowUp` or `PageDown` / `PageUp`.
  - `SLOT SELECTION`: Dispatches `1` through `8` (`code: Digit1` .. `Digit8`).

### 1.2 Zero-Hardware Constraint: Virtual Bump Bar Window
Many restaurant operators cannot immediately justify $250–$400 per kitchen station for physical bump bars. A software replica that opens as a dedicated, non-resizable auxiliary window (`width=840,height=220`) on a secondary touch screen, tablet, or monitor corner enables operators to adopt identical bump bar workflows before investing in physical hardware.

---

## 2. Goal

Deliver a dual-channel hardware input architecture in `OrderlyWeb`:
- **Physical USB HID Input**: Seamlessly captures physical bump bar inputs (KB9000 / 10-key numpad).
- **Standalone Virtual Bump Bar Window**: A dedicated, non-resizable popup (`width=840,height=220`) replicating physical KB9000 membrane buttons.
- **Unified Protocol (`BroadcastChannel`)**: The KDS main window handles both real USB keyboard events and virtual window clicks through the same action pipeline.
- **Visual & Audio Feedback**: Slot indicators (`#1`..`#8`), hotkey badges, and low-latency synthesized audio tones (<5ms).
- **Station Hardware Settings**: Calibration tool and preset switcher in `/site/kitchen/settings`.

---

## 3. Out of scope

- Proprietary legacy RS-232 serial communication requiring native OS drivers.
- Physical ESC/POS printer firmware communication (scoped under the Kitchen Printer plan).
- Modifying backend `Kitchen.API` ticket state machine (endpoints are already live).

---

## 4. Tech decisions

| Decision | Choice | Reason |
| :--- | :--- | :--- |
| Inter-Window Communication | `BroadcastChannel("orderly-kds-bumpbar")` | Modern, decoupled, zero-latency Web API; survives main window refresh, requires no fragile `window.opener` references. |
| Popup Window Mode | `window.open(..., "width=840,height=220,resizable=no")` | Creates an isolated, non-resizable floating hardware controller suitable for touch or mouse. |
| Input Unification | Unified Action Dispatcher | Real USB `KeyboardEvent` and virtual popup clicks resolve to identical `BumpBarAction` payloads. |
| Audio Synthesis | Web Audio API (`AudioContext` oscillator) | Zero audio file downloads; instant response (<5ms) for chimes and error buzzers. |
| Configuration | LocalStorage + Station Presets | Preserves custom key mappings per terminal while supporting KB9000 and Numpad defaults. |

---

## 5. Folder layout

```
OrderlyWeb/src/
├── features/kitchen/
│   ├── hardware/
│   │   ├── useBumpBar.ts              # Unified event capture (Keyboard + BroadcastChannel)
│   │   ├── bumpBarProfiles.ts        # Presets (KB9000 default, Numpad, Custom)
│   │   ├── bumpBarChannel.ts         # BroadcastChannel message protocol & publisher
│   │   ├── audioFeedback.ts          # Web Audio API synthesizer
│   │   └── types.ts                  # BumpBarAction enum, KeyMap bindings, Message schemas
│   └── components/
│       ├── KdsTicketGrid.tsx         # Slot-based grid with focused slot state
│       ├── TicketCard.tsx            # Slot badges and hotkey indicators
│       ├── VirtualBumpBarPad.tsx     # KB9000 physical layout replica (24-key grid)
│       └── BumpBarSettingsModal.tsx  # Key test/calibration & preset selector
└── routes/site/kitchen/
    ├── VirtualBumpBarPage.tsx        # Standalone popup page (`/site/kitchen/virtual-bumpbar`)
    ├── KitchenDashboardPage.tsx      # KDS main view with bump bar launcher
    └── KitchenSettingsPage.tsx       # Station hardware settings
```

---

## 6. Specification

### 6.1 Hardware Scan Codes & KB9000 Presets

```typescript
export interface BumpBarKeyBinding {
  key: string;       // e.g. "Enter", "Control", "1"
  code: string;      // e.g. "Enter", "ControlLeft", "Digit1", "NumpadSubtract"
  action: BumpBarAction;
  label: string;     // Button legend (e.g. "BUMP", "RECALL")
}
```

Verified KB9000 Default Profile:
- `SLOT_1` .. `SLOT_8`: Key `1` .. `8` (`code: Digit1` .. `Digit8`)
- `BUMP_SELECTED`: Key `Enter` or `Control` (`code: Enter`, `code: ControlLeft`)
- `RECALL_LAST`: Key `-` (`code: NumpadSubtract` or `KeyR`)
- `SUMMARY_COUNTS`: Key ` ` (`code: Space` or `KeyS`)
- `NEXT_PAGE` / `PREV_PAGE`: `ArrowDown` / `ArrowUp` (`code: ArrowDown`, `code: ArrowUp`)
- `ITEM_PREP_TOGGLE`: Key `0` or `I` (`code: Digit0`, `code: KeyI`)
- `HOLD_ORDER`: Key `H` (`code: KeyH`)

### 6.2 Standalone Popup Launcher & Inter-Window Channel

Launcher in KDS main screen:
```typescript
export function openVirtualBumpBar(): Window | null {
  const width = 840;
  const height = 220;
  const left = window.screen.width - width - 20;
  const top = window.screen.height - height - 60;
  
  return window.open(
    "/site/kitchen/virtual-bumpbar",
    "OrderlyVirtualBumpBar",
    `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,status=no,location=no,toolbar=no`
  );
}
```

BroadcastChannel message contract (`bumpBarChannel.ts`):
```typescript
export interface BumpBarChannelMessage {
  type: "BUMP_ACTION";
  action: BumpBarAction;
  source: "virtual-popup" | "hardware-bridge";
  timestamp: number;
}
```

### 6.3 Unified Capture Engine (`useBumpBar`)

```typescript
export function useBumpBar(handler: (action: BumpBarAction) => void) {
  useEffect(() => {
    // 1. Listen for real physical USB keystrokes
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const action = resolveKeyToAction(event);
      if (action) {
        event.preventDefault();
        handler(action);
      }
    };

    // 2. Listen for Virtual Bump Bar popup broadcasts
    const channel = new BroadcastChannel("orderly-kds-bumpbar");
    channel.onmessage = (event: MessageEvent<BumpBarChannelMessage>) => {
      if (event.data?.type === "BUMP_ACTION") {
        handler(event.data.action);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      channel.close();
    };
  }, [handler]);
}
```

### 6.4 Low-Latency Audio Feedback (`audioFeedback.ts`)

- **Bump Success Tone:** Dual sine wave chime (800 Hz → 1200 Hz, 120ms duration).
- **Invalid Action / Error Buzzer:** Sawtooth wave tone (200 Hz, 250ms duration).
- **New Ticket Arrival Alert:** Triple melodic pulse (523 Hz, 659 Hz, 784 Hz - C5/E5/G5 chord).

---

## 7. Cross-Repository Communication & Integration Points

- **`Kitchen.API` Carter endpoints**: Dispatches bumps and recalls via RTK Query (`src/app/api/kitchen.ts`):
  - `POST /v1/kitchen/tickets/{id}/bump`
  - `POST /v1/kitchen/tickets/{id}/recall`
- **SignalR Real-Time Stream**: Intercepts `OrderReceived` events on `/hubs/kitchen` to trigger audible new-order arrival chimes.

---

## 8. Security guardrails

> [!CAUTION]
> Hardware event interception must never capture or log sensitive authentication credentials or bypass modal authorization checks.

| Risk | Mitigation |
|---|---|
| Message spoofing / malformed payloads | Messages validated via strict Zod schema (`BumpBarChannelMessageSchema`) before executing actions. |
| Modal trapping / stuck focus | Listener checks `document.activeElement` for editable inputs (`input`, `textarea`) and yields priority. |
| Accidental double-bumping | Hardware debounce window (300ms) enforced on all bump and recall actions. |

---

## 9. Development Phases

### Phase overview

| Phase | Name | Scope | Goal |
|:---:|---|---|---|
| **1** | Input Engine & Protocol | `hardware/` | Unified `useBumpBar` hook with `KeyboardEvent` capture and `BroadcastChannel` listener. |
| **2** | Standalone Virtual Bump Bar Popup | `routes/site/kitchen/VirtualBumpBarPage.tsx` | Fixed-size (`840x220`), non-resizable KB9000 physical replica UI. |
| **3** | Ticket Grid & Hotkey Badges | `components/` | Visual slot selection, keyboard navigation, and hotkey labels on `TicketCard.tsx`. |
| **4** | Audio Feedback Engine | `audioFeedback.ts` | Web Audio synthesis for bumps, recalls, and new tickets. |
| **5** | Station Settings & Verification | `KitchenSettingsPage.tsx` + E2E | Key calibration UI, presets, and Playwright simulation. |

---

### Phase 1 — Unified Input Engine (`useBumpBar`) & `BroadcastChannel` Protocol

**Goal**: Deliver typed input resolution engine that seamlessly aggregates physical USB keypresses and inter-window virtual bump bar events.

**Status**: ⏸ Pending

**Deliverables**:
- [ ] Define `BumpBarAction` union, `BumpBarProfile`, and `BumpBarChannelMessage` Zod schema in `types.ts`.
- [ ] Implement `bumpBarProfiles.ts` with Logic Controls KB9000 (Enter/Ctrl, NumpadSubtract, 1-8) and Numpad presets.
- [ ] Implement `bumpBarChannel.ts` with `publishBumpAction` and `subscribeBumpAction` helpers.
- [ ] Implement `useBumpBar` hook combining window `keydown` capture with `BroadcastChannel`.
- [ ] Add `kds:wakeLock.deniedBanner` and `kds:wakeLock.enabled` / `kds:wakeLock.disabled` i18n keys to `en/kds.json` and `es/kds.json`.
- [ ] Vitest unit tests verifying key resolution, debounce, and channel message handling.

**Exit criteria**: `pnpm test src/features/kitchen/hardware/useBumpBar.test.ts` passes with 100% assertion coverage.

---

### Phase 2 — Standalone Virtual Bump Bar Popup (`/site/kitchen/virtual-bumpbar`)

**Goal**: Build a standalone, non-resizable popup route replicating the physical Logic Controls KB9000 membrane bar.

**Status**: 🔒 Blocked

**Deliverables**:
- [ ] Create route `/site/kitchen/virtual-bumpbar` in `src/router/zones/kitchen.tsx`.
- [ ] Implement `VirtualBumpBarPad.tsx` rendering the physical 24-key tactile layout (slots 1–8, Bump, Recall, Next, Prev, Summary, Hold).
- [ ] Add "Open Virtual Bump Bar" launcher button to `KitchenDashboardPage.tsx` opening at `840x220` (`resizable=no`).
- [ ] Connect clicks/touch on virtual buttons to `publishBumpAction` over `BroadcastChannel`.

**Exit criteria**: Clicking "BUMP" in the popup window triggers the bump handler in the main KDS window via `BroadcastChannel`.

---

### Phase 3 — Active Ticket Grid Selection, Hotkey Badges & Board Pagination

**Goal**: Connect keyboard actions to ticket navigation, slot focusing, API bump dispatching, and multi-page board scrolling.

**Status**: 🔒 Blocked

**Deliverables**:
- [ ] Implement `KdsTicketGrid.tsx` with focused slot state (`0` to `7`) and slot number badges (`#1` to `#8`).
- [ ] Implement page state: max 8 tickets per page; `NEXT_PAGE` / `PREV_PAGE` bump bar actions advance the page. Monospace page indicator (e.g. `Page 1 / 3`) in the KDS header.
- [ ] Update `TicketCard.tsx` with hotkey action indicators (`[ENTER: Bump]`, `[R: Recall]`).
- [ ] Connect `BUMP_SELECTED` and `RECALL_LAST` to `useBumpTicketMutation` / `useRecallTicketMutation`.
- [ ] Arrow and numeric key navigation for slot shifting within current page.
- [ ] Integrate `useElapsedTimer` from `src/hooks/useElapsedTimer.ts` for ticket elapsed time display.

**Exit criteria**: Pressing `1` selects slot 1; pressing `Enter` or clicking Virtual Bump Bar triggers bump mutation against the focused ticket. With 9+ tickets, `PageDown` advances to the second page showing the next 8 slots.

---

### Phase 4 — Audio Feedback Engine (Web Audio API Synthesizer)

**Goal**: Deliver zero-asset, low-latency audio feedback via Web Audio API.

**Status**: 🔒 Blocked

**Deliverables**:
- [ ] Implement `audioFeedback.ts` synthesizing chime, alert, and error waveforms.
- [ ] Wire audio feedback into bump success, bump rejection, and incoming SignalR `OrderReceived` events.
- [ ] Provide volume control and mute toggle with browser autoplay unlock.
- [ ] Vitest component tests verifying oscillator lifecycle.

**Exit criteria**: Triggering bump emits dual-tone chime without network requests for `.wav`/`.mp3` files.

---

### Phase 5 — Station Hardware Profiles, Calibration UI & E2E Verification

**Goal**: Provide station-level key testing, preset selection, and end-to-end verification.

**Status**: 🔒 Blocked

**Deliverables**:
- [ ] Add Hardware Configuration section in `KitchenSettingsPage.tsx`.
- [ ] Implement interactive "Bump Bar Key Test" widget that highlights keys when pressed on physical hardware or virtual bar.
- [ ] Persist settings in `localStorage` with fallback to default profile.
- [ ] Playwright test simulating physical bump bar input sequences and virtual popup interaction.
- [ ] Run full test suite: `pnpm ui:check`.

**Exit criteria**: Playwright tests pass; `pnpm ui:check` exits with code 0.

---

## 10. Technical considerations

### 10.1 Cross-cutting
- **Browser Popup Blockers**: Browsers block `window.open` unless triggered by a direct user gesture (e.g. clicking the "Open Virtual Bump Bar" button in the KDS header). The launcher must be bound to a direct click event.
- **Inter-Window Lifecycle**: `BroadcastChannel` automatically handles windows opening, closing, or reloading without leaving stale listeners or memory leaks.
- **Screen WakeLock Permission Denial**: When the kiosk WakeLock toggle is activated, wrap `navigator.wakeLock.request("screen")` in a try/catch. If denied (power-save mode, user policy, or `NotAllowedError`), display a non-intrusive amber banner below the KDS header: `t("kds:wakeLock.deniedBanner")` — e.g. "Screen lock prevention unavailable — display may sleep." Degrade silently; do not block any ticket actions.
- **KDS Board Pagination**: When active tickets exceed 8 slots (the bump bar's physical slot limit), paginate the kanban grid. Each "page" shows up to 8 tickets. The existing `NEXT_PAGE` / `PREV_PAGE` bump bar actions drive page navigation. Visual page indicator (e.g. "Page 2 / 3") must be rendered in monospace font. Keyboard shortcut: `PageDown` / `PageUp`.
- **Shared `useElapsedTimer`**: The progressive elapsed timer on ticket cards MUST import `useElapsedTimer` from `src/hooks/useElapsedTimer.ts` (created in Phase 0 exit). Do NOT define a local copy — Phase 3 waitlist timers use the same hook.

---

## Changelog

### v1.1 (2026-10-17) — Gap Analysis Incorporation
- Added Screen WakeLock permission denial UX: amber degradation banner, silent fallback.
- Added KDS board pagination: max 8 slots/page, `NEXT_PAGE`/`PREV_PAGE` bump actions drive page navigation.
- Documented `useElapsedTimer` must be imported from shared `src/hooks/useElapsedTimer.ts`.
- Added WakeLock i18n keys to Phase 1 deliverables.

### v1.0 (2026-10-11) — initial draft
- Created plan conforming to `OrderlyWeb/.agents/plans/_template.md` with 5 development phases.
- Specified USB HID capture, standalone Virtual Bump Bar popup (`840x220`), `BroadcastChannel` protocol, and Web Audio API synthesis.
