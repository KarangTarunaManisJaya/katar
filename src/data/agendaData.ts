export type JenisKegiatan = 'Offline / Tatap Muka' | 'Online / Daring' | 'Hybrid';

export type KategoriAgenda =
  | 'Sosial & Kemasyarakatan'
  | 'Keagamaan'
  | 'Olahraga'
  | 'Pendidikan'
  | 'Kewirausahaan'
  | 'Lingkungan'
  | 'Seni & Budaya'
  | 'Kepemudaan'
  | 'Nasional/Kebangsaan'
  | 'Kesehatan'
  | 'Kedaruratan/Bakti Sosial'
  | 'Rapat Organisasi'
  | 'Perlombaan'
  | 'Lainnya';

export type StatusKegiatan =
  | 'Direncanakan'
  | 'Sedang Berjalan'
  | 'Selesai'
  | 'Ditunda'
  | 'Dibatalkan';

export type StatusPertanggungjawaban =
  | 'Belum Diajukan'
  | 'Diajukan'
  | 'Disetujui'
  | 'Selesai LPJ';

export type RecurrenceType =
  | 'Tidak berulang'
  | 'Harian'
  | 'Mingguan'
  | 'Bulanan'
  | 'Tahunan'
  | 'Custom';

export type ReminderType = 'H-30' | 'H-14' | 'H-7' | 'H-3' | 'H-1' | 'Hari-H';

export interface PanitiaMember {
  id: string;
  nama: string;
  peran: string; // Ketua, Sekretaris, Bendahara, Seksi Acara, Seksi Konsumsi, Seksi Dokumentasi, Seksi Keamanan, Perlengkapan
  bidang: string;
  kontak: string;
}

export interface PesertaItem {
  id: string;
  nama: string;
  instansiRt: string;
  statusKehadiran: 'Hadir' | 'Tidak Hadir' | 'Belum Konfirmasi';
}

export interface AgendaItem {
  id: string;
  // 1. Data Kegiatan
  namaKegiatan: string;
  jenisKegiatan: JenisKegiatan;
  kategori: KategoriAgenda;
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  jamMulai: string; // HH:mm
  jamSelesai: string; // HH:mm
  lokasi: string;
  alamatLokasi: string;
  penanggungJawab: string;
  bidangSeksi: string;
  jumlahPeserta: number; // Target / Kuota
  targetPeserta: string;
  deskripsiKegiatan: string;
  tujuanKegiatan: string;
  statusKegiatan: StatusKegiatan;

  // 2. Peserta & Kepanitiaan
  ketuaPanitia: string;
  sekretarisPanitia: string;
  bendaharaPanitia: string;
  daftarPanitia: PanitiaMember[];
  daftarPeserta: PesertaItem[];
  jumlahPesertaHadir: number;
  jumlahPesertaTidakHadir: number;

  // 3. Pengingat Kegiatan
  pengingat: ReminderType[];

  // 4. Lokasi Detail
  kecamatan: string;
  kabupatenKota: string;
  googleMapsUrl: string;
  koordinat: string;
  petunjukLokasi: string;

  // 5. Dokumentasi
  fotoKegiatan: string[];
  videoUrl?: string;
  daftarHadirUrl?: string;
  beritaKegiatan?: string;
  laporanKegiatan?: string;
  proposalDocUrl?: string;
  lpjDocUrl?: string;
  dokumenPendukung?: string[];

  // 6. Anggaran
  estimasiAnggaran: number;
  realisasiAnggaran: number;
  sumberDana: string; // Kas Karang Taruna, Donasi Warga, Sponsorship, Kelurahan/APBDes, Iuran Peserta
  nomorProposal?: string;
  nomorLpj?: string;
  statusPertanggungjawaban: StatusPertanggungjawaban;

  // 7. Kegiatan Berulang
  kegiatanBerulang: RecurrenceType;
  customRecurrenceDetail?: string;
}

export const KATEGORI_AGENDA_LIST: KategoriAgenda[] = [
  'Sosial & Kemasyarakatan',
  'Keagamaan',
  'Olahraga',
  'Pendidikan',
  'Kewirausahaan',
  'Lingkungan',
  'Seni & Budaya',
  'Kepemudaan',
  'Nasional/Kebangsaan',
  'Kesehatan',
  'Kedaruratan/Bakti Sosial',
  'Rapat Organisasi',
  'Perlombaan',
  'Lainnya',
];

export const BIDANG_SEKSI_LIST = [
  'BPH (Badan Pengurus Harian)',
  'Seksi Kerohanian & Bimbingan Mental',
  'Seksi Olahraga, Seni & Budaya',
  'Seksi Lingkungan Hidup & Kebersihan',
  'Seksi Pendidikan, Pelatihan & IPTEK',
  'Seksi Usaha Kesejahteraan Sosial',
  'Seksi Usaha Ekonomi Produktif & UMKM',
  'Seksi Humas, Publikasi & Kemitraan',
  'Seksi Perlengkapan, Logistik & Keamanan',
];

export const SUMBER_DANA_LIST = [
  'Kas Karang Taruna Kelurahan',
  'Swadaya & Donasi Warga',
  'Dana Bantuan Kelurahan / APBDes',
  'Sponsorship & Mitra Swasta',
  'Iuran Anggota / Pendaftaran',
  'Usaha Dana Mandiri (Bazar/UMKM)',
];

export const KATEGORI_COLORS: Record<KategoriAgenda, { bg: string; text: string; border: string; badge: string; dot: string }> = {
  'Sosial & Kemasyarakatan': {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    badge: 'bg-emerald-600 text-white',
    dot: 'bg-emerald-500',
  },
  'Keagamaan': {
    bg: 'bg-teal-50 text-teal-800 border-teal-200',
    text: 'text-teal-700',
    border: 'border-teal-300',
    badge: 'bg-teal-600 text-white',
    dot: 'bg-teal-500',
  },
  'Olahraga': {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    text: 'text-amber-700',
    border: 'border-amber-300',
    badge: 'bg-amber-600 text-white',
    dot: 'bg-amber-500',
  },
  'Pendidikan': {
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    text: 'text-blue-700',
    border: 'border-blue-300',
    badge: 'bg-blue-600 text-white',
    dot: 'bg-blue-500',
  },
  'Kewirausahaan': {
    bg: 'bg-orange-50 text-orange-800 border-orange-200',
    text: 'text-orange-700',
    border: 'border-orange-300',
    badge: 'bg-orange-600 text-white',
    dot: 'bg-orange-500',
  },
  'Lingkungan': {
    bg: 'bg-green-50 text-green-800 border-green-200',
    text: 'text-green-700',
    border: 'border-green-300',
    badge: 'bg-green-600 text-white',
    dot: 'bg-green-500',
  },
  'Seni & Budaya': {
    bg: 'bg-pink-50 text-pink-800 border-pink-200',
    text: 'text-pink-700',
    border: 'border-pink-300',
    badge: 'bg-pink-600 text-white',
    dot: 'bg-pink-500',
  },
  'Kepemudaan': {
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    text: 'text-indigo-700',
    border: 'border-indigo-300',
    badge: 'bg-indigo-600 text-white',
    dot: 'bg-indigo-500',
  },
  'Nasional/Kebangsaan': {
    bg: 'bg-rose-50 text-rose-800 border-rose-200',
    text: 'text-rose-700',
    border: 'border-rose-300',
    badge: 'bg-rose-600 text-white',
    dot: 'bg-rose-500',
  },
  'Kesehatan': {
    bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    text: 'text-cyan-700',
    border: 'border-cyan-300',
    badge: 'bg-cyan-600 text-white',
    dot: 'bg-cyan-500',
  },
  'Kedaruratan/Bakti Sosial': {
    bg: 'bg-red-50 text-red-800 border-red-200',
    text: 'text-red-700',
    border: 'border-red-300',
    badge: 'bg-red-600 text-white',
    dot: 'bg-red-500',
  },
  'Rapat Organisasi': {
    bg: 'bg-violet-50 text-violet-800 border-violet-200',
    text: 'text-violet-700',
    border: 'border-violet-300',
    badge: 'bg-violet-600 text-white',
    dot: 'bg-violet-500',
  },
  'Perlombaan': {
    bg: 'bg-purple-50 text-purple-800 border-purple-200',
    text: 'text-purple-700',
    border: 'border-purple-300',
    badge: 'bg-purple-600 text-white',
    dot: 'bg-purple-500',
  },
  'Lainnya': {
    bg: 'bg-slate-50 text-slate-800 border-slate-200',
    text: 'text-slate-700',
    border: 'border-slate-300',
    badge: 'bg-slate-600 text-white',
    dot: 'bg-slate-500',
  },
};

export const STATUS_COLORS: Record<StatusKegiatan, { badge: string; text: string; bg: string; border: string }> = {
  'Direncanakan': {
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  'Sedang Berjalan': {
    badge: 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  'Selesai': {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  'Ditunda': {
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    text: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  'Dibatalkan': {
    badge: 'bg-red-100 text-red-800 border-red-200',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

// Seed realistic initial activities across months for rich calendar view
export const INITIAL_AGENDA_DATA: AgendaItem[] = [
  {
    id: 'agd-1',
    namaKegiatan: 'Turnamen Futsal Pemuda Manis Jaya Cup 2026',
    jenisKegiatan: 'Offline / Tatap Muka',
    kategori: 'Olahraga',
    tanggalMulai: '2026-10-05',
    tanggalSelesai: '2026-10-07',
    jamMulai: '08:00',
    jamSelesai: '17:30',
    lokasi: 'Lapangan Futsal Manis Jaya Sport Center',
    alamatLokasi: 'Jl. Raden Fatah No. 45, RT 02/RW 03',
    penanggungJawab: 'Ahmad Fauzi',
    bidangSeksi: 'Seksi Olahraga, Seni & Budaya',
    jumlahPeserta: 160,
    targetPeserta: '16 Tim Pemuda se-Kelurahan Manis Jaya (RW 01 s/d RW 08)',
    deskripsiKegiatan: 'Kompetisi persahabatan antar pemuda RW untuk mempererat silaturahmi, memupuk sportivitas, serta mencari bibit atlet muda berprestasi tingkat kelurahan.',
    tujuanKegiatan: 'Meningkatkan keakraban antar-warga pemuda, mencegah kenakalan remaja, dan menggalakkan gaya hidup sehat.',
    statusKegiatan: 'Direncanakan',
    ketuaPanitia: 'Ahmad Fauzi',
    sekretarisPanitia: 'Dimas Wicaksono',
    bendaharaPanitia: 'Bagus Tri Prakoso',
    daftarPanitia: [
      { id: 'p-1', nama: 'Ahmad Fauzi', peran: 'Ketua Pelaksana', bidang: 'Seksi Olahraga', kontak: '0812-9876-5432' },
      { id: 'p-2', nama: 'Dimas Wicaksono', peran: 'Sekretaris', bidang: 'Administrasi', kontak: '0857-1234-5678' },
      { id: 'p-3', nama: 'Bagus Tri Prakoso', peran: 'Bendahara', bidang: 'Keuangan', kontak: '0878-8765-4321' },
      { id: 'p-4', nama: 'Rian Hidayat', peran: 'Koordinator Wasit & Lapangan', bidang: 'Operasional', kontak: '0813-2222-3333' },
      { id: 'p-5', nama: 'Siti Nurhaliza', peran: 'Koordinator Medis & Konsumsi', bidang: 'Logistik', kontak: '0821-4444-5555' },
    ],
    daftarPeserta: [
      { id: 'ps-1', nama: 'Tim Rajawali RW 01 (10 orang)', instansiRt: 'RW 01 Manis Jaya', statusKehadiran: 'Hadir' },
      { id: 'ps-2', nama: 'Tim Garuda Muda RW 02 (10 orang)', instansiRt: 'RW 02 Manis Jaya', statusKehadiran: 'Hadir' },
      { id: 'ps-3', nama: 'Tim Singa Perkasa RW 03 (10 orang)', instansiRt: 'RW 03 Manis Jaya', statusKehadiran: 'Belum Konfirmasi' },
      { id: 'ps-4', nama: 'Tim Kancil Emas RW 04 (10 orang)', instansiRt: 'RW 04 Manis Jaya', statusKehadiran: 'Hadir' },
      { id: 'ps-5', nama: 'Tim Pemuda Mandiri RW 05 (10 orang)', instansiRt: 'RW 05 Manis Jaya', statusKehadiran: 'Hadir' },
    ],
    jumlahPesertaHadir: 140,
    jumlahPesertaTidakHadir: 20,
    pengingat: ['H-14', 'H-7', 'H-3', 'H-1', 'Hari-H'],
    kecamatan: 'Kecamatan Cibodas',
    kabupatenKota: 'Kota Tangerang',
    googleMapsUrl: 'https://maps.google.com/?q=Manis+Jaya+Sport+Center',
    koordinat: '-6.2088, 106.6025',
    petunjukLokasi: 'Samping Balai Pertemuan RW 03, masuk gang samping Alfamart 50 meter.',
    fotoKegiatan: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=60',
    ],
    videoUrl: 'https://youtube.com/watch?v=kegiatan-futsal-manis-jaya',
    daftarHadirUrl: 'https://karangtaruna-manisjaya.id/presensi/futsal-2026.pdf',
    beritaKegiatan: 'Siap Digelar! 16 Tim Rebutkan Piala Bergilir Manis Jaya Cup 2026',
    laporanKegiatan: 'Laporan Pelaksanaan Turnamen Futsal Tahunan 2026',
    proposalDocUrl: 'PROP-012/FUTSAL/KT-MJ/2026.pdf',
    lpjDocUrl: 'LPJ-008/FUTSAL/KT-MJ/2026.pdf',
    dokumenPendukung: ['Surat Izin Kepolisian', 'Rundown Pertandingan', 'Daftar Peraturan Turnamen'],
    estimasiAnggaran: 7500000,
    realisasiAnggaran: 7200000,
    sumberDana: 'Sponsorship & Mitra Swasta',
    nomorProposal: 'PROP/KT-MJ/IX/2026/012',
    nomorLpj: 'LPJ/KT-MJ/X/2026/008',
    statusPertanggungjawaban: 'Diajukan',
    kegiatanBerulang: 'Tahunan',
  },
  {
    id: 'agd-2',
    namaKegiatan: 'Kajian Pemuda & Doa Bersama Awal Bulan',
    jenisKegiatan: 'Offline / Tatap Muka',
    kategori: 'Keagamaan',
    tanggalMulai: '2026-10-02',
    tanggalSelesai: '2026-10-02',
    jamMulai: '19:30',
    jamSelesai: '21:30',
    lokasi: 'Masjid Jami Al-Ikhlas Kelurahan Manis Jaya',
    alamatLokasi: 'Jl. Masjid No. 12, RW 01 Manis Jaya',
    penanggungJawab: 'Muhammad Ilham',
    bidangSeksi: 'Seksi Kerohanian & Bimbingan Mental',
    jumlahPeserta: 80,
    targetPeserta: 'Seluruh Remaja Masjid & Pengurus Karang Taruna RW 01 - 08',
    deskripsiKegiatan: 'Majelis taklim bulanan pemuda dengan tema pembinaan akhlak kepemimpinan dan doa bersama untuk ketentraman warga Manis Jaya.',
    tujuanKegiatan: 'Meningkatkan ketakwaan dan memperkuat mental spiritual generasi muda.',
    statusKegiatan: 'Direncanakan',
    ketuaPanitia: 'Muhammad Ilham',
    sekretarisPanitia: 'Fatimah Zahra',
    bendaharaPanitia: 'Bagus Tri Prakoso',
    daftarPanitia: [
      { id: 'p-201', nama: 'Muhammad Ilham', peran: 'Ketua Pelaksana', bidang: 'Kerohanian', kontak: '0819-0987-6543' },
      { id: 'p-202', nama: 'Fatimah Zahra', peran: 'Sekretaris', bidang: 'Administrasi', kontak: '0822-1111-2222' },
    ],
    daftarPeserta: [
      { id: 'ps-21', nama: 'Remaja Masjid Al-Ikhlas (30 orang)', instansiRt: 'RW 01', statusKehadiran: 'Hadir' },
      { id: 'ps-22', nama: 'Pengurus KT Unit RW 02 (15 orang)', instansiRt: 'RW 02', statusKehadiran: 'Hadir' },
    ],
    jumlahPesertaHadir: 65,
    jumlahPesertaTidakHadir: 15,
    pengingat: ['H-7', 'H-3', 'H-1', 'Hari-H'],
    kecamatan: 'Kecamatan Cibodas',
    kabupatenKota: 'Kota Tangerang',
    googleMapsUrl: 'https://maps.google.com/?q=Masjid+Jami+Al-Ikhlas+Manis+Jaya',
    koordinat: '-6.2045, 106.6012',
    petunjukLokasi: 'Berada di persimpangan jalan utama RW 01 depan lapangan tenis.',
    fotoKegiatan: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=60',
    ],
    estimasiAnggaran: 1500000,
    realisasiAnggaran: 1350000,
    sumberDana: 'Swadaya & Donasi Warga',
    nomorProposal: 'PROP/KT-MJ/IX/2026/015',
    statusPertanggungjawaban: 'Selesai LPJ',
    kegiatanBerulang: 'Bulanan',
  },
  {
    id: 'agd-3',
    namaKegiatan: 'Pelatihan Kewirausahaan Digital & Desain Produk UMKM',
    jenisKegiatan: 'Hybrid',
    kategori: 'Kewirausahaan',
    tanggalMulai: '2026-10-12',
    tanggalSelesai: '2026-10-13',
    jamMulai: '09:00',
    jamSelesai: '15:00',
    lokasi: 'Aula Lantai 2 Kantor Kelurahan Manis Jaya & Zoom Meeting',
    alamatLokasi: 'Jl. Raya Industri Manis No. 1, Kelurahan Manis Jaya',
    penanggungJawab: 'Rizky Pratama',
    bidangSeksi: 'Seksi Usaha Ekonomi Produktif & UMKM',
    jumlahPeserta: 50,
    targetPeserta: 'Pemuda pelaku UMKM dan wirausahawan pemula di Manis Jaya',
    deskripsiKegiatan: 'Workshop intensif strategi jualan di marketplace, pembuatan konten video promosi viral, foto produk dengan smartphone, dan pencatatan keuangan sederhana.',
    tujuanKegiatan: 'Mendorong kemandirian ekonomi pemuda dan digitalisasi produk lokal kelurahan.',
    statusKegiatan: 'Direncanakan',
    ketuaPanitia: 'Rizky Pratama',
    sekretarisPanitia: 'Anisa Rahmawati',
    bendaharaPanitia: 'Bagus Tri Prakoso',
    daftarPanitia: [
      { id: 'p-301', nama: 'Rizky Pratama', peran: 'Ketua Workshop', bidang: 'Kewirausahaan', kontak: '0812-7777-8888' },
      { id: 'p-302', nama: 'Dewi Lestari', peran: 'Divisi Humas & Registrasi', bidang: 'Humas', kontak: '0878-3333-4444' },
    ],
    daftarPeserta: [
      { id: 'ps-31', nama: 'Hendri Kurniawan (Keripik Singkong)', instansiRt: 'RT 03/RW 02', statusKehadiran: 'Hadir' },
      { id: 'ps-32', nama: 'Maya Indah (Fashion Hijab)', instansiRt: 'RT 01/RW 06', statusKehadiran: 'Hadir' },
      { id: 'ps-33', nama: 'Doni Saputra (Kedai Kopi)', instansiRt: 'RT 04/RW 04', statusKehadiran: 'Belum Konfirmasi' },
    ],
    jumlahPesertaHadir: 42,
    jumlahPesertaTidakHadir: 8,
    pengingat: ['H-14', 'H-7', 'H-3', 'H-1', 'Hari-H'],
    kecamatan: 'Kecamatan Cibodas',
    kabupatenKota: 'Kota Tangerang',
    googleMapsUrl: 'https://maps.google.com/?q=Kantor+Kelurahan+Manis+Jaya',
    koordinat: '-6.2071, 106.6033',
    petunjukLokasi: 'Kantor Kelurahan Manis Jaya seberang Puskesmas.',
    fotoKegiatan: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
    ],
    videoUrl: 'https://youtube.com/watch?v=pelatihan-umkm-manisjaya',
    estimasiAnggaran: 4200000,
    realisasiAnggaran: 4100000,
    sumberDana: 'Dana Bantuan Kelurahan / APBDes',
    nomorProposal: 'PROP/KT-MJ/IX/2026/018',
    statusPertanggungjawaban: 'Diajukan',
    kegiatanBerulang: 'Tidak berulang',
  },
  {
    id: 'agd-4',
    namaKegiatan: 'Gerakan Bersih Sungai Cisadane & Tanam 500 Pohon',
    jenisKegiatan: 'Offline / Tatap Muka',
    kategori: 'Lingkungan',
    tanggalMulai: '2026-10-18',
    tanggalSelesai: '2026-10-18',
    jamMulai: '06:30',
    jamSelesai: '11:30',
    lokasi: 'Bantaran Sungai Cisadane Manis Jaya (Titik Kumpul Pos RW 05)',
    alamatLokasi: 'Kawasan Tanggul Cisadane RW 05 Manis Jaya',
    penanggungJawab: 'Budi Santoso',
    bidangSeksi: 'Seksi Lingkungan Hidup & Kebersihan',
    jumlahPeserta: 120,
    targetPeserta: 'Relawan Pemuda, Dinas LH Kota Tangerang, dan Warga RW 05',
    deskripsiKegiatan: 'Aksi nyata pelestarian lingkungan dengan pembersihan sampah plastik bantaran kali, penanaman 500 bibit pohon buah dan tabulampot, serta edukasi pilah sampah organik.',
    tujuanKegiatan: 'Mencegah banjir luapan kali di musim penghujan dan menghijaukan kawasan tanggul.',
    statusKegiatan: 'Direncanakan',
    ketuaPanitia: 'Budi Santoso',
    sekretarisPanitia: 'Anisa Rahmawati',
    bendaharaPanitia: 'Bagus Tri Prakoso',
    daftarPanitia: [
      { id: 'p-401', nama: 'Budi Santoso', peran: 'Ketua Aksi Hijau', bidang: 'Lingkungan', kontak: '0813-8888-9999' },
      { id: 'p-402', nama: 'Rian Hidayat', peran: 'Koordinator Perlengkapan & Bibit', bidang: 'Logistik', kontak: '0856-1122-3344' },
    ],
    daftarPeserta: [
      { id: 'ps-41', nama: 'Kelompok Pecinta Alam Tangerang (20 orang)', instansiRt: 'Komunitas Luar', statusKehadiran: 'Hadir' },
      { id: 'ps-42', nama: 'Pemuda RW 05 Manis Jaya (40 orang)', instansiRt: 'RW 05', statusKehadiran: 'Hadir' },
    ],
    jumlahPesertaHadir: 110,
    jumlahPesertaTidakHadir: 10,
    pengingat: ['H-30', 'H-14', 'H-7', 'H-3', 'H-1', 'Hari-H'],
    kecamatan: 'Kecamatan Cibodas',
    kabupatenKota: 'Kota Tangerang',
    googleMapsUrl: 'https://maps.google.com/?q=Bantaran+Sungai+Cisadane+Manis+Jaya',
    koordinat: '-6.2012, 106.6045',
    petunjukLokasi: 'Dari jalan utama belok kiri di plang Pos Kamling RW 05.',
    fotoKegiatan: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60',
    ],
    estimasiAnggaran: 3500000,
    realisasiAnggaran: 3200000,
    sumberDana: 'Kas Karang Taruna Kelurahan',
    nomorProposal: 'PROP/KT-MJ/IX/2026/020',
    statusPertanggungjawaban: 'Disetujui',
    kegiatanBerulang: 'Tidak berulang',
  },
  {
    id: 'agd-5',
    namaKegiatan: 'Rapat Pleno Koordinasi Pengurus Bulanan',
    jenisKegiatan: 'Offline / Tatap Muka',
    kategori: 'Rapat Organisasi',
    tanggalMulai: '2026-09-30',
    tanggalSelesai: '2026-09-30',
    jamMulai: '19:00',
    jamSelesai: '21:30',
    lokasi: 'Sekretariat Karang Taruna Manis Jaya',
    alamatLokasi: 'Gedung Pemuda lt. 1, Jl. Manis Jaya Indah No. 8',
    penanggungJawab: 'Iik Andriyana',
    bidangSeksi: 'BPH (Badan Pengurus Harian)',
    jumlahPeserta: 35,
    targetPeserta: 'Pengurus Inti, Ketua Seksi, dan Ketua Unit RW 01 - RW 08',
    deskripsiKegiatan: 'Evaluasi program kerja bulan September, finalisasi teknis Manis Jaya Cup, dan penyusunan anggaran peringatan Sumpah Pemuda 28 Oktober.',
    tujuanKegiatan: 'Menyamakan persepsi koordinasi organisasi dan monitoring serapan anggaran tiap seksi.',
    statusKegiatan: 'Sedang Berjalan',
    ketuaPanitia: 'Iik Andriyana',
    sekretarisPanitia: 'Anisa Rahmawati',
    bendaharaPanitia: 'Bagus Tri Prakoso',
    daftarPanitia: [
      { id: 'p-501', nama: 'Iik Andriyana', peran: 'Ketua Umum KT', bidang: 'BPH', kontak: '0811-9988-7766' },
      { id: 'p-502', nama: 'Fajar Maulana', peran: 'Wakil Ketua', bidang: 'BPH', kontak: '0812-3344-5566' },
    ],
    daftarPeserta: [
      { id: 'ps-51', nama: 'Iik Andriyana', instansiRt: 'Ketua Karang Taruna', statusKehadiran: 'Hadir' },
      { id: 'ps-52', nama: 'Fajar Maulana', instansiRt: 'Wakil Ketua', statusKehadiran: 'Hadir' },
      { id: 'ps-53', nama: 'Anisa Rahmawati', instansiRt: 'Sekretaris', statusKehadiran: 'Hadir' },
      { id: 'ps-54', nama: 'Bagus Tri Prakoso', instansiRt: 'Bendahara', statusKehadiran: 'Hadir' },
      { id: 'ps-55', nama: 'Ahmad Fauzi', instansiRt: 'Seksi Olahraga', statusKehadiran: 'Hadir' },
      { id: 'ps-56', nama: 'Budi Santoso', instansiRt: 'Seksi Lingkungan', statusKehadiran: 'Hadir' },
    ],
    jumlahPesertaHadir: 32,
    jumlahPesertaTidakHadir: 3,
    pengingat: ['H-3', 'H-1', 'Hari-H'],
    kecamatan: 'Kecamatan Cibodas',
    kabupatenKota: 'Kota Tangerang',
    googleMapsUrl: 'https://maps.google.com/?q=Sekretariat+Karang+Taruna+Manis+Jaya',
    koordinat: '-6.2081, 106.6029',
    petunjukLokasi: 'Gedung Pemuda persis di belakang kantor Polsubsektor Manis Jaya.',
    fotoKegiatan: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60',
    ],
    estimasiAnggaran: 500000,
    realisasiAnggaran: 450000,
    sumberDana: 'Kas Karang Taruna Kelurahan',
    nomorProposal: 'PROP/KT-MJ/IX/2026/010',
    statusPertanggungjawaban: 'Selesai LPJ',
    kegiatanBerulang: 'Bulanan',
  },
  {
    id: 'agd-6',
    namaKegiatan: 'Donor Darah & Pemeriksaan Kesehatan Gratis',
    jenisKegiatan: 'Offline / Tatap Muka',
    kategori: 'Kesehatan',
    tanggalMulai: '2026-10-25',
    tanggalSelesai: '2026-10-25',
    jamMulai: '08:30',
    jamSelesai: '13:00',
    lokasi: 'Puskesmas Pembantu Manis Jaya & Halaman Kelurahan',
    alamatLokasi: 'Jl. Kesehatan No. 3, RW 04 Manis Jaya',
    penanggungJawab: 'Dewi Lestari',
    bidangSeksi: 'Seksi Usaha Kesejahteraan Sosial',
    jumlahPeserta: 100,
    targetPeserta: 'Masyarakat umum dan pemuda Kelurahan Manis Jaya',
    deskripsiKegiatan: 'Bekerja sama dengan PMI Kota Tangerang dan Puskesmas untuk mengumpulkan 75 kantong darah serta cek gula darah, tensi, dan asam urat gratis.',
    tujuanKegiatan: 'Membantu ketersediaan stok darah PMI dan meningkatkan kesadaran deteksi dini kesehatan warga.',
    statusKegiatan: 'Direncanakan',
    ketuaPanitia: 'Dewi Lestari',
    sekretarisPanitia: 'Anisa Rahmawati',
    bendaharaPanitia: 'Bagus Tri Prakoso',
    daftarPanitia: [
      { id: 'p-601', nama: 'Dewi Lestari', peran: 'Ketua Baksos Medis', bidang: 'Sosial', kontak: '0878-3333-4444' },
      { id: 'p-602', nama: 'dr. Hani Pratama (Mitra Puskesmas)', peran: 'Koordinator Tenaga Medis', bidang: 'Medis', kontak: '0812-4455-6677' },
    ],
    daftarPeserta: [
      { id: 'ps-61', nama: 'Pendonor RW 01 - RW 08 (70 orang terdaftar)', instansiRt: 'Warga Kelurahan', statusKehadiran: 'Belum Konfirmasi' },
    ],
    jumlahPesertaHadir: 0,
    jumlahPesertaTidakHadir: 0,
    pengingat: ['H-30', 'H-14', 'H-7', 'H-3', 'H-1', 'Hari-H'],
    kecamatan: 'Kecamatan Cibodas',
    kabupatenKota: 'Kota Tangerang',
    googleMapsUrl: 'https://maps.google.com/?q=Puskesmas+Manis+Jaya',
    koordinat: '-6.2065, 106.6030',
    petunjukLokasi: 'Sebelah kantor pos Manis Jaya.',
    fotoKegiatan: [
      'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=60',
    ],
    estimasiAnggaran: 2800000,
    realisasiAnggaran: 0,
    sumberDana: 'Swadaya & Donasi Warga',
    nomorProposal: 'PROP/KT-MJ/X/2026/024',
    statusPertanggungjawaban: 'Diajukan',
    kegiatanBerulang: 'Tidak berulang',
  },
  {
    id: 'agd-7',
    namaKegiatan: 'Pentas Seni Musik & Festival Tari Tradisional Pemuda',
    jenisKegiatan: 'Offline / Tatap Muka',
    kategori: 'Seni & Budaya',
    tanggalMulai: '2026-10-28',
    tanggalSelesai: '2026-10-28',
    jamMulai: '15:30',
    jamSelesai: '22:30',
    lokasi: 'Panggung Terbuka Alun-Alun Mini Manis Jaya',
    alamatLokasi: 'Kawasan Taman Kota RW 07 Manis Jaya',
    penanggungJawab: 'Fajar Maulana',
    bidangSeksi: 'Seksi Olahraga, Seni & Budaya',
    jumlahPeserta: 350,
    targetPeserta: 'Masyarakat Umum, Sanggar Tari Pemuda, Band Akustik Remaja',
    deskripsiKegiatan: 'Peringatan Hari Sumpah Pemuda dengan panggung kreasi kesenian tari tradisional Lenggang Cisadane, musik akustik, teater monolog kebangsaan, dan bazaar kuliner UMKM.',
    tujuanKegiatan: 'Melestarikan warisan budaya lokal dan menumbuhkan rasa bangga berbangsa dan bertanah air.',
    statusKegiatan: 'Direncanakan',
    ketuaPanitia: 'Fajar Maulana',
    sekretarisPanitia: 'Anisa Rahmawati',
    bendaharaPanitia: 'Bagus Tri Prakoso',
    daftarPanitia: [
      { id: 'p-701', nama: 'Fajar Maulana', peran: 'Ketua Panitia Hari Sumpah Pemuda', bidang: 'BPH', kontak: '0812-3344-5566' },
      { id: 'p-702', nama: 'Gita Amanda', peran: 'Koordinator Acara & Pengisi Panggung', bidang: 'Seni', kontak: '0857-9900-1122' },
    ],
    daftarPeserta: [
      { id: 'ps-71', nama: 'Sanggar Tari Cendrawasih RW 04', instansiRt: 'RW 04', statusKehadiran: 'Hadir' },
      { id: 'ps-72', nama: 'Band Pemuda Manis Nada RW 02', instansiRt: 'RW 02', statusKehadiran: 'Hadir' },
    ],
    jumlahPesertaHadir: 0,
    jumlahPesertaTidakHadir: 0,
    pengingat: ['H-30', 'H-14', 'H-7', 'H-3', 'H-1', 'Hari-H'],
    kecamatan: 'Kecamatan Cibodas',
    kabupatenKota: 'Kota Tangerang',
    googleMapsUrl: 'https://maps.google.com/?q=Alun+Alun+Manis+Jaya',
    koordinat: '-6.2095, 106.6018',
    petunjukLokasi: 'Pintu gerbang utama taman kota Manis Jaya.',
    fotoKegiatan: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60',
    ],
    estimasiAnggaran: 8500000,
    realisasiAnggaran: 0,
    sumberDana: 'Sponsorship & Mitra Swasta',
    nomorProposal: 'PROP/KT-MJ/X/2026/029',
    statusPertanggungjawaban: 'Diajukan',
    kegiatanBerulang: 'Tahunan',
  },
  {
    id: 'agd-8',
    namaKegiatan: 'Bakti Sosial Tanggap Darurat & Distribusi Air Bersih',
    jenisKegiatan: 'Offline / Tatap Muka',
    kategori: 'Kedaruratan/Bakti Sosial',
    tanggalMulai: '2026-09-15',
    tanggalSelesai: '2026-09-15',
    jamMulai: '08:00',
    jamSelesai: '14:00',
    lokasi: 'Wilayah RW 06 & RW 07 Manis Jaya',
    alamatLokasi: 'Area Terdampak Kekeringan Saluran RW 06',
    penanggungJawab: 'Ahmad Fauzi',
    bidangSeksi: 'Seksi Usaha Kesejahteraan Sosial',
    jumlahPeserta: 200,
    targetPeserta: '200 Kepala Keluarga Terdampak Penurunan Debit Air Tanah',
    deskripsiKegiatan: 'Penyaluran 4 tangki air bersih kapasitas 5000 liter bersama BPBD Kota Tangerang dan relawan Karang Taruna.',
    tujuanKegiatan: 'Meringankan beban warga yang mengalami krisis air bersih.',
    statusKegiatan: 'Selesai',
    ketuaPanitia: 'Ahmad Fauzi',
    sekretarisPanitia: 'Anisa Rahmawati',
    bendaharaPanitia: 'Bagus Tri Prakoso',
    daftarPanitia: [
      { id: 'p-801', nama: 'Ahmad Fauzi', peran: 'Koordinator Aksi Bencana', bidang: 'Sosial', kontak: '0812-9876-5432' },
    ],
    daftarPeserta: [
      { id: 'ps-81', nama: 'Warga RW 06 (120 KK)', instansiRt: 'RW 06', statusKehadiran: 'Hadir' },
      { id: 'ps-82', nama: 'Warga RW 07 (80 KK)', instansiRt: 'RW 07', statusKehadiran: 'Hadir' },
    ],
    jumlahPesertaHadir: 195,
    jumlahPesertaTidakHadir: 5,
    pengingat: ['Hari-H'],
    kecamatan: 'Kecamatan Cibodas',
    kabupatenKota: 'Kota Tangerang',
    googleMapsUrl: 'https://maps.google.com/?q=RW+06+Manis+Jaya',
    koordinat: '-6.2050, 106.6060',
    petunjukLokasi: 'Depan Gardu PLN RW 06.',
    fotoKegiatan: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=60',
    ],
    estimasiAnggaran: 2000000,
    realisasiAnggaran: 1950000,
    sumberDana: 'Kas Karang Taruna Kelurahan',
    nomorProposal: 'PROP/KT-MJ/IX/2026/007',
    nomorLpj: 'LPJ/KT-MJ/IX/2026/005',
    statusPertanggungjawaban: 'Selesai LPJ',
    kegiatanBerulang: 'Tidak berulang',
  },
];
