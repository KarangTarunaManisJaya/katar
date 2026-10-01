import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely (singleton)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Drive file scope (non-sensitive, prevents Error 403 verification blocks)
export const driveProvider = new GoogleAuthProvider();
driveProvider.addScope('https://www.googleapis.com/auth/drive.file');
driveProvider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to track ongoing sign in
let isSigningIn = false;

// In-memory token cache (NEVER persisted to localStorage/sessionStorage as required)
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    cachedUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token not yet cached in this session (e.g. page reload)
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, driveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google.');
    }
    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    let friendlyMessage = error.message || 'Gagal login ke Google.';
    if (error.code === 'auth/popup-blocked') {
      friendlyMessage = 'Jendela pop-up login Google diblokir oleh browser. Harap izinkan pop-up atau gunakan Mode Cadangkan Langsung.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'Jendela login Google ditutup sebelum proses selesai.';
    } else if (error.code === 'auth/unauthorized-domain') {
      friendlyMessage = 'Domain aplikasi belum terdaftar di Firebase Auth. Silakan gunakan Mode Cadangkan Langsung (Unduh & Buka Drive) di bawah yang langsung berfungsi.';
    } else if (error.message?.includes('access_denied') || error.message?.includes('403')) {
      friendlyMessage = 'Akses Google OAuth dibatasi mode pengujian (Error 403). Gunakan Mode Cadangkan Langsung ke Google Drive tanpa batasan akun.';
    }
    const enhancedError = new Error(friendlyMessage);
    (enhancedError as any).code = error.code;
    throw enhancedError;
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getDriveUser = (): User | null => {
  return cachedUser;
};

export const signOutGoogleDrive = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
};

// --- Google Drive Address & URL Parser ---

/**
 * Extracts a Google Drive Folder ID from either:
 * - A full web URL: https://drive.google.com/drive/folders/1w7d...
 * - A URL with query params or user id: https://drive.google.com/drive/u/0/folders/1w7d...?usp=sharing
 * - A direct folder ID string: 1w7d...
 */
export const extractDriveFolderId = (input: string): string | null => {
  if (!input) return null;
  const trimmed = input.trim();

  // Pattern 1: standard Google Drive folders URL
  const folderUrlMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderUrlMatch && folderUrlMatch[1]) {
    return folderUrlMatch[1];
  }

  // Pattern 2: id parameter in URL (e.g. ?id=1w7d...)
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Pattern 3: direct ID string (alphanumeric, dashes, underscores, typically 25-45 chars)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
};

// --- Google Drive REST API Helpers ---

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink?: string;
  owners?: { displayName: string; emailAddress: string }[];
  canAddChildren?: boolean;
}

export interface DriveBackupFile {
  id: string;
  name: string;
  size: number;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  description?: string;
}

/**
 * Validates and fetches metadata for a specific Google Drive Folder
 */
export const fetchFolderDetails = async (
  folderId: string,
  token: string
): Promise<DriveFolderInfo> => {
  const url = `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,webViewLink,owners,capabilities&supportsAllDrives=true`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg =
      errData?.error?.message ||
      `Folder tidak ditemukan atau akun Anda tidak memiliki izin akses (HTTP ${response.status}).`;
    throw new Error(msg);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    webViewLink: data.webViewLink,
    owners: data.owners,
    canAddChildren: data.capabilities?.canAddChildren !== false,
  };
};

/**
 * Searches for default app folder "Karang Taruna Manis Jaya - Database" or creates it in the root
 */
export const getOrCreateDefaultAppFolder = async (
  token: string
): Promise<DriveFolderInfo> => {
  const folderName = 'Karang Taruna Manis Jaya - Database';
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`
  );
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&spaces=drive`;

  const searchRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0];
    }
  }

  // Create folder if not found
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder Database & Berkas Cadangan Resmi Karang Taruna Kelurahan Manis Jaya',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal membuat folder Karang Taruna di Google Drive.');
  }

  return await createRes.json();
};

/**
 * Lists backup JSON files within the specified Google Drive folder
 */
export const listBackupFilesFromDrive = async (
  folderId: string,
  token: string
): Promise<DriveBackupFile[]> => {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,size,createdTime,modifiedTime,webViewLink,webContentLink,description)&orderBy=createdTime desc&pageSize=50&supportsAllDrives=true&includeItemsFromAllDrives=true`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal memuat daftar berkas dari Google Drive.');
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    size: parseInt(f.size || '0', 10),
    createdTime: f.createdTime,
    modifiedTime: f.modifiedTime,
    webViewLink: f.webViewLink,
    webContentLink: f.webContentLink,
    description: f.description,
  }));
};

/**
 * Uploads a JSON backup bundle to the specified Google Drive folder using multipart upload
 */
export const uploadBackupFileToDrive = async (
  folderId: string,
  fileName: string,
  dataContent: any,
  token: string,
  description?: string
): Promise<DriveBackupFile> => {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'application/json',
    description: description || 'Cadangan Sistem Informasi Karang Taruna Kelurahan Manis Jaya',
  };

  const jsonString = typeof dataContent === 'string' ? dataContent : JSON.stringify(dataContent, null, 2);

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    jsonString +
    closeDelimiter;

  const uploadUrl =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,createdTime,modifiedTime,webViewLink&supportsAllDrives=true';

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal mengunggah berkas cadangan ke Google Drive.');
  }

  return await res.json();
};

/**
 * Downloads and parses JSON content of a backup file from Google Drive
 */
export const downloadBackupContentFromDrive = async (
  fileId: string,
  token: string
): Promise<any> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal mengunduh berkas dari Google Drive.');
  }

  return await res.json();
};

/**
 * Deletes a file from Google Drive (MUST be wrapped with confirmation UI before calling)
 */
export const deleteFileFromGoogleDrive = async (
  fileId: string,
  token: string
): Promise<void> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal menghapus berkas di Google Drive.');
  }
};

/**
 * Uploads a backup JSON payload directly to a Google Apps Script Webhook URL
 * without requiring OAuth verification or test user whitelisting
 */
export const uploadBackupViaWebhook = async (
  webhookUrl: string,
  payload: {
    fileName: string;
    folderId?: string;
    data: any;
  }
): Promise<{ status: string; fileId?: string; fileUrl?: string; message?: string }> => {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Gagal menghubungi Webhook Google Drive (HTTP ${response.status})`);
  }

  const resJson = await response.json().catch(() => ({ status: 'success' }));
  return resJson;
};

// --- Local Organization Database Collector & Restorer ---

export interface OrganizationBackupPayload {
  app: string;
  version: string;
  timestamp: string;
  kelurahan: string;
  metadata: {
    totalAset: number;
    totalAnggota: number;
    totalAgenda: number;
    totalSurat: number;
    exportedBy: string;
  };
  database: {
    assets: any;
    peminjaman: any;
    pemeliharaan: any;
    mutasi: any;
    pengadaan: any;
    penghapusan: any;
    stockOpname: any;
    dokumenAset: any;
    agenda: any;
    surat: any;
    members: any;
    users: any;
    kas: any;
    settings: Record<string, string>;
  };
}

/**
 * Collects all current operational data from localStorage into a structured backup bundle
 */
export const collectAllOrganizationData = (currentUserLabel: string): OrganizationBackupPayload => {
  const getJson = (key: string, fallback: any = []) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const assets = getJson('kt_assets_v1');
  const peminjaman = getJson('kt_peminjaman_v1');
  const pemeliharaan = getJson('kt_pemeliharaan_v1');
  const mutasi = getJson('kt_mutasi_v1');
  const pengadaan = getJson('kt_pengadaan_v1');
  const penghapusan = getJson('kt_penghapusan_v1');
  const stockOpname = getJson('kt_stock_opname_v1');
  const dokumenAset = getJson('kt_dokumen_v1');
  const agenda = getJson('kt_agenda_v1');
  const surat = getJson('kt_surat_items_v2');
  const members = getJson('kt_members_v3');
  const users = getJson('kt_users_v3');
  const kas = getJson('kt_kas_entries_v2');

  const settingsKeys = [
    'kt_org_name',
    'kt_org_address',
    'kt_org_kelurahan',
    'kt_org_kecamatan',
    'kt_org_kota',
    'kt_org_provinsi',
    'kt_email',
    'kt_telepon',
    'kt_website',
    'kt_custom_logo',
    'kt_google_drive_folder_url',
    'kt_google_drive_folder_id',
  ];

  const settings: Record<string, string> = {};
  settingsKeys.forEach((key) => {
    const val = localStorage.getItem(key);
    if (val !== null) settings[key] = val;
  });

  return {
    app: 'Sistem Informasi Karang Taruna Kelurahan Manis Jaya',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
    kelurahan: 'Manis Jaya, Cibodas, Kota Tangerang',
    metadata: {
      totalAset: Array.isArray(assets) ? assets.length : 0,
      totalAnggota: Array.isArray(members) ? members.length : 0,
      totalAgenda: Array.isArray(agenda) ? agenda.length : 0,
      totalSurat: Array.isArray(surat) ? surat.length : 0,
      exportedBy: currentUserLabel,
    },
    database: {
      assets,
      peminjaman,
      pemeliharaan,
      mutasi,
      pengadaan,
      penghapusan,
      stockOpname,
      dokumenAset,
      agenda,
      surat,
      members,
      users,
      kas,
      settings,
    },
  };
};

/**
 * Restores the application database from a backup payload
 */
export const restoreOrganizationData = (payload: OrganizationBackupPayload): void => {
  if (!payload || !payload.database) {
    throw new Error('Format berkas cadangan tidak valid atau rusak.');
  }

  const { database } = payload;

  const setItemSafe = (key: string, val: any) => {
    if (val !== undefined && val !== null) {
      if (typeof val === 'string') {
        localStorage.setItem(key, val);
      } else {
        localStorage.setItem(key, JSON.stringify(val));
      }
    }
  };

  setItemSafe('kt_assets_v1', database.assets);
  setItemSafe('kt_peminjaman_v1', database.peminjaman);
  setItemSafe('kt_pemeliharaan_v1', database.pemeliharaan);
  setItemSafe('kt_mutasi_v1', database.mutasi);
  setItemSafe('kt_pengadaan_v1', database.pengadaan);
  setItemSafe('kt_penghapusan_v1', database.penghapusan);
  setItemSafe('kt_stock_opname_v1', database.stockOpname);
  setItemSafe('kt_dokumen_v1', database.dokumenAset);
  setItemSafe('kt_agenda_v1', database.agenda);
  setItemSafe('kt_surat_items_v2', database.surat);
  setItemSafe('kt_members_v3', database.members);
  setItemSafe('kt_users_v3', database.users);
  setItemSafe('kt_kas_entries_v2', database.kas);

  if (database.settings && typeof database.settings === 'object') {
    Object.entries(database.settings).forEach(([k, v]) => {
      if (typeof v === 'string') {
        localStorage.setItem(k, v);
      }
    });
  }

  // Trigger custom window event so open components re-sync immediately
  window.dispatchEvent(new Event('kt_database_restored'));
};

// --- Local Backup Archive & History Tracker ---

export interface LocalBackupRecord {
  id: string;
  name: string;
  size: number;
  createdTime: string;
  note?: string;
  source: 'google_drive' | 'local_sync' | 'webhook';
  driveFolderId?: string;
  driveFolderUrl?: string;
  data: OrganizationBackupPayload;
}

const BACKUP_HISTORY_STORAGE_KEY = 'kt_backup_history_records_v1';

export const getLocalBackupRecords = (): LocalBackupRecord[] => {
  try {
    const raw = localStorage.getItem(BACKUP_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveLocalBackupRecord = (record: LocalBackupRecord): void => {
  try {
    const current = getLocalBackupRecords();
    const updated = [record, ...current.filter((r) => r.id !== record.id)].slice(0, 30);
    localStorage.setItem(BACKUP_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save local backup record', err);
  }
};

export const deleteLocalBackupRecord = (id: string): void => {
  try {
    const current = getLocalBackupRecords();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(BACKUP_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete local backup record', err);
  }
};

export const downloadJsonFile = (fileName: string, data: any): void => {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
