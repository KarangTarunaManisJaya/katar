import React from 'react';
import { Sparkles, Calendar, ChevronRight, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { ActivityItem } from '../../data/workspaceData';

interface RecentActivitiesProps {
  activities: ActivityItem[];
  onSelectActivity: (activity: ActivityItem) => void;
  onViewAllClick?: () => void;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
  onSelectActivity,
  onViewAllClick,
}) => {
  const getBadgeStyle = (color: ActivityItem['badgeColor']) => {
    switch (color) {
      case 'dark':
        return 'bg-slate-950/80 text-white';
      case 'green':
        return 'bg-emerald-100 text-emerald-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      case 'orange':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getPillCountStyle = (color: ActivityItem['badgeColor']) => {
    switch (color) {
      case 'dark':
        return 'bg-sky-50 text-sky-600';
      case 'green':
        return 'bg-emerald-50 text-emerald-600';
      case 'purple':
        return 'bg-purple-50 text-purple-600';
      case 'orange':
        return 'bg-amber-50 text-amber-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="w-full mt-8">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Blue-purple sparkle icon in circle */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Kegiatan Terbaru
            </h3>
            <p className="text-xs text-slate-500 leading-snug">
              Dokumentasi dan berita kegiatan Karang Taruna Manis Jaya
            </p>
          </div>
        </div>

        <button
          onClick={onViewAllClick}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 text-xs font-semibold shadow-sm transition-all"
        >
          <span>Lihat Semua</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {activities.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Media Thumbnail */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  /* Placeholder with subtle purple tone */
                  <div className="w-full h-full bg-[#f2eefd] flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-purple-300" />
                  </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold tracking-wide ${getBadgeStyle(
                      item.badgeColor
                    )}`}
                  >
                    {item.badge}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
                  {item.title}
                </h4>

                {/* Meta Date & Photo count */}
                <div className="flex items-center justify-between text-xs mt-2.5">
                  <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.date}</span>
                  </span>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getPillCountStyle(
                      item.badgeColor
                    )}`}
                  >
                    {item.photoCount} Foto
                  </span>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="px-4 pb-4 pt-1">
              <button
                onClick={() => onSelectActivity(item)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 group/link transition-colors"
              >
                <span>Lihat Detail</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
