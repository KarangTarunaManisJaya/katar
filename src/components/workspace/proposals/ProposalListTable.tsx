import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit3,
  Printer,
  Trash2,
  Calendar,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Coins,
} from 'lucide-react';
import { ProposalItem } from '../../../types/proposal';

interface ProposalListTableProps {
  proposals: ProposalItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenDetail: (proposal: ProposalItem) => void;
  onOpenEdit: (proposal: ProposalItem) => void;
  onOpenPrint: (proposal: ProposalItem) => void;
  onDelete: (id: string, title: string) => void;
}

export const ProposalListTable: React.FC<ProposalListTableProps> = ({
  proposals,
  selectedCategory,
  onSelectCategory,
  onOpenDetail,
  onOpenEdit,
  onOpenPrint,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [yearFilter, setYearFilter] = useState('Semua Tahun');
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const currentYear = new Date().getFullYear();

  // Filtered and Sorted proposals
  const filteredList = useMemo(() => {
    const list = Array.isArray(proposals) ? proposals : [];
    return list
      .filter((p) => {
        // Category
        if (selectedCategory !== 'Semua' && p.kategori !== selectedCategory) return false;
        // Status
        if (statusFilter !== 'Semua Status' && p.status !== statusFilter) return false;
        // Year
        if (yearFilter !== 'Semua Tahun' && !p.tanggalProposal.startsWith(yearFilter)) return false;
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.judul.toLowerCase().includes(q);
          const matchNomor = p.nomorProposal.toLowerCase().includes(q);
          const matchPJ = p.penanggungJawab.toLowerCase().includes(q);
          const matchLoc = p.lokasiKegiatan.toLowerCase().includes(q);
          if (!matchTitle && !matchNomor && !matchPJ && !matchLoc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'asc'
            ? a.tanggalProposal.localeCompare(b.tanggalProposal)
            : b.tanggalProposal.localeCompare(a.tanggalProposal);
        }
        if (sortBy === 'budget') {
          return sortOrder === 'asc' ? a.totalAnggaran - b.totalAnggaran : b.totalAnggaran - a.totalAnggaran;
        }
        if (sortBy === 'title') {
          return sortOrder === 'asc' ? a.judul.localeCompare(b.judul) : b.judul.localeCompare(a.judul);
        }
        return 0;
      });
  }, [proposals, selectedCategory, statusFilter, yearFilter, searchQuery, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  const getStatusBadge = (status: ProposalItem['status']) => {
    switch (status) {
      case 'Disetujui':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Menunggu Persetujuan':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Revisi':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Ditolak':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Selesai/Terlaksana':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Draft':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari proposal berdasarkan judul, nomor surat, penanggung jawab, atau lokasi..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Revisi">Revisi</option>
            <option value="Ditolak">Ditolak</option>
            <option value="Selesai/Terlaksana">Selesai/Terlaksana</option>
          </select>

          {/* Year filter */}
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Semua Tahun">Semua Tahun</option>
            <option value={String(currentYear)}>Tahun {currentYear}</option>
            <option value={String(currentYear - 1)}>Tahun {currentYear - 1}</option>
          </select>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1"
            title="Ubah urutan"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{sortOrder === 'asc' ? 'A-Z / Lama' : 'Z-A / Baru'}</span>
          </button>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Nomor & Judul Proposal</th>
              <th className="py-3 px-3">Kategori & Jenis</th>
              <th className="py-3 px-3">Pelaksanaan</th>
              <th className="py-3 px-3">Nilai Anggaran (RAB)</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Tidak ada proposal yang sesuai dengan filter pencarian.
                </td>
              </tr>
            ) : (
              paginatedList.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                  {/* Title & Number */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {p.judul}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                      <span>{p.nomorProposal}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500 font-sans">
                        <User className="w-3 h-3 text-slate-400" />
                        {p.penanggungJawab}
                      </span>
                    </div>
                  </td>

                  {/* Category & Type */}
                  <td className="py-3.5 px-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {p.kategori}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">{p.jenis}</div>
                  </td>

                  {/* Date & Location */}
                  <td className="py-3.5 px-3">
                    <div className="text-slate-800 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {p.tanggalKegiatan}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-[170px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{p.lokasiKegiatan}</span>
                    </div>
                  </td>

                  {/* Budget */}
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-emerald-700 tabular-nums">
                      Rp {p.totalAnggaran.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Terkumpul: Rp {p.totalDanaTerkumpul.toLocaleString('id-ID')}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onOpenDetail(p)}
                        title="Lihat Detail Lengkap & Persetujuan"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenPrint(p)}
                        title="Cetak Dokumen Proposal (PDF/A4)"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenEdit(p)}
                        title="Edit Proposal"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(p.id, p.judul)}
                        title="Hapus Proposal"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
        <div>
          Menampilkan <span className="font-semibold text-slate-700">{paginatedList.length}</span> dari{' '}
          <span className="font-semibold text-slate-700">{filteredList.length}</span> proposal
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-semibold text-slate-700">
            Hal {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
