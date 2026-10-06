import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Share2,
  Bookmark,
  Send,
  MessageCircle,
  FileText,
  Video,
  Download,
  Phone,
  Printer,
  Sparkles,
  Award,
  ExternalLink,
  Laptop,
  Smartphone,
  Quote,
} from 'lucide-react';
import { RundownItem, VipGuest } from './RundownSection';

interface BeritaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  data: {
    title: string;
    subtitle?: string;
    type: string;
    category: string;
    division?: string;
    targetScope?: string;
    priority?: string;
    date: string;
    time: string;
    endTime?: string;
    location: string;
    organizer: string;
    summary: string;
    content: string;
    objective?: string;
    result?: string;
    coverPhoto?: string;
    coverCaption?: string;
    galleryPhotos: string[];
    videoUrl?: string;
    documentFiles: Array<{ name: string; size?: string }>;
    driveUrl?: string;
    participantCount?: string;
    participantsInvolved?: string;
    partners?: string;
    author: string;
    keyQuote?: { quote: string; person: string; role: string };
    rundown: RundownItem[];
    vipGuests: VipGuest[];
    contactPerson?: { name: string; phone: string; email?: string };
    tags: string;
    slug: string;
    estimatedBudget?: string;
  };
}

export const BeritaPreviewModal: React.FC<BeritaPreviewModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  data,
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const readingTime = Math.max(1, Math.ceil((data.content?.length || 100) / 750));

  // Extract YouTube ID if valid
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(data.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`bg-white rounded-3xl w-full border border-slate-200 shadow-2xl max-h-[92vh] flex flex-col transition-all duration-300 ${
          viewMode === 'mobile' ? 'max-w-md' : 'max-w-4xl'
        }`}
      >
        {/* Top Header Controls */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-30 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 hidden sm:inline">
              Pratinjau Live Portal Berita
            </span>
          </div>

          {/* Device switch buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-slate-600 text-xs">
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'desktop' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'mobile' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden sm:flex"
              title="Cetak Rilis Pers"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Kembali Edit
            </button>
            <button
              onClick={() => {
                onClose();
                onPublish();
              }}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
            >
              Terbitkan Sekarang
            </button>
          </div>
        </div>

        {/* Modal Scrollable Article Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6 text-slate-800">
          {/* Category & Type Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider">
              {data.category}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-full">
              {data.type}
            </span>
            {data.division && (
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-medium rounded-full">
                {data.division}
              </span>
            )}
            {data.priority === 'Penting' && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-full">
                PENTING
              </span>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {data.title || 'Judul Berita Kegiatan'}
            </h1>
            {data.subtitle && (
              <p className="text-xs sm:text-sm font-medium text-slate-600 leading-snug">
                {data.subtitle}
              </p>
            )}
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 border-y border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {new Date(data.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {data.time} {data.endTime ? `- ${data.endTime}` : ''} WIB
            </span>
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {data.location}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              {data.author}
            </span>
            <span className="text-[11px] text-slate-400">⏱️ {readingTime} menit baca</span>
          </div>

          {/* Cover Image & Caption */}
          {data.coverPhoto && (
            <div className="space-y-1.5">
              <div className="w-full h-56 sm:h-80 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={data.coverPhoto}
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {data.coverCaption && (
                <p className="text-[11px] text-slate-500 italic text-center">
                  Foto: {data.coverCaption}
                </p>
              )}
            </div>
          )}

          {/* Summary Lead Block */}
          {data.summary && (
            <div className="p-4 bg-blue-50/70 border-l-4 border-blue-600 rounded-r-xl text-xs sm:text-sm font-medium text-blue-950 leading-relaxed">
              {data.summary}
            </div>
          )}

          {/* Official Quote Box if present */}
          {data.keyQuote?.quote && (
            <div className="relative p-5 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-2xl border border-indigo-100">
              <Quote className="w-8 h-8 text-indigo-200 absolute top-3 right-3" />
              <p className="text-xs sm:text-sm italic font-serif text-slate-800 leading-relaxed mb-3">
                "{data.keyQuote.quote}"
              </p>
              <div className="text-xs">
                <strong className="text-slate-900 block">{data.keyQuote.person}</strong>
                <span className="text-slate-500 text-[11px]">{data.keyQuote.role}</span>
              </div>
            </div>
          )}

          {/* Full Narrative Content */}
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4 font-sans">
            {data.content || 'Isi artikel liputan berita kegiatan Karang Taruna Kelurahan Manis Jaya.'}
          </div>

          {/* Rundown Section Table */}
          {data.rundown && data.rundown.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Susunan Acara / Rundown Kegiatan</span>
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-2.5">Waktu</th>
                      <th className="p-2.5">Agenda Kegiatan</th>
                      <th className="p-2.5">Pengisi / PIC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.rundown.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-mono text-[11px] text-blue-600 font-semibold">{r.time}</td>
                        <td className="p-2.5 font-medium text-slate-800">{r.activity}</td>
                        <td className="p-2.5 text-slate-600 text-[11px]">{r.pic}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Objective & Result Highlights */}
          {(data.objective || data.result) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {data.objective && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Tujuan Kegiatan
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed">{data.objective}</p>
                </div>
              )}
              {data.result && (
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                    Hasil / Evaluasi
                  </span>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">{data.result}</p>
                </div>
              )}
            </div>
          )}

          {/* YouTube Video Player Embed */}
          {youtubeEmbedUrl && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-600" />
                <span>Video Dokumentasi Liputan</span>
              </h4>
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md">
                <iframe
                  src={youtubeEmbedUrl}
                  title="Video Dokumentasi"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* Gallery Photos */}
          {data.galleryPhotos.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Galeri Foto Lapangan ({data.galleryPhotos.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {data.galleryPhotos.map((photo, i) => (
                  <div key={i} className="h-28 sm:h-36 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                    <img src={photo} alt={`Dokumentasi ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Person Box */}
          {data.contactPerson?.name && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Narahubung & Konfirmasi Informasi
                </span>
                <h5 className="font-bold text-slate-900">{data.contactPerson.name}</h5>
                <p className="text-slate-500 text-[11px]">{data.contactPerson.phone} • {data.contactPerson.email || 'Sekretariat Karang Taruna'}</p>
              </div>
              <a
                href={`https://wa.me/${data.contactPerson.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Hubungi via WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
