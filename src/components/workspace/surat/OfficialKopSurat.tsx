import React, { useState, useEffect } from 'react';
import { useBranding } from '../../../context/BrandingContext';

interface OfficialKopSuratProps {
  className?: string;
  isCompact?: boolean;
  customLogo?: string;
  customLogoKanan?: string;
}

// Logo Karang Taruna Resmi Vektor Cadangan (Fallback jika belum ada logo yang diunggah)
const OfficialKarangTarunaEmblem: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
    {/* Outer golden lotus petals */}
    <circle cx="50" cy="50" r="46" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
    <path
      d="M50 4 C58 16 68 20 80 20 C80 32 84 42 96 50 C84 58 80 68 80 80 C68 80 58 84 50 96 C42 84 32 80 20 80 C20 68 16 58 4 50 C16 42 20 32 20 20 C32 20 42 16 50 4 Z"
      fill="#fbbf24"
      stroke="#d97706"
      strokeWidth="1.2"
    />
    {/* Red Inner Shield / Base */}
    <circle cx="50" cy="50" r="36" fill="#dc2626" stroke="#fef08a" strokeWidth="2" />
    {/* Central White / Blue circular emblem */}
    <circle cx="50" cy="50" r="26" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="23" fill="#ffffff" />
    {/* Golden Torch & Wings */}
    <path d="M46 62 L54 62 L52 42 L48 42 Z" fill="#f59e0b" />
    <path d="M44 42 L56 42 L50 28 Z" fill="#ef4444" />
    <circle cx="50" cy="38" r="4" fill="#fbbf24" />
    {/* Flame rays */}
    <path d="M50 24 L52 29 L48 29 Z" fill="#dc2626" />
    <path d="M42 32 L46 34 L43 36 Z" fill="#f59e0b" />
    <path d="M58 32 L54 34 L57 36 Z" fill="#f59e0b" />
    {/* Lower Ribbon with Text */}
    <path d="M24 66 Q50 74 76 66 L74 74 Q50 82 26 74 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
    <text x="50" y="73" fontSize="4.8" fill="#1e3a8a" fontWeight="900" textAnchor="middle" letterSpacing="0.4">
      KARANG TARUNA
    </text>
  </svg>
);

export const OfficialKopSurat: React.FC<OfficialKopSuratProps> = ({
  className = '',
  isCompact = false,
  customLogo,
  customLogoKanan,
}) => {
  const { logoUrl, kopLogoUrl } = useBranding();

  // Resolusi Logo Utama (Kiri) sesuai hirarki:
  // 1. Props customLogo
  // 2. Menu Surat & Dokumen -> Logo Utama (Kiri) ('kt_doc_logo_org')
  // 3. Menu Pengaturan Umum -> Logo Kop Surat (kopLogoUrl / 'kt_kop_logo')
  // 4. Menu Pengaturan Umum -> Logo Organisasi (logoUrl / 'kt_custom_logo')
  const [logoUtamaKiri, setLogoUtamaKiri] = useState<string>(() => {
    return (
      customLogo ||
      localStorage.getItem('kt_doc_logo_org') ||
      kopLogoUrl ||
      logoUrl ||
      localStorage.getItem('kt_kop_logo') ||
      localStorage.getItem('kt_custom_logo') ||
      ''
    );
  });

  // Resolusi Logo Tambahan (Kanan) dari Menu Surat & Dokumen ('kt_doc_logo_tambahan')
  const [logoTambahanKanan, setLogoTambahanKanan] = useState<string>(() => {
    return (
      customLogoKanan ||
      localStorage.getItem('kt_doc_logo_tambahan') ||
      ''
    );
  });

  const [imgErrorKiri, setImgErrorKiri] = useState(false);
  const [imgErrorKanan, setImgErrorKanan] = useState(false);

  // Sync saat ada perubahan di context atau local storage
  useEffect(() => {
    const docLogoOrg = localStorage.getItem('kt_doc_logo_org');
    const customLogoStorage = localStorage.getItem('kt_custom_logo');
    const kopLogoStorage = localStorage.getItem('kt_kop_logo');
    const resolved =
      customLogo ||
      docLogoOrg ||
      kopLogoUrl ||
      logoUrl ||
      kopLogoStorage ||
      customLogoStorage ||
      '';
    setLogoUtamaKiri(resolved);
    setImgErrorKiri(false);
  }, [customLogo, logoUrl, kopLogoUrl]);

  useEffect(() => {
    const docLogoTambahan = localStorage.getItem('kt_doc_logo_tambahan');
    setLogoTambahanKanan(customLogoKanan || docLogoTambahan || '');
    setImgErrorKanan(false);
  }, [customLogoKanan]);

  return (
    <div className={`w-full font-serif text-slate-900 ${className}`}>
      <div className="flex items-center justify-between gap-3 sm:gap-4 pb-2">
        {/* =================================================================== */}
        {/* LOGO UTAMA (KIRI) SESUAI PENGATURAN UMUM & SURAT DOKUMEN           */}
        {/* =================================================================== */}
        <div
          className={`${
            isCompact ? 'w-16 h-16' : 'w-20 h-20 sm:w-24 sm:h-24'
          } shrink-0 flex items-center justify-center p-0.5`}
        >
          {logoUtamaKiri && !imgErrorKiri ? (
            <img
              src={logoUtamaKiri}
              alt="Logo Utama Kiri"
              className="max-w-full max-h-full object-contain drop-shadow-xs"
              onError={() => setImgErrorKiri(true)}
            />
          ) : (
            <OfficialKarangTarunaEmblem />
          )}
        </div>

        {/* =================================================================== */}
        {/* TEKS KOP SURAT RESMI (100% PERSIS FORMAT GAMBAR CONTOH)             */}
        {/* =================================================================== */}
        <div className="text-center flex-1 min-w-0 px-1">
          <h1
            className={`${
              isCompact ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl'
            } font-black uppercase tracking-normal text-black leading-tight font-sans`}
            style={{ fontFamily: '"Arial", "Helvetica", sans-serif' }}
          >
            KARANG TARUNA MANIS JAYA
          </h1>
          <h2
            className={`${
              isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-lg'
            } font-bold uppercase tracking-wider text-black mt-0.5 leading-tight font-sans`}
            style={{ fontFamily: '"Arial", "Helvetica", sans-serif' }}
          >
            KEC. JATIUWUNG KOTA TANGERANG
          </h2>
          <p
            className={`${
              isCompact ? 'text-[9px]' : 'text-[10.5px] sm:text-[12px]'
            } text-black leading-snug mt-1 font-sans`}
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            Sekertariat : JL. Rumah Susun, Kp. Cikoneng Girang, Kel. Manis Jaya, Kec. Jatiuwung
          </p>
          <p
            className={`${
              isCompact ? 'text-[9px]' : 'text-[10.5px] sm:text-[12px]'
            } text-black leading-snug font-sans`}
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            Kota Tangerang,Banten 15136 Email :{' '}
            <span className="text-blue-800 underline">karangtarunamanisjaya@gmail.com</span>
          </p>
          <p
            className={`${
              isCompact ? 'text-[9px]' : 'text-[10.5px] sm:text-[12px]'
            } text-black leading-snug flex items-center justify-center gap-1.5 flex-wrap mt-0.5 font-sans`}
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            <span>Hp 0838-9786-9234, 0878-0861-1626</span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#1877f2] text-white text-[9px] font-black leading-none">
                f
              </span>
              <span className="font-semibold">Karang Taruna Manis Jaya</span>
            </span>
          </p>
        </div>

        {/* =================================================================== */}
        {/* LOGO TAMBAHAN (KANAN) JIKA ADA ATAU CONTAINER PENYEIMBANG          */}
        {/* =================================================================== */}
        {logoTambahanKanan && !imgErrorKanan ? (
          <div
            className={`${
              isCompact ? 'w-16 h-16' : 'w-20 h-20 sm:w-24 sm:h-24'
            } shrink-0 flex items-center justify-center p-0.5`}
          >
            <img
              src={logoTambahanKanan}
              alt="Logo Tambahan Kanan"
              className="max-w-full max-h-full object-contain drop-shadow-xs"
              onError={() => setImgErrorKanan(true)}
            />
          </div>
        ) : (
          <div
            className={`${
              isCompact ? 'w-16 h-16' : 'w-20 h-20 sm:w-24 sm:h-24'
            } shrink-0 hidden sm:block pointer-events-none opacity-0 select-none`}
          />
        )}
      </div>

      {/* Garis Pembatas Kop Surat Tebal Hitam Sesuai Gambar */}
      <div className="border-b-[2.5px] border-black w-full mt-1 mb-5" />
    </div>
  );
};
