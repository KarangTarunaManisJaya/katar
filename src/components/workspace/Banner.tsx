import React, { useState } from 'react';
import { Users, Calendar, FileText, Plus, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface BannerProps {
  onAddNewsClick: () => void;
  onExploreClick?: () => void;
}

export const Banner: React.FC<BannerProps> = ({ onAddNewsClick, onExploreClick }) => {
  const [activeDot, setActiveDot] = useState(1);

  return (
    <div className="w-full">
      {/* Banner Box */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#eef7ff] via-[#e5f1fd] to-[#dbeefd] border border-blue-100 shadow-sm">
        {/* Curving decorative glow */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-90 hidden lg:block pointer-events-none">
          {/* Smooth fade wave over the gate photo */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#eef7ff] via-[#e5f1fd]/80 to-transparent" />
          <img
            src="/src/assets/images/manis_jaya_gate_1790588960710.jpg"
            alt="Gerbang Karang Taruna Manis Jaya"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Content Inside Banner */}
        <div className="relative z-20 p-6 sm:p-8 lg:p-10">
          {/* Top Row with Kicker and 'Selamat berkarya!' button */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500 block">
                SELAMAT DATANG DI WORKSPACE
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1">
                Manis Jaya
              </h1>
            </div>

            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/95 hover:bg-white text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-all shrink-0 hover:border-blue-300"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Selamat berkarya!</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>
          </div>

          {/* Subheading & Description */}
          <div className="mt-3 max-w-xl">
            <h2 className="text-base sm:text-xl font-bold text-slate-800 leading-snug">
              Bersama Membangun Karang Taruna yang{' '}
              <span className="text-blue-600">Aktif, Kreatif dan Mandiri</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Di sini Anda dapat mengelola seluruh kegiatan, dokumentasi, dan data organisasi Karang Taruna Manis Jaya dengan lebih mudah dan efisien.
            </p>
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mt-6">
            {/* Card 1: 12 Anggota Aktif */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-black text-slate-900 leading-none">
                  12
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-1 leading-none">
                  Anggota Aktif
                </div>
              </div>
            </div>

            {/* Card 2: 8 Kegiatan Bulan Ini */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-black text-slate-900 leading-none">
                  8
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-1 leading-none">
                  Kegiatan Bulan Ini
                </div>
              </div>
            </div>

            {/* Card 3: 5 Dokumen Terbaru */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-black text-slate-900 leading-none">
                  5
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-1 leading-none">
                  Dokumen Terbaru
                </div>
              </div>
            </div>
          </div>

          {/* Action Button: + Tambah Berita Pertama */}
          <div className="mt-6">
            <button
              onClick={onAddNewsClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Berita Pertama</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Dots Carousel Pagination */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        <button
          onClick={() => setActiveDot(0)}
          className={`h-2 rounded-full transition-all ${
            activeDot === 0 ? 'w-5 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
          }`}
          aria-label="Slide 1"
        />
        <button
          onClick={() => setActiveDot(1)}
          className={`h-2 rounded-full transition-all ${
            activeDot === 1 ? 'w-5 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
          }`}
          aria-label="Slide 2 (Active)"
        />
        <button
          onClick={() => setActiveDot(2)}
          className={`h-2 rounded-full transition-all ${
            activeDot === 2 ? 'w-5 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
          }`}
          aria-label="Slide 3"
        />
      </div>
    </div>
  );
};
