import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, ArrowUpRight, Share2, Check } from 'lucide-react';
import { AgendaEvent } from '../types';
import { ORGANISASI_INFO } from '../data/mockData';
import { EventRegisterModal } from './EventRegisterModal';

interface EventsSectionProps {
  events: AgendaEvent[];
  onRegisterSuccess: (eventId: string, applicantName: string) => void;
  onToast: (msg: string) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  onRegisterSuccess,
  onToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeModalEvent, setActiveModalEvent] = useState<AgendaEvent | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['Semua', 'Olahraga', 'Sosial & Lingkungan', 'Pelatihan'];

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory === 'Semua') return true;
    return ev.category === selectedCategory;
  });

  const handleShare = (event: AgendaEvent) => {
    const text = `Ayo ikuti kegiatan: ${event.title} pada ${event.date} di ${event.location}. Info selengkapnya di Portal ${ORGANISASI_INFO.name}.`;
    navigator.clipboard?.writeText(text);
    setCopiedId(event.id);
    onToast(`Link & info kegiatan "${event.title.slice(0, 25)}..." disalin!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section id="agenda" className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-2">
              Agenda & Program Aksi
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
              Program Kerja & Kegiatan Pemuda Mendatang
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Setiap pemuda dan warga kelurahan berhak berpartisipasi sebagai peserta, panitia lapangan, maupun sukarelawan logistik.
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredEvents.map((event) => {
            const quotaPercent = Math.min(100, Math.round((event.registeredCount / event.quota) * 100));

            return (
              <div
                key={event.id}
                className="group rounded-2xl border border-slate-200 overflow-hidden bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    <img
                      src={event.image}
                      alt={event.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    {/* Clean unboxed category & status */}
                    <div className="absolute top-4 left-4 text-xs font-semibold text-white drop-shadow">
                      <span>{event.category}</span>
                      <span className="mx-2 opacity-60">·</span>
                      <span className="text-amber-300">{event.status}</span>
                    </div>

                    <button
                      onClick={() => handleShare(event)}
                      aria-label="Bagikan agenda"
                      className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-sm transition-colors"
                    >
                      {copiedId === event.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-200">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-300" />
                          {event.date}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-300" />
                          {event.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                      {event.title}
                    </h3>
                    
                    <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-2 mb-3">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{event.location}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Quota Progress */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Peserta Terdaftar
                        </span>
                        <span className="font-semibold text-slate-800 tabular-nums">
                          {event.registeredCount} / {event.quota} orang ({quotaPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${quotaPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="px-6 pb-6 pt-1 flex items-center gap-3">
                  <button
                    onClick={() => setActiveModalEvent(event)}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    Daftar Sebagai Peserta / Relawan
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {activeModalEvent && (
        <EventRegisterModal
          event={activeModalEvent}
          onClose={() => setActiveModalEvent(null)}
          onSuccess={(id, name) => {
            onRegisterSuccess(id, name);
            onToast(`Selamat ${name}, Anda berhasil terdaftar!`);
          }}
        />
      )}
    </section>
  );
};
