import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Bell,
  Check,
  Repeat,
  Image as ImageIcon,
  Save,
} from 'lucide-react';
import {
  AgendaItem,
  JenisKegiatan,
  KategoriAgenda,
  StatusKegiatan,
  StatusPertanggungjawaban,
  RecurrenceType,
  ReminderType,
  PanitiaMember,
  KATEGORI_AGENDA_LIST,
  BIDANG_SEKSI_LIST,
  SUMBER_DANA_LIST,
} from '../../../data/agendaData';

interface AgendaFormModalProps {
  initialData?: AgendaItem | null;
  defaultDate?: string;
  onSave: (agenda: AgendaItem) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const AgendaFormModal: React.FC<AgendaFormModalProps> = ({
  initialData,
  defaultDate,
  onSave,
  onClose,
  onToast,
}) => {
  const isEditing = !!initialData;
  const todayIso = new Date().toISOString().split('T')[0];

  // Form states
  const [formTab, setFormTab] = useState<'utama' | 'panitia' | 'lokasi' | 'anggaran' | 'pengingat' | 'dokumen'>('utama');

  // 1. Data Kegiatan
  const [namaKegiatan, setNamaKegiatan] = useState(initialData?.namaKegiatan || '');
  const [jenisKegiatan, setJenisKegiatan] = useState<JenisKegiatan>(initialData?.jenisKegiatan || 'Offline / Tatap Muka');
  const [kategori, setKategori] = useState<KategoriAgenda>(initialData?.kategori || 'Kepemudaan');
  const [tanggalMulai, setTanggalMulai] = useState(initialData?.tanggalMulai || defaultDate || todayIso);
  const [tanggalSelesai, setTanggalSelesai] = useState(initialData?.tanggalSelesai || defaultDate || todayIso);
  const [jamMulai, setJamMulai] = useState(initialData?.jamMulai || '08:00');
  const [jamSelesai, setJamSelesai] = useState(initialData?.jamSelesai || '12:00');
  const [lokasi, setLokasi] = useState(initialData?.lokasi || '');
  const [alamatLokasi, setAlamatLokasi] = useState(initialData?.alamatLokasi || '');
  const [penanggungJawab, setPenanggungJawab] = useState(initialData?.penanggungJawab || '');
  const [bidangSeksi, setBidangSeksi] = useState(initialData?.bidangSeksi || BIDANG_SEKSI_LIST[0]);
  const [jumlahPeserta, setJumlahPeserta] = useState<number>(initialData?.jumlahPeserta || 50);
  const [targetPeserta, setTargetPeserta] = useState(initialData?.targetPeserta || 'Pemuda & Pengurus RW 01 - RW 08');
  const [deskripsiKegiatan, setDeskripsiKegiatan] = useState(initialData?.deskripsiKegiatan || '');
  const [tujuanKegiatan, setTujuanKegiatan] = useState(initialData?.tujuanKegiatan || '');
  const [statusKegiatan, setStatusKegiatan] = useState<StatusKegiatan>(initialData?.statusKegiatan || 'Direncanakan');

  // 2. Kepanitiaan
  const [ketuaPanitia, setKetuaPanitia] = useState(initialData?.ketuaPanitia || '');
  const [sekretarisPanitia, setSekretarisPanitia] = useState(initialData?.sekretarisPanitia || '');
  const [bendaharaPanitia, setBendaharaPanitia] = useState(initialData?.bendaharaPanitia || '');
  const [daftarPanitia, setDaftarPanitia] = useState<PanitiaMember[]>(
    initialData?.daftarPanitia || [
      { id: 'p-new-1', nama: '', peran: 'Seksi Acara', bidang: 'Operasional', kontak: '' },
    ]
  );

  // 3. Pengingat
  const [pengingat, setPengingat] = useState<ReminderType[]>(
    initialData?.pengingat || ['H-7', 'H-3', 'H-1', 'Hari-H']
  );

  // 4. Lokasi Detail
  const [kecamatan, setKecamatan] = useState(initialData?.kecamatan || 'Kecamatan Cibodas');
  const [kabupatenKota, setKabupatenKota] = useState(initialData?.kabupatenKota || 'Kota Tangerang');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(initialData?.googleMapsUrl || '');
  const [koordinat, setKoordinat] = useState(initialData?.koordinat || '');
  const [petunjukLokasi, setPetunjukLokasi] = useState(initialData?.petunjukLokasi || '');

  // 5. Anggaran
  const [estimasiAnggaran, setEstimasiAnggaran] = useState<number>(initialData?.estimasiAnggaran || 0);
  const [realisasiAnggaran, setRealisasiAnggaran] = useState<number>(initialData?.realisasiAnggaran || 0);
  const [sumberDana, setSumberDana] = useState(initialData?.sumberDana || SUMBER_DANA_LIST[0]);
  const [nomorProposal, setNomorProposal] = useState(initialData?.nomorProposal || '');
  const [nomorLpj, setNomorLpj] = useState(initialData?.nomorLpj || '');
  const [statusPertanggungjawaban, setStatusPertanggungjawaban] = useState<StatusPertanggungjawaban>(
    initialData?.statusPertanggungjawaban || 'Belum Diajukan'
  );

  // 6. Dokumentasi & Recurrence
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [beritaKegiatan, setBeritaKegiatan] = useState(initialData?.beritaKegiatan || '');
  const [fotoUrlInput, setFotoUrlInput] = useState('');
  const [fotoKegiatan, setFotoKegiatan] = useState<string[]>(initialData?.fotoKegiatan || []);
  const [kegiatanBerulang, setKegiatanBerulang] = useState<RecurrenceType>(
    initialData?.kegiatanBerulang || 'Tidak berulang'
  );

  // Add / Remove panitia
  const handleAddPanitia = () => {
    setDaftarPanitia([
      ...daftarPanitia,
      { id: `p-new-${Date.now()}`, nama: '', peran: 'Anggota Panitia', bidang: bidangSeksi, kontak: '' },
    ]);
  };

  const handleRemovePanitia = (idx: number) => {
    setDaftarPanitia(daftarPanitia.filter((_, i) => i !== idx));
  };

  const handleUpdatePanitia = (idx: number, field: keyof PanitiaMember, val: string) => {
    const updated = [...daftarPanitia];
    updated[idx] = { ...updated[idx], [field]: val };
    setDaftarPanitia(updated);
  };

  // Toggle Reminder
  const toggleReminder = (rem: ReminderType) => {
    if (pengingat.includes(rem)) {
      setPengingat(pengingat.filter((r) => r !== rem));
    } else {
      setPengingat([...pengingat, rem]);
    }
  };

  // Add photo
  const handleAddPhoto = () => {
    if (fotoUrlInput.trim()) {
      setFotoKegiatan([...fotoKegiatan, fotoUrlInput.trim()]);
      setFotoUrlInput('');
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKegiatan.trim()) {
      onToast('Nama kegiatan wajib diisi.');
      setFormTab('utama');
      return;
    }
    if (!tanggalMulai) {
      onToast('Tanggal mulai kegiatan wajib ditentukan.');
      setFormTab('utama');
      return;
    }
    if (!lokasi.trim()) {
      onToast('Lokasi kegiatan wajib diisi.');
      setFormTab('utama');
      return;
    }

    const payload: AgendaItem = {
      id: initialData?.id || `agd-${Date.now()}`,
      namaKegiatan: namaKegiatan.trim(),
      jenisKegiatan,
      kategori,
      tanggalMulai,
      tanggalSelesai: tanggalSelesai || tanggalMulai,
      jamMulai,
      jamSelesai,
      lokasi: lokasi.trim(),
      alamatLokasi: alamatLokasi.trim(),
      penanggungJawab: penanggungJawab.trim() || 'Pengurus Karang Taruna',
      bidangSeksi,
      jumlahPeserta: Number(jumlahPeserta) || 0,
      targetPeserta: targetPeserta.trim(),
      deskripsiKegiatan: deskripsiKegiatan.trim(),
      tujuanKegiatan: tujuanKegiatan.trim(),
      statusKegiatan,

      ketuaPanitia: ketuaPanitia.trim() || penanggungJawab.trim(),
      sekretarisPanitia: sekretarisPanitia.trim(),
      bendaharaPanitia: bendaharaPanitia.trim(),
      daftarPanitia: daftarPanitia.filter((p) => p.nama.trim() !== ''),
      daftarPeserta: initialData?.daftarPeserta || [],
      jumlahPesertaHadir: initialData?.jumlahPesertaHadir || 0,
      jumlahPesertaTidakHadir: initialData?.jumlahPesertaTidakHadir || 0,

      pengingat,
      kecamatan: kecamatan.trim(),
      kabupatenKota: kabupatenKota.trim(),
      googleMapsUrl: googleMapsUrl.trim(),
      koordinat: koordinat.trim(),
      petunjukLokasi: petunjukLokasi.trim(),

      fotoKegiatan,
      videoUrl: videoUrl.trim(),
      beritaKegiatan: beritaKegiatan.trim(),
      laporanKegiatan: initialData?.laporanKegiatan,
      dokumenPendukung: initialData?.dokumenPendukung || ['Rundown Acara', 'Daftar Hadir'],

      estimasiAnggaran: Number(estimasiAnggaran) || 0,
      realisasiAnggaran: Number(realisasiAnggaran) || 0,
      sumberDana,
      nomorProposal: nomorProposal.trim(),
      nomorLpj: nomorLpj.trim(),
      statusPertanggungjawaban,

      kegiatanBerulang,
    };

    onSave(payload);
    onToast(isEditing ? 'Agenda kegiatan berhasil diperbarui!' : 'Agenda kegiatan baru berhasil dijadwalkan!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {isEditing ? 'Edit Jadwal Agenda Pemuda' : 'Jadwalkan Agenda Pemuda Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              Lengkapi data kegiatan, kepanitiaan, lokasi, anggaran, dan pengingat notifikasi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 bg-slate-50/50 overflow-x-auto no-scrollbar">
          {[
            { id: 'utama', label: '1. Data Kegiatan *', icon: FileText },
            { id: 'panitia', label: '2. Panitia & Peserta', icon: Users },
            { id: 'lokasi', label: '3. Lokasi & Maps *', icon: MapPin },
            { id: 'anggaran', label: '4. Anggaran & LPJ', icon: DollarSign },
            { id: 'pengingat', label: '5. Pengingat & Berulang', icon: Bell },
            { id: 'dokumen', label: '6. Foto & Berkas', icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = formTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: DATA KEGIATAN */}
          {formTab === 'utama' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Turnamen Futsal Pemuda Manis Jaya Cup 2026"
                  value={namaKegiatan}
                  onChange={(e) => setNamaKegiatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kegiatan
                  </label>
                  <select
                    value={jenisKegiatan}
                    onChange={(e) => setJenisKegiatan(e.target.value as JenisKegiatan)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    <option value="Offline / Tatap Muka">Offline / Tatap Muka</option>
                    <option value="Online / Daring">Online / Daring</option>
                    <option value="Hybrid">Hybrid (Offline + Online)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Agenda
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as KategoriAgenda)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    {KATEGORI_AGENDA_LIST.map((kat) => (
                      <option key={kat} value={kat}>
                        {kat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Kegiatan
                  </label>
                  <select
                    value={statusKegiatan}
                    onChange={(e) => setStatusKegiatan(e.target.value as StatusKegiatan)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    <option value="Direncanakan">Direncanakan</option>
                    <option value="Sedang Berjalan">Sedang Berjalan</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Ditunda">Ditunda</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Mulai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={jamMulai}
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={jamSelesai}
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Penanggung Jawab (PJ) Kegiatan
                  </label>
                  <input
                    type="text"
                    placeholder="Nama penanggung jawab (cth: Ahmad Fauzi)"
                    value={penanggungJawab}
                    onChange={(e) => setPenanggungJawab(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bidang / Seksi Pengampu
                  </label>
                  <select
                    value={bidangSeksi}
                    onChange={(e) => setBidangSeksi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    {BIDANG_SEKSI_LIST.map((bid) => (
                      <option key={bid} value={bid}>
                        {bid}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Jumlah Peserta (Orang)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={jumlahPeserta}
                    onChange={(e) => setJumlahPeserta(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sasaran / Kriteria Peserta
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Seluruh Pemuda & Warga RW 01 - RW 08"
                    value={targetPeserta}
                    onChange={(e) => setTargetPeserta(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Kegiatan
                </label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan ringkasan jalannya kegiatan..."
                  value={deskripsiKegiatan}
                  onChange={(e) => setDeskripsiKegiatan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tujuan & Target Output Kegiatan
                </label>
                <textarea
                  rows={2}
                  placeholder="Tujuan yang diharapkan dari pelaksanaan agenda..."
                  value={tujuanKegiatan}
                  onChange={(e) => setTujuanKegiatan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PANITIA & PESERTA */}
          {formTab === 'panitia' && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pengurus Panitia Utama
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Ketua Panitia</label>
                    <input
                      type="text"
                      placeholder="Nama Ketua Panitia"
                      value={ketuaPanitia}
                      onChange={(e) => setKetuaPanitia(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Sekretaris Panitia</label>
                    <input
                      type="text"
                      placeholder="Nama Sekretaris"
                      value={sekretarisPanitia}
                      onChange={(e) => setSekretarisPanitia(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Bendahara Panitia</label>
                    <input
                      type="text"
                      placeholder="Nama Bendahara"
                      value={bendaharaPanitia}
                      onChange={(e) => setBendaharaPanitia(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Daftar Panitia Dinamis */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Daftar Seksi & Anggota Panitia
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddPanitia}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Panitia</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {daftarPanitia.map((panitia, idx) => (
                    <div
                      key={panitia.id}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl items-center"
                    >
                      <input
                        type="text"
                        placeholder="Nama Lengkap"
                        value={panitia.nama}
                        onChange={(e) => handleUpdatePanitia(idx, 'nama', e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Peran / Jabatan (cth: Seksi Acara)"
                        value={panitia.peran}
                        onChange={(e) => handleUpdatePanitia(idx, 'peran', e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="No HP / WhatsApp"
                        value={panitia.kontak}
                        onChange={(e) => handleUpdatePanitia(idx, 'kontak', e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemovePanitia(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOKASI & MAPS */}
          {formTab === 'lokasi' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Tempat / Venue <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Balai Warga RW 03 / Lapangan Futsal Sport Center"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  placeholder="Jalan, nomor, RT/RW, dan patokan..."
                  value={alamatLokasi}
                  onChange={(e) => setAlamatLokasi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    value={kabupatenKota}
                    onChange={(e) => setKabupatenKota(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tautan Google Maps
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Koordinat GPS (Latitude, Longitude)
                  </label>
                  <input
                    type="text"
                    placeholder="-6.2088, 106.6025"
                    value={koordinat}
                    onChange={(e) => setKoordinat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Petunjuk Lokasi / Patokan Arah
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Samping Masjid Al-Ikhlas, masuk gang 50m"
                    value={petunjukLokasi}
                    onChange={(e) => setPetunjukLokasi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ANGGARAN & LPJ */}
          {formTab === 'anggaran' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimasi Anggaran Biaya (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={estimasiAnggaran}
                    onChange={(e) => setEstimasiAnggaran(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Realisasi Anggaran Pengeluaran (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={realisasiAnggaran}
                    onChange={(e) => setRealisasiAnggaran(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sumber Pendanaan</label>
                <select
                  value={sumberDana}
                  onChange={(e) => setSumberDana(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  {SUMBER_DANA_LIST.map((sd) => (
                    <option key={sd} value={sd}>
                      {sd}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Proposal</label>
                  <input
                    type="text"
                    placeholder="PROP/KT-MJ/X/2026/012"
                    value={nomorProposal}
                    onChange={(e) => setNomorProposal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor LPJ</label>
                  <input
                    type="text"
                    placeholder="LPJ/KT-MJ/X/2026/008"
                    value={nomorLpj}
                    onChange={(e) => setNomorLpj(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Pertanggungjawaban
                  </label>
                  <select
                    value={statusPertanggungjawaban}
                    onChange={(e) => setStatusPertanggungjawaban(e.target.value as StatusPertanggungjawaban)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="Belum Diajukan">Belum Diajukan</option>
                    <option value="Diajukan">Diajukan</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Selesai LPJ">Selesai LPJ</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PENGINGAT & BERULANG */}
          {formTab === 'pengingat' && (
            <div className="space-y-5">
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span>Pengaturan Pengingat (Notifikasi Countdown)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Pilih waktu pengiriman notifikasi pengingat otomatis untuk pengurus dan peserta kegiatan:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {(['H-30', 'H-14', 'H-7', 'H-3', 'H-1', 'Hari-H'] as ReminderType[]).map((rem) => {
                    const isChecked = pengingat.includes(rem);
                    return (
                      <label
                        key={rem}
                        onClick={() => toggleReminder(rem)}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={() => {}}
                        />
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                        <span>{rem}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <Repeat className="w-4 h-4 text-blue-600" />
                  <span>Jadwal Kegiatan Berulang (Recurrence)</span>
                </div>
                <select
                  value={kegiatanBerulang}
                  onChange={(e) => setKegiatanBerulang(e.target.value as RecurrenceType)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Tidak berulang">Tidak berulang (Satu kali acara)</option>
                  <option value="Harian">Harian</option>
                  <option value="Mingguan">Mingguan (Rutin per minggu)</option>
                  <option value="Bulanan">Bulanan (Cth: Pertemuan/Rapat Pleno)</option>
                  <option value="Tahunan">Tahunan (Cth: Turnamen / Peringatan 17-an)</option>
                  <option value="Custom">Custom Interval</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 6: FOTO & BERKAS */}
          {formTab === 'dokumen' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tambah URL Foto Dokumentasi
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={fotoUrlInput}
                    onChange={(e) => setFotoUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                  >
                    Tambah Foto
                  </button>
                </div>
              </div>

              {fotoKegiatan.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {fotoKegiatan.map((url, i) => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={url} alt={`Foto ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFotoKegiatan(fotoKegiatan.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tautan Video Dokumentasi (YouTube / Drive)
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Rilis Berita Terkait
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Meriah! Penutupan Turnamen Pemuda Manis Jaya Cup"
                  value={beritaKegiatan}
                  onChange={(e) => setBeritaKegiatan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Jadwalkan Agenda Sekarang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
