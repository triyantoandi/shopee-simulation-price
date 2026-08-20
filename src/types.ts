export type FeeType = 'percentage' | 'fixed';
export type SellerTier = 'NON_STAR' | 'STAR_SELLER' | 'SHOPEE_MALL';
export type ProductStatus = 'ACTIVE' | 'INACTIVE';
export type CalculationStatus = 'SAFE' | 'WARNING' | 'LOSS';

export interface HppBreakdown {
  rawCost: number;       // Harga beli kurma per unit/kg
  packagingCost: number; // Dus, bubble wrap, pouch, sticker
  shippingInCost: number;// Ongkir masuk / handling
  overheadCost: number;  // Biaya operasional/tenaga kerja
}

export interface Product {
  id: string;
  sku: string;
  product_name: string;
  category: string;
  image_url?: string;     // URL or base64 data URL
  hppBreakdown: HppBreakdown;
  total_hpp: number;      // Calculated or overridden
  normal_price: number;   // Harga Normal / Coret (Rp)
  stock: number;
  expiry_date: string;    // YYYY-MM-DD
  target_profit: number;  // Target untung dalam Rp
  target_margin: number;  // Target margin (misal 0.15 = 15%)
  status: ProductStatus;
  created_at?: string;
}

export interface FeeRule {
  id: string;
  fee_name: string;
  fee_type: FeeType;
  rate: number;         // Decimal (e.g. 0.05 for 5%)
  fixed_amount: number; // Rp if fee_type is fixed
  max_cap?: number;     // Maximum cap in Rp if applicable (e.g. Gratis Ongkir cap)
  tier: SellerTier | 'ALL';
  category_tag?: string;// e.g. 'ALL' or 'XTRA'
  is_optional?: boolean;// Controlled by toggle switch in simulator
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SimulationParams {
  productId?: string;
  originalPrice: number;    // Harga Coret / Normal
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;    // % or Rp
  sellerVoucher: number;    // Rp ditanggung penjual
  xtraActive: boolean;      // Promo XTRA+ / Cashback XTRA
  freeShippingActive: boolean; // Gratis Ongkir XTRA
  affiliateActive: boolean; // Program Affiliate
  affiliateRate: number;    // % rate (e.g. 5%)
  sellerTier: SellerTier;   // Non-Star, Star, Mall
  quantity: number;
  totalHpp: number;
  targetProfit: number;
  targetMargin: number;
}

export interface FeeItemBreakdown {
  name: string;
  amount: number;
  rateLabel: string;
}

export interface SimulationResult {
  originalPrice: number;
  discountAmount: number;
  sellerVoucher: number;
  customerPrice: number;    // Harga Pembeli
  feeBreakdown: FeeItemBreakdown[];
  totalFees: number;
  netRevenue: number;       // Customer Price - Total Fees
  hpp: number;
  netProfit: number;        // Net Revenue - HPP
  marginPercent: number;    // (Net Profit / Customer Price) * 100
  breakevenPrice: number;   // Minimal customer price to hit Rp0 profit
  safePrice: number;        // Recommended customer price to hit target margin
  maxDiscountPercent: number; // Max discount % on original price before loss
  status: CalculationStatus;
  warnings: string[];
}

export interface AppSettings {
  expiryWarningMonths: number;
  defaultSellerTier: SellerTier;
  targetMarginDefault: number; // e.g. 15 (%)
  storeName: string;
  autoSync: boolean;
}

export interface DashboardStats {
  totalSku: number;
  activeSku: number;
  safeCount: number;
  warningCount: number;
  lossCount: number;
  expiringCount: number;
  expiredCount: number;
  avgMargin: number;
  totalInventoryValue: number;
}

// ==========================================
// MARKETING & PROMO CALENDAR TYPES
// ==========================================

export type EventCategory =
  | 'NATIONAL_HOLIDAY'
  | 'COLLECTIVE_LEAVE'
  | 'NATIONAL_DAY'
  | 'INTERNATIONAL_DAY'
  | 'ECOMMERCE'
  | 'DOUBLE_DATE'
  | 'PAYDAY'
  | 'SEASONAL'
  | 'COMPANY_EVENT'
  | 'CUSTOM';

export type EventPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EventSourceType = 'SYSTEM' | 'OFFICIAL' | 'MARKETPLACE' | 'CUSTOM';

export type EventPlatform =
  | 'Shopee'
  | 'Tokopedia'
  | 'TikTok Shop'
  | 'Lazada'
  | 'Website'
  | 'Instagram'
  | 'WhatsApp'
  | 'Offline'
  | 'All Channels';

export interface EventChecklistItem {
  id: string;
  task: string;
  category: 'PRODUCT' | 'STOCK' | 'PRICE' | 'MARKETING' | 'ADS' | 'OPERATION';
  completed: boolean;
  assignedTo?: string;
  dueDate?: string;
}

export interface EventPromotedProduct {
  productId: string;
  promoPrice: number;
  discountPercent: number;
  notes?: string;
}

export interface MarketingEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD (Asia/Jakarta)
  startDate?: string;
  endDate?: string;
  category: EventCategory;
  subCategory?: string;
  priority: EventPriority;
  sourceType: EventSourceType;
  isOfficial: boolean;
  isConfirmed: boolean;
  isActive: boolean;
  platforms: EventPlatform[];
  reminderEnabled: boolean;
  reminderDays: number[]; // e.g. [30, 14, 7, 3, 1, 0]
  preparationChecklist: EventChecklistItem[];
  promotedProducts: EventPromotedProduct[];
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  year: number;
  postEventSummary?: {
    unitsSold?: number;
    totalRevenue?: number;
    grossProfit?: number;
    notes?: string;
  };
}

export interface EventNotification {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  daysRemaining: number;
  reminderType: 'H-30' | 'H-14' | 'H-7' | 'H-3' | 'H-1' | 'H-0' | 'CUSTOM';
  message: string;
  timestamp: string;
  isRead: boolean;
  targetRole?: 'ALL' | 'ADMIN' | 'MARKETING' | 'STAFF_GUDANG';
  checklistProgress?: number;
}
