import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  FileText,
  Plus,
  Trash2,
  Save,
  Printer,
  Sparkles,
  Paperclip,
  CheckCircle2,
  Eye,
  Building,
  User,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  SuratKeluarItem,
  JenisSurat,
  SifatSurat,
  StatusSuratKeluar,
  PenandatanganInfo,
  SuratAttachment,
  NumberingConfig,
} from '../../../types/surat';
import {
  templateSuratPresets,
  generateNextNomorSurat,
} from '../../../data/suratInitialData';

interface BuatSuratFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: SuratKeluarItem) => void;
  editingItem?: SuratKeluarItem | null;
  numberingConfig: NumberingConfig;
  onUpdateCounter: (newCounter: number) => void;
  onToast: (msg: string) => void;
}

export const BuatSuratFormModal: React.FC<BuatSuratFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  numberingConfig,
  onUpdateCounter,
  onToast,
}) => {
  const isEdit = !!editingItem;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Form states
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState(todayStr);
  const [jenisSurat, setJenisSurat] = useState<JenisSurat>('Undangan');
  const [sifatSurat, setSifatSurat] = useState<SifatSurat>('Biasa');
  const [perihal, setPerihal] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [namaPenerima, setNamaPenerima] = useState('');
  const [instansi, setInstansi] = useState('');
  const [alamat, setAlamat] = useState('');
  const [isiSurat, setIsiSurat] = useState('');
  const [tembusanText, setTembusanText] = useState('1. Pembina Karang Taruna\n2. Arsip');
  const [status, setStatus] = useState<StatusSuratKeluar>('Draft');
  const [stempelOrganisasi, setStempelOrganisasi] = useState(true);

  // Penandatangan list
  const [penandatangan, setPenandatangan] = useState<PenandatanganInfo[]>([
    {
      nama: 'Muhammad Ryan Pratama, S.Kom.',
      jabatan: 'Ketua Umum',
      ktaNo: 'KT-MJ-2024-001',
      includeStamp: true,
    },
    {
      nama: 'Dinda Kirana S., S.AP.',
      jabatan: 'Sekretaris Umum',
      ktaNo: 'KT-MJ-2024-002',
      includeStamp: true,
    },
  ]);

  // Lampiran list
  const [lampiranList, setLampiranList] = useState<SuratAttachment[]>([]);
  const [newAttName, setNewAttName] = useState('');
  const [newAttType, setNewAttType] = useState<'PDF' | 'DOCX' | 'JPG' | 'XLSX'>('PDF');
  const [newAttDesc, setNewAttDesc] = useState('');

  // Active form view: 'form' | 'preview'
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Initialize form when editing or opening
  useEffect(() => {
    if (editingItem) {
      setNomorSurat(editingItem.nomorSurat);
      setTanggalSurat(editingItem.tanggalSurat);
      setJenisSurat(editingItem.jenisSurat);
      setSifatSurat(editingItem.sifatSurat);
      setPerihal(editingItem.perihal);
      setTujuan(editingItem.tujuan);
      setNamaPenerima(editingItem.namaPenerima || '');
      setInstansi(editingItem.instansi || '');
      setAlamat(editingItem.alamat || '');
      setIsiSurat(editingItem.isiSurat);
      setTembusanText(editingItem.tembusan ? editingItem.tembusan.join('\n') : '');
      setStatus(editingItem.status);
      setStempelOrganisasi(editingItem.stempelOrganisasi);
      setPenandatangan(editingItem.penandatangan || []);
      setLampiranList(editingItem.lampiran || []);
      setSelectedTemplateId(editingItem.templateUsed || '');
    } else {
      // Auto-generate number for new letter
      const nextNo = generateNextNomorSurat('Undangan', numberingConfig, now);
      setNomorSurat(nextNo);
      setTanggalSurat(todayStr);
      setJenisSurat('Undangan');
      setSifatSurat('Biasa');
      setPerihal('');
      setTujuan('');
      setNamaPenerima('');
      setInstansi('');
      setAlamat('');
      setIsiSurat('');
      setTembusanText('1. Pembina Karang Taruna\n2. Arsip');
      setStatus('Draft');
      setStempelOrganisasi(true);
      setLampiranList([]);
      setSelectedTemplateId('');
    }
  }, [editingItem, isOpen]);

  // When template is selected
  const handleSelectTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templateSuratPresets.find((t) => t.id === tmplId);
    if (!tmpl) return;

    setJenisSurat(tmpl.jenisSurat);
    setPerihal(tmpl.defaultPerihal);
    setTujuan(tmpl.defaultTujuan);
    setInstansi(tmpl.defaultInstansi);
    setAlamat(tmpl.defaultAlamat);
    setIsiSurat(tmpl.defaultIsi);
    setPenandatangan(tmpl.defaultPenandatangan);

    // regenerate number with template jenis
    const generatedNo = generateNextNomorSurat(tmpl.jenisSurat, numberingConfig, new Date(tanggalSurat));
    setNomorSurat(generatedNo);
    onToast(`Template "${tmpl.nama}" dimuat. Nomor surat disesuaikan ke ${generatedNo}.`);
  };

  // Change jenis surat and recompute number if not editing
  const handleJenisChange = (newJenis: JenisSurat) => {
    setJenisSurat(newJenis);
    if (!isEdit) {
      const generatedNo = generateNextNomorSurat(newJenis, numberingConfig, new Date(tanggalSurat));
      setNomorSurat(generatedNo);
    }
  };

  // Add attachment
  const handleAddAttachment = () => {
    if (!newAttName.trim()) {
      onToast('Tuliskan nama file lampiran.');
      return;
    }
    const newAtt: SuratAttachment = {
      id: `att-${Date.now()}`,
      name: newAttName.trim().endsWith(`.${newAttType.toLowerCase()}`)
        ? newAttName.trim()
        : `${newAttName.trim()}.${newAttType.toLowerCase()}`,
      sizeKb: Math.floor(100 + Math.random() * 850),
      type: newAttType,
      description: newAttDesc.trim() || undefined,
    };
    setLampiranList([...lampiranList, newAtt]);
    setNewAttName('');
    setNewAttDesc('');
  };

  const handleRemoveAttachment = (id: string) => {
    setLampiranList(lampiranList.filter((a) => a.id !== id));
  };

  // Add penandatangan
  const handleAddPenandatangan = () => {
    setPenandatangan([
      ...penandatangan,
      {
        nama: 'Budi Santoso, S.E.',
        jabatan: 'Bendahara',
        ktaNo: 'KT-MJ-2024-003',
        includeStamp: false,
      },
    ]);
  };

  const handleUpdatePenandatangan = (index: number, field: keyof PenandatanganInfo, val: any) => {
    const updated = [...penandatangan];
    updated[index] = { ...updated[index], [field]: val };
    setPenandatangan(updated);
  };

  const handleRemovePenandatangan = (index: number) => {
    setPenandatangan(penandatangan.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perihal.trim() || !tujuan.trim()) {
      onToast('Perihal dan Tujuan Surat wajib diisi!');
      return;
    }

    const tembusanArray = tembusanText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const savedData: SuratKeluarItem = {
      id: editingItem ? editingItem.id : `sk-${Date.now()}`,
      nomorSurat: nomorSurat.trim(),
      tanggalSurat,
      tujuan: tujuan.trim(),
      namaPenerima: namaPenerima.trim(),
      instansi: instansi.trim(),
      alamat: alamat.trim(),
      perihal: perihal.trim(),
      jenisSurat,
      sifatSurat,
      isiSurat: isiSurat.trim(),
      tembusan: tembusanArray,
      lampiran: lampiranList,
      penandatangan,
      stempelOrganisasi,
      status,
      filePdfGenerated: true,
      templateUsed: selectedTemplateId || undefined,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(savedData);

    // If new item, increment counter
    if (!isEdit) {
      onUpdateCounter(numberingConfig.counterSaatIni + 1);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isEdit ? 'Edit Surat Keluar / Dinas' : 'Penerbitan Surat Keluar Resmi'}
              </h2>
              <p className="text-xs text-emerald-100">
                Pilih format template baku atau buat surat kustom dengan penomoran otomatis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="bg-white/20 p-0.5 rounded-lg flex text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'form' ? 'bg-white text-emerald-800 shadow-xs' : 'text-white'
                }`}
              >
                Form Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'preview' ? 'bg-white text-emerald-800 shadow-xs' : 'text-white'
                }`}
              >
                Live Pratinjau
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'form' ? (
            <form id="surat-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Template Picker */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Pilih Format Template Baku (10 Template Tersedia):
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Otomatis mengisi struktur isi & perihal
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {templateSuratPresets.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTemplate(t.id)}
                      className={`p-2 rounded-lg text-left border text-xs transition-all ${
                        selectedTemplateId === t.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:border-emerald-300 text-slate-700'
                      }`}
                    >
                      <div className="font-semibold truncate">{t.nama}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">{t.jenisSurat}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Penomoran & Klasifikasi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Surat Otomatis *
                  </label>
                  <input
                    type="text"
                    required
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg bg-emerald-50/50 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Format: {numberingConfig.prefix} otomatis
                  </span>
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
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Surat *
                  </label>
                  <select
                    value={jenisSurat}
                    onChange={(e) => handleJenisChange(e.target.value as JenisSurat)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Undangan">Undangan</option>
                    <option value="Permohonan">Permohonan</option>
                    <option value="Pemberitahuan">Pemberitahuan</option>
                    <option value="Surat tugas">Surat Tugas</option>
                    <option value="Surat keterangan">Surat Keterangan</option>
                    <option value="Surat rekomendasi">Surat Rekomendasi</option>
                    <option value="Surat pengantar">Surat Pengantar</option>
                    <option value="Surat keputusan">Surat Keputusan (SK)</option>
                    <option value="Surat pernyataan">Surat Pernyataan</option>
                    <option value="Berita acara">Berita Acara</option>
                    <option value="Surat lainnya">Surat Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Sifat Surat, Status & Perihal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sifat Surat *
                  </label>
                  <select
                    value={sifatSurat}
                    onChange={(e) => setSifatSurat(e.target.value as SifatSurat)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Penting">Penting</option>
                    <option value="Segera">Segera</option>
                    <option value="Rahasia">Rahasia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Dokumen *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusSuratKeluar)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Menunggu TTD">Menunggu TTD</option>
                    <option value="Ditandatangani">Ditandatangani</option>
                    <option value="Terkirim">Terkirim</option>
                    <option value="Diarsipkan">Diarsipkan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Perihal Surat *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Undangan Rapat Koordinasi..."
                    value={perihal}
                    onChange={(e) => setPerihal(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Tujuan & Penerima */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Tujuan dan Identitas Penerima
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tujuan (Kepada Yth.) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bapak Lurah Manis Jaya / Ketua RW 01"
                      value={tujuan}
                      onChange={(e) => setTujuan(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Lengkap Penerima (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Drs. H. Ujang Suherman"
                      value={namaPenerima}
                      onChange={(e) => setNamaPenerima(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Instansi / Organisasi Tujuan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Kantor Kelurahan Manis Jaya"
                      value={instansi}
                      onChange={(e) => setInstansi(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Alamat / Tempat
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Di Tempat / Jl. Raya Industri Manis"
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Isi Surat & Tembusan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Batang Tubuh & Narasi Isi Surat *
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Mendukung paragraf, nomor poin, dan penutup dinas
                  </span>
                </div>
                <textarea
                  rows={9}
                  required
                  value={isiSurat}
                  onChange={(e) => setIsiSurat(e.target.value)}
                  placeholder="Tuliskan isi surat secara lengkap..."
                  className="w-full text-xs font-sans leading-relaxed p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Tembusan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tembusan Surat (Satu baris per tujuan):
                </label>
                <textarea
                  rows={2}
                  value={tembusanText}
                  onChange={(e) => setTembusanText(e.target.value)}
                  placeholder="1. Pembina Karang Taruna&#10;2. Arsip"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Penandatangan Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Penandatangan & Pengesahan Surat
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddPenandatangan}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Penandatangan
                  </button>
                </div>

                <div className="space-y-2">
                  {penandatangan.map((ttd, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <div className="flex-1">
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Nama Pejabat</label>
                        <input
                          type="text"
                          value={ttd.nama}
                          onChange={(e) => handleUpdatePenandatangan(idx, 'nama', e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded"
                        />
                      </div>
                      <div className="w-44">
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Jabatan</label>
                        <select
                          value={ttd.jabatan}
                          onChange={(e) => handleUpdatePenandatangan(idx, 'jabatan', e.target.value as any)}
                          className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white"
                        >
                          <option value="Ketua Umum">Ketua Umum</option>
                          <option value="Sekretaris Umum">Sekretaris Umum</option>
                          <option value="Bendahara">Bendahara</option>
                          <option value="Ketua Panitia">Ketua Panitia</option>
                          <option value="Pengurus Lainnya">Pengurus Lainnya</option>
                        </select>
                      </div>
                      <div className="w-36">
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Nomor KTA</label>
                        <input
                          type="text"
                          value={ttd.ktaNo || ''}
                          onChange={(e) => handleUpdatePenandatangan(idx, 'ktaNo', e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded"
                        />
                      </div>
                      {penandatangan.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePenandatangan(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded mt-3 sm:mt-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="chk-stempel"
                    checked={stempelOrganisasi}
                    onChange={(e) => setStempelOrganisasi(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="chk-stempel" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Sertakan Cap / Stempel Resmi Karang Taruna Kelurahan Manis Jaya
                  </label>
                </div>
              </div>

              {/* Lampiran File Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-indigo-600" />
                  Lampiran Berkas Pendukung (Maksimal 10 MB per berkas)
                </h3>

                {/* Add attachment inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Nama berkas (misal: Susunan_Acara)"
                      value={newAttName}
                      onChange={(e) => setNewAttName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <select
                      value={newAttType}
                      onChange={(e) => setNewAttType(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="PDF">PDF (.pdf)</option>
                      <option value="DOCX">DOC / DOCX</option>
                      <option value="JPG">JPG / PNG</option>
                      <option value="XLSX">Excel (.xlsx)</option>
                    </select>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      + Tambah Lampiran
                    </button>
                  </div>
                </div>

                {/* List attachments */}
                {lampiranList.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {lampiranList.map((att) => (
                      <div
                        key={att.id}
                        className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold">
                            {att.type}
                          </span>
                          <span className="font-semibold text-slate-800">{att.name}</span>
                          <span className="text-[10px] text-slate-400">({att.sizeKb} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* LIVE PRATINJAU KOP SURAT RESMI */
            <div className="bg-slate-100 p-4 sm:p-6 rounded-xl overflow-x-auto flex justify-center">
              <div className="bg-white text-slate-900 shadow-xl border border-slate-300 w-full max-w-[760px] p-8 sm:p-10 font-serif leading-relaxed text-xs">
                {/* Official Letterhead (KOP SURAT) */}
                <div className="text-center border-b-2 border-slate-900 pb-3 mb-6 relative">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-blue-600 flex items-center justify-center p-1 font-sans text-center font-bold text-blue-700 text-[10px]">
                      LOGO KATAR
                    </div>
                    <div className="text-center font-sans">
                      <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-600">
                        PENGURUS KARANG TARUNA KELURAHAN MANIS JAYA
                      </h4>
                      <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                        KECAMATAN JATIUWUNG - KOTA TANGERANG
                      </h3>
                      <p className="text-[10px] text-slate-500 font-normal">
                        Sekretariat: Jl. Manis Jaya Raya No. 12, Kel. Manis Jaya, Kec. Jatiuwung, Kota Tangerang 15136
                      </p>
                      <p className="text-[10px] text-slate-500 font-normal">
                        Telp/WA: 0812 8912 3450 | Email: sekretariat@karangtarunamanisjaya.id
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-2 border-indigo-600 flex items-center justify-center p-1 font-sans text-center font-bold text-indigo-700 text-[10px]">
                      KOTA TNG
                    </div>
                  </div>
                </div>

                {/* Nomor, Lampiran, Perihal, & Tanggal */}
                <div className="flex justify-between items-start mb-6 font-sans text-[11px]">
                  <div className="space-y-1">
                    <div><b>Nomor</b> : {nomorSurat || '.../.../...'}</div>
                    <div><b>Lampiran</b> : {lampiranList.length > 0 ? `${lampiranList.length} Berkas` : '-'}</div>
                    <div><b>Perihal</b> : <b>{perihal || '(Perihal Surat)'}</b></div>
                    <div><b>Sifat</b> : {sifatSurat}</div>
                  </div>
                  <div className="text-right">
                    <div>Manis Jaya, {tanggalSurat}</div>
                  </div>
                </div>

                {/* Tujuan Surat */}
                <div className="mb-6 font-sans text-[11px]">
                  <div>Kepada Yth.</div>
                  <div className="font-bold">{tujuan || '(Pihak Penerima)'}</div>
                  {instansi && <div>{instansi}</div>}
                  {alamat && <div>di {alamat}</div>}
                </div>

                {/* Batang Tubuh Isi Surat */}
                <div className="mb-8 whitespace-pre-line text-justify leading-relaxed font-sans text-xs">
                  {isiSurat || 'Isi teks surat dinas belum diisi...'}
                </div>

                {/* Tanda Tangan */}
                <div className="flex justify-end mt-8 font-sans">
                  <div className="text-center min-w-[220px]">
                    <div>Pengurus Karang Taruna Kelurahan Manis Jaya</div>
                    <div className="h-20 flex items-center justify-center relative my-1">
                      {stempelOrganisasi && (
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-600/70 text-indigo-700 font-bold text-[9px] flex items-center justify-center text-center rotate-[-12deg] absolute">
                          STEMPEL RESMI<br/>MANIS JAYA
                        </div>
                      )}
                      <span className="text-[10px] text-slate-300 italic">(Tanda Tangan Sah)</span>
                    </div>
                    {penandatangan.map((ttd, i) => (
                      <div key={i} className="mb-1">
                        <div className="font-bold underline uppercase">{ttd.nama}</div>
                        <div className="text-[10px] text-slate-600">{ttd.jabatan}</div>
                        {ttd.ktaNo && <div className="text-[9px] text-slate-400">KTA: {ttd.ktaNo}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tembusan */}
                {tembusanText && (
                  <div className="mt-8 pt-4 border-t border-slate-200 font-sans text-[10px] text-slate-500">
                    <div className="font-bold mb-1">Tembusan:</div>
                    <div className="whitespace-pre-line">{tembusanText}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
          <div className="text-xs text-slate-500">
            Penomoran otomatis: <b className="font-mono text-emerald-800">{nomorSurat}</b>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              form="surat-form"
              onClick={(e) => {
                if (activeTab === 'preview') {
                  handleSubmit(e);
                }
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {isEdit ? 'Simpan Perubahan' : 'Terbitkan Surat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
