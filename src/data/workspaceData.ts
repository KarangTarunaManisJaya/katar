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

// Data awal kegiatan/berita dengan video dokumentasi resmi Karang Taruna Kelurahan Manis Jaya
export const ACTIVITIES_DATA: ActivityItem[] = [
  {
    id: 'act-1793672627421',
    badge: 'Dokumentasi',
    badgeColor: 'green',
    title: 'Aksi Nyata Pemuda: Bakti Sosial dan Santunan Anak Yatim RW 05 Kelurahan Manis Jaya',
    subtitle: 'Menyemai Kepedulian, Merajut Persaudaraan Menuju Lingkungan Harmonis dan Berkah',
    date: '28 Okt 2026',
    time: '08:30',
    location: 'Aula Serbaguna RW 05, Kelurahan Manis Jaya',
    author: 'Sie Pengabdian Masyarakat',
    photoCount: 4,
    image: resolveAssetUrl('/baksos_karang_taruna_1790589027203.jpg'),
    photos: [
      resolveAssetUrl('/baksos_karang_taruna_1790589027203.jpg'),
      resolveAssetUrl('/hero_karang_taruna_1790587873230.jpg'),
    ],
    videoUrl: '/filebase_vault/video/video_baksos_manisjaya.mp4',
    videoDuration: 15,
    description: 'Kegiatan bakti sosial dan pemberian santunan kepada puluhan anak yatim serta dhuafa sebagai wujud nyata pengabdian pemuda Karang Taruna Kelurahan Manis Jaya.',
    content: 'Pada hari ini jajaran pemuda Karang Taruna Kelurahan Manis Jaya sukses menggelar bakti sosial peduli sesama. Acara turut dihadiri aparat kelurahan, tokoh masyarakat, dan perwakilan pengurus RW setempat.',
    category: 'Sosial',
    type: 'Dokumentasi',
    priority: 'Penting',
    status: 'Publikasikan Sekarang',
    isFeatured: true,
  },
  {
    id: 'act-1793677100580',
    badge: 'Kegiatan',
    badgeColor: 'orange',
    title: 'Gerakan Manis Jaya Bersih: Kerja Bakti Massal dan Penanaman 100 Bibit Pohon',
    subtitle: 'Sinergi Warga dan Pemuda Demi Kelestarian Lingkungan Hijau Berkelanjutan',
    date: '25 Okt 2026',
    time: '07:00',
    location: 'Bantaran Kali & Fasum RW 01 - RW 08',
    author: 'Sie Lingkungan Hidup',
    photoCount: 3,
    image: resolveAssetUrl('/activity_gotong_royong_1790587890085.jpg'),
    photos: [
      resolveAssetUrl('/activity_gotong_royong_1790587890085.jpg'),
      resolveAssetUrl('/manis_jaya_gate_1790588960710.jpg'),
    ],
    videoUrl: '/filebase_vault/video/video_kerjabakti_manisjaya.mp4',
    videoDuration: 15,
    description: 'Aksi kolaboratif seluruh pemuda dan warga se-Kelurahan Manis Jaya membersihkan saluran air, merapikan fasilitas umum, dan menanam pohon lindung.',
    content: 'Kerja bakti massal serentak dilaksanakan di 8 RW Kelurahan Manis Jaya. Pemuda Karang Taruna bersama Babinsa dan Bhabinkamtibmas bahu-membahu menata lingkungan.',
    category: 'Lingkungan',
    type: 'Kegiatan',
    priority: 'Rutin',
    status: 'Publikasikan Sekarang',
    isFeatured: false,
  },
  {
    id: 'act-4',
    badge: 'Kegiatan',
    badgeColor: 'dark',
    title: 'Turnamen Olahraga & Futsal Pemuda Antar RW Kelurahan Manis Jaya',
    subtitle: 'Junjung Tinggi Sportivitas dan Solidaritas Antar Generasi Muda',
    date: '20 Okt 2026',
    time: '15:30',
    location: 'Lapangan Futsal Gelora Pemuda Manis Jaya',
    author: 'Sie Olahraga & Seni Budaya',
    photoCount: 2,
    image: resolveAssetUrl('/activity_sports_youth_1790587904269.jpg'),
    photos: [
      resolveAssetUrl('/activity_sports_youth_1790587904269.jpg'),
    ],
    videoUrl: '/filebase_vault/video/video_futsal_manisjaya.mp4',
    videoDuration: 15,
    description: 'Kompetisi futsal persahabatan pemuda dalam rangka mempererat tali silaturahmi antar pemuda RW 01 hingga RW 08.',
    content: 'Turnamen berlangsung meriah dengan antusiasme penonton warga. Sie Olahraga mengapresiasi seluruh tim yang bertanding dengan penuh sportivitas.',
    category: 'Olahraga',
    type: 'Kegiatan',
    priority: 'Biasa',
    status: 'Publikasikan Sekarang',
    isFeatured: false,
  },
];
export const WORKSPACE_MEMBERS: WorkspaceMember[] = [];
export const WORKSPACE_LETTERS: OfficialLetter[] = [];
export const WORKSPACE_PROPOSALS: ProposalItem[] = [];
export const WORKSPACE_ASSETS: OrganizationAsset[] = [];

