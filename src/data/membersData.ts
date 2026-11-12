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
    isSuperAdmin: false,
    allowedMenus: (m.allowedMenus || ['beranda', 'ringkasan', 'jadwal', 'berita']).filter(
      (menu) => menu !== 'akses' && menu !== 'database' && menu !== 'pengaturan'
    ),
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

export function reconcileUsersAndMembersList(
  existingUsers: UserAccount[],
  membersList: DetailedMember[]
): UserAccount[] {
  const safeUsers = Array.isArray(existingUsers) ? existingUsers : [];
  const safeMembers = Array.isArray(membersList) ? membersList : [];

  const memberMapById = new Map<string, DetailedMember>();
  const memberMapByUsername = new Map<string, DetailedMember>();
  for (const m of safeMembers) {
    if (!m || typeof m !== 'object') continue;
    if (m.id) memberMapById.set(String(m.id), m);
    if (m.username) memberMapByUsername.set(String(m.username).trim().toLowerCase(), m);
  }

  const nonAdminUsers: UserAccount[] = [];
  const seenIds = new Set<string>();
  const seenUsernames = new Set<string>();

  for (const u of safeUsers) {
    if (!u || typeof u !== 'object') continue;
    const unameLower = String(u.username || '').trim().toLowerCase();
    if (u.id === 'usr-administrator' || unameLower === 'administrator' || u.id === 'guest') {
      continue;
    }
    const matchedMember =
      (u.id ? memberMapById.get(String(u.id)) : undefined) ||
      (unameLower ? memberMapByUsername.get(unameLower) : undefined);

    const mergedUser: UserAccount = {
      ...u,
      isSuperAdmin: false,
      allowedMenus: (
        Array.isArray(u.allowedMenus)
          ? u.allowedMenus
          : (['beranda', 'ringkasan', 'jadwal', 'berita'] as WorkspaceTab[])
      ).filter(
        (menu) => menu !== 'akses' && menu !== 'database' && menu !== 'pengaturan'
      ),
      nik: u.nik || matchedMember?.nik,
      noAnggota: u.noAnggota || matchedMember?.noAnggota,
      email: u.email || matchedMember?.email,
      phone: u.phone || matchedMember?.phone,
      status: u.status || matchedMember?.status || 'Aktif',
      avatar: u.avatar || matchedMember?.avatar,
      divisi: u.divisi || matchedMember?.divisi,
      job: u.job || matchedMember?.job,
      password: u.password || matchedMember?.password || 'karangtaruna',
    };

    if (mergedUser.id) seenIds.add(String(mergedUser.id));
    if (unameLower) seenUsernames.add(unameLower);
    nonAdminUsers.push(mergedUser);
  }

  // Tambahkan anggota dari kt_members_v3 yang belum terdaftar di kt_users_list_v3
  for (const m of safeMembers) {
    if (!m || typeof m !== 'object') continue;
    const converted = memberToUserAccount(m);
    const unameLower = String(converted.username || '').trim().toLowerCase();
    if (converted.id === 'usr-administrator' || unameLower === 'administrator') continue;
    if ((converted.id && seenIds.has(String(converted.id))) || (unameLower && seenUsernames.has(unameLower))) {
      continue;
    }
    if (converted.id) seenIds.add(String(converted.id));
    if (unameLower) seenUsernames.add(unameLower);
    nonAdminUsers.push(converted);
  }

  return nonAdminUsers;
}

