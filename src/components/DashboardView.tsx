import React from 'react';
import { Product, FeeRule, DashboardStats, MarketingEvent } from '../types';
import { formatRupiah, calculateShopeePrice } from '../utils/calculator';
import { UpcomingEventsWidget } from './Calendar/UpcomingEventsWidget';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Package,
  ArrowUpRight,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardViewProps {
  products: Product[];
  fees: FeeRule[];
  stats: DashboardStats;
  events?: MarketingEvent[];
  onNavigateToSimulator: (productId?: string) => void;
  onNavigateToProducts: () => void;
  onNavigateToCalendar?: (eventId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  fees,
  stats,
  events = [],
  onNavigateToSimulator,
  onNavigateToProducts,
  onNavigateToCalendar
}) => {
  // Compute Category Performance
  const categoryMap: Record<string, { count: number; totalHpp: number; totalNormalPrice: number }> = {};

  products.filter(p => p.status === 'ACTIVE').forEach(p => {
    if (!categoryMap[p.category]) {
      categoryMap[p.category] = { count: 0, totalHpp: 0, totalNormalPrice: 0 };
    }
    categoryMap[p.category].count += 1;
    categoryMap[p.category].totalHpp += p.total_hpp;
    categoryMap[p.category].totalNormalPrice += p.normal_price;
  });

  const categoryChartData = Object.keys(categoryMap).map(cat => {
    const data = categoryMap[cat];
    const avgHpp = data.totalHpp / data.count;
    const avgPrice = data.totalNormalPrice / data.count;
    const approxMargin = avgPrice > 0 ? ((avgPrice - avgHpp) / avgPrice) * 100 : 0;
    return {
      category: cat,
      rataHarga: Math.round(avgPrice),
      rataHpp: Math.round(avgHpp),
      margin: Math.round(approxMargin)
    };
  });

  // Profit Status Pie Chart Data
  const pieData = [
    { name: 'Aman (Safe)', value: stats.safeCount, color: '#00B56A' },
    { name: 'Peringatan (Warning)', value: stats.warningCount, color: '#FF9800' },
    { name: 'Rugi (Loss)', value: stats.lossCount, color: '#EE4D2D' }
  ].filter(d => d.value > 0);

  // Filter Expiring Products
  const now = new Date();
  const warningLimit = new Date();
  warningLimit.setMonth(now.getMonth() + 3);

  const expiringProducts = products
    .filter(p => p.status === 'ACTIVE' && p.expiry_date)
    .map(p => {
      const expDate = new Date(p.expiry_date);
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...p, diffDays, expDate };
    })
    .filter(p => p.diffDays <= 90) // 3 months or less
    .sort((a, b) => a.diffDays - b.diffDays);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Quick Launcher */}
      <div className="bg-gradient-to-r from-[#EE4D2D] via-[#FF5722] to-[#FF7337] rounded-3xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg shadow-[#EE4D2D]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-xl pointer-events-none"></div>
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-xs font-bold text-white mb-3 backdrop-blur-xs border border-white/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Shopee Profit Engine</span>
          </div>
          <h2 className="text-3xl font-extrabold leading-tight mb-2 tracking-tight">
            Optimalkan Profit Penjualan Kurma Anda
          </h2>
          <p className="text-orange-100 text-sm leading-relaxed font-medium">
            Hitung skenario promo Shopee, kendalikan potongan admin & ongkir XTRA, serta cegah potensi kerugian dari produk hampir kadaluarsa.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigateToSimulator()}
            className="px-8 py-3.5 rounded-2xl bg-white text-[#EE4D2D] font-extrabold text-sm hover:bg-orange-50 shadow-md transition-all flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Simulasi Promo Baru
          </button>
        </div>
      </div>

      {/* Upcoming Promo & Marketing Events Widget */}
      {onNavigateToCalendar && (
        <UpcomingEventsWidget
          events={events}
          onNavigateToCalendar={onNavigateToCalendar}
        />
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total SKU */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total SKU Aktif
            </span>
            <div className="p-2.5 bg-orange-50 rounded-2xl text-[#EE4D2D]">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">
            {stats.activeSku}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Nilai Stok: <span className="font-bold text-slate-800">{formatRupiah(stats.totalInventoryValue)}</span>
          </p>
        </div>

        {/* Profit Aman */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Produk Profit Aman
            </span>
            <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mb-1">
            {stats.safeCount}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Target margin & profit tercapai
          </p>
        </div>

        {/* Warning / Risk */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Peringatan Margin
            </span>
            <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mb-1">
            {stats.warningCount}
          </div>
          <p className="text-xs text-amber-700 font-medium">
            Margin tipis di bawah target
          </p>
        </div>

        {/* Potensi Rugi / Expiry Alert */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Potensi Rugi / Expiry
            </span>
            <div className="p-2.5 bg-rose-50 rounded-2xl text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mb-1">
            {stats.lossCount + stats.expiringCount}
          </div>
          <p className="text-xs text-rose-600 font-medium">
            {stats.expiringCount} SKU perlu promo cuci gudang
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rata-Rata Harga vs HPP per Kategori */}
        <div className="lg:col-span-2 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                Rata-Rata Harga Normal vs Modal HPP
              </h3>
              <p className="text-xs text-slate-500">Perbandingan per kategori produk kurma</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `Rp${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value)), '']}
                  contentStyle={{ borderRadius: '16px', fontSize: '12px', borderColor: '#E2E8F0', backgroundColor: '#FFF' }}
                />
                <Bar dataKey="rataHarga" name="Rata-Rata Harga Normal" fill="#EE4D2D" radius={[8, 8, 0, 0]} />
                <Bar dataKey="rataHpp" name="Rata-Rata HPP Modal" fill="#FF9800" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Distribution Status Profit */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">
              Status Profitabilitas SKU
            </h3>
            <p className="text-xs text-slate-500 mb-4">Proporsi kesehatan harga produk</p>
          </div>
          <div className="h-48 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val} SKU`, 'Jumlah']} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400">Belum ada data produk</div>
            )}
          </div>
          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-xs font-semibold text-slate-600">
              Rata-rata Net Margin Toko: <span className="text-[#EE4D2D] font-extrabold">{stats.avgMargin.toFixed(1)}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Expiry Risk Alert Widget */}
      {expiringProducts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Peringatan Kadaluarsa Kurma (&le; 90 Hari)
                </h3>
                <p className="text-xs text-slate-600">
                  {expiringProducts.length} produk mendekati tanggal kadaluarsa. Buat promo diskon cuci gudang segera!
                </p>
              </div>
            </div>
            <button
              onClick={onNavigateToProducts}
              className="text-xs font-bold text-[#EE4D2D] hover:text-orange-700 flex items-center gap-1"
            >
              Lihat Semua Master <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiringProducts.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-orange-50 text-[#EE4D2D]">
                      {item.sku}
                    </span>
                    <span className={`text-xs font-bold ${item.diffDays <= 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {item.diffDays <= 0 ? 'Sudah Expired!' : `Sisa ${item.diffDays} hari`}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs line-clamp-1 mb-1">
                    {item.product_name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Stok: <span className="font-bold text-slate-700">{item.stock} unit</span> • Exp: {item.expiry_date}
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToSimulator(item.id)}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-[#EE4D2D] text-white font-bold text-xs hover:bg-[#d73d1f] transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  Simulasi Diskon Cuci Gudang
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Product Summary Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              Ringkasan Harga Master Kurma & Proyeksi Profit
            </h3>
            <p className="text-xs text-slate-500">Daftar produk dengan perhitungan estimasi margin Shopee</p>
          </div>
          <button
            onClick={onNavigateToProducts}
            className="text-xs font-bold text-[#EE4D2D] hover:text-orange-700 flex items-center gap-1"
          >
            Atur Master Produk <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <th className="p-4">SKU & Nama Produk</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Total HPP</th>
                <th className="p-4">Harga Normal</th>
                <th className="p-4">Status Sim</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {products.slice(0, 5).map((p) => {
                const res = calculateShopeePrice({
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

                const statusBadge = res.status === 'SAFE'
                  ? <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">AMAN ({res.marginPercent.toFixed(0)}%)</span>
                  : res.status === 'WARNING'
                  ? <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">TIPIS ({res.marginPercent.toFixed(0)}%)</span>
                  : <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">RUGI</span>;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{p.sku}</div>
                      <div className="text-slate-500 line-clamp-1">{p.product_name}</div>
                    </td>
                    <td className="p-4 text-slate-600">{p.category}</td>
                    <td className="p-4 font-semibold text-slate-700">{formatRupiah(p.total_hpp)}</td>
                    <td className="p-4 font-bold text-slate-900">{formatRupiah(p.normal_price)}</td>
                    <td className="p-4">{statusBadge}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onNavigateToSimulator(p.id)}
                        className="px-4 py-1.5 rounded-xl bg-[#EE4D2D] text-white font-bold hover:bg-[#d73d1f] transition-colors shadow-2xs"
                      >
                        Simulasi
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

};
