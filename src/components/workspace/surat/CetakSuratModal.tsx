import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Building,
  Loader2,
} from 'lucide-react';
import {
  SuratKeluarItem,
  DisposisiItem,
} from '../../../types/surat';
import { OfficialKopSurat } from './OfficialKopSurat';
import { OfficialSignatureBlock } from './OfficialSignatureBlock';
import { downloadElementAsPdf, printElementDirectly } from '../../../utils/pdfExport';

interface CetakSuratModalProps {
  isOpen: boolean;
  onClose: () => void;
  suratKeluar?: SuratKeluarItem | null;
  lembarDisposisi?: DisposisiItem | null;
  onToast: (msg: string) => void;
}

export const CetakSuratModal: React.FC<CetakSuratModalProps> = ({
  isOpen,
  onClose,
  suratKeluar,
  lembarDisposisi,
  onToast,
}) => {
  if (!isOpen || (!suratKeluar && !lembarDisposisi)) return null;

  const printDocRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  const handleDownloadPdf = async () => {
    if (!printDocRef.current) return;
    setIsExportingPdf(true);
    const rawNomor = suratKeluar?.nomorSurat || lembarDisposisi?.nomorDisposisi || 'dokumen';
    const cleanNomor = rawNomor.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = suratKeluar
      ? `Surat_${cleanNomor}.pdf`
      : `Disposisi_${cleanNomor}.pdf`;

    const success = await downloadElementAsPdf(
      printDocRef.current,
      filename,
      (msg) => setExportStatus(msg)
    );

    setIsExportingPdf(false);
    setExportStatus('');
    if (success) {
      onToast(`File PDF "${filename}" berhasil diunduh!`);
    } else {
      onToast('Gagal membuat file PDF. Silakan gunakan tombol Cetak.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (suratKeluar) {
      const text = `KARANG TARUNA KELURAHAN MANIS JAYA\nNomor: ${suratKeluar.nomorSurat}\nPerihal: ${suratKeluar.perihal}\nKepada: ${suratKeluar.tujuan}\n\n${suratKeluar.isiSurat}`;
      navigator.clipboard.writeText(text);
      onToast('Teks surat berhasil disalin ke clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:static print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:inset-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-300 flex flex-col max-h-[96vh] print:w-full print:max-w-none print:shadow-none print:border-none print:rounded-none print:max-h-none print:m-0 print:p-0">
        {/* Modal Toolbar (hidden on print) */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white rounded-t-2xl print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm sm:text-base font-bold">
                {suratKeluar ? `Pratinjau Cetak Surat: ${suratKeluar.nomorSurat}` : `Lembar Disposisi Resmi: ${lembarDisposisi?.nomorDisposisi}`}
              </h2>
              <p className="text-[11px] text-slate-400">
                {exportStatus || 'Format baku A4 siap cetak & unduh PDF'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {suratKeluar && (
              <button
                type="button"
                onClick={handleCopyText}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                <Copy className="w-3.5 h-3.5" /> Salin Teks
              </button>
            )}

            {/* Tombol Unduh PDF Asli (.pdf) */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              title="Unduh langsung sebagai file dokumen PDF"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </>
              )}
            </button>

            {/* Tombol Cetak PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              title="Cetak Dokumen ke PDF (A4)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Container */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center print:p-0 print:m-0 print:bg-white print:overflow-visible print:block">
          {suratKeluar && (
            <div
              ref={printDocRef}
              className="bg-white text-slate-900 shadow-xl border border-slate-300 w-full max-w-[760px] p-6 sm:p-10 font-serif text-xs leading-relaxed flex flex-col justify-between print-sheet print:p-0 print:m-0 print:max-w-full print:min-h-0 print:border-none print:shadow-none print:text-black"
            >
              <div>
                {/* 100% SAMA SEPERTI GAMBAR: OFFICIAL KOP SURAT */}
                <OfficialKopSurat />

                {/* Tanggal Surat di Kanan Atas */}
                <div className="text-right text-xs mb-2 sm:mb-3 font-serif print:mb-2 text-black" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                  Manis Jaya, {suratKeluar.tanggalSurat}
                </div>

                {/* Surat Metadata (Kiri: Nomor, Lamp, Perihal) dan Tujuan (Kanan: Kepada Yth) */}
                <div className="grid grid-cols-2 gap-4 items-start mb-4 sm:mb-5 font-serif text-xs text-black print:mb-3" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                  {/* Kolom Kiri: Nomor, Lamp, Perihal */}
                  <table className="text-left w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="w-14 py-0.5 font-medium align-top">Nomor</td>
                        <td className="w-4 py-0.5 align-top">:</td>
                        <td className="py-0.5 font-bold font-mono align-top">{suratKeluar.nomorSurat}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 font-medium align-top">Lamp</td>
                        <td className="py-0.5 align-top">:</td>
                        <td className="py-0.5 align-top">
                          {suratKeluar.lampiran && suratKeluar.lampiran.length > 0
                            ? `${suratKeluar.lampiran.length} Berkas`
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 font-medium align-top">Perihal</td>
                        <td className="py-0.5 align-top">:</td>
                        <td className="py-0.5 font-bold align-top leading-snug">
                          {suratKeluar.perihal}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Kolom Kanan: Kepada Yth */}
                  <div className="text-left font-serif text-xs leading-snug pl-2">
                    <p className="font-semibold">Kepada Yth : Bapak/Ibu</p>
                    <p className="font-bold text-black">{suratKeluar.tujuan || 'Pimpinan Perusahaan'}</p>
                    {suratKeluar.instansi && <p className="font-bold text-black">{suratKeluar.instansi}</p>}
                    <p className="mt-1">Di –</p>
                    <p className="pl-6">{suratKeluar.alamat || 'Tempat'}</p>
                  </div>
                </div>

                {/* Salam Pembuka */}
                <div className="mb-2 font-serif text-xs text-black print:mb-1.5" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                  <p className="font-semibold">Dengan Hormat</p>
                </div>

                {/* Batang Tubuh Isi Surat */}
                <div
                  className="mb-5 sm:mb-6 whitespace-pre-line text-justify leading-relaxed font-serif text-xs sm:text-[13px] text-black print:text-[11.5pt] print:leading-normal print:mb-4 max-w-full break-words"
                  style={{ fontFamily: '"Times New Roman", Times, serif' }}
                >
                  {suratKeluar.isiSurat}
                </div>
              </div>

              {/* TANDA TANGAN SESUAI JUMLAH PENANDATANGAN SURAT (TANPA STEMPEL) */}
              <div className="print:mt-3 break-inside-avoid">
                <OfficialSignatureBlock
                  signatories={suratKeluar.penandatangan}
                  withStamp={false}
                  showTembusan={Boolean(suratKeluar.tembusan && suratKeluar.tembusan.length > 0)}
                  tembusanList={suratKeluar.tembusan || []}
                />
              </div>
            </div>
          )}

          {/* LEMBAR DISPOSISI PRINT LAYOUT */}
          {lembarDisposisi && (
            <div
              ref={printDocRef}
              className="bg-white text-slate-900 shadow-xl border-2 border-slate-900 w-full max-w-[760px] p-6 sm:p-8 font-sans text-xs flex flex-col justify-between print-sheet print:p-0 print:m-0 print:max-w-full print:shadow-none print:border-none"
            >
              <div>
                {/* Header Disposisi */}
                <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">
                    KARANG TARUNA KELURAHAN MANIS JAYA
                  </h3>
                  <h4 className="font-bold text-xs uppercase text-slate-600">
                    KECAMATAN JATIUWUNG - KOTA TANGERANG
                  </h4>
                  <div className="inline-block mt-2 px-4 py-1 bg-slate-900 text-white font-black text-sm tracking-widest uppercase rounded">
                    LEMBAR DISPOSISI
                  </div>
                </div>

                {/* Data Surat Masuk */}
                <div className="border border-slate-900 rounded-lg p-3 mb-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><b>Nomor Disposisi</b> : <span className="font-mono font-bold">{lembarDisposisi.nomorDisposisi}</span></div>
                    <div><b>Tanggal Disposisi</b> : {lembarDisposisi.tanggalDisposisi}</div>
                  </div>
                  <div className="border-t border-slate-200 pt-2 grid grid-cols-2 gap-2 text-xs">
                    <div><b>Surat Dari</b> : {lembarDisposisi.instansiSuratMasuk}</div>
                    <div><b>Nomor Surat Asal</b> : <span className="font-mono">{lembarDisposisi.nomorSuratMasuk}</span></div>
                  </div>
                  <div className="border-t border-slate-200 pt-2 text-xs">
                    <b>Perihal</b> : <span className="font-bold">{lembarDisposisi.perihalSuratMasuk}</span>
                  </div>
                </div>

                {/* Alur Disposisi */}
                <div className="border border-slate-900 rounded-lg p-3 mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Diteruskan Kepada:</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">{lembarDisposisi.kepada}</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Instruksi / Petunjuk:</div>
                      <div className="text-sm font-black text-amber-800 mt-0.5">{lembarDisposisi.instruksi}</div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2">
                    <div className="text-[11px] font-bold text-slate-700 mb-1">Catatan Khusus Pimpinan:</div>
                    <div className="p-3 bg-amber-50/50 rounded border border-amber-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                      {lembarDisposisi.catatan}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div><b>Batas Waktu</b> : <span className="font-bold text-rose-700">{lembarDisposisi.batasWaktu}</span></div>
                    <div><b>Status</b> : <span className="font-bold">{lembarDisposisi.status}</span></div>
                  </div>
                </div>

                {/* Lembar Hasil Tindak Lanjut */}
                <div className="border border-slate-900 rounded-lg p-3 mb-4 min-h-[140px]">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">Laporan Hasil Tindak Lanjut:</div>
                  <p className="text-xs text-slate-600 italic">
                    {lembarDisposisi.catatanPenyelesaian || '(Ruang catatan bagi penerima disposisi untuk melaporkan hasil pekerjaan)'}
                  </p>
                </div>
              </div>

              {/* Tanda Tangan Disposisi */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-900">
                <div className="text-center">
                  <div className="text-[11px]">Penerima Instruksi,</div>
                  <div className="h-16 flex items-center justify-center text-slate-300 italic text-[10px]">
                    (Paraf)
                  </div>
                  <div className="font-bold text-xs uppercase underline">{lembarDisposisi.kepada}</div>
                </div>

                <div className="text-center">
                  <div className="text-[11px]">Pemberi Disposisi,</div>
                  <div className="h-16 flex items-center justify-center text-slate-300 italic text-[10px]">
                    (Tanda Tangan)
                  </div>
                  <div className="font-bold text-xs uppercase underline">{lembarDisposisi.dari}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
