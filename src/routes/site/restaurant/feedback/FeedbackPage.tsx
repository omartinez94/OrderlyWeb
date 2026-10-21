/**
 * FeedbackPage — `/site/restaurant/feedback`.
 *
 * Customer Feedback Sentiment & Reward Code Portal.
 * Features overall CSAT gauge, rating breakdown distribution,
 * deterministic reward voucher tracking, and filtered review feed.
 */

import { useTranslation } from "react-i18next";
import {
  MessageSquareHeart,
  RefreshCw,
  Star,
  Ticket,
  Filter,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useRestaurantContext } from "../../../../components/RestaurantContext/useRestaurantContext";
import { FeedbackCard, SentimentGauge, useFeedbackStream } from "../../../../features/feedback";
import type { FeedbackRatingFilter, FeedbackRewardFilter } from "../../../../types/feedback";
import { Button } from "../../../../components/ui";
import { cn } from "../../../../lib/utils";

export function FeedbackPage() {
  const { t } = useTranslation("restaurant");
  const { restaurantId: contextRestaurantId } = useRestaurantContext();
  const effectiveRestaurantId = contextRestaurantId ?? "r-001";

  const {
    rawItems,
    filteredItems,
    summary,
    filterRating,
    setFilterRating,
    filterReward,
    setFilterReward,
    isLoading,
    isFetching,
    refetch,
  } = useFeedbackStream({ restaurantId: effectiveRestaurantId });

  const ratingOptions: Array<{ value: FeedbackRatingFilter; label: string; count?: number }> = [
    { value: "all", label: t("feedback.allRatings"), count: summary.totalCount },
    { value: 5, label: t("feedback.stars", { count: 5 }), count: summary.starDistribution[5] },
    { value: 4, label: t("feedback.stars", { count: 4 }), count: summary.starDistribution[4] },
    { value: 3, label: t("feedback.stars", { count: 3 }), count: summary.starDistribution[3] },
    { value: 2, label: t("feedback.stars", { count: 2 }), count: summary.starDistribution[2] },
    { value: 1, label: t("feedback.star_one"), count: summary.starDistribution[1] },
  ];

  const rewardOptions: Array<{ value: FeedbackRewardFilter; label: string }> = [
    { value: "all", label: t("feedback.allRewards") },
    { value: "available", label: t("feedback.rewardAvailable") },
    { value: "redeemed", label: t("feedback.rewardRedeemed") },
  ];

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="feedback-page">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
              <MessageSquareHeart className="size-4" aria-hidden="true" />
            </div>
            <h1 className="text-ink font-display text-xl font-bold tracking-tight">
              {t("feedback.title")}
            </h1>
          </div>
          <p className="text-ink-subtle mt-1 text-xs">{t("feedback.subtitle")}</p>
        </div>

        {/* Refresh Button */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading || isFetching}
            className="border-border-subtle hover:bg-surface h-9 gap-1.5 px-3 font-mono text-xs"
            aria-label={t("feedback.refresh")}
          >
            <RefreshCw
              className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>{t("feedback.refresh")}</span>
          </Button>
        </div>
      </div>

      {/* CSAT Sentiment Overview Gauge */}
      <SentimentGauge summary={summary} />

      {/* Filter Toolbar */}
      <div
        className="bg-card border-border-subtle flex flex-col gap-4 rounded-lg border p-4 shadow-2xs"
        aria-label="Feedback filters"
      >
        {/* Rating Filter Chips */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="text-ink-muted flex w-32 shrink-0 items-center gap-1.5 text-xs font-semibold">
            <Star className="size-3.5 text-amber-400" aria-hidden="true" />
            <span>{t("feedback.filterByRating")}</span>
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5"
            role="radiogroup"
            aria-label={t("feedback.filterByRating")}
          >
            {ratingOptions.map((opt) => {
              const isSelected = filterRating === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setFilterRating(opt.value)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-mono transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "bg-surface hover:bg-surface-elevated text-ink-muted hover:text-ink border border-border-subtle/80",
                  )}
                >
                  <span>{opt.label}</span>
                  {opt.count !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-2xs",
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-surface-elevated text-ink-subtle",
                      )}
                    >
                      {opt.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Voucher Status Filter Chips */}
        <div className="border-border-subtle/60 flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center">
          <div className="text-ink-muted flex w-32 shrink-0 items-center gap-1.5 text-xs font-semibold">
            <Ticket className="text-primary size-3.5" aria-hidden="true" />
            <span>{t("feedback.filterByReward")}</span>
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5"
            role="radiogroup"
            aria-label={t("feedback.filterByReward")}
          >
            {rewardOptions.map((opt) => {
              const isSelected = filterReward === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setFilterReward(opt.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "bg-surface hover:bg-surface-elevated text-ink-muted hover:text-ink border border-border-subtle/80",
                  )}
                >
                  {opt.value === "available" && (
                    <Clock className="size-3 text-current" aria-hidden="true" />
                  )}
                  {opt.value === "redeemed" && (
                    <CheckCircle2 className="size-3 text-current" aria-hidden="true" />
                  )}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Cards Feed */}
      <section aria-label="Customer Reviews List">
        {isLoading ? (
          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            data-testid="feedback-loading"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-card border-border-subtle animate-pulse rounded-lg border p-5 shadow-xs"
              >
                <div className="flex justify-between">
                  <div className="bg-surface-elevated h-4 w-24 rounded" />
                  <div className="bg-surface-elevated h-4 w-16 rounded" />
                </div>
                <div className="bg-surface-elevated mt-2 h-3 w-32 rounded" />
                <div className="bg-surface-elevated mt-4 h-12 w-full rounded" />
                <div className="bg-surface-elevated mt-4 h-8 w-full rounded" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            className="bg-card border-border-subtle flex flex-col items-center justify-center rounded-lg border p-12 text-center"
            data-testid="feedback-empty"
          >
            <div className="bg-surface text-ink-muted border-border-subtle flex size-12 items-center justify-center rounded-full border">
              <Filter className="size-6" aria-hidden="true" />
            </div>
            <h3 className="text-ink font-display mt-4 text-base font-bold">
              {rawItems.length === 0 ? t("feedback.empty") : t("feedback.noMatchTitle")}
            </h3>
            <p className="text-ink-subtle mt-1 max-w-sm text-xs">
              {rawItems.length === 0 ? t("feedback.subtitle") : t("feedback.noMatchSubtitle")}
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            data-testid="feedback-grid"
          >
            {filteredItems.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
