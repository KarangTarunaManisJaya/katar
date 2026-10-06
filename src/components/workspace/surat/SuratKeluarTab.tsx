import React, { useState, useMemo } from 'react';
import {
  Send,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Copy,
  CheckCircle2,
  Clock,
  User,
  Building,
  Calendar,
  Paperclip,
  Share2,
  Download,
  ShieldCheck,
} from 'lucide-react';
import {
  SuratKeluarItem,
  JenisSurat,
  StatusSuratKeluar,
} from '../../../types/surat';

interface SuratKeluarTabProps {
  items: SuratKeluarItem[];
  onAddNew: () => void;
  onEdit: (item: SuratKeluarItem) => void;
  onDelete: (id: string) => void;
  onViewDetail: (item: SuratKeluarItem) => void;
  onPrintPreview: (item: SuratKeluarItem) => void;
  onUpdateStatus: (id: string, newStatus: StatusSuratKeluar) => void;
  onToast: (msg: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const SuratKeluarTab: React.FC<SuratKeluarTabProps> = ({
  items,
  onAddNew,
  onEdit,
  onDelete,
  onViewDetail,
  onPrintPreview,
  onUpdateStatus,
  onToast,
  searchQuery,
  setSearchQuery,
}) => {
  const [filterJenis, setFilterJenis] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterTahun, setFilterTahun] = useState<string>('semua');

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    items.forEach((item) => {
      const y = item.tanggalSurat.slice(0, 4);
      if (y) years.add(y);
    });
    return Array.from(years).sort().reverse();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        item.nomorSurat.toLowerCase().includes(q) ||
        item.perihal.toLowerCase().includes(q) ||
        item.tujuan.toLowerCase().includes(q) ||
        item.instansi.toLowerCase().includes(q) ||
        item.namaPenerima.toLowerCase().includes(q) ||
        item.isiSurat.toLowerCase().includes(q);

      const matchJenis = filterJenis === 'semua' || item.jenisSurat === filterJenis;
      const matchStatus = filterStatus === 'semua' || item.status === filterStatus;
      const matchTahun = filterTahun === 'semua' || item.tanggalSurat.startsWith(filterTahun);

      return matchSearch && matchJenis && matchStatus && matchTahun;
    });
  }, [items, searchQuery, filterJenis, filterStatus, filterTahun]);

  const handleCopyNoSurat = (no: string) => {
    navigator.clipboard.writeText(no);
    onToast(`Nomor surat "${no}" berhasil disalin ke clipboard!`);
  };

  const renderStatusBadge = (status: StatusSuratKeluar) => {
    switch (status) {
      case 'Terkirim':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Terkirim
          </span>
        );
      case 'Ditandatangani':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <ShieldCheck className="w-3 h-3 mr-1" /> Ditandatangani
          </span>
        );
      case 'Menunggu TTD':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" /> Menunggu TTD
          </span>
        );
      case 'Diarsipkan':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            Diarsipkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with actions & title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" />
            Buku Agenda Surat Keluar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar penomoran otomatis dan penerbitan surat dinas resmi Karang Taruna Kelurahan Manis Jaya.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Buat Surat Keluar
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor surat, perihal, nama penerima..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </div>

          {/* Jenis Surat */}
          <div>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="semua">Semua Jenis Surat</option>
              <option value="Undangan">Undangan</option>
              <option value="Permohonan">Permohonan</option>
              <option value="Pemberitahuan">Pemberitahuan</option>
              <option value="Surat tugas">Surat Tugas</option>
              <option value="Surat keterangan">Surat Keterangan</option>
              <option value="Surat rekomendasi">Surat Rekomendasi</option>
              <option value="Surat pengantar">Surat Pengantar</option>
              <option value="Surat keputusan">Surat Keputusan (SK)</option>
              <option value="Surat pernyataan">Surat Pernyataan</option>
              <option value="Berita acara">Berita Acara</option>
              <option value="Surat lainnya">Surat Lainnya</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="semua">Semua Status</option>
              <option value="Draft">Draft</option>
              <option value="Menunggu TTD">Menunggu TTD</option>
              <option value="Ditandatangani">Ditandatangani</option>
              <option value="Terkirim">Terkirim</option>
              <option value="Diarsipkan">Diarsipkan</option>
            </select>
          </div>

          {/* Tahun */}
          <div>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="semua">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Menampilkan <b>{filteredItems.length}</b> dari {items.length} surat keluar diterbitkan
          </span>
          {(filterJenis !== 'semua' || filterStatus !== 'semua' || filterTahun !== 'semua' || searchQuery) && (
            <button
              onClick={() => {
                setFilterJenis('semua');
                setFilterStatus('semua');
                setFilterTahun('semua');
                setSearchQuery('');
              }}
              className="text-emerald-600 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-4">Nomor & Tanggal</th>
                <th className="py-3 px-4">Tujuan / Penerima</th>
                <th className="py-3 px-4">Perihal & Jenis</th>
                <th className="py-3 px-3">Penandatangan</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi & Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-3 px-3 text-slate-400 font-mono">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900">{item.nomorSurat}</span>
                      <button
                        onClick={() => handleCopyNoSurat(item.nomorSurat)}
                        title="Salin Nomor Surat"
                        className="text-slate-400 hover:text-emerald-600 p-0.5"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.tanggalSurat}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{item.tujuan}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-slate-400" />
                      {item.instansi || 'Kelurahan Manis Jaya'}
                    </div>
                    {item.alamat && (
                      <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                        {item.alamat}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 line-clamp-1">{item.perihal}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">
                        {item.jenisSurat}
                      </span>
                      {item.lampiran && item.lampiran.length > 0 && (
                        <span className="inline-flex items-center text-[10px] text-blue-600 gap-0.5">
                          <Paperclip className="w-2.5 h-2.5" />
                          {item.lampiran.length} file
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      {item.penandatangan.map((ttd, i) => (
                        <div key={i} className="text-[11px] text-slate-700 flex items-center gap-1">
                          <User className="w-2.5 h-2.5 text-slate-400" />
                          <span className="font-medium">{ttd.nama}</span>
                          <span className="text-[10px] text-slate-400">({ttd.jabatan})</span>
                        </div>
                      ))}
                      {item.stempelOrganisasi && (
                        <span className="inline-block text-[9px] text-indigo-700 font-bold bg-indigo-50 px-1 rounded">
                          + Stempel Resmi
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {renderStatusBadge(item.status)}
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value as StatusSuratKeluar)}
                      className="mt-1 block mx-auto text-[10px] border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-600"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Menunggu TTD">Menunggu TTD</option>
                      <option value="Ditandatangani">Ditandatangani</option>
                      <option value="Terkirim">Terkirim</option>
                      <option value="Diarsipkan">Diarsipkan</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onPrintPreview(item)}
                        title="Cetak PDF (A4)"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak PDF</span>
                      </button>
                      <button
                        onClick={() => onViewDetail(item)}
                        title="Detail Surat"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        title="Edit Surat"
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        title="Hapus Surat"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Send className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada surat keluar yang cocok.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba sesuaikan kata kunci pencarian atau buat surat dinas baru.
                    </p>
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
