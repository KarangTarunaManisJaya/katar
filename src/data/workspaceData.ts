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
  targetSasaran?: string;
  mapsUrl?: string;
  budget?: number;
  estimatedAttendees?: number;
  priority?: 'Rutin' | 'Penting' | 'Mendesak' | 'Biasa';
  registrationStatus?: 'Terbuka Umum' | 'Khusus Pengurus' | 'Perlu Registrasi' | 'Undangan Khusus';
  registrationUrl?: string;
  estimatedBudget?: string;
  fundingSource?: string;
  summary?: string;
  content?: string;
  objective?: string;
  result?: string;
  keyQuote?: { quote: string; person: string; role: string };
  rundown?: Array<{ id?: string; time: string; activity: string; pic: string }>;
  vipGuests?: Array<{ id?: string; name: string; title?: string; role?: string; status?: string }>;
  participantCount?: string;
  participantsInvolved?: string;
  partners?: string;
  sponsors?: Array<{ id?: string; name: string; tier: string }>;
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
    category: 'Sarana & Prasarana',
    priority: 'Biasa',
    title: 'Pengadaan Peralatan & Logistik Kegiatan Pemuda',
    subtitle: 'Inventarisasi aset panggung, partisi portabel, dan sound system pendukung',
    date: `12 Ags ${CURRENT_YEAR}`,
    time: '09:00 - 15:30',
    photoCount: 2,
    image: '/src/assets/images/equipment_red_tools_1790588983260.jpg',
    description: 'Penyediaan dan pengecekan perlengkapan modular panggung, partisi lipat, serta boks penyimpanan logistik penunjang kegiatan Karang Taruna Manis Jaya.',
    content: 'Dalam rangka menunjang kelancaran berbagai agenda pemuda dan kemasyarakatan di wilayah Kelurahan Manis Jaya, pengurus Karang Taruna melaksanakan serah terima serta pengecekan kelayakan logistik panggung modular, sistem kelistrikan, dan partisi lipat serbaguna.\n\nSeluruh sarana kini telah disimpan dengan rapi di gudang sekretariat dan siap dipinjamkan secara gratis untuk kegiatan kemasyarakatan tingkat RT/RW se-Kelurahan Manis Jaya.',
    location: 'Sekretariat Karang Taruna Manis Jaya, Jl. Industri Raya',
    mapsUrl: 'https://maps.google.com/?q=Manis+Jaya+Tangerang',
    author: 'Iik Andriyana',
    targetSasaran: 'Pengurus Karang Taruna & Warga RW 01 - RW 08',
    budget: 8500000,
    estimatedAttendees: 25,
    isFeatured: false,
    tags: ['Aset', 'Logistik', 'Peralatan', 'Sekretariat'],
    photos: [
      '/src/assets/images/equipment_red_tools_1790588983260.jpg',
      '/src/assets/images/device_hardware_office_1790589008132.jpg'
    ],
    rundown: [
      { time: '09:00 - 10:30', activity: 'Kedatangan logistik & unboxing armada', pic: 'Bagus Tri' },
      { time: '10:30 - 12:00', activity: 'Pengecekan spesifikasi & uji fungsi partisi', pic: 'Ahmad Fauzi' },
      { time: '13:00 - 15:30', activity: 'Penataan rak gudang dan inventarisasi kartu stok', pic: 'Divisi Aset' }
    ],
    contactPerson: {
      name: 'Iik Andriyana (Ketua Karang Taruna)',
      phone: '0812-8912-3450'
    }
  },
  {
    id: 'act-2',
    badge: 'Kegiatan',
    badgeColor: 'green',
    category: 'Pendidikan',
    priority: 'Penting',
    title: 'Pemasangan Perangkat Display & Wi-Fi Digital Sekretariat',
    subtitle: 'Digitalisasi layanan kepemudaan dan ruang multimedia pemuda',
    date: `28 Jul ${CURRENT_YEAR}`,
    time: '13:00 - 17:00',
    photoCount: 3,
    image: '/src/assets/images/device_hardware_office_1790589008132.jpg',
    description: 'Instalasi jaringan internet wifi publik, rak server administrasi, dan perangkat display informasi digital untuk pelayanan pemuda.',
    content: 'Sebagai wujud modernisasi administrasi keorganisasian, Karang Taruna Manis Jaya meresmikan fasilitas Wi-Fi publik berkecepatan tinggi serta smart display di Balai Warga. Fasilitas ini terbuka untuk pelajar dan mahasiswa yang ingin belajar kelompok, browsing materi pendidikan, maupun mengadakan diskusi kreatif kepemudaan.',
    location: 'Ruang Multimedia Balai Manis Jaya',
    mapsUrl: 'https://maps.google.com/?q=Kelurahan+Manis+Jaya',
    author: 'Divisi IT & Aset',
    targetSasaran: 'Pelajar, Mahasiswa, dan Pemuda Manis Jaya',
    budget: 6200000,
    estimatedAttendees: 40,
    isFeatured: false,
    tags: ['Digitalisasi', 'InternetGratis', 'IT', 'Edukasi'],
    photos: [
      '/src/assets/images/device_hardware_office_1790589008132.jpg',
      '/src/assets/images/equipment_red_tools_1790588983260.jpg'
    ],
    keyQuote: {
      quote: 'Fasilitas internet dan ruang multimedia ini dihadirkan agar generasi muda Manis Jaya memiliki ruang produktif untuk mengasah skill digital.',
      person: 'Iik Andriyana',
      role: 'Ketua Karang Taruna'
    },
    contactPerson: {
      name: 'Admin IT Sekretariat',
      phone: '0812-8912-3451'
    }
  },
  {
    id: 'act-3',
    badge: 'Kegiatan',
    badgeColor: 'purple',
    category: 'Sosial',
    priority: 'Penting',
    title: 'Rapat Pleno Koordinasi & Evaluasi Program Bulanan',
    subtitle: 'Sinkronisasi program kerja semester dua dan persiapan PHBN RI',
    date: `15 Jul ${CURRENT_YEAR}`,
    time: '19:30 - 22:00',
    photoCount: 1,
    image: '/src/assets/images/manis_jaya_gate_1790588960710.jpg',
    description: 'Rapat koordinasi bulanan evaluasi program kerja lintas seksi dan perumusan agenda peringatan Hari Kemerdekaan RI tingkat kelurahan.',
    content: 'Rapat Pleno Bulanan dihadiri oleh seluruh jajaran pengurus harian Karang Taruna Kelurahan Manis Jaya serta perwakilan unit kerja pemuda tingkat RW 01 hingga RW 08. Agenda fokus pada evaluasi transparansi kas organisasi, penjaringan aspirasi pemuda di tiap lingkungan rukun warga, serta pembentukan panitia Semarak Kemerdekaan RI.',
    location: 'Pendopo Balai Pertemuan RW 04 Manis Jaya',
    mapsUrl: 'https://maps.google.com/?q=Manis+Jaya+Tangerang',
    author: 'Sekretariat',
    targetSasaran: 'Pengurus Harian & Utusan Karang Taruna Unit RW',
    budget: 1500000,
    estimatedAttendees: 35,
    isFeatured: false,
    tags: ['RapatPleno', 'Evaluasi', 'Koordinasi', 'Pemuda'],
    photos: [
      '/src/assets/images/manis_jaya_gate_1790588960710.jpg'
    ],
    rundown: [
      { time: '19:30 - 19:45', activity: 'Pembukaan & Menyanyikan Mars Karang Taruna', pic: 'Sekretaris' },
      { time: '19:45 - 20:30', activity: 'Laporan Progres Bendahara & Seksi Bidang', pic: 'Bagus Tri' },
      { time: '20:30 - 21:45', activity: 'Sesi Diskusi & Pembentukan Panitia 17 Agustus', pic: 'Fajar Maulana' },
      { time: '21:45 - 22:00', activity: 'Doa penutup dan ramah tamah', pic: 'Ahmad Fauzi' }
    ],
    contactPerson: {
      name: 'Anisa Rahmawati (Sekretaris)',
      phone: '0812-8912-3452'
    }
  },
  {
    id: 'act-4',
    badge: 'Dokumentasi',
    badgeColor: 'orange',
    category: 'Sosial',
    priority: 'Mendesak',
    title: 'Bakti Sosial Peduli Sesama & Santunan Sembako RW 02',
    subtitle: 'Penyaluran 150 paket sembako dan layanan cek tensi gula darah gratis',
    date: `5 Jul ${CURRENT_YEAR}`,
    time: '08:00 - 13:00',
    photoCount: 4,
    image: '/src/assets/images/baksos_karang_taruna_1790589027203.jpg',
    description: 'Penyaluran 150 paket sembako berkah pemuda dan pemeriksaan kesehatan gratis bagi lansia serta warga kurang mampu di Kelurahan Manis Jaya.',
    content: 'Aksi kepedulian sosial pemuda Karang Taruna Manis Jaya berkolaborasi bersama Puskesmas Manis Jaya dan para donatur lokal sukses menyalurkan 150 paket sembako berisi beras, minyak goreng, gula, dan mie instan.\n\nSelain pembagian sembako, tim medis relawan juga memberikan layanan pengecekan tekanan darah, gula darah, dan konsultasi kesehatan secara cuma-cuma kepada ratusan lansia warga RW 02.',
    location: 'Gazebo Warga RW 02 Kelurahan Manis Jaya',
    mapsUrl: 'https://maps.google.com/?q=Manis+Jaya+Tangerang',
    author: 'Iik Andriyana',
    targetSasaran: '150 Keluarga Lansia dan Dhuafa RW 02',
    budget: 14500000,
    estimatedAttendees: 150,
    isFeatured: true,
    tags: ['Baksos', 'PeduliSesama', 'Santunan', 'KesehatanGratis'],
    photos: [
      '/src/assets/images/baksos_karang_taruna_1790589027203.jpg',
      '/src/assets/images/manis_jaya_gate_1790588960710.jpg',
      '/src/assets/images/device_hardware_office_1790589008132.jpg',
      '/src/assets/images/equipment_red_tools_1790588983260.jpg'
    ],
    keyQuote: {
      quote: 'Pemuda hadir bukan sekadar meramaikan suasana, melainkan membawa manfaat nyata yang menyentuh langsung kehidupan masyarakat di lingkungan.',
      person: 'Bapak Lurah Manis Jaya',
      role: 'Pelindung Organisasi'
    },
    rundown: [
      { time: '08:00 - 08:30', activity: 'Registrasi penerima santunan dan kupon sembako', pic: 'Dwi Lestari' },
      { time: '08:30 - 11:30', activity: 'Pemeriksaan tensi darah & pembagian paket berkah', pic: 'Hendri Setiawan' },
      { time: '11:30 - 13:00', activity: 'Penyaluran door-to-door bagi lansia yang berhalangan hadir', pic: 'Tim Relawan RW 02' }
    ],
    contactPerson: {
      name: 'Hendri Setiawan (Seksi Sosial)',
      phone: '0812-8912-3456'
    }
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
