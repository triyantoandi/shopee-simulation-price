import { Product, FeeRule, AppSettings, DashboardStats } from '../types';
import { INITIAL_PRODUCTS, INITIAL_FEES, INITIAL_SETTINGS } from '../data/initialData';
import { calculateShopeePrice } from './calculator';

const KEYS = {
  PRODUCTS: 'kurma_shopee_products_v2',
  FEES: 'kurma_shopee_fees_v2',
  SETTINGS: 'kurma_shopee_settings_v2'
};

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(KEYS.PRODUCTS);
    if (!raw) {
      saveStoredProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
}

export function getStoredFees(): FeeRule[] {
  try {
    const raw = localStorage.getItem(KEYS.FEES);
    if (!raw) {
      saveStoredFees(INITIAL_FEES);
      return INITIAL_FEES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FEES;
  }
}

export function saveStoredFees(fees: FeeRule[]): void {
  localStorage.setItem(KEYS.FEES, JSON.stringify(fees));
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) {
      saveStoredSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export function resetToDefaults(): void {
  saveStoredProducts(INITIAL_PRODUCTS);
  saveStoredFees(INITIAL_FEES);
  saveStoredSettings(INITIAL_SETTINGS);
}

export function computeDashboardStats(products: Product[], fees: FeeRule[], warningMonths: number = 3): DashboardStats {
  const activeProducts = products.filter(p => p.status === 'ACTIVE');
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

  activeProducts.forEach(p => {
    totalInventoryValue += (p.total_hpp * p.stock);

    // Calculate sample profitability status
    const result = calculateShopeePrice({
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
    }, fees);

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

  const avgMargin = activeProducts.length > 0 ? totalMarginSum / activeProducts.length : 0;

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
