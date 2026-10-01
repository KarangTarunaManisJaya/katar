export type ProposalCategory =
  | 'Sosial & Kemasyarakatan'
  | 'Keagamaan'
  | 'Pendidikan'
  | 'Olahraga'
  | 'Kepemudaan'
  | 'Lingkungan'
  | 'Seni & Budaya'
  | 'Kewirausahaan'
  | 'Kesehatan'
  | 'Perlombaan'
  | 'Hari Besar Nasional'
  | 'Lainnya';

export type ProposalType =
  | 'Kegiatan'
  | 'Pengadaan/Sarana'
  | 'Kemitraan/Sponsorship'
  | 'Bantuan Dana'
  | 'Kerjasama';

export type ProposalStatus =
  | 'Draft'
  | 'Menunggu Persetujuan'
  | 'Disetujui'
  | 'Ditolak'
  | 'Revisi'
  | 'Selesai/Terlaksana';

export interface RABItem {
  id: string;
  category:
    | 'Kesekretariatan'
    | 'Acara & Panggung'
    | 'Konsumsi'
    | 'Perlengkapan & Sound'
    | 'Publikasi & Dokumentasi'
    | 'Hadiah & Piala'
    | 'Transportasi & Logistik'
    | 'Biaya Tak Terduga';
  name: string;
  volume: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  notes?: string;
}

export type DanaSourceType =
  | 'Kas Karang Taruna'
  | 'Swadaya Masyarakat'
  | 'Donatur'
  | 'Sponsor'
  | 'Pemerintah Desa/Kelurahan'
  | 'Kecamatan'
  | 'Perusahaan/CSR'
  | 'Bantuan Lainnya';

export interface DanaSourceItem {
  id: string;
  source: DanaSourceType;
  targetAmount: number;
  receivedAmount: number;
  status: 'Rencana' | 'Diajukan' | 'Diterima' | 'Cair Sebagian';
  donorName?: string;
}

export interface Kepanitiaan {
  pelindung: string;
  penanggungJawab: string;
  ketuaPanitia: string;
  wakilKetua: string;
  sekretaris: string;
  bendahara: string;
  seksiAcara: string[];
  seksiHumas: string[];
  seksiKonsumsi: string[];
  seksiPerlengkapan: string[];
  seksiDokumentasi: string[];
  seksiKeamanan: string[];
  seksiLainnya?: { namaSeksi: string; anggota: string[] }[];
}

export interface RundownItem {
  id: string;
  waktu: string;
  durasi: string;
  kegiatan: string;
  penanggungJawab: string;
  tempat: string;
}

export interface ProposalAttachment {
  id: string;
  type:
    | 'Surat Pengantar'
    | 'Surat Permohonan'
    | 'RAB'
    | 'Susunan Panitia'
    | 'Rundown'
    | 'Daftar Peserta'
    | 'Denah Lokasi'
    | 'Dokumentasi Pendukung'
    | 'Dokumen Lainnya';
  title: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  includedInPrint: boolean;
}

export interface ApprovalStage {
  role: 'Pembuat Draf' | 'Sekretaris' | 'Bendahara' | 'Ketua Karang Taruna' | 'Pembina / Lurah';
  officerName: string;
  officerTitle: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Catatan Revisi';
  date?: string;
  notes?: string;
  signatureUrl?: string;
}

export interface ProposalItem {
  id: string;
  nomorProposal: string;
  judul: string;
  jenis: ProposalType;
  kategori: ProposalCategory;
  tanggalProposal: string;
  tanggalKegiatan: string;
  tanggalSelesaiKegiatan?: string;
  lokasiKegiatan: string;
  penanggungJawab: string;
  bidangSeksi: string;
  status: ProposalStatus;
  jatuhTempo: string;
  coverImage?: string;
  latarBelakang: string;
  dasarKegiatan: string;
  namaKegiatan: string;
  tema: string;
  maksudDanTujuan: string;
  manfaat: string;
  bentukKegiatan: string;
  waktuDanTempat: string;
  targetPeserta: string;
  penutup: string;
  rabItems: RABItem[];
  totalAnggaran: number;
  danaSources: DanaSourceItem[];
  totalDanaTerkumpul: number;
  kepanitiaan: Kepanitiaan;
  rundownItems: RundownItem[];
  attachments: ProposalAttachment[];
  approvalStages: ApprovalStage[];
  stempelUrl?: string;
  linkedKasId?: string;
  linkedAgendaId?: string;
  linkedSuratId?: string;
  createdAt: string;
  updatedAt: string;
}
