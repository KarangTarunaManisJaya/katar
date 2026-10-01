import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ArrowRight,
  FileText,
  AlertTriangle,
  Paperclip,
  CheckCircle2,
  Clock,
  Send,
  Building,
  User,
  Flame,
  ShieldAlert,
  Calendar,
  Share2,
} from 'lucide-react';
import {
  SuratMasukItem,
  SifatSurat,
  StatusSuratMasuk,
  JenisSurat,
} from '../../../types/surat';

interface SuratMasukTabProps {
  items: SuratMasukItem[];
  onAddNew: () => void;
  onEdit: (item: SuratMasukItem) => void;
  onDelete: (id: string) => void;
  onViewDetail: (item: SuratMasukItem) => void;
  onCreateDisposisi: (item: SuratMasukItem) => void;
  onUpdateStatus: (id: string, newStatus: StatusSuratMasuk) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const SuratMasukTab: React.FC<SuratMasukTabProps> = ({
  items,
  onAddNew,
  onEdit,
  onDelete,
  onViewDetail,
  onCreateDisposisi,
  onUpdateStatus,
  searchQuery,
  setSearchQuery,
}) => {
  const [filterSifat, setFilterSifat] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterJenis, setFilterJenis] = useState<string>('semua');
  const [filterTahun, setFilterTahun] = useState<string>('semua');

  // Available years from items
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
        item.instansi.toLowerCase().includes(q) ||
        item.pengirim.toLowerCase().includes(q) ||
        item.ringkasanIsi.toLowerCase().includes(q);

      const matchSifat = filterSifat === 'semua' || item.sifatSurat === filterSifat;
      const matchStatus = filterStatus === 'semua' || item.status === filterStatus;
      const matchJenis = filterJenis === 'semua' || item.jenisSurat === filterJenis;
      const matchTahun = filterTahun === 'semua' || item.tanggalSurat.startsWith(filterTahun);

      return matchSearch && matchSifat && matchStatus && matchJenis && matchTahun;
    });
  }, [items, searchQuery, filterSifat, filterStatus, filterJenis, filterTahun]);

  const renderSifatBadge = (sifat: SifatSurat) => {
    switch (sifat) {
      case 'Segera':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
            <Flame className="w-3 h-3 mr-1 text-rose-600 animate-pulse" /> Segera
          </span>
        );
      case 'Penting':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> Penting
          </span>
        );
      case 'Rahasia':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <ShieldAlert className="w-3 h-3 mr-1 text-purple-600" /> Rahasia
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Biasa
          </span>
        );
    }
  };

  const renderStatusBadge = (status: StatusSuratMasuk) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Selesai
          </span>
        );
      case 'Diproses/Didisposisi':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" /> Didisposisi
          </span>
        );
      case 'Menunggu Balasan':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            <Send className="w-3 h-3 mr-1" /> Menunggu Balasan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" /> Belum Diproses
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with actions & stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-blue-600" />
            Buku Agenda Surat Masuk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh surat masuk dari kelurahan, dinas, instansi, ormas, dan warga masyarakat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Catat Surat Masuk
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
              placeholder="Cari nomor surat, perihal, instansi..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </div>

          {/* Sifat Surat */}
          <div>
            <select
              value={filterSifat}
              onChange={(e) => setFilterSifat(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Sifat Surat</option>
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
              <option value="Segera">Segera</option>
              <option value="Rahasia">Rahasia</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Status</option>
              <option value="Belum Diproses">Belum Diproses</option>
              <option value="Diproses/Didisposisi">Didisposisi</option>
              <option value="Menunggu Balasan">Menunggu Balasan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Tahun */}
          <div>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            Menampilkan <b>{filteredItems.length}</b> dari {items.length} surat masuk tercatat
          </span>
          {(filterSifat !== 'semua' || filterStatus !== 'semua' || filterTahun !== 'semua' || searchQuery) && (
            <button
              onClick={() => {
                setFilterSifat('semua');
                setFilterStatus('semua');
                setFilterTahun('semua');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:underline font-semibold"
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
                <th className="py-3 px-4">Pengirim & Instansi</th>
                <th className="py-3 px-4">Perihal & Ringkasan</th>
                <th className="py-3 px-3 text-center">Sifat & Jenis</th>
                <th className="py-3 px-3">Disposisi Ke</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-3 px-3 text-slate-400 font-mono">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{item.nomorSurat}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Tgl: {item.tanggalSurat}
                    </div>
                    <div className="text-[10px] text-blue-600 font-medium">
                      Diterima: {item.tanggalDiterima}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{item.instansi}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-slate-400" />
                      {item.pengirim}
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 line-clamp-1">{item.perihal}</div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {item.ringkasanIsi}
                    </p>
                    {item.lampiran && item.lampiran.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-indigo-600 font-medium">
                        <Paperclip className="w-3 h-3" />
                        {item.lampiran.length} Lampiran ({item.lampiran.map((l) => l.type).join(', ')})
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="space-y-1">
                      <div>{renderSifatBadge(item.sifatSurat)}</div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                        {item.jenisSurat}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[11px] font-semibold text-slate-800">
                      {item.tujuanDisposisi || 'Belum didisposisikan'}
                    </div>
                    {item.disposisiId ? (
                      <span className="inline-block text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded mt-0.5">
                        &bull; Lembar Disposisi Aktif
                      </span>
                    ) : (
                      <button
                        onClick={() => onCreateDisposisi(item)}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline mt-0.5 block"
                      >
                        + Buat Disposisi
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {renderStatusBadge(item.status)}
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value as StatusSuratMasuk)}
                      className="mt-1 block mx-auto text-[10px] border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-600"
                    >
                      <option value="Belum Diproses">Belum Diproses</option>
                      <option value="Diproses/Didisposisi">Didisposisi</option>
                      <option value="Menunggu Balasan">Menunggu Balasan</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onViewDetail(item)}
                        title="Lihat Detail Surat"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onCreateDisposisi(item)}
                        title="Disposisikan Surat"
                        className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        title="Edit Surat Masuk"
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        title="Hapus Surat Masuk"
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
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada surat masuk yang cocok.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba sesuaikan kata kunci pencarian atau reset filter.
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
