import React from 'react';
import { ArrowRight, Award, ShieldCheck, Calendar, Sparkles } from 'lucide-react';
import { ORGANISASI_INFO } from '../data/mockData';

interface HeroProps {
  onRegisterClick: () => void;
  onExploreAgendaClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onRegisterClick, onExploreAgendaClick }) => {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white pt-12 pb-20 lg:pt-18 lg:pb-28">
      {/* Background Subtle Gradient & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Proposition & Copy */}
          <div className="lg:col-span-7 space-y-6">
            {/* Clean unboxed editorial kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
              <span>{ORGANISASI_INFO.tagline}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-300">{ORGANISASI_INFO.periode}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance leading-tight">
              Wadah Kolaborasi Generasi Muda Manis Jaya
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Membangun kemandirian pemuda Kelurahan Manis Jaya melalui pemberdayaan UMKM lokal, pelestarian gotong royong, pembinaan olahraga, dan aksi sosial kemasyarakatan yang transparan.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onRegisterClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-md transition-all group"
              >
                Buat Kartu Anggota (E-KTA)
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreAgendaClick}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                Lihat Agenda Kegiatan
              </button>
            </div>

            {/* Adjacency Proof Metrics */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {ORGANISASI_INFO.stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
                    {stat.value}
                    <span className="text-sm font-medium text-blue-400 ml-1">
                      {stat.unit}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Marquee Hero Photography Anchor */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-800 group">
              <img
                src="/src/assets/images/hero_karang_taruna_1790587873230.jpg"
                alt="Semangat gotong royong pemuda Karang Taruna Bhakti Pertiwi"
                referrerPolicy="no-referrer"
                className="w-full aspect-[4/3] sm:aspect-[16/11] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Bottom Scrim with Human Context */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6">
                <div className="flex items-center gap-2 text-xs text-amber-300 font-medium mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Organisasi Kepemudaan Resmi Kelurahan</span>
                </div>
                <h3 className="text-white font-bold text-base sm:text-lg">
                  Pemuda Manis Jaya Kompak & Berdaya
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  Temu karya dan koordinasi program kerja Karang Taruna Manis Jaya bersama perwakilan pemuda RW 01 sampai RW 08.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
