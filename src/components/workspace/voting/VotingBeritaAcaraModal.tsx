import React, { useRef, useState } from 'react';
import { X, Printer, Download, CheckCircle, Award, Users, Calendar, ShieldCheck } from 'lucide-react';
import { VotingItem } from '../../../types/voting';
import { OfficialKopSurat } from '../surat/OfficialKopSurat';
import { downloadElementAsPdf, printElementDirectly } from '../../../utils/pdfExport';

interface VotingBeritaAcaraModalProps {
  isOpen: boolean;
  onClose: () => void;
  voting: VotingItem;
  onToast: (msg: string) => void;
}

export const VotingBeritaAcaraModal: React.FC<VotingBeritaAcaraModalProps> = ({
  isOpen,
  onClose,
  voting,
  onToast,
}) => {
  const printAreaRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const total = voting.totalVotes || 1;
  // Determine winner or highest vote option
  const sortedOptions = [...voting.options].sort((a, b) => b.votesCount - a.votesCount);
  const winner = sortedOptions[0];
  const quorumMet = voting.totalVotes >= Math.ceil((voting.targetVoters * voting.quorumPercentage) / 100);

  const formatDateIndo = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  const [downloadReadyUrl, setDownloadReadyUrl] = useState<string | null>(null);
  const [downloadReadyName, setDownloadReadyName] = useState<string>('');
  const [printerBanner, setPrinterBanner] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    try {
      setIsExporting(true);
      setDownloadReadyUrl(null);
      onToast('Sedang membuat Berita Acara PDF resolusi tinggi...');
      const cleanTitle = voting.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
      const filename = `Berita_Acara_Voting_${cleanTitle}.pdf`;

      const handleReady = (e: any) => {
        if (e.detail?.blobUrl) {
          setDownloadReadyUrl(e.detail.blobUrl);
          setDownloadReadyName(e.detail.filename || filename);
        }
      };
      window.addEventListener('kt_pdf_download_ready', handleReady, { once: true });

      const ok = await downloadElementAsPdf(printAreaRef.current, filename);
      if (ok) {
        onToast('Berita Acara berhasil diunduh ke format PDF.');
      } else {
        printElementDirectly(printAreaRef.current);
      }
    } catch (e) {
      console.error(e);
      onToast('Gagal membuat PDF, membuka mode cetak langsung.');
      if (printAreaRef.current) printElementDirectly(printAreaRef.current);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (printAreaRef.current) {
      printElementDirectly(printAreaRef.current);
      setPrinterBanner('Dialog printer aktif. Pilih printer fisik Anda atau "Simpan ke PDF". Anda juga dapat menekan Ctrl + P.');
      onToast('Membuka koneksi printer...');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Top Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Berita Acara Resmi Hasil Pemungutan Suara
              </h3>
              <p className="text-[11px] text-slate-400">
                Dokumen ketetapan musyawarah mufakat & voting pemuda
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Memproses...' : 'Unduh PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner Link Download Langsung & Panduan Printer */}
        {(downloadReadyUrl || printerBanner) && (
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-white print:hidden animate-fadeIn">
            {downloadReadyUrl ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Berita Acara PDF siap! Jika download otomatis tidak muncul di browser:</span>
                <a
                  href={downloadReadyUrl}
                  download={downloadReadyName}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Klik di Sini untuk Unduh File</span>
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-300">
                <Printer className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{printerBanner}</span>
              </div>
            )}
            <button
              onClick={() => {
                setDownloadReadyUrl(null);
                setPrinterBanner(null);
              }}
              className="text-slate-400 hover:text-white text-[11px] underline ml-auto cursor-pointer"
            >
              Tutup Info
            </button>
          </div>
        )}

        {/* Printable Document Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/80 flex justify-center">
          <div
            ref={printAreaRef}
            className="w-full max-w-[800px] bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 text-slate-900 font-serif leading-relaxed text-xs sm:text-sm"
          >
            {/* Kop Surat Resmi */}
            <OfficialKopSurat />

            {/* Judul Berita Acara */}
            <div className="text-center mt-6 mb-6">
              <h2 className="text-base sm:text-lg font-black tracking-wide uppercase underline underline-offset-4 font-sans text-slate-900">
                BERITA ACARA HASIL PEMUNGUTAN SUARA
              </h2>
              <p className="text-xs text-slate-600 font-sans mt-1">
                Nomor: BA-VOTE/{voting.id.replace('vote-', '')}/KT-MJ/X/2026
              </p>
            </div>

            {/* Paragraf Pembuka */}
            <div className="space-y-3 font-sans text-xs text-slate-800 leading-relaxed text-justify">
              <p>
                Pada hari ini, <strong>{formatDateIndo(voting.endDate || voting.createdAt)}</strong>,
                bertempat di Sekretariat Karang Taruna Kelurahan Manis Jaya, Kecamatan Jatiuwung,
                Kota Tangerang, telah diselenggarakan proses pemungutan suara (e-Voting) anggota
                secara langsung, umum, bebas, rahasia, jujur, dan adil mengenai agenda:
              </p>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">{voting.title}</p>
                <p className="text-[11px] text-slate-600 mt-1">{voting.description}</p>
              </div>

              {/* Data Partisipasi & Kuorum */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pb-1">
                <div className="border border-slate-200 p-2 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Target Pemilih</div>
                  <div className="font-bold text-xs">{voting.targetVoters} Anggota</div>
                </div>
                <div className="border border-slate-200 p-2 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Suara Masuk</div>
                  <div className="font-bold text-xs text-blue-700">{voting.totalVotes} Suara</div>
                </div>
                <div className="border border-slate-200 p-2 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Partisipasi</div>
                  <div className="font-bold text-xs">
                    {Math.round((voting.totalVotes / (voting.targetVoters || 1)) * 100)}%
                  </div>
                </div>
                <div className="border border-slate-200 p-2 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Status Kuorum</div>
                  <div
                    className={`font-bold text-xs ${
                      quorumMet ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {quorumMet ? '✓ SAH (Kuorum)' : 'Belum Kuorum'}
                  </div>
                </div>
              </div>

              {/* Tabel Hasil Perolehan Suara */}
              <div className="pt-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase mb-1.5">
                  Rekapitulasi Perolehan Suara:
                </h4>
                <table className="w-full border-collapse border border-slate-300 text-[11px] font-sans">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-300 p-2 text-center w-10">No</th>
                      <th className="border border-slate-300 p-2 text-left">
                        {voting.category === 'ketua_kegiatan'
                          ? 'Nama Calon / Kandidat'
                          : 'Opsi / Alternatif Keputusan'}
                      </th>
                      <th className="border border-slate-300 p-2 text-left">Keterangan</th>
                      <th className="border border-slate-300 p-2 text-center w-24">Jumlah Suara</th>
                      <th className="border border-slate-300 p-2 text-center w-20">Persentase</th>
                      <th className="border border-slate-300 p-2 text-center w-24">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOptions.map((opt, i) => {
                      const pct = Math.round((opt.votesCount / total) * 100);
                      const isTop = i === 0 && opt.votesCount > 0;
                      return (
                        <tr
                          key={opt.id}
                          className={isTop ? 'bg-blue-50/60 font-semibold' : 'hover:bg-slate-50'}
                        >
                          <td className="border border-slate-300 p-2 text-center">{i + 1}</td>
                          <td className="border border-slate-300 p-2">
                            <span className="font-bold text-slate-900">{opt.title}</span>
                          </td>
                          <td className="border border-slate-300 p-2 text-slate-600">
                            {opt.subtitle || '-'}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-blue-700">
                            {opt.votesCount}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold">
                            {pct}%
                          </td>
                          <td className="border border-slate-300 p-2 text-center text-[10px]">
                            {isTop ? '👑 Terpilih' : 'Tidak Terpilih'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Penetapan Keputusan */}
              <div className="pt-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase mb-1">
                  Ketetapan Musyawarah & Hasil Akhir:
                </h4>
                <p>
                  Berdasarkan hasil pemungutan suara sah di atas, forum musyawarah menetapkan{' '}
                  <strong>"{winner ? winner.title : '-'}"</strong>{' '}
                  {voting.category === 'ketua_kegiatan'
                    ? 'sebagai Ketua Pelaksana Terpilih yang sah untuk mengemban amanah kegiatan tersebut.'
                    : 'sebagai Keputusan Resmi yang disetujui bersama oleh seluruh anggota Karang Taruna Kelurahan Manis Jaya.'}
                </p>
                <p className="mt-1">
                  Demikian Berita Acara ini dibuat dengan sebenarnya dalam rangkap secukupnya untuk
                  dapat dipergunakan sebagaimana mestinya.
                </p>
              </div>

              {/* Blok Tanda Tangan */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs font-sans">
                <div className="space-y-16">
                  <div>
                    <p className="text-slate-600">Sekretaris Karang Taruna,</p>
                  </div>
                  <div>
                    <p className="font-bold underline text-slate-900">SITI NURHALIZA</p>
                    <p className="text-[10px] text-slate-500">NIA: KT-002 / RW 01</p>
                  </div>
                </div>

                <div className="space-y-16">
                  <div>
                    <p className="text-slate-600">Ketua Karang Taruna,</p>
                  </div>
                  <div>
                    <p className="font-bold underline text-slate-900">IIK ANDRIYANA</p>
                    <p className="text-[10px] text-slate-500">NIA: KT-001 / RW 03</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
