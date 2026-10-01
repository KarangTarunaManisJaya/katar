import React, { useMemo } from 'react';
import {
  Inbox,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertCircle,
  Building,
  User,
  ArrowUpRight,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import {
  SuratMasukItem,
  SuratKeluarItem,
  DisposisiItem,
} from '../../../types/surat';

interface SuratDashboardProps {
  suratMasuk: SuratMasukItem[];
  suratKeluar: SuratKeluarItem[];
  disposisi: DisposisiItem[];
  onNavigateTab: (tab: 'masuk' | 'keluar' | 'disposisi' | 'arsip' | 'buat') => void;
  onOpenSuratMasukDetail: (item: SuratMasukItem) => void;
  onOpenSuratKeluarDetail: (item: SuratKeluarItem) => void;
  onOpenBuatSurat: () => void;
  onOpenInputMasuk: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const SuratDashboard: React.FC<SuratDashboardProps> = ({
  suratMasuk,
  suratKeluar,
  disposisi,
  onNavigateTab,
  onOpenSuratMasukDetail,
  onOpenSuratKeluarDetail,
  onOpenBuatSurat,
  onOpenInputMasuk,
  searchQuery,
  setSearchQuery,
}) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Metrics
  const stats = useMemo(() => {
    const listMasuk = Array.isArray(suratMasuk) ? suratMasuk : [];
    const listKeluar = Array.isArray(suratKeluar) ? suratKeluar : [];
    const listDisp = Array.isArray(disposisi) ? disposisi : [];

    const masukBulanIni = listMasuk.filter((s) => {
      const d = s.tanggalSurat ? new Date(s.tanggalSurat) : new Date(0);
      return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const keluarBulanIni = listKeluar.filter((s) => {
      const d = s.tanggalSurat ? new Date(s.tanggalSurat) : new Date(0);
      return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const masukBelumDiproses = listMasuk.filter(
      (s) => s.status === 'Belum Diproses' || s.status === 'Menunggu Balasan'
    ).length;

    const disposisiMenunggu = listDisp.filter(
      (d) => d.status === 'Menunggu' || d.status === 'Dikerjakan'
    ).length;

    // Overdue or approaching deadline disposisi (<= 3 days)
    const urgentDisposisi = listDisp.filter((d) => {
      if (d.status === 'Selesai' || !d.batasWaktu) return false;
      const target = new Date(d.batasWaktu).getTime();
      if (isNaN(target)) return false;
      const diffDays = Math.ceil((target - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    });

    const suratPentingSegera = listMasuk.filter(
      (s) => (s.sifatSurat === 'Penting' || s.sifatSurat === 'Segera') && s.status !== 'Selesai'
    );

    return {
      masukTotal: listMasuk.length,
      masukBulanIni,
      masukBelumDiproses,
      keluarTotal: listKeluar.length,
      keluarBulanIni,
      disposisiTotal: listDisp.length,
      disposisiMenunggu,
      urgentDisposisi,
      suratPentingSegera,
    };
  }, [suratMasuk, suratKeluar, disposisi, currentMonth, currentYear]);

  // Monthly stats for mini chart
  const monthlyStats = useMemo(() => {
    const listMasuk = Array.isArray(suratMasuk) ? suratMasuk : [];
    const listKeluar = Array.isArray(suratKeluar) ? suratKeluar : [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    return months.map((mName, idx) => {
      const countMasuk = listMasuk.filter((s) => {
        const d = s.tanggalSurat ? new Date(s.tanggalSurat) : new Date(0);
        return !isNaN(d.getTime()) && d.getMonth() === idx && d.getFullYear() === currentYear;
      }).length;

      const countKeluar = listKeluar.filter((s) => {
        const d = s.tanggalSurat ? new Date(s.tanggalSurat) : new Date(0);
        return !isNaN(d.getTime()) && d.getMonth() === idx && d.getFullYear() === currentYear;
      }).length;

      return {
        month: mName,
        masuk: countMasuk,
        keluar: countKeluar,
        total: countMasuk + countKeluar,
      };
    });
  }, [suratMasuk, suratKeluar, currentYear]);

  const maxMonthValue = Math.max(...monthlyStats.map((m) => Math.max(m.masuk, m.keluar, 1)), 6);

  // Category breakdown for letters
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    const listKeluar = Array.isArray(suratKeluar) ? suratKeluar : [];
    listKeluar.forEach((sk) => {
      const key = sk.jenisSurat || 'Undangan';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [suratKeluar]);

  // Sifat badge helper
  const renderSifatBadge = (sifat: string) => {
    switch (sifat) {
      case 'Segera':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
            <Flame className="w-3 h-3 mr-1 text-rose-600 animate-pulse" /> Segera
          </span>
        );
      case 'Penting':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> Penting
          </span>
        );
      case 'Rahasia':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <ShieldAlert className="w-3 h-3 mr-1 text-purple-600" /> Rahasia
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Biasa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Search & Actions Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5" /> Tata Kelola Kesekretariatan & Persuratan
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
              Sistem Surat Menyurat Karang Taruna
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Pusat kendali surat masuk, penerbitan surat dinas resmi, disposisi instruksi, penomoran otomatis, serta arsip digital terpadu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenInputMasuk}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <Inbox className="w-4 h-4 text-sky-200" />
              Catat Surat Masuk
            </button>
            <button
              onClick={onOpenBuatSurat}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95"
            >
              <Send className="w-4 h-4 text-blue-600" />
              Buat Surat Keluar
            </button>
          </div>
        </div>

        {/* Quick Search Input */}
        <div className="mt-5 relative z-10">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pencarian cepat nomor surat, perihal, instansi pengirim, atau penerima..."
              className="w-full bg-white/95 text-slate-800 placeholder-slate-400 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
            />
            <div className="absolute left-3.5 top-3.5 text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Surat Masuk Card */}
        <div
          onClick={() => onNavigateTab('masuk')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Surat Masuk
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{stats.masukTotal}</span>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
              +{stats.masukBulanIni} bulan ini
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Belum Diproses: <b className="text-amber-600">{stats.masukBelumDiproses}</b></span>
            <span className="text-blue-600 group-hover:underline inline-flex items-center font-medium">
              Buka <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Surat Keluar Card */}
        <div
          onClick={() => onNavigateTab('keluar')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Surat Keluar
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{stats.keluarTotal}</span>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
              +{stats.keluarBulanIni} bulan ini
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Diterbitkan resmi organisasi</span>
            <span className="text-emerald-600 group-hover:underline inline-flex items-center font-medium">
              Kelola <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Disposisi Aktif */}
        <div
          onClick={() => onNavigateTab('disposisi')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-amber-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Disposisi Aktif
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{stats.disposisiMenunggu}</span>
            <span className="text-xs text-slate-500 font-medium">
              dari {stats.disposisiTotal} instruksi
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Perlu Tindak Lanjut</span>
            <span className="text-amber-600 group-hover:underline inline-flex items-center font-medium">
              Periksa <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Pengingat Jatuh Tempo / Penting */}
        <div
          onClick={() => onNavigateTab('disposisi')}
          className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-rose-50/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Perhatian & Deadline
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700">
              {stats.urgentDisposisi.length + stats.suratPentingSegera.length}
            </span>
            <span className="text-xs text-rose-600 font-semibold bg-rose-100 px-1.5 py-0.5 rounded">
              Prioritas Tinggi
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rose-100 flex items-center justify-between text-xs text-slate-600">
            <span>Batas waktu dekat / penting</span>
            <span className="text-rose-600 group-hover:underline inline-flex items-center font-medium">
              Tindak Lanjuti <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* PENGINGAT & RADAR TINDAK LANJUT SECTION */}
      {(stats.urgentDisposisi.length > 0 || stats.suratPentingSegera.length > 0 || stats.masukBelumDiproses > 0) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-white">
                <AlertCircle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pengingat Penting & Batas Waktu Tindak Lanjut
                </h3>
                <p className="text-xs text-slate-600">
                  Daftar disposisi dan surat dinas yang mendesak untuk ditindaklanjuti oleh pengurus.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('disposisi')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline flex items-center"
            >
              Lihat Semua Disposisi <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.urgentDisposisi.slice(0, 3).map((disp) => (
              <div
                key={disp.id}
                onClick={() => onNavigateTab('disposisi')}
                className="bg-white p-3 rounded-lg border border-amber-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono font-bold text-amber-700">{disp.nomorDisposisi}</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                    Deadline: {disp.batasWaktu}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{disp.perihalSuratMasuk}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Kepada: <span className="font-medium text-slate-700">{disp.kepada}</span>
                </p>
                <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded mt-1.5 font-medium line-clamp-2">
                  Instruksi: {disp.instruksi} - &ldquo;{disp.catatan}&rdquo;
                </p>
              </div>
            ))}

            {stats.suratPentingSegera.slice(0, 3).map((sm) => (
              <div
                key={sm.id}
                onClick={() => onOpenSuratMasukDetail(sm)}
                className="bg-white p-3 rounded-lg border border-rose-200 shadow-xs hover:border-rose-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono text-slate-600">{sm.nomorSurat}</span>
                  {renderSifatBadge(sm.sifatSurat)}
                </div>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{sm.perihal}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Dari: <span className="font-medium text-slate-700">{sm.instansi}</span>
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Status: <b className="text-amber-600">{sm.status}</b></span>
                  <span className="text-blue-600 font-semibold hover:underline">Detail &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GRAFIK STATISTIK & BREAKDOWN BULAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart Surat Masuk vs Keluar Per Bulan */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Grafik Volume Surat Masuk & Keluar ({currentYear})
              </h3>
              <p className="text-xs text-slate-500">
                Aktivitas korespondensi per bulan sepanjang tahun berjalan
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-blue-500" /> Masuk
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Keluar
              </span>
            </div>
          </div>

          {/* Bar Visualization */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
            {monthlyStats.map((item, idx) => {
              const heightMasuk = (item.masuk / maxMonthValue) * 100;
              const heightKeluar = (item.keluar / maxMonthValue) * 100;
              const isCurrent = idx === currentMonth;

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Bar Masuk */}
                    <div
                      style={{ height: `${Math.max(heightMasuk, 6)}%` }}
                      className={`w-2.5 sm:w-3.5 rounded-t transition-all ${
                        item.masuk > 0 ? 'bg-blue-500 group-hover:bg-blue-600' : 'bg-slate-100'
                      }`}
                      title={`${item.month}: ${item.masuk} Surat Masuk`}
                    />
                    {/* Bar Keluar */}
                    <div
                      style={{ height: `${Math.max(heightKeluar, 6)}%` }}
                      className={`w-2.5 sm:w-3.5 rounded-t transition-all ${
                        item.keluar > 0 ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-slate-100'
                      }`}
                      title={`${item.month}: ${item.keluar} Surat Keluar`}
                    />
                  </div>
                  <span className={`text-[10px] ${isCurrent ? 'font-black text-blue-600' : 'text-slate-500'}`}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Total Lalu Lintas Surat Tahun Ini: <b className="text-slate-800">{stats.masukTotal + stats.keluarTotal} surat</b></span>
            <button
              onClick={() => onNavigateTab('arsip')}
              className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
            >
              Lihat Rekapitulasi Lengkap <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Kategori Surat Keluar Terpopuler */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-indigo-600" />
              Klasifikasi Surat Keluar
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Distribusi jenis surat yang diterbitkan
            </p>

            <div className="space-y-2.5">
              {categoryBreakdown.slice(0, 5).map(([jenis, count]) => {
                const pct = Math.round((count / (stats.keluarTotal || 1)) * 100);
                return (
                  <div key={jenis} className="text-xs">
                    <div className="flex items-center justify-between mb-1 text-slate-700">
                      <span className="font-medium">{jenis}</span>
                      <span className="font-bold text-slate-900">{count} surat ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {categoryBreakdown.length === 0 && (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  Belum ada data surat keluar.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={onOpenBuatSurat}
              className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              Gunakan Template Surat &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* DUA TABEL: SURAT MASUK TERBARU & SURAT KELUAR TERBARU */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SURAT MASUK TERBARU */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Surat Masuk Terbaru</h3>
            </div>
            <button
              onClick={() => onNavigateTab('masuk')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Lihat Semua ({suratMasuk.length}) &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {suratMasuk.slice(0, 4).map((sm) => (
              <div
                key={sm.id}
                onClick={() => onOpenSuratMasukDetail(sm)}
                className="p-3.5 hover:bg-blue-50/30 transition-colors cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] mb-1">
                    <span className="font-mono text-slate-500 font-semibold">{sm.nomorSurat}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500">{sm.tanggalDiterima}</span>
                    {renderSifatBadge(sm.sifatSurat)}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 line-clamp-1">
                    {sm.perihal}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{sm.instansi}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                    sm.status === 'Selesai'
                      ? 'bg-emerald-100 text-emerald-700'
                      : sm.status === 'Belum Diproses'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {sm.status}
                  </span>
                  {sm.lampiran && sm.lampiran.length > 0 && (
                    <span className="block text-[10px] text-slate-400 mt-1">
                      {sm.lampiran.length} Lampiran
                    </span>
                  )}
                </div>
              </div>
            ))}

            {suratMasuk.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada surat masuk tercatat.
              </div>
            )}
          </div>
        </div>

        {/* SURAT KELUAR TERBARU */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Surat Keluar Terbaru</h3>
            </div>
            <button
              onClick={() => onNavigateTab('keluar')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
            >
              Lihat Semua ({suratKeluar.length}) &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {suratKeluar.slice(0, 4).map((sk) => (
              <div
                key={sk.id}
                onClick={() => onOpenSuratKeluarDetail(sk)}
                className="p-3.5 hover:bg-emerald-50/30 transition-colors cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] mb-1">
                    <span className="font-mono text-slate-500 font-semibold">{sk.nomorSurat}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500">{sk.tanggalSurat}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                      {sk.jenisSurat}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 line-clamp-1">
                    {sk.perihal}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="truncate">Tujuan: {sk.tujuan} ({sk.instansi})</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                    sk.status === 'Terkirim' || sk.status === 'Ditandatangani'
                      ? 'bg-emerald-100 text-emerald-700'
                      : sk.status === 'Menunggu TTD'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {sk.status}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    {sk.penandatangan.length} TTD
                  </span>
                </div>
              </div>
            ))}

            {suratKeluar.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada surat keluar dibuat.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
