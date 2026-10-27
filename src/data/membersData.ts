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
  // Tanda Tangan Digital Resmi (Base64 PNG URL)
  signatureUrl?: string;
  digitalSignatureUrl?: string;
}

export const EMPTY_MEMBER: DetailedMember = {
  id: '',
  noAnggota: '',
  nik: '',
  name: '',
  nickname: '',
  jabatan: 'Anggota',
  divisi: 'Umum',
  rw: 'RW 01',
  phone: '',
  email: '',
  status: 'Aktif',
  joinDate: '',
  birthPlace: '',
  birthDate: '',
  gender: 'Laki-laki',
  address: '',
  education: '',
  job: '',
  company: '',
  skills: '',
  interests: '',
  emergencyContact: '',
  avatar: '',
  period: '2024 - 2027',
  username: '',
  password: '',
  allowedMenus: ['beranda', 'surat'],
  signatureUrl: '',
  digitalSignatureUrl: '',
};

// Daftar Anggota Karang Taruna: Bersih & kosong saat peluncuran sistem
// Catatan: User Administrator adalah akun superadmin khusus sistem dan tidak tercatat di daftar anggota karang taruna
export const INITIAL_MEMBERS: DetailedMember[] = [];

export function memberToUserAccount(m: DetailedMember): UserAccount {
  return {
    id: m.id,
    username: m.username || m.nickname.toLowerCase() || 'user',
    password: m.password || 'karangtaruna',
    name: m.name,
    role: `${m.jabatan} Karang Taruna`,
    nik: m.nik,
    rw: m.rw || 'RW 01',
    avatarInitials: m.name
      ? m.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'KT',
    isSuperAdmin: m.isSuperAdmin ?? false,
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
