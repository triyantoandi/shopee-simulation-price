import React, { useState } from 'react';
import {
  MarketingEvent,
  Product,
  FeeRule,
  AppSettings,
  EventChecklistItem,
  EventPromotedProduct
} from '../../types';
import { formatRupiah, calculateShopeePrice } from '../../utils/calculator';
import { getSmartRecommendations } from '../../data/calendarData';
import {
  X,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Tag,
  AlertTriangle,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

interface EventDetailModalProps {
  event: MarketingEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveEvent: (updatedEvent: MarketingEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  products: Product[];
  fees: FeeRule[];
  settings?: AppSettings;
  isAdmin?: boolean;
  onNavigateToSimulator?: (productId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onSaveEvent,
  onDeleteEvent,
  products,
  fees,
  settings,
  isAdmin = true,
  onNavigateToSimulator
}) => {
  if (!isOpen || !event) return null;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CHECKLIST' | 'PRODUCTS' | 'TIMELINE' | 'POST_EVENT'>('OVERVIEW');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<EventChecklistItem['category']>('MARKETING');
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>(products[0]?.id || '');
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(10);
  const [customNote, setCustomNote] = useState<string>(event.notes || '');

  const now = new Date();
  const jakartaDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
  const today = new Date(jakartaDateStr);
  const eventDate = new Date(event.date);
  const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const totalTasks = event.preparationChecklist?.length || 0;
  const completedTasks = event.preparationChecklist?.filter((t) => t.completed).length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const recommendations = getSmartRecommendations(event.category, event.title);

  const handleToggleTask = (taskId: string) => {
    const updatedChecklist = event.preparationChecklist.map((item) =>
      item.id === taskId ? { ...item, completed: !item.completed } : item
    );
    onSaveEvent({
      ...event,
      preparationChecklist: updatedChecklist,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newItem: EventChecklistItem = {
      id: `task_${Date.now()}`,
      task: newTaskText.trim(),
      category: newTaskCategory,
      completed: false
    };

    onSaveEvent({
      ...event,
      preparationChecklist: [...(event.preparationChecklist || []), newItem],
      updatedAt: new Date().toISOString()
    });
    setNewTaskText('');
  };

  const handleRemoveTask = (taskId: string) => {
    const updatedChecklist = event.preparationChecklist.filter((item) => item.id !== taskId);
    onSaveEvent({
      ...event,
      preparationChecklist: updatedChecklist,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddPromotedProduct = () => {
    if (!selectedProductToAdd) return;
    const targetProd = products.find((p) => p.id === selectedProductToAdd);
    if (!targetProd) return;

    if (event.promotedProducts?.some((pp) => pp.productId === selectedProductToAdd)) {
      alert('Produk ini sudah ada di daftar promo event.');
      return;
    }

    const discountedPrice = Math.round(targetProd.normal_price * (1 - promoDiscountPercent / 100));
    const newPromoProd: EventPromotedProduct = {
      productId: selectedProductToAdd,
      promoPrice: discountedPrice,
      discountPercent: promoDiscountPercent,
      notes: `Diskon ${promoDiscountPercent}% Spesial Event`
    };

    onSaveEvent({
      ...event,
      promotedProducts: [...(event.promotedProducts || []), newPromoProd],
      updatedAt: new Date().toISOString()
    });
  };

  const handleRemovePromotedProduct = (productId: string) => {
    const updated = (event.promotedProducts || []).filter((pp) => pp.productId !== productId);
    onSaveEvent({
      ...event,
      promotedProducts: updated,
      updatedAt: new Date().toISOString()
    });
  };

  const handleSaveNotes = () => {
    onSaveEvent({
      ...event,
      notes: customNote,
      updatedAt: new Date().toISOString()
    });
  };

  const handleToggleActive = () => {
    onSaveEvent({
      ...event,
      isActive: !event.isActive,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:px-6 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EE4D2D] to-orange-500 flex items-center justify-center text-white font-bold shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {event.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Prioritas: {event.priority}
                </span>
                {!event.isConfirmed && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    Perkiraan (Estimated)
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-white mt-0.5">
                {event.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-100 bg-slate-50/70 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Ringkasan & Tips' },
            { id: 'CHECKLIST', label: `Checklist (${completedTasks}/${totalTasks})` },
            { id: 'PRODUCTS', label: `Produk Promo (${event.promotedProducts?.length || 0})` },
            { id: 'TIMELINE', label: 'Rencana Timeline' },
            { id: 'POST_EVENT', label: 'Evaluasi Pasca Event' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#EE4D2D] text-[#EE4D2D] bg-white rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                  <span className="text-[10px] font-bold text-orange-600 block uppercase">
                    Status Hitung Mundur
                  </span>
                  <div className="text-xl font-black text-slate-900 mt-1 flex items-center gap-1.5">
                    {diffDays === 0 ? (
                      <span className="text-rose-600">🔥 EVENT HARI INI</span>
                    ) : diffDays < 0 ? (
                      <span className="text-slate-500">✓ Selesai ({Math.abs(diffDays)} hari lalu)</span>
                    ) : (
                      <span className="text-[#EE4D2D]">{diffDays} Hari Lagi (D-{diffDays})</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                    📅 Tanggal: {event.date}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    Progress Persiapan Tim
                  </span>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {progressPercent}% Siap
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        progressPercent === 100 ? 'bg-emerald-500' : 'bg-[#EE4D2D]'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    Target Channel / Platform
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {event.platforms?.map((plat) => (
                      <span
                        key={plat}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs"
                      >
                        {plat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs text-slate-700">
                  <span className="font-extrabold text-slate-900 block mb-1">Keterangan Event:</span>
                  <p>{event.description}</p>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-900">
                  <Sparkles className="w-4 h-4 text-[#EE4D2D]" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider">
                    Strategi Promo & Rekomendasi Pintar untuk Event Ini
                  </h4>
                </div>
                <ul className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs font-semibold text-slate-700 flex items-start gap-2">
                      <span className="text-[#EE4D2D] font-bold shrink-0">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Catatan Internal Toko / Strategi Khusus
                </label>
                <textarea
                  rows={3}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Tuliskan catatan khusus untuk tim gudang, customer service, atau admin live..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#EE4D2D] focus:bg-white"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-1.5 rounded-full bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHECKLIST */}
          {activeTab === 'CHECKLIST' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Preparation Checklist ({completedTasks}/{totalTasks} Selesai)
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Tandai task persiapan operasional, stok, dan promosi sebelum hari H
                </p>
              </div>

              <form onSubmit={handleAddTask} className="flex gap-2">
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="PRODUCT">PRODUK</option>
                  <option value="STOCK">STOK</option>
                  <option value="PRICE">HARGA</option>
                  <option value="MARKETING">MARKETING</option>
                  <option value="ADS">IKLAN</option>
                  <option value="OPERATION">OPERASIONAL</option>
                </select>
                <input
                  type="text"
                  placeholder="Tambahkan tugas persiapan baru..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#EE4D2D] focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#EE4D2D] hover:bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
              </form>

              <div className="space-y-2">
                {event.preparationChecklist?.length > 0 ? (
                  event.preparationChecklist.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        task.completed
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-orange-300'
                      }`}
                    >
                      <div
                        onClick={() => handleToggleTask(task.id)}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                        )}
                        <div>
                          <span
                            className={`text-xs font-bold block ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {task.task}
                          </span>
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-100/60 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                            {task.category}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveTask(task.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-full transition-colors cursor-pointer"
                        title="Hapus Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed">
                    Belum ada checklist. Tambahkan task persiapan di atas.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROMOTED PRODUCTS & PRICING ENGINE */}
          {activeTab === 'PRODUCTS' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-3">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#EE4D2D]" />
                  Pilih Produk Kurma untuk Dipromosikan pada Event Ini
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Pilih Produk</label>
                    <select
                      value={selectedProductToAdd}
                      onChange={(e) => setSelectedProductToAdd(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.product_name} (Normal: {formatRupiah(p.normal_price)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Diskon Promo (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={promoDiscountPercent}
                      onChange={(e) => setPromoDiscountPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      onClick={handleAddPromotedProduct}
                      className="w-full py-2 bg-[#EE4D2D] hover:bg-orange-600 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah ke Promo
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Daftar Produk & Simulasi Margin Keuntungan
                </h4>

                {event.promotedProducts?.length > 0 ? (
                  event.promotedProducts.map((promoItem) => {
                    const prod = products.find((p) => p.id === promoItem.productId);
                    if (!prod) return null;

                    const simResult = calculateShopeePrice(
                      {
                        originalPrice: prod.normal_price,
                        discountType: 'PERCENTAGE',
                        discountValue: promoItem.discountPercent,
                        sellerVoucher: 0,
                        xtraActive: true,
                        freeShippingActive: true,
                        affiliateActive: false,
                        affiliateRate: 5,
                        sellerTier: settings?.defaultSellerTier || 'STAR_SELLER',
                        quantity: 1,
                        totalHpp: prod.total_hpp,
                        targetProfit: prod.target_profit || 20000,
                        targetMargin: prod.target_margin || 0.15
                      },
                      fees
                    );

                    const isLowMargin = simResult.marginPercent < (settings?.targetMarginDefault || 15);

                    return (
                      <div
                        key={promoItem.productId}
                        className={`p-4 rounded-2xl border transition-all ${
                          isLowMargin
                            ? 'bg-amber-50/60 border-amber-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {prod.image_url ? (
                                <img
                                  src={prod.image_url}
                                  alt={prod.product_name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ShoppingBag className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-extrabold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                                  {prod.sku}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  Stok: {prod.stock} Unit
                                </span>
                              </div>
                              <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 mt-0.5">
                                {prod.product_name}
                              </h5>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 line-through block">
                                Normal: {formatRupiah(prod.normal_price)}
                              </span>
                              <span className="text-xs font-black text-[#EE4D2D]">
                                Promo: {formatRupiah(simResult.customerPrice)} (-{promoItem.discountPercent}%)
                              </span>
                            </div>

                            <div className="text-right pl-3 border-l border-slate-200">
                              <span className="text-[10px] text-slate-400 block">Est. Net Profit</span>
                              <span
                                className={`text-xs font-black ${
                                  simResult.netProfit > 0 ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {formatRupiah(simResult.netProfit)} ({simResult.marginPercent.toFixed(1)}%)
                              </span>
                            </div>

                            <button
                              onClick={() => handleRemovePromotedProduct(promoItem.productId)}
                              className="p-1.5 text-slate-300 hover:text-rose-600 rounded-full transition-colors cursor-pointer"
                              title="Hapus dari Promo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {isLowMargin && (
                          <div className="mt-2.5 pt-2.5 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-amber-900">
                            <span className="flex items-center gap-1 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              Margin promo ({simResult.marginPercent.toFixed(1)}%) di bawah batas standar.
                            </span>
                            {onNavigateToSimulator && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onNavigateToSimulator(prod.id);
                                }}
                                className="text-xs font-bold text-[#EE4D2D] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                Buka Simulator Lengkap
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed">
                    Belum ada produk yang didaftarkan untuk event promo ini.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Panduan Waktu Persiapan Terstruktur (Milestone Strategy)
              </h4>

              <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {[
                  { phase: 'H-30', title: 'Planning & Forecasting', desc: 'Riset tren kurma, forecast kebutuhan stok, dan koordinasi dengan supplier importir.' },
                  { phase: 'H-14', title: 'Product & Stock Packaging', desc: 'Pastikan toples, box hampers, label expired, dan bubble wrap sudah ready di gudang.' },
                  { phase: 'H-7', title: 'Campaign & Voucher Setup', desc: 'Daftarkan produk ke program promo Shopee, pasang voucher toko, dan mulai teaser medsos.' },
                  { phase: 'H-3', title: 'Final Content & Ads Checking', desc: 'Top up saldo Shopee Ads, siapkan jadwal live streaming, dan buat broadcast chat.' },
                  { phase: 'H-1', title: 'Operational Standby', desc: 'Briefing tim packing, standby printer resi, dan konfirmasi jadwal pick-up ekspedisi.' },
                  { phase: 'H-0', title: 'EVENT EXECUTION', desc: 'Pantau live chat, percepat proses packing, dan pantau stok habis secara real-time.' },
                  { phase: 'H+1', title: 'Post-Event Sales Analysis', desc: 'Evaluasi total omset, profit bersih, dan rekap kepuasan pembeli.' }
                ].map((item, idx) => (
                  <div key={idx} className="relative pl-9 flex items-start gap-3">
                    <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[#EE4D2D] border-2 border-white ring-2 ring-orange-200 shrink-0" />
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#EE4D2D] uppercase">
                          {item.phase}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: POST-EVENT */}
          {activeTab === 'POST_EVENT' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Evaluasi Penjualan Pasca Event
              </h4>
              <p className="text-xs text-slate-500">
                Catat ringkasan performa penjualan setelah event berakhir untuk perbandingan tahun berikutnya.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block">Total Unit Terjual</span>
                  <span className="text-lg font-black text-slate-900 block mt-1">
                    {event.postEventSummary?.unitsSold || 0} Unit
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block">Total Omset Penjualan</span>
                  <span className="text-lg font-black text-slate-900 block mt-1">
                    {formatRupiah(event.postEventSummary?.totalRevenue || 0)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 block">Gross Profit Bersih</span>
                  <span className="text-lg font-black text-emerald-700 block mt-1">
                    {formatRupiah(event.postEventSummary?.grossProfit || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-white flex items-center justify-between sticky bottom-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleActive}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                event.isActive
                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {event.isActive ? 'Nonaktifkan Event' : 'Aktifkan Event'}
            </button>

            {event.sourceType === 'CUSTOM' && onDeleteEvent && (
              <button
                onClick={() => onDeleteEvent(event.id)}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Custom Event
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
