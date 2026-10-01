import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  BarChart3,
  FileSpreadsheet,
  Printer,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Wrench,
  ShoppingCart,
  FileCheck,
  FileText,
  DollarSign,
  MapPin,
  Users,
  Image as ImageIcon,
  Check,
  X,
  Layers,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Tag,
  AlertCircle,
  Cloud,
} from 'lucide-react';
import {
  AssetItem,
  KategoriAsset,
  LokasiAsset,
  KondisiAsset,
  PeminjamanAsset,
  MutasiPemeliharaanAsset,
  PengadaanAsset,
  PenghapusanAsset,
  StockOpnameItem,
  DokumenAsset,
  KATEGORI_LIST,
  LOKASI_LIST,
  KONDISI_LIST,
  INITIAL_ASSETS,
  INITIAL_PEMINJAMAN,
  INITIAL_MUTASI_SERVIS,
  INITIAL_PENGADAAN,
  INITIAL_PENGHAPUSAN,
  INITIAL_STOCK_OPNAME,
  INITIAL_DOKUMEN_ASSET,
} from '../../data/assetData';

interface AsetOrganisasiViewProps {
  onToast: (msg: string) => void;
  onBackToHome?: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const AsetOrganisasiView: React.FC<AsetOrganisasiViewProps> = ({ onToast, onNavigateToTab }) => {
  // Navigation tabs
  type ActiveTab =
    | 'dashboard'
    | 'data_aset'
    | 'peminjaman'
    | 'mutasi_servis'
    | 'pengadaan'
    | 'penghapusan'
    | 'stock_opname'
    | 'dokumen'
    | 'laporan';

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Persistence State
  const [assets, setAssets] = useState<AssetItem[]>(() => {
    try {
      const saved = localStorage.getItem('kt_assets_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_ASSETS;
  });

  const [peminjamanList, setPeminjamanList] = useState<PeminjamanAsset[]>(() => {
    try {
      const saved = localStorage.getItem('kt_asset_peminjaman_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PEMINJAMAN;
  });

  const [mutasiServisList, setMutasiServisList] = useState<MutasiPemeliharaanAsset[]>(() => {
    try {
      const saved = localStorage.getItem('kt_asset_mutasi_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_MUTASI_SERVIS;
  });

  const [pengadaanList, setPengadaanList] = useState<PengadaanAsset[]>(() => {
    try {
      const saved = localStorage.getItem('kt_asset_pengadaan_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PENGADAAN;
  });

  const [penghapusanList, setPenghapusanList] = useState<PenghapusanAsset[]>(() => {
    try {
      const saved = localStorage.getItem('kt_asset_penghapusan_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PENGHAPUSAN;
  });

  const [stockOpnameList, setStockOpnameList] = useState<StockOpnameItem[]>(() => {
    try {
      const saved = localStorage.getItem('kt_asset_stock_opname_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_STOCK_OPNAME;
  });

  const [dokumenList, setDokumenList] = useState<DokumenAsset[]>(() => {
    try {
      const saved = localStorage.getItem('kt_asset_dokumen_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_DOKUMEN_ASSET;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('kt_assets_v1', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('kt_asset_peminjaman_v1', JSON.stringify(peminjamanList));
  }, [peminjamanList]);

  useEffect(() => {
    localStorage.setItem('kt_asset_mutasi_v1', JSON.stringify(mutasiServisList));
  }, [mutasiServisList]);

  useEffect(() => {
    localStorage.setItem('kt_asset_pengadaan_v1', JSON.stringify(pengadaanList));
  }, [pengadaanList]);

  useEffect(() => {
    localStorage.setItem('kt_asset_penghapusan_v1', JSON.stringify(penghapusanList));
  }, [penghapusanList]);

  useEffect(() => {
    localStorage.setItem('kt_asset_stock_opname_v1', JSON.stringify(stockOpnameList));
  }, [stockOpnameList]);

  useEffect(() => {
    localStorage.setItem('kt_asset_dokumen_v1', JSON.stringify(dokumenList));
  }, [dokumenList]);

  // Listen to remote real-time Cloud updates and reload data immediately
  useEffect(() => {
    const handleRemoteRefresh = () => {
      try {
        const savedAssets = localStorage.getItem('kt_assets_v1');
        if (savedAssets) setAssets(JSON.parse(savedAssets));
        const savedPeminjaman = localStorage.getItem('kt_asset_peminjaman_v1');
        if (savedPeminjaman) setPeminjamanList(JSON.parse(savedPeminjaman));
        const savedMutasi = localStorage.getItem('kt_asset_mutasi_v1');
        if (savedMutasi) setMutasiServisList(JSON.parse(savedMutasi));
        const savedPengadaan = localStorage.getItem('kt_asset_pengadaan_v1');
        if (savedPengadaan) setPengadaanList(JSON.parse(savedPengadaan));
        const savedPenghapusan = localStorage.getItem('kt_asset_penghapusan_v1');
        if (savedPenghapusan) setPenghapusanList(JSON.parse(savedPenghapusan));
        const savedStock = localStorage.getItem('kt_asset_stock_opname_v1');
        if (savedStock) setStockOpnameList(JSON.parse(savedStock));
        const savedDok = localStorage.getItem('kt_asset_dokumen_v1');
        if (savedDok) setDokumenList(JSON.parse(savedDok));
      } catch (e) {}
    };

    window.addEventListener('kt_database_restored', handleRemoteRefresh);
    return () => {
      window.removeEventListener('kt_database_restored', handleRemoteRefresh);
    };
  }, []);

  // Filters for Data Asset tab
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('semua');
  const [filterLokasi, setFilterLokasi] = useState<string>('semua');
  const [filterKondisi, setFilterKondisi] = useState<string>('semua');

  // Modals state
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<AssetItem | null>(null);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<AssetItem | null>(null);
  const [showAddPeminjamanModal, setShowAddPeminjamanModal] = useState(false);
  const [showAddMutasiModal, setShowAddMutasiModal] = useState(false);
  const [showAddPengadaanModal, setShowAddPengadaanModal] = useState(false);
  const [showAddPenghapusanModal, setShowAddPenghapusanModal] = useState(false);

  // Form State for Asset
  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formKategori, setFormKategori] = useState<KategoriAsset>(KATEGORI_LIST[0]);
  const [formMerk, setFormMerk] = useState('');
  const [formSeri, setFormSeri] = useState('');
  const [formTahun, setFormTahun] = useState(new Date().getFullYear());
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formSumberDana, setFormSumberDana] = useState('Dana Bantuan Kelurahan / APBDes');
  const [formHarga, setFormHarga] = useState<number>(0);
  const [formKondisi, setFormKondisi] = useState<KondisiAsset>('Baik / Aktif');
  const [formLokasi, setFormLokasi] = useState<LokasiAsset>(LOKASI_LIST[0]);
  const [formPJ, setFormPJ] = useState('');
  const [formFoto, setFormFoto] = useState('');
  const [formKet, setFormKet] = useState('');

  // Currency Formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // KPIs
  const totalAsetCount = assets.length;
  const asetAktifCount = assets.filter((a) => a.kondisi === 'Baik / Aktif').length;
  const asetRusakCount = assets.filter(
    (a) => a.kondisi === 'Rusak Ringan' || a.kondisi === 'Rusak Berat'
  ).length;
  const asetDipinjamCount = assets.filter((a) => a.kondisi === 'Sedang Dipinjam').length;
  const asetHilangCount = assets.filter((a) => a.kondisi === 'Hilang').length;
  const asetPerluPemeliharaanCount = assets.filter(
    (a) => a.kondisi === 'Perlu Pemeliharaan'
  ).length;
  const nilaiTotalAset = assets.reduce((sum, a) => sum + (a.hargaPerolehan || 0), 0);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = a.namaAsset.toLowerCase().includes(q);
        const matchKode = a.kodeAsset.toLowerCase().includes(q);
        const matchMerk = a.merkType.toLowerCase().includes(q);
        const matchPJ = a.penanggungJawab.toLowerCase().includes(q);
        if (!matchName && !matchKode && !matchMerk && !matchPJ) return false;
      }
      if (filterKategori !== 'semua' && a.kategori !== filterKategori) return false;
      if (filterLokasi !== 'semua' && a.lokasi !== filterLokasi) return false;
      if (filterKondisi !== 'semua' && a.kondisi !== filterKondisi) return false;
      return true;
    });
  }, [assets, searchQuery, filterKategori, filterLokasi, filterKondisi]);

  // Open Edit Asset Modal
  const handleOpenEdit = (asset: AssetItem) => {
    setSelectedAssetForEdit(asset);
    setFormKode(asset.kodeAsset);
    setFormNama(asset.namaAsset);
    setFormKategori(asset.kategori);
    setFormMerk(asset.merkType);
    setFormSeri(asset.nomorSeri);
    setFormTahun(asset.tahunPerolehan);
    setFormTanggal(asset.tanggalPerolehan);
    setFormSumberDana(asset.sumberDana);
    setFormHarga(asset.hargaPerolehan);
    setFormKondisi(asset.kondisi);
    setFormLokasi(asset.lokasi);
    setFormPJ(asset.penanggungJawab);
    setFormFoto(asset.fotoAsset || '');
    setFormKet(asset.keterangan);
    setShowAddAssetModal(true);
  };

  // Open Add Asset Modal
  const handleOpenAdd = () => {
    setSelectedAssetForEdit(null);
    setFormKode(`AST-${Date.now().toString().slice(-4)}`);
    setFormNama('');
    setFormKategori(KATEGORI_LIST[0]);
    setFormMerk('');
    setFormSeri('');
    setFormTahun(new Date().getFullYear());
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormSumberDana('Dana Bantuan Kelurahan / APBDes');
    setFormHarga(0);
    setFormKondisi('Baik / Aktif');
    setFormLokasi(LOKASI_LIST[0]);
    setFormPJ('Ahmad Fauzi (Seksi Perlengkapan)');
    setFormFoto('');
    setFormKet('');
    setShowAddAssetModal(true);
  };

  // Submit Asset Form
  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      onToast('Nama aset wajib diisi!');
      return;
    }

    const payload: AssetItem = {
      id: selectedAssetForEdit ? selectedAssetForEdit.id : `ast-${Date.now()}`,
      kodeAsset: formKode.trim() || `AST-${Date.now().toString().slice(-4)}`,
      namaAsset: formNama.trim(),
      kategori: formKategori,
      merkType: formMerk.trim() || '-',
      nomorSeri: formSeri.trim() || '-',
      tahunPerolehan: Number(formTahun) || new Date().getFullYear(),
      tanggalPerolehan: formTanggal,
      sumberDana: formSumberDana,
      hargaPerolehan: Number(formHarga) || 0,
      kondisi: formKondisi,
      lokasi: formLokasi,
      penanggungJawab: formPJ.trim() || 'Pengurus Karang Taruna',
      fotoAsset: formFoto.trim() || undefined,
      keterangan: formKet.trim(),
    };

    if (selectedAssetForEdit) {
      setAssets(assets.map((a) => (a.id === payload.id ? payload : a)));
      onToast('Data aset berhasil diperbarui!');
    } else {
      setAssets([payload, ...assets]);
      onToast('Aset baru berhasil ditambahkan ke inventaris!');
    }

    setShowAddAssetModal(false);
  };

  // Delete Asset
  const handleDeleteAsset = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus aset "${name}" dari inventaris?`)) {
      setAssets(assets.filter((a) => a.id !== id));
      onToast('Aset berhasil dihapus dari inventaris.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Kode Aset',
      'Nama Aset',
      'Kategori',
      'Merk/Type',
      'Nomor Seri',
      'Tahun',
      'Tanggal Perolehan',
      'Sumber Dana',
      'Nilai Perolehan',
      'Kondisi',
      'Lokasi',
      'Penanggung Jawab',
    ];

    const rows = filteredAssets.map((a) => [
      a.kodeAsset,
      `"${a.namaAsset}"`,
      `"${a.kategori}"`,
      `"${a.merkType}"`,
      `"${a.nomorSeri}"`,
      a.tahunPerolehan,
      a.tanggalPerolehan,
      `"${a.sumberDana}"`,
      a.hargaPerolehan,
      `"${a.kondisi}"`,
      `"${a.lokasi}"`,
      `"${a.penanggungJawab}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Aset_Karang_Taruna_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onToast('Berhasil mengunduh rekapitulasi data aset dalam format CSV / Excel!');
  };

  // Badge Colors for Condition
  const getKondisiBadge = (kondisi: KondisiAsset) => {
    switch (kondisi) {
      case 'Baik / Aktif':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Sedang Dipinjam':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Perlu Pemeliharaan':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Rusak Ringan':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Rusak Berat':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Hilang':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Khusus Aset Organisasi */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-bold tracking-wider uppercase text-blue-100 border border-white/20">
              <Package className="w-3.5 h-3.5" />
              <span>Inventaris & Manajemen Aset</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Aset Organisasi Karang Taruna
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Sistem terpadu pencatatan aset inventaris, peminjaman barang, perawatan & pemeliharaan,
              pengadaan, berita acara penghapusan, hingga audit stock opname kelurahan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Aset Baru</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center gap-2 text-white transition-all"
              title="Unduh Rekap Spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Export CSV / Excel</span>
            </button>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('database')}
                className="px-3.5 py-2.5 bg-blue-500/40 hover:bg-blue-500/60 border border-blue-300/40 rounded-xl text-xs font-bold backdrop-blur-sm flex items-center gap-2 text-white transition-all shadow-xs"
                title="Cadangkan Aset ke Google Drive"
              >
                <Cloud className="w-4 h-4 text-blue-200" />
                <span className="hidden sm:inline">Backup Google Drive</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'dashboard', label: 'Dashboard Aset', icon: BarChart3 },
            { id: 'data_aset', label: `Data Aset (${assets.length})`, icon: Package },
            { id: 'peminjaman', label: `Peminjaman (${peminjamanList.length})`, icon: Clock },
            { id: 'mutasi_servis', label: `Pemeliharaan & Mutasi (${mutasiServisList.length})`, icon: Wrench },
            { id: 'pengadaan', label: `Pengadaan Aset (${pengadaanList.length})`, icon: ShoppingCart },
            { id: 'penghapusan', label: `Penghapusan Aset (${penghapusanList.length})`, icon: AlertTriangle },
            { id: 'stock_opname', label: `Stock Opname (${stockOpnameList.length})`, icon: FileCheck },
            { id: 'dokumen', label: `Dokumen Aset (${dokumenList.length})`, icon: FileText },
            { id: 'laporan', label: 'Laporan & Rekap', icon: Printer },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. TAB: DASHBOARD ASET */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top 7 KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Aset</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalAsetCount}</div>
              <span className="text-[10px] text-slate-400">Barang inventaris</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Aset Aktif</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">{asetAktifCount}</div>
              <span className="text-[10px] text-emerald-600 font-medium">Siap digunakan</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-rose-600 uppercase">Aset Rusak</span>
              <div className="text-2xl font-black text-rose-700 mt-1">{asetRusakCount}</div>
              <span className="text-[10px] text-rose-500">Ringan & berat</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-blue-600 uppercase">Sedang Dipinjam</span>
              <div className="text-2xl font-black text-blue-700 mt-1">{asetDipinjamCount}</div>
              <span className="text-[10px] text-blue-500">Warga / panitia</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase">Perlu Pemeliharaan</span>
              <div className="text-2xl font-black text-amber-700 mt-1">{asetPerluPemeliharaanCount}</div>
              <span className="text-[10px] text-amber-600">Jadwal servis</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Aset Hilang</span>
              <div className="text-2xl font-black text-slate-700 mt-1">{asetHilangCount}</div>
              <span className="text-[10px] text-slate-400">Dalam pelacakan</span>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl text-white shadow-xs col-span-2 sm:col-span-1 lg:col-span-1">
              <span className="text-[10px] font-bold text-blue-100 uppercase">Nilai Total Aset</span>
              <div className="text-base sm:text-lg font-black mt-1 truncate">
                {formatCurrency(nilaiTotalAset)}
              </div>
              <span className="text-[10px] text-blue-200">Estimasi perolehan</span>
            </div>
          </div>

          {/* 2 Graphs / Breakdown Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grafik Aset Berdasarkan Kategori */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Grafik Aset Berdasarkan Kategori
                  </h4>
                </div>
                <span className="text-xs text-slate-500">10 Kategori</span>
              </div>

              <div className="space-y-2.5">
                {KATEGORI_LIST.map((kat) => {
                  const count = assets.filter((a) => a.kategori === kat).length;
                  const percent = totalAsetCount > 0 ? Math.round((count / totalAsetCount) * 100) : 0;
                  return (
                    <div key={kat} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700">{kat}</span>
                        <span className="font-bold text-slate-900">
                          {count} Unit ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grafik Kondisi Aset */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Grafik Kondisi Fisik Aset
                  </h4>
                </div>
                <span className="text-xs text-slate-500">Kondisi Real-time</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {KONDISI_LIST.map((kondisi) => {
                  const count = assets.filter((a) => a.kondisi === kondisi).length;
                  const badge = getKondisiBadge(kondisi);
                  return (
                    <div
                      key={kondisi}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                    >
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge}`}>
                          {kondisi}
                        </span>
                        <div className="text-xl font-black text-slate-900 mt-1">{count}</div>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {totalAsetCount > 0 ? Math.round((count / totalAsetCount) * 100) : 0}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Lokasi Distribution Summary */}
              <div className="pt-3 border-t border-slate-100">
                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Distribusi Lokasi Aset
                </h5>
                <div className="flex flex-wrap gap-2">
                  {LOKASI_LIST.map((lok) => {
                    const count = assets.filter((a) => a.lokasi === lok).length;
                    if (count === 0) return null;
                    return (
                      <span
                        key={lok}
                        className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs text-slate-700 font-semibold"
                      >
                        {lok}: <strong className="text-blue-600">{count}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: DATA ASET */}
      {activeTab === 'data_aset' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3 bg-slate-50/60">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kode aset, nama, merk, penanggung jawab..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleOpenAdd}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Aset</span>
                </button>
              </div>
            </div>

            {/* Select dropdown filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="semua">Semua Kategori (10 Kategori)</option>
                  {KATEGORI_LIST.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterLokasi}
                  onChange={(e) => setFilterLokasi(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="semua">Semua Lokasi Aset</option>
                  {LOKASI_LIST.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterKondisi}
                  onChange={(e) => setFilterKondisi(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="semua">Semua Kondisi Aset</option>
                  {KONDISI_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kode & Nama Asset</th>
                  <th className="py-3 px-4">Kategori & Merk</th>
                  <th className="py-3 px-4">Tahun / Nilai</th>
                  <th className="py-3 px-4">Kondisi</th>
                  <th className="py-3 px-4">Lokasi & PJ</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Tidak ditemukan aset yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {item.fotoAsset ? (
                            <img
                              src={item.fotoAsset}
                              alt={item.namaAsset}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                              {item.kodeAsset}
                            </span>
                            <div className="font-bold text-slate-900 text-sm mt-0.5">
                              {item.namaAsset}
                            </div>
                            <div className="text-[11px] text-slate-400">SN: {item.nomorSeri}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{item.kategori}</div>
                        <div className="text-[11px] text-slate-500">{item.merkType}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {formatCurrency(item.hargaPerolehan)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Tahun {item.tahunPerolehan} ({item.sumberDana.slice(0, 18)}...)
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getKondisiBadge(
                            item.kondisi
                          )}`}
                        >
                          {item.kondisi}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{item.lokasi}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          PJ: {item.penanggungJawab}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedAssetForDetail(item)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                            title="Detail Aset"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="Edit Data Aset"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(item.id, item.namaAsset)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TAB: PEMINJAMAN ASSET */}
      {activeTab === 'peminjaman' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Peminjaman Aset Organisasi ({peminjamanList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Lacak izin peminjaman alat, kondisi saat keluar, dan pengembalian barang.
              </p>
            </div>
            <button
              onClick={() => setShowAddPeminjamanModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Pengajuan Peminjaman Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No Pinjam / Peminjam</th>
                  <th className="py-3 px-4">Aset Yang Dipinjam</th>
                  <th className="py-3 px-4">Jadwal Pinjam</th>
                  <th className="py-3 px-4">Kondisi Keluar / Kembali</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {peminjamanList.map((pmj) => (
                  <tr key={pmj.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[10px] text-blue-600 font-bold">{pmj.nomorPinjam}</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{pmj.namaPeminjam}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{pmj.kontakPeminjam}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{pmj.namaAsset}</div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5">Keperluan: {pmj.keperluan}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>Tgl Pinjam: <strong>{pmj.tanggalPinjam}</strong></div>
                      <div className="text-slate-500">Rencana Kembali: <strong>{pmj.rencanaKembali}</strong></div>
                      {pmj.tanggalPengembalian && (
                        <div className="text-emerald-700 font-bold">Kembali: {pmj.tanggalPengembalian}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px]">
                        <span className="text-slate-400">Saat Keluar:</span> {pmj.kondisiSaatKeluar}
                      </div>
                      {pmj.kondisiSaatKembali && (
                        <div className="text-[11px] text-emerald-700 mt-1">
                          <span className="text-slate-400">Saat Kembali:</span> {pmj.kondisiSaatKembali}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          pmj.statusPeminjaman === 'Dikembalikan'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pmj.statusPeminjaman === 'Disetujui / Dipinjam'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {pmj.statusPeminjaman}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {pmj.statusPeminjaman === 'Disetujui / Dipinjam' && (
                        <button
                          onClick={() => {
                            const updated = peminjamanList.map((p) =>
                              p.id === pmj.id
                                ? {
                                    ...p,
                                    statusPeminjaman: 'Dikembalikan' as const,
                                    tanggalPengembalian: new Date().toISOString().split('T')[0],
                                    kondisiSaatKembali: 'Kondisi baik, barang lengkap',
                                  }
                                : p
                            );
                            setPeminjamanList(updated);
                            // Set asset condition back to active
                            setAssets(
                              assets.map((a) =>
                                a.id === pmj.assetId ? { ...a, kondisi: 'Baik / Aktif' as const } : a
                              )
                            );
                            onToast(`Aset "${pmj.namaAsset}" telah berhasil dikembalikan!`);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          Tandai Dikembalikan
                        </button>
                      )}
                      {pmj.statusPeminjaman === 'Dikembalikan' && (
                        <span className="text-xs text-slate-400 font-semibold">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB: PEMELIHARAAN & MUTASI */}
      {activeTab === 'mutasi_servis' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Riwayat Pemeliharaan & Mutasi Aset ({mutasiServisList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan pemindahan lokasi, pergantian penanggung jawab, dan riwayat perbaikan/servis.
              </p>
            </div>
            <button
              onClick={() => setShowAddMutasiModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Mutasi / Servis</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tipe & Tanggal</th>
                  <th className="py-3 px-4">Aset</th>
                  <th className="py-3 px-4">Lokasi Asal &rarr; Tujuan</th>
                  <th className="py-3 px-4">Penanggung Jawab</th>
                  <th className="py-3 px-4">Alasan & Keterangan</th>
                  <th className="py-3 px-4">Biaya Servis</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mutasiServisList.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          m.tipe === 'Mutasi Lokasi'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.tipe}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">{m.tanggal}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">{m.namaAsset}</td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-slate-500">{m.lokasiAsal}</span> &rarr;{' '}
                      <strong className="text-blue-700">{m.lokasiTujuan}</strong>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <div>Lama: {m.penanggungJawabLama}</div>
                      <div>Baru: <strong className="text-slate-900">{m.penanggungJawabBaru}</strong></div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{m.alasan}</div>
                      <div className="text-[11px] text-slate-500">{m.keterangan}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {m.biaya > 0 ? formatCurrency(m.biaya) : 'Gratis / Rp 0'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB: PENGADAAN ASSET */}
      {activeTab === 'pengadaan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Pengadaan Aset Baru ({pengadaanList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Usulan pembelian barang inventaris, persetujuan anggaran, dan status penerimaan vendor.
              </p>
            </div>
            <button
              onClick={() => setShowAddPengadaanModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajukan Pengadaan</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nomor & Tanggal</th>
                  <th className="py-3 px-4">Pengusul</th>
                  <th className="py-3 px-4">Nama Aset & Kategori</th>
                  <th className="py-3 px-4">Jumlah</th>
                  <th className="py-3 px-4">Estimasi Harga</th>
                  <th className="py-3 px-4">Sumber Dana & Vendor</th>
                  <th className="py-3 px-4">Status Pengadaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pengadaanList.map((pgd) => (
                  <tr key={pgd.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-blue-600 font-bold">{pgd.nomorPengadaan}</div>
                      <div className="text-[11px] text-slate-400">{pgd.tanggalPengajuan}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">{pgd.pengusul}</td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{pgd.namaAsset}</div>
                      <div className="text-[11px] text-slate-500">{pgd.kategori}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">{pgd.jumlah} Unit</td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(pgd.estimasiHarga)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>{pgd.sumberDana}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Vendor: {pgd.vendor}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                        {pgd.statusPengadaan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB: PENGHAPUSAN ASSET */}
      {activeTab === 'penghapusan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Penghapusan Aset / Disposal ({penghapusanList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Berita acara penghapusan aset rusak berat, hilang, dihibahkan, atau tidak layak guna.
              </p>
            </div>
            <button
              onClick={() => setShowAddPenghapusanModal(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Berita Acara Penghapusan</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nomor BA & Tanggal</th>
                  <th className="py-3 px-4">Aset Yang Dihapus</th>
                  <th className="py-3 px-4">Alasan Penghapusan</th>
                  <th className="py-3 px-4">Persetujuan Pejabat</th>
                  <th className="py-3 px-4">Nilai Aset Sisa</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {penghapusanList.map((php) => (
                  <tr key={php.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-rose-600 font-bold">{php.nomorBA}</div>
                      <div className="text-[11px] text-slate-400">{php.tanggalPenghapusan}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{php.namaAsset}</div>
                      <div className="font-mono text-[10px] text-slate-400">{php.kodeAsset}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        {php.alasan}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                      {php.persetujuanOleh}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(php.nilaiAsetSaatDihapus)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{php.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB: STOCK OPNAME */}
      {activeTab === 'stock_opname' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Stock Opname & Audit Fisik Aset ({stockOpnameList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Pemeriksaan fisik langsung mencocokkan data sistem dengan keberadaan riil di lapangan.
              </p>
            </div>
            <button
              onClick={() => onToast('Pemeriksaan audit fisik baru dapat dicatat.')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Form Pemeriksaan Fisik</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kode & Nama Asset</th>
                  <th className="py-3 px-4">Data Sistem</th>
                  <th className="py-3 px-4">Hasil Fisik Nyata</th>
                  <th className="py-3 px-4">Hasil Pemeriksaan</th>
                  <th className="py-3 px-4">Petugas & Tanggal</th>
                  <th className="py-3 px-4">Keterangan Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stockOpnameList.map((so) => (
                  <tr key={so.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-blue-600 font-bold text-[11px]">{so.kodeAsset}</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{so.namaAsset}</div>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <div>Lokasi: <strong>{so.dataSistem.lokasi}</strong></div>
                      <div>Kondisi: <strong>{so.dataSistem.kondisi}</strong></div>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <div>Lokasi Nyata: <strong className="text-blue-700">{so.lokasiSebenarnya}</strong></div>
                      <div>Kondisi Fisik: <strong className="text-emerald-700">{so.kondisiFisik}</strong></div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          so.hasilPemeriksaan === 'Sesuai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {so.hasilPemeriksaan}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{so.petugasPemeriksa}</div>
                      <div className="text-[10px] text-slate-400">{so.tanggalPemeriksaan}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{so.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. TAB: DOKUMEN ASSET */}
      {activeTab === 'dokumen' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Dokumen Legalitas & Bukti Kepemilikan Aset ({dokumenList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Arsip faktur, kwitansi, nota pembelian, sertifikat, kartu garansi, dan BAST kelurahan.
              </p>
            </div>
            <button
              onClick={() => onToast('Mengunggah dokumen bukti kepemilikan aset baru...')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Dokumen</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Jenis Dokumen</th>
                  <th className="py-3 px-4">Nama Aset Terkait</th>
                  <th className="py-3 px-4">Nomor Dokumen</th>
                  <th className="py-3 px-4">Tanggal Dokumen</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-center">Berkas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {dokumenList.map((dok) => (
                  <tr key={dok.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                        {dok.jenisDokumen}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">{dok.namaAsset}</td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {dok.nomorDokumen}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">{dok.tanggalDokumen}</td>

                    <td className="py-3.5 px-4 text-slate-600">{dok.keterangan}</td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onToast(`Membuka lampiran berkas ${dok.jenisDokumen}...`)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-blue-700 rounded-lg font-bold text-xs"
                      >
                        Lihat Berkas
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. TAB: LAPORAN & REKAP */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Rekapitulasi Excel / CSV</h4>
              <p className="text-xs text-slate-500">
                Unduh seluruh master data aset, nomor seri, harga perolehan, dan kondisi barang dalam satu tabel.
              </p>
              <button
                onClick={handleExportCSV}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Unduh File CSV / Excel
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Cetak Laporan Inventaris Resmi</h4>
              <p className="text-xs text-slate-500">
                Format standar cetak lampiran laporan pertanggungjawaban BAST pengurus ke Kelurahan Manis Jaya.
              </p>
              <button
                onClick={() => {
                  window.print();
                  onToast('Menyiapkan lembar cetak laporan inventaris...');
                }}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Cetak Laporan / PDF
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Laporan Hasil Stock Opname</h4>
              <p className="text-xs text-slate-500">
                Rekap audit fisik tahunan untuk mengetahui selisih barang dan status barang rusak.
              </p>
              <button
                onClick={() => onToast('Mengunduh rekapitulasi audit stock opname...')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Unduh Berita Acara Opname
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT ASET */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedAssetForEdit ? 'Edit Data Aset Inventaris' : 'Tambah Aset Inventaris Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Lengkapi identitas barang, nomor seri, harga perolehan, dan penanggung jawab.
                </p>
              </div>
              <button
                onClick={() => setShowAddAssetModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kode Aset <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formKode}
                    onChange={(e) => setFormKode(e.target.value)}
                    placeholder="AST-ELK-2024-001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Aset <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: Wireless Mic Baretone"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as KategoriAsset)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    {KATEGORI_LIST.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Merk / Type</label>
                  <input
                    type="text"
                    value={formMerk}
                    onChange={(e) => setFormMerk(e.target.value)}
                    placeholder="Sony / Lenovo / Baretone"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Seri / Pabrik</label>
                  <input
                    type="text"
                    value={formSeri}
                    onChange={(e) => setFormSeri(e.target.value)}
                    placeholder="SN-12345678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Perolehan</label>
                  <input
                    type="number"
                    value={formTahun}
                    onChange={(e) => setFormTahun(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Perolehan</label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga / Nilai Perolehan (Rp)</label>
                  <input
                    type="number"
                    value={formHarga}
                    onChange={(e) => setFormHarga(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kondisi Saat Ini</label>
                  <select
                    value={formKondisi}
                    onChange={(e) => setFormKondisi(e.target.value as KondisiAsset)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    {KONDISI_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi Penyimpanan</label>
                  <select
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value as LokasiAsset)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    {LOKASI_LIST.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sumber Dana</label>
                  <input
                    type="text"
                    value={formSumberDana}
                    onChange={(e) => setFormSumberDana(e.target.value)}
                    placeholder="APBDes / Donasi / Kas KT"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab Aset</label>
                  <input
                    type="text"
                    value={formPJ}
                    onChange={(e) => setFormPJ(e.target.value)}
                    placeholder="Nama Pengurus & Seksi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Foto Aset</label>
                  <input
                    type="url"
                    value={formFoto}
                    onChange={(e) => setFormFoto(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Catatan Fisik</label>
                <textarea
                  rows={2}
                  value={formKet}
                  onChange={(e) => setFormKet(e.target.value)}
                  placeholder="Catatan kelengkapan aksesoris, kabel, atau catatan kondisi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Simpan Data Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedAssetForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden my-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                  {selectedAssetForDetail.kodeAsset}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getKondisiBadge(selectedAssetForDetail.kondisi)}`}>
                  {selectedAssetForDetail.kondisi}
                </span>
              </div>
              <button
                onClick={() => setSelectedAssetForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              {selectedAssetForDetail.fotoAsset && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={selectedAssetForDetail.fotoAsset}
                    alt={selectedAssetForDetail.namaAsset}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedAssetForDetail.namaAsset}
                </h3>
                <p className="text-slate-500">
                  {selectedAssetForDetail.kategori} &bull; {selectedAssetForDetail.merkType}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-semibold">Nomor Seri</span>
                  <span className="font-mono font-bold text-slate-800">{selectedAssetForDetail.nomorSeri}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Nilai Perolehan</span>
                  <span className="font-bold text-blue-700">{formatCurrency(selectedAssetForDetail.hargaPerolehan)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Lokasi</span>
                  <span className="font-bold text-slate-800">{selectedAssetForDetail.lokasi}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Tahun Perolehan</span>
                  <span className="font-bold text-slate-800">{selectedAssetForDetail.tahunPerolehan}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block font-semibold">Penanggung Jawab</span>
                  <span className="font-bold text-slate-800">{selectedAssetForDetail.penanggungJawab}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block font-semibold">Catatan / Keterangan</span>
                  <span className="text-slate-700">{selectedAssetForDetail.keterangan || '-'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedAssetForDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
