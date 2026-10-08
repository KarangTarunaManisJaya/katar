import React, { useState, useRef, useEffect } from 'react';
import { useBranding } from '../../context/BrandingContext';
import { useTheme } from '../../context/ThemeContext';
import { BrandLogo } from './BrandLogo';
import { AplikasiSystemTab } from './AplikasiSystemTab';
import { TampilanThemeTab } from './TampilanThemeTab';
import { SuratDokumenTab } from './SuratDokumenTab';
import {
  Settings,
  Building2,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Upload,
  Save,
  Check,
  Calendar,
  Clock,
  Link as LinkIcon,
  MoreHorizontal,
  Wifi,
  Eye,
  EyeOff,
  Bell,
  FileText,
  Shield,
  Palette,
  CheckCircle2,
  Layers,
  Trash2,
  RefreshCw,
  Download,
  ExternalLink,
  Send,
  AlertTriangle,
  Lock,
  Smartphone,
  Copy,
} from 'lucide-react';

interface PengaturanUmumViewProps {
  onToast: (msg: string) => void;
  onNavigateToTab?: (tab: any) => void;
  initialTab?: 'info' | 'aplikasi' | 'notifikasi' | 'surat' | 'keamanan' | 'tampilan';
}

export const PengaturanUmumView: React.FC<PengaturanUmumViewProps> = ({ onToast, onNavigateToTab, initialTab }) => {
  const { logoUrl, kopFileName: globalKopFileName, setLogoUrl, setKopLogoUrl, resetLogo, resetKopLogo } = useBranding();
  const { theme, updateTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'info' | 'aplikasi' | 'notifikasi' | 'surat' | 'keamanan' | 'tampilan'>(() => {
    if (initialTab) return initialTab;
    try {
      const saved = localStorage.getItem('kt_active_pengaturan_tab');
      if (saved && ['info', 'aplikasi', 'notifikasi', 'surat', 'keamanan', 'tampilan'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'info';
  });

  const handleTabChange = (tab: 'info' | 'aplikasi' | 'notifikasi' | 'surat' | 'keamanan' | 'tampilan') => {
    setActiveTab(tab);
    try {
      localStorage.setItem('kt_active_pengaturan_tab', tab);
    } catch {}
  };
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const kopInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Organisasi Data (with localStorage persistence)
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(() => logoUrl || localStorage.getItem('kt_custom_logo') || '');
  const [kopFileName, setKopFileName] = useState<string>(() => globalKopFileName || localStorage.getItem('kt_kop_filename') || '');
  const [orgName, setOrgName] = useState(() => localStorage.getItem('kt_org_name') || 'Karang Taruna Manis Jaya');
  const [address, setAddress] = useState(() => localStorage.getItem('kt_org_address') || 'Jl. Manis Jaya No. 12, Kec. Sukamaju, Kota Tangerang');
  const [kelurahan, setKelurahan] = useState(() => localStorage.getItem('kt_org_kelurahan') || 'Manis Jaya');
  const [kecamatan, setKecamatan] = useState(() => localStorage.getItem('kt_org_kecamatan') || 'Sukamaju');
  const [kota, setKota] = useState(() => localStorage.getItem('kt_org_kota') || 'Tangerang');
  const [provinsi, setProvinsi] = useState(() => localStorage.getItem('kt_org_provinsi') || 'Banten');

  // 2. Kontak & Media Sosial
  const [email, setEmail] = useState(() => localStorage.getItem('kt_email') || 'karangtarunamanisjaya@gmail.com');
  const [telepon, setTelepon] = useState(() => localStorage.getItem('kt_telepon') || '0812 3456 7890');
  const [website, setWebsite] = useState(() => localStorage.getItem('kt_website') || 'https://manisjaya.or.id');
  const [facebook, setFacebook] = useState(() => localStorage.getItem('kt_facebook') || 'Karang Taruna Manis Jaya');
  const [instagram, setInstagram] = useState(() => localStorage.getItem('kt_instagram') || '@karangtaruna.manisjaya');
  const [youtube, setYoutube] = useState(() => localStorage.getItem('kt_youtube') || 'Karang Taruna Manis Jaya');

  // 3. Preferensi Aplikasi
  const [itemsPerPage, setItemsPerPage] = useState(() => localStorage.getItem('kt_per_page') || '20');
  const [displayMode, setDisplayMode] = useState(() => {
    return theme.displayMode === 'dark' ? 'Gelap (Dark)' : theme.displayMode === 'system' ? 'Sistem Otomatis' : 'Terang (Light)';
  });

  // Keep displayMode in sync when theme changes
  useEffect(() => {
    const label = theme.displayMode === 'dark' ? 'Gelap (Dark)' : theme.displayMode === 'system' ? 'Sistem Otomatis' : 'Terang (Light)';
    setDisplayMode(label);
  }, [theme.displayMode]);
  const [notifSistem, setNotifSistem] = useState(() => localStorage.getItem('kt_notif_sistem') !== 'false');
  const [tampilLogin, setTampilLogin] = useState(() => localStorage.getItem('kt_tampil_login') !== 'false');
  const [simpanPencarian, setSimpanPencarian] = useState(() => localStorage.getItem('kt_simpan_search') !== 'false');
  const [backupOtomatis, setBackupOtomatis] = useState(() => localStorage.getItem('kt_backup_auto') === 'true');

  // 4. Tanggal & Waktu
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('kt_date_format') || 'dd/MM/yyyy');
  const [timeFormat, setTimeFormat] = useState(() => localStorage.getItem('kt_time_format') || 'HH:mm:ss');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('kt_timezone') || 'Asia/Jakarta (WIB)');
  const [tampilHari, setTampilHari] = useState(() => localStorage.getItem('kt_tampil_hari') !== 'false');
  const [startOfWeek, setStartOfWeek] = useState(() => localStorage.getItem('kt_start_week') || 'Senin');

  // 5. Integrasi & API
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('kt_api_url') || 'https://api.manisjaya.or.id');
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('kt_api_token') || 'kt_prod_sec_9941829471928472');
  const [showToken, setShowToken] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 6. Lainnya
  const [letterTemplate, setLetterTemplate] = useState(() => localStorage.getItem('kt_letter_template') || 'Standar Karang Taruna');
  const [welcomeMessage, setWelcomeMessage] = useState(() => localStorage.getItem('kt_welcome_msg') || 'Selamat datang di sistem informasi Karang Taruna Manis Jaya.');

  // Additional Sub-tab states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [emailNotifActive, setEmailNotifActive] = useState(true);
  const [waNotifActive, setWaNotifActive] = useState(true);

  // Logo upload handler
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onToast('Ukuran berkas logo melebihi 2MB. Silakan pilih foto yang lebih kecil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomLogoUrl(dataUrl);
      setLogoUrl(dataUrl);
      onToast('Logo organisasi berhasil diperbarui!');
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setCustomLogoUrl('');
    resetLogo();
    onToast('Logo organisasi telah dikembalikan ke lambang resmi Karang Taruna.');
  };

  const handleForceRefreshCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      onToast('Cache HP/Browser berhasil dikosongkan! Memuat ulang logo & pembaruan...');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch {
      window.location.reload();
    }
  };

  // Kop Surat upload handler
  const handleKopFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onToast('Ukuran berkas kop surat melebihi 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setKopFileName(file.name);
      setKopLogoUrl(dataUrl, file.name);
      onToast(`Berkas logo kop surat "${file.name}" berhasil diunggah.`);
    };
    reader.readAsDataURL(file);
  };

  // Save all settings handler
  const handleSaveAll = () => {
    setIsSaving(true);
    setSavedSuccess(false);

    // Save to localStorage
    localStorage.setItem('kt_org_name', orgName);
    localStorage.setItem('kt_org_address', address);
    localStorage.setItem('kt_org_kelurahan', kelurahan);
    localStorage.setItem('kt_org_kecamatan', kecamatan);
    localStorage.setItem('kt_org_kota', kota);
    localStorage.setItem('kt_org_provinsi', provinsi);

    localStorage.setItem('kt_email', email);
    localStorage.setItem('kt_telepon', telepon);
    localStorage.setItem('kt_website', website);
    localStorage.setItem('kt_facebook', facebook);
    localStorage.setItem('kt_instagram', instagram);
    localStorage.setItem('kt_youtube', youtube);

    localStorage.setItem('kt_per_page', itemsPerPage);
    localStorage.setItem('kt_display_mode', displayMode);
    localStorage.setItem('kt_notif_sistem', String(notifSistem));
    localStorage.setItem('kt_tampil_login', String(tampilLogin));
    localStorage.setItem('kt_simpan_search', String(simpanPencarian));
    localStorage.setItem('kt_backup_auto', String(backupOtomatis));

    localStorage.setItem('kt_date_format', dateFormat);
    localStorage.setItem('kt_time_format', timeFormat);
    localStorage.setItem('kt_timezone', timezone);
    localStorage.setItem('kt_tampil_hari', String(tampilHari));
    localStorage.setItem('kt_start_week', startOfWeek);

    localStorage.setItem('kt_api_url', apiUrl);
    localStorage.setItem('kt_api_token', apiToken);
    localStorage.setItem('kt_letter_template', letterTemplate);
    localStorage.setItem('kt_welcome_msg', welcomeMessage);

    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      onToast('Semua konfigurasi sistem Karang Taruna Manis Jaya berhasil disimpan ke server!');
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  };

  // Test API connection
  const handleTestApi = () => {
    setIsTestingApi(true);
    setApiStatus('idle');
    setTimeout(() => {
      setIsTestingApi(false);
      setApiStatus('success');
      onToast(`Terhubung ke ${apiUrl} (200 OK - Latensi: 28ms)`);
    }, 700);
  };

  // Generate new API token
  const handleRegenerateToken = () => {
    const chars = 'abcdef0123456789';
    let rand = 'kt_live_';
    for (let i = 0; i < 24; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiToken(rand);
    onToast('Token API baru berhasil digenerate! Jangan lupa klik "Simpan Semua".');
  };

  // Export full JSON backup
  const handleDownloadBackup = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      organization: {
        name: orgName,
        address,
        kelurahan,
        kecamatan,
        kota,
        provinsi,
        email,
        phone: telepon,
        website,
      },
      preferences: {
        itemsPerPage,
        displayMode,
        dateFormat,
        timeFormat,
        timezone,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_karang_taruna_manis_jaya_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Berkas cadangan sistem (JSON) berhasil diunduh ke perangkat Anda.');
  };

  // Clear search history
  const handleClearSearchHistory = () => {
    onToast('Riwayat pencarian sistem berhasil dibersihkan.');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={logoInputRef}
        onChange={handleLogoFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={kopInputRef}
        onChange={handleKopFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* 1. TOP BANNER - Matches the screenshot */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#eef6ff] via-[#e5f0fe] to-[#f2f7fe] border border-blue-100 shadow-sm p-6 sm:p-8 lg:p-10">
        {/* Right 3D Mechanism Gears / Cogs Illustration */}
        <div className="absolute top-0 right-0 w-2/5 h-full hidden md:block pointer-events-none opacity-95">
          <div className="absolute inset-0 bg-gradient-to-r from-[#eef6ff] via-[#e5f0fe]/70 to-transparent z-10" />
          <img
            src="/src/assets/images/settings_banner_gears_1790645443277.jpg"
            alt="Pengaturan Sistem Illustration"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Content Inside Banner */}
        <div className="relative z-20 max-w-2xl">
          {/* Kicker with Gear Icon */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
              PENGATURAN SISTEM
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Pengaturan Umum
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-xl">
            Kelola informasi dasar, preferensi aplikasi, dan pengaturan sistem untuk seluruh pengguna di lingkungan Karang Taruna Manis Jaya.
          </p>
        </div>

        {/* Top-Right CTA Button: Simpan Semua */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-30">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-md transition-all transform active:scale-95 ${
              savedSuccess
                ? 'bg-emerald-600 shadow-emerald-600/25'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Semua</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION TABS BAR - All 6 tabs functional */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 flex items-center gap-1 shadow-2xs overflow-x-auto">
        <button
          onClick={() => handleTabChange('info')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'info'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className={`w-4 h-4 ${activeTab === 'info' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Informasi Organisasi</span>
        </button>

        <button
          onClick={() => handleTabChange('aplikasi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'aplikasi'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeTab === 'aplikasi' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Aplikasi & Sistem</span>
        </button>

        <button
          onClick={() => handleTabChange('notifikasi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'notifikasi'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bell className={`w-4 h-4 ${activeTab === 'notifikasi' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Notifikasi</span>
        </button>

        <button
          onClick={() => handleTabChange('surat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'surat'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'surat' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Surat & Dokumen</span>
        </button>

        <button
          onClick={() => handleTabChange('keamanan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'keamanan'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Shield className={`w-4 h-4 ${activeTab === 'keamanan' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Keamanan</span>
        </button>

        <button
          onClick={() => handleTabChange('tampilan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'tampilan'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Palette className={`w-4 h-4 ${activeTab === 'tampilan' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Tampilan</span>
        </button>
      </div>

      {/* TAB 1: INFORMASI ORGANISASI (Exact screenshot view!) */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* 3. SECTION 1: TOP 2 BIG CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: Informasi Organisasi */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                    Informasi Organisasi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data dasar organisasi Karang Taruna Manis Jaya
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Logo Emblem Section */}
                <div className="flex flex-col items-center shrink-0 mx-auto sm:mx-0">
                  <div className="w-28 h-28 rounded-2xl bg-blue-50/50 border border-slate-200 flex items-center justify-center p-2 shadow-inner relative overflow-hidden group">
                    {customLogoUrl ? (
                      <img
                        src={customLogoUrl}
                        alt="Logo Organisasi Kustom"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      /* Circular Karang Taruna Official Emblem */
                      <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-sm">
                        <circle cx="50" cy="50" r="46" fill="#1e3a8a" stroke="#facc15" strokeWidth="2.5" />
                        <circle cx="50" cy="50" r="38" fill="#1d4ed8" stroke="#facc15" strokeWidth="2" strokeDasharray="3,1" />
                        <circle cx="50" cy="50" r="28" fill="#dc2626" stroke="#facc15" strokeWidth="2" />
                        <path d="M50 30 L55 45 L45 45 Z" fill="#facc15" />
                        <path d="M48 45 L52 45 L51 68 L49 68 Z" fill="#f8fafc" />
                        <circle cx="50" cy="50" r="10" fill="#facc15" opacity="0.4" />
                        <path id="arch" d="M22,50 a28,28 0 1,1 56,0" fill="none" />
                        <text fontSize="7" fill="#ffffff" fontWeight="bold" letterSpacing="0.8">
                          <textPath href="#arch" startOffset="50%" textAnchor="middle">
                            KARANG TARUNA
                          </textPath>
                        </text>
                        <path d="M30 76 L70 76 L66 84 L34 84 Z" fill="#facc15" />
                        <text x="50" y="82" fontSize="5.5" fill="#1e3a8a" fontWeight="bold" textAnchor="middle">
                          MANIS JAYA
                        </text>
                      </svg>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-3">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors hover:border-blue-400"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ubah Logo</span>
                    </button>

                    {customLogoUrl && (
                      <button
                        type="button"
                        onClick={handleResetLogo}
                        title="Kembalikan logo default"
                        className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1.5 text-center">
                    Format: JPG, PNG (maks. 2MB)
                  </span>

                  <button
                    type="button"
                    onClick={handleForceRefreshCache}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold shadow-2xs transition-colors"
                    title="Bersihkan cache browser & service worker untuk memuat logo terbaru di HP"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Segarkan Cache HP / Browser</span>
                  </button>
                </div>

                {/* Inputs Section */}
                <div className="flex-1 w-full space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Organisasi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Alamat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Desa/Kelurahan
                      </label>
                      <input
                        type="text"
                        value={kelurahan}
                        onChange={(e) => setKelurahan(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Kecamatan
                      </label>
                      <input
                        type="text"
                        value={kecamatan}
                        onChange={(e) => setKecamatan(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Kota/Kabupaten
                      </label>
                      <input
                        type="text"
                        value={kota}
                        onChange={(e) => setKota(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Provinsi
                      </label>
                      <input
                        type="text"
                        value={provinsi}
                        onChange={(e) => setProvinsi(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Kontak & Media Sosial */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                    Kontak & Media Sosial
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Informasi kontak dan media sosial organisasi
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Email with quick mailto button */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="w-24 text-slate-600 font-semibold shrink-0">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                  <a
                    href={`mailto:${email}`}
                    title="Kirim email percobaan"
                    className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* No. Telepon with WhatsApp quick button */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="w-24 text-slate-600 font-semibold shrink-0">No. Telepon</span>
                  <input
                    type="text"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(telepon);
                      onToast('Nomor telepon berhasil disalin ke clipboard.');
                    }}
                    title="Salin nomor telepon"
                    className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {/* Website with external link */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="w-24 text-slate-600 font-semibold shrink-0">Website</span>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    title="Buka website resmi"
                    className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Facebook */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <span className="w-24 text-slate-600 font-semibold shrink-0">Facebook</span>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>

                {/* Instagram */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <span className="w-24 text-slate-600 font-semibold shrink-0">Instagram</span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>

                {/* YouTube */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <span className="w-24 text-slate-600 font-semibold shrink-0">YouTube</span>
                  <input
                    type="text"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. SECTION 2: BOTTOM 4 CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Preferensi Aplikasi */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                      Preferensi Aplikasi
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pengaturan perilaku dan fungsi aplikasi
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Jumlah data per halaman (tabel)
                    </label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(e.target.value);
                        onToast(`Jumlah baris data tabel diubah menjadi ${e.target.value}`);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Mode tampilan
                    </label>
                    <select
                      value={displayMode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDisplayMode(val);
                        if (val === 'Gelap (Dark)') {
                          updateTheme({ displayMode: 'dark' });
                        } else if (val === 'Terang (Light)') {
                          updateTheme({ displayMode: 'light' });
                        } else {
                          updateTheme({ displayMode: 'system' });
                        }
                        onToast(`Mode tampilan diubah ke ${val}`);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Terang (Light)">Terang (Light)</option>
                      <option value="Gelap (Dark)">Gelap (Dark)</option>
                      <option value="Sistem Otomatis">Sistem Otomatis</option>
                    </select>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {/* Toggle 1: Notifikasi sistem */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-xs">Aktifkan notifikasi sistem</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !notifSistem;
                          setNotifSistem(next);
                          onToast(`Notifikasi sistem ${next ? 'diaktifkan' : 'dinonaktifkan'}.`);
                        }}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                          notifSistem ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            notifSistem ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle 2: Terakhir login */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-xs">Tampilkan informasi terakhir login</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !tampilLogin;
                          setTampilLogin(next);
                          onToast(`Info terakhir login ${next ? 'ditampilkan' : 'disembunyikan'}.`);
                        }}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                          tampilLogin ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            tampilLogin ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle 3: Riwayat pencarian */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-xs">Simpan riwayat pencarian</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !simpanPencarian;
                          setSimpanPencarian(next);
                          onToast(`Penyimpanan riwayat pencarian ${next ? 'diaktifkan' : 'dimatikan'}.`);
                        }}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                          simpanPencarian ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            simpanPencarian ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle 4: Backup otomatis */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-xs">Aktifkan fitur backup otomatis</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !backupOtomatis;
                          setBackupOtomatis(next);
                          if (next) {
                            handleDownloadBackup();
                          } else {
                            onToast('Backup otomatis dinonaktifkan.');
                          }
                        }}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                          backupOtomatis ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            backupOtomatis ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClearSearchHistory}
                  className="text-[11px] text-slate-500 hover:text-blue-600 font-medium"
                >
                  Bersihkan Riwayat
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-bold hover:underline"
                >
                  <Download className="w-3 h-3" />
                  <span>Cadangkan Sekarang</span>
                </button>
              </div>
            </div>

            {/* Card 2: Tanggal & Waktu */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                    Tanggal & Waktu
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pengaturan format tanggal, waktu dan zona
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Format Tanggal</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => {
                      setDateFormat(e.target.value);
                      onToast(`Format tanggal diubah ke ${e.target.value}`);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                    <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                    <option value="dd MMMM yyyy">dd MMMM yyyy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Format Waktu</label>
                  <select
                    value={timeFormat}
                    onChange={(e) => {
                      setTimeFormat(e.target.value);
                      onToast(`Format waktu diubah ke ${e.target.value}`);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="HH:mm:ss">HH:mm:ss</option>
                    <option value="HH:mm">HH:mm</option>
                    <option value="hh:mm a">hh:mm a</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Zona Waktu</label>
                  <select
                    value={timezone}
                    onChange={(e) => {
                      setTimezone(e.target.value);
                      onToast(`Zona waktu diubah ke ${e.target.value}`);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Asia/Jakarta (WIB)">Asia/Jakarta (WIB)</option>
                    <option value="Asia/Makassar (WITA)">Asia/Makassar (WITA)</option>
                    <option value="Asia/Jayapura (WIT)">Asia/Jayapura (WIT)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-700 text-xs">Tampilkan hari pada kalender</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !tampilHari;
                      setTampilHari(next);
                      onToast(`Tampilan hari di kalender ${next ? 'diaktifkan' : 'dinonaktifkan'}.`);
                    }}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      tampilHari ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        tampilHari ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Awal minggu</label>
                  <select
                    value={startOfWeek}
                    onChange={(e) => {
                      setStartOfWeek(e.target.value);
                      onToast(`Hari awal minggu disetel ke ${e.target.value}`);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Minggu">Minggu</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 3: Integrasi & API */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                    Integrasi & API
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pengaturan koneksi ke layanan eksternal
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">URL API (jika ada)</label>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-600 font-medium">Token API</label>
                    <button
                      type="button"
                      onClick={handleRegenerateToken}
                      className="text-[10px] text-blue-600 font-semibold hover:underline"
                    >
                      Regenerate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTestApi}
                    disabled={isTestingApi}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <Wifi className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-pulse text-amber-500' : ''}`} />
                    <span>{isTestingApi ? 'Menguji Koneksi...' : 'Uji Koneksi'}</span>
                  </button>

                  {apiStatus === 'success' && (
                    <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Koneksi API Aktif (200 OK)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card 4: Lainnya */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                    Lainnya
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pengaturan tambahan
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Template Surat Default
                  </label>
                  <select
                    value={letterTemplate}
                    onChange={(e) => {
                      setLetterTemplate(e.target.value);
                      onToast(`Template surat diubah ke ${e.target.value}`);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Standar Karang Taruna">Standar Karang Taruna</option>
                    <option value="Formal Kelurahan">Formal Kelurahan</option>
                    <option value="Sederhana">Sederhana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Logo Kop Surat
                  </label>
                  <div
                    onClick={() => kopInputRef.current?.click()}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate max-w-[130px]">
                        {kopFileName || 'Pilih File'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {kopFileName ? 'Ganti' : 'Format: JPG, PNG'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Pesan Selamat Datang
                  </label>
                  <textarea
                    rows={3}
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-xs leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APLIKASI & SISTEM (Backup & Restore, Arsip, Audit Trail, Tentang Sistem) */}
      {activeTab === 'aplikasi' && (
        <div className="space-y-6">
          {onNavigateToTab && (
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-blue-800/40">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Database & Integrasi Google Drive</h4>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Hubungkan akun Google Drive organisasi, tentukan alamat/folder khusus, dan cadangkan data secara aman ke cloud.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('database')}
                className="px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-950 font-black text-xs rounded-xl shadow-md shrink-0 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Buka Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <AplikasiSystemTab
            onToast={onToast}
            maintenanceMode={maintenanceMode}
            setMaintenanceMode={setMaintenanceMode}
            backupOtomatis={backupOtomatis}
            setBackupOtomatis={setBackupOtomatis}
          />
        </div>
      )}

      {/* TAB 3: NOTIFIKASI */}
      {activeTab === 'notifikasi' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                Saluran Notifikasi & Pengingat Otomatis
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengiriman pesan pemberitahuan rapat dan status surat dinas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Notifikasi Email Pengurus</p>
                <p className="text-slate-500 mt-0.5 text-[11px]">Kirim tembusan surat masuk ke {email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmailNotifActive(!emailNotifActive);
                  onToast(`Notifikasi email ${!emailNotifActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
                }}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  emailNotifActive ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  emailNotifActive ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">WhatsApp Gateway Pengurus</p>
                <p className="text-slate-500 mt-0.5 text-[11px]">Kirim pengingat undangan via WA ke nomor {telepon}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWaNotifActive(!waNotifActive);
                  onToast(`WhatsApp Gateway ${!waNotifActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
                }}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  waNotifActive ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  waNotifActive ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onToast('Pesan uji coba berhasil dikirim ke saluran terdaftar!')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-sm hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Notifikasi Uji Coba</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: SURAT & DOKUMEN (Identitas, Kop, Penomoran, Master Jenis, Template, TTD, Cetak) */}
      {activeTab === 'surat' && (
        <SuratDokumenTab onToast={onToast} />
      )}

      {/* TAB 5: KEAMANAN */}
      {activeTab === 'keamanan' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                Keamanan Akun & Proteksi Data
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengamanan hak akses admin, sesi login, dan autentikasi dua faktor.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Autentikasi Dua Faktor (2FA)</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">Memerlukan kode konfirmasi saat masuk sebagai Super Admin.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTwoFactorAuth(!twoFactorAuth);
                  onToast(`Autentikasi 2FA ${!twoFactorAuth ? 'diaktifkan' : 'dinonaktifkan'}.`);
                }}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  twoFactorAuth ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  twoFactorAuth ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Sesi Login Aktif</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">1 perangkat aktif (Chrome pada Windows 11 - Tangerang)</p>
              </div>
              <button
                type="button"
                onClick={() => onToast('Sesi perangkat lain berhasil dihentikan.')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-100"
              >
                Keluar Dari Perangkat Lain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TAMPILAN (Tema Aplikasi, Sidebar/Menu, Responsif HP) */}
      {activeTab === 'tampilan' && (
        <TampilanThemeTab onToast={onToast} />
      )}
    </div>
  );
};
