import React, { useState, useEffect } from 'react';
import { Product, FeeRule, SellerTier, SimulationResult } from '../types';
import { calculateShopeePrice, formatRupiah } from '../utils/calculator';
import {
  Calculator,
  ShoppingBag,
  Percent,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Printer,
  Sparkles,
  ChevronDown,
  Info,
  Image as ImageIcon
} from 'lucide-react';

interface SimulatorViewProps {
  products: Product[];
  fees: FeeRule[];
  selectedProductId?: string;
  onToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  products,
  fees,
  selectedProductId,
  onToast
}) => {
  const [selectedProdId, setSelectedProdId] = useState<string>(selectedProductId || '');
  const [sellerTier, setSellerTier] = useState<SellerTier>('STAR_SELLER');
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [sellerVoucher, setSellerVoucher] = useState<number>(0);
  const [xtraActive, setXtraActive] = useState<boolean>(true);
  const [freeShippingActive, setFreeShippingActive] = useState<boolean>(true);
  const [affiliateActive, setAffiliateActive] = useState<boolean>(false);
  const [affiliateRate, setAffiliateRate] = useState<number>(5);
  const [totalHpp, setTotalHpp] = useState<number>(0);
  const [targetProfit, setTargetProfit] = useState<number>(0);
  const [targetMargin, setTargetMargin] = useState<number>(0.20);
  const [showHppDetails, setShowHppDetails] = useState<boolean>(false);

  const activeProduct = products.find(p => p.id === selectedProdId);

  // When selected product changes or initial product passed
  useEffect(() => {
    if (selectedProductId) {
      setSelectedProdId(selectedProductId);
    } else if (products.length > 0 && !selectedProdId) {
      setSelectedProdId(products[0].id);
    }
  }, [selectedProductId, products]);

  useEffect(() => {
    if (activeProduct) {
      setOriginalPrice(activeProduct.normal_price || 0);
      setTotalHpp(activeProduct.total_hpp || 0);
      setTargetProfit(activeProduct.target_profit || 0);
      setTargetMargin(activeProduct.target_margin || 0.20);
    }
  }, [selectedProdId]);

  // Compute simulation result
  const simResult: SimulationResult = calculateShopeePrice(
    {
      productId: selectedProdId,
      originalPrice,
      discountType,
      discountValue,
      sellerVoucher,
      xtraActive,
      freeShippingActive,
      affiliateActive,
      affiliateRate,
      sellerTier,
      quantity: 1,
      totalHpp,
      targetProfit,
      targetMargin
    },
    fees
  );

  const handleCopySummary = () => {
    if (!activeProduct) return;
    const text = `
=== SIMULASI HARGA SHOPEE ===
Produk: ${activeProduct.product_name} (${activeProduct.sku})
Tier Penjual: ${sellerTier}
Harga Coret: ${formatRupiah(simResult.originalPrice)}
Diskon (${discountType === 'PERCENTAGE' ? discountValue + '%' : formatRupiah(discountValue)}): -${formatRupiah(simResult.discountAmount)}
Voucher Toko: -${formatRupiah(simResult.sellerVoucher)}
--------------------------------
Harga Pembeli: ${formatRupiah(simResult.customerPrice)}
Total Potongan Shopee: -${formatRupiah(simResult.totalFees)}
Pendapatan Bersih: ${formatRupiah(simResult.netRevenue)}
Total HPP: -${formatRupiah(simResult.hpp)}
--------------------------------
PROFIT BERSIH: ${formatRupiah(simResult.netProfit)}
NET MARGIN: ${simResult.marginPercent.toFixed(1)}%
Status: ${simResult.status}
Harga Minimal BEP: ${formatRupiah(simResult.breakevenPrice)}
Harga Rekomendasi Target: ${formatRupiah(simResult.safePrice)}
`.trim();

    navigator.clipboard.writeText(text);
    onToast('Ringkasan simulasi disalin ke clipboard!', 'success');
  };

  const handleApplyRecommendedPrice = (price: number) => {
    setOriginalPrice(price);
    setDiscountValue(0);
    setSellerVoucher(0);
    onToast(`Harga diubah ke rekomendasi Rp${price.toLocaleString('id-ID')}`, 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 rounded-2xl text-[#EE4D2D]">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Parameter Simulasi Shopee</h3>
                <p className="text-xs text-slate-500">Pilih produk dan sesuaikan harga serta promo</p>
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pilih Produk Master Kurma
            </label>
            <div className="relative">
              <select
                value={selectedProdId}
                onChange={(e) => setSelectedProdId(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#EE4D2D] focus:bg-white transition-all appearance-none cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.product_name} - (HPP {formatRupiah(p.total_hpp)})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Active Product Visual Summary */}
            {activeProduct && (
              <div className="mt-3 p-3 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {activeProduct.image_url ? (
                    <img
                      src={activeProduct.image_url}
                      alt={activeProduct.product_name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 font-mono">
                      {activeProduct.sku}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 truncate">
                      {activeProduct.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {activeProduct.product_name}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Stok Ready</span>
                  <span className="text-xs font-extrabold text-slate-700">
                    {activeProduct.stock} Unit
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Seller Tier Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Tingkat Penjual / Seller Tier Shopee
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'NON_STAR', label: 'Non-Star Seller' },
                { id: 'STAR_SELLER', label: 'Star / Star+' },
                { id: 'SHOPEE_MALL', label: 'Shopee Mall' }
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSellerTier(tier.id as SellerTier)}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all border ${
                    sellerTier === tier.id
                      ? 'bg-[#EE4D2D] text-white border-[#EE4D2D] shadow-md shadow-[#EE4D2D]/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-orange-50 hover:text-[#EE4D2D]'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Discount Inputs */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Harga Coret / Normal Shopee (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#EE4D2D]">Rp</span>
                <input
                  type="number"
                  value={originalPrice || ''}
                  onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#EE4D2D] focus:bg-white transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipe Diskon Produk
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDiscountType('PERCENTAGE')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      discountType === 'PERCENTAGE'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Persen (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('FIXED')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      discountType === 'FIXED'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Nominal (Rp)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nilai Diskon ({discountType === 'PERCENTAGE' ? '%' : 'Rp'})
                </label>
                <input
                  type="number"
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#EE4D2D] focus:bg-white transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Voucher Toko / Ditanggung Penjual (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#EE4D2D]">Rp</span>
                <input
                  type="number"
                  value={sellerVoucher || ''}
                  onChange={(e) => setSellerVoucher(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#EE4D2D] focus:bg-white transition-all"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Program Features Toggles */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Program Kampanye & Fee Tambahan
            </span>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-orange-50/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={freeShippingActive}
                  onChange={(e) => setFreeShippingActive(e.target.checked)}
                  className="w-4 h-4 text-[#EE4D2D] rounded-md border-slate-300 focus:ring-[#EE4D2D]"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-800">Ikut Gratis Ongkir XTRA</span>
                  <span className="block text-[11px] text-slate-500">Estimasi Fee 4.0% (Maks Rp10.000/item)</span>
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-orange-50/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={xtraActive}
                  onChange={(e) => setXtraActive(e.target.checked)}
                  className="w-4 h-4 text-[#EE4D2D] rounded-md border-slate-300 focus:ring-[#EE4D2D]"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-800">Ikut Promo XTRA+ / Cashback XTRA</span>
                  <span className="block text-[11px] text-slate-500">Estimasi Fee 4.5%</span>
                </div>
              </div>
            </label>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={affiliateActive}
                    onChange={(e) => setAffiliateActive(e.target.checked)}
                    className="w-4 h-4 text-[#EE4D2D] rounded-md border-slate-300 focus:ring-[#EE4D2D]"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Program Shopee Affiliate</span>
                    <span className="block text-[11px] text-slate-500">Komisi khusus kreator / affiliate</span>
                  </div>
                </div>
              </label>
              {affiliateActive && (
                <div className="pl-7 pt-2 flex items-center gap-3">
                  <span className="text-xs text-slate-600 font-semibold">Komisi Affiliate:</span>
                  <input
                    type="number"
                    value={affiliateRate}
                    onChange={(e) => setAffiliateRate(parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#EE4D2D]"
                  />
                  <span className="text-xs font-bold text-[#EE4D2D]">%</span>
                </div>
              )}
            </div>
          </div>

          {/* Modal HPP Accordion Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowHppDetails(!showHppDetails)}
              className="flex items-center justify-between w-full text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <span>Detail Modal HPP Saat Ini: {formatRupiah(totalHpp)}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showHppDetails ? 'rotate-180' : ''}`} />
            </button>

            {showHppDetails && activeProduct && (
              <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bahan Kurma Murni:</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(activeProduct.hppBreakdown.rawCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kemasan (Dus/Box/Pouch):</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(activeProduct.hppBreakdown.packagingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ongkir Masuk & Handling:</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(activeProduct.hppBreakdown.shippingInCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Overhead / Tenaga Kerja:</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(activeProduct.hppBreakdown.overheadCost)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Total HPP Modal:</span>
                  <span>{formatRupiah(totalHpp)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output & Financial Analytics */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Box */}
          <div
            className={`p-7 rounded-3xl border shadow-xs transition-all ${
              simResult.status === 'SAFE'
                ? 'bg-emerald-50 text-slate-900 border-emerald-200'
                : simResult.status === 'WARNING'
                ? 'bg-amber-50 text-slate-900 border-amber-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                STATUS SIMULASI PROFIT
              </span>
              <div
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase ${
                  simResult.status === 'SAFE'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : simResult.status === 'WARNING'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {simResult.status === 'SAFE' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {simResult.status === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                {simResult.status === 'LOSS' && <XCircle className="w-4 h-4 text-rose-600" />}
                <span>
                  {simResult.status === 'SAFE'
                    ? 'PROFIT AMAN'
                    : simResult.status === 'WARNING'
                    ? 'PERINGATAN MARGIN'
                    : 'POTENSI RUGI'}
                </span>
              </div>
            </div>

            {/* Warnings list */}
            {simResult.warnings.length > 0 && (
              <div className="mb-4 space-y-1.5 text-xs leading-relaxed text-slate-600 border-l-2 border-[#EE4D2D] pl-3">
                {simResult.warnings.map((w, idx) => (
                  <p key={idx}>{w}</p>
                ))}
              </div>
            )}

            {/* Main Profit Display */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/80 text-center">
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase">PROFIT BERSIH</span>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {formatRupiah(simResult.netProfit)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase">NET MARGIN</span>
                <span className="text-2xl font-extrabold tracking-tight text-[#EE4D2D]">
                  {simResult.marginPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-base">Rincian Keuangan & Biaya</h4>
              <button
                onClick={handleCopySummary}
                className="text-xs font-bold text-[#EE4D2D] hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full"
              >
                <Copy className="w-3.5 h-3.5" />
                Salin Rincian
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Harga Normal (Coret):</span>
                <span className="font-bold text-slate-800">{formatRupiah(simResult.originalPrice)}</span>
              </div>

              {(simResult.discountAmount > 0 || simResult.sellerVoucher > 0) && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Total Diskon & Voucher:</span>
                  <span>-{formatRupiah(simResult.discountAmount + simResult.sellerVoucher)}</span>
                </div>
              )}

              <div className="flex justify-between p-3 rounded-2xl bg-slate-50 font-extrabold text-slate-900 border border-slate-200">
                <span>Harga Pembeli (Customer Price):</span>
                <span>{formatRupiah(simResult.customerPrice)}</span>
              </div>

              {/* Fee Breakdown Items */}
              <div className="pt-2 space-y-1.5 border-t border-slate-100">
                <span className="block font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                  Potongan Potongan Shopee:
                </span>
                {simResult.feeBreakdown.map((fee, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600 pl-2 border-l-2 border-[#EE4D2D]">
                    <span>
                      {fee.name} <span className="text-[10px] text-slate-400">({fee.rateLabel})</span>
                    </span>
                    <span className="font-medium text-rose-600">-{formatRupiah(fee.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-rose-600 pt-1">
                  <span>Total Potongan Shopee:</span>
                  <span>-{formatRupiah(simResult.totalFees)}</span>
                </div>
              </div>

              {/* Net Revenue & HPP */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Pendapatan Bersih Penjual:</span>
                  <span className="text-emerald-600">{formatRupiah(simResult.netRevenue)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-600">
                  <span>Modal HPP Produk:</span>
                  <span className="text-rose-600">-{formatRupiah(simResult.hpp)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reverse Calculator & Recommendations Card */}
          <div className="bg-slate-900 text-white p-7 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-base text-white">Rekomendasi Ambang Batas Harga</h4>
            </div>

            <div className="space-y-3 text-xs">
              {/* BEP Price */}
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-white">Harga Minimal BEP (Impas)</span>
                  <span className="block text-[11px] text-slate-400">Profit = Rp0</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-amber-400 text-base">
                    {formatRupiah(simResult.breakevenPrice)}
                  </span>
                  <button
                    onClick={() => handleApplyRecommendedPrice(simResult.breakevenPrice)}
                    className="text-[10px] font-bold text-[#EE4D2D] hover:underline"
                  >
                    Terapkan Harga Ini
                  </button>
                </div>
              </div>

              {/* Target Margin Price */}
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-white">
                    Harga Rekomendasi Target Margin ({(targetMargin * 100).toFixed(0)}%)
                  </span>
                  <span className="block text-[11px] text-slate-400">Memenuhi target margin usaha</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-emerald-400 text-base">
                    {formatRupiah(simResult.safePrice)}
                  </span>
                  <button
                    onClick={() => handleApplyRecommendedPrice(simResult.safePrice)}
                    className="text-[10px] font-bold text-amber-400 hover:underline"
                  >
                    Terapkan Harga Ini
                  </button>
                </div>
              </div>

              {/* Max Discount % */}
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-white">Maksimal Diskon Coret</span>
                  <span className="block text-[11px] text-slate-400">Sebelum mengalami kerugian</span>
                </div>
                <span className="font-bold text-amber-400 text-base">
                  {simResult.maxDiscountPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};
