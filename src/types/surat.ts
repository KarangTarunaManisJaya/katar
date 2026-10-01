export type SifatSurat = 'Biasa' | 'Penting' | 'Segera' | 'Rahasia';

export type JenisSurat =
  | 'Undangan'
  | 'Permohonan'
  | 'Pemberitahuan'
  | 'Surat tugas'
  | 'Surat keterangan'
  | 'Surat rekomendasi'
  | 'Surat pengantar'
  | 'Surat keputusan'
  | 'Surat pernyataan'
  | 'Berita acara'
  | 'Surat lainnya';

export type StatusSuratMasuk =
  | 'Belum Diproses'
  | 'Diproses/Didisposisi'
  | 'Menunggu Balasan'
  | 'Selesai';

export type StatusSuratKeluar =
  | 'Draft'
  | 'Menunggu TTD'
  | 'Ditandatangani'
  | 'Terkirim'
  | 'Diarsipkan';

export type StatusDisposisi = 'Menunggu' | 'Dikerjakan' | 'Selesai';

export type InstruksiDisposisi =
  | 'Tindak lanjuti segera'
  | 'Hadiri / Wakili'
  | 'Pelajari & beri masukan'
  | 'Siapkan konsep surat balasan'
  | 'Koordinasikan dengan bidang terkait'
  | 'Arsipkan & catat'
  | 'Lainnya';

export interface SuratAttachment {
  id: string;
  name: string;
  sizeKb: number;
  type: 'PDF' | 'DOCX' | 'JPG' | 'XLSX';
  description?: string;
  url?: string;
}

export interface PenandatanganInfo {
  nama: string;
  jabatan: 'Ketua Umum' | 'Sekretaris Umum' | 'Bendahara' | 'Ketua Panitia' | 'Pengurus Lainnya';
  ktaNo?: string;
  digitalSignatureUrl?: string;
  includeStamp?: boolean;
}

export interface SuratMasukItem {
  id: string;
  nomorSurat: string; // Nomor resmi dari instansi luar
  tanggalSurat: string; // YYYY-MM-DD
  tanggalDiterima: string; // YYYY-MM-DD
  pengirim: string; // Nama pribadi/jabatan
  instansi: string; // Instansi/organisasi asal
  perihal: string;
  jenisSurat: JenisSurat;
  sifatSurat: SifatSurat;
  tujuanDisposisi: string; // misal: "Ketua Umum", "Sekretaris"
  ringkasanIsi: string;
  lampiran: SuratAttachment[];
  fileSuratName?: string;
  fileSuratUrl?: string;
  petugasPenerima: string; // Akun yang menginput
  status: StatusSuratMasuk;
  catatan?: string;
  disposisiId?: string; // id lembar disposisi jika ada
  createdAt: string;
  updatedAt: string;
}

export interface SuratKeluarItem {
  id: string;
  nomorSurat: string; // Nomor otomatis sistem
  tanggalSurat: string; // YYYY-MM-DD
  tujuan: string; // Kepada Yth.
  namaPenerima: string;
  instansi: string;
  alamat: string;
  perihal: string;
  jenisSurat: JenisSurat;
  sifatSurat: SifatSurat;
  isiSurat: string;
  tembusan?: string[];
  lampiran: SuratAttachment[];
  penandatangan: PenandatanganInfo[];
  stempelOrganisasi: boolean;
  status: StatusSuratKeluar;
  filePdfGenerated?: boolean;
  templateUsed?: string;
  keterangan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisposisiItem {
  id: string;
  nomorDisposisi: string;
  tanggalDisposisi: string; // YYYY-MM-DD
  suratMasukId: string;
  nomorSuratMasuk: string;
  perihalSuratMasuk: string;
  instansiSuratMasuk: string;
  dari: string; // misal: Muhammad Ryan Pratama (Ketua Umum)
  kepada: string; // misal: Dinda Kirana (Sekretaris) atau Seksi Pemuda
  instruksi: InstruksiDisposisi;
  batasWaktu: string; // YYYY-MM-DD
  catatan: string;
  status: StatusDisposisi;
  tanggalSelesai?: string;
  catatanPenyelesaian?: string;
  createdAt: string;
}

export interface NumberingConfig {
  prefix: string; // 'KT-MJ'
  nomorAwal: number; // 1
  counterSaatIni: number; // 42
  kodeSuratMap: Record<JenisSurat, string>;
  formatBulan: 'romawi' | 'dua_digit' | 'satu_digit'; // misal 'romawi' -> X
  formatTahun: '4_digit' | '2_digit'; // '2026' or '26'
  jumlahDigit: number; // 3 -> '042', 4 -> '0042'
  resetAturan: 'tahunan' | 'bulanan' | 'tidak_pernah';
  lastResetPeriod: string; // '2026' or '2026-10'
}

export interface TemplateSuratPreset {
  id: string;
  nama: string;
  jenisSurat: JenisSurat;
  deskripsi: string;
  defaultPerihal: string;
  defaultIsi: string;
  defaultTujuan: string;
  defaultInstansi: string;
  defaultAlamat: string;
  defaultPenandatangan: PenandatanganInfo[];
}
