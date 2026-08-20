import React, { useState } from 'react';
import { FeeRule, SellerTier } from '../types';
import { formatRupiah } from '../utils/calculator';
import {
  Receipt,
  Plus,
  RotateCcw,
  CheckCircle2,
  Edit,
  Trash2,
  X,
  Save,
  Info
} from 'lucide-react';

interface FeesViewProps {
  fees: FeeRule[];
  onSaveFees: (fees: FeeRule[]) => void;
  onToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const FeesView: React.FC<FeesViewProps> = ({ fees, onSaveFees, onToast }) => {
  const [feeList, setFeeList] = useState<FeeRule[]>(fees);
  const [editingFee, setEditingFee] = useState<FeeRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [feeName, setFeeName] = useState('');
  const [feeType, setFeeType] = useState<'percentage' | 'fixed'>('percentage');
  const [ratePercent, setRatePercent] = useState(5.5);
  const [fixedAmount, setFixedAmount] = useState(0);
  const [maxCap, setMaxCap] = useState(0);
  const [tier, setTier] = useState<SellerTier | 'ALL'>('ALL');
  const [categoryTag, setCategoryTag] = useState('Regular');

  const handleToggleFeeStatus = (id: string) => {
    const updated = feeList.map((f) =>
      f.id === id ? { ...f, status: f.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const) } : f
    );
    setFeeList(updated);
    onSaveFees(updated);
    onToast('Status aturan fee diperbarui!', 'info');
  };

  const handleOpenAdd = () => {
    setEditingFee(null);
    setFeeName('');
    setFeeType('percentage');
    setRatePercent(4.0);
    setFixedAmount(0);
    setMaxCap(0);
    setTier('ALL');
    setCategoryTag('Custom');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: FeeRule) => {
    setEditingFee(f);
    setFeeName(f.fee_name);
    setFeeType(f.fee_type);
    setRatePercent(f.rate * 100);
    setFixedAmount(f.fixed_amount || 0);
    setMaxCap(f.max_cap || 0);
    setTier(f.tier);
    setCategoryTag(f.category_tag || 'Regular');
    setIsModalOpen(true);
  };

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeName.trim()) return;

    const newFee: FeeRule = {
      id: editingFee ? editingFee.id : `fee_${Date.now()}`,
      fee_name: feeName.trim(),
      fee_type: feeType,
      rate: ratePercent / 100,
      fixed_amount: Number(fixedAmount),
      max_cap: maxCap > 0 ? Number(maxCap) : undefined,
      tier,
      category_tag: categoryTag,
      status: editingFee ? editingFee.status : 'ACTIVE'
    };

    let updatedList: FeeRule[];
    if (editingFee) {
      updatedList = feeList.map((f) => (f.id === editingFee.id ? newFee : f));
    } else {
      updatedList = [...feeList, newFee];
    }

    setFeeList(updatedList);
    onSaveFees(updatedList);
    setIsModalOpen(false);
    onToast(editingFee ? 'Aturan fee berhasil diperbarui!' : 'Aturan fee baru berhasil ditambahkan!', 'success');
  };

  const handleDeleteFee = (id: string, name: string) => {
    if (confirm(`Hapus aturan fee "${name}"?`)) {
      const updated = feeList.filter((f) => f.id !== id);
      setFeeList(updated);
      onSaveFees(updated);
      onToast(`Aturan fee "${name}" telah dihapus`, 'warning');
    }
  };

  const handleApplyPreset = (presetTier: SellerTier) => {
    const updated = feeList.map((f) => {
      if (f.category_tag === 'Regular') {
        if (presetTier === 'STAR_SELLER') {
          return { ...f, rate: 0.055, fee_name: 'Biaya Admin Regular (Star/Star+ 5.5%)' };
        } else if (presetTier === 'SHOPEE_MALL') {
          return { ...f, rate: 0.065, fee_name: 'Biaya Admin Regular (Shopee Mall 6.5%)' };
        } else {
          return { ...f, rate: 0.040, fee_name: 'Biaya Admin Regular (Non-Star 4.0%)' };
        }
      }
      return f;
    });

    setFeeList(updated);
    onSaveFees(updated);
    onToast(`Preset Shopee ${presetTier.replace('_', ' ')} diterapkan!`, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-50 rounded-2xl text-[#EE4D2D]">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-xl">Aturan Potongan Biaya Shopee</h3>
            <p className="text-xs text-slate-500">
              Sesuaikan persentase admin seller, potongan Gratis Ongkir XTRA, & promo Shopee
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-full bg-[#EE4D2D] text-white font-bold text-xs hover:bg-orange-600 transition-all flex items-center gap-1.5 shadow-md shadow-[#EE4D2D]/20"
        >
          <Plus className="w-4 h-4" />
          Tambah Aturan Fee
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="bg-orange-50/60 p-6 rounded-2xl border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">
            Standard Preset Biaya Admin Shopee Indonesia
          </h4>
          <p className="text-xs text-slate-600">
            Pilih tier toko Anda untuk memperbarui rate admin regular secara otomatis
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleApplyPreset('NON_STAR')}
            className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:border-[#EE4D2D] hover:text-[#EE4D2D] shadow-2xs transition-all"
          >
            Non-Star (4.0%)
          </button>
          <button
            onClick={() => handleApplyPreset('STAR_SELLER')}
            className="px-4 py-2 rounded-full bg-[#EE4D2D] text-white font-bold text-xs hover:bg-orange-600 shadow-md shadow-[#EE4D2D]/20 transition-all"
          >
            Star Seller (5.5%)
          </button>
          <button
            onClick={() => handleApplyPreset('SHOPEE_MALL')}
            className="px-4 py-2 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-md shadow-slate-900/20 transition-all"
          >
            Shopee Mall (6.5%)
          </button>
        </div>
      </div>

      {/* Fee Rules Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                <th className="p-4">Nama Biaya Shopee</th>
                <th className="p-4">Kategori Program</th>
                <th className="p-4">Tingkat Penjual</th>
                <th className="p-4">Rate / Besaran Fee</th>
                <th className="p-4">Batas Maks (Cap)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {feeList.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{f.fee_name}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                      {f.category_tag || 'Umum'}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-600">
                    {f.tier === 'ALL' ? 'Semua Tier' : f.tier}
                  </td>
                  <td className="p-4 font-extrabold text-[#EE4D2D]">
                    {f.fee_type === 'percentage'
                      ? `${(f.rate * 100).toFixed(1)}%`
                      : formatRupiah(f.fixed_amount)}
                  </td>
                  <td className="p-4 text-slate-600">
                    {f.max_cap ? formatRupiah(f.max_cap) : '-'}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleFeeStatus(f.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        f.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {f.status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(f)}
                        className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFee(f.id, f.fee_name)}
                        className="p-1.5 rounded-full text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Fee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editingFee ? 'Edit Aturan Fee Shopee' : 'Tambah Aturan Fee Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFee} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Potongan Biaya</label>
                <input
                  type="text"
                  required
                  value={feeName}
                  onChange={(e) => setFeeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:border-[#EE4D2D]"
                  placeholder="Contoh: Biaya Penanganan 1%"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipe Biaya</label>
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800"
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal Tetap (Rp)</option>
                </select>
              </div>

              {feeType === 'percentage' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Persentase Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={ratePercent}
                    onChange={(e) => setRatePercent(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal Fee (Rp)</label>
                  <input
                    type="number"
                    required
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Batas Maksimal Potongan (Cap Rp) - Opsional</label>
                <input
                  type="number"
                  value={maxCap}
                  onChange={(e) => setMaxCap(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800"
                  placeholder="0 (Tidak ada batas)"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tingkat Penjual (Tier)</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as SellerTier | 'ALL')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800"
                >
                  <option value="ALL">Semua Tier</option>
                  <option value="NON_STAR">Non-Star</option>
                  <option value="STAR_SELLER">Star / Star+</option>
                  <option value="SHOPEE_MALL">Shopee Mall</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#EE4D2D] text-white font-bold hover:bg-orange-600 flex items-center gap-1.5 shadow-md shadow-[#EE4D2D]/20"
                >
                  <Save className="w-4 h-4" />
                  Simpan Aturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
