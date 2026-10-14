import React, { useState, useMemo, useRef } from 'react';
import {
  Archive,
  ArchiveRestore,
  Calendar,
  Clock,
  MapPin,
  User,
  Search,
  Filter,
  ArrowLeft,
  Download,
  Printer,
  Sparkles,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  DollarSign,
  Users,
  Tag,
  RefreshCw,
  FolderArchive,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ActivityItem } from '../../data/workspaceData';
import { OfficialKopSurat } from './surat/OfficialKopSurat';
import { OfficialSignatureBlock } from './surat/OfficialSignatureBlock';
import { downloadElementAsPdf, printElementDirectly } from '../../utils/pdfExport';

interface ArsipKegiatanViewProps {
  activities: ActivityItem[];
  onSelectActivity: (activity: ActivityItem) => void;
  onToggleArchive: (activity: ActivityItem, reason?: string) => void;
  onAutoArchivePast: () => void;
  onBackToActivities: () => void;
  onToast: (msg: string) => void;
}

export const ArsipKegiatanView: React.FC<ArsipKegiatanViewProps> = ({
  activities,
  onSelectActivity,
  onToggleArchive,
  onAutoArchivePast,
  onBackToActivities,
  onToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedYear, setSelectedYear] = useState<string>('Semua');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  // Filter archived activities
  const archivedActivities = useMemo(() => {
    return activities.filter((act) => act.isArchived === true);
  }, [activities]);

  const activeActivitiesCount = useMemo(() => {
    return activities.filter((act) => !act.isArchived).length;
  }, [activities]);

  // Extract years available in archived
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    archivedActivities.forEach((act) => {
      const match = act.date.match(/\b(20\d\d)\b/);
      if (match) years.add(match[1]);
      if (act.archivedAt) {
        const matchArchived = act.archivedAt.match(/\b(20\d\d)\b/);
        if (matchArchived) years.add(matchArchived[1]);
      }
    });
    return Array.from(years).sort().reverse();
  }, [archivedActivities]);

  // Categories list
  const categories = [
    'Semua',
    'Sosial',
    'Lingkungan',
    'Olahraga',
    'Keagamaan',
    'Pendidikan',
    'Kesenian & Budaya',
    'Sarana & Prasarana',
    'Dokumentasi',
  ];

  // Filtered archived list based on search and filters
  const filteredList = useMemo(() => {
    return archivedActivities.filter((act) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        act.title.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.location.toLowerCase().includes(q) ||
        act.author.toLowerCase().includes(q) ||
        (act.category && act.category.toLowerCase().includes(q)) ||
        (act.archiveReason && act.archiveReason.toLowerCase().includes(q)) ||
        (act.tags && act.tags.some((t) => t.toLowerCase().includes(q)));

      const matchCategory =
        selectedCategory === 'Semua' ||
        (selectedCategory === 'Dokumentasi'
          ? act.badge === 'Dokumentasi' || act.type === 'Dokumentasi'
          : (act.category && act.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
            act.description.toLowerCase().includes(selectedCategory.toLowerCase()));

      const matchYear =
        selectedYear === 'Semua' ||
        act.date.includes(selectedYear) ||
        (act.archivedAt && act.archivedAt.includes(selectedYear));

      return matchSearch && matchCategory && matchYear;
    });
  }, [archivedActivities, searchQuery, selectedCategory, selectedYear]);

  // Statistics calculation
  const totalPhotosArchived = useMemo(() => {
    return archivedActivities.reduce(
      (sum, act) => sum + (act.photoCount || (act.photos ? act.photos.length : 1)),
      0
    );
  }, [archivedActivities]);

  const totalBudgetArchived = useMemo(() => {
    return archivedActivities.reduce((sum, act) => sum + (act.budget || 0), 0);
  }, [archivedActivities]);

  const totalAttendeesArchived = useMemo(() => {
    return archivedActivities.reduce((sum, act) => sum + (act.estimatedAttendees || 0), 0);
  }, [archivedActivities]);

  // Export CSV of archived activities
  const handleExportCsv = () => {
    if (archivedActivities.length === 0) {
      onToast('Belum ada data arsip kegiatan untuk diekspor.');
      return;
    }

    const headers = [
      'No',
      'ID Kegiatan',
      'Judul Kegiatan',
      'Kategori',
      'Tanggal Pelaksanaan',
      'Waktu',
      'Lokasi',
      'Penanggung Jawab',
      'Anggaran (Rp)',
      'Perkiraan Peserta',
      'Tanggal Diarsipkan',
      'Alasan Arsip',
      'Deskripsi Singkat',
    ];

    const rows = filteredList.map((act, index) => [
      index + 1,
      act.id,
      `"${(act.title || '').replace(/"/g, '""')}"`,
      `"${(act.category || act.badge || '-').replace(/"/g, '""')}"`,
      `"${(act.date || '').replace(/"/g, '""')}"`,
      `"${(act.time || '-').replace(/"/g, '""')}"`,
      `"${(act.location || '').replace(/"/g, '""')}"`,
      `"${(act.author || '').replace(/"/g, '""')}"`,
      act.budget || 0,
      act.estimatedAttendees || 0,
      `"${(act.archivedAt || '-').replace(/"/g, '""')}"`,
      `"${(act.archiveReason || 'Kegiatan telah terlaksana').replace(/"/g, '""')}"`,
      `"${(act.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Arsip_Kegiatan_Karang_Taruna_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onToast(`Berhasil mengekspor ${filteredList.length} data arsip kegiatan (CSV/Excel).`);
  };

  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    try {
      setIsExportingPdf(true);
      onToast('Menyiapkan file PDF Buku Arsip Kegiatan...');
      const success = await downloadElementAsPdf(
        printableRef.current,
        `Buku_Arsip_Kegiatan_Karang_Taruna_Manis_Jaya.pdf`,
        (status) => onToast(status)
      );
      if (success) {
        onToast('Buku Arsip Kegiatan PDF berhasil diunduh!');
        setShowPrintModal(false);
      }
    } catch {
      onToast('Gagal membuat PDF. Coba cetak langsung.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintDirect = () => {
    if (!printableRef.current) return;
    printElementDirectly(printableRef.current);
    setShowPrintModal(false);
    onToast('Membuka dialog cetak Buku Arsip Kegiatan...');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Khusus Arsip Kegiatan */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[11px] font-bold tracking-wider uppercase text-sky-200 border border-white/15">
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Katalog & Depo Arsip Program Kerja</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Arsip Kegiatan Pemuda</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold">
                {archivedActivities.length} Arsip Tersimpan
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pusat penyimpanan dokumentasi dan program kerja yang telah selesai dilaksanakan. Kegiatan yang dipindahkan ke sini otomatis dirapikan sehingga <strong>tidak memenuhi dashboard utama</strong>, namun seluruh warta, foto, dan laporan tetap tersimpan aman selamanya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onBackToActivities}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center gap-2 transition-all cursor-pointer text-white"
            >
              <ArrowLeft className="w-4 h-4 text-sky-300" />
              <span>Kegiatan Aktif ({activeActivitiesCount})</span>
            </button>

            <button
              onClick={onAutoArchivePast}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              title="Pindahkan kegiatan yang sudah berlalu ke arsip secara otomatis"
            >
              <Archive className="w-4 h-4" />
              <span>Arsipkan Kegiatan Lampau</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs text-white transition-all cursor-pointer"
              title="Cetak Buku Induk Arsip Kegiatan Resmi"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportCsv}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs text-white transition-all cursor-pointer"
              title="Ekspor Arsip ke Spreadsheet (CSV/Excel)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Ringkasan Metrik Arsip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Arsip Tersimpan</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{archivedActivities.length}</span>
            <span className="text-xs text-slate-500 font-medium">Kegiatan Selesai</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Dokumentasi Foto</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{totalPhotosArchived}</span>
            <span className="text-xs text-slate-500 font-medium">Foto Tersimpan</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Partisipasi Warga</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{totalAttendeesArchived.toLocaleString('id-ID')}</span>
            <span className="text-xs text-slate-500 font-medium">Jiwa Terlibat</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Realisasi Dana</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-amber-600">
              Rp {totalBudgetArchived.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari arsip berdasarkan judul kegiatan, lokasi, penanggung jawab, atau alasan arsip..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {availableYears.length > 0 && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Semua">Semua Tahun</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Kategori Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Arsip Kegiatan atau Tampilan Kosong */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto shadow-inner">
            <Archive className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-slate-800">
              {archivedActivities.length === 0
                ? 'Belum Ada Kegiatan di Kategori Arsip'
                : 'Tidak Ditemukan Arsip yang Cocok'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {archivedActivities.length === 0
                ? 'Seluruh kegiatan saat ini masih tampil di dashboard utama. Anda dapat memindahkan kegiatan yang telah lewat atau selesai dilaksanakan ke kategori arsip agar dashboard tetap rapi dan ringkas.'
                : 'Coba ubah kata kunci pencarian atau ganti filter kategori/tahun untuk melihat arsip lainnya.'}
            </p>
          </div>

          {archivedActivities.length === 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onAutoArchivePast}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                <span>Arsipkan Kegiatan Lampau Sekarang</span>
              </button>
              <button
                onClick={onBackToActivities}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Kembali ke Beranda Kegiatan
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Media Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {item.image || (item.photos && item.photos[0]) ? (
                    <img
                      src={item.image || item.photos[0]}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale-[25%] group-hover:grayscale-0 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-slate-300" />
                    </div>
                  )}

                  {/* Badge Status Arsip */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-900/90 text-white backdrop-blur-sm shadow-xs">
                      <Archive className="w-3 h-3 text-amber-400" />
                      <span>ARSIP KEGIATAN</span>
                    </span>
                    {item.category && (
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 text-slate-800 backdrop-blur-sm">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {item.archivedAt && (
                    <div className="absolute bottom-2 right-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                        Diarsipkan: {item.archivedAt}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2.5">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Metadata Row */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.date}</span>
                      </span>
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {item.photoCount || 1} Foto
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {item.archiveReason && (
                      <div className="flex items-start gap-1.5 text-amber-700 bg-amber-50/70 p-1.5 rounded-lg text-[10px] mt-1 border border-amber-200/50">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5 text-amber-600" />
                        <span className="line-clamp-1">Keterangan: {item.archiveReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectActivity(item)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Detail</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onToggleArchive(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors cursor-pointer border border-emerald-200/60"
                    title="Pulihkan kegiatan ini agar muncul kembali di dashboard utama"
                  >
                    <ArchiveRestore className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pulihkan</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Pratinjau Cetak / Ekspor PDF Buku Arsip Kegiatan */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Buku Induk & Rekapitulasi Arsip Kegiatan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dokumen resmi arsip program kerja Karang Taruna Kelurahan Manis Jaya
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPrintModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Printable Area */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
              <div
                ref={printableRef}
                className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 mx-auto max-w-[210mm] text-slate-900 font-sans"
              >
                <OfficialKopSurat />

                <div className="text-center my-6 space-y-1">
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 underline decoration-slate-900 decoration-1">
                    BUKU REGISTER & ARSIP KEGIATAN KEPEMUDAAN
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold tracking-wide">
                    Nomor Register Dokumen: 004/REG-ARSIP/KT-MJ/{new Date().getFullYear()}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tanggal Pengesahan Arsip: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="mb-4 text-xs text-slate-700 leading-relaxed text-justify">
                  Daftar di bawah ini memuat seluruh kegiatan kepemudaan dan program kerja Karang Taruna Kelurahan Manis Jaya yang telah selesai terlaksana dan tersimpan secara resmi pada Depo Arsip Digital Organisasi:
                </div>

                {/* Table */}
                <div className="overflow-x-auto my-4">
                  <table className="w-full text-[11px] border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 px-2 py-2 text-center w-10">No</th>
                        <th className="border border-slate-300 px-3 py-2 text-left">Nama Kegiatan</th>
                        <th className="border border-slate-300 px-2 py-2 text-center">Kategori</th>
                        <th className="border border-slate-300 px-2 py-2 text-center">Tanggal</th>
                        <th className="border border-slate-300 px-3 py-2 text-left">Lokasi</th>
                        <th className="border border-slate-300 px-2 py-2 text-center">PJ</th>
                        <th className="border border-slate-300 px-2 py-2 text-center">Status Arsip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.map((act, idx) => (
                        <tr key={act.id} className="hover:bg-slate-50/50">
                          <td className="border border-slate-300 px-2 py-2 text-center font-bold">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-300 px-3 py-2">
                            <div className="font-bold text-slate-900">{act.title}</div>
                            <div className="text-[10px] text-slate-500 line-clamp-1">{act.description}</div>
                          </td>
                          <td className="border border-slate-300 px-2 py-2 text-center">
                            {act.category || act.badge}
                          </td>
                          <td className="border border-slate-300 px-2 py-2 text-center whitespace-nowrap">
                            {act.date}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-slate-600">
                            {act.location}
                          </td>
                          <td className="border border-slate-300 px-2 py-2 text-center font-semibold">
                            {act.author}
                          </td>
                          <td className="border border-slate-300 px-2 py-2 text-center">
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              Tersimpan
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-[11px] text-slate-600 space-y-1">
                  <p>• Total kegiatan terarsip: <strong>{filteredList.length} kegiatan</strong></p>
                  <p>• Total dokumentasi visual terlampir: <strong>{totalPhotosArchived} berkas foto</strong></p>
                  <p>• Seluruh arsip fisik dan berkas LPJ tersimpan di Lemari Arsip Sekretariat Karang Taruna Kelurahan Manis Jaya.</p>
                </div>

                {/* Signatures */}
                <div className="mt-8">
                  <OfficialSignatureBlock
                    ketuaTitle="Ketua Karang Taruna"
                    ketuaName="Iik Andriyana"
                    sekretarisTitle="Sekretaris Karang Taruna"
                    sekretarisName="Anisa Rahmawati"
                    organizationName="Karang Taruna Kelurahan Manis Jaya"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Format resmi A4 portrait siap cetak & unduh PDF beresolusi tinggi.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isExportingPdf ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyiapkan PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Berkas PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrintDirect}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
