import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Users,
} from 'lucide-react';
import { UserAccount } from '../../types/auth';
import { BrandLogo } from '../workspace/BrandLogo';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (user: UserAccount) => void;
  usersList: UserAccount[];
  onClose?: () => void;
  canDismiss?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLogin,
  usersList,
  onClose,
  canDismiss = false,
}) => {
  // Empty inputs so the user inputs username/NIK and password by themselves
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset fields to blank whenever the login modal is opened
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setErrorMsg(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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
      // 1. Match by username (case-insensitive)
      if (u.username && u.username.toLowerCase() === lowerInput) return true;
      // 2. Match by NIK (exact or pure digits match)
      if (u.nik) {
        const uNikDigits = u.nik.replace(/\D/g, '');
        if (cleanDigits.length >= 8 && uNikDigits === cleanDigits) return true;
        if (u.nik.toLowerCase() === lowerInput) return true;
      }
      // 3. Match by Nomor Anggota (e.g. KT-001)
      if (u.noAnggota && u.noAnggota.toLowerCase() === lowerInput) return true;
      // 4. Match by Email
      if (u.email && u.email.toLowerCase() === lowerInput) return true;
      return false;
    });

    if (!foundUser) {
      setErrorMsg('Akun atau NIK tidak terdaftar. Pastikan data sudah terdaftar di sistem pengurus Karang Taruna Manis Jaya.');
      return;
    }

    // Verify password (allowing clean trimmed comparison)
    if (foundUser.password !== password && foundUser.password !== password.trim()) {
      setErrorMsg('Kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
      return;
    }

    // Success login
    onLogin(foundUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Decorative Banner */}
        <div className="bg-gradient-to-r from-[#0d213a] via-[#153457] to-[#0f3d64] text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-4">
            <BrandLogo size="lg" />
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-blue-300" />
                Autentikasi Internal
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Login Karang Taruna
              </h2>
              <p className="text-xs text-slate-300 font-normal leading-relaxed">
                Kelurahan Manis Jaya · Masukkan akun dan kata sandi untuk masuk ke sistem.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold block">Gagal Masuk:</span>
                {errorMsg}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Masukkan username atau NIK anggota"
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
                  onClick={() => setErrorMsg('Silakan hubungi Administrator Iik Andriyana jika Anda lupa kata sandi.')}
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>Masuk ke Workspace Karang Taruna</span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
            <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Catatan Otorisasi:</strong> Hak akses menu dan aplikasi dibuka/ditutup secara otomatis sesuai wewenang akun yang ditetapkan oleh Pengurus.
            </p>
          </div>

          {canDismiss && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-medium pt-1"
            >
              Tutup Jendela Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
