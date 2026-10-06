export interface ActivityItem {
  id: string;
  badge: 'Kegiatan' | 'Dokumentasi' | 'Berita' | 'Pengumuman';
  badgeColor: 'dark' | 'green' | 'purple' | 'orange' | 'blue' | 'rose';
  title: string;
  date: string;
  photoCount: number;
  image?: string;
  description: string;
  location: string;
  author: string;
  photos: string[];
  // Extended rich fields for detailed news & activities
  subtitle?: string;
  type?: 'Kegiatan' | 'Berita' | 'Pengumuman' | 'Dokumentasi' | 'Liputan Khusus' | 'Artikel Pemuda';
  category?: string;
  time?: string;
  endTime?: string;
  organizer?: string;
  division?: string;
  targetScope?: string;
  priority?: 'Rutin' | 'Penting' | 'Mendesak';
  registrationStatus?: 'Terbuka Umum' | 'Khusus Pengurus' | 'Perlu Registrasi' | 'Undangan Khusus';
  registrationUrl?: string;
  estimatedBudget?: string;
  fundingSource?: string;
  summary?: string;
  content?: string;
  objective?: string;
  result?: string;
  keyQuote?: { quote: string; person: string; role: string };
  rundown?: Array<{ id: string; time: string; activity: string; pic: string }>;
  vipGuests?: Array<{ id: string; name: string; title: string; status: string }>;
  participantCount?: string;
  participantsInvolved?: string;
  partners?: string;
  sponsors?: Array<{ id: string; name: string; tier: string }>;
  contactPerson?: { name: string; phone: string; email?: string };
  coverCaption?: string;
  videoUrl?: string;
  attachments?: Array<{ id: string; name: string; size?: string; type?: string }>;
  driveUrl?: string;
  status?: 'Draft' | 'Publikasikan Sekarang' | 'Menunggu Review';
  publishDate?: string;
  slug?: string;
  isFeatured?: boolean;
  showOnHome?: boolean;
  allowComments?: boolean;
  tags?: string[];
  metaDescription?: string;
  socialCaption?: string;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  role: string;
  rw: string;
  phone: string;
  status: 'Aktif' | 'Non-aktif';
  joinDate: string;
}

export interface OfficialLetter {
  id: string;
  letterNumber: string;
  type: 'Surat Keluar' | 'Surat Masuk';
  subject: string;
  recipientOrSender: string;
  date: string;
  status: 'Terkirim' | 'Menunggu TTD' | 'Arsip';
}

export interface ProposalItem {
  id: string;
  title: string;
  category: string;
  budget: number;
  submittedDate: string;
  status: 'Disetujui' | 'Ditinjau' | 'Draft';
}

export interface OrganizationAsset {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: 'Baik' | 'Perlu Perbaikan';
  location: string;
}

export const CURRENT_YEAR = new Date().getFullYear();

export const ACTIVITIES_DATA: ActivityItem[] = [
  {
    id: 'act-1',
    badge: 'Kegiatan',
    badgeColor: 'dark',
    title: 'Pengadaan Peralatan Kegiatan',
    date: `12 Ags ${CURRENT_YEAR}`,
    photoCount: 2,
    image: '/src/assets/images/equipment_red_tools_1790588983260.jpg',
    description: 'Penyediaan dan pengecekan perlengkapan modular panggung, partisi lipat, serta boks penyimpanan logistik penunjang kegiatan Karang Taruna Manis Jaya.',
    location: 'Sekretariat Karang Taruna Manis Jaya',
    author: 'Iik Andriyana',
    photos: [
      '/src/assets/images/equipment_red_tools_1790588983260.jpg',
      '/src/assets/images/device_hardware_office_1790589008132.jpg'
    ],
  },
  {
    id: 'act-2',
    badge: 'Kegiatan',
    badgeColor: 'green',
    title: 'Pemasangan Perangkat Kantor',
    date: `28 Jul ${CURRENT_YEAR}`,
    photoCount: 3,
    image: '/src/assets/images/device_hardware_office_1790589008132.jpg',
    description: 'Instalasi jaringan internet wifi publik, rak server administrasi, dan perangkat display informasi digital untuk pelayanan pemuda.',
    location: 'Ruang Multimedia Balai Manis Jaya',
    author: 'Divisi IT & Aset',
    photos: [
      '/src/assets/images/device_hardware_office_1790589008132.jpg',
      '/src/assets/images/equipment_red_tools_1790588983260.jpg'
    ],
  },
  {
    id: 'act-3',
    badge: 'Kegiatan',
    badgeColor: 'purple',
    title: 'Kegiatan Bulanan',
    date: `15 Jul ${CURRENT_YEAR}`,
    photoCount: 1,
    image: '', // Placeholder in the screenshot
    description: 'Rapat koordinasi bulanan evaluasi program kerja lintas seksi dan perumusan agenda peringatan Hari Kemerdekaan RI tingkat kelurahan.',
    location: 'Pendopo Balai Pertemuan RW 04',
    author: 'Sekretariat',
    photos: [],
  },
  {
    id: 'act-4',
    badge: 'Dokumentasi',
    badgeColor: 'orange',
    title: 'Bakti Sosial Karang Taruna',
    date: `5 Jul ${CURRENT_YEAR}`,
    photoCount: 4,
    image: '/src/assets/images/baksos_karang_taruna_1790589027203.jpg',
    description: 'Penyaluran 150 paket sembako berkah pemuda dan pemeriksaan kesehatan gratis bagi lansia serta warga kurang mampu di Kelurahan Manis Jaya.',
    location: 'Gazebo Warga RW 02 Manis Jaya',
    author: 'Iik Andriyana',
    photos: [
      '/src/assets/images/baksos_karang_taruna_1790589027203.jpg',
      '/src/assets/images/manis_jaya_gate_1790588960710.jpg'
    ],
  },
];

export const WORKSPACE_MEMBERS: WorkspaceMember[] = [
  { id: 'm-1', name: 'Iik Andriyana', role: 'Ketua / Admin', rw: 'RW 03', phone: '0812-8912-3450', status: 'Aktif', joinDate: 'Jan 2024' },
  { id: 'm-2', name: 'Fajar Maulana', role: 'Wakil Ketua', rw: 'RW 02', phone: '0812-8912-3451', status: 'Aktif', joinDate: 'Jan 2024' },
  { id: 'm-3', name: 'Anisa Rahmawati', role: 'Sekretaris', rw: 'RW 04', phone: '0812-8912-3452', status: 'Aktif', joinDate: 'Feb 2024' },
  { id: 'm-4', name: 'Bagus Tri Prakoso', role: 'Bendahara', rw: 'RW 01', phone: '0812-8912-3453', status: 'Aktif', joinDate: 'Jan 2024' },
  { id: 'm-5', name: 'Ahmad Fauzi', role: 'Seksi Olahraga', rw: 'RW 05', phone: '0812-8912-3454', status: 'Aktif', joinDate: 'Mar 2024' },
  { id: 'm-6', name: 'Tri Wahyuni', role: 'Seksi Kewirausahaan', rw: 'RW 06', phone: '0812-8912-3455', status: 'Aktif', joinDate: 'Feb 2024' },
  { id: 'm-7', name: 'Hendri Setiawan', role: 'Seksi Sosial & Relawan', rw: 'RW 07', phone: '0812-8912-3456', status: 'Aktif', joinDate: 'Jan 2024' },
  { id: 'm-8', name: 'Dwi Lestari', role: 'Seksi Humas & Media', rw: 'RW 08', phone: '0812-8912-3457', status: 'Aktif', joinDate: 'Apr 2024' },
];

export const WORKSPACE_LETTERS: OfficialLetter[] = [
  { id: 'l-1', letterNumber: `012/KT-MJ/EXT/VIII/${CURRENT_YEAR}`, type: 'Surat Keluar', subject: 'Permohonan Izin Tempat Turnamen Voli', recipientOrSender: 'Kelurahan Manis Jaya', date: `10 Ags ${CURRENT_YEAR}`, status: 'Terkirim' },
  { id: 'l-2', letterNumber: `008/RW04/MJ/VII/${CURRENT_YEAR}`, type: 'Surat Masuk', subject: 'Undangan Kerja Bakti Lingkungan RW 04', recipientOrSender: 'Pengurus RW 04', date: `26 Jul ${CURRENT_YEAR}`, status: 'Arsip' },
  { id: 'l-3', letterNumber: `013/KT-MJ/EXT/IX/${CURRENT_YEAR}`, type: 'Surat Keluar', subject: 'Pengajuan Proposal Bantuan Sound System', recipientOrSender: 'Kecamatan Jatiuwung', date: `02 Sep ${CURRENT_YEAR}`, status: 'Menunggu TTD' },
];

export const WORKSPACE_PROPOSALS: ProposalItem[] = [
  { id: 'pr-1', title: `Piala Pemuda Manis Jaya Cup ${CURRENT_YEAR}`, category: 'Olahraga', budget: 12500000, submittedDate: `15 Jul ${CURRENT_YEAR}`, status: 'Disetujui' },
  { id: 'pr-2', title: 'Pengadaan Meja Rapat & Proyektor Sekretariat', category: 'Aset & Sarana', budget: 6800000, submittedDate: `20 Jul ${CURRENT_YEAR}`, status: 'Disetujui' },
  { id: 'pr-3', title: 'Bazar UMKM & Festival Kuliner Pemuda', category: 'Ekonomi Kreatif', budget: 18000000, submittedDate: `18 Ags ${CURRENT_YEAR}`, status: 'Ditinjau' },
];

export const WORKSPACE_ASSETS: OrganizationAsset[] = [
  { id: 'ast-1', name: 'Sound System Wireless Portable (2 Mic)', category: 'Audio', quantity: 2, condition: 'Baik', location: 'Gudang Balai Pemuda' },
  { id: 'ast-2', name: 'Tenda Lipat Ukuran 3x3 Meter', category: 'Tenda', quantity: 4, condition: 'Baik', location: 'Sekretariat' },
  { id: 'ast-3', name: 'Set Bola Voli & Jaring Molten', category: 'Olahraga', quantity: 3, condition: 'Baik', location: 'Pos Ronda RW 03' },
  { id: 'ast-4', name: 'Meja Lipat & 20 Kursi Plastik', category: 'Perabot', quantity: 20, condition: 'Baik', location: 'Gudang RW 04' },
];
