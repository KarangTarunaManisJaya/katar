import React from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Building,
} from 'lucide-react';
import {
  SuratKeluarItem,
  DisposisiItem,
} from '../../../types/surat';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-300 flex flex-col max-h-[96vh]">
        {/* Modal Toolbar (hidden on print) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm sm:text-base font-bold">
                {suratKeluar ? `Pratinjau Cetak Surat: ${suratKeluar.nomorSurat}` : `Lembar Disposisi Resmi: ${lembarDisposisi?.nomorDisposisi}`}
              </h2>
              <p className="text-[11px] text-slate-400">
                Format baku A4 siap cetak dengan kepala surat resmi dan stempel organisasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {suratKeluar && (
              <button
                type="button"
                onClick={handleCopyText}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                <Copy className="w-3.5 h-3.5" /> Salin Teks
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" /> Cetak / PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Container */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          {suratKeluar && (
            <div className="bg-white text-slate-900 shadow-xl border border-slate-300 w-full max-w-[760px] min-h-[960px] p-8 sm:p-12 font-serif text-xs leading-relaxed flex flex-col justify-between">
              <div>
                {/* OFFICIAL KOP SURAT */}
                <div className="border-b-[3px] border-double border-slate-900 pb-3 mb-6">
                  <div className="flex items-center justify-between gap-4 font-sans">
                    {/* Left Logo */}
                    <div className="w-16 h-16 rounded-full border-2 border-blue-600 flex flex-col items-center justify-center p-1 text-center font-bold text-blue-700 text-[9px] shrink-0 bg-blue-50/50">
                      <span>KARANG</span>
                      <span>TARUNA</span>
                    </div>

                    {/* Middle Text */}
                    <div className="text-center flex-1">
                      <h4 className="text-xs uppercase font-bold tracking-wider text-slate-700">
                        PENGURUS KARANG TARUNA KELURAHAN MANIS JAYA
                      </h4>
                      <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 mt-0.5">
                        KECAMATAN JATIUWUNG - KOTA TANGERANG
                      </h2>
                      <p className="text-[10px] text-slate-600 font-medium mt-1">
                        Sekretariat: Jl. Manis Jaya Raya No. 12, Kel. Manis Jaya, Kec. Jatiuwung, Kota Tangerang 15136
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Telp/WA: 0812 8912 3450 | Email: sekretariat@karangtarunamanisjaya.id | Laman: manisjaya.id
                      </p>
                    </div>

                    {/* Right Logo */}
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-600 flex flex-col items-center justify-center p-1 text-center font-bold text-emerald-700 text-[9px] shrink-0 bg-emerald-50/50">
                      <span>KOTA</span>
                      <span>TANGERANG</span>
                    </div>
                  </div>
                </div>

                {/* Surat Metadata */}
                <div className="flex justify-between items-start mb-6 font-sans text-xs">
                  <table className="text-left space-y-1">
                    <tbody>
                      <tr>
                        <td className="pr-2 font-semibold">Nomor</td>
                        <td className="pr-2">:</td>
                        <td className="font-mono font-bold">{suratKeluar.nomorSurat}</td>
                      </tr>
                      <tr>
                        <td className="pr-2 font-semibold">Sifat</td>
                        <td className="pr-2">:</td>
                        <td>{suratKeluar.sifatSurat}</td>
                      </tr>
                      <tr>
                        <td className="pr-2 font-semibold">Lampiran</td>
                        <td className="pr-2">:</td>
                        <td>{suratKeluar.lampiran && suratKeluar.lampiran.length > 0 ? `${suratKeluar.lampiran.length} Berkas` : '-'}</td>
                      </tr>
                      <tr>
                        <td className="pr-2 font-semibold align-top">Perihal</td>
                        <td className="pr-2 align-top">:</td>
                        <td className="font-bold">{suratKeluar.perihal}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="text-right">
                    <div>Manis Jaya, {suratKeluar.tanggalSurat}</div>
                  </div>
                </div>

                {/* Recipient */}
                <div className="mb-6 font-sans text-xs">
                  <div>Kepada Yth.</div>
                  <div className="font-bold text-slate-900">{suratKeluar.tujuan}</div>
                  {suratKeluar.instansi && <div>{suratKeluar.instansi}</div>}
                  {suratKeluar.alamat && <div>di {suratKeluar.alamat}</div>}
                </div>

                {/* Body Content */}
                <div className="mb-8 whitespace-pre-line text-justify leading-relaxed font-sans text-xs text-slate-800">
                  {suratKeluar.isiSurat}
                </div>
              </div>

              {/* Signatures & Stamp */}
              <div>
                <div className="flex justify-end mt-10 font-sans">
                  <div className="text-center min-w-[260px]">
                    <div className="text-xs text-slate-700">Pengurus Karang Taruna Kelurahan Manis Jaya</div>
                    
                    <div className="h-24 flex items-center justify-center relative my-1">
                      {suratKeluar.stempelOrganisasi && (
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-700/80 text-indigo-800 font-bold text-[9px] flex flex-col items-center justify-center text-center rotate-[-12deg] absolute bg-indigo-50/20 shadow-xs pointer-events-none">
                          <span className="text-[7px]">PENGURUS</span>
                          <span className="font-black text-[9px] uppercase tracking-wide">KARANG TARUNA</span>
                          <span className="text-[7px]">KELURAHAN MANIS JAYA</span>
                        </div>
                      )}
                      <div className="font-serif italic text-slate-300 text-xs">(Tanda Tangan Elektronik Sah)</div>
                    </div>

                    <div className="space-y-2">
                      {suratKeluar.penandatangan.map((ttd, i) => (
                        <div key={i} className="text-xs">
                          <div className="font-bold underline uppercase text-slate-900">{ttd.nama}</div>
                          <div className="text-slate-600">{ttd.jabatan}</div>
                          {ttd.ktaNo && <div className="text-[10px] text-slate-400 font-mono">KTA: {ttd.ktaNo}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tembusan */}
                {suratKeluar.tembusan && suratKeluar.tembusan.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-slate-200 font-sans text-[11px] text-slate-600">
                    <div className="font-bold mb-1">Tembusan:</div>
                    <ol className="list-decimal list-inside space-y-0.5">
                      {suratKeluar.tembusan.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LEMBAR DISPOSISI PRINT LAYOUT */}
          {lembarDisposisi && (
            <div className="bg-white text-slate-900 shadow-xl border-2 border-slate-900 w-full max-w-[760px] p-6 sm:p-8 font-sans text-xs flex flex-col justify-between">
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
