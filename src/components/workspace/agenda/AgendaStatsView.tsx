import React from 'react';
import {
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  AgendaItem,
  KategoriAgenda,
  KATEGORI_AGENDA_LIST,
  KATEGORI_COLORS,
  BIDANG_SEKSI_LIST,
} from '../../../data/agendaData';

interface AgendaStatsViewProps {
  agendas: AgendaItem[];
}

export const AgendaStatsView: React.FC<AgendaStatsViewProps> = ({ agendas }) => {
  // Aggregate stats
  const totalAgenda = agendas.length;
  const selesaiCount = agendas.filter((a) => a.statusKegiatan === 'Selesai').length;
  const berjalanCount = agendas.filter((a) => a.statusKegiatan === 'Sedang Berjalan').length;
  const direncanakanCount = agendas.filter((a) => a.statusKegiatan === 'Direncanakan').length;

  const totalPesertaTarget = agendas.reduce((sum, a) => sum + (a.jumlahPeserta || 0), 0);
  const totalPesertaHadir = agendas.reduce((sum, a) => sum + (a.jumlahPesertaHadir || 0), 0);

  const totalEstimasiAnggaran = agendas.reduce((sum, a) => sum + (a.estimasiAnggaran || 0), 0);
  const totalRealisasiAnggaran = agendas.reduce((sum, a) => sum + (a.realisasiAnggaran || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Group by category
  const categoryCount = KATEGORI_AGENDA_LIST.map((kat) => {
    const count = agendas.filter((a) => a.kategori === kat).length;
    return {
      name: kat,
      count,
      percent: totalAgenda > 0 ? Math.round((count / totalAgenda) * 100) : 0,
    };
  }).filter((c) => c.count > 0);

  // Group by Bidang
  const bidangCount = BIDANG_SEKSI_LIST.map((bid) => {
    const count = agendas.filter((a) => a.bidangSeksi === bid).length;
    return {
      name: bid,
      count,
    };
  }).filter((b) => b.count > 0);

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Kegiatan
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalAgenda}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {selesaiCount} Selesai · {berjalanCount} Berjalan
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Partisipasi Pemuda
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalPesertaHadir} Org</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Dari kuota {totalPesertaTarget} orang
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Estimasi Biaya
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 truncate">
              {formatCurrency(totalEstimasiAnggaran)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Semua agenda terdaftar</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Realisasi Pengeluaran
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 truncate">
              {formatCurrency(totalRealisasiAnggaran)}
            </div>
            <div className="text-[11px] text-purple-600 font-semibold mt-0.5">
              Efisiensi: {formatCurrency(totalEstimasiAnggaran - totalRealisasiAnggaran)}
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Kategori & Bidang breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kategori Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Kegiatan Berdasarkan Kategori
              </h4>
            </div>
            <span className="text-xs text-slate-500">{categoryCount.length} Kategori Aktif</span>
          </div>

          <div className="space-y-3">
            {categoryCount.map((cat) => {
              const colors = KATEGORI_COLORS[cat.name as KategoriAgenda] || KATEGORI_COLORS['Lainnya'];
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      {cat.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {cat.count} Agenda ({cat.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.badge}`}
                      style={{ width: `${Math.max(cat.percent, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bidang Seksi Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Kegiatan Berdasarkan Bidang / Seksi
              </h4>
            </div>
            <span className="text-xs text-slate-500">{bidangCount.length} Bidang</span>
          </div>

          <div className="space-y-3">
            {bidangCount.map((bid) => (
              <div
                key={bid.name}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60"
              >
                <span className="text-xs font-semibold text-slate-800">{bid.name}</span>
                <span className="text-xs font-black bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900">
                  {bid.count} Agenda
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
