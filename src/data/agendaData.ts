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
// Data agenda & jadwal kegiatan: Bersih & kosong saat peluncuran sistem
export const INITIAL_AGENDA_DATA: AgendaItem[] = [];
