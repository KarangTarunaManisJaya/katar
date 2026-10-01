import { WorkspaceTab } from '../components/workspace/Sidebar';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: string;
  nik?: string;
  rw: string;
  avatarInitials: string;
  isSuperAdmin?: boolean;
  allowedMenus: WorkspaceTab[];
  lastLogin?: string;
  email?: string;
  phone?: string;
  status?: 'Aktif' | 'Tidak Aktif' | 'Alumni';
  noAnggota?: string;
  avatar?: string;
  divisi?: string;
  job?: string;
}

export interface MenuItemDefinition {
  id: WorkspaceTab;
  label: string;
  category: 'Portal' | 'Kegiatan' | 'Administrasi' | 'Sistem';
  description: string;
}

export const ALL_MENU_DEFINITIONS: MenuItemDefinition[] = [
  {
    id: 'beranda',
    label: 'Beranda (Portal Utama)',
    category: 'Portal',
    description: 'Portal pusat kendali, ringkasan eksekutif, dan navigasi cepat Karang Taruna.',
  },
  {
    id: 'ringkasan',
    label: 'Kegiatan & Program Kerja',
    category: 'Kegiatan',
    description: 'Statistik grafik harian/bulanan/tahunan dan katalog kegiatan pemuda.',
  },
  {
    id: 'surat',
    label: 'Surat Menyurat',
    category: 'Administrasi',
    description: 'Penerbitan surat tugas, undangan resmi, surat permohonan, dan arsip dokumen.',
  },
  {
    id: 'anggota',
    label: 'Data Anggota & KTA',
    category: 'Administrasi',
    description: 'Direktori pemuda, verifikasi KTP/NIK, status keaktifan RW, dan cetak KTA digital.',
  },
  {
    id: 'proposal',
    label: 'Proposal & Anggaran',
    category: 'Kegiatan',
    description: 'Penyusunan RAB kegiatan pemuda dan persetujuan sponsorship/kelurahan.',
  },
  {
    id: 'laporan',
    label: 'Laporan Kas & LPJ',
    category: 'Kegiatan',
    description: 'Laporan pertanggungjawaban dana, bukti kuitansi kas pemuda, dan audit Lurah.',
  },
  {
    id: 'aset',
    label: 'Aset & Inventaris',
    category: 'Administrasi',
    description: 'Pencatatan inventaris logistik, sound system, tenda, dan peminjaman barang.',
  },
  {
    id: 'jadwal',
    label: 'Jadwal & Kalender',
    category: 'Administrasi',
    description: 'Kalender kerja pengurus, rapat bulanan, dan jadwal turnamen pemuda.',
  },
  {
    id: 'berita',
    label: 'Berita & Publikasi Portal',
    category: 'Administrasi',
    description: 'Kanal publikasi kabar Karang Taruna Manis Jaya dan dokumentasi masyarakat.',
  },
  {
    id: 'tambah_berita',
    label: 'Tambah Berita / Kegiatan',
    category: 'Administrasi',
    description: 'Formulir dokumentasi dan publikasi kegiatan baru ke portal.',
  },
  {
    id: 'kategori',
    label: 'Kategori Berita',
    category: 'Administrasi',
    description: 'Pengelompokan jenis dan kategori kegiatan kepemudaan.',
  },
  {
    id: 'galeri',
    label: 'Galeri Foto & Album',
    category: 'Administrasi',
    description: 'Koleksi dokumentasi foto kegiatan pemuda Karang Taruna.',
  },
  {
    id: 'database',
    label: 'Database & Google Drive',
    category: 'Sistem',
    description: 'Pencadangan (backup), pemulihan data (restore), dan integrasi Google Drive.',
  },
  {
    id: 'pengaturan',
    label: 'Pengaturan Sistem & Profil',
    category: 'Sistem',
    description: 'Informasi Kelurahan Manis Jaya, logo resmi, dan preferensi aplikasi.',
  },
  {
    id: 'akses',
    label: 'Akses Pengguna & Otorisasi',
    category: 'Sistem',
    description: 'Kelola akun login anggota, kata sandi, dan ceklis izin akses menu.',
  },
];

// Unified Default Members & User Accounts (100% identical between Anggota and Akses Pengguna)
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'm-1',
    noAnggota: 'KT-001',
    username: 'admin',
    password: 'admin123',
    name: 'Iik Andriyana',
    role: 'Ketua / Super Admin',
    nik: '3671041208980001',
    rw: 'RW 03',
    divisi: 'Pengurus Harian',
    phone: '0812 8912 3450',
    email: 'iikandriyana@karangtarunamanisjaya.id',
    avatarInitials: 'IA',
    avatar: '/src/assets/images/ilk_andriyana_1790589044021.jpg',
    isSuperAdmin: true,
    status: 'Aktif',
    allowedMenus: [
      'beranda',
      'ringkasan',
      'surat',
      'anggota',
      'proposal',
      'laporan',
      'aset',
      'jadwal',
      'berita',
      'tambah_berita',
      'kategori',
      'galeri',
      'database',
      'pengaturan',
      'akses',
    ],
    lastLogin: 'Hari ini, 20:15 WIB',
  },
  {
    id: 'm-2',
    noAnggota: 'KT-002',
    username: 'fajar',
    password: 'karangtaruna',
    name: 'Fajar Maulana',
    role: 'Wakil Ketua',
    nik: '3671041508970002',
    rw: 'RW 02',
    divisi: 'Pengurus Harian',
    phone: '0812 8912 3451',
    email: 'fajarmaulana@karangtarunamanisjaya.id',
    avatarInitials: 'FM',
    avatar: '/src/assets/images/fajar_maulana_portrait_1790646270000.jpg',
    isSuperAdmin: false,
    status: 'Aktif',
    allowedMenus: [
      'beranda',
      'ringkasan',
      'proposal',
      'laporan',
      'jadwal',
      'berita',
      'tambah_berita',
      'galeri',
    ],
    lastLogin: 'Kemarin, 16:40 WIB',
  },
  {
    id: 'm-3',
    noAnggota: 'KT-003',
    username: 'sekretaris',
    password: 'karangtaruna',
    name: 'Anisa Rahmawati',
    role: 'Sekretaris',
    nik: '3671045504990003',
    rw: 'RW 04',
    divisi: 'Administrasi & Kesekretariatan',
    phone: '0812 8912 3452',
    email: 'anisa@karangtarunamanisjaya.id',
    avatarInitials: 'AR',
    avatar: '/src/assets/images/siti_nurhaliza_portrait_1790646253976.jpg',
    isSuperAdmin: false,
    status: 'Aktif',
    allowedMenus: [
      'beranda',
      'surat',
      'anggota',
      'jadwal',
      'berita',
      'proposal',
      'tambah_berita',
      'galeri',
    ],
    lastLogin: 'Kemarin, 14:20 WIB',
  },
  {
    id: 'm-4',
    noAnggota: 'KT-004',
    username: 'bendahara',
    password: 'karangtaruna',
    name: 'Bagus Tri Prakoso',
    role: 'Bendahara',
    nik: '3671042306970004',
    rw: 'RW 01',
    divisi: 'Keuangan & Anggaran',
    phone: '0812 8912 3453',
    email: 'bagus@karangtarunamanisjaya.id',
    avatarInitials: 'BP',
    avatar: '/src/assets/images/budi_santoso_portrait_1790646268733.jpg',
    isSuperAdmin: false,
    status: 'Aktif',
    allowedMenus: [
      'beranda',
      'ringkasan',
      'proposal',
      'laporan',
      'aset',
      'berita',
    ],
    lastLogin: '2 hari lalu',
  },
  {
    id: 'm-5',
    noAnggota: 'KT-005',
    username: 'ahmad',
    password: 'karangtaruna',
    name: 'Ahmad Fauzi',
    role: 'Koordinator Olahraga',
    nik: '3174011005950005',
    rw: 'RW 03',
    divisi: 'Pemuda & Olahraga',
    phone: '0812 3456 7890',
    email: 'ahmadfauzi@gmail.com',
    avatarInitials: 'AF',
    avatar: '/src/assets/images/ahmad_fauzi_portrait_1790646239274.jpg',
    isSuperAdmin: false,
    status: 'Aktif',
    allowedMenus: [
      'beranda',
      'ringkasan',
      'jadwal',
      'berita',
      'galeri',
    ],
    lastLogin: '3 hari lalu',
  },
  {
    id: 'm-6',
    noAnggota: 'KT-006',
    username: 'humas',
    password: 'karangtaruna',
    name: 'Dewi Lestari',
    role: 'Divisi Humas & Dokumentasi',
    nik: '3671046109000006',
    rw: 'RW 01',
    divisi: 'Humas & Publikasi',
    phone: '0812 8912 3455',
    email: 'dewi@karangtarunamanisjaya.id',
    avatarInitials: 'DL',
    avatar: '/src/assets/images/siti_nurhaliza_portrait_1790646253976.jpg',
    isSuperAdmin: false,
    status: 'Aktif',
    allowedMenus: [
      'beranda',
      'ringkasan',
      'jadwal',
      'berita',
      'aset',
      'galeri',
      'tambah_berita',
      'kategori',
    ],
    lastLogin: '4 hari lalu',
  },
];
