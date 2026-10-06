import React from 'react';
import { X, Calendar, MapPin, User, Image, Share2, Check, Trash2 } from 'lucide-react';
import { ActivityItem } from '../../data/workspaceData';

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
  if (!activity) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `Dokumentasi ${activity.title} Karang Taruna Manis Jaya: ${activity.description}`
    );
    onToast('Tautan dan rincian kegiatan berhasil disalin!');
  };

  const handleDelete = () => {
    if (window.confirm(`Yakin ingin menghapus berita / kegiatan "${activity.title}"?`)) {
      onDelete?.(activity.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {activity.badge}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-medium">
                {activity.date}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
              {activity.title}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Bagikan"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                title="Hapus Berita / Kegiatan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Photo or Gallery */}
          {activity.image ? (
            <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-[16/9] bg-slate-100">
              <img
                src={activity.image}
                alt={activity.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 aspect-[16/9] bg-[#f2eefd] flex flex-col items-center justify-center p-6 text-center">
              <Image className="w-12 h-12 text-purple-300 mb-2" />
              <p className="text-xs font-semibold text-purple-700">
                Dokumentasi Kegiatan Bulanan
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                Foto rapat koordinasi dan notulensi tersimpan dalam arsip digital sekretariat.
              </p>
            </div>
          )}

          {/* Photo Gallery Thumbs if available */}
          {activity.photos && activity.photos.length > 1 && (
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Galeri Dokumentasi ({activity.photoCount} Foto)
              </span>
              <div className="grid grid-cols-3 gap-3">
                {activity.photos.map((p, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 aspect-video">
                    <img
                      src={p}
                      alt={`Dokumentasi ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta Info Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{activity.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Penanggung Jawab: {activity.author}</span>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
              Deskripsi & Laporan Pelaksanaan
            </span>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {activity.content || activity.description}
            </p>
          </div>

          {/* Key Quote if present */}
          {activity.keyQuote?.quote && (
            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
              <p className="italic text-slate-800 mb-2">"{activity.keyQuote.quote}"</p>
              <p className="font-bold text-slate-900">{activity.keyQuote.person} <span className="font-normal text-slate-500">({activity.keyQuote.role})</span></p>
            </div>
          )}

          {/* Rundown table if present */}
          {activity.rundown && activity.rundown.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Susunan Acara / Rundown
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 font-bold text-slate-700 text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-2">Waktu</th>
                      <th className="p-2">Agenda</th>
                      <th className="p-2">PIC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activity.rundown.map((r, i) => (
                      <tr key={i}>
                        <td className="p-2 text-blue-600 font-semibold font-mono text-[11px]">{r.time}</td>
                        <td className="p-2 text-slate-800">{r.activity}</td>
                        <td className="p-2 text-slate-500">{r.pic}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Contact Person if present */}
          {activity.contactPerson?.name && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-900 block">{activity.contactPerson.name}</span>
                <span className="text-emerald-700 text-[11px]">{activity.contactPerson.phone}</span>
              </div>
              <a
                href={`https://wa.me/${activity.contactPerson.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
