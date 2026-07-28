/**
 * StaffDetail — `/site/admin/staff/:id`. Shows the staff member
 * read-only card plus a deactivate action and an inline edit form.
 *
 * Vercel `rendering-conditional-render` — empty / loading / error
 * states use ternaries, never `&&`.
 */

import { useState } from "react";
import { useParams } from "react-router";
import { useDeactivateStaffMutation, useGetStaffQuery } from "./api";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "../../components/ui/sonner";
import { StaffForm } from "./StaffForm";

export function StaffDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetStaffQuery(id, { skip: !id });
  const [deactivateStaff, { isLoading: isDeactivating }] = useDeactivateStaffMutation();
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <p className="text-ink-muted mx-auto max-w-2xl px-5 py-12 font-sans text-sm">
        Loading staff…
      </p>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-danger mx-auto max-w-2xl px-5 py-12 font-sans text-sm" role="alert">
        Could not load this staff member.
      </p>
    );
  }

  const onDeactivate = async (): Promise<void> => {
    try {
      await deactivateStaff(data.id).unwrap();
      toast.success("Staff member deactivated.");
    } catch (err) {
      const message =
        (err as { data?: { message?: string } }).data?.message ?? "Deactivation failed.";
      toast.error("Could not deactivate staff", { description: message });
    }
  };

  return (
    <div className="bg-surface text-ink min-h-[calc(100vh-64px)] font-sans antialiased">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-12">
        <header className="flex flex-col gap-2">
          <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">Admin zone</p>
          <h1 className="text-primary font-display text-3xl font-bold tracking-tight">
            {data.name}
          </h1>
          <p className="text-ink-muted font-sans text-sm leading-relaxed">{data.email}</p>
          <div className="flex flex-wrap gap-2">
            {data.roles.map((r) => (
              <Badge key={r} variant="secondary">
                {r}
              </Badge>
            ))}
            <Badge variant={data.active ? "default" : "outline"}>
              {data.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </header>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setEditing((current) => !current)}>
            {editing ? "Cancel edit" : "Edit"}
          </Button>
          {data.active && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDeactivate}
              disabled={isDeactivating}
            >
              {isDeactivating ? "Deactivating…" : "Deactivate"}
            </Button>
          )}
        </div>

        {editing ? <StaffForm initial={data} onSuccess={() => setEditing(false)} /> : null}
      </main>
    </div>
  );
}
