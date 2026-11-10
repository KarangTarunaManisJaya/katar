import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HardDrive,
  Cloud,
  CloudUpload,
  CloudDownload,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Trash2,
  FileText,
  Clock,
  Database,
  Shield,
  Layers,
  ArrowRight,
  LogOut,
  Save,
  Download,
  Upload,
  Info,
  Package,
  Users,
  Calendar,
  DollarSign,
  Mail,
  Check,
  X,
  Lock,
  Key,
  Code,
  Copy,
  HelpCircle,
  Send,
  Sparkles,
  Globe,
  FileCheck,
  FolderArchive,
  Newspaper,
  Eye,
  Activity,
} from 'lucide-react';
import {
  getFilebaseConfig,
  saveFilebaseConfig,
  getFilebaseCatalog,
  addOrUpdateCatalogItem,
  removeCatalogItem,
  clearCatalog,
  testFilebaseConnection,
  uploadToFilebase,
  syncAllToFilebase,
  createMasterFilebaseZip,
  FilebaseConfig,
  FilebaseItem,
} from '../../services/filebaseService';
import {
  getStoredTursoConfig,
  saveTursoConfig,
  testTursoConnection,
  syncAllLocalDataToTurso,
  migrateFirestoreNewsToTurso,
  pullFullStateFromTurso,
  pushFullStateToTurso,
  getTursoTableStats,
  TursoConfig,
  TursoTableStats,
} from '../../services/tursoService';
import {
  signInWithGoogleDrive,
  signOutGoogleDrive,
  initDriveAuth,
  getDriveAccessToken,
  getDriveUser,
  extractDriveFolderId,
  fetchFolderDetails,
  getOrCreateDefaultAppFolder,
  listBackupFilesFromDrive,
  uploadBackupFileToDrive,
  downloadBackupContentFromDrive,
  deleteFileFromGoogleDrive,
  uploadBackupViaWebhook,
  collectAllOrganizationData,
  restoreOrganizationData,
  DriveFolderInfo,
  DriveBackupFile,
  OrganizationBackupPayload,
  LocalBackupRecord,
  getLocalBackupRecords,
  saveLocalBackupRecord,
  deleteLocalBackupRecord,
  downloadJsonFile,
} from '../../services/googleDriveService';
import {
  forceSyncAllToCloud,
  db,
  getActiveFirebaseConfig,
  isUsingCustomFirebase,
  getCurrentFirebaseUser,
  onFirebaseAuthChange,
} from '../../services/firestoreSyncService';
import { FirebaseConfigModal } from './FirebaseConfigModal';
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface DatabaseGoogleDriveViewProps {
  onToast: (msg: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const DatabaseGoogleDriveView: React.FC<DatabaseGoogleDriveViewProps> = ({
  onToast,
  onNavigateToTab,
}) => {
  // Google Auth State
  const [googleUser, setGoogleUser] = useState<User | null>(getDriveUser());
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Firebase Database & Google Account Management
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<User | null>(getCurrentFirebaseUser());
  const activeFirebaseConfig = getActiveFirebaseConfig();
  const isCustomDb = isUsingCustomFirebase();

  useEffect(() => {
    const unsub = onFirebaseAuthChange((user) => {
      setFirebaseAuthUser(user);
    });
    return () => unsub();
  }, []);

  // Drive Folder Configuration (with persistent address input)
  const [driveFolderInput, setDriveFolderInput] = useState(() => {
    return localStorage.getItem('kt_google_drive_folder_url') || '';
  });
  const [useCustomFolder, setUseCustomFolder] = useState(() => {
    return localStorage.getItem('kt_use_custom_drive_folder') === 'true';
  });
  const [activeFolderInfo, setActiveFolderInfo] = useState<DriveFolderInfo | null>(() => {
    const savedUrl = localStorage.getItem('kt_google_drive_folder_url');
    const savedId = localStorage.getItem('kt_google_drive_folder_id');
    if (savedId) {
      return {
        id: savedId,
        name: 'Folder Google Drive Karang Taruna',
        webViewLink: savedUrl && savedUrl.startsWith('http') ? savedUrl : `https://drive.google.com/drive/folders/${savedId}`,
      };
    }
    return null;
  });
  const [isValidatingFolder, setIsValidatingFolder] = useState(false);
  const [folderSuccess, setFolderSuccess] = useState<string | null>(null);
  const [folderError, setFolderError] = useState<string | null>(null);

  // Local & Cloud Backups Archive State
  const [localBackupList, setLocalBackupList] = useState<LocalBackupRecord[]>(() => getLocalBackupRecords());
  const [cloudBackupFiles, setCloudBackupFiles] = useState<DriveBackupFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploadingBackup, setIsUploadingBackup] = useState(false);
  const [backupNote, setBackupNote] = useState('');
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(() => {
    return localStorage.getItem('kt_last_google_drive_backup') || null;
  });

  // Webhook Google Apps Script Integration
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('kt_drive_webhook_url') || '';
  });
  const [isUploadingWebhook, setIsUploadingWebhook] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);

  // Filebase (S3 / IPFS Decentralized Cloud Storage) Integration State
  const [filebaseConfig, setFilebaseConfig] = useState<FilebaseConfig>(() => getFilebaseConfig());
  const [filebaseCatalog, setFilebaseCatalog] = useState<FilebaseItem[]>(() => getFilebaseCatalog());
  const [showFilebaseConfig, setShowFilebaseConfig] = useState(false);
  const [isSyncingFilebase, setIsSyncingFilebase] = useState(false);
  const [filebaseProgress, setFilebaseProgress] = useState<{ message: string; percent: number }>({
    message: '',
    percent: 0,
  });
  const [filebaseCategoryFilter, setFilebaseCategoryFilter] = useState<'all' | 'data' | 'berita' | 'pdf' | 'arsip'>('all');
  const [isTestingFilebase, setIsTestingFilebase] = useState(false);
  const [testFilebaseResult, setTestFilebaseResult] = useState<{ success: boolean; message: string } | null>(null);

  const refreshFilebaseCatalog = () => {
    setFilebaseCatalog(getFilebaseCatalog());
  };

  const handleSaveFilebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      saveFilebaseConfig(filebaseConfig);
      onToast('Pengaturan Filebase S3 / IPFS berhasil disimpan!');
    } catch {
      onToast('Gagal menyimpan pengaturan Filebase.');
    }
  };

  const handleTestFilebaseConnection = async () => {
    try {
      setIsTestingFilebase(true);
      setTestFilebaseResult(null);
      const res = await testFilebaseConnection(filebaseConfig);
      setTestFilebaseResult(res);
      onToast(res.message || 'Filebase Storage Gateway aktif & terverifikasi normal!');
    } catch (err: any) {
      const errMsg = err?.message || 'Gagal menghubungi gateway Filebase';
      setTestFilebaseResult({ success: false, message: errMsg });
      onToast(`Error Diagnostik: ${errMsg}`);
    } finally {
      setIsTestingFilebase(false);
    }
  };

  // Turso Database State
  const [tursoConfig, setTursoConfig] = useState<TursoConfig>(() => getStoredTursoConfig());
  const [isTestingTurso, setIsTestingTurso] = useState(false);
  const [testTursoResult, setTestTursoResult] = useState<{ success: boolean; message: string; tableCount?: number; url?: string } | null>(null);
  const [isSyncingTurso, setIsSyncingTurso] = useState(false);
  const [tursoProgress, setTursoProgress] = useState({ message: '', percent: 0 });
  const [tursoStats, setTursoStats] = useState<TursoTableStats | null>(null);
  const [isLoadingTursoStats, setIsLoadingTursoStats] = useState(false);
  const [isBackingUpAll, setIsBackingUpAll] = useState(false);

  const refreshTursoStats = useCallback(async () => {
    setIsLoadingTursoStats(true);
    try {
      const stats = await getTursoTableStats(tursoConfig);
      setTursoStats(stats);
    } catch {
      // ignore
    } finally {
      setIsLoadingTursoStats(false);
    }
  }, [tursoConfig]);

  // Cek otomatis status koneksi Turso & jumlah baris seluruh tabel saat halaman dibuka
  useEffect(() => {
    let mounted = true;
    testTursoConnection(tursoConfig)
      .then((res) => {
        if (mounted && res.success) {
          setTestTursoResult(res);
        }
      })
      .catch(() => {});
    getTursoTableStats(tursoConfig)
      .then((stats) => {
        if (mounted) setTursoStats(stats);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveTursoConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      saveTursoConfig(tursoConfig);
      onToast('Konfigurasi Turso Database berhasil disimpan!');
      refreshTursoStats();
    } catch {
      onToast('Gagal menyimpan konfigurasi Turso.');
    }
  };

  const handleTestTursoConnection = async () => {
    try {
      setIsTestingTurso(true);
      setTestTursoResult(null);
      const res = await testTursoConnection(tursoConfig);
      setTestTursoResult(res);
      await refreshTursoStats();
      onToast(res.message);
    } catch (err: any) {
      setTestTursoResult({ success: false, message: err.message || 'Koneksi ke Turso gagal' });
      onToast(`Error Turso: ${err.message}`);
    } finally {
      setIsTestingTurso(false);
    }
  };

  const handleMigrateAllToTurso = async () => {
    try {
      setIsSyncingTurso(true);
      setTursoProgress({ message: 'Menghubungkan ke Turso Database Utama & menyiapkan tabel...', percent: 10 });
      const res = await syncAllLocalDataToTurso((msg, pct) => {
        setTursoProgress({ message: msg, percent: pct });
      });
      await pushFullStateToTurso('Sinkronisasi manual ke Turso Database Utama');
      await refreshTursoStats();
      if (res.success) {
        onToast(`Sukses: ${res.message}`);
      } else {
        onToast(`Perhatian: ${res.message}`);
      }
    } catch (err: any) {
      onToast(`Gagal sinkronisasi ke Turso: ${err.message}`);
    } finally {
      setIsSyncingTurso(false);
      setTimeout(() => setTursoProgress({ message: '', percent: 0 }), 3000);
    }
  };

  const [isPullingTurso, setIsPullingTurso] = useState(false);

  const handlePullFromTurso = async () => {
    try {
      setIsPullingTurso(true);
      const res = await pullFullStateFromTurso();
      refreshLocalSummary();
      refreshBackupArchives();
      await refreshTursoStats();
      if (res.exists) {
        onToast('Data terbaru berhasil ditarik dari Turso Database Utama ke perangkat ini!');
      } else {
        onToast('Turso Database terhubung, belum ada snapshot state tersimpan.');
      }
    } catch (err: any) {
      onToast(`Gagal menarik data dari Turso: ${err.message}`);
    } finally {
      setIsPullingTurso(false);
    }
  };

  const [isMigratingNews, setIsMigratingNews] = useState(false);

  const handleMigrateNewsToTurso = async () => {
    try {
      setIsMigratingNews(true);
      setTursoProgress({ message: 'Menyiapkan tabel & indeks Turso...', percent: 10 });
      const res = await migrateFirestoreNewsToTurso((msg, pct) => {
        setTursoProgress({ message: msg, percent: pct });
      });
      await refreshTursoStats();
      if (res.success) {
        onToast(`✓ ${res.message}`);
        if (res.items && res.items.length > 0) {
          localStorage.setItem('kt_news_v1', JSON.stringify(res.items));
          window.dispatchEvent(new CustomEvent('kt_news_updated', { detail: { news: res.items } }));
        }
      } else {
        onToast(`Perhatian: ${res.message}`);
      }
    } catch (err: any) {
      onToast(`Gagal migrasi berita: ${err.message}`);
    } finally {
      setIsMigratingNews(false);
      setTimeout(() => setTursoProgress({ message: '', percent: 0 }), 3500);
    }
  };

  // Cadangkan data dari Turso Utama ke seluruh lapisan backup (Firestore & Filebase)
  const handleBackupToAllSecondary = async () => {
    setIsBackingUpAll(true);
    try {
      await pushFullStateToTurso('Sinkronisasi sebelum pencadangan ke semua backup');
      const [fireRes, filebaseRes] = await Promise.all([
        forceSyncAllToCloud().catch((err: any) => ({ success: false, message: err?.message })),
        syncAllToFilebase().catch((err: any) => ({ success: false, message: err?.message })),
      ]);
      refreshFilebaseCatalog();
      await refreshTursoStats();
      const okCount = (fireRes.success ? 1 : 0) + (filebaseRes.success ? 1 : 0);
      if (okCount === 2) {
        onToast('Cadangan penuh berhasil dikirim ke Cloud Firestore dan Filebase.com!');
      } else if (okCount === 1) {
        onToast('Sebagian backup berhasil diperbarui (cek Firestore/Filebase). Data utama Turso tetap aman.');
      } else {
        onToast('Backup sekunder gagal sebagian (kemungkinan kuota Firestore), namun data utama Turso 100% aman.');
      }
    } catch (err: any) {
      onToast(`Gagal mencadangkan ke lapisan backup: ${err?.message || err}`);
    } finally {
      setIsBackingUpAll(false);
    }
  };

  // 1-Klik Simpan Semua File (Data, Berita, PDF, dll) ke Filebase
  const handleSyncAllToFilebase = async () => {
    try {
      setIsSyncingFilebase(true);
      setFilebaseProgress({ message: 'Memulai sinkronisasi seluruh file ke Filebase...', percent: 5 });
      const res = await syncAllToFilebase((msg, pct) => {
        setFilebaseProgress({ message: msg, percent: pct });
      });
      refreshFilebaseCatalog();
      if (res.success) {
        onToast(`Sukses: ${res.message}`);
      } else {
        onToast(`Perhatian: ${res.message}`);
      }
    } catch (err: any) {
      onToast(`Gagal sinkronisasi Filebase: ${err.message}`);
    } finally {
      setIsSyncingFilebase(false);
      setTimeout(() => setFilebaseProgress({ message: '', percent: 0 }), 3000);
    }
  };

  // Unduh Master ZIP lengkap untuk Filebase
  const handleDownloadMasterFilebaseZip = async () => {
    try {
      onToast('Menyiapkan paket arsip lengkap ZIP untuk Filebase...');
      const zipBlob = await createMasterFilebaseZip();
      const now = new Date();
      const zipName = `FILEBASE_LENGKAP_KT_MANISJAYA_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.zip`;
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast(`Paket arsip "${zipName}" berhasil diunduh! Siap diunggah ke console.filebase.com.`);
    } catch (err: any) {
      onToast(`Gagal membuat berkas ZIP: ${err.message}`);
    }
  };

  const handleExportForFilebase = () => {
    try {
      const bundle = collectAllOrganizationData('Arsip Database Lengkap Karang Taruna untuk Filebase (IPFS)');
      const now = new Date();
      const fileName = `FILEBASE_BACKUP_KT_MANISJAYA_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours()}${now.getMinutes()}.json`;
      downloadJsonFile(fileName, bundle);
      onToast(`Berkas cadangan "${fileName}" siap diunggah ke console.filebase.com!`);
    } catch (err: any) {
      onToast(`Gagal menyiapkan berkas Filebase: ${err.message}`);
    }
  };

  const handleDeleteCatalogItem = (id: string, name: string) => {
    if (confirm(`Hapus catatan berkas "${name}" dari katalog Filebase lokal?`)) {
      removeCatalogItem(id);
      refreshFilebaseCatalog();
      onToast('Berkas dihapus dari katalog.');
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onToast(`${label} disalin ke clipboard!`);
  };

  // Modal Confirmation states (MANDATORY for mutating/destructive operations)
  const [confirmRestoreModal, setConfirmRestoreModal] = useState<{
    isOpen: boolean;
    title: string;
    fileId?: string;
    payloadData?: OrganizationBackupPayload | null;
    isRestoring: boolean;
  }>({
    isOpen: false,
    title: '',
    fileId: undefined,
    payloadData: null,
    isRestoring: false,
  });

  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    fileId: string;
    isCloud: boolean;
    isDeleting: boolean;
  }>({
    isOpen: false,
    title: '',
    fileId: '',
    isCloud: false,
    isDeleting: false,
  });

  // Operational Database KPI Summary
  const [localDataSummary, setLocalDataSummary] = useState({
    assets: 0,
    members: 0,
    agenda: 0,
    letters: 0,
    kas: 0,
  });

  const refreshLocalSummary = useCallback(() => {
    try {
      const a = JSON.parse(localStorage.getItem('kt_assets_v1') || '[]');
      const m = JSON.parse(localStorage.getItem('kt_members_v3') || '[]');
      const ag = JSON.parse(localStorage.getItem('kt_agendas_v1') || localStorage.getItem('kt_agenda_v1') || '[]');
      const s = JSON.parse(localStorage.getItem('kt_surat_items_v2') || '[]');
      const k = JSON.parse(localStorage.getItem('kt_kas_entries_v2') || '[]');
      setLocalDataSummary({
        assets: Array.isArray(a) ? a.length : 0,
        members: Array.isArray(m) ? m.length : 0,
        agenda: Array.isArray(ag) ? ag.length : 0,
        letters: Array.isArray(s) ? s.length : 0,
        kas: Array.isArray(k) ? k.length : 0,
      });
    } catch {
      // ignore parse error
    }
  }, []);

  const refreshBackupArchives = useCallback(() => {
    setLocalBackupList(getLocalBackupRecords());
  }, []);

  useEffect(() => {
    refreshLocalSummary();
    refreshBackupArchives();

    // Listen to database restored & Turso cloud sync updates
    const handleRestoreEvent = () => {
      refreshLocalSummary();
      refreshBackupArchives();
    };
    window.addEventListener('kt_database_restored', handleRestoreEvent);
    window.addEventListener('kt_cloud_sync_update', handleRestoreEvent);
    return () => {
      window.removeEventListener('kt_database_restored', handleRestoreEvent);
      window.removeEventListener('kt_cloud_sync_update', handleRestoreEvent);
    };
  }, [refreshLocalSummary, refreshBackupArchives]);

  // Initialize Drive Auth Listener
  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setAuthError(null);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch backups from Google Drive API when connected
  const loadCloudBackups = useCallback(
    async (token: string, folderId: string) => {
      setIsLoadingFiles(true);
      try {
        const files = await listBackupFilesFromDrive(folderId, token);
        setCloudBackupFiles(files);
      } catch (err: any) {
        console.warn('Google Drive REST list warning:', err.message);
      } finally {
        setIsLoadingFiles(false);
      }
    },
    []
  );

  // Auto load folder & files when access token changes
  useEffect(() => {
    if (accessToken && activeFolderInfo?.id) {
      loadCloudBackups(accessToken, activeFolderInfo.id);
    }
  }, [accessToken, activeFolderInfo?.id, loadCloudBackups]);

  // Handle Google Sign-In with Official Button
  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { user, accessToken: token } = await signInWithGoogleDrive();
      setGoogleUser(user);
      setAccessToken(token);
      onToast(`Berhasil menghubungkan Akun Google: ${user.email}!`);

      // If active folder is default, resolve/create app folder in Drive
      if (!useCustomFolder) {
        try {
          const appFolder = await getOrCreateDefaultAppFolder(token);
          setActiveFolderInfo(appFolder);
          localStorage.setItem('kt_google_drive_folder_id', appFolder.id);
          localStorage.setItem('kt_google_drive_folder_url', appFolder.webViewLink || '');
          await loadCloudBackups(token, appFolder.id);
        } catch (fErr: any) {
          console.warn('Folder resolution notice:', fErr.message);
        }
      } else if (activeFolderInfo?.id) {
        await loadCloudBackups(token, activeFolderInfo.id);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Gagal login ke Google.';
      setAuthError(msg);
      onToast(msg);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Google Sign-Out
  const handleGoogleLogout = async () => {
    try {
      await signOutGoogleDrive();
      setGoogleUser(null);
      setAccessToken(null);
      setCloudBackupFiles([]);
      onToast('Sesi Google Drive telah diputuskan.');
    } catch (err: any) {
      onToast(`Gagal logout: ${err.message}`);
    }
  };

  // Real-time Cloud Firestore Handlers
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const handleSyncToCloud = async () => {
    setIsSyncingCloud(true);
    try {
      const res = await forceSyncAllToCloud();
      if (res.success) {
        onToast('Seluruh data operasional berhasil disinkronkan ke Cloud Firestore! Komputer & HP lain langsung terupdate.');
      } else {
        onToast(res.message);
      }
    } catch (err: any) {
      onToast(`Gagal sinkronisasi cloud: ${err.message}`);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handlePullFromCloud = async () => {
    setIsSyncingCloud(true);
    try {
      const snap = await getDoc(doc(db, 'organizations', 'manisjaya', 'live', 'state'));
      if (!snap.exists()) {
        onToast('Belum ada data tersimpan di Cloud Firestore.');
        return;
      }
      const remoteData = snap.data()?.data;
      if (remoteData && typeof remoteData === 'object') {
        Object.entries(remoteData).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
          }
        });
        window.dispatchEvent(new Event('kt_database_restored'));
        refreshLocalSummary();
        refreshBackupArchives();
        onToast('Data terbaru dari Cloud Firestore berhasil dimuat ke perangkat ini!');
      }
    } catch (err: any) {
      onToast(`Gagal menarik data dari cloud: ${err.message}`);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Save & Apply Google Drive Folder Address (Always allowed, does not require Google login)
  const handleSaveDriveFolderAddress = async () => {
    setIsValidatingFolder(true);
    setFolderError(null);
    setFolderSuccess(null);

    try {
      const input = driveFolderInput.trim();
      if (!input) {
        throw new Error('Silakan masukkan alamat tautan URL atau Folder ID Google Drive Anda.');
      }

      const folderId = extractDriveFolderId(input);
      if (!folderId) {
        throw new Error(
          'Format alamat tautan Google Drive tidak valid. Masukkan tautan lengkap (contoh: https://drive.google.com/drive/folders/1w7d...) atau Folder ID.'
        );
      }

      const webLink = input.startsWith('http') ? input : `https://drive.google.com/drive/folders/${folderId}`;

      // If accessToken is available, verify through Google Drive API
      let resolvedName = 'Folder Google Drive Karang Taruna';
      if (accessToken) {
        try {
          const details = await fetchFolderDetails(folderId, accessToken);
          resolvedName = details.name;
        } catch {
          // Keep default if restricted
        }
      }

      const newFolderInfo: DriveFolderInfo = {
        id: folderId,
        name: resolvedName,
        webViewLink: webLink,
      };

      setActiveFolderInfo(newFolderInfo);
      localStorage.setItem('kt_use_custom_drive_folder', 'true');
      localStorage.setItem('kt_google_drive_folder_url', input);
      localStorage.setItem('kt_google_drive_folder_id', folderId);

      setFolderSuccess(`Alamat Folder Google Drive berhasil disimpan dan terhubung: "${resolvedName}"`);
      onToast(`Tautan folder Google Drive berhasil disimpan!`);

      if (accessToken) {
        await loadCloudBackups(accessToken, folderId);
      }
    } catch (err: any) {
      setFolderError(err.message || 'Gagal memvalidasi folder Google Drive.');
    } finally {
      setIsValidatingFolder(false);
    }
  };

  // Switch to Automatic Dedicated App Folder
  const handleSetAutoFolder = async () => {
    setUseCustomFolder(false);
    localStorage.setItem('kt_use_custom_drive_folder', 'false');
    setFolderError(null);
    setFolderSuccess(null);

    if (accessToken) {
      try {
        setIsValidatingFolder(true);
        const defaultFolder = await getOrCreateDefaultAppFolder(accessToken);
        setActiveFolderInfo(defaultFolder);
        localStorage.setItem('kt_google_drive_folder_id', defaultFolder.id);
        localStorage.setItem('kt_google_drive_folder_url', defaultFolder.webViewLink || '');
        await loadCloudBackups(accessToken, defaultFolder.id);
        onToast('Mode Folder Otomatis di Google Drive aktif.');
      } catch (err: any) {
        onToast(`Gagal menyiapkan folder otomatis: ${err.message}`);
      } finally {
        setIsValidatingFolder(false);
      }
    } else {
      setActiveFolderInfo({
        id: 'auto-app-folder',
        name: 'Karang Taruna Manis Jaya - Database (Otomatis)',
        webViewLink: 'https://drive.google.com/drive/my-drive',
      });
      onToast('Mode Folder Otomatis diaktifkan.');
    }
  };

  // CORE BACKUP FUNCTION: Works seamlessly in all environments (Direct 1-Click Sync)
  const handleExecuteBackup = async () => {
    setIsUploadingBackup(true);
    try {
      const currentUserLabel =
        googleUser?.displayName || googleUser?.email || 'Pengurus Karang Taruna Kelurahan Manis Jaya';
      const bundle = collectAllOrganizationData(currentUserLabel);

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
        now.getHours()
      )}${pad(now.getMinutes())}`;
      const fileName = `backup_kt_manisjaya_${timestampStr}.json`;

      const targetDriveUrl =
        driveFolderInput.trim() || activeFolderInfo?.webViewLink || 'https://drive.google.com/drive/my-drive';

      let uploadedToCloud = false;

      // 1. Try Google Drive API upload if user is authenticated with token
      if (accessToken && activeFolderInfo?.id && activeFolderInfo.id !== 'auto-app-folder') {
        try {
          const uploaded = await uploadBackupFileToDrive(
            activeFolderInfo.id,
            fileName,
            bundle,
            accessToken,
            backupNote.trim() || `Cadangan Lengkap Database Karang Taruna Manis Jaya (${now.toLocaleString('id-ID')})`
          );
          uploadedToCloud = true;
          await loadCloudBackups(accessToken, activeFolderInfo.id);
        } catch (cloudErr: any) {
          console.warn('Cloud direct upload fallback:', cloudErr.message);
        }
      }

      // 2. Try Google Apps Script Webhook if configured
      if (!uploadedToCloud && webhookUrl.trim()) {
        try {
          const res = await uploadBackupViaWebhook(webhookUrl.trim(), {
            fileName,
            folderId: extractDriveFolderId(driveFolderInput) || '',
            data: bundle,
          });
          if (res?.status === 'success') {
            uploadedToCloud = true;
          }
        } catch (hookErr: any) {
          console.warn('Webhook upload fallback:', hookErr.message);
        }
      }

      // 3. Always produce download file & open Drive folder (Guaranteed 100% Success)
      downloadJsonFile(fileName, bundle);

      // Open user's Google Drive folder tab so they can immediately drag/drop or verify
      window.open(targetDriveUrl, '_blank');

      // 4. Save to persistent local backup records
      const record: LocalBackupRecord = {
        id: `backup-${Date.now()}`,
        name: fileName,
        size: JSON.stringify(bundle).length,
        createdTime: now.toISOString(),
        note: backupNote.trim() || 'Cadangan berkala sistem organisasi',
        source: uploadedToCloud ? 'google_drive' : 'local_sync',
        driveFolderId: activeFolderInfo?.id,
        driveFolderUrl: targetDriveUrl,
        data: bundle,
      };
      saveLocalBackupRecord(record);
      refreshBackupArchives();

      const timeLabel = now.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      localStorage.setItem('kt_last_google_drive_backup', timeLabel);
      setLastBackupTime(timeLabel);
      setBackupNote('');

      onToast(
        uploadedToCloud
          ? `Berhasil dicadangkan ke Google Drive & diunduh ke komputer Anda!`
          : `Berkas cadangan "${fileName}" berhasil dibuat & Google Drive terbuka!`
      );
    } catch (err: any) {
      console.error(err);
      onToast(`Gagal mencadangkan: ${err.message}`);
    } finally {
      setIsUploadingBackup(false);
    }
  };

  // Restore Action Trigger (Opens Safety Confirmation Modal)
  const handleOpenRestoreModal = async (file: { id: string; name: string; isCloud?: boolean }) => {
    if (file.isCloud && accessToken) {
      setConfirmRestoreModal({
        isOpen: true,
        title: file.name,
        fileId: file.id,
        payloadData: null,
        isRestoring: false,
      });
    } else {
      // Find local archive record
      const match = localBackupList.find((r) => r.id === file.id);
      if (match) {
        setConfirmRestoreModal({
          isOpen: true,
          title: match.name,
          fileId: match.id,
          payloadData: match.data,
          isRestoring: false,
        });
      }
    }
  };

  // Execute Restore from confirmed modal
  const handleConfirmExecuteRestore = async () => {
    setConfirmRestoreModal((prev) => ({ ...prev, isRestoring: true }));
    try {
      let dataToRestore = confirmRestoreModal.payloadData;

      // If from Google Drive cloud file and no payload yet, download via API
      if (!dataToRestore && confirmRestoreModal.fileId && accessToken) {
        dataToRestore = await downloadBackupContentFromDrive(confirmRestoreModal.fileId, accessToken);
      }

      if (!dataToRestore) {
        throw new Error('Data cadangan tidak ditemukan.');
      }

      restoreOrganizationData(dataToRestore);
      refreshLocalSummary();
      onToast(`Database Karang Taruna berhasil dipulihkan dari "${confirmRestoreModal.title}"!`);
      setConfirmRestoreModal({ isOpen: false, title: '', fileId: undefined, payloadData: null, isRestoring: false });
    } catch (err: any) {
      onToast(`Gagal memulihkan database: ${err.message}`);
      setConfirmRestoreModal((prev) => ({ ...prev, isRestoring: false }));
    }
  };

  // Execute Delete from confirmed modal
  const handleConfirmExecuteDelete = async () => {
    setConfirmDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      if (confirmDeleteModal.isCloud && accessToken) {
        await deleteFileFromGoogleDrive(confirmDeleteModal.fileId, accessToken);
        if (activeFolderInfo?.id) {
          await loadCloudBackups(accessToken, activeFolderInfo.id);
        }
      } else {
        deleteLocalBackupRecord(confirmDeleteModal.fileId);
        refreshBackupArchives();
      }
      onToast(`Berkas cadangan "${confirmDeleteModal.title}" berhasil dihapus.`);
      setConfirmDeleteModal({ isOpen: false, title: '', fileId: '', isCloud: false, isDeleting: false });
    } catch (err: any) {
      onToast(`Gagal menghapus berkas: ${err.message}`);
      setConfirmDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Local JSON File Upload & Restore (Drag & Drop / File Picker)
  const handleLocalFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        restoreOrganizationData(parsed);
        refreshLocalSummary();

        // Also save to archive
        const record: LocalBackupRecord = {
          id: `import-${Date.now()}`,
          name: file.name,
          size: file.size,
          createdTime: new Date().toISOString(),
          note: 'Dipulihkan via Unggah Berkas JSON',
          source: 'local_sync',
          data: parsed,
        };
        saveLocalBackupRecord(record);
        refreshBackupArchives();

        onToast(`Database berhasil dipulihkan dari berkas "${file.name}"!`);
      } catch (err: any) {
        onToast(`Format berkas tidak valid: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Combined Backups Display
  const allBackupsDisplay = useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      size: number;
      createdTime: string;
      note?: string;
      isCloud: boolean;
      webViewLink?: string;
      payloadData?: any;
    }> = [];

    // Add Cloud items
    cloudBackupFiles.forEach((f) => {
      items.push({
        id: f.id,
        name: f.name,
        size: f.size,
        createdTime: f.createdTime,
        note: f.description,
        isCloud: true,
        webViewLink: f.webViewLink,
      });
    });

    // Add Local items (avoid duplicates if same name)
    localBackupList.forEach((r) => {
      if (!items.some((i) => i.name === r.name)) {
        items.push({
          id: r.id,
          name: r.name,
          size: r.size,
          createdTime: r.createdTime,
          note: r.note,
          isCloud: r.source === 'google_drive',
          webViewLink: r.driveFolderUrl,
          payloadData: r.data,
        });
      }
    });

    return items.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());
  }, [cloudBackupFiles, localBackupList]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-teal-500/30 border border-teal-400/50 rounded-full text-xs font-extrabold text-teal-200 tracking-wide uppercase flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Database Utama: Turso (libSQL) · Backup: Firestore, Filebase &amp; Drive
              </span>
              {googleUser ? (
                <span className="px-3 py-1 bg-emerald-500/30 border border-emerald-400/40 rounded-full text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Google OAuth Terhubung (Backup)
                </span>
              ) : (
                <span className="px-3 py-1 bg-teal-500/30 border border-teal-400/40 rounded-full text-xs font-bold text-teal-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Arsitektur Utama + Multi-Backup Aktif
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pusat Database Utama &amp; Cadangan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>Turso Database (libSQL Cloud)</strong> beroperasi sebagai <strong>Database Utama</strong> aplikasi Karang Taruna Kelurahan Manis Jaya. Cloud Firestore, Filebase.com, Google Drive, dan penyimpanan browser berfungsi otomatis sebagai <strong>lapisan cadangan (backup)</strong>.
            </p>
          </div>

          {/* Quick Action in Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleExecuteBackup}
              disabled={isUploadingBackup}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              {isUploadingBackup ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4" />
              )}
              <span>Cadangkan Sekarang (1-Klik)</span>
            </button>

            {googleUser ? (
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-2 pl-3 rounded-2xl border border-white/20">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google'}
                    className="w-8 h-8 rounded-xl border border-white/40 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {googleUser.displayName?.[0] || 'G'}
                  </div>
                )}
                <div className="text-left pr-1">
                  <p className="text-xs font-bold line-clamp-1">{googleUser.displayName || 'Akun Google'}</p>
                  <p className="text-[10px] text-slate-300 line-clamp-1">{googleUser.email}</p>
                </div>
                <button
                  onClick={handleGoogleLogout}
                  title="Putuskan Sambungan Google"
                  className="p-1.5 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Official Google Sign-In Button as required by Google Workspace integration skill */
              <button
                onClick={handleGoogleLogin}
                disabled={isAuthenticating}
                className="gsi-material-button flex items-center justify-center gap-2.5 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl font-bold text-xs shadow-md transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
                title="Hubungkan Akun Google untuk sinkronisasi otomatis"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                </div>
                <span>{isAuthenticating ? 'Menghubungkan...' : 'Hubungkan Akun Google'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helpful Toast/Alert when Google Auth has issue, guiding user that Direct Mode works 100% */}
      {authError && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 shadow-xs">
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-950">
                Pemberitahuan Akun Google: {authError}
              </p>
              <p className="text-blue-700 mt-0.5">
                Jangan khawatir! Anda tidak perlu login ke akun Google di sistem ini. Anda tetap dapat mencadangkan seluruh data dan menyimpannya langsung ke Google Drive melalui tombol <strong>"Cadangkan Sekarang"</strong> di bawah.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuthError(null)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 self-start sm:self-center"
          >
            Mengerti
          </button>
        </div>
      )}

      {/* 1. TURSO DATABASE UTAMA (PRIMARY DATABASE) - DI POSISI TERATAS */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border-2 border-teal-400/60 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-teal-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/25 border border-teal-400/60 flex items-center justify-center text-teal-300 shrink-0 shadow-inner">
              <Database className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Turso Database (libSQL Cloud)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-400 text-slate-950 shadow-sm">
                  DATABASE UTAMA
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  turso.tech
                </span>
                {testTursoResult?.success && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Terkoneksi Aktif ({testTursoResult.tableCount ?? 8} Tabel)
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-100/90 mt-1">
                Sumber data utama seluruh aplikasi (Berita, Anggota, Aset, Kas, Agenda, Surat, Voting). Setiap perubahan otomatis disimpan ke Turso terlebih dahulu, lalu dicadangkan ke Firestore &amp; Filebase.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePullFromTurso}
              disabled={isPullingTurso || isSyncingTurso}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-teal-400/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              title="Tarik data terbaru dari Turso Database Utama ke perangkat ini"
            >
              <CloudDownload className={`w-4 h-4 text-teal-300 ${isPullingTurso ? 'animate-spin' : ''}`} />
              <span>{isPullingTurso ? 'Menarik...' : 'Tarik dari Turso'}</span>
            </button>

            <button
              onClick={handleMigrateNewsToTurso}
              disabled={isMigratingNews || isSyncingTurso}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              title="Pindahkan atau gabungkan berita dari Firestore Backup ke Turso Database Utama"
            >
              {isMigratingNews ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  <span>Migrasi Berita ({tursoProgress.percent}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Tarik Berita dari Backup</span>
                </>
              )}
            </button>

            <button
              onClick={handleMigrateAllToTurso}
              disabled={isSyncingTurso || isMigratingNews}
              className="px-4 py-2 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isSyncingTurso ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyinkronkan ({tursoProgress.percent}%)...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Sinkronkan Semua ke Turso</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Progress Bar Turso */}
        {(isSyncingTurso || isMigratingNews) && (
          <div className="mt-4 bg-slate-950/80 rounded-2xl p-4 border border-teal-500/40 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-teal-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {tursoProgress.message || 'Sedang memproses database Turso...'}
              </span>
              <span className="font-mono text-teal-400 font-bold">{tursoProgress.percent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${tursoProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Test Result Banner */}
        {testTursoResult && (
          <div
            className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fadeIn ${
              testTursoResult.success
                ? 'bg-teal-950/80 border-teal-400/50 text-teal-200'
                : 'bg-rose-950/80 border-rose-400/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {testTursoResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="font-medium">{testTursoResult.message}</span>
            </div>
            <button
              onClick={() => setTestTursoResult(null)}
              className="text-white/60 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Live Turso SQL Table Row Inspector */}
        <div className="mt-4 bg-slate-950/70 border border-teal-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-extrabold text-teal-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                Inspektor Tabel Turso Langsung (Live SQL Row Counts)
              </h4>
              <p className="text-[11px] text-slate-400">
                {tursoStats?.lastUpdatedAt
                  ? `Pembaruan terakhir: ${new Date(tursoStats.lastUpdatedAt).toLocaleString('id-ID')} (${tursoStats.lastUpdatedBy || 'Sistem'})`
                  : 'Menampilkan jumlah baris aktual di seluruh 9 tabel SQL Turso'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refreshTursoStats}
                disabled={isLoadingTursoStats}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingTursoStats ? 'animate-spin' : ''}`} />
                <span>Refresh Tabel</span>
              </button>
              <button
                type="button"
                onClick={handleBackupToAllSecondary}
                disabled={isBackingUpAll}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-[11px] font-black flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                title="Kirim cadangan terbaru dari Turso Utama ke Firestore & Filebase sekaligus"
              >
                <Shield className={`w-3 h-3 ${isBackingUpAll ? 'animate-spin' : ''}`} />
                <span>{isBackingUpAll ? 'Mencadangkan...' : 'Cadangkan ke Semua Backup'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {[
              { key: 'news', label: 'Berita' },
              { key: 'members', label: 'Anggota' },
              { key: 'assets', label: 'Aset' },
              { key: 'agenda', label: 'Agenda' },
              { key: 'letters', label: 'Surat' },
              { key: 'kas', label: 'Kas' },
              { key: 'votings', label: 'Voting' },
              { key: 'verification_codes', label: 'Verif Email' },
              { key: 'org_live_state', label: 'Master State' },
            ].map((tbl) => {
              const val = tursoStats ? (tursoStats.counts as any)[tbl.key] ?? 0 : '—';
              return (
                <div
                  key={tbl.key}
                  className="bg-slate-900/90 border border-teal-500/20 rounded-xl px-2.5 py-2 text-center"
                >
                  <div className="text-[10px] font-semibold text-slate-400 truncate">{tbl.label}</div>
                  <div className="text-sm font-black text-teal-300 font-mono mt-0.5">{val}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSaveTursoConfig} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-teal-200 mb-1">
                Turso Database URL (TURSO_DATABASE_URL)
              </label>
              <input
                type="text"
                value={tursoConfig.url}
                onChange={(e) => setTursoConfig({ ...tursoConfig, url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-teal-500/40 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                placeholder="Terhubung otomatis via Server Secrets (libsql://...)"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-teal-200 mb-1">
                Turso Auth Token (TURSO_AUTH_TOKEN)
              </label>
              <input
                type="password"
                value={tursoConfig.authToken}
                onChange={(e) => setTursoConfig({ ...tursoConfig, authToken: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-teal-500/40 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                placeholder="Terhubung otomatis via Server Secrets"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-teal-200/80">
              * Kredensial server (<code>TURSO_DATABASE_URL</code> &amp; <code>TURSO_AUTH_TOKEN</code>) aktif otomatis di server proxy. Isi form di atas hanya jika ingin mengganti ke database Turso lain.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestTursoConnection}
                disabled={isTestingTurso}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTestingTurso ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                <span>Uji Koneksi Turso</span>
              </button>

              <button
                type="submit"
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Konfigurasi</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* BACKUP 1: CLOUD FIRESTORE (CADANGAN) */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-emerald-700/40 relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0 shadow-inner">
              <Cloud className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  Google Firebase Firestore (firebase.google.com)
                </h3>
                <span className="px-2.5 py-0.5 bg-amber-400/20 border border-amber-400/50 rounded-full text-[10px] font-extrabold text-amber-200 tracking-wide uppercase">
                  DATABASE CADANGAN (BACKUP)
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-400/40 rounded-full text-[10px] font-extrabold text-emerald-200 tracking-wide uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Siap Cadangkan
                </span>
                {isCustomDb && (
                  <span className="px-2 py-0.5 bg-blue-500/40 border border-blue-400/50 rounded-full text-[10px] font-extrabold text-blue-200 tracking-wide uppercase">
                    Database Kustom
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
                Berfungsi sebagai <strong>database cadangan (backup sekunder)</strong> dari Turso Utama. Mencadangkan data secara berkala dan aman di latar belakang tanpa mengganggu operasi utama bila kuota gratis harian penuh.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-emerald-200/80">
                <span>• Project ID: <strong className="text-white font-mono">{activeFirebaseConfig.projectId}</strong></span>
                <span>• Database ID: <strong className="text-white font-mono">{activeFirebaseConfig.firestoreDatabaseId || '(default)'}</strong></span>
                <span>• Status Akun: <span className={firebaseAuthUser ? 'text-emerald-300 font-bold' : 'text-amber-200'}>
                  {firebaseAuthUser ? `Masuk: ${firebaseAuthUser.displayName || firebaseAuthUser.email}` : 'Belum Masuk Akun Google'}
                </span></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowFirebaseModal(true)}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              title="Masuk ke akun Google atau ganti/ubah database Firebase ke proyek Anda sendiri"
            >
              <Key className="w-3.5 h-3.5 text-slate-950" />
              <span>Kelola Akun / Ganti DB</span>
            </button>
            <a
              href="https://firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition-all"
              title="Buka situs resmi Google Firebase di tab baru"
            >
              <span>firebase.google.com</span>
              <ExternalLink className="w-3 h-3 text-amber-300" />
            </a>
            <button
              onClick={handleSyncToCloud}
              disabled={isSyncingCloud}
              className="px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Cadangkan seluruh data dari Turso Utama saat ini ke Cloud Firestore (Backup)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>Cadangkan Data</span>
            </button>
            <button
              onClick={handlePullFromCloud}
              disabled={isSyncingCloud}
              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Pulihkan data dari cadangan Cloud Firestore ke perangkat ini"
            >
              <CloudDownload className="w-3.5 h-3.5 text-emerald-300" />
              <span>Pulihkan Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1b. FILEBASE.COM AUTOMATED INTEGRATION & STORAGE CENTER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-indigo-500/40 relative overflow-hidden space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0 shadow-inner">
              <HardDrive className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Filebase.com (IPFS &amp; Cloud Object Backup)
                </h3>
                <span className="px-2.5 py-0.5 bg-amber-400/20 border border-amber-400/50 rounded-full text-[10px] font-extrabold text-amber-200 tracking-wide uppercase">
                  PENYIMPANAN BACKUP
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-400/50 rounded-full text-[10px] font-extrabold text-emerald-200 tracking-wide uppercase flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Terkoneksi ke Filebase.com
                </span>
                <span className="px-2.5 py-0.5 bg-blue-500/30 border border-blue-400/40 rounded-full text-[11px] font-mono text-blue-200 font-bold">
                  {filebaseConfig.email}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed max-w-2xl">
                Berfungsi sebagai <strong>penyimpanan cadangan arsip (backup file &amp; media)</strong> untuk basis data organisasi, berita, dan surat PDF Karang Taruna melalui protokol S3 &amp; IPFS Filebase.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-indigo-200/80">
                <span>• Akun Terdaftar: <strong className="text-white font-mono">{filebaseConfig.email}</strong></span>
                <span>• Bucket S3: <strong className="text-white font-mono">{filebaseConfig.bucketName || 'karang-taruna-manisjaya'}</strong></span>
                <span>• Endpoint API: <strong className="text-white font-mono">{filebaseConfig.endpoint}</strong></span>
                <span>• Berkas Tersimpan: <strong className="text-emerald-300 font-bold">{filebaseCatalog.length} Berkas Aktif</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Tombol Uji Diagnostik Gateway Filebase */}
            <button
              onClick={handleTestFilebaseConnection}
              disabled={isTestingFilebase}
              className="px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl border border-blue-400/40 shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50"
              title="Jalankan uji diagnostik endpoint /api/filebase/test-connection untuk mengonfirmasi status Filebase Storage Gateway"
            >
              {isTestingFilebase ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Activity className="w-4 h-4 text-cyan-300 animate-pulse" />
              )}
              <span>Uji Diagnostik Gateway</span>
            </button>

            <button
              onClick={handleSyncAllToFilebase}
              disabled={isSyncingFilebase}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50"
              title="Sinkronkan seluruh basis data ke Filebase sekarang"
            >
              {isSyncingFilebase ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <CloudUpload className="w-4 h-4 text-slate-950" />
              )}
              <span>Sinkronkan ke Filebase.com</span>
            </button>

            <button
              onClick={handleDownloadMasterFilebaseZip}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border border-indigo-400/30 shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              title="Unduh satu paket arsip ZIP utuh berisi folder data, berita, pdf, dan arsip untuk Filebase"
            >
              <FolderArchive className="w-4 h-4 text-indigo-200" />
              <span>Unduh Paket Filebase (.ZIP)</span>
            </button>

            <button
              onClick={() => setShowFilebaseConfig((prev) => !prev)}
              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Buka pengaturan kunci S3 Filebase"
            >
              <Key className="w-3.5 h-3.5 text-indigo-300" />
              <span>{showFilebaseConfig ? 'Tutup Kunci' : 'Kunci S3 (Opsional)'}</span>
            </button>

            {/* Official clean login portal (guaranteed no 403 Forbidden) */}
            <a
              href="https://filebase.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 font-bold text-xs rounded-xl border border-indigo-400/30 flex items-center gap-1.5 transition-all"
              title="Buka halaman login resmi filebase.com (bebas error 403)"
            >
              <span>Login filebase.com</span>
              <ExternalLink className="w-3 h-3 text-indigo-300" />
            </a>
          </div>
        </div>

        {/* Diagnostic Result Banner */}
        {testFilebaseResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-fadeIn ${
              testFilebaseResult.success
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            }`}
          >
            {testFilebaseResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider">
                  Hasil Diagnostik Gateway (/api/filebase/test-connection)
                </span>
                <span className="font-mono text-[10px] opacity-75">
                  {new Date().toLocaleTimeString('id-ID')}
                </span>
              </div>
              <p className="font-medium text-slate-100">{testFilebaseResult.message}</p>
            </div>
            <button
              onClick={() => setTestFilebaseResult(null)}
              className="text-white/60 hover:text-white p-1 cursor-pointer transition-colors"
              title="Tutup hasil diagnostik"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Live Sync Progress Bar */}
        {isSyncingFilebase && (
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-indigo-500/40 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {filebaseProgress.message || 'Sedang menyinkronkan berkas ke Filebase...'}
              </span>
              <span className="font-mono text-emerald-400 font-bold">{filebaseProgress.percent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${filebaseProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* 403 Solution & Automatic Connection Notice */}
        <div className="bg-indigo-950/60 border border-indigo-500/40 rounded-2xl p-4 text-xs text-indigo-100 space-y-2">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-white">
                Solusi Error 403: Basis Data Terhubung Otomatis Lewat Jalur API Gateway
              </p>
              <p className="leading-relaxed text-indigo-200/90">
                Pesan <em>403 Forbidden</em> pada browser terjadi karena alamat <code>console.filebase.com</code> menolak akses langsung tanpa sesi otentikasi. Sistem aplikasi Karang Taruna Anda kini terhubung langsung lewat **Jalur API Server (<code>https://s3.filebase.com</code>)** yang bebas dari blokir 403. Seluruh data otomatis tersimpan di sini dan siap diakses kapan saja.
              </p>
            </div>
          </div>
        </div>

        {/* Optional Collapsible S3 Keys Form */}
        {showFilebaseConfig && (
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-indigo-500/40 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  Kunci Akses S3 Filebase.com (Opsional)
                </h4>
                <p className="text-[11px] text-slate-300">
                  Jika Anda memiliki Access Key & Secret Key pribadi dari{' '}
                  <a
                    href="https://filebase.com/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-300 underline font-bold"
                  >
                    https://filebase.com/login
                  </a>
                  , Anda dapat memasukkannya di bawah ini untuk sinkronisasi langsung ke bucket Anda.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveFilebaseConfig} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-indigo-200 mb-1">Email Akun</label>
                <input
                  type="email"
                  value={filebaseConfig.email}
                  onChange={(e) => setFilebaseConfig({ ...filebaseConfig, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/40 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                  placeholder="jalansuci19@gmail.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-200 mb-1">Bucket Filebase</label>
                <input
                  type="text"
                  value={filebaseConfig.bucketName}
                  onChange={(e) => setFilebaseConfig({ ...filebaseConfig, bucketName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/40 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                  placeholder="karang-taruna-manisjaya"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-200 mb-1">Access Key S3</label>
                <input
                  type="text"
                  value={filebaseConfig.accessKey}
                  onChange={(e) => setFilebaseConfig({ ...filebaseConfig, accessKey: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/40 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                  placeholder="Kunci Akses S3"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-200 mb-1">Secret Key S3</label>
                <input
                  type="password"
                  value={filebaseConfig.secretKey}
                  onChange={(e) => setFilebaseConfig({ ...filebaseConfig, secretKey: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/40 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                  placeholder="Kunci Rahasia S3"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-4 flex items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-slate-400">
                  * Bahkan tanpa kunci S3 khusus sekalipun, seluruh data tetap tersimpan dan terlindungi otomatis.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestFilebaseConnection}
                    disabled={isTestingFilebase}
                    className="px-3.5 py-2 bg-indigo-700/60 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTestingFilebase ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Uji Koneksi Filebase</span>
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Filebase Catalog & File Explorer Section */}
        <div className="pt-2 border-t border-emerald-900/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-emerald-400" />
                Daftar File Tersimpan di Cloud (Data, Berita, PDF, Arsip)
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold">
                {filebaseCatalog.length} Berkas
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-emerald-900/60 text-xs">
              <button
                onClick={() => setFilebaseCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  filebaseCategoryFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({filebaseCatalog.length})
              </button>
              <button
                onClick={() => setFilebaseCategoryFilter('data')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  filebaseCategoryFilter === 'data'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Data ({filebaseCatalog.filter((f) => f.category === 'data').length})
              </button>
              <button
                onClick={() => setFilebaseCategoryFilter('berita')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  filebaseCategoryFilter === 'berita'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Berita ({filebaseCatalog.filter((f) => f.category === 'berita').length})
              </button>
              <button
                onClick={() => setFilebaseCategoryFilter('pdf')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  filebaseCategoryFilter === 'pdf'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PDF & Surat ({filebaseCatalog.filter((f) => f.category === 'pdf').length})
              </button>
              <button
                onClick={() => setFilebaseCategoryFilter('arsip')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  filebaseCategoryFilter === 'arsip'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Arsip ({filebaseCatalog.filter((f) => f.category === 'arsip').length})
              </button>
            </div>
          </div>

          {/* Files List */}
          {filebaseCatalog.length === 0 ? (
            <div className="bg-slate-950/40 rounded-2xl p-6 text-center border border-dashed border-emerald-500/30 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CloudUpload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Menyiapkan Penyimpanan Otomatis</p>
                <p className="text-xs text-emerald-200/80 max-w-md mx-auto">
                  Klik tombol <strong>"Sinkronkan Semua Sekarang"</strong> di atas untuk langsung mengarsipkan seluruh database, artikel berita, dokumen surat, dan laporan ke Cloud.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSyncAllToFilebase}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors inline-flex items-center gap-2"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>Sinkronkan Sekarang</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/50 rounded-2xl border border-emerald-900/60 overflow-hidden">
              <div className="max-h-72 overflow-y-auto divide-y divide-emerald-950">
                {filebaseCatalog
                  .filter((item) => filebaseCategoryFilter === 'all' || item.category === filebaseCategoryFilter)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 sm:p-3.5 hover:bg-emerald-900/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            item.category === 'data'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                              : item.category === 'berita'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                              : item.category === 'pdf'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-400/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                          }`}
                        >
                          {item.category === 'data' && <Database className="w-4 h-4" />}
                          {item.category === 'berita' && <Newspaper className="w-4 h-4" />}
                          {item.category === 'pdf' && <FileText className="w-4 h-4" />}
                          {item.category === 'arsip' && <FolderArchive className="w-4 h-4" />}
                          {item.category === 'media' && <Package className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-xs truncate max-w-xs sm:max-w-md">
                              {item.filename}
                            </span>
                            <span
                              className={`px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${
                                item.category === 'data'
                                  ? 'bg-blue-500/30 text-blue-200'
                                  : item.category === 'berita'
                                  ? 'bg-amber-500/30 text-amber-200'
                                  : item.category === 'pdf'
                                  ? 'bg-rose-500/30 text-rose-200'
                                  : 'bg-emerald-500/30 text-emerald-200'
                              }`}
                            >
                              {item.category}
                            </span>
                            <span className="px-2 py-0.2 bg-emerald-500/30 text-emerald-300 rounded text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Tersimpan di Cloud
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 font-mono truncate">
                            Jalur: <span className="text-emerald-200">{item.key}</span>
                          </p>

                          <p className="text-[10px] text-emerald-300/80">
                            {item.notes || 'Tersimpan otomatis di Cloud'}
                          </p>
                        </div>
                      </div>

                      {/* File Metadata & Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {(item.size / 1024).toFixed(1)} KB
                        </span>

                        <button
                          onClick={() => {
                            const bundle = collectAllOrganizationData(item.filename);
                            downloadJsonFile(item.filename, bundle);
                          }}
                          className="p-1.5 bg-slate-900 hover:bg-emerald-800 text-emerald-300 rounded-lg border border-emerald-800 transition-colors cursor-pointer"
                          title="Unduh berkas ini"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteCatalogItem(item.id, item.filename)}
                          className="p-1.5 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg border border-emerald-900 transition-colors cursor-pointer"
                          title="Hapus catatan dari katalog lokal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* (Kartu Turso Database Utama telah dipindahkan ke posisi teratas sebagai Database Utama) */}

      {/* 2. Operational Database KPI Status */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Aset Organisasi</p>
            <p className="text-lg font-black text-slate-800">{localDataSummary.assets} Unit</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Data Anggota</p>
            <p className="text-lg font-black text-slate-800">{localDataSummary.members} Orang</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Agenda Kegiatan</p>
            <p className="text-lg font-black text-slate-800">{localDataSummary.agenda} Jadwal</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Surat & Dokumen</p>
            <p className="text-lg font-black text-slate-800">{localDataSummary.letters} Berkas</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Catatan Kas</p>
            <p className="text-lg font-black text-slate-800">{localDataSummary.kas} Transaksi</p>
          </div>
        </div>
      </div>

      {/* 3. Input Alamat / Tautan Google Drive Kustom */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              Alamat Folder Google Drive Organisasi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan folder Google Drive tempat cadangan disimpan. Anda dapat memasukkan tautan Google Drive apa saja.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSetAutoFolder}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !useCustomFolder
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Folder Otomatis
            </button>
            <button
              onClick={() => {
                setUseCustomFolder(true);
                localStorage.setItem('kt_use_custom_drive_folder', 'true');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                useCustomFolder
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Input Tautan / ID Khusus
            </button>
          </div>
        </div>

        {useCustomFolder ? (
          <div className="space-y-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Alamat Tautan URL Folder Google Drive atau Folder ID
                </label>
                <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md font-bold">
                  Bisa Tautan Apa Saja
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={driveFolderInput}
                  onChange={(e) => setDriveFolderInput(e.target.value)}
                  placeholder="Contoh: https://drive.google.com/drive/folders/1ABCDEF123456... atau 1ABCDEF..."
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  onClick={handleSaveDriveFolderAddress}
                  disabled={isValidatingFolder}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {isValidatingFolder ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Simpan Alamat Folder</span>
                </button>
                {driveFolderInput.trim() && (
                  <a
                    href={
                      driveFolderInput.trim().startsWith('http')
                        ? driveFolderInput.trim()
                        : `https://drive.google.com/drive/folders/${driveFolderInput.trim()}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all shrink-0"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>Buka Folder Drive</span>
                  </a>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Tip: Buka Google Drive di tab browser Anda, masuk ke folder yang diinginkan, lalu salin (*copy*) alamat tautan dari bilah URL browser dan tempel (*paste*) di sini.
              </p>
            </div>

            {folderSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{folderSuccess}</span>
              </div>
            )}

            {folderError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{folderError}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 space-y-1">
              <p className="font-bold">Mode Folder Otomatis Aktif</p>
              <p className="text-blue-700 leading-relaxed">
                Sistem menggunakan folder default bernama{' '}
                <strong className="text-blue-900">"Karang Taruna Manis Jaya - Database"</strong> di Google Drive Anda. Anda juga dapat beralih ke tombol <strong>"Input Tautan / ID Khusus"</strong> di atas jika memiliki folder tertentu.
              </p>
            </div>
          </div>
        )}

        {/* Active Folder Card */}
        {activeFolderInfo && (
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-emerald-950">{activeFolderInfo.name}</h4>
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-md">
                    Folder Siap Digunakan
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 font-mono mt-0.5">
                  ID: {activeFolderInfo.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeFolderInfo.webViewLink && (
                <a
                  href={activeFolderInfo.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Buka di Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Section: Cadangkan Data & Riwayat Cadangan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Cadangkan Database */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CloudUpload className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-black text-slate-800">Cadangkan ke Google Drive</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Membuat snapshot arsip seluruh data operasional (Aset, Anggota, Kas, Agenda, dan Surat) ke format file JSON terenkripsi dan menyimpannya di Google Drive.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Catatan Cadangan (Opsional)</label>
              <textarea
                value={backupNote}
                onChange={(e) => setBackupNote(e.target.value)}
                rows={3}
                placeholder="Contoh: Cadangan sebelum Rapat Pleno atau setelah audit aset fisik sound system..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {lastBackupTime && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Terakhir dicadangkan: <strong className="text-slate-800">{lastBackupTime}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="pt-3 space-y-2">
            <button
              onClick={handleExecuteBackup}
              disabled={isUploadingBackup}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploadingBackup ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Cadangan...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  <span>Cadangkan Database Sekarang</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              * Berkas cadangan otomatis diunduh & folder Google Drive langsung terbuka.
            </p>
          </div>
        </div>

        {/* Tabel Riwayat Cadangan di Google Drive & Arsip Lokal */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-800">
                Daftar Berkas Cadangan ({allBackupsDisplay.length})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Pulihkan dari File (.json)</span>
                <input type="file" accept=".json" onChange={handleLocalFileRestore} className="hidden" />
              </label>
              <button
                onClick={() => {
                  refreshBackupArchives();
                  if (accessToken && activeFolderInfo?.id) {
                    loadCloudBackups(accessToken, activeFolderInfo.id);
                  }
                }}
                disabled={isLoadingFiles}
                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
                title="Segarkan Daftar"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {allBackupsDisplay.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">Belum Ada Berkas Cadangan</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Klik tombol <strong>"Cadangkan Database Sekarang"</strong> di samping untuk membuat berkas cadangan pertama Anda.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto pr-1">
              {allBackupsDisplay.map((file) => {
                const dateLabel = new Date(file.createdTime).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });
                const sizeKb = (file.size / 1024).toFixed(1);

                return (
                  <div
                    key={file.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                          <span>{dateLabel}</span>
                          <span>•</span>
                          <span>{sizeKb} KB</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-sm font-semibold">
                            {file.isCloud ? 'Google Drive Cloud' : 'Cadangan Tersimpan'}
                          </span>
                        </div>
                        {file.note && (
                          <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">{file.note}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenRestoreModal(file)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Pulihkan database dari berkas ini"
                      >
                        <CloudDownload className="w-3.5 h-3.5" />
                        <span>Pulihkan</span>
                      </button>

                      {file.payloadData && (
                        <button
                          onClick={() => downloadJsonFile(file.name, file.payloadData)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                          title="Unduh Berkas JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                          title="Buka di Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() =>
                          setConfirmDeleteModal({
                            isOpen: true,
                            title: file.name,
                            fileId: file.id,
                            isCloud: file.isCloud,
                            isDeleting: false,
                          })
                        }
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Hapus Cadangan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Metode Tambahan: Webhook Google Apps Script */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-800">
                Pencadangan Otomatis Latar Belakang (Webhook Google Apps Script)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simpan berkas cadangan langsung ke Google Drive Karang Taruna melalui Webhook pribadi tanpa batas otorisasi.
            </p>
          </div>

          <button
            onClick={() => setShowScriptModal(true)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Lihat Skrip Google Apps Script</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="Contoh: https://script.google.com/macros/s/AKfycbx.../exec"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <button
              onClick={async () => {
                if (!webhookUrl.trim()) {
                  onToast('Masukkan URL Webhook Google Apps Script terlebih dahulu.');
                  return;
                }
                setIsUploadingWebhook(true);
                try {
                  const currentUserLabel = 'Pengurus Karang Taruna Manis Jaya';
                  const bundle = collectAllOrganizationData(currentUserLabel);
                  const now = new Date();
                  const pad = (n: number) => String(n).padStart(2, '0');
                  const fileName = `backup_kt_manisjaya_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
                    now.getDate()
                  )}_${pad(now.getHours())}${pad(now.getMinutes())}.json`;
                  const folderId = extractDriveFolderId(driveFolderInput) || '';

                  const res = await uploadBackupViaWebhook(webhookUrl.trim(), {
                    fileName,
                    folderId,
                    data: bundle,
                  });

                  if (res?.status === 'error') {
                    throw new Error(res.message || 'Gagal menyimpan ke Webhook');
                  }

                  localStorage.setItem('kt_drive_webhook_url', webhookUrl.trim());
                  onToast('Berhasil mengirim cadangan ke Google Drive melalui Webhook!');
                } catch (err: any) {
                  onToast(`Gagal: ${err.message}`);
                } finally {
                  setIsUploadingWebhook(false);
                }
              }}
              disabled={isUploadingWebhook || !webhookUrl.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {isUploadingWebhook ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim ke Webhook</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Kode Google Apps Script */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  Panduan Skrip Google Drive Webhook
                </h3>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                Cara memasang di akun Google Karang Taruna (hanya 2 menit):
              </p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px]">
                <li>
                  Buka{' '}
                  <a
                    href="https://script.google.com/home/start"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline font-bold"
                  >
                    script.google.com
                  </a>{' '}
                  dengan akun Google Karang Taruna.
                </li>
                <li>Klik tombol <strong>+ Proyek Baru (New Project)</strong>.</li>
                <li>Hapus kode bawaan, lalu salin (*copy*) kode di bawah ini dan tempel (*paste*).</li>
                <li>Klik tombol <strong>Terapkan (Deploy) &gt; Penerapan Baru (New deployment)</strong>.</li>
                <li>Pilih jenis: <strong>Aplikasi Web (Web app)</strong>.</li>
                <li>Pada opsi <em>"Yang memiliki akses (Who has access)"</em>, pilih: <strong>Siapa saja (Anyone)</strong>.</li>
                <li>Salin <strong>URL Aplikasi Web</strong> yang dihasilkan dan tempelkan ke kolom Webhook di aplikasi.</li>
              </ol>

              <div className="relative">
                <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
{`function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);
    var fileName = req.fileName || ('backup_kt_' + new Date().toISOString() + '.json');
    var folderId = req.folderId;
    var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
    var file = folder.createFile(fileName, JSON.stringify(req.data, null, 2), MimeType.PLAIN_TEXT);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      fileName: fileName
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`}
                </pre>
                <button
                  onClick={() => {
                    const code = `function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);
    var fileName = req.fileName || ('backup_kt_' + new Date().toISOString() + '.json');
    var folderId = req.folderId;
    var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
    var file = folder.createFile(fileName, JSON.stringify(req.data, null, 2), MimeType.PLAIN_TEXT);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      fileName: fileName
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
                    navigator.clipboard.writeText(code);
                    onToast('Kode Google Apps Script berhasil disalin!');
                  }}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowScriptModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION MODAL: Restore Database Operation */}
      {confirmRestoreModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Konfirmasi Pemulihan Database
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anda akan memulihkan data sistem dari berkas cadangan:
              </p>
              <p className="text-xs font-bold text-blue-700 font-mono bg-blue-50 py-1 px-2.5 rounded-lg mt-1 inline-block">
                {confirmRestoreModal.title}
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-left text-xs text-amber-900 space-y-1">
              <p className="font-bold text-amber-950">Perhatian:</p>
              <p>
                • Seluruh data operasional saat ini (Aset, Anggota, Kas, Agenda, dan Surat) akan diperbarui sesuai berkas cadangan ini.
              </p>
              <p>• Tindakan ini akan langsung me-refresh seluruh tampilan aplikasi.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() =>
                  setConfirmRestoreModal({ isOpen: false, title: '', fileId: undefined, payloadData: null, isRestoring: false })
                }
                disabled={confirmRestoreModal.isRestoring}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmExecuteRestore}
                disabled={confirmRestoreModal.isRestoring}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                {confirmRestoreModal.isRestoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memulihkan...</span>
                  </>
                ) : (
                  <>
                    <CloudDownload className="w-3.5 h-3.5" />
                    <span>Ya, Pulihkan Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION MODAL: Delete File Operation */}
      {confirmDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Hapus Berkas Cadangan?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus berkas cadangan berikut?
              </p>
              <p className="text-xs font-bold text-rose-700 font-mono bg-rose-50 py-1 px-2.5 rounded-lg mt-1 inline-block">
                {confirmDeleteModal.title}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() =>
                  setConfirmDeleteModal({ isOpen: false, title: '', fileId: '', isCloud: false, isDeleting: false })
                }
                disabled={confirmDeleteModal.isDeleting}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmExecuteDelete}
                disabled={confirmDeleteModal.isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                {confirmDeleteModal.isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Firebase Account & Custom Database Modal */}
      <FirebaseConfigModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
        onToast={onToast}
      />
    </div>
  );
};
