import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  Gift,
  Calendar,
  Package,
  Receipt,
  Settings,
  RefreshCw,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  syncData: () => void;
  isSyncing: boolean;
  expiringCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  syncData,
  isSyncing,
  expiringCount
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Kalender Promo', icon: Calendar },
    { id: 'simulator', label: 'Simulator Promo', icon: Calculator },
    { id: 'bundling', label: 'Kalkulator Bundling', icon: Gift },
    {
      id: 'products',
      label: 'Master Produk',
      icon: Package,
      badge: expiringCount > 0 ? `${expiringCount} Expiry` : undefined
    },
    { id: 'fees', label: 'Aturan Fee Shopee', icon: Receipt },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 relative overflow-hidden select-none shadow-xs">
      {/* Shopee Orange Soft Glow Accent */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#EE4D2D]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col items-center justify-center text-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EE4D2D] to-[#FF7337] flex items-center justify-center text-white shadow-md shadow-[#EE4D2D]/25">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h1 className="font-extrabold text-lg text-slate-800 tracking-tight leading-tight">
              KURMA PRICING
            </h1>
            <span className="text-[10px] font-bold text-[#EE4D2D] uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EE4D2D] inline-block animate-pulse"></span>
              Shopee Profit Engine
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto relative z-10">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#EE4D2D] to-[#FF7337] text-white shadow-md shadow-[#EE4D2D]/25 font-bold'
                  : 'text-slate-600 hover:text-[#EE4D2D] hover:bg-[#FFF2EE]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#EE4D2D]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#FFF2EE] text-[#EE4D2D] border border-[#FFDCD3]'
                }`}>
                  <AlertTriangle className="w-3 h-3" />
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sync Button & Footer */}
      <div className="p-4 border-t border-slate-100 relative z-10 space-y-3 bg-slate-50/50">
        <button
          onClick={syncData}
          disabled={isSyncing}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-[#FFF2EE] hover:text-[#EE4D2D] border border-slate-200 shadow-2xs transition-all duration-200 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#EE4D2D]' : 'text-[#EE4D2D]'}`} />
          <span>{isSyncing ? 'Menyinkronkan...' : 'Sync Data'}</span>
        </button>

        <div className="text-center text-[11px] text-slate-400 font-medium tracking-wide">
          v1.5.0 • Shopee Theme Skin
        </div>
      </div>
    </aside>
  );
};

