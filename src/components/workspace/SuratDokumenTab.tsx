import React, { useState, useRef } from 'react';
import {
  FileText,
  Building2,
  Phone,
  Mail,
  Globe,
  Upload,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  Copy,
  Printer,
  Sliders,
  Shield,
  Layers,
  CheckCircle2,
  Trash2,
  Plus,
  Eye,
  Download,
  AlertTriangle,
  FolderOpen,
  Image,
  ExternalLink,
  ChevronRight,
  Hash,
  Award,
  FileCheck,
  X,
  FileCode,
} from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';

interface SuratDokumenTabProps {
  onToast: (msg: string) => void;
}

// Master Jenis Surat Type
interface MasterJenisSurat {
  id: string;
  nama: string;
  kode: string;
  deskripsi: string;
  retensi: string;
  aktif: boolean;
}

// Template Dokumen Type
interface TemplateDokumen {
  id: string;
  judul: string;
  kodeJenis: string;
  deskripsi: string;
  kategori: 'Surat' | 'Proposal' | 'Laporan' | 'Administrasi';
  sampleContent: string;
}

export const SuratDokumenTab: React.FC<SuratDokumenTabProps> = ({ onToast }) => {
  const { logoUrl } = useBranding();

  // Active section filter pill
  const [activeSection, setActiveSection] = useState<
    'semua' | 'identitas' | 'kop' | 'penomoran' | 'jenis' | 'template' | 'ttd' | 'cetak'
  >('semua');

  // =========================================================================
  // 1. IDENTITAS DOKUMEN STATE
  // =========================================================================
  const [namaOrganisasi, setNamaOrganisasi] = useState(
    () => localStorage.getItem('kt_doc_nama_org') || 'Pemerintah Kota Tangerang - Kecamatan Jatiuwung'
  );
  const [namaKarangTaruna, setNamaKarangTaruna] = useState(
    () => localStorage.getItem('kt_doc_nama_kt') || 'Karang Taruna Kelurahan Manis Jaya'
  );
  const [docLogoOrg, setDocLogoOrg] = useState(
    () => localStorage.getItem('kt_doc_logo_org') || logoUrl || '/src/assets/images/logo_karang_taruna_1790646270000.png'
  );
  const [docLogoTambahan, setDocLogoTambahan] = useState(
    () => localStorage.getItem('kt_doc_logo_tambahan') || ''
  );
  const [alamat, setAlamat] = useState(
    () => localStorage.getItem('kt_doc_alamat') || 'Jl. Manis Jaya Raya No. 12, RT 02 / RW 03'
  );
  const [desaKelurahan, setDesaKelurahan] = useState(
    () => localStorage.getItem('kt_doc_kelurahan') || 'Kelurahan Manis Jaya'
  );
  const [kecamatan, setKecamatan] = useState(
    () => localStorage.getItem('kt_doc_kecamatan') || 'Kecamatan Jatiuwung'
  );
  const [kabupatenKota, setKabupatenKota] = useState(
    () => localStorage.getItem('kt_doc_kota') || 'Kota Tangerang'
  );
  const [provinsi, setProvinsi] = useState(
    () => localStorage.getItem('kt_doc_provinsi') || 'Banten'
  );
  const [kodePos, setKodePos] = useState(
    () => localStorage.getItem('kt_doc_kodepos') || '15136'
  );
  const [telepon, setTelepon] = useState(
    () => localStorage.getItem('kt_doc_telepon') || '0812 8912 3450'
  );
  const [email, setEmail] = useState(
    () => localStorage.getItem('kt_doc_email') || 'sekretariat@karangtarunamanisjaya.id'
  );
  const [website, setWebsite] = useState(
    () => localStorage.getItem('kt_doc_website') || 'https://manisjaya.or.id'
  );

  // =========================================================================
  // 2. KOP SURAT STATE
  // =========================================================================
  const [aktifkanKop, setAktifkanKop] = useState(
    () => localStorage.getItem('kt_kop_aktif') !== 'false'
  );
  const [kopNamaOrg, setKopNamaOrg] = useState(
    () => localStorage.getItem('kt_kop_nama_org') || 'PENGURUS KARANG TARUNA KELURAHAN MANIS JAYA'
  );
  const [kopNamaWilayah, setKopNamaWilayah] = useState(
    () => localStorage.getItem('kt_kop_nama_wilayah') || 'KECAMATAN JATIUWUNG - KOTA TANGERANG'
  );
  const [kopAlamat, setKopAlamat] = useState(
    () => localStorage.getItem('kt_kop_alamat') || 'Sekretariat: Jl. Manis Jaya Raya No. 12, Kel. Manis Jaya, Kec. Jatiuwung 15136'
  );
  const [kopKontak, setKopKontak] = useState(
    () => localStorage.getItem('kt_kop_kontak') || 'Telp/WA: 0812 8912 3450 | Email: sekretariat@karangtarunamanisjaya.id'
  );
  const [kopGarisBawah, setKopGarisBawah] = useState(
    () => localStorage.getItem('kt_kop_garis_bawah') !== 'false'
  );
  const [jenisGaris, setJenisGaris] = useState<'ganda' | 'tunggal' | 'tebal' | 'putus'>(
    () => (localStorage.getItem('kt_kop_jenis_garis') as any) || 'ganda'
  );
  const [ketebalanGaris, setKetebalanGaris] = useState(
    () => localStorage.getItem('kt_kop_tebal_garis') || 'ganda_klasik'
  );
  const [ukuranLogo, setUkuranLogo] = useState<'kecil' | 'sedang' | 'besar'>(
    () => (localStorage.getItem('kt_kop_ukuran_logo') as any) || 'sedang'
  );
  const [jarakLogoTeks, setJarakLogoTeks] = useState<'rapat' | 'standar' | 'renggang'>(
    () => (localStorage.getItem('kt_kop_jarak_logo') as any) || 'standar'
  );

  // =========================================================================
  // 3. PENOMORAN SURAT STATE
  // =========================================================================
  const [prefixNomor, setPrefixNomor] = useState(
    () => localStorage.getItem('kt_no_prefix') || 'KT-MJ'
  );
  const [nomorUrutTerakhir, setNomorUrutTerakhir] = useState(
    () => Number(localStorage.getItem('kt_no_counter')) || 42
  );
  const [formatBulan, setFormatBulan] = useState<'romawi' | 'dua_digit' | 'satu_digit'>(
    () => (localStorage.getItem('kt_no_format_bulan') as any) || 'romawi'
  );
  const [formatTahun, setFormatTahun] = useState<'4_digit' | '2_digit'>(
    () => (localStorage.getItem('kt_no_format_tahun') as any) || '4_digit'
  );
  const [kodeOrgNomor, setKodeOrgNomor] = useState(
    () => localStorage.getItem('kt_no_kode_org') || 'KT-MJ'
  );
  const [sampleKodeJenis, setSampleKodeJenis] = useState('UND');
  const [jumlahDigitNomor, setJumlahDigitNomor] = useState(
    () => Number(localStorage.getItem('kt_no_digit')) || 4
  );
  const [resetTahun, setResetTahun] = useState(
    () => localStorage.getItem('kt_no_reset_tahun') !== 'false'
  );
  const [resetBulan, setResetBulan] = useState(
    () => localStorage.getItem('kt_no_reset_bulan') === 'true'
  );

  // Generate live preview sample number
  const getRomawiMonth = (monthIndex: number): string => {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return roman[monthIndex] || 'IX';
  };

  const currentMonthStr =
    formatBulan === 'romawi'
      ? getRomawiMonth(new Date().getMonth())
      : formatBulan === 'dua_digit'
      ? String(new Date().getMonth() + 1).padStart(2, '0')
      : String(new Date().getMonth() + 1);

  const currentYearStr =
    formatTahun === '4_digit'
      ? String(new Date().getFullYear())
      : String(new Date().getFullYear()).slice(-2);

  const formattedCounter = String(nomorUrutTerakhir).padStart(jumlahDigitNomor, '0');
  const generatedSampleNumber = `${formattedCounter}/${sampleKodeJenis}/${kodeOrgNomor}/${currentMonthStr}/${currentYearStr}`;

  // =========================================================================
  // 4. MASTER JENIS SURAT STATE
  // =========================================================================
  const [masterJenisSurat, setMasterJenisSurat] = useState<MasterJenisSurat[]>([
    { id: '1', nama: 'Surat Masuk', kode: 'SM', deskripsi: 'Pencatatan surat masuk dari pihak eksternal/warga', retensi: '5 Tahun', aktif: true },
    { id: '2', nama: 'Surat Keluar', kode: 'SK', deskripsi: 'Surat dinas keluar umum Karang Taruna', retensi: '5 Tahun', aktif: true },
    { id: '3', nama: 'Surat Undangan', kode: 'UND', deskripsi: 'Undangan rapat pengurus, turnamen, dan musyawarah', retensi: '3 Tahun', aktif: true },
    { id: '4', nama: 'Surat Keterangan', kode: 'SKET', deskripsi: 'Keterangan keaktifan anggota pemuda & domisili', retensi: '3 Tahun', aktif: true },
    { id: '5', nama: 'Surat Tugas', kode: 'ST', deskripsi: 'Penugasan kepanitiaan dan delegasi kegiatan', retensi: '3 Tahun', aktif: true },
    { id: '6', nama: 'Surat Keputusan', kode: 'SKep', deskripsi: 'Ketetapan resmi ketua dan musyawarah pemuda', retensi: 'Permanen', aktif: true },
    { id: '7', nama: 'Surat Permohonan', kode: 'SPm', deskripsi: 'Permohonan izin lokasi, sarana logistik, & pemateri', retensi: '3 Tahun', aktif: true },
    { id: '8', nama: 'Surat Pemberitahuan', kode: 'SPb', deskripsi: 'Pemberitahuan gotong royong dan jadwal kegiatan', retensi: '2 Tahun', aktif: true },
    { id: '9', nama: 'Surat Pengantar', kode: 'SPg', deskripsi: 'Pengantar berkas proposal ke kelurahan/sponsor', retensi: '3 Tahun', aktif: true },
    { id: '10', nama: 'Surat Rekomendasi', kode: 'SRek', deskripsi: 'Rekomendasi beasiswa atau pelatihan kepemudaan', retensi: '3 Tahun', aktif: true },
    { id: '11', nama: 'Surat Pernyataan', kode: 'SPn', deskripsi: 'Pernyataan kesediaan mematuhi kode etik organisasi', retensi: '5 Tahun', aktif: true },
    { id: '12', nama: 'Berita Acara', kode: 'BA', deskripsi: 'Notulen dan ketetapan hasil pemilihan / serah terima', retensi: 'Permanen', aktif: true },
    { id: '13', nama: 'Surat lainnya', kode: 'LAIN', deskripsi: 'Dokumen dan surat dinas khusus lainnya', retensi: '2 Tahun', aktif: true },
  ]);

  // Modal State for adding new master jenis surat
  const [showAddJenisModal, setShowAddJenisModal] = useState(false);
  const [newJenisNama, setNewJenisNama] = useState('');
  const [newJenisKode, setNewJenisKode] = useState('');
  const [newJenisDeskripsi, setNewJenisDeskripsi] = useState('');

  // =========================================================================
  // 5. TEMPLATE DOKUMEN STATE
  // =========================================================================
  const [templates, setTemplates] = useState<TemplateDokumen[]>([
    {
      id: 't-1',
      judul: 'Surat Undangan Rapat Kerja Pengurus',
      kodeJenis: 'UND',
      deskripsi: 'Format standar undangan musyawarah bulanan pengurus Karang Taruna se-Kelurahan Manis Jaya.',
      kategori: 'Surat',
      sampleContent: 'Dengan hormat,\nSehubungan dengan agenda evaluasi program kerja triwulan, kami mengundang rekan-rekan pengurus Karang Taruna Kelurahan Manis Jaya untuk hadir pada:\n\nHari/Tanggal: Sabtu, 04 Oktober 2026\nWaktu: 19.30 WIB - Selesai\nTempat: Aula Pertemuan Kelurahan Manis Jaya\nAgenda: Evaluasi Turnamen & Persiapan Bakti Sosial Pemuda',
    },
    {
      id: 't-2',
      judul: 'Surat Tugas Panitia Pelaksana Kegiatan',
      kodeJenis: 'ST',
      deskripsi: 'Surat mandat penugasan resmi panitia pelaksana kegiatan sosial & olahraga.',
      kategori: 'Surat',
      sampleContent: 'Memberikan tugas kepada nama-nama terlampir sebagai Panitia Pelaksana Turnamen Pemuda Manis Jaya Cup 2026 untuk mengkoordinasikan jalannya turnamen dari awal hingga penyerahan trofi.',
    },
    {
      id: 't-3',
      judul: 'Surat Keterangan Keaktifan Anggota',
      kodeJenis: 'SKET',
      deskripsi: 'Penerbitan surat bukti keaktifan pengurus untuk keperluan beasiswa, perkuliahan, atau pekerjaan.',
      kategori: 'Surat',
      sampleContent: 'Menerangkan bahwa Saudara/i yang namanya tercantum di bawah ini benar merupakan anggota aktif Karang Taruna Kelurahan Manis Jaya periode 2024-2027 dengan jabatan yang sah.',
    },
    {
      id: 't-4',
      judul: 'Surat Permohonan Sponsorship / Sarana Prasarana',
      kodeJenis: 'SPm',
      deskripsi: 'Format baku pengajuan sponsorship dan permohonan pinjam sound system/tenda/lapangan.',
      kategori: 'Surat',
      sampleContent: 'Bersama surat ini, kami memohon dukungan dan bantuan sarana prasarana demi kelancaran kegiatan kepemudaan yang akan diselenggarakan.',
    },
    {
      id: 't-5',
      judul: 'Surat Keputusan (SK) Pengesahan Pengurus RW',
      kodeJenis: 'SKep',
      deskripsi: 'Ketetapan resmi ketua tentang susunan unit kerja sub-karang taruna tingkat RW.',
      kategori: 'Surat',
      sampleContent: 'MEMUTUSKAN: Mengesahkan susunan pengurus Sub-Unit Karang Taruna RW 03 Kelurahan Manis Jaya masa bakti 2024-2027.',
    },
    {
      id: 't-6',
      judul: 'Proposal Pengajuan Anggaran Program Pemuda',
      kodeJenis: 'PROP',
      deskripsi: 'Kerangka acuan kerja (KAK), latar belakang, rencana anggaran biaya (RAB), dan jadwal.',
      kategori: 'Proposal',
      sampleContent: 'PROPOSAL KEGIATAN: Pemberdayaan UMKM Pemuda & Pelatihan Digital Marketing Karang Taruna Manis Jaya 2026.',
    },
    {
      id: 't-7',
      judul: 'Laporan Pertanggungjawaban (LPJ) Kas & Kegiatan',
      kodeJenis: 'LPJ',
      deskripsi: 'Laporan keuangan realisasi kas, bukti kuitansi, dan dokumentasi foto setelah acara selesai.',
      kategori: 'Laporan',
      sampleContent: 'LAPORAN PERTANGGUNGJAWABAN: Realisasi anggaran kegiatan telah diaudit dan disetujui bersama oleh Ketua dan Bendahara.',
    },
    {
      id: 't-8',
      judul: 'Berita Acara Serah Terima & Musyawarah',
      kodeJenis: 'BA',
      deskripsi: 'Dokumen legal berita acara pemilihan ketua, serah terima jabatan, atau peminjaman aset logistik.',
      kategori: 'Administrasi',
      sampleContent: 'Pada hari ini telah dilakukan serah terima inventaris tenda dan sound system dalam keadaan baik dan lengkap.',
    },
  ]);

  const [previewTemplate, setPreviewTemplate] = useState<TemplateDokumen | null>(null);

  // =========================================================================
  // 6. PENANDATANGAN & STEMPEL STATE
  // =========================================================================
  const [namaKetua, setNamaKetua] = useState(
    () => localStorage.getItem('kt_ttd_ketua') || 'Iik Andriyana'
  );
  const [jabatanKetua, setJabatanKetua] = useState(
    () => localStorage.getItem('kt_ttd_jab_ketua') || 'Ketua Karang Taruna'
  );
  const [nikKetua, setNikKetua] = useState(
    () => localStorage.getItem('kt_ttd_nik_ketua') || '3671041208980001'
  );

  const [namaSekretaris, setNamaSekretaris] = useState(
    () => localStorage.getItem('kt_ttd_sekretaris') || 'Anisa Rahmawati'
  );
  const [jabatanSekretaris, setJabatanSekretaris] = useState(
    () => localStorage.getItem('kt_ttd_jab_sekretaris') || 'Sekretaris Umum'
  );
  const [nikSekretaris, setNikSekretaris] = useState(
    () => localStorage.getItem('kt_ttd_nik_sekretaris') || '3671045504990003'
  );

  const [namaBendahara, setNamaBendahara] = useState(
    () => localStorage.getItem('kt_ttd_bendahara') || 'Bagus Tri Prakoso'
  );
  const [jabatanBendahara, setJabatanBendahara] = useState(
    () => localStorage.getItem('kt_ttd_jab_bendahara') || 'Bendahara Umum'
  );
  const [nikBendahara, setNikBendahara] = useState(
    () => localStorage.getItem('kt_ttd_nik_bendahara') || '3671042306970004'
  );

  const [namaPejabatLain, setNamaPejabatLain] = useState(
    () => localStorage.getItem('kt_ttd_pejabat_lain') || 'Drs. H. Mulyadi, M.Si'
  );
  const [jabatanPejabatLain, setJabatanPejabatLain] = useState(
    () => localStorage.getItem('kt_ttd_jab_lain') || 'Lurah Manis Jaya / Pembina Umum'
  );
  const [nipPejabatLain, setNipPejabatLain] = useState(
    () => localStorage.getItem('kt_ttd_nip_lain') || '19750815 199803 1 004'
  );

  const [stempelAktif, setStempelAktif] = useState(
    () => localStorage.getItem('kt_stempel_aktif') !== 'false'
  );

  // =========================================================================
  // 7. FORMAT CETAK & BERKAS STATE
  // =========================================================================
  const [ukuranKertas, setUkuranKertas] = useState<'A4' | 'F4' | 'A5'>(
    () => (localStorage.getItem('kt_cetak_kertas') as any) || 'A4'
  );
  const [orientasiKertas, setOrientasiKertas] = useState<'Portrait' | 'Landscape'>(
    () => (localStorage.getItem('kt_cetak_orientasi') as any) || 'Portrait'
  );
  const [marginTop, setMarginTop] = useState(
    () => localStorage.getItem('kt_cetak_m_top') || '2.5'
  );
  const [marginBottom, setMarginBottom] = useState(
    () => localStorage.getItem('kt_cetak_m_bottom') || '2.0'
  );
  const [marginLeft, setMarginLeft] = useState(
    () => localStorage.getItem('kt_cetak_m_left') || '3.0'
  );
  const [marginRight, setMarginRight] = useState(
    () => localStorage.getItem('kt_cetak_m_right') || '2.0'
  );
  const [headerAktif, setHeaderAktif] = useState(
    () => localStorage.getItem('kt_cetak_header') !== 'false'
  );
  const [footerAktif, setFooterAktif] = useState(
    () => localStorage.getItem('kt_cetak_footer') !== 'false'
  );
  const [nomorHalaman, setNomorHalaman] = useState<'bawah_tengah' | 'bawah_kanan' | 'atas_kanan'>(
    () => (localStorage.getItem('kt_cetak_no_hal') as any) || 'bawah_tengah'
  );
  const [watermarkAktif, setWatermarkAktif] = useState(
    () => localStorage.getItem('kt_cetak_watermark') === 'true'
  );
  const [watermarkTeks, setWatermarkTeks] = useState(
    () => localStorage.getItem('kt_cetak_wm_text') || 'DOKUMEN RESMI KARANG TARUNA'
  );

  // File Upload Constraints
  const [maxFileSizeMB, setMaxFileSizeMB] = useState(
    () => Number(localStorage.getItem('kt_file_max_mb')) || 10
  );
  const [allowedPdf, setAllowedPdf] = useState(true);
  const [allowedWord, setAllowedWord] = useState(true);
  const [allowedExcel, setAllowedExcel] = useState(true);
  const [allowedImage, setAllowedImage] = useState(true);
  const [maxLampiranCount, setMaxLampiranCount] = useState(
    () => Number(localStorage.getItem('kt_file_max_attach')) || 5
  );
  const [lokasiPenyimpanan, setLokasiPenyimpanan] = useState(
    () => localStorage.getItem('kt_file_storage_loc') || 'Server Dokumen Lokal Terenkripsi (AES-256)'
  );

  // Refs for uploads
  const logoOrgInputRef = useRef<HTMLInputElement | null>(null);
  const logoTambahanInputRef = useRef<HTMLInputElement | null>(null);
  const ttdKetuaInputRef = useRef<HTMLInputElement | null>(null);

  // Save all settings handler
  const handleSaveAllSuratSettings = () => {
    localStorage.setItem('kt_doc_nama_org', namaOrganisasi);
    localStorage.setItem('kt_doc_nama_kt', namaKarangTaruna);
    localStorage.setItem('kt_doc_alamat', alamat);
    localStorage.setItem('kt_doc_kelurahan', desaKelurahan);
    localStorage.setItem('kt_doc_kecamatan', kecamatan);
    localStorage.setItem('kt_doc_kota', kabupatenKota);
    localStorage.setItem('kt_doc_provinsi', provinsi);
    localStorage.setItem('kt_doc_kodepos', kodePos);
    localStorage.setItem('kt_doc_telepon', telepon);
    localStorage.setItem('kt_doc_email', email);
    localStorage.setItem('kt_doc_website', website);

    localStorage.setItem('kt_kop_aktif', String(aktifkanKop));
    localStorage.setItem('kt_kop_nama_org', kopNamaOrg);
    localStorage.setItem('kt_kop_nama_wilayah', kopNamaWilayah);
    localStorage.setItem('kt_kop_alamat', kopAlamat);
    localStorage.setItem('kt_kop_kontak', kopKontak);
    localStorage.setItem('kt_kop_garis_bawah', String(kopGarisBawah));
    localStorage.setItem('kt_kop_jenis_garis', jenisGaris);
    localStorage.setItem('kt_kop_tebal_garis', ketebalanGaris);
    localStorage.setItem('kt_kop_ukuran_logo', ukuranLogo);
    localStorage.setItem('kt_kop_jarak_logo', jarakLogoTeks);

    localStorage.setItem('kt_no_prefix', prefixNomor);
    localStorage.setItem('kt_no_counter', String(nomorUrutTerakhir));
    localStorage.setItem('kt_no_format_bulan', formatBulan);
    localStorage.setItem('kt_no_format_tahun', formatTahun);
    localStorage.setItem('kt_no_kode_org', kodeOrgNomor);
    localStorage.setItem('kt_no_digit', String(jumlahDigitNomor));
    localStorage.setItem('kt_no_reset_tahun', String(resetTahun));
    localStorage.setItem('kt_no_reset_bulan', String(resetBulan));

    localStorage.setItem('kt_ttd_ketua', namaKetua);
    localStorage.setItem('kt_ttd_jab_ketua', jabatanKetua);
    localStorage.setItem('kt_ttd_nik_ketua', nikKetua);
    localStorage.setItem('kt_ttd_sekretaris', namaSekretaris);
    localStorage.setItem('kt_ttd_jab_sekretaris', jabatanSekretaris);
    localStorage.setItem('kt_ttd_nik_sekretaris', nikSekretaris);
    localStorage.setItem('kt_ttd_bendahara', namaBendahara);
    localStorage.setItem('kt_ttd_jab_bendahara', jabatanBendahara);
    localStorage.setItem('kt_ttd_nik_bendahara', nikBendahara);
    localStorage.setItem('kt_ttd_pejabat_lain', namaPejabatLain);
    localStorage.setItem('kt_ttd_jab_lain', jabatanPejabatLain);
    localStorage.setItem('kt_ttd_nip_lain', nipPejabatLain);
    localStorage.setItem('kt_stempel_aktif', String(stempelAktif));

    localStorage.setItem('kt_cetak_kertas', ukuranKertas);
    localStorage.setItem('kt_cetak_orientasi', orientasiKertas);
    localStorage.setItem('kt_cetak_m_top', marginTop);
    localStorage.setItem('kt_cetak_m_bottom', marginBottom);
    localStorage.setItem('kt_cetak_m_left', marginLeft);
    localStorage.setItem('kt_cetak_m_right', marginRight);
    localStorage.setItem('kt_cetak_header', String(headerAktif));
    localStorage.setItem('kt_cetak_footer', String(footerAktif));
    localStorage.setItem('kt_cetak_no_hal', nomorHalaman);
    localStorage.setItem('kt_cetak_watermark', String(watermarkAktif));
    localStorage.setItem('kt_cetak_wm_text', watermarkTeks);

    localStorage.setItem('kt_file_max_mb', String(maxFileSizeMB));
    localStorage.setItem('kt_file_max_attach', String(maxLampiranCount));
    localStorage.setItem('kt_file_storage_loc', lokasiPenyimpanan);

    onToast('Seluruh konfigurasi Surat, Dokumen, Kop, & Penomoran berhasil disimpan!');
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={logoOrgInputRef}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setDocLogoOrg(event.target?.result as string);
              onToast('Logo organisasi berhasil diperbarui!');
            };
            reader.readAsDataURL(file);
          }
        }}
      />
      <input
        type="file"
        ref={logoTambahanInputRef}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setDocLogoTambahan(event.target?.result as string);
              onToast('Logo pendamping (Kanan) berhasil diunggah!');
            };
            reader.readAsDataURL(file);
          }
        }}
      />

      {/* 1. TOP HEADER & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              Standarisasi Surat & Tata Kelola Dokumen
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur identitas resmi, kop naskah dinas, rumus penomoran otomatis, pejabat penandatangan, dan cetak.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onToast('Mereset konfigurasi dokumen ke template baku dinas...');
              localStorage.removeItem('kt_doc_nama_org');
              localStorage.removeItem('kt_kop_aktif');
              window.location.reload();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Standar</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAllSuratSettings}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all transform active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Semua Perubahan</span>
          </button>
        </div>
      </div>

      {/* QUICK JUMP FILTER PILLS */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveSection('semua')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSection === 'semua' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua Pengaturan
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('identitas')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSection === 'identitas' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🏢 Identitas Dokumen
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('kop')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSection === 'kop' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📜 Kop Surat
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('penomoran')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSection === 'penomoran' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🔢 Penomoran Surat
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('jenis')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSection === 'jenis' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📑 Master Jenis Surat
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('template')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSection === 'template' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📄 Template Dokumen
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('ttd')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSection === 'ttd' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ✍️ Penandatangan
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('cetak')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSection === 'cetak' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🖨️ Format Cetak
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: IDENTITAS DOKUMEN */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'identitas') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              🏢
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Identitas Dokumen</h3>
              <p className="text-xs text-slate-500">
                Data resmi yang otomatis muncul pada kepala surat, lembar pengesahan proposal, dan laporan pertanggungjawaban.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Organisasi Induk</label>
                <input
                  type="text"
                  value={namaOrganisasi}
                  onChange={(e) => setNamaOrganisasi(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Karang Taruna</label>
                <input
                  type="text"
                  value={namaKarangTaruna}
                  onChange={(e) => setNamaKarangTaruna(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Alamat Sekretariat</label>
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Desa / Kelurahan</label>
                  <input
                    type="text"
                    value={desaKelurahan}
                    onChange={(e) => setDesaKelurahan(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kabupaten/Kota</label>
                  <input
                    type="text"
                    value={kabupatenKota}
                    onChange={(e) => setKabupatenKota(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={provinsi}
                    onChange={(e) => setProvinsi(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={kodePos}
                    onChange={(e) => setKodePos(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Alamat Email Resmi</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Website Portal</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {/* Logo Organisasi & Logo Tambahan Uploaders */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2">
                  <span className="font-bold text-slate-800 block text-[11px]">Logo Utama (Kiri)</span>
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 mx-auto flex items-center justify-center p-1.5 shadow-2xs">
                    <img
                      src={docLogoOrg}
                      alt="Logo Utama"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => logoOrgInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px]"
                  >
                    Ganti Logo
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2">
                  <span className="font-bold text-slate-800 block text-[11px]">Logo Tambahan (Kanan)</span>
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 mx-auto flex items-center justify-center p-1.5 shadow-2xs">
                    {docLogoTambahan ? (
                      <img
                        src={docLogoTambahan}
                        alt="Logo Tambahan"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">Belum Ada</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => logoTambahanInputRef.current?.click()}
                      className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-[10px]"
                    >
                      Unggah
                    </button>
                    {docLogoTambahan && (
                      <button
                        type="button"
                        onClick={() => {
                          setDocLogoTambahan('');
                          onToast('Logo tambahan dihapus.');
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: KOP SURAT (PENGATURAN KHUSUS KEPALA SURAT) */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'kop') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                📜
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Kop Surat (Kepala Surat Dinas)</h3>
                <p className="text-xs text-slate-500">
                  Pengaturan tata letak teks, logo kembar (kiri-kanan), garis batas, dan ukuran proporsi kepala surat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Aktifkan Kop Surat:</span>
              <button
                type="button"
                onClick={() => {
                  const next = !aktifkanKop;
                  setAktifkanKop(next);
                  onToast(`Kop surat resmi ${next ? 'diaktifkan' : 'dinonaktifkan'}.`);
                }}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                  aktifkanKop ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    aktifkanKop ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Form Kop Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Baris 1: Nama Organisasi</label>
                <input
                  type="text"
                  value={kopNamaOrg}
                  onChange={(e) => setKopNamaOrg(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Baris 2: Nama Wilayah / Pemerintahan</label>
                <input
                  type="text"
                  value={kopNamaWilayah}
                  onChange={(e) => setKopNamaWilayah(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Baris 3: Alamat Sekretariat Kop</label>
                <input
                  type="text"
                  value={kopAlamat}
                  onChange={(e) => setKopAlamat(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Baris 4: Kontak, Email & Website</label>
                <input
                  type="text"
                  value={kopKontak}
                  onChange={(e) => setKopKontak(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Ukuran Logo</label>
                  <select
                    value={ukuranLogo}
                    onChange={(e: any) => setUkuranLogo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="kecil">Kecil (50px)</option>
                    <option value="sedang">Sedang (65px)</option>
                    <option value="besar">Besar (85px)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jarak Logo ke Teks</label>
                  <select
                    value={jarakLogoTeks}
                    onChange={(e: any) => setJarakLogoTeks(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="rapat">Rapat (12px)</option>
                    <option value="standar">Standar (24px)</option>
                    <option value="renggang">Renggang (36px)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Garis Pembatas Kop</label>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setKopGarisBawah(!kopGarisBawah)}
                      className={`px-3 py-1.5 rounded-xl border font-bold text-xs ${
                        kopGarisBawah ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {kopGarisBawah ? 'Aktif (Ada Garis)' : 'Tanpa Garis'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jenis & Ketebalan Garis</label>
                  <select
                    value={jenisGaris}
                    onChange={(e: any) => setJenisGaris(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="ganda">Garis Ganda Dinas (Tebal-Tipis)</option>
                    <option value="tunggal">Garis Tunggal Solid</option>
                    <option value="tebal">Garis Tebal Tegas (3px)</option>
                    <option value="putus">Garis Putus-Putus (Dashed)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* LIVE KOP SURAT PREVIEW SIMULATOR */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              Pratinjau Hasil Cetak Kepala Surat (Live Kop Surat Preview):
            </span>

            <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-sm">
              <div
                className={`flex items-center justify-between ${
                  jarakLogoTeks === 'rapat' ? 'gap-3' : jarakLogoTeks === 'renggang' ? 'gap-8' : 'gap-5'
                }`}
              >
                {/* Left Logo */}
                <div
                  className={`shrink-0 flex items-center justify-center ${
                    ukuranLogo === 'kecil' ? 'w-12 h-12' : ukuranLogo === 'besar' ? 'w-20 h-20' : 'w-16 h-16'
                  }`}
                >
                  <img src={docLogoOrg} alt="Logo Kop Kiri" className="max-w-full max-h-full object-contain" />
                </div>

                {/* Center Text Header */}
                <div className="flex-1 text-center font-serif text-slate-900">
                  <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide leading-tight">
                    {namaOrganisasi}
                  </h4>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-blue-900 leading-tight mt-0.5">
                    {kopNamaOrg}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 mt-0.5">
                    {kopNamaWilayah}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 font-sans mt-1 leading-snug">
                    {kopAlamat}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-sans leading-tight">
                    {kopKontak}
                  </p>
                </div>

                {/* Right Logo (if present or symmetrical) */}
                <div
                  className={`shrink-0 flex items-center justify-center ${
                    ukuranLogo === 'kecil' ? 'w-12 h-12' : ukuranLogo === 'besar' ? 'w-20 h-20' : 'w-16 h-16'
                  }`}
                >
                  {docLogoTambahan ? (
                    <img src={docLogoTambahan} alt="Logo Kop Kanan" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-[9px] text-slate-300">
                      Logo Kanan
                    </div>
                  )}
                </div>
              </div>

              {/* Kop Underline */}
              {kopGarisBawah && (
                <div className="mt-3">
                  {jenisGaris === 'ganda' ? (
                    <div className="space-y-0.5">
                      <div className="border-t-[3px] border-slate-900 w-full" />
                      <div className="border-t border-slate-900 w-full" />
                    </div>
                  ) : jenisGaris === 'tebal' ? (
                    <div className="border-t-[3px] border-slate-900 w-full" />
                  ) : jenisGaris === 'putus' ? (
                    <div className="border-t-2 border-dashed border-slate-800 w-full" />
                  ) : (
                    <div className="border-t-2 border-slate-900 w-full" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: PENOMORAN SURAT */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'penomoran') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              🔢
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Penomoran Surat Otomatis</h3>
              <p className="text-xs text-slate-500">
                Wajib dikonfigurasi agar sistem dapat menerbitkan surat secara otomatis dengan tata urut resmi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Prefix / Awalan</label>
                  <input
                    type="text"
                    value={prefixNomor}
                    onChange={(e) => setPrefixNomor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nomor Urut Berjalan</label>
                  <input
                    type="number"
                    value={nomorUrutTerakhir}
                    onChange={(e) => setNomorUrutTerakhir(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Format Bulan</label>
                  <select
                    value={formatBulan}
                    onChange={(e: any) => setFormatBulan(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="romawi">Romawi (IX)</option>
                    <option value="dua_digit">2 Digit (09)</option>
                    <option value="satu_digit">1 Digit (9)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Format Tahun</label>
                  <select
                    value={formatTahun}
                    onChange={(e: any) => setFormatTahun(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="4_digit">4 Digit (2026)</option>
                    <option value="2_digit">2 Digit (26)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jumlah Digit Urut</label>
                  <select
                    value={jumlahDigitNomor}
                    onChange={(e) => setJumlahDigitNomor(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value={3}>3 Digit (001)</option>
                    <option value={4}>4 Digit (0001)</option>
                    <option value={5}>5 Digit (00001)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kode Organisasi</label>
                  <input
                    type="text"
                    value={kodeOrgNomor}
                    onChange={(e) => setKodeOrgNomor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Sampel Kode Jenis</label>
                  <select
                    value={sampleKodeJenis}
                    onChange={(e) => setSampleKodeJenis(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  >
                    <option value="UND">UND (Undangan)</option>
                    <option value="ST">ST (Surat Tugas)</option>
                    <option value="SKET">SKET (Keterangan)</option>
                    <option value="SPm">SPm (Permohonan)</option>
                    <option value="SKep">SKep (Keputusan)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reset Rules & Live Sample Result */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">Aturan Reset Nomor Urut Otomatis:</span>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Reset Nomor Setiap Tahun Baru</span>
                    <span className="text-[10px] text-slate-500">Nomor urut kembali ke 0001 per 1 Januari</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResetTahun(!resetTahun)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      resetTahun ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        resetTahun ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Reset Nomor Setiap Bulan Baru</span>
                    <span className="text-[10px] text-slate-500">Nomor urut direset kembali ke 0001 setiap awal bulan</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResetBulan(!resetBulan)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      resetBulan ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        resetBulan ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Big Live Number Display */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-md space-y-1">
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block">
                  HASIL PENOMORAN SISTEM OTOMATIS:
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white py-1">
                  {generatedSampleNumber}
                </div>
                <div className="flex items-center justify-between text-[10px] text-blue-200 pt-1 border-t border-white/10">
                  <span>Rumus: [URUT]/[KODE]/[ORG]/[BULAN]/[TAHUN]</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedSampleNumber);
                      onToast('Nomor surat berhasil disalin!');
                    }}
                    className="p-1 hover:text-white flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: MASTER JENIS SURAT */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'jenis') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                📑
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Master Jenis Surat & Naskah Dinas</h3>
                <p className="text-xs text-slate-500">
                  Katalog klasifikasi surat masuk, surat keluar, surat tugas, berita acara, serta masa retensi arsip.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddJenisModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jenis Surat</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Nama Jenis Surat</th>
                  <th className="py-3 px-3">Kode Surat</th>
                  <th className="py-3 px-3">Deskripsi & Peruntukan</th>
                  <th className="py-3 px-3">Masa Retensi</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {masterJenisSurat.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {item.nama}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px]">
                        {item.kode}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      {item.deskripsi}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                      {item.retensi}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = masterJenisSurat.map((j) =>
                            j.id === item.id ? { ...j, aktif: !j.aktif } : j
                          );
                          setMasterJenisSurat(updated);
                          onToast(`Status jenis surat ${item.nama} diperbarui.`);
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.aktif ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.aktif ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSampleKodeJenis(item.kode);
                          onToast(`Kode jenis surat penomoran diganti ke "${item.kode}".`);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-[11px]"
                      >
                        Gunakan Kode
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: TEMPLATE DOKUMEN */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'template') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              📄
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Template Dokumen Baku Otomatis</h3>
              <p className="text-xs text-slate-500">
                Daftar format template baku yang siap digunakan pengurus saat membuat surat, proposal, dan LPJ.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                      {tpl.kodeJenis}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {tpl.kategori}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{tpl.judul}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{tpl.deskripsi}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(tpl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-[11px]"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Lihat Draf</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([tpl.sampleContent], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `template_${tpl.kodeJenis.toLowerCase()}_karang_taruna.txt`;
                      a.click();
                      onToast(`Template "${tpl.judul}" berhasil diunduh.`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-[11px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: PENANDATANGAN & STEMPEL */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'ttd') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              ✍️
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Penandatangan & Stempel Resmi</h3>
              <p className="text-xs text-slate-500">
                Pejabat yang berwenang menandatangani surat dinas, proposal, laporan pertanggungjawaban, dan stempel basah.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Pejabat 1: Ketua */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">1. Pejabat Utama: Ketua</span>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap Ketua</label>
                <input
                  type="text"
                  value={namaKetua}
                  onChange={(e) => setNamaKetua(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={jabatanKetua}
                    onChange={(e) => setJabatanKetua(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">NIK (KTP)</label>
                  <input
                    type="text"
                    value={nikKetua}
                    onChange={(e) => setNikKetua(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Pejabat 2: Sekretaris */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">2. Pejabat Kesekretariatan: Sekretaris</span>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap Sekretaris</label>
                <input
                  type="text"
                  value={namaSekretaris}
                  onChange={(e) => setNamaSekretaris(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={jabatanSekretaris}
                    onChange={(e) => setJabatanSekretaris(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">NIK (KTP)</label>
                  <input
                    type="text"
                    value={nikSekretaris}
                    onChange={(e) => setNikSekretaris(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Pejabat 3: Bendahara */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">3. Pejabat Keuangan: Bendahara</span>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap Bendahara</label>
                <input
                  type="text"
                  value={namaBendahara}
                  onChange={(e) => setNamaBendahara(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={jabatanBendahara}
                    onChange={(e) => setJabatanBendahara(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">NIK (KTP)</label>
                  <input
                    type="text"
                    value={nikBendahara}
                    onChange={(e) => setNikBendahara(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Pejabat 4: Pembina / Lurah & Stempel */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <span className="font-bold text-slate-900 block text-xs">4. Pembina / Lurah Manis Jaya & Stempel</span>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Pembina / Lurah</label>
                <input
                  type="text"
                  value={namaPejabatLain}
                  onChange={(e) => setNamaPejabatLain(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">NIP Pegawai</label>
                  <input
                    type="text"
                    value={nipPejabatLain}
                    onChange={(e) => setNipPejabatLain(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Stempel Otomatis</label>
                  <button
                    type="button"
                    onClick={() => {
                      setStempelAktif(!stempelAktif);
                      onToast(`Stempel otomatis ${!stempelAktif ? 'diaktifkan' : 'dinonaktifkan'}.`);
                    }}
                    className={`w-full py-1.5 rounded-xl border font-bold text-xs ${
                      stempelAktif ? 'bg-purple-100 border-purple-400 text-purple-900' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {stempelAktif ? 'Stempel Aktif' : 'Nonaktif'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: FORMAT CETAK & BERKAS LAMPIRAN */}
      {/* ========================================================================= */}
      {(activeSection === 'semua' || activeSection === 'cetak') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              🖨️
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Format Cetak & Penyimpanan Berkas</h3>
              <p className="text-xs text-slate-500">
                Pengaturan ukuran kertas, margin halaman, watermark, batas ukuran file unggahan, dan tipe lampiran.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Format Cetak Parameter */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
              <span className="font-bold text-slate-900 block text-xs">Pengaturan Halaman Cetak</span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ukuran Kertas</label>
                  <select
                    value={ukuranKertas}
                    onChange={(e: any) => setUkuranKertas(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="A4">A4 (210 x 297 mm)</option>
                    <option value="F4">F4 / Folio (215 x 330 mm)</option>
                    <option value="A5">A5 (148 x 210 mm)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Orientasi Kertas</label>
                  <select
                    value={orientasiKertas}
                    onChange={(e: any) => setOrientasiKertas(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Portrait">Portrait (Tegak)</option>
                    <option value="Landscape">Landscape (Mendatar)</option>
                  </select>
                </div>
              </div>

              {/* Margin 4 Sisi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Margin Halaman (dalam cm)</label>
                <div className="grid grid-cols-4 gap-2 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Atas</span>
                    <input
                      type="text"
                      value={marginTop}
                      onChange={(e) => setMarginTop(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Bawah</span>
                    <input
                      type="text"
                      value={marginBottom}
                      onChange={(e) => setMarginBottom(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Kiri</span>
                    <input
                      type="text"
                      value={marginLeft}
                      onChange={(e) => setMarginLeft(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Kanan</span>
                    <input
                      type="text"
                      value={marginRight}
                      onChange={(e) => setMarginRight(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Header, Footer & Watermark */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-semibold">Tampilkan Nomor Halaman:</span>
                  <select
                    value={nomorHalaman}
                    onChange={(e: any) => setNomorHalaman(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="bawah_tengah">Bawah Tengah</option>
                    <option value="bawah_kanan">Bawah Kanan</option>
                    <option value="atas_kanan">Atas Kanan</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-700 font-semibold block">Watermark Keaslian Dokumen</span>
                    <span className="text-[10px] text-slate-400">Teks bayangan samar di tengah halaman</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWatermarkAktif(!watermarkAktif)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      watermarkAktif ? 'bg-sky-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        watermarkAktif ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {watermarkAktif && (
                  <input
                    type="text"
                    value={watermarkTeks}
                    onChange={(e) => setWatermarkTeks(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl uppercase font-mono text-xs text-slate-700"
                    placeholder="Contoh: DRAF / RESMI / ASLI"
                  />
                )}
              </div>
            </div>

            {/* Storage & Lampiran Constraints */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
              <span className="font-bold text-slate-900 block text-xs">Ketentuan Berkas & Lampiran</span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maksimum Ukuran File</label>
                  <select
                    value={maxFileSizeMB}
                    onChange={(e) => setMaxFileSizeMB(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  >
                    <option value={5}>5 MB (Standar Ringkas)</option>
                    <option value={10}>10 MB (Direkomendasikan)</option>
                    <option value={25}>25 MB (Ekstra Dokumen)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Lampiran Maksimum</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={maxLampiranCount}
                    onChange={(e) => setMaxLampiranCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Allowed File Types */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Jenis File yang Diperbolehkan</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowedPdf}
                      onChange={(e) => setAllowedPdf(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-bold">PDF (.pdf)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowedWord}
                      onChange={(e) => setAllowedWord(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-bold">Word (.doc, .docx)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowedExcel}
                      onChange={(e) => setAllowedExcel(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-bold">Excel (.xls, .xlsx)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowedImage}
                      onChange={(e) => setAllowedImage(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span className="font-bold">Gambar (JPG/PNG)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Penyimpanan Dokumen</label>
                <input
                  type="text"
                  value={lokasiPenyimpanan}
                  onChange={(e) => setLokasiPenyimpanan(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PREVIEW TEMPLATE DOKUMEN */}
      {/* ========================================================================= */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 p-6 sm:p-7 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">{previewTemplate.judul}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Mockup Box */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl font-serif text-slate-900 space-y-4 text-xs">
              <div className="text-center border-b-2 border-slate-900 pb-2">
                <h5 className="font-black text-sm uppercase">{kopNamaOrg}</h5>
                <p className="text-[11px] font-sans text-slate-600">{kopAlamat}</p>
              </div>

              <div className="flex justify-between text-[11px] font-sans">
                <div>
                  <p>Nomor: {generatedSampleNumber}</p>
                  <p>Lampiran: 1 (satu) Berkas</p>
                  <p>Perihal: {previewTemplate.judul}</p>
                </div>
                <div className="text-right">
                  <p>Manis Jaya, 29 September 2026</p>
                  <p>Kepada Yth. Rekan Pengurus / Warga</p>
                </div>
              </div>

              <div className="py-2 text-[11px] whitespace-pre-line leading-relaxed font-sans">
                {previewTemplate.sampleContent}
              </div>

              <div className="pt-4 flex justify-between text-center font-sans text-[11px]">
                <div>
                  <p>Sekretaris,</p>
                  <div className="h-12 flex items-center justify-center font-cursive text-slate-400">
                    ( Tanda Tangan )
                  </div>
                  <p className="font-bold underline">{namaSekretaris}</p>
                  <p className="text-[9px] text-slate-500">NIK. {nikSekretaris}</p>
                </div>

                <div>
                  <p>Ketua Karang Taruna,</p>
                  <div className="h-12 flex items-center justify-center font-cursive text-blue-600 font-bold">
                    {stempelAktif ? '[ STEMPEL + TTD ]' : '( Tanda Tangan )'}
                  </div>
                  <p className="font-bold underline">{namaKetua}</p>
                  <p className="text-[9px] text-slate-500">NIK. {nikKetua}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Sampel Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TAMBAH MASTER JENIS SURAT BARU */}
      {/* ========================================================================= */}
      {showAddJenisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Tambah Jenis Surat Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddJenisModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newJenisNama || !newJenisKode) {
                  onToast('Nama jenis dan kode surat wajib diisi!');
                  return;
                }
                const newObj: MasterJenisSurat = {
                  id: String(Date.now()),
                  nama: newJenisNama,
                  kode: newJenisKode.toUpperCase(),
                  deskripsi: newJenisDeskripsi || 'Jenis surat dinas kepemudaan',
                  retensi: '3 Tahun',
                  aktif: true,
                };
                setMasterJenisSurat([...masterJenisSurat, newObj]);
                setShowAddJenisModal(false);
                setNewJenisNama('');
                setNewJenisKode('');
                setNewJenisDeskripsi('');
                onToast(`Jenis surat "${newObj.nama} (${newObj.kode})" berhasil ditambahkan.`);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Jenis Surat</label>
                <input
                  type="text"
                  required
                  value={newJenisNama}
                  onChange={(e) => setNewJenisNama(e.target.value)}
                  placeholder="Contoh: Surat Permohonan Audiensi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Kode Surat Singkat (2-4 Huruf)</label>
                <input
                  type="text"
                  required
                  value={newJenisKode}
                  onChange={(e) => setNewJenisKode(e.target.value)}
                  placeholder="Contoh: AUD"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Deskripsi / Peruntukan</label>
                <textarea
                  rows={2}
                  value={newJenisDeskripsi}
                  onChange={(e) => setNewJenisDeskripsi(e.target.value)}
                  placeholder="Digunakan untuk keperluan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddJenisModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Jenis Surat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
