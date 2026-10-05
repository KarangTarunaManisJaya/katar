import React, { useState, useEffect } from 'react';
import {
  Mail,
  Inbox,
  Send,
  Share2,
  FolderArchive,
  Settings,
  Plus,
  LayoutDashboard,
  Search,
  Printer,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import {
  SuratMasukItem,
  SuratKeluarItem,
  DisposisiItem,
  NumberingConfig,
  StatusSuratMasuk,
  StatusSuratKeluar,
} from '../../types/surat';
import {
  defaultNumberingConfig,
  getInitialSuratMasukData,
  getInitialSuratKeluarData,
  getInitialDisposisiData,
} from '../../data/suratInitialData';
import { addNotification } from '../../services/notificationService';

import { SuratDashboard } from './surat/SuratDashboard';
import { SuratMasukTab } from './surat/SuratMasukTab';
import { SuratKeluarTab } from './surat/SuratKeluarTab';
import { DisposisiTab } from './surat/DisposisiTab';
import { ArsipRekapTab } from './surat/ArsipRekapTab';
import { BuatSuratFormModal } from './surat/BuatSuratFormModal';
import { SuratMasukFormModal } from './surat/SuratMasukFormModal';
import { DisposisiFormModal } from './surat/DisposisiFormModal';
import { PenomoranSettingsModal } from './surat/PenomoranSettingsModal';
import { CetakSuratModal } from './surat/CetakSuratModal';
import { SuratDetailModal } from './surat/SuratDetailModal';

type SuratSubTab = 'dashboard' | 'masuk' | 'keluar' | 'disposisi' | 'arsip';

interface SuratMenyuratViewProps {
  onToast: (msg: string) => void;
}

const sanitizeSuratKeluarItem = (raw: any): SuratKeluarItem => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return {
    id: raw?.id || `sk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    nomorSurat: raw?.nomorSurat || raw?.autoNumber || 'UND/001/KT-MJ/2026',
    tanggalSurat: raw?.tanggalSurat || todayStr,
    tujuan: raw?.tujuan || raw?.recipient || 'Pihak Terkait',
    namaPenerima: raw?.namaPenerima || '',
    instansi: raw?.instansi || 'Kelurahan Manis Jaya',
    alamat: raw?.alamat || 'Di Tempat',
    perihal: raw?.perihal || raw?.title || 'Surat Dinas Organisasi',
    jenisSurat: raw?.jenisSurat || raw?.category || 'Undangan',
    sifatSurat: raw?.sifatSurat || 'Biasa',
    isiSurat: raw?.isiSurat || raw?.content || 'Surat resmi Karang Taruna Kelurahan Manis Jaya.',
    tembusan: Array.isArray(raw?.tembusan) ? raw.tembusan : ['Pembina Karang Taruna', 'Arsip'],
    lampiran: Array.isArray(raw?.lampiran) ? raw.lampiran : [],
    penandatangan: Array.isArray(raw?.penandatangan) && raw.penandatangan.length > 0
      ? raw.penandatangan
      : [
          {
            nama: 'Muhammad Ryan Pratama, S.Kom.',
            jabatan: 'Ketua Umum',
            ktaNo: 'KT-MJ-2024-001',
            includeStamp: true,
          },
        ],
    stempelOrganisasi: raw?.stempelOrganisasi !== undefined ? !!raw.stempelOrganisasi : true,
    status: raw?.status === 'Proses' ? 'Menunggu TTD' : (raw?.status || 'Draft'),
    filePdfGenerated: !!raw?.filePdfGenerated,
    templateUsed: raw?.templateUsed,
    keterangan: raw?.keterangan,
    createdAt: raw?.createdAt || new Date().toISOString(),
    updatedAt: raw?.updatedAt || new Date().toISOString(),
  };
};

const sanitizeSuratMasukItem = (raw: any): SuratMasukItem => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return {
    id: raw?.id || `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    nomorSurat: raw?.nomorSurat || '001/EXT/2026',
    tanggalSurat: raw?.tanggalSurat || todayStr,
    tanggalDiterima: raw?.tanggalDiterima || todayStr,
    pengirim: raw?.pengirim || 'Instansi Luar',
    instansi: raw?.instansi || 'Pihak Eksternal',
    perihal: raw?.perihal || 'Surat Masuk',
    jenisSurat: raw?.jenisSurat || 'Pemberitahuan',
    sifatSurat: raw?.sifatSurat || 'Biasa',
    tujuanDisposisi: raw?.tujuanDisposisi || 'Ketua Umum & Sekretaris',
    ringkasanIsi: raw?.ringkasanIsi || '',
    lampiran: Array.isArray(raw?.lampiran) ? raw.lampiran : [],
    fileSuratName: raw?.fileSuratName,
    fileSuratUrl: raw?.fileSuratUrl,
    petugasPenerima: raw?.petugasPenerima || 'Sekretariat',
    status: raw?.status || 'Belum Diproses',
    catatan: raw?.catatan,
    disposisiId: raw?.disposisiId,
    createdAt: raw?.createdAt || new Date().toISOString(),
    updatedAt: raw?.updatedAt || new Date().toISOString(),
  };
};

const sanitizeDisposisiItem = (raw: any): DisposisiItem => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return {
    id: raw?.id || `disp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    nomorDisposisi: raw?.nomorDisposisi || 'DSP/001/X/2026',
    tanggalDisposisi: raw?.tanggalDisposisi || todayStr,
    suratMasukId: raw?.suratMasukId || '',
    nomorSuratMasuk: raw?.nomorSuratMasuk || '',
    perihalSuratMasuk: raw?.perihalSuratMasuk || '',
    instansiSuratMasuk: raw?.instansiSuratMasuk || '',
    dari: raw?.dari || 'Ketua Umum',
    kepada: raw?.kepada || 'Sekretariat',
    instruksi: raw?.instruksi || 'Tindak lanjuti segera',
    batasWaktu: raw?.batasWaktu || todayStr,
    catatan: raw?.catatan || '',
    status: raw?.status || 'Menunggu',
    tanggalSelesai: raw?.tanggalSelesai,
    catatanPenyelesaian: raw?.catatanPenyelesaian,
    createdAt: raw?.createdAt || new Date().toISOString(),
  };
};

export const SuratMenyuratView: React.FC<SuratMenyuratViewProps> = ({ onToast }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<SuratSubTab>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  // 1. DATA STATE: Surat Masuk
  const [suratMasuk, setSuratMasuk] = useState<SuratMasukItem[]>(() => {
    try {
      const saved = localStorage.getItem('kt_surat_masuk_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeSuratMasukItem);
        }
      }
    } catch {}
    return getInitialSuratMasukData();
  });

  // 2. DATA STATE: Surat Keluar
  const [suratKeluar, setSuratKeluar] = useState<SuratKeluarItem[]>(() => {
    try {
      const saved = localStorage.getItem('kt_surat_items_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeSuratKeluarItem);
        }
      }
    } catch {}
    return getInitialSuratKeluarData();
  });

  // 3. DATA STATE: Disposisi
  const [disposisi, setDisposisi] = useState<DisposisiItem[]>(() => {
    try {
      const saved = localStorage.getItem('kt_surat_disposisi_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeDisposisiItem);
        }
      }
    } catch {}
    return getInitialDisposisiData();
  });

  // 4. DATA STATE: Numbering Config
  const [numberingConfig, setNumberingConfig] = useState<NumberingConfig>(() => {
    try {
      const saved = localStorage.getItem('kt_surat_numbering_cfg_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...defaultNumberingConfig,
            ...parsed,
            kodeSuratMap: { ...defaultNumberingConfig.kodeSuratMap, ...(parsed.kodeSuratMap || {}) },
          };
        }
      }
    } catch {}
    return defaultNumberingConfig;
  });

  // LocalStorage sync effects
  useEffect(() => {
    localStorage.setItem('kt_surat_masuk_v1', JSON.stringify(suratMasuk));
  }, [suratMasuk]);

  useEffect(() => {
    localStorage.setItem('kt_surat_items_v2', JSON.stringify(suratKeluar));
  }, [suratKeluar]);

  useEffect(() => {
    localStorage.setItem('kt_surat_disposisi_v1', JSON.stringify(disposisi));
  }, [disposisi]);

  useEffect(() => {
    localStorage.setItem('kt_surat_numbering_cfg_v1', JSON.stringify(numberingConfig));
  }, [numberingConfig]);

  // Listener for remote database restore
  useEffect(() => {
    const handleRemoteRefresh = () => {
      try {
        const sm = localStorage.getItem('kt_surat_masuk_v1');
        if (sm) {
          const parsed = JSON.parse(sm);
          if (Array.isArray(parsed)) setSuratMasuk(parsed.map(sanitizeSuratMasukItem));
        }
        const sk = localStorage.getItem('kt_surat_items_v2');
        if (sk) {
          const parsed = JSON.parse(sk);
          if (Array.isArray(parsed)) setSuratKeluar(parsed.map(sanitizeSuratKeluarItem));
        }
        const ds = localStorage.getItem('kt_surat_disposisi_v1');
        if (ds) {
          const parsed = JSON.parse(ds);
          if (Array.isArray(parsed)) setDisposisi(parsed.map(sanitizeDisposisiItem));
        }
        const cfg = localStorage.getItem('kt_surat_numbering_cfg_v1');
        if (cfg) {
          const parsed = JSON.parse(cfg);
          if (parsed) setNumberingConfig({ ...defaultNumberingConfig, ...parsed });
        }
      } catch {}
    };
    window.addEventListener('kt_database_restored', handleRemoteRefresh);
    return () => {
      window.removeEventListener('kt_database_restored', handleRemoteRefresh);
    };
  }, []);

  // Modals state
  const [isBuatSuratOpen, setIsBuatSuratOpen] = useState(false);
  const [editingSuratKeluar, setEditingSuratKeluar] = useState<SuratKeluarItem | null>(null);

  const [isInputMasukOpen, setIsInputMasukOpen] = useState(false);
  const [editingSuratMasuk, setEditingSuratMasuk] = useState<SuratMasukItem | null>(null);

  const [isDisposisiOpen, setIsDisposisiOpen] = useState(false);
  const [editingDisposisi, setEditingDisposisi] = useState<DisposisiItem | null>(null);
  const [disposisiTargetSurat, setDisposisiTargetSurat] = useState<SuratMasukItem | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [detailSuratMasuk, setDetailSuratMasuk] = useState<SuratMasukItem | null>(null);
  const [detailSuratKeluar, setDetailSuratKeluar] = useState<SuratKeluarItem | null>(null);

  const [printSuratKeluar, setPrintSuratKeluar] = useState<SuratKeluarItem | null>(null);
  const [printLembarDisposisi, setPrintLembarDisposisi] = useState<DisposisiItem | null>(null);

  // Quick stats for badges
  const unhandledMasuk = suratMasuk.filter(
    (s) => s.status === 'Belum Diproses' || s.status === 'Menunggu Balasan'
  ).length;

  const pendingDisposisi = disposisi.filter(
    (d) => d.status === 'Menunggu' || d.status === 'Dikerjakan'
  ).length;

  // Handlers for Surat Masuk
  const handleSaveSuratMasuk = (item: SuratMasukItem, autoCreateDisposisi?: boolean) => {
    const isEdit = suratMasuk.some((s) => s.id === item.id);
    if (isEdit) {
      setSuratMasuk(suratMasuk.map((s) => (s.id === item.id ? item : s)));
      onToast(`Surat Masuk "${item.nomorSurat}" berhasil diperbarui.`);
      addNotification({
        title: 'Surat Masuk Diperbarui',
        message: `${item.nomorSurat} dari ${item.instansi} (${item.perihal})`,
        type: 'surat',
        linkTab: 'surat',
        actionLabel: 'Buka Surat',
      });
    } else {
      setSuratMasuk([item, ...suratMasuk]);
      onToast(`Surat Masuk dari "${item.instansi}" berhasil dicatat.`);
      addNotification({
        title: 'Surat Masuk Baru',
        message: `${item.nomorSurat} dari ${item.instansi} (${item.perihal})`,
        type: 'surat',
        linkTab: 'surat',
        actionLabel: 'Buka Surat',
      });

      if (autoCreateDisposisi) {
        setDisposisiTargetSurat(item);
        setEditingDisposisi(null);
        setIsDisposisiOpen(true);
      }
    }
  };

  const handleDeleteSuratMasuk = (id: string) => {
    const item = suratMasuk.find((s) => s.id === id);
    if (confirm(`Apakah Anda yakin ingin menghapus surat masuk "${item?.nomorSurat}"?`)) {
      setSuratMasuk(suratMasuk.filter((s) => s.id !== id));
      onToast(`Surat masuk "${item?.nomorSurat}" berhasil dihapus.`);
    }
  };

  const handleUpdateStatusSuratMasuk = (id: string, newStatus: StatusSuratMasuk) => {
    setSuratMasuk(
      suratMasuk.map((s) => (s.id === id ? { ...s, status: newStatus, updatedAt: new Date().toISOString() } : s))
    );
    onToast(`Status surat masuk diperbarui ke "${newStatus}".`);
  };

  // Handlers for Surat Keluar
  const handleSaveSuratKeluar = (item: SuratKeluarItem) => {
    const isEdit = suratKeluar.some((s) => s.id === item.id);
    if (isEdit) {
      setSuratKeluar(suratKeluar.map((s) => (s.id === item.id ? item : s)));
      onToast(`Surat Keluar "${item.nomorSurat}" berhasil diperbarui.`);
      addNotification({
        title: 'Surat Keluar Diperbarui',
        message: `${item.nomorSurat} untuk ${item.tujuan} (${item.perihal})`,
        type: 'surat',
        linkTab: 'surat',
        actionLabel: 'Buka Surat',
      });
    } else {
      setSuratKeluar([item, ...suratKeluar]);
      onToast(`Surat Keluar "${item.nomorSurat}" berhasil diterbitkan!`);
      addNotification({
        title: 'Surat Keluar Diterbitkan',
        message: `${item.nomorSurat} untuk ${item.tujuan} (${item.perihal})`,
        type: 'surat',
        linkTab: 'surat',
        actionLabel: 'Buka Surat',
      });
    }
  };

  const handleDeleteSuratKeluar = (id: string) => {
    const item = suratKeluar.find((s) => s.id === id);
    if (confirm(`Apakah Anda yakin ingin menghapus surat keluar "${item?.nomorSurat}"?`)) {
      setSuratKeluar(suratKeluar.filter((s) => s.id !== id));
      onToast(`Surat keluar "${item?.nomorSurat}" berhasil dihapus.`);
    }
  };

  const handleUpdateStatusSuratKeluar = (id: string, newStatus: StatusSuratKeluar) => {
    setSuratKeluar(
      suratKeluar.map((s) => (s.id === id ? { ...s, status: newStatus, updatedAt: new Date().toISOString() } : s))
    );
    onToast(`Status surat keluar diperbarui ke "${newStatus}".`);
  };

  // Handlers for Disposisi
  const handleSaveDisposisi = (item: DisposisiItem) => {
    const isEdit = disposisi.some((d) => d.id === item.id);
    if (isEdit) {
      setDisposisi(disposisi.map((d) => (d.id === item.id ? item : d)));
      onToast(`Lembar Disposisi "${item.nomorDisposisi}" berhasil diperbarui.`);
    } else {
      setDisposisi([item, ...disposisi]);
      // Update target surat masuk to indicate disposisi created
      setSuratMasuk(
        suratMasuk.map((s) =>
          s.id === item.suratMasukId ? { ...s, disposisiId: item.id, status: 'Diproses/Didisposisi' } : s
        )
      );
      onToast(`Lembar Disposisi "${item.nomorDisposisi}" berhasil diterbitkan.`);
      addNotification({
        title: 'Disposisi Diterbitkan',
        message: `Disposisi ${item.nomorDisposisi} diteruskan kepada ${item.kepada}`,
        type: 'surat',
        linkTab: 'surat',
        actionLabel: 'Buka Disposisi',
      });
    }
  };

  const handleDeleteDisposisi = (id: string) => {
    const item = disposisi.find((d) => d.id === id);
    if (confirm(`Apakah Anda yakin ingin menghapus lembar disposisi "${item?.nomorDisposisi}"?`)) {
      setDisposisi(disposisi.filter((d) => d.id !== id));
      onToast(`Lembar disposisi "${item?.nomorDisposisi}" berhasil dihapus.`);
    }
  };

  const handleCompleteDisposisi = (item: DisposisiItem) => {
    setDisposisi(disposisi.map((d) => (d.id === item.id ? item : d)));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Sub-Navigation Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {/* Dashboard Tab */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Surat</span>
          </button>

          {/* Surat Masuk Tab */}
          <button
            onClick={() => setActiveTab('masuk')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'masuk'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Surat Masuk</span>
            {unhandledMasuk > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'masuk' ? 'bg-white text-blue-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {unhandledMasuk}
              </span>
            )}
          </button>

          {/* Surat Keluar Tab */}
          <button
            onClick={() => setActiveTab('keluar')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'keluar'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Surat Keluar</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'keluar' ? 'bg-white text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {suratKeluar.length}
            </span>
          </button>

          {/* Disposisi Tab */}
          <button
            onClick={() => setActiveTab('disposisi')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'disposisi'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Disposisi</span>
            {pendingDisposisi > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'disposisi' ? 'bg-white text-amber-800' : 'bg-rose-100 text-rose-700'
              }`}>
                {pendingDisposisi}
              </span>
            )}
          </button>

          {/* Arsip & Rekap Tab */}
          <button
            onClick={() => setActiveTab('arsip')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'arsip'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Arsip & Rekapitulasi</span>
          </button>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Pengaturan Penomoran Otomatis & Format Dokumen"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Format Penomoran</span>
          </button>

          <button
            onClick={() => {
              setEditingSuratKeluar(null);
              setIsBuatSuratOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Surat</span>
          </button>
        </div>
      </div>

      {/* CONTENT TABS */}
      {activeTab === 'dashboard' && (
        <SuratDashboard
          suratMasuk={suratMasuk}
          suratKeluar={suratKeluar}
          disposisi={disposisi}
          onNavigateTab={(tab) => {
            if (tab === 'buat') {
              setEditingSuratKeluar(null);
              setIsBuatSuratOpen(true);
            } else {
              setActiveTab(tab as SuratSubTab);
            }
          }}
          onOpenSuratMasukDetail={(sm) => setDetailSuratMasuk(sm)}
          onOpenSuratKeluarDetail={(sk) => setDetailSuratKeluar(sk)}
          onOpenBuatSurat={() => {
            setEditingSuratKeluar(null);
            setIsBuatSuratOpen(true);
          }}
          onOpenInputMasuk={() => {
            setEditingSuratMasuk(null);
            setIsInputMasukOpen(true);
          }}
          searchQuery={globalSearch}
          setSearchQuery={setGlobalSearch}
        />
      )}

      {activeTab === 'masuk' && (
        <SuratMasukTab
          items={suratMasuk}
          onAddNew={() => {
            setEditingSuratMasuk(null);
            setIsInputMasukOpen(true);
          }}
          onEdit={(item) => {
            setEditingSuratMasuk(item);
            setIsInputMasukOpen(true);
          }}
          onDelete={handleDeleteSuratMasuk}
          onViewDetail={(item) => setDetailSuratMasuk(item)}
          onCreateDisposisi={(item) => {
            setDisposisiTargetSurat(item);
            setEditingDisposisi(null);
            setIsDisposisiOpen(true);
          }}
          onUpdateStatus={handleUpdateStatusSuratMasuk}
          searchQuery={globalSearch}
          setSearchQuery={setGlobalSearch}
        />
      )}

      {activeTab === 'keluar' && (
        <SuratKeluarTab
          items={suratKeluar}
          onAddNew={() => {
            setEditingSuratKeluar(null);
            setIsBuatSuratOpen(true);
          }}
          onEdit={(item) => {
            setEditingSuratKeluar(item);
            setIsBuatSuratOpen(true);
          }}
          onDelete={handleDeleteSuratKeluar}
          onViewDetail={(item) => setDetailSuratKeluar(item)}
          onPrintPreview={(item) => setPrintSuratKeluar(item)}
          onUpdateStatus={handleUpdateStatusSuratKeluar}
          onToast={onToast}
          searchQuery={globalSearch}
          setSearchQuery={setGlobalSearch}
        />
      )}

      {activeTab === 'disposisi' && (
        <DisposisiTab
          disposisiList={disposisi}
          suratMasukList={suratMasuk}
          onAddNew={() => {
            setEditingDisposisi(null);
            setDisposisiTargetSurat(null);
            setIsDisposisiOpen(true);
          }}
          onEdit={(item) => {
            setEditingDisposisi(item);
            setDisposisiTargetSurat(null);
            setIsDisposisiOpen(true);
          }}
          onDelete={handleDeleteDisposisi}
          onComplete={handleCompleteDisposisi}
          onPrintLembarDisposisi={(item) => setPrintLembarDisposisi(item)}
          onToast={onToast}
        />
      )}

      {activeTab === 'arsip' && (
        <ArsipRekapTab
          suratMasuk={suratMasuk}
          suratKeluar={suratKeluar}
          disposisi={disposisi}
          onOpenSuratMasukDetail={(sm) => setDetailSuratMasuk(sm)}
          onOpenSuratKeluarDetail={(sk) => setDetailSuratKeluar(sk)}
          onToast={onToast}
        />
      )}

      {/* ALL MODALS */}

      {/* 1. Buat Surat Keluar Modal */}
      <BuatSuratFormModal
        isOpen={isBuatSuratOpen}
        onClose={() => setIsBuatSuratOpen(false)}
        onSave={handleSaveSuratKeluar}
        editingItem={editingSuratKeluar}
        numberingConfig={numberingConfig}
        onUpdateCounter={(newCounter) => {
          setNumberingConfig((prev) => ({ ...prev, counterSaatIni: newCounter }));
        }}
        onToast={onToast}
      />

      {/* 2. Catat Surat Masuk Modal */}
      <SuratMasukFormModal
        isOpen={isInputMasukOpen}
        onClose={() => setIsInputMasukOpen(false)}
        onSave={handleSaveSuratMasuk}
        editingItem={editingSuratMasuk}
        onToast={onToast}
      />

      {/* 3. Disposisi Form Modal */}
      <DisposisiFormModal
        isOpen={isDisposisiOpen}
        onClose={() => {
          setIsDisposisiOpen(false);
          setDisposisiTargetSurat(null);
          setEditingDisposisi(null);
        }}
        onSave={handleSaveDisposisi}
        editingItem={editingDisposisi}
        selectedSuratMasuk={disposisiTargetSurat}
        suratMasukList={suratMasuk}
        onToast={onToast}
      />

      {/* 4. Penomoran Settings Modal */}
      <PenomoranSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={numberingConfig}
        onSave={(newCfg) => setNumberingConfig(newCfg)}
        onToast={onToast}
      />

      {/* 5. Detail Modal */}
      <SuratDetailModal
        isOpen={!!detailSuratMasuk || !!detailSuratKeluar}
        onClose={() => {
          setDetailSuratMasuk(null);
          setDetailSuratKeluar(null);
        }}
        suratMasuk={detailSuratMasuk}
        suratKeluar={detailSuratKeluar}
        onPrintPreview={(sk) => setPrintSuratKeluar(sk)}
        onCreateDisposisi={(sm) => {
          setDisposisiTargetSurat(sm);
          setEditingDisposisi(null);
          setIsDisposisiOpen(true);
        }}
        onToast={onToast}
      />

      {/* 6. Cetak & PDF Modal */}
      <CetakSuratModal
        isOpen={!!printSuratKeluar || !!printLembarDisposisi}
        onClose={() => {
          setPrintSuratKeluar(null);
          setPrintLembarDisposisi(null);
        }}
        suratKeluar={printSuratKeluar}
        lembarDisposisi={printLembarDisposisi}
        onToast={onToast}
      />
    </div>
  );
};
