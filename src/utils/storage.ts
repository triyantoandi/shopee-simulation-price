import { Product, FeeRule, DashboardStats } from '../types';
import { calculateShopeePrice } from './calculator';

/**
 * Calculates aggregated dashboard statistics for products, inventory value, and profit margins.
 */
export function computeDashboardStats(
  products: Product[],
  fees: FeeRule[],
  warningMonths: number = 3
): DashboardStats {
  const activeProducts = products.filter((p) => p.status === 'ACTIVE');
  let safeCount = 0;
  let warningCount = 0;
  let lossCount = 0;
  let totalMarginSum = 0;
  let totalInventoryValue = 0;

  const now = new Date();
  const warningLimit = new Date();
  warningLimit.setMonth(now.getMonth() + warningMonths);

  let expiringCount = 0;
  let expiredCount = 0;

  activeProducts.forEach((p) => {
    totalInventoryValue += p.total_hpp * p.stock;

    // Calculate sample profitability status
    const result = calculateShopeePrice(
      {
        originalPrice: p.normal_price,
        discountType: 'PERCENTAGE',
        discountValue: 0,
        sellerVoucher: 0,
        xtraActive: true,
        freeShippingActive: true,
        affiliateActive: false,
        affiliateRate: 0,
        sellerTier: 'STAR_SELLER',
        quantity: 1,
        totalHpp: p.total_hpp,
        targetProfit: p.target_profit,
        targetMargin: p.target_margin
      },
      fees
    );

    if (result.status === 'SAFE') safeCount++;
    else if (result.status === 'WARNING') warningCount++;
    else if (result.status === 'LOSS') lossCount++;

    totalMarginSum += result.marginPercent;

    // Check expiry
    if (p.expiry_date) {
      const expDate = new Date(p.expiry_date);
      if (expDate < now) {
        expiredCount++;
      } else if (expDate <= warningLimit) {
        expiringCount++;
      }
    }
  });

  const avgMargin =
    activeProducts.length > 0 ? totalMarginSum / activeProducts.length : 0;

  return {
    totalSku: products.length,
    activeSku: activeProducts.length,
    safeCount,
    warningCount,
    lossCount,
    expiringCount,
    expiredCount,
    avgMargin,
    totalInventoryValue
  };
}
