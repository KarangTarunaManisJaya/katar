import React, { useState, useEffect } from 'react';
import {
  X,
  Inbox,
  Save,
  Plus,
  Trash2,
  Paperclip,
  Upload,
  Calendar,
  Building,
  User,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import {
  SuratMasukItem,
  JenisSurat,
  SifatSurat,
  StatusSuratMasuk,
  SuratAttachment,
} from '../../../types/surat';

interface SuratMasukFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: SuratMasukItem, autoCreateDisposisi?: boolean) => void;
  editingItem?: SuratMasukItem | null;
  onToast: (msg: string) => void;
}

export const SuratMasukFormModal: React.FC<SuratMasukFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  onToast,
}) => {
  const isEdit = !!editingItem;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const [nomorSurat, setNomorSurat] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState(todayStr);
  const [tanggalDiterima, setTanggalDiterima] = useState(todayStr);
  const [pengirim, setPengirim] = useState('');
  const [instansi, setInstansi] = useState('');
  const [perihal, setPerihal] = useState('');
  const [jenisSurat, setJenisSurat] = useState<JenisSurat>('Undangan');
  const [sifatSurat, setSifatSurat] = useState<SifatSurat>('Biasa');
  const [tujuanDisposisi, setTujuanDisposisi] = useState('Ketua Umum & Sekretaris');
  const [ringkasanIsi, setRingkasanIsi] = useState('');
  const [petugasPenerima, setPetugasPenerima] = useState('Dinda Kirana (Sekretariat)');
  const [status, setStatus] = useState<StatusSuratMasuk>('Belum Diproses');
  const [fileSuratName, setFileSuratName] = useState('');
  const [autoCreateDisposisi, setAutoCreateDisposisi] = useState(false);

  // Lampiran
  const [lampiranList, setLampiranList] = useState<SuratAttachment[]>([]);
  const [attName, setAttName] = useState('');
  const [attType, setAttType] = useState<'PDF' | 'DOCX' | 'JPG' | 'XLSX'>('PDF');
  const [attDesc, setAttDesc] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNomorSurat(editingItem.nomorSurat);
      setTanggalSurat(editingItem.tanggalSurat);
      setTanggalDiterima(editingItem.tanggalDiterima);
      setPengirim(editingItem.pengirim);
      setInstansi(editingItem.instansi);
      setPerihal(editingItem.perihal);
      setJenisSurat(editingItem.jenisSurat);
      setSifatSurat(editingItem.sifatSurat);
      setTujuanDisposisi(editingItem.tujuanDisposisi);
      setRingkasanIsi(editingItem.ringkasanIsi);
      setPetugasPenerima(editingItem.petugasPenerima);
      setStatus(editingItem.status);
      setFileSuratName(editingItem.fileSuratName || '');
      setLampiranList(editingItem.lampiran || []);
      setAutoCreateDisposisi(false);
    } else {
      setNomorSurat('');
      setTanggalSurat(todayStr);
      setTanggalDiterima(todayStr);
      setPengirim('');
      setInstansi('');
      setPerihal('');
      setJenisSurat('Undangan');
      setSifatSurat('Biasa');
      setTujuanDisposisi('Ketua Umum & Sekretaris');
      setRingkasanIsi('');
      setPetugasPenerima('Dinda Kirana (Sekretariat)');
      setStatus('Belum Diproses');
      setFileSuratName('');
      setLampiranList([]);
      setAutoCreateDisposisi(false);
    }
  }, [editingItem, isOpen]);

  const handleAddLampiran = () => {
    if (!attName.trim()) {
      onToast('Tuliskan nama berkas lampiran.');
      return;
    }
    const newAtt: SuratAttachment = {
      id: `att-${Date.now()}`,
      name: attName.trim().endsWith(`.${attType.toLowerCase()}`)
        ? attName.trim()
        : `${attName.trim()}.${attType.toLowerCase()}`,
      sizeKb: Math.floor(150 + Math.random() * 800),
      type: attType,
      description: attDesc.trim() || undefined,
    };
    setLampiranList([...lampiranList, newAtt]);
    setAttName('');
    setAttDesc('');
  };

  const handleRemoveLampiran = (id: string) => {
    setLampiranList(lampiranList.filter((l) => l.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorSurat.trim() || !perihal.trim() || !instansi.trim()) {
      onToast('Nomor surat, perihal, dan instansi pengirim wajib diisi!');
      return;
    }

    const item: SuratMasukItem = {
      id: editingItem ? editingItem.id : `sm-${Date.now()}`,
      nomorSurat: nomorSurat.trim(),
      tanggalSurat,
      tanggalDiterima,
      pengirim: pengirim.trim() || instansi.trim(),
      instansi: instansi.trim(),
      perihal: perihal.trim(),
      jenisSurat,
      sifatSurat,
      tujuanDisposisi: tujuanDisposisi.trim(),
      ringkasanIsi: ringkasanIsi.trim(),
      lampiran: lampiranList,
      fileSuratName: fileSuratName.trim() || undefined,
      petugasPenerima: petugasPenerima.trim(),
      status: autoCreateDisposisi ? 'Diproses/Didisposisi' : status,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(item, autoCreateDisposisi);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isEdit ? 'Edit Surat Masuk' : 'Pencatatan Surat Masuk Baru'}
              </h2>
              <p className="text-xs text-blue-100">
                Registrasi surat dinas dari instansi eksternal, ormas, atau warga
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

        {/* Form Body */}
        <form id="surat-masuk-form" onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Identitas Surat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Surat Asal *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 005/142-Kel.MJ/2026"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Surat *
              </label>
              <input
                type="date"
                required
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Diterima *
              </label>
              <input
                type="date"
                required
                value={tanggalDiterima}
                onChange={(e) => setTanggalDiterima(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Pengirim & Instansi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instansi / Organisasi Pengirim *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kantor Kelurahan Manis Jaya / Polsek Jatiuwung"
                value={instansi}
                onChange={(e) => setInstansi(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pengirim / Pejabat Penandatangan
              </label>
              <input
                type="text"
                placeholder="Contoh: Drs. H. Ujang Suherman (Lurah)"
                value={pengirim}
                onChange={(e) => setPengirim(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sifat, Jenis & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sifat Surat *
              </label>
              <select
                value={sifatSurat}
                onChange={(e) => setSifatSurat(e.target.value as SifatSurat)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Segera">Segera</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Surat *
              </label>
              <select
                value={jenisSurat}
                onChange={(e) => setJenisSurat(e.target.value as JenisSurat)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Undangan">Undangan</option>
                <option value="Permohonan">Permohonan</option>
                <option value="Pemberitahuan">Pemberitahuan</option>
                <option value="Surat tugas">Surat Tugas</option>
                <option value="Surat keterangan">Surat Keterangan</option>
                <option value="Surat rekomendasi">Surat Rekomendasi</option>
                <option value="Surat pengantar">Surat Pengantar</option>
                <option value="Surat keputusan">Surat Keputusan</option>
                <option value="Surat pernyataan">Surat Pernyataan</option>
                <option value="Berita acara">Berita Acara</option>
                <option value="Surat lainnya">Surat Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Pemrosesan *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusSuratMasuk)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Belum Diproses">Belum Diproses</option>
                <option value="Diproses/Didisposisi">Didisposisi</option>
                <option value="Menunggu Balasan">Menunggu Balasan</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* Perihal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Perihal Surat *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Undangan Rapat Koordinasi Penataan Lingkungan..."
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ringkasan Isi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ringkasan Pokok Isi Surat:
            </label>
            <textarea
              rows={3}
              value={ringkasanIsi}
              onChange={(e) => setRingkasanIsi(e.target.value)}
              placeholder="Tuliskan poin penting surat, tanggal acara bila undangan, atau kebutuhan berkas..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tujuan Disposisi & Petugas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tujuan Disposisi (Ditujukan Kepada)
              </label>
              <input
                type="text"
                placeholder="Contoh: Ketua Umum, Sekretaris Umum, Seksi Humas"
                value={tujuanDisposisi}
                onChange={(e) => setTujuanDisposisi(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Petugas Penerima (Sekretariat)
              </label>
              <input
                type="text"
                value={petugasPenerima}
                onChange={(e) => setPetugasPenerima(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* File Surat / Lampiran */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-blue-600" />
              Kelengkapan Berkas & Lampiran Surat
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nama File Scan Surat Masuk (PDF / Gambar)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: Scan_Surat_Kelurahan_Undangan.pdf"
                  value={fileSuratName}
                  onChange={(e) => setFileSuratName(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const sample = `Scan_Surat_${instansi.replace(/\s+/g, '_') || 'Masuk'}.pdf`;
                    setFileSuratName(sample);
                    onToast('Simulasi unggah file surat berhasil dikaitkan.');
                  }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> Pilih File
                </button>
              </div>
            </div>

            {/* Lampiran List & Add */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Nama berkas lampiran tambahan"
                  value={attName}
                  onChange={(e) => setAttName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <select
                  value={attType}
                  onChange={(e) => setAttType(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="PDF">PDF</option>
                  <option value="DOCX">DOCX</option>
                  <option value="JPG">JPG/PNG</option>
                  <option value="XLSX">Excel</option>
                </select>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAddLampiran}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {lampiranList.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {lampiranList.map((att) => (
                  <div
                    key={att.id}
                    className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                        {att.type}
                      </span>
                      <span className="font-semibold text-slate-800">{att.name}</span>
                      <span className="text-[10px] text-slate-400">({att.sizeKb} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLampiran(att.id)}
                      className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Disposisi Checkbox */}
          {!isEdit && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <input
                type="checkbox"
                id="chk-autodisp"
                checked={autoCreateDisposisi}
                onChange={(e) => setAutoCreateDisposisi(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <label htmlFor="chk-autodisp" className="text-xs text-amber-900 font-semibold cursor-pointer">
                Langsung buatkan Lembar Disposisi Instruksi Pimpinan setelah surat ini disimpan
              </label>
            </div>
          )}
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
            form="surat-masuk-form"
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {isEdit ? 'Simpan Perubahan' : 'Catat Surat Masuk'}
          </button>
        </div>
      </div>
    </div>
  );
};
