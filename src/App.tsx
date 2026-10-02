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
import { LaporanKegiatanView } from './components/workspace/LaporanKegiatanView';
import { JadwalKegiatanView } from './components/workspace/JadwalKegiatanView';
import { AsetOrganisasiView } from './components/workspace/AsetOrganisasiView';
import { DatabaseGoogleDriveView } from './components/workspace/DatabaseGoogleDriveView';
import { FirebaseConfigModal } from './components/workspace/FirebaseConfigModal';
import { LoginModal } from './components/auth/LoginModal';
import { DEFAULT_USERS, UserAccount } from './types/auth';
import { Lock, ArrowLeft } from 'lucide-react';
import {
  ACTIVITIES_DATA,
  ActivityItem,
} from './data/workspaceData';
import {
  startRealtimeSync,
  enableAutoBroadcast,
  pushLocalDataToCloud,
  CloudSyncStatus,
} from './services/firestoreSyncService';

function AppContent() {
  const { theme } = useTheme();
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('beranda');
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    try {
      const saved = localStorage.getItem('kt_agenda_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ACTIVITIES_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem('kt_agenda_v1', JSON.stringify(activities));
    } catch {}
  }, [activities]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [showAddNews, setShowAddNews] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>({
    state: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'syncing',
    lastSyncedAt: null,
    message: 'Menghubungkan ke Cloud Firestore...',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingOfflineCount: 0,
  });

  const sanitizeUser = (user: any): UserAccount => {
    if (!user) return DEFAULT_USERS[0];
    const defaultUser = DEFAULT_USERS.find((u) => u.id === user.id || u.username === user.username) || DEFAULT_USERS[0];
    const rawMenus = Array.isArray(user.allowedMenus) ? user.allowedMenus : (defaultUser.allowedMenus || []);
    // Ensure core tabs like 'beranda' and 'surat' are always accessible to users
    const allowedMenus = Array.from(new Set([...rawMenus, 'beranda', 'surat']));
    return {
      ...defaultUser,
      ...user,
      allowedMenus,
    };
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
    try {
      localStorage.setItem('kt_auth_user_v3', JSON.stringify(DEFAULT_USERS[0]));
    } catch (e) {}
    return DEFAULT_USERS[0];
  });

  const [showLoginModal, setShowLoginModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleUpdateUsers = (updated: UserAccount[]) => {
    const sanitizedList = updated.map((u) => sanitizeUser(u));
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
    showToast('Sesi ditutup. Silakan login kembali.');
    setShowLoginModal(true);
  };

  const handleAddActivity = (newAct: ActivityItem) => {
    setActivities([newAct, ...activities]);
  };

  // Filter activities based on search query in header
  // Real-time Cloud Firestore synchronization across all devices
  useEffect(() => {
    enableAutoBroadcast(() => currentUser.name);

    const unsubscribe = startRealtimeSync(
      (status) => {
        setCloudSyncStatus(status);
      },
      (updatedKeys) => {
        showToast('Data diperbarui secara real-time dari komputer/perangkat lain!');
        if (updatedKeys.includes('kt_users_list_v3')) {
          try {
            const raw = localStorage.getItem('kt_users_list_v3');
            if (raw) setUsersList(JSON.parse(raw));
          } catch {}
        }
        if (updatedKeys.includes('kt_agenda_v1')) {
          try {
            const raw = localStorage.getItem('kt_agenda_v1');
            if (raw) setActivities(JSON.parse(raw));
          } catch {}
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser.name]);

  const handleManualCloudSync = async () => {
    try {
      showToast('Menyinkronkan data ke Cloud Firestore...');
      await pushLocalDataToCloud('Sinkronisasi manual pengguna', currentUser.name);
      showToast('Data berhasil disinkronkan ke Cloud Firestore! Semua komputer langsung terupdate.');
    } catch (err: any) {
      showToast(`Gagal sinkronisasi cloud: ${err.message}`);
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header - Matches the photo */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        onOpenSettings={() => setCurrentTab('pengaturan')}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        syncStatus={cloudSyncStatus}
        onManualSync={handleManualCloudSync}
        onOpenFirebaseConfig={() => setShowFirebaseModal(true)}
        onNavigateToTab={(tab) => {
          const isAllowed = tab === 'beranda' || tab === 'surat' || currentUser.isSuperAdmin || (Array.isArray(currentUser.allowedMenus) && currentUser.allowedMenus.includes(tab));
          if (isAllowed) {
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
            allowedMenus={currentUser.isSuperAdmin ? undefined : (currentUser.allowedMenus || [])}
            onSelectTab={(tab) => {
              const isAllowed = tab === 'beranda' || tab === 'surat' || currentUser.isSuperAdmin || (currentUser.allowedMenus && currentUser.allowedMenus.includes(tab));
              if (isAllowed) {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                showToast(`Akses Dibatasi: Menu tersebut belum dicentang untuk akun ${currentUser.name}.`);
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
                allowedMenus={currentUser.isSuperAdmin ? undefined : (currentUser.allowedMenus || [])}
                onSelectTab={(tab) => {
                  const isAllowed = tab === 'beranda' || tab === 'surat' || currentUser.isSuperAdmin || (currentUser.allowedMenus && currentUser.allowedMenus.includes(tab));
                  if (isAllowed) {
                    setCurrentTab(tab);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    showToast(`Akses Dibatasi: Menu tersebut belum dicentang untuk akun Anda.`);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Center / Right Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Permission Guard: Check if current tab is allowed for current user */}
          {currentTab !== 'beranda' && currentTab !== 'surat' && !currentUser.isSuperAdmin && !(currentUser.allowedMenus || []).includes(currentTab) ? (
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
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Beranda</span>
                </button>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                >
                  Ganti Akun Pengurus Lain
                </button>
              </div>
            </div>
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
                    const isAllowed = tab === 'beranda' || tab === 'surat' || currentUser.isSuperAdmin || (currentUser.allowedMenus && currentUser.allowedMenus.includes(tab));
                    if (isAllowed) {
                      setCurrentTab(tab);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      showToast(`Akses Dibatasi: Menu tersebut belum dicentang untuk akun ${currentUser.name}.`);
                    }
                  }}
                  allowedMenus={currentUser.isSuperAdmin ? undefined : (currentUser.allowedMenus || [])}
                  onAddNews={() => {
                    setCurrentTab('tambah_berita');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onToast={showToast}
                  onSelectActivity={(act) => setSelectedActivity(act)}
                  activities={filteredActivities}
                />
              )}

              {/* 4b. View: Kegiatan (Workspace Program Kerja dengan Visualisasi Recharts) */}
              {currentTab === 'ringkasan' && (
                <KegiatanView
                  activities={filteredActivities}
                  onSelectActivity={(act) => setSelectedActivity(act)}
                  onAddActivity={() => setShowAddNews(true)}
                  onExploreCalendar={() => setCurrentTab('jadwal')}
                  onViewAllNews={() => setCurrentTab('berita')}
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

              {/* 7. Subview: Aset Organisasi */}
              {currentTab === 'aset' && (
                <AsetOrganisasiView
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
                  onExploreOther={() => setCurrentTab('ringkasan')}
                />
              )}

              {/* 9. Subview: Berita Kegiatan */}
              {currentTab === 'berita' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Semua Berita & Dokumentasi Kegiatan
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Kumpulan rilis pers dan foto kegiatan Karang Taruna Manis Jaya.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('tambah_berita')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                    >
                      <span>+ Tambah Berita Baru</span>
                    </button>
                  </div>
                  <RecentActivities
                    activities={activities}
                    onSelectActivity={(act) => setSelectedActivity(act)}
                  />
                </div>
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
                      { name: 'Sosial', count: 12, desc: 'Bakti sosial, santunan yatim, donor darah, dan bantuan sembako warga.', color: 'from-blue-500 to-indigo-600' },
                      { name: 'Keagamaan', count: 8, desc: 'Peringatan hari besar Islam, pengajian pemuda, dan bersih-bersih masjid.', color: 'from-emerald-500 to-teal-600' },
                      { name: 'Olahraga', count: 15, desc: 'Turnamen futsal antar-RW, bulutangkis, senam sehat, dan e-sports.', color: 'from-amber-500 to-orange-600' },
                      { name: 'Lingkungan', count: 9, desc: 'Kerja bakti gotong royong, pilah sampah, dan penanaman pohon.', color: 'from-green-500 to-emerald-700' },
                      { name: 'Pendidikan & Pelatihan', count: 6, desc: 'Bimbingan belajar, pelatihan digital skill, dan seminar wirausaha.', color: 'from-purple-500 to-violet-700' },
                      { name: 'Kesenian & Budaya', count: 5, desc: 'Pentas seni kemerdekaan, kreasi tari tradisional, dan musik pemuda.', color: 'from-rose-500 to-pink-600' },
                    ].map((kat) => (
                      <div key={kat.name} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r ${kat.color}`}>
                            {kat.name}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{kat.count} Agenda</span>
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
                    ))}
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {activities.flatMap((a) => a.photos.map((p, idx) => ({ photo: p, title: a.title, date: a.date, id: `${a.id}-${idx}` }))).map((item) => (
                      <div key={item.id} className="group relative rounded-2xl overflow-hidden shadow-xs border border-slate-200 aspect-square">
                        <img src={item.photo} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                          <p className="text-xs font-bold line-clamp-1">{item.title}</p>
                          <p className="text-[10px] text-slate-300">{item.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
            </>
          )}
        </main>
      </div>

      {/* Floating Chat Button */}
      <FloatingChat />

      {/* Modal: Activity Detail */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onToast={showToast}
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
          <button
            onClick={() => {
              setCurrentTab('laporan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 font-semibold ${
              currentTab === 'laporan' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <span className="text-sm">📊</span>
            <span className="text-[10px]">Laporan</span>
          </button>
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
        usersList={usersList}
        onClose={() => setShowLoginModal(false)}
        canDismiss={true}
      />

      {/* Modal: Kelola Akun & Ganti Database Firebase (firebase.google.com) */}
      <FirebaseConfigModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
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
