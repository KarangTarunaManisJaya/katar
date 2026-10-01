import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Coins,
  TrendingUp,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { ProposalItem } from '../../../types/proposal';

interface ProposalDashboardProps {
  proposals: ProposalItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectProposal: (proposal: ProposalItem) => void;
}

export const ProposalDashboard: React.FC<ProposalDashboardProps> = ({
  proposals,
  selectedCategory,
  onSelectCategory,
  onSelectProposal,
}) => {
  const currentYear = new Date().getFullYear();

  const safeProposals = Array.isArray(proposals) ? proposals : [];

  // Metrics
  const totalCount = safeProposals.length;
  const pendingCount = safeProposals.filter((p) => p.status === 'Menunggu Persetujuan').length;
  const approvedCount = safeProposals.filter((p) => p.status === 'Disetujui').length;
  const draftCount = safeProposals.filter((p) => p.status === 'Draft' || p.status === 'Revisi').length;

  const totalAnggaran = safeProposals.reduce((acc, p) => acc + (p.totalAnggaran || 0), 0);
  const totalApprovedAnggaran = safeProposals
    .filter((p) => p.status === 'Disetujui' || p.status === 'Selesai/Terlaksana')
    .reduce((acc, p) => acc + (p.totalAnggaran || 0), 0);
  const totalDanaTerkumpul = safeProposals.reduce((acc, p) => acc + (p.totalDanaTerkumpul || 0), 0);

  // Due date warnings (proposals with jatuh tempo in next 30 days or pending)
  const todayISO = new Date().toISOString().split('T')[0];
  const urgentProposals = safeProposals.filter(
    (p) => p.status === 'Menunggu Persetujuan' || (p.jatuhTempo && p.jatuhTempo >= todayISO)
  );

  // Category counts
  const categoryCounts = safeProposals.reduce((acc, p) => {
    acc[p.kategori] = (acc[p.kategori] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Monthly stats for chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyData = months.map((m, idx) => {
    const monthNum = idx + 1;
    const count = safeProposals.filter((p) => {
      const monthPart = parseInt(p.tanggalProposal.split('-')[1], 10);
      return monthPart === monthNum;
    }).length;
    const value = proposals
      .filter((p) => {
        const monthPart = parseInt(p.tanggalProposal.split('-')[1], 10);
        return monthPart === monthNum;
      })
      .reduce((acc, p) => acc + p.totalAnggaran, 0);
    return { month: m, count, value };
  });

  const maxMonthValue = Math.max(...monthlyData.map((d) => d.value), 1000000);

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Proposal */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Pengajuan</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{totalCount}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span className="font-semibold text-emerald-600">{approvedCount} Disetujui</span>
              <span>•</span>
              <span className="font-semibold text-amber-600">{pendingCount} Menunggu</span>
            </div>
          </div>
        </div>

        {/* Menunggu Persetujuan */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Menunggu Persetujuan</span>
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-amber-900 tracking-tight">{pendingCount}</h3>
            <p className="mt-1 text-[11px] text-amber-700/80">Memerlukan tinjauan pimpinan</p>
          </div>
        </div>

        {/* Total Nilai Anggaran */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Nilai Anggaran</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Coins className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
              Rp {(totalAnggaran / 1000000).toFixed(1)} Jt
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              Disetujui: <span className="font-semibold text-slate-800">Rp {(totalApprovedAnggaran / 1000000).toFixed(1)} Jt</span>
            </p>
          </div>
        </div>

        {/* Realisasi Dana Masuk */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Dana Terkumpul / Sponsor</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-black text-indigo-700 tracking-tight">
              Rp {(totalDanaTerkumpul / 1000000).toFixed(1)} Jt
            </h3>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full"
                style={{
                  width: `${Math.min(100, Math.round((totalDanaTerkumpul / (totalAnggaran || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visualisasi Grafik Bulanan & Proposal Mendesak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Grafik Proposal per Bulan */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Tren Nilai Anggaran Proposal Tahun {currentYear}
              </h4>
              <p className="text-xs text-slate-500">Distribusi pengajuan dana kegiatan per bulan</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
              {currentYear}
            </span>
          </div>

          {/* Bar Chart Bars */}
          <div className="pt-4 pb-2">
            <div className="flex items-end justify-between gap-1.5 h-36 border-b border-slate-200 pb-2">
              {monthlyData.map((d, i) => {
                const heightPercent = d.value > 0 ? Math.max(12, Math.round((d.value / maxMonthValue) * 100)) : 4;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      {d.count} Proposal: Rp {(d.value / 1000000).toFixed(1)} Jt
                    </div>
                    <div
                      className={`w-full max-w-[28px] rounded-t-md transition-all ${
                        d.count > 0 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-slate-100'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-slate-500 font-medium">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Proposal Mendesak / Menunggu */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Menunggu / Mendekati Hari H
            </h4>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {urgentProposals.length} Berkas
            </span>
          </div>

          <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1">
            {urgentProposals.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Tidak ada proposal yang mendesak.</p>
            ) : (
              urgentProposals.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProposal(p)}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{p.judul}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Kegiatan: {p.tanggalKegiatan}
                    </p>
                  </div>
                  <span className="text-[10px] shrink-0 font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                    {p.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Filter Cepat Berdasarkan Kategori */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2 overflow-x-auto pb-3">
        <span className="text-xs font-bold text-slate-600 shrink-0 mr-1">Kategori:</span>
        <button
          onClick={() => onSelectCategory('Semua')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedCategory === 'Semua'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua ({totalCount})
        </button>
        {Object.entries(categoryCounts).map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat} ({count})
          </button>
        ))}
      </div>
    </div>
  );
};
