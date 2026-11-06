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
  ratings?: ActivityRating[];
  averageRating?: number;
  totalRatings?: number;
  comments?: ActivityComment[];
}

export type CommentType = 'diskusi' | 'pertanyaan' | 'masukan' | 'apresiasi';

export interface ActivityCommentReply {
  id: string;
  commentId: string;
  userId?: string;
  authorName: string;
  authorRole?: string;
  authorRw?: string;
  authorAvatar?: string;
  replyText: string;
  createdAt: string;
}

export interface ActivityComment {
  id: string;
  activityId?: string;
  userId?: string;
  authorName: string;
  authorRole?: string;
  authorRw?: string;
  authorAvatar?: string;
  comment: string;
  type?: CommentType;
  createdAt: string;
  likesCount?: number;
  likedByUserIds?: string[];
  replies?: ActivityCommentReply[];
}

export interface ActivityRating {
  id: string;
  userId?: string;
  memberName: string;
  role?: string;
  rw?: string;
  avatar?: string;
  rating: number; // 1 to 5
  feedback?: string;
  aspects?: {
    organization?: number;
    impact?: number;
    enthusiasm?: number;
  };
  createdAt: string;
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
    averageRating: 4.9,
    totalRatings: 3,
    ratings: [
      {
        id: 'rate-1',
        memberName: 'Ahmad Fauzi',
        role: 'Ketua RW 05',
        rw: 'RW 05',
        rating: 5,
        aspects: { organization: 5, impact: 5, enthusiasm: 5 },
        feedback: 'Alhamdulillah penyaluran santunan sangat tertib dan tepat sasaran. Pemuda Karang Taruna sangat santun dan sigap melayani adik-adik yatim.',
        createdAt: '28 Okt 2026, 11:45 WIB',
      },
      {
        id: 'rate-2',
        memberName: 'Rina Marlina',
        role: 'Anggota Karang Taruna',
        rw: 'RW 03',
        rating: 5,
        aspects: { organization: 5, impact: 5, enthusiasm: 4 },
        feedback: 'Kekompakan tim luar biasa, dari logistik hingga penerimaan donatur berjalan lancar tanpa kendala.',
        createdAt: '28 Okt 2026, 13:20 WIB',
      },
      {
        id: 'rate-3',
        memberName: 'Budi Santoso',
        role: 'Tokoh Pemuda',
        rw: 'RW 05',
        rating: 4,
        aspects: { organization: 4, impact: 5, enthusiasm: 5 },
        feedback: 'Program yang sangat mulia. Semoga bisa diadakan berkala tiap 3 bulan sekali.',
        createdAt: '29 Okt 2026, 09:15 WIB',
      },
    ],
    comments: [
      {
        id: 'comm-1',
        activityId: 'act-1793672627421',
        authorName: 'Rian Saputra',
        authorRole: 'Ketua Unit KT RW 02',
        authorRw: 'RW 02',
        comment: 'Untuk adik-adik penerima santunan, apakah kuota pendaftaran masih ada slot untuk wilayah RW 02?',
        type: 'pertanyaan',
        createdAt: '28 Okt 2026, 09:15 WIB',
        likesCount: 3,
        replies: [
          {
            id: 'rep-1',
            commentId: 'comm-1',
            authorName: 'Sie Pengabdian Masyarakat',
            authorRole: 'Panitia Pelaksana',
            authorRw: 'RW 05',
            replyText: 'Halo Kang Rian, kuota RW 02 masih tersedia 5 anak lagi. Bisa langsung dikoordinasikan data lengkapnya ke sekretariat ya.',
            createdAt: '28 Okt 2026, 09:40 WIB',
          },
        ],
      },
      {
        id: 'comm-2',
        activityId: 'act-1793672627421',
        authorName: 'Dewi Lestari',
        authorRole: 'Anggota Karang Taruna',
        authorRw: 'RW 04',
        comment: 'Usul untuk baksos periode berikutnya: mungkin bisa ditambahkan paket alat tulis dan tas sekolah untuk persiapan tahun ajaran baru.',
        type: 'masukan',
        createdAt: '28 Okt 2026, 14:10 WIB',
        likesCount: 5,
        replies: [],
      },
      {
        id: 'comm-3',
        activityId: 'act-1793672627421',
        authorName: 'Fajar Nugraha',
        authorRole: 'Warga Manis Jaya',
        authorRw: 'RW 01',
        comment: 'Alhamdulillah acaranya sangat tertib dan menyentuh hati warga. Terima kasih banyak rekan-rekan pemuda atas inisiatif mulia ini!',
        type: 'apresiasi',
        createdAt: '28 Okt 2026, 16:30 WIB',
        likesCount: 4,
        replies: [],
      },
    ],
  },
  {
    id: 'act-1793677100580',
    badge: 'Kegiatan',
    badgeColor: 'orange',
    title: 'Gerakan Manis Jaya Bersih: Kerja Bakti Massal dan Penanaman 100 Bibit Pohon',
    subtitle: 'Sinergi Warga dan Pemuda Demi Kelestarian Lingkungan Hijau Berkelanjutan',
    date: '25 Okt 2026',
    time: '07:00',
    location: 'Bantaran Kali & Fasum RW 01 - RW 05',
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
    content: 'Kerja bakti massal serentak dilaksanakan di 5 RW (RW 01 s/d RW 05) Kelurahan Manis Jaya. Pemuda Karang Taruna bersama Babinsa dan Bhabinkamtibmas bahu-membahu menata lingkungan.',
    category: 'Lingkungan',
    type: 'Kegiatan',
    priority: 'Rutin',
    status: 'Publikasikan Sekarang',
    isFeatured: false,
    averageRating: 4.8,
    totalRatings: 2,
    ratings: [
      {
        id: 'rate-4',
        memberName: 'Dedi Kurniawan',
        role: 'Kader Lingkungan',
        rw: 'RW 02',
        rating: 5,
        aspects: { organization: 5, impact: 5, enthusiasm: 5 },
        feedback: 'Warga sangat antusias turun ke selokan bersama pemuda. Bibit pohon langsung ditanam di sepanjang jalan utama.',
        createdAt: '25 Okt 2026, 11:30 WIB',
      },
      {
        id: 'rate-5',
        memberName: 'Siti Rahmawati',
        role: 'Pengurus Karang Taruna',
        rw: 'RW 04',
        rating: 4,
        aspects: { organization: 4, impact: 5, enthusiasm: 4 },
        feedback: 'Saluran air lancar, sampah langsung diangkut oleh truk kebersihan. Sangat efisien.',
        createdAt: '25 Okt 2026, 14:05 WIB',
      },
    ],
    comments: [
      {
        id: 'comm-kb-1',
        activityId: 'act-1793677100580',
        authorName: 'Hendra Gunawan',
        authorRole: 'Pengurus Karang Taruna',
        authorRw: 'RW 03',
        comment: 'Apakah alat seperti cangkul dan karung sampah sudah disiapkan panitia atau masing-masing perwakilan RW membawa perlengkapan sendiri?',
        type: 'pertanyaan',
        createdAt: '25 Okt 2026, 06:45 WIB',
        likesCount: 2,
        replies: [
          {
            id: 'rep-kb-1',
            commentId: 'comm-kb-1',
            authorName: 'Sie Lingkungan Hidup',
            authorRole: 'Koordinator Lapangan',
            authorRw: 'RW 01',
            replyText: 'Panitia sudah menyiapkan 150 karung dan 20 cangkul bantuan dari DLH, namun warga disarankan tetap membawa alat cadangan ya.',
            createdAt: '25 Okt 2026, 07:05 WIB',
          },
        ],
      },
      {
        id: 'comm-kb-2',
        activityId: 'act-1793677100580',
        authorName: 'Aris Maulana',
        authorRole: 'Pemuda Unit RW 01',
        authorRw: 'RW 01',
        comment: 'Titik drainase depan jalan raya utama RW 01 dan RW 02 sudah bersih tuntas. Mantap kekompakan warga pagi ini!',
        type: 'diskusi',
        createdAt: '25 Okt 2026, 10:15 WIB',
        likesCount: 6,
        replies: [],
      },
      {
        id: 'comm-kb-3',
        activityId: 'act-1793677100580',
        authorName: 'Suryadi',
        authorRole: 'Tokoh Masyarakat',
        authorRw: 'RW 05',
        comment: 'Usul agar kerja bakti seperti ini dijadikan agenda rutin 2 bulan sekali, terutama menjelang musim hujan.',
        type: 'masukan',
        createdAt: '25 Okt 2026, 12:30 WIB',
        likesCount: 4,
        replies: [],
      },
    ],
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
    description: 'Kompetisi futsal persahabatan pemuda dalam rangka mempererat tali silaturahmi antar pemuda RW 01 hingga RW 05.',
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

