import React from 'react';
import {
  X,
  Printer,
  Copy,
  Building,
  User,
  Calendar,
  Paperclip,
  CheckCircle2,
  Clock,
  Send,
  Inbox,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import {
  SuratMasukItem,
  SuratKeluarItem,
} from '../../../types/surat';

interface SuratDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  suratMasuk?: SuratMasukItem | null;
  suratKeluar?: SuratKeluarItem | null;
  onPrintPreview?: (sk: SuratKeluarItem) => void;
  onCreateDisposisi?: (sm: SuratMasukItem) => void;
  onToast: (msg: string) => void;
}

export const SuratDetailModal: React.FC<SuratDetailModalProps> = ({
  isOpen,
  onClose,
  suratMasuk,
  suratKeluar,
  onPrintPreview,
  onCreateDisposisi,
  onToast,
}) => {
  if (!isOpen || (!suratMasuk && !suratKeluar)) return null;

  const isMasuk = !!suratMasuk;
  const item = (suratMasuk || suratKeluar)!;

  const handleCopyNo = (no: string) => {
    navigator.clipboard.writeText(no);
    onToast(`Nomor surat "${no}" disalin ke clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between text-white rounded-t-2xl ${
          isMasuk ? 'bg-gradient-to-r from-blue-700 to-indigo-700' : 'bg-gradient-to-r from-emerald-700 to-teal-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {isMasuk ? <Inbox className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs uppercase font-semibold tracking-wider text-white/80">
                {isMasuk ? 'Detail Surat Masuk' : 'Detail Surat Keluar'}
              </div>
              <h2 className="text-base sm:text-lg font-bold">
                {item.nomorSurat}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyNo(item.nomorSurat)}
              title="Salin Nomor Surat"
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-800">
              {item.jenisSurat}
            </span>
            <span className="px-2.5 py-1 rounded-full font-bold bg-blue-50 text-blue-700">
              Sifat: {item.sifatSurat}
            </span>
            <span className={`px-2.5 py-1 rounded-full font-bold ${
              item.status === 'Selesai' || item.status === 'Terkirim'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              Status: {item.status}
            </span>
          </div>

          {/* Perihal Box */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Perihal Surat
            </div>
            <h3 className="text-sm font-black text-slate-900 leading-snug">
              {item.perihal}
            </h3>
          </div>

          {/* Parties involved */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                {isMasuk ? 'Pengirim & Instansi:' : 'Tujuan & Penerima:'}
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {isMasuk ? (suratMasuk?.instansi) : (suratKeluar?.tujuan)}
              </div>
              <div className="text-slate-600">
                {isMasuk ? `Pejabat: ${suratMasuk?.pengirim}` : `Penerima: ${suratKeluar?.namaPenerima || '-'}`}
              </div>
              {suratKeluar?.alamat && (
                <div className="text-slate-400 text-[11px]">{suratKeluar.alamat}</div>
              )}
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Waktu & Administrasi:</div>
              <div><b>Tanggal Surat:</b> {item.tanggalSurat}</div>
              {isMasuk && (
                <div><b>Tanggal Diterima:</b> {suratMasuk?.tanggalDiterima}</div>
              )}
              {isMasuk && (
                <div><b>Petugas Input:</b> {suratMasuk?.petugasPenerima}</div>
              )}
            </div>
          </div>

          {/* Isi Surat / Ringkasan */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              {isMasuk ? 'Ringkasan Pokok Isi Surat:' : 'Batang Tubuh & Teks Surat Dinas:'}
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 whitespace-pre-line leading-relaxed font-sans">
              {isMasuk ? suratMasuk?.ringkasanIsi : suratKeluar?.isiSurat}
            </div>
          </div>

          {/* Penandatangan (Surat Keluar) */}
          {!isMasuk && suratKeluar?.penandatangan && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Penandatangan Resmi:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suratKeluar.penandatangan.map((ttd, i) => (
                  <div key={i} className="bg-white p-2 rounded border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900">{ttd.nama}</div>
                    <div className="text-slate-600">{ttd.jabatan}</div>
                    {ttd.ktaNo && <div className="text-[10px] text-slate-400">KTA: {ttd.ktaNo}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disposisi Target (Surat Masuk) */}
          {isMasuk && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-700 font-bold block uppercase">
                  Tujuan Disposisi Organisasi:
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {suratMasuk?.tujuanDisposisi || 'Belum ditentukan'}
                </span>
              </div>
              {onCreateDisposisi && !suratMasuk?.disposisiId && (
                <button
                  onClick={() => {
                    onClose();
                    onCreateDisposisi(suratMasuk!);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" /> Buat Lembar Disposisi
                </button>
              )}
            </div>
          )}

          {/* Lampiran List */}
          {item.lampiran && item.lampiran.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Berkas Lampiran ({item.lampiran.length}):
              </div>
              <div className="space-y-1">
                {item.lampiran.map((att) => (
                  <div
                    key={att.id}
                    className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold text-slate-800">{att.name}</span>
                      <span className="text-[10px] text-slate-400">({att.sizeKb} KB)</span>
                    </div>
                    <button
                      onClick={() => onToast(`Mengunduh file simulasi "${att.name}"...`)}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Buka Berkas
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
          <div className="text-[11px] text-slate-500">
            Diterbitkan oleh Sistem Tata Persuratan Karang Taruna
          </div>

          <div className="flex items-center gap-2">
            {!isMasuk && onPrintPreview && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPrintPreview(suratKeluar!);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak PDF
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
