/**
 * staff/api — slim wrapper around the Identity Service staff endpoints.
 *
 * Why a wrapper:
 *   - The feature code shouldn't import from `src/app/api/identity`
 *     directly; that path is reserved for the data layer. Feature
 *     code reaches the API through `features/<feature>/api.ts`,
 *     which keeps the boundary clear and makes future refactors
 *     (e.g. swapping RTK Query for fetch) cheap.
 *   - The wrapper re-exports the typed hooks verbatim so feature
 *     components don't lose TypeScript narrowing.
 */

export {
  useListStaffQuery,
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeactivateStaffMutation,
} from "../../app/api/identity";

export type { StaffMember } from "../../app/api/identity";
