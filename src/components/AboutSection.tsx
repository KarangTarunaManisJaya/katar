import React, { useState } from 'react';
import { Shield, Target, Compass, Users2, Trophy, Briefcase, HeartHandshake, Megaphone } from 'lucide-react';
import { MOCK_PENGURUS, ORGANISASI_INFO } from '../data/mockData';

export const AboutSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visi-misi' | 'struktur'>('visi-misi');

  const pilar = [
    {
      icon: Trophy,
      title: 'Kepemudaan & Olahraga',
      desc: 'Membina bibit atlet muda, mengelola turnamen rutin voli, futsal, dan e-sports, serta memfasilitasi sarana kebugaran warga.',
    },
    {
      icon: Briefcase,
      title: 'Kewirausahaan & UMKM',
      desc: 'Pemberdayaan usaha mikro pemuda lewat kurasi produk, pelatihan digital marketing, kemasan higienis, dan akses bazar.',
    },
    {
      icon: HeartHandshake,
      title: 'Aksi Sosial & Relawan',
      desc: 'Tanggap bencana lokal, santunan anak yatim & lansia, donor darah PMI, serta advokasi bansos tepat sasaran bagi warga.',
    },
    {
      icon: Megaphone,
      title: 'Lingkungan & Komunikasi',
      desc: 'Gerakan pilah sampah, bank sampah pemuda, penghijauan bantaran sungai, dan publikasi informasi desa yang akurat.',
    },
  ];

  return (
    <section id="tentang" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-2">
            Mengenal Organisasi
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Profil & Struktur {ORGANISASI_INFO.name}
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Berdiri sebagai wadah pembinaan generasi muda berusia 13 sampai 45 tahun di lingkungan Kelurahan Manis Jaya, Kecamatan Jatiuwung, Kota Tangerang, berasaskan Pancasila dan berorientasi pada kemaslahatan sosial.
          </p>
        </div>

        {/* Segmented Control Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl w-fit mb-8">
          <button
            onClick={() => setActiveTab('visi-misi')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'visi-misi'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visi, Misi & 4 Pilar Fokus
          </button>
          <button
            onClick={() => setActiveTab('struktur')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'struktur'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Struktur Pengurus (2024-2027)
          </button>
        </div>

        {/* Tab Content: Visi, Misi & Pilar */}
        {activeTab === 'visi-misi' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visi Card */}
              <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Visi Utama</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  "Terwujudnya pemuda Kelurahan Manis Jaya yang berakhlak mulia, inovatif, berdaya saing tinggi, mandiri secara ekonomi, dan menjadi garda terdepan dalam memajukan keharmonisan masyarakat Kota Tangerang."
                </p>
              </div>

              {/* Misi Card */}
              <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Misi Kerja</h3>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                  <li>Mengakselerasi pemberdayaan usaha muda berbasis potensi kelurahan.</li>
                  <li>Memfasilitasi ruang kreasi seni, budaya lokal, dan pembinaan olahraga.</li>
                  <li>Membangun solidaritas sosial tanggap musibah dan kepedulian lingkungan.</li>
                  <li>Menyelenggarakan tata kelola organisasi yang transparan dan akuntabel.</li>
                </ul>
              </div>
            </div>

            {/* 4 Pilar Section */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Empat Pilar Program Pengabdian
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fokus kerja strategis yang dijalankan bersama warga di 8 Rukun Warga (RW) se-Kelurahan Manis Jaya.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {pilar.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-blue-700 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-2">{p.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Struktur Organisasi */}
        {activeTab === 'struktur' && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Pengurus Harian & Koordinator Bidang
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ditetapkan melalui Temu Karya Karang Taruna Kelurahan Manis Jaya periode 2024 - 2027.
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
                SK Lurah Manis Jaya No: 421.2/12/SK-KT-MJ/2024
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {MOCK_PENGURUS.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm mb-3">
                      {item.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-xs font-semibold text-blue-600 mb-0.5">
                      {item.role}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.division}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Masa Bakti: {item.period}</span>
                    {item.phone && (
                      <a
                        href={`https://wa.me/62${item.phone.replace(/\D/g, '').replace(/^0/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Hubungi
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
