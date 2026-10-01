import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  Folder,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Search,
  ChevronDown,
  Calendar,
  X,
  Plus,
  ArrowUpRight,
  Printer,
  Download,
  Share2,
} from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';
import { BrandLogo } from './BrandLogo';

export interface DocumentLetter {
  id: string;
  no: number;
  title: string;
  subtitle: string;
  category: 'Undangan' | 'Pemberitahuan' | 'Permohonan' | 'Keputusan';
  autoNumber: string;
  status: 'Draft' | 'Proses' | 'Selesai';
  createdDate: string;
  iconBgColor: 'blue' | 'purple' | 'green' | 'violet';
  recipient?: string;
  content?: string;
}

const formatDateId = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const getDynamicInitialDocs = (): DocumentLetter[] => {
  const now = new Date();
  const d1 = new Date(now);
  d1.setDate(now.getDate() - 2);
  const d2 = new Date(now);
  d2.setDate(now.getDate() - 5);
  const d3 = new Date(now);
  d3.setDate(now.getDate() - 8);
  const d4 = new Date(now);
  d4.setDate(now.getDate() - 12);

  const ym = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}`;

  return [
    {
      id: 'doc-1',
      no: 1,
      title: 'Undangan anggota',
      subtitle: 'Undangan rapat organisasi',
      category: 'Undangan',
      autoNumber: `UND/${ym}/MJ/54444`,
      status: 'Draft',
      createdDate: formatDateId(d1),
      iconBgColor: 'blue',
      recipient: 'Seluruh Anggota Karang Taruna Manis Jaya',
      content: 'Mengharap kehadiran rekan-rekan pengurus dalam rangka Rapat Koordinasi Evaluasi Program Kerja Triwulan di Balai Pertemuan Pemuda.',
    },
    {
      id: 'doc-2',
      no: 2,
      title: 'Undangan anggota',
      subtitle: 'Undangan rapat organisasi',
      category: 'Undangan',
      autoNumber: `UND/${ym}/MJ/97893`,
      status: 'Draft',
      createdDate: formatDateId(d2),
      iconBgColor: 'purple',
      recipient: 'Koordinator Seksi RW 01 s/d RW 08',
      content: 'Undangan temu wicara pemuda terkait persiapan peringatan Sumpah Pemuda tingkat Kelurahan Manis Jaya.',
    },
    {
      id: 'doc-3',
      no: 3,
      title: 'Undangan rapat anggota',
      subtitle: 'Rapat koordinasi kegiatan',
      category: 'Undangan',
      autoNumber: `UND/${ym}/MJ/21579`,
      status: 'Proses',
      createdDate: formatDateId(d3),
      iconBgColor: 'green',
      recipient: 'Pengurus Harian & Pembina Kelurahan',
      content: 'Penyampaian draf anggaran kegiatan Bakti Sosial dan verifikasi usulan kemitraan UMKM desa.',
    },
    {
      id: 'doc-4',
      no: 4,
      title: 'Surat pemberitahuan',
      subtitle: 'Pemberitahuan kegiatan',
      category: 'Pemberitahuan',
      autoNumber: `SPT/${ym}/MJ/98288`,
      status: 'Selesai',
      createdDate: formatDateId(d4),
      iconBgColor: 'violet',
      recipient: 'Ketua RW 01 - RW 08 & Tokoh Masyarakat',
      content: 'Pemberitahuan pelaksanaan gotong royong pembersihan drainase dan penghijauan lingkungan serentak.',
    },
  ];
};

interface SuratMenyuratViewProps {
  onToast: (msg: string) => void;
}

export const SuratMenyuratView: React.FC<SuratMenyuratViewProps> = ({ onToast }) => {
  const [documents, setDocuments] = useState<DocumentLetter[]>(() => {
    try {
      const saved = localStorage.getItem('kt_surat_items_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getDynamicInitialDocs();
  });

  useEffect(() => {
    localStorage.setItem('kt_surat_items_v2', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    const handleRemoteRefresh = () => {
      try {
        const saved = localStorage.getItem('kt_surat_items_v2');
        if (saved) setDocuments(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('kt_database_restored', handleRemoteRefresh);
    return () => {
      window.removeEventListener('kt_database_restored', handleRemoteRefresh);
    };
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua kategori');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DocumentLetter | null>(null);
  const [editingDoc, setEditingDoc] = useState<DocumentLetter | null>(null);

  // Form states for creating new letter
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState<DocumentLetter['category']>('Undangan');
  const [formRecipient, setFormRecipient] = useState('');
  const [formContent, setFormContent] = useState('');

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'Semua kategori' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.autoNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const now = new Date();
    const prefix = formCategory === 'Undangan' ? 'UND' : formCategory === 'Pemberitahuan' ? 'SPT' : 'SRT';
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const dateCode = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const generatedNumber = `${prefix}/${dateCode}/MJ/${randNum}`;

    const newDoc: DocumentLetter = {
      id: `doc-${Date.now()}`,
      no: documents.length + 1,
      title: formTitle,
      subtitle: formSubtitle || 'Dokumen administrasi organisasi',
      category: formCategory,
      autoNumber: generatedNumber,
      status: 'Draft',
      createdDate: formatDateId(now),
      iconBgColor: 'blue',
      recipient: formRecipient || 'Pihak Terkait',
      content: formContent || 'Surat resmi Karang Taruna Manis Jaya.',
    };

    setDocuments([newDoc, ...documents]);
    onToast(`Surat "${formTitle}" dengan nomor ${generatedNumber} berhasil diterbitkan!`);
    setIsCreateModalOpen(false);

    // Reset form
    setFormTitle('');
    setFormSubtitle('');
    setFormRecipient('');
    setFormContent('');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus surat "${name}"?`)) {
      setDocuments(documents.filter((d) => d.id !== id));
      onToast(`Dokumen surat "${name}" berhasil dihapus.`);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setDocuments(documents.map((d) => (d.id === editingDoc.id ? editingDoc : d)));
    onToast(`Perubahan pada dokumen "${editingDoc.title}" berhasil disimpan.`);
    setEditingDoc(null);
  };

  const getStatusBadge = (status: DocumentLetter['status']) => {
    switch (status) {
      case 'Draft':
        return (
          <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
            Draft
          </span>
        );
      case 'Proses':
        return (
          <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
            Proses
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
            Selesai
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: DocumentLetter['category']) => {
    switch (cat) {
      case 'Undangan':
        return (
          <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
            Undangan
          </span>
        );
      case 'Pemberitahuan':
        return (
          <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            Pemberitahuan
          </span>
        );
      default:
        return (
          <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {cat}
          </span>
        );
    }
  };

  const getDocIcon = (color: DocumentLetter['iconBgColor']) => {
    switch (color) {
      case 'blue':
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        );
      case 'purple':
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        );
      case 'green':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        );
      case 'violet':
        return (
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. TOP BANNER - Matches the screenshot */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#eef6ff] via-[#e6f1fe] to-[#f4f8fe] border border-blue-100/90 shadow-sm p-6 sm:p-8 lg:p-10">
        {/* Right 3D Envelope & Docs Illustration */}
        <div className="absolute top-0 right-0 w-2/5 h-full hidden md:block pointer-events-none opacity-95">
          <div className="absolute inset-0 bg-gradient-to-r from-[#eef6ff] via-[#e6f1fe]/70 to-transparent z-10" />
          <img
            src="/src/assets/images/envelope_docs_banner_1790589806825.jpg"
            alt="Surat Menyurat Illustration"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-2xl">
          {/* Kicker with Envelope icon */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
              SURAT MENYURAT
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Surat Menyurat
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
            Administrasi tertib, komunikasi lebih mudah.
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed max-w-xl">
            Kelola seluruh surat keluar dan masuk organisasi Karang Taruna Manis Jaya dengan cepat dan efisien.
          </p>
        </div>

        {/* Top-Right CTA Button: Buat Surat */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-30">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all transform active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Buat Surat</span>
          </button>
        </div>
      </div>

      {/* 2. STAT CARDS ROW (4 Cards) - Matches the screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Dokumen */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600 block">
                Total Dokumen
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5 leading-none">
                4
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                surat tercatat
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>↑</span> +12%
            </span>
          </div>
        </div>

        {/* Card 2: Menunggu Tinjauan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-400 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600 block">
                Menunggu Tinjauan
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5 leading-none">
                3
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                perlu perhatian
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
              <span>↑</span> +2%
            </span>
          </div>
        </div>

        {/* Card 3: Selesai & Arsip */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-400 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600 block">
                Selesai & Arsip
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5 leading-none">
                11
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                terkirim rapi
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>↑</span> +18%
            </span>
          </div>
        </div>

        {/* Card 4: Total Kategori */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600 block">
                Total Kategori
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5 leading-none">
                4
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                jenis surat
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400">
              0%
            </span>
          </div>
        </div>
      </div>

      {/* 3. DOKUMEN SURAT TABLE SECTION - Matches the screenshot */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        {/* Table Top Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Dokumen Surat
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar seluruh surat yang telah dibuat dan dikelola organisasi.
              </p>
            </div>
          </div>

          {/* Right Filters & Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Folder className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedCategory}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-fadeIn text-xs">
                  {['Semua kategori', 'Undangan', 'Pemberitahuan', 'Permohonan', 'Keputusan'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 ${
                        selectedCategory === cat ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama dokumen..."
                className="pl-3.5 pr-8 py-1.5 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50/50">
              <tr>
                <th className="py-3.5 px-5 w-12 text-center">No</th>
                <th className="py-3.5 px-5">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700">
                    <span>Nama Dokumen</span>
                    <span className="text-[10px]">⇅</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-5">Nomor Otomatis</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5">Dibuat</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc, index) => (
                <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* No */}
                  <td className="py-4 px-5 text-center font-bold text-slate-700">
                    {index + 1}
                  </td>

                  {/* Nama Dokumen with Icon */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {getDocIcon(doc.iconBgColor)}
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                          {doc.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {doc.subtitle}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Kategori Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getCategoryBadge(doc.category)}
                  </td>

                  {/* Nomor Otomatis */}
                  <td className="py-4 px-5 font-mono text-xs text-slate-600 whitespace-nowrap">
                    {doc.autoNumber}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getStatusBadge(doc.status)}
                  </td>

                  {/* Dibuat */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.createdDate}</span>
                    </div>
                  </td>

                  {/* Aksi Buttons */}
                  <td className="py-4 px-5 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {/* Lihat */}
                      <button
                        onClick={() => setViewingDoc(doc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-blue-600 text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat</span>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => setEditingDoc(doc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-amber-600 text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Hapus */}
                      <button
                        onClick={() => handleDelete(doc.id, doc.title)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 hover:border-rose-300 bg-white text-rose-600 hover:bg-rose-50 text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>

                      {/* More */}
                      <button
                        onClick={() => onToast(`Menu opsi tambahan untuk ${doc.autoNumber}`)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                        title="Opsi Lanjutan"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Pagination & Item Count */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan 1 - {filteredDocs.length} dari {documents.length} data
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled
              className="w-7 h-7 rounded-lg border border-slate-200 text-slate-300 flex items-center justify-center cursor-not-allowed"
            >
              &lt;
            </button>
            <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center">
              1
            </button>
            <button
              disabled
              className="w-7 h-7 rounded-lg border border-slate-200 text-slate-300 flex items-center justify-center cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: BUAT SURAT BARU */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Penerbitan Surat Resmi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nomor surat otomatis akan dibuat oleh sistem administrasi.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Dokumen / Perihal Surat *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Undangan Rapat Kerja Pemuda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Surat
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DocumentLetter['category'])}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Undangan">Undangan</option>
                    <option value="Pemberitahuan">Pemberitahuan</option>
                    <option value="Permohonan">Permohonan</option>
                    <option value="Keputusan">Keputusan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Keterangan Singkat
                  </label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="Contoh: Undangan rapat koordinasi"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tujuan / Penerima Surat
                </label>
                <input
                  type="text"
                  value={formRecipient}
                  onChange={(e) => setFormRecipient(e.target.value)}
                  placeholder="Contoh: Lurah Manis Jaya / Seluruh Anggota RW 01 - 08"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Isi Pokok / Pesan Surat
                </label>
                <textarea
                  rows={3}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Tuliskan uraian surat dinas..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors"
                >
                  Terbitkan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIHAT SURAT (PREVIEW RESMI DENGAN KOP SURAT) */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
            {/* Header Modal */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {viewingDoc.autoNumber}
                </span>
                {getStatusBadge(viewingDoc.status)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.print();
                    onToast('Membuka pratinjau cetak dokumen...');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Surat Resmi Paper Layout */}
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-slate-800">
              {/* Kop Surat with chosen Logo & Kop Surat Logo */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                  <BrandLogo size="lg" />
                </div>
                <div className="text-center flex-1 space-y-1">
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                    KARANG TARUNA MANIS JAYA
                  </h2>
                  <h3 className="text-xs font-bold text-slate-700 uppercase">
                    KELURAHAN MANIS JAYA, KECAMATAN JATIUWUNG, KOTA TANGERANG
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Sekretariat: Jl. Pajajaran No. 12, Manis Jaya, Tangerang 15136 | Email: karangtarunamanisjaya@gmail.com
                  </p>
                </div>
                <div className="w-16 h-16 shrink-0 hidden sm:block opacity-0" />
              </div>

              {/* Header Surat */}
              <div className="flex justify-between items-start pt-2">
                <div className="space-y-1">
                  <div>
                    <span className="w-20 inline-block text-slate-500">Nomor</span>: <span className="font-mono font-bold text-slate-900">{viewingDoc.autoNumber}</span>
                  </div>
                  <div>
                    <span className="w-20 inline-block text-slate-500">Lampiran</span>: -
                  </div>
                  <div>
                    <span className="w-20 inline-block text-slate-500">Perihal</span>: <span className="font-bold">{viewingDoc.title}</span>
                  </div>
                </div>

                <div className="text-right text-slate-600">
                  Tangerang, {viewingDoc.createdDate}
                </div>
              </div>

              {/* Penerima */}
              <div className="pt-2">
                <p className="text-slate-500">Kepada Yth:</p>
                <p className="font-bold text-slate-900 mt-0.5">{viewingDoc.recipient || 'Seluruh Anggota'}</p>
                <p className="text-slate-500">di Tempat</p>
              </div>

              {/* Isi Surat */}
              <div className="pt-3 space-y-3 leading-relaxed text-slate-700">
                <p>Dengan hormat,</p>
                <p>
                  Sehubungan dengan program kerja Karang Taruna Manis Jaya dalam memelihara ketertiban administrasi dan kelancaran kegiatan, bersama ini kami sampaikan:
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800">
                  {viewingDoc.content || viewingDoc.subtitle}
                </div>
                <p>
                  Demikian surat ini kami sampaikan. Atas perhatian dan kerjasama yang baik, kami ucapkan terima kasih.
                </p>
              </div>

              {/* Tanda Tangan */}
              <div className="pt-6 flex justify-end">
                <div className="text-center w-52 space-y-12">
                  <div>
                    <p className="font-bold">Pengurus Karang Taruna</p>
                    <p className="text-[11px] text-slate-500">Kelurahan Manis Jaya</p>
                  </div>
                  <div>
                    <p className="font-bold underline text-slate-900">Iik Andriyana</p>
                    <p className="text-[10px] text-slate-500">Ketua / Administrator</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DOKUMEN */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Edit Dokumen Surat</h3>
              <button onClick={() => setEditingDoc(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Dokumen</label>
                <input
                  type="text"
                  value={editingDoc.title}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Keterangan Subtitle</label>
                <input
                  type="text"
                  value={editingDoc.subtitle}
                  onChange={(e) => setEditingDoc({ ...editingDoc, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Status Dokumen</label>
                <select
                  value={editingDoc.status}
                  onChange={(e) =>
                    setEditingDoc({
                      ...editingDoc,
                      status: e.target.value as DocumentLetter['status'],
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="Draft">Draft</option>
                  <option value="Proses">Proses</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-semibold"
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
