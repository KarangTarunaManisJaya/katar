import { resolveAssetUrl } from '../utils/assetUrl';

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
  videoDuration?: number;
  hasLocalVideo?: boolean;
  videoNote?: string;
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
  isArchived?: boolean;
  archivedAt?: string;
  archiveReason?: string;
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

// Data awal kegiatan/berita, anggota, surat, proposal, dan aset: Bersih & kosong saat peluncuran sistem
export const ACTIVITIES_DATA: ActivityItem[] = [];
export const WORKSPACE_MEMBERS: WorkspaceMember[] = [];
export const WORKSPACE_LETTERS: OfficialLetter[] = [];
export const WORKSPACE_PROPOSALS: ProposalItem[] = [];
export const WORKSPACE_ASSETS: OrganizationAsset[] = [];

