import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  onSnapshot,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore with dedicated Database ID if configured
export const db: Firestore = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Test Connection on boot as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using local cache.');
    }
    return false;
  }
}
testConnection();

export interface CloudSyncStatus {
  state: 'connected' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: string | null;
  message?: string;
  sourceDevice?: string;
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
  'kt_laporan_kegiatan_v1',
  'kt_surat_items_v2',
  'kt_kas_entries_v2',
  'kt_users_list_v3',
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
 * Pushes local state to Cloud Firestore
 */
export const pushLocalDataToCloud = async (
  reason = 'Perubahan data lokal',
  userName = 'Pengurus'
): Promise<void> => {
  if (isApplyingRemoteChange) return;

  try {
    const localData = collectLocalSyncData();
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
  } catch (err: any) {
    console.error('Failed to push to Cloud Firestore:', err);
    throw err;
  }
};

/**
 * Starts real-time listener for Cloud Firestore changes across all devices
 */
export const startRealtimeSync = (
  onStatusChange?: (status: CloudSyncStatus) => void,
  onRemoteUpdateReceived?: (updatedKeys: string[]) => void
): (() => void) => {
  const docRef = doc(db, 'organizations', 'manisjaya', 'live', 'state');

  onStatusChange?.({
    state: 'syncing',
    lastSyncedAt: null,
    message: 'Menghubungkan ke Cloud Firestore...',
  });

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        // First time initialization: push existing local data to Cloud
        pushLocalDataToCloud('Inisialisasi database cloud pertama kali').catch(() => {});
        onStatusChange?.({
          state: 'connected',
          lastSyncedAt: new Date().toISOString(),
          message: 'Database Cloud Firestore siap & terhubung.',
        });
        return;
      }

      const cloudPayload = snapshot.data();
      if (!cloudPayload) return;

      // Ignore echoes from this same device tab to prevent re-rendering loops
      if (cloudPayload.deviceId === DEVICE_ID) {
        onStatusChange?.({
          state: 'connected',
          lastSyncedAt: cloudPayload.lastUpdatedISO || new Date().toISOString(),
          message: 'Data tersinkron ke Cloud.',
        });
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

          onStatusChange?.({
            state: 'connected',
            lastSyncedAt: cloudPayload.lastUpdatedISO || new Date().toISOString(),
            message: `Menerima pembaruan dari ${cloudPayload.updatedBy || 'perangkat lain'}.`,
            sourceDevice: cloudPayload.deviceId,
          });
        } finally {
          setTimeout(() => {
            isApplyingRemoteChange = false;
          }, 300);
        }
      }
    },
    (error) => {
      console.error('Firestore real-time sync error:', error);
      onStatusChange?.({
        state: 'error',
        lastSyncedAt: null,
        message: `Koneksi database online terputus: ${error.message}`,
      });
    }
  );

  return unsubscribe;
};

/**
 * Hooks into window storage and custom events to broadcast local mutations to Firestore
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
      pushLocalDataToCloud(reason, getUserName()).catch((err) => {
        console.warn('Auto-broadcast notice:', err.message);
      });
    }, 800); // 800ms debounce
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
 * Triggers a notification that local data was changed and should sync to cloud
 */
export const notifyLocalDataChanged = (reason: string) => {
  window.dispatchEvent(new CustomEvent('kt_local_data_changed', { detail: { reason } }));
};
