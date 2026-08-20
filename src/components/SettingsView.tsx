import React, { useState } from 'react';
import { AppSettings, SellerTier } from '../types';
import {
  Settings,
  Save,
  RotateCcw,
  Store,
  ShieldAlert,
  Database
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetData: () => void;
  onToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
  onToast
}) => {
  const [storeName, setStoreName] = useState(settings.storeName || 'Toko Kurma Berkah Shopee');
  const [defaultSellerTier, setDefaultSellerTier] = useState<SellerTier>(settings.defaultSellerTier || 'STAR_SELLER');
  const [expiryWarningMonths, setExpiryWarningMonths] = useState(settings.expiryWarningMonths || 3);
  const [targetMarginDefault, setTargetMarginDefault] = useState(settings.targetMarginDefault || 20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      storeName,
      defaultSellerTier,
      expiryWarningMonths: Number(expiryWarningMonths),
      targetMarginDefault: Number(targetMarginDefault),
      autoSync: settings.autoSync
    };
    onSaveSettings(updated);
    onToast('Pengaturan sistem berhasil disimpan!', 'success');
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data produk & fee ke data awal?')) {
      onResetData();
      onToast('Data berhasil di-reset ke versi awal!', 'warning');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="p-3 bg-orange-50 rounded-2xl text-[#EE4D2D]">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-xl">Pengaturan Sistem & Toko</h3>
          <p className="text-xs text-slate-500">
            Kelola nama toko, ambang peringatan kadaluarsa kurma, dan preset awal
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store & Tier Settings */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#EE4D2D]" />
            Profil Toko & Tier Shopee
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Nama Toko Shopee</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-[#EE4D2D]"
                placeholder="Toko Kurma Utama"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Tingkat Penjual Default</label>
              <select
                value={defaultSellerTier}
                onChange={(e) => setDefaultSellerTier(e.target.value as SellerTier)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-[#EE4D2D]"
              >
                <option value="NON_STAR">Non-Star Seller</option>
                <option value="STAR_SELLER">Star / Star+ Seller</option>
                <option value="SHOPEE_MALL">Shopee Mall</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expiry & Profit Margin Defaults */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#EE4D2D]" />
            Ambang Peringatan Kadaluarsa & Margin
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Batas Peringatan Kadaluarsa Kurma (Bulan)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={expiryWarningMonths}
                onChange={(e) => setExpiryWarningMonths(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-[#EE4D2D]"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Notifikasi kadaluarsa akan aktif jika sisa tanggal kadaluarsa &le; {expiryWarningMonths} bulan.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Target Default Net Margin (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={targetMarginDefault}
                onChange={(e) => setTargetMarginDefault(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-[#EE4D2D]"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Digunakan sebagai batas bawah status AMAN pada simulator.
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#EE4D2D] text-white font-bold text-xs hover:bg-orange-600 transition-all flex items-center gap-2 shadow-md shadow-[#EE4D2D]/20"
            >
              <Save className="w-4 h-4" />
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </form>

      {/* Database Management & Factory Reset */}
      <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#EE4D2D]" />
          Manajemen Data Local Storage
        </h4>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-rose-50/60 rounded-2xl border border-rose-200 text-xs">
          <div>
            <span className="font-bold text-slate-800 block mb-0.5">Reset ke Data Standar Awal</span>
            <span className="text-slate-600">
              Kembalikan daftar produk kurma, fee Shopee, dan pengaturan ke data contoh awal.
            </span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 rounded-full bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors flex items-center gap-1.5 shrink-0 shadow-md shadow-rose-600/20"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Data Awal
          </button>
        </div>
      </div>
    </div>
  );
};
