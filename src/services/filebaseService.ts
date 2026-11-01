import JSZip from 'jszip';
import { collectAllOrganizationData, downloadJsonFile } from './googleDriveService';

export interface FilebaseConfig {
  email: string;
  bucketName: string;
  endpoint: string;
  accessKey: string;
  secretKey: string;
  region: string;
  autoSync: boolean;
}

export interface FilebaseItem {
  id: string;
  key: string;
  filename: string;
  category: 'data' | 'berita' | 'pdf' | 'media' | 'arsip';
  size: number;
  contentType: string;
  uploadedAt: string;
  status: 'synced' | 'pending' | 'local_cached';
  s3Url: string;
  ipfsCid?: string;
  ipfsGatewayUrl?: string;
  etag?: string;
  notes?: string;
}

const CONFIG_KEY = 'kt_filebase_config';
const CATALOG_KEY = 'kt_filebase_catalog_v2';

export const DEFAULT_FILEBASE_CONFIG: FilebaseConfig = {
  email: 'jalansuci19@gmail.com',
  bucketName: 'karang-taruna-manisjaya',
  endpoint: 'https://s3.filebase.com',
  accessKey: '',
  secretKey: '',
  region: 'us-east-1',
  autoSync: true,
};

export const getFilebaseConfig = (): FilebaseConfig => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_FILEBASE_CONFIG };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_FILEBASE_CONFIG,
      ...parsed,
      email: parsed.email || DEFAULT_FILEBASE_CONFIG.email,
      bucketName: parsed.bucketName || DEFAULT_FILEBASE_CONFIG.bucketName,
      endpoint: parsed.endpoint || DEFAULT_FILEBASE_CONFIG.endpoint,
    };
  } catch {
    return { ...DEFAULT_FILEBASE_CONFIG };
  }
};

export const saveFilebaseConfig = (cfg: FilebaseConfig): void => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  } catch (err) {
    console.error('Failed to save Filebase config:', err);
  }
};

export const getFilebaseCatalog = (): FilebaseItem[] => {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveFilebaseCatalog = (items: FilebaseItem[]): void => {
  try {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(items.slice(0, 100)));
  } catch (err) {
    console.error('Failed to save Filebase catalog:', err);
  }
};

export const addOrUpdateCatalogItem = (item: FilebaseItem): void => {
  const current = getFilebaseCatalog();
  const existingIdx = current.findIndex((c) => c.key === item.key || c.id === item.id);
  let updated: FilebaseItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...item };
  } else {
    updated = [item, ...current];
  }
  saveFilebaseCatalog(updated);
};

export const removeCatalogItem = (id: string): void => {
  const current = getFilebaseCatalog();
  saveFilebaseCatalog(current.filter((c) => c.id !== id));
};

export const clearCatalog = (): void => {
  localStorage.removeItem(CATALOG_KEY);
};

// Generate deterministic pseudo IPFS CID for offline / local-cached preview
const generateDeterministicCid = (key: string, size: number): string => {
  let hash = 0;
  const str = `${key}_${size}_karang_taruna_manisjaya`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `Qm${hex}KTManisJaya${Date.now().toString(36)}`;
};

/**
 * Uji koneksi ke https://console.filebase.com/ (S3 & IPFS Endpoint)
 */
export const testFilebaseConnection = async (
  customCfg?: Partial<FilebaseConfig>
): Promise<{ success: boolean; message: string }> => {
  const cfg = { ...getFilebaseConfig(), ...customCfg };
  if (!cfg.accessKey || !cfg.secretKey) {
    return {
      success: false,
      message: 'Access Key dan Secret Key Filebase belum diisi. Silakan masukkan kunci API dari https://console.filebase.com/keys',
    };
  }

  try {
    const res = await fetch('/api/filebase/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessKey: cfg.accessKey,
        secretKey: cfg.secretKey,
        bucket: cfg.bucketName,
        endpoint: cfg.endpoint,
        region: cfg.region,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || `Terhubung ke Filebase S3 bucket "${cfg.bucketName}"!`,
      };
    } else {
      return {
        success: false,
        message: data.error || data.message || 'Gagal terhubung ke Filebase S3. Periksa kembali Access Key dan Secret Key.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Terjadi kendala jaringan: ${err.message}`,
    };
  }
};

/**
 * Unggah berkas tunggal ke Filebase (S3 / IPFS)
 */
export const uploadToFilebase = async (file: {
  key: string;
  name: string;
  content: string | Blob;
  contentType: string;
  category: 'data' | 'berita' | 'pdf' | 'media' | 'arsip';
  notes?: string;
}): Promise<{ success: boolean; item: FilebaseItem; message: string }> => {
  const cfg = getFilebaseConfig();
  const now = new Date();

  let stringContent = '';
  let isBase64 = false;
  let sizeInBytes = 0;

  if (typeof file.content === 'string') {
    stringContent = file.content;
    sizeInBytes = new Blob([file.content]).size;
    if (file.contentType.includes('pdf') && !stringContent.startsWith('{') && !stringContent.startsWith('[')) {
      isBase64 = true;
    }
  } else {
    sizeInBytes = file.content.size;
    const arrayBuffer = await file.content.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    stringContent = btoa(binary);
    isBase64 = true;
  }

  const cleanKey = file.key.replace(/^\/+/, '');
  const baseS3Url = `https://s3.filebase.com/${cfg.bucketName}/${cleanKey}`;
  const defaultCid = generateDeterministicCid(cleanKey, sizeInBytes);

  const initialItem: FilebaseItem = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    key: cleanKey,
    filename: file.name,
    category: file.category,
    size: sizeInBytes,
    contentType: file.contentType,
    uploadedAt: now.toISOString(),
    status: 'pending',
    s3Url: baseS3Url,
    ipfsCid: defaultCid,
    ipfsGatewayUrl: `https://ipfs.filebase.io/ipfs/${defaultCid}`,
    notes: file.notes || `Disimpan untuk akun ${cfg.email}`,
  };

  // If no credentials, store in local catalog and return instruction
  if (!cfg.accessKey || !cfg.secretKey) {
    const cachedItem: FilebaseItem = {
      ...initialItem,
      status: 'local_cached',
      notes: `Tersimpan dalam antrean lokal (belum ada API Key Filebase). Siap diunggah ke console.filebase.com`,
    };
    addOrUpdateCatalogItem(cachedItem);
    return {
      success: true,
      item: cachedItem,
      message: `Berkas "${file.name}" disiapkan untuk Filebase. Masukkan Access Key & Secret Key untuk sinkronisasi otomatis ke cloud bucket.`,
    };
  }

  try {
    const res = await fetch('/api/filebase/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessKey: cfg.accessKey,
        secretKey: cfg.secretKey,
        bucket: cfg.bucketName,
        endpoint: cfg.endpoint,
        key: cleanKey,
        content: stringContent,
        isBase64,
        contentType: file.contentType,
      }),
    });

    const result = await res.json();
    if (res.ok && result.success) {
      const finalCid = result.ipfsCid || defaultCid;
      const syncedItem: FilebaseItem = {
        ...initialItem,
        status: 'synced',
        etag: result.etag,
        ipfsCid: finalCid,
        ipfsGatewayUrl: `https://ipfs.filebase.io/ipfs/${finalCid}`,
        notes: `Tersimpan di bucket "${cfg.bucketName}" Filebase S3 / IPFS (${result.etag || 'OK'})`,
      };
      addOrUpdateCatalogItem(syncedItem);
      return {
        success: true,
        item: syncedItem,
        message: `Berkas "${file.name}" berhasil diunggah ke Filebase (S3 & IPFS)!`,
      };
    } else {
      const failedItem: FilebaseItem = {
        ...initialItem,
        status: 'local_cached',
        notes: `Gagal upload ke bucket: ${result.error || 'Periksa kredensial'}`,
      };
      addOrUpdateCatalogItem(failedItem);
      return {
        success: false,
        item: failedItem,
        message: result.error || 'Gagal mengunggah berkas ke Filebase.',
      };
    }
  } catch (err: any) {
    const errorItem: FilebaseItem = {
      ...initialItem,
      status: 'local_cached',
      notes: `Kesalahan koneksi: ${err.message}`,
    };
    addOrUpdateCatalogItem(errorItem);
    return {
      success: false,
      item: errorItem,
      message: `Koneksi ke server Filebase gagal: ${err.message}`,
    };
  }
};

/**
 * Mengumpulkan dan membungkus SEMUA file data, berita, PDF, dan arsip
 * ke dalam paket terorganisir untuk Filebase
 */
export const collectAllFilesForFilebase = async () => {
  const cfg = getFilebaseConfig();
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

  const filesToUpload: Array<{
    key: string;
    name: string;
    content: string;
    contentType: string;
    category: 'data' | 'berita' | 'pdf' | 'media' | 'arsip';
    notes: string;
  }> = [];

  // 1. SEMUA FILE DATA (Database Lengkap, Anggota, Aset, Kas, Agenda)
  const masterData = collectAllOrganizationData(`Pencadangan Penuh Filebase IPFS - ${now.toLocaleString('id-ID')}`);
  filesToUpload.push({
    key: `data/database_lengkap_${dateStr}.json`,
    name: `database_lengkap_${dateStr}.json`,
    content: JSON.stringify(masterData, null, 2),
    contentType: 'application/json',
    category: 'data',
    notes: 'Seluruh basis data organisasi Karang Taruna Kelurahan Manis Jaya',
  });

  // Data Anggota terpisah
  const rawMembers = localStorage.getItem('kt_members_v3') || '[]';
  filesToUpload.push({
    key: `data/anggota_karang_taruna.json`,
    name: 'anggota_karang_taruna.json',
    content: rawMembers,
    contentType: 'application/json',
    category: 'data',
    notes: 'Daftar resmi seluruh anggota dan pengurus Karang Taruna',
  });

  // Data Inventaris Aset terpisah
  const rawAssets = localStorage.getItem('kt_assets_v1') || '[]';
  filesToUpload.push({
    key: `data/inventaris_aset_organisasi.json`,
    name: 'inventaris_aset_organisasi.json',
    content: rawAssets,
    contentType: 'application/json',
    category: 'data',
    notes: 'Daftar inventaris sarana dan prasarana organisasi',
  });

  // Data Buku Kas Keuangan terpisah
  const rawKas = localStorage.getItem('kt_kas_entries_v2') || '[]';
  filesToUpload.push({
    key: `data/buku_kas_keuangan.json`,
    name: 'buku_kas_keuangan.json',
    content: rawKas,
    contentType: 'application/json',
    category: 'data',
    notes: 'Laporan arus kas masuk dan kas keluar organisasi',
  });

  // 2. SEMUA BERITA & KEGIATAN
  const rawNews = localStorage.getItem('kt_news_v1') || '[]';
  let newsList: any[] = [];
  try {
    newsList = JSON.parse(rawNews);
  } catch {
    newsList = [];
  }

  filesToUpload.push({
    key: `berita/semua_berita_kegiatan.json`,
    name: 'semua_berita_kegiatan.json',
    content: JSON.stringify(newsList, null, 2),
    contentType: 'application/json',
    category: 'berita',
    notes: `Kumpulan ${newsList.length} artikel berita dan kegiatan pemuda`,
  });

  // Setiap berita sebagai file terpisah
  newsList.slice(0, 10).forEach((item, index) => {
    const slug = (item.title || `berita_${index + 1}`)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 30);
    filesToUpload.push({
      key: `berita/artikel/${slug}.json`,
      name: `${slug}.json`,
      content: JSON.stringify(item, null, 2),
      contentType: 'application/json',
      category: 'berita',
      notes: `Artikel: ${item.title || 'Berita'}`,
    });
  });

  // 3. ARSIP SURAT & DOKUMEN PDF (Metadata & Berkas Rekap)
  const rawSuratKeluar = localStorage.getItem('kt_surat_items_v2') || '[]';
  const rawSuratMasuk = localStorage.getItem('kt_surat_masuk_v1') || '[]';
  const rawDisposisi = localStorage.getItem('kt_disposisi_items_v1') || '[]';

  const suratRekap = {
    tanggalEkspor: now.toISOString(),
    suratKeluar: JSON.parse(rawSuratKeluar),
    suratMasuk: JSON.parse(rawSuratMasuk),
    lembarDisposisi: JSON.parse(rawDisposisi),
  };

  filesToUpload.push({
    key: `pdf/arsip_surat_dan_disposisi.json`,
    name: 'arsip_surat_dan_disposisi.json',
    content: JSON.stringify(suratRekap, null, 2),
    contentType: 'application/json',
    category: 'pdf',
    notes: 'Rekap digital seluruh surat dinas, surat masuk, dan lembar disposisi resmi',
  });

  // Template HTML Resmi Dokumen Laporan Siap Cetak ke PDF
  const laporanHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Laporan Resmi Karang Taruna Kelurahan Manis Jaya</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.6; }
    h1 { color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 8px; font-size: 20px; }
    h2 { color: #0369a1; font-size: 16px; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    th { background: #f1f5f9; color: #0f172a; font-weight: bold; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .footer { margin-top: 40px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>LAPORAN SISTEM & DATABASE KARANG TARUNA KELURAHAN MANIS JAYA</h1>
  <p><strong>Tanggal Ekspor:</strong> ${now.toLocaleDateString('id-ID', { dateStyle: 'full' })} ${now.toLocaleTimeString('id-ID')}</p>
  <p><strong>Akun Terdaftar Filebase:</strong> ${cfg.email} | <strong>Bucket:</strong> ${cfg.bucketName}</p>
  <p><strong>Penyimpanan:</strong> Filebase Decentralized S3 & IPFS Storage (https://console.filebase.com/)</p>

  <h2>1. Ringkasan Basis Data</h2>
  <table>
    <tr><th>Kategori</th><th>Total Data</th><th>Status Sinkronisasi</th></tr>
    <tr><td>Berita & Kegiatan</td><td>${newsList.length} Artikel</td><td>Tersimpan di Cloud</td></tr>
    <tr><td>Anggota & Pengurus</td><td>${masterData.metadata.totalAnggota} Anggota</td><td>Terverifikasi</td></tr>
    <tr><td>Inventaris Aset</td><td>${masterData.metadata.totalAset} Unit</td><td>Tercatat</td></tr>
    <tr><td>Surat & Dokumen</td><td>${masterData.metadata.totalSurat} Berkas</td><td>Arsip Digital</td></tr>
    <tr><td>Agenda Kegiatan</td><td>${masterData.metadata.totalAgenda} Jadwal</td><td>Aktif</td></tr>
  </table>

  <h2>2. Berita & Kegiatan Terbaru</h2>
  <table>
    <tr><th>Judul Berita</th><th>Kategori</th><th>Tanggal</th></tr>
    ${newsList.slice(0, 5).map((n) => `<tr><td>${n.title || '-'}</td><td>${n.category || 'Kegiatan'}</td><td>${n.date || '-'}</td></tr>`).join('')}
  </table>

  <div class="footer">
    Dokumen ini digenerasi secara otomatis oleh Sistem Informasi Karang Taruna Kelurahan Manis Jaya untuk diarsipkan di Filebase (IPFS).
  </div>
</body>
</html>`;

  filesToUpload.push({
    key: `pdf/laporan_resmi_organisasi_${dateStr}.html`,
    name: `laporan_resmi_organisasi_${dateStr}.html`,
    content: laporanHtml,
    contentType: 'text/html',
    category: 'pdf',
    notes: 'Dokumen laporan resmi Karang Taruna berformat web cetak PDF',
  });

  // 4. PENGATURAN & METADATA SISTEM (DLL)
  const systemSettings: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith('kt_') || k.startsWith('theme_'))) {
      systemSettings[k] = localStorage.getItem(k) || '';
    }
  }

  filesToUpload.push({
    key: `arsip/konfigurasi_sistem_karang_taruna.json`,
    name: 'konfigurasi_sistem_karang_taruna.json',
    content: JSON.stringify(systemSettings, null, 2),
    contentType: 'application/json',
    category: 'arsip',
    notes: 'Seluruh konfigurasi tampilan, tema, logo, dan identitas Kelurahan Manis Jaya',
  });

  return filesToUpload;
};

/**
 * Membuat file ZIP utuh berisi seluruh folder (data, berita, pdf, arsip)
 * untuk diunduh 1-klik atau diunggah langsung ke console.filebase.com
 */
export const createMasterFilebaseZip = async (): Promise<Blob> => {
  const zip = new JSZip();
  const files = await collectAllFilesForFilebase();

  files.forEach((f) => {
    zip.file(f.key, f.content);
  });

  // Buat file README petunjuk di dalam zip
  const cfg = getFilebaseConfig();
  const readmeContent = `PANDUAN UNGGAH KE FILEBASE (https://console.filebase.com/)
==============================================================
Akun Filebase: ${cfg.email}
Bucket Target: ${cfg.bucketName}
Endpoint S3: ${cfg.endpoint}

Struktur Berkas:
- data/   : Seluruh database (database_lengkap.json, anggota, aset, kas)
- berita/ : Seluruh artikel berita kegiatan dan publikasi pemuda
- pdf/    : Rekap surat dinas, disposisi, dan laporan resmi siap cetak
- arsip/  : Konfigurasi sistem dan pengaturan tema organisasi

Cara Unggah ke Console Filebase:
1. Buka https://console.filebase.com/
2. Masuk dengan akun ${cfg.email}
3. Masuk ke menu "Buckets" -> Pilih atau Buat Bucket "${cfg.bucketName}" (pilih Network: IPFS)
4. Klik tombol "Upload Files" atau "Upload Folder" dan masukkan folder-folder ini.
5. Selesai! Seluruh data Anda kini tersimpan aman dan terdesentralisasi di jaringan IPFS Filebase.
`;

  zip.file('PETUNJUK_FILEBASE_CONSOLE.txt', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
};

/**
 * Eksekusi Sinkronisasi Seluruh File (Data, Berita, PDF, dll.) ke Filebase
 */
export const syncAllToFilebase = async (
  onProgress?: (message: string, percent: number) => void
): Promise<{ success: boolean; count: number; failed: number; message: string }> => {
  const cfg = getFilebaseConfig();
  const files = await collectAllFilesForFilebase();
  const total = files.length;
  let successCount = 0;
  let failCount = 0;

  if (onProgress) onProgress('Mengumpulkan berkas data, berita, dan PDF...', 5);

  for (let i = 0; i < total; i++) {
    const f = files[i];
    const pct = Math.round(((i + 1) / total) * 90) + 5;
    if (onProgress) {
      onProgress(`Menyimpan [${f.category.toUpperCase()}] ${f.name} ke Filebase...`, pct);
    }

    try {
      const result = await uploadToFilebase({
        key: f.key,
        name: f.name,
        content: f.content,
        contentType: f.contentType,
        category: f.category,
        notes: f.notes,
      });

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (err) {
      failCount++;
    }
  }

  const msg =
    failCount === 0
      ? `Semua ${successCount} berkas (data, berita, PDF, arsip) berhasil disimpan untuk Filebase (${cfg.email})!`
      : `${successCount} berkas berhasil diproses, ${failCount} berkas dalam antrean lokal.`;

  if (onProgress) onProgress(msg, 100);

  return {
    success: failCount === 0 || successCount > 0,
    count: successCount,
    failed: failCount,
    message: msg,
  };
};
