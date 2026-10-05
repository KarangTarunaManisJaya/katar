import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  ChevronDown,
  User,
  LogOut,
  KeyRound,
  Cloud,
  RefreshCw,
  CheckCircle2,
  WifiOff,
  Menu,
  CheckCheck,
  Trash2,
  Mail,
  Calendar,
  Users,
  BellOff,
  X,
  ChevronRight,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { UserAccount } from '../../types/auth';
import { WorkspaceTab } from './Sidebar';
import { CloudSyncStatus } from '../../services/firestoreSyncService';
import {
  AppNotification,
  subscribeNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  formatRelativeTime,
} from '../../services/notificationService';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  currentUser?: UserAccount;
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  onNavigateToTab?: (tab: WorkspaceTab) => void;
  searchPlaceholder?: string;
  syncStatus?: CloudSyncStatus;
  onManualSync?: () => void;
  onOpenFirebaseConfig?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenLoginModal,
  onLogout,
  onNavigateToTab,
  syncStatus,
  onManualSync,
  onOpenFirebaseConfig,
  onToggleMobileMenu,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time notifications
  useEffect(() => {
    const unsub = subscribeNotifications((list) => {
      setNotifications(list);
    });
    return () => unsub();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between transition-all">
      {/* Left: Brand Identity matching the uploaded screenshot */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Karang Taruna Logo - Klik pada tampilan ponsel untuk memunculkan aside menu */}
        <button
          type="button"
          onClick={() => {
            if (onToggleMobileMenu) {
              onToggleMobileMenu();
            }
          }}
          className="relative group flex items-center justify-center p-1 -m-1 rounded-2xl cursor-pointer lg:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95 transition-all"
          title="Klik logo Karang Taruna untuk membuka menu navigasi samping (Aside)"
          aria-label="Logo Karang Taruna - Klik untuk memunculkan Aside"
        >
          <BrandLogo size="md" className="group-hover:scale-105 transition-transform" />
          {/* Badge indikator menu khusus tampilan ponsel */}
          <span
            className="lg:hidden absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs text-[9px] border-2 border-white group-hover:bg-blue-700 transition-colors"
            title="Buka menu aside"
          >
            <Menu className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* Brand Text - Klik di ponsel juga memunculkan aside */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1024 && onToggleMobileMenu) {
              onToggleMobileMenu();
            }
          }}
          className="flex flex-col text-left focus:outline-none cursor-pointer lg:cursor-default select-none"
          title="Karang Taruna Manis Jaya"
        >
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 leading-tight hover:text-blue-600 transition-colors">
            Karang Taruna Manis Jaya
          </span>
          <span className="text-[11px] text-slate-500 font-medium leading-tight">
            Bersama Pemuda, Membangun Masa Depan
          </span>
        </button>
      </div>

      {/* Right: Cloud Sync Status, Notification with red badge 3 & Administrator profile pill */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Real-time Cloud Firestore Sync Badge */}
        {syncStatus && (
          <div
            onClick={onOpenFirebaseConfig}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer hover:shadow-xs ${
              syncStatus.state === 'connected'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs hover:bg-emerald-100/80'
                : syncStatus.state === 'syncing'
                ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/80'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/80'
            }`}
            title="Kelola Akun & Ganti Database Firebase (Klik untuk membuka)"
          >
            {syncStatus.state === 'offline' ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            ) : (
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  syncStatus.state === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-blue-500 animate-spin'
                }`}
              />
            )}
            <span className="hidden md:inline">
              {syncStatus.state === 'connected'
                ? 'Cloud Firestore Real-Time'
                : syncStatus.state === 'syncing'
                ? 'Menyimpan ke Cloud...'
                : syncStatus.pendingOfflineCount > 0
                ? `Offline (${syncStatus.pendingOfflineCount} perubahan)`
                : 'Mode Offline Aktif'}
            </span>
            {onManualSync && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManualSync();
                }}
                className="hover:text-emerald-950 p-0.5 rounded cursor-pointer ml-0.5"
                title="Sinkronkan data ke Cloud Firestore sekarang"
              >
                <RefreshCw className={`w-3 h-3 ${syncStatus.state === 'syncing' ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* Notifications Bell with dynamic real-time badge */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Pemberitahuan"
            title={unreadCount > 0 ? `${unreadCount} pemberitahuan baru (klik untuk buka)` : 'Pemberitahuan (semua sudah dibaca)'}
          >
            <Bell className="w-5 h-5 text-slate-600 transition-transform active:scale-90" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown: Auto height container (div auto) */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 sm:p-4 z-50 animate-fadeIn h-auto flex flex-col">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">Notifikasi</span>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      {unreadCount} baru
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                      Semua terbaca
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllAsRead()}
                      className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      title="Tandai semua notifikasi sebagai dibaca"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Baca semua</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => clearAllNotifications()}
                      className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md cursor-pointer"
                      title="Hapus semua notifikasi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Items List with div auto height up to max-h */}
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center flex flex-col items-center justify-center text-slate-400 h-auto">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2.5 text-slate-400">
                    <BellOff className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Belum ada notifikasi baru</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] leading-relaxed">
                    Pemberitahuan surat, kegiatan, anggota, dan sinkronisasi akan muncul di sini secara otomatis.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 h-auto">
                  {notifications.map((n) => {
                    const getIcon = () => {
                      switch (n.type) {
                        case 'surat':
                          return <Mail className="w-4 h-4 text-blue-600" />;
                        case 'kegiatan':
                          return <Calendar className="w-4 h-4 text-emerald-600" />;
                        case 'anggota':
                          return <Users className="w-4 h-4 text-violet-600" />;
                        case 'sync':
                          return <Cloud className="w-4 h-4 text-cyan-600" />;
                        default:
                          return <Bell className="w-4 h-4 text-amber-600" />;
                      }
                    };

                    const getBgIcon = () => {
                      switch (n.type) {
                        case 'surat':
                          return 'bg-blue-50 border-blue-200';
                        case 'kegiatan':
                          return 'bg-emerald-50 border-emerald-200';
                        case 'anggota':
                          return 'bg-violet-50 border-violet-200';
                        case 'sync':
                          return 'bg-cyan-50 border-cyan-200';
                        default:
                          return 'bg-amber-50 border-amber-200';
                      }
                    };

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.linkTab && onNavigateToTab) {
                            onNavigateToTab(n.linkTab);
                            setShowNotifications(false);
                          }
                        }}
                        className={`group relative p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer h-auto ${
                          n.read
                            ? 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                            : 'bg-blue-50/50 hover:bg-blue-50 border-blue-100/80 text-slate-900 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getBgIcon()}`}>
                            {getIcon()}
                          </div>

                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-1.5">
                              <p className={`text-xs leading-snug line-clamp-1 ${n.read ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'}`}>
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                              {n.message}
                            </p>
                            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100/60">
                              <span className="text-[10px] text-slate-400 font-medium">
                                {formatRelativeTime(n.timestamp)}
                              </span>
                              {n.actionLabel && (
                                <span className="text-[10px] font-bold text-blue-600 group-hover:underline flex items-center gap-0.5">
                                  {n.actionLabel}
                                  <ChevronRight className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Delete single notification button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                            className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Hapus pemberitahuan"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Administrator Profile Pill matching screenshot */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            {/* Foto profil pengguna */}
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name || 'Foto Profil'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-xs shrink-0"
              />
            ) : currentUser?.avatarInitials ? (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                {currentUser.avatarInitials}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser?.name || 'Administrator'}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight flex items-center gap-1">
                <span>{currentUser?.role ? 'Admin' : 'Admin'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-100 mb-1 flex items-center gap-2.5">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name || 'Foto Profil'}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    {currentUser?.avatarInitials || <User className="w-5 h-5 text-white" />}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {currentUser?.name || 'Administrator'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    @{currentUser?.username || 'admin'} · {currentUser?.rw || 'Kelurahan Manis Jaya'}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-block text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {currentUser?.role || 'Administrator'}
                    </span>
                  </div>
                </div>
              </div>

              {onOpenFirebaseConfig && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenFirebaseConfig();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Cloud className="w-4 h-4 text-emerald-600" />
                  <span>Akun & Database Firebase</span>
                </button>
              )}

              {onNavigateToTab && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigateToTab('akses');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>Pengaturan Hak Akses Menu</span>
                </button>
              )}

              {onOpenLoginModal && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenLoginModal();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Ganti Akun Pengurus</span>
                </button>
              )}

              {onLogout && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Sesi</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
