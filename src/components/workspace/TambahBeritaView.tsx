import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  Users,
  Paperclip,
  Link as LinkIcon,
  Tag,
  Eye,
  Send,
  Bookmark,
  CheckCircle2,
  X,
  Plus,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  Sparkles,
  Share2,
  ChevronRight,
  Home,
  AlertCircle,
  Video,
  FileCheck,
} from 'lucide-react';
import { ActivityItem } from '../../data/workspaceData';
import { UserAccount } from '../../types/auth';

interface TambahBeritaViewProps {
  currentUser?: UserAccount;
  onSaveActivity: (newAct: ActivityItem, isDraft?: boolean) => void;
  onNavigateToTab: (tab: any) => void;
  onToast: (msg: string) => void;
}

export const TambahBeritaView: React.FC<TambahBeritaViewProps> = ({
  currentUser,
  onSaveActivity,
  onNavigateToTab,
  onToast,
}) => {
  // --- Form States ---
  // Card 1: Informasi Utama
  const todayISO = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Kegiatan' | 'Berita' | 'Pengumuman' | 'Dokumentasi'>('Kegiatan');
  const [category, setCategory] = useState('Sosial');
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState('08:00');
  const [location, setLocation] = useState('Aula Kelurahan Manis Jaya');
  const [organizer, setOrganizer] = useState('Karang Taruna Manis Jaya, RW 05');

  // Card 2: Isi Berita
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [objective, setObjective] = useState('');
  const [result, setResult] = useState('');

  // Card 3: Dokumentasi
  const [coverPhoto, setCoverPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800&auto=format&fit=crop'
  );
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop',
  ]);
  const [videoUrl, setVideoUrl] = useState('');
  const [documentFile, setDocumentFile] = useState<string | null>(null);

  // Card 4: Peserta & Mitra
  const [participantCount, setParticipantCount] = useState('120 Orang');
  const [participantsInvolved, setParticipantsInvolved] = useState(
    'Pemuda, Karang Taruna, Warga RW 01 - RW 05'
  );
  const [partners, setPartners] = useState(
    'Kelurahan Manis Jaya, Babinsa, Bhabinkamtibmas, Forum RW'
  );

  // Card 5: Publikasi Portal
  const [status, setStatus] = useState<'Draft' | 'Publikasikan Sekarang' | 'Menunggu Review'>('Draft');
  const [author, setAuthor] = useState(currentUser?.name || 'Administrator');
  const [publishDate, setPublishDate] = useState(todayISO);
  const [slug, setSlug] = useState('bakti-sosial-dan-penghijauan-manis-jaya');
  const [isFeatured, setIsFeatured] = useState(true);
  const [showOnHome, setShowOnHome] = useState(true);

  // Card 6: SEO & Media Sosial
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState('sosial, pemuda, kerja-bakti, manis-jaya');
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [socialCaption, setSocialCaption] = useState('');
  const [socialUrl, setSocialUrl] = useState('https://instagram.com/karangtarunamanisjaya');

  // Preview & Success Modal States
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdItem, setCreatedItem] = useState<ActivityItem | null>(null);

  // Refs for hidden file pickers
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate slug when title changes
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (generated) {
      setSlug(generated);
    }
  };

  // Rich Text Editor Toolbar Formatting Helpers
  const insertTextFormatting = (startTag: string, endTag: string = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${startTag}${selected || 'teks'}${endTag}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, start + replacement.length - endTag.length);
    }, 50);
  };

  // Upload Handlers
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverPhoto(reader.result);
          onToast('Foto cover utama berhasil diunggah!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setGalleryPhotos((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
      onToast(`${files.length} foto ditambahkan ke galeri!`);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
      onToast(`Dokumen "${file.name}" berhasil dilampirkan.`);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setThumbnailImage(reader.result);
          onToast('Thumbnail media sosial berhasil diunggah!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit / Publish Logic
  const handlePublish = (asDraft: boolean = false) => {
    if (!title.trim()) {
      onToast('Peringatan: Judul Berita / Kegiatan wajib diisi!');
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    if (!summary.trim() && !asDraft) {
      onToast('Peringatan: Ringkasan singkat berita wajib diisi!');
      return;
    }

    const newItem: ActivityItem = {
      id: `act-${Date.now()}`,
      badge: type === 'Dokumentasi' ? 'Dokumentasi' : 'Kegiatan',
      badgeColor: category === 'Sosial' ? 'green' : category === 'Olahraga' ? 'orange' : 'dark',
      title: title.trim(),
      date: new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      photoCount: (coverPhoto ? 1 : 0) + galleryPhotos.length,
      image: coverPhoto,
      description: summary.trim() || content.trim().substring(0, 180) || 'Kegiatan Karang Taruna Manis Jaya',
      location: location.trim() || 'Kelurahan Manis Jaya',
      author: author.trim() || 'Administrator',
      photos: galleryPhotos.length > 0 ? galleryPhotos : coverPhoto ? [coverPhoto] : [],
    };

    onSaveActivity(newItem, asDraft);
    setCreatedItem(newItem);

    if (asDraft) {
      onToast(`Draft "${title}" berhasil disimpan!`);
    } else {
      setShowSuccessModal(true);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn text-slate-800">
      {/* Hidden File Inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleGalleryUpload}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        className="hidden"
        onChange={handleDocumentUpload}
      />
      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleThumbnailUpload}
      />

      {/* Top Breadcrumb & Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tambah Berita / Kegiatan Baru
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Dokumentasikan kegiatan Karang Taruna Manis Jaya ke portal
            </p>
          </div>
        </div>

        {/* Breadcrumb right */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium self-start sm:self-auto">
          <button
            onClick={() => onNavigateToTab('beranda')}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => onNavigateToTab('berita')}
            className="hover:text-blue-600 transition-colors"
          >
            Berita & Kegiatan
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-blue-600 font-bold">Tambah Baru</span>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Cards 1, 3, 4, 6 (7 cols on lg) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* ----------------------------------------------------------------------- */}
          {/* CARD 1: Informasi Utama */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                1
              </span>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Informasi Utama
              </h2>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Judul Berita / Kegiatan */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Judul Berita / Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Masukkan judul berita atau kegiatan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Jenis & Kategori (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Jenis <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Berita">Berita</option>
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Dokumentasi">Dokumentasi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Sosial">Sosial</option>
                    <option value="Keagamaan">Keagamaan</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Lingkungan">Lingkungan & Kebersihan</option>
                    <option value="Pendidikan">Pendidikan & Pelatihan</option>
                    <option value="Kesenian & Budaya">Kesenian & Budaya</option>
                    <option value="Kewirausahaan">Kewirausahaan / UMKM</option>
                  </select>
                </div>
              </div>

              {/* Tanggal, Waktu, Lokasi (3 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="block font-bold text-slate-800 mb-1">
                    Tanggal Kegiatan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-800 mb-1">Waktu</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-5">
                  <label className="block font-bold text-slate-800 mb-1">
                    Lokasi / Tempat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Masukkan lokasi / tempat"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Penyelenggara / Penanggung Jawab */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Penyelenggara / Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="Contoh: Karang Taruna Manis Jaya, RW 05"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 3: Dokumentasi */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                3
              </span>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Dokumentasi
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              {/* Foto Utama & Galeri Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Foto Utama / Cover */}
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Foto Utama / Cover <span className="text-rose-500">*</span>
                  </label>

                  <div className="flex items-center gap-2.5">
                    {/* Upload Dropzone */}
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className="flex-1 p-3.5 border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-blue-700">
                        Klik untuk upload foto utama
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        Format: JPG, PNG (Max 2MB)
                      </span>
                    </div>

                    {/* Preview Thumbnail with red X delete */}
                    {coverPhoto && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 shrink-0 group shadow-xs">
                        <img
                          src={coverPhoto}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCoverPhoto('')}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-sm transition-transform hover:scale-110"
                          title="Hapus foto cover"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Galeri Foto Kegiatan */}
                <div className="sm:col-span-7 space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Galeri Foto Kegiatan ({galleryPhotos.length})
                  </label>

                  <div className="flex items-center gap-2 flex-wrap">
                    {galleryPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 group shadow-2xs"
                      >
                        <img
                          src={photo}
                          alt={`Galeri ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryPhotos(galleryPhotos.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Hapus foto"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}

                    {/* + Tambah Foto Button */}
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-100 text-blue-600 flex flex-col items-center justify-center text-[10px] font-bold transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4 mb-0.5" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Kegiatan & Dokumen Pendukung */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Video Kegiatan (YouTube / Link)
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Dokumen Pendukung
                  </label>
                  <div
                    onClick={() => documentInputRef.current?.click()}
                    className="relative cursor-pointer flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-600 truncate flex-1 font-medium">
                      {documentFile || 'Pilih file... PDF, DOC, DOCX, XLS (Max 10MB)'}
                    </span>
                    {documentFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocumentFile(null);
                        }}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 4: Peserta & Mitra */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                4
              </span>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Peserta & Mitra
              </h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Jumlah Peserta
                  </label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={participantCount}
                      onChange={(e) => setParticipantCount(e.target.value)}
                      placeholder="Masukkan jumlah peserta"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Peserta yang Terlibat
                  </label>
                  <input
                    type="text"
                    value={participantsInvolved}
                    onChange={(e) => setParticipantsInvolved(e.target.value)}
                    placeholder="Contoh: Pemuda, Karang Taruna, Masyarakat..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Instansi / Mitra yang Terlibat
                </label>
                <textarea
                  rows={2}
                  value={partners}
                  onChange={(e) => setPartners(e.target.value)}
                  placeholder="Contoh: Pemerintah Desa, Dinas Sosial, Sponsor..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 6: SEO & Media Sosial (Opsional) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                6
              </span>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                SEO & Media Sosial <span className="text-slate-400 text-xs font-normal">(Opsional)</span>
              </h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Meta Description</label>
                  <input
                    type="text"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Masukkan meta description..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kata Kunci / Tag</label>
                  <div className="relative">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Contoh: sosial, pemuda, manis jaya"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Gambar Thumbnail */}
                <div className="sm:col-span-5">
                  <label className="block font-bold text-slate-800 mb-1">Gambar Thumbnail</label>
                  <div
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="p-3 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/40 rounded-xl cursor-pointer text-center flex flex-col items-center justify-center transition-all"
                  >
                    <Upload className="w-4 h-4 text-blue-600 mb-1" />
                    <span className="text-[11px] font-bold text-slate-700">
                      {thumbnailImage ? 'Ganti Thumbnail' : 'Upload Thumbnail'}
                    </span>
                    <span className="text-[9px] text-slate-400">Format: JPG, PNG (Max 2MB)</span>
                  </div>
                </div>

                {/* Teks Medsos & Link */}
                <div className="sm:col-span-7 space-y-2">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Teks untuk Facebook / Instagram
                    </label>
                    <input
                      type="text"
                      value={socialCaption}
                      onChange={(e) => setSocialCaption(e.target.value)}
                      placeholder="Tulis caption untuk media sosial..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Link Media Sosial</label>
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={socialUrl}
                        onChange={(e) => setSocialUrl(e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Cards 2, 5 & Action Buttons (5 cols on lg) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* ----------------------------------------------------------------------- */}
          {/* CARD 2: Isi Berita */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Isi Berita
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              {/* Ringkasan / Summary */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Ringkasan / Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Masukkan ringkasan singkat kegiatan..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
                <div className="text-right text-[10px] text-slate-400 font-mono mt-0.5">
                  {summary.length}/300
                </div>
              </div>

              {/* Isi Berita / Deskripsi Lengkap with Working Rich Text Toolbar */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Isi Berita / Deskripsi Lengkap <span className="text-rose-500">*</span>
                </label>

                {/* Toolbar */}
                <div className="flex items-center gap-1 p-1.5 bg-slate-100 border border-slate-200 rounded-t-xl border-b-0 text-slate-700">
                  <button
                    type="button"
                    onClick={() => insertTextFormatting('**', '**')}
                    className="p-1.5 hover:bg-white hover:text-blue-600 rounded transition-colors"
                    title="Bold (**teks**)"
                  >
                    <Bold className="w-3.5 h-3.5 font-black" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextFormatting('*', '*')}
                    className="p-1.5 hover:bg-white hover:text-blue-600 rounded transition-colors"
                    title="Italic (*teks*)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextFormatting('<u>', '</u>')}
                    className="p-1.5 hover:bg-white hover:text-blue-600 rounded transition-colors"
                    title="Underline (<u>teks</u>)"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-4 bg-slate-300 mx-0.5" />

                  <button
                    type="button"
                    onClick={() => insertTextFormatting('[Tautan](', ')')}
                    className="p-1.5 hover:bg-white hover:text-blue-600 rounded transition-colors"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextFormatting('\n• ')}
                    className="p-1.5 hover:bg-white hover:text-blue-600 rounded transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextFormatting('\n1. ')}
                    className="p-1.5 hover:bg-white hover:text-blue-600 rounded transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-4 bg-slate-300 mx-0.5" />

                  <button
                    type="button"
                    onClick={() => insertTextFormatting('\n<p align="left">', '</p>')}
                    className="p-1.5 hover:bg-white hover:text-blue-600 rounded transition-colors"
                    title="Align Left"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextFormatting('\n<p align="center">', '</p>')}
                    className="p-1.5 hover:bg-white hover:text-blue-600 rounded transition-colors"
                    title="Align Center"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="p-1.5 hover:bg-white hover:text-blue-600 rounded transition-colors"
                    title="Sisipkan Gambar"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  ref={contentTextareaRef}
                  rows={8}
                  maxLength={4000}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis isi berita atau deskripsi kegiatan secara lengkap..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-b-xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-sans leading-relaxed"
                />
                <div className="text-right text-[10px] text-slate-400 font-mono mt-0.5">
                  {content.length}/4000
                </div>
              </div>

              {/* Tujuan Kegiatan & Hasil / Keterangan Kegiatan (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Tujuan Kegiatan
                  </label>
                  <textarea
                    rows={3}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Masukkan tujuan kegiatan..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Hasil / Keterangan Kegiatan
                  </label>
                  <textarea
                    rows={3}
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    placeholder="Masukkan hasil atau keterangan..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 5: Publikasi Portal */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                5
              </span>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Publikasi Portal
              </h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Publikasikan Sekarang">Publikasikan Sekarang</option>
                    <option value="Menunggu Review">Menunggu Review</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Penulis</label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Masukkan nama penulis"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Tanggal Publikasi
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Slug / URL Berita
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="contoh: kegiatan-bakti-sosial-manis-jaya"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">
                      Berita Unggulan
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Tampilkan di bagian utama portal
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showOnHome}
                    onChange={(e) => setShowOnHome(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">
                      Tampilkan di Beranda
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Tampilkan pada halaman beranda
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* BOTTOM ACTION BUTTONS: Simpan Draft, Preview, Terbitkan */}
          {/* ----------------------------------------------------------------------- */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            {/* Simpan Draft */}
            <button
              type="button"
              onClick={() => handlePublish(true)}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Bookmark className="w-4 h-4 text-slate-500" />
              <span>Simpan Draft</span>
            </button>

            {/* Preview */}
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>

            {/* Terbitkan */}
            <button
              type="button"
              onClick={() => handlePublish(false)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Terbitkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PREVIEW LIVE PORTAL BERITA */}
      {/* ========================================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pratinjau Live Portal: {title || 'Tanpa Judul'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Kembali Edit
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    handlePublish(false);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Terbitkan Sekarang
                </button>
              </div>
            </div>

            {/* Preview Body */}
            <div className="p-6 space-y-5">
              {/* Cover Image */}
              {coverPhoto && (
                <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-md relative">
                  <img
                    src={coverPhoto}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-md">
                      {category}
                    </span>
                    <span className="px-3 py-1 bg-black/60 text-white text-xs font-semibold rounded-full backdrop-blur-xs">
                      {type}
                    </span>
                  </div>
                </div>
              )}

              {/* Title & Metadata */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {title || 'Judul Berita Kegiatan Belum Diisi'}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {new Date(date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {time} WIB
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {location}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Penulis: {author}
                  </span>
                </div>
              </div>

              {/* Summary Lead */}
              {summary && (
                <div className="p-4 bg-blue-50/70 border-l-4 border-blue-600 rounded-r-xl text-xs sm:text-sm font-semibold text-blue-950 leading-relaxed">
                  {summary}
                </div>
              )}

              {/* Content Description */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
                {content ||
                  'Deskripsi lengkap berita atau rilis liputan kegiatan Karang Taruna Kelurahan Manis Jaya.'}
              </div>

              {/* Key Highlights: Objective & Result */}
              {(objective || result) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                  {objective && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Tujuan Kegiatan
                      </span>
                      <p className="text-xs text-slate-800">{objective}</p>
                    </div>
                  )}
                  {result && (
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                        Hasil yang Dicapai
                      </span>
                      <p className="text-xs text-emerald-950 font-medium">{result}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Gallery Photos */}
              {galleryPhotos.length > 0 && (
                <div className="space-y-2 pt-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Dokumentasi Foto Lapangan ({galleryPhotos.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {galleryPhotos.map((p, i) => (
                      <div key={i} className="h-28 rounded-xl overflow-hidden shadow-xs border">
                        <img src={p} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUCCESS PUBLISH CELEBRATION */}
      {/* ========================================================================= */}
      {showSuccessModal && createdItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider">
                Berhasil Diterbitkan
              </span>
              <h3 className="text-xl font-black text-slate-900 pt-2">
                Berita & Kegiatan Telah Mengudara!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dokumentasi "<strong>{createdItem.title}</strong>" kini telah tayang secara resmi pada portal berita Karang Taruna Kelurahan Manis Jaya.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1">
              <p>• Kategori: <strong>{category}</strong></p>
              <p>• Lokasi: <strong>{location}</strong></p>
              <p>• URL Berita: <code className="text-blue-600 font-mono">/berita/{slug}</code></p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigateToTab('berita');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
              >
                Lihat di Portal Berita
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  // Reset form for next post
                  setTitle('');
                  setSummary('');
                  setContent('');
                  setObjective('');
                  setResult('');
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
              >
                + Buat Berita Baru Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
