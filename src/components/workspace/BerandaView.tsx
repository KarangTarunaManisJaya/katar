import React, { useState } from 'react';
import {
  Briefcase,
  Mail,
  Users,
  FileText,
  BarChart3,
  Package,
  Calendar,
  Megaphone,
  Settings,
  ShieldCheck,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  Printer,
  Bell,
  Search,
  Zap,
  Lock,
  Database,
  Cloud,
} from 'lucide-react';
import { WorkspaceTab } from './Sidebar';
import { ActivityItem } from '../../data/workspaceData';
import { Banner } from './Banner';
import { RecentActivities } from './RecentActivities';

interface BerandaViewProps {
  onNavigate: (tab: WorkspaceTab) => void;
  onAddNews: () => void;
  onToast: (msg: string) => void;
  onSelectActivity: (act: ActivityItem) => void;
  activities: ActivityItem[];
  allowedMenus?: WorkspaceTab[];
}

export const BerandaView: React.FC<BerandaViewProps> = ({
  onNavigate,
  onAddNews,
  onToast,
  onSelectActivity,
  activities,
  allowedMenus,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'administrasi' | 'kegiatan' | 'sistem'>('all');

  // Menu items with rich metadata for the Button Menu
  const menuButtons = [
    {
      id: 'ringkasan' as WorkspaceTab,
      category: 'kegiatan',
      title: 'Kegiatan & Program Kerja',
      desc: 'Visualisasi grafik kegiatan per hari, per bulan, dan per tahun',
      icon: Briefcase,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Grafik Aktif',
      badgeColor: 'bg-blue-100 text-blue-700',
      bgLight: 'bg-blue-50/60 hover:bg-blue-50 border-blue-200/80',
    },
    {
      id: 'surat' as WorkspaceTab,
      category: 'administrasi',
      title: 'Surat Menyurat',
      desc: 'Buat surat resmi, undangan, surat tugas & arsip dokumen',
      icon: Mail,
      color: 'from-amber-500 to-orange-600',
      badge: '4 Dokumen',
      badgeColor: 'bg-amber-100 text-amber-800',
      bgLight: 'bg-amber-50/60 hover:bg-amber-50 border-amber-200/80',
    },
    {
      id: 'anggota' as WorkspaceTab,
      category: 'administrasi',
      title: 'Data Anggota & KTA',
      desc: 'Direktori pemuda, verifikasi NIK, status RW & cetak KTA digital',
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      badge: '34 Anggota',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      bgLight: 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200/80',
    },
    {
      id: 'proposal' as WorkspaceTab,
      category: 'kegiatan',
      title: 'Proposal & Anggaran',
      desc: 'Pengajuan proposal bantuan dana & persetujuan program kerja',
      icon: FileText,
      color: 'from-violet-500 to-purple-600',
      badge: '3 Disetujui',
      badgeColor: 'bg-violet-100 text-violet-800',
      bgLight: 'bg-violet-50/60 hover:bg-violet-50 border-violet-200/80',
    },
    {
      id: 'laporan' as WorkspaceTab,
      category: 'kegiatan',
      title: 'Laporan Kas & LPJ',
      desc: 'Rekapitulasi transparansi anggaran masuk, keluar dan SPJ',
      icon: BarChart3,
      color: 'from-cyan-500 to-blue-600',
      badge: '100% Akuntabel',
      badgeColor: 'bg-cyan-100 text-cyan-800',
      bgLight: 'bg-cyan-50/60 hover:bg-cyan-50 border-cyan-200/80',
    },
    {
      id: 'aset' as WorkspaceTab,
      category: 'administrasi',
      title: 'Aset & Inventaris',
      desc: 'Peminjaman sound system, tenda, alat olahraga & sarana sekretariat',
      icon: Package,
      color: 'from-rose-500 to-pink-600',
      badge: '12 Inventaris',
      badgeColor: 'bg-rose-100 text-rose-800',
      bgLight: 'bg-rose-50/60 hover:bg-rose-50 border-rose-200/80',
    },
    {
      id: 'jadwal' as WorkspaceTab,
      category: 'kegiatan',
      title: 'Jadwal & Kalender Agenda',
      desc: 'Agenda rapat pemuda, gotong royong, dan jadwal turnamen',
      icon: Calendar,
      color: 'from-fuchsia-500 to-indigo-600',
      badge: 'Pekan Ini',
      badgeColor: 'bg-fuchsia-100 text-fuchsia-800',
      bgLight: 'bg-fuchsia-50/60 hover:bg-fuchsia-50 border-fuchsia-200/80',
    },
    {
      id: 'berita' as WorkspaceTab,
      category: 'kegiatan',
      title: 'Warta & Dokumentasi',
      desc: 'Rilis pers, galeri foto liputan dan publikasi prestasi pemuda',
      icon: Megaphone,
      color: 'from-sky-500 to-blue-700',
      badge: 'Publikasi',
      badgeColor: 'bg-sky-100 text-sky-800',
      bgLight: 'bg-sky-50/60 hover:bg-sky-50 border-sky-200/80',
    },
    {
      id: 'database' as WorkspaceTab,
      category: 'sistem',
      title: 'Database & Google Drive',
      desc: 'Cadangkan data ke Google Drive, input alamat folder & restore online',
      icon: Database,
      color: 'from-blue-600 to-indigo-700',
      badge: 'Cloud Sync',
      badgeColor: 'bg-blue-100 text-blue-800',
      bgLight: 'bg-blue-50/70 hover:bg-blue-50 border-blue-200/80',
    },
    {
      id: 'pengaturan' as WorkspaceTab,
      category: 'sistem',
      title: 'Pengaturan Umum',
      desc: 'Profil organisasi, ganti logo, format kop surat & integrasi API',
      icon: Settings,
      color: 'from-slate-600 to-slate-800',
      badge: 'Konfigurasi',
      badgeColor: 'bg-slate-100 text-slate-700',
      bgLight: 'bg-slate-50/80 hover:bg-slate-100 border-slate-200',
    },
    {
      id: 'akses' as WorkspaceTab,
      category: 'sistem',
      title: 'Akses & Struktur Pengurus',
      desc: 'Manajemen hak akses pengurus, ketua, sekretaris, dan koordinator',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-green-700',
      badge: 'Admin Utama',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      bgLight: 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200/80',
    },
  ];

  const filteredButtons = selectedFilter === 'all'
    ? menuButtons
    : menuButtons.filter((m) => m.category === selectedFilter);

  // Upcoming highlight agendas for Beranda
  const upcomingAgendas = [
    {
      id: 'ag-1',
      title: 'Rapat Koordinasi Persiapan Bulan Pemuda',
      time: 'Sabtu, 04 Okt 2026 • 19:30 WIB',
      loc: 'Sekretariat Karang Taruna RW 03',
      badge: 'Rapat Rutin',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'ag-2',
      title: 'Bakti Lingkungan & Gotong Royong RW 01 - RW 05',
      time: 'Minggu, 05 Okt 2026 • 07:00 WIB',
      loc: 'Taman Kelurahan Manis Jaya',
      badge: 'Sosial',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'ag-3',
      title: 'Pelatihan Kewirausahaan Sablon & Sabun Herbal',
      time: 'Rabu, 08 Okt 2026 • 13:00 WIB',
      loc: 'Aula Kelurahan Manis Jaya',
      badge: 'Pemberdayaan',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="space-y-7 animate-fadeIn pb-12">
      {/* 1. TOP BANNER: BERITA KEGIATAN & SELAMAT BERKARYA */}
      <Banner
        onAddNewsClick={onAddNews}
        onExploreClick={() => onNavigate('jadwal')}
      />

      {/* 2. SEMUA BERITA & DOKUMENTASI KEGIATAN (PERSIS DI BAWAH BERITA KEGIATAN) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Megaphone className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Semua Berita & Dokumentasi Kegiatan
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kumpulan rilis pers, liputan, dan foto dokumentasi kegiatan Karang Taruna Manis Jaya.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onAddNews}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Berita</span>
            </button>
            <button
              onClick={() => onNavigate('berita')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
            >
              <span>Arsip Berita</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <RecentActivities
          activities={activities}
          onSelectActivity={onSelectActivity}
          onViewAllClick={() => onNavigate('berita')}
        />
      </div>

      {/* 3. OVERVIEW PORTAL BERANDA & RINGKASAN EKSEKUTIF */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0d213a] via-[#132d4e] to-[#0f3d64] text-white p-6 sm:p-8 lg:p-10 shadow-lg border border-slate-700/50">
        {/* Background glow and subtle decor */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-64 h-64 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-300" />
                Portal Beranda Terpadu
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Sistem Aktif & Terverifikasi
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Selamat Datang di Workspace <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-white bg-clip-text text-transparent">
                Karang Taruna Manis Jaya
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Pusat kendali operasional pemuda Kelurahan Manis Jaya. Akses cepat surat menyurat resmi, basis data anggota ber-KTA, realisasi program kerja, dan inventaris organisasi dalam satu wadah.
            </p>

            {/* Quick Action Pills in Hero */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => onNavigate('surat')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all transform active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Surat Baru</span>
              </button>
              <button
                onClick={() => onNavigate('anggota')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 transition-all"
              >
                <Users className="w-3.5 h-3.5 text-blue-300" />
                <span>Kelola Anggota</span>
              </button>
              <button
                onClick={() => onNavigate('ringkasan')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 transition-all"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-300" />
                <span>Lihat Kegiatan</span>
              </button>
            </div>
          </div>

          {/* Quick Snapshot Card on Right */}
          <div className="lg:w-80 shrink-0 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-white space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <span className="font-semibold text-slate-300">Ringkasan Hari Ini</span>
              <span className="text-[11px] font-bold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full">
                Senin, 28 Sep 2026
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-xl font-black text-white block">34</span>
                <span className="text-[10px] text-slate-300">Total Anggota</span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-xl font-black text-emerald-400 block">4</span>
                <span className="text-[10px] text-slate-300">Surat Aktif</span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-xl font-black text-amber-300 block">8</span>
                <span className="text-[10px] text-slate-300">Agenda Bulan Ini</span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-xl font-black text-cyan-300 block">100%</span>
                <span className="text-[10px] text-slate-300">LPJ Tuntas</span>
              </div>
            </div>

            <button
              onClick={() => onToast('Mengunduh laporan rekapitulasi harian...')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Ringkasan Eksekutif</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED SECTION: BUTTON MENU (SESUAI REQUEST USER) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Menu Akses Cepat Workspace
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Klik salah satu tombol menu di bawah untuk langsung menuju modul kerja yang Anda butuhkan.
            </p>
          </div>

          {/* Filter Pill Buttons for Menu */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'all'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Menu
            </button>
            <button
              onClick={() => setSelectedFilter('kegiatan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'kegiatan'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kegiatan
            </button>
            <button
              onClick={() => setSelectedFilter('administrasi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'administrasi'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Administrasi
            </button>
            <button
              onClick={() => setSelectedFilter('sistem')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'sistem'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sistem
            </button>
          </div>
        </div>

        {/* The Grid of Interactive Button Menus */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredButtons.map((btn) => {
            const Icon = btn.icon;
            const isAllowed = !allowedMenus || allowedMenus.includes(btn.id);

            return (
              <button
                key={btn.id}
                onClick={() => {
                  if (isAllowed) {
                    onNavigate(btn.id);
                    onToast(`Membuka menu ${btn.title}`);
                  } else {
                    onToast(`Akses Dibatasi: Menu "${btn.title}" belum dicentang untuk akun Anda. Hubungi Pengurus Karang Taruna.`);
                  }
                }}
                className={`group relative text-left p-4 rounded-2xl border transition-all duration-200 bg-white hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between ${
                  isAllowed ? btn.bgLight : 'bg-slate-50/80 border-slate-200 opacity-75'
                }`}
              >
                <div>
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl ${
                        isAllowed
                          ? `bg-gradient-to-br ${btn.color} text-white`
                          : 'bg-slate-200 text-slate-500'
                      } flex items-center justify-center shadow-md shadow-slate-200 group-hover:scale-105 transition-transform`}
                    >
                      {isAllowed ? <Icon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAllowed ? btn.badgeColor : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isAllowed ? btn.badge : 'Terkunci 🔒'}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <h3 className={`text-sm font-bold ${isAllowed ? 'text-slate-900 group-hover:text-blue-600' : 'text-slate-600'} transition-colors`}>
                    {btn.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {btn.desc}
                  </p>
                </div>

                {/* Bottom Row Action Link */}
                <div className={`mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold ${isAllowed ? 'text-slate-600 group-hover:text-blue-600' : 'text-slate-400'}`}>
                  <span>{isAllowed ? 'Buka Menu' : 'Perlu Izin Akses'}</span>
                  {isAllowed ? (
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BAR TOMBOL AKSI CEPAT (DIRECT ACTION LAUNCHER) */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Tombol Aksi Cepat</h4>
            <p className="text-xs text-slate-400">
              Luncurkan tugas administratif atau buat dokumen baru dengan 1 klik.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
          <button
            onClick={() => onNavigate('surat')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>+ Buat Surat</span>
          </button>
          <button
            onClick={() => onNavigate('anggota')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ Tambah Anggota</span>
          </button>
          <button
            onClick={onAddNews}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>+ Buat Berita</span>
          </button>
          <button
            onClick={() => onNavigate('jadwal')}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>+ Jadwalkan</span>
          </button>
        </div>
      </div>

      {/* 4. DUA KOLOM: AGENDA TERDEKAT & AKTIVITAS DOKUMENTASI TERBARU */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Agenda Terdekat */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Agenda Pemuda Terdekat</h3>
                  <span className="text-[10px] text-slate-500">Jadwal kegiatan lingkungan terdekat</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('jadwal')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2 space-y-1">
              {upcomingAgendas.map((agenda) => (
                <div key={agenda.id} className="pt-3 pb-2 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${agenda.badgeColor}`}>
                      {agenda.badge}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{agenda.title}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {agenda.time}
                    </p>
                    <p className="text-[11px] text-slate-500">📍 {agenda.loc}</p>
                  </div>
                  <button
                    onClick={() => onToast(`Melihat detail: ${agenda.title}`)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg shrink-0 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('jadwal')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Buka Kalender Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Sorotan Kegiatan & Dokumentasi Terbaru */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Sorotan Kegiatan</h3>
                  <span className="text-[10px] text-slate-500">Liputan kegiatan terbaru pemuda</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('ringkasan')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Ke Menu Kegiatan <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2 space-y-1">
              {activities.slice(0, 3).map((act) => (
                <div
                  key={act.id}
                  onClick={() => onSelectActivity(act)}
                  className="pt-3 pb-2 flex items-center justify-between gap-3 cursor-pointer group hover:bg-slate-50/80 rounded-xl px-2 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {act.badge}
                      </span>
                      <span className="text-[10px] text-slate-400">{act.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {act.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{act.location}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('ringkasan')}
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Buka Visualisasi & Semua Kegiatan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
