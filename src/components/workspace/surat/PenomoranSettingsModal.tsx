import React, { useState } from 'react';
import {
  X,
  Settings,
  Save,
  RotateCcw,
  Sparkles,
  Hash,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  NumberingConfig,
  JenisSurat,
} from '../../../types/surat';
import {
  generateNextNomorSurat,
} from '../../../data/suratInitialData';

interface PenomoranSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NumberingConfig;
  onSave: (newConfig: NumberingConfig) => void;
  onToast: (msg: string) => void;
}

export const PenomoranSettingsModal: React.FC<PenomoranSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onToast,
}) => {
  const [prefix, setPrefix] = useState(config.prefix);
  const [nomorAwal, setNomorAwal] = useState(config.nomorAwal);
  const [counterSaatIni, setCounterSaatIni] = useState(config.counterSaatIni);
  const [formatBulan, setFormatBulan] = useState(config.formatBulan);
  const [formatTahun, setFormatTahun] = useState(config.formatTahun);
  const [jumlahDigit, setJumlahDigit] = useState(config.jumlahDigit);
  const [resetAturan, setResetAturan] = useState(config.resetAturan);
  const [kodeMap, setKodeMap] = useState<Record<JenisSurat, string>>({ ...config.kodeSuratMap });

  if (!isOpen) return null;

  // Build temporary config for live preview
  const previewConfig: NumberingConfig = {
    prefix,
    nomorAwal,
    counterSaatIni,
    formatBulan,
    formatTahun,
    jumlahDigit,
    resetAturan,
    lastResetPeriod: config.lastResetPeriod,
    kodeSuratMap: kodeMap,
  };

  const sampleUndangan = generateNextNomorSurat('Undangan', previewConfig);
  const samplePermohonan = generateNextNomorSurat('Permohonan', previewConfig);
  const sampleTugas = generateNextNomorSurat('Surat tugas', previewConfig);

  const handleUpdateKode = (jenis: JenisSurat, val: string) => {
    setKodeMap((prev) => ({ ...prev, [jenis]: val.toUpperCase().trim() }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(previewConfig);
    onToast('Pengaturan penomoran surat dinas otomatis berhasil disimpan!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Pengaturan Penomoran Surat Otomatis
              </h2>
              <p className="text-xs text-slate-300">
                Atur format kode jenis surat, counter urut, romawi bulan, dan pola reset periodik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="bg-indigo-50/70 p-4 border-b border-indigo-100">
          <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Live Preview Format Nomor Surat:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-indigo-200">
              <span className="text-[10px] text-slate-400 block font-bold">Surat Undangan</span>
              <span className="font-mono font-bold text-indigo-900 text-xs">{sampleUndangan}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-indigo-200">
              <span className="text-[10px] text-slate-400 block font-bold">Surat Permohonan</span>
              <span className="font-mono font-bold text-indigo-900 text-xs">{samplePermohonan}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-indigo-200">
              <span className="text-[10px] text-slate-400 block font-bold">Surat Tugas</span>
              <span className="font-mono font-bold text-indigo-900 text-xs">{sampleTugas}</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form id="nomor-form" onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Parameter Utama */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Prefix Organisasi *
              </label>
              <input
                type="text"
                required
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                placeholder="Contoh: KT-MJ"
                className="w-full font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Identitas instansi</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Urut Saat Ini *
              </label>
              <input
                type="number"
                min={1}
                required
                value={counterSaatIni}
                onChange={(e) => setCounterSaatIni(Number(e.target.value))}
                className="w-full font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Urutan terakhir</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jumlah Digit Nomor *
              </label>
              <select
                value={jumlahDigit}
                onChange={(e) => setJumlahDigit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value={2}>2 Digit (misal: 08)</option>
                <option value={3}>3 Digit (misal: 048)</option>
                <option value={4}>4 Digit (misal: 0048)</option>
                <option value={5}>5 Digit (misal: 00048)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Panjang angka</span>
            </div>
          </div>

          {/* Format Bulan, Tahun & Reset */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Format Bulan *
              </label>
              <select
                value={formatBulan}
                onChange={(e) => setFormatBulan(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="romawi">Romawi (I, II, III, ... X)</option>
                <option value="dua_digit">2 Digit Angka (01, 02, ... 10)</option>
                <option value="satu_digit">1 Digit Angka (1, 2, ... 10)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Format Tahun *
              </label>
              <select
                value={formatTahun}
                onChange={(e) => setFormatTahun(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="4_digit">4 Digit (2026)</option>
                <option value="2_digit">2 Digit (26)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Aturan Reset Nomor *
              </label>
              <select
                value={resetAturan}
                onChange={(e) => setResetAturan(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="tahunan">Reset Tahunan (Setiap 1 Januari)</option>
                <option value="bulanan">Reset Bulanan (Setiap Awal Bulan)</option>
                <option value="tidak_pernah">Terus Menerus (Tidak Pernah Reset)</option>
              </select>
            </div>
          </div>

          {/* Kode Surat Per Jenis Surat */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Daftar Kode Singkatan Jenis Surat
              </h3>
              <span className="text-[11px] text-slate-500">Sesuaikan kode singkatan dinas</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(kodeMap) as JenisSurat[]).map((jenis) => (
                <div key={jenis} className="bg-white p-2 rounded-lg border border-slate-200">
                  <label className="block text-[10px] text-slate-500 font-bold mb-1 truncate">
                    {jenis}
                  </label>
                  <input
                    type="text"
                    value={kodeMap[jenis]}
                    onChange={(e) => handleUpdateKode(jenis, e.target.value)}
                    className="w-full font-mono font-bold text-xs px-2 py-1 border border-slate-200 rounded uppercase bg-slate-50/50"
                  />
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="nomor-form"
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
