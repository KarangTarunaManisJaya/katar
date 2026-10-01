import { WorkspaceTab } from '../components/workspace/Sidebar';
import { UserAccount } from '../types/auth';

export interface DetailedMember {
  id: string;
  noAnggota: string;
  nik: string;
  name: string;
  nickname: string;
  jabatan: string;
  divisi: string;
  rw: string;
  phone: string;
  email: string;
  status: 'Aktif' | 'Tidak Aktif' | 'Alumni';
  joinDate: string;
  birthPlace: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan';
  address: string;
  education: string;
  job: string;
  company: string;
  skills: string;
  interests: string;
  emergencyContact: string;
  avatar: string;
  period: string;
  // Account Access & Password (100% synchronized with UserAccount)
  username: string;
  password: string;
  isSuperAdmin?: boolean;
  allowedMenus: WorkspaceTab[];
  lastLogin?: string;
  // History
  historyJabatan?: { role: string; period: string; desc: string }[];
  historyKegiatan?: { title: string; year: string; role: string }[];
}

export const INITIAL_MEMBERS: DetailedMember[] = [
  {
    id: 'm-1',
    noAnggota: 'KT-001',
    nik: '3671041208980001',
    name: 'Iik Andriyana',
    nickname: 'Iik',
    jabatan: 'Ketua',
    divisi: 'Pengurus Harian',
    rw: 'RW 03',
    phone: '0812 8912 3450',
    email: 'iikandriyana@karangtarunamanisjaya.id',
    status: 'Aktif',
    joinDate: '10 Jan 2024',
    birthPlace: 'Tangerang',
    birthDate: '1998-08-12',
    gender: 'Laki-laki',
    address: 'Jl. Merdeka No. 03, RT 02/RW 03 Kel. Manis Jaya, Kec. Jatiuwung, Kota Tangerang',
    education: 'S1 Ilmu Pemerintahan',
    job: 'Wiraswasta & Penggerak Pemuda',
    company: 'Manis Jaya Mandiri',
    skills: 'Kepemimpinan, Manajemen Organisasi, Komunikasi Publik',
    interests: 'Pemberdayaan Pemuda, Olahraga, Kewirausahaan',
    emergencyContact: '0812 8912 9999 (Keluarga)',
    avatar: '/src/assets/images/ilk_andriyana_1790589044021.jpg',
    period: '2024 - 2027',
    username: 'admin',
    password: 'admin123',
    isSuperAdmin: true,
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
      'pengaturan',
      'akses',
    ],
    lastLogin: 'Hari ini, 20:15 WIB',
    historyJabatan: [
      { role: 'Ketua Karang Taruna', period: '2024 - Sekarang', desc: 'Koordinator umum seluruh program pemuda se-Kelurahan Manis Jaya' },
      { role: 'Wakil Ketua', period: '2021 - 2024', desc: 'Membidangi pembinaan organisasi & kemitraan RW' },
    ],
    historyKegiatan: [
      { title: 'Bakti Sosial & Santunan Yatim Ramadhan', year: 'Maret 2026', role: 'Penanggung Jawab' },
      { title: 'Turnamen Futsal Pemuda Manis Jaya Cup', year: 'Januari 2026', role: 'Ketua Pelaksana' },
    ],
  },
  {
    id: 'm-2',
    noAnggota: 'KT-002',
    nik: '3671041508970002',
    name: 'Fajar Maulana',
    nickname: 'Fajar',
    jabatan: 'Wakil Ketua',
    divisi: 'Pengurus Harian',
    rw: 'RW 02',
    phone: '0812 8912 3451',
    email: 'fajarmaulana@karangtarunamanisjaya.id',
    status: 'Aktif',
    joinDate: '15 Jan 2024',
    birthPlace: 'Tangerang',
    birthDate: '1997-08-15',
    gender: 'Laki-laki',
    address: 'Jl. Flamboyan No. 18, RT 01/RW 02 Manis Jaya',
    education: 'S1 Manajemen',
    job: 'Karyawan Swasta',
    company: 'PT. Surya Pratama',
    skills: 'Manajemen Acara, Negosiasi, Olahraga',
    interests: 'Olahraga, Kepemudaan',
    emergencyContact: '0812 3333 4444',
    avatar: '/src/assets/images/fajar_maulana_portrait_1790646270000.jpg',
    period: '2024 - 2027',
    username: 'fajar',
    password: 'karangtaruna',
    isSuperAdmin: false,
    allowedMenus: ['beranda', 'ringkasan', 'proposal', 'laporan', 'jadwal', 'berita', 'tambah_berita', 'galeri'],
    lastLogin: 'Kemarin, 16:40 WIB',
    historyJabatan: [
      { role: 'Wakil Ketua', period: '2024 - Sekarang', desc: 'Membantu ketua dalam koordinasi internal sub-unit RW' },
    ],
    historyKegiatan: [
      { title: 'Gotong Royong & Fogging Nyamuk Serentak', year: 'Februari 2026', role: 'Koordinator Wilayah RW 02' },
    ],
  },
  {
    id: 'm-3',
    noAnggota: 'KT-003',
    nik: '3671045504990003',
    name: 'Anisa Rahmawati',
    nickname: 'Anisa',
    jabatan: 'Sekretaris',
    divisi: 'Administrasi & Kesekretariatan',
    rw: 'RW 04',
    phone: '0812 8912 3452',
    email: 'anisa@karangtarunamanisjaya.id',
    status: 'Aktif',
    joinDate: '20 Jan 2024',
    birthPlace: 'Tangerang',
    birthDate: '1999-04-25',
    gender: 'Perempuan',
    address: 'Jl. Melati No. 04, RT 01/RW 04 Kel. Manis Jaya, Tangerang',
    education: 'D3 Administrasi Perkantoran',
    job: 'Staf Administrasi',
    company: 'CV. Karya Mandiri',
    skills: 'Tata Naskah Dinas, Arsip, Notulensi, Komputer',
    interests: 'Literasi, Pendidikan, Administrasi',
    emergencyContact: '0813 2222 3333 (Ibu)',
    avatar: '/src/assets/images/siti_nurhaliza_portrait_1790646253976.jpg',
    period: '2024 - 2027',
    username: 'sekretaris',
    password: 'karangtaruna',
    isSuperAdmin: false,
    allowedMenus: ['beranda', 'surat', 'anggota', 'jadwal', 'berita', 'proposal', 'tambah_berita', 'galeri'],
    lastLogin: 'Kemarin, 14:20 WIB',
    historyJabatan: [
      { role: 'Sekretaris Umum', period: '2024 - Sekarang', desc: 'Pengelolaan surat menyurat resmi dan database keanggotaan' },
    ],
    historyKegiatan: [
      { title: 'Penerbitan KTA Digital Pemuda Manis Jaya', year: 'Januari 2026', role: 'Penanggung Jawab Database' },
    ],
  },
  {
    id: 'm-4',
    noAnggota: 'KT-004',
    nik: '3671042306970004',
    name: 'Bagus Tri Prakoso',
    nickname: 'Bagus',
    jabatan: 'Bendahara',
    divisi: 'Keuangan & Anggaran',
    rw: 'RW 01',
    phone: '0812 8912 3453',
    email: 'bagus@karangtarunamanisjaya.id',
    status: 'Aktif',
    joinDate: '25 Jan 2024',
    birthPlace: 'Jakarta',
    birthDate: '1997-06-23',
    gender: 'Laki-laki',
    address: 'Jl. Kenanga No. 8, RT 03/RW 01 Manis Jaya',
    education: 'S1 Akuntansi',
    job: 'Finance Staff',
    company: 'PT. Mega Buana',
    skills: 'Penyusunan Kas, Perpajakan, Audit, Excel',
    interests: 'Kewirausahaan UMKM, Keuangan Organisasi',
    emergencyContact: '0812 9999 8888 (Ayah)',
    avatar: '/src/assets/images/budi_santoso_portrait_1790646268733.jpg',
    period: '2024 - 2027',
    username: 'bendahara',
    password: 'karangtaruna',
    isSuperAdmin: false,
    allowedMenus: ['beranda', 'ringkasan', 'proposal', 'laporan', 'aset', 'berita'],
    lastLogin: '2 hari lalu',
    historyJabatan: [
      { role: 'Bendahara Umum', period: '2024 - Sekarang', desc: 'Laporan pertanggungjawaban kas dan akuntabilitas dana' },
    ],
    historyKegiatan: [
      { title: 'Rekapitulasi Laporan Keuangan Triwulan', year: 'Maret 2026', role: 'Penyusun LPJ' },
    ],
  },
  {
    id: 'm-5',
    noAnggota: 'KT-005',
    nik: '3174011005950005',
    name: 'Ahmad Fauzi',
    nickname: 'Ahmad',
    jabatan: 'Koordinator Olahraga',
    divisi: 'Pemuda & Olahraga',
    rw: 'RW 03',
    phone: '0812 3456 7890',
    email: 'ahmadfauzi@gmail.com',
    status: 'Aktif',
    joinDate: '01 Feb 2024',
    birthPlace: 'Tangerang',
    birthDate: '1995-05-10',
    gender: 'Laki-laki',
    address: 'Jl. Dahlia No. 12, RT 02/RW 03 Sukamaju Manis Jaya',
    education: 'S1 Keolahragaan',
    job: 'Pelatih & Guru Olahraga',
    company: 'Sekolah Menengah Manis Jaya',
    skills: 'Turnamen Futsal, Voli, Atletik, Wasit',
    interests: 'Olahraga, Kepemudaan, Pelatihan',
    emergencyContact: '0812 9876 5432 (Siti Rahma)',
    avatar: '/src/assets/images/ahmad_fauzi_portrait_1790646239274.jpg',
    period: '2024 - 2027',
    username: 'ahmad',
    password: 'karangtaruna',
    isSuperAdmin: false,
    allowedMenus: ['beranda', 'ringkasan', 'jadwal', 'berita', 'galeri'],
    lastLogin: '3 hari lalu',
    historyJabatan: [
      { role: 'Koordinator Seksi Olahraga', period: '2024 - Sekarang', desc: 'Penyelenggara Turnamen Futsal Pemuda' },
    ],
    historyKegiatan: [
      { title: 'Turnamen Futsal Kemerdekaan RI', year: 'Agustus 2026', role: 'Ketua Wasit' },
    ],
  },
  {
    id: 'm-6',
    noAnggota: 'KT-006',
    nik: '3671046109000006',
    name: 'Dewi Lestari',
    nickname: 'Dewi',
    jabatan: 'Divisi Humas & Dokumentasi',
    divisi: 'Humas & Publikasi',
    rw: 'RW 01',
    phone: '0812 8912 3455',
    email: 'dewi@karangtarunamanisjaya.id',
    status: 'Aktif',
    joinDate: '10 Feb 2024',
    birthPlace: 'Tangerang',
    birthDate: '2000-09-05',
    gender: 'Perempuan',
    address: 'Jl. Mawar No. 15, RT 02/RW 01 Manis Jaya',
    education: 'S1 Ilmu Komunikasi',
    job: 'Content Creator & Media Specialist',
    company: 'Media Manis Jaya',
    skills: 'Fotografi, Desain Grafis, Video Editing, Social Media',
    interests: 'Kreativitas Pemuda, Seni Budaya, Dokumentasi',
    emergencyContact: '0857 8888 7777 (Keluarga)',
    avatar: '/src/assets/images/siti_nurhaliza_portrait_1790646253976.jpg',
    period: '2024 - 2027',
    username: 'humas',
    password: 'karangtaruna',
    isSuperAdmin: false,
    allowedMenus: ['beranda', 'ringkasan', 'jadwal', 'berita', 'aset', 'galeri', 'tambah_berita', 'kategori'],
    lastLogin: '4 hari lalu',
    historyJabatan: [
      { role: 'Staf Humas & Media', period: '2024 - Sekarang', desc: 'Pengelola portal berita dan media sosial resmi' },
    ],
    historyKegiatan: [
      { title: 'Liputan Dokumentasi Bakti Sosial', year: 'Januari 2026', role: 'Fotografer & Desainer' },
    ],
  },
];

export function memberToUserAccount(m: DetailedMember): UserAccount {
  return {
    id: m.id,
    username: m.username || m.nickname.toLowerCase() || 'user',
    password: m.password || 'karangtaruna',
    name: m.name,
    role: `${m.jabatan} Karang Taruna`,
    nik: m.nik,
    rw: m.rw || 'RW 03',
    avatarInitials: m.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    isSuperAdmin: m.isSuperAdmin ?? (m.id === 'm-1' || m.username === 'admin'),
    allowedMenus: m.allowedMenus || ['beranda', 'ringkasan', 'jadwal', 'berita'],
    lastLogin: m.lastLogin || 'Belum pernah login',
    email: m.email,
    phone: m.phone,
    status: m.status,
    noAnggota: m.noAnggota,
    avatar: m.avatar,
    divisi: m.divisi,
    job: m.job,
  };
}
