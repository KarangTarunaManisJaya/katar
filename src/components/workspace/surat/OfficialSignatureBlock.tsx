import React from 'react';

export interface SignatoryItem {
  nama: string;
  jabatan?: string;
  ktaNo?: string;
  signatureUrl?: string;
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

// 4 Varian Tanda Tangan Grafis Vektor Otentik Bersih
const SignatureSvg: React.FC<{ index: number }> = ({ index }) => {
  const mod = index % 4;
  if (mod === 0) {
    return (
      <svg
        viewBox="0 0 160 80"
        className="w-32 h-16 text-slate-900 fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 25 55 Q 35 15 48 35 Q 58 50 65 25 Q 75 10 70 65 Q 85 40 100 45 Q 115 50 135 30" />
        <path d="M 40 45 Q 70 30 110 50" />
        <path d="M 55 60 L 120 40" strokeWidth="1.2" />
      </svg>
    );
  }
  if (mod === 1) {
    return (
      <svg
        viewBox="0 0 160 80"
        className="w-32 h-16 text-slate-900 fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 30 20 Q 20 65 45 45 Q 60 30 70 60 Q 80 15 90 50 Q 105 25 115 55 Q 125 35 140 40" />
        <path d="M 50 50 L 130 50" strokeWidth="1.3" />
        <path d="M 65 30 Q 95 65 110 35" />
      </svg>
    );
  }
  if (mod === 2) {
    return (
      <svg
        viewBox="0 0 160 80"
        className="w-32 h-16 text-slate-900 fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 20 45 Q 40 10 55 40 Q 70 65 85 20 Q 95 50 115 35 Q 130 40 145 25" />
        <path d="M 35 55 Q 75 40 125 55" />
        <path d="M 50 65 L 105 30" strokeWidth="1.3" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 160 80"
      className="w-32 h-16 text-slate-900 fill-none stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 25 35 Q 35 60 50 25 Q 65 15 75 55 Q 90 20 105 45 Q 120 30 135 50" />
      <path d="M 30 50 L 125 45" strokeWidth="1.3" />
      <path d="M 60 20 Q 80 55 110 30" />
    </svg>
  );
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
    'Lurah Manis Jaya',
    'Pembina Karang Taruna Manis Jaya',
    'Karang Taruna Kecamatan Jatiuwung',
  ],
  organizationName = 'Karang Taruna Manis Jaya',
}) => {
  // Selesaikan daftar penandatangan aktual secara dinamis sesuai jumlah penandatangan surat
  const activeSignatories: SignatoryItem[] = React.useMemo(() => {
    if (signatories && Array.isArray(signatories) && signatories.length > 0) {
      return signatories;
    }
    const result: SignatoryItem[] = [];
    if (ketuaName) {
      result.push({
        nama: ketuaName,
        jabatan: ketuaTitle || 'Ketua Pelaksana',
      });
    }
    if (sekretarisName) {
      result.push({
        nama: sekretarisName,
        jabatan: sekretarisTitle || 'Sekretaris',
      });
    }
    return result.length > 0
      ? result
      : [
          { nama: 'Andriansyah', jabatan: 'Ketua Pelaksana' },
          { nama: 'Eko Mujianto', jabatan: 'Sekretaris' },
        ];
  }, [signatories, ketuaTitle, ketuaName, sekretarisTitle, sekretarisName]);

  const count = activeSignatories.length;

  return (
    <div
      className={`w-full font-serif text-slate-900 select-none ${className}`}
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* KASUS 1 PENANDATANGAN (Surat Tugas / Rekomendasi / SK Tunggal)     */}
      {/* ------------------------------------------------------------------ */}
      {count === 1 && (
        <div className="w-full flex justify-end my-6 pr-4 sm:pr-8">
          <div className="flex flex-col items-center text-center w-56 relative">
            <div className="mb-2">
              <p className="text-sm text-black">Hormat kami :</p>
              <p className="text-sm font-semibold text-black">{organizationName}</p>
              <p className="text-sm font-medium text-black mt-2">
                {activeSignatories[0].jabatan || 'Ketua'}
              </p>
            </div>
            <div className="h-20 flex items-center justify-center relative w-full">
              {activeSignatories[0].signatureUrl ? (
                <img
                  src={activeSignatories[0].signatureUrl}
                  alt="Tanda Tangan"
                  className="h-16 object-contain"
                />
              ) : (
                <SignatureSvg index={0} />
              )}
            </div>
            <p className="text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1">
              {activeSignatories[0].nama}
            </p>
            {activeSignatories[0].ktaNo && (
              <p className="text-[10px] text-slate-700 font-mono mt-0.5">
                KTA: {activeSignatories[0].ktaNo}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* KASUS 2 PENANDATANGAN (2 Kolom: Kiri & Kanan - Tanpa Stempel)      */}
      {/* ------------------------------------------------------------------ */}
      {count === 2 && (
        <div className="flex flex-col items-center justify-center my-6">
          <div className="text-center mb-4">
            <p className="text-sm text-black">Hormat kami :</p>
            <p className="text-sm font-semibold text-black">{organizationName}</p>
          </div>

          <div className="w-full max-w-xl mx-auto flex items-start justify-between px-4 sm:px-8">
            {/* Kolom Kiri: Penandatangan 1 */}
            <div className="flex flex-col items-center text-center w-48">
              <p className="text-sm font-medium text-black mb-2">
                {activeSignatories[0].jabatan || 'Ketua Pelaksana'}
              </p>
              <div className="h-20 flex items-center justify-center relative">
                {activeSignatories[0].signatureUrl ? (
                  <img
                    src={activeSignatories[0].signatureUrl}
                    alt="Tanda Tangan"
                    className="h-16 object-contain"
                  />
                ) : (
                  <SignatureSvg index={0} />
                )}
              </div>
              <p className="text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1">
                {activeSignatories[0].nama}
              </p>
              {activeSignatories[0].ktaNo && (
                <p className="text-[10px] text-slate-700 font-mono mt-0.5">
                  KTA: {activeSignatories[0].ktaNo}
                </p>
              )}
            </div>

            {/* Kolom Kanan: Penandatangan 2 */}
            <div className="flex flex-col items-center text-center w-48">
              <p className="text-sm font-medium text-black mb-2">
                {activeSignatories[1].jabatan || 'Sekretaris'}
              </p>
              <div className="h-20 flex items-center justify-center relative">
                {activeSignatories[1].signatureUrl ? (
                  <img
                    src={activeSignatories[1].signatureUrl}
                    alt="Tanda Tangan"
                    className="h-16 object-contain"
                  />
                ) : (
                  <SignatureSvg index={1} />
                )}
              </div>
              <p className="text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1">
                {activeSignatories[1].nama}
              </p>
              {activeSignatories[1].ktaNo && (
                <p className="text-[10px] text-slate-700 font-mono mt-0.5">
                  KTA: {activeSignatories[1].ktaNo}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* KASUS 3 PENANDATANGAN (3 Kolom Sejajar Bersih)                     */}
      {/* ------------------------------------------------------------------ */}
      {count === 3 && (
        <div className="flex flex-col items-center justify-center my-6">
          <div className="text-center mb-4">
            <p className="text-sm text-black">Hormat kami :</p>
            <p className="text-sm font-semibold text-black">{organizationName}</p>
          </div>

          <div className="w-full max-w-2xl mx-auto grid grid-cols-3 gap-3 px-2 sm:px-4">
            {activeSignatories.map((sig, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <p className="text-sm font-medium text-black mb-2">{sig.jabatan || 'Pengurus'}</p>
                <div className="h-20 flex items-center justify-center relative">
                  {sig.signatureUrl ? (
                    <img src={sig.signatureUrl} alt="Tanda Tangan" className="h-16 object-contain" />
                  ) : (
                    <SignatureSvg index={idx} />
                  )}
                </div>
                <p className="text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1">
                  {sig.nama}
                </p>
                {sig.ktaNo && (
                  <p className="text-[10px] text-slate-700 font-mono mt-0.5">KTA: {sig.ktaNo}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* KASUS 4 ATAU LEBIH PENANDATANGAN (Pengurus Pelaksana + Mengetahui) */}
      {/* ------------------------------------------------------------------ */}
      {count >= 4 && (
        <div className="flex flex-col items-center justify-center my-6 space-y-6">
          {/* Baris 1: Pelaksana (Ketua & Sekretaris) */}
          <div className="w-full">
            <div className="text-center mb-4">
              <p className="text-sm text-black">Hormat kami :</p>
              <p className="text-sm font-semibold text-black">{organizationName}</p>
            </div>

            <div className="w-full max-w-xl mx-auto flex items-start justify-between px-4 sm:px-8">
              {/* Kolom 1 */}
              <div className="flex flex-col items-center text-center w-48">
                <p className="text-sm font-medium text-black mb-2">
                  {activeSignatories[0].jabatan || 'Ketua Pelaksana'}
                </p>
                <div className="h-20 flex items-center justify-center relative">
                  {activeSignatories[0].signatureUrl ? (
                    <img
                      src={activeSignatories[0].signatureUrl}
                      alt="Tanda Tangan"
                      className="h-16 object-contain"
                    />
                  ) : (
                    <SignatureSvg index={0} />
                  )}
                </div>
                <p className="text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1">
                  {activeSignatories[0].nama}
                </p>
                {activeSignatories[0].ktaNo && (
                  <p className="text-[10px] text-slate-700 font-mono mt-0.5">
                    KTA: {activeSignatories[0].ktaNo}
                  </p>
                )}
              </div>

              {/* Kolom 2 */}
              <div className="flex flex-col items-center text-center w-48">
                <p className="text-sm font-medium text-black mb-2">
                  {activeSignatories[1].jabatan || 'Sekretaris'}
                </p>
                <div className="h-20 flex items-center justify-center relative">
                  {activeSignatories[1].signatureUrl ? (
                    <img
                      src={activeSignatories[1].signatureUrl}
                      alt="Tanda Tangan"
                      className="h-16 object-contain"
                    />
                  ) : (
                    <SignatureSvg index={1} />
                  )}
                </div>
                <p className="text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1">
                  {activeSignatories[1].nama}
                </p>
                {activeSignatories[1].ktaNo && (
                  <p className="text-[10px] text-slate-700 font-mono mt-0.5">
                    KTA: {activeSignatories[1].ktaNo}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Baris 2: Mengetahui / Pejabat Tambahan */}
          <div className="w-full pt-2">
            <div className="text-center mb-3">
              <p className="text-xs uppercase tracking-wider font-semibold text-black">
                Mengetahui / Menyetujui :
              </p>
            </div>
            <div className="w-full max-w-xl mx-auto flex items-start justify-around px-4">
              {activeSignatories.slice(2).map((sig, idx) => (
                <div key={idx} className="flex flex-col items-center text-center w-48">
                  <p className="text-sm font-medium text-black mb-2">
                    {sig.jabatan || 'Pembina'}
                  </p>
                  <div className="h-20 flex items-center justify-center relative">
                    {sig.signatureUrl ? (
                      <img src={sig.signatureUrl} alt="Tanda Tangan" className="h-16 object-contain" />
                    ) : (
                      <SignatureSvg index={idx + 2} />
                    )}
                  </div>
                  <p className="text-sm font-bold text-black border-b border-black inline-block pb-0.5 mt-1">
                    {sig.nama}
                  </p>
                  {sig.ktaNo && (
                    <p className="text-[10px] text-slate-700 font-mono mt-0.5">
                      KTA/NIP: {sig.ktaNo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bagian Tembusan di Pojok Kiri Bawah Sesuai Format Resmi */}
      {showTembusan && tembusanList && tembusanList.length > 0 && (
        <div className="mt-8 pt-4 text-left font-serif text-xs text-black">
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
