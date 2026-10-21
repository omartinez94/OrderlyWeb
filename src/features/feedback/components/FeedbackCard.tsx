import { useTranslation } from "react-i18next";
import { Star, Ticket, CheckCircle2, Clock } from "lucide-react";
import type { CustomerFeedbackDto } from "../../../types/feedback";
import { cn } from "../../../lib/utils";
import { formatDate, getDateFnsLocale } from "../../../utils/date";

export interface FeedbackCardProps {
  feedback: CustomerFeedbackDto;
  className?: string;
}

/**
 * FeedbackCard — Chamfered guest review card with star rating breakdown,
 * guest comment, and deterministic reward voucher status badge.
 */
export function FeedbackCard({ feedback, className }: FeedbackCardProps) {
  const { t, i18n } = useTranslation("restaurant");
  const locale = getDateFnsLocale(i18n.language);

  const formattedDate = formatDate(feedback.submittedAt, "MMM d, yyyy · HH:mm", locale);

  const formattedRedeemedDate = feedback.redeemedAt
    ? formatDate(feedback.redeemedAt, "MMM d, yyyy", locale)
    : null;

  return (
    <article
      className={cn(
        "bg-card border-border-subtle relative flex flex-col justify-between rounded-lg border p-5 shadow-xs transition-colors hover:border-border",
        className,
      )}
      data-testid={`feedback-card-${feedback.id}`}
      aria-label={`Review for order ${feedback.orderId}`}
    >
      {/* Top Header: Order ID, Overall Star Rating, Timestamp */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-ink-muted font-mono text-xs font-semibold tracking-wider uppercase">
              {t("feedback.orderRef")} #{feedback.orderId}
            </span>
          </div>

          <div
            className="flex items-center gap-1"
            role="img"
            aria-label={`${feedback.overallRating} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((starIndex) => {
              const isFilled = starIndex <= feedback.overallRating;
              return (
                <Star
                  key={starIndex}
                  className={cn(
                    "size-4",
                    isFilled
                      ? "fill-amber-400 text-amber-400"
                      : "text-border-subtle fill-transparent",
                  )}
                  aria-hidden="true"
                />
              );
            })}
            <span className="text-ink ml-1.5 font-mono text-xs font-bold">
              {feedback.overallRating}.0
            </span>
          </div>
        </div>

        <time
          dateTime={feedback.submittedAt}
          className="text-ink-subtle mt-1 block font-mono text-xs"
        >
          {formattedDate}
        </time>

        {/* Guest Comment */}
        {feedback.comments && (
          <p className="text-ink mt-3.5 text-sm leading-relaxed italic">
            &ldquo;{feedback.comments}&rdquo;
          </p>
        )}

        {/* Rating Breakdown Badges */}
        <div className="border-border-subtle/60 mt-4 grid grid-cols-1 gap-2 border-t pt-3 sm:grid-cols-3">
          {/* Food Quality */}
          <div className="bg-surface/50 border-border-subtle/50 flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs">
            <span className="text-ink-muted">{t("feedback.foodQuality")}</span>
            <span className="text-ink font-mono font-semibold">{feedback.foodQualityRating}/5</span>
          </div>

          {/* Service Speed */}
          <div className="bg-surface/50 border-border-subtle/50 flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs">
            <span className="text-ink-muted">{t("feedback.serviceSpeed")}</span>
            <span className="text-ink font-mono font-semibold">
              {feedback.serviceSpeedRating}/5
            </span>
          </div>

          {/* Waiter Friendliness */}
          <div className="bg-surface/50 border-border-subtle/50 flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs">
            <span className="text-ink-muted">{t("feedback.waiterFriendliness")}</span>
            <span className="text-ink font-mono font-semibold">
              {feedback.waiterFriendlinessRating}/5
            </span>
          </div>
        </div>
      </div>

      {/* Reward Voucher Badge / Footer */}
      {feedback.rewardCode && (
        <div className="border-border-subtle/80 bg-surface/30 mt-4 flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md">
              <Ticket className="size-3.5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-ink font-mono text-xs font-bold tracking-wider">
                  {feedback.rewardCode}
                </span>
              </div>
              <p className="text-ink-muted text-xs">{feedback.rewardDescription}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {feedback.rewardRedeemed ? (
              <div className="flex items-center gap-1.5">
                <span
                  data-testid="reward-redeemed-badge"
                  className="text-2xs inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400"
                >
                  <CheckCircle2 className="size-3" aria-hidden="true" />
                  {t("feedback.statusRedeemed")}
                </span>
                {feedback.redeemedInOrderId && (
                  <span className="text-ink-subtle text-2xs hidden font-mono lg:inline">
                    {t("feedback.redeemedInOrder", { order: feedback.redeemedInOrderId })}
                  </span>
                )}
                {formattedRedeemedDate && !feedback.redeemedInOrderId && (
                  <span className="text-ink-subtle text-2xs hidden font-mono lg:inline">
                    {t("feedback.redeemedAt", { date: formattedRedeemedDate })}
                  </span>
                )}
              </div>
            ) : (
              <span
                data-testid="reward-available-badge"
                className="bg-primary/10 text-primary border-primary/20 text-2xs inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono font-semibold tracking-wider uppercase"
              >
                <Clock className="size-3" aria-hidden="true" />
                {t("feedback.statusAvailable")}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
