import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Save,
  Clock,
  Calendar,
  User,
  Building,
  AlertTriangle,
} from 'lucide-react';
import {
  DisposisiItem,
  SuratMasukItem,
  InstruksiDisposisi,
  StatusDisposisi,
} from '../../../types/surat';

interface DisposisiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DisposisiItem) => void;
  editingItem?: DisposisiItem | null;
  selectedSuratMasuk?: SuratMasukItem | null;
  suratMasukList: SuratMasukItem[];
  onToast: (msg: string) => void;
}

export const DisposisiFormModal: React.FC<DisposisiFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  selectedSuratMasuk,
  suratMasukList,
  onToast,
}) => {
  const isEdit = !!editingItem;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Default deadline 3 days ahead
  const defaultDeadline = new Date(now);
  defaultDeadline.setDate(now.getDate() + 3);
  const defaultDeadlineStr = defaultDeadline.toISOString().split('T')[0];

  const [nomorDisposisi, setNomorDisposisi] = useState('');
  const [tanggalDisposisi, setTanggalDisposisi] = useState(todayStr);
  const [selectedSuratId, setSelectedSuratId] = useState('');
  const [dari, setDari] = useState('Muhammad Ryan Pratama (Ketua Umum)');
  const [kepada, setKepada] = useState('');
  const [instruksi, setInstruksi] = useState<InstruksiDisposisi>('Tindak lanjuti segera');
  const [batasWaktu, setBatasWaktu] = useState(defaultDeadlineStr);
  const [catatan, setCatatan] = useState('');
  const [status, setStatus] = useState<StatusDisposisi>('Menunggu');

  useEffect(() => {
    if (editingItem) {
      setNomorDisposisi(editingItem.nomorDisposisi);
      setTanggalDisposisi(editingItem.tanggalDisposisi);
      setSelectedSuratId(editingItem.suratMasukId);
      setDari(editingItem.dari);
      setKepada(editingItem.kepada);
      setInstruksi(editingItem.instruksi);
      setBatasWaktu(editingItem.batasWaktu);
      setCatatan(editingItem.catatan);
      setStatus(editingItem.status);
    } else {
      const ym = `${String(now.getMonth() + 1).padStart(2, '0')}`;
      const randNum = Math.floor(100 + Math.random() * 900);
      setNomorDisposisi(`DSP/${randNum}/${ym}/${now.getFullYear()}`);
      setTanggalDisposisi(todayStr);
      setBatasWaktu(defaultDeadlineStr);
      setDari('Muhammad Ryan Pratama (Ketua Umum)');
      setInstruksi('Tindak lanjuti segera');
      setStatus('Menunggu');

      if (selectedSuratMasuk) {
        setSelectedSuratId(selectedSuratMasuk.id);
        setKepada(selectedSuratMasuk.tujuanDisposisi || 'Sekretariat');
        setCatatan(`Segera tindak lanjuti surat dari ${selectedSuratMasuk.instansi} perihal "${selectedSuratMasuk.perihal}".`);
      } else if (suratMasukList.length > 0) {
        setSelectedSuratId(suratMasukList[0].id);
        setKepada(suratMasukList[0].tujuanDisposisi || 'Sekretariat');
        setCatatan(`Mohon dipelajari dan disiapkan langkah koordinasi.`);
      }
    }
  }, [editingItem, selectedSuratMasuk, isOpen]);

  const activeSurat = suratMasukList.find((s) => s.id === selectedSuratId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurat) {
      onToast('Pilih surat masuk yang terkait dengan lembar disposisi.');
      return;
    }
    if (!kepada.trim() || !catatan.trim()) {
      onToast('Tujuan penerima disposisi dan catatan instruksi wajib diisi!');
      return;
    }

    const item: DisposisiItem = {
      id: editingItem ? editingItem.id : `disp-${Date.now()}`,
      nomorDisposisi,
      tanggalDisposisi,
      suratMasukId: activeSurat.id,
      nomorSuratMasuk: activeSurat.nomorSurat,
      perihalSuratMasuk: activeSurat.perihal,
      instansiSuratMasuk: activeSurat.instansi,
      dari: dari.trim(),
      kepada: kepada.trim(),
      instruksi,
      batasWaktu,
      catatan: catatan.trim(),
      status,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
    };

    onSave(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isEdit ? 'Edit Lembar Disposisi' : 'Terbitkan Lembar Disposisi Baru'}
              </h2>
              <p className="text-xs text-amber-100">
                Pemberian instruksi resmi pimpinan terhadap surat dinas yang diterima
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

        {/* Body */}
        <form id="disposisi-form" onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Nomor & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Lembar Disposisi *
              </label>
              <input
                type="text"
                required
                value={nomorDisposisi}
                onChange={(e) => setNomorDisposisi(e.target.value)}
                className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg bg-amber-50/50 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Disposisi *
              </label>
              <input
                type="date"
                required
                value={tanggalDisposisi}
                onChange={(e) => setTanggalDisposisi(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Surat Masuk Yang Terkait */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Surat Masuk Terkait *
            </label>
            <select
              value={selectedSuratId}
              onChange={(e) => setSelectedSuratId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {suratMasukList.map((sm) => (
                <option key={sm.id} value={sm.id}>
                  {sm.nomorSurat} - {sm.instansi} ({sm.perihal})
                </option>
              ))}
            </select>

            {activeSurat && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-0.5 text-slate-700">
                <div className="font-bold text-slate-900">{activeSurat.perihal}</div>
                <div className="text-slate-500">Dari: {activeSurat.instansi} ({activeSurat.pengirim})</div>
                <div className="text-[11px] text-slate-400">Tgl Surat: {activeSurat.tanggalSurat} | Sifat: {activeSurat.sifatSurat}</div>
              </div>
            )}
          </div>

          {/* Dari & Kepada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dari (Pemberi Disposisi) *
              </label>
              <select
                value={dari}
                onChange={(e) => setDari(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Muhammad Ryan Pratama (Ketua Umum)">Muhammad Ryan Pratama (Ketua Umum)</option>
                <option value="Rendy Saputra (Wakil Ketua)">Rendy Saputra (Wakil Ketua)</option>
                <option value="Dinda Kirana (Sekretaris Umum)">Dinda Kirana (Sekretaris Umum)</option>
                <option value="Budi Santoso (Bendahara)">Budi Santoso (Bendahara)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Diteruskan Kepada (Penerima Instruksi) *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Koordinator Seksi Humas & Seksi Acara"
                value={kepada}
                onChange={(e) => setKepada(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Instruksi & Batas Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Petunjuk / Instruksi Pimpinan *
              </label>
              <select
                value={instruksi}
                onChange={(e) => setInstruksi(e.target.value as InstruksiDisposisi)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-amber-900"
              >
                <option value="Tindak lanjuti segera">Tindak lanjuti segera</option>
                <option value="Hadiri / Wakili">Hadiri / Wakili</option>
                <option value="Pelajari & beri masukan">Pelajari & beri masukan</option>
                <option value="Siapkan konsep surat balasan">Siapkan konsep surat balasan</option>
                <option value="Koordinasikan dengan bidang terkait">Koordinasikan dengan bidang terkait</option>
                <option value="Arsipkan & catat">Arsipkan & catat</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batas Waktu (Deadline Tindak Lanjut) *
              </label>
              <input
                type="date"
                required
                value={batasWaktu}
                onChange={(e) => setBatasWaktu(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Catatan Disposisi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Khusus Disposisi Pimpinan *
            </label>
            <textarea
              rows={3}
              required
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tuliskan instruksi langkah kerja detail, personil yang ditugaskan, atau batas pelaporan..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Disposisi
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusDisposisi)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Menunggu">Menunggu</option>
              <option value="Dikerjakan">Dikerjakan</option>
              <option value="Selesai">Selesai</option>
            </select>
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
            form="disposisi-form"
            className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {isEdit ? 'Simpan Disposisi' : 'Terbitkan Disposisi'}
          </button>
        </div>
      </div>
    </div>
  );
};
