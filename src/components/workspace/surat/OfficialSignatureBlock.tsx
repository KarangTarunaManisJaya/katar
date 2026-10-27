import React from 'react';
import { getDefaultSuratPenandatangan, getDatabaseMembers } from '../../../utils/memberHelpers';

export interface SignatoryItem {
  nama: string;
  jabatan?: string;
  ktaNo?: string;
  signatureUrl?: string;
  digitalSignatureUrl?: string;
}

interface OfficialSignatureBlockProps {
  className?: string;
  signatories?: SignatoryItem[];
  ketuaTitle?: string;
  ketuaName?: string;
  sekretarisTitle?: string;
  sekretarisName?: string;
  showTembusan?: boolean;
  tembusanList?: string[];
  withStamp?: boolean; // Disetel false / dihilangkan sesuai permintaan user
  organizationName?: string;
}

const renderSigName = (nama?: string) => {
  if (nama && nama.trim()) {
    return nama;
  }
  return '( ..................................... )';
};

const renderSigGraphic = (sig: SignatoryItem, _idx?: number) => {
  if (!sig.nama || !sig.nama.trim()) {
    return <div className="w-28 h-12 border-b border-dashed border-slate-300 print:border-black/30" />;
  }
  const sigUrl = sig.signatureUrl || sig.digitalSignatureUrl;
  if (sigUrl) {
    return (
      <div className="h-12 sm:h-14 print:h-11 flex items-center justify-center">
        <img
          src={sigUrl}
          alt={`Tanda Tangan Digital ${sig.nama}`}
          className="max-h-full max-w-[140px] object-contain mx-auto"
        />
      </div>
    );
  }
  // Garis tanda tangan fisik bersih dan rapi
  return <div className="w-28 h-12 border-b border-slate-400 print:border-black" />;
};

export const OfficialSignatureBlock: React.FC<OfficialSignatureBlockProps> = ({
  className = '',
  signatories,
  ketuaTitle,
  ketuaName,
  sekretarisTitle,
  sekretarisName,
  showTembusan = true,
  tembusanList = [
    'Pembina Karang Taruna',
    'Arsip',
  ],
  organizationName = 'Karang Taruna Manis Jaya',
}) => {
  // Selesaikan daftar penandatangan aktual secara dinamis sesuai database anggota & tanda tangan digital
  const activeSignatories: SignatoryItem[] = React.useMemo(() => {
    const members = getDatabaseMembers();

    const findSigFor = (name?: string, role?: string) => {
      if (!name && !role) return '';
      const nLower = (name || '').toLowerCase().trim();
      const rLower = (role || '').toLowerCase().trim();
      const m = members.find((item) => {
        const itemN = (item.name || '').toLowerCase().trim();
        const itemR = (item.jabatan || '').toLowerCase().trim();
        return (nLower && itemN === nLower) || (rLower && itemR === rLower);
      });
      return m?.signatureUrl || (m as any)?.digitalSignatureUrl || '';
    };

    if (signatories && Array.isArray(signatories) && signatories.length > 0) {
      return signatories.map((s) => ({
        ...s,
        signatureUrl: s.signatureUrl || s.digitalSignatureUrl || findSigFor(s.nama, s.jabatan),
      }));
    }

    const result: SignatoryItem[] = [];
    if (ketuaName !== undefined) {
      result.push({
        nama: ketuaName,
        jabatan: ketuaTitle || 'Ketua Pelaksana',
        signatureUrl: findSigFor(ketuaName, ketuaTitle),
      });
    }
    if (sekretarisName !== undefined) {
      result.push({
        nama: sekretarisName,
        jabatan: sekretarisTitle || 'Sekretaris',
        signatureUrl: findSigFor(sekretarisName, sekretarisTitle),
      });
    }
    if (result.length > 0) {
      return result;
    }

    // Mengambil dari database anggota resmi atau kosong jika belum terdaftar
    const defaults = getDefaultSuratPenandatangan(members);
    return defaults.map((d) => ({
      nama: d.nama || '',
      jabatan: d.jabatan,
      ktaNo: d.ktaNo || '',
      signatureUrl: d.digitalSignatureUrl || d.signatureUrl || findSigFor(d.nama, d.jabatan),
    }));
  }, [signatories, ketuaTitle, ketuaName, sekretarisTitle, sekretarisName]);

  const count = activeSignatories.length;

  return (
    <div
      className={`w-full font-serif text-slate-900 select-none official-signature-block break-inside-avoid ${className}`}
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* KASUS 1 PENANDATANGAN (Surat Tugas / Rekomendasi / SK Tunggal)     */}
      {/* ------------------------------------------------------------------ */}
      {count === 1 && (
        <div className="w-full flex justify-end my-3 sm:my-4 print:my-2 pr-4 sm:pr-8">
          <div className="flex flex-col items-center text-center w-52 sm:w-56 relative">
            <div className="mb-1.5 sm:mb-2 print:mb-1">
              <p className="text-xs sm:text-sm text-black">Hormat kami :</p>
              <p className="text-xs sm:text-sm font-semibold text-black">{organizationName}</p>
              <p className="text-xs sm:text-sm font-medium text-black mt-1 sm:mt-1.5">
                {activeSignatories[0].jabatan || 'Ketua'}
              </p>
            </div>
            <div className="h-14 sm:h-16 print:h-12 flex items-center justify-center relative w-full">
              {renderSigGraphic(activeSignatories[0], 0)}
            </div>
            <p className="text-xs sm:text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1 min-w-[130px]">
              {renderSigName(activeSignatories[0].nama)}
            </p>
            {activeSignatories[0].ktaNo ? (
              <p className="text-[9px] sm:text-[10px] text-slate-700 font-mono mt-0.5">
                KTA: {activeSignatories[0].ktaNo}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* KASUS 2 PENANDATANGAN (2 Kolom: Kiri & Kanan - Tanpa Stempel)      */}
      {/* ------------------------------------------------------------------ */}
      {count === 2 && (
        <div className="flex flex-col items-center justify-center my-3 sm:my-4 print:my-2">
          <div className="text-center mb-2 sm:mb-3 print:mb-1.5">
            <p className="text-xs sm:text-sm text-black">Hormat kami :</p>
            <p className="text-xs sm:text-sm font-semibold text-black">{organizationName}</p>
          </div>

          <div className="w-full max-w-xl mx-auto flex items-start justify-between px-2 sm:px-6">
            {/* Kolom Kiri: Penandatangan 1 */}
            <div className="flex flex-col items-center text-center w-44 sm:w-48">
              <p className="text-xs sm:text-sm font-medium text-black mb-1 sm:mb-1.5">
                {activeSignatories[0].jabatan || 'Ketua Pelaksana'}
              </p>
              <div className="h-14 sm:h-16 print:h-12 flex items-center justify-center relative">
                {renderSigGraphic(activeSignatories[0], 0)}
              </div>
              <p className="text-xs sm:text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1 min-w-[130px]">
                {renderSigName(activeSignatories[0].nama)}
              </p>
              {activeSignatories[0].ktaNo ? (
                <p className="text-[9px] sm:text-[10px] text-slate-700 font-mono mt-0.5">
                  KTA: {activeSignatories[0].ktaNo}
                </p>
              ) : null}
            </div>

            {/* Kolom Kanan: Penandatangan 2 */}
            <div className="flex flex-col items-center text-center w-44 sm:w-48">
              <p className="text-xs sm:text-sm font-medium text-black mb-1 sm:mb-1.5">
                {activeSignatories[1].jabatan || 'Sekretaris'}
              </p>
              <div className="h-14 sm:h-16 print:h-12 flex items-center justify-center relative">
                {renderSigGraphic(activeSignatories[1], 1)}
              </div>
              <p className="text-xs sm:text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1 min-w-[130px]">
                {renderSigName(activeSignatories[1].nama)}
              </p>
              {activeSignatories[1].ktaNo ? (
                <p className="text-[9px] sm:text-[10px] text-slate-700 font-mono mt-0.5">
                  KTA: {activeSignatories[1].ktaNo}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* KASUS 3 PENANDATANGAN (3 Kolom Sejajar Bersih)                     */}
      {/* ------------------------------------------------------------------ */}
      {count === 3 && (
        <div className="flex flex-col items-center justify-center my-3 sm:my-4 print:my-2">
          <div className="text-center mb-2 sm:mb-3 print:mb-1.5">
            <p className="text-xs sm:text-sm text-black">Hormat kami :</p>
            <p className="text-xs sm:text-sm font-semibold text-black">{organizationName}</p>
          </div>

          <div className="w-full max-w-2xl mx-auto grid grid-cols-3 gap-2 sm:gap-3 px-2">
            {activeSignatories.map((sig, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <p className="text-xs sm:text-sm font-medium text-black mb-1 sm:mb-1.5">{sig.jabatan || 'Pengurus'}</p>
                <div className="h-14 sm:h-16 print:h-12 flex items-center justify-center relative">
                  {renderSigGraphic(sig, idx)}
                </div>
                <p className="text-xs sm:text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1 min-w-[120px]">
                  {renderSigName(sig.nama)}
                </p>
                {sig.ktaNo ? (
                  <p className="text-[9px] sm:text-[10px] text-slate-700 font-mono mt-0.5">KTA: {sig.ktaNo}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* KASUS 4 ATAU LEBIH PENANDATANGAN (Pengurus Pelaksana + Mengetahui) */}
      {/* ------------------------------------------------------------------ */}
      {count >= 4 && (
        <div className="flex flex-col items-center justify-center my-3 sm:my-4 print:my-2 space-y-4 sm:space-y-5">
          {/* Baris 1: Pelaksana (Ketua & Sekretaris) */}
          <div className="w-full">
            <div className="text-center mb-2 sm:mb-3 print:mb-1.5">
              <p className="text-xs sm:text-sm text-black">Hormat kami :</p>
              <p className="text-xs sm:text-sm font-semibold text-black">{organizationName}</p>
            </div>

            <div className="w-full max-w-xl mx-auto flex items-start justify-between px-2 sm:px-6">
              {/* Kolom 1 */}
              <div className="flex flex-col items-center text-center w-44 sm:w-48">
                <p className="text-xs sm:text-sm font-medium text-black mb-1 sm:mb-1.5">
                  {activeSignatories[0].jabatan || 'Ketua Pelaksana'}
                </p>
                <div className="h-14 sm:h-16 print:h-12 flex items-center justify-center relative">
                  {renderSigGraphic(activeSignatories[0], 0)}
                </div>
                <p className="text-xs sm:text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1 min-w-[130px]">
                  {renderSigName(activeSignatories[0].nama)}
                </p>
                {activeSignatories[0].ktaNo ? (
                  <p className="text-[9px] sm:text-[10px] text-slate-700 font-mono mt-0.5">
                    KTA: {activeSignatories[0].ktaNo}
                  </p>
                ) : null}
              </div>

              {/* Kolom 2 */}
              <div className="flex flex-col items-center text-center w-44 sm:w-48">
                <p className="text-xs sm:text-sm font-medium text-black mb-1 sm:mb-1.5">
                  {activeSignatories[1].jabatan || 'Sekretaris'}
                </p>
                <div className="h-14 sm:h-16 print:h-12 flex items-center justify-center relative">
                  {renderSigGraphic(activeSignatories[1], 1)}
                </div>
                <p className="text-xs sm:text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1 min-w-[130px]">
                  {renderSigName(activeSignatories[1].nama)}
                </p>
                {activeSignatories[1].ktaNo ? (
                  <p className="text-[9px] sm:text-[10px] text-slate-700 font-mono mt-0.5">
                    KTA: {activeSignatories[1].ktaNo}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Baris 2: Mengetahui / Pejabat Tambahan */}
          <div className="w-full pt-1.5">
            <div className="text-center mb-2">
              <p className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-black">
                Mengetahui / Menyetujui :
              </p>
            </div>
            <div className="w-full max-w-xl mx-auto flex items-start justify-around px-2 sm:px-4">
              {activeSignatories.slice(2).map((sig, idx) => (
                <div key={idx} className="flex flex-col items-center text-center w-44 sm:w-48">
                  <p className="text-xs sm:text-sm font-medium text-black mb-1 sm:mb-1.5">
                    {sig.jabatan || 'Pembina'}
                  </p>
                  <div className="h-14 sm:h-16 print:h-12 flex items-center justify-center relative">
                    {renderSigGraphic(sig, idx + 2)}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1 min-w-[130px]">
                    {renderSigName(sig.nama)}
                  </p>
                  {sig.ktaNo ? (
                    <p className="text-[9px] sm:text-[10px] text-slate-700 font-mono mt-0.5">
                      KTA/NIP: {sig.ktaNo}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bagian Tembusan di Pojok Kiri Bawah Sesuai Format Resmi */}
      {showTembusan && tembusanList && tembusanList.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-2 print:mt-2.5 print:pt-1 text-left font-serif text-xs text-black break-inside-avoid">
          <p className="font-bold mb-1">Tembusan Kepada Yth :</p>
          <ol className="list-decimal list-inside space-y-0.5 pl-1">
            {tembusanList.map((item, index) => (
              <li key={index} className="leading-snug">
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
