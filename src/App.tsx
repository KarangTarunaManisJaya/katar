/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrandingProvider } from './context/BrandingContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/workspace/Header';
import { Sidebar, WorkspaceTab } from './components/workspace/Sidebar';
import { RecentActivities } from './components/workspace/RecentActivities';
import { BerandaView } from './components/workspace/BerandaView';
import { KegiatanView } from './components/workspace/KegiatanView';
import { SuratMenyuratView } from './components/workspace/SuratMenyuratView';
import { PengaturanUmumView } from './components/workspace/PengaturanUmumView';
import { AnggotaView } from './components/workspace/AnggotaView';
import { ActivityDetailModal } from './components/workspace/ActivityDetailModal';
import { AddNewsModal } from './components/workspace/AddNewsModal';
import { FloatingChat } from './components/workspace/FloatingChat';
import { ProposalsView } from './components/workspace/ProposalsView';
import { AssetsView } from './components/workspace/Views';
import { NotificationToast } from './components/NotificationToast';
import { AksesPenggunaView } from './components/workspace/AksesPenggunaView';
import { TambahBeritaView } from './components/workspace/TambahBeritaView';
import { SemuaBeritaView } from './components/workspace/SemuaBeritaView';
import { ApkDownloadModal } from './components/workspace/ApkDownloadModal';
import { LaporanKegiatanView } from './components/workspace/LaporanKegiatanView';
import { JadwalKegiatanView } from './components/workspace/JadwalKegiatanView';
import { AsetOrganisasiView } from './components/workspace/AsetOrganisasiView';
import { InventarisAssetView } from './components/workspace/InventarisAssetView';
import { ArsipKegiatanView } from './components/workspace/ArsipKegiatanView';
import { DatabaseGoogleDriveView } from './components/workspace/DatabaseGoogleDriveView';
import { FirebaseConfigModal } from './components/workspace/FirebaseConfigModal';
import { LoginModal } from './components/auth/LoginModal';
import { VotingAnggotaSection } from './components/workspace/VotingAnggotaSection';
import { resolveAssetUrl } from './utils/assetUrl';
import { DEFAULT_USERS, UserAccount, GUEST_USER } from './types/auth';
import { Lock, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import {
  ACTIVITIES_DATA,
  ActivityItem,
} from './data/workspaceData';
import {
  pushBackupToFirestore,
  saveNewsToFirestore,
  deleteNewsFromFirestore,
  notifyLocalDataChanged,
  CloudSyncStatus,
  db,
} from './services/firestoreSyncService';
import {
  saveNewsToFilebase,
  fetchNewsFromFilebase,
} from './services/filebaseService';
import {
  saveNewsToTurso,
  deleteNewsFromTurso,
  fetchNewsFromTurso,
  startTursoPrimarySync,
  enableTursoAutoSync,
  pushFullStateToTurso,
} from './services/tursoService';
import { collection, getDocs } from 'firebase/firestore';
import { addNotification } from './services/notificationService';
import { updatePageSeo, DEFAULT_SEO } from './utils/seoHelper';

export function normalizeNewsItem(item: any): ActivityItem {
  if (!item || typeof item !== 'object') return item;
  const defaultMatch = ACTIVITIES_DATA.find((d) => d.id === item.id);

  // 1. Video Liputan: Prioritaskan persis apa yang diinputkan pengguna
  let videoUrl = item.videoUrl !== undefined ? item.videoUrl : defaultMatch?.videoUrl;
  let videoDuration = item.videoDuration !== undefined ? item.videoDuration : defaultMatch?.videoDuration;

  // 2. Foto Cover: Prioritaskan gambar unggahan pengguna seutuhnya
  let image = item.image;
  if (!image || typeof image !== 'string' || image.trim().length === 0) {
    image = defaultMatch?.image || resolveAssetUrl('/baksos_karang_taruna_1790589027203.jpg');
  } else {
    image = resolveAssetUrl(image);
  }

  // 3. Galeri Foto: Pertahankan foto yang diunggah pengguna
  let photos = Array.isArray(item.photos) && item.photos.length > 0
    ? item.photos.filter((p: any) => typeof p === 'string' && p.trim().length > 0).map(resolveAssetUrl)
    : [];

  if (photos.length === 0) {
    if (defaultMatch?.photos && defaultMatch.photos.length > 0) {
      photos = defaultMatch.photos.map(resolveAssetUrl);
    } else if (image) {
      photos = [image];
    }
  }

  const ratings = item.ratings && item.ratings.length > 0 ? item.ratings : (defaultMatch?.ratings || []);
  const totalRatings = item.totalRatings !== undefined ? item.totalRatings : ratings.length;
  const averageRating = item.averageRating !== undefined
    ? item.averageRating
    : ratings.length > 0
    ? Number((ratings.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / ratings.length).toFixed(1))
    : undefined;

  return {
    ...item,
    image,
    photos,
    photoCount: Math.max(photos.length, item.photoCount || (image ? 1 : 0)),
    videoUrl: videoUrl || undefined,
    videoDuration: videoDuration || undefined,
    ratings,
    averageRating,
    totalRatings,
  };
}

function AppContent() {
  const { theme } = useTheme();
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('beranda');
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    try {
      const savedNews = localStorage.getItem('kt_news_v1') || localStorage.getItem('kt_activities_v1');
      if (savedNews) {
        const parsed = JSON.parse(savedNews);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeNewsItem);
        }
      }
    } catch {}
    return ACTIVITIES_DATA.map(normalizeNewsItem);
  });

  // Direct Turso Database Utama fetch on initial mount (Backup: Filebase & Firestore hanya jika Turso kosong)
  useEffect(() => {
    let isMounted = true;
    const fetchInitialNews = async () => {
      // 1. DATABASE UTAMA: Ambil langsung dari Turso Database (libSQL Cloud)
      try {
        const tursoNews = await fetchNewsFromTurso();
        if (Array.isArray(tursoNews) && tursoNews.length > 0 && isMounted) {
          const list = tursoNews.map(normalizeNewsItem);
          setActivities(list);
          try {
            localStorage.setItem('kt_news_v1', JSON.stringify(list));
            localStorage.setItem('kt_activities_v1', JSON.stringify(list));
          } catch {}
          return;
        }
      } catch (tursoErr) {
        console.debug('Turso initial fetch notice:', tursoErr);
      }

      // 2. BACKUP FALLBACK 1: Ambil dari Filebase Storage jika Turso masih kosong
      try {
        const filebaseNews = await fetchNewsFromFilebase();
        if (Array.isArray(filebaseNews) && filebaseNews.length > 0 && isMounted) {
          const list = filebaseNews.map(normalizeNewsItem);
          setActivities(list);
          try {
            localStorage.setItem('kt_news_v1', JSON.stringify(list));
            localStorage.setItem('kt_activities_v1', JSON.stringify(list));
          } catch {}
          // Pulihkan ke Turso Utama
          for (const item of list) {
            saveNewsToTurso(item).catch(() => {});
          }
          return;
        }
      } catch (fbErr) {
        console.debug('Filebase backup fetch notice:', fbErr);
      }

      // 3. BACKUP FALLBACK 2: Ambil dari Cloud Firestore Backup jika Turso & Filebase kosong
      try {
        const colRef = collection(db, 'organizations', 'manisjaya', 'news');
        const snap = await getDocs(colRef);
        if (!snap.empty && isMounted) {
          const list: ActivityItem[] = [];
          snap.forEach((d) => {
            const item = d.data() as ActivityItem;
            if (item && (item.id || d.id)) {
              list.push(normalizeNewsItem({ ...item, id: item.id || d.id }));
            }
          });
          list.sort((a, b) => {
            const timeA = (a as any).updatedAt || a.date;
            const timeB = (b as any).updatedAt || b.date;
            return String(timeB).localeCompare(String(timeA));
          });
          if (list.length > 0) {
            setActivities(list);
            try {
              localStorage.setItem('kt_news_v1', JSON.stringify(list));
              localStorage.setItem('kt_activities_v1', JSON.stringify(list));
            } catch {}
            // Pulihkan ke Turso Utama & Filebase Backup
            for (const item of list) {
              saveNewsToTurso(item).catch(() => {});
            }
            saveNewsToFilebase(list, 'replace_all').catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Backup news fetch notice:', err);
      }
    };
    fetchInitialNews();
    return () => {
      isMounted = false;
    };
  }, []);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [showAddNews, setShowAddNews] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>({
    state: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'syncing',
    lastSyncedAt: null,
    message: 'Menghubungkan ke Turso Database Utama (libSQL)...',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingOfflineCount: 0,
  });

  // Sinkronisasi Hash URL dengan Tab & Deep-linking Berita untuk Crawler dan Pengunjung
  useEffect(() => {
    const handleHash = () => {
      if (typeof window === 'undefined') return;
      const rawHash = window.location.hash.replace(/^#/, '').trim();
      if (!rawHash) return;

      if (rawHash.startsWith('berita-')) {
        const targetId = rawHash.replace('berita-', '');
        const matched = activities.find(
          (a) => a.id === targetId || (a.slug && a.slug === targetId)
        );
        if (matched) {
          setCurrentTab('berita');
          setSelectedActivity(matched);
          return;
        }
      }

      const validTabs: WorkspaceTab[] = [
        'beranda',
        'berita',
        'jadwal',
        'voting',
        'ringkasan',
        'arsip_kegiatan',
        'galeri',
        'kategori',
        'surat',
        'anggota',
        'proposal',
        'laporan',
        'aset',
        'pengaturan',
        'akses',
        'database',
      ];

      const cleanHash = rawHash === 'kegiatan' ? 'ringkasan' : rawHash;
      if (validTabs.includes(cleanHash as WorkspaceTab)) {
        setCurrentTab(cleanHash as WorkspaceTab);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [activities]);

  // Dynamic SEO Synchronization per Tab Publik jika tidak ada modal artikel yang terbuka
  useEffect(() => {
    if (selectedActivity) return;

    const tabSeoMap: Record<string, { title?: string; desc: string }> = {
      beranda: {
        title: undefined,
        desc: DEFAULT_SEO.description,
      },
      berita: {
        title: 'Warta & Berita Kegiatan Pemuda',
        desc: 'Kumpulan berita resmi, dokumentasi, dan warta kegiatan sosial kemasyarakatan Karang Taruna Kelurahan Manis Jaya, Tangerang.',
      },
      jadwal: {
        title: 'Jadwal & Kalender Agenda Pemuda',
        desc: 'Kalender agenda kegiatan, jadwal rapat kepemudaan, gotong royong warga, dan program kerja Karang Taruna Manis Jaya Tangerang.',
      },
      voting: {
        title: 'Aspirasi & Polling Pemuda Manis Jaya',
        desc: 'Ruang partisipasi aspirasi warga dan voting program kepemudaan Karang Taruna Kelurahan Manis Jaya Kota Tangerang.',
      },
      ringkasan: {
        title: 'Program Kerja & Kegiatan Pemuda',
        desc: 'Daftar program kerja aktif, realisasi kegiatan sosial, dan pencapaian Karang Taruna Manis Jaya Tangerang.',
      },
      arsip_kegiatan: {
        title: 'Arsip Dokumentasi & Prestasi Pemuda',
        desc: 'Arsip rekam jejak kegiatan lampau dan dokumentasi bakti sosial pemuda Karang Taruna Kelurahan Manis Jaya Tangerang.',
      },
      galeri: {
        title: 'Galeri Foto Dokumentasi Kegiatan',
        desc: 'Album dokumentasi visual dan foto resolusi tinggi seluruh kegiatan kepemudaan Karang Taruna Manis Jaya.',
      },
    };

    const targetSeo = tabSeoMap[currentTab];
    if (targetSeo) {
      updatePageSeo({
        title: targetSeo.title,
        description: targetSeo.desc,
        canonicalUrl:
          currentTab === 'beranda'
            ? 'https://karangtarunamanisjaya.my.id/'
            : `https://karangtarunamanisjaya.my.id/#${currentTab}`,
      });
    }
  }, [currentTab, selectedActivity]);

  const sanitizeUser = (user: any): UserAccount => {
    if (!user) return GUEST_USER;
    if (user.id === 'guest' || user.username === 'pengunjung') return GUEST_USER;
    const defaultUser = DEFAULT_USERS.find((u) => u.id === user.id || u.username === user.username) || DEFAULT_USERS[0];
    const rawMenus = Array.isArray(user.allowedMenus) ? user.allowedMenus : (defaultUser.allowedMenus || []);
    // Ensure core tab 'beranda' is accessible to authenticated users
    const allowedMenus = Array.from(new Set([...rawMenus, 'beranda']));
    if (allowedMenus.includes('ringkasan') && !allowedMenus.includes('arsip_kegiatan')) {
      allowedMenus.push('arsip_kegiatan');
    }
    return {
      ...defaultUser,
      ...user,
      avatar: resolveAssetUrl(user?.avatar || defaultUser.avatar),
      allowedMenus,
    };
  };

  const isTabAllowedForUser = (tab: WorkspaceTab, user?: UserAccount | null): boolean => {
    const activeUser = user || currentUser;
    const isUserLoggedIn = Boolean(
      activeUser &&
      activeUser.id !== 'guest' &&
      (typeof localStorage !== 'undefined' ? Boolean(localStorage.getItem('kt_auth_user_v3')) : false)
    );

    // Pertama kali masuk situs (tamu belum login) hanya bisa melihat berita, voling, jadwal kegiatan, serta beranda
    if (!isUserLoggedIn) {
      return tab === 'berita' || tab === 'voting' || tab === 'beranda' || tab === 'jadwal';
    }

    if (activeUser?.isSuperAdmin) return true;
    if (tab === 'beranda') return true;
    const allowed = Array.isArray(activeUser?.allowedMenus) ? activeUser.allowedMenus : [];
    if (tab === 'arsip_kegiatan') {
      return allowed.includes('ringkasan') || allowed.includes('arsip_kegiatan');
    }
    if (tab === 'tambah_berita' || tab === 'kategori' || tab === 'galeri') {
      return allowed.includes('berita') || allowed.includes('tambah_berita');
    }
    return allowed.includes(tab);
  };

  // Authentication & Access Control state (Local persistence)
  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('kt_users_list_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((u) => sanitizeUser(u));
        }
      }
    } catch (e) {}
    try {
      localStorage.setItem('kt_users_list_v3', JSON.stringify(DEFAULT_USERS));
    } catch (e) {}
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const savedAuth = localStorage.getItem('kt_auth_user_v3');
      if (savedAuth) {
        return sanitizeUser(JSON.parse(savedAuth));
      }
    } catch (e) {}
    return GUEST_USER;
  });

  const isLoggedIn = Boolean(
    currentUser &&
    currentUser.id !== 'guest' &&
    (typeof localStorage !== 'undefined' ? Boolean(localStorage.getItem('kt_auth_user_v3')) : false)
  );

  const [showLoginModal, setShowLoginModal] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const p = new URLSearchParams(window.location.search);
        if (p.get('action') === 'verify_email' || p.get('code') || p.get('verifyCode')) {
          return true;
        }
      }
    } catch {}
    return false;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleUpdateUsers = (updated: UserAccount[]) => {
    // Selalu pastikan akun Administrator Super Admin khusus tetap ada dan tidak terhapus
    const adminUser =
      usersList.find(
        (u) => u.isSuperAdmin || u.id === 'usr-administrator' || (u.username && u.username.toLowerCase() === 'administrator')
      ) || DEFAULT_USERS[0];
    const hasAdmin = updated.some(
      (u) => u.isSuperAdmin || u.id === 'usr-administrator' || (u.username && u.username.toLowerCase() === 'administrator')
    );
    const fullList = hasAdmin ? updated : [adminUser, ...updated];
    const sanitizedList = fullList.map((u) => sanitizeUser(u));

    setUsersList(sanitizedList);
    try {
      localStorage.setItem('kt_users_list_v3', JSON.stringify(sanitizedList));
    } catch (e) {}

    // Synchronize members list in localStorage as well
    try {
      const savedMembers = localStorage.getItem('kt_members_v3');
      if (savedMembers) {
        const membersList = JSON.parse(savedMembers);
        const syncedMembers = membersList.map((m: any) => {
          const matchedUser = sanitizedList.find((u) => u.id === m.id || u.username === m.username);
          if (matchedUser) {
            return {
              ...m,
              username: matchedUser.username,
              password: matchedUser.password,
              name: matchedUser.name,
              jabatan: matchedUser.role.replace(' Karang Taruna', ''),
              allowedMenus: matchedUser.allowedMenus,
              isSuperAdmin: matchedUser.isSuperAdmin,
            };
          }
          return m;
        });
        localStorage.setItem('kt_members_v3', JSON.stringify(syncedMembers));
      }
    } catch (e) {}

    // Synchronize active user if edited in list
    const foundCurrent = sanitizedList.find((u) => u.id === currentUser.id || u.username === currentUser.username);
    if (foundCurrent) {
      setCurrentUser(foundCurrent);
      try {
        localStorage.setItem('kt_auth_user_v3', JSON.stringify(foundCurrent));
      } catch (e) {}
    }

    addNotification({
      title: 'Data Pengurus Disimpan',
      message: `${sanitizedList.length} akun pengurus dan hak akses berhasil diperbarui.`,
      type: 'anggota',
      linkTab: 'akses',
      actionLabel: 'Lihat Pengurus',
    });
  };

  const handleLoginUser = (user: UserAccount) => {
    const sanitized = sanitizeUser(user);
    setCurrentUser(sanitized);
    setShowLoginModal(false);
    try {
      localStorage.setItem('kt_auth_user_v3', JSON.stringify(sanitized));
    } catch (e) {}
    showToast(`Berhasil masuk sebagai ${sanitized.name} (${sanitized.role})`);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('kt_auth_user_v3');
    } catch (e) {}
    setCurrentUser(GUEST_USER);
    setCurrentTab('beranda');
    showToast('Sesi ditutup. Anda kini dalam mode Pengunjung (Tamu).');
    setShowLoginModal(false);
  };

  const handleAddActivity = async (newAct: ActivityItem) => {
    const updated = [newAct, ...activities.filter((a) => a.id !== newAct.id)];
    setActivities(updated);

    try {
      localStorage.setItem('kt_news_v1', JSON.stringify(updated));
      localStorage.setItem('kt_activities_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage save notice:', e);
      // Fallback: If quota exceeded due to large video/photos, save sanitized copy without oversized video data
      try {
        const lightweight = updated.map((act) => ({
          ...act,
          videoUrl: act.videoUrl?.startsWith('data:video/') ? '' : act.videoUrl,
          photos: Array.isArray(act.photos) ? act.photos.slice(0, 2) : [],
        }));
        localStorage.setItem('kt_news_v1', JSON.stringify(lightweight));
        localStorage.setItem('kt_activities_v1', JSON.stringify(lightweight));
      } catch {}
    }

    // 1. DATABASE UTAMA: Simpan langsung ke Turso Database (libSQL Cloud)
    await saveNewsToTurso(newAct).catch((err) => {
      console.warn('Turso primary news write notice:', err);
    });
    pushFullStateToTurso(`Tambah berita: ${newAct.title}`, currentUser.name).catch(() => {});

    // 2. DATABASE CADANGAN (BACKUP): Firestore & Filebase berjalan non-blocking di latar belakang
    saveNewsToFirestore(newAct).catch(() => {});
    saveNewsToFilebase(newAct, 'upsert').catch(() => {});
    pushBackupToFirestore(`Tambah berita: ${newAct.title}`, currentUser.name).catch(() => {});
    notifyLocalDataChanged('Pembaruan Berita Kegiatan');

    addNotification({
      title: 'Kegiatan Baru Ditambahkan',
      message: `${newAct.title} (${newAct.badge}) pada ${newAct.date}`,
      type: 'kegiatan',
      linkTab: 'berita',
      actionLabel: 'Lihat Kegiatan',
    });
  };

  const handleDeleteActivity = async (id: string) => {
    const updated = activities.filter((a) => a.id !== id);
    setActivities(updated);
    try {
      localStorage.setItem('kt_news_v1', JSON.stringify(updated));
      localStorage.setItem('kt_activities_v1', JSON.stringify(updated));
    } catch {}

    // 1. DATABASE UTAMA: Hapus dari Turso
    await deleteNewsFromTurso(id).catch(() => {});
    pushFullStateToTurso('Hapus berita kegiatan', currentUser.name).catch(() => {});

    // 2. DATABASE CADANGAN (BACKUP): Hapus di Firestore & Filebase di latar belakang
    deleteNewsFromFirestore(id).catch(() => {});
    saveNewsToFilebase({ id }, 'delete').catch(() => {});
    pushBackupToFirestore('Hapus berita kegiatan', currentUser.name).catch(() => {});
    notifyLocalDataChanged('Hapus Berita Kegiatan');
    setSelectedActivity(null);
    showToast('Berita kegiatan berhasil dihapus.');
  };

  const handleToggleArchiveActivity = async (act: ActivityItem, reason?: string) => {
    const isNowArchived = !act.isArchived;
    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const updatedAct: ActivityItem = {
      ...act,
      isArchived: isNowArchived,
      archivedAt: isNowArchived ? (act.archivedAt || nowStr) : undefined,
      archiveReason: isNowArchived
        ? reason || act.archiveReason || 'Kegiatan telah selesai dilaksanakan'
        : undefined,
    };

    const updated = activities.map((a) => (a.id === act.id ? updatedAct : a));
    setActivities(updated);

    if (selectedActivity?.id === act.id) {
      setSelectedActivity(updatedAct);
    }

    try {
      localStorage.setItem('kt_news_v1', JSON.stringify(updated));
      localStorage.setItem('kt_activities_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    const actionReason = isNowArchived ? `Arsipkan kegiatan: ${act.title}` : `Pulihkan kegiatan: ${act.title}`;

    // 1. DATABASE UTAMA: Turso
    await saveNewsToTurso(updatedAct).catch(() => {});
    pushFullStateToTurso(actionReason, currentUser.name).catch(() => {});

    // 2. DATABASE CADANGAN (BACKUP): Firestore & Filebase
    saveNewsToFirestore(updatedAct).catch(() => {});
    saveNewsToFilebase(updatedAct, 'upsert').catch(() => {});
    pushBackupToFirestore(actionReason, currentUser.name).catch(() => {});
    notifyLocalDataChanged('Pembaruan Arsip Kegiatan');

    if (isNowArchived) {
      showToast(`Kegiatan "${act.title}" berhasil dipindahkan ke Arsip Kegiatan.`);
      addNotification({
        title: 'Kegiatan Diarsipkan',
        message: `"${act.title}" dipindahkan ke Arsip Kegiatan agar tidak memenuhi dashboard utama.`,
        type: 'kegiatan',
        linkTab: 'arsip_kegiatan',
        actionLabel: 'Buka Arsip',
      });
    } else {
      showToast(`Kegiatan "${act.title}" berhasil dipulihkan ke dashboard utama.`);
      addNotification({
        title: 'Kegiatan Dipulihkan',
        message: `"${act.title}" dikembalikan ke daftar kegiatan aktif di dashboard.`,
        type: 'kegiatan',
        linkTab: 'ringkasan',
        actionLabel: 'Lihat Kegiatan',
      });
    }
  };

  const handleAutoArchivePastActivities = async () => {
    let count = 0;
    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const updated = activities.map((act) => {
      if (!act.isArchived) {
        count++;
        return {
          ...act,
          isArchived: true,
          archivedAt: nowStr,
          archiveReason: 'Kegiatan lampau yang telah selesai dilaksanakan',
        };
      }
      return act;
    });

    if (count === 0) {
      showToast('Seluruh kegiatan lampau sudah berada di kategori arsip.');
      return;
    }

    setActivities(updated);
    try {
      localStorage.setItem('kt_news_v1', JSON.stringify(updated));
      localStorage.setItem('kt_activities_v1', JSON.stringify(updated));
    } catch {}

    // 1. DATABASE UTAMA: Turso
    for (const item of updated) {
      saveNewsToTurso(item).catch(() => {});
    }
    pushFullStateToTurso(`Arsipkan ${count} kegiatan lampau`, currentUser.name).catch(() => {});

    // 2. DATABASE CADANGAN (BACKUP): Firestore & Filebase
    saveNewsToFilebase(updated, 'replace_all').catch(() => {});
    pushBackupToFirestore(`Arsipkan ${count} kegiatan lampau`, currentUser.name).catch(() => {});
    notifyLocalDataChanged('Pembaruan Arsip Kegiatan');
    showToast(`${count} kegiatan lampau berhasil dipindahkan ke Arsip Kegiatan!`);
  };

  // Listen for news updates pushed from Turso Primary Sync (tidak ditimpa oleh Backup Firestore/Filebase)
  useEffect(() => {
    const handleNewsUpdate = (e: any) => {
      if (e.detail?.news && Array.isArray(e.detail.news)) {
        setActivities(e.detail.news.map(normalizeNewsItem));
      }
    };
    window.addEventListener('kt_news_updated', handleNewsUpdate);

    return () => {
      window.removeEventListener('kt_news_updated', handleNewsUpdate);
    };
  }, []);

  // Sinkronisasi Utama Real-Time dengan Turso Database (libSQL Cloud)
  // Firestore & Filebase berjalan otomatis sebagai Backup non-blocking
  useEffect(() => {
    enableTursoAutoSync(
      () => currentUser.name,
      (reason) => {
        pushBackupToFirestore(reason, currentUser.name).catch(() => {});
      }
    );

    const unsubscribeTurso = startTursoPrimarySync(
      (status) => {
        setCloudSyncStatus(status);
      },
      (updatedKeys) => {
        showToast('Data diperbarui dari Turso Database Utama (sinkron lintas perangkat)!');
        if (updatedKeys.includes('kt_users_list_v3')) {
          try {
            const raw = localStorage.getItem('kt_users_list_v3');
            if (raw) setUsersList(JSON.parse(raw));
          } catch {}
        }
        if (updatedKeys.includes('kt_news_v1') || updatedKeys.includes('kt_activities_v1')) {
          try {
            const raw = localStorage.getItem('kt_news_v1') || localStorage.getItem('kt_activities_v1');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                setActivities(parsed.map(normalizeNewsItem));
              }
            }
          } catch {}
        }
      }
    );

    return () => {
      unsubscribeTurso();
    };
  }, [currentUser.name]);

  const handleManualCloudSync = async () => {
    try {
      showToast('Menyinkronkan data ke Turso Database Utama...');
      const res = await pushFullStateToTurso('Sinkronisasi manual pengguna ke Turso Utama', currentUser.name);
      // Cadangkan secara non-blocking ke Firestore & Filebase Backup
      pushBackupToFirestore('Cadangan sinkronisasi manual', currentUser.name).catch(() => {});
      saveNewsToFilebase(activities, 'replace_all').catch(() => {});

      if (res.success) {
        showToast('Data berhasil disinkronkan ke Turso Database Utama! (Cadangan diperbarui)');
      } else {
        showToast(res.message || 'Sinkronisasi Turso tertunda, data aman di lokal.');
      }
    } catch (err: any) {
      showToast(`Gagal sinkronisasi Turso: ${err.message}`);
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      act.title.toLowerCase().includes(q) ||
      act.description.toLowerCase().includes(q) ||
      act.badge.toLowerCase().includes(q) ||
      act.location.toLowerCase().includes(q)
    );
  });

  const archivedActivitiesCount = activities.filter((a) => a.isArchived === true).length;
  // Dashboard & kegiatan aktif: kegiatan yang belum diarsipkan
  const activeActivities = filteredActivities.filter((act) => !act.isArchived);

  const handleUpdateActivity = async (updatedAct: ActivityItem, customToastMessage?: string) => {
    const updated = activities.map((a) => (a.id === updatedAct.id ? updatedAct : a));
    setActivities(updated);
    setSelectedActivity(updatedAct);
    try {
      localStorage.setItem('kt_news_v1', JSON.stringify(updated));
      localStorage.setItem('kt_activities_v1', JSON.stringify(updated));
    } catch {}

    // 1. DATABASE UTAMA: Turso
    await saveNewsToTurso(updatedAct).catch(() => {});
    pushFullStateToTurso(`Update warta: ${updatedAct.title}`, currentUser.name).catch(() => {});

    // 2. DATABASE CADANGAN (BACKUP): Firestore & Filebase
    saveNewsToFirestore(updatedAct).catch(() => {});
    saveNewsToFilebase(updatedAct, 'upsert').catch(() => {});
    pushBackupToFirestore(`Update warta: ${updatedAct.title}`, currentUser.name).catch(() => {});
    notifyLocalDataChanged('Pembaruan Berita Kegiatan');
    if (customToastMessage) {
      showToast(customToastMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header - Matches the photo */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        onOpenSettings={() => setCurrentTab('pengaturan')}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        syncStatus={cloudSyncStatus}
        onManualSync={handleManualCloudSync}
        onOpenFirebaseConfig={() => setShowFirebaseModal(true)}
        onDownloadApk={() => setShowApkModal(true)}
        onNavigateToTab={(tab) => {
          if (isTabAllowedForUser(tab, currentUser)) {
            setCurrentTab(tab);
          } else {
            showToast(`Akses Dibatasi: Menu tersebut belum dicentang pada izin akun Anda.`);
          }
        }}
        searchPlaceholder={
          currentTab === 'ringkasan' || currentTab === 'beranda'
            ? 'Cari kegiatan, agenda, dokumentasi, atau informasi...'
            : currentTab === 'anggota'
            ? 'Cari nama, NIK, nomor anggota, atau nomor HP...'
            : currentTab === 'surat'
            ? 'Cari dokumen, nomor surat, atau kategori...'
            : 'Cari menu, dokumen, anggota, atau informasi...'
        }
      />

      {/* Main Workspace Layout: Sidebar + Content */}
      <div
        className={`flex-1 flex overflow-x-hidden relative ${
          theme.sidebarPosition === 'kanan' ? 'flex-row-reverse' : 'flex-row'
        }`}
        style={{ backgroundColor: theme.backgroundColor }}
      >
        {/* Desktop Sidebar (Left or Right based on settings) */}
        <div className="hidden lg:block">
          <Sidebar
            currentTab={currentTab}
            currentUser={currentUser}
            archivedCount={archivedActivitiesCount}
            allowedMenus={currentUser.isSuperAdmin ? undefined : (currentUser.allowedMenus || [])}
            onOpenFirebaseConfig={() => setShowFirebaseModal(true)}
            onOpenLoginModal={() => setShowLoginModal(true)}
            onLogout={handleLogout}
            onDownloadApk={() => setShowApkModal(true)}
            onSelectTab={(tab) => {
              if (isTabAllowedForUser(tab, currentUser)) {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                if (!isLoggedIn) {
                  showToast(`Wajib masuk / login pengurus untuk membuka menu tersebut.`);
                  setShowLoginModal(true);
                } else {
                  showToast(`Akses Dibatasi: Menu tersebut belum dicentang untuk akun ${currentUser.name}.`);
                }
              }
            }}
          />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-64 bg-white h-full shadow-2xl flex flex-col animate-slideInLeft">
              <Sidebar
                currentTab={currentTab}
                currentUser={currentUser}
                archivedCount={archivedActivitiesCount}
                allowedMenus={currentUser.isSuperAdmin ? undefined : (currentUser.allowedMenus || [])}
                onClose={() => setMobileMenuOpen(false)}
                onOpenFirebaseConfig={() => {
                  setMobileMenuOpen(false);
                  setShowFirebaseModal(true);
                }}
                onOpenLoginModal={() => {
                  setMobileMenuOpen(false);
                  setShowLoginModal(true);
                }}
                onLogout={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                onDownloadApk={() => {
                  setMobileMenuOpen(false);
                  setShowApkModal(true);
                }}
                onSelectTab={(tab) => {
                  if (isTabAllowedForUser(tab, currentUser)) {
                    setCurrentTab(tab);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setMobileMenuOpen(false);
                    if (!isLoggedIn) {
                      showToast(`Wajib masuk / login pengurus untuk membuka menu tersebut.`);
                      setShowLoginModal(true);
                    } else {
                      showToast(`Akses Dibatasi: Menu tersebut belum dicentang untuk akun Anda.`);
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Center / Right Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Permission Guard: Check if current tab is allowed for current user */}
          {!isTabAllowedForUser(currentTab, currentUser) ? (
            !isLoggedIn ? (
              <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto mt-8 animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Wajib Login Pengurus
                  </span>
                  <h3 className="text-xl font-black text-slate-900 pt-2">
                    Akses Menu Khusus Pengurus
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                    Menu ini dibatasi untuk Pengurus Karang Taruna Kelurahan Manis Jaya. Pertama kali masuk situs pengunjung umum hanya dapat melihat <strong>Berita Kegiatan</strong> dan <strong>Voling Anggota</strong>. Silakan masuk / login untuk membuka seluruh modul sesuai hak akses Anda.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Masuk / Login Pengurus</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('berita');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Lihat Berita Kegiatan
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('voting');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Buka Voling Anggota
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto mt-8 animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Hak Akses Terkunci
                  </span>
                  <h3 className="text-xl font-black text-slate-900 pt-2">
                    Akses Menu Ini Dibatasi
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                    Akun Anda (<strong>{currentUser.name}</strong> - <em>@{currentUser.username}</em>) belum dicentang untuk membuka menu/aplikasi ini oleh Pengurus Karang Taruna.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Status Wewenang Anggota:</p>
                  <p>• Peran: <span className="font-bold text-blue-600">{currentUser.role}</span></p>
                  <p>• Wilayah: <span className="font-bold text-slate-700">{currentUser.rw}</span></p>
                  <p>• Total Menu Terbuka: <span className="font-bold text-emerald-600">{(currentUser.allowedMenus || []).length} Menu</span></p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setCurrentTab('beranda')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Beranda</span>
                  </button>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Ganti Akun Pengurus Lain
                  </button>
                </div>
              </div>
            )
          ) : (
            <>
              {/* 1. View: Anggota & KTA (100% synchronized with user accounts & password form) */}
              {currentTab === 'anggota' && (
                <AnggotaView
                  onToast={showToast}
                  currentUser={currentUser}
                  usersList={usersList}
                  onUpdateUsers={handleUpdateUsers}
                  onSwitchUser={handleLoginUser}
                />
              )}

              {/* 2. View: Surat Menyurat */}
              {currentTab === 'surat' && (
                <SuratMenyuratView onToast={showToast} />
              )}

              {/* 3. View: Pengaturan Umum */}
              {currentTab === 'pengaturan' && (
                <PengaturanUmumView
                  onToast={showToast}
                  onNavigateToTab={(t) => {
                    setCurrentTab(t);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {/* 4. View: Beranda (Home Portal dengan Button Menu) */}
              {currentTab === 'beranda' && (
                <BerandaView
                  onNavigate={(tab) => {
                    if (isTabAllowedForUser(tab, currentUser)) {
                      setCurrentTab(tab);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      if (!isLoggedIn) {
                        showToast(`Wajib masuk / login pengurus untuk membuka menu tersebut.`);
                        setShowLoginModal(true);
                      } else {
                        showToast(`Akses Dibatasi: Menu tersebut belum dicentang untuk akun ${currentUser.name}.`);
                      }
                    }
                  }}
                  allowedMenus={currentUser.isSuperAdmin ? undefined : (currentUser.allowedMenus || [])}
                  onAddNews={() => {
                    if (!isLoggedIn) {
                      showToast(`Wajib masuk / login pengurus untuk menambah berita.`);
                      setShowLoginModal(true);
                      return;
                    }
                    setCurrentTab('tambah_berita');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onToast={showToast}
                  onSelectActivity={(act) => setSelectedActivity(act)}
                  activities={activeActivities}
                  archivedCount={archivedActivitiesCount}
                  onDownloadApk={() => setShowApkModal(true)}
                  currentUser={currentUser}
                  isLoggedIn={isLoggedIn}
                  onOpenLoginModal={() => setShowLoginModal(true)}
                />
              )}

              {/* 4b. View: Kegiatan (Workspace Program Kerja dengan Visualisasi Recharts) */}
              {currentTab === 'ringkasan' && (
                <KegiatanView
                  activities={activeActivities}
                  onSelectActivity={(act) => setSelectedActivity(act)}
                  onAddActivity={() => setShowAddNews(true)}
                  onExploreCalendar={() => setCurrentTab('jadwal')}
                  onViewAllNews={() => setCurrentTab('berita')}
                  onToast={showToast}
                  onOpenArchive={() => setCurrentTab('arsip_kegiatan')}
                  archivedCount={archivedActivitiesCount}
                />
              )}

              {/* 4c. Subview: Arsip Kegiatan (Program Kerja & Dokumentasi yang telah selesai) */}
              {currentTab === 'arsip_kegiatan' && (
                <ArsipKegiatanView
                  activities={activities}
                  onSelectActivity={(act) => setSelectedActivity(act)}
                  onToggleArchive={handleToggleArchiveActivity}
                  onAutoArchivePast={handleAutoArchivePastActivities}
                  onBackToActivities={() => setCurrentTab('ringkasan')}
                  onToast={showToast}
                />
              )}

              {/* 5. Subview: Proposal */}
              {currentTab === 'proposal' && (
                <ProposalsView
                  onToast={showToast}
                  onBackToHome={() => setCurrentTab('ringkasan')}
                />
              )}

              {/* 6. Subview: Laporan Kegiatan (Matches the uploaded screenshot!) */}
              {currentTab === 'laporan' && (
                <LaporanKegiatanView
                  onNavigateToTab={(tab) => {
                    setCurrentTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onSelectActivity={(act) => setSelectedActivity(act)}
                  onToast={showToast}
                />
              )}

              {/* 7. Subview: Inventaris Aset Organisasi (Pencatatan Barang, Kondisi, Lokasi & Integrasi Firebase) */}
              {currentTab === 'aset' && (
                <InventarisAssetView
                  onToast={showToast}
                  onBackToHome={() => setCurrentTab('ringkasan')}
                  onNavigateToTab={(tab) => {
                    setCurrentTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {/* 8. Subview: Jadwal Kegiatan (Jadwal & Kalender Agenda Pemuda) */}
              {currentTab === 'jadwal' && (
                <JadwalKegiatanView
                  onToast={showToast}
                  onExploreOther={() => setCurrentTab(isLoggedIn ? 'ringkasan' : 'berita')}
                  currentUser={currentUser}
                  isLoggedIn={isLoggedIn}
                />
              )}

              {/* 9. Subview: Berita Kegiatan (Semua Berita & Dokumentasi Kegiatan lengkap) */}
              {currentTab === 'berita' && (
                <SemuaBeritaView
                  activities={activities}
                  onSelectActivity={(act) => setSelectedActivity(act)}
                  onAddNews={() => setCurrentTab('tambah_berita')}
                  onToast={showToast}
                  onDeleteActivity={handleDeleteActivity}
                  onToggleArchive={handleToggleArchiveActivity}
                />
              )}

              {/* 9b. Subview: Tambah Berita / Kegiatan Baru (Exact match of uploaded screenshot!) */}
              {currentTab === 'tambah_berita' && (
                <TambahBeritaView
                  currentUser={currentUser}
                  onSaveActivity={(newAct, isDraft) => {
                    handleAddActivity(newAct);
                    if (!isDraft) {
                      showToast(`Berita "${newAct.title}" berhasil diterbitkan ke portal!`);
                    } else {
                      showToast(`Draft berita "${newAct.title}" berhasil disimpan.`);
                    }
                  }}
                  onNavigateToTab={(tab) => {
                    setCurrentTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onToast={showToast}
                />
              )}

              {/* 9c. Subview: Kategori Berita & Kegiatan */}
              {currentTab === 'kategori' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Kategori Berita & Kegiatan
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Klasifikasi agenda dan publikasi Karang Taruna Kelurahan Manis Jaya.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('tambah_berita')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                    >
                      + Buat Kegiatan di Kategori Ini
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Sosial', desc: 'Bakti sosial, santunan yatim, donor darah, dan bantuan sembako warga.', color: 'from-blue-500 to-indigo-600' },
                      { name: 'Keagamaan', desc: 'Peringatan hari besar Islam, pengajian pemuda, dan bersih-bersih masjid.', color: 'from-emerald-500 to-teal-600' },
                      { name: 'Olahraga', desc: 'Turnamen futsal antar-RW, bulutangkis, senam sehat, dan e-sports.', color: 'from-amber-500 to-orange-600' },
                      { name: 'Lingkungan', desc: 'Kerja bakti gotong royong, pilah sampah, dan penanaman pohon.', color: 'from-green-500 to-emerald-700' },
                      { name: 'Pendidikan & Pelatihan', desc: 'Bimbingan belajar, pelatihan digital skill, dan seminar wirausaha.', color: 'from-purple-500 to-violet-700' },
                      { name: 'Kesenian & Budaya', desc: 'Pentas seni kemerdekaan, kreasi tari tradisional, dan musik pemuda.', color: 'from-rose-500 to-pink-600' },
                    ].map((kat) => {
                      const count = activities.filter((a) =>
                        (a.category || a.type || a.title || '').toLowerCase().includes(kat.name.toLowerCase())
                      ).length;
                      return (
                        <div key={kat.name} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-3 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r ${kat.color}`}>
                              {kat.name}
                            </span>
                            <span className="text-xs font-bold text-slate-500">{count} Agenda</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{kat.desc}</p>
                          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                            <button
                              onClick={() => setCurrentTab('berita')}
                              className="font-bold text-blue-600 hover:underline"
                            >
                              Lihat Kegiatan →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 9d. Subview: Galeri Foto */}
              {currentTab === 'galeri' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Galeri Foto & Album Dokumentasi
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Dokumentasi visual foto resolusi tinggi seluruh kegiatan pemuda.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('tambah_berita')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                    >
                      + Upload Foto Baru
                    </button>
                  </div>
                  {activities.flatMap((a) => (a.photos || []).map((p, idx) => ({ photo: p, title: a.title, date: a.date, id: `${a.id}-${idx}` }))).length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">Belum Ada Foto Dokumentasi di Galeri</h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Foto yang diunggah saat menambahkan berita atau dokumentasi kegiatan akan otomatis tampil rapi dan tersusun di album galeri ini.
                      </p>
                      <button
                        onClick={() => setCurrentTab('tambah_berita')}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 transition-all inline-flex items-center gap-2"
                      >
                        + Tambah Berita & Unggah Foto
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {activities.flatMap((a) => (a.photos || []).map((p, idx) => ({ photo: p, title: a.title, date: a.date, id: `${a.id}-${idx}` }))).map((item) => (
                        <div key={item.id} className="group relative rounded-2xl overflow-hidden shadow-xs border border-slate-200 aspect-square">
                          <img src={item.photo} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                            <p className="text-xs font-bold line-clamp-1">{item.title}</p>
                            <p className="text-[10px] text-slate-300">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 10. Subview: Akses Pengguna & Manajemen Otorisasi Anggota */}
              {currentTab === 'akses' && (
                <AksesPenggunaView
                  currentUser={currentUser}
                  usersList={usersList}
                  onUpdateUsers={handleUpdateUsers}
                  onSwitchUser={handleLoginUser}
                  onToast={showToast}
                />
              )}

              {/* 11. Subview: Database & Integrasi Google Drive */}
              {currentTab === 'database' && (
                <DatabaseGoogleDriveView
                  onToast={showToast}
                  onNavigateToTab={(tab) => {
                    setCurrentTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {/* 12. View: Voling Anggota (Voting & Aspirasi Real-Time) */}
              {currentTab === 'voting' && (
                <div className="space-y-6 animate-fadeIn">
                  <VotingAnggotaSection
                    currentUser={currentUser}
                    onToast={showToast}
                    onNavigateToTab={(tab) => {
                      if (isTabAllowedForUser(tab, currentUser)) {
                        setCurrentTab(tab);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        if (!isLoggedIn) {
                          showToast(`Wajib masuk / login pengurus untuk membuka menu tersebut.`);
                          setShowLoginModal(true);
                        } else {
                          showToast(`Akses Dibatasi: Menu tersebut belum dicentang untuk akun ${currentUser.name}.`);
                        }
                      }
                    }}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Asisten AI Karang Taruna (Tanya Program, Tatacara, Berita & Kegiatan) */}
      <FloatingChat
        activities={activities}
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        onNavigateToTab={(tab) => {
          if (isTabAllowedForUser(tab, currentUser)) {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            if (!isLoggedIn) {
              showToast(`Wajib masuk / login pengurus untuk membuka menu tersebut.`);
              setShowLoginModal(true);
            } else {
              showToast(`Akses Dibatasi: Menu tersebut belum dicentang untuk akun ${currentUser.name}.`);
            }
          }
        }}
      />

      {/* Modal: Activity Detail */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onToast={showToast}
          onDelete={handleDeleteActivity}
          onToggleArchive={handleToggleArchiveActivity}
          onUpdateActivity={handleUpdateActivity}
          currentMember={currentUser}
        />
      )}

      {/* Modal: Add News / Activity */}
      {showAddNews && (
        <AddNewsModal
          onClose={() => setShowAddNews(false)}
          onAdd={handleAddActivity}
          onToast={showToast}
        />
      )}

      {/* Mobile Bottom Navigation Bar (If enabled in theme settings) */}
      {theme.mobileSidebarMode === 'bottom_bar' && (
        <div className="lg:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around text-xs shadow-lg">
          <button
            onClick={() => {
              setCurrentTab('beranda');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 font-semibold ${
              currentTab === 'beranda' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <span className="text-sm">🏠</span>
            <span className="text-[10px]">Beranda</span>
          </button>
          <button
            onClick={() => {
              setCurrentTab('berita');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 font-semibold ${
              currentTab === 'berita' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <span className="text-sm">📢</span>
            <span className="text-[10px]">Berita</span>
          </button>
          <button
            onClick={() => {
              setCurrentTab('voting');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 font-semibold ${
              currentTab === 'voting' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <span className="text-sm">🗳️</span>
            <span className="text-[10px]">Voling</span>
          </button>
          {isTabAllowedForUser('surat', currentUser) && (
            <button
              onClick={() => {
                setCurrentTab('surat');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-0.5 font-semibold ${
                currentTab === 'surat' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <span className="text-sm">✉️</span>
              <span className="text-[10px]">Surat</span>
            </button>
          )}
          {isTabAllowedForUser('anggota', currentUser) && (
            <button
              onClick={() => {
                setCurrentTab('anggota');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-0.5 font-semibold ${
                currentTab === 'anggota' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <span className="text-sm">👥</span>
              <span className="text-[10px]">Anggota</span>
            </button>
          )}
          {isTabAllowedForUser('pengaturan', currentUser) && (
            <button
              onClick={() => {
                setCurrentTab('pengaturan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-0.5 font-semibold ${
                currentTab === 'pengaturan' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <span className="text-sm">⚙️</span>
              <span className="text-[10px]">Pengaturan</span>
            </button>
          )}
        </div>
      )}

      {/* Toast Notification */}
      <NotificationToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* Modal: Login & Password Anggota Karang Taruna */}
      <LoginModal
        isOpen={showLoginModal}
        onLogin={handleLoginUser}
        onRegisterUser={(newUser) => {
          handleUpdateUsers([newUser, ...usersList]);
          handleLoginUser(newUser);
          showToast(`Akun ${newUser.name} berhasil didaftarkan dan diverifikasi! Selamat datang di Karang Taruna.`);
        }}
        usersList={usersList}
        canDismiss={false}
      />

      {/* Modal: Kelola Akun & Ganti Database Firebase (firebase.google.com) */}
      <FirebaseConfigModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
        onToast={showToast}
      />

      {/* Modal: Download Program APK Android Karang Taruna */}
      <ApkDownloadModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        onToast={showToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrandingProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrandingProvider>
  );
}
