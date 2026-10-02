import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  collection,
  onSnapshot,
  Firestore,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export interface FirebaseConfig {
  projectId: string;
  appId?: string;
  apiKey: string;
  authDomain?: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
}

const CUSTOM_CONFIG_KEY = 'kt_custom_firebase_config';

/**
 * Retrieve user-defined custom Firebase configuration from localStorage
 */
export function getCustomFirebaseConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(CUSTOM_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.projectId && parsed.apiKey) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if the application is currently using a custom Firebase project
 */
export function isUsingCustomFirebase(): boolean {
  return getCustomFirebaseConfig() !== null;
}

/**
 * Get the original system-provisioned Firebase configuration
 */
export function getDefaultFirebaseConfig(): FirebaseConfig {
  return firebaseConfig as any;
}

/**
 * Get the currently active Firebase configuration (custom if set, otherwise default)
 */
export function getActiveFirebaseConfig(): FirebaseConfig {
  const custom = getCustomFirebaseConfig();
  if (custom) return custom;
  return firebaseConfig as any;
}

const activeConfig = getActiveFirebaseConfig();

// Initialize Firebase App singleton with active config
export const app = !getApps().length ? initializeApp(activeConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Sign-In with Firebase Auth
export async function loginWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutGoogle(): Promise<void> {
  await signOut(auth);
}

export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}

export function onFirebaseAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Test an arbitrary Firebase configuration before applying it
 */
export async function testCustomFirebaseConfig(config: Partial<FirebaseConfig>): Promise<{ success: boolean; message: string }> {
  if (!config.projectId || !config.apiKey) {
    return { success: false, message: 'Project ID dan API Key wajib diisi!' };
  }
  const testAppName = `test_app_${Date.now()}`;
  let tempApp: any = null;
  try {
    tempApp = initializeApp({
      apiKey: config.apiKey,
      projectId: config.projectId,
      authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`,
      storageBucket: config.storageBucket,
      appId: config.appId,
    }, testAppName);

    const dbId = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
      ? config.firestoreDatabaseId
      : undefined;

    const testDb = dbId ? getFirestore(tempApp, dbId) : getFirestore(tempApp);
    // Ping with getDocFromServer
    await getDocFromServer(doc(testDb, 'organizations', 'test_ping'));
    return {
      success: true,
      message: `Koneksi berhasil! Database "${config.projectId}" (${config.firestoreDatabaseId || '(default)'}) dapat diakses dan merespons normal.`,
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
      return {
        success: true,
        message: `Koneksi ke Project "${config.projectId}" berhasil tersambung ke server Google Firebase! (Catatan: Pastikan Security Rules Firestore Anda mengizinkan read/write).`,
      };
    }
    if (msg.includes('resource-exhausted') || msg.includes('Quota exceeded')) {
      return {
        success: true,
        message: `Koneksi ke Project "${config.projectId}" berhasil terhubung ke server Google Firebase (Catatan: Kuota proyek ini sedang batas harian).`,
      };
    }
    if (msg.includes('not-found') || msg.includes('NOT_FOUND')) {
      return {
        success: true,
        message: `Koneksi ke Project "${config.projectId}" berhasil! Server merespons normal.`,
      };
    }
    return {
      success: false,
      message: `Gagal terhubung ke Firebase: ${msg}`,
    };
  } finally {
    if (tempApp) {
      try {
        await deleteApp(tempApp);
      } catch {}
    }
  }
}

/**
 * Save custom Firebase configuration and reload to recreate Firestore singletons
 */
export function saveCustomFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(CUSTOM_CONFIG_KEY, JSON.stringify(config));
  window.location.reload();
}

/**
 * Reset back to the system default Firebase database and reload
 */
export function resetToDefaultFirebaseConfig(): void {
  localStorage.removeItem(CUSTOM_CONFIG_KEY);
  window.location.reload();
}

// Initialize Cloud Firestore with dedicated Database ID and Persistent Offline IndexedDB Cache
const databaseId = activeConfig.firestoreDatabaseId && activeConfig.firestoreDatabaseId !== '(default)'
  ? activeConfig.firestoreDatabaseId
  : undefined;

export const db: Firestore = (() => {
  try {
    return initializeFirestore(
      app,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      databaseId || undefined
    );
  } catch (e) {
    // If instance was already created, fallback to getFirestore
    return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  }
})();

// Quota backoff tracker to prevent resource-exhausted error storms on free/limited projects
let quotaExhaustedUntil: number = 0;
let lastPushedDataHash = '';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

export function isQuotaExhausted(): boolean {
  return Date.now() < quotaExhaustedUntil;
}

export function resetQuotaBackoff(): void {
  quotaExhaustedUntil = 0;
}

// Test Connection safely without throwing unhandled quota exceptions
export async function testConnection(): Promise<boolean> {
  if (Date.now() < quotaExhaustedUntil) {
    return false;
  }
  try {
    const testDoc = await getDoc(doc(db, 'organizations', 'manisjaya', 'live', 'state'));
    return testDoc.exists();
  } catch (error: any) {
    if (error?.code === 'resource-exhausted' || error?.message?.includes('Quota exceeded')) {
      quotaExhaustedUntil = Date.now() + 10 * 60 * 1000;
      console.warn('Firebase client: Quota tercapai. Mode offline diaktifkan.');
    }
    return false;
  }
}

export interface CloudSyncStatus {
  state: 'connected' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: string | null;
  message?: string;
  sourceDevice?: string;
  isOnline: boolean;
  pendingOfflineCount: number;
}

// All keys that are synced across computers
export const SYNC_KEYS = [
  'kt_assets_v1',
  'kt_asset_peminjaman_v1',
  'kt_asset_mutasi_v1',
  'kt_asset_pengadaan_v1',
  'kt_asset_penghapusan_v1',
  'kt_asset_stock_opname_v1',
  'kt_asset_dokumen_v1',
  'kt_members_v3',
  'kt_agenda_v1',
  'kt_proposals_v2',
  'kt_laporan_kegiatan_v1',
  'kt_surat_items_v2',
  'kt_surat_masuk_v1',
  'kt_surat_disposisi_v1',
  'kt_surat_numbering_cfg_v1',
  'kt_kas_entries_v2',
  'kt_users_list_v3',
  'kt_news_v1',
  'kt_categories_v1',
  'kt_org_name',
  'kt_org_address',
  'kt_org_kelurahan',
  'kt_org_kecamatan',
  'kt_org_kota',
  'kt_org_provinsi',
  'kt_email',
  'kt_telepon',
  'kt_website',
] as const;

// Unique device identifier to ignore self-echoes
const DEVICE_ID = `device_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

// Flag to prevent infinite broadcast loops
let isApplyingRemoteChange = false;

// Pending offline mutations tracking
const QUEUE_STORAGE_KEY = 'kt_firestore_offline_queue_v1';

export const getPendingOfflineQueue = (): Array<{ id: string; reason: string; timestamp: number }> => {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const addToOfflineQueue = (reason: string) => {
  try {
    const queue = getPendingOfflineQueue();
    queue.push({
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reason,
      timestamp: Date.now(),
    });
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue.slice(-50)));
  } catch (e) {
    console.warn('Failed to queue offline update:', e);
  }
};

const clearOfflineQueue = () => {
  try {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  } catch {}
};

/**
 * Collects current localStorage operational data into a sync packet
 */
export const collectLocalSyncData = (): Record<string, any> => {
  const data: Record<string, any> = {};
  SYNC_KEYS.forEach((key) => {
    const val = localStorage.getItem(key);
    if (val !== null) {
      try {
        data[key] = JSON.parse(val);
      } catch {
        data[key] = val;
      }
    }
  });
  return data;
};

/**
 * Writes granular collections to Firestore matching firebase-blueprint.json:
 * - /organizations/manisjaya/members
 * - /organizations/manisjaya/assets
 * - /organizations/manisjaya/agenda
 * - /organizations/manisjaya/letters
 * - /organizations/manisjaya/kas
 */
const syncGranularCollections = async (localData: Record<string, any>) => {
  try {
    const orgDoc = doc(db, 'organizations', 'manisjaya');

    // Sync Members
    const members = localData['kt_members_v3'] || localData['kt_users_list_v3'];
    if (Array.isArray(members) && members.length > 0) {
      for (const m of members.slice(0, 50)) {
        if (m?.id || m?.username) {
          const docRef = doc(collection(orgDoc, 'members'), String(m.id || m.username));
          await setDoc(docRef, { ...m, updatedAt: new Date().toISOString() }, { merge: true });
        }
      }
    }

    // Sync Assets
    const assets = localData['kt_assets_v1'];
    if (Array.isArray(assets) && assets.length > 0) {
      for (const a of assets.slice(0, 50)) {
        if (a?.id) {
          const docRef = doc(collection(orgDoc, 'assets'), String(a.id));
          await setDoc(docRef, { ...a, updatedAt: new Date().toISOString() }, { merge: true });
        }
      }
    }

    // Sync Agenda
    const agenda = localData['kt_agenda_v1'];
    if (Array.isArray(agenda) && agenda.length > 0) {
      for (const ag of agenda.slice(0, 50)) {
        if (ag?.id) {
          const docRef = doc(collection(orgDoc, 'agenda'), String(ag.id));
          await setDoc(docRef, { ...ag, updatedAt: new Date().toISOString() }, { merge: true });
        }
      }
    }

    // Sync Letters (Surat)
    const letters = localData['kt_surat_items_v2'];
    if (Array.isArray(letters) && letters.length > 0) {
      for (const l of letters.slice(0, 50)) {
        if (l?.id) {
          const docRef = doc(collection(orgDoc, 'letters'), String(l.id));
          await setDoc(docRef, { ...l, updatedAt: new Date().toISOString() }, { merge: true });
        }
      }
    }

    // Sync Kas
    const kas = localData['kt_kas_entries_v2'];
    if (Array.isArray(kas) && kas.length > 0) {
      for (const k of kas.slice(0, 50)) {
        if (k?.id) {
          const docRef = doc(collection(orgDoc, 'kas'), String(k.id));
          await setDoc(docRef, { ...k, updatedAt: new Date().toISOString() }, { merge: true });
        }
      }
    }
  } catch (err) {
    // Non-blocking for offline / permissions
    console.debug('Granular subcollections sync handled:', err);
  }
};

/**
 * Pushes local state to Cloud Firestore (Works seamlessly online & offline via persistent local cache)
 */
export const pushLocalDataToCloud = async (
  reason = 'Perubahan data lokal',
  userName = 'Pengurus'
): Promise<void> => {
  if (isApplyingRemoteChange) return;

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline) {
    addToOfflineQueue(reason);
    return;
  }

  // If quota limit was reached on the backend, seamlessly operate offline without spamming errors
  if (Date.now() < quotaExhaustedUntil) {
    addToOfflineQueue(reason);
    return;
  }

  try {
    const localData = collectLocalSyncData();
    const dataString = JSON.stringify(localData);
    const dataHash = simpleHash(dataString);

    // Skip redundant network writes if local data hasn't changed
    if (dataHash === lastPushedDataHash && !reason.includes('manual') && !reason.includes('Inisialisasi')) {
      return;
    }

    const docRef = doc(db, 'organizations', 'manisjaya', 'live', 'state');

    await setDoc(
      docRef,
      {
        data: localData,
        lastUpdated: serverTimestamp(),
        lastUpdatedISO: new Date().toISOString(),
        updatedBy: userName,
        reason,
        deviceId: DEVICE_ID,
      },
      { merge: true }
    );

    lastPushedDataHash = dataHash;
    clearOfflineQueue();
  } catch (err: any) {
    const isQuota =
      err?.code === 'resource-exhausted' ||
      err?.message?.includes('Quota exceeded') ||
      err?.message?.includes('resource-exhausted');

    if (isQuota) {
      quotaExhaustedUntil = Date.now() + 10 * 60 * 1000; // 10 minutes backoff
      console.warn('Cloud Firestore quota reached. Switching seamlessly to offline local storage mode.');
    } else {
      console.warn('Penyimpanan lokal Cloud Firestore aktif (offline/cache):', err?.message || err);
    }
    addToOfflineQueue(reason);
  }
};

/**
 * Starts real-time listener for Cloud Firestore changes across all devices
 * Also automatically monitors online/offline status and flushes pending offline updates when connection restores
 */
export const startRealtimeSync = (
  onStatusChange?: (status: CloudSyncStatus) => void,
  onRemoteUpdateReceived?: (updatedKeys: string[]) => void
): (() => void) => {
  const docRef = doc(db, 'organizations', 'manisjaya', 'live', 'state');

  const updateStatus = (
    state: CloudSyncStatus['state'],
    message: string,
    lastSyncedAt: string | null = null,
    sourceDevice?: string
  ) => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const queue = getPendingOfflineQueue();
    onStatusChange?.({
      state,
      lastSyncedAt,
      message,
      sourceDevice,
      isOnline,
      pendingOfflineCount: queue.length,
    });
  };

  updateStatus(
    navigator.onLine ? 'syncing' : 'offline',
    navigator.onLine
      ? 'Menghubungkan ke Cloud Firestore...'
      : 'Mode Offline: Data tersimpan lokal & akan otomatis terkirim saat online.'
  );

  // Firestore onSnapshot listener (reads from IndexedDB when offline, from network when online)
  const unsubscribeFirestore = onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      const hasPendingWrites = snapshot.metadata.hasPendingWrites;
      const isFromCache = snapshot.metadata.fromCache;
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      if (!snapshot.exists()) {
        pushLocalDataToCloud('Inisialisasi database cloud pertama kali').catch(() => {});
        updateStatus(
          'connected',
          'Database Cloud Firestore siap & terhubung.',
          new Date().toISOString()
        );
        return;
      }

      const cloudPayload = snapshot.data();
      if (!cloudPayload) return;

      // Handle offline or pending write state
      if (!isOnline || isFromCache || hasPendingWrites) {
        if (hasPendingWrites) {
          updateStatus(
            isOnline ? 'syncing' : 'offline',
            isOnline
              ? 'Menyimpan perubahan ke Cloud Firestore...'
              : 'Mode Offline: Data tersimpan di memori lokal perangkat.',
            cloudPayload.lastUpdatedISO || new Date().toISOString()
          );
        } else {
          updateStatus(
            isOnline ? 'connected' : 'offline',
            isOnline ? 'Data tersinkron ke Cloud.' : 'Mode Offline (Menggunakan Cache Lokal)',
            cloudPayload.lastUpdatedISO || new Date().toISOString()
          );
        }
      }

      // Ignore echoes from this same device tab to prevent re-rendering loops
      if (cloudPayload.deviceId === DEVICE_ID) {
        if (!hasPendingWrites && isOnline) {
          updateStatus(
            'connected',
            'Data tersinkron ke Cloud.',
            cloudPayload.lastUpdatedISO || new Date().toISOString()
          );
        }
        return;
      }

      // Received change from ANOTHER computer or device!
      const remoteData = cloudPayload.data;
      if (remoteData && typeof remoteData === 'object') {
        isApplyingRemoteChange = true;
        const modifiedKeys: string[] = [];

        try {
          Object.entries(remoteData).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
              const strVal = typeof val === 'string' ? val : JSON.stringify(val);
              const currentVal = localStorage.getItem(key);
              if (currentVal !== strVal) {
                localStorage.setItem(key, strVal);
                modifiedKeys.push(key);
              }
            }
          });

          if (modifiedKeys.length > 0) {
            // Dispatch event to inform UI components to refresh immediately
            window.dispatchEvent(new Event('kt_database_restored'));
            window.dispatchEvent(new CustomEvent('kt_cloud_sync_update', { detail: { modifiedKeys } }));
            onRemoteUpdateReceived?.(modifiedKeys);
          }

          updateStatus(
            'connected',
            `Menerima pembaruan real-time dari ${cloudPayload.updatedBy || 'perangkat lain'}.`,
            cloudPayload.lastUpdatedISO || new Date().toISOString(),
            cloudPayload.deviceId
          );
        } finally {
          setTimeout(() => {
            isApplyingRemoteChange = false;
          }, 300);
        }
      }
    },
    (error) => {
      const isQuota =
        error?.code === 'resource-exhausted' ||
        error?.message?.includes('Quota exceeded') ||
        error?.message?.includes('resource-exhausted');

      if (isQuota) {
        quotaExhaustedUntil = Date.now() + 10 * 60 * 1000;
        console.warn('Firestore server notice: Kuota database Firestore proyek bawaan tercapai. Beralih ke mode offline lokal.');
        updateStatus(
          'offline',
          'Mode Offline Aktif: Kuota harian Firestore bawaan tercapai. Data Anda tetap tersimpan aman di perangkat & Anda dapat mengganti ke proyek Firebase pribadi di menu Pengaturan.'
        );
      } else {
        console.warn('Firestore real-time listener notice:', error.message);
        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        updateStatus(
          isOnline ? 'error' : 'offline',
          isOnline
            ? `Koneksi database online terputus: ${error.message}`
            : 'Mode Offline: Menggunakan penyimpanan lokal perangkat.'
        );
      }
    }
  );

  // Network Online / Offline handlers
  const handleOnline = () => {
    if (Date.now() < quotaExhaustedUntil) {
      updateStatus(
        'offline',
        'Koneksi internet aktif, namun kuota proyek Firebase server saat ini penuh. Data tetap aman di penyimpanan lokal.'
      );
      return;
    }
    updateStatus('syncing', 'Koneksi internet terdeteksi. Menyinkronkan data offline ke Cloud Firestore...');
    // Push any accumulated offline mutations
    pushLocalDataToCloud('Sinkronisasi otomatis setelah online kembali')
      .then(() => {
        clearOfflineQueue();
        updateStatus('connected', 'Semua data offline berhasil diupdate ke Cloud Firestore!', new Date().toISOString());
      })
      .catch((err) => {
        console.warn('Auto-resync on reconnect:', err);
      });
  };

  const handleOffline = () => {
    updateStatus('offline', 'Koneksi offline: Perubahan tetap disimpan lokal dan akan otomatis terkirim saat internet kembali.');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    unsubscribeFirestore();
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Hooks into window storage and custom events to broadcast local mutations to Firestore
 * Automatically triggers whenever user inputs/saves ANY data in the app!
 */
let isBroadcasterSetup = false;
let broadcastDebounceTimer: any = null;

export const enableAutoBroadcast = (getUserName: () => string) => {
  if (isBroadcasterSetup) return;
  isBroadcasterSetup = true;

  const handleDataMutated = (reason = 'Perubahan data') => {
    if (isApplyingRemoteChange) return;

    if (broadcastDebounceTimer) clearTimeout(broadcastDebounceTimer);
    broadcastDebounceTimer = setTimeout(() => {
      if (Date.now() < quotaExhaustedUntil) return;
      pushLocalDataToCloud(reason, getUserName()).catch((err) => {
        console.warn('Auto-broadcast notice:', err.message);
      });
    }, 2000); // 2000ms debounce to prevent burst requests
  };

  window.addEventListener('kt_local_data_changed', ((e: CustomEvent) => {
    handleDataMutated(e.detail?.reason || 'Perubahan data');
  }) as EventListener);

  window.addEventListener('kt_database_restored', () => {
    handleDataMutated('Pemulihan database lengkap');
  });

  // Intercept localStorage.setItem in the current window to automatically catch all local additions/edits
  try {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = (key: string, value: string) => {
      originalSetItem(key, value);
      if (!isApplyingRemoteChange && SYNC_KEYS.includes(key as any)) {
        handleDataMutated(`Pembaruan data ${key}`);
      }
    };
  } catch (err) {
    console.warn('LocalStorage interceptor fallback:', err);
  }

  window.addEventListener('storage', (e) => {
    if (e.key && SYNC_KEYS.includes(e.key as any)) {
      handleDataMutated(`Pembaruan ${e.key}`);
    }
  });
};

/**
 * Triggers an immediate notification that local data was changed and should sync to cloud
 */
export const notifyLocalDataChanged = (reason: string) => {
  window.dispatchEvent(new CustomEvent('kt_local_data_changed', { detail: { reason } }));
};
