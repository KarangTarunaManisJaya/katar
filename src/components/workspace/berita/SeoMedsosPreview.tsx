import React, { useState } from 'react';
import { Globe, MessageSquare, Copy, Check, Share2, Sparkles, ExternalLink } from 'lucide-react';

interface SeoMedsosPreviewProps {
  title: string;
  slug: string;
  metaDescription: string;
  date: string;
  category: string;
  location: string;
  author: string;
  onToast: (msg: string) => void;
}

export const SeoMedsosPreview: React.FC<SeoMedsosPreviewProps> = ({
  title,
  slug,
  metaDescription,
  date,
  category,
  location,
  author,
  onToast,
}) => {
  const [copiedWA, setCopiedWA] = useState(false);

  const cleanTitle = title.trim() || 'Judul Berita Karang Taruna Kelurahan Manis Jaya';
  const cleanSlug = slug.trim() || 'kegiatan-karang-taruna-manis-jaya';
  const cleanSnippet =
    metaDescription.trim() ||
    'Dokumentasi resmi dan rilis pers kegiatan Karang Taruna Kelurahan Manis Jaya. Baca informasi selengkapnya di portal resmi kepemudaan.';

  const displayDate = new Date(date || new Date()).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const generateWhatsAppMessage = () => {
    return `📢 *WARTA RESMI KARANG TARUNA MANIS JAYA* 📢
-----------------------------------------------
*${cleanTitle.toUpperCase()}*

📅 *Tanggal:* ${displayDate}
📍 *Lokasi:* ${location || 'Kelurahan Manis Jaya'}
🏷️ *Kategori:* ${category}
👤 *Penanggung Jawab:* ${author}

📝 *Ringkasan Singkat:*
"${cleanSnippet}"

🔗 *Baca Berita Lengkap & Galeri Foto:*
https://karangtaruna-manisjaya.id/berita/${cleanSlug}

-----------------------------------------------
_Mari dukung pemuda bergerak dan berkarya untuk Kelurahan Manis Jaya yang lebih maju!_ 🇮🇩✨`;
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard?.writeText(text);
    setCopiedWA(true);
    onToast('Pesan siaran WhatsApp berhasil disalin!');
    setTimeout(() => setCopiedWA(false), 2500);
  };

  return (
    <div className="space-y-4 pt-3 border-t border-slate-100">
      {/* 1. Google Search SERP Snippet Preview */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-bold text-slate-700">
              Pratinjau Hasil Pencarian Google (SERP Preview)
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            Live SEO Simulator
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs font-sans space-y-1 text-left">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold">
              KT
            </div>
            <div className="flex items-center gap-1 text-[11px] truncate text-slate-600">
              <span>https://karangtaruna-manisjaya.id</span>
              <span className="text-slate-400">›</span>
              <span className="text-slate-500 font-medium truncate">berita</span>
              <span className="text-slate-400">›</span>
              <span className="text-slate-500 truncate">{cleanSlug}</span>
            </div>
          </div>
          <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-1">
            {cleanTitle} - Karang Taruna Kelurahan Manis Jaya
          </h4>
          <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
            <span className="text-slate-500 text-[11px]">{displayDate} — </span>
            {cleanSnippet}
          </p>
        </div>
      </div>

      {/* 2. One-click WhatsApp Broadcast Generator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-bold text-slate-700">
              Format Pesan Siaran WhatsApp Siap Kirim (Grup RT/RW)
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs"
          >
            {copiedWA ? (
              <>
                <Check className="w-3 h-3 text-white" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-white" />
                <span>Salin Pesan WA</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 font-mono text-[11px] text-emerald-950 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
          {generateWhatsAppMessage()}
        </div>
      </div>
    </div>
  );
};
