import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Calendar,
  Download,
  Filter,
  BarChart3,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { KegiatanVisualisasiCharts } from './KegiatanVisualisasiCharts';
import { RecentActivities } from './RecentActivities';
import { ActivityItem } from '../../data/workspaceData';

interface KegiatanViewProps {
  activities: ActivityItem[];
  onSelectActivity: (act: ActivityItem) => void;
  onAddActivity: () => void;
  onExploreCalendar: () => void;
  onViewAllNews: () => void;
  onToast: (msg: string) => void;
}

export const KegiatanView: React.FC<KegiatanViewProps> = ({
  activities,
  onSelectActivity,
  onAddActivity,
  onExploreCalendar,
  onViewAllNews,
  onToast,
}) => {
  const [filterCategory, setFilterCategory] = useState<'semua' | 'sosial' | 'olahraga' | 'kewirausahaan'>('semua');

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header Banner Khusus Kegiatan */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-bold tracking-wider uppercase text-blue-100 border border-white/20">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Program Kerja & Aksi Nyata</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Kegiatan Karang Taruna Manis Jaya
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Pantau seluruh aktivitas kepemudaan, grafik statistik keikutsertaan warga, realisasi anggaran kegiatan, serta arsip dokumentasi program kerja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onAddActivity}
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Kegiatan</span>
            </button>

            <button
              onClick={onExploreCalendar}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4 text-sky-200" />
              <span>Kalender Agenda</span>
            </button>

            <button
              onClick={() => onToast('Mengunduh rekapitulasi data kegiatan (XLSX)...')}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs text-white transition-all"
              title="Unduh Rekap Spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visualisasi Data Recharts: Grafik Per Hari, Per Bulan, Per Tahun */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs">
        <KegiatanVisualisasiCharts onToast={onToast} />
      </div>

      {/* Daftar & Koleksi Kegiatan Terbaru */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs">
        <RecentActivities
          activities={activities}
          onSelectActivity={onSelectActivity}
          onViewAllClick={onViewAllNews}
        />
      </div>
    </div>
  );
};
