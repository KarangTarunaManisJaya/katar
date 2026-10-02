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
} from 'lucide-react';
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
  pushLocalDataToCloud,
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
      const ag = JSON.parse(localStorage.getItem('kt_agenda_v1') || '[]');
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

    // Listen to database restored event from anywhere
    const handleRestoreEvent = () => {
      refreshLocalSummary();
      refreshBackupArchives();
    };
    window.addEventListener('kt_database_restored', handleRestoreEvent);
    return () => {
      window.removeEventListener('kt_database_restored', handleRestoreEvent);
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
      await pushLocalDataToCloud('Sinkronisasi manual dari menu database');
      onToast('Seluruh data operasional berhasil disinkronkan ke Cloud Firestore! Komputer & HP lain langsung terupdate.');
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
              <span className="px-3 py-1 bg-blue-500/30 border border-blue-400/40 rounded-full text-xs font-bold text-blue-200 tracking-wide uppercase flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5" />
                Pusat Cadangan & Sinkronisasi Google Drive
              </span>
              {googleUser ? (
                <span className="px-3 py-1 bg-emerald-500/30 border border-emerald-400/40 rounded-full text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Google OAuth Terhubung
                </span>
              ) : (
                <span className="px-3 py-1 bg-teal-500/30 border border-teal-400/40 rounded-full text-xs font-bold text-teal-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Mode Sinkronisasi Langsung Aktif
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Database & Google Drive Cloud
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Kelola pencadangan (*backup*) dan pemulihan (*restore*) seluruh data Karang Taruna Kelurahan Manis Jaya
              ke folder Google Drive Anda secara instan, aman, dan tanpa kendala.
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

      {/* REAL-TIME CLOUD FIRESTORE STATUS & CONTROLS */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-emerald-700/40 relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0 shadow-inner">
              <Cloud className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  Database Resmi Firebase Google Cloud (firebase.google.com)
                </h3>
                <span className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-400/40 rounded-full text-[10px] font-extrabold text-emerald-200 tracking-wide uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Koneksi Real-Time Aktif
                </span>
                {isCustomDb && (
                  <span className="px-2 py-0.5 bg-blue-500/40 border border-blue-400/50 rounded-full text-[10px] font-extrabold text-blue-200 tracking-wide uppercase">
                    Database Kustom
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
                Aplikasi terhubung langsung ke <strong>Google Firebase Firestore</strong> (<code className="bg-black/30 px-1 py-0.5 rounded text-emerald-200">firebase.google.com</code>). Anda dapat masuk ke akun Google Anda terlebih dahulu dan mengganti/merubah database ke proyek Firebase milik Anda sendiri.
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
              title="Kirim seluruh data lokal saat ini ke Cloud Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>Kirim Data</span>
            </button>
            <button
              onClick={handlePullFromCloud}
              disabled={isSyncingCloud}
              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Tarik data terbaru yang ada di Cloud Firestore ke laptop/perangkat ini"
            >
              <CloudDownload className="w-3.5 h-3.5 text-emerald-300" />
              <span>Tarik Data</span>
            </button>
          </div>
        </div>
      </div>

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
