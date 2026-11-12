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

// Email pribadi resmi pemilik situs yang berhak mengakses peran Administrator
export const OWNER_ADMIN_EMAIL = 'jalansuci19@gmail.com';

export const isOwnerAdminAccount = (user?: Partial<UserAccount> | null): boolean => {
  if (!user) return false;
  return (
    user.id === 'usr-administrator' &&
    (user.email || '').toLowerCase() === OWNER_ADMIN_EMAIL &&
    user.isSuperAdmin === true
  );
};

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

// Akun Khusus Administrator Pemilik Pribadi (Verifikasi via Server / Google Pemilik)
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-administrator',
    username: 'Administrator',
    password: '',
    name: 'Administrator',
    role: 'Super Administrator',
    nik: '1998081200000001',
    rw: 'Kelurahan Manis Jaya',
    divisi: 'Pemilik & Pengelola Utama Sistem',
    phone: '',
    email: OWNER_ADMIN_EMAIL,
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
    lastLogin: 'Terkunci Eksklusif Pemilik',
  },
];

// SHA-256 digest pemilik Administrator (tidak menyimpan kata sandi plaintext di kode klien)
const OWNER_ADMIN_PASSWORD_SHA256 =
  '727839ae22cd1b53eb9aa0f67a1c0b2310362bec7a3be5b75958d0ad42f07865';

function sha256FallbackHex(ascii: string): string {
  const rightRotate = (value: number, amount: number) => (value >>> amount) | (value << (32 - amount));
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';
  const words: number[] = [];
  const utf8 = unescape(encodeURIComponent(ascii));
  const asciiBitLength = utf8.length * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, number> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  let msg = utf8 + '\x80';
  while ((msg.length % 64) - 56) msg += '\x00';
  for (let i = 0; i < msg.length; i++) {
    const j = msg.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash.unshift((temp1 + temp2) | 0);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }
    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export async function verifyAdminPasswordClientSide(rawPassword: string): Promise<boolean> {
  const password = String(rawPassword || '').trim();
  if (!password) return false;

  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle && typeof TextEncoder !== 'undefined') {
      const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
      const hex = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return hex === OWNER_ADMIN_PASSWORD_SHA256;
    }
  } catch {}

  return sha256FallbackHex(password) === OWNER_ADMIN_PASSWORD_SHA256;
}


