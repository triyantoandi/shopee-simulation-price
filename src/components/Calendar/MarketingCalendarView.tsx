import React, { useState, useMemo } from 'react';
import {
  MarketingEvent,
  EventCategory,
  EventPriority,
  Product,
  FeeRule,
  AppSettings
} from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  Tag,
  ShoppingBag,
  ListFilter
} from 'lucide-react';
import { EventDetailModal } from './EventDetailModal';
import { EventModal } from './EventModal';

interface MarketingCalendarViewProps {
  events: MarketingEvent[];
  products: Product[];
  fees: FeeRule[];
  settings?: AppSettings;
  onSaveEvent: (event: MarketingEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  onNavigateToSimulator?: (productId: string) => void;
  highlightEventId?: string;
}

export const MarketingCalendarView: React.FC<MarketingCalendarViewProps> = ({
  events,
  products,
  fees,
  settings,
  onSaveEvent,
  onDeleteEvent,
  onToast,
  onNavigateToSimulator,
  highlightEventId
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 0, 1)); // Default Jan 2026 / current
  const [viewMode, setViewMode] = useState<'MONTH' | 'LIST'>('MONTH');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');

  const [selectedEventForDetail, setSelectedEventForDetail] = useState<MarketingEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<MarketingEvent | null>(null);

  // Auto-open highlight event if provided
  React.useEffect(() => {
    if (highlightEventId) {
      const found = events.find((e) => e.id === highlightEventId);
      if (found) {
        setSelectedEventForDetail(found);
        const evDate = new Date(found.date);
        setCurrentDate(new Date(evDate.getFullYear(), evDate.getMonth(), 1));
      }
    }
  }, [highlightEventId, events]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const jakartaDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    const today = new Date(jakartaDateStr);

    return events.filter((ev) => {
      // Search
      if (
        searchQuery &&
        !ev.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !ev.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Category
      if (selectedCategory !== 'ALL' && ev.category !== selectedCategory) {
        return false;
      }
      // Priority
      if (selectedPriority !== 'ALL' && ev.priority !== selectedPriority) {
        return false;
      }
      // Status
      if (statusFilter !== 'ALL') {
        const evDate = new Date(ev.date);
        const isPast = evDate.getTime() < today.getTime();
        if (statusFilter === 'UPCOMING' && isPast) return false;
        if (statusFilter === 'COMPLETED' && !isPast) return false;
      }
      return true;
    });
  }, [events, searchQuery, selectedCategory, selectedPriority, statusFilter]);

  // Monthly Calendar Grid Generator
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
    // Indonesian week starts Monday (0: Mon, 6: Sun)
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        events: filteredEvents.filter((e) => e.date === dateStr)
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const m = currentMonth + 1;
      const dateStr = `${currentYear}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        events: filteredEvents.filter((e) => e.date === dateStr)
      });
    }

    // Next month padding to fill 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingCells; d++) {
      const m = currentMonth + 2 > 12 ? 1 : currentMonth + 2;
      const y = currentMonth + 2 > 12 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        events: filteredEvents.filter((e) => e.date === dateStr)
      });
    }

    return days;
  }, [currentYear, currentMonth, filteredEvents]);

  const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(currentDate);

  const getEventPillColor = (ev: MarketingEvent) => {
    if (ev.priority === 'CRITICAL') return 'bg-rose-500 text-white';
    if (ev.category === 'DOUBLE_DATE') return 'bg-orange-500 text-white';
    if (ev.category === 'PAYDAY') return 'bg-emerald-600 text-white';
    if (ev.category === 'SEASONAL') return 'bg-purple-600 text-white';
    if (ev.category === 'NATIONAL_HOLIDAY') return 'bg-red-600 text-white';
    return 'bg-blue-600 text-white';
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#EE4D2D]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-400 text-xs font-bold border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Marketing & Event Reminder Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Kalender Promo, Kampanye & Hari Besar
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Pantau momentum penjualan kurma, promo Double Date (1.1 - 12.12), Payday, Ramadan, Idul Fitri, dan persiapkan checklist operasional & simulasi promo harga Shopee.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={() => {
              setEventToEdit(null);
              setIsEventModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#EE4D2D] to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Buat Custom Event
          </button>
        </div>
      </div>

      {/* Control Bar: Filters, Search & Navigation */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Month / Year Navigator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-extrabold text-slate-800 capitalize min-w-[140px] text-center">
                {monthName} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleToday}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Hari Ini
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode('MONTH')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'MONTH'
                    ? 'bg-white text-[#EE4D2D] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month Grid
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'LIST'
                    ? 'bg-white text-[#EE4D2D] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                List View
              </button>
            </div>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari event promo / nama hari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#EE4D2D] focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#EE4D2D]"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="DOUBLE_DATE">Double Date (1.1 - 12.12)</option>
              <option value="PAYDAY">Payday Sale</option>
              <option value="SEASONAL">Seasonal & Ramadan</option>
              <option value="NATIONAL_HOLIDAY">Libur Nasional</option>
              <option value="NATIONAL_DAY">Hari Besar Nasional</option>
              <option value="CUSTOM">Custom Toko</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#EE4D2D]"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="CRITICAL">Critical (Sangat Tinggi)</option>
              <option value="HIGH">High (Penting)</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#EE4D2D]"
            >
              <option value="ALL">Semua Status Waktu</option>
              <option value="UPCOMING">Mendatang (Upcoming)</option>
              <option value="COMPLETED">Telah Berlalu (Past)</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: MONTHLY CALENDAR GRID */}
      {viewMode === 'MONTH' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Day Headers (Mon - Sun) */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-black text-slate-600 py-3">
            <span>SEN</span>
            <span>SEL</span>
            <span>RAB</span>
            <span>KAM</span>
            <span>JUM</span>
            <span className="text-orange-600">SAB</span>
            <span className="text-red-600">MIN</span>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {calendarDays.map((cell, idx) => {
              const isToday =
                new Date().toISOString().split('T')[0] === cell.dateStr;

              return (
                <div
                  key={idx}
                  className={`min-h-[120px] sm:min-h-[140px] p-2 flex flex-col justify-between transition-colors ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'
                  } ${isToday ? 'ring-2 ring-[#EE4D2D] ring-inset bg-orange-50/20' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#EE4D2D] text-white shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cell.events.length > 2 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {cell.events.length} event
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1 overflow-y-auto max-h-[85px] scrollbar-none">
                    {cell.events.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEventForDetail(ev)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer truncate shadow-2xs hover:opacity-90 transition-opacity ${getEventPillColor(
                          ev
                        )}`}
                        title={ev.title}
                      >
                        {ev.category === 'DOUBLE_DATE' && '⚡ '}
                        {ev.category === 'PAYDAY' && '💳 '}
                        {ev.category === 'SEASONAL' && '🌙 '}
                        {ev.title}
                      </div>
                    ))}
                  </div>

                  <div className="h-1" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: LIST VIEW */}
      {viewMode === 'LIST' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((ev) => {
                const totalTasks = ev.preparationChecklist?.length || 0;
                const completedTasks =
                  ev.preparationChecklist?.filter((t) => t.completed).length || 0;
                const progress =
                  totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEventForDetail(ev)}
                    className="p-5 hover:bg-orange-50/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-[#EE4D2D] flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-black uppercase">
                          {new Date(ev.date).toLocaleString('id-ID', { month: 'short' })}
                        </span>
                        <span className="text-base font-black leading-none">
                          {new Date(ev.date).getDate()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {ev.category.replace('_', ' ')}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              ev.priority === 'CRITICAL'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {ev.priority}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            📅 {ev.date}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                          {ev.title}
                        </h4>
                        {ev.description && (
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block">
                          Checklist
                        </span>
                        <span className="text-xs font-extrabold text-slate-800">
                          {completedTasks}/{totalTasks} ({progress}%)
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block">
                          Produk Promo
                        </span>
                        <span className="text-xs font-extrabold text-[#EE4D2D]">
                          {ev.promotedProducts?.length || 0} SKU
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-400">
                <CalendarIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold">Tidak ada event promo yang cocok dengan filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Detail & Interactive Checklist/Product Modal */}
      <EventDetailModal
        event={selectedEventForDetail}
        isOpen={!!selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        onSaveEvent={(updated) => {
          onSaveEvent(updated);
          setSelectedEventForDetail(updated);
          onToast('Event berhasil diperbarui!', 'success');
        }}
        onDeleteEvent={(id) => {
          onDeleteEvent(id);
          setSelectedEventForDetail(null);
          onToast('Custom event berhasil dihapus.', 'info');
        }}
        products={products}
        fees={fees}
        settings={settings}
        onNavigateToSimulator={onNavigateToSimulator}
      />

      {/* MODAL 2: Create / Edit Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        existingEvent={eventToEdit}
        onSave={(ev) => {
          onSaveEvent(ev);
          onToast('Custom event promo berhasil dibuat & disimpan ke Firestore!', 'success');
        }}
      />
    </div>
  );
};
