import React, { useState, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Image as ImageIcon,
  Share2,
  Trash2,
  Printer,
  ExternalLink,
  MessageCircle,
  FileText,
  DollarSign,
  Users,
  Award,
  Download,
  Sparkles,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  Eye,
  Check,
} from 'lucide-react';
import { ActivityItem } from '../../data/workspaceData';
import { downloadElementAsPdf, printElementDirectly } from '../../utils/pdfExport';

interface ActivityDetailModalProps {
  activity: ActivityItem | null;
  onClose: () => void;
  onToast: (msg: string) => void;
  onDelete?: (id: string) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  onToast,
  onDelete,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  if (!activity) return null;

  const currentMainPhoto = selectedImage || activity.image || (activity.photos && activity.photos[0]) || '';
  const allPhotos = activity.photos && activity.photos.length > 0
    ? activity.photos
    : activity.image
    ? [activity.image]
    : [];

  const handleShare = () => {
    const text = `Warta Resmi Karang Taruna Kelurahan Manis Jaya:
"${activity.title}"
🗓 ${activity.date}${activity.time ? ` · ${activity.time} WIB` : ''}
📍 ${activity.location}
Penanggung Jawab: ${activity.author}

${activity.subtitle ? `${activity.subtitle}\n\n` : ''}${activity.description}`;
    navigator.clipboard?.writeText(text);
    onToast('Rangkuman warta dan rilis pers berhasil disalin ke clipboard!');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*DOKUMENTASI KEGIATAN KARANG TARUNA MANIS JAYA*\n\n*${activity.title}*\n🗓 Tanggal: ${activity.date}${activity.time ? ` (${activity.time} WIB)` : ''}\n📍 Lokasi: ${activity.location}\n👤 Penanggung Jawab: ${activity.author}\n\n${activity.description}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    if (printableRef.current) {
      printElementDirectly(printableRef.current);
      onToast('Membuka dialog cetak dokumen warta resmi...');
    } else {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    setIsExportingPdf(true);
    onToast('Menyusun lembar PDF dokumen dokumentasi berita...');

    const cleanTitle = activity.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const filename = `Warta_${cleanTitle}_${activity.date.replace(/\s+/g, '_')}.pdf`;

    const success = await downloadElementAsPdf(printableRef.current, filename, (status) => {
      onToast(status);
    });

    setIsExportingPdf(false);
    if (success) {
      onToast(`Dokumen PDF "${filename}" berhasil diunduh!`);
    } else {
      onToast('Gagal membuat PDF. Coba gunakan tombol Cetak.');
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Yakin ingin menghapus berita / kegiatan "${activity.title}"?`)) {
      onDelete?.(activity.id);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] text-slate-800">
          {/* Top Sticky Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
            <div className="space-y-1.5 max-w-[80%]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {activity.category || activity.badge}
                </span>
                {activity.priority && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activity.priority === 'Mendesak'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : activity.priority === 'Penting'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {activity.priority}
                  </span>
                )}
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {activity.date}
                </span>
                {activity.time && (
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {activity.time} WIB
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                {activity.title}
              </h3>

              {activity.subtitle && (
                <p className="text-xs sm:text-sm font-medium text-slate-500 italic">
                  {activity.subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                title="Unduh Berkas PDF Resmi"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                title="Cetak Lembar Warta / PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                title="Salin Rangkuman Berita"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Hapus Berita"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
            {/* Main Visual Display */}
            {currentMainPhoto ? (
              <div className="space-y-2">
                <div
                  onClick={() => setLightboxOpen(true)}
                  className="rounded-2xl overflow-hidden border border-slate-200 aspect-[16/9] bg-slate-100 shadow-inner relative group cursor-pointer"
                  title="Klik untuk memperbesar foto dokumentasi"
                >
                  <img
                    src={currentMainPhoto}
                    alt={activity.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Perbesar Foto
                    </span>
                  </div>
                </div>

                {/* Gallery thumbnails selector */}
                {allPhotos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {allPhotos.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(photo)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          currentMainPhoto === photo
                            ? 'border-blue-600 shadow-md scale-95'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`Thumb ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 aspect-[16/7] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  Dokumentasi Berita & Agenda Resmi
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Rapat koordinasi dan liputan internal Karang Taruna Kelurahan Manis Jaya.
                </p>
              </div>
            )}

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              {/* Lokasi */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Lokasi Pelaksanaan
                </span>
                <div className="flex items-start gap-1.5 text-slate-800 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{activity.location}</span>
                </div>
                {activity.mapsUrl && (
                  <a
                    href={activity.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-bold pt-0.5"
                  >
                    <span>Lihat Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Penanggung Jawab */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Penanggung Jawab / PIC
                </span>
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{activity.author}</span>
                </div>
                {activity.targetSasaran && (
                  <p className="text-[11px] text-slate-500">
                    Sasaran: <strong>{activity.targetSasaran}</strong>
                  </p>
                )}
              </div>

              {/* Anggaran & Peserta */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Partisipasi & Anggaran
                </span>
                {activity.budget ? (
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Rp {activity.budget.toLocaleString('id-ID')}</span>
                  </div>
                ) : null}
                {activity.estimatedAttendees ? (
                  <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Estimasi: {activity.estimatedAttendees} Orang</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Tags */}
            {activity.tags && activity.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Kata Kunci:
                </span>
                {activity.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Detailed Narrative Description */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Narasi & Liputan Lengkap Berita
              </span>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                {activity.content || activity.description}
              </div>
            </div>

            {/* Key Quote / Pernyataan Pers */}
            {activity.keyQuote?.quote && (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50/70 rounded-2xl border border-blue-200/80 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl text-blue-500 font-serif leading-none">“</span>
                  <div className="space-y-2 flex-1">
                    <p className="italic text-slate-800 leading-relaxed font-medium">
                      {activity.keyQuote.quote}
                    </p>
                    <p className="font-extrabold text-slate-900 text-xs">
                      {activity.keyQuote.person}{' '}
                      <span className="font-semibold text-blue-600">
                        — {activity.keyQuote.role}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Susunan Acara (Rundown) */}
            {activity.rundown && activity.rundown.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Susunan Acara / Rundown Pelaksanaan
                </span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-2xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Waktu</th>
                        <th className="py-2.5 px-3">Agenda Kegiatan</th>
                        <th className="py-2.5 px-3">Penanggung Jawab (PIC)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activity.rundown.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-600 text-[11px]">
                            {item.time}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 font-medium">
                            {item.activity}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {item.pic}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIP Guests & Sponsor (if available) */}
            {((activity.vipGuests && activity.vipGuests.length > 0) || (activity.sponsors && activity.sponsors.length > 0)) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {activity.vipGuests && activity.vipGuests.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Tamu Kehormatan & Pejabat Hadir:
                    </span>
                    <ul className="space-y-1">
                      {activity.vipGuests.map((g, i) => (
                        <li key={i} className="text-slate-800 font-semibold flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{g.name} <span className="font-normal text-slate-500">({g.role || g.title || ''})</span></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activity.sponsors && activity.sponsors.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Sponsor & Mitra Kolaborasi:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activity.sponsors.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold text-[11px]">
                          {s.name} ({s.tier})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Person */}
            {activity.contactPerson?.name && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Narahubung & Konfirmasi Informasi:
                  </span>
                  <span className="font-bold text-emerald-950 text-sm block">
                    {activity.contactPerson.name}
                  </span>
                  <span className="text-emerald-700 font-mono text-xs">
                    {activity.contactPerson.phone}
                  </span>
                </div>
                <a
                  href={`https://wa.me/${activity.contactPerson.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(activity.contactPerson.name)},%20saya%20ingin%20bertanya%20mengenai%20kegiatan%20"${encodeURIComponent(activity.title)}"`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Hubungi via WhatsApp</span>
                </a>
              </div>
            )}
          </div>

          {/* Modal Bottom Bar */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
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
                    <span>Unduh PDF Resmi</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Cetak Lembar Warta</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kirim WhatsApp</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Fullscreen Preview for Documentation Photos */}
      {lightboxOpen && currentMainPhoto && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 text-white">
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
              {activity.title}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <img
            src={currentMainPhoto}
            alt={activity.title}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="text-slate-300 text-xs mt-3">
            Dokumentasi Resmi Karang Taruna Kelurahan Manis Jaya • {activity.date}
          </p>
        </div>
      )}

      {/* Hidden Official Printable Document with Letterhead (KOP SURAT RESMI) */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0">
        <div
          ref={printableRef}
          className="w-[794px] bg-white p-10 text-slate-900 font-sans leading-relaxed text-sm"
          style={{ width: '794px', minHeight: '1123px', backgroundColor: '#ffffff' }}
        >
          {/* Kop Surat Resmi */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-6">
            <div className="w-20 h-20 flex items-center justify-center border-2 border-slate-900 rounded-2xl font-black text-xl text-slate-900">
              KT
            </div>
            <div className="text-center flex-1 px-4">
              <h2 className="text-xs font-bold tracking-widest uppercase text-slate-600">
                PEMBERDAYAAN PEMUDA KELURAHAN
              </h2>
              <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                PENGURUS KARANG TARUNA KELURAHAN MANIS JAYA
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                KECAMATAN JATIUWUNG — KOTA TANGERANG — PROVINSI BANTEN
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Sekretariat: Jl. Manis Jaya Raya No. 01 | Telp/WA: 0812-9876-5432 | Email: info@karangtarunamanisjaya.id
              </p>
            </div>
            <div className="w-20 h-20 flex items-center justify-center border border-dashed border-slate-300 rounded-2xl text-[10px] text-slate-400 text-center font-bold">
              KOTA<br />TANGERANG
            </div>
          </div>

          <div className="border-b-4 border-double border-slate-900 mb-6" />

          {/* Judul & Nomor Berita */}
          <div className="text-center space-y-1 mb-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              DOKUMENTASI & RILIS WARTA RESMI
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2 uppercase">
              {activity.title}
            </h2>
            {activity.subtitle && (
              <p className="text-xs italic text-slate-600">{activity.subtitle}</p>
            )}
            <p className="text-[11px] text-slate-500 font-mono">
              Nomor Arsip: {activity.id.toUpperCase()}/KT-MJ/WARTA/{activity.date.replace(/\s+/g, '-')}
            </p>
          </div>

          {/* Metadata Pelaksanaan */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6">
            <div>
              <strong>Hari & Tanggal:</strong> {activity.date} {activity.time ? `(${activity.time} WIB)` : ''}
            </div>
            <div>
              <strong>Lokasi:</strong> {activity.location}
            </div>
            <div>
              <strong>Penanggung Jawab:</strong> {activity.author}
            </div>
            <div>
              <strong>Kategori:</strong> {activity.category || activity.badge}
            </div>
            {activity.targetSasaran && (
              <div>
                <strong>Sasaran:</strong> {activity.targetSasaran}
              </div>
            )}
            {activity.budget ? (
              <div>
                <strong>Anggaran:</strong> Rp {activity.budget.toLocaleString('id-ID')}
              </div>
            ) : null}
          </div>

          {/* Foto Dokumentasi */}
          {currentMainPhoto && (
            <div className="mb-6">
              <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Dokumentasi Lapangan:
              </div>
              <img
                src={currentMainPhoto}
                alt={activity.title}
                className="w-full h-64 object-cover rounded-xl border border-slate-300"
              />
            </div>
          )}

          {/* Narasi Liputan */}
          <div className="space-y-2 mb-6">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ulasan & Ringkasan Kegiatan:
            </div>
            <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line text-justify">
              {activity.content || activity.description}
            </div>
          </div>

          {/* Kutipan Pernyataan jika ada */}
          {activity.keyQuote?.quote && (
            <div className="p-3 bg-blue-50/60 border-l-4 border-blue-600 rounded-r-xl text-xs mb-6">
              <p className="italic text-slate-800">“{activity.keyQuote.quote}”</p>
              <p className="font-bold text-slate-900 mt-1">
                — {activity.keyQuote.person} ({activity.keyQuote.role})
              </p>
            </div>
          )}

          {/* Rundown Tabel jika ada */}
          {activity.rundown && activity.rundown.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Susunan Acara (Rundown):
              </div>
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-left">Waktu</th>
                    <th className="border border-slate-300 p-2 text-left">Kegiatan</th>
                    <th className="border border-slate-300 p-2 text-left">PIC</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.rundown.map((r, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 p-2 font-mono">{r.time}</td>
                      <td className="border border-slate-300 p-2">{r.activity}</td>
                      <td className="border border-slate-300 p-2">{r.pic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Kolom Tanda Tangan */}
          <div className="pt-8 mt-8 border-t border-slate-200 flex items-center justify-between text-xs text-center">
            <div className="space-y-12">
              <p>Mengetahui,<br /><strong>Ketua Karang Taruna</strong></p>
              <div>
                <p className="font-bold underline text-slate-900">ILKHAM FAUZI</p>
                <p className="text-[11px] text-slate-500">Kelurahan Manis Jaya</p>
              </div>
            </div>

            <div className="space-y-12">
              <p>Tangerang, {activity.date}<br /><strong>Sekretaris Pelaksana</strong></p>
              <div>
                <p className="font-bold underline text-slate-900">{activity.author}</p>
                <p className="text-[11px] text-slate-500">NIP/Reg: KT-MJ-{CURRENT_YEAR}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const CURRENT_YEAR = new Date().getFullYear();
