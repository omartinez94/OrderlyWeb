/**
 * BrandList — table view of brands across the organization.
 * Supports keyword search (?q=) and active status filter (?active=).
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Search, Building2, ExternalLink, Plus } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Input,
  Button,
  Card,
  Skeleton,
} from "../../components/ui";
import { StatusBadge } from "../../components/Admin";
import type { CatalogBrand } from "../../types/catalog";
import { PATH } from "../../router/pathNames";

export interface BrandListProps {
  brands: CatalogBrand[];
  isLoading?: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  activeFilter?: boolean | undefined;
  onActiveFilterChange: (active: boolean | undefined) => void;
}

export function BrandList({
  brands,
  isLoading = false,
  query,
  onQueryChange,
  activeFilter,
  onActiveFilterChange,
}: BrandListProps) {
  const { t } = useTranslation("admin");

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="text-ink-subtle absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search brands by name, slug, cuisine..."
            className="pl-9 text-xs"
            aria-label="Search brands"
          />
        </div>

        <div className="flex items-center gap-2">
          <div role="tablist" aria-label="Status filter" className="flex items-center gap-1">
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === undefined}
              onClick={() => onActiveFilterChange(undefined)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === undefined
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface hover:bg-surface-elevated text-ink border-border/60 border"
              }`}
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === true}
              onClick={() => onActiveFilterChange(true)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === true
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface hover:bg-surface-elevated text-ink border-border/60 border"
              }`}
            >
              {t("status.active")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === false}
              onClick={() => onActiveFilterChange(false)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFilter === false
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface hover:bg-surface-elevated text-ink border-border/60 border"
              }`}
            >
              {t("status.archived")}
            </button>
          </div>
        </div>
      </div>

      {/* Brands Table or Loading/Empty States */}
      {isLoading ? (
        <Card className="p-6">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      ) : brands.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Building2 className="text-ink-subtle mb-3 size-10 stroke-1" />
          <h2 className="font-display text-ink text-base font-semibold">{t("brands.empty")}</h2>
          <Link to={PATH.ADMIN_BRAND_NEW} className="mt-4">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              {t("brands.new")}
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("brands.name")}</TableHead>
                <TableHead>{t("brands.slug")}</TableHead>
                <TableHead>{t("brands.cuisine")}</TableHead>
                <TableHead>{t("brands.contactEmail")}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="text-ink font-semibold">
                    <div className="flex items-center gap-3">
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt=""
                          role="presentation"
                          className="border-border size-8 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
                          <Building2 className="size-4" />
                        </div>
                      )}
                      <div>
                        <Link
                          to={`/site/admin/brands/${brand.id}`}
                          className="hover:text-primary transition-colors hover:underline"
                        >
                          {brand.name}
                        </Link>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-ink-subtle font-mono text-xs">{brand.slug}</TableCell>
                  <TableCell className="text-xs">{brand.cuisineType}</TableCell>
                  <TableCell className="text-ink-subtle text-xs">{brand.contactEmail}</TableCell>
                  <TableCell>
                    <StatusBadge status={brand.active} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/site/admin/brands/${brand.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        {t("actions.edit")}
                        <ExternalLink className="size-3" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
