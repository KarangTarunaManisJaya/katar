import React from 'react';
import { Sparkles, Calendar, ChevronRight, ArrowRight, Image as ImageIcon, Archive, Video, Play, Star } from 'lucide-react';
import { ActivityItem } from '../../data/workspaceData';
import { resolveAssetUrl } from '../../utils/assetUrl';

interface RecentActivitiesProps {
  activities: ActivityItem[];
  onSelectActivity: (activity: ActivityItem) => void;
  onViewAllClick?: () => void;
  onOpenArchive?: () => void;
  archivedCount?: number;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
  onSelectActivity,
  onViewAllClick,
  onOpenArchive,
  archivedCount = 0,
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
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Kegiatan Terbaru
            </h2>
            <p className="text-xs text-slate-500 leading-snug">
              Dokumentasi dan berita kegiatan Karang Taruna Manis Jaya
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenArchive && archivedCount > 0 && (
            <button
              onClick={onOpenArchive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Buka Arsip Kegiatan yang telah selesai"
            >
              <Archive className="w-3.5 h-3.5 text-amber-600" />
              <span>Arsip ({archivedCount})</span>
            </button>
          )}

          <button
            onClick={onViewAllClick}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cards Grid or Empty State */}
      {activities.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">Belum Ada Berita & Dokumentasi</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Seluruh liputan kegiatan dan rilis pers pemuda yang ditambahkan akan muncul di sini dan tersinkron otomatis ke semua ponsel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {activities.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectActivity(item)}
            className="group cursor-pointer bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Media Thumbnail */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src={item.image || resolveAssetUrl('/baksos_karang_taruna_1790589027203.jpg')}
                  alt={`${item.title} - Dokumentasi Kegiatan Karang Taruna Kelurahan Manis Jaya Tangerang`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = '1';
                      target.src = resolveAssetUrl('/baksos_karang_taruna_1790589027203.jpg');
                    } else if (target.dataset.triedFallback === '1') {
                      target.dataset.triedFallback = '2';
                      target.src = resolveAssetUrl('/hero_karang_taruna_1790587873230.jpg');
                    }
                  }}
                />

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

                {item.videoUrl && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform pl-0.5">
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                        <Video className="w-3 h-3" />
                        <span>Video (≤60s)</span>
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
                  {item.title}
                </h3>

                {/* Meta Date & Photo count */}
                <div className="flex items-center justify-between text-xs mt-2.5">
                  <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.date}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {item.averageRating && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
                        <span>{item.averageRating}</span>
                      </span>
                    )}
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
      )}
    </div>
  );
};
