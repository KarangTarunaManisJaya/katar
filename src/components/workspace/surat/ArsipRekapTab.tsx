import React, { useState, useMemo } from 'react';
import {
  FolderArchive,
  Search,
  Filter,
  Printer,
  Download,
  Calendar,
  Building,
  User,
  Inbox,
  Send,
  Share2,
  CheckCircle2,
  Clock,
  Eye,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import {
  SuratMasukItem,
  SuratKeluarItem,
  DisposisiItem,
  JenisSurat,
} from '../../../types/surat';

interface ArsipRekapTabProps {
  suratMasuk: SuratMasukItem[];
  suratKeluar: SuratKeluarItem[];
  disposisi: DisposisiItem[];
  onOpenSuratMasukDetail: (item: SuratMasukItem) => void;
  onOpenSuratKeluarDetail: (item: SuratKeluarItem) => void;
  onToast: (msg: string) => void;
}

export const ArsipRekapTab: React.FC<ArsipRekapTabProps> = ({
  suratMasuk,
  suratKeluar,
  disposisi,
  onOpenSuratMasukDetail,
  onOpenSuratKeluarDetail,
  onToast,
}) => {
  const currentYear = new Date().getFullYear();

  // Mode tab: 'semua' | 'masuk' | 'keluar' | 'disposisi'
  const [activeTab, setActiveTab] = useState<'semua' | 'masuk' | 'keluar' | 'disposisi'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTahun, setFilterTahun] = useState<string>(String(currentYear));
  const [filterBulan, setFilterBulan] = useState<string>('semua');
  const [filterJenis, setFilterJenis] = useState<string>('semua');
  const [filterStatusKhusus, setFilterStatusKhusus] = useState<string>('semua');

  // Unified items
  const unifiedItems = useMemo(() => {
    const list: Array<{
      id: string;
      direction: 'Masuk' | 'Keluar';
      nomor: string;
      tanggal: string;
      pihakLuar: string;
      perihal: string;
      jenis: string;
      status: string;
      rawMasuk?: SuratMasukItem;
      rawKeluar?: SuratKeluarItem;
    }> = [];

    if (activeTab === 'semua' || activeTab === 'masuk') {
      suratMasuk.forEach((sm) => {
        list.push({
          id: sm.id,
          direction: 'Masuk',
          nomor: sm.nomorSurat,
          tanggal: sm.tanggalSurat,
          pihakLuar: `${sm.instansi} (${sm.pengirim})`,
          perihal: sm.perihal,
          jenis: sm.jenisSurat,
          status: sm.status,
          rawMasuk: sm,
        });
      });
    }

    if (activeTab === 'semua' || activeTab === 'keluar') {
      suratKeluar.forEach((sk) => {
        list.push({
          id: sk.id,
          direction: 'Keluar',
          nomor: sk.nomorSurat,
          tanggal: sk.tanggalSurat,
          pihakLuar: `${sk.tujuan} - ${sk.instansi || ''}`,
          perihal: sk.perihal,
          jenis: sk.jenisSurat,
          status: sk.status,
          rawKeluar: sk,
        });
      });
    }

    // Filter
    return list.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        item.nomor.toLowerCase().includes(q) ||
        item.perihal.toLowerCase().includes(q) ||
        item.pihakLuar.toLowerCase().includes(q);

      const matchTahun = filterTahun === 'semua' || item.tanggal.startsWith(filterTahun);

      const itemMonth = item.tanggal.split('-')[1];
      const matchBulan = filterBulan === 'semua' || itemMonth === filterBulan;

      const matchJenis = filterJenis === 'semua' || item.jenis === filterJenis;

      let matchKhusus = true;
      if (filterStatusKhusus === 'belum_ditindaklanjuti') {
        matchKhusus = item.status === 'Belum Diproses' || item.status === 'Menunggu Balasan' || item.status === 'Menunggu TTD';
      } else if (filterStatusKhusus === 'selesai') {
        matchKhusus = item.status === 'Selesai' || item.status === 'Terkirim';
      }

      return matchSearch && matchTahun && matchBulan && matchJenis && matchKhusus;
    });
  }, [suratMasuk, suratKeluar, activeTab, searchQuery, filterTahun, filterBulan, filterJenis, filterStatusKhusus]);

  // Export to CSV simulation
  const handleExportCSV = () => {
    const headers = ['Arah', 'Nomor Surat', 'Tanggal', 'Pihak Terkait', 'Perihal', 'Jenis', 'Status'];
    const rows = unifiedItems.map((item) => [
      item.direction,
      `"${item.nomor}"`,
      item.tanggal,
      `"${item.pihakLuar.replace(/"/g, '""')}"`,
      `"${item.perihal.replace(/"/g, '""')}"`,
      item.jenis,
      item.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Surat_Katar_Manis_Jaya_${filterTahun}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast(`Berhasil mengekspor ${unifiedItems.length} data rekap ke format CSV!`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-indigo-600" />
            Arsip Digital & Rekapitulasi Persuratan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencarian silang surat masuk, surat keluar, disposisi, rekap per bulan/tahun, serta ekspor data buku agenda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Ekspor CSV / Excel
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Rekap
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('semua')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'semua'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Semua Surat ({suratMasuk.length + suratKeluar.length})
        </button>
        <button
          onClick={() => setActiveTab('masuk')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'masuk'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Surat Masuk ({suratMasuk.length})
        </button>
        <button
          onClick={() => setActiveTab('keluar')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'keluar'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Surat Keluar ({suratKeluar.length})
        </button>
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor surat, perihal, pihak luar..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </div>

          {/* Tahun */}
          <div>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="semua">Semua Tahun</option>
              <option value={String(currentYear)}>Tahun {currentYear}</option>
              <option value={String(currentYear - 1)}>Tahun {currentYear - 1}</option>
              <option value={String(currentYear - 2)}>Tahun {currentYear - 2}</option>
            </select>
          </div>

          {/* Bulan */}
          <div>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="semua">Semua Bulan</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          {/* Status Khusus */}
          <div>
            <select
              value={filterStatusKhusus}
              onChange={(e) => setFilterStatusKhusus(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="semua">Semua Status</option>
              <option value="belum_ditindaklanjuti">Belum Ditindaklanjuti</option>
              <option value="selesai">Selesai / Terkirim</option>
            </select>
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Hasil Rekap: <b>{unifiedItems.length}</b> dokumen korespondensi
          </span>
          {(filterBulan !== 'semua' || filterStatusKhusus !== 'semua' || searchQuery) && (
            <button
              onClick={() => {
                setFilterBulan('semua');
                setFilterStatusKhusus('semua');
                setSearchQuery('');
              }}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Recap Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3 text-center">Arah</th>
                <th className="py-3 px-4">Nomor & Tanggal</th>
                <th className="py-3 px-4">Pihak Terkait</th>
                <th className="py-3 px-4">Perihal & Jenis</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unifiedItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-slate-400 font-mono">{index + 1}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.direction === 'Masuk'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.direction}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{item.nomor}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> {item.tanggal}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 line-clamp-1">{item.pihakLuar}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 line-clamp-1">{item.perihal}</div>
                    <span className="inline-block px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 mt-1 font-medium">
                      {item.jenis}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.status === 'Selesai' || item.status === 'Terkirim'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'Belum Diproses' || item.status === 'Draft'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => {
                        if (item.rawMasuk) onOpenSuratMasukDetail(item.rawMasuk);
                        if (item.rawKeluar) onOpenSuratKeluarDetail(item.rawKeluar);
                      }}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {unifiedItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FolderArchive className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada dokumen arsip yang ditemukan.</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter tahun atau bulan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
