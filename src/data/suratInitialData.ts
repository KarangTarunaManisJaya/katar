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

export const getInitialSuratMasukData = (): SuratMasukItem[] => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');

  return [
    {
      id: 'sm-01',
      nomorSurat: `005/142-Kel.MJ/${y}`,
      tanggalSurat: `${y}-${m}-01`,
      tanggalDiterima: `${y}-${m}-02`,
      pengirim: 'Drs. H. Ujang Suherman (Lurah Manis Jaya)',
      instansi: 'Kantor Kelurahan Manis Jaya',
      perihal: 'Undangan Rapat Koordinasi Wilayah & Pembahasan Penataan Lingkungan RW',
      jenisSurat: 'Undangan',
      sifatSurat: 'Penting',
      tujuanDisposisi: 'Ketua Umum & Sekretaris',
      ringkasanIsi: 'Kelurahan mengundang Pengurus Harian Karang Taruna untuk menghadiri rapat koordinasi sinkronisasi data pemuda dan jadwal gotong royong terpadu.',
      petugasPenerima: 'Dinda Kirana (Sekretariat)',
      status: 'Diproses/Didisposisi',
      disposisiId: 'disp-01',
      lampiran: [
        { id: 'att-1', name: 'Jadwal_Rakor_Kelurahan.pdf', sizeKb: 340, type: 'PDF', description: 'Agenda dan rundown rakor kelurahan' }
      ],
      fileSuratName: 'Surat_Kelurahan_Undangan_Rakor.pdf',
      createdAt: `${y}-${m}-02T08:30:00.000Z`,
      updatedAt: `${y}-${m}-02T08:30:00.000Z`,
    },
    {
      id: 'sm-02',
      nomorSurat: `421/089/Dispora/${y}`,
      tanggalSurat: `${y}-${m}-03`,
      tanggalDiterima: `${y}-${m}-04`,
      pengirim: 'Kepala Bidang Kepemudaan Dispora',
      instansi: 'Dinas Pemuda dan Olahraga Kota Tangerang',
      perihal: 'Pemberitahuan Sosialisasi Hibah Pembinaan Organisasi Kepemudaan',
      jenisSurat: 'Pemberitahuan',
      sifatSurat: 'Segera',
      tujuanDisposisi: 'Bendahara & Tim Proposal',
      ringkasanIsi: 'Pemberitahuan jadwal sosialisasi mekanisme pengajuan bantuan dana stimulan kepemudaan tahun anggaran mendatang serta syarat verifikasi LPJ.',
      petugasPenerima: 'Dinda Kirana (Sekretariat)',
      status: 'Belum Diproses',
      lampiran: [
        { id: 'att-2', name: 'Petunjuk_Teknis_Hibah_2026.pdf', sizeKb: 1250, type: 'PDF', description: 'Juknis dan format proposal hibah pemuda' },
        { id: 'att-3', name: 'Format_RAB_Dispora.xlsx', sizeKb: 180, type: 'XLSX', description: 'Template excel rancangan anggaran biaya' }
      ],
      fileSuratName: 'Surat_Dispora_Sosialisasi_Hibah.pdf',
      createdAt: `${y}-${m}-04T10:15:00.000Z`,
      updatedAt: `${y}-${m}-04T10:15:00.000Z`,
    },
    {
      id: 'sm-03',
      nomorSurat: `B/34/X/2026/Sektor-Jtw`,
      tanggalSurat: `${y}-${m}-05`,
      tanggalDiterima: `${y}-${m}-06`,
      pengirim: 'Kapolsek Jatiuwung Kompol Hendra',
      instansi: 'Kepolisian Sektor Jatiuwung',
      perihal: 'Permohonan Kerjasama Sosialisasi Bahaya Tawuran & Penyalahgunaan Narkoba',
      jenisSurat: 'Permohonan',
      sifatSurat: 'Penting',
      tujuanDisposisi: 'Seksi Keamanan & Seksi Humas',
      ringkasanIsi: 'Polsek Jatiuwung mengajak Karang Taruna Manis Jaya berkolaborasi menggelar patroli dialogis dan sosialisasi kamtibmas di kalangan remaja dan karang taruna unit RT.',
      petugasPenerima: 'Ahmad Fauzi (Admin)',
      status: 'Menunggu Balasan',
      disposisiId: 'disp-02',
      lampiran: [
        { id: 'att-4', name: 'Materi_Penyuluhan_Kamtibmas.pdf', sizeKb: 890, type: 'PDF', description: 'Draft paparan materi pencegahan kenakalan remaja' }
      ],
      fileSuratName: 'Permohonan_Kolaborasi_Polsek_Jatiuwung.pdf',
      createdAt: `${y}-${m}-06T14:00:00.000Z`,
      updatedAt: `${y}-${m}-06T14:00:00.000Z`,
    },
    {
      id: 'sm-04',
      nomorSurat: `012/RW-05/MJ/${y}`,
      tanggalSurat: `${y}-${m}-07`,
      tanggalDiterima: `${y}-${m}-08`,
      pengirim: 'H. Sudrajat (Ketua RW 05)',
      instansi: 'Pengurus RW 05 Kelurahan Manis Jaya',
      perihal: 'Permohonan Bantuan Personil Pengamanan dan Tenda Posko Kesehatan',
      jenisSurat: 'Permohonan',
      sifatSurat: 'Biasa',
      tujuanDisposisi: 'Seksi Perlengkapan & Satgas',
      ringkasanIsi: 'Permohonan pinjam pakai 1 unit tenda kerucut dan 4 personil pemuda untuk mendukung kegiatan posyandu lansia dan pemeriksaan gula darah gratis di balai warga RW 05.',
      petugasPenerima: 'Dinda Kirana (Sekretariat)',
      status: 'Selesai',
      disposisiId: 'disp-03',
      lampiran: [
        { id: 'att-5', name: 'Surat_RW05_Pengajuan_Tenda.jpg', sizeKb: 420, type: 'JPG', description: 'Scan surat tanda tangan Ketua RW 05' }
      ],
      fileSuratName: 'Surat_Permohonan_RW05.pdf',
      createdAt: `${y}-${m}-08T09:20:00.000Z`,
      updatedAt: `${y}-${m}-08T16:00:00.000Z`,
    },
    {
      id: 'sm-05',
      nomorSurat: `RAHASIA/002/PAN-PIL/${y}`,
      tanggalSurat: `${y}-${m}-09`,
      tanggalDiterima: `${y}-${m}-10`,
      pengirim: 'Panitia Pemilihan Lembaga Kemasyarakatan',
      instansi: 'Kelurahan Manis Jaya',
      perihal: 'Verifikasi Berkas Calon Anggota LPM Utusan Pemuda',
      jenisSurat: 'Surat tugas',
      sifatSurat: 'Rahasia',
      tujuanDisposisi: 'Ketua Umum',
      ringkasanIsi: 'Permintaan berkas resmi pengusulan calon keterwakilan pemuda di Lembaga Pemberdayaan Masyarakat (LPM) Kelurahan Manis Jaya.',
      petugasPenerima: 'Muhammad Ryan Pratama (Ketua Umum)',
      status: 'Belum Diproses',
      lampiran: [
        { id: 'att-6', name: 'Formulir_Calon_LPM.docx', sizeKb: 95, type: 'DOCX', description: 'Format biodata calon' }
      ],
      fileSuratName: 'Surat_Rahasia_Verifikasi_LPM.pdf',
      createdAt: `${y}-${m}-10T11:45:00.000Z`,
      updatedAt: `${y}-${m}-10T11:45:00.000Z`,
    },
  ];
};

export const getInitialSuratKeluarData = (): SuratKeluarItem[] => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');

  return [
    {
      id: 'sk-01',
      nomorSurat: `UND/045/KT-MJ/X/${y}`,
      tanggalSurat: `${y}-${m}-05`,
      tujuan: 'Ketua RW 01 s/d RW 08 & Tokoh Pemuda',
      namaPenerima: 'Bapak/Ibu Ketua RW',
      instansi: 'Wilayah RW 01 - RW 08 Manis Jaya',
      alamat: 'Kelurahan Manis Jaya, Jatiuwung - Kota Tangerang',
      perihal: 'Undangan Rapat Koordinasi Kepemudaan & Evaluasi Triwulan',
      jenisSurat: 'Undangan',
      sifatSurat: 'Penting',
      isiSurat: 'Mengharap kehadiran Bapak/Ibu serta koordinator pemuda pada Rapat Koordinasi hari Sabtu di Balai Warga RW 04 guna membahas rangkaian peringatan Hari Sumpah Pemuda.',
      tembusan: ['Lurah Manis Jaya (sebagai Pembina)', 'Ketua LPM Manis Jaya', 'Arsip Sekretariat'],
      penandatangan: [
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
      stempelOrganisasi: true,
      status: 'Terkirim',
      filePdfGenerated: true,
      lampiran: [
        { id: 'att-k1', name: 'Susunan_Acara_Rakor.pdf', sizeKb: 210, type: 'PDF' }
      ],
      templateUsed: 'tmpl-undangan',
      createdAt: `${y}-${m}-05T09:00:00.000Z`,
      updatedAt: `${y}-${m}-05T11:30:00.000Z`,
    },
    {
      id: 'sk-02',
      nomorSurat: `PMH/046/KT-MJ/X/${y}`,
      tanggalSurat: `${y}-${m}-08`,
      tujuan: 'Bapak Lurah Manis Jaya',
      namaPenerima: 'Drs. H. Ujang Suherman',
      instansi: 'Kantor Kelurahan Manis Jaya',
      alamat: 'Jl. Raya Industri Manis No. 1, Kec. Jatiuwung',
      perihal: 'Permohonan Izin Tempat dan Fasilitas Aula Kelurahan',
      jenisSurat: 'Permohonan',
      sifatSurat: 'Penting',
      isiSurat: 'Permohonan izin pemakaian Aula Kelurahan dan sound system untuk Pelatihan Kewirausahaan Pemuda Mandiri pada hari Minggu, 18 Oktober 2026.',
      tembusan: ['Sekretaris Kelurahan', 'Kasi Kemasyarakatan', 'Arsip'],
      penandatangan: [
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
      stempelOrganisasi: true,
      status: 'Ditandatangani',
      filePdfGenerated: true,
      lampiran: [
        { id: 'att-k2', name: 'Proposal_Pelatihan_Pemuda.pdf', sizeKb: 1450, type: 'PDF' }
      ],
      templateUsed: 'tmpl-permohonan',
      createdAt: `${y}-${m}-08T13:10:00.000Z`,
      updatedAt: `${y}-${m}-08T14:40:00.000Z`,
    },
    {
      id: 'sk-03',
      nomorSurat: `ST/047/KT-MJ/X/${y}`,
      tanggalSurat: `${y}-${m}-10`,
      tujuan: 'Rendy Saputra dkk (Delegasi)',
      namaPenerima: 'Rendy Saputra & Tim',
      instansi: 'Pengurus Karang Taruna Kelurahan Manis Jaya',
      alamat: 'Manis Jaya, Jatiuwung',
      perihal: 'Surat Tugas Delegasi Jambore Bhakti Pemuda Tingkat Kota',
      jenisSurat: 'Surat tugas',
      sifatSurat: 'Segera',
      isiSurat: 'Memberikan tugas kepada 3 pengurus untuk menjadi delegasi resmi perwakilan Karang Taruna Kelurahan Manis Jaya pada Jambore Bhakti Pemuda di Kitri Bakti.',
      tembusan: ['Ketua Karang Taruna Kota Tangerang', 'Arsip'],
      penandatangan: [
        {
          nama: 'Muhammad Ryan Pratama, S.Kom.',
          jabatan: 'Ketua Umum',
          ktaNo: 'KT-MJ-2024-001',
          includeStamp: true,
        },
      ],
      stempelOrganisasi: true,
      status: 'Menunggu TTD',
      filePdfGenerated: false,
      lampiran: [],
      templateUsed: 'tmpl-tugas',
      createdAt: `${y}-${m}-10T10:00:00.000Z`,
      updatedAt: `${y}-${m}-10T10:00:00.000Z`,
    },
    {
      id: 'sk-04',
      nomorSurat: `SPT/048/KT-MJ/X/${y}`,
      tanggalSurat: `${y}-${m}-12`,
      tujuan: 'Ketua RW 01 - RW 08',
      namaPenerima: 'Seluruh Ketua RW & RT',
      instansi: 'Kelurahan Manis Jaya',
      alamat: 'Kecamatan Jatiuwung, Kota Tangerang',
      perihal: 'Pemberitahuan Pelaksanaan Aksi Gotong Royong Pemuda',
      jenisSurat: 'Pemberitahuan',
      sifatSurat: 'Biasa',
      isiSurat: 'Pemberitahuan pelaksanaan gotong royong terpadu membersihkan saluran drainase dan sanitasi lingkungan permukiman serentak pada tanggal 25 Oktober 2026.',
      tembusan: ['Lurah Manis Jaya', 'Puskesmas Manis Jaya', 'Arsip'],
      penandatangan: [
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
      stempelOrganisasi: true,
      status: 'Draft',
      filePdfGenerated: false,
      lampiran: [],
      templateUsed: 'tmpl-pemberitahuan',
      createdAt: `${y}-${m}-12T09:15:00.000Z`,
      updatedAt: `${y}-${m}-12T09:15:00.000Z`,
    },
  ];
};

export const getInitialDisposisiData = (): DisposisiItem[] => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');

  // helper for deadline
  const dTomorrow = new Date(now);
  dTomorrow.setDate(now.getDate() + 2);
  const deadline1 = dTomorrow.toISOString().split('T')[0];

  const dNextWeek = new Date(now);
  dNextWeek.setDate(now.getDate() + 5);
  const deadline2 = dNextWeek.toISOString().split('T')[0];

  return [
    {
      id: 'disp-01',
      nomorDisposisi: `DSP/001/X/${y}`,
      tanggalDisposisi: `${y}-${m}-02`,
      suratMasukId: 'sm-01',
      nomorSuratMasuk: `005/142-Kel.MJ/${y}`,
      perihalSuratMasuk: 'Undangan Rapat Koordinasi Wilayah & Pembahasan Penataan Lingkungan RW',
      instansiSuratMasuk: 'Kantor Kelurahan Manis Jaya',
      dari: 'Muhammad Ryan Pratama (Ketua Umum)',
      kepada: 'Dinda Kirana (Sekretaris) & Rendy Saputra (Wakil Ketua)',
      instruksi: 'Hadiri / Wakili',
      batasWaktu: deadline1,
      catatan: 'Harap hadir mewakili Ketua Umum karena bertepatan dengan dinas kerja, bawa draft usulan titik penghijauan pemuda.',
      status: 'Dikerjakan',
      createdAt: `${y}-${m}-02T09:00:00.000Z`,
    },
    {
      id: 'disp-02',
      nomorDisposisi: `DSP/002/X/${y}`,
      tanggalDisposisi: `${y}-${m}-06`,
      suratMasukId: 'sm-03',
      nomorSuratMasuk: `B/34/X/2026/Sektor-Jtw`,
      perihalSuratMasuk: 'Permohonan Kerjasama Sosialisasi Bahaya Tawuran & Penyalahgunaan Narkoba',
      instansiSuratMasuk: 'Kepolisian Sektor Jatiuwung',
      dari: 'Muhammad Ryan Pratama (Ketua Umum)',
      kepada: 'Koordinator Seksi Hubungan Masyarakat & Seksi Keamanan',
      instruksi: 'Koordinasikan dengan bidang terkait',
      batasWaktu: deadline2,
      catatan: 'Segera agendakan pertemuan teknis dengan Kanit Binmas Polsek Jatiuwung, siapkan draft surat balasan kesiapan waktu.',
      status: 'Menunggu',
      createdAt: `${y}-${m}-06T15:00:00.000Z`,
    },
    {
      id: 'disp-03',
      nomorDisposisi: `DSP/003/X/${y}`,
      tanggalDisposisi: `${y}-${m}-08`,
      suratMasukId: 'sm-04',
      nomorSuratMasuk: `012/RW-05/MJ/${y}`,
      perihalSuratMasuk: 'Permohonan Bantuan Personil Pengamanan dan Tenda Posko Kesehatan',
      instansiSuratMasuk: 'Pengurus RW 05 Kelurahan Manis Jaya',
      dari: 'Muhammad Ryan Pratama (Ketua Umum)',
      kepada: 'Seksi Perlengkapan & Satgas Lingkungan',
      instruksi: 'Tindak lanjuti segera',
      batasWaktu: `${y}-${m}-09`,
      catatan: 'Pinjamkan 1 unit tenda dan tugaskan 4 anggota pemuda RW 05 standby mendampingi lansia.',
      status: 'Selesai',
      tanggalSelesai: `${y}-${m}-08`,
      catatanPenyelesaian: 'Tenda telah terpasang di balai RW 05 dan 4 personil pemuda telah bertugas.',
      createdAt: `${y}-${m}-08T10:00:00.000Z`,
    },
  ];
};

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
