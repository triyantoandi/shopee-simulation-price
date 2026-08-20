import React, { useState } from 'react';
import { Calendar, Store, Layers, Database, Bell, Check, X } from 'lucide-react';
import { EventNotification } from '../types';

interface HeaderProps {
  activeTab: string;
  storeName: string;
  isCloudConnected?: boolean;
  notifications?: EventNotification[];
  onSelectNotification?: (eventId: string) => void;
  onMarkNotificationRead?: (notifId: string) => void;
  onClearAllNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  storeName,
  isCloudConnected = true,
  notifications = [],
  onSelectNotification,
  onMarkNotificationRead,
  onClearAllNotifications
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const pageTitles: Record<string, string> = {
    dashboard: 'Panel Performa & Ringkasan Profit',
    calendar: 'Marketing & Promo Calendar Engine',
    simulator: 'Simulator Harga, Promo & Fee Shopee',
    bundling: 'Kalkulator Bundling & Hampers Kurma',
    products: 'Master Produk Kurma & Manajemen HPP',
    fees: 'Konfigurasi Biaya Penjual Shopee',
    settings: 'Pengaturan Sistem & Preferensi'
  };

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 z-20 relative">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 rounded-2xl bg-[#FFF2EE] text-[#EE4D2D] border border-[#FFDCD3]">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 leading-tight">
            {pageTitles[activeTab] || 'Kurma Shopee Pricing'}
          </h2>
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium mt-0.5">
            <Store className="w-3.5 h-3.5 text-[#EE4D2D]" />
            {storeName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Event Reminder Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-[#EE4D2D] border border-slate-200 transition-all relative cursor-pointer"
            title="Pemberitahuan & Reminder Event"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EE4D2D] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-fade-in">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold">Pemberitahuan Event Promo</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                {notifications.length > 0 && onClearAllNotifications && (
                  <button
                    onClick={onClearAllNotifications}
                    className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (onSelectNotification) onSelectNotification(n.eventId);
                        if (onMarkNotificationRead) onMarkNotificationRead(n.id);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3.5 hover:bg-orange-50/50 transition-colors cursor-pointer flex items-start gap-2.5 ${
                        !n.isRead ? 'bg-orange-50/20' : ''
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                          n.daysRemaining === 0
                            ? 'bg-rose-500 text-white'
                            : n.daysRemaining <= 7
                            ? 'bg-orange-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        {n.reminderType}
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-800 line-clamp-1">
                            {n.eventTitle}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            📅 {n.eventDate}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400">
                    <p className="text-xs font-bold">Belum ada reminder promo aktif.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
          <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Firebase Firestore Active</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-[#EE4D2D]" />
          <span>{currentDateStr}</span>
        </div>
      </div>
    </header>
  );
};
