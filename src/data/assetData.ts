export type KategoriAsset =
  | 'Elektronik'
  | 'Komputer & IT'
  | 'Furniture'
  | 'Peralatan Kegiatan'
  | 'Peralatan Olahraga'
  | 'Kendaraan'
  | 'Sound System'
  | 'Dokumentasi'
  | 'Peralatan Kantor'
  | 'Perlengkapan Sekretariat';

export type LokasiAsset =
  | 'Sekretariat'
  | 'Gudang'
  | 'Aula'
  | 'Lapangan'
  | 'Ruang Ketua'
  | 'Ruang Administrasi'
  | 'Lokasi lainnya';

export type KondisiAsset =
  | 'Baik / Aktif'
  | 'Rusak Ringan'
  | 'Rusak Berat'
  | 'Sedang Dipinjam'
  | 'Perlu Pemeliharaan'
  | 'Hilang';

export interface AssetItem {
  id: string;
  kodeAsset: string;
  namaAsset: string;
  kategori: KategoriAsset;
  merkType: string;
  nomorSeri: string;
  tahunPerolehan: number;
  tanggalPerolehan: string; // YYYY-MM-DD
  sumberDana: string;
  hargaPerolehan: number;
  kondisi: KondisiAsset;
  lokasi: LokasiAsset;
  penanggungJawab: string;
  fotoAsset?: string;
  keterangan: string;
}

export interface PeminjamanAsset {
  id: string;
  nomorPinjam: string;
  namaPeminjam: string;
  kontakPeminjam: string;
  assetId: string;
  namaAsset: string;
  tanggalPinjam: string;
  rencanaKembali: string;
  tanggalPengembalian?: string;
  kondisiSaatKeluar: string;
  kondisiSaatKembali?: string;
  statusPeminjaman: 'Menunggu Persetujuan' | 'Disetujui / Dipinjam' | 'Dikembalikan' | 'Ditolak';
  keperluan: string;
}

export interface MutasiPemeliharaanAsset {
  id: string;
  tipe: 'Mutasi Lokasi' | 'Pemeliharaan / Servis';
  assetId: string;
  namaAsset: string;
  lokasiAsal: LokasiAsset;
  lokasiTujuan: LokasiAsset;
  penanggungJawabLama: string;
  penanggungJawabBaru: string;
  tanggal: string;
  biaya: number;
  alasan: string;
  keterangan: string;
  status: 'Dalam Proses' | 'Selesai';
}

export interface PengadaanAsset {
  id: string;
  nomorPengadaan: string;
  pengusul: string;
  namaAsset: string;
  kategori: KategoriAsset;
  jumlah: number;
  estimasiHarga: number;
  sumberDana: string;
  vendor: string;
  tanggalPengajuan: string;
  statusPengadaan: 'Draft' | 'Diajukan' | 'Disetujui' | 'Dalam Pengadaan' | 'Selesai Diterima';
}

export interface PenghapusanAsset {
  id: string;
  nomorBA: string;
  assetId: string;
  namaAsset: string;
  kodeAsset: string;
  alasan: 'Rusak berat' | 'Hilang' | 'Tidak layak digunakan' | 'Dijual' | 'Dihibahkan' | 'Sudah tidak diperlukan';
  persetujuanOleh: string;
  tanggalPenghapusan: string;
  nilaiAsetSaatDihapus: number;
  keterangan: string;
}

export interface StockOpnameItem {
  id: string;
  kodeAsset: string;
  namaAsset: string;
  dataSistem: {
    lokasi: LokasiAsset;
    kondisi: KondisiAsset;
  };
  hasilPemeriksaan: 'Sesuai' | 'Selisih Lokasi' | 'Selisih Kondisi' | 'Tidak Ditemukan';
  kondisiFisik: KondisiAsset;
  lokasiSebenarnya: LokasiAsset;
  selisih: number;
  keterangan: string;
  petugasPemeriksa: string;
  tanggalPemeriksaan: string;
}

export interface DokumenAsset {
  id: string;
  assetId: string;
  namaAsset: string;
  jenisDokumen: 'Faktur' | 'Kwitansi' | 'Nota pembelian' | 'Sertifikat' | 'Garansi' | 'BAST' | 'Berita acara' | 'Foto asset' | 'Dokumen penghapusan';
  nomorDokumen: string;
  tanggalDokumen: string;
  keterangan: string;
  fileUrl?: string;
}

export const KATEGORI_LIST: KategoriAsset[] = [
  'Elektronik',
  'Komputer & IT',
  'Furniture',
  'Peralatan Kegiatan',
  'Peralatan Olahraga',
  'Kendaraan',
  'Sound System',
  'Dokumentasi',
  'Peralatan Kantor',
  'Perlengkapan Sekretariat',
];

export const LOKASI_LIST: LokasiAsset[] = [
  'Sekretariat',
  'Gudang',
  'Aula',
  'Lapangan',
  'Ruang Ketua',
  'Ruang Administrasi',
  'Lokasi lainnya',
];

export const KONDISI_LIST: KondisiAsset[] = [
  'Baik / Aktif',
  'Rusak Ringan',
  'Rusak Berat',
  'Sedang Dipinjam',
  'Perlu Pemeliharaan',
  'Hilang',
];

export const INITIAL_ASSETS: AssetItem[] = [
  {
    id: 'ast-1',
    kodeAsset: 'AST-SND-2024-001',
    namaAsset: 'Portable Wireless Sound System + 2 Mic',
    kategori: 'Sound System',
    merkType: 'Baretone BT-3H1515BWR 15 Inch',
    nomorSeri: 'SN-BRT-882910',
    tahunPerolehan: 2024,
    tanggalPerolehan: '2024-03-15',
    sumberDana: 'Dana Bantuan Kelurahan / APBDes',
    hargaPerolehan: 3850000,
    kondisi: 'Baik / Aktif',
    lokasi: 'Sekretariat',
    penanggungJawab: 'Ahmad Fauzi (Seksi Perlengkapan)',
    fotoAsset: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=60',
    keterangan: 'Digunakan untuk senam bersama, baksos, dan rapat umum warga.',
  },
  {
    id: 'ast-2',
    kodeAsset: 'AST-KOM-2023-002',
    namaAsset: 'Laptop Lenovo IdeaPad 3 Core i5',
    kategori: 'Komputer & IT',
    merkType: 'Lenovo IdeaPad 3 14ITL6',
    nomorSeri: 'PF3E982K',
    tahunPerolehan: 2023,
    tanggalPerolehan: '2023-06-20',
    sumberDana: 'Kas Karang Taruna Kelurahan',
    hargaPerolehan: 7900000,
    kondisi: 'Baik / Aktif',
    lokasi: 'Ruang Administrasi',
    penanggungJawab: 'Anisa Rahmawati (Sekretaris)',
    fotoAsset: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=60',
    keterangan: 'Komputer operasional pembuatan surat-menyurat dan database anggota.',
  },
  {
    id: 'ast-3',
    kodeAsset: 'AST-DOK-2024-003',
    namaAsset: 'Kamera Mirrorless Sony Alpha A6400',
    kategori: 'Dokumentasi',
    merkType: 'Sony A6400 Kit 16-50mm OSS',
    nomorSeri: 'SN-SNY-443901',
    tahunPerolehan: 2024,
    tanggalPerolehan: '2024-01-10',
    sumberDana: 'Sponsorship & Mitra Swasta',
    hargaPerolehan: 12500000,
    kondisi: 'Sedang Dipinjam',
    lokasi: 'Sekretariat',
    penanggungJawab: 'Dewi Lestari (Divisi Humas & Dokumentasi)',
    fotoAsset: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=60',
    keterangan: 'Dipinjam oleh Tim Media Manis Jaya untuk liputan peliputan turnamen futsal.',
  },
  {
    id: 'ast-4',
    kodeAsset: 'AST-KTR-2023-004',
    namaAsset: 'Printer Epson All-in-One InkTank L3210',
    kategori: 'Peralatan Kantor',
    merkType: 'Epson EcoTank L3210',
    nomorSeri: 'EPS-L3210-9932',
    tahunPerolehan: 2023,
    tanggalPerolehan: '2023-08-14',
    sumberDana: 'Kas Karang Taruna Kelurahan',
    hargaPerolehan: 2350000,
    kondisi: 'Perlu Pemeliharaan',
    lokasi: 'Ruang Administrasi',
    penanggungJawab: 'Dimas Wicaksono',
    fotoAsset: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=60',
    keterangan: 'Head print warna merah bergaris, dijadwalkan servis pembersihan pekan depan.',
  },
  {
    id: 'ast-5',
    kodeAsset: 'AST-OLR-2024-005',
    namaAsset: 'Set Meja Tenis Meja Standar PTMSI + Net',
    kategori: 'Peralatan Olahraga',
    merkType: 'Shifu Super Spin 25mm',
    nomorSeri: 'TM-PTMSI-092',
    tahunPerolehan: 2024,
    tanggalPerolehan: '2024-05-18',
    sumberDana: 'Swadaya & Donasi Warga',
    hargaPerolehan: 4600000,
    kondisi: 'Baik / Aktif',
    lokasi: 'Aula',
    penanggungJawab: 'Rian Hidayat (Seksi Olahraga)',
    fotoAsset: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=600&auto=format&fit=crop&q=60',
    keterangan: 'Tersedia 4 bet dan 1 tabung bola di lemari aula.',
  },
  {
    id: 'ast-6',
    kodeAsset: 'AST-KGT-2022-006',
    namaAsset: 'Tenda Terop Lipat Ukuran 3x6 Meter',
    kategori: 'Peralatan Kegiatan',
    merkType: 'Gazebo Hexagon Heavy Duty',
    nomorSeri: 'TND-GZ-3601',
    tahunPerolehan: 2022,
    tanggalPerolehan: '2022-11-05',
    sumberDana: 'Kas Karang Taruna Kelurahan',
    hargaPerolehan: 2900000,
    kondisi: 'Rusak Ringan',
    lokasi: 'Gudang',
    penanggungJawab: 'Budi Santoso (Logistik)',
    fotoAsset: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&auto=format&fit=crop&q=60',
    keterangan: 'Kaki rangka sebelah kiri sedikit bengkok, masih bisa digunakan untuk stan bazaar.',
  },
  {
    id: 'ast-7',
    kodeAsset: 'AST-FUR-2023-007',
    namaAsset: 'Kursi Lipat Chitose Futura (50 Unit)',
    kategori: 'Furniture',
    merkType: 'Chitose FTR 405 Stainless',
    nomorSeri: 'LOT-CHITOSE-50U',
    tahunPerolehan: 2023,
    tanggalPerolehan: '2023-02-10',
    sumberDana: 'Dana Bantuan Kelurahan / APBDes',
    hargaPerolehan: 11000000,
    kondisi: 'Baik / Aktif',
    lokasi: 'Gudang',
    penanggungJawab: 'Ahmad Fauzi',
    fotoAsset: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&auto=format&fit=crop&q=60',
    keterangan: '50 unit lengkap, tersimpan rapi pada rak penyimpanan gudang.',
  },
  {
    id: 'ast-8',
    kodeAsset: 'AST-KND-2021-008',
    namaAsset: 'Gerobak Motor Roda Tiga Viar Karya 150',
    kategori: 'Kendaraan',
    merkType: 'Viar Karya 150cc Bak Panjang',
    nomorSeri: 'B-3490-CKR',
    tahunPerolehan: 2021,
    tanggalPerolehan: '2021-09-01',
    sumberDana: 'Dana Bantuan Kelurahan / APBDes',
    hargaPerolehan: 28500000,
    kondisi: 'Baik / Aktif',
    lokasi: 'Sekretariat',
    penanggungJawab: 'Iik Andriyana (Ketua Karang Taruna)',
    fotoAsset: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=60',
    keterangan: 'Kendaraan operasional pengangkutan sampah kerja bakti dan logistik baksos kelurahan.',
  },
];

export const INITIAL_PEMINJAMAN: PeminjamanAsset[] = [
  {
    id: 'pmj-1',
    nomorPinjam: 'PJM/KT-MJ/X/2026/001',
    namaPeminjam: 'Panitia Turnamen Voli RW 04 (Sdr. Hendra)',
    kontakPeminjam: '0812-9871-2233',
    assetId: 'ast-1',
    namaAsset: 'Portable Wireless Sound System + 2 Mic',
    tanggalPinjam: '2026-10-04',
    rencanaKembali: '2026-10-06',
    kondisiSaatKeluar: 'Normal mulus, mic berfungsi baik baterai penuh',
    statusPeminjaman: 'Disetujui / Dipinjam',
    keperluan: 'Turnamen Bola Voli Antar RT memperebutkan Piala RW 04',
  },
  {
    id: 'pmj-2',
    nomorPinjam: 'PJM/KT-MJ/IX/2026/008',
    namaPeminjam: 'Remaja Masjid Al-Ikhlas (Sdr. Rahmat)',
    kontakPeminjam: '0857-4433-2211',
    assetId: 'ast-7',
    namaAsset: 'Kursi Lipat Chitose Futura (30 Unit)',
    tanggalPinjam: '2026-09-20',
    rencanaKembali: '2026-09-22',
    tanggalPengembalian: '2026-09-22',
    kondisiSaatKeluar: 'Lengkap 30 unit bersih',
    kondisiSaatKembali: 'Lengkap 30 unit, kondisi baik',
    statusPeminjaman: 'Dikembalikan',
    keperluan: 'Kajian Akbar Maulid Nabi Muhammad SAW',
  },
];

export const INITIAL_MUTASI_SERVIS: MutasiPemeliharaanAsset[] = [
  {
    id: 'mts-1',
    tipe: 'Pemeliharaan / Servis',
    assetId: 'ast-4',
    namaAsset: 'Printer Epson All-in-One InkTank L3210',
    lokasiAsal: 'Ruang Administrasi',
    lokasiTujuan: 'Sekretariat',
    penanggungJawabLama: 'Dimas Wicaksono',
    penanggungJawabBaru: 'Dimas Wicaksono',
    tanggal: '2026-09-28',
    biaya: 175000,
    alasan: 'Head cleaning nozzle and reset counter limbah tinta',
    keterangan: 'Servis resmi di Epson Authorized Service Cimone',
    status: 'Dalam Proses',
  },
  {
    id: 'mts-2',
    tipe: 'Mutasi Lokasi',
    assetId: 'ast-5',
    namaAsset: 'Set Meja Tenis Meja Standar PTMSI + Net',
    lokasiAsal: 'Gudang',
    lokasiTujuan: 'Aula',
    penanggungJawabLama: 'Budi Santoso',
    penanggungJawabBaru: 'Rian Hidayat',
    tanggal: '2026-08-15',
    biaya: 0,
    alasan: 'Persiapan latihan rutin pemuda menjelang turnamen',
    keterangan: 'Dipindahkan dan dirakit ulang di Aula serbaguna kelurahan',
    status: 'Selesai',
  },
];

export const INITIAL_PENGADAAN: PengadaanAsset[] = [
  {
    id: 'pgd-1',
    nomorPengadaan: 'PCD/KT-MJ/2026/004',
    pengusul: 'Fajar Maulana (Wakil Ketua)',
    namaAsset: 'Proyektor Epson EB-E01 XGA 3300 Lumens + Screen 70 Inch',
    kategori: 'Komputer & IT',
    jumlah: 1,
    estimasiHarga: 5800000,
    sumberDana: 'Dana Bantuan Kelurahan / APBDes',
    vendor: 'CV Media Teknologi Tangerang',
    tanggalPengajuan: '2026-09-25',
    statusPengadaan: 'Disetujui',
  },
  {
    id: 'pgd-2',
    nomorPengadaan: 'PCD/KT-MJ/2026/005',
    pengusul: 'Rian Hidayat (Seksi Olahraga)',
    namaAsset: 'Bola Futsal Molten F9V4800 Original (5 Buah)',
    kategori: 'Peralatan Olahraga',
    jumlah: 5,
    estimasiHarga: 1750000,
    sumberDana: 'Kas Karang Taruna Kelurahan',
    vendor: 'Toko Olahraga Juara Jaya Sport',
    tanggalPengajuan: '2026-09-29',
    statusPengadaan: 'Diajukan',
  },
];

export const INITIAL_PENGHAPUSAN: PenghapusanAsset[] = [
  {
    id: 'php-1',
    nomorBA: 'BA-HAPUS/KT-MJ/VIII/2026/001',
    assetId: 'ast-old-1',
    namaAsset: 'Kipas Angin Dinding Cosmos 16 Inch (Lama)',
    kodeAsset: 'AST-ELK-2018-099',
    alasan: 'Rusak berat',
    persetujuanOleh: 'Iik Andriyana (Ketua) & Bagus Tri Prakoso (Bendahara)',
    tanggalPenghapusan: '2026-08-10',
    nilaiAsetSaatDihapus: 0,
    keterangan: 'Dinamo terbakar dan baling-baling patah, biaya servis melebihi beli unit baru.',
  },
];

export const INITIAL_STOCK_OPNAME: StockOpnameItem[] = [
  {
    id: 'so-1',
    kodeAsset: 'AST-SND-2024-001',
    namaAsset: 'Portable Wireless Sound System + 2 Mic',
    dataSistem: { lokasi: 'Sekretariat', kondisi: 'Baik / Aktif' },
    hasilPemeriksaan: 'Sesuai',
    kondisiFisik: 'Baik / Aktif',
    lokasiSebenarnya: 'Sekretariat',
    selisih: 0,
    keterangan: 'Kondisi fisik bersih dan berfungsi normal.',
    petugasPemeriksa: 'Anisa Rahmawati & Budi Santoso',
    tanggalPemeriksaan: '2026-09-25',
  },
  {
    id: 'so-2',
    kodeAsset: 'AST-KOM-2023-002',
    namaAsset: 'Laptop Lenovo IdeaPad 3 Core i5',
    dataSistem: { lokasi: 'Ruang Administrasi', kondisi: 'Baik / Aktif' },
    hasilPemeriksaan: 'Sesuai',
    kondisiFisik: 'Baik / Aktif',
    lokasiSebenarnya: 'Ruang Administrasi',
    selisih: 0,
    keterangan: 'Charger & mouse lengkap berfungsi.',
    petugasPemeriksa: 'Anisa Rahmawati & Budi Santoso',
    tanggalPemeriksaan: '2026-09-25',
  },
  {
    id: 'so-3',
    kodeAsset: 'AST-DOK-2024-003',
    namaAsset: 'Kamera Mirrorless Sony Alpha A6400',
    dataSistem: { lokasi: 'Sekretariat', kondisi: 'Sedang Dipinjam' },
    hasilPemeriksaan: 'Sesuai',
    kondisiFisik: 'Baik / Aktif',
    lokasiSebenarnya: 'Sekretariat',
    selisih: 0,
    keterangan: 'Fisik sedang dipinjam tim dokumentasi, ada bukti form peminjaman.',
    petugasPemeriksa: 'Anisa Rahmawati & Budi Santoso',
    tanggalPemeriksaan: '2026-09-25',
  },
];

export const INITIAL_DOKUMEN_ASSET: DokumenAsset[] = [
  {
    id: 'dok-1',
    assetId: 'ast-1',
    namaAsset: 'Portable Wireless Sound System + 2 Mic',
    jenisDokumen: 'Faktur',
    nomorDokumen: 'INV-2024/03/9921',
    tanggalDokumen: '2024-03-15',
    keterangan: 'Faktur pembelian toko elektronik Tangerang Sound Center.',
  },
  {
    id: 'dok-2',
    assetId: 'ast-2',
    namaAsset: 'Laptop Lenovo IdeaPad 3 Core i5',
    jenisDokumen: 'Garansi',
    nomorDokumen: 'WAR-LNV-88219-ID',
    tanggalDokumen: '2023-06-20',
    keterangan: 'Kartu garansi resmi Lenovo Indonesia 2 Tahun Onsite Service.',
  },
  {
    id: 'dok-3',
    assetId: 'ast-8',
    namaAsset: 'Gerobak Motor Roda Tiga Viar Karya 150',
    jenisDokumen: 'BAST',
    nomorDokumen: 'BAST/KEL-MJ/IX/2021/014',
    tanggalDokumen: '2021-09-01',
    keterangan: 'Berita Acara Serah Terima Hibah Kendaraan Operasional dari Kelurahan Manis Jaya.',
  },
];
