import React, { useState } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Layout,
  Columns,
  Maximize2,
  Minimize2,
  Check,
  Eye,
  Sliders,
  Smartphone,
  Tablet,
  Laptop,
  Tv,
  RotateCcw,
  Sparkles,
  Layers,
  PanelLeft,
  PanelRight,
  Menu,
  Grid,
  List,
  CheckCircle2,
  Save,
  HelpCircle,
} from 'lucide-react';
import {
  useTheme,
  DisplayMode,
  SidebarState,
  SidebarPosition,
  SidebarWidth,
  SidebarColor,
  ActiveMenuHighlight,
  MobileSidebarMode,
  MobileTableSize,
} from '../../context/ThemeContext';

interface TampilanThemeTabProps {
  onToast: (msg: string) => void;
}

export const TampilanThemeTab: React.FC<TampilanThemeTabProps> = ({ onToast }) => {
  const { theme, updateTheme, resetTheme } = useTheme();

  // Local state for active section / tab in Tampilan
  const [activeSection, setActiveSection] = useState<'tema' | 'sidebar' | 'responsif' | 'semua'>('semua');

  // Device Preview Simulator State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'laptop' | 'tablet' | 'mobile'>('desktop');

  // Predefined Color Presets
  const primaryPresets = [
    { label: 'Biru Karang Taruna', hex: '#2563eb' },
    { label: 'Zamrud Manis Jaya', hex: '#059669' },
    { label: 'Langit Sukamaju', hex: '#0284c7' },
    { label: 'Ungu Karismatik', hex: '#7c3aed' },
    { label: 'Merah Semangat', hex: '#dc2626' },
    { label: 'Emas Mentari', hex: '#d97706' },
  ];

  const secondaryPresets = [
    { label: 'Dark Navy', hex: '#0f2744' },
    { label: 'Hitam Arang', hex: '#0f172a' },
    { label: 'Cool Slate', hex: '#334155' },
    { label: 'Royal Indigo', hex: '#1e1b4b' },
    { label: 'Cokelat Kayu', hex: '#451a03' },
  ];

  const accentPresets = [
    { label: 'Cyan Langit', hex: '#38bdf8' },
    { label: 'Emas Sinar', hex: '#fbbf24' },
    { label: 'Hijau Neon', hex: '#34d399' },
    { label: 'Rose Pink', hex: '#f43f5e' },
    { label: 'Lavender', hex: '#a855f7' },
  ];

  const backgroundPresets = [
    { label: 'Slate Bersih', hex: '#f8fafc' },
    { label: 'Putih Salju', hex: '#ffffff' },
    { label: 'Abu Lembut', hex: '#f1f5f9' },
    { label: 'Warm Ivory', hex: '#fafaf9' },
    { label: 'Deep Dark', hex: '#0b1329' },
  ];

  const sidebarColorOptions: { id: SidebarColor; name: string; bgClass: string; textClass: string; hex: string }[] = [
    { id: 'dark_navy', name: 'Dark Navy', bgClass: 'bg-[#0d213a]', textClass: 'text-white', hex: '#0d213a' },
    { id: 'black_slate', name: 'Hitam Pekat', bgClass: 'bg-[#090d16]', textClass: 'text-white', hex: '#090d16' },
    { id: 'karang_taruna_blue', name: 'Biru Karang Taruna', bgClass: 'bg-[#1e40af]', textClass: 'text-white', hex: '#1e40af' },
    { id: 'light_white', name: 'Putih Bersih', bgClass: 'bg-white', textClass: 'text-slate-800 border border-slate-200', hex: '#ffffff' },
    { id: 'deep_indigo', name: 'Deep Indigo', bgClass: 'bg-[#1e1b4b]', textClass: 'text-white', hex: '#1e1b4b' },
  ];

  const activeHighlightOptions: { id: ActiveMenuHighlight; name: string; desc: string }[] = [
    { id: 'pill_blue', name: 'Pill Warna Solid', desc: 'Kotak tumpul dengan latar warna primer solid' },
    { id: 'border_left', name: 'Garis Tepi Kiri', desc: 'Aksen garis vertikal di sebelah kiri menu aktif' },
    { id: 'glow_indigo', name: 'Glow Bercahaya', desc: 'Efek bayangan halus bercahaya pada menu aktif' },
    { id: 'soft_badge', name: 'Soft Badge Lembut', desc: 'Latar transparan lembut dengan teks warna aksen' },
    { id: 'gradient_karang_taruna', name: 'Gradien Karang Taruna', desc: 'Gradasi biru muda ke biru tua khas Karang Taruna' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      {/* 1. TOP SUB-HEADER & NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20 shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              Kustomisasi Tema, Sidebar & Responsif
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur mode gelap/terang, palet warna organisasi, perilaku sidebar navigasi, dan optimasi tampilan HP.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              resetTheme();
              onToast('Pengaturan tampilan berhasil dikembalikan ke standar awal.');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Standar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToast('Seluruh setelan tema dan tampilan berhasil disimpan ke sistem!');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all transform active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Tampilan</span>
          </button>
        </div>
      </div>

      {/* QUICK JUMP FILTER PILLS */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveSection('semua')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSection === 'semua' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua Pengaturan
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('tema')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSection === 'tema' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🎨 Tema Aplikasi
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('sidebar')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSection === 'sidebar' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📑 Sidebar / Menu
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('responsif')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSection === 'responsif' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📱 Responsif & Tampilan HP
        </button>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN 1: TEMA APLIKASI */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'tema') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              🎨
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Tema Aplikasi</h3>
              <p className="text-xs text-slate-500">
                Pilih mode pencahayaan serta susunan palet warna primer, sekunder, aksen, dan background.
              </p>
            </div>
          </div>

          {/* 1.1 Mode Tampilan (☀️ Light, 🌙 Dark, 🖥️ Mengikuti Sistem) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-900">
              Mode Tampilan (Color Scheme)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              {/* Option 1: Light */}
              <button
                type="button"
                onClick={() => {
                  updateTheme({ displayMode: 'light' });
                  onToast('Mode Terang (☀️ Light) diaktifkan.');
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  theme.displayMode === 'light'
                    ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                {theme.displayMode === 'light' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 text-lg">
                  ☀️
                </div>
                <p className="font-bold text-slate-900 text-sm">Light (Terang)</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Latar putih bersih dengan kontras optimal untuk bekerja di siang hari.
                </p>
              </button>

              {/* Option 2: Dark */}
              <button
                type="button"
                onClick={() => {
                  updateTheme({ displayMode: 'dark' });
                  onToast('Mode Gelap (🌙 Dark) diaktifkan.');
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  theme.displayMode === 'dark'
                    ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                {theme.displayMode === 'dark' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center mb-3 text-lg">
                  🌙
                </div>
                <p className="font-bold text-slate-900 text-sm">Dark (Gelap)</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Meredupkan pencahayaan layar untuk kenyamanan mata di malam hari.
                </p>
              </button>

              {/* Option 3: System */}
              <button
                type="button"
                onClick={() => {
                  updateTheme({ displayMode: 'system' });
                  onToast('Mode Mengikuti Sistem (🖥️ System) diaktifkan.');
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  theme.displayMode === 'system'
                    ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                {theme.displayMode === 'system' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-100 to-slate-800 text-slate-700 flex items-center justify-center mb-3 text-lg">
                  🖥️
                </div>
                <p className="font-bold text-slate-900 text-sm">Mengikuti Sistem</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Beralih otomatis antara terang dan gelap menyesuaikan pengaturan perangkat.
                </p>
              </button>
            </div>
          </div>

          {/* 1.2 Palet 4 Warna: Utama, Sekunder, Aksen, Background */}
          <div className="pt-2 border-t border-slate-100 space-y-5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Palet Warna Identitas Workspace
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* 1. Warna Utama (Primary) */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Warna Utama (Primary Color)</span>
                    <span className="text-[11px] text-slate-500">Tombol utama, tab aktif, dan penanda penting</span>
                  </div>
                  <div
                    className="w-7 h-7 rounded-xl shadow-xs border border-white shrink-0"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {primaryPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => {
                        updateTheme({ primaryColor: preset.hex });
                        onToast(`Warna utama diubah ke: ${preset.label}`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                        theme.primaryColor === preset.hex
                          ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-300'
                          : 'bg-white/80 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom HEX picker */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">Kustom HEX:</span>
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-mono text-xs w-28 uppercase text-slate-700"
                  />
                </div>
              </div>

              {/* 2. Warna Sekunder (Secondary) */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Warna Sekunder (Secondary Color)</span>
                    <span className="text-[11px] text-slate-500">Header tabel, kartu latar, dan badge pendukung</span>
                  </div>
                  <div
                    className="w-7 h-7 rounded-xl shadow-xs border border-white shrink-0"
                    style={{ backgroundColor: theme.secondaryColor }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {secondaryPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => {
                        updateTheme({ secondaryColor: preset.hex });
                        onToast(`Warna sekunder diubah ke: ${preset.label}`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                        theme.secondaryColor === preset.hex
                          ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-300'
                          : 'bg-white/80 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">Kustom HEX:</span>
                  <input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-mono text-xs w-28 uppercase text-slate-700"
                  />
                </div>
              </div>

              {/* 3. Warna Aksen (Accent) */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Warna Aksen (Accent Color)</span>
                    <span className="text-[11px] text-slate-500">Sorotan ikon, tag status, dan link aktif</span>
                  </div>
                  <div
                    className="w-7 h-7 rounded-xl shadow-xs border border-white shrink-0"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {accentPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => {
                        updateTheme({ accentColor: preset.hex });
                        onToast(`Warna aksen diubah ke: ${preset.label}`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                        theme.accentColor === preset.hex
                          ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-300'
                          : 'bg-white/80 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">Kustom HEX:</span>
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => updateTheme({ accentColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={theme.accentColor}
                    onChange={(e) => updateTheme({ accentColor: e.target.value })}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-mono text-xs w-28 uppercase text-slate-700"
                  />
                </div>
              </div>

              {/* 4. Warna Background */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Warna Background (Latar Belakang)</span>
                    <span className="text-[11px] text-slate-500">Dasar ruang kerja kanvas aplikasi</span>
                  </div>
                  <div
                    className="w-7 h-7 rounded-xl shadow-xs border border-slate-300 shrink-0"
                    style={{ backgroundColor: theme.backgroundColor }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {backgroundPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => {
                        updateTheme({ backgroundColor: preset.hex });
                        onToast(`Warna background diubah ke: ${preset.label}`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                        theme.backgroundColor === preset.hex
                          ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-300'
                          : 'bg-white/80 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">Kustom HEX:</span>
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-mono text-xs w-28 uppercase text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BAGIAN 2: SIDEBAR / MENU */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'sidebar') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              📑
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Sidebar / Menu Navigasi</h3>
              <p className="text-xs text-slate-500">
                Atur orientasi, lebar, warna bilah navigasi samping, serta gaya highlight menu aktif.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* 2.1 Sidebar Expanded / Collapsed */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">Sidebar Expanded / Collapsed</span>
              <p className="text-[11px] text-slate-500">Tentukan apakah sidebar terbuka penuh atau berupa bilah mini ikon saja.</p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    updateTheme({ sidebarState: 'expanded' });
                    onToast('Sidebar diatur ke mode Terbuka Penuh (Expanded).');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    theme.sidebarState === 'expanded'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Maximize2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                  <span>Expanded (Penuh)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateTheme({ sidebarState: 'collapsed' });
                    onToast('Sidebar diatur ke mode Mini (Collapsed).');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    theme.sidebarState === 'collapsed'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Minimize2 className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                  <span>Collapsed (Mini)</span>
                </button>
              </div>
            </div>

            {/* 2.2 Posisi Sidebar (Kiri / Kanan) */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">Posisi Sidebar</span>
              <p className="text-[11px] text-slate-500">Letak sidebar navigasi pada monitor desktop & laptop.</p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    updateTheme({ sidebarPosition: 'kiri' });
                    onToast('Posisi sidebar dipindahkan ke Kiri (Standar).');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    theme.sidebarPosition === 'kiri'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <PanelLeft className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                  <span>Kiri (Standar)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateTheme({ sidebarPosition: 'kanan' });
                    onToast('Posisi sidebar dipindahkan ke Kanan.');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    theme.sidebarPosition === 'kanan'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <PanelRight className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                  <span>Kanan (Modern)</span>
                </button>
              </div>
            </div>

            {/* 2.3 Lebar Sidebar */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">Lebar Sidebar</span>
              <p className="text-[11px] text-slate-500">Ukuran proporsi lebar kolom bilah menu samping.</p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'kecil', label: 'Kecil', size: '200px' },
                  { id: 'standar', label: 'Standar', size: '256px' },
                  { id: 'lebar', label: 'Lebar', size: '300px' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      updateTheme({ sidebarWidth: item.id as SidebarWidth });
                      onToast(`Lebar sidebar diatur ke: ${item.label} (${item.size})`);
                    }}
                    className={`py-2 px-2 rounded-xl border text-center transition-all ${
                      theme.sidebarWidth === item.id
                        ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold">{item.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.size}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2.4 Toggle Ikon & Teks & Auto Collapse */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">Elemen Menu & Otomatisasi</span>

              <div className="space-y-2.5 pt-1">
                {/* Tampilkan Ikon Menu */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Tampilkan Ikon Menu</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !theme.showMenuIcon;
                      updateTheme({ showMenuIcon: next });
                      onToast(`Ikon menu ${next ? 'ditampilkan' : 'disembunyikan'}.`);
                    }}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      theme.showMenuIcon ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        theme.showMenuIcon ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Tampilkan Teks Menu */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Tampilkan Teks Menu</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !theme.showMenuText;
                      updateTheme({ showMenuText: next });
                      onToast(`Teks menu ${next ? 'ditampilkan' : 'disembunyikan'}.`);
                    }}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      theme.showMenuText ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        theme.showMenuText ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Sidebar Otomatis Mengecil */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-700 font-medium block">Sidebar Otomatis Mengecil</span>
                    <span className="text-[10px] text-slate-400">Otomatis menciutkan sidebar saat resolusi sempit</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !theme.autoCollapse;
                      updateTheme({ autoCollapse: next });
                      onToast(`Sidebar otomatis mengecil ${next ? 'diaktifkan' : 'dinonaktifkan'}.`);
                    }}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
                      theme.autoCollapse ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        theme.autoCollapse ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 2.5 Warna Sidebar */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">Warna Latar Sidebar</span>
              <p className="text-[11px] text-slate-500">Pilih tema warna kontras untuk bilah sidebar navigasi.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {sidebarColorOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      updateTheme({ sidebarColor: opt.id });
                      onToast(`Warna sidebar diubah ke: ${opt.name}`);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      theme.sidebarColor === opt.id
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-full h-7 rounded-lg ${opt.bgClass} mb-1.5 flex items-center justify-center`}>
                      {theme.sidebarColor === opt.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <span className="block font-bold text-[11px] text-slate-800 leading-tight">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2.6 Menu Aktif / Highlight */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">Menu Aktif / Highlight</span>
              <p className="text-[11px] text-slate-500">Gaya penanda visual saat sebuah menu sedang dibuka.</p>

              <div className="space-y-1.5 pt-1">
                {activeHighlightOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      updateTheme({ activeMenuHighlight: opt.id });
                      onToast(`Gaya sorotan menu diubah ke: ${opt.name}`);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      theme.activeMenuHighlight === opt.id
                        ? 'border-blue-600 bg-blue-50/70 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="text-slate-900 block text-xs">{opt.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{opt.desc}</span>
                    </div>
                    {theme.activeMenuHighlight === opt.id && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BAGIAN 3: RESPONSIF (JIKA PORTAL JUGA DIBUKA DARI HP) */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'responsif') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              📱
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Responsif & Pengaturan Khusus HP (Mobile)
              </h3>
              <p className="text-xs text-slate-500">
                Optimasi tata letak ketika portal diakses dari smartphone, tablet, laptop, atau monitor desktop.
              </p>
            </div>
          </div>

          {/* 3.1 Penjelasan 4 Breakpoint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Tv className="w-4 h-4 text-blue-600" />
                <span>Desktop (&gt;1280px)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Sidebar permanen, grid 4 kolom, tabel penuh dengan seluruh aksi cepat.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span>Laptop (1024 - 1280px)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Tata letak ideal dengan skala font dinamis dan ruang kerja luas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Tablet className="w-4 h-4 text-purple-600" />
                <span>Tablet (768 - 1024px)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Sidebar mini atau drawer tersembunyi dengan navigasi sentuh fleksibel.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Mobile (&lt;768px)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Single-column feed, tombol aksi mudah dijangkau jempol satu tangan.
              </p>
            </div>
          </div>

          {/* 3.2 Pilihan Sidebar Mobile & Ukuran Tabel Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Sidebar Mobile Mode */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">Model Navigasi Mobile (HP)</span>
              <p className="text-[11px] text-slate-500">Bentuk navigasi yang tampil saat portal dibuka dari smartphone.</p>

              <div className="space-y-2 pt-1">
                {[
                  {
                    id: 'drawer',
                    name: 'Drawer Geser (Slide-over)',
                    desc: 'Menu muncul dari samping dengan latar belakang redup saat tombol hamburger ditekan.',
                  },
                  {
                    id: 'bottom_bar',
                    name: 'Bilah Navigasi Bawah (Bottom Bar)',
                    desc: 'Menu aplikasi utama berada di bagian bawah layar seperti aplikasi native HP.',
                  },
                  {
                    id: 'floating_menu',
                    name: 'Tombol Menu Melayang (Floating Action)',
                    desc: 'Tombol bundar melayang di sudut layar yang membuka menu saat diklik.',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      updateTheme({ mobileSidebarMode: item.id as MobileSidebarMode });
                      onToast(`Navigasi mobile diubah ke: ${item.name}`);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      theme.mobileSidebarMode === item.id
                        ? 'border-purple-600 bg-purple-50/70 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="text-slate-900 block text-xs">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal leading-snug">{item.desc}</span>
                    </div>
                    {theme.mobileSidebarMode === item.id && (
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Ukuran Tabel Mobile */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">Format Tabel Data di HP</span>
              <p className="text-[11px] text-slate-500">Perilaku tabel data anggota, surat, dan keuangan pada layar sempit.</p>

              <div className="space-y-2 pt-1">
                {[
                  {
                    id: 'card',
                    name: 'Mode Kartu Responsif (Card Mode)',
                    desc: 'Baris tabel otomatis diubah menjadi tumpukan kartu informasi yang ramah jari.',
                  },
                  {
                    id: 'scroll',
                    name: 'Gulir Horizontal Halus (Horizontal Scroll)',
                    desc: 'Tabel tetap dalam bentuk kolom dengan scrollbar horizontal yang mulus.',
                  },
                  {
                    id: 'compact',
                    name: 'Tabel Kompak Ringkas (Compact Table)',
                    desc: 'Ukuran huruf dan jarak spasi dipadatkan agar lebih banyak kolom termuat.',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      updateTheme({ mobileTableSize: item.id as MobileTableSize });
                      onToast(`Format tabel HP diubah ke: ${item.name}`);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      theme.mobileTableSize === item.id
                        ? 'border-purple-600 bg-purple-50/70 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="text-slate-900 block text-xs">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal leading-snug">{item.desc}</span>
                    </div>
                    {theme.mobileTableSize === item.id && (
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3.3 LIVE INTERACTIVE DEVICE PREVIEW SIMULATOR */}
          <div className="pt-3 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Simulator Pratinjau Tampilan Multi-Perangkat (Live Preview)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Uji responsivitas tema Karang Taruna Manis Jaya pada berbagai jenis layar secara real-time.
                </p>
              </div>

              {/* Device Selector Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                    previewDevice === 'desktop' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDevice('laptop')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                    previewDevice === 'laptop' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Laptop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                    previewDevice === 'tablet' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                    previewDevice === 'mobile' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile (HP)</span>
                </button>
              </div>
            </div>

            {/* Mockup Canvas */}
            <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden min-h-[320px]">
              <div
                className={`transition-all duration-300 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-white flex flex-col ${
                  previewDevice === 'mobile'
                    ? 'w-[280px] h-[460px] rounded-3xl border-4 border-slate-700'
                    : previewDevice === 'tablet'
                    ? 'w-[420px] h-[360px]'
                    : previewDevice === 'laptop'
                    ? 'w-[560px] h-[340px]'
                    : 'w-full max-w-[680px] h-[340px]'
                }`}
              >
                {/* Mockup Topbar */}
                <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-mono text-slate-300 ml-1 truncate max-w-[140px]">
                      karangtaruna.manisjaya.id
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {previewDevice === 'mobile' ? '375x812' : previewDevice === 'tablet' ? '768x1024' : '1920x1080'}
                  </span>
                </div>

                {/* Mockup Body Layout */}
                <div
                  className="flex-1 flex overflow-hidden text-xs relative"
                  style={{ backgroundColor: theme.backgroundColor }}
                >
                  {/* Mockup Sidebar */}
                  {previewDevice !== 'mobile' ? (
                    <div
                      className={`transition-all p-2 flex flex-col justify-between shrink-0 ${
                        theme.sidebarColor === 'black_slate'
                          ? 'bg-[#090d16] text-white'
                          : theme.sidebarColor === 'karang_taruna_blue'
                          ? 'bg-[#1e40af] text-white'
                          : theme.sidebarColor === 'light_white'
                          ? 'bg-white text-slate-800 border-r border-slate-200'
                          : theme.sidebarColor === 'deep_indigo'
                          ? 'bg-[#1e1b4b] text-white'
                          : 'bg-[#0d213a] text-white'
                      } ${
                        theme.sidebarPosition === 'kanan' ? 'order-last border-l border-slate-700/50' : ''
                      } ${
                        theme.sidebarState === 'collapsed' || previewDevice === 'tablet'
                          ? 'w-12 items-center'
                          : theme.sidebarWidth === 'kecil'
                          ? 'w-28'
                          : theme.sidebarWidth === 'lebar'
                          ? 'w-40'
                          : 'w-32'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="h-4 rounded bg-white/20 w-3/4 mb-3" />
                        <div
                          className="h-5 rounded flex items-center px-1.5 gap-1.5"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          <div className="w-2 h-2 rounded-full bg-white shrink-0" />
                          {theme.sidebarState === 'expanded' && previewDevice !== 'tablet' && (
                            <div className="h-1.5 rounded bg-white w-10" />
                          )}
                        </div>
                        <div className="h-4 rounded bg-white/10 flex items-center px-1.5 gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-white/60 shrink-0" />
                          {theme.sidebarState === 'expanded' && previewDevice !== 'tablet' && (
                            <div className="h-1.5 rounded bg-white/40 w-8" />
                          )}
                        </div>
                        <div className="h-4 rounded bg-white/10 flex items-center px-1.5 gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-white/60 shrink-0" />
                          {theme.sidebarState === 'expanded' && previewDevice !== 'tablet' && (
                            <div className="h-1.5 rounded bg-white/40 w-12" />
                          )}
                        </div>
                      </div>

                      <div className="h-3 rounded bg-white/20 w-full" />
                    </div>
                  ) : null}

                  {/* Mockup Main Content */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                    {/* Header in mobile */}
                    {previewDevice === 'mobile' && (
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                        <span className="font-extrabold text-[10px] text-slate-800">SIM-KT Manis Jaya</span>
                        <div
                          className="w-5 h-5 rounded-md text-white flex items-center justify-center text-[10px]"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          <Menu className="w-3 h-3" />
                        </div>
                      </div>
                    )}

                    {/* Banner card */}
                    <div
                      className="p-2.5 rounded-xl text-white shadow-xs"
                      style={{ backgroundColor: theme.secondaryColor }}
                    >
                      <span className="text-[9px] font-bold block" style={{ color: theme.accentColor }}>
                        PORTAL RESMI PEMUDA
                      </span>
                      <span className="text-xs font-black block mt-0.5">Kelurahan Manis Jaya</span>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-slate-400 block text-[8px]">Anggota</span>
                        <span className="font-bold text-slate-900">48 Orang</span>
                      </div>
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-slate-400 block text-[8px]">Surat Tugas</span>
                        <span className="font-bold text-slate-900">12 Berkas</span>
                      </div>
                    </div>

                    {/* Interactive table mock */}
                    <div className="bg-white rounded-lg border border-slate-200 p-1.5 text-[8px]">
                      <div className="flex justify-between items-center mb-1 font-bold text-slate-700">
                        <span>Buku Induk Anggota</span>
                        <span
                          className="px-1 py-0.5 rounded text-[7px] text-white"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          {theme.mobileTableSize}
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-600">
                        <div className="p-1 rounded bg-slate-50 flex justify-between">
                          <span>1. Iik Andriyana (Ketua)</span>
                          <span className="text-emerald-600 font-bold">Aktif</span>
                        </div>
                        <div className="p-1 rounded bg-slate-50 flex justify-between">
                          <span>2. Fajar Maulana (Wakil)</span>
                          <span className="text-emerald-600 font-bold">Aktif</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Nav Simulation if mobile & bottom_bar selected */}
                    {previewDevice === 'mobile' && theme.mobileSidebarMode === 'bottom_bar' && (
                      <div className="sticky bottom-0 bg-white border-t border-slate-200 -mx-3 -mb-3 px-2 py-1.5 flex justify-around text-[8px] font-bold text-slate-600">
                        <span style={{ color: theme.primaryColor }}>Beranda</span>
                        <span>Surat</span>
                        <span>Anggota</span>
                        <span>Laporan</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
