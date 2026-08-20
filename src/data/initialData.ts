import { Product, FeeRule, AppSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'KRM-AJW-500',
    product_name: 'Kurma Ajwa Al-Madinah Premium 500g (Kurma Nabi Original)',
    category: 'Kurma Ajwa',
    image_url: 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=400&q=80&auto=format&fit=crop',
    hppBreakdown: {
      rawCost: 45000,
      packagingCost: 5000,
      shippingInCost: 3000,
      overheadCost: 2000
    },
    total_hpp: 55000,
    normal_price: 120000,
    stock: 150,
    expiry_date: '2027-02-15',
    target_profit: 25000,
    target_margin: 0.20,
    status: 'ACTIVE'
  },
  {
    id: 'p2',
    sku: 'KRM-SKR-1000',
    product_name: 'Kurma Sukari Al-Qassim Ember/Raja 1kg Soft Dates',
    category: 'Kurma Sukari',
    image_url: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=400&q=80&auto=format&fit=crop',
    hppBreakdown: {
      rawCost: 50000,
      packagingCost: 4000,
      shippingInCost: 4000,
      overheadCost: 2000
    },
    total_hpp: 60000,
    normal_price: 130000,
    stock: 220,
    expiry_date: '2026-11-10',
    target_profit: 20000,
    target_margin: 0.18,
    status: 'ACTIVE'
  },
  {
    id: 'p3',
    sku: 'KRM-MDJ-1000',
    product_name: 'Kurma Medjool Palestina Jumbo Grade A 1kg',
    category: 'Kurma Medjool',
    image_url: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&q=80&auto=format&fit=crop',
    hppBreakdown: {
      rawCost: 160000,
      packagingCost: 10000,
      shippingInCost: 6000,
      overheadCost: 4000
    },
    total_hpp: 180000,
    normal_price: 290000,
    stock: 45,
    expiry_date: '2026-09-20',
    target_profit: 50000,
    target_margin: 0.22,
    status: 'ACTIVE'
  },
  {
    id: 'p4',
    sku: 'KRM-DGL-500',
    product_name: 'Kurma Tangkai Deglet Noor Tunisia Box 500g',
    category: 'Kurma Deglet Noor',
    image_url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&q=80&auto=format&fit=crop',
    hppBreakdown: {
      rawCost: 28000,
      packagingCost: 3000,
      shippingInCost: 2000,
      overheadCost: 2000
    },
    total_hpp: 35000,
    normal_price: 75000,
    stock: 180,
    expiry_date: '2027-04-01',
    target_profit: 15000,
    target_margin: 0.20,
    status: 'ACTIVE'
  },
  {
    id: 'p5',
    sku: 'KRM-RTB-500',
    product_name: 'Kurma Ruthob Rayan Fresh Frozen 500g (Kurma Muda)',
    category: 'Kurma Ruthob',
    image_url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&q=80&auto=format&fit=crop',
    hppBreakdown: {
      rawCost: 38000,
      packagingCost: 5000,
      shippingInCost: 4000,
      overheadCost: 3000
    },
    total_hpp: 50000,
    normal_price: 95000,
    stock: 60,
    expiry_date: '2026-10-05',
    target_profit: 20000,
    target_margin: 0.21,
    status: 'ACTIVE'
  },
  {
    id: 'p6',
    sku: 'KRM-KHL-1000',
    product_name: 'Kurma Khalas Saad Vacuum Sealed Pack 1kg',
    category: 'Kurma Khalas',
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80&auto=format&fit=crop',
    hppBreakdown: {
      rawCost: 26000,
      packagingCost: 3000,
      shippingInCost: 2500,
      overheadCost: 1500
    },
    total_hpp: 33000,
    normal_price: 65000,
    stock: 300,
    expiry_date: '2027-06-30',
    target_profit: 12000,
    target_margin: 0.20,
    status: 'ACTIVE'
  },
  {
    id: 'p7',
    sku: 'OLH-SRK-350',
    product_name: 'Sari Kurma Murni Al-Jazira Botol 350ml Extra Habbatussauda',
    category: 'Olahan Kurma',
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80&auto=format&fit=crop',
    hppBreakdown: {
      rawCost: 16000,
      packagingCost: 3000,
      shippingInCost: 1500,
      overheadCost: 1500
    },
    total_hpp: 22000,
    normal_price: 48000,
    stock: 110,
    expiry_date: '2027-08-15',
    target_profit: 10000,
    target_margin: 0.22,
    status: 'ACTIVE'
  },
  {
    id: 'p8',
    sku: 'OLH-CKT-250',
    product_name: 'Cokelat Kurma Isi Kacang Almond Premium Gift Box 250g',
    category: 'Olahan Kurma',
    image_url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80&auto=format&fit=crop',
    hppBreakdown: {
      rawCost: 32000,
      packagingCost: 6000,
      shippingInCost: 2000,
      overheadCost: 3000
    },
    total_hpp: 43000,
    normal_price: 89000,
    stock: 85,
    expiry_date: '2026-12-01',
    target_profit: 18000,
    target_margin: 0.22,
    status: 'ACTIVE'
  }
];

export const INITIAL_FEES: FeeRule[] = [
  {
    id: 'f1',
    fee_name: 'Biaya Admin Regular (Star/Star+)',
    fee_type: 'percentage',
    rate: 0.055, // 5.5% untuk Star Seller kategori Makanan/Minuman
    fixed_amount: 0,
    tier: 'STAR_SELLER',
    category_tag: 'Regular',
    is_optional: false,
    status: 'ACTIVE'
  },
  {
    id: 'f2',
    fee_name: 'Biaya Admin Regular (Shopee Mall)',
    fee_type: 'percentage',
    rate: 0.065, // 6.5% Mall
    fixed_amount: 0,
    tier: 'SHOPEE_MALL',
    category_tag: 'Regular',
    is_optional: false,
    status: 'ACTIVE'
  },
  {
    id: 'f3',
    fee_name: 'Biaya Admin Regular (Non-Star)',
    fee_type: 'percentage',
    rate: 0.040, // 4.0% Non-Star
    fixed_amount: 0,
    tier: 'NON_STAR',
    category_tag: 'Regular',
    is_optional: false,
    status: 'ACTIVE'
  },
  {
    id: 'f4',
    fee_name: 'Biaya Gratis Ongkir XTRA',
    fee_type: 'percentage',
    rate: 0.040, // 4.0% maks Rp10.000 per produk
    fixed_amount: 0,
    max_cap: 10000,
    tier: 'ALL',
    category_tag: 'Gratis Ongkir XTRA',
    is_optional: true,
    status: 'ACTIVE'
  },
  {
    id: 'f5',
    fee_name: 'Biaya Promo / Cashback XTRA+',
    fee_type: 'percentage',
    rate: 0.045, // 4.5%
    fixed_amount: 0,
    max_cap: 50000,
    tier: 'ALL',
    category_tag: 'Cashback XTRA',
    is_optional: true,
    status: 'ACTIVE'
  },
  {
    id: 'f6',
    fee_name: 'Biaya Layanan Penanganan / Transaksi',
    fee_type: 'percentage',
    rate: 0.010, // 1%
    fixed_amount: 0,
    tier: 'ALL',
    category_tag: 'Proses Transaksi',
    is_optional: false,
    status: 'ACTIVE'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  expiryWarningMonths: 3,
  defaultSellerTier: 'STAR_SELLER',
  targetMarginDefault: 20,
  storeName: 'Toko Kurma Berkah Shopee',
  autoSync: true
};
