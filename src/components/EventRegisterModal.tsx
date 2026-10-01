import React, { useState } from 'react';
import { X, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import { AgendaEvent } from '../types';

interface EventRegisterModalProps {
  event: AgendaEvent | null;
  onClose: () => void;
  onSuccess: (eventId: string, applicantName: string) => void;
}

export const EventRegisterModal: React.FC<EventRegisterModalProps> = ({
  event,
  onClose,
  onSuccess,
}) => {
  if (!event) return null;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [rtRw, setRtRw] = useState('');
  const [role, setRole] = useState<'Peserta' | 'Relawan Lapangan' | 'Donatur Konsumsi'>('Peserta');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !rtRw.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      onSuccess(event.id, fullName);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
          <div>
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
              Pendaftaran Kegiatan
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {event.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {event.date}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {event.time}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              Pendaftaran Berhasil!
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Terima kasih <span className="font-semibold text-slate-900">{fullName}</span>, data pendaftaran Anda telah tercatat sebagai <span className="font-semibold text-blue-700">{role}</span>. Koordinator kegiatan akan menghubungi nomor WhatsApp Anda untuk pengarahan teknis.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-sm transition-colors"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Calon Peserta / Relawan *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Domisili RT / RW *
                </label>
                <input
                  type="text"
                  required
                  value={rtRw}
                  onChange={(e) => setRtRw(e.target.value)}
                  placeholder="Contoh: RT 03 / RW 04"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Peran yang Dipilih
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Peserta', 'Relawan Lapangan', 'Donatur Konsumsi'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setRole(opt)}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                      role === opt
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ada perlengkapan yang ingin dibawa atau catatan kesehatan..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Konfirmasi Pendaftaran'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
