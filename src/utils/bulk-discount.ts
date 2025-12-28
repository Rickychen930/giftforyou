import { formatIDR } from "./money";

export interface BulkDiscountResult {
  originalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  finalPrice: number;
  formattedOriginalPrice: string;
  formattedDiscountAmount: string;
  formattedFinalPrice: string;
  tier: string;
}

/**
 * Calculate bulk order discount based on quantity
 * Discount tiers:
 * - 1-4 items: No discount
 * - 5-9 items: 5% discount
 * - 10-19 items: 10% discount
 * - 20-49 items: 15% discount
 * - 50+ items: 20% discount
 */
export function calculateBulkDiscount(
  unitPrice: number,
  quantity: number
): BulkDiscountResult {
  let discountPercentage = 0;
  let tier = "Standar";

  if (quantity >= 50) {
    discountPercentage = 20;
    tier = "Premium (50+)";
  } else if (quantity >= 20) {
    discountPercentage = 15;
    tier = "Besar (20-49)";
  } else if (quantity >= 10) {
    discountPercentage = 10;
    tier = "Menengah (10-19)";
  } else if (quantity >= 5) {
    discountPercentage = 5;
    tier = "Kecil (5-9)";
  }

  const originalPrice = unitPrice * quantity;
  const discountAmount = (originalPrice * discountPercentage) / 100;
  const finalPrice = originalPrice - discountAmount;

  return {
    originalPrice,
    discountAmount,
    discountPercentage,
    finalPrice,
    formattedOriginalPrice: formatIDR(originalPrice),
    formattedDiscountAmount: formatIDR(discountAmount),
    formattedFinalPrice: formatIDR(finalPrice),
    tier,
  };
}

/**
 * Get discount message for display
 */
export function getBulkDiscountMessage(quantity: number): string | null {
  if (quantity >= 50) {
    return "🎉 Diskon 20% untuk order 50+ pcs!";
  } else if (quantity >= 20) {
    return "🎁 Diskon 15% untuk order 20+ pcs!";
  } else if (quantity >= 10) {
    return "✨ Diskon 10% untuk order 10+ pcs!";
  } else if (quantity >= 5) {
    return "💝 Diskon 5% untuk order 5+ pcs!";
  } else if (quantity >= 3) {
    return "💡 Order 5+ pcs untuk dapat diskon 5%!";
  }
  return null;
}

