import React from 'react';
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
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useTheme } from '../../context/ThemeContext';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadLettersCount = 3,
  allowedMenus,
}) => {
  const { theme } = useTheme();

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
      className={`${widthClass} shrink-0 ${colorClass} min-h-[calc(100vh-4.5rem)] p-3 sm:p-4 flex flex-col justify-between select-none transition-all duration-300`}
    >
      <div className="space-y-4">
        {/* Brand Logo in Sidebar Header */}
        <div
          className={`flex items-center gap-3 px-2 pt-1 pb-3 ${
            isLight ? 'border-b border-slate-200' : 'border-b border-slate-800/80'
          }`}
        >
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
      </div>

      {/* User Card in sidebar footer (Iik Andriyana) */}
      <div
        className={`pt-4 ${
          isLight ? 'border-t border-slate-200' : 'border-t border-slate-800/80'
        } flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-1'}`}
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/src/assets/images/ilk_andriyana_1790589044021.jpg"
            alt="Iik Andriyana"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
          />
          {!isCollapsed && (
            <div className="flex flex-col text-left min-w-0">
              <span
                className={`text-xs font-bold leading-none truncate ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Iik Andriyana
              </span>
              <span className={`text-[10px] mt-1 leading-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Admin • Manis Jaya
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
        )}
      </div>
    </aside>
  );
};
