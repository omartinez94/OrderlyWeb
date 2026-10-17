/**
 * Basket & Cart domain types.
 *
 * Aligned with Basket.API (.NET 10 Minimal APIs & Carter).
 */

export interface BasketItemVariation {
  name: string;
  value: string;
  price: number;
}

export interface BasketItemCustomization {
  ingredient: string;
  action: string;
}

export interface BasketItem {
  menuItemId: number;
  quantity: number;
  unitPrice: number;
  variations: BasketItemVariation[];
  customizations: BasketItemCustomization[];
  totalPrice?: number;
}

export interface CouponSnapshot {
  couponId: string;
  code: string;
  discountType: string;
  discountAmount: number;
  appliedAt: string;
}

export interface BasketAppliedDiscount {
  couponId: string;
  code: string;
  discountType: string;
  requestedAmount: number;
  appliedAmount: number;
  appliedAt: string;
}

export interface Basket {
  userId: string;
  restaurantId: string;
  items: BasketItem[];
  appliedDiscounts: string[];
  appliedCoupons: CouponSnapshot[];
  appliedDiscountBreakdown: BasketAppliedDiscount[];
  discountAmount: number;
  effectiveSubtotal: number;
  subtotal?: number;
  total?: number;
  createdAt?: string;
  expiresAt?: string;
  lastModifiedAt?: string;
}

import type { PaymentMethod } from "./order";

export interface BasketCheckoutDto {
  userId: string;
  restaurantId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  addressLine: string;
  country: string;
  state: string;
  zipCode: string;
  cardName: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
  paymentMethod: PaymentMethod;
}

export interface GetBasketResponse {
  basket: Basket;
}

export interface StoreBasketResponse {
  isCreated: boolean;
  userId: string;
  restaurantId: string;
}

export interface CheckoutBasketResponse {
  success: boolean;
  message: string;
}
