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
  Smartphone,
  Download,
  Vote,
} from 'lucide-react';
import { WorkspaceTab } from './Sidebar';
import { ActivityItem } from '../../data/workspaceData';
import { Banner } from './Banner';
import { RecentActivities } from './RecentActivities';
import { VotingAnggotaSection } from './VotingAnggotaSection';
import { UserAccount, DEFAULT_USERS } from '../../types/auth';

interface BerandaViewProps {
  onNavigate: (tab: WorkspaceTab) => void;
  onAddNews: () => void;
  onToast: (msg: string) => void;
  onSelectActivity: (act: ActivityItem) => void;
  activities: ActivityItem[];
  allowedMenus?: WorkspaceTab[];
  onDownloadApk?: () => void;
  archivedCount?: number;
  currentUser?: UserAccount;
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
}

export const BerandaView: React.FC<BerandaViewProps> = ({
  onNavigate,
  onAddNews,
  onToast,
  onSelectActivity,
  activities,
  allowedMenus,
  onDownloadApk,
  archivedCount = 0,
  currentUser = DEFAULT_USERS[0],
  isLoggedIn: propIsLoggedIn,
  onOpenLoginModal,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'administrasi' | 'kegiatan' | 'sistem'>('all');

  const userLoggedIn = Boolean(
    propIsLoggedIn ??
      (currentUser &&
        currentUser.id !== 'guest' &&
        typeof localStorage !== 'undefined' &&
        Boolean(localStorage.getItem('kt_auth_user_v3')))
  );

  // Dynamic counts from localStorage / state
  const membersCount = (() => {
    try {
      const saved = localStorage.getItem('kt_members_v3');
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  })();

  const lettersCount = (() => {
    try {
      const saved = localStorage.getItem('kt_surat_items_v2');
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  })();

  const proposalsCount = (() => {
    try {
      const saved = localStorage.getItem('kt_proposals_v2');
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  })();

  const assetsCount = (() => {
    try {
      const saved = localStorage.getItem('kt_assets_v1');
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  })();

  const realAgendasList = (() => {
    try {
      const saved = localStorage.getItem('kt_agenda_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  })();

  const agendaCount = realAgendasList.length;

  // Menu items with rich metadata for the Button Menu
  const menuButtons = [
    {
      id: 'ringkasan' as WorkspaceTab,
      category: 'kegiatan',
      title: 'Kegiatan & Program Kerja',
      desc: 'Visualisasi grafik kegiatan per hari, per bulan, dan per tahun',
      icon: Briefcase,
      color: 'from-blue-600 to-indigo-600',
      badge: `${activities.length} Kegiatan`,
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
      badge: `${lettersCount} Dokumen`,
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
      badge: `${membersCount} Anggota`,
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
      badge: `${proposalsCount} Proposal`,
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
      badge: 'Transparan',
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
      badge: `${assetsCount} Aset`,
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
      badge: `${agendaCount} Agenda`,
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
      badge: `${activities.length} Rilis`,
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

  const isMenuAllowedOnBeranda = (id: WorkspaceTab) => {
    if (!userLoggedIn) {
      return id === 'berita' || id === 'voting';
    }
    if (currentUser?.isSuperAdmin) return true;
    if (id === 'beranda' || id === 'berita' || id === 'voting') return true;
    if (!allowedMenus || !Array.isArray(allowedMenus)) return false;
    return allowedMenus.includes(id);
  };

  // Sembunyikan menu jika user tidak ada akses, untuk tamu hanya yang diperlukan (Berita & Voling)
  const allowedMenuButtons = menuButtons.filter((m) => isMenuAllowedOnBeranda(m.id));

  const filteredButtons = selectedFilter === 'all'
    ? allowedMenuButtons
    : allowedMenuButtons.filter((m) => m.category === selectedFilter);

  // Upcoming highlight agendas for Beranda from real agenda state
  const upcomingAgendas = realAgendasList.slice(0, 3).map((ag: any) => ({
    id: ag.id || String(Math.random()),
    title: ag.namaKegiatan || ag.title || 'Agenda Kegiatan',
    time: `${ag.tanggalMulai || ag.date || 'Hari ini'} • ${ag.waktuMulai || ag.time || 'WIB'}`,
    loc: ag.lokasiKegiatan || ag.location || 'Kelurahan Manis Jaya',
    badge: ag.kategori || ag.badge || 'Kegiatan',
    badgeColor: 'bg-blue-100 text-blue-700',
  }));

  return (
    <div className="space-y-7 animate-fadeIn pb-12">
      {/* 0. BANNER KHUSUS PENGUNJUNG / TAMU (BELUM LOGIN) */}
      {!userLoggedIn && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 border border-blue-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/30 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-400/30">
                  Mode Pengunjung (Tamu)
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  Akses Terbuka: Berita Kegiatan & Voling Anggota
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                Anda sedang membuka portal publik Karang Taruna Kelurahan Manis Jaya. Anda dapat membaca berita kegiatan dan berpartisipasi dalam voling/aspirasi pemuda. Untuk membuka surat menyurat, berkas proposal, database anggota, dan modul kerja lainnya, silakan masuk dengan akun pengurus.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Masuk / Login Pengurus</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP BANNER: BERITA KEGIATAN & SELAMAT BERKARYA */}
      <Banner
        onAddNewsClick={() => {
          if (!userLoggedIn) {
            onToast('Wajib login pengurus untuk menambah berita.');
            onOpenLoginModal?.();
            return;
          }
          onAddNews();
        }}
        onExploreClick={() => onNavigate('jadwal')}
        membersCount={membersCount}
        activitiesCount={activities.length}
        lettersCount={lettersCount}
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
            {userLoggedIn && (currentUser?.isSuperAdmin || (allowedMenus && allowedMenus.includes('tambah_berita'))) && (
              <button
                onClick={onAddNews}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Berita</span>
              </button>
            )}
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
          onOpenArchive={() => onNavigate('arsip_kegiatan')}
          archivedCount={archivedCount}
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
              {isMenuAllowedOnBeranda('surat') && (
                <button
                  onClick={() => onNavigate('surat')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all transform active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Surat Baru</span>
                </button>
              )}
              {isMenuAllowedOnBeranda('anggota') && (
                <button
                  onClick={() => onNavigate('anggota')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 transition-all"
                >
                  <Users className="w-3.5 h-3.5 text-blue-300" />
                  <span>Kelola Anggota</span>
                </button>
              )}
              {isMenuAllowedOnBeranda('ringkasan') && (
                <button
                  onClick={() => onNavigate('ringkasan')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 transition-all"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-300" />
                  <span>Lihat Kegiatan</span>
                </button>
              )}
              <button
                onClick={() => onNavigate('berita')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Megaphone className="w-3.5 h-3.5 text-cyan-300" />
                <span>Baca Berita Kegiatan</span>
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('section-voting-anggota');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onNavigate('voting');
                  }
                }}
                className="px-4 py-2 bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-400/30 rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Vote className="w-3.5 h-3.5 text-emerald-300" />
                <span>Voling Anggota (Live 🟢)</span>
              </button>
            </div>
          </div>

          {/* Quick Snapshot Card on Right */}
          <div className="lg:w-80 shrink-0 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-white space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <span className="font-semibold text-slate-300">Ringkasan Hari Ini</span>
              <span className="text-[11px] font-bold text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full capitalize">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-xl font-black text-white block">{membersCount}</span>
                <span className="text-[10px] text-slate-300">Total Anggota</span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-xl font-black text-emerald-400 block">{lettersCount}</span>
                <span className="text-[10px] text-slate-300">Surat Aktif</span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-xl font-black text-amber-300 block">{agendaCount}</span>
                <span className="text-[10px] text-slate-300">Agenda Kegiatan</span>
              </div>
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-xl font-black text-cyan-300 block">100%</span>
                <span className="text-[10px] text-slate-300">LPJ Tuntas</span>
              </div>
            </div>

            <button
              onClick={() => onToast('Mencetak rekapitulasi status organisasi...')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Ringkasan Eksekutif</span>
            </button>
          </div>
        </div>
      </div>


      {/* 4. DEDICATED COMPONENT: FITUR VOTING ANGGOTA (PENGAMBILAN KEPUTUSAN & PEMILIHAN KETUA KEGIATAN REAL-TIME) */}
      <div id="section-voting-anggota">
        <VotingAnggotaSection
          currentUser={currentUser}
          onToast={onToast}
          onNavigateToTab={onNavigate}
        />
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

          {/* Filter Pill Buttons for Menu - hanya ditampilkan jika pengurus login */}
          {userLoggedIn && (
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
          )}
        </div>

        {/* The Grid of Interactive Button Menus - Menu yang tidak ada hak akses disembunyikan sepenuhnya */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredButtons.map((btn) => {
            const Icon = btn.icon;

            return (
              <button
                key={btn.id}
                onClick={() => {
                  onNavigate(btn.id);
                  onToast(`Membuka menu ${btn.title}`);
                }}
                className={`group relative text-left p-4 rounded-2xl border transition-all duration-200 bg-white hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between ${btn.bgLight}`}
              >
                <div>
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${btn.color} text-white flex items-center justify-center shadow-md shadow-slate-200 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${btn.badgeColor}`}
                    >
                      {btn.badge}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {btn.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {btn.desc}
                  </p>
                </div>

                {/* Bottom Row Action Link */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600 group-hover:text-blue-600">
                  <span>Buka Menu</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
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
          {isMenuAllowedOnBeranda('surat') && (
            <button
              onClick={() => onNavigate('surat')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>+ Buat Surat</span>
            </button>
          )}
          {isMenuAllowedOnBeranda('anggota') && (
            <button
              onClick={() => onNavigate('anggota')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Tambah Anggota</span>
            </button>
          )}
          {userLoggedIn && (currentUser?.isSuperAdmin || (allowedMenus && allowedMenus.includes('tambah_berita'))) && (
            <button
              onClick={onAddNews}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>+ Buat Berita</span>
            </button>
          )}
          {isMenuAllowedOnBeranda('jadwal') && (
            <button
              onClick={() => onNavigate('jadwal')}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>+ Jadwalkan</span>
            </button>
          )}
          {!userLoggedIn && (
            <button
              onClick={() => {
                onNavigate('berita');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Baca Berita</span>
            </button>
          )}
          <button
            onClick={() => {
              onNavigate('voting');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Vote className="w-3.5 h-3.5" />
            <span>+ Ikuti Voting</span>
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

            {upcomingAgendas.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">Belum Ada Agenda Terdekat</p>
                <p className="text-[11px] text-slate-400">Jadwal kegiatan pemuda yang dibuat akan otomatis tampil di sini.</p>
                <button
                  onClick={() => onNavigate('jadwal')}
                  className="mt-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Agenda</span>
                </button>
              </div>
            ) : (
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
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg shrink-0 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('jadwal')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                Ke Menu Kegiatan <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {activities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Briefcase className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">Belum Ada Kegiatan Terbit</p>
                <p className="text-[11px] text-slate-400">Dokumentasi kegiatan yang diterbitkan akan tampil di sini.</p>
                <button
                  onClick={onAddNews}
                  className="mt-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Buat Berita Pertama</span>
                </button>
              </div>
            ) : (
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
            )}
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
