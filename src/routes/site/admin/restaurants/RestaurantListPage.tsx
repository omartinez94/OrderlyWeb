/**
 * RestaurantListPage — `/site/admin/restaurants`.
 * Full administrative table of all platform restaurants.
 * Provides search filtering, status filtering, and creation link.
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import { useGetRestaurantsQuery } from "../../../../app/api/catalog";
import { ResourceHeader } from "../../../../components/Admin";
import {
  Card,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
  Button,
} from "../../../../components/ui";
import { useRestaurantFilters } from "../../../../features/restaurant";
import { PATH } from "../../../../router/pathNames";

export function RestaurantListPage() {
  const { t } = useTranslation("admin");
  const { query, status, setQuery, setStatus } = useRestaurantFilters();

  const { data: restaurants = [], isLoading, isError } = useGetRestaurantsQuery();

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCity = r.city.toLowerCase().includes(q);
        const matchesCuisine = r.cuisine.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesCuisine) return false;
      }
      if (status) {
        if (status === "active" && !r.active) return false;
        if (status === "inactive" && r.active) return false;
      }
      return true;
    });
  }, [restaurants, query, status]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <ResourceHeader
        breadcrumbs={[{ label: "Admin", to: PATH.ADMIN }, { label: t("restaurants.title") }]}
        title={t("restaurants.title")}
        subtitle={
          filtered.length === 1
            ? t("restaurants.subtitle_one", { count: 1 })
            : t("restaurants.subtitle_other", { count: filtered.length })
        }
        actions={
          <Button asChild className="gap-2">
            <Link to={PATH.ADMIN_RESTAURANT_NEW}>
              <Plus className="size-4" />
              {t("restaurants.new")}
            </Link>
          </Button>
        }
      />

      {/* Filter toolbar */}
      <Card className="flex flex-wrap items-center gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-search" className="text-ink-muted text-xs font-medium">
            Search
          </label>
          <Input
            id="filter-search"
            type="text"
            placeholder="Search by name, city, cuisine…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-status" className="text-ink-muted text-xs font-medium">
            Status
          </label>
          <Select
            value={status ?? "all"}
            onValueChange={(val) => setStatus(val === "all" ? undefined : val)}
          >
            <SelectTrigger id="filter-status" className="w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">{t("restaurants.status.active")}</SelectItem>
              <SelectItem value="inactive">{t("restaurants.status.inactive")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-4">
        {isLoading ? (
          <p className="text-ink-muted py-8 text-center text-xs" role="status">
            Loading restaurants…
          </p>
        ) : isError ? (
          <p className="text-danger py-8 text-center text-xs" role="alert">
            Could not load restaurants.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-ink-muted py-8 text-center text-xs">{t("restaurants.empty")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("restaurants.name")}</TableHead>
                <TableHead>{t("restaurants.cuisine")}</TableHead>
                <TableHead>{t("restaurants.city")}</TableHead>
                <TableHead>{t("restaurants.country")}</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell className="text-ink font-medium">
                    <Link
                      to={`/site/admin/restaurants/${restaurant.id}`}
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      {restaurant.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-ink-subtle">{restaurant.cuisine}</TableCell>
                  <TableCell className="text-ink-subtle">{restaurant.city}</TableCell>
                  <TableCell className="text-ink-subtle font-mono text-xs">
                    {restaurant.country}
                  </TableCell>
                  <TableCell>
                    <Badge variant={restaurant.active ? "default" : "secondary"}>
                      {restaurant.active
                        ? t("restaurants.status.active")
                        : t("restaurants.status.inactive")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
