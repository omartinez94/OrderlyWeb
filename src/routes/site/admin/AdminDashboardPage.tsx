/**
 * AdminDashboardPage — `/site/admin`.
 *
 * Full administrative dashboard composing:
 * - KPI tiles: brands under management, restaurants, staff, and audit entries.
 * - Brands under management quick cards with drilldown.
 * - Restaurants needing attention (inactive / archived).
 * - Recent activity audit timeline (limit=5).
 * - Pending invitations summary.
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  Building2,
  UtensilsCrossed,
  Users,
  History,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { ResourceHeader, StatusBadge } from "../../../components/Admin";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "../../../components/ui";
import {
  useListBrandsQuery,
  useGetRestaurantsQuery,
  useListAuditQuery,
} from "../../../app/api/catalog";
import { useListStaffQuery } from "../../../app/api/identity";
import { EntityAuditLog } from "../../../features/audit";
import { PATH } from "../../../router/pathNames";

export function AdminDashboardPage() {
  const { t } = useTranslation("admin");

  const { data: brands = [], isLoading: isBrandsLoading } = useListBrandsQuery();
  const { data: restaurants = [], isLoading: isRestaurantsLoading } = useGetRestaurantsQuery();
  const { data: auditEntries = [], isLoading: isAuditLoading } = useListAuditQuery({});
  const { data: staff = [], isLoading: isStaffLoading } = useListStaffQuery({
    restaurantId: "r-001",
  });

  const activeBrandsCount = useMemo(() => brands.filter((b) => b.active).length, [brands]);
  const activeRestaurantsCount = useMemo(
    () => restaurants.filter((r) => r.active).length,
    [restaurants],
  );
  const attentionRestaurants = useMemo(() => restaurants.filter((r) => !r.active), [restaurants]);
  const pendingStaffCount = useMemo(() => staff.filter((s) => !s.active).length, [staff]);

  const stats = [
    {
      label: t("dashboard.stats.brands"),
      value: isBrandsLoading ? "…" : String(brands.length),
      detail: `${activeBrandsCount} active`,
      icon: Building2,
      to: PATH.ADMIN_BRANDS,
    },
    {
      label: t("dashboard.stats.restaurants"),
      value: isRestaurantsLoading ? "…" : String(restaurants.length),
      detail: `${activeRestaurantsCount} active`,
      icon: UtensilsCrossed,
      to: PATH.ADMIN_RESTAURANTS,
    },
    {
      label: t("dashboard.stats.staff"),
      value: isStaffLoading ? "…" : String(staff.length),
      detail: `${pendingStaffCount} pending`,
      icon: Users,
      to: PATH.ADMIN_STAFF,
    },
    {
      label: t("dashboard.stats.audit"),
      value: isAuditLoading ? "…" : String(auditEntries.length),
      detail: "recent records",
      icon: History,
      to: PATH.ADMIN_AUDIT,
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-6">
      <ResourceHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />

      {/* KPI Tiles */}
      <section
        aria-label="Key Performance Indicators"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.to}
              className="focus-visible:ring-ring block rounded-lg focus-visible:ring-2 focus-visible:outline-none"
            >
              <Card className="hover:border-primary/50 p-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-ink-subtle text-xs font-medium">{stat.label}</span>
                    <span className="text-primary font-mono text-3xl font-extrabold tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-ink-muted text-[11px]">{stat.detail}</span>
                  </div>
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
                    <Icon className="size-5" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </section>

      {/* Main Grid: Brands & Attention Restaurants on left, Activity & Invitations on right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (2 spans) */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* Brands Under Management */}
          <Card className="p-6">
            <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
              <CardTitle className="font-display text-ink text-base font-bold">
                {t("dashboard.brandsUnderManagement")}
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
                <Link to={PATH.ADMIN_BRANDS}>
                  {t("dashboard.viewAll")}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {brands.length === 0 ? (
                <p className="text-ink-subtle text-xs">{t("brands.empty")}</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {brands.slice(0, 4).map((brand) => (
                    <Link
                      key={brand.id}
                      to={`/site/admin/brands/${brand.id}`}
                      className="border-border-subtle hover:border-primary/50 flex flex-col justify-between rounded-lg border p-4 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-ink font-sans text-sm font-bold">{brand.name}</p>
                          <p className="text-ink-subtle font-mono text-xs">{brand.slug}</p>
                        </div>
                        <StatusBadge status={brand.active} />
                      </div>
                      <div className="border-border-subtle/50 text-ink-subtle mt-3 flex items-center justify-between border-t pt-2 text-xs">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {brand.cuisineType}
                        </Badge>
                        <span className="text-primary flex items-center gap-1 text-[11px]">
                          Overview <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Restaurants Needing Attention */}
          <Card className="p-6">
            <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-accent size-4" />
                <CardTitle className="font-display text-ink text-base font-bold">
                  {t("dashboard.restaurantsAttention")}
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
                <Link to={PATH.ADMIN_RESTAURANTS}>
                  {t("dashboard.viewAll")}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {attentionRestaurants.length === 0 ? (
                <div className="border-border-subtle/50 bg-surface/50 rounded-lg border p-4 text-center">
                  <p className="text-ink-subtle text-xs">{t("dashboard.noAttentionNeeded")}</p>
                </div>
              ) : (
                <div className="divide-border-subtle flex flex-col divide-y">
                  {attentionRestaurants.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <Link
                          to={`/site/admin/restaurants/${r.id}`}
                          className="text-ink hover:text-primary font-sans text-sm font-semibold transition-colors"
                        >
                          {r.name}
                        </Link>
                        <p className="text-ink-subtle text-xs">
                          {r.city}, {r.country} · {r.cuisine}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={r.active} />
                        <Button variant="outline" size="sm" asChild className="size-8 p-0">
                          <Link
                            to={`/site/admin/restaurants/${r.id}/settings`}
                            aria-label={`Configure ${r.name}`}
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Recent Activity & Pending Invitations */}
        <div className="flex flex-col gap-8">
          {/* Pending Invitations */}
          <Card className="p-6">
            <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
              <CardTitle className="font-display text-ink text-base font-bold">
                {t("dashboard.pendingInvitations")}
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
                <Link to={PATH.ADMIN_STAFF}>
                  {t("dashboard.viewAll")}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {pendingStaffCount === 0 ? (
                <p className="text-ink-subtle text-xs">No pending member invitations.</p>
              ) : (
                <div className="divide-border-subtle flex flex-col divide-y">
                  {staff
                    .filter((s) => !s.active)
                    .slice(0, 3)
                    .map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                      >
                        <div>
                          <p className="text-ink font-sans text-xs font-semibold">{member.name}</p>
                          <p className="text-ink-subtle text-[11px]">{member.email}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          Pending
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Audit Timeline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-ink font-display text-sm font-bold">
                {t("dashboard.recentActivity")}
              </h2>
              <Link
                to={PATH.ADMIN_AUDIT}
                className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
              >
                {t("dashboard.viewAll")}
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <EntityAuditLog limit={5} showEntityBadge />
          </div>
        </div>
      </div>
    </div>
  );
}
