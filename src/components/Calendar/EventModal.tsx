import React, { useState } from 'react';
import {
  MarketingEvent,
  EventCategory,
  EventPriority,
  EventPlatform
} from '../../types';
import { DEFAULT_CHECKLIST_TEMPLATES } from '../../data/calendarData';
import { X, Calendar, Plus, Sparkles } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: MarketingEvent) => void;
  existingEvent?: MarketingEvent | null;
}

const AVAILABLE_PLATFORMS: EventPlatform[] = [
  'Shopee',
  'Tokopedia',
  'TikTok Shop',
  'Lazada',
  'Website',
  'Instagram',
  'WhatsApp',
  'Offline',
  'All Channels'
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingEvent
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(existingEvent?.title || '');
  const [date, setDate] = useState(
    existingEvent?.date || new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<EventCategory>(
    existingEvent?.category || 'CUSTOM'
  );
  const [priority, setPriority] = useState<EventPriority>(
    existingEvent?.priority || 'MEDIUM'
  );
  const [description, setDescription] = useState(existingEvent?.description || '');
  const [platforms, setPlatforms] = useState<EventPlatform[]>(
    existingEvent?.platforms || ['Shopee', 'Tokopedia', 'TikTok Shop', 'WhatsApp']
  );
  const [reminderEnabled, setReminderEnabled] = useState(
    existingEvent ? existingEvent.reminderEnabled : true
  );

  const togglePlatform = (p: EventPlatform) => {
    if (platforms.includes(p)) {
      setPlatforms(platforms.filter((x) => x !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      alert('Mohon isi nama event dan tanggal pelaksanaan.');
      return;
    }

    const year = new Date(date).getFullYear();
    const rawChecklist =
      DEFAULT_CHECKLIST_TEMPLATES[category as string] ||
      DEFAULT_CHECKLIST_TEMPLATES.GENERAL;

    const initialChecklist =
      existingEvent?.preparationChecklist ||
      rawChecklist.map((item, idx) => ({
        id: `chk_custom_${Date.now()}_${idx}`,
        task: item.task,
        category: item.category,
        completed: false
      }));

    const eventToSave: MarketingEvent = {
      id: existingEvent?.id || `custom_ev_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      date,
      category,
      priority,
      sourceType: existingEvent?.sourceType || 'CUSTOM',
      isOfficial: false,
      isConfirmed: true,
      isActive: true,
      platforms: platforms.length > 0 ? platforms : ['All Channels'],
      reminderEnabled,
      reminderDays: existingEvent?.reminderDays || [30, 14, 7, 3, 1, 0],
      preparationChecklist: initialChecklist,
      promotedProducts: existingEvent?.promotedProducts || [],
      year,
      createdAt: existingEvent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(eventToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 px-6 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EE4D2D] to-orange-500 flex items-center justify-center text-white font-bold shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {existingEvent ? 'Edit Event Promo' : 'Buat Custom Event Promo Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                Jadwalkan promo kurma, flash sale, atau program toko internal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Nama Event Promo *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Flash Sale Ramadhan Berkah Toko"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#EE4D2D] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tanggal Pelaksanaan *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#EE4D2D] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Kategori Event</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#EE4D2D] focus:bg-white"
              >
                <option value="CUSTOM">Custom Toko</option>
                <option value="DOUBLE_DATE">Double Date Promo (1.1 - 12.12)</option>
                <option value="PAYDAY">Payday Sale Gajian</option>
                <option value="SEASONAL">Seasonal / Ramadan / Lebaran</option>
                <option value="ECOMMERCE">E-Commerce Campaign</option>
                <option value="COMPANY_EVENT">Program Khusus Toko</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tingkat Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as EventPriority)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#EE4D2D] focus:bg-white"
              >
                <option value="LOW">Low (Rendah)</option>
                <option value="MEDIUM">Medium (Standar)</option>
                <option value="HIGH">High (Penting)</option>
                <option value="CRITICAL">Critical (Sangat Krusial / Mega Sale)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Notifikasi Reminder</label>
              <div className="flex items-center h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#EE4D2D] rounded focus:ring-orange-500"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Aktifkan Reminder Otomatis (H-30, H-14, H-7, H-1, Hari H)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Target Channel / Platform</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_PLATFORMS.map((p) => {
                const isSelected = platforms.includes(p);
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EE4D2D] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Deskripsi / Sasaran Promo</label>
            <textarea
              rows={3}
              placeholder="Jelaskan tujuan promo, target omset, atau diskon khusus yang direncanakan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#EE4D2D] focus:bg-white"
            />
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 text-[11px] text-orange-950 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#EE4D2D] shrink-0 mt-0.5" />
            <p>
              Event yang dibuat akan otomatis tersimpan di <strong>Firebase Firestore</strong> dan memicu sistem hitung mundur serta checklist persiapan terintegrasi.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#EE4D2D] to-orange-500 text-white text-xs font-bold hover:brightness-105 shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {existingEvent ? 'Simpan Perubahan' : 'Buat Event Promo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
