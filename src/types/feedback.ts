/**
 * Customer Feedback domain types matching Catalog.API GetCustomerFeedbackEndpoint contracts.
 */

export interface CustomerFeedbackDto {
  id: number;
  restaurantId: string;
  orderId: string;
  overallRating: number;
  foodQualityRating: number;
  serviceSpeedRating: number;
  waiterFriendlinessRating: number;
  comments: string;
  submittedAt: string;
  rewardType: string;
  rewardValue: number | null;
  rewardDescription: string;
  rewardCode: string;
  rewardRedeemed: boolean;
  redeemedAt: string | null;
  redeemedInOrderId: string | null;
}

export interface GetCustomerFeedbackResponse {
  items: CustomerFeedbackDto[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface GetCustomerFeedbackParams {
  restaurantId: string;
  minRating?: number;
  maxRating?: number;
  rewardRedeemed?: boolean;
  from?: string;
  to?: string;
  pageIndex?: number;
  pageSize?: number;
}

export type FeedbackRatingFilter = "all" | 1 | 2 | 3 | 4 | 5;
export type FeedbackRewardFilter = "all" | "redeemed" | "available";

export interface CustomerFeedbackSummary {
  averageRating: number;
  totalCount: number;
  starDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  averageFoodQuality: number;
  averageServiceSpeed: number;
  averageWaiterFriendliness: number;
  totalRewardsIssued: number;
  totalRewardsRedeemed: number;
  rewardRedemptionRate: number;
}
