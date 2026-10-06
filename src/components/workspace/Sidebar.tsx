import React, { useState } from 'react';
import {
  Home,
  Users,
  Mail,
  FileText,
  BarChart3,
  Package,
  Calendar,
  ShieldCheck,
  Settings,
  Briefcase,
  ChevronRight,
  Megaphone,
  Lock,
  PlusSquare,
  Database,
  X,
  User,
  Cloud,
  KeyRound,
  LogOut,
  ChevronDown,
  Palette,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useTheme } from '../../context/ThemeContext';
import { UserAccount } from '../../types/auth';

export type WorkspaceTab =
  | 'beranda'
  | 'ringkasan'
  | 'anggota'
  | 'surat'
  | 'proposal'
  | 'laporan'
  | 'aset'
  | 'jadwal'
  | 'berita'
  | 'tambah_berita'
  | 'kategori'
  | 'galeri'
  | 'database'
  | 'akses'
  | 'pengaturan';

interface SidebarProps {
  currentTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  unreadLettersCount?: number;
  allowedMenus?: WorkspaceTab[];
  onClose?: () => void;
  currentUser?: UserAccount;
  onOpenFirebaseConfig?: () => void;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadLettersCount = 3,
  allowedMenus,
  onClose,
  currentUser: propCurrentUser,
  onOpenFirebaseConfig,
  onOpenLoginModal,
  onLogout,
}) => {
  const { theme } = useTheme();
  const [showCollapsedMenu, setShowCollapsedMenu] = useState(false);
  const [showProfileDetail, setShowProfileDetail] = useState(false);

  // Active user matching top header (di atas)
  const currentUser = propCurrentUser || (() => {
    try {
      const raw = localStorage.getItem('kt_auth_user_v3');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const isCollapsed = theme?.sidebarState === 'collapsed';
  const showIcon = theme ? theme.showMenuIcon : true;
  const showText = theme ? (!isCollapsed && theme.showMenuText) : true;

  // Determine width based on settings
  const widthClass = isCollapsed
    ? 'w-16'
    : theme?.sidebarWidth === 'kecil'
    ? 'w-52'
    : theme?.sidebarWidth === 'lebar'
    ? 'w-72'
    : 'w-64';

  // Determine sidebar color theme
  const isLight = theme?.sidebarColor === 'light_white';
  const colorClass =
    theme?.sidebarColor === 'black_slate'
      ? 'bg-[#090d16] text-white border-slate-800/80'
      : theme?.sidebarColor === 'karang_taruna_blue'
      ? 'bg-[#1e40af] text-white border-blue-900'
      : theme?.sidebarColor === 'light_white'
      ? 'bg-white text-slate-800 border-r border-slate-200'
      : theme?.sidebarColor === 'deep_indigo'
      ? 'bg-[#1e1b4b] text-white border-indigo-950'
      : 'bg-[#0d1b2a] text-white border-slate-800/80';

  const isMenuAllowed = (id: WorkspaceTab) => {
    if (!allowedMenus) return true;
    if (id === 'beranda' || id === 'surat') return true;
    if (!Array.isArray(allowedMenus)) return false;
    if (id === 'tambah_berita' || id === 'kategori' || id === 'galeri') {
      return allowedMenus.includes('berita') || allowedMenus.includes(id);
    }
    return allowedMenus.includes(id);
  };

  const kegiatanItems = [
    { id: 'ringkasan' as WorkspaceTab, label: 'Kegiatan', icon: Briefcase },
    { id: 'proposal' as WorkspaceTab, label: 'Proposal', icon: FileText },
    { id: 'laporan' as WorkspaceTab, label: 'Laporan', icon: BarChart3 },
  ];

  const administrasiItems = [
    { id: 'surat' as WorkspaceTab, label: 'Surat Menyurat', icon: Mail, badge: unreadLettersCount },
    { id: 'anggota' as WorkspaceTab, label: 'Anggota', icon: Users },
    { id: 'aset' as WorkspaceTab, label: 'Aset Organisasi', icon: Package },
    { id: 'jadwal' as WorkspaceTab, label: 'Jadwal Kegiatan', icon: Calendar },
    { id: 'berita' as WorkspaceTab, label: 'Berita Kegiatan', icon: Megaphone },
  ];

  const pengaturanItems = [
    { id: 'database' as WorkspaceTab, label: 'Database & Google Drive', icon: Database },
    { id: 'pengaturan' as WorkspaceTab, label: 'Pengaturan Umum', icon: Settings },
    { id: 'akses' as WorkspaceTab, label: 'Akses Pengguna', icon: ShieldCheck },
  ];

  // Helper for active menu styling
  const getActiveStyle = (isActive: boolean) => {
    if (!isActive) return {};
    const highlight = theme?.activeMenuHighlight || 'pill_blue';

    if (highlight === 'pill_blue') {
      return { backgroundColor: theme?.primaryColor || '#2563eb', color: '#ffffff' };
    }
    if (highlight === 'border_left') {
      return {
        borderLeft: `4px solid ${theme?.accentColor || '#38bdf8'}`,
        backgroundColor: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.1)',
        color: isLight ? '#0f172a' : '#ffffff',
      };
    }
    if (highlight === 'glow_indigo') {
      return {
        backgroundColor: '#4f46e5',
        boxShadow: '0 0 16px rgba(99, 102, 241, 0.5)',
        color: '#ffffff',
      };
    }
    if (highlight === 'soft_badge') {
      return {
        backgroundColor: 'rgba(37, 99, 235, 0.18)',
        color: theme?.primaryColor || '#2563eb',
        border: '1px solid rgba(37, 99, 235, 0.3)',
      };
    }
    if (highlight === 'gradient_karang_taruna') {
      return {
        background: `linear-gradient(to right, ${theme?.primaryColor || '#2563eb'}, #4f46e5)`,
        color: '#ffffff',
      };
    }
    return { backgroundColor: '#2563eb', color: '#ffffff' };
  };

  const getInactiveClass = (allowed: boolean) => {
    if (!allowed) {
      return isLight
        ? 'text-slate-400 hover:text-slate-500 hover:bg-slate-100 opacity-60'
        : 'text-slate-500 hover:text-slate-400 hover:bg-white/5 opacity-60';
    }
    return isLight
      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      : 'text-slate-300 hover:text-white hover:bg-white/10';
  };

  return (
    <aside
      className={`${widthClass} shrink-0 ${colorClass} min-h-[calc(100vh-4.5rem)] h-full overflow-y-auto p-3 sm:p-4 flex flex-col justify-between select-none transition-all duration-300`}
    >
      <div className="space-y-4">
        {/* Brand Logo in Sidebar Header */}
        <div
          className={`flex items-center justify-between px-2 pt-1 pb-3 ${
            isLight ? 'border-b border-slate-200' : 'border-b border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <BrandLogo size={isCollapsed ? 'sm' : 'md'} />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-base font-extrabold tracking-tight truncate leading-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Manis Jaya
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Karang Taruna
                </span>
              </div>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
              title="Tutup Menu Navigasi"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Top Button: Beranda */}
        <div>
          <button
            onClick={() => onSelectTab('beranda')}
            style={getActiveStyle(currentTab === 'beranda')}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
            } rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              currentTab !== 'beranda' ? getInactiveClass(true) : 'shadow-md font-bold'
            }`}
            title="Beranda"
          >
            <div className="flex items-center gap-3">
              {showIcon && (
                <Home
                  className={`w-4 h-4 ${
                    currentTab === 'beranda'
                      ? 'text-white'
                      : isLight
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                />
              )}
              {showText && <span>Beranda</span>}
            </div>
            {!isCollapsed && currentTab === 'beranda' && <ChevronRight className="w-4 h-4 opacity-80" />}
          </button>
        </div>

        {/* SECTION: KEGIATAN */}
        <div>
          {!isCollapsed && (
            <div
              className={`px-3 text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5 ${
                isLight ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              KEGIATAN
            </div>
          )}
          <nav className="space-y-1">
            {kegiatanItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const allowed = isMenuAllowed(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  style={getActiveStyle(isActive)}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2'
                  } rounded-xl text-xs sm:text-sm transition-all ${
                    !isActive ? getInactiveClass(allowed) : 'shadow-md font-bold'
                  }`}
                  title={item.label + (!allowed ? ' (Terkunci)' : '')}
                >
                  <div className="flex items-center gap-3">
                    {showIcon && (
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-white'
                            : allowed
                            ? isLight
                              ? 'text-slate-500'
                              : 'text-slate-400'
                            : 'text-slate-400'
                        }`}
                      />
                    )}
                    {showText && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <>
                      {isActive ? (
                        <ChevronRight className="w-4 h-4 opacity-80 shrink-0" />
                      ) : !allowed ? (
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ) : null}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SECTION: ADMINISTRASI */}
        <div>
          {!isCollapsed && (
            <div
              className={`px-3 text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5 ${
                isLight ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              ADMINISTRASI
            </div>
          )}
          <nav className="space-y-1">
            {administrasiItems.map((item) => {
              const Icon = item.icon;
              const isBeritaGroup = item.id === 'berita';
              const isActive = currentTab === item.id || (isBeritaGroup && currentTab === 'tambah_berita');
              const allowed = isMenuAllowed(item.id);

              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    onClick={() => onSelectTab(item.id)}
                    style={getActiveStyle(isActive)}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2'
                    } rounded-xl text-xs sm:text-sm transition-all ${
                      !isActive ? getInactiveClass(allowed) : 'shadow-md font-bold'
                    }`}
                    title={item.label + (!allowed ? ' (Terkunci)' : '')}
                  >
                    <div className="flex items-center gap-3">
                      {showIcon && (
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? 'text-white'
                              : allowed
                              ? isLight
                                ? 'text-slate-500'
                                : 'text-slate-400'
                              : 'text-slate-400'
                          }`}
                        />
                      )}
                      {showText && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && (
                      <>
                        {isActive ? (
                          <ChevronRight className="w-4 h-4 opacity-80 shrink-0" />
                        ) : !allowed ? (
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : (
                          item.badge !== undefined &&
                          item.badge > 0 &&
                          item.id !== 'surat' && (
                            <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center">
                              {item.badge}
                            </span>
                          )
                        )}
                      </>
                    )}
                  </button>

                  {/* Sub-item: Tambah Berita Baru when on berita group */}
                  {!isCollapsed && isBeritaGroup && (currentTab === 'berita' || currentTab === 'tambah_berita') && (
                    <div className="pl-7 pr-1 pt-1 pb-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTab('tambah_berita');
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          currentTab === 'tambah_berita'
                            ? 'bg-blue-500/25 text-blue-300 font-bold border border-blue-400/30'
                            : isLight
                            ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium'
                            : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
                        }`}
                      >
                        <PlusSquare className="w-3.5 h-3.5 text-blue-400" />
                        <span>+ Tambah Berita</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* SECTION: PENGATURAN */}
        <div>
          {!isCollapsed && (
            <div
              className={`px-3 text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5 ${
                isLight ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              PENGATURAN
            </div>
          )}
          <nav className="space-y-1">
            {pengaturanItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const allowed = isMenuAllowed(item.id);
              return (
                <div key={item.id}>
                  <button
                    onClick={() => onSelectTab(item.id)}
                    style={getActiveStyle(isActive)}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2'
                    } rounded-xl text-xs sm:text-sm transition-all ${
                      !isActive ? getInactiveClass(allowed) : 'shadow-md font-bold'
                    }`}
                    title={item.label + (!allowed ? ' (Terkunci)' : '')}
                  >
                    <div className="flex items-center gap-3">
                      {showIcon && (
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? 'text-white'
                              : allowed
                              ? isLight
                                ? 'text-slate-500'
                                : 'text-slate-400'
                              : 'text-slate-400'
                          }`}
                        />
                      )}
                      {showText && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <>
                        {isActive ? (
                          <ChevronRight className="w-4 h-4 opacity-80 shrink-0" />
                        ) : !allowed ? (
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : null}
                      </>
                    )}
                  </button>

                  {/* Sub-item under Pengaturan: Kustomisasi Tampilan */}
                  {!isCollapsed && item.id === 'pengaturan' && currentTab === 'pengaturan' && (
                    <div className="pl-7 pr-1 pt-1 pb-0.5 space-y-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            localStorage.setItem('kt_active_pengaturan_tab', 'tampilan');
                            window.dispatchEvent(new CustomEvent('kt_switch_pengaturan_tab', { detail: 'tampilan' }));
                          } catch {}
                          onSelectTab('pengaturan');
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                            : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                        }`}
                      >
                        <Palette className="w-3.5 h-3.5 text-blue-400" />
                        <span>Kustomisasi Tampilan</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Profile Card & Detail List matching propil user di atas */}
      <div
        className={`pt-3 mt-auto ${
          isLight ? 'border-t border-slate-200' : 'border-t border-slate-800/80'
        }`}
      >
        {isCollapsed ? (
          <div className="relative flex justify-center">
            <button
              onClick={() => setShowCollapsedMenu(!showCollapsedMenu)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title={`${currentUser?.name || 'Administrator'} (${currentUser?.role || 'Admin'})`}
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {currentUser?.avatarInitials || (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              )}
            </button>

            {showCollapsedMenu && (
              <div className="absolute bottom-full left-2 mb-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fadeIn text-left">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser?.name || 'Administrator'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    @{currentUser?.username || 'admin'} · {currentUser?.rw || 'Kelurahan Manis Jaya'}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-block text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 px-2 py-0.5 rounded">
                      {currentUser?.role || 'Administrator'}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setShowCollapsedMenu(false);
                      if (onOpenFirebaseConfig) onOpenFirebaseConfig();
                      else onSelectTab('database');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Akun & Database Firebase</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowCollapsedMenu(false);
                      onSelectTab('akses');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Pengaturan Hak Akses Menu</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowCollapsedMenu(false);
                      if (onOpenLoginModal) onOpenLoginModal();
                      else onSelectTab('akses');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Ganti Akun Pengurus</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowCollapsedMenu(false);
                      if (onLogout) onLogout();
                      else window.location.reload();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2">
            {/* Header info profil sama seperti propil user di atas - klik untuk buka/tutup detail */}
            <div
              onClick={() => setShowProfileDetail(!showProfileDetail)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                isLight
                  ? 'bg-slate-50/90 border-slate-200/80 hover:bg-slate-100/90 shadow-xs'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80 shadow-xs'
              }`}
              title="Klik untuk melihat/menyembunyikan detail profil"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {currentUser?.avatarInitials || (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}
                  <div className="flex flex-col text-left min-w-0">
                    <p
                      className={`text-xs font-bold leading-tight truncate ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {currentUser?.name || 'Administrator'}
                    </p>
                    <p
                      className={`text-[10px] font-mono leading-tight truncate mt-0.5 ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      @{currentUser?.username || 'admin'} · {currentUser?.rw || 'Kelurahan Manis Jaya'}
                    </p>
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                    showProfileDetail
                      ? 'rotate-180 text-blue-600'
                      : isLight
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                />
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
                <span
                  className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                    isLight
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                  }`}
                >
                  {currentUser?.role || 'Administrator'}
                </span>
                <span className={`text-[10px] font-medium flex items-center gap-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Aktif
                </span>
              </div>
            </div>

            {/* Detail List: Sembunyikan, ada ketika di klik saja */}
            {showProfileDetail && (
              <div className="space-y-1 animate-fadeIn pt-0.5">
                <button
                  onClick={() => {
                    if (onOpenFirebaseConfig) onOpenFirebaseConfig();
                    else onSelectTab('database');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isLight
                      ? 'text-emerald-800 hover:bg-emerald-50'
                      : 'text-emerald-400 hover:bg-emerald-950/40'
                  }`}
                  title="Akun & Database Firebase"
                >
                  <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">Akun & Database Firebase</span>
                </button>

                <button
                  onClick={() => onSelectTab('akses')}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'akses'
                      ? isLight
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'bg-amber-950/60 text-amber-300 font-bold'
                      : isLight
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                  title="Pengaturan Hak Akses Menu"
                >
                  <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">Pengaturan Hak Akses Menu</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenLoginModal) onOpenLoginModal();
                    else onSelectTab('akses');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isLight
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                  title="Ganti Akun Pengurus"
                >
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">Ganti Akun Pengurus</span>
                </button>

                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    else window.location.reload();
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isLight
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-red-400 hover:bg-red-950/40'
                  }`}
                  title="Keluar Akun"
                >
                  <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="truncate">Keluar Akun</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
