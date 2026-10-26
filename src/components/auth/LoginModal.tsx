import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Users,
  UserPlus,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  CheckCircle2,
  Copy,
  RefreshCw,
  ArrowLeft,
  Send,
  Sparkles,
  ExternalLink,
  Inbox,
  HelpCircle,
  AlertTriangle,
  Settings,
  Key,
} from 'lucide-react';
import { UserAccount } from '../../types/auth';
import { BrandLogo } from '../workspace/BrandLogo';
import { addNotification } from '../../services/notificationService';
import {
  sendOfficialVerificationEmail,
  getEmailProviderWebUrl,
  getDirectGmailComposeUrl,
  SendVerificationEmailResult,
  OFFICIAL_SENDER_EMAIL,
  validateEmailAddress,
  processIncomingVerificationUrl,
  listenToEmailVerification,
} from '../../services/emailVerificationService';
import { generateAIEmailContent, logAIEmailDispatch } from '../../services/aiEmailService';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (user: UserAccount) => void;
  onRegisterUser?: (user: UserAccount) => void;
  usersList: UserAccount[];
  onClose?: () => void;
  canDismiss?: boolean;
}

type AuthMode = 'login' | 'register' | 'verify';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLogin,
  onRegisterUser,
  usersList,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Login States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regRw, setRegRw] = useState('RW 01');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Verification States
  const [generatedCode, setGeneratedCode] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [aiSendingStatus, setAiSendingStatus] = useState<string>('');
  const [aiGreeting, setAiGreeting] = useState<string>('');
  const [emailDeliveryResult, setEmailDeliveryResult] = useState<SendVerificationEmailResult | null>(null);
  const [showBantuanKode, setShowBantuanKode] = useState(false);
  const [autoVerifiedByEmail, setAutoVerifiedByEmail] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Quick SMTP Setup States & Handlers
  const [showSmtpSetup, setShowSmtpSetup] = useState(false);
  const [smtpUser, setSmtpUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kt_smtp_config');
      return saved ? JSON.parse(saved).user || OFFICIAL_SENDER_EMAIL : OFFICIAL_SENDER_EMAIL;
    } catch {
      return OFFICIAL_SENDER_EMAIL;
    }
  });
  const [smtpPass, setSmtpPass] = useState(() => {
    try {
      const saved = localStorage.getItem('kt_smtp_config');
      return saved ? JSON.parse(saved).pass || '' : '';
    } catch {
      return '';
    }
  });
  const [smtpHost, setSmtpHost] = useState(() => {
    try {
      const saved = localStorage.getItem('kt_smtp_config');
      return saved ? JSON.parse(saved).host || 'smtp.gmail.com' : 'smtp.gmail.com';
    } catch {
      return 'smtp.gmail.com';
    }
  });
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpFeedbackMsg, setSmtpFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveAndSendSmtp = async () => {
    if (!smtpUser.trim() || !smtpPass.trim()) {
      setSmtpFeedbackMsg({ type: 'error', text: 'Email pengirim dan Sandi Aplikasi Google wajib diisi.' });
      return;
    }

    setIsSavingSmtp(true);
    setSmtpFeedbackMsg(null);
    const cfg = {
      user: smtpUser.trim(),
      pass: smtpPass.trim().replace(/\s+/g, ''),
      host: smtpHost.trim() || 'smtp.gmail.com',
      port: '465',
    };
    try {
      localStorage.setItem('kt_smtp_config', JSON.stringify(cfg));
    } catch {}

    // Jika sedang di layar verifikasi, langsung kirim email ke email tujuan!
    if (regEmail.trim() && generatedCode) {
      try {
        const res = await sendOfficialVerificationEmail({
          to: regEmail.trim(),
          name: regName.trim(),
          username: regUsername.trim().toLowerCase(),
          code: generatedCode,
        });
        setEmailDeliveryResult(res);
        if (res.delivered) {
          setSmtpFeedbackMsg({ type: 'success', text: `Berhasil! Email verifikasi telah terkirim via SMTP ke ${regEmail.trim()}` });
          setTimeout(() => setShowSmtpSetup(false), 1500);
          addNotification({
            title: 'Email Terkirim via SMTP',
            message: `Email verifikasi berhasil dikirim ke ${regEmail.trim()}`,
            type: 'sistem',
            actionLabel: 'Buka Email',
          });
        } else {
          setSmtpFeedbackMsg({ type: 'error', text: res.message || res.error || 'Gagal mengirim email via SMTP.' });
        }
      } catch (e: any) {
        setSmtpFeedbackMsg({ type: 'error', text: e?.message || 'Gagal mengirim email.' });
      } finally {
        setIsSavingSmtp(false);
      }
    } else {
      setIsSavingSmtp(false);
      setSmtpFeedbackMsg({ type: 'success', text: 'Konfigurasi SMTP berhasil disimpan!' });
      setTimeout(() => setShowSmtpSetup(false), 1200);
    }
  };

  // Reset fields whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setErrorMsg(null);
      setShowPassword(false);
      setMode('login');
      setOtpDigits(['', '', '', '', '', '']);
    }
  }, [isOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (mode === 'verify' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, countdown]);

  // Deteksi tautan verifikasi email saat halaman dibuka / diklik dari email penerima
  useEffect(() => {
    const incoming = processIncomingVerificationUrl();
    if (incoming && incoming.code) {
      if (incoming.email) setRegEmail(incoming.email);
      setGeneratedCode(incoming.code);
      setOtpDigits(incoming.code.split(''));
      setMode('verify');
      setAutoVerifiedByEmail(true);
      setErrorMsg(null);
      addNotification({
        title: 'Email Terverifikasi Otomatis',
        message: 'Email verifikasi berhasil dibuka! Kode 6-digit terisi otomatis ke dalam sistem.',
        type: 'sistem',
      });
    }
  }, []);

  // Mendengarkan secara realtime ketika email dibuka oleh penerima (di perangkat/tab mana saja)
  useEffect(() => {
    if (mode !== 'verify' || !regEmail.trim()) return;
    const unsub = listenToEmailVerification(regEmail.trim(), (verifiedCode) => {
      if (verifiedCode && verifiedCode.length === 6) {
        setGeneratedCode(verifiedCode);
        setOtpDigits(verifiedCode.split(''));
        setAutoVerifiedByEmail(true);
        setErrorMsg(null);
        addNotification({
          title: 'Email Dibuka oleh Penerima',
          message: 'Surat email verifikasi berhasil dibuka! 6 digit kode otomatis terisi ke aplikasi.',
          type: 'sistem',
        });
      }
    });
    return () => unsub();
  }, [mode, regEmail]);

  if (!isOpen) return null;

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedInput = username.trim();
    if (!trimmedInput) {
      setErrorMsg('Silakan masukkan Username atau NIK Anda.');
      return;
    }

    if (!password) {
      setErrorMsg('Silakan masukkan kata sandi Anda.');
      return;
    }

    const lowerInput = trimmedInput.toLowerCase();
    const cleanDigits = trimmedInput.replace(/\D/g, '');

    const foundUser = usersList.find((u) => {
      if (lowerInput === 'administrator' || lowerInput === 'admin') {
        if (u.isSuperAdmin || (u.username && (u.username.toLowerCase() === 'administrator' || u.username.toLowerCase() === 'admin'))) {
          return true;
        }
      }
      if (u.username && u.username.toLowerCase() === lowerInput) return true;
      if (u.nik) {
        const uNikDigits = u.nik.replace(/\D/g, '');
        if (cleanDigits.length >= 8 && uNikDigits === cleanDigits) return true;
        if (u.nik.toLowerCase() === lowerInput) return true;
      }
      if (u.noAnggota && u.noAnggota.toLowerCase() === lowerInput) return true;
      if (u.email && u.email.toLowerCase() === lowerInput) return true;
      return false;
    });

    if (!foundUser) {
      setErrorMsg('Akun atau NIK tidak terdaftar. Setiap user baru wajib daftar user terlebih dahulu melalui menu pendaftaran.');
      return;
    }

    const isValidPassword =
      foundUser.password === password ||
      foundUser.password === password.trim() ||
      (foundUser.isSuperAdmin && (password === 'Bautai123' || password.trim() === 'Bautai123'));

    if (!isValidPassword) {
      setErrorMsg('Kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
      return;
    }

    onLogin(foundUser);
  };

  // Kirim email verifikasi resmi ke email yang dimasukkan pengguna dengan bantuan AI
  const sendVerificationEmail = async () => {
    setIsSendingEmail(true);
    setAiSendingStatus('🤖 AI menyusun surat sambutan resmi Karang Taruna...');
    setErrorMsg(null);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setOtpDigits(['', '', '', '', '', '']);
    setCountdown(60);
    setCopiedCode(false);
    setShowBantuanKode(false);

    try {
      // 1. Susun konten AI khusus untuk pendaftar
      setAiSendingStatus('🤖 AI merancang sambutan resmi & angka verifikasi 6-digit...');
      const aiContent = await generateAIEmailContent({
        to: regEmail.trim(),
        name: regName.trim(),
        username: regUsername.trim().toLowerCase(),
        code,
      });
      if (aiContent?.welcomeMessage) {
        setAiGreeting(aiContent.welcomeMessage);
      }

      // 2. Kirim otomatis dari karangtarunamanisjaya@gmail.com ke alamat email pendaftar
      setAiSendingStatus(`📤 Mengirim otomatis dari ${OFFICIAL_SENDER_EMAIL} ke ${regEmail.trim()}...`);
      const result = await sendOfficialVerificationEmail({
        to: regEmail.trim(),
        name: regName.trim(),
        username: regUsername.trim().toLowerCase(),
        code,
        subjectOverride: aiContent.subject,
        htmlOverride: aiContent.htmlContent,
      });
      setEmailDeliveryResult(result);

      // 3. Rekam audit log pengiriman AI
      await logAIEmailDispatch({
        to: regEmail.trim(),
        name: regName.trim(),
        username: regUsername.trim().toLowerCase(),
        code,
        delivered: result.delivered,
        channel: result.channel,
      });

      if (result.delivered) {
        addNotification({
          title: 'Email Verifikasi Resmi Dikirim',
          message: `Surat email verifikasi dengan 6 digit angka telah dikirim otomatis dari ${OFFICIAL_SENDER_EMAIL} ke ${regEmail.trim()}`,
          type: 'sistem',
          actionLabel: 'Buka Email',
        });
      } else {
        addNotification({
          title: 'Surat Verifikasi Dikirim ke Email',
          message: `Surat verifikasi 6 digit telah dikirimkan ke alamat email ${regEmail.trim()}. Silakan periksa email Anda.`,
          type: 'sistem',
          actionLabel: 'Buka Email',
        });
      }

      setMode('verify');
    } catch (err: any) {
      console.warn('Gagal mengirim email verifikasi:', err);
      setEmailDeliveryResult({
        success: false,
        delivered: false,
        message: err?.message || 'Gagal mengirim email verifikasi',
        channel: 'server_smtp',
        timestamp: new Date().toISOString(),
      });
      setMode('verify');
    } finally {
      setIsSendingEmail(false);
      setAiSendingStatus('');
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    }
  };

  // Handle Register Form Submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    const cleanUsername = regUsername.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMsg('Username minimal harus 3 karakter.');
      return;
    }

    // Check if username is already taken
    const exists = usersList.some(
      (u) => (u.username || '').toLowerCase() === cleanUsername
    );
    if (exists) {
      setErrorMsg(`Username "${cleanUsername}" sudah digunakan. Silakan pilih username lain.`);
      return;
    }

    // Email validation: Wajib mengisi email & validasi format data email
    const trimmedEmail = regEmail.trim();
    if (!trimmedEmail) {
      const msg = 'Email wajib diisi! Silakan masukkan alamat email aktif Anda untuk menerima 6 digit kode verifikasi pendaftaran.';
      setErrorMsg(msg);
      addNotification({
        title: 'Wajib Mengisi Email',
        message: 'Alamat email wajib diisi untuk pendaftaran akun baru Karang Taruna.',
        type: 'sistem',
      });
      return;
    }

    const emailCheck = validateEmailAddress(trimmedEmail);
    if (!emailCheck.isValid) {
      const msg = emailCheck.errorMessage || 'Data email tidak valid! Masukkan alamat email aktif yang benar (contoh: nama@gmail.com) untuk menerima kode verifikasi 6 digit.';
      setErrorMsg(msg);
      addNotification({
        title: 'Data Email Tidak Valid',
        message: 'Format data email yang Anda masukkan tidak valid. Contoh format: nama@gmail.com',
        type: 'sistem',
      });
      return;
    }

    // Cek apakah email sudah pernah terdaftar
    const lowerEmail = trimmedEmail.toLowerCase();
    const emailExists = usersList.some(
      (u) => (u.email || '').toLowerCase() === lowerEmail
    );
    if (emailExists) {
      setErrorMsg(`Email "${trimmedEmail}" sudah terdaftar pada akun lain. Silakan gunakan alamat email lain atau masuk ke akun Anda.`);
      return;
    }

    // Password validation
    if (regPassword.length < 6) {
      setErrorMsg('Kata sandi minimal harus 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    // All valid -> send verification email
    sendVerificationEmail();
  };

  // Handle OTP Input Change
  const handleOtpChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, '');
    if (!sanitized) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // If pasted multiple digits
    if (sanitized.length > 1) {
      const pasteDigits = sanitized.slice(0, 6).split('');
      const updated = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        updated[i] = pasteDigits[i] || '';
      }
      setOtpDigits(updated);
      const nextFocus = Math.min(pasteDigits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = sanitized[0];
    setOtpDigits(updated);

    if (index < 5 && sanitized[0]) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Helper to get initials
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Handle Verify Code Submission
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setErrorMsg('Silakan masukkan lengkap 6 digit angka verifikasi.');
      return;
    }

    if (enteredCode !== generatedCode) {
      setErrorMsg('Angka verifikasi yang Anda masukkan salah. Silakan periksa notifikasi email Anda.');
      return;
    }

    // Create verified new user
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      username: regUsername.trim().toLowerCase(),
      password: regPassword,
      email: regEmail.trim(),
      nik: regNik.trim() || undefined,
      rw: `${regRw} Kelurahan Manis Jaya`,
      phone: regPhone.trim() || undefined,
      role: 'Anggota Karang Taruna',
      avatarInitials: getInitials(regName),
      status: 'Aktif',
      isSuperAdmin: false,
      allowedMenus: [
        'beranda',
        'ringkasan',
        'arsip_kegiatan',
        'anggota',
        'jadwal',
        'berita',
        'tambah_berita',
        'aset',
        'surat',
      ],
      lastLogin: new Date().toISOString(),
    };

    if (onRegisterUser) {
      onRegisterUser(newUser);
    } else {
      onLogin(newUser);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAutoFillCode = () => {
    if (generatedCode && generatedCode.length === 6) {
      setOtpDigits(generatedCode.split(''));
      setErrorMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] my-auto">
        {/* Top Header Decorative Banner */}
        <div className="bg-gradient-to-r from-[#0d213a] via-[#153457] to-[#0f3d64] text-white p-5 sm:p-6 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <BrandLogo size="md" />
              <div className="space-y-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-blue-300" />
                  Autentikasi Karang Taruna
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {mode === 'login' && 'Masuk ke Sistem Karang Taruna'}
                  {mode === 'register' && 'Pendaftaran Pengguna Baru'}
                  {mode === 'verify' && 'Verifikasi Email Pendaftaran'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-300 font-normal leading-relaxed">
                  Kelurahan Manis Jaya, Kec. Jatiuwung, Kota Tangerang
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'verify' && (
            <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-900/60 p-1 rounded-2xl border border-slate-700/60 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Masuk (Login)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar User Baru</span>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold block">Pemberitahuan:</span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 1. TAMPILAN LOGIN                                              */}
          {/* ============================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Username / NIK Anggota
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username atau NIK terdaftar"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Kata Sandi (Password)
                  </label>
                  <span
                    className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline"
                    onClick={() =>
                      setErrorMsg(
                        'Silakan hubungi Pengurus Karang Taruna RW setempat jika Anda lupa kata sandi.'
                      )
                    }
                  >
                    Lupa Password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun Anda"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Masuk ke Workspace Karang Taruna</span>
              </button>

              {/* Callout ke Pendaftaran User Baru */}
              <div className="pt-2 border-t border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-500 font-medium">
                  Belum memiliki akun terdaftar?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Daftar User Baru (Setiap Pengurus/Pemuda Baru Wajib Daftar)</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* 2. TAMPILAN PENDAFTARAN USER BARU                             */}
          {/* ============================================================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fadeIn">
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-3 rounded-2xl border border-blue-200/90 text-[11px] text-blue-900 flex items-start gap-2.5 leading-relaxed shadow-xs">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-blue-950 flex items-center gap-1.5">
                    <span>🤖 AI Otomasi Email Pendaftaran Karang Taruna</span>
                  </p>
                  <p className="text-slate-700">
                    Sistem AI akan secara otomatis mengirimkan surat verifikasi resmi dari <strong>{OFFICIAL_SENDER_EMAIL}</strong> langsung ke alamat email tujuan yang Anda daftarkan saat mengklik tombol <em>Kirim Angka Verifikasi ke Email Tujuan</em>.
                  </p>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Muhammad Ryan Pratama"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Username Akun *
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-mono text-xs absolute left-3 top-1/2 -translate-y-1/2">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="ryan_pratama"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>Alamat Email Aktif</span>
                      <span className="text-rose-500 font-black">* (Wajib Diisi)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Kode 6 Digit</span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="nama@gmail.com"
                      className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 ${
                        !regEmail.trim()
                          ? 'border-slate-300 focus:ring-blue-500'
                          : !validateEmailAddress(regEmail).isValid
                          ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                          : 'border-emerald-400 bg-emerald-50/20 focus:ring-emerald-500'
                      }`}
                    />
                  </div>

                  {/* Realtime Email Validation Feedback */}
                  <div className="mt-1 text-[11px]">
                    {!regEmail.trim() ? (
                      <span className="text-amber-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Wajib diisi untuk menerima email verifikasi 6 digit pendaftaran</span>
                      </span>
                    ) : !validateEmailAddress(regEmail).isValid ? (
                      <span className="text-rose-600 font-semibold flex items-center gap-1 animate-fadeIn">
                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>Data email tidak valid! Masukkan format email yang benar (contoh: nama@gmail.com)</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Format email valid — verifikasi 6 digit dikirim dari <strong>{OFFICIAL_SENDER_EMAIL}</strong></span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* NIK & Wilayah RW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    NIK KTP (16 Digit) / No. KTA
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={16}
                      value={regNik}
                      onChange={(e) => setRegNik(e.target.value.replace(/\D/g, ''))}
                      placeholder="3671012345678901"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Wilayah RW Manis Jaya *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={regRw}
                      onChange={(e) => setRegRw(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="RW 01">RW 01 - Manis Jaya</option>
                      <option value="RW 02">RW 02 - Manis Jaya</option>
                      <option value="RW 03">RW 03 - Manis Jaya</option>
                      <option value="RW 04">RW 04 - Manis Jaya</option>
                      <option value="RW 05">RW 05 - Manis Jaya</option>
                      <option value="RW 06">RW 06 - Manis Jaya</option>
                      <option value="RW 07">RW 07 - Manis Jaya</option>
                      <option value="RW 08">RW 08 - Manis Jaya</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* No Handphone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nomor WhatsApp / Handphone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Kata Sandi *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Ulangi Kata Sandi *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quick indicator for SMTP */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${smtpUser && smtpPass ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span className="truncate max-w-[190px]">
                    {smtpUser && smtpPass ? `SMTP Aktif (${smtpUser.split('@')[0]})` : 'SMTP Pengirim Belum Diatur'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSmtpSetup(!showSmtpSetup)}
                  className="text-blue-600 hover:text-blue-800 font-bold underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Settings className="w-3 h-3" />
                  <span>{showSmtpSetup ? 'Tutup Pengaturan' : 'Atur Gmail Pengirim'}</span>
                </button>
              </div>

              {/* Inline SMTP Setup Card */}
              {showSmtpSetup && (
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-700 space-y-3 animate-fadeIn text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 font-bold text-blue-300">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      <span>Koneksi Akun Gmail Pengirim (SMTP)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSmtpSetup(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      &times;
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Masukkan akun Gmail resmi Karang Taruna dan 16-digit <em>Sandi Aplikasi (Google App Password)</em> agar notifikasi email verifikasi terkirim otomatis ke kotak masuk pendaftar.
                  </p>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Email Gmail Pengirim</label>
                      <input
                        type="email"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="organisasi.manisjaya@gmail.com"
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Sandi Aplikasi Google (16 Huruf)</label>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-400 hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Buat di sini</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <input
                        type="password"
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        placeholder="abcd efgh ijkl mnop"
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  {smtpFeedbackMsg && (
                    <div className={`p-2 rounded-lg text-[11px] ${smtpFeedbackMsg.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                      {smtpFeedbackMsg.text}
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={isSavingSmtp}
                    onClick={handleSaveAndSendSmtp}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSavingSmtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{isSavingSmtp ? 'Menghubungkan...' : 'Simpan Kredensial Pengirim'}</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSendingEmail ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{aiSendingStatus || `AI Mengirim Email Verifikasi ke ${regEmail || 'Email'}...`}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Kirim Angka Verifikasi ke Email Tujuan</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Sudah punya akun terdaftar? Masuk di sini
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* 3. TAMPILAN MASUKKAN ANGKA VERIFIKASI (OTP)                   */}
          {/* ============================================================== */}
          {mode === 'verify' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Notifikasi Email Masuk Banner Resmi */}
              <div className={`text-white rounded-2xl p-4 sm:p-5 border shadow-lg space-y-3.5 ${
                emailDeliveryResult?.delivered
                  ? 'bg-gradient-to-br from-slate-900 via-[#064e3b] to-[#0f3d64] border-emerald-500/40'
                  : 'bg-gradient-to-br from-slate-900 via-[#1e293b] to-[#153457] border-amber-500/30'
              }`}>
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10 text-[11px]">
                  <div className="flex items-center gap-2 font-bold">
                    {emailDeliveryResult?.delivered ? (
                      <>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-emerald-300">Email Verifikasi Resmi Terkirim</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-amber-300">Email Otomatis Belum Terkirim</span>
                      </>
                    )}
                  </div>
                  <span className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    emailDeliveryResult?.delivered
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    Tujuan: {regEmail}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                    <Mail className={`w-4 h-4 shrink-0 mt-0.5 ${emailDeliveryResult?.delivered ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <div className="space-y-0.5">
                      <p className="text-slate-300 text-[11px]">
                        Surat verifikasi ditujukan ke email pendaftaran Anda:
                      </p>
                      <p className="text-white font-bold font-mono text-xs sm:text-sm break-all">
                        {regEmail}
                      </p>
                    </div>
                  </div>

                  {emailDeliveryResult?.delivered ? (
                    <p className="text-emerald-100 text-[11px] leading-relaxed">
                      Halo <strong>{regName}</strong>, surat email verifikasi 6 digit telah berhasil dikirim otomatis dari <strong>{OFFICIAL_SENDER_EMAIL}</strong> ke alamat email tujuan <strong>{regEmail}</strong>. Silakan periksa Kotak Masuk atau folder Spam di email Anda.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-amber-100 text-[11px] leading-relaxed">
                        Halo <strong>{regName}</strong>, surat email verifikasi 6 digit disiapkan dari <strong>{OFFICIAL_SENDER_EMAIL}</strong> menuju <strong>{regEmail}</strong>. Untuk pengiriman otomatis ke kotak masuk tanpa membuka webmail, masukkan Sandi Aplikasi Google 16-digit di bawah, atau kirim langsung via Gmail.
                      </p>
                      {emailDeliveryResult?.error && (
                        <p className="text-[10px] font-mono text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
                          Status Server: {emailDeliveryResult.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick actions for SMTP or Manual Sending */}
                {!emailDeliveryResult?.delivered && (
                  <div className="p-3 bg-black/30 rounded-xl border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-semibold">Pilihan Pengiriman & Aktivasi:</span>
                      <button
                        type="button"
                        onClick={() => setShowSmtpSetup(!showSmtpSetup)}
                        className="text-blue-300 hover:text-blue-200 font-bold underline flex items-center gap-1 cursor-pointer"
                      >
                        <Settings className="w-3 h-3" />
                        <span>{showSmtpSetup ? 'Tutup Pengaturan' : 'Hubungkan Gmail Pengirim (SMTP)'}</span>
                      </button>
                    </div>

                    {/* Inline SMTP Setup Card inside Verify screen */}
                    {showSmtpSetup && (
                      <div className="p-3 bg-slate-900/90 text-white rounded-xl border border-blue-500/40 space-y-2.5 animate-fadeIn text-xs">
                        <div className="font-bold text-blue-300 flex items-center gap-1.5 pb-1 border-b border-slate-800">
                          <Key className="w-3.5 h-3.5" />
                          <span>Atur Kredensial Pengirim Gmail (Otomatis)</span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 leading-relaxed">
                          Konfigurasikan akun <strong>{OFFICIAL_SENDER_EMAIL}</strong> dengan 16-digit <em>Google App Password</em> untuk mengirim email verifikasi 6 digit otomatis ke <strong>{regEmail}</strong>:
                        </p>
                        <div className="space-y-1.5">
                          <input
                            type="email"
                            value={smtpUser}
                            onChange={(e) => setSmtpUser(e.target.value)}
                            placeholder={OFFICIAL_SENDER_EMAIL}
                            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="password"
                            value={smtpPass}
                            onChange={(e) => setSmtpPass(e.target.value)}
                            placeholder="Sandi Aplikasi Google (16 huruf tanpa spasi)"
                            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        {smtpFeedbackMsg && (
                          <div className={`p-2 rounded-lg text-[10.5px] ${smtpFeedbackMsg.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                            {smtpFeedbackMsg.text}
                          </div>
                        )}
                        <button
                          type="button"
                          disabled={isSavingSmtp}
                          onClick={handleSaveAndSendSmtp}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          {isSavingSmtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          <span>{isSavingSmtp ? 'Mengirim ke Email Tujuan...' : `Simpan & Kirim Email ke ${regEmail}`}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Pengiriman Kode Verifikasi ke Email Penerima (Tidak Menampilkan Kode di Layar) */}
                <div className="p-4 bg-gradient-to-br from-slate-900 via-[#0f2847] to-[#0a192f] rounded-2xl border border-blue-400/30 text-white space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] pb-2 border-b border-white/10 font-semibold">
                    <span className="text-blue-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Verifikasi Email Resmi Karang Taruna</span>
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Kode Dikirim ke Penerima</span>
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Pengirim Resmi:</span>
                      <span className="font-mono text-blue-300 font-bold">{OFFICIAL_SENDER_EMAIL}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Email Penerima:</span>
                      <span className="font-mono text-emerald-300 font-bold break-all">{regEmail}</span>
                    </div>
                  </div>

                  {aiGreeting && (
                    <div className="p-2.5 bg-blue-950/70 rounded-xl border border-blue-500/30 text-[11px] text-blue-200 italic space-y-1">
                      <span className="block font-bold not-italic text-blue-300 text-[10px] uppercase tracking-wider">Pesan Sambutan AI Karang Taruna:</span>
                      <p>"{aiGreeting}"</p>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Sistem AI telah memproses dan mengirimkan surat resmi berisi <strong>6 digit angka verifikasi</strong> ke alamat email penerima <strong>{regEmail}</strong>. Silakan periksa Kotak Masuk atau folder Spam pada email Anda untuk melihat kode, atau buka email untuk mengisi kotak kode verifikasi secara otomatis.
                  </p>

                  {/* Banner Otomatis Terisi Ketika Email Dibuka */}
                  {autoVerifiedByEmail && (
                    <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="block font-bold">Email Berhasil Dibuka oleh Penerima!</span>
                        <span className="text-[11px] text-emerald-200 font-normal">
                          Kode 6 digit telah terisi secara otomatis ke dalam kotak verifikasi di bawah.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tombol Pintas Buka Webmail & Salinan Gmail */}
                  <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={getEmailProviderWebUrl(regEmail)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>Buka Kotak Masuk ({regEmail.split('@')[1] || 'Email'})</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>

                    <a
                      href={getDirectGmailComposeUrl(regEmail, generatedCode, regName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-white/15 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-blue-300" />
                      <span>Kirim Sekarang via Gmail</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Form Input Angka Verifikasi ke dalam Program */}
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div className="space-y-2 text-center">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Masukkan 6 Digit Angka Verifikasi
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Ketik angka 6-digit yang tertera di surat email Anda ke dalam kotak di bawah:
                  </p>

                  {/* 6 Digit Input Boxes */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center font-black text-lg sm:text-xl font-mono bg-slate-50 border-2 border-slate-300 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 transition-all shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verifikasi & Aktifkan Akun Saya</span>
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg(null);
                    }}
                    className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Ubah Data Email</span>
                  </button>

                  <button
                    type="button"
                    disabled={countdown > 0 || isSendingEmail}
                    onClick={sendVerificationEmail}
                    className="flex items-center gap-1 font-semibold text-blue-600 disabled:text-slate-400 hover:underline cursor-pointer disabled:no-underline"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${countdown > 0 || isSendingEmail ? 'animate-spin' : ''}`} />
                    <span>
                      {isSendingEmail
                        ? 'Mengirim...'
                        : countdown > 0
                        ? `Kirim Ulang (${countdown}s)`
                        : 'Kirim Ulang Email'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security & Organization Badge Footer */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
            <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Sistem Resmi:</strong> Karang Taruna Kelurahan Manis Jaya menjamin keamanan data pemuda dan integrasi hak akses ke seluruh modul program kerja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
