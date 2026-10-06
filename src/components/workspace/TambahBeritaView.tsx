import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  RotateCcw,
  Heading2,
  Heading3,
  Quote,
  Minus,
  MessageSquare,
  DollarSign,
  HeartHandshake,
  Trees,
  Trophy,
  Phone,
  Layers,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';
import { ActivityItem } from '../../data/workspaceData';
import { UserAccount } from '../../types/auth';
import { compressImage, compressMultipleImages } from '../../utils/imageOptimizer';
import { BERITA_TEMPLATES, BeritaTemplate } from './berita/TambahBeritaTemplates';
import { RundownSection, RundownItem, VipGuest } from './berita/RundownSection';
import { SeoMedsosPreview } from './berita/SeoMedsosPreview';
import { BeritaPreviewModal } from './berita/BeritaPreviewModal';

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
  const todayISO = new Date().toISOString().split('T')[0];

  // --- CARD 1: Informasi Utama ---
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [type, setType] = useState<'Kegiatan' | 'Berita' | 'Pengumuman' | 'Dokumentasi' | 'Liputan Khusus' | 'Artikel Pemuda'>('Kegiatan');
  const [category, setCategory] = useState('Sosial');
  const [division, setDivision] = useState('Seksi Usaha Kesejahteraan Sosial');
  const [targetScope, setTargetScope] = useState('Seluruh Warga & Pemuda Kelurahan Manis Jaya');
  const [priority, setPriority] = useState<'Rutin' | 'Penting' | 'Mendesak'>('Rutin');
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [location, setLocation] = useState('Aula Kelurahan Manis Jaya');
  const [mapsUrl, setMapsUrl] = useState('');
  const [organizer, setOrganizer] = useState('Karang Taruna Manis Jaya, RW 05');
  const [estimatedBudget, setEstimatedBudget] = useState('Rp 5.000.000');
  const [fundingSource, setFundingSource] = useState('Kas Karang Taruna & Donatur');
  const [registrationStatus, setRegistrationStatus] = useState<'Terbuka Umum' | 'Khusus Pengurus' | 'Perlu Registrasi' | 'Undangan Khusus'>('Terbuka Umum');
  const [registrationUrl, setRegistrationUrl] = useState('');

  // --- CARD 2: Isi Berita & Narasi Rilis Pers ---
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [objective, setObjective] = useState('');
  const [result, setResult] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [quotePerson, setQuotePerson] = useState('');
  const [quoteRole, setQuoteRole] = useState('');

  // --- CARD 3: Susunan Acara & Rundown Interaktif ---
  const [rundown, setRundown] = useState<RundownItem[]>([
    { id: 'rd-1', time: '08:00 - 08:30', activity: 'Registrasi Peserta & Pembagian Konsumsi', pic: 'Sie Kesekretariatan' },
    { id: 'rd-2', time: '08:30 - 09:15', activity: 'Pembukaan, Sambutan Lurah & Ketua Karang Taruna', pic: 'MC Acara' },
    { id: 'rd-3', time: '09:15 - 11:30', activity: 'Pelaksanaan Kegiatan Inti & Dokumentasi', pic: 'Sie Lapangan' },
  ]);
  const [vipGuests, setVipGuests] = useState<VipGuest[]>([
    { id: 'vip-1', name: 'Drs. Suhanda', title: 'Lurah Manis Jaya', status: 'Hadir' },
    { id: 'vip-2', name: 'Sertu M. Rohim', title: 'Babinsa Kelurahan Manis Jaya', status: 'Hadir' },
  ]);

  // --- CARD 4: Dokumentasi, Media & Berkas ---
  const [coverPhoto, setCoverPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1000&auto=format&fit=crop'
  );
  const [coverCaption, setCoverCaption] = useState('Suasana pelaksanaan kegiatan Karang Taruna di Kelurahan Manis Jaya.');
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop',
  ]);
  const [videoUrl, setVideoUrl] = useState('');
  const [documentFiles, setDocumentFiles] = useState<Array<{ name: string; size?: string }>>([
    { name: 'Proposal_Kegiatan_Resmi.pdf', size: '1.8 MB' },
  ]);
  const [driveUrl, setDriveUrl] = useState('');

  // --- CARD 5: Peserta, Narahubung & Kemitraan ---
  const [participantCount, setParticipantCount] = useState('120 Orang');
  const [participantsInvolved, setParticipantsInvolved] = useState(
    'Pemuda Karang Taruna, Pengurus RT/RW, Warga RW 01 - RW 08'
  );
  const [partners, setPartners] = useState(
    'Kelurahan Manis Jaya, Babinsa, Bhabinkamtibmas, Forum RW, Puskesmas'
  );
  const [contactName, setContactName] = useState('Ahmad Fauzi (Ketua Panitia)');
  const [contactPhone, setContactPhone] = useState('0812-9876-5432');
  const [contactEmail, setContactEmail] = useState('sekretariat.ktmanisjaya@gmail.com');

  // --- CARD 6: Publikasi Portal ---
  const [status, setStatus] = useState<'Draft' | 'Publikasikan Sekarang' | 'Menunggu Review'>('Publikasikan Sekarang');
  const [author, setAuthor] = useState(currentUser?.name || 'Administrator');
  const [publishDate, setPublishDate] = useState(todayISO);
  const [slug, setSlug] = useState('kegiatan-karang-taruna-manis-jaya');
  const [isFeatured, setIsFeatured] = useState(true);
  const [showOnHome, setShowOnHome] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [broadcastNotification, setBroadcastNotification] = useState(false);

  // --- CARD 7: SEO & Media Sosial ---
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState('karang-taruna, manis-jaya, pemuda-peduli, kegiatan-sosial');
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [socialCaption, setSocialCaption] = useState('');
  const [socialUrl, setSocialUrl] = useState('https://instagram.com/karangtarunamanisjaya');

  // Modals & State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdItem, setCreatedItem] = useState<ActivityItem | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Refs for hidden inputs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick Preset Stock Photos
  const stockPhotoPresets = [
    { label: 'Bakti Sosial', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop' },
    { label: 'Kerja Bakti', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?q=80&w=800&auto=format&fit=crop' },
    { label: 'Turnamen Futsal', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop' },
    { label: 'Rapat Organisasi', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop' },
    { label: 'Santunan / Warga', url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop' },
  ];

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

  // Form Completeness Percentage
  const completenessScore = useMemo(() => {
    let score = 0;
    if (title.trim()) score += 20;
    if (summary.trim()) score += 15;
    if (content.trim()) score += 20;
    if (coverPhoto) score += 15;
    if (location.trim()) score += 10;
    if (rundown.length > 0) score += 10;
    if (contactPhone.trim()) score += 10;
    return Math.min(100, score);
  }, [title, summary, content, coverPhoto, location, rundown, contactPhone]);

  // Apply Quick Template
  const applyTemplate = (tpl: BeritaTemplate) => {
    setTitle(tpl.data.title);
    setSubtitle(tpl.data.subtitle);
    setType(tpl.data.type);
    setCategory(tpl.data.category);
    setDivision(tpl.data.division);
    setTargetScope(tpl.data.targetScope);
    setPriority(tpl.data.priority);
    setRegistrationStatus(tpl.data.registrationStatus);
    setTime(tpl.data.time);
    setEndTime(tpl.data.endTime);
    setLocation(tpl.data.location);
    setOrganizer(tpl.data.organizer);
    setEstimatedBudget(tpl.data.estimatedBudget);
    setFundingSource(tpl.data.fundingSource);
    setSummary(tpl.data.summary);
    setContent(tpl.data.content);
    setObjective(tpl.data.objective);
    setResult(tpl.data.result);
    setCoverPhoto(tpl.data.coverPhoto);
    setCoverCaption(tpl.data.coverCaption);
    setQuoteText(tpl.data.keyQuote.quote);
    setQuotePerson(tpl.data.keyQuote.person);
    setQuoteRole(tpl.data.keyQuote.role);
    setParticipantCount(tpl.data.participantCount);
    setParticipantsInvolved(tpl.data.participantsInvolved);
    setPartners(tpl.data.partners);
    setContactName(tpl.data.contactPerson.name);
    setContactPhone(tpl.data.contactPerson.phone);
    setContactEmail(tpl.data.contactPerson.email);
    setTags(tpl.data.tags);
    setMetaDescription(tpl.data.metaDescription);
    setSocialCaption(tpl.data.socialCaption);
    setRundown(tpl.data.rundown);

    const generatedSlug = tpl.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);

    onToast(`Template "${tpl.label}" berhasil dimuat! Silakan sesuaikan detailnya.`);
  };

  // Local Storage Auto-Save Simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title.trim()) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setLastSavedTime(timeStr);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, summary, content, location]);

  // Rich Text Editor Toolbar Helpers
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

  const insert5W1HParagraph = () => {
    const templateParagraph = `\n\nKegiatan ini diikuti oleh ${participantCount || 'seluruh perwakilan pemuda'} di bawah komando Karang Taruna Kelurahan Manis Jaya. Acara diawali dengan sambutan dari para pembina wilayah, kemudian dilanjutkan dengan aksi inti di lapangan guna memperkuat sinergi warga dan pemuda.`;
    setContent((prev) => prev + templateParagraph);
    onToast('Paragraf 5W+1H disisipkan ke isi berita!');
  };

  // Upload Handlers
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onToast('Mengoptimalkan foto cover...');
      const optimized = await compressImage(file, 1200, 0.8);
      if (optimized) {
        setCoverPhoto(optimized);
        onToast('Foto cover berhasil diunggah!');
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onToast(`Mengoptimalkan ${files.length} foto dokumentasi...`);
      const optimized = await compressMultipleImages(files, 1000, 0.75);
      const valid = optimized.filter((p) => Boolean(p));
      if (valid.length > 0) {
        setGalleryPhotos((prev) => [...prev, ...valid]);
        onToast(`${valid.length} foto berhasil ditambahkan ke galeri!`);
      }
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
      setDocumentFiles((prev) => [...prev, { name: file.name, size: sizeStr }]);
      onToast(`Dokumen "${file.name}" berhasil dilampirkan.`);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const optimized = await compressImage(file, 600, 0.75);
      if (optimized) {
        setThumbnailImage(optimized);
        onToast('Thumbnail media sosial berhasil diunggah!');
      }
    }
  };

  // Reset form with confirmation
  const handleResetForm = () => {
    if (window.confirm('Kosongkan semua isian formulir berita?')) {
      setTitle('');
      setSubtitle('');
      setSummary('');
      setContent('');
      setObjective('');
      setResult('');
      setQuoteText('');
      setRundown([]);
      setDocumentFiles([]);
      onToast('Formulir berhasil dikosongkan.');
    }
  };

  // Submit / Publish Logic
  const handlePublish = (asDraft: boolean = false) => {
    if (!title.trim()) {
      onToast('Peringatan: Judul Berita / Kegiatan wajib diisi!');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    if (!summary.trim() && !asDraft) {
      onToast('Peringatan: Ringkasan singkat berita wajib diisi!');
      return;
    }

    const newItem: ActivityItem = {
      id: `act-${Date.now()}`,
      badge: type === 'Dokumentasi' ? 'Dokumentasi' : type === 'Pengumuman' ? 'Pengumuman' : 'Kegiatan',
      badgeColor: category === 'Sosial' ? 'green' : category === 'Olahraga' ? 'orange' : 'dark',
      title: title.trim(),
      subtitle: subtitle.trim(),
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
      // Extended fields
      type,
      category,
      time,
      endTime,
      organizer,
      division,
      targetScope,
      priority,
      registrationStatus,
      registrationUrl,
      estimatedBudget,
      fundingSource,
      summary,
      content,
      objective,
      result,
      keyQuote: quoteText ? { quote: quoteText, person: quotePerson || 'Tokoh Wilayah', role: quoteRole || 'Karang Taruna' } : undefined,
      rundown,
      vipGuests,
      participantCount,
      participantsInvolved,
      partners,
      contactPerson: contactName ? { name: contactName, phone: contactPhone, email: contactEmail } : undefined,
      coverCaption,
      videoUrl,
      attachments: documentFiles.map((d, i) => ({ id: `att-${i}`, name: d.name, size: d.size })),
      driveUrl,
      status: asDraft ? 'Draft' : status,
      publishDate,
      slug,
      isFeatured,
      showOnHome,
      allowComments,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      metaDescription,
      socialCaption,
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
    <div className="space-y-6 pb-24 animate-fadeIn text-slate-800">
      {/* Hidden File Inputs */}
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
      <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={handleDocumentUpload} />
      <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tambah Berita & Kegiatan Baru
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Portal Publikasi & Liputan Resmi Karang Taruna Kelurahan Manis Jaya
            </p>
          </div>
        </div>

        {/* Breadcrumb right */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium self-start sm:self-auto">
          <button onClick={() => onNavigateToTab('beranda')} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={() => onNavigateToTab('berita')} className="hover:text-blue-600 transition-colors">
            Berita & Kegiatan
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-blue-600 font-bold">Tambah Baru</span>
        </div>
      </div>

      {/* 1-Click Fast Template Presets Banner */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 p-4 rounded-2xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Pilihan Template Berita Siap Pakai (1-Klik)</h3>
            <p className="text-[11px] text-slate-500">Pilih salah satu tema untuk mengisi seluruh field form secara otomatis:</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {BERITA_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="px-3 py-1.5 bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 hover:border-blue-600 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 group"
            >
              <span>{tpl.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={handleResetForm}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Kosongkan Formulir"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Form Completeness Progress Bar & Auto-Save Indicator */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1">
          <span className="font-bold text-slate-800 text-xs shrink-0">Kelengkapan Data:</span>
          <div className="w-full max-w-xs h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                completenessScore >= 80 ? 'bg-emerald-500' : completenessScore >= 50 ? 'bg-blue-600' : 'bg-amber-500'
              }`}
              style={{ width: `${completenessScore}%` }}
            />
          </div>
          <span className="font-black text-slate-900 text-xs font-mono">{completenessScore}%</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              completenessScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {completenessScore >= 80 ? 'Siap Diterbitkan' : 'Perlu Dilengkapi'}
          </span>
        </div>

        {lastSavedTime && (
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Draft tersimpan otomatis {lastSavedTime} WIB</span>
          </div>
        )}
      </div>

      {/* Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Cards 1, 3, 4, 6 (7 cols on lg) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* ----------------------------------------------------------------------- */}
          {/* CARD 1: Informasi Utama & Klasifikasi */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                  1
                </span>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Informasi Utama & Klasifikasi</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">* Wajib diisi</span>
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
                  placeholder="Contoh: Aksi Bersih Lingkungan dan Penanaman 100 Bibit Pohon RW 04"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Sub-Judul / Tagline Berita */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Sub-Judul / Catchy Tagline <span className="text-slate-400 text-[10px] font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Contoh: Membangun Kesadaran Ekologis Pemuda Menuju Manis Jaya Bebas Banjir"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Jenis & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jenis Publikasi</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Kegiatan">Kegiatan Lapangan</option>
                    <option value="Berita">Berita & Rilis Pers</option>
                    <option value="Pengumuman">Pengumuman Resmi</option>
                    <option value="Dokumentasi">Dokumentasi Foto / Arsip</option>
                    <option value="Liputan Khusus">Liputan Khusus</option>
                    <option value="Artikel Pemuda">Artikel & Opini Pemuda</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kategori Program</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Sosial">Sosial & Kesejahteraan</option>
                    <option value="Keagamaan">Keagamaan & Mental</option>
                    <option value="Olahraga">Olahraga & Rekreasi</option>
                    <option value="Lingkungan">Lingkungan Hidup & Kebersihan</option>
                    <option value="Pendidikan">Pendidikan & Pelatihan</option>
                    <option value="Kesenian & Budaya">Kesenian & Budaya</option>
                    <option value="Kewirausahaan">Kewirausahaan / UMKM</option>
                  </select>
                </div>
              </div>

              {/* Bidang Seksi Karang Taruna & Target Lingkup Wilayah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Seksi / Bidang Kerja KT</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Seksi Usaha Kesejahteraan Sosial">Seksi Usaha Kesejahteraan Sosial</option>
                    <option value="Seksi Pendidikan & Pelatihan">Seksi Pendidikan & Pelatihan</option>
                    <option value="Seksi Olahraga & Rekreasi">Seksi Olahraga & Rekreasi</option>
                    <option value="Seksi Kerohanian & Mental">Seksi Kerohanian & Mental</option>
                    <option value="Seksi Lingkungan Hidup & Kebersihan">Seksi Lingkungan Hidup & Kebersihan</option>
                    <option value="Seksi Humas & Publikasi">Seksi Humas & Publikasi</option>
                    <option value="Seksi Kesenian & Budaya">Seksi Kesenian & Budaya</option>
                    <option value="Seksi Kelompok Usaha Bersama (KUBE)">Seksi Usaha / KUBE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Lingkup Wilayah / Sasaran</label>
                  <input
                    type="text"
                    value={targetScope}
                    onChange={(e) => setTargetScope(e.target.value)}
                    placeholder="Contoh: RW 01 - RW 08 Kelurahan Manis Jaya"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Tanggal, Jam Mulai, Jam Selesai & Prioritas */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="block font-bold text-slate-800 mb-1">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-800 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-800 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Urgensi</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Rutin">Rutin</option>
                    <option value="Penting">Penting</option>
                    <option value="Mendesak">Mendesak</option>
                  </select>
                </div>
              </div>

              {/* Lokasi & Link Google Maps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Lokasi / Tempat Pelaksanaan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Contoh: Aula Kelurahan Manis Jaya / Lapangan RW 05"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Tautan Google Maps Lokasi <span className="text-slate-400 text-[10px] font-normal">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={mapsUrl}
                      onChange={(e) => setMapsUrl(e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Penyelenggara, Estimasi Anggaran & Sumber Dana */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="block font-bold text-slate-800 mb-1">Penyelenggara / Penanggung Jawab</label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="Karang Taruna Manis Jaya, RW 05"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-800 mb-1">Estimasi Anggaran</label>
                  <input
                    type="text"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    placeholder="Rp 5.000.000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-bold text-slate-800 mb-1">Sumber Pendanaan</label>
                  <input
                    type="text"
                    value={fundingSource}
                    onChange={(e) => setFundingSource(e.target.value)}
                    placeholder="Kas KT, Donatur, Sponsor"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 3: Susunan Acara & Rundown Kegiatan Interaktif */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                  3
                </span>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Susunan Acara, Tamu VIP & Jadwal</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Bisa ditambah / diedit</span>
            </div>

            <RundownSection
              rundown={rundown}
              onChangeRundown={setRundown}
              vipGuests={vipGuests}
              onChangeVipGuests={setVipGuests}
            />
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 4: Dokumentasi, Media & Berkas Pendukung */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                  4
                </span>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Dokumentasi, Foto & Lampiran Berkas</h2>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Foto Cover Utama */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    Foto Utama / Cover Berita <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Pilih cepat atau upload lokal</span>
                </div>

                {/* Preset Fast Picker */}
                <div className="flex items-center gap-1.5 flex-wrap pb-1">
                  <span className="text-[10px] font-bold text-slate-500">Preset Foto:</span>
                  {stockPhotoPresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverPhoto(p.url)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-md text-[10px] font-semibold transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-start gap-3">
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className="flex-1 p-3.5 border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
                  >
                    <ImageIcon className="w-6 h-6 text-blue-600 mb-1 group-hover:scale-105 transition-transform" />
                    <span className="text-[11px] font-bold text-blue-700">Klik untuk upload foto cover baru</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">JPG / PNG / WEBP (Otomatis Dioptimalkan)</span>
                  </div>

                  {coverPhoto && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200 shrink-0 shadow-xs">
                      <img src={coverPhoto} alt="Cover preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverPhoto('')}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm"
                        title="Hapus foto cover"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Caption Foto Cover */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Keterangan / Caption Foto Cover</label>
                  <input
                    type="text"
                    value={coverCaption}
                    onChange={(e) => setCoverCaption(e.target.value)}
                    placeholder="Contoh: Penyerahan santunan secara simbolis oleh pengurus Karang Taruna."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Galeri Multi Foto */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    Galeri Foto Dokumentasi Tambahan ({galleryPhotos.length} Foto)
                  </label>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Upload Foto Sekaligus</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {galleryPhotos.map((photo, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 group shadow-2xs">
                      <img src={photo} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <button
                        type="button"
                        onClick={() => setGalleryPhotos(galleryPhotos.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}

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

              {/* Video Dokumentasi & Lampiran Berkas Multi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Video YouTube Liputan</label>
                  <div className="relative">
                    <Video className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tautan Google Drive Dokumentasi</label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Berkas Lampiran Multi Files */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    Lampiran Berkas Resmi (Proposal, LPJ, Undangan, Absensi)
                  </label>
                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Upload File</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {documentFiles.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{doc.name}</span>
                        {doc.size && <span className="text-[10px] text-slate-400">({doc.size})</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocumentFiles(documentFiles.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Cards 2, 5, 6, 7 & Action Buttons (5 cols on lg) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* ----------------------------------------------------------------------- */}
          {/* CARD 2: Isi Berita & Narasi Rilis Pers */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                  2
                </span>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Isi Berita & Narasi Liputan</h2>
              </div>
              <button
                type="button"
                onClick={insert5W1HParagraph}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md"
              >
                + Template 5W+1H
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Ringkasan Lead */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Ringkasan Singkat / Lead Berita <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={350}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Tuliskan intisari kegiatan dalam 2-3 kalimat (5W+1H)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none leading-relaxed"
                />
                <div className="text-right text-[10px] text-slate-400 font-mono mt-0.5">
                  {summary.length}/350 karakter
                </div>
              </div>

              {/* Rich Text Toolbar & Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-800">
                    Isi Berita Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    ⏱️ ~{Math.max(1, Math.ceil((content.length || 100) / 750))} menit baca
                  </span>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-0.5 p-1 bg-slate-100 border border-slate-200 rounded-t-xl border-b-0 text-slate-700 flex-wrap">
                  <button type="button" onClick={() => insertTextFormatting('**', '**')} className="p-1.5 hover:bg-white rounded" title="Bold">
                    <Bold className="w-3.5 h-3.5 font-black" />
                  </button>
                  <button type="button" onClick={() => insertTextFormatting('*', '*')} className="p-1.5 hover:bg-white rounded" title="Italic">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => insertTextFormatting('<u>', '</u>')} className="p-1.5 hover:bg-white rounded" title="Underline">
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-4 bg-slate-300 mx-0.5" />
                  <button type="button" onClick={() => insertTextFormatting('\n## ')} className="p-1.5 hover:bg-white rounded text-[10px] font-black" title="Heading 2">
                    H2
                  </button>
                  <button type="button" onClick={() => insertTextFormatting('\n### ')} className="p-1.5 hover:bg-white rounded text-[10px] font-black" title="Heading 3">
                    H3
                  </button>
                  <button type="button" onClick={() => insertTextFormatting('\n> "')} className="p-1.5 hover:bg-white rounded" title="Kutipan">
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-4 bg-slate-300 mx-0.5" />
                  <button type="button" onClick={() => insertTextFormatting('\n• ')} className="p-1.5 hover:bg-white rounded" title="Bullet List">
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => insertTextFormatting('\n1. ')} className="p-1.5 hover:bg-white rounded" title="Numbered List">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => insertTextFormatting('[Tautan](', ')')} className="p-1.5 hover:bg-white rounded" title="Link">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  ref={contentTextareaRef}
                  rows={8}
                  maxLength={5000}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan kronologi dan rincian kegiatan secara lengkap..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-b-xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-sans leading-relaxed"
                />
                <div className="text-right text-[10px] text-slate-400 font-mono mt-0.5">
                  {content.length}/5000 karakter
                </div>
              </div>

              {/* Kutipan Resmi Tokoh (Press Quote) */}
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px] font-bold text-indigo-900">Pernyataan Resmi Tokoh (Quotes)</span>
                </div>
                <textarea
                  rows={2}
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder='Contoh: "Pemuda harus menjadi motor penggerak kebaikan di lingkungan..."'
                  className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 resize-none italic"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={quotePerson}
                    onChange={(e) => setQuotePerson(e.target.value)}
                    placeholder="Nama Tokoh (Ahmad Fauzi)"
                    className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs text-slate-800"
                  />
                  <input
                    type="text"
                    value={quoteRole}
                    onChange={(e) => setQuoteRole(e.target.value)}
                    placeholder="Jabatan (Ketua Karang Taruna)"
                    className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Tujuan & Hasil Kegiatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tujuan Kegiatan</label>
                  <textarea
                    rows={2}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Tujuan diselenggarakannya kegiatan..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Hasil & Evaluasi</label>
                  <textarea
                    rows={2}
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    placeholder="Capaian nyata atau hasil evaluasi..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 5: Peserta, Narahubung & Kemitraan */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                5
              </span>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Peserta, Narahubung & Kemitraan</h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jumlah Peserta</label>
                  <input
                    type="text"
                    value={participantCount}
                    onChange={(e) => setParticipantCount(e.target.value)}
                    placeholder="Contoh: 120 Orang"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Status Pendaftaran</label>
                  <select
                    value={registrationStatus}
                    onChange={(e: any) => setRegistrationStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Terbuka Umum">Terbuka untuk Umum</option>
                    <option value="Khusus Pengurus">Khusus Pengurus Karang Taruna</option>
                    <option value="Perlu Registrasi">Perlu Pendaftaran (Google Form)</option>
                    <option value="Undangan Khusus">Undangan Tertutup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Peserta / Komponen yang Terlibat</label>
                <input
                  type="text"
                  value={participantsInvolved}
                  onChange={(e) => setParticipantsInvolved(e.target.value)}
                  placeholder="Pemuda Karang Taruna, RT/RW, Warga..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Instansi / Mitra / Sponsor yang Terlibat</label>
                <textarea
                  rows={2}
                  value={partners}
                  onChange={(e) => setPartners(e.target.value)}
                  placeholder="Kelurahan Manis Jaya, Babinsa, Puskesmas, Sponsor..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              {/* Narahubung WhatsApp Contact Person */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
                <span className="text-[11px] font-bold text-emerald-900 block">Narahubung / Contact Person Resmi</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nama Narahubung"
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="No. WhatsApp (0812...)"
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 6: Publikasi Portal & Pengaturan Tayang */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                6
              </span>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Publikasi Portal & Penjadwalan</h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Status Publikasi</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Publikasikan Sekarang">Publikasikan Sekarang</option>
                    <option value="Draft">Simpan Sebagai Draft</option>
                    <option value="Menunggu Review">Menunggu Review Pembina</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Penulis / Redaktur</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nama penulis"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">URL Slug Berita</label>
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="kegiatan-karang-taruna-manis-jaya"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">Berita Unggulan (Pinned)</span>
                    <span className="text-[10px] text-slate-400">Tampilkan di banner utama portal</span>
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
                    <span className="font-bold text-slate-900 block leading-tight">Tampilkan di Beranda</span>
                    <span className="text-[10px] text-slate-400">Tampilkan pada halaman utama workspace</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">Izinkan Tanggapan / Komentar Warga</span>
                    <span className="text-[10px] text-slate-400">Warga dapat memberikan apresiasi dan tanggapan</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 7: SEO, SERP Preview & WhatsApp Broadcast */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                7
              </span>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">SEO & Generator Siaran Medsos</h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Meta Description (Untuk Mesin Pencari)</label>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Ringkasan 1-2 kalimat untuk hasil pencarian Google..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Kata Kunci / Tagar</label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="sosial, pemuda, kerja-bakti, manis-jaya"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Live SERP Preview & WhatsApp Broadcast Generator Component */}
              <SeoMedsosPreview
                title={title}
                slug={slug}
                metaDescription={metaDescription || summary}
                date={date}
                category={category}
                location={location}
                author={author}
                onToast={onToast}
              />
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* BOTTOM ACTION BUTTONS: Simpan Draft, Preview, Terbitkan */}
          {/* ----------------------------------------------------------------------- */}
          <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => handlePublish(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Bookmark className="w-4 h-4 text-slate-500" />
              <span>Simpan Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Live Preview</span>
            </button>

            <button
              type="button"
              onClick={() => handlePublish(false)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Terbitkan Berita</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PREVIEW LIVE PORTAL BERITA (Lengkap & Responsif) */}
      {/* ========================================================================= */}
      <BeritaPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onPublish={() => handlePublish(false)}
        data={{
          title,
          subtitle,
          type,
          category,
          division,
          targetScope,
          priority,
          date,
          time,
          endTime,
          location,
          organizer,
          summary,
          content,
          objective,
          result,
          coverPhoto,
          coverCaption,
          galleryPhotos,
          videoUrl,
          documentFiles,
          driveUrl,
          participantCount,
          participantsInvolved,
          partners,
          author,
          keyQuote: quoteText ? { quote: quoteText, person: quotePerson, role: quoteRole } : undefined,
          rundown,
          vipGuests,
          contactPerson: contactName ? { name: contactName, phone: contactPhone, email: contactEmail } : undefined,
          tags,
          slug,
          estimatedBudget,
        }}
      />

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
              <p>• Kategori: <strong>{category}</strong> ({type})</p>
              <p>• Wilayah: <strong>{location}</strong></p>
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
                  setTitle('');
                  setSubtitle('');
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
