import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Tag,
  DollarSign,
  User,
  Image as ImageIcon,
  Check,
  X,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Cloud,
  CloudOff,
  Printer,
  Download,
  FileDown,
  Loader2,
  Layers,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  ShieldAlert,
  Info,
  ChevronDown,
} from 'lucide-react';
import {
  AssetItem,
  KategoriAsset,
  LokasiAsset,
  KondisiAsset,
  KATEGORI_LIST,
  LOKASI_LIST,
  KONDISI_LIST,
  INITIAL_ASSETS,
} from '../../data/assetData';
import {
  saveAssetToFirestore,
  deleteAssetFromFirestore,
  subscribeAssetsFromFirestore,
  pushLocalDataToCloud,
} from '../../services/firestoreSyncService';
import { compressImage } from '../../utils/imageOptimizer';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { OfficialKopSurat } from './surat/OfficialKopSurat';
import { OfficialSignatureBlock } from './surat/OfficialSignatureBlock';
import { downloadElementAsPdf, printElementDirectly } from '../../utils/pdfExport';

interface InventarisAssetViewProps {
  onToast: (msg: string) => void;
  onBackToHome?: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const InventarisAssetView: React.FC<InventarisAssetViewProps> = ({
  onToast,
  onBackToHome,
  onNavigateToTab,
}) => {
  // ---------------------------------------------------------------------------
  // STATE: Assets & Firebase Sync
  // ---------------------------------------------------------------------------
  const [assets, setAssets] = useState<AssetItem[]>(() => {
    try {
      const saved = localStorage.getItem('kt_assets_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ASSETS;
  });

  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Baru saja');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [filterKondisi, setFilterKondisi] = useState<string>('Semua');
  const [filterLokasi, setFilterLokasi] = useState<string>('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [detailAsset, setDetailAsset] = useState<AssetItem | null>(null);
  const [quickUpdateAsset, setQuickUpdateAsset] = useState<AssetItem | null>(null);

  const printAssetSheetRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formNama, setFormNama] = useState('');
  const [formKode, setFormKode] = useState('');
  const [formKategori, setFormKategori] = useState<KategoriAsset>('Peralatan Kegiatan');
  const [formMerk, setFormMerk] = useState('');
  const [formNomorSeri, setFormNomorSeri] = useState('');
  const [formTahun, setFormTahun] = useState<number>(new Date().getFullYear());
  const [formTanggal, setFormTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formSumberDana, setFormSumberDana] = useState('Kas Organisasi');
  const [formHarga, setFormHarga] = useState<number>(0);
  const [formKondisi, setFormKondisi] = useState<KondisiAsset>('Baik / Aktif');
  const [formLokasi, setFormLokasi] = useState<LokasiAsset>('Sekretariat');
  const [formLokasiKustom, setFormLokasiKustom] = useState('');
  const [formPIC, setFormPIC] = useState('Iik Andriyana');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formJumlah, setFormJumlah] = useState<number>(1);
  const [formSatuan, setFormSatuan] = useState<string>('Unit');
  const [formFoto, setFormFoto] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // FIREBASE REAL-TIME SUBSCRIPTION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to Firestore /organizations/manisjaya/assets
    const unsub = subscribeAssetsFromFirestore((remoteAssets) => {
      if (remoteAssets && remoteAssets.length > 0) {
        setAssets((prev) => {
          // Merge remote with local to prevent clobbering unsaved edits
          const idMap = new Map<string, AssetItem>();
          prev.forEach((item) => idMap.set(item.id, item));
          remoteAssets.forEach((item) => idMap.set(item.id, { ...idMap.get(item.id), ...item }));
          const merged = Array.from(idMap.values());
          try {
            localStorage.setItem('kt_assets_v1', JSON.stringify(merged));
          } catch {}
          return merged;
        });
        setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
    };
  }, []);

  // Save to local storage whenever assets change
  useEffect(() => {
    try {
      localStorage.setItem('kt_assets_v1', JSON.stringify(assets));
    } catch {}
  }, [assets]);

  // ---------------------------------------------------------------------------
  // GENERATE KODE ASSET OTOMATIS
  // ---------------------------------------------------------------------------
  const generateNewKode = () => {
    const count = assets.length + 1;
    const year = new Date().getFullYear();
    const pad = String(count).padStart(3, '0');
    return `AST-MJ-${year}-${pad}`;
  };

  const handleOpenAddModal = () => {
    setEditingAsset(null);
    setFormNama('');
    setFormKode(generateNewKode());
    setFormKategori('Peralatan Kegiatan');
    setFormMerk('');
    setFormNomorSeri('-');
    setFormTahun(new Date().getFullYear());
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormSumberDana('Kas Organisasi');
    setFormHarga(0);
    setFormKondisi('Baik / Aktif');
    setFormLokasi('Sekretariat');
    setFormLokasiKustom('');
    setFormPIC('Iik Andriyana');
    setFormKeterangan('');
    setFormJumlah(1);
    setFormSatuan('Unit');
    setFormFoto('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: AssetItem) => {
    setEditingAsset(item);
    setFormNama(item.namaAsset);
    setFormKode(item.kodeAsset);
    setFormKategori(item.kategori);
    setFormMerk(item.merkType || '');
    setFormNomorSeri(item.nomorSeri || '-');
    setFormTahun(item.tahunPerolehan || new Date().getFullYear());
    setFormTanggal(item.tanggalPerolehan || new Date().toISOString().split('T')[0]);
    setFormSumberDana(item.sumberDana || 'Kas Organisasi');
    setFormHarga(item.hargaPerolehan || 0);
    setFormKondisi(item.kondisi);
    if (LOKASI_LIST.includes(item.lokasi as any)) {
      setFormLokasi(item.lokasi);
      setFormLokasiKustom('');
    } else {
      setFormLokasi('Lokasi lainnya');
      setFormLokasiKustom(item.lokasi);
    }
    setFormPIC(item.penanggungJawab || 'Pengurus');
    setFormKeterangan(item.keterangan || '');
    setFormJumlah(item.jumlah || 1);
    setFormSatuan(item.satuan || 'Unit');
    setFormFoto(item.fotoAsset || '');
    setShowAddModal(true);
  };

  // Upload Foto Aset
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      onToast('Mengoptimalkan foto aset...');
      const compressed = await compressImage(file, 900, 0.75);
      if (compressed) {
        setFormFoto(compressed);
        onToast('Foto aset berhasil diunggah!');
      }
    } catch {
      onToast('Gagal memproses foto aset');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // ---------------------------------------------------------------------------
  // SIMPAN ASET KE STATE & FIREBASE
  // ---------------------------------------------------------------------------
  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      onToast('Nama aset wajib diisi!');
      return;
    }

    const finalLokasi =
      formLokasi === 'Lokasi lainnya' && formLokasiKustom.trim()
        ? (formLokasiKustom.trim() as LokasiAsset)
        : formLokasi;

    const finalItem: AssetItem = {
      id: editingAsset ? editingAsset.id : `asset-${Date.now()}`,
      kodeAsset: formKode.trim() || generateNewKode(),
      namaAsset: formNama.trim(),
      kategori: formKategori,
      merkType: formMerk.trim() || '-',
      nomorSeri: formNomorSeri.trim() || '-',
      tahunPerolehan: Number(formTahun) || new Date().getFullYear(),
      tanggalPerolehan: formTanggal,
      sumberDana: formSumberDana.trim() || 'Kas Organisasi',
      hargaPerolehan: Number(formHarga) || 0,
      kondisi: formKondisi,
      lokasi: finalLokasi,
      penanggungJawab: formPIC.trim() || 'Pengurus',
      fotoAsset: formFoto || undefined,
      keterangan: formKeterangan.trim(),
      jumlah: Number(formJumlah) || 1,
      satuan: formSatuan.trim() || 'Unit',
    };

    // Update local state first
    let updatedList: AssetItem[];
    if (editingAsset) {
      updatedList = assets.map((a) => (a.id === editingAsset.id ? finalItem : a));
      onToast(`Aset "${finalItem.namaAsset}" berhasil diperbarui!`);
    } else {
      updatedList = [finalItem, ...assets];
      onToast(`Aset baru "${finalItem.namaAsset}" berhasil dicatat!`);
    }

    setAssets(updatedList);
    setShowAddModal(false);

    // Sync to Cloud Firebase in background
    try {
      await saveAssetToFirestore(finalItem);
      await pushLocalDataToCloud(`Pencatatan aset: ${finalItem.namaAsset}`);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
    } catch (err) {
      console.warn('Firebase sync delayed/offline:', err);
    }
  };

  // ---------------------------------------------------------------------------
  // HAPUS ASET
  // ---------------------------------------------------------------------------
  const handleDeleteAsset = async (item: AssetItem) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus data aset "${item.namaAsset}" (${item.kodeAsset}) dari inventaris organisasi?`
    );
    if (!confirmDelete) return;

    const remaining = assets.filter((a) => a.id !== item.id);
    setAssets(remaining);
    onToast(`Aset "${item.namaAsset}" telah dihapus.`);

    if (detailAsset?.id === item.id) setDetailAsset(null);

    // Delete from Firebase
    try {
      await deleteAssetFromFirestore(item.id);
      await pushLocalDataToCloud(`Hapus aset: ${item.namaAsset}`);
    } catch (err) {
      console.warn('Firebase delete delayed/offline:', err);
    }
  };

  // ---------------------------------------------------------------------------
  // QUICK UPDATE KONDISI & LOKASI
  // ---------------------------------------------------------------------------
  const handleQuickUpdateKondisi = async (item: AssetItem, newKondisi: KondisiAsset) => {
    const updated = { ...item, kondisi: newKondisi };
    const list = assets.map((a) => (a.id === item.id ? updated : a));
    setAssets(list);
    onToast(`Kondisi "${item.namaAsset}" diubah menjadi: ${newKondisi}`);

    try {
      await saveAssetToFirestore(updated);
      await pushLocalDataToCloud(`Update kondisi ${item.namaAsset}: ${newKondisi}`);
    } catch {}
  };

  const handleQuickUpdateLokasi = async (item: AssetItem, newLokasi: LokasiAsset) => {
    const updated = { ...item, lokasi: newLokasi };
    const list = assets.map((a) => (a.id === item.id ? updated : a));
    setAssets(list);
    onToast(`Lokasi "${item.namaAsset}" dipindahkan ke: ${newLokasi}`);

    try {
      await saveAssetToFirestore(updated);
      await pushLocalDataToCloud(`Update lokasi ${item.namaAsset}: ${newLokasi}`);
    } catch {}
  };

  // ---------------------------------------------------------------------------
  // MANUAL SYNC FIREBASE
  // ---------------------------------------------------------------------------
  const handleManualSync = async () => {
    try {
      setIsFirebaseSyncing(true);
      onToast('Menyinkronkan data inventaris aset ke Cloud Firebase...');

      // Push all local assets
      for (const item of assets.slice(0, 50)) {
        await saveAssetToFirestore(item);
      }
      await pushLocalDataToCloud('Sinkronisasi manual seluruh aset inventaris');

      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
      onToast('Seluruh inventaris aset berhasil tersinkron ke Firebase!');
    } catch (err) {
      onToast('Sinkronisasi tersimpan di cache offline IndexedDB.');
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // EKSPOR CSV
  // ---------------------------------------------------------------------------
  const handleExportCSV = () => {
    const headers = [
      'Kode Aset',
      'Nama Aset',
      'Kategori',
      'Merk/Tipe',
      'Jumlah',
      'Satuan',
      'Kondisi',
      'Lokasi Penyimpanan',
      'Penanggung Jawab',
      'Tahun Perolehan',
      'Sumber Dana',
      'Harga Perolehan (Rp)',
      'Keterangan',
    ];

    const rows = assets.map((a) => [
      `"${a.kodeAsset}"`,
      `"${a.namaAsset}"`,
      `"${a.kategori}"`,
      `"${a.merkType || '-'}"`,
      a.jumlah || 1,
      `"${a.satuan || 'Unit'}"`,
      `"${a.kondisi}"`,
      `"${a.lokasi}"`,
      `"${a.penanggungJawab}"`,
      a.tahunPerolehan,
      `"${a.sumberDana}"`,
      a.hargaPerolehan,
      `"${(a.keterangan || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventaris_Aset_Manis_Jaya_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Berkas CSV inventaris aset berhasil diunduh!');
  };

  // Cetak Dokumen Rekapitulasi Inventaris Aset A4 Resmi
  const handlePrintPdf = () => {
    if (printAssetSheetRef.current) {
      printElementDirectly(printAssetSheetRef.current);
      onToast('Membuka dialog cetak dokumen inventaris aset resmi...');
    } else {
      setShowPrintModal(true);
    }
  };

  // Unduh Berkas PDF Rekapitulasi Inventaris Aset Asli
  const handleDownloadPdf = async () => {
    if (!printAssetSheetRef.current) {
      setShowPrintModal(true);
      return;
    }
    try {
      setIsExportingPdf(true);
      onToast('Menyusun berkas PDF Rekapitulasi Inventaris Aset...');
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Inventaris_Aset_Karang_Taruna_Manis_Jaya_${dateStr}.pdf`;
      const ok = await downloadElementAsPdf(printAssetSheetRef.current, filename, (status) => {
        setExportStatus(status);
      });
      setIsExportingPdf(false);
      setExportStatus('');
      if (ok) {
        onToast(`Berkas PDF "${filename}" berhasil diunduh!`);
      } else {
        onToast('Gagal menyusun PDF. Silakan gunakan tombol Cetak PDF.');
      }
    } catch {
      setIsExportingPdf(false);
      setExportStatus('');
      onToast('Gagal memproses berkas PDF.');
    }
  };

  // ---------------------------------------------------------------------------
  // FILTERING & STATISTIK
  // ---------------------------------------------------------------------------
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        item.namaAsset.toLowerCase().includes(q) ||
        item.kodeAsset.toLowerCase().includes(q) ||
        item.lokasi.toLowerCase().includes(q) ||
        item.penanggungJawab.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        (item.merkType && item.merkType.toLowerCase().includes(q));

      const matchKategori = filterKategori === 'Semua' || item.kategori === filterKategori;
      const matchKondisi = filterKondisi === 'Semua' || item.kondisi === filterKondisi;
      const matchLokasi = filterLokasi === 'Semua' || item.lokasi === filterLokasi;

      return matchSearch && matchKategori && matchKondisi && matchLokasi;
    });
  }, [assets, searchQuery, filterKategori, filterKondisi, filterLokasi]);

  // Statistik Ringkasan
  const stats = useMemo(() => {
    const totalUnit = assets.reduce((sum, a) => sum + (a.jumlah || 1), 0);
    const totalNilai = assets.reduce((sum, a) => sum + (a.hargaPerolehan || 0), 0);
    const baikCount = assets.filter((a) => a.kondisi === 'Baik / Aktif').length;
    const rusakCount = assets.filter((a) => a.kondisi === 'Rusak Ringan' || a.kondisi === 'Rusak Berat').length;
    const dipinjamCount = assets.filter((a) => a.kondisi === 'Sedang Dipinjam').length;
    const rawatCount = assets.filter((a) => a.kondisi === 'Perlu Pemeliharaan').length;

    return {
      totalItem: assets.length,
      totalUnit,
      totalNilai,
      baikCount,
      rusakCount,
      dipinjamCount,
      rawatCount,
    };
  }, [assets]);

  // Helper Badge Warna Kondisi
  const getKondisiBadge = (kondisi: KondisiAsset) => {
    switch (kondisi) {
      case 'Baik / Aktif':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rusak Ringan':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rusak Berat':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Sedang Dipinjam':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Perlu Pemeliharaan':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Hilang':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* 1. HEADER BANNER & STATUS INTEGRASI FIREBASE                          */}
      {/* ===================================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-800/40">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold backdrop-blur-sm">
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>Sistem Inventaris Aset Karang Taruna Kelurahan Manis Jaya</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pencatatan & Inventarisasi Aset
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Pantau kondisi barang, lokasi penyimpanan fisik, peminjaman, serta status sinkronisasi
              database secara real-time terhubung ke Google Firebase Firestore.
            </p>
          </div>

          {/* Right Action: Cloud Sync Badge & Tambah Aset Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Status Cloud Firebase Pill */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white">
              {isOnline ? (
                <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <CloudOff className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <div className="flex flex-col text-left">
                <span className="font-bold flex items-center gap-1.5 leading-tight">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isOnline ? 'Firebase Terhubung' : 'Mode Offline (IndexedDB)'}
                </span>
                <span className="text-[10px] text-blue-200/80">Sinkron: {lastSyncTime}</span>
              </div>
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isFirebaseSyncing}
                className="ml-1 p-1 rounded-lg hover:bg-white/10 text-blue-200 hover:text-white transition-colors cursor-pointer"
                title="Sinkronkan data aset ke Firebase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFirebaseSyncing ? 'animate-spin text-amber-300' : ''}`} />
              </button>
            </div>

            {/* Tombol Catat Aset Baru */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Aset Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. STATISTIK KARTU RINGKASAN                                          */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Item */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Aset</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {stats.totalItem}{' '}
              <span className="text-xs font-normal text-slate-500">item ({stats.totalUnit} unit)</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Kondisi Baik */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Kondisi Baik / Aktif</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              {stats.baikCount}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({stats.totalItem > 0 ? Math.round((stats.baikCount / stats.totalItem) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Perlu Servis / Rusak */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Rusak / Perlu Servis</span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
              {stats.rusakCount + stats.rawatCount}{' '}
              <span className="text-xs font-normal text-slate-500">item</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Nilai Aset */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Estimasi Nilai Total</span>
            <div className="text-lg sm:text-xl font-black text-indigo-700 mt-1 truncate">
              Rp {stats.totalNilai.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. TOOLBAR PENCARIAN, FILTER KONDISI & LOKASI                         */}
      {/* ===================================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aset (nama, kode, lokasi, penanggung jawab)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons: Export & View Switch */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Unduh data dalam format CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cetak lembar inventaris"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <div className="border-l border-slate-200 h-6 mx-1" />

            {/* Toggle View Mode */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Grid Card"
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel Rinci"
              >
                Tabel
              </button>
            </div>
          </div>
        </div>

        {/* Row Filters: Kategori, Kondisi, Lokasi */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Filter Kategori */}
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="Semua">Semua Kategori</option>
            {KATEGORI_LIST.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          {/* Filter Kondisi */}
          <select
            value={filterKondisi}
            onChange={(e) => setFilterKondisi(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="Semua">Semua Kondisi</option>
            {KONDISI_LIST.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          {/* Filter Lokasi */}
          <select
            value={filterLokasi}
            onChange={(e) => setFilterLokasi(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="Semua">Semua Lokasi</option>
            {LOKASI_LIST.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {(filterKategori !== 'Semua' || filterKondisi !== 'Semua' || filterLokasi !== 'Semua' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFilterKategori('Semua');
                setFilterKondisi('Semua');
                setFilterLokasi('Semua');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. DAFTAR ASET (GRID ATAU TABEL)                                      */}
      {/* ===================================================================== */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Tidak ada aset ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada data yang cocok dengan kriteria pencarian atau filter yang Anda pilih.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Catat Aset Baru Sekarang
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              {/* Image & Badges Banner */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {item.fotoAsset ? (
                  <img
                    src={resolveAssetUrl(item.fotoAsset)}
                    alt={item.namaAsset}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-gradient-to-br from-slate-100 to-slate-200">
                    <Package className="w-12 h-12" />
                    <span className="text-[11px] font-semibold text-slate-400 mt-1">Dokumentasi Aset</span>
                  </div>
                )}

                {/* Badges on Top */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[85%]">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold font-mono">
                    {item.kodeAsset}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-blue-700 text-[10px] font-bold border border-blue-200/60 shadow-2xs">
                    {item.kategori}
                  </span>
                </div>

                {/* Kondisi Badge on Top Right */}
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-2xs ${getKondisiBadge(
                      item.kondisi
                    )}`}
                  >
                    {item.kondisi}
                  </span>
                </div>

                {/* Jumlah & Satuan Pill Bottom Right */}
                <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                  {item.jumlah || 1} {item.satuan || 'Unit'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3
                    onClick={() => setDetailAsset(item)}
                    className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
                    title={item.namaAsset}
                  >
                    {item.namaAsset}
                  </h3>
                  {item.merkType && item.merkType !== '-' && (
                    <p className="text-xs text-slate-500 truncate">
                      Merk / Tipe: <span className="text-slate-700 font-medium">{item.merkType}</span>
                    </p>
                  )}
                  {item.keterangan && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {item.keterangan}
                    </p>
                  )}
                </div>

                {/* Lokasi & PIC Meta */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-slate-500 truncate">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-800">{item.lokasi}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Tahun {item.tahunPerolehan}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-slate-500 truncate text-[11px]">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>PIC: {item.penanggungJawab}</span>
                    </span>
                    {item.hargaPerolehan > 0 && (
                      <span className="text-[11px] font-bold text-emerald-700">
                        Rp {item.hargaPerolehan.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  {/* Quick Change Kondisi Dropdown */}
                  <div className="relative group/kondisi">
                    <button
                      type="button"
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Ubah kondisi barang secara cepat"
                    >
                      <span>Ubah Kondisi</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute left-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 hidden group-hover/kondisi:block z-30 animate-fadeIn">
                      <span className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Pilih Kondisi:
                      </span>
                      {KONDISI_LIST.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleQuickUpdateKondisi(item, k)}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between ${
                            item.kondisi === k ? 'font-bold text-blue-600' : 'text-slate-700'
                          }`}
                        >
                          <span>{k}</span>
                          {item.kondisi === k && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions: View, Edit, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDetailAsset(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Lihat detail aset"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      title="Edit data aset"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus aset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kode & Aset</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Jumlah</th>
                  <th className="py-3 px-4">Kondisi Barang</th>
                  <th className="py-3 px-4">Lokasi Penyimpanan</th>
                  <th className="py-3 px-4">Penanggung Jawab</th>
                  <th className="py-3 px-4 text-right">Nilai (Rp)</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Kode & Aset */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                          {item.fotoAsset ? (
                            <img
                              src={resolveAssetUrl(item.fotoAsset)}
                              alt={item.namaAsset}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <span
                            onClick={() => setDetailAsset(item)}
                            className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer block"
                          >
                            {item.namaAsset}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{item.kodeAsset}</span>
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-4 text-slate-600 font-medium">{item.kategori}</td>

                    {/* Jumlah */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.jumlah || 1} {item.satuan || 'Unit'}
                    </td>

                    {/* Kondisi */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getKondisiBadge(
                          item.kondisi
                        )}`}
                      >
                        {item.kondisi}
                      </span>
                    </td>

                    {/* Lokasi */}
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{item.lokasi}</span>
                      </span>
                    </td>

                    {/* PIC */}
                    <td className="py-3 px-4 text-slate-600">{item.penanggungJawab}</td>

                    {/* Nilai */}
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {item.hargaPerolehan > 0 ? `Rp ${item.hargaPerolehan.toLocaleString('id-ID')}` : '-'}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailAsset(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. MODAL FORM: CATAT / EDIT ASET BARU                                 */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn my-8">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingAsset ? 'Edit Data Aset Organisasi' : 'Catat Barang Aset Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tersinkronisasi otomatis dengan Cloud Firestore Karang Taruna
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveAsset} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Kode Aset & Nama Barang */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kode Aset <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formKode}
                    onChange={(e) => setFormKode(e.target.value)}
                    placeholder="AST-MJ-2026-001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Barang Aset <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: Tenda Pleton Serbaguna 6x12m"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Kategori & Jumlah / Satuan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as KategoriAsset)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  >
                    {KATEGORI_LIST.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    value={formJumlah}
                    onChange={(e) => setFormJumlah(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    value={formSatuan}
                    onChange={(e) => setFormSatuan(e.target.value)}
                    placeholder="Unit, Pcs, Set, Buah"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 3: Kondisi Barang & Lokasi Penyimpanan (INTI PERMINTAAN USER) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div>
                  <label className="text-xs font-bold text-blue-900 block mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Kondisi Barang</span> <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formKondisi}
                    onChange={(e) => setFormKondisi(e.target.value as KondisiAsset)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {KONDISI_LIST.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-blue-900 block mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Lokasi Penyimpanan</span> <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value as LokasiAsset)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {LOKASI_LIST.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                {formLokasi === 'Lokasi lainnya' && (
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-blue-800 block mb-1">
                      Ketik Nama Lokasi Penyimpanan Khusus:
                    </label>
                    <input
                      type="text"
                      required
                      value={formLokasiKustom}
                      onChange={(e) => setFormLokasiKustom(e.target.value)}
                      placeholder="Contoh: Pos Pemuda RW 03, Rumah Ketua RW 02"
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                )}
              </div>

              {/* Row 4: Merk/Tipe, Nomor Seri, Penanggung Jawab */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Merk / Tipe</label>
                  <input
                    type="text"
                    value={formMerk}
                    onChange={(e) => setFormMerk(e.target.value)}
                    placeholder="Contoh: Yamaha, Baretone, Asus"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Seri / Barcode</label>
                  <input
                    type="text"
                    value={formNomorSeri}
                    onChange={(e) => setFormNomorSeri(e.target.value)}
                    placeholder="S/N: 2026-XYZ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    value={formPIC}
                    onChange={(e) => setFormPIC(e.target.value)}
                    placeholder="Nama Pengurus PIC"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 5: Harga Perolehan, Sumber Dana, Tanggal Perolehan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Harga / Nilai (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formHarga}
                    onChange={(e) => setFormHarga(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-emerald-700 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Sumber Dana</label>
                  <select
                    value={formSumberDana}
                    onChange={(e) => setFormSumberDana(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="Kas Organisasi">Kas Organisasi</option>
                    <option value="Bantuan Kelurahan">Bantuan Kelurahan</option>
                    <option value="Hibah / Swadaya Warga">Hibah / Swadaya Warga</option>
                    <option value="Sponsor / Donatur">Sponsor / Donatur</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Perolehan</label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => {
                      setFormTanggal(e.target.value);
                      if (e.target.value) {
                        setFormTahun(new Date(e.target.value).getFullYear());
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 6: Upload Foto Dokumentasi Aset */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Foto Dokumentasi Barang</label>
                <div className="flex items-center gap-3">
                  {formFoto ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                      <img
                        src={resolveAssetUrl(formFoto)}
                        alt="Pratinjau Aset"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormFoto('')}
                        className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[9px] mt-0.5">Belum ada</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                      <span>{isUploadingPhoto ? 'Mengunggah...' : 'Pilih Foto dari Galeri / Kamera'}</span>
                    </button>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Format JPG/PNG. Otomatis dikompresi agar hemat kuota dan cepat tersinkron ke Firebase.
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 7: Keterangan & Catatan Tambahan */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Keterangan & Catatan Kondisi
                </label>
                <textarea
                  rows={3}
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="Catatan penyimpanan, kelengkapan aksesoris, kabel, instruksi pemakaian..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAsset ? 'Simpan Perubahan' : 'Catat Aset Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. MODAL DETAIL ASET LENGKAP                                          */}
      {/* ===================================================================== */}
      {detailAsset && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn my-8">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md">
                  {detailAsset.kodeAsset}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getKondisiBadge(detailAsset.kondisi)}`}>
                  {detailAsset.kondisi}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDetailAsset(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Foto Besar jika ada */}
              {detailAsset.fotoAsset && (
                <div className="w-full h-56 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={resolveAssetUrl(detailAsset.fotoAsset)}
                    alt={detailAsset.namaAsset}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  {detailAsset.kategori}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">{detailAsset.namaAsset}</h2>
                {detailAsset.merkType && detailAsset.merkType !== '-' && (
                  <p className="text-xs text-slate-500 mt-1">
                    Merk / Model: <span className="text-slate-800 font-semibold">{detailAsset.merkType}</span>
                  </p>
                )}
              </div>

              {/* Data Grid Spesifikasi */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Kondisi Barang:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    {detailAsset.kondisi}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Lokasi Penyimpanan:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {detailAsset.lokasi}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Kuantitas:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {detailAsset.jumlah || 1} {detailAsset.satuan || 'Unit'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Penanggung Jawab:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{detailAsset.penanggungJawab}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Tahun Perolehan:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{detailAsset.tahunPerolehan}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimasi Nilai:</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">
                    {detailAsset.hargaPerolehan > 0 ? `Rp ${detailAsset.hargaPerolehan.toLocaleString('id-ID')}` : '-'}
                  </span>
                </div>
              </div>

              {/* Keterangan */}
              {detailAsset.keterangan && (
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-blue-800">
                    Catatan Inventaris:
                  </span>
                  <p className="leading-relaxed">{detailAsset.keterangan}</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteAsset(detailAsset)}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Aset</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditModal(detailAsset);
                    setDetailAsset(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
