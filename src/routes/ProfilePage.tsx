/**
 * ProfilePage — placeholder until the auth plan wires the real
 * profile view. The route exists so `RequireAuth` has a target once
 * authentication is required to view it.
 *
 * Body is intentionally minimal: a heading and a back-to-home link.
 * The auth plan replaces this with the live profile (user info,
 * role, restaurant).
 */

import { Link } from "react-router";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Avatar,
  AvatarFallback,
  Separator,
  Badge,
} from "../components/ui";
import { PATH } from "../router/pathNames";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { selectUser, selectRoles, selectPermissions } from "../app/session/sessionSelectors";
import { selectAccessibleRestaurants } from "../app/session/headerSelectors";
import { clearCredentials } from "../app/session/sessionSlice";

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const roles = useAppSelector(selectRoles);
  const permissions = useAppSelector(selectPermissions);
  const restaurants = useAppSelector(selectAccessibleRestaurants);

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  if (!user) {
    return null;
  }

  const activeRestaurant = restaurants[0]?.name || "System Global";

  return (
    <main className="bg-surface text-ink flex min-h-screen items-center justify-center p-4 font-sans antialiased">
      <Card className="border-border-subtle bg-surface-elevated w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-row items-center gap-4 pb-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-surface text-lg">
              {user.initials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle className="text-ink font-display text-2xl">{user.name}</CardTitle>
            <CardDescription className="text-ink-subtle">{user.email}</CardDescription>
          </div>
        </CardHeader>

        <Separator className="bg-border-subtle" />

        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <h3 className="text-ink-subtle text-sm font-medium tracking-widest uppercase">
              Assigned Roles
            </h3>
            <div className="flex flex-wrap gap-2">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <Badge key={role} variant="secondary" className="bg-surface text-ink">
                    {role}
                  </Badge>
                ))
              ) : (
                <span className="text-ink-muted text-sm">No roles</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-ink-subtle text-sm font-medium tracking-widest uppercase">
              Active Context
            </h3>
            <p className="text-ink text-sm font-medium">{activeRestaurant}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-ink-subtle text-sm font-medium tracking-widest uppercase">
              Permissions
            </h3>
            <div className="flex flex-wrap gap-2">
              {permissions.length > 0 ? (
                permissions.map((perm) => (
                  <Badge
                    key={perm}
                    variant="outline"
                    className="border-border-subtle text-ink text-xs"
                  >
                    {perm}
                  </Badge>
                ))
              ) : (
                <span className="text-ink-muted text-sm">No specific permissions</span>
              )}
            </div>
          </div>
        </CardContent>

        <Separator className="bg-border-subtle" />

        <CardFooter className="flex justify-between pt-6">
          <Button asChild variant="outline" className="border-border-strong">
            <Link to={PATH.HOME}>Back to home</Link>
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
