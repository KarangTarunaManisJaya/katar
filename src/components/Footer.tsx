import React from 'react';
import { Users, MapPin, Phone, Mail, Instagram, Youtube, Heart, Github } from 'lucide-react';
import { ORGANISASI_INFO } from '../data/mockData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Organization Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                {ORGANISASI_INFO.name}
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Wadah pembinaan dan pengembangan generasi muda desa berlandaskan semangat gotong royong, kemandirian usaha, kepedulian sosial, dan kebersamaan.
            </p>

            <div className="space-y-2 pt-2 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>{ORGANISASI_INFO.sekretariat}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Hotline WA: {ORGANISASI_INFO.kontak.whatsapp}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{ORGANISASI_INFO.kontak.email}</span>
              </div>
              {ORGANISASI_INFO.githubRepo && (
                <div className="flex items-center gap-2 pt-1">
                  <Github className="w-4 h-4 text-slate-500 shrink-0" />
                  <a
                    href={ORGANISASI_INFO.githubRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    GitHub: jalansuci19-create/karang-taruna-manis-jaya
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Col 3: Navigasi Cepat */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navigasi Portal</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#tentang" className="hover:text-white transition-colors">
                  Tentang & Visi Misi
                </a>
              </li>
              <li>
                <a href="#agenda" className="hover:text-white transition-colors">
                  Agenda & Program Aksi
                </a>
              </li>
              <li>
                <a href="#kas" className="hover:text-white transition-colors">
                  Laporan Kas Terbuka
                </a>
              </li>
              <li>
                <a href="#umkm" className="hover:text-white transition-colors">
                  Katalog UMKM Pemuda
                </a>
              </li>
              <li>
                <a href="#aspirasi" className="hover:text-white transition-colors">
                  Suara & Usulan Warga
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Layanan Pemuda */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Layanan & Partisipasi</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#kta-section" className="hover:text-white transition-colors">
                  Pendaftaran E-KTA Pemuda
                </a>
              </li>
              <li>
                <a href="#agenda" className="hover:text-white transition-colors">
                  Daftar Relawan Kegiatan
                </a>
              </li>
              <li>
                <a href="#umkm" className="hover:text-white transition-colors">
                  Kurasi Produk Usaha Muda
                </a>
              </li>
              <li>
                <a href="#kas" className="hover:text-white transition-colors">
                  Penyaluran Donasi Sosial
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Slogan */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Motto Organisasi</h4>
            <p className="text-slate-300 italic text-xs leading-relaxed mb-3">
              "{ORGANISASI_INFO.tagline}"
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Pejuang yang berkepribadian luhur, berpengetahuan, dan berkarya nyata untuk nusa dan bangsa.
            </p>
            <div className="text-[11px] text-slate-400">
              Masa Bakti Pengurus: {ORGANISASI_INFO.periode}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {ORGANISASI_INFO.name}. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Dikelola dengan bangga oleh Pemuda Kelurahan Manis Jaya, Kota Tangerang</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
