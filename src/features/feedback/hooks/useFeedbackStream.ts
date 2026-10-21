import { useMemo, useState } from "react";
import { useGetCustomerFeedbackQuery } from "../../../app/api/catalog";
import type {
  CustomerFeedbackDto,
  CustomerFeedbackSummary,
  FeedbackRatingFilter,
  FeedbackRewardFilter,
} from "../../../types/feedback";

export interface UseFeedbackStreamOptions {
  restaurantId: string;
  initialRatingFilter?: FeedbackRatingFilter;
  initialRewardFilter?: FeedbackRewardFilter;
}

export function useFeedbackStream({
  restaurantId,
  initialRatingFilter = "all",
  initialRewardFilter = "all",
}: UseFeedbackStreamOptions) {
  const [filterRating, setFilterRating] = useState<FeedbackRatingFilter>(initialRatingFilter);
  const [filterReward, setFilterReward] = useState<FeedbackRewardFilter>(initialRewardFilter);

  const { data, isLoading, isFetching, isError, refetch } = useGetCustomerFeedbackQuery(
    { restaurantId },
    { skip: !restaurantId },
  );

  const rawItems: CustomerFeedbackDto[] = useMemo(() => {
    return data?.items ?? [];
  }, [data]);

  // Aggregate CSAT summary metrics
  const summary: CustomerFeedbackSummary = useMemo(() => {
    const total = rawItems.length;
    if (total === 0) {
      return {
        averageRating: 0,
        totalCount: 0,
        starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        averageFoodQuality: 0,
        averageServiceSpeed: 0,
        averageWaiterFriendliness: 0,
        totalRewardsIssued: 0,
        totalRewardsRedeemed: 0,
        rewardRedemptionRate: 0,
      };
    }

    const starDistribution: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let sumRating = 0;
    let sumFood = 0;
    let sumSpeed = 0;
    let sumFriendliness = 0;
    let rewardsIssued = 0;
    let rewardsRedeemed = 0;

    for (const item of rawItems) {
      sumRating += item.overallRating;
      sumFood += item.foodQualityRating;
      sumSpeed += item.serviceSpeedRating;
      sumFriendliness += item.waiterFriendlinessRating;

      const starKey = Math.min(5, Math.max(1, Math.round(item.overallRating))) as 1 | 2 | 3 | 4 | 5;
      starDistribution[starKey] = (starDistribution[starKey] ?? 0) + 1;

      if (item.rewardCode) {
        rewardsIssued += 1;
        if (item.rewardRedeemed) {
          rewardsRedeemed += 1;
        }
      }
    }

    const rewardRedemptionRate = rewardsIssued > 0 ? (rewardsRedeemed / rewardsIssued) * 100 : 0;

    return {
      averageRating: sumRating / total,
      totalCount: total,
      starDistribution,
      averageFoodQuality: sumFood / total,
      averageServiceSpeed: sumSpeed / total,
      averageWaiterFriendliness: sumFriendliness / total,
      totalRewardsIssued: rewardsIssued,
      totalRewardsRedeemed: rewardsRedeemed,
      rewardRedemptionRate,
    };
  }, [rawItems]);

  // Apply in-memory client filters
  const filteredItems: CustomerFeedbackDto[] = useMemo(() => {
    return rawItems.filter((item) => {
      // Rating filter
      if (filterRating !== "all") {
        if (Math.round(item.overallRating) !== filterRating) {
          return false;
        }
      }

      // Reward filter
      if (filterReward === "redeemed") {
        if (!item.rewardRedeemed) return false;
      } else if (filterReward === "available") {
        if (!item.rewardCode || item.rewardRedeemed) return false;
      }

      return true;
    });
  }, [rawItems, filterRating, filterReward]);

  return {
    rawItems,
    filteredItems,
    summary,
    filterRating,
    setFilterRating,
    filterReward,
    setFilterReward,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
