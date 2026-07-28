/**
 * StaffForm — the create / edit form used by `StaffNewPage` and
 * `StaffDetailPage`.
 *
 * Validation: required name + email; at least one role; at least
 * one restaurant. Errors surface inline via `aria-invalid` + a
 * `<p role="alert">` line per field. The submit button is disabled
 * while the mutation is in flight; on success, `onCreated` fires.
 */

import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { useCreateStaffMutation, useUpdateStaffMutation } from "./api";
import { useRestaurantContext } from "../../components/RestaurantContext/useRestaurantContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "../../components/ui/sonner";
import { PATH } from "../../router/pathNames";
import type { Role } from "../../types/auth";
import type { StaffMember } from "./api";
import { useGrantableRoles } from "./useGrantableRoles";

const ALL_RESTAURANTS = [
  { id: "r-001", label: "Acme Bistro — Downtown" },
  { id: "r-002", label: "Acme Bistro — Marina" },
];

export interface StaffFormProps {
  /** When provided, the form runs in edit mode (PATCH instead of POST). */
  initial?: StaffMember;
  onSuccess?: (member: StaffMember) => void;
}

export function StaffForm({ initial, onSuccess }: StaffFormProps) {
  const navigate = useNavigate();
  const contextRestaurantId = useRestaurantContext().restaurantId;
  const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
  const grantableRoles = useGrantableRoles();
  const canGrantAny = grantableRoles.length > 0;

  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [roles, setRoles] = useState<readonly Role[]>(initial?.roles ?? []);
  const [restaurantIds, setRestaurantIds] = useState<readonly string[]>(
    initial?.restaurantIds ?? (contextRestaurantId ? [contextRestaurantId] : []),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSubmitting = isCreating || isUpdating;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!email.trim() || !email.includes("@")) next.email = "Valid email is required.";
    if (roles.length === 0) next.roles = "Pick at least one role.";
    if (restaurantIds.length === 0) next.restaurantIds = "Assign at least one restaurant.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const toggleRole = (role: Role) => {
    setRoles((current) =>
      current.includes(role) ? current.filter((r) => r !== role) : [...current, role],
    );
  };
  const toggleRestaurant = (id: string) => {
    setRestaurantIds((current) =>
      current.includes(id) ? current.filter((r) => r !== id) : [...current, id],
    );
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (initial) {
        const updated = await updateStaff({
          id: initial.id,
          name: name.trim(),
          email: email.trim(),
          roles,
          restaurantIds,
          active: initial.active,
        }).unwrap();
        toast.success("Staff member updated.");
        onSuccess?.(updated);
        navigate(PATH.ADMIN_STAFF_DETAIL.replace(":id", initial.id));
      } else {
        const created = await createStaff({
          name: name.trim(),
          email: email.trim(),
          roles,
          restaurantIds,
        }).unwrap();
        toast.success("Staff member invited.");
        onSuccess?.(created);
        navigate(PATH.ADMIN_STAFF);
      }
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message ?? "Save failed.";
      toast.error("Could not save staff", { description: message });
    }
  };

  return (
    <form className="grid gap-6" onSubmit={onSubmit} noValidate>
      <div className="grid gap-2">
        <Label htmlFor="staff-name">Full name</Label>
        <Input
          id="staff-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
          required
        />
        {errors.name && (
          <p role="alert" className="text-danger font-sans text-xs">
            {errors.name}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="staff-email">Work email</Label>
        <Input
          id="staff-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
          required
        />
        {errors.email && (
          <p role="alert" className="text-danger font-sans text-xs">
            {errors.email}
          </p>
        )}
      </div>

      <fieldset className="grid gap-2" aria-invalid={Boolean(errors.roles)}>
        <legend className="text-ink font-sans text-sm font-medium">Roles</legend>
        {!canGrantAny ? (
          <p className="text-ink-muted font-sans text-xs" role="note">
            Your role does not include grant authority. Only SuperAdmin and RestaurantAdmin can
            manage staff.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {grantableRoles.map((role) => (
              <label key={role} className="flex items-center gap-2 font-sans text-sm">
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                {role}
              </label>
            ))}
          </div>
        )}
        {errors.roles && (
          <p role="alert" className="text-danger font-sans text-xs">
            {errors.roles}
          </p>
        )}
      </fieldset>

      <fieldset className="grid gap-2" aria-invalid={Boolean(errors.restaurantIds)}>
        <legend className="text-ink font-sans text-sm font-medium">Restaurants</legend>
        <div className="flex flex-wrap gap-2">
          {ALL_RESTAURANTS.map((r) => (
            <label key={r.id} className="flex items-center gap-2 font-sans text-sm">
              <input
                type="checkbox"
                checked={restaurantIds.includes(r.id)}
                onChange={() => toggleRestaurant(r.id)}
              />
              {r.label}
            </label>
          ))}
        </div>
        {errors.restaurantIds && (
          <p role="alert" className="text-danger font-sans text-xs">
            {errors.restaurantIds}
          </p>
        )}
      </fieldset>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : initial ? "Save changes" : "Invite"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(PATH.ADMIN_STAFF)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
