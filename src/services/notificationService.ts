import { WorkspaceTab } from '../components/workspace/Sidebar';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'surat' | 'kegiatan' | 'anggota' | 'sync' | 'sistem';
  linkTab?: WorkspaceTab;
  actionLabel?: string;
}

const STORAGE_KEY = 'kt_real_notifications_v1';
const listeners: Array<(notifications: AppNotification[]) => void> = [];

export function getStoredNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse notifications:', err);
  }

  // Initial seed based on real system state
  const initialNotifications: AppNotification[] = [
    {
      id: 'init-sync',
      title: 'Cloud Firestore Terhubung',
      message: 'Sinkronisasi real-time antar perangkat aktif untuk organisasi Manis Jaya.',
      timestamp: Date.now() - 3 * 60 * 1000,
      read: false,
      type: 'sync',
      linkTab: 'database',
      actionLabel: 'Lihat Database',
    },
    {
      id: 'init-surat',
      title: 'Sistem Surat & Dokumen Siap',
      message: 'Kelola surat masuk, surat keluar, disposisi, dan nomor otomatis secara terpusat.',
      timestamp: Date.now() - 25 * 60 * 1000,
      read: false,
      type: 'surat',
      linkTab: 'surat',
      actionLabel: 'Buka Surat',
    },
  ];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNotifications));
  } catch {}

  return initialNotifications;
}

function saveNotifications(notifications: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
  listeners.forEach((listener) => listener(notifications));
}

export function subscribeNotifications(callback: (notifications: AppNotification[]) => void): () => void {
  listeners.push(callback);
  callback(getStoredNotifications());

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const updated = JSON.parse(e.newValue);
        if (Array.isArray(updated)) {
          callback(updated);
        }
      } catch {}
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) {
      listeners.splice(idx, 1);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export function addNotification(
  notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & {
    id?: string;
    timestamp?: number;
    read?: boolean;
  }
): AppNotification {
  const current = getStoredNotifications();
  const newNotif: AppNotification = {
    id: notif.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: notif.title,
    message: notif.message,
    timestamp: notif.timestamp || Date.now(),
    read: notif.read ?? false,
    type: notif.type,
    linkTab: notif.linkTab,
    actionLabel: notif.actionLabel,
  };

  // Keep latest 50 notifications
  const updated = [newNotif, ...current.filter((n) => n.id !== newNotif.id)].slice(0, 50);
  saveNotifications(updated);
  return newNotif;
}

export function markAsRead(id: string): void {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function markAllAsRead(): void {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function deleteNotification(id: string): void {
  const current = getStoredNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveNotifications(updated);
}

export function clearAllNotifications(): void {
  saveNotifications([]);
}

export function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 45) return 'Baru saja';
  if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))} mnt lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
  if (diffSec < 172800) return 'Kemarin';
  const d = new Date(timestamp);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
