import { WorkspaceTab } from '../components/workspace/Sidebar';
import { resolveAssetUrl } from '../utils/assetUrl';

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
    id: 'arsip_kegiatan',
    label: 'Arsip Kegiatan Lampau',
    category: 'Kegiatan',
    description: 'Penyimpanan arsip program kerja yang telah selesai agar tidak memenuhi dashboard utama.',
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
  {
    id: 'voting',
    label: 'Voling & Pemilihan Anggota',
    category: 'Portal',
    description: 'Pemungutan suara anggota, polling aspirasi pemuda, dan pemilihan ketua kegiatan.',
  },
];

// Akun Tamu / Pengunjung Default (Saat Pertama Kali Masuk Situs Belum Login)
export const GUEST_USER: UserAccount = {
  id: 'guest',
  username: 'tamu',
  password: '',
  name: 'Tamu / Pengunjung',
  role: 'Pengunjung Publik',
  rw: 'Kelurahan Manis Jaya',
  avatarInitials: 'TM',
  status: 'Aktif',
  isSuperAdmin: false,
  allowedMenus: ['beranda', 'berita', 'voting', 'jadwal'],
};

// Akun Khusus Administrator (Super Admin) - Tidak tercatat di daftar anggota karang taruna
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-administrator',
    username: 'Administrator',
    password: 'Bautai123',
    name: 'Administrator',
    role: 'Super Administrator',
    nik: '1998081200000001',
    rw: 'Kelurahan Manis Jaya',
    divisi: 'Pengurus Harian & Sistem',
    phone: '',
    email: 'admin@karangtarunamanisjaya.id',
    avatarInitials: 'AD',
    isSuperAdmin: true,
    status: 'Aktif',
    allowedMenus: [
      'beranda',
      'ringkasan',
      'arsip_kegiatan',
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
      'voting',
    ],
    lastLogin: 'Baru saja',
  },
];

