import {
  SuratMasukItem,
  SuratKeluarItem,
  DisposisiItem,
  NumberingConfig,
  TemplateSuratPreset,
  JenisSurat,
} from '../types/surat';

export const defaultNumberingConfig: NumberingConfig = {
  prefix: 'KT-MJ',
  nomorAwal: 1,
  counterSaatIni: 48,
  kodeSuratMap: {
    'Undangan': 'UND',
    'Permohonan': 'PMH',
    'Pemberitahuan': 'SPT',
    'Surat tugas': 'ST',
    'Surat keterangan': 'S-KET',
    'Surat rekomendasi': 'S-REK',
    'Surat pengantar': 'SP',
    'Surat keputusan': 'SK',
    'Surat pernyataan': 'SPN',
    'Berita acara': 'BA',
    'Surat lainnya': 'SRT',
  },
  formatBulan: 'romawi',
  formatTahun: '4_digit',
  jumlahDigit: 3,
  resetAturan: 'tahunan',
  lastResetPeriod: '2026',
};

export const templateSuratPresets: TemplateSuratPreset[] = [
  {
    id: 'tmpl-undangan',
    nama: 'Surat Undangan',
    jenisSurat: 'Undangan',
    deskripsi: 'Format standar untuk mengundang pengurus, tokoh masyarakat, atau pihak luar ke rapat / acara kepemudaan.',
    defaultPerihal: 'Undangan Rapat Koordinasi Program Kerja Triwulan',
    defaultTujuan: 'Ketua RW 01 s/d RW 08 dan Seluruh Pengurus',
    defaultInstansi: 'Wilayah Kelurahan Manis Jaya',
    defaultAlamat: 'Kelurahan Manis Jaya, Kec. Jatiuwung, Kota Tangerang',
    defaultIsi: `Dengan hormat,

Sehubungan dengan akan dilaksanakannya evaluasi program kerja triwulan serta persiapan program kepemudaan menyambut Hari Sumpah Pemuda, bersama ini kami Pengurus Karang Taruna Kelurahan Manis Jaya mengundang Bapak/Ibu/Rekan-rekan untuk hadir pada:

Hari / Tanggal : Sabtu, 10 Oktober 2026
Waktu          : 19.30 WIB - Selesai
Tempat         : Aula Balai Warga RW 04 Kelurahan Manis Jaya
Agenda         : 1. Evaluasi Pelaksanaan Bakti Sosial & Posyandu Remaja
                 2. Pembentukan Panitia Turnamen Pemuda
                 3. Lain-lain dan Ramah Tamah

Mengingat pentingnya agenda tersebut, kami sangat mengharapkan kehadiran tepat pada waktunya. Demikian surat undangan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.`,
    defaultPenandatangan: [
      {
        nama: 'Muhammad Ryan Pratama, S.Kom.',
        jabatan: 'Ketua Umum',
        ktaNo: 'KT-MJ-2024-001',
        includeStamp: true,
      },
      {
        nama: 'Dinda Kirana S., S.AP.',
        jabatan: 'Sekretaris Umum',
        ktaNo: 'KT-MJ-2024-002',
        includeStamp: true,
      },
    ],
  },
  {
    id: 'tmpl-permohonan',
    nama: 'Surat Permohonan',
    jenisSurat: 'Permohonan',
    deskripsi: 'Format permohonan izin tempat, peminjaman peralatan tenda/sound system, permohonan audiensi, atau bantuan fasilitas.',
    defaultPerihal: 'Permohonan Izin Tempat dan Fasilitas Aula Kelurahan',
    defaultTujuan: 'Bapak Lurah Manis Jaya',
    defaultInstansi: 'Kantor Kelurahan Manis Jaya',
    defaultAlamat: 'Jl. Raya Industri Manis No. 1, Jatiuwung - Kota Tangerang',
    defaultIsi: `Dengan hormat,

Dalam rangka meningkatkan keterampilan wirausaha generasi muda di wilayah Kelurahan Manis Jaya, Karang Taruna Kelurahan Manis Jaya bermaksud mengadakan kegiatan "Pelatihan Kewirausahaan & Pemasaran Digital Pemuda Kreatif 2026".

Sehubungan dengan hal tersebut, kami memohon perkenan Bapak Lurah untuk dapat memberikan izin penggunaan Aula Utama Kelurahan Manis Jaya beserta fasilitas kelengkapannya (Sound System, LCD Proyektor, Meja & Kursi) pada:

Hari / Tanggal : Minggu, 18 Oktober 2026
Waktu          : 08.00 - 15.00 WIB
Peserta        : 60 Pemuda/Pemudi perwakilan tiap RW

Sebagai bahan pertimbangan, bersama surat ini kami lampirkan Term of Reference (TOR) dan susunan agenda kegiatan. Demikian surat permohonan ini kami sampaikan, besar harapan kami Bapak berkenan mengabulkannya. Atas perhatian dan dukungan Bapak, kami ucapkan terima kasih.`,
    defaultPenandatangan: [
      {
        nama: 'Muhammad Ryan Pratama, S.Kom.',
        jabatan: 'Ketua Umum',
        ktaNo: 'KT-MJ-2024-001',
        includeStamp: true,
      },
      {
        nama: 'Budi Santoso, S.E.',
        jabatan: 'Bendahara',
        ktaNo: 'KT-MJ-2024-003',
        includeStamp: false,
      },
    ],
  },
  {
    id: 'tmpl-keterangan',
    nama: 'Surat Keterangan',
    jenisSurat: 'Surat keterangan',
    deskripsi: 'Penerbitan surat bukti keaktifan pengurus organisasi untuk keperluan beasiswa, pekerjaan, atau instansi pendidikan.',
    defaultPerihal: 'Surat Keterangan Pengurus Aktif Organisasi',
    defaultTujuan: 'Pihak Yang Berkepentingan',
    defaultInstansi: 'Instansi / Lembaga Terkait',
    defaultAlamat: 'Di Tempat',
    defaultIsi: `Yang bertanda tangan di bawah ini, Pengurus Karang Taruna Kelurahan Manis Jaya, Kecamatan Jatiuwung, Kota Tangerang, dengan ini menerangkan bahwa:

Nama Lengkap   : Ahmad Fauzi Alamsyah
Tempat, Tgl Lhr: Tangerang, 14 Mei 2002
Nomor KTA      : KT-MJ-2024-018
Alamat KTP     : Jl. Flamboyan Blok B No. 09, RT 03/RW 02 Kel. Manis Jaya
Jabatan        : Koordinator Seksi Olahraga & Minat Bakat (Periode 2024 - Sekarang)

Benar adalah pengurus aktif Karang Taruna Kelurahan Manis Jaya yang berdedikasi tinggi, berkelakuan baik, serta aktif dalam menyukseskan program-program kepemudaan di wilayah Kelurahan Manis Jaya.

Surat keterangan ini diberikan atas permintaan yang bersangkutan guna keperluan kelengkapan administrasi Beasiswa Pemuda Unggul Pemerintah Kota Tangerang. Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.`,
    defaultPenandatangan: [
      {
        nama: 'Muhammad Ryan Pratama, S.Kom.',
        jabatan: 'Ketua Umum',
        ktaNo: 'KT-MJ-2024-001',
        includeStamp: true,
      },
      {
        nama: 'Dinda Kirana S., S.AP.',
        jabatan: 'Sekretaris Umum',
        ktaNo: 'KT-MJ-2024-002',
        includeStamp: true,
      },
    ],
  },
  {
    id: 'tmpl-tugas',
    nama: 'Surat Tugas',
    jenisSurat: 'Surat tugas',
    deskripsi: 'Surat penugasan delegasi pengurus untuk menghadiri pelatihan, jambore, apel pemuda, atau satgas siaga lingkungan.',
    defaultPerihal: 'Surat Tugas Delegasi Jambore Kepemudaan Tingkat Kota',
    defaultTujuan: 'Nama-nama Terlampir',
    defaultInstansi: 'Pengurus Karang Taruna Manis Jaya',
    defaultAlamat: 'Di Tempat',
    defaultIsi: `Menindaklanjuti surat undangan dari Pengurus Karang Taruna Kota Tangerang Nomor: 112/KT-KOTA/IX/2026 perihal Pelaksanaan Jambore Bhakti Pemuda se-Kota Tangerang Tahun 2026, maka dengan ini Pengurus Karang Taruna Kelurahan Manis Jaya:

M E N U G A S K A N :

Kepada rekan-rekan pengurus yang namanya tercantum di bawah ini:
1. Rendy Saputra (Wakil Ketua Bidang Pemberdayaan)
2. Siti Nurhaliza (Anggota Seksi Hubungan Masyarakat)
3. Bayu Wicaksono (Koordinator Seksi Tanggap Bencana)

Untuk : Menjadi peserta delegasi resmi Karang Taruna Kelurahan Manis Jaya dalam Jambore Bhakti Pemuda yang akan diselenggarakan pada tanggal 16-18 Oktober 2026 bertempat di Bumi Perkemahan Kitri Bakti.
Kewajiban : Mengikuti seluruh rangkaian kegiatan dengan penuh disiplin, menjaga nama baik organisasi, serta melaporkan hasil kegiatan kepada Pengurus Pleno setelah selesai.

Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh rasa tanggung jawab.`,
    defaultPenandatangan: [
      {
        nama: 'Muhammad Ryan Pratama, S.Kom.',
        jabatan: 'Ketua Umum',
        ktaNo: 'KT-MJ-2024-001',
        includeStamp: true,
      },
    ],
  },
  {
    id: 'tmpl-pemberitahuan',
    nama: 'Surat Pemberitahuan',
    jenisSurat: 'Pemberitahuan',
    deskripsi: 'Format pemberitahuan agenda kerja bakti, sosialisasi kesehatan pemuda, atau pengumuman resmi lingkungan.',
    defaultPerihal: 'Pemberitahuan Pelaksanaan Aksi Gotong Royong Lingkungan Bersih',
    defaultTujuan: 'Bapak/Ibu Ketua RW 01 s/d RW 08',
    defaultInstansi: 'Kelurahan Manis Jaya',
    defaultAlamat: 'Kecamatan Jatiuwung - Kota Tangerang',
    defaultIsi: `Dengan hormat,

Dalam upaya mewujudkan lingkungan permukiman yang bersih, sehat, serta mengantisipasi potensi genangan saluran air di musim penghujan, Karang Taruna Kelurahan Manis Jaya berkolaborasi dengan pihak Kelurahan akan mengadakan kegiatan:

"Aksi Gotong Royong Pemuda Manis Jaya Bersih Lingkungan 2026"

Kegiatan tersebut akan diselenggarakan serentak pada:
Hari / Tanggal : Minggu, 25 Oktober 2026
Waktu          : 06.30 WIB - 11.30 WIB
Titik Kumpul   : Pos Pemuda masing-masing RW
Fokus Sasaran  : Normalisasi drainase saluran primer dan pemangkasan dahan pohon rindang

Sehubungan dengan hal tersebut, kami memohon bantuan Bapak/Ibu Ketua RW untuk dapat mengumumkan dan menggerakkan warga serta pemuda di lingkungannya masing-masing. Panitia Karang Taruna akan menyalurkan kantong sampah plastik dan konsumsi ringan pada setiap titik RW.

Demikian surat pemberitahuan ini kami sampaikan, terima kasih atas sinergi dan dukungan yang senantiasa terjalin.`,
    defaultPenandatangan: [
      {
        nama: 'Muhammad Ryan Pratama, S.Kom.',
        jabatan: 'Ketua Umum',
        ktaNo: 'KT-MJ-2024-001',
        includeStamp: true,
      },
      {
        nama: 'Dinda Kirana S., S.AP.',
        jabatan: 'Sekretaris Umum',
        ktaNo: 'KT-MJ-2024-002',
        includeStamp: true,
      },
    ],
  },
  {
    id: 'tmpl-pengantar',
    nama: 'Surat Pengantar',
    jenisSurat: 'Surat pengantar',
    deskripsi: 'Surat resmi untuk menyertai penyerahan proposal kegiatan, laporan pertanggungjawaban (LPJ), atau berkas rekomendasi.',
    defaultPerihal: 'Surat Pengantar Berkas Proposal Peringatan Hari Sumpah Pemuda 2026',
    defaultTujuan: 'Bapak Camat Jatiuwung',
    defaultInstansi: 'Kantor Kecamatan Jatiuwung',
    defaultAlamat: 'Jl. Gatot Subroto Km. 5, Kota Tangerang',
    defaultIsi: `Dengan hormat,

Bersama ini kami Pengurus Karang Taruna Kelurahan Manis Jaya bermaksud mengirimkan berkas dokumen dengan rincian sebagai berikut:

No. | Jenis Berkas Yang Dikirimkan                       | Banyaknya | Keterangan
1.  | Proposal Kegiatan Semarak Pemuda Kreatif 2026     | 1 Bundel  | Dikirim dengan hormat untuk
    | Kelurahan Manis Jaya                               |           | diketahui dan dimohonkan
    |                                                    |           | arahan serta dukungannya.
2.  | Rencana Anggaran Biaya (RAB) Terperinci           | 1 Rangkap | Lampiran sah dokumen proposal.

Demikian surat pengantar ini kami sampaikan, atas penerimaan dan perkenan Bapak kami haturkan terima kasih.`,
    defaultPenandatangan: [
      {
        nama: 'Muhammad Ryan Pratama, S.Kom.',
        jabatan: 'Ketua Umum',
        ktaNo: 'KT-MJ-2024-001',
        includeStamp: true,
      },
      {
        nama: 'Dinda Kirana S., S.AP.',
        jabatan: 'Sekretaris Umum',
        ktaNo: 'KT-MJ-2024-002',
        includeStamp: true,
      },
    ],
  },
  {
    id: 'tmpl-rekomendasi',
    nama: 'Surat Rekomendasi',
    jenisSurat: 'Surat rekomendasi',
    deskripsi: 'Pemberian rekomendasi formal organisasi untuk program kemitraan UMKM binaan pemuda atau sertifikasi keahlian.',
    defaultPerihal: 'Rekomendasi Bantuan Permodalan Wirausaha Pemuda Manis Jaya',
    defaultTujuan: 'Kepala Dinas Perindagkop & UKM Kota Tangerang',
    defaultInstansi: 'Dinas Perindagkop & UKM Kota Tangerang',
    defaultAlamat: 'Pusat Pemerintahan Kota Tangerang',
    defaultIsi: `Dengan hormat,

Pengurus Karang Taruna Kelurahan Manis Jaya memberikan rekomendasi kepada:

Nama Usaha      : Kopi Kreatif Pemuda Manis Jaya
Nama Pemilik    : Bagas Kurniawan (KTA: KT-MJ-2024-029)
Bidang Usaha    : Kuliner & Minuman Olahan Kopi Lokal
Alamat Lokasi   : Jl. Manis Jaya Raya No. 44, RW 03 Kel. Manis Jaya

Setelah melalui verifikasi lapangan dan bimbingan kewirausahaan Karang Taruna, yang bersangkutan dinilai aktif, memiliki komitmen tinggi dalam membuka lapangan kerja bagi pemuda setempat, serta layak untuk mendapatkan fasilitasi program bantuan permodalan UMKM Pemuda Berdaya.

Demikian rekomendasi ini kami berikan dengan penuh tanggung jawab untuk diproses sesuai regulasi yang berlaku.`,
    defaultPenandatangan: [
      {
        nama: 'Muhammad Ryan Pratama, S.Kom.',
        jabatan: 'Ketua Umum',
        ktaNo: 'KT-MJ-2024-001',
        includeStamp: true,
      },
    ],
  },
  {
    id: 'tmpl-pernyataan',
    nama: 'Surat Pernyataan',
    jenisSurat: 'Surat pernyataan',
    deskripsi: 'Pernyataan integritas, kesediaan kepengurusan, atau pernyataan netralitas organisasi dalam pesta demokrasi.',
    defaultPerihal: 'Surat Pernyataan Netralitas Organisasi dan Komitmen Sosial',
    defaultTujuan: 'Masyarakat & Pembina Karang Taruna',
    defaultInstansi: 'Kelurahan Manis Jaya',
    defaultAlamat: 'Di Tempat',
    defaultIsi: `Kami yang bertanda tangan di bawah ini atas nama segenap Pengurus Karang Taruna Kelurahan Manis Jaya menyatakan dengan penuh kesadaran dan tanggung jawab bahwa:

1. Karang Taruna Kelurahan Manis Jaya adalah organisasi sosial kepemudaan yang bersifat independen, non-partisan, dan berorientasi pada kemaslahatan masyarakat umum.
2. Tidak mengatasnamakan atribut organisasi untuk kepentingan politik praktis tertentu.
3. Seluruh fasilitas kesekretariatan dan aset organisasi diperuntukkan murni untuk pelayanan sosial kemasyarakatan pemuda Kelurahan Manis Jaya.

Surat pernyataan ini dibuat dengan sebenar-benarnya tanpa paksaan dari pihak manapun untuk dijadikan komitmen bersama.`,
    defaultPenandatangan: [
      {
        nama: 'Muhammad Ryan Pratama, S.Kom.',
        jabatan: 'Ketua Umum',
        ktaNo: 'KT-MJ-2024-001',
        includeStamp: true,
      },
      {
        nama: 'Dinda Kirana S., S.AP.',
        jabatan: 'Sekretaris Umum',
        ktaNo: 'KT-MJ-2024-002',
        includeStamp: true,
      },
    ],
  },
  {
    id: 'tmpl-sk',
    nama: 'Surat Keputusan (SK)',
    jenisSurat: 'Surat keputusan',
    deskripsi: 'Surat ketetapan resmi organisasi tentang penetapan struktur panitia pelaksana kegiatan atau peraturan intern.',
    defaultPerihal: 'Keputusan Ketua Karang Taruna Tentang Pembentukan Panitia Semarak Pemuda 2026',
    defaultTujuan: 'Seluruh Anggota & Dewan Pertimbangan',
    defaultInstansi: 'Kelurahan Manis Jaya',
    defaultAlamat: 'Di Tempat',
    defaultIsi: `SURAT KEPUTUSAN
NOMOR: SK/004/KT-MJ/X/2026

TENTANG
SUSUNAN PANITIA PELAKSANA PERINGATAN HARI BESAR NASIONAL PEMUDA
KARANG TARUNA KELURAHAN MANIS JAYA TAHUN 2026

Menimbang : Bahwa demi kelancaran dan kesuksesan agenda kepemudaan di Kelurahan Manis Jaya, dipandang perlu untuk membentuk kepanitiaan pelaksana.
Mengingat  : 1. Peraturan Menteri Sosial RI No. 25 Tahun 2019 tentang Karang Taruna.
             2. Anggaran Dasar dan Anggaran Rumah Tangga Karang Taruna.
             3. Hasil Rapat Pleno Pengurus Karang Taruna Manis Jaya tanggal 28 September 2026.

MEMUTUSKAN:
Menetapkan:
Pertama   : Mengangkat nama-nama terlampir sebagai Panitia Pelaksana Semarak Pemuda 2026.
Kedua     : Panitia bertugas merencanakan, melaksanakan, dan mempertanggungjawabkan kegiatan.
Ketiga     : Keputusan ini berlaku sejak tanggal ditetapkan.`,
    defaultPenandatangan: [
      {
        nama: 'Muhammad Ryan Pratama, S.Kom.',
        jabatan: 'Ketua Umum',
        ktaNo: 'KT-MJ-2024-001',
        includeStamp: true,
      },
    ],
  },
  {
    id: 'tmpl-berita-acara',
    nama: 'Berita Acara',
    jenisSurat: 'Berita acara',
    deskripsi: 'Dokumentasi otentik serah terima inventaris, pelaksanaan musyawarah, atau hasil verifikasi berkas organisasi.',
    defaultPerihal: 'Berita Acara Serah Terima Pengelolaan Inventaris Tenda & Sound System',
    defaultTujuan: 'Arsip Seksi Sarana & Prasarana',
    defaultInstansi: 'Sekretariat Karang Taruna Manis Jaya',
    defaultAlamat: 'Di Tempat',
    defaultIsi: `BERITA ACARA SERAH TERIMA
PADA HARI INI, SABTU TANGGAL 3 OKTOBER 2026, KAMI YANG BERTANDA TANGAN:

PIHAK I (YANG MENYERAHKAN)
Nama    : Bayu Pratama
Jabatan : Koordinator Inventaris Periode 2023-2024

PIHAK II (YANG MENERIMA)
Nama    : Riski Kurnia
Jabatan : Koordinator Perlengkapan & Sarpras Periode 2024-Sekarang

Menyatakan telah melakukan serah terima fisik barang inventaris milik Karang Taruna Manis Jaya dalam kondisi baik dan lengkap berupa:
1. 2 Unit Tenda Kerucut Ukuran 3x3 Meter
2. 1 Set Portable Sound System Wireless + 2 Mic Wireless
3. 50 Unit Kursi Plastik Hijau

Demikian Berita Acara ini dibuat dan ditandatangani kedua belah pihak dengan iktikad baik.`,
    defaultPenandatangan: [
      {
        nama: 'Muhammad Ryan Pratama, S.Kom.',
        jabatan: 'Ketua Umum',
        ktaNo: 'KT-MJ-2024-001',
        includeStamp: true,
      },
      {
        nama: 'Dinda Kirana S., S.AP.',
        jabatan: 'Sekretaris Umum',
        ktaNo: 'KT-MJ-2024-002',
        includeStamp: true,
      },
    ],
  },
];

export const getInitialSuratMasukData = (): SuratMasukItem[] => [];

export const getInitialSuratKeluarData = (): SuratKeluarItem[] => [];

export const getInitialDisposisiData = (): DisposisiItem[] => [];

export const formatRomanMonth = (monthIndex: number): string => {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romans[monthIndex] || 'I';
};

export const generateNextNomorSurat = (
  jenisSurat: JenisSurat,
  config: NumberingConfig,
  currentDate = new Date()
): string => {
  const kode = config.kodeSuratMap[jenisSurat] || 'SRT';
  const prefix = config.prefix || 'KT-MJ';
  const counterStr = String(config.counterSaatIni).padStart(config.jumlahDigit, '0');

  let bulanStr = '';
  if (config.formatBulan === 'romawi') {
    bulanStr = formatRomanMonth(currentDate.getMonth());
  } else if (config.formatBulan === 'dua_digit') {
    bulanStr = String(currentDate.getMonth() + 1).padStart(2, '0');
  } else {
    bulanStr = String(currentDate.getMonth() + 1);
  }

  const tahunStr = config.formatTahun === '2_digit'
    ? String(currentDate.getFullYear()).slice(-2)
    : String(currentDate.getFullYear());

  // Standard template: {KODE}/{COUNTER}/{PREFIX}/{BULAN}/{TAHUN}
  return `${kode}/${counterStr}/${prefix}/${bulanStr}/${tahunStr}`;
};
