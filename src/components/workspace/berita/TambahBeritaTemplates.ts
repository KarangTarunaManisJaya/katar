export interface BeritaTemplate {
  id: string;
  label: string;
  iconName: string;
  badge: string;
  description: string;
  data: {
    title: string;
    subtitle: string;
    type: 'Kegiatan' | 'Berita' | 'Pengumuman' | 'Dokumentasi' | 'Liputan Khusus' | 'Artikel Pemuda';
    category: string;
    division: string;
    targetScope: string;
    priority: 'Rutin' | 'Penting' | 'Mendesak';
    registrationStatus: 'Terbuka Umum' | 'Khusus Pengurus' | 'Perlu Registrasi' | 'Undangan Khusus';
    time: string;
    endTime: string;
    location: string;
    organizer: string;
    estimatedBudget: string;
    fundingSource: string;
    summary: string;
    content: string;
    objective: string;
    result: string;
    coverPhoto: string;
    coverCaption: string;
    keyQuote: { quote: string; person: string; role: string };
    participantCount: string;
    participantsInvolved: string;
    partners: string;
    contactPerson: { name: string; phone: string; email: string };
    tags: string;
    metaDescription: string;
    socialCaption: string;
    rundown: Array<{ id: string; time: string; activity: string; pic: string }>;
  };
}

export const BERITA_TEMPLATES: BeritaTemplate[] = [
  {
    id: 'baksos',
    label: 'Bakti Sosial & Santunan Yatim',
    iconName: 'HeartHandshake',
    badge: 'Sosial',
    description: 'Santunan anak yatim & pembagian sembako warga RW 01 - RW 08',
    data: {
      title: 'Aksi Nyata Pemuda: Bakti Sosial dan Santunan Anak Yatim RW 05 Kelurahan Manis Jaya',
      subtitle: 'Mempererat Tali Asih dan Solidaritas Pemuda Menyambut Bulan Penuh Berkah',
      type: 'Kegiatan',
      category: 'Sosial',
      division: 'Seksi Usaha Kesejahteraan Sosial',
      targetScope: 'RW 01 s/d RW 08 Kelurahan Manis Jaya',
      priority: 'Penting',
      registrationStatus: 'Terbuka Umum',
      time: '08:30',
      endTime: '12:00',
      location: 'Aula Serbaguna Kelurahan Manis Jaya & Sekretariat KT RW 05',
      organizer: 'Pengurus Karang Taruna Kelurahan Manis Jaya & DKM Al-Ikhlas',
      estimatedBudget: 'Rp 14.500.000',
      fundingSource: 'Swadaya Anggota, Donatur Warga & Kas Kelurahan',
      summary: 'Karang Taruna Kelurahan Manis Jaya menggelar bakti sosial penyaluran 120 paket sembako serta santunan tunai kepada 45 anak yatim dan lansia prasejahtera.',
      content: `Kegiatan Bakti Sosial dan Santunan ini diselenggarakan sebagai perwujudan kepedulian sosial generasi muda terhadap lingkungan sekitar. Bertempat di Aula Serbaguna Kelurahan Manis Jaya, acara berlangsung khidmat dihadiri oleh jajaran perangkat kelurahan, tokoh agama, serta puluhan warga penerima manfaat.

Sebanyak 120 paket sembako yang terdiri dari beras, minyak goreng, gula, dan kebutuhan pokok lainnya diserahkan secara simbolis oleh Ketua Karang Taruna didampingi Babinsa dan Bhabinkamtibmas setempat. Selain itu, santunan uang tunai dan perlengkapan sekolah juga diberikan kepada 45 anak yatim/piatu untuk mendukung kelangsungan pendidikan mereka.

Diharapkan kegiatan ini terus menjadi agenda rutin tahunan pemuda Karang Taruna guna menumbuhkan empati dan kerukunan warga di Kelurahan Manis Jaya.`,
      objective: 'Meringankan beban ekonomi warga prasejahtera dan menyalurkan amanah donasi kepada anak-anak yatim binaan.',
      result: 'Tersalurkannya 120 paket sembako dan santunan tunai 45 anak yatim dengan tingkat kepuasan warga 100%.',
      coverPhoto: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200&auto=format&fit=crop',
      coverCaption: 'Penyerahan santunan dan bingkisan secara simbolis oleh pengurus Karang Taruna kepada perwakilan anak yatim.',
      keyQuote: {
        quote: 'Pemuda harus hadir memberi solusi nyata di tengah masyarakat, bukan sekadar berteori di ruang rapat.',
        person: 'Ahmad Fauzi',
        role: 'Ketua Karang Taruna Manis Jaya',
      },
      participantCount: '165 Orang (120 Penerima, 45 Panitia Pemuda)',
      participantsInvolved: 'Pemuda Karang Taruna, Pengurus RT/RW, DKM, Ibu-ibu PKK',
      partners: 'Kelurahan Manis Jaya, Babinsa, Bhabinkamtibmas, Forum RW',
      contactPerson: {
        name: 'Rian Hidayat (Koordinator Baksos)',
        phone: '0812-3456-7890',
        email: 'sosial.ktmanisjaya@gmail.com',
      },
      tags: 'bakti-sosial, santunan-yatim, pemuda-peduli, manis-jaya, peduli-sesama',
      metaDescription: 'Liputan bakti sosial dan santunan 45 anak yatim oleh Karang Taruna Kelurahan Manis Jaya dengan total 120 paket sembako.',
      socialCaption: 'Alhamdulillah! Bersama Karang Taruna Manis Jaya menyalurkan 120 paket sembako & santunan 45 anak yatim. Terima kasih para donatur! 💙 #KarangTarunaManisJaya #PeduliSesama',
      rundown: [
        { id: 'rd-1', time: '08:00 - 08:30', activity: 'Registrasi Peserta & Penerima Manfaat', pic: 'Sie Kesekretariatan' },
        { id: 'rd-2', time: '08:30 - 09:00', activity: 'Pembukaan, Lagu Indonesia Raya & Mars KT', pic: 'MC Acara' },
        { id: 'rd-3', time: '09:00 - 09:30', activity: 'Sambutan Lurah Manis Jaya & Ketua KT', pic: 'Bpk Lurah & Ketua KT' },
        { id: 'rd-4', time: '09:30 - 11:30', activity: 'Penyerahan Simbolis Sembako & Santunan Tunai', pic: 'Sie Logistik' },
        { id: 'rd-5', time: '11:30 - 12:00', activity: 'Doa Bersama, Foto Dokumentasi & Penutupan', pic: 'Sie Acara' },
      ],
    },
  },
  {
    id: 'kerjabakti',
    label: 'Kerja Bakti & Penghijauan',
    iconName: 'Trees',
    badge: 'Lingkungan',
    description: 'Aksi bersih drainase & tanam 100 bibit pohon produktif',
    data: {
      title: 'Gerakan Manis Jaya Bersih: Kerja Bakti Massal dan Penanaman 100 Bibit Pohon',
      subtitle: 'Antisipasi Genangan Musim Hujan dan Mewujudkan Lingkungan Asri Berkelanjutan',
      type: 'Kegiatan',
      category: 'Lingkungan',
      division: 'Seksi Lingkungan Hidup & Kebersihan',
      targetScope: 'Kawasan Saluran Utama RW 03 & RW 04',
      priority: 'Penting',
      registrationStatus: 'Terbuka Umum',
      time: '07:00',
      endTime: '11:00',
      location: 'Kawasan Bantaran Kali & Drainase Utama RW 03 - RW 04',
      organizer: 'Seksi Lingkungan Hidup Karang Taruna bersama DLH Kota Tangerang',
      estimatedBudget: 'Rp 4.200.000',
      fundingSource: 'Bantuan Bibit DLH & Donasi Swadaya Warga',
      summary: 'Puluhan pemuda bersama warga RW 03 dan RW 04 membersihkan endapan lumpur drainase sepanjang 800 meter serta menanam 100 bibit tanaman pelindung.',
      content: `Menghadapi potensi intensitas hujan tinggi, Karang Taruna Kelurahan Manis Jaya menginisiasi Gerakan Manis Jaya Bersih dan Asri pada Minggu pagi.

Aksi difokuskan pada pengangkatan sampah sedimentasi lumpur di saluran drainase utama yang kerap tersumbat, serta penataan area publik dengan penanaman bibit mangga, pucuk merah, dan ketapang kencana bantuan dari Dinas Lingkungan Hidup.

Warga sangat antusias turut serta membawa peralatan mandiri, menunjukkan kuatnya budaya gotong royong pemuda dan warga Manis Jaya.`,
      objective: 'Mencegah banjir genangan dan meningkatkan indeks kualitas ruang terbuka hijau di lingkungan RW binaan.',
      result: 'Saluran air 800m bersih lancar, 100 pohon tertanam rapi, dan terangkutnya 3 truk sampah residu.',
      coverPhoto: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?q=80&w=1200&auto=format&fit=crop',
      coverCaption: 'Pemuda Karang Taruna bahu-membahu membersihkan drainase saluran utama bersama warga.',
      keyQuote: {
        quote: 'Kebersihan lingkungan bukan hanya tanggung jawab petugas kelurahan, tapi cermin martabat warganya.',
        person: 'Drs. Suhanda',
        role: 'Lurah Kelurahan Manis Jaya',
      },
      participantCount: '110 Warga & Pemuda',
      participantsInvolved: 'Pengurus Karang Taruna, Warga RW 03 & 04, Petugas Kebersihan',
      partners: 'Dinas Lingkungan Hidup, Forum RW, Pengurus Bank Sampah',
      contactPerson: {
        name: 'Bayu Pratama (Sie Lingkungan)',
        phone: '0813-8899-7711',
        email: 'lingkungan.ktmanisjaya@gmail.com',
      },
      tags: 'kerja-bakti, manis-jaya-bersih, lingkungan-hidup, penanaman-pohon, gotong-royong',
      metaDescription: 'Kerja bakti massal dan penanaman 100 bibit pohon di Kelurahan Manis Jaya oleh Karang Taruna dan warga.',
      socialCaption: 'Aksi Minggu Bersih Karang Taruna Manis Jaya! 100 bibit pohon tertanam & saluran air kembali lancar. Lingkungan bersih, hidup makin sehat! 🌿 #ManisJayaBersih',
      rundown: [
        { id: 'rd-1', time: '07:00 - 07:15', activity: 'Apel Pagi & Pembagian Sektor Pembersihan', pic: 'Koordinator Lapangan' },
        { id: 'rd-2', time: '07:15 - 09:30', activity: 'Aksi Pembersihan Sedimen & Pengangkutan Sampah', pic: 'Semua Peserta' },
        { id: 'rd-3', time: '09:30 - 10:30', activity: 'Penanaman 100 Bibit Pohon Pelindung', pic: 'Sie Lingkungan & DLH' },
        { id: 'rd-4', time: '10:30 - 11:00', activity: 'Makan Bersama, Sarapan Bubur Kacang Ijo & Penutupan', pic: 'Sie Konsumsi' },
      ],
    },
  },
  {
    id: 'futsal',
    label: 'Turnamen Futsal Pemuda Cup',
    iconName: 'Trophy',
    badge: 'Olahraga',
    description: 'Kompetisi antar-RW memperebutkan Piala Bergilir Lurah Manis Jaya',
    data: {
      title: 'Semarak Turnamen Futsal Pemuda Manis Jaya Cup 2026: Ajang Silaturahmi dan Sportivitas',
      subtitle: 'Perebutan Trofi Bergilir Lurah Manis Jaya dan Total Hadiah Pembinaan Rp 7,5 Juta',
      type: 'Kegiatan',
      category: 'Olahraga',
      division: 'Seksi Olahraga & Rekreasi',
      targetScope: '8 Tim Perwakilan RW se-Kelurahan Manis Jaya',
      priority: 'Penting',
      registrationStatus: 'Perlu Registrasi',
      time: '09:00',
      endTime: '17:30',
      location: 'Lapangan Futsal Manis Indah Sport Center',
      organizer: 'Seksi Olahraga Karang Taruna Kelurahan Manis Jaya',
      estimatedBudget: 'Rp 8.750.000',
      fundingSource: 'Pendaftaran Tim, Sponsor UMKM & Kas Pemuda',
      summary: 'Turnamen futsal persahabatan antar-RW resmi bergulir dengan diikuti 16 tim pemuda dari seluruh penjuru Kelurahan Manis Jaya.',
      content: `Dalam rangka mempererat tali persaudaraan antar pemuda pasca perayaan Hari Kemerdekaan, Karang Taruna menggelar Turnamen Futsal Pemuda Manis Jaya Cup 2026.

Pertandingan berlangsung seru dan menjunjung tinggi nilai sportivitas. Antusiasme suporter dari masing-masing RW memadati tribun lapangan. Babak final mempertemukan Tim Pemuda RW 02 melawan Tim Pemuda RW 05 dengan skor sengit yang berakhir kemenangan bagi RW 05.

Selain piala bergilir, para pemenang mendapatkan piagam penghargaan serta dana pembinaan olahraga untuk memacu bibit atlet lokal berprestasi.`,
      objective: 'Memupuk sportivitas, menjauhkan generasi muda dari pergaulan negatif, dan menjaring bibit atlet futsal kelurahan.',
      result: '16 Tim berlaga sukses tanpa insiden, juara 1 diraih RW 05, top scorer dicetak oleh Dimas (RW 02) dengan 11 gol.',
      coverPhoto: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
      coverCaption: 'Suasana pembukaan kick-off pertama oleh Lurah Manis Jaya didampingi Ketua Panitia Turnamen.',
      keyQuote: {
        quote: 'Kemenangan sejati bukan hanya mengangkat trofi, tapi bagaimana kita menjaga persaudaraan saat peluit berakhir.',
        person: 'Rizky Kurniawan',
        role: 'Ketua Panitia Futsal Cup',
      },
      participantCount: '180 Peserta (16 Tim) & 250 Penonton',
      participantsInvolved: 'Perwakilan Pemuda RW 01 - RW 08, Karang Taruna Unit',
      partners: 'Kelurahan Manis Jaya, Bhabinkamtibmas, Kratingdaeng, UMKM Manis Jaya',
      contactPerson: {
        name: 'Rizky Kurniawan (Panitia Olahraga)',
        phone: '0857-1122-3344',
        email: 'olahraga.ktmanisjaya@gmail.com',
      },
      tags: 'turnamen-futsal, olahraga-pemuda, piala-lurah, sportivitas, manis-jaya',
      metaDescription: 'Liputan dan hasil Turnamen Futsal Pemuda Manis Jaya Cup 2026 yang diikuti 16 tim antar-RW se-Kelurahan Manis Jaya.',
      socialCaption: 'Selamat kepada RW 05 sang jawara Futsal Pemuda Manis Jaya Cup 2026! Terima kasih kepada 16 tim yang telah bermain dengan luar biasa sportif! 🏆⚽ #PemudaSportif',
      rundown: [
        { id: 'rd-1', time: '08:30 - 09:00', activity: 'Registrasi & Cek Medis Pemain', pic: 'Sie Kesehatan' },
        { id: 'rd-2', time: '09:00 - 09:30', activity: 'Opening Ceremony & Tendangan Kick-off oleh Bpk Lurah', pic: 'Panitia Pelaksana' },
        { id: 'rd-3', time: '09:30 - 15:30', activity: 'Penyisihan Grup s/d Semifinal', pic: 'Wasit & Sie Tanding' },
        { id: 'rd-4', time: '15:30 - 16:30', activity: 'Laga Perebutan Juara 3 & Grand Final', pic: 'Wasit PSSI Kota' },
        { id: 'rd-5', time: '16:30 - 17:30', activity: 'Pengalungan Medali, Trophy Presentation & Foto Bersama', pic: 'Ketua KT & Lurah' },
      ],
    },
  },
];
