import React, { useState } from 'react';
import { Menu, X, Users, MessageCircle, Github } from 'lucide-react';
import { ORGANISASI_INFO } from '../data/mockData';

interface NavbarProps {
  onOpenKtaModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenKtaModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Tentang', href: '#tentang' },
    { label: 'Agenda & Program', href: '#agenda' },
    { label: 'Transparansi Kas', href: '#kas' },
    { label: 'Etalase UMKM', href: '#umkm' },
    { label: 'Aspirasi Warga', href: '#aspirasi' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Zone 1: Single Text Element Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-700/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <a href="#" className="flex flex-col text-left group">
              <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                {ORGANISASI_INFO.name}
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {ORGANISASI_INFO.wilayah}
              </span>
            </a>
          </div>

          {/* Zone 2: 4-6 Text Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-blue-700 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {ORGANISASI_INFO.githubRepo && (
              <a
                href={ORGANISASI_INFO.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Repositori GitHub jalansuci19-create/karang-taruna-manis-jaya"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            )}

            <a
              href={`https://wa.me/${ORGANISASI_INFO.kontak.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo Pengurus ${ORGANISASI_INFO.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              Kontak WA
            </a>

            <button
              onClick={() => {
                if (onOpenKtaModal) {
                  onOpenKtaModal();
                } else {
                  const el = document.getElementById('kta-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap"
            >
              Daftar E-KTA
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Buka menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <a
              href={`https://wa.me/${ORGANISASI_INFO.kontak.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo Pengurus ${ORGANISASI_INFO.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Kontak WhatsApp Pengurus
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                const el = document.getElementById('kta-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 rounded-lg"
            >
              Daftar E-KTA Pemuda
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
