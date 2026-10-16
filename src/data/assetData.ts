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
  jumlah?: number;
  satuan?: string;
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

// Data Aset & Inventaris: Bersih & kosong saat peluncuran sistem
export const INITIAL_ASSETS: AssetItem[] = [];
export const INITIAL_PEMINJAMAN: PeminjamanAsset[] = [];
export const INITIAL_MUTASI_SERVIS: MutasiPemeliharaanAsset[] = [];
export const INITIAL_PENGADAAN: PengadaanAsset[] = [];
export const INITIAL_PENGHAPUSAN: PenghapusanAsset[] = [];
export const INITIAL_STOCK_OPNAME: StockOpnameItem[] = [];
export const INITIAL_DOKUMEN_ASSET: DokumenAsset[] = [];
