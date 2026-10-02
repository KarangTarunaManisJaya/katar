import React, { useState } from 'react';
import { Bell, ChevronDown, User, LogOut, KeyRound, Cloud, RefreshCw, CheckCircle2, WifiOff, Menu } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { UserAccount } from '../../types/auth';
import { WorkspaceTab } from './Sidebar';
import { CloudSyncStatus } from '../../services/firestoreSyncService';

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
  const [unreadCount, setUnreadCount] = useState(3);

  const notifications = [
    { id: 1, title: 'Dokumentasi Baru', desc: 'Bakti Sosial RW 03 telah diunggah', time: '2 menit lalu' },
    { id: 2, title: 'Surat Undangan Diterbitkan', desc: 'UND/2609/ML/54444 berstatus Draft siap ditinjau', time: '15 menit lalu' },
    { id: 3, title: 'Jadwal Turnamen Pemuda', desc: 'Jadwal Futsal Karang Taruna Piala Lurah Manis Jaya', time: '1 jam lalu' },
  ];

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

        {/* Notifications Bell with red badge 3 matching screenshot */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Pemberitahuan"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900">Notifikasi</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setUnreadCount(0)}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors">
                    <p className="text-xs font-bold text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.desc}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
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
            {/* White circle with blue user silhouette icon */}
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-4 h-4 text-white" />
            </div>

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
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
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
