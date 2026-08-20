import React from 'react';
import { MarketingEvent } from '../../types';
import {
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface UpcomingEventsWidgetProps {
  events: MarketingEvent[];
  onNavigateToCalendar: (eventId?: string) => void;
}

export const UpcomingEventsWidget: React.FC<UpcomingEventsWidgetProps> = ({
  events,
  onNavigateToCalendar
}) => {
  const now = new Date();
  const jakartaDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
  const today = new Date(jakartaDateStr);

  const activeEventsWithDiff = events
    .filter((e) => e.isActive)
    .map((e) => {
      const evDate = new Date(e.date);
      const diffTime = evDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { event: e, diffDays };
    })
    .sort((a, b) => a.diffDays - b.diffDays);

  const upcomingList = activeEventsWithDiff
    .filter((item) => item.diffDays >= 0)
    .slice(0, 4);

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getBadgeStyle = (category: string, priority: string) => {
    if (priority === 'CRITICAL') {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    if (category === 'DOUBLE_DATE') {
      return 'bg-orange-50 text-orange-700 border-orange-200';
    }
    if (category === 'PAYDAY') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (category === 'SEASONAL') {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#EE4D2D] to-orange-500 text-white shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              Upcoming Marketing & Promo Events
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#EE4D2D]">
                Kalender Promo
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Agenda promo Shopee, double-date, payday, dan momen panen kurma terdekat
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToCalendar()}
          className="text-xs font-extrabold text-[#EE4D2D] hover:text-orange-700 transition-colors flex items-center gap-1 group cursor-pointer"
        >
          Buka Kalender Lengkap
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {upcomingList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {upcomingList.map(({ event, diffDays }) => {
            const totalTasks = event.preparationChecklist?.length || 0;
            const completedTasks = event.preparationChecklist?.filter((t) => t.completed).length || 0;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            let countdownLabel = '';
            let countdownStyle = '';

            if (diffDays === 0) {
              countdownLabel = '🔥 HARI INI';
              countdownStyle = 'bg-rose-600 text-white animate-pulse';
            } else if (diffDays === 1) {
              countdownLabel = '⚡ BESOK';
              countdownStyle = 'bg-orange-500 text-white';
            } else if (diffDays <= 7) {
              countdownLabel = `🔔 D-${diffDays} (H-${diffDays})`;
              countdownStyle = 'bg-amber-500 text-white';
            } else {
              countdownLabel = `${diffDays} Hari Lagi`;
              countdownStyle = 'bg-slate-100 text-slate-700 border border-slate-200';
            }

            return (
              <div
                key={event.id}
                onClick={() => onNavigateToCalendar(event.id)}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-[#EE4D2D] hover:bg-orange-50/30 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getBadgeStyle(
                        event.category,
                        event.priority
                      )}`}
                    >
                      {event.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-lg tracking-wide ${countdownStyle}`}
                    >
                      {countdownLabel}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm line-clamp-1 group-hover:text-[#EE4D2D] transition-colors">
                      {event.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                      📅 {formatEventDate(event.date)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500">Persiapan Checklist</span>
                    <span className={progress === 100 ? 'text-emerald-600' : 'text-slate-700'}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress === 100
                          ? 'bg-emerald-500'
                          : progress >= 50
                          ? 'bg-amber-500'
                          : 'bg-[#EE4D2D]'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-bold">Belum ada agenda promo mendatang.</p>
        </div>
      )}
    </div>
  );
};
