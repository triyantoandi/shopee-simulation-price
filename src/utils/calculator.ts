import { SimulationParams, SimulationResult, FeeRule, FeeItemBreakdown, CalculationStatus } from '../types';

export function calculateShopeePrice(
  params: SimulationParams,
  fees: FeeRule[]
): SimulationResult {
  const {
    originalPrice,
    discountType,
    discountValue,
    sellerVoucher,
    xtraActive,
    freeShippingActive,
    affiliateActive,
    affiliateRate,
    sellerTier,
    totalHpp,
    targetProfit,
    targetMargin
  } = params;

  // 1. Calculate discount and Customer Price
  let discountAmount = 0;
  if (discountType === 'PERCENTAGE') {
    discountAmount = (originalPrice * Math.min(Math.max(discountValue, 0), 100)) / 100;
  } else {
    discountAmount = Math.max(discountValue, 0);
  }

  // Customer Price is what the buyer pays before Shopee platform vouchers
  const customerPrice = Math.max(0, originalPrice - discountAmount - sellerVoucher);

  // 2. Fee Calculations
  const feeBreakdown: FeeItemBreakdown[] = [];
  let totalFees = 0;
  let totalVariableFeeRate = 0;
  let totalFixedFee = 0;

  // Filter applicable fee rules based on seller tier and user toggles
  fees.forEach((rule) => {
    if (rule.status !== 'ACTIVE') return;

    // Check tier compatibility
    if (rule.tier !== 'ALL' && rule.tier !== sellerTier) return;

    // Check optional features
    if (rule.category_tag === 'Gratis Ongkir XTRA' && !freeShippingActive) return;
    if (rule.category_tag === 'Cashback XTRA' && !xtraActive) return;

    let feeAmount = 0;
    let rateLabel = '';

    if (rule.fee_type === 'percentage') {
      feeAmount = customerPrice * rule.rate;
      if (rule.max_cap && rule.max_cap > 0) {
        feeAmount = Math.min(feeAmount, rule.max_cap);
      }
      rateLabel = `${(rule.rate * 100).toFixed(1)}%` + (rule.max_cap ? ` (Maks Rp${rule.max_cap.toLocaleString('id-ID')})` : '');
      totalVariableFeeRate += rule.max_cap ? 0 : rule.rate;
    } else {
      feeAmount = rule.fixed_amount;
      rateLabel = `Rp${rule.fixed_amount.toLocaleString('id-ID')}`;
      totalFixedFee += rule.fixed_amount;
    }

    feeAmount = Math.round(feeAmount);
    totalFees += feeAmount;

    feeBreakdown.push({
      name: rule.fee_name,
      amount: feeAmount,
      rateLabel
    });
  });

  // 3. Shopee Affiliate Fee if enabled
  if (affiliateActive && affiliateRate > 0) {
    const affRateDecimal = affiliateRate / 100;
    const affAmount = Math.round(customerPrice * affRateDecimal);
    totalFees += affAmount;
    totalVariableFeeRate += affRateDecimal;

    feeBreakdown.push({
      name: `Komisi Affiliate (${affiliateRate}%)`,
      amount: affAmount,
      rateLabel: `${affiliateRate.toFixed(1)}%`
    });
  }

  // 4. Net Revenue & Profit Calculations
  const netRevenue = Math.max(0, customerPrice - totalFees);
  const netProfit = netRevenue - totalHpp;
  const marginPercent = customerPrice > 0 ? (netProfit / customerPrice) * 100 : 0;

  // 5. Breakeven & Safe Price Calculations
  // Effective fee ratio
  const effectiveFeeRatio = customerPrice > 0 ? totalFees / customerPrice : 0;
  // Use either the calculated fee ratio or effective fee ratio
  const feeRatioForBreakeven = Math.min(effectiveFeeRatio, 0.50);

  // CP_breakeven = (HPP + FixedFees) / (1 - feeRatio)
  const denominatorBreakeven = Math.max(0.1, 1 - feeRatioForBreakeven);
  const breakevenPrice = Math.round((totalHpp + totalFixedFee) / denominatorBreakeven);

  // Target margin calculation (e.g., 0.15 for 15%)
  const effectiveTargetMargin = targetMargin > 0 ? (targetMargin > 1 ? targetMargin / 100 : targetMargin) : 0.15;
  const denominatorSafe = Math.max(0.05, 1 - feeRatioForBreakeven - effectiveTargetMargin);
  const safePrice = Math.round((totalHpp + totalFixedFee) / denominatorSafe);

  // Max Discount % calculation
  let maxDiscountPercent = 0;
  if (originalPrice > 0) {
    const maxAllowedDiscountVal = originalPrice - sellerVoucher - breakevenPrice;
    maxDiscountPercent = Math.max(0, Math.min(100, (maxAllowedDiscountVal / originalPrice) * 100));
  }

  // 6. Status & Warnings Determination
  let status: CalculationStatus = 'SAFE';
  const warnings: string[] = [];

  const targetProfitAmount = targetProfit > 0 ? targetProfit : (totalHpp * effectiveTargetMargin);

  if (netProfit <= 0) {
    status = 'LOSS';
    warnings.push('⚠️ POTENSI RUGI! Harga jual tidak dapat menutup HPP dan potongan biaya Shopee.');
    warnings.push(`💡 Rekomendasi: Naikkan harga pembeli minimal ke Rp${breakevenPrice.toLocaleString('id-ID')} untuk BEP.`);
  } else if (netProfit < targetProfitAmount || (marginPercent / 100) < effectiveTargetMargin) {
    status = 'WARNING';
    warnings.push(`⚠️ Margin (${marginPercent.toFixed(1)}%) masih di bawah target (${(effectiveTargetMargin * 100).toFixed(0)}%).`);
    warnings.push(`💡 Untuk mencapai target profit Rp${targetProfitAmount.toLocaleString('id-ID')}, atur harga pembeli minimal Rp${safePrice.toLocaleString('id-ID')}.`);
  } else {
    status = 'SAFE';
  }

  if (effectiveFeeRatio > 0.15) {
    warnings.push(`ℹ️ Total potongan Shopee memakan ${(effectiveFeeRatio * 100).toFixed(1)}% dari harga pembeli.`);
  }

  return {
    originalPrice,
    discountAmount,
    sellerVoucher,
    customerPrice,
    feeBreakdown,
    totalFees,
    netRevenue,
    hpp: totalHpp,
    netProfit,
    marginPercent,
    breakevenPrice,
    safePrice,
    maxDiscountPercent,
    status,
    warnings
  };
}

export function formatRupiah(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num || 0);
}
