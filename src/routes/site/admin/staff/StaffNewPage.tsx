/**
 * StaffNewPage — `/site/admin/staff/new`. Renders the create form.
 */

import { StaffForm } from "../../../../features/staff/StaffForm";

export function StaffNewPage() {
  return (
    <div className="bg-surface text-ink min-h-[calc(100vh-64px)] font-sans antialiased">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-12">
        <header className="flex flex-col gap-2">
          <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">Admin zone</p>
          <h1 className="text-primary font-display text-3xl font-bold tracking-tight">
            Invite staff member
          </h1>
          <p className="text-ink-muted font-sans text-sm leading-relaxed">
            Send an invitation with role and restaurant assignment. The new row appears in the staff
            list on save.
          </p>
        </header>
        <StaffForm />
      </main>
    </div>
  );
}
