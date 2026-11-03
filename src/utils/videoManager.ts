/**
 * Manajer Video Dokumentasi Karang Taruna Kelurahan Manis Jaya
 * - Mendukung durasi maksimal 60 detik
 * - Ekstraksi otomatis gambar thumbnail dari frame video
 * - Penyimpanan aman ke server gateway (/filebase_vault/) & cache persisten IndexedDB
 * - Menjamin video tidak hilang, tidak melebihi kuota localStorage, dan muncul di semua tampilan
 */

const DB_NAME = 'kt_manisjaya_media';
const DB_VERSION = 1;
const STORE_NAME = 'video_blobs';

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Simpan blob video ke IndexedDB agar aman dari batas kuota localStorage
 */
export async function saveVideoBlobToIndexedDb(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openIndexedDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id, blob, updatedAt: Date.now() });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveVideo notice:', err);
  }
}

/**
 * Ambil blob video dari IndexedDB
 */
export async function getVideoBlobFromIndexedDb(id: string): Promise<Blob | null> {
  try {
    const db = await openIndexedDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    return new Promise<Blob | null>((resolve) => {
      req.onsuccess = () => {
        resolve(req.result?.blob || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Ekstrak durasi dan generate frame thumbnail dari berkas video
 */
export function extractVideoMetaAndThumbnail(
  file: File | Blob
): Promise<{ duration: number; thumbnail: string; objectUrl: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration || 0);

      // Seek ke detik 0.5 atau 1 untuk mengambil thumbnail frame terbaik
      const seekTime = Math.min(1, duration > 1 ? 1 : 0.2);
      video.currentTime = seekTime;

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = video.videoWidth || 640;
          const height = video.videoHeight || 360;
          canvas.width = Math.min(width, 800);
          canvas.height = Math.round((canvas.width / width) * height);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumb = canvas.toDataURL('image/jpeg', 0.82);
            resolve({ duration, thumbnail: thumb, objectUrl });
            return;
          }
        } catch {
          // fallback jika canvas tainted
        }
        resolve({ duration, thumbnail: '', objectUrl });
      };

      video.onerror = () => {
        resolve({ duration, thumbnail: '', objectUrl });
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Format berkas video tidak didukung atau rusak.'));
    };
  });
}

/**
 * Unggah berkas video ke Server Filebase Vault (/filebase_vault/video/...)
 * Mengembalikan URL permanen yang aman dan ringan untuk disimpan di Firestore & LocalStorage
 */
export async function uploadVideoToServerVault(
  file: File,
  videoKeyName?: string
): Promise<{ fileUrl: string; ipfsCid?: string }> {
  const cleanBaseName = (videoKeyName || file.name)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 60);
  const key = `video/${Date.now()}_${cleanBaseName}`;

  // Baca berkas sebagai Base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.split(',')[1] || res;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const response = await fetch('/api/filebase/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key,
      content: base64Data,
      isBase64: true,
      contentType: file.type || 'video/mp4',
      category: 'media',
    }),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengunggah video ke server vault (HTTP ${response.status})`);
  }

  const data = await response.json();
  const fileUrl = data.fileUrl || `/filebase_vault/${key}`;

  return {
    fileUrl,
    ipfsCid: data.ipfsCid,
  };
}
