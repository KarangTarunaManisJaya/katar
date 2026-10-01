import React, { useState } from 'react';
import {
  X,
  FileText,
  Plus,
  Trash2,
  Save,
  Coins,
  Users,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ProposalItem,
  ProposalCategory,
  ProposalType,
  ProposalStatus,
  RABItem,
  DanaSourceItem,
  RundownItem,
} from '../../../types/proposal';

interface ProposalFormModalProps {
  initialData?: ProposalItem | null;
  onClose: () => void;
  onSave: (proposal: ProposalItem) => void;
  existingCount: number;
}

const CATEGORIES: ProposalCategory[] = [
  'Sosial & Kemasyarakatan',
  'Keagamaan',
  'Pendidikan',
  'Olahraga',
  'Kepemudaan',
  'Lingkungan',
  'Seni & Budaya',
  'Kewirausahaan',
  'Kesehatan',
  'Perlombaan',
  'Hari Besar Nasional',
  'Lainnya',
];

const PROPOSAL_TYPES: ProposalType[] = [
  'Kegiatan',
  'Pengadaan/Sarana',
  'Kemitraan/Sponsorship',
  'Bantuan Dana',
  'Kerjasama',
];

export const ProposalFormModal: React.FC<ProposalFormModalProps> = ({
  initialData,
  onClose,
  onSave,
  existingCount,
}) => {
  const currentYear = new Date().getFullYear();
  const todayISO = new Date().toISOString().split('T')[0];

  const defaultNomor = `PRP/${currentYear}/KT-MJ/${String(existingCount + 1).padStart(3, '0')}`;

  const [activeStep, setActiveStep] = useState<'dasar' | 'narasi' | 'rab' | 'dana' | 'panitia' | 'rundown'>('dasar');

  // Form states
  const [nomorProposal, setNomorProposal] = useState(initialData?.nomorProposal || defaultNomor);
  const [judul, setJudul] = useState(initialData?.judul || '');
  const [jenis, setJenis] = useState<ProposalType>(initialData?.jenis || 'Kegiatan');
  const [kategori, setKategori] = useState<ProposalCategory>(initialData?.kategori || 'Kepemudaan');
  const [tanggalProposal, setTanggalProposal] = useState(initialData?.tanggalProposal || todayISO);
  const [tanggalKegiatan, setTanggalKegiatan] = useState(initialData?.tanggalKegiatan || todayISO);
  const [lokasiKegiatan, setLokasiKegiatan] = useState(initialData?.lokasiKegiatan || 'Kelurahan Manis Jaya');
  const [penanggungJawab, setPenanggungJawab] = useState(initialData?.penanggungJawab || 'Iik Andriyana');
  const [bidangSeksi, setBidangSeksi] = useState(initialData?.bidangSeksi || 'Seksi Kepemudaan');
  const [status, setStatus] = useState<ProposalStatus>(initialData?.status || 'Draft');
  const [jatuhTempo, setJatuhTempo] = useState(initialData?.jatuhTempo || todayISO);
  const [tema, setTema] = useState(initialData?.tema || '');

  // Narasi
  const [latarBelakang, setLatarBelakang] = useState(
    initialData?.latarBelakang ||
      'Sebagai wadah pembinaan generasi muda, Karang Taruna Kelurahan Manis Jaya senantiasa berkomitmen menyelenggarakan kegiatan positif guna mempererat persatuan dan menggali potensi pemuda.'
  );
  const [dasarKegiatan, setDasarKegiatan] = useState(
    initialData?.dasarKegiatan ||
      '1. Program Kerja Tahunan Karang Taruna Manis Jaya.\n2. Hasil musyawarah mufakat rapat pengurus.'
  );
  const [maksudDanTujuan, setMaksudDanTujuan] = useState(
    initialData?.maksudDanTujuan ||
      '1. Meningkatkan partisipasi dan kreativitas generasi muda.\n2. Memperkokoh tali silaturahmi antarwarga masyarakat.'
  );
  const [manfaat, setManfaat] = useState(
    initialData?.manfaat || 'Terwujudnya pemuda yang berkarakter, mandiri, dan berjiwa sosial tinggi.'
  );
  const [bentukKegiatan, setBentukKegiatan] = useState(
    initialData?.bentukKegiatan || 'Kegiatan diselenggarakan dalam bentuk perlombaan, workshop, dan silaturahmi warga.'
  );
  const [targetPeserta, setTargetPeserta] = useState(
    initialData?.targetPeserta || '150 Orang Pemuda dan Warga RW 01 - RW 08.'
  );
  const [penutup, setPenutup] = useState(
    initialData?.penutup ||
      'Demikian proposal ini kami susun dengan harapan mendapat dukungan penuh dari semua pihak terkait. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.'
  );

  // RAB Items
  const [rabItems, setRabItems] = useState<RABItem[]>(
    initialData?.rabItems || [
      {
        id: 'rab-1',
        category: 'Kesekretariatan',
        name: 'Penggandaan Proposal & ATK',
        volume: 1,
        unit: 'Paket',
        pricePerUnit: 250000,
        total: 250000,
      },
      {
        id: 'rab-2',
        category: 'Acara & Panggung',
        name: 'Perlengkapan Acara & Sound System',
        volume: 1,
        unit: 'Paket',
        pricePerUnit: 1500000,
        total: 1500000,
      },
      {
        id: 'rab-3',
        category: 'Konsumsi',
        name: 'Konsumsi Peserta & Panitia',
        volume: 50,
        unit: 'Kotak',
        pricePerUnit: 25000,
        total: 1250000,
      },
    ]
  );

  // Dana Sources
  const [danaSources, setDanaSources] = useState<DanaSourceItem[]>(
    initialData?.danaSources || [
      {
        id: 'ds-1',
        source: 'Kas Karang Taruna',
        targetAmount: 1000000,
        receivedAmount: 1000000,
        status: 'Diterima',
      },
      {
        id: 'ds-2',
        source: 'Pemerintah Desa/Kelurahan',
        targetAmount: 2000000,
        receivedAmount: 0,
        status: 'Diajukan',
      },
    ]
  );

  // Kepanitiaan
  const [pelindung, setPelindung] = useState(initialData?.kepanitiaan.pelindung || 'Lurah Manis Jaya');
  const [penanggungJawabPanitia, setPenanggungJawabPanitia] = useState(
    initialData?.kepanitiaan.penanggungJawab || 'Iik Andriyana (Ketua Karang Taruna)'
  );
  const [ketuaPanitia, setKetuaPanitia] = useState(initialData?.kepanitiaan.ketuaPanitia || 'Budi Santoso');
  const [wakilKetua, setWakilKetua] = useState(initialData?.kepanitiaan.wakilKetua || 'Fajar Maulana');
  const [sekretaris, setSekretaris] = useState(initialData?.kepanitiaan.sekretaris || 'Anisa Rahmawati');
  const [bendahara, setBendahara] = useState(initialData?.kepanitiaan.bendahara || 'Bagus Tri Prakoso');
  const [seksiAcaraText, setSeksiAcaraText] = useState(initialData?.kepanitiaan.seksiAcara.join(', ') || 'Dimas Prasetyo, Bayu Nugroho');
  const [seksiHumasText, setSeksiHumasText] = useState(initialData?.kepanitiaan.seksiHumas.join(', ') || 'Dwi Lestari');
  const [seksiKonsumsiText, setSeksiKonsumsiText] = useState(initialData?.kepanitiaan.seksiKonsumsi.join(', ') || 'Siti Nurhaliza, Tri Wahyuni');
  const [seksiPerlengkapanText, setSeksiPerlengkapanText] = useState(initialData?.kepanitiaan.seksiPerlengkapan.join(', ') || 'Ahmad Fauzi');
  const [seksiDokumentasiText, setSeksiDokumentasiText] = useState(initialData?.kepanitiaan.seksiDokumentasi.join(', ') || 'Rian Ardiansyah');
  const [seksiKeamananText, setSeksiKeamananText] = useState(initialData?.kepanitiaan.seksiKeamanan.join(', ') || 'Hendri Setiawan');

  // Rundown Items
  const [rundownItems, setRundownItems] = useState<RundownItem[]>(
    initialData?.rundownItems || [
      {
        id: 'rd-1',
        waktu: '08:00 - 08:30',
        durasi: '30 Menit',
        kegiatan: 'Registrasi Undangan & Peserta',
        penanggungJawab: 'Seksi Kesekretariatan',
        tempat: 'Pintu Masuk',
      },
      {
        id: 'rd-2',
        waktu: '08:30 - 09:15',
        durasi: '45 Menit',
        kegiatan: 'Pembukaan & Sambutan Lurah Manis Jaya',
        penanggungJawab: 'Seksi Acara',
        tempat: 'Panggung Utama',
      },
    ]
  );

  // Auto total calculation
  const totalAnggaran = rabItems.reduce((acc, item) => acc + item.total, 0);
  const totalDanaTerkumpul = danaSources.reduce((acc, item) => acc + (item.receivedAmount || 0), 0);

  // Add RAB item
  const handleAddRAB = () => {
    const newItem: RABItem = {
      id: `rab-${Date.now()}`,
      category: 'Perlengkapan & Sound',
      name: 'Item Baru',
      volume: 1,
      unit: 'Unit',
      pricePerUnit: 100000,
      total: 100000,
    };
    setRabItems([...rabItems, newItem]);
  };

  const handleUpdateRAB = (index: number, field: keyof RABItem, val: any) => {
    const updated = [...rabItems];
    updated[index] = { ...updated[index], [field]: val };
    if (field === 'volume' || field === 'pricePerUnit') {
      const vol = field === 'volume' ? Number(val) : updated[index].volume;
      const price = field === 'pricePerUnit' ? Number(val) : updated[index].pricePerUnit;
      updated[index].total = vol * price;
    }
    setRabItems(updated);
  };

  const handleDeleteRAB = (index: number) => {
    setRabItems(rabItems.filter((_, i) => i !== index));
  };

  // Add Dana Source
  const handleAddDana = () => {
    const newDs: DanaSourceItem = {
      id: `ds-${Date.now()}`,
      source: 'Sponsor',
      targetAmount: 500000,
      receivedAmount: 0,
      status: 'Rencana',
    };
    setDanaSources([...danaSources, newDs]);
  };

  // Add Rundown
  const handleAddRundown = () => {
    const newRd: RundownItem = {
      id: `rd-${Date.now()}`,
      waktu: '09:15 - 11:30',
      durasi: '2 Jam',
      kegiatan: 'Pelaksanaan Kegiatan Inti',
      penanggungJawab: 'Panitia Pelaksana',
      tempat: lokasiKegiatan,
    };
    setRundownItems([...rundownItems, newRd]);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) return;

    const parseList = (str: string) =>
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const updatedProposal: ProposalItem = {
      id: initialData?.id || `prop-${Date.now()}`,
      nomorProposal,
      judul,
      jenis,
      kategori,
      tanggalProposal,
      tanggalKegiatan,
      lokasiKegiatan,
      penanggungJawab,
      bidangSeksi,
      status,
      jatuhTempo,
      tema,
      namaKegiatan: judul,
      latarBelakang,
      dasarKegiatan,
      maksudDanTujuan,
      manfaat,
      bentukKegiatan,
      waktuDanTempat: `${tanggalKegiatan} di ${lokasiKegiatan}`,
      targetPeserta,
      penutup,
      rabItems,
      totalAnggaran,
      danaSources,
      totalDanaTerkumpul,
      kepanitiaan: {
        pelindung,
        penanggungJawab: penanggungJawabPanitia,
        ketuaPanitia,
        wakilKetua,
        sekretaris,
        bendahara,
        seksiAcara: parseList(seksiAcaraText),
        seksiHumas: parseList(seksiHumasText),
        seksiKonsumsi: parseList(seksiKonsumsiText),
        seksiPerlengkapan: parseList(seksiPerlengkapanText),
        seksiDokumentasi: parseList(seksiDokumentasiText),
        seksiKeamanan: parseList(seksiKeamananText),
      },
      rundownItems,
      attachments: initialData?.attachments || [
        {
          id: 'att-1',
          type: 'RAB',
          title: 'Lembar Rencana Anggaran Biaya (RAB)',
          includedInPrint: true,
        },
        {
          id: 'att-2',
          type: 'Susunan Panitia',
          title: 'Struktur Kepanitiaan Resmi',
          includedInPrint: true,
        },
      ],
      approvalStages: initialData?.approvalStages || [
        {
          role: 'Pembuat Draf',
          officerName: ketuaPanitia,
          officerTitle: 'Ketua Panitia Pelaksana',
          status: 'Disetujui',
          date: tanggalProposal,
        },
        {
          role: 'Sekretaris',
          officerName: sekretaris,
          officerTitle: 'Sekretaris Karang Taruna',
          status: 'Menunggu',
        },
        {
          role: 'Bendahara',
          officerName: bendahara,
          officerTitle: 'Bendahara Karang Taruna',
          status: 'Menunggu',
        },
        {
          role: 'Ketua Karang Taruna',
          officerName: 'Iik Andriyana',
          officerTitle: 'Ketua Karang Taruna',
          status: 'Menunggu',
        },
        {
          role: 'Pembina / Lurah',
          officerName: 'Drs. H. Mulyadi, M.Si',
          officerTitle: 'Lurah Manis Jaya',
          status: 'Menunggu',
        },
      ],
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedProposal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {initialData ? 'Edit Dokumen Proposal' : 'Tambah Proposal Baru'}
              </h2>
              <p className="text-xs text-slate-500">Lengkapi formulir terstruktur RAB, Kepanitiaan, dan Rundown</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-2 border-b border-slate-200 bg-white overflow-x-auto text-xs font-bold">
          {[
            { id: 'dasar', label: '1. Data Pokok' },
            { id: 'narasi', label: '2. Narasi & Tujuan' },
            { id: 'rab', label: `3. Rencana Anggaran (Rp ${(totalAnggaran / 1000000).toFixed(1)} Jt)` },
            { id: 'dana', label: '4. Sumber Dana' },
            { id: 'panitia', label: '5. Kepanitiaan' },
            { id: 'rundown', label: '6. Rundown Acara' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStep(s.id as any)}
              className={`px-3 py-2.5 border-b-2 whitespace-nowrap transition-all ${
                activeStep === s.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs space-y-4 text-slate-700">
          {/* STEP 1: Data Pokok */}
          {activeStep === 'dasar' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Proposal (Otomatis)</label>
                  <input
                    type="text"
                    value={nomorProposal}
                    onChange={(e) => setNomorProposal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Pengajuan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProposalStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Revisi">Revisi</option>
                    <option value="Ditolak">Ditolak</option>
                    <option value="Selesai/Terlaksana">Selesai/Terlaksana</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Proposal Kegiatan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Turnamen Futsal Antar-RW Pemuda Manis Jaya Cup"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tema Kegiatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Menumbuhkan Solidaritas Pemuda demi Kemajuan Wilayah"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Kegiatan</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as ProposalCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Proposal</label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value as ProposalType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {PROPOSAL_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Proposal</label>
                  <input
                    type="date"
                    value={tanggalProposal}
                    onChange={(e) => setTanggalProposal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    value={tanggalKegiatan}
                    onChange={(e) => setTanggalKegiatan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batas Jatuh Tempo</label>
                  <input
                    type="date"
                    value={jatuhTempo}
                    onChange={(e) => setJatuhTempo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lokasi Kegiatan</label>
                  <input
                    type="text"
                    value={lokasiKegiatan}
                    onChange={(e) => setLokasiKegiatan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    value={penanggungJawab}
                    onChange={(e) => setPenanggungJawab(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bidang / Seksi</label>
                  <input
                    type="text"
                    value={bidangSeksi}
                    onChange={(e) => setBidangSeksi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Narasi & Isi */}
          {activeStep === 'narasi' && (
            <div className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Latar Belakang</label>
                <textarea
                  rows={3}
                  value={latarBelakang}
                  onChange={(e) => setLatarBelakang(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dasar Kegiatan</label>
                <textarea
                  rows={2}
                  value={dasarKegiatan}
                  onChange={(e) => setDasarKegiatan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Maksud dan Tujuan</label>
                <textarea
                  rows={3}
                  value={maksudDanTujuan}
                  onChange={(e) => setMaksudDanTujuan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bentuk Kegiatan & Target Peserta</label>
                <input
                  type="text"
                  value={bentukKegiatan}
                  onChange={(e) => setBentukKegiatan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                />
                <input
                  type="text"
                  placeholder="Target Peserta (misal: 150 Pemuda RW 01 - RW 08)"
                  value={targetPeserta}
                  onChange={(e) => setTargetPeserta(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Penutup Proposal</label>
                <textarea
                  rows={2}
                  value={penutup}
                  onChange={(e) => setPenutup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Rencana Anggaran Biaya (RAB) */}
          {activeStep === 'rab' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Tabel Rencana Anggaran Biaya (RAB)</h4>
                  <p className="text-[11px] text-slate-500">
                    Total Otomatis: <strong className="text-emerald-700">Rp {totalAnggaran.toLocaleString('id-ID')}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddRAB}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Pos Anggaran
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {rabItems.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <select
                        value={item.category}
                        onChange={(e) => handleUpdateRAB(idx, 'category', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="Kesekretariatan">Kesekretariatan</option>
                        <option value="Acara & Panggung">Acara & Panggung</option>
                        <option value="Konsumsi">Konsumsi</option>
                        <option value="Perlengkapan & Sound">Perlengkapan & Sound</option>
                        <option value="Publikasi & Dokumentasi">Publikasi & Dokumentasi</option>
                        <option value="Hadiah & Piala">Hadiah & Piala</option>
                        <option value="Transportasi & Logistik">Transportasi & Logistik</option>
                        <option value="Biaya Tak Terduga">Biaya Tak Terduga</option>
                      </select>
                    </div>

                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Nama Barang / Uraian"
                        value={item.name}
                        onChange={(e) => handleUpdateRAB(idx, 'name', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="col-span-1">
                      <input
                        type="number"
                        min="1"
                        value={item.volume}
                        onChange={(e) => handleUpdateRAB(idx, 'volume', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center"
                      />
                    </div>

                    <div className="col-span-1">
                      <input
                        type="text"
                        placeholder="Satuan"
                        value={item.unit}
                        onChange={(e) => handleUpdateRAB(idx, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        step="1000"
                        value={item.pricePerUnit}
                        onChange={(e) => handleUpdateRAB(idx, 'pricePerUnit', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-right font-medium"
                      />
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteRAB(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Sumber Dana */}
          {activeStep === 'dana' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Alokasi & Target Sumber Dana</h4>
                  <p className="text-[11px] text-slate-500">
                    Target Total: Rp {totalAnggaran.toLocaleString('id-ID')} | Terkumpul: Rp {totalDanaTerkumpul.toLocaleString('id-ID')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDana}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Pos Sumber Dana
                </button>
              </div>

              <div className="space-y-2">
                {danaSources.map((ds, idx) => (
                  <div key={ds.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                    <select
                      value={ds.source}
                      onChange={(e) => {
                        const updated = [...danaSources];
                        updated[idx].source = e.target.value as any;
                        setDanaSources(updated);
                      }}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    >
                      <option value="Kas Karang Taruna">Kas Karang Taruna</option>
                      <option value="Swadaya Masyarakat">Swadaya Masyarakat</option>
                      <option value="Donatur">Donatur</option>
                      <option value="Sponsor">Sponsor</option>
                      <option value="Pemerintah Desa/Kelurahan">Pemerintah Desa/Kelurahan</option>
                      <option value="Kecamatan">Kecamatan</option>
                      <option value="Perusahaan/CSR">Perusahaan/CSR</option>
                      <option value="Bantuan Lainnya">Bantuan Lainnya</option>
                    </select>

                    <input
                      type="number"
                      placeholder="Target (Rp)"
                      value={ds.targetAmount}
                      onChange={(e) => {
                        const updated = [...danaSources];
                        updated[idx].targetAmount = Number(e.target.value);
                        setDanaSources(updated);
                      }}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs w-32 text-right"
                    />

                    <input
                      type="number"
                      placeholder="Diterima (Rp)"
                      value={ds.receivedAmount}
                      onChange={(e) => {
                        const updated = [...danaSources];
                        updated[idx].receivedAmount = Number(e.target.value);
                        setDanaSources(updated);
                      }}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs w-32 text-right"
                    />

                    <input
                      type="text"
                      placeholder="Keterangan / Nama Donatur"
                      value={ds.donorName || ''}
                      onChange={(e) => {
                        const updated = [...danaSources];
                        updated[idx].donorName = e.target.value;
                        setDanaSources(updated);
                      }}
                      className="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />

                    <button
                      type="button"
                      onClick={() => setDanaSources(danaSources.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Kepanitiaan */}
          {activeStep === 'panitia' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pelindung / Penasehat</label>
                  <input
                    type="text"
                    value={pelindung}
                    onChange={(e) => setPelindung(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Penanggung Jawab Organisasi</label>
                  <input
                    type="text"
                    value={penanggungJawabPanitia}
                    onChange={(e) => setPenanggungJawabPanitia(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ketua Panitia Pelaksana *</label>
                  <input
                    type="text"
                    value={ketuaPanitia}
                    onChange={(e) => setKetuaPanitia(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Wakil Ketua Panitia</label>
                  <input
                    type="text"
                    value={wakilKetua}
                    onChange={(e) => setWakilKetua(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sekretaris Panitia</label>
                  <input
                    type="text"
                    value={sekretaris}
                    onChange={(e) => setSekretaris(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bendahara Panitia</label>
                  <input
                    type="text"
                    value={bendahara}
                    onChange={(e) => setBendahara(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Anggota Seksi-Seksi (Pisahkan Koma):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-600 block mb-0.5">Seksi Acara</label>
                    <input
                      type="text"
                      value={seksiAcaraText}
                      onChange={(e) => setSeksiAcaraText(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Seksi Humas & Publikasi</label>
                    <input
                      type="text"
                      value={seksiHumasText}
                      onChange={(e) => setSeksiHumasText(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Seksi Konsumsi</label>
                    <input
                      type="text"
                      value={seksiKonsumsiText}
                      onChange={(e) => setSeksiKonsumsiText(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Seksi Perlengkapan</label>
                    <input
                      type="text"
                      value={seksiPerlengkapanText}
                      onChange={(e) => setSeksiPerlengkapanText(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Seksi Dokumentasi</label>
                    <input
                      type="text"
                      value={seksiDokumentasiText}
                      onChange={(e) => setSeksiDokumentasiText(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Seksi Keamanan</label>
                    <input
                      type="text"
                      value={seksiKeamananText}
                      onChange={(e) => setSeksiKeamananText(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Rundown Acara */}
          {activeStep === 'rundown' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Susunan Acara / Rundown</h4>
                  <p className="text-[11px] text-slate-500">Jadwal pembagian waktu pelaksanaan kegiatan</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddRundown}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Sesi Acara
                </button>
              </div>

              <div className="space-y-2">
                {rundownItems.map((rd, idx) => (
                  <div key={rd.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Waktu (08:00 - 09:00)"
                      value={rd.waktu}
                      onChange={(e) => {
                        const updated = [...rundownItems];
                        updated[idx].waktu = e.target.value;
                        setRundownItems(updated);
                      }}
                      className="w-28 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Durasi"
                      value={rd.durasi}
                      onChange={(e) => {
                        const updated = [...rundownItems];
                        updated[idx].durasi = e.target.value;
                        setRundownItems(updated);
                      }}
                      className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center"
                    />
                    <input
                      type="text"
                      placeholder="Agenda Kegiatan"
                      value={rd.kegiatan}
                      onChange={(e) => {
                        const updated = [...rundownItems];
                        updated[idx].kegiatan = e.target.value;
                        setRundownItems(updated);
                      }}
                      className="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="PJ / Tempat"
                      value={rd.penanggungJawab}
                      onChange={(e) => {
                        const updated = [...rundownItems];
                        updated[idx].penanggungJawab = e.target.value;
                        setRundownItems(updated);
                      }}
                      className="w-32 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setRundownItems(rundownItems.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Bottom Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              Simpan Dokumen Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
