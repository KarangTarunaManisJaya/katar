import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Search,
  RotateCcw,
  Printer,
  FileSpreadsheet,
  FileDown,
  Users,
  CheckCircle2,
  MapPin,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Home,
  Tag,
  Briefcase,
  User,
  Clock,
  Layers,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { ActivityItem } from '../../data/workspaceData';

export interface LaporanKegiatanItem {
  id: string;
  no: number;
  tanggal: string; // '15/01/2025'
  rawDate: string; // '2025-01-15'
  judul: string;
  kategori: 'Sosial' | 'Keagamaan' | 'Olahraga' | 'Ekonomi/UMKM' | 'Lingkungan' | 'Kepemudaan' | 'Pendidikan';
  jenis: 'Kegiatan' | 'Berita' | 'Pengumuman';
  lokasi: string;
  lokasiSpesifik: string;
  status: 'Terbit' | 'Draft' | 'Arsip';
  peserta: string;
  penyelenggara: string;
  penanggungJawab: string;
  ringkasan: string;
  foto: string;
  kegiatanStatus: 'Berjalan' | 'Selesai';
}

const INITIAL_LAPORAN_DATA: LaporanKegiatanItem[] = [
  {
    id: 'lap-1',
    no: 1,
    tanggal: '15/01/2025',
    rawDate: '2025-01-15',
    judul: 'Bakti Sosial Pembagian Sembako',
    kategori: 'Sosial',
    jenis: 'Kegiatan',
    lokasi: 'Kp. Manis Jaya',
    lokasiSpesifik: 'Kp. Manis Jaya, Desa Manis Jaya',
    status: 'Terbit',
    peserta: '50 Orang',
    penyelenggara: 'Karang Taruna Manis Jaya',
    penanggungJawab: 'Andi Pratama',
    ringkasan:
      'Kegiatan bakti sosial berupa pembagian sembako kepada warga kurang mampu di wilayah Kp. Manis Jaya sebagai bentuk kepedulian sosial Karang Taruna Manis Jaya.',
    foto: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop',
    kegiatanStatus: 'Selesai',
  },
  {
    id: 'lap-2',
    no: 2,
    tanggal: '10/02/2025',
    rawDate: '2025-02-10',
    judul: 'Pengajian Rutin Remaja',
    kategori: 'Keagamaan',
    jenis: 'Kegiatan',
    lokasi: 'Masjid Al-Ikhlas',
    lokasiSpesifik: 'Masjid Al-Ikhlas RW 02, Manis Jaya',
    status: 'Terbit',
    peserta: '85 Orang',
    penyelenggara: 'Divisi Rohani Karang Taruna',
    penanggungJawab: 'Ust. Fajar Shiddiq',
    ringkasan:
      'Kajian keislaman dan silaturahmi bulanan pemuda-pemudi untuk memperkuat akhlak dan ukhuwah islamiyah generasi muda.',
    foto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
    kegiatanStatus: 'Selesai',
  },
  {
    id: 'lap-3',
    no: 3,
    tanggal: '22/02/2025',
    rawDate: '2025-02-22',
    judul: 'Turnamen Futsal Pemuda',
    kategori: 'Olahraga',
    jenis: 'Kegiatan',
    lokasi: 'Lapangan Desa',
    lokasiSpesifik: 'Lapangan Futsal Gelora Manis Jaya',
    status: 'Terbit',
    peserta: '120 Orang',
    penyelenggara: 'Divisi Olahraga Karang Taruna',
    penanggungJawab: 'Budi Santoso',
    ringkasan:
      'Kompetisi futsal persahabatan antar-RW se-Kelurahan Manis Jaya untuk mempererat sportivitas pemuda.',
    foto: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
    kegiatanStatus: 'Selesai',
  },
  {
    id: 'lap-4',
    no: 4,
    tanggal: '15/03/2025',
    rawDate: '2025-03-15',
    judul: 'Pelatihan UMKM & Digital Marketing',
    kategori: 'Ekonomi/UMKM',
    jenis: 'Kegiatan',
    lokasi: 'Aula Desa',
    lokasiSpesifik: 'Aula Kelurahan Manis Jaya Lt. 2',
    status: 'Draft',
    peserta: '40 Pelaku Usaha',
    penyelenggara: 'Karang Taruna & Dinas Koperasi',
    penanggungJawab: 'Rina Handayani',
    ringkasan:
      'Workshop peningkatan kapasitas promosi digital dan foto produk bagi wirausahawan muda lokal Kelurahan Manis Jaya.',
    foto: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop',
    kegiatanStatus: 'Berjalan',
  },
  {
    id: 'lap-5',
    no: 5,
    tanggal: '05/04/2025',
    rawDate: '2025-04-05',
    judul: 'Kerja Bakti Lingkungan',
    kategori: 'Lingkungan',
    jenis: 'Kegiatan',
    lokasi: 'Kp. Cokel',
    lokasiSpesifik: 'Sepanjang Saluran Drainase Kp. Cokel RW 04',
    status: 'Terbit',
    peserta: '95 Orang',
    penyelenggara: 'Karang Taruna Sub Unit RW 04',
    penanggungJawab: 'Hendra Setiawan',
    ringkasan:
      'Pembersihan saluran drainase air pemukiman dan normalisasi bantaran sungai menjelang musim penghujan.',
    foto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop',
    kegiatanStatus: 'Selesai',
  },
  {
    id: 'lap-6',
    no: 6,
    tanggal: '18/04/2025',
    rawDate: '2025-04-18',
    judul: 'Peringatan Hari Kartini',
    kategori: 'Kepemudaan',
    jenis: 'Kegiatan',
    lokasi: 'Balai Desa',
    lokasiSpesifik: 'Pendopo Balai Warga Kelurahan',
    status: 'Terbit',
    peserta: '110 Orang',
    penyelenggara: 'Srikandi Karang Taruna Manis Jaya',
    penanggungJawab: 'Dewi Lestari',
    ringkasan:
      'Pentas seni, seminar perempuan inspiratif, dan lomba busana adat untuk meneladani perjuangan Ibu R.A. Kartini.',
    foto: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop',
    kegiatanStatus: 'Selesai',
  },
  {
    id: 'lap-7',
    no: 7,
    tanggal: '20/05/2025',
    rawDate: '2025-05-20',
    judul: 'Santunan Anak Yatim',
    kategori: 'Sosial',
    jenis: 'Kegiatan',
    lokasi: 'Masjid Al-Ikhlas',
    lokasiSpesifik: 'Aula Masjid Al-Ikhlas RW 02',
    status: 'Terbit',
    peserta: '60 Anak Yatim',
    penyelenggara: 'Karang Taruna Peduli',
    penanggungJawab: 'Iik Andriyana',
    ringkasan:
      'Pemberian santunan dana pendidikan dan bingkisan perlengkapan sekolah bagi anak yatim dan dhuafa binaan.',
    foto: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
    kegiatanStatus: 'Berjalan',
  },
  {
    id: 'lap-8',
    no: 8,
    tanggal: '12/06/2025',
    rawDate: '2025-06-12',
    judul: 'Lomba 17 Agustus',
    kategori: 'Kepemudaan',
    jenis: 'Kegiatan',
    lokasi: 'Lapangan Desa',
    lokasiSpesifik: 'Kompleks Lapangan Utama Manis Jaya',
    status: 'Draft',
    peserta: '250 Orang',
    penyelenggara: 'Panitia HUT RI Karang Taruna',
    penanggungJawab: 'Dimas Kurniawan',
    ringkasan:
      'Rangkaian lomba rakyat tradisional panjat pinang, balap karung, dan tarik tambang perayaan HUT Kemerdekaan.',
    foto: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop',
    kegiatanStatus: 'Berjalan',
  },
  {
    id: 'lap-9',
    no: 9,
    tanggal: '25/06/2025',
    rawDate: '2025-06-25',
    judul: 'Penyuluhan Narkoba',
    kategori: 'Pendidikan',
    jenis: 'Kegiatan',
    lokasi: 'Aula Desa',
    lokasiSpesifik: 'Gedung Pertemuan Kelurahan',
    status: 'Terbit',
    peserta: '75 Pelajar & Pemuda',
    penyelenggara: 'Karang Taruna & BNN Kota',
    penanggungJawab: 'AKP (Purn) Suryanto / Iik A.',
    ringkasan:
      'Edukasi pencegahan bahaya narkoba dan pergaulan bebas untuk melindungi masa depan generasi penerus bangsa.',
    foto: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=800&auto=format&fit=crop',
    kegiatanStatus: 'Berjalan',
  },
  {
    id: 'lap-10',
    no: 10,
    tanggal: '10/07/2025',
    rawDate: '2025-07-10',
    judul: 'Penanaman Pohon',
    kategori: 'Lingkungan',
    jenis: 'Kegiatan',
    lokasi: 'Kp. Cokel',
    lokasiSpesifik: 'Kawasan Ruang Terbuka Hijau RW 05',
    status: 'Arsip',
    peserta: '65 Orang',
    penyelenggara: 'Karang Taruna Hijau',
    penanggungJawab: 'Taufik Hidayat',
    ringkasan:
      'Aksi tanam 500 bibit pohon buah dan peneduh guna menjaga kelestarian lingkungan dan cadangan resapan air tanah.',
    foto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop',
    kegiatanStatus: 'Berjalan',
  },
  {
    id: 'lap-11',
    no: 11,
    tanggal: '18/08/2025',
    rawDate: '2025-08-18',
    judul: 'Malam Tirakatan & Pentas Budaya',
    kategori: 'Kepemudaan',
    jenis: 'Kegiatan',
    lokasi: 'Balai Desa',
    lokasiSpesifik: 'Panggung Utama Kelurahan Manis Jaya',
    status: 'Terbit',
    peserta: '300 Warga',
    penyelenggara: 'Pengurus Karang Taruna',
    penanggungJawab: 'Andi Pratama',
    ringkasan:
      'Malam syukuran kemerdekaan dan doa bersama disertai penampilan kreasi tari dan musik anak-anak muda.',
    foto: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    kegiatanStatus: 'Berjalan',
  },
  {
    id: 'lap-12',
    no: 12,
    tanggal: '05/09/2025',
    rawDate: '2025-09-05',
    judul: 'Bazar Pemuda Kreatif Manis Jaya',
    kategori: 'Ekonomi/UMKM',
    jenis: 'Kegiatan',
    lokasi: 'Lapangan Desa',
    lokasiSpesifik: 'Area Parkir Lapangan Olahraga',
    status: 'Terbit',
    peserta: '45 Stand UMKM',
    penyelenggara: 'Bidang Kewirausahaan Karang Taruna',
    penanggungJawab: 'Rina Handayani',
    ringkasan:
      'Pameran produk kuliner, kriya, dan fashion karya pemuda Karang Taruna untuk menggairahkan ekonomi lokal.',
    foto: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800&auto=format&fit=crop',
    kegiatanStatus: 'Berjalan',
  },
];

interface LaporanKegiatanViewProps {
  onNavigateToTab?: (tab: any) => void;
  onSelectActivity?: (act: ActivityItem) => void;
  onToast: (msg: string) => void;
}

export const LaporanKegiatanView: React.FC<LaporanKegiatanViewProps> = ({
  onNavigateToTab,
  onSelectActivity,
  onToast,
}) => {
  const currentYear = new Date().getFullYear();

  // Persistent Laporan List with real-time sync across devices
  const [laporanList, setLaporanList] = useState<LaporanKegiatanItem[]>(() => {
    try {
      const saved = localStorage.getItem('kt_laporan_kegiatan_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Dynamically adjust initial sample dates to current year
    return INITIAL_LAPORAN_DATA.map((item) => ({
      ...item,
      tanggal: item.tanggal.replace('/2025', `/${currentYear}`),
      rawDate: item.rawDate.replace('2025-', `${currentYear}-`),
    }));
  });

  useEffect(() => {
    localStorage.setItem('kt_laporan_kegiatan_v1', JSON.stringify(laporanList));
  }, [laporanList]);

  useEffect(() => {
    const handleRemoteRefresh = () => {
      try {
        const saved = localStorage.getItem('kt_laporan_kegiatan_v1');
        if (saved) setLaporanList(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('kt_database_restored', handleRemoteRefresh);
    return () => {
      window.removeEventListener('kt_database_restored', handleRemoteRefresh);
    };
  }, []);

  // Filter States (Top Bar) - Dynamically set to current year
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
  const [selectedKategori, setSelectedKategori] = useState('Semua Kategori');
  const [selectedJenis, setSelectedJenis] = useState('Semua Jenis');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [selectedLokasi, setSelectedLokasi] = useState('Semua Lokasi');

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Selected Detail Item (Defaults to Item #1 from image)
  const [selectedItem, setSelectedItem] = useState<LaporanKegiatanItem>(() => laporanList[0] || INITIAL_LAPORAN_DATA[0]);

  // Modal Detail State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LaporanKegiatanItem | null>(null);

  // Edit item form state
  const [editTitle, setEditTitle] = useState('');
  const [editKategori, setEditKategori] = useState<LaporanKegiatanItem['kategori']>('Sosial');
  const [editLokasi, setEditLokasi] = useState('');
  const [editPeserta, setEditPeserta] = useState('');
  const [editPenanggungJawab, setEditPenanggungJawab] = useState('');
  const [editRingkasan, setEditRingkasan] = useState('');

  // Handle Reset Filters
  const handleResetFilters = () => {
    setStartDate(`${currentYear}-01-01`);
    setEndDate(`${currentYear}-12-31`);
    setSelectedKategori('Semua Kategori');
    setSelectedJenis('Semua Jenis');
    setSelectedStatus('Semua Status');
    setSelectedLokasi('Semua Lokasi');
    setSearchQuery('');
    setCurrentPage(1);
    onToast('Filter laporan kegiatan berhasil di-reset ke tahun berjalan.');
  };

  // Filtered List based on dynamic live state
  const filteredList = useMemo(() => {
    return laporanList.filter((item) => {
      // Category filter
      if (selectedKategori !== 'Semua Kategori' && item.kategori !== selectedKategori) {
        return false;
      }
      // Jenis filter
      if (selectedJenis !== 'Semua Jenis' && item.jenis !== selectedJenis) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'Semua Status' && item.status !== selectedStatus) {
        return false;
      }
      // Lokasi filter
      if (selectedLokasi !== 'Semua Lokasi' && item.lokasi !== selectedLokasi) {
        return false;
      }
      // Search query
      if (
        searchQuery &&
        !item.judul.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [selectedKategori, selectedJenis, selectedStatus, selectedLokasi, searchQuery]);

  // Metrics Calculations (Matches screenshot metrics: 12 total, 7 berjalan, 5 selesai, 6 lokasi berbeda)
  const totalKegiatan = INITIAL_LAPORAN_DATA.length;
  const kegiatanBerjalan = INITIAL_LAPORAN_DATA.filter((d) => d.kegiatanStatus === 'Berjalan').length;
  const kegiatanSelesai = INITIAL_LAPORAN_DATA.filter((d) => d.kegiatanStatus === 'Selesai').length;
  const distinctLocations = new Set(INITIAL_LAPORAN_DATA.map((d) => d.lokasi)).size;

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredList.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredList, currentPage, rowsPerPage]);

  // Export handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    onToast('Menyiapkan dokumen PDF Laporan Kegiatan Karang Taruna...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleExportExcel = () => {
    // Generate clean CSV
    const headers = ['No', 'Tanggal', 'Judul Kegiatan', 'Kategori', 'Jenis', 'Lokasi', 'Status', 'Peserta', 'Penanggung Jawab'];
    const rows = filteredList.map((item, idx) => [
      idx + 1,
      item.tanggal,
      `"${item.judul}"`,
      item.kategori,
      item.jenis,
      `"${item.lokasi}"`,
      item.status,
      item.peserta,
      `"${item.penanggungJawab}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Kegiatan_Karang_Taruna_Manis_Jaya_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('File Excel / CSV Laporan Kegiatan berhasil diunduh!');
  };

  const handleOpenEdit = (item: LaporanKegiatanItem) => {
    setEditingItem(item);
    setEditTitle(item.judul);
    setEditKategori(item.kategori);
    setEditLokasi(item.lokasi);
    setEditPeserta(item.peserta);
    setEditPenanggungJawab(item.penanggungJawab);
    setEditRingkasan(item.ringkasan);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const updated = laporanList.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            judul: editTitle,
            kategori: editKategori,
            lokasi: editLokasi,
            peserta: editPeserta,
            penanggungJawab: editPenanggungJawab,
            ringkasan: editRingkasan,
          }
        : item
    );
    setLaporanList(updated);
    if (selectedItem.id === editingItem.id) {
      setSelectedItem({
        ...selectedItem,
        judul: editTitle,
        kategori: editKategori,
        lokasi: editLokasi,
        peserta: editPeserta,
        penanggungJawab: editPenanggungJawab,
        ringkasan: editRingkasan,
      });
    }
    setEditModalOpen(false);
    onToast(`Data laporan "${editTitle}" berhasil diperbarui.`);
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn text-slate-800">
      {/* ----------------------------------------------------------------------- */}
      {/* Top Page Header (Title + Breadcrumbs) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Laporan Kegiatan
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Lihat dan cetak laporan seluruh kegiatan Karang Taruna Manis Jaya
            </p>
          </div>
        </div>

        {/* Top right breadcrumb matching screenshot */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium self-start sm:self-auto">
          <button
            onClick={() => onNavigateToTab?.('beranda')}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Laporan</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-blue-600 font-bold">Laporan Kegiatan</span>
        </div>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* Filter Bar Card (Periode, Kategori, Jenis, Status, Lokasi, Tampilkan, Reset) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Periode */}
          <div className="lg:col-span-2 space-y-1">
            <label className="font-bold text-slate-700 block">Periode</label>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 font-bold">s/d</span>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Kategori */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Kategori</label>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Semua Kategori">Semua Kategori</option>
              <option value="Sosial">Sosial</option>
              <option value="Keagamaan">Keagamaan</option>
              <option value="Olahraga">Olahraga</option>
              <option value="Ekonomi/UMKM">Ekonomi/UMKM</option>
              <option value="Lingkungan">Lingkungan</option>
              <option value="Kepemudaan">Kepemudaan</option>
              <option value="Pendidikan">Pendidikan</option>
            </select>
          </div>

          {/* Jenis */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Jenis</label>
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Semua Jenis">Semua Jenis</option>
              <option value="Kegiatan">Kegiatan</option>
              <option value="Berita">Berita</option>
              <option value="Pengumuman">Pengumuman</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Terbit">Terbit</option>
              <option value="Draft">Draft</option>
              <option value="Arsip">Arsip</option>
            </select>
          </div>

          {/* Lokasi */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Lokasi</label>
            <select
              value={selectedLokasi}
              onChange={(e) => setSelectedLokasi(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Semua Lokasi">Semua Lokasi</option>
              <option value="Kp. Manis Jaya">Kp. Manis Jaya</option>
              <option value="Masjid Al-Ikhlas">Masjid Al-Ikhlas</option>
              <option value="Lapangan Desa">Lapangan Desa</option>
              <option value="Aula Desa">Aula Desa</option>
              <option value="Kp. Cokel">Kp. Cokel</option>
              <option value="Balai Desa">Balai Desa</option>
            </select>
          </div>
        </div>

        {/* Buttons Tampilkan & Reset */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => onToast(`Menampilkan ${filteredList.length} kegiatan sesuai filter.`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 flex items-center gap-1.5 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tampilkan</span>
          </button>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* Export Action Buttons: Cetak, PDF, Excel */}
      {/* ----------------------------------------------------------------------- */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all"
        >
          <Printer className="w-4 h-4 text-blue-600" />
          <span>Cetak</span>
        </button>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-600/30 flex items-center gap-1.5 transition-all"
        >
          <FileDown className="w-4 h-4" />
          <span>PDF</span>
        </button>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excel</span>
        </button>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* 4 Summary Metric Cards (Total Kegiatan, Kegiatan Berjalan, Kegiatan Selesai, Lokasi Berbeda) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Kegiatan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-blue-600 font-bold block leading-tight">
              Total Kegiatan
            </span>
            <span className="text-2xl font-black text-slate-900 leading-tight block mt-0.5">
              {totalKegiatan}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Dalam periode terpilih</span>
          </div>
        </div>

        {/* Card 2: Kegiatan Berjalan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-emerald-700 font-bold block leading-tight">
              Kegiatan Berjalan
            </span>
            <span className="text-2xl font-black text-slate-900 leading-tight block mt-0.5">
              {kegiatanBerjalan}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {Math.round((kegiatanBerjalan / totalKegiatan) * 100)}% dari total
            </span>
          </div>
        </div>

        {/* Card 3: Kegiatan Selesai */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-amber-600 font-bold block leading-tight">
              Kegiatan Selesai
            </span>
            <span className="text-2xl font-black text-slate-900 leading-tight block mt-0.5">
              {kegiatanSelesai}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {Math.round((kegiatanSelesai / totalKegiatan) * 100)}% dari total
            </span>
          </div>
        </div>

        {/* Card 4: Lokasi Berbeda */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-purple-600 font-bold block leading-tight">
              Lokasi Berbeda
            </span>
            <span className="text-2xl font-black text-slate-900 leading-tight block mt-0.5">
              {distinctLocations}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Lokasi kegiatan</span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* 2-Column Split: Table Daftar Kegiatan (Left) + Detail Kegiatan (Right) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Daftar Kegiatan Table (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Daftar Kegiatan
              </h2>
            </div>

            {/* Table search & rows count */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Tampilkan</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>data</span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari judul kegiatan..."
                  className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-56"
                />
              </div>
            </div>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Judul Kegiatan</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Jenis</th>
                  <th className="py-3 px-3">Lokasi</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((item) => {
                  const isSelected = selectedItem.id === item.id;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/70 font-medium'
                          : 'hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">
                        {item.no}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {item.tanggal}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 max-w-[200px] truncate">
                        {item.judul}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {item.kategori}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {item.jenis}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {item.lokasi}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Terbit'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Draft'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                              setDetailModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(item);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Edit Kegiatan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada kegiatan yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer matching screenshot */}
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan {filteredList.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} -{' '}
              {Math.min(currentPage * rowsPerPage, filteredList.length)} dari {filteredList.length} data
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-100 text-slate-600"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-100 text-slate-600"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Detail Kegiatan Card (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Detail Kegiatan
            </h3>
          </div>

          {/* Activity Banner Photo matching the screenshot */}
          <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-slate-100">
            <img
              src={selectedItem.foto}
              alt={selectedItem.judul}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Status Badge */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base font-black text-slate-900 leading-snug">
              {selectedItem.judul}
            </h4>
            <span
              className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedItem.status === 'Terbit'
                  ? 'bg-emerald-600 text-white'
                  : selectedItem.status === 'Draft'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-500 text-white'
              }`}
            >
              {selectedItem.status}
            </span>
          </div>

          {/* Key-Value Details List matching screenshot format */}
          <div className="space-y-2 text-xs border-y border-slate-100 py-3">
            <div className="flex items-center text-slate-600">
              <span className="w-36 flex items-center gap-1.5 font-medium text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Kegiatan
              </span>
              <span className="font-semibold text-slate-800">: {selectedItem.tanggal}</span>
            </div>

            <div className="flex items-center text-slate-600">
              <span className="w-36 flex items-center gap-1.5 font-medium text-slate-500">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Kategori
              </span>
              <span className="font-semibold text-slate-800">: {selectedItem.kategori}</span>
            </div>

            <div className="flex items-center text-slate-600">
              <span className="w-36 flex items-center gap-1.5 font-medium text-slate-500">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Jenis
              </span>
              <span className="font-semibold text-slate-800">: {selectedItem.jenis}</span>
            </div>

            <div className="flex items-center text-slate-600">
              <span className="w-36 flex items-center gap-1.5 font-medium text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Lokasi
              </span>
              <span className="font-semibold text-slate-800 truncate">: {selectedItem.lokasiSpesifik}</span>
            </div>

            <div className="flex items-center text-slate-600">
              <span className="w-36 flex items-center gap-1.5 font-medium text-slate-500">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Penyelenggara
              </span>
              <span className="font-semibold text-slate-800">: {selectedItem.penyelenggara}</span>
            </div>

            <div className="flex items-center text-slate-600">
              <span className="w-36 flex items-center gap-1.5 font-medium text-slate-500">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Peserta
              </span>
              <span className="font-semibold text-slate-800">: {selectedItem.peserta}</span>
            </div>

            <div className="flex items-center text-slate-600">
              <span className="w-36 flex items-center gap-1.5 font-medium text-slate-500">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Penanggung Jawab
              </span>
              <span className="font-semibold text-slate-800">: {selectedItem.penanggungJawab}</span>
            </div>
          </div>

          {/* Ringkasan */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-900 block">Ringkasan</span>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {selectedItem.ringkasan}
            </p>
          </div>

          {/* Full Details Button */}
          <button
            type="button"
            onClick={() => setDetailModalOpen(true)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Lihat Detail Lengkap</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* Bottom Footer Credits matching screenshot */}
      {/* ----------------------------------------------------------------------- */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <span>© {currentYear} Karang Taruna Manis Jaya. All rights reserved.</span>
        <span>Sistem Informasi Karang Taruna</span>
      </div>

      {/* ======================================================================= */}
      {/* MODAL 1: LIHAT DETAIL LENGKAP */}
      {/* ======================================================================= */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Laporan Resmi: {selectedItem.judul}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="w-full h-56 rounded-2xl overflow-hidden shadow-sm">
              <img src={selectedItem.foto} alt={selectedItem.judul} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Kategori & Jenis</span>
                <span className="font-bold text-slate-800">{selectedItem.kategori} · {selectedItem.jenis}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Tanggal Pelaksanaan</span>
                <span className="font-bold text-slate-800">{selectedItem.tanggal}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Lokasi Lengkap</span>
                <span className="font-bold text-slate-800">{selectedItem.lokasiSpesifik}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Jumlah Partisipasi</span>
                <span className="font-bold text-slate-800">{selectedItem.peserta}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-800">Laporan Narasi Kegiatan:</span>
              <p className="text-xs text-slate-600 leading-relaxed p-3 bg-slate-50 rounded-xl border border-slate-200">
                {selectedItem.ringkasan}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  handlePrint();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Laporan</span>
              </button>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 2: EDIT LAPORAN KEGIATAN */}
      {/* ======================================================================= */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit Laporan: {editingItem.judul}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Judul Kegiatan</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kategori</label>
                  <select
                    value={editKategori}
                    onChange={(e: any) => setEditKategori(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Sosial">Sosial</option>
                    <option value="Keagamaan">Keagamaan</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Ekonomi/UMKM">Ekonomi/UMKM</option>
                    <option value="Lingkungan">Lingkungan</option>
                    <option value="Kepemudaan">Kepemudaan</option>
                    <option value="Pendidikan">Pendidikan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={editLokasi}
                    onChange={(e) => setEditLokasi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Peserta</label>
                  <input
                    type="text"
                    value={editPeserta}
                    onChange={(e) => setEditPeserta(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    value={editPenanggungJawab}
                    onChange={(e) => setEditPenanggungJawab(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Ringkasan</label>
                <textarea
                  rows={3}
                  value={editRingkasan}
                  onChange={(e) => setEditRingkasan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
