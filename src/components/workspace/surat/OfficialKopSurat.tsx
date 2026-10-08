import React, { useState, useEffect } from 'react';
import { useBranding } from '../../../context/BrandingContext';
import { BrandLogo } from '../BrandLogo';

interface OfficialKopSuratProps {
  className?: string;
  isCompact?: boolean;
  customLogo?: string;
  customLogoKanan?: string;
  customNamaOrg?: string;
  customNamaWilayah?: string;
  customAlamat?: string;
  customKontak?: string;
}

// Logo Karang Taruna Resmi Vektor Cadangan (Fallback jika belum ada logo yang diunggah)
const OfficialKarangTarunaEmblem: React.FC = () => (
  <BrandLogo size="lg" className="w-full h-full" />
);

export const OfficialKopSurat: React.FC<OfficialKopSuratProps> = ({
  className = '',
  isCompact = false,
  customLogo,
  customLogoKanan,
  customNamaOrg,
  customNamaWilayah,
  customAlamat,
  customKontak,
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

  // Ukuran Logo & Header yang proporsional dan pas
  const logoDimension = isCompact
    ? 'w-14 h-14'
    : 'w-16 h-16 sm:w-[72px] sm:h-[72px]';

  return (
    <div className={`w-full font-serif text-slate-900 kop-surat-container break-inside-avoid ${className}`}>
      <div className="flex items-center justify-between gap-3 sm:gap-4 pb-1">
        {/* =================================================================== */}
        {/* LOGO UTAMA (KIRI) SESUAI PENGATURAN UMUM & SURAT DOKUMEN           */}
        {/* =================================================================== */}
        <div
          className={`${logoDimension} shrink-0 flex items-center justify-center p-0.5`}
        >
          {logoUtamaKiri && !imgErrorKiri ? (
            <img
              src={logoUtamaKiri}
              alt="Logo Utama Kiri"
              className="w-full h-full object-contain drop-shadow-xs"
              onError={() => setImgErrorKiri(true)}
            />
          ) : (
            <OfficialKarangTarunaEmblem />
          )}
        </div>

        {/* =================================================================== */}
        {/* TEKS KOP SURAT RESMI: UKURAN PAS & PRESISI DENGAN LOGO              */}
        {/* =================================================================== */}
        <div className="text-center flex-1 min-w-0 px-1">
          <h1
            className={`${
              isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg md:text-[18px]'
            } font-black uppercase tracking-wide text-black leading-tight font-sans`}
            style={{ fontFamily: '"Arial", "Helvetica", sans-serif' }}
          >
            {customNamaOrg || 'KARANG TARUNA MANIS JAYA'}
          </h1>
          <h2
            className={`${
              isCompact ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-[13px]'
            } font-bold uppercase tracking-wider text-black mt-0.5 leading-tight font-sans`}
            style={{ fontFamily: '"Arial", "Helvetica", sans-serif' }}
          >
            {customNamaWilayah || 'KEC. JATIUWUNG KOTA TANGERANG'}
          </h2>
          <p
            className={`${
              isCompact ? 'text-[9px]' : 'text-[10px] sm:text-[11px]'
            } text-black leading-tight mt-1 font-serif`}
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {customAlamat || 'Sekretariat : JL. Rumah Susun, Kp. Cikoneng Girang, Kel. Manis Jaya, Kec. Jatiuwung'}
          </p>
          <p
            className={`${
              isCompact ? 'text-[8.5px]' : 'text-[9.5px] sm:text-[10px]'
            } text-black leading-tight font-serif mt-0.5`}
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            Kota Tangerang, Banten 15136 &bull; Email:{' '}
            <span className="text-black underline">karangtarunamanisjaya@gmail.com</span>
          </p>
          <p
            className={`${
              isCompact ? 'text-[8.5px]' : 'text-[9px] sm:text-[9.5px]'
            } text-black leading-tight flex items-center justify-center gap-1.5 flex-wrap mt-0.5 font-serif`}
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            <span>Hp 0838-9786-9234, 0878-0861-1626</span>
            <span className="inline-flex items-center gap-0.5">
              <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-[#1877f2] text-white text-[8px] font-black leading-none">
                f
              </span>
              <span className="font-semibold">Karang Taruna Manis Jaya</span>
            </span>
          </p>
        </div>

        {/* =================================================================== */}
        {/* LOGO TAMBAHAN (KANAN) ATAU PENYEIMBANG SIMETRIS UKURAN PAS         */}
        {/* =================================================================== */}
        {logoTambahanKanan && !imgErrorKanan ? (
          <div
            className={`${logoDimension} shrink-0 flex items-center justify-center p-0.5`}
          >
            <img
              src={logoTambahanKanan}
              alt="Logo Tambahan Kanan"
              className="w-full h-full object-contain drop-shadow-xs"
              onError={() => setImgErrorKanan(true)}
            />
          </div>
        ) : (
          <div
            className={`${logoDimension} shrink-0 hidden sm:block pointer-events-none opacity-0 select-none`}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Garis Pembatas Kop Surat Resmi Standar Ganda/Tunggal (Pas & Rapi) */}
      <div
        className="w-full mt-1.5 mb-3 print:mt-1 print:mb-2 border-b-[2.5px] border-black"
        style={{ borderBottomStyle: 'double', borderBottomWidth: '3.5px' }}
      />
    </div>
  );
};
