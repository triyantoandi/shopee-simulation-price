import React, { useState, useMemo } from 'react';
import {
  Product,
  FeeRule,
  AppSettings,
  SellerTier,
  SimulationParams
} from '../types';
import { calculateShopeePrice, formatRupiah } from '../utils/calculator';
import {
  Gift,
  Plus,
  Trash2,
  Package,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  ShoppingBag,
  Layers,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';

interface BundlingViewProps {
  products: Product[];
  fees: FeeRule[];
  settings: AppSettings;
  onSaveProduct: (product: Product) => void;
  onToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  onNavigateToSimulator: (productId: string) => void;
}

interface SelectedBundleItem {
  productId: string;
  qty: number;
}

interface ExtraPackagingCost {
  id: string;
  name: string;
  cost: number;
}

export const BundlingView: React.FC<BundlingViewProps> = ({
  products,
  fees,
  settings,
  onSaveProduct,
  onToast,
  onNavigateToSimulator
}) => {
  // 1. Bundle Metadata
  const [bundleName, setBundleName] = useState('Hampers Berkah Kurma Premium');
  const [bundleSku, setBundleSku] = useState(`HMP-${Math.floor(1000 + Math.random() * 9000)}`);
  
  // 2. Selected Items from Master Products
  const [bundleItems, setBundleItems] = useState<SelectedBundleItem[]>(() => {
    if (products.length >= 2) {
      return [
        { productId: products[0].id, qty: 1 },
        { productId: products[1].id, qty: 1 }
      ];
    } else if (products.length === 1) {
      return [{ productId: products[0].id, qty: 2 }];
    }
    return [];
  });

  // 3. Extra Packaging & Handling Costs
  const [extraCosts, setExtraCosts] = useState<ExtraPackagingCost[]>([
    { id: '1', name: 'Box Hampers Hardcover + Pita', cost: 15000 },
    { id: '2', name: 'Kartu Ucapan & Greeting Card', cost: 2500 },
    { id: '3', name: 'Bubble Wrap & Stiker Premium', cost: 3500 }
  ]);

  // 4. Shopee Fee & Pricing Parameters
  const [sellingPrice, setSellingPrice] = useState<number>(185000); // Normal / Coret Price
  const [discountVal, setDiscountVal] = useState<number>(10); // 10%
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [sellerVoucher, setSellerVoucher] = useState<number>(5000);
  const [sellerTier, setSellerTier] = useState<SellerTier>(settings.defaultSellerTier || 'STAR_SELLER');
  const [freeShippingActive, setFreeShippingActive] = useState<boolean>(true);
  const [xtraActive, setXtraActive] = useState<boolean>(true);
  const [affiliateActive, setAffiliateActive] = useState<boolean>(false);
  const [affiliateRate, setAffiliateRate] = useState<number>(5);

  // New Custom Extra Cost Handler
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraCost, setNewExtraCost] = useState('');

  // Presets
  const handleApplyPreset = (type: 'DUO' | 'TRIO' | 'EXCLUSIVE') => {
    if (products.length === 0) {
      onToast('Tambahkan produk di Master Produk terlebih dahulu.', 'warning');
      return;
    }

    if (type === 'DUO') {
      setBundleName('Hampers Duet Kurma Pilihan');
      setBundleItems(
        products.slice(0, 2).map((p) => ({ productId: p.id, qty: 1 }))
      );
      setExtraCosts([
        { id: '1', name: 'Box Duet Medium + Ribbon', cost: 12000 },
        { id: '2', name: 'Kartu Ucapan Custom', cost: 2000 }
      ]);
      setSellingPrice(135000);
      onToast('Preset Hampers Duet berhasil dimuat!', 'info');
    } else if (type === 'TRIO') {
      setBundleName('Hampers Trio Berkah Ramadhan');
      setBundleItems(
        products.slice(0, 3).map((p) => ({ productId: p.id, qty: 1 }))
      );
      setExtraCosts([
        { id: '1', name: 'Exclusive Hardbox 3 Toples', cost: 22000 },
        { id: '2', name: 'Kartu Ucapan + Hangtag', cost: 3000 },
        { id: '3', name: 'Bubble Wrap & Shredded Paper', cost: 5000 }
      ]);
      setSellingPrice(245000);
      onToast('Preset Hampers Trio Berkah dimuat!', 'info');
    } else {
      setBundleName('Hampers Sultan Grand Gift Box');
      setBundleItems(
        products.slice(0, 4).map((p) => ({ productId: p.id, qty: 1 }))
      );
      setExtraCosts([
        { id: '1', name: 'Wooden Premium Gift Box', cost: 35000 },
        { id: '2', name: 'Kartu Ucapan Gold Foil + Pita Silk', cost: 5000 },
        { id: '3', name: 'Souvenir Sajadah Travel & Tasbih', cost: 20000 },
        { id: '4', name: 'Extra Packaging Safety Layer', cost: 7500 }
      ]);
      setSellingPrice(395000);
      onToast('Preset Hampers Sultan dimuat!', 'info');
    }
  };

  // Add Item
  const handleAddItem = () => {
    if (products.length === 0) return;
    setBundleItems([...bundleItems, { productId: products[0].id, qty: 1 }]);
  };

  // Update Item
  const handleUpdateItem = (index: number, field: keyof SelectedBundleItem, value: any) => {
    const updated = [...bundleItems];
    updated[index] = { ...updated[index], [field]: value };
    setBundleItems(updated);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setBundleItems(bundleItems.filter((_, i) => i !== index));
  };

  // Add Custom Extra Cost
  const handleAddExtraCost = () => {
    if (!newExtraName.trim() || !newExtraCost) return;
    const cost = parseFloat(newExtraCost) || 0;
    setExtraCosts([...extraCosts, { id: Date.now().toString(), name: newExtraName.trim(), cost }]);
    setNewExtraName('');
    setNewExtraCost('');
  };

  const handleRemoveExtraCost = (id: string) => {
    setExtraCosts(extraCosts.filter((e) => e.id !== id));
  };

  // Calculations
  const calculatedItemsHpp = useMemo(() => {
    return bundleItems.reduce((sum, item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) return sum;
      return sum + prod.total_hpp * item.qty;
    }, 0);
  }, [bundleItems, products]);

  const calculatedExtraPackagingHpp = useMemo(() => {
    return extraCosts.reduce((sum, cost) => sum + cost.cost, 0);
  }, [extraCosts]);

  const totalBundleHpp = calculatedItemsHpp + calculatedExtraPackagingHpp;

  // Breakdown of raw, packaging, shipping, overhead
  const aggregatedHppBreakdown = useMemo(() => {
    let raw = 0;
    let pkg = calculatedExtraPackagingHpp;
    let ship = 0;
    let ovh = 0;

    bundleItems.forEach((item) => {
      const p = products.find((pr) => pr.id === item.productId);
      if (p && p.hppBreakdown) {
        raw += (p.hppBreakdown.rawCost || 0) * item.qty;
        pkg += (p.hppBreakdown.packagingCost || 0) * item.qty;
        ship += (p.hppBreakdown.shippingInCost || 0) * item.qty;
        ovh += (p.hppBreakdown.overheadCost || 0) * item.qty;
      }
    });

    return { raw, pkg, ship, ovh };
  }, [bundleItems, products, calculatedExtraPackagingHpp]);

  // Simulation
  const simParams: SimulationParams = {
    originalPrice: sellingPrice,
    discountType,
    discountValue: discountVal,
    sellerVoucher,
    xtraActive,
    freeShippingActive,
    affiliateActive,
    affiliateRate,
    sellerTier,
    quantity: 1,
    totalHpp: totalBundleHpp,
    targetProfit: 20000,
    targetMargin: settings.targetMarginDefault / 100 || 0.15
  };

  const simResult = calculateShopeePrice(simParams, fees);

  // Save Bundle as Product
  const handleSaveBundleAsProduct = () => {
    if (!bundleName.trim()) {
      onToast('Masukkan nama paket bundling terlebih dahulu.', 'warning');
      return;
    }
    if (bundleItems.length === 0) {
      onToast('Pilih minimal 1 produk kurma untuk paket ini.', 'warning');
      return;
    }

    // Earliest expiry date
    let earliestExpiry = '2026-12-31';
    bundleItems.forEach((item) => {
      const p = products.find((pr) => pr.id === item.productId);
      if (p && p.expiry_date && p.expiry_date < earliestExpiry) {
        earliestExpiry = p.expiry_date;
      }
    });

    // First item's image as bundle image fallback
    let bundleImage = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80&auto=format&fit=crop';
    const firstItem = products.find((pr) => pr.id === bundleItems[0]?.productId);
    if (firstItem && firstItem.image_url) {
      bundleImage = firstItem.image_url;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      sku: bundleSku || `HMP-${Math.floor(1000 + Math.random() * 9000)}`,
      product_name: bundleName.trim(),
      category: 'Paket Hampers',
      image_url: bundleImage,
      hppBreakdown: {
        rawCost: aggregatedHppBreakdown.raw,
        packagingCost: aggregatedHppBreakdown.pkg,
        shippingInCost: aggregatedHppBreakdown.ship,
        overheadCost: aggregatedHppBreakdown.ovh
      },
      total_hpp: totalBundleHpp,
      normal_price: sellingPrice,
      stock: 15,
      expiry_date: earliestExpiry,
      target_profit: Math.max(0, simResult.netProfit),
      target_margin: simResult.marginPercent / 100,
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    };

    onSaveProduct(newProduct);
    onToast(`Paket [${bundleName}] tersimpan di Master Produk & Firestore!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-[#EE4D2D] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider text-amber-100">
              <Gift className="w-3.5 h-3.5 text-amber-200" />
              <span>Kalkulator Bundling & Hampers Kurma</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              Hitung Akurat HPP Paket Hampers & Profit Shopee
            </h2>
            <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
              Kombinasikan beberapa produk kurma, kemasan box, dan pita hias. Dapatkan simulasi margin, potongan admin Shopee, serta harga jual aman secara instan.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleApplyPreset('DUO')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              Preset Duet (2 Toples)
            </button>
            <button
              onClick={() => handleApplyPreset('TRIO')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              Preset Trio Berkah (3 Toples)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bundling Builder (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Informasi Paket */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">
                  Informasi Identitas Paket
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Master SKU Paket</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Paket Bundling / Hampers</label>
                <input
                  type="text"
                  value={bundleName}
                  onChange={(e) => setBundleName(e.target.value)}
                  placeholder="Contoh: Hampers Kurma Ajwa & Sukari Box"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nomor SKU Paket</label>
                <input
                  type="text"
                  value={bundleSku}
                  onChange={(e) => setBundleSku(e.target.value)}
                  placeholder="HMP-001"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Komposisi Kurma dalam Paket */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Komposisi Kurma dari Master Produk
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Pilih varian kurma & porsi kuantitas dalam paket</p>
                </div>
              </div>

              <button
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-xl bg-[#FFF2EE] hover:bg-[#FFE4DC] text-[#EE4D2D] text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Kurma
              </button>
            </div>

            {/* List Item Kurma */}
            <div className="space-y-3">
              {bundleItems.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  Belum ada produk kurma yang dimasukkan. Klik <span className="font-bold text-[#EE4D2D]">+ Tambah Kurma</span>.
                </div>
              ) : (
                bundleItems.map((item, idx) => {
                  const currentProd = products.find((p) => p.id === item.productId);
                  const subtotalHpp = currentProd ? currentProd.total_hpp * item.qty : 0;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-wrap sm:flex-nowrap items-center gap-3 transition-colors hover:bg-slate-100/60"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                        {currentProd?.image_url ? (
                          <img
                            src={currentProd.image_url}
                            alt={currentProd.product_name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-[180px] space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Pilih Varian Kurma</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleUpdateItem(idx, 'productId', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-800 focus:ring-2 focus:ring-[#EE4D2D] outline-none"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              [{p.sku}] {p.product_name} (HPP: {formatRupiah(p.total_hpp)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24 space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Jumlah (Qty)</label>
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) =>
                            handleUpdateItem(idx, 'qty', Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-800 text-center focus:ring-2 focus:ring-[#EE4D2D] outline-none"
                        />
                      </div>

                      <div className="w-32 text-right space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 block">Subtotal HPP</label>
                        <span className="text-xs font-black text-slate-900 block pt-1">
                          {formatRupiah(subtotalHpp)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-2 rounded-xl hover:bg-rose-100 text-rose-500 transition-colors shrink-0 self-end sm:self-center"
                        title="Hapus dari Paket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-800">Total HPP Isi Produk Kurma:</span>
              <span className="font-black text-amber-900 text-sm">{formatRupiah(calculatedItemsHpp)}</span>
            </div>
          </div>

          {/* Section 3: Biaya Kemasan Khusus Hampers & Handling */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Biaya Kemasan Khusus & Handling Hampers
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Box hampers, pita, stiker kustom, kartu ucapan, dan tenaga kemas</p>
                </div>
              </div>
            </div>

            {/* List Extra Costs */}
            <div className="space-y-2">
              {extraCosts.map((extra) => (
                <div
                  key={extra.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  <span className="font-bold text-slate-700">{extra.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900">{formatRupiah(extra.cost)}</span>
                    <button
                      onClick={() => handleRemoveExtraCost(extra.id)}
                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-500 transition-colors"
                      title="Hapus Biaya"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Extra Cost Form */}
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="Nama komponen (mis: Pita Hias & Stiker)"
                value={newExtraName}
                onChange={(e) => setNewExtraName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#EE4D2D] outline-none"
              />
              <input
                type="number"
                placeholder="Biaya (Rp)"
                value={newExtraCost}
                onChange={(e) => setNewExtraCost(e.target.value)}
                className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#EE4D2D] outline-none"
              />
              <button
                onClick={handleAddExtraCost}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-center justify-between text-xs">
              <span className="font-bold text-rose-800">Total Biaya Kemasan & Handling:</span>
              <span className="font-black text-rose-900 text-sm">{formatRupiah(calculatedExtraPackagingHpp)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Simulation & Profit Engine (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Total HPP Card Summary */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Ringkasan Total HPP Modal
                </span>
              </div>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Akurat & Terperinci
              </span>
            </div>

            <div className="text-center py-2">
              <span className="text-xs text-slate-400 font-semibold block mb-1">TOTAL HPP MODAL PAKET BUNDLING</span>
              <span className="text-3xl font-black text-amber-400 tracking-tight">
                {formatRupiah(totalBundleHpp)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">HPP Kurma</span>
                <span className="font-bold text-slate-200">{formatRupiah(calculatedItemsHpp)}</span>
              </div>
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Kemasan & Handling</span>
                <span className="font-bold text-slate-200">{formatRupiah(calculatedExtraPackagingHpp)}</span>
              </div>
            </div>
          </div>

          {/* Setting Harga Jual & Fee Shopee */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calculator className="w-4 h-4 text-[#EE4D2D]" />
              <h3 className="font-extrabold text-slate-800 text-sm">
                Simulasi Harga & Fee Shopee
              </h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Harga Normal / Coret (Rp)</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 focus:ring-2 focus:ring-[#EE4D2D] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Diskon Produk</label>
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                    <input
                      type="number"
                      value={discountVal}
                      onChange={(e) => setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 text-xs font-extrabold text-slate-800 outline-none"
                    />
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="bg-slate-100 text-xs font-bold px-2 text-slate-700 border-l border-slate-200 outline-none"
                    >
                      <option value="PERCENTAGE">%</option>
                      <option value="FIXED">Rp</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Voucher Penjual (Rp)</label>
                  <input
                    type="number"
                    value={sellerVoucher}
                    onChange={(e) => setSellerVoucher(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                  />
                </div>
              </div>

              {/* Toggles Promo Shopee */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                  Program Promo & Komisi Shopee
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={freeShippingActive}
                      onChange={(e) => setFreeShippingActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#EE4D2D] focus:ring-[#EE4D2D] accent-[#EE4D2D]"
                    />
                    <span className="font-bold text-slate-700">Gratis Ongkir XTRA</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={xtraActive}
                      onChange={(e) => setXtraActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#EE4D2D] focus:ring-[#EE4D2D] accent-[#EE4D2D]"
                    />
                    <span className="font-bold text-slate-700">Cashback XTRA</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Results Outcome Card */}
          <div
            className={`rounded-3xl p-6 border shadow-md space-y-4 transition-all ${
              simResult.status === 'SAFE'
                ? 'bg-emerald-50/80 border-emerald-200'
                : simResult.status === 'WARNING'
                ? 'bg-amber-50/80 border-amber-200'
                : 'bg-rose-50/80 border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                Hasil Keuntungan Bersih
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                  simResult.status === 'SAFE'
                    ? 'bg-emerald-600 text-white'
                    : simResult.status === 'WARNING'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {simResult.status === 'SAFE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {simResult.status === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5" />}
                {simResult.status === 'LOSS' && <XCircle className="w-3.5 h-3.5" />}
                <span>
                  {simResult.status === 'SAFE'
                    ? 'PROFIT AMAN'
                    : simResult.status === 'WARNING'
                    ? 'MARGIN RENDAH'
                    : 'RUGI / BEP'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/90 p-3 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-500 block">HARGA PEMBELI</span>
                <span className="text-base font-black text-slate-900">{formatRupiah(simResult.customerPrice)}</span>
              </div>

              <div className="bg-white/90 p-3 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-500 block">FEE ADMIN SHOPEE</span>
                <span className="text-base font-black text-rose-600">-{formatRupiah(simResult.totalFees)}</span>
              </div>

              <div className="bg-white/90 p-3 rounded-2xl border border-slate-200/60 col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600">PROFIT BERSIH (NET PROFIT)</span>
                  <span className="text-xs font-black text-slate-500">Margin: {simResult.marginPercent.toFixed(1)}%</span>
                </div>
                <span
                  className={`text-2xl font-black block pt-1 ${
                    simResult.netProfit > 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {formatRupiah(simResult.netProfit)}
                </span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200/60 font-semibold text-slate-700">
              <div className="flex justify-between">
                <span>Rekomendasi Harga Minimal (BEP):</span>
                <span className="font-extrabold text-slate-900">{formatRupiah(simResult.breakevenPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Rekomendasi Harga Aman (Margin 15%):</span>
                <span className="font-extrabold text-emerald-700">{formatRupiah(simResult.safePrice)}</span>
              </div>
            </div>

            {/* Save Button Action */}
            <button
              onClick={handleSaveBundleAsProduct}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#EE4D2D] to-[#FF7337] hover:from-[#d83f21] hover:to-[#e65c23] text-white font-black text-xs transition-all shadow-md shadow-[#EE4D2D]/20 flex items-center justify-center gap-2 active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Simpan Sebagai Produk Paket di Master Produk</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
