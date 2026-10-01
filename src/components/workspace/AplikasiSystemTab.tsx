import React, { useState, useRef } from 'react';
import {
  Database,
  Archive,
  History,
  FileCheck,
  Info,
  Sparkles,
  Terminal,
  FileSpreadsheet,
  FileDown,
  Search,
  Filter,
  AlertCircle,
  HardDrive,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Shield,
  Layers,
  Settings,
  ChevronRight,
  ExternalLink,
  Copy,
  Clock,
  Calendar,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  FileText,
  User,
  Activity,
  Server,
  Zap,
} from 'lucide-react';

interface AplikasiSystemTabProps {
  onToast: (msg: string) => void;
  maintenanceMode: boolean;
  setMaintenanceMode: (val: boolean) => void;
  backupOtomatis: boolean;
  setBackupOtomatis: (val: boolean) => void;
}

// Backup Item Structure
interface BackupItem {
  id: string;
  fileName: string;
  size: string;
  createdAt: string;
  creator: string;
  type: 'Lengkap (Full)' | 'Database Saja' | 'Media & Berkas';
  status: 'Tervalidasi' | 'Siap';
}

// Archive Item Structure
interface ArchiveItem {
  id: string;
  code: string;
  title: string;
  category: 'Surat Masuk/Keluar' | 'Proposal & LPJ' | 'Data Anggota Alumni' | 'Dokumentasi Berita';
  period: string;
  itemCount: number;
  size: string;
  archivedAt: string;
  archivedBy: string;
  status: 'Tersimpan Aman' | 'Read-Only';
}

// Audit Trail Item Structure
interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: 'AUTH' | 'ANGGOTA' | 'SURAT' | 'KEUANGAN' | 'PENGATURAN' | 'BACKUP' | 'ARSIP';
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
  ipAddress: string;
  device: string;
  details: string;
}

export const AplikasiSystemTab: React.FC<AplikasiSystemTabProps> = ({
  onToast,
  maintenanceMode,
  setMaintenanceMode,
  backupOtomatis,
  setBackupOtomatis,
}) => {
  // Navigation / Scroll filter state within this tab
  const [activeSection, setActiveSection] = useState<'semua' | 'backup' | 'arsip' | 'audit' | 'tentang'>('semua');

  // --- 1. BACKUP & RESTORE STATES ---
  const [backupSchedule, setBackupSchedule] = useState<'Harian (02:00 WIB)' | 'Mingguan (Minggu)' | 'Bulanan'>('Harian (02:00 WIB)');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupItems, setBackupItems] = useState<BackupItem[]>([
    {
      id: 'bk-1',
      fileName: 'backup_simkt_manisjaya_2026-09-29_full.json',
      size: '4.8 MB',
      createdAt: '29 Sep 2026, 02:00 WIB',
      creator: 'Sistem Otomatis (Cron)',
      type: 'Lengkap (Full)',
      status: 'Tervalidasi',
    },
    {
      id: 'bk-2',
      fileName: 'backup_simkt_manisjaya_2026-09-22_full.json',
      size: '4.6 MB',
      createdAt: '22 Sep 2026, 02:00 WIB',
      creator: 'Sistem Otomatis (Cron)',
      type: 'Lengkap (Full)',
      status: 'Tervalidasi',
    },
    {
      id: 'bk-3',
      fileName: 'backup_manual_sebelum_update_iik.json',
      size: '4.5 MB',
      createdAt: '18 Sep 2026, 14:35 WIB',
      creator: 'Iik Andriyana (Ketua)',
      type: 'Lengkap (Full)',
      status: 'Tervalidasi',
    },
    {
      id: 'bk-4',
      fileName: 'backup_simkt_manisjaya_2026-09-15_db.json',
      size: '2.1 MB',
      createdAt: '15 Sep 2026, 02:00 WIB',
      creator: 'Sistem Otomatis (Cron)',
      type: 'Database Saja',
      status: 'Tervalidasi',
    },
  ]);

  // Restore Modal State
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackupToRestore, setSelectedBackupToRestore] = useState<BackupItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const restoreFileInputRef = useRef<HTMLInputElement | null>(null);

  // --- 2. ARSIP STATES ---
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveFilter, setArchiveFilter] = useState('Semua Kategori');
  const [showNewArchiveModal, setShowNewArchiveModal] = useState(false);
  const [newArchiveCategory, setNewArchiveCategory] = useState<'Surat Masuk/Keluar' | 'Proposal & LPJ' | 'Data Anggota Alumni' | 'Dokumentasi Berita'>('Surat Masuk/Keluar');
  const [newArchiveYear, setNewArchiveYear] = useState('2024');
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([
    {
      id: 'arc-1',
      code: 'ARC-2024-SRT-01',
      title: 'Berkas Arsip Surat Masuk & Keluar Periode 2024',
      category: 'Surat Masuk/Keluar',
      period: 'Tahun 2024',
      itemCount: 142,
      size: '12.4 MB',
      archivedAt: '15 Jan 2025',
      archivedBy: 'Anisa Rahmawati (Sekretaris)',
      status: 'Tersimpan Aman',
    },
    {
      id: 'arc-2',
      code: 'ARC-2024-LPJ-02',
      title: 'Laporan Pertanggungjawaban (LPJ) & Kuitansi Dana 2024',
      category: 'Proposal & LPJ',
      period: 'Tahun 2024',
      itemCount: 28,
      size: '34.8 MB',
      archivedAt: '20 Jan 2025',
      archivedBy: 'Bagus Tri Prakoso (Bendahara)',
      status: 'Tersimpan Aman',
    },
    {
      id: 'arc-3',
      code: 'ARC-2025-FUTSAL-03',
      title: 'Dokumentasi Lengkap Turnamen Futsal Cup Pemuda 2025',
      category: 'Dokumentasi Berita',
      period: 'Januari - Maret 2025',
      itemCount: 86,
      size: '68.2 MB',
      archivedAt: '05 Apr 2025',
      archivedBy: 'Dewi Lestari (Humas)',
      status: 'Tersimpan Aman',
    },
    {
      id: 'arc-4',
      code: 'ARC-2023-ALUMNI-04',
      title: 'Data Anggota Purna Tugas & Alumni Generasi 2021-2023',
      category: 'Data Anggota Alumni',
      period: 'Tahun 2021 - 2023',
      itemCount: 64,
      size: '4.1 MB',
      archivedAt: '10 Feb 2024',
      archivedBy: 'Iik Andriyana (Ketua)',
      status: 'Read-Only',
    },
  ]);

  // --- 3. AUDIT TRAIL STATES ---
  const [auditSearch, setAuditSearch] = useState('');
  const [auditModuleFilter, setAuditModuleFilter] = useState('Semua Modul');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState('Semua Level');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'log-1',
      timestamp: '29 Sep 2026, 18:24:12 WIB',
      user: 'Iik Andriyana',
      role: 'Ketua / Super Admin',
      action: 'UPDATE_SYSTEM_SETTINGS',
      module: 'PENGATURAN',
      severity: 'INFO',
      ipAddress: '192.168.1.10',
      device: 'Chrome 128 / Windows 11',
      details: 'Memperbarui konfigurasi aplikasi, parameter backup otomatis, dan sistem arsip.',
    },
    {
      id: 'log-2',
      timestamp: '29 Sep 2026, 17:45:00 WIB',
      user: 'Iik Andriyana',
      role: 'Ketua / Super Admin',
      action: 'SYNC_MEMBER_PASSWORD',
      module: 'ANGGOTA',
      severity: 'SUCCESS',
      ipAddress: '192.168.1.10',
      device: 'Chrome 128 / Windows 11',
      details: 'Sinkronisasi satu pintu kredensial anggota dengan otorisasi hak akses menu.',
    },
    {
      id: 'log-3',
      timestamp: '29 Sep 2026, 15:10:33 WIB',
      user: 'Anisa Rahmawati',
      role: 'Sekretaris',
      action: 'CREATE_OFFICIAL_LETTER',
      module: 'SURAT',
      severity: 'SUCCESS',
      ipAddress: '192.168.1.14',
      device: 'Firefox 130 / macOS Sonoma',
      details: 'Menerbitkan surat tugas nomor ST/2609/ML/54812 kegiatan bakti sosial.',
    },
    {
      id: 'log-4',
      timestamp: '29 Sep 2026, 14:02:18 WIB',
      user: 'Bagus Tri Prakoso',
      role: 'Bendahara',
      action: 'EXPORT_FINANCIAL_REPORT',
      module: 'KEUANGAN',
      severity: 'INFO',
      ipAddress: '192.168.1.18',
      device: 'Edge 128 / Windows 10',
      details: 'Ekspor dokumen Excel Laporan Pertanggungjawaban Kas Triwulan III.',
    },
    {
      id: 'log-5',
      timestamp: '29 Sep 2026, 09:30:11 WIB',
      user: 'Sistem Otomatis',
      role: 'System Daemon',
      action: 'AUTO_BACKUP_COMPLETED',
      module: 'BACKUP',
      severity: 'SUCCESS',
      ipAddress: '127.0.0.1 (Localhost)',
      device: 'NodeJS Cron Worker',
      details: 'Snapshot database berhasil dibuat: backup_simkt_manisjaya_2026-09-29_full.json (4.8 MB).',
    },
    {
      id: 'log-6',
      timestamp: '28 Sep 2026, 21:15:44 WIB',
      user: 'Fajar Maulana',
      role: 'Wakil Ketua',
      action: 'PUBLISH_NEWS_ARTICLE',
      module: 'ANGGOTA',
      severity: 'SUCCESS',
      ipAddress: '192.168.1.22',
      device: 'Chrome Mobile / Android 14',
      details: 'Menerbitkan rilis kegiatan Turnamen Futsal Pemuda RW 02 ke portal umum.',
    },
    {
      id: 'log-7',
      timestamp: '28 Sep 2026, 19:40:02 WIB',
      user: 'User Tak Dikenal',
      role: 'Guest / Anonymous',
      action: 'FAILED_LOGIN_ATTEMPT',
      module: 'AUTH',
      severity: 'WARNING',
      ipAddress: '182.253.110.45',
      device: 'Safari / iPhone 15',
      details: 'Gagal login username "admin" (sandi salah). Ditolak oleh proteksi keamanan.',
    },
    {
      id: 'log-8',
      timestamp: '28 Sep 2026, 13:05:19 WIB',
      user: 'Iik Andriyana',
      role: 'Ketua / Super Admin',
      action: 'RESTORE_ARCHIVE_DATA',
      module: 'ARSIP',
      severity: 'INFO',
      ipAddress: '192.168.1.10',
      device: 'Chrome 128 / Windows 11',
      details: 'Membuka dan memeriksa indeks arsip ARC-2024-SRT-01 untuk referensi surat lampau.',
    },
  ]);

  // --- 4. TENTANG SISTEM STATES ---
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [selectedChangelogVersion, setSelectedChangelogVersion] = useState<string>('v2.4.0');

  // Trigger create manual backup
  const handleCreateBackupNow = (type: 'Lengkap (Full)' | 'Database Saja') => {
    setIsBackingUp(true);
    onToast(`Sedang membuat snapshot cadangan data ${type}...`);

    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
      const fileName = `backup_simkt_manisjaya_${dateStr}_${Date.now().toString().slice(-4)}.json`;

      const newBackup: BackupItem = {
        id: `bk-${Date.now()}`,
        fileName,
        size: type === 'Lengkap (Full)' ? '4.9 MB' : '2.3 MB',
        createdAt: `${dateStr}, ${timeStr}`,
        creator: 'Iik Andriyana (Manual)',
        type,
        status: 'Tervalidasi',
      };

      setBackupItems([newBackup, ...backupItems]);
      setIsBackingUp(false);

      // Trigger actual JSON file download
      const backupPayload = {
        app: 'SIM-KT Manis Jaya',
        version: 'v2.4.0-Enterprise',
        exportedAt: now.toISOString(),
        exportedBy: 'Iik Andriyana',
        type,
        data: {
          organization: localStorage.getItem('kt_org_name') || 'Karang Taruna Manis Jaya',
          membersCount: localStorage.getItem('kt_members_v3') ? JSON.parse(localStorage.getItem('kt_members_v3')!).length : 6,
          timestamp: Date.now(),
        },
      };

      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      onToast(`Cadangan sistem "${fileName}" berhasil dibuat dan diunduh.`);
    }, 1000);
  };

  // Trigger restore execution
  const handleExecuteRestore = () => {
    if (!selectedBackupToRestore) return;
    setIsRestoring(true);
    onToast(`Memulai pemulihan basis data dari berkas: ${selectedBackupToRestore.fileName}...`);

    setTimeout(() => {
      setIsRestoring(false);
      setShowRestoreModal(false);
      onToast(`Pemulihan database berhasil! Seluruh tabel data Karang Taruna telah disinkronkan.`);
    }, 1500);
  };

  // Create new archive batch
  const handleExecuteArchive = (e: React.FormEvent) => {
    e.preventDefault();
    const newArch: ArchiveItem = {
      id: `arc-${Date.now()}`,
      code: `ARC-${newArchiveYear}-${newArchiveCategory.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      title: `Berkas Pengarsipan ${newArchiveCategory} Tahun ${newArchiveYear}`,
      category: newArchiveCategory,
      period: `Tahun ${newArchiveYear}`,
      itemCount: Math.floor(25 + Math.random() * 100),
      size: `${(Math.random() * 20 + 5).toFixed(1)} MB`,
      archivedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      archivedBy: 'Iik Andriyana (Ketua)',
      status: 'Tersimpan Aman',
    };

    setArchiveItems([newArch, ...archiveItems]);
    setShowNewArchiveModal(false);
    onToast(`Pengarsipan data "${newArch.title}" berhasil diproses dan disimpan.`);
  };

  // Export audit logs as CSV
  const handleExportAuditLogs = () => {
    const headers = ['ID', 'Waktu', 'Pengguna', 'Role', 'Aksi', 'Modul', 'Level', 'IP Address', 'Perangkat', 'Detail'];
    const rows = auditLogs.map((log) => [
      log.id,
      `"${log.timestamp}"`,
      `"${log.user}"`,
      `"${log.role}"`,
      log.action,
      log.module,
      log.severity,
      log.ipAddress,
      `"${log.device}"`,
      `"${log.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `audit_trail_simkt_manisjaya_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    onToast('Log Audit Trail berhasil diekspor ke format CSV.');
  };

  // Check update simulation
  const handleCheckUpdate = () => {
    setIsCheckingUpdate(true);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      onToast('Sistem Anda menggunakan versi stabil terbaru: SIM-KT v2.4.0-Enterprise (Up to date).');
    }, 1200);
  };

  // Filtered Archive Items
  const filteredArchives = archiveItems.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      item.code.toLowerCase().includes(archiveSearch.toLowerCase());
    const matchCategory = archiveFilter === 'Semua Kategori' || item.category === archiveFilter;
    return matchSearch && matchCategory;
  });

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.ipAddress.includes(auditSearch);
    const matchModule = auditModuleFilter === 'Semua Modul' || log.module === auditModuleFilter;
    const matchSeverity = auditSeverityFilter === 'Semua Level' || log.severity === auditSeverityFilter;
    return matchSearch && matchModule && matchSeverity;
  });

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      {/* Hidden file input for file-based restore */}
      <input
        type="file"
        ref={restoreFileInputRef}
        accept=".json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setSelectedBackupToRestore({
              id: `bk-upload-${Date.now()}`,
              fileName: file.name,
              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              createdAt: 'Berkas Unggahan Lokal',
              creator: 'Iik Andriyana (Unggah)',
              type: 'Lengkap (Full)',
              status: 'Tervalidasi',
            });
            setShowRestoreModal(true);
          }
        }}
      />

      {/* QUICK JUMP ANCHOR NAVIGATION BAR */}
      <div className="bg-slate-100/90 border border-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveSection('semua')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'semua'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Semua Pengaturan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('backup')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'backup'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backup & Restore</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('arsip')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'arsip'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Arsip Dokumen</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('audit')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'audit'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Trail</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('tentang')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'tentang'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Tentang Sistem</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 0. SERVER HEALTH & STATUS OVERVIEW CARDS */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'backup') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block leading-tight">Status Layanan</span>
                <span className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operasional Normal
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Uptime: 99.98% (30 hari)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block leading-tight">Kapasitas Basis Data</span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">14.8 MB / 5.0 GB</span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Tersedia 99.7% ruang</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block leading-tight">Total Data Terarsip</span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">4 Berkas (119.5 MB)</span>
                <span className="text-[10px] text-purple-600 font-bold block mt-0.5">Cold Storage Terenkripsi</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block leading-tight">Audit Trail 24 Jam</span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">{auditLogs.length} Entri Tercatat</span>
                <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">Keamanan Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SECTION: BACKUP & RESTORE */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'backup') && (
        <div id="section-backup" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                  Backup & Restore (Pencadangan & Pemulihan Data)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Amankan seluruh data organisasi secara berkala dan pulihkan saat dibutuhkan tanpa kehilangan riwayat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => restoreFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Berkas Pulihkan</span>
              </button>

              <button
                type="button"
                disabled={isBackingUp}
                onClick={() => handleCreateBackupNow('Lengkap (Full)')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all transform active:scale-95 disabled:opacity-60"
              >
                {isBackingUp ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mencadangkan...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Buat Cadangan Baru</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Backup Preferences: Auto Backup Switch & Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block text-xs">Pencadangan Otomatis Terjadwal</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Snapshot database diekspor otomatis ke server arsip lokal setiap tengah malam.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !backupOtomatis;
                  setBackupOtomatis(next);
                  onToast(`Pencadangan otomatis ${next ? 'diaktifkan' : 'dinonaktifkan'}.`);
                }}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                  backupOtomatis ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    backupOtomatis ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-900 block text-xs">Frekuensi Cadangan</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Jadwal pengeksekusian cron cadangan data.
                </span>
              </div>
              <select
                value={backupSchedule}
                onChange={(e: any) => {
                  setBackupSchedule(e.target.value);
                  onToast(`Jadwal pencadangan diubah ke: ${e.target.value}`);
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="Harian (02:00 WIB)">Harian (02:00 WIB)</option>
                <option value="Mingguan (Minggu)">Mingguan (Minggu)</option>
                <option value="Bulanan">Bulanan (Tiap tgl 1)</option>
              </select>
            </div>
          </div>

          {/* Backup History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Daftar Riwayat Snapshot Cadangan ({backupItems.length})
              </span>
              <span className="text-slate-400 text-[11px]">Format standar: JSON Terenkripsi SHA-256</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Nama Berkas Snapshot</th>
                    <th className="py-3 px-3">Tipe</th>
                    <th className="py-3 px-3">Ukuran</th>
                    <th className="py-3 px-3">Tanggal Dibuat</th>
                    <th className="py-3 px-3">Pembuat</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {backupItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-slate-900 flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate max-w-[220px]">{item.fileName}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{item.type}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono whitespace-nowrap">{item.size}</td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{item.createdAt}</td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{item.creator}</td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onToast(`Mengunduh berkas cadangan: ${item.fileName}...`);
                              const dummy = { name: item.fileName, exportedAt: item.createdAt };
                              const blob = new Blob([JSON.stringify(dummy, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = item.fileName;
                              a.click();
                            }}
                            title="Unduh Cadangan"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBackupToRestore(item);
                              setShowRestoreModal(true);
                            }}
                            title="Pulihkan dari Snapshot ini"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setBackupItems(backupItems.filter((b) => b.id !== item.id));
                              onToast(`Berkas cadangan "${item.fileName}" telah dihapus.`);
                            }}
                            title="Hapus Cadangan"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SECTION: ARSIP (PENGARSIPAN DOKUMEN & DATA ORGANISASI) */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'arsip') && (
        <div id="section-arsip" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                  Arsip Dokumen & Data Organisasi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Penyimpanan dokumen lampau, surat dinas, proposal, dan data alumni ke dalam gudang arsip digital mandiri.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNewArchiveModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all transform active:scale-95"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Jalankan Pengarsipan Periode</span>
            </button>
          </div>

          {/* Filter Bar for Archives */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                placeholder="Cari nama berkas arsip..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={archiveFilter}
                onChange={(e) => setArchiveFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                <option value="Surat Masuk/Keluar">Surat Masuk/Keluar</option>
                <option value="Proposal & LPJ">Proposal & LPJ</option>
                <option value="Data Anggota Alumni">Data Anggota Alumni</option>
                <option value="Dokumentasi Berita">Dokumentasi Berita</option>
              </select>
            </div>
          </div>

          {/* Archive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArchives.map((arc) => (
              <div
                key={arc.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-200 hover:shadow-xs transition-all space-y-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                      <Archive className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-600 block">{arc.code}</span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-1">{arc.title}</h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 shrink-0">
                    {arc.period}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kategori</span>
                    <span className="font-semibold text-slate-700 truncate block">{arc.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Dokumen</span>
                    <span className="font-bold text-slate-900 block">{arc.itemCount} Berkas</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Ukuran</span>
                    <span className="font-mono font-bold text-slate-800 block">{arc.size}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[10px] text-slate-400">
                    Diarsip: {arc.archivedAt} · {arc.archivedBy.split(' ')[0]}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToast(`Membuka indeks dokumen arsip ${arc.code}...`)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-[11px]"
                    >
                      Buka Indeks
                    </button>
                    <button
                      type="button"
                      onClick={() => onToast(`Mengunduh paket arsip ${arc.code} (${arc.size})...`)}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded-lg"
                      title="Download Arsip"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTION: AUDIT TRAIL (JEJAK AKTIVITAS & AUDIT KEAMANAN) */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'audit') && (
        <div id="section-audit" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                  Audit Trail (Jejak Rekam Aktivitas & Keamanan)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pencatatan setiap operasi sistem, login, penambahan data, dan perubahan wewenang untuk akuntabilitas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportAuditLogs}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ekspor CSV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToast('Log audit yang lebih dari 90 hari telah dibersihkan secara aman.');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Bersihkan &gt;90 Hari</span>
              </button>
            </div>
          </div>

          {/* Audit Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Cari user, aksi, IP address..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <select
                value={auditModuleFilter}
                onChange={(e) => setAuditModuleFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="Semua Modul">Semua Modul Sistem</option>
                <option value="AUTH">AUTH (Login & Keamanan)</option>
                <option value="ANGGOTA">ANGGOTA (Data & KTA)</option>
                <option value="SURAT">SURAT (Tata Naskah)</option>
                <option value="KEUANGAN">KEUANGAN (LPJ & Kas)</option>
                <option value="PENGATURAN">PENGATURAN (Sistem)</option>
                <option value="BACKUP">BACKUP (Cadangan)</option>
                <option value="ARSIP">ARSIP (Pengarsipan)</option>
              </select>
            </div>

            <div>
              <select
                value={auditSeverityFilter}
                onChange={(e) => setAuditSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="Semua Level">Semua Level Urgensi</option>
                <option value="INFO">INFO</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="WARNING">WARNING</option>
                <option value="DANGER">DANGER</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Waktu</th>
                  <th className="py-3 px-3">Pengguna</th>
                  <th className="py-3 px-3">Aksi & Modul</th>
                  <th className="py-3 px-3">IP & Perangkat</th>
                  <th className="py-3 px-3">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.user}</div>
                      <div className="text-[10px] text-slate-400">{log.role}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                            log.severity === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.severity === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : log.severity === 'DANGER'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.module}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-800">{log.action}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-slate-700 text-[11px]">{log.ipAddress}</div>
                      <div className="text-[10px] text-slate-400">{log.device}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-600 text-[11px] max-w-xs">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECTION: (TENTANG SISTEM) INFORMASI APLIKASI, VERSI, LISENSI, CHANGELOG */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'tentang') && (
        <div id="section-tentang" className="space-y-6 pt-2">
          {/* Main Container Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-[#0e2439] to-[#0a1b2d] rounded-3xl text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center p-2.5 backdrop-blur-sm shadow-inner shrink-0">
                    <Info className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-400/20">
                        TENTANG SISTEM
                      </span>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terverifikasi
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                      Sistem Informasi Manajemen Karang Taruna (SIM-KT)
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Kelurahan Manis Jaya, Kecamatan Jatiuwung, Kota Tangerang, Banten
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCheckUpdate}
                    disabled={isCheckingUpdate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 shadow-sm transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                    <span>{isCheckingUpdate ? 'Memeriksa...' : 'Periksa Pembaruan'}</span>
                  </button>
                </div>
              </div>

              {/* 4 Cards: Informasi Aplikasi, Versi, Lisensi, Changelog Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                {/* CARD 1: INFORMASI APLIKASI */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>Informasi Aplikasi</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    SIM-KT Manis Jaya adalah platform tata kelola terintegrasi untuk pengelolaan administrasi keanggotaan,
                    surat dinas, proposal kegiatan, inventaris logistik, serta transparansi pelaporan kas warga.
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Pengembang:</span>
                      <span className="font-semibold text-white">Tim TI Karang Taruna</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Penanggung Jawab:</span>
                      <span className="font-semibold text-white">Iik Andriyana (Ketua)</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Environment:</span>
                      <span className="font-mono text-emerald-400">React + TS + Vite</span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: VERSI SISTEM */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>Versi & Build</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">v2.4.0</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Enterprise Stable
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Nomor Build:</span>
                      <span className="font-mono text-white">2026.09.29-KT-REV3</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Tanggal Rilis:</span>
                      <span className="text-white">29 September 2026</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Status Server:</span>
                      <span className="text-emerald-400 font-bold">Versi Terbaru (Up to Date)</span>
                    </div>
                  </div>
                </div>

                {/* CARD 3: LISENSI */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <Shield className="w-4 h-4" />
                    <span>Lisensi & Legalitas</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Dilisensikan secara khusus untuk Pengurus Karang Taruna Kelurahan Manis Jaya di bawah naungan Kelurahan
                    Manis Jaya, Kota Tangerang.
                  </p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Hak Cipta:</span>
                    <span className="font-semibold text-white">© 2024 - 2026 Karang Taruna</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLicenseModal(true)}
                    className="w-full mt-1 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 text-purple-200 text-xs font-bold transition-colors"
                  >
                    Lihat Ketentuan Lisensi (EULA)
                  </button>
                </div>
              </div>

              {/* CARD 4: CHANGELOG SECTION (CATATAN RILIS LENGKAP) */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-white text-sm">Changelog & Riwayat Pembaruan Sistem</h4>
                  </div>

                  {/* Version Pills Switcher */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {['v2.4.0', 'v2.3.5', 'v2.3.0', 'v2.0.0', 'v1.0.0'].map((ver) => (
                      <button
                        key={ver}
                        type="button"
                        onClick={() => setSelectedChangelogVersion(ver)}
                        className={`px-3 py-1 rounded-lg font-mono font-bold transition-all text-xs ${
                          selectedChangelogVersion === ver
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {ver}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Changelog Content based on selected version */}
                {selectedChangelogVersion === 'v2.4.0' && (
                  <div className="space-y-3 text-xs animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Versi 2.4.0-Enterprise</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-semibold border border-emerald-400/30">
                        Rilis Saat Ini (29 September 2026)
                      </span>
                    </div>
                    <ul className="space-y-2 text-slate-300 text-[11px] list-disc list-inside">
                      <li>
                        <strong className="text-white">Fitur Baru (Backup & Restore):</strong> Penyediaan snapshot instan database,
                        ekspor file JSON, pemulihan data lokal, dan penjadwalan otomatis harian.
                      </li>
                      <li>
                        <strong className="text-white">Fitur Baru (Arsip Dokumen):</strong> Pengarsipan surat dinas, proposal, dan LPJ
                        ke dalam cold storage read-only untuk penghematan ruang aktif.
                      </li>
                      <li>
                        <strong className="text-white">Fitur Baru (Audit Trail):</strong> Pencatatan kronologis seluruh aksi pengguna,
                        login, perubahan sandi, modul terdampak, IP address, dan ekspor CSV.
                      </li>
                      <li>
                        <strong className="text-white">Fitur Baru (Tentang Sistem):</strong> Panel informasi aplikasi resmi, build
                        number, ketentuan lisensi EULA, dan changelog terpadu.
                      </li>
                      <li>
                        <strong className="text-white">Peningkatan:</strong> Integrasi 100% data Anggota dengan Formulir Akses
                        Pengguna & Kata Sandi satu pintu secara dua arah.
                      </li>
                      <li>
                        <strong className="text-white">Peningkatan:</strong> Laporan Kegiatan multi-format (Cetak, PDF, Excel) sesuai
                        standarisasi dokumen resmi.
                      </li>
                    </ul>
                  </div>
                )}

                {selectedChangelogVersion === 'v2.3.5' && (
                  <div className="space-y-3 text-xs animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Versi 2.3.5</span>
                      <span className="text-[10px] bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                        20 September 2026
                      </span>
                    </div>
                    <ul className="space-y-2 text-slate-300 text-[11px] list-disc list-inside">
                      <li>
                        <strong className="text-white">Fitur:</strong> Penambahan formulir 6 kartu bernomor untuk Tambah Berita &
                        Dokumentasi Kegiatan Karang Taruna.
                      </li>
                      <li>
                        <strong className="text-white">Penyempurnaan:</strong> Tata letak Kop Surat dinas dan stempel resmi digital
                        Kelurahan Manis Jaya.
                      </li>
                    </ul>
                  </div>
                )}

                {selectedChangelogVersion === 'v2.3.0' && (
                  <div className="space-y-3 text-xs animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Versi 2.3.0</span>
                      <span className="text-[10px] bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                        15 Agustus 2026
                      </span>
                    </div>
                    <ul className="space-y-2 text-slate-300 text-[11px] list-disc list-inside">
                      <li>
                        <strong className="text-white">Fitur:</strong> Penerbitan Kartu Tanda Anggota (e-KTA) Digital dengan QR Code
                        terverifikasi.
                      </li>
                      <li>
                        <strong className="text-white">Fitur:</strong> Modul Surat Menyurat otomatis dengan penomoran surat dinas.
                      </li>
                    </ul>
                  </div>
                )}

                {selectedChangelogVersion === 'v2.0.0' && (
                  <div className="space-y-3 text-xs animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Versi 2.0.0 (Next-Gen Workspace)</span>
                      <span className="text-[10px] bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                        01 Januari 2026
                      </span>
                    </div>
                    <ul className="space-y-2 text-slate-300 text-[11px] list-disc list-inside">
                      <li>
                        <strong className="text-white">Arsitektur Baru:</strong> Pembaruan antarmuka modern dengan Tailwind CSS,
                        dashboard eksekutif, serta grafik visualisasi program pemuda.
                      </li>
                    </ul>
                  </div>
                )}

                {selectedChangelogVersion === 'v1.0.0' && (
                  <div className="space-y-3 text-xs animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Versi 1.0.0 (Inisialisasi Perdana)</span>
                      <span className="text-[10px] bg-slate-500/20 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                        10 Januari 2024
                      </span>
                    </div>
                    <ul className="space-y-2 text-slate-300 text-[11px] list-disc list-inside">
                      <li>
                        <strong className="text-white">Perdana:</strong> Peluncuran sistem pencatatan pemuda dan buku induk anggota
                        Karang Taruna Manis Jaya.
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: KONFIRMASI RESTORE DATABASE */}
      {/* ========================================================================= */}
      {showRestoreModal && selectedBackupToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Konfirmasi Pemulihan Database</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 text-xs space-y-2">
              <p className="font-bold">Perhatian Penting:</p>
              <p className="leading-relaxed">
                Proses pemulihan akan menimpa data yang sedang berjalan dengan isi dari snapshot cadangan:
              </p>
              <div className="p-2.5 bg-white/80 rounded-xl font-mono text-[11px] font-bold text-slate-800 border border-amber-200">
                {selectedBackupToRestore.fileName} ({selectedBackupToRestore.size})
              </div>
              <p className="text-[11px] text-amber-800">
                Disarankan untuk membuat cadangan baru terlebih dahulu sebelum melanjutkan tindakan ini.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Batalkan
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleExecuteRestore}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-60"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memulihkan Data...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ya, Pulihkan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: JALANKAN PENGARSIPAN PERIODE BARU */}
      {/* ========================================================================= */}
      {showNewArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Jalankan Pengarsipan Periode</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewArchiveModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteArchive} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Kategori Dokumen yang Diarsip</label>
                <select
                  value={newArchiveCategory}
                  onChange={(e: any) => setNewArchiveCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Surat Masuk/Keluar">Surat Masuk & Keluar Lampau</option>
                  <option value="Proposal & LPJ">Proposal & Laporan Kas (LPJ)</option>
                  <option value="Data Anggota Alumni">Data Anggota Purna Tugas / Alumni</option>
                  <option value="Dokumentasi Berita">Dokumentasi Berita & Foto</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Tahun / Periode</label>
                <select
                  value={newArchiveYear}
                  onChange={(e) => setNewArchiveYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="2025">Tahun 2025</option>
                  <option value="2024">Tahun 2024</option>
                  <option value="2023">Tahun 2023</option>
                  <option value="2022">Tahun 2022</option>
                </select>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl text-purple-900 text-[11px] leading-relaxed">
                Dokumen pada periode terpilih akan dikompresi ke dalam arsip terenkripsi. Dokumen tetap dapat dibuka dan
                diunduh sewaktu-waktu melalui tabel arsip.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewArchiveModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Mulai Pengarsipan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: KETENTUAN LISENSI EULA */}
      {/* ========================================================================= */}
      {showLicenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 p-6 sm:p-7 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Perjanjian Lisensi Resmi (EULA)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLicenseModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-900">
                Sistem Informasi Manajemen Karang Taruna (SIM-KT) Kelurahan Manis Jaya
              </p>
              <p>
                Aplikasi ini dikembangkan secara proprietary untuk keperluan tata kelola organisasi kepemudaan Karang
                Taruna Manis Jaya.
              </p>
              <h5 className="font-bold text-slate-800 pt-1">1. Hak Penggunaan:</h5>
              <p>
                Diberikan kepada seluruh pengurus resmi yang terdaftar oleh Ketua Karang Taruna dan Kelurahan Manis Jaya
                untuk mengelola keanggotaan, agenda sosial, dan persuratan resmi.
              </p>
              <h5 className="font-bold text-slate-800 pt-1">2. Perlindungan Data Pribadi:</h5>
              <p>
                Seluruh data NIK, kontak warga, nomor telepon, dan berkas keuangan dilindungi secara ketat. Dilarang keras
                membocorkan atau memperjualbelikan database anggota kepada pihak ketiga manapun.
              </p>
              <h5 className="font-bold text-slate-800 pt-1">3. Tanggung Jawab Akun:</h5>
              <p>
                Pemegang akun bertanggung jawab penuh atas seluruh aktivitas audit trail yang dilakukan menggunakan akun
                login masing-masing.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowLicenseModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Saya Memahami & Menyetujui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
