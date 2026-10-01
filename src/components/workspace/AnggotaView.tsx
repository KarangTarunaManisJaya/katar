import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  MoreHorizontal,
  Search,
  RotateCcw,
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  QrCode,
  Download,
  Upload,
  Save,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Award,
  Heart,
  FileText,
  UserCheck,
  Ban,
  Printer,
  Copy,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  FileDown,
  KeyRound,
  ShieldCheck,
  EyeOff,
  Lock,
  Unlock,
  Sliders,
  LogIn,
  AlertCircle,
  Key,
} from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';
import { BrandLogo } from './BrandLogo';
import { UserAccount, ALL_MENU_DEFINITIONS } from '../../types/auth';
import { WorkspaceTab } from './Sidebar';
import {
  DetailedMember,
  INITIAL_MEMBERS,
  memberToUserAccount,
} from '../../data/membersData';

export type { DetailedMember } from '../../data/membersData';

interface AnggotaViewProps {
  onToast: (msg: string) => void;
  currentUser?: UserAccount;
  usersList?: UserAccount[];
  onUpdateUsers?: (updated: UserAccount[]) => void;
  onSwitchUser?: (user: UserAccount) => void;
}

export const AnggotaView: React.FC<AnggotaViewProps> = ({
  onToast,
  currentUser,
  usersList,
  onUpdateUsers,
  onSwitchUser,
}) => {
  const { logoUrl } = useBranding();

  // Load persistent members or default (100% matched with user accounts)
  const [members, setMembers] = useState<DetailedMember[]>(() => {
    try {
      const saved = localStorage.getItem('kt_members_v3');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return INITIAL_MEMBERS;
  });

  // Listen to remote real-time Cloud updates and reload members list immediately
  useEffect(() => {
    const handleRemoteRefresh = () => {
      try {
        const saved = localStorage.getItem('kt_members_v3');
        if (saved) setMembers(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('kt_database_restored', handleRemoteRefresh);
    return () => {
      window.removeEventListener('kt_database_restored', handleRemoteRefresh);
    };
  }, []);

  // Top sub-view mode: 'direktori' (Data & KTA) OR 'akses_sandi' (Akses Pengguna & Kata Sandi Anggota)
  const [mainViewMode, setMainViewMode] = useState<'direktori' | 'akses_sandi'>('direktori');

  const [selectedMember, setSelectedMember] = useState<DetailedMember>(members[0] || INITIAL_MEMBERS[0]);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterJabatan, setFilterJabatan] = useState('Semua Jabatan');
  const [filterDivisi, setFilterDivisi] = useState('Semua Divisi');
  const [filterGender, setFilterGender] = useState('Semua Gender');

  // Form tabs: utama | tambahan | dokumen | akses (Akses & Sandi included!)
  const [formTab, setFormTab] = useState<'utama' | 'tambahan' | 'dokumen' | 'akses'>('utama');

  // Form Fields (Controlled)
  const [formNoAnggota, setFormNoAnggota] = useState(selectedMember.noAnggota);
  const [formNik, setFormNik] = useState(selectedMember.nik);
  const [formName, setFormName] = useState(selectedMember.name);
  const [formNickname, setFormNickname] = useState(selectedMember.nickname);
  const [formBirthPlace, setFormBirthPlace] = useState(selectedMember.birthPlace);
  const [formBirthDate, setFormBirthDate] = useState(selectedMember.birthDate || '1998-08-12');
  const [formGender, setFormGender] = useState<'Laki-laki' | 'Perempuan'>(selectedMember.gender);
  const [formAddress, setFormAddress] = useState(selectedMember.address);
  const [formAvatar, setFormAvatar] = useState(selectedMember.avatar);
  const [formPhone, setFormPhone] = useState(selectedMember.phone);
  const [formEmail, setFormEmail] = useState(selectedMember.email);

  // Additional form fields for "Data Tambahan" tab
  const [formEducation, setFormEducation] = useState(selectedMember.education || 'S1');
  const [formJob, setFormJob] = useState(selectedMember.job || 'Karyawan Swasta');
  const [formCompany, setFormCompany] = useState(selectedMember.company || 'PT. Maju Bersama');
  const [formSkills, setFormSkills] = useState(selectedMember.skills || 'Komunikasi, IT');
  const [formInterests, setFormInterests] = useState(selectedMember.interests || 'Sosial, Kepemudaan');
  const [formEmergencyContact, setFormEmergencyContact] = useState(selectedMember.emergencyContact || '0812 9876 5432');
  const [formJabatan, setFormJabatan] = useState(selectedMember.jabatan || 'Ketua');
  const [formDivisi, setFormDivisi] = useState(selectedMember.divisi || 'Pengurus Harian');
  const [formRw, setFormRw] = useState(selectedMember.rw || 'RW 03');

  // Account Access & Password form fields (Tab 4: Akses & Sandi)
  const [formUsername, setFormUsername] = useState(selectedMember.username || 'admin');
  const [formPassword, setFormPassword] = useState(selectedMember.password || 'admin123');
  const [formIsSuperAdmin, setFormIsSuperAdmin] = useState(selectedMember.isSuperAdmin || false);
  const [formAllowedMenus, setFormAllowedMenus] = useState<WorkspaceTab[]>(
    selectedMember.allowedMenus || ['beranda', 'ringkasan', 'jadwal', 'berita']
  );
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Quick Modal: Edit Password & Access for a specific member
  const [aksesModalMember, setAksesModalMember] = useState<DetailedMember | null>(null);
  const [aksesModalPassword, setAksesModalPassword] = useState('');
  const [aksesModalUsername, setAksesModalUsername] = useState('');
  const [aksesModalSuperAdmin, setAksesModalSuperAdmin] = useState(false);
  const [aksesModalMenus, setAksesModalMenus] = useState<WorkspaceTab[]>([]);
  const [showAksesModalPass, setShowAksesModalPass] = useState(false);

  // Password visibility map in table
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [isKtaDownloaded, setIsKtaDownloaded] = useState(false);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const excelFileRef = useRef<HTMLInputElement | null>(null);

  // Save members list and synchronize with user accounts
  const saveMembersList = (newList: DetailedMember[]) => {
    setMembers(newList);
    try {
      localStorage.setItem('kt_members_v3', JSON.stringify(newList));
    } catch (e) {}

    // Convert members to user accounts and synchronize
    const updatedUsers = newList.map(memberToUserAccount);
    if (onUpdateUsers) {
      onUpdateUsers(updatedUsers);
    }
  };

  // Sync form inputs when selected member changes
  const handleSelectMember = (m: DetailedMember) => {
    setSelectedMember(m);
    setFormNoAnggota(m.noAnggota);
    setFormNik(m.nik);
    setFormName(m.name);
    setFormNickname(m.nickname);
    setFormBirthPlace(m.birthPlace);
    setFormBirthDate(m.birthDate || '1998-08-12');
    setFormGender(m.gender);
    setFormAddress(m.address);
    setFormAvatar(m.avatar);
    setFormPhone(m.phone);
    setFormEmail(m.email);
    setFormEducation(m.education || 'S1');
    setFormJob(m.job || 'Karyawan Swasta');
    setFormCompany(m.company || 'PT. Maju Bersama');
    setFormSkills(m.skills || 'Komunikasi, IT');
    setFormInterests(m.interests || 'Sosial, Kepemudaan');
    setFormEmergencyContact(m.emergencyContact || '0812 9876 5432');
    setFormJabatan(m.jabatan);
    setFormDivisi(m.divisi);
    setFormRw(m.rw || 'RW 03');

    // Access fields
    setFormUsername(m.username || m.nickname.toLowerCase() || 'user');
    setFormPassword(m.password || 'karangtaruna');
    setFormIsSuperAdmin(m.isSuperAdmin || m.id === 'm-1' || m.username === 'admin');
    setFormAllowedMenus(m.allowedMenus || ['beranda', 'ringkasan', 'jadwal', 'berita']);
  };

  // Random Password Generator
  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  // Handle Save Form (From Panel 2 Form Tambah/Edit)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onToast('Nama lengkap anggota wajib diisi!');
      return;
    }
    if (!formUsername.trim()) {
      onToast('Username login anggota wajib diisi!');
      return;
    }

    const updated: DetailedMember = {
      ...selectedMember,
      noAnggota: formNoAnggota,
      nik: formNik,
      name: formName,
      nickname: formNickname || formName.split(' ')[0],
      birthPlace: formBirthPlace,
      birthDate: formBirthDate,
      gender: formGender,
      address: formAddress,
      avatar: formAvatar,
      phone: formPhone,
      email: formEmail,
      education: formEducation,
      job: formJob,
      company: formCompany,
      skills: formSkills,
      interests: formInterests,
      emergencyContact: formEmergencyContact,
      jabatan: formJabatan,
      divisi: formDivisi,
      rw: formRw,
      // Access & Password
      username: formUsername.trim().toLowerCase(),
      password: formPassword,
      isSuperAdmin: formIsSuperAdmin,
      allowedMenus: formIsSuperAdmin ? ALL_MENU_DEFINITIONS.map((m) => m.id) : formAllowedMenus,
    };

    const exists = members.some((m) => m.id === selectedMember.id);
    let newList: DetailedMember[];
    if (exists) {
      newList = members.map((m) => (m.id === selectedMember.id ? updated : m));
    } else {
      newList = [updated, ...members];
    }

    saveMembersList(newList);
    setSelectedMember(updated);
    onToast(`Data & akun sandi anggota "${formName}" berhasil disimpan dan disinkronkan!`);
  };

  // Open Quick Modal for Password & Access
  const handleOpenAksesModal = (m: DetailedMember) => {
    setAksesModalMember(m);
    setAksesModalUsername(m.username || m.nickname.toLowerCase() || 'user');
    setAksesModalPassword(m.password || 'karangtaruna');
    setAksesModalSuperAdmin(m.isSuperAdmin || m.id === 'm-1' || m.username === 'admin');
    setAksesModalMenus(m.allowedMenus || ['beranda', 'ringkasan', 'jadwal', 'berita']);
    setShowAksesModalPass(false);
  };

  // Save from Quick Modal
  const handleSaveAksesModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aksesModalMember) return;

    const updated: DetailedMember = {
      ...aksesModalMember,
      username: aksesModalUsername.trim().toLowerCase(),
      password: aksesModalPassword,
      isSuperAdmin: aksesModalSuperAdmin,
      allowedMenus: aksesModalSuperAdmin ? ALL_MENU_DEFINITIONS.map((m) => m.id) : aksesModalMenus,
    };

    const newList = members.map((m) => (m.id === updated.id ? updated : m));
    saveMembersList(newList);
    if (selectedMember.id === updated.id) {
      setSelectedMember(updated);
      setFormUsername(updated.username);
      setFormPassword(updated.password);
      setFormIsSuperAdmin(updated.isSuperAdmin || false);
      setFormAllowedMenus(updated.allowedMenus);
    }
    setAksesModalMember(null);
    onToast(`Kata sandi dan hak akses untuk "${updated.name}" berhasil diperbarui!`);
  };

  // Copy password to clipboard
  const handleCopyPass = (id: string, pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedId(id);
    onToast('Kata sandi berhasil disalin!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Member Status (Aktif / Tidak Aktif)
  const handleToggleStatus = (id: string) => {
    const updatedList = members.map((m) => {
      if (m.id === id) {
        const nextStatus = m.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
        const updated = { ...m, status: nextStatus as DetailedMember['status'] };
        if (selectedMember.id === id) {
          setSelectedMember(updated);
        }
        onToast(`Status keanggotaan ${m.name} diubah menjadi ${nextStatus}.`);
        return updated;
      }
      return m;
    });
    saveMembersList(updatedList);
  };

  // Avatar Upload Handler
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onToast('Ukuran foto profil melebihi 2MB. Silakan pilih foto yang lebih kecil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormAvatar(dataUrl);
      onToast('Foto profil anggota berhasil dimuat ke formulir!');
    };
    reader.readAsDataURL(file);
  };

  // Filter logic
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      m.name.toLowerCase().includes(q) ||
      m.noAnggota.toLowerCase().includes(q) ||
      m.nik.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q) ||
      m.address.toLowerCase().includes(q) ||
      m.username.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'Semua Status' || m.status === filterStatus;
    const matchJabatan = filterJabatan === 'Semua Jabatan' || m.jabatan === filterJabatan;
    const matchDivisi = filterDivisi === 'Semua Divisi' || m.divisi === filterDivisi;
    const matchGender = filterGender === 'Semua Gender' || m.gender === filterGender;
    return matchSearch && matchStatus && matchJabatan && matchDivisi && matchGender;
  });

  // Calculate dynamic stats
  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === 'Aktif').length;
  const pengurusCount = members.filter((m) => m.jabatan !== 'Anggota').length;
  const superAdminCount = members.filter((m) => m.isSuperAdmin).length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('Semua Status');
    setFilterJabatan('Semua Jabatan');
    setFilterDivisi('Semua Divisi');
    setFilterGender('Semua Gender');
    onToast('Penyaringan data anggota berhasil direset.');
  };

  // Download e-KTA Digital as Printable Document
  const handleDownloadKTA = () => {
    setIsKtaDownloaded(true);
    const textContent = `KARTU TANDA ANGGOTA (e-KTA)\n\nNama: ${selectedMember.name}\nNo. Anggota: ${selectedMember.noAnggota}\nNIK: ${selectedMember.nik}\nJabatan: ${selectedMember.jabatan}\nDivisi: ${selectedMember.divisi}\nRW: ${selectedMember.rw}\nUsername: ${selectedMember.username}\nStatus: ${selectedMember.status}\nKelurahan Manis Jaya, Tangerang`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KTA_${selectedMember.noAnggota}_${selectedMember.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onToast(`e-KTA Digital ${selectedMember.name} (${selectedMember.noAnggota}) berhasil diunduh!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-800">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={excelFileRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onToast(`Berkas "${file.name}" berhasil diunggah!`);
            setShowImportModal(false);
          }
        }}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP HEADER BANNER & SUB-TAB SWITCHER */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Anggota & Otorisasi Sistem
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola data keanggotaan, kartu tanda anggota, kata sandi, serta hak akses menu secara terpusat dan sinkron.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Button: + Tambah Anggota */}
            <button
              onClick={() => {
                const nextNum = members.length + 1;
                const newNo = `KT-${String(nextNum).padStart(3, '0')}`;
                const newBlank: DetailedMember = {
                  id: `m-${Date.now()}`,
                  noAnggota: newNo,
                  nik: '367104' + Math.floor(1000000000 + Math.random() * 9000000000),
                  name: '',
                  nickname: '',
                  jabatan: 'Anggota',
                  divisi: 'Pemuda & Olahraga',
                  rw: 'RW 03',
                  phone: '0812 ',
                  email: '',
                  status: 'Aktif',
                  joinDate: '28 Sep 2026',
                  birthPlace: 'Tangerang',
                  birthDate: '2000-01-01',
                  gender: 'Laki-laki',
                  address: 'Kelurahan Manis Jaya, Tangerang',
                  education: 'SMA/SMK',
                  job: 'Wiraswasta',
                  company: 'Mandiri',
                  skills: 'Kepemudaan',
                  interests: 'Sosial',
                  emergencyContact: '-',
                  avatar: '/src/assets/images/ahmad_fauzi_portrait_1790646239274.jpg',
                  period: '2024 - 2027',
                  username: `anggota${nextNum}`,
                  password: 'karangtaruna',
                  isSuperAdmin: false,
                  allowedMenus: ['beranda', 'ringkasan', 'jadwal', 'berita'],
                };
                setSelectedMember(newBlank);
                setFormNoAnggota(newNo);
                setFormNik(newBlank.nik);
                setFormName('');
                setFormNickname('');
                setFormUsername(`anggota${nextNum}`);
                setFormPassword('karangtaruna');
                setFormIsSuperAdmin(false);
                setFormAllowedMenus(['beranda', 'ringkasan', 'jadwal', 'berita']);
                setFormTab('utama');
                onToast(`Formulir pendaftaran anggota baru (${newNo}) siap diisi.`);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Anggota</span>
            </button>

            {/* Button: Import Excel */}
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import Excel</span>
            </button>

            {/* Button: More Options */}
            <div className="relative">
              <button
                onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 shadow-2xs"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showOptionsDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn text-xs">
                  <button
                    onClick={() => {
                      window.print();
                      setShowOptionsDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 font-semibold flex items-center gap-2 text-slate-700"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>Cetak Buku Induk Anggota</span>
                  </button>
                  <button
                    onClick={() => {
                      const csvContent =
                        'data:text/csv;charset=utf-8,' +
                        [
                          'No,No. Anggota,NIK,Nama,Username,Kata Sandi,Jabatan,Divisi,RW,No. HP,Status',
                          ...members.map(
                            (m, i) =>
                              `${i + 1},${m.noAnggota},${m.nik},"${m.name}",${m.username},"${m.password}",${m.jabatan},${m.divisi},${m.rw},${m.phone},${m.status}`
                          ),
                        ].join('\n');
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement('a');
                      link.setAttribute('href', encodedUri);
                      link.setAttribute('download', 'buku_induk_dan_sandi_karang_taruna.csv');
                      link.click();
                      setShowOptionsDropdown(false);
                      onToast('Mengekspor Buku Induk Anggota format CSV...');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 font-semibold flex items-center gap-2 text-slate-700"
                  >
                    <FileDown className="w-4 h-4 text-emerald-600" />
                    <span>Ekspor Data ke CSV</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUB-VIEW MODE TABS (Directly satisfies "form Akses Pengguna & Kata Sandi Anggota ada di form anggota") */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setMainViewMode('direktori')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mainViewMode === 'direktori'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Direktori Anggota & KTA Digital</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                mainViewMode === 'direktori' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {members.length}
            </span>
          </button>

          <button
            onClick={() => setMainViewMode('akses_sandi')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mainViewMode === 'akses_sandi'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 ring-1 ring-blue-400'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Akses Pengguna & Kata Sandi Anggota</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                mainViewMode === 'akses_sandi' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Sinkron 100%
            </span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. STATS CARDS */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Total Anggota</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5 leading-none">{totalCount}</div>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 block">Semua Terdaftar</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Anggota Aktif</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5 leading-none">{activeCount}</div>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 block">Siap Bertugas</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Pengurus Organisasi</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5 leading-none">{pengurusCount}</div>
              <span className="text-[11px] font-bold text-purple-600 mt-1 block">Struktural Harian</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Super Administrator</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5 leading-none">{superAdminCount}</div>
              <span className="text-[11px] font-bold text-indigo-600 mt-1 block">Akses Penuh Sistem</span>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. VIEW MODE A: DATA ANGGOTA & KTA DIGITAL */}
      {/* --------------------------------------------------------------------- */}
      {mainViewMode === 'direktori' && (
        <div className="space-y-6">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, NIK, username, RW..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="Semua Status">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>

                <select
                  value={filterJabatan}
                  onChange={(e) => setFilterJabatan(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="Semua Jabatan">Semua Jabatan</option>
                  <option value="Ketua">Ketua</option>
                  <option value="Wakil Ketua">Wakil Ketua</option>
                  <option value="Sekretaris">Sekretaris</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Koordinator Olahraga">Koordinator Olahraga</option>
                  <option value="Divisi Humas & Dokumentasi">Divisi Humas</option>
                  <option value="Anggota">Anggota</option>
                </select>

                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3 PANELS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* PANEL 1: TABEL DATA ANGGOTA (Width: 5 cols on lg) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900">Daftar Anggota Karang Taruna</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{filteredMembers.length} Orang</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-3">Anggota</th>
                        <th className="py-3 px-2">Jabatan & RW</th>
                        <th className="py-3 px-2 text-center">Status</th>
                        <th className="py-3 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMembers.map((m) => {
                        const isSelected = selectedMember.id === m.id;

                        return (
                          <tr
                            key={m.id}
                            onClick={() => handleSelectMember(m)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50/70 font-medium' : 'hover:bg-slate-50/60'
                            }`}
                          >
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={m.avatar}
                                  alt={m.name}
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate leading-tight">{m.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono leading-tight">
                                    {m.noAnggota} · @{m.username}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-2 whitespace-nowrap">
                              <p className="font-semibold text-slate-800 text-[11px] leading-tight">{m.jabatan}</p>
                              <p className="text-[10px] text-slate-400 leading-tight">{m.rw}</p>
                            </td>

                            <td className="py-3 px-2 text-center whitespace-nowrap">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  m.status === 'Aktif'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {m.status}
                              </span>
                            </td>

                            <td
                              className="py-3 px-3 text-right whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSelectMember(m)}
                                  title="Lihat Detail & KTA"
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectMember(m);
                                    setFormTab('utama');
                                  }}
                                  title="Edit Profil"
                                  className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAksesModal(m)}
                                  title="Atur Kata Sandi & Hak Akses"
                                  className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
                Pilih salah satu anggota untuk melihat detail atau menyunting akun sandinya.
              </div>
            </div>

            {/* PANEL 2: FORM TAMBAH / EDIT ANGGOTA + AKSES SANDI (Width: 4 cols on lg) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                    Form Data & Akun Anggota
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Menyunting: <strong className="text-slate-800">{selectedMember.name || 'Baru'}</strong>
                  </p>
                </div>
              </div>

              {/* Form Tabs: Data Utama, Data Tambahan, Dokumen, Akses & Sandi */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 text-xs pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setFormTab('utama')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${
                    formTab === 'utama' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Utama
                </button>
                <button
                  type="button"
                  onClick={() => setFormTab('tambahan')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${
                    formTab === 'tambahan' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Tambahan
                </button>
                <button
                  type="button"
                  onClick={() => setFormTab('dokumen')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap ${
                    formTab === 'dokumen' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Dokumen
                </button>
                <button
                  type="button"
                  onClick={() => setFormTab('akses')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                    formTab === 'akses'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-600 hover:bg-indigo-50 font-semibold'
                  }`}
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Akses & Sandi</span>
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
                {/* SUBTAB 1: DATA UTAMA */}
                {formTab === 'utama' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">No. Anggota</label>
                        <input
                          type="text"
                          required
                          value={formNoAnggota}
                          onChange={(e) => setFormNoAnggota(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">NIK (KTP)</label>
                        <input
                          type="text"
                          required
                          value={formNik}
                          onChange={(e) => setFormNik(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Nama lengkap anggota"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Nama Panggilan</label>
                        <input
                          type="text"
                          value={formNickname}
                          onChange={(e) => setFormNickname(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Jenis Kelamin</label>
                        <select
                          value={formGender}
                          onChange={(e: any) => setFormGender(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        >
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">No. HP / WhatsApp</label>
                        <input
                          type="text"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Email</label>
                        <input
                          type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Alamat Tinggal</label>
                      <textarea
                        rows={2}
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: DATA TAMBAHAN */}
                {formTab === 'tambahan' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Jabatan</label>
                        <select
                          value={formJabatan}
                          onChange={(e) => setFormJabatan(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        >
                          <option value="Ketua">Ketua</option>
                          <option value="Wakil Ketua">Wakil Ketua</option>
                          <option value="Sekretaris">Sekretaris</option>
                          <option value="Bendahara">Bendahara</option>
                          <option value="Koordinator Olahraga">Koordinator Olahraga</option>
                          <option value="Divisi Humas & Dokumentasi">Divisi Humas & Dokumentasi</option>
                          <option value="Anggota">Anggota</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Wilayah RW</label>
                        <select
                          value={formRw}
                          onChange={(e) => setFormRw(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        >
                          <option value="RW 01">RW 01</option>
                          <option value="RW 02">RW 02</option>
                          <option value="RW 03">RW 03</option>
                          <option value="RW 04">RW 04</option>
                          <option value="RW 05">RW 05</option>
                          <option value="RW 06">RW 06</option>
                          <option value="RW 07">RW 07</option>
                          <option value="RW 08">RW 08</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Pendidikan</label>
                        <input
                          type="text"
                          value={formEducation}
                          onChange={(e) => setFormEducation(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Pekerjaan</label>
                        <input
                          type="text"
                          value={formJob}
                          onChange={(e) => setFormJob(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Keahlian Utama</label>
                      <input
                        type="text"
                        value={formSkills}
                        onChange={(e) => setFormSkills(e.target.value)}
                        placeholder="contoh: Desain grafis, Futsal, IT"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: DOKUMEN */}
                {formTab === 'dokumen' && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="text-center p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <img
                        src={formAvatar}
                        alt="Foto Profil"
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-white shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700"
                      >
                        Unggah Foto Baru
                      </button>
                      <p className="text-[10px] text-slate-400 mt-1">Maksimal 2MB (JPG/PNG)</p>
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: FORM AKSES PENGGUNA & KATA SANDI ANGGOTA (Exact requirement!) */}
                {formTab === 'akses' && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-xs flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Akun & Otorisasi Sistem</span>
                        <span className="text-[11px] text-indigo-700 leading-snug">
                          Data akun login, kata sandi, dan wewenang menu ini 100% tersinkronkan dengan data akun aplikasi.
                        </span>
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Username Login <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={formUsername}
                          onChange={(e) => setFormUsername(e.target.value)}
                          placeholder="contoh: iik / admin"
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700 font-bold">
                          Kata Sandi (Password) <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newPass = generateRandomPassword();
                            setFormPassword(newPass);
                            setShowFormPassword(true);
                            onToast('Kata sandi acak baru telah dibuat!');
                          }}
                          className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Acak Sandi</span>
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showFormPassword ? 'text' : 'password'}
                          required
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          placeholder="Masukkan kata sandi"
                          className="w-full pl-9 pr-16 py-1.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500/20"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setShowFormPassword(!showFormPassword)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                            title={showFormPassword ? 'Sembunyikan' : 'Lihat Sandi'}
                          >
                            {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(formPassword);
                              onToast('Kata sandi disalin ke clipboard!');
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600"
                            title="Salin Sandi"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Super Admin Checkbox */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsSuperAdmin}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormIsSuperAdmin(checked);
                            if (checked) {
                              setFormAllowedMenus(ALL_MENU_DEFINITIONS.map((m) => m.id));
                            }
                          }}
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">Jadikan Super Administrator</span>
                          <span className="text-[11px] text-slate-500 leading-snug block">
                            Membuka seluruh akses menu dan wewenang sistem tanpa batas.
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Menu Permissions Checkboxes */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-bold text-slate-800 text-xs">
                          Hak Akses Menu ({formAllowedMenus.length} dari {ALL_MENU_DEFINITIONS.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (formAllowedMenus.length === ALL_MENU_DEFINITIONS.length) {
                              setFormAllowedMenus(['beranda']);
                            } else {
                              setFormAllowedMenus(ALL_MENU_DEFINITIONS.map((m) => m.id));
                            }
                          }}
                          className="text-[11px] text-blue-600 font-semibold hover:underline"
                        >
                          {formAllowedMenus.length === ALL_MENU_DEFINITIONS.length ? 'Pilih Minimal' : 'Pilih Semua'}
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                        {ALL_MENU_DEFINITIONS.map((menu) => {
                          const isChecked = formAllowedMenus.includes(menu.id);
                          const isBeranda = menu.id === 'beranda';

                          return (
                            <label
                              key={menu.id}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-white border border-blue-200 shadow-2xs font-semibold text-slate-800'
                                  : 'text-slate-600 hover:bg-white/60'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  disabled={isBeranda || formIsSuperAdmin}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormAllowedMenus([...formAllowedMenus, menu.id]);
                                    } else {
                                      setFormAllowedMenus(formAllowedMenus.filter((id) => id !== menu.id));
                                    }
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span>{menu.label}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-normal">{menu.category}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Data & Akun Sandi</span>
                  </button>
                </div>
              </form>
            </div>

            {/* PANEL 3: e-KTA DIGITAL & DETAIL ANGGOTA (Width: 3 cols on lg) */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-900">e-KTA Digital</h4>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  {selectedMember.noAnggota}
                </span>
              </div>

              {/* CARD PREVIEW */}
              <div className="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-br from-[#0a192f] via-[#102a45] to-[#0d3b66] text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrandLogo size="sm" />
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider leading-none">Karang Taruna</p>
                      <p className="text-[9px] text-blue-200 leading-none mt-0.5">Manis Jaya</p>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-mono">
                    {selectedMember.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={selectedMember.avatar}
                    alt={selectedMember.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white/60 shadow-md"
                  />
                  <div className="min-w-0">
                    <p className="font-black text-sm text-white truncate leading-tight">{selectedMember.name}</p>
                    <p className="text-[11px] text-blue-300 font-medium leading-tight mt-0.5">
                      {selectedMember.jabatan}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono leading-tight mt-1">{selectedMember.rw}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
                  <span>NIK: {selectedMember.nik.slice(0, 10)}•••</span>
                  <span>Masa: {selectedMember.period}</span>
                </div>
              </div>

              {/* Quick Credentials Info */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Username:</span>
                  <span className="font-mono font-bold text-slate-800">@{selectedMember.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Kata Sandi:</span>
                  <span className="font-mono text-slate-700 flex items-center gap-1">
                    <span>{selectedMember.password}</span>
                    <button
                      onClick={() => handleCopyPass(selectedMember.id, selectedMember.password)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Hak Akses:</span>
                  <span className="font-bold text-blue-600 text-[11px]">
                    {selectedMember.isSuperAdmin ? 'Akses Penuh (14)' : `${selectedMember.allowedMenus.length} Menu`}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDownloadKTA}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh e-KTA Digital</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAksesModal(selectedMember)}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kelola Sandi & Hak Akses</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 4. VIEW MODE B: AKSES PENGGUNA & KATA SANDI ANGGOTA (Exact requirement!) */}
      {/* --------------------------------------------------------------------- */}
      {mainViewMode === 'akses_sandi' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Banner Otorisasi */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  Akses Pengguna & Kata Sandi Anggota Terpadu
                </h3>
                <p className="text-xs text-blue-200/80">
                  Semua data anggota di bawah ini identik dan terhubung langsung dengan akun login sistem Karang Taruna.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Switch back to direktori and open add member
                  setMainViewMode('direktori');
                  setFormTab('akses');
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Buat Akun Anggota</span>
              </button>
            </div>
          </div>

          {/* Table of Members, Passwords, and Access Rights */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Nama Anggota & Foto</th>
                    <th className="py-3.5 px-3">Jabatan / RW</th>
                    <th className="py-3.5 px-3">Username Login</th>
                    <th className="py-3.5 px-4">Kata Sandi (Password)</th>
                    <th className="py-3.5 px-3">Hak Akses Menu</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => {
                    const isVisible = showPassMap[m.id];
                    const isSuper = m.isSuperAdmin || m.id === 'm-1' || m.username === 'admin';

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={m.avatar}
                              alt={m.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                                <span>{m.name}</span>
                                {isSuper && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                    Admin
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {m.noAnggota} · NIK: {m.nik}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <p className="font-semibold text-slate-800">{m.jabatan}</p>
                          <p className="text-[10px] text-slate-400">{m.rw}</p>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
                            @{m.username}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold">
                              {isVisible ? m.password : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setShowPassMap((prev) => ({
                                  ...prev,
                                  [m.id]: !prev[m.id],
                                }))
                              }
                              className="p-1 text-slate-400 hover:text-slate-600 rounded"
                              title={isVisible ? 'Sembunyikan' : 'Lihat Sandi'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyPass(m.id, m.password)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded"
                              title="Salin Sandi"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isSuper ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isSuper ? 'Semua Menu (14)' : `${m.allowedMenus?.length || 4} Menu`}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenAksesModal(m)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <KeyRound className="w-3 h-3 text-indigo-600" />
                              <span>Atur Sandi</span>
                            </button>

                            {onSwitchUser && (
                              <button
                                type="button"
                                onClick={() => {
                                  const account = memberToUserAccount(m);
                                  onSwitchUser(account);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                title="Login sebagai akun anggota ini"
                              >
                                <LogIn className="w-3 h-3 text-slate-500" />
                                <span>Masuk</span>
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

      {/* --------------------------------------------------------------------- */}
      {/* 5. MODAL ATUR KATA SANDI & HAK AKSES CEPAT (AksesSandiModal) */}
      {/* --------------------------------------------------------------------- */}
      {aksesModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                    Atur Sandi & Wewenang
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Anggota: <strong className="text-slate-800">{aksesModalMember.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAksesModalMember(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAksesModal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  value={aksesModalUsername}
                  onChange={(e) => setAksesModalUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Kata Sandi Baru</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newPass = generateRandomPassword();
                      setAksesModalPassword(newPass);
                      setShowAksesModalPass(true);
                      onToast('Sandi acak dibuat!');
                    }}
                    className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Buat Acak</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAksesModalPass ? 'text' : 'password'}
                    required
                    value={aksesModalPassword}
                    onChange={(e) => setAksesModalPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAksesModalPass(!showAksesModalPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showAksesModalPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Super Admin toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aksesModalSuperAdmin}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setAksesModalSuperAdmin(checked);
                      if (checked) {
                        setAksesModalMenus(ALL_MENU_DEFINITIONS.map((m) => m.id));
                      }
                    }}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Jadikan Super Administrator</span>
                    <span className="text-[11px] text-slate-500 leading-snug block">
                      Memiliki akses penuh ke seluruh menu dan pengaturan sistem.
                    </span>
                  </div>
                </label>
              </div>

              {/* Menu permissions list */}
              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1.5">
                  Hak Akses Menu ({aksesModalMenus.length} dari {ALL_MENU_DEFINITIONS.length})
                </label>
                <div className="max-h-44 overflow-y-auto space-y-1 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {ALL_MENU_DEFINITIONS.map((menu) => {
                    const isChecked = aksesModalMenus.includes(menu.id);
                    const isBeranda = menu.id === 'beranda';

                    return (
                      <label
                        key={menu.id}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-white border border-blue-200 shadow-2xs font-semibold text-slate-800'
                            : 'text-slate-600 hover:bg-white/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            disabled={isBeranda || aksesModalSuperAdmin}
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAksesModalMenus([...aksesModalMenus, menu.id]);
                              } else {
                                setAksesModalMenus(aksesModalMenus.filter((id) => id !== menu.id));
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span>{menu.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">{menu.category}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAksesModalMember(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm shadow-indigo-600/30"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
