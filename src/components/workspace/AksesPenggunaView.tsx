import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  KeyRound,
  CheckSquare,
  Square,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  LogIn,
  Sliders,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Edit3,
  Check,
  Shield,
  Key,
  HelpCircle,
} from 'lucide-react';
import { UserAccount, ALL_MENU_DEFINITIONS } from '../../types/auth';
import { WorkspaceTab } from './Sidebar';

interface AksesPenggunaViewProps {
  currentUser: UserAccount;
  usersList: UserAccount[];
  onUpdateUsers: (updated: UserAccount[]) => void;
  onSwitchUser: (user: UserAccount) => void;
  onToast: (msg: string) => void;
}

export const AksesPenggunaView: React.FC<AksesPenggunaViewProps> = ({
  currentUser,
  usersList,
  onUpdateUsers,
  onSwitchUser,
  onToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'menu' | 'password'>('menu');
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [searchMember, setSearchMember] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal Edit Password State
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [newEditPassword, setNewEditPassword] = useState('');
  const [confirmEditPassword, setConfirmEditPassword] = useState('');
  const [showEditPassInput, setShowEditPassInput] = useState(false);
  const [editPassError, setEditPassError] = useState<string | null>(null);

  // Modal Delete User State
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

  // New Member Form State
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Anggota Karang Taruna');
  const [newRw, setNewRw] = useState('RW 03');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('karangtaruna');
  const [newAllowedMenus, setNewAllowedMenus] = useState<WorkspaceTab[]>([
    'beranda',
    'ringkasan',
    'jadwal',
    'berita',
  ]);

  const selectedUser = usersList.find((u) => u.id === selectedUserId) || usersList[0];

  // Copy password to clipboard
  const handleCopyPassword = (userId: string, pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedId(userId);
    onToast('Kata sandi berhasil disalin ke clipboard!');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Generate strong random password
  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  // Open Edit Password Modal
  const handleOpenEditPassword = (user: UserAccount) => {
    setEditingUser(user);
    setNewEditPassword(user.password);
    setConfirmEditPassword(user.password);
    setEditPassError(null);
    setShowEditPassInput(false);
  };

  // Submit Password Change
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!newEditPassword.trim()) {
      setEditPassError('Kata sandi tidak boleh kosong.');
      return;
    }

    if (newEditPassword.length < 6) {
      setEditPassError('Kata sandi minimal 6 karakter.');
      return;
    }

    if (newEditPassword !== confirmEditPassword) {
      setEditPassError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const updated = usersList.map((u) =>
      u.id === editingUser.id ? { ...u, password: newEditPassword.trim() } : u
    );

    onUpdateUsers(updated);
    onToast(`Kata sandi akun ${editingUser.name} (@${editingUser.username}) berhasil diperbarui!`);
    setEditingUser(null);
  };

  // Quick Reset Password to default 'karangtaruna'
  const handleQuickResetPassword = (user: UserAccount) => {
    const defaultPass = 'karangtaruna';
    const updated = usersList.map((u) =>
      u.id === user.id ? { ...u, password: defaultPass } : u
    );
    onUpdateUsers(updated);
    onToast(`Kata sandi akun ${user.name} telah di-reset menjadi "${defaultPass}".`);
  };

  // Confirm Delete User
  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;

    if (deletingUser.isSuperAdmin) {
      onToast('Akun Super Admin utama tidak dapat dihapus.');
      setDeletingUser(null);
      return;
    }

    if (deletingUser.id === currentUser.id) {
      onToast('Anda tidak dapat menghapus akun yang sedang aktif digunakan.');
      setDeletingUser(null);
      return;
    }

    const updated = usersList.filter((u) => u.id !== deletingUser.id);
    onUpdateUsers(updated);
    if (selectedUserId === deletingUser.id) {
      setSelectedUserId(usersList[0].id);
    }
    onToast(`Akun dan kata sandi ${deletingUser.name} (@${deletingUser.username}) berhasil dihapus.`);
    setDeletingUser(null);
  };

  // Toggle single menu checkbox
  const handleToggleMenu = (menuId: WorkspaceTab) => {
    if (!selectedUser) return;
    const currentMenus = Array.isArray(selectedUser.allowedMenus) ? selectedUser.allowedMenus : [];

    if (selectedUser.id === currentUser.id && menuId === 'akses' && currentMenus.includes('akses')) {
      onToast('Peringatan: Menu Akses Pengguna tidak dapat dimatikan pada akun Anda sendiri demi keamanan.');
      return;
    }

    let nextMenus: WorkspaceTab[];

    if (currentMenus.includes(menuId)) {
      nextMenus = currentMenus.filter((id) => id !== menuId);
    } else {
      nextMenus = [...currentMenus, menuId];
    }

    const updated = usersList.map((u) =>
      u.id === selectedUser.id ? { ...u, allowedMenus: nextMenus } : u
    );

    onUpdateUsers(updated);
    onToast(`Izin menu "${ALL_MENU_DEFINITIONS.find((m) => m.id === menuId)?.label}" diperbarui untuk ${selectedUser.name}`);
  };

  const handleSelectAllMenus = () => {
    if (!selectedUser) return;
    const allIds = ALL_MENU_DEFINITIONS.map((m) => m.id);
    const updated = usersList.map((u) =>
      u.id === selectedUser.id ? { ...u, allowedMenus: allIds } : u
    );
    onUpdateUsers(updated);
    onToast(`Semua menu dan aplikasi diaktifkan untuk ${selectedUser.name}`);
  };

  const handleDeselectAllMenus = () => {
    if (!selectedUser) return;
    const minimal: WorkspaceTab[] = selectedUser.isSuperAdmin ? ['beranda', 'akses'] : ['beranda'];
    const updated = usersList.map((u) =>
      u.id === selectedUser.id ? { ...u, allowedMenus: minimal } : u
    );
    onUpdateUsers(updated);
    onToast(`Semua hak akses opsional dicabut untuk ${selectedUser.name}`);
  };

  const handleSetPreset = (preset: 'anggota' | 'sekretariat' | 'keuangan') => {
    if (!selectedUser) return;
    let presetMenus: WorkspaceTab[] = [];
    if (preset === 'anggota') {
      presetMenus = ['beranda', 'ringkasan', 'jadwal', 'berita'];
    } else if (preset === 'sekretariat') {
      presetMenus = ['beranda', 'surat', 'anggota', 'jadwal', 'berita', 'proposal'];
    } else if (preset === 'keuangan') {
      presetMenus = ['beranda', 'ringkasan', 'proposal', 'laporan', 'aset'];
    }

    const updated = usersList.map((u) =>
      u.id === selectedUser.id ? { ...u, allowedMenus: presetMenus } : u
    );
    onUpdateUsers(updated);
    onToast(`Preset ${preset.toUpperCase()} diterapkan untuk ${selectedUser.name}`);
  };

  const handleCreateNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim()) return;

    const trimmedUser = newUsername.trim().toLowerCase();
    const alreadyExists = usersList.some((u) => u.username.toLowerCase() === trimmedUser);
    if (alreadyExists) {
      alert('Username tersebut sudah digunakan oleh anggota lain. Silakan pilih username lain.');
      return;
    }

    const initials = newName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');

    const newMember: UserAccount = {
      id: `usr-${Date.now()}`,
      name: newName.trim(),
      role: newRole,
      rw: newRw,
      username: trimmedUser,
      password: newPassword.trim(),
      avatarInitials: initials || 'KT',
      isSuperAdmin: false,
      allowedMenus: newAllowedMenus,
      lastLogin: 'Baru Dibuat',
      email: `${trimmedUser}@karangtarunamanisjaya.id`,
    };

    onUpdateUsers([...usersList, newMember]);
    setSelectedUserId(newMember.id);
    setShowAddMemberModal(false);
    onToast(`Anggota "${newName}" dengan kata sandi baru berhasil ditambahkan!`);

    // Reset form
    setNewName('');
    setNewUsername('');
    setNewPassword('karangtaruna');
  };

  const filteredMembers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchMember.toLowerCase()) ||
      u.role.toLowerCase().includes(searchMember.toLowerCase()) ||
      u.username.toLowerCase().includes(searchMember.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#0d213a] via-[#143254] to-[#0f3d64] text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Otorisasi & Keamanan Pengguna</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Akses Pengguna & Kata Sandi Anggota
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Pusat kelola kredensial login, kata sandi, dan pembatasan menu atau aplikasi sesuai kotak centang izin akses Karang Taruna Kelurahan Manis Jaya.
            </p>
          </div>

          <button
            onClick={() => setShowAddMemberModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah User & Password Baru</span>
          </button>
        </div>

        {/* Sub-Tabs Switcher: Ceklis Menu vs Kelola Password */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('menu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'menu'
                ? 'bg-white text-blue-950 shadow-sm'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>1. Izin Akses Menu (Ceklis Kotak Centang)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('password')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'password'
                ? 'bg-white text-blue-950 shadow-sm'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>2. Kelola Kata Sandi User (Tambah, Edit, Hapus)</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
              {usersList.length} Akun
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: KELOLA CEKLIS HAK AKSES MENU */}
      {/* ========================================================================= */}
      {activeSubTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Column: List of Karang Taruna Members (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Daftar Anggota ({usersList.length})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSubTab('password')}
                  className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  Kelola Password
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  placeholder="Cari anggota / username..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Members List */}
              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                {filteredMembers.map((member) => {
                  const isSelected = selectedUser?.id === member.id;
                  const isCurrentLogged = currentUser.id === member.id;

                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedUserId(member.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-2 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {member.avatarInitials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {member.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {member.role} · {member.rw}
                            </p>
                          </div>
                        </div>

                        {isCurrentLogged && (
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                            Sedang Aktif
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100/80 text-slate-500">
                        <span className="font-mono text-[10px] text-slate-600">
                          @{member.username}
                        </span>
                        <span className="font-semibold text-blue-600">
                          {(member.allowedMenus || []).length} / {ALL_MENU_DEFINITIONS.length} Menu Terbuka
                        </span>
                      </div>

                      {/* Switch User Button */}
                      {!isCurrentLogged && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSwitchUser(member);
                            onToast(`Beralih login sebagai ${member.name} (${member.role})`);
                          }}
                          className="mt-1 w-full py-1.5 bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>Masuk Sebagai Anggota Ini</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Checkbox List Akses Menu & Aplikasi (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            {/* Header of Selected Member */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Konfigurasi Hak Akses
                  </span>
                  {selectedUser.isSuperAdmin && (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      Super Admin
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  {selectedUser.name} ({selectedUser.role})
                </h2>
                <p className="text-xs text-slate-500">
                  Username: <strong className="text-slate-700">@{selectedUser.username}</strong> · Wilayah: {selectedUser.rw}
                </p>
              </div>

              {/* Quick Action Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={handleSelectAllMenus}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Centang semua menu"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Pilih Semua</span>
                </button>
                <button
                  onClick={handleDeselectAllMenus}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Kosongkan izin menu non-utama"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              </div>
            </div>

            {/* Quick Presets Bar */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Terapkan Template Wewenang Cepat:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleSetPreset('anggota')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-md text-[11px] font-semibold transition-all shadow-2xs"
                >
                  Standar Anggota (4 Menu)
                </button>
                <button
                  onClick={() => handleSetPreset('sekretariat')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-md text-[11px] font-semibold transition-all shadow-2xs"
                >
                  Sekretariat (6 Menu)
                </button>
                <button
                  onClick={() => handleSetPreset('keuangan')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-md text-[11px] font-semibold transition-all shadow-2xs"
                >
                  Bendahara / Kas (5 Menu)
                </button>
              </div>
            </div>

            {/* Checkbox List Akses Menu & Aplikasi (Sesuai Permintaan User) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Ceklis Daftar Menu & Aplikasi yang Terbuka
                </h3>
                <span className="text-xs font-bold text-slate-600">
                  {(selectedUser.allowedMenus || []).length} dari {ALL_MENU_DEFINITIONS.length} menu aktif
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ALL_MENU_DEFINITIONS.map((menu) => {
                  const isAllowed = (selectedUser.allowedMenus || []).includes(menu.id);

                  return (
                    <div
                      key={menu.id}
                      onClick={() => handleToggleMenu(menu.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                        isAllowed
                          ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 opacity-75'
                      }`}
                    >
                      {/* Checkbox input element */}
                      <input
                        type="checkbox"
                        checked={isAllowed}
                        onChange={() => {}} // Handled by container onClick
                        className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 mb-0.5">
                          <span className={`text-xs font-bold ${isAllowed ? 'text-slate-900' : 'text-slate-600'}`}>
                            {menu.label}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              isAllowed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isAllowed ? 'Terbuka' : 'Terkunci'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {menu.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Password Card for Selected User */}
            <div className="pt-4 border-t border-slate-100 p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Kata Sandi Akun {selectedUser.name}:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-800 font-bold">
                      {showPasswordMap[selectedUser.id] ? selectedUser.password : '••••••••'}
                    </span>
                    <button
                      onClick={() =>
                        setShowPasswordMap((prev) => ({
                          ...prev,
                          [selectedUser.id]: !prev[selectedUser.id],
                        }))
                      }
                      className="text-blue-600 hover:underline text-[11px] font-semibold"
                    >
                      {showPasswordMap[selectedUser.id] ? 'Sembunyikan' : 'Lihat'}
                    </button>
                    <button
                      onClick={() => handleCopyPassword(selectedUser.id, selectedUser.password)}
                      className="text-slate-500 hover:text-slate-700 p-1"
                      title="Salin password"
                    >
                      {copiedId === selectedUser.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditPassword(selectedUser)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ubah Password</span>
                </button>
                <button
                  onClick={() => setActiveSubTab('password')}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs"
                >
                  Buka Kelola Semua Password →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KELOLA PASSWORD & KREDENSIAL USER (TAMBAH, EDIT, HAPUS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'password' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Quick Info & Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Akun Terdaftar</p>
                <p className="text-2xl font-black text-slate-900">{usersList.length} Pengguna</p>
                <span className="text-[11px] text-blue-600 font-semibold">Khusus Karang Taruna</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Status Kata Sandi</p>
                <p className="text-2xl font-black text-emerald-600">100% Terenkripsi</p>
                <span className="text-[11px] text-slate-500 font-medium">Otorisasi Level Anggota</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Sesi Login Anda</p>
                <p className="text-sm font-black text-slate-900 truncate">@{currentUser.username}</p>
                <span className="text-[11px] text-emerald-700 font-semibold">{currentUser.role}</span>
              </div>
            </div>
          </div>

          {/* Action Bar & Search */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Cari berdasarkan nama, peran, atau username..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah User & Password</span>
              </button>
            </div>
          </div>

          {/* Table / List of User Credentials */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  Daftar Kata Sandi & Kredensial User Karang Taruna
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Anda dapat melihat kata sandi, mengubah kata sandi baru, reset ke default, atau menghapus akun anggota.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Nama Pengguna & Peran</th>
                    <th className="py-3 px-4">Username Login</th>
                    <th className="py-3 px-4">Kata Sandi (Password)</th>
                    <th className="py-3 px-4">Menu Terbuka</th>
                    <th className="py-3 px-4 text-right">Tindakan Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => {
                    const isShown = showPasswordMap[member.id] || false;
                    const isSelf = member.id === currentUser.id;

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Member Name & Role */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {member.avatarInitials}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                  {member.name}
                                </span>
                                {member.isSuperAdmin && (
                                  <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.2 rounded-full">
                                    Super Admin
                                  </span>
                                )}
                                {isSelf && (
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                                    Sedang Login
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-500 text-[11px] block">
                                {member.role} · {member.rw}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Username */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200">
                            @{member.username}
                          </span>
                        </td>

                        {/* Password with View, Copy, and Masking */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono bg-amber-50 text-amber-950 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200 min-w-[90px] text-center">
                              {isShown ? member.password : '••••••••'}
                            </span>
                            <button
                              onClick={() =>
                                setShowPasswordMap((prev) => ({
                                  ...prev,
                                  [member.id]: !prev[member.id],
                                }))
                              }
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title={isShown ? 'Sembunyikan password' : 'Lihat password'}
                            >
                              {isShown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleCopyPassword(member.id, member.password)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Salin kata sandi"
                            >
                              {copiedId === member.id ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Allowed Menus Badge */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => {
                              setSelectedUserId(member.id);
                              setActiveSubTab('menu');
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <span>{(member.allowedMenus || []).length} dari {ALL_MENU_DEFINITIONS.length} Menu</span>
                            <span className="text-[10px] text-slate-400">✎ Ceklis</span>
                          </button>
                        </td>

                        {/* Actions: Edit, Reset, Delete */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditPassword(member)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                              title="Ubah kata sandi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Password</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Reset kata sandi ${member.name} ke default ("karangtaruna")?`)) {
                                  handleQuickResetPassword(member);
                                }
                              }}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                              title="Reset kata sandi ke bawaan: karangtaruna"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Reset</span>
                            </button>

                            {!member.isSuperAdmin && !isSelf && (
                              <button
                                onClick={() => setDeletingUser(member)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus akun dan password"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT PASSWORD USER */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Ubah Kata Sandi Anggota
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingUser.name} (@{editingUser.username})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {editPassError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editPassError}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800">
                    Kata Sandi Baru:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pass = generateRandomPassword();
                      setNewEditPassword(pass);
                      setConfirmEditPassword(pass);
                      setShowEditPassInput(true);
                      onToast('Password acak aman berhasil dibuat!');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Buat Password Acak Aman
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditPassInput ? 'text' : 'password'}
                    required
                    value={newEditPassword}
                    onChange={(e) => setNewEditPassword(e.target.value)}
                    placeholder="Masukkan minimal 6 karakter"
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassInput(!showEditPassInput)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showEditPassInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Konfirmasi Kata Sandi Baru:
                </label>
                <input
                  type={showEditPassInput ? 'text' : 'password'}
                  required
                  value={confirmEditPassword}
                  onChange={(e) => setConfirmEditPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Petunjuk Kata Sandi:</p>
                <p>• Minimal 6 karakter, disarankan kombinasi huruf & angka.</p>
                <p>• Anggota dapat langsung masuk menggunakan password baru ini.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30"
                >
                  Simpan Password Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: HAPUS USER & PASSWORD */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Hapus Akun Pengguna?
              </h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus akun <strong>{deletingUser.name}</strong> (<em>@{deletingUser.username}</em>)? Seluruh data izin dan kata sandinya akan terhapus.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Ya, Hapus Akun Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TAMBAH USER & PASSWORD BARU DENGAN CEKLIS MENU */}
      {/* ========================================================================= */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tambah User & Kata Sandi Baru
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Buatkan username, password, dan centang menu apa saja yang diizinkan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Lengkap Anggota</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jabatan / Peran</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Anggota Karang Taruna">Anggota Karang Taruna</option>
                    <option value="Sekretaris">Sekretaris</option>
                    <option value="Bendahara">Bendahara</option>
                    <option value="Koordinator RW">Koordinator RW</option>
                    <option value="Divisi Olahraga">Divisi Olahraga</option>
                    <option value="Divisi Humas & Dokumentasi">Divisi Humas & Dokumentasi</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Domisili RW</label>
                  <select
                    value={newRw}
                    onChange={(e) => setNewRw(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="RW 01">RW 01</option>
                    <option value="RW 02">RW 02</option>
                    <option value="RW 03">RW 03</option>
                    <option value="RW 04">RW 04</option>
                    <option value="RW 05">RW 05</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="rianpratama"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800">Kata Sandi (Password)</label>
                    <button
                      type="button"
                      onClick={() => setNewPassword(generateRandomPassword())}
                      className="text-[10px] text-blue-600 font-bold hover:underline"
                    >
                      Acak
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Checkbox List for New Member */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">
                    Centang Menu yang Dapat Dibuka Anggota Ini:
                  </label>
                  <span className="text-[11px] text-blue-600 font-bold">
                    {newAllowedMenus.length} Menu Terpilih
                  </span>
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  {ALL_MENU_DEFINITIONS.map((m) => {
                    const checked = newAllowedMenus.includes(m.id);
                    return (
                      <label key={m.id} className="flex items-center gap-2.5 text-[11px] cursor-pointer hover:bg-slate-100/70 p-1 rounded-lg">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAllowedMenus([...newAllowedMenus, m.id]);
                            } else {
                              setNewAllowedMenus(newAllowedMenus.filter((id) => id !== m.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-slate-800">{m.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30"
                >
                  Simpan User & Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
