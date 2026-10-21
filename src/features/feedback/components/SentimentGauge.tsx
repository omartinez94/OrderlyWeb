import { useTranslation } from "react-i18next";
import { Star, Award, Gift, Sparkles, TrendingUp } from "lucide-react";
import type { CustomerFeedbackSummary } from "../../../types/feedback";
import { cn } from "../../../lib/utils";

export interface SentimentGaugeProps {
  summary: CustomerFeedbackSummary;
  className?: string;
}

/**
 * SentimentGauge — CSAT score visualization card featuring aggregate rating,
 * star distribution progress bars, category breakdown, and reward voucher redemption rate.
 */
export function SentimentGauge({ summary, className }: SentimentGaugeProps) {
  const { t } = useTranslation("restaurant");

  const totalReviews = summary.totalCount;
  const avgRating = summary.averageRating;

  return (
    <section
      className={cn(
        "bg-card border-border-subtle relative rounded-lg border p-6 shadow-xs",
        className,
      )}
      aria-label={t("feedback.csatTitle")}
      data-testid="sentiment-gauge"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Overall CSAT Score */}
        <div className="lg:border-border-subtle/80 flex flex-col justify-between lg:col-span-4 lg:border-r lg:pr-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
                <Award className="size-4" aria-hidden="true" />
              </div>
              <h2 className="text-ink font-display text-base font-bold tracking-tight">
                {t("feedback.csatTitle")}
              </h2>
            </div>
            <p className="text-ink-subtle mt-1 text-xs">{t("feedback.csatSubtitle")}</p>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-ink font-mono text-4xl font-extrabold tracking-tight sm:text-5xl">
                {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-ink-muted font-mono text-lg font-medium">/ 5.0</span>
            </div>

            {/* Visual Stars */}
            <div
              className="mt-2.5 flex items-center gap-1"
              role="img"
              aria-label={`${avgRating.toFixed(1)} out of 5 stars`}
            >
              {[1, 2, 3, 4, 5].map((starIdx) => {
                const isFilled = starIdx <= Math.round(avgRating);
                return (
                  <Star
                    key={starIdx}
                    className={cn(
                      "size-5",
                      isFilled
                        ? "fill-amber-400 text-amber-400"
                        : "text-border-subtle fill-transparent",
                    )}
                    aria-hidden="true"
                  />
                );
              })}
            </div>

            <p className="text-ink-muted mt-2 font-mono text-xs">
              {t("feedback.reviewsCount", { count: totalReviews })}
            </p>
          </div>

          {/* Sub-Averages Pills */}
          <div className="border-border-subtle/60 mt-6 space-y-2 border-t pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">{t("feedback.foodQuality")}</span>
              <span className="text-ink font-mono font-bold">
                {summary.averageFoodQuality.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">{t("feedback.serviceSpeed")}</span>
              <span className="text-ink font-mono font-bold">
                {summary.averageServiceSpeed.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">{t("feedback.waiterFriendliness")}</span>
              <span className="text-ink font-mono font-bold">
                {summary.averageWaiterFriendliness.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Center Column: Star Distribution Progress Bars */}
        <div className="flex flex-col justify-center lg:col-span-5 lg:px-4">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="text-ink-muted size-4" aria-hidden="true" />
            <span className="text-ink font-mono text-xs font-semibold tracking-wider uppercase">
              {t("feedback.starBreakdown")}
            </span>
          </div>

          <div className="space-y-3">
            {([5, 4, 3, 2, 1] as const).map((rating) => {
              const count = summary.starDistribution[rating] ?? 0;
              const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

              return (
                <div key={rating} className="flex items-center gap-3 text-xs">
                  <div className="text-ink-muted flex w-16 shrink-0 items-center gap-1 font-mono">
                    <span>{rating}</span>
                    <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                  </div>

                  {/* Progress Bar */}
                  <div
                    className="bg-surface border-border-subtle/60 relative h-2.5 w-full overflow-hidden rounded-full border"
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${rating} stars: ${percentage}%`}
                  >
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Counts & Percentage */}
                  <div className="text-ink-muted w-16 shrink-0 text-right font-mono">
                    <span className="text-ink font-semibold">{count}</span>
                    <span className="text-ink-subtle text-2xs ml-1">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Reward Voucher Redemption Telemetry */}
        <div className="border-border-subtle/60 bg-surface/40 flex flex-col justify-between rounded-lg border p-4 lg:col-span-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md">
                <Gift className="size-3.5" aria-hidden="true" />
              </div>
              <span className="text-ink font-mono text-xs font-semibold tracking-wider uppercase">
                {t("feedback.redemptionRate")}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-ink font-mono text-3xl font-extrabold tracking-tight">
                  {summary.rewardRedemptionRate.toFixed(1)}%
                </span>
                <TrendingUp className="size-4 text-emerald-500" aria-hidden="true" />
              </div>

              {/* Redemption progress bar */}
              <div
                className="bg-surface border-border-subtle/60 relative mt-2.5 h-2 w-full overflow-hidden rounded-full border"
                role="progressbar"
                aria-valuenow={Math.round(summary.rewardRedemptionRate)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Voucher redemption rate: ${summary.rewardRedemptionRate.toFixed(1)}%`}
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, summary.rewardRedemptionRate))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="border-border-subtle/60 mt-5 space-y-2 border-t pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">{t("feedback.rewardsIssued")}</span>
              <span className="text-ink font-mono font-bold">{summary.totalRewardsIssued}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">{t("feedback.rewardsRedeemed")}</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {summary.totalRewardsRedeemed}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
