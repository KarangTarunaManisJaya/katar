import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Database,
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  RotateCcw,
  Code,
  Check,
  Copy,
  Info,
  X,
  Server,
  Sparkles,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  getActiveFirebaseConfig,
  getDefaultFirebaseConfig,
  getCustomFirebaseConfig,
  isUsingCustomFirebase,
  testCustomFirebaseConfig,
  saveCustomFirebaseConfig,
  resetToDefaultFirebaseConfig,
  loginWithGoogle,
  logoutGoogle,
  getCurrentFirebaseUser,
  onFirebaseAuthChange,
  isQuotaExhausted,
  FirebaseConfig,
} from '../../services/firestoreSyncService';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'auth' | 'config'>('auth');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(getCurrentFirebaseUser());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Configuration Form State
  const defaultCfg = getDefaultFirebaseConfig();
  const currentActiveCfg = getActiveFirebaseConfig();
  const isCustom = isUsingCustomFirebase();

  const [projectId, setProjectId] = useState(currentActiveCfg.projectId || '');
  const [firestoreDatabaseId, setFirestoreDatabaseId] = useState(currentActiveCfg.firestoreDatabaseId || '(default)');
  const [apiKey, setApiKey] = useState(currentActiveCfg.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentActiveCfg.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(currentActiveCfg.storageBucket || '');
  const [appId, setAppId] = useState(currentActiveCfg.appId || '');

  // Snippet quick paste
  const [snippetInput, setSnippetInput] = useState('');
  const [showSnippetBox, setShowSnippetBox] = useState(false);

  // Connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Listen to Auth State
  useEffect(() => {
    const unsub = onFirebaseAuthChange((user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    onToast('Disalin ke clipboard!');
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const user = await loginWithGoogle();
      setFirebaseUser(user);
      onToast(`Berhasil masuk sebagai ${user.displayName || user.email}!`);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      onToast(`Gagal masuk Google: ${err.message || 'Jendela login ditutup.'}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutGoogle();
      setFirebaseUser(null);
      onToast('Berhasil keluar dari akun Google.');
    } catch (err: any) {
      onToast(`Gagal keluar: ${err.message}`);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleParseSnippet = () => {
    if (!snippetInput.trim()) {
      onToast('Silakan tempel kode konfigurasi firebaseConfig terlebih dahulu.');
      return;
    }

    try {
      // Extract properties using regex or JSON parser
      const extractVal = (key: string): string => {
        const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"\`]([^'"\`]+)['"\`]`, 'i');
        const match = snippetInput.match(regex);
        return match ? match[1].trim() : '';
      };

      const extractedApiKey = extractVal('apiKey');
      const extractedProjectId = extractVal('projectId');
      const extractedAuthDomain = extractVal('authDomain');
      const extractedStorageBucket = extractVal('storageBucket');
      const extractedAppId = extractVal('appId');
      const extractedDbId = extractVal('firestoreDatabaseId');

      if (extractedProjectId || extractedApiKey) {
        if (extractedApiKey) setApiKey(extractedApiKey);
        if (extractedProjectId) setProjectId(extractedProjectId);
        if (extractedAuthDomain) setAuthDomain(extractedAuthDomain);
        if (extractedStorageBucket) setStorageBucket(extractedStorageBucket);
        if (extractedAppId) setAppId(extractedAppId);
        if (extractedDbId) setFirestoreDatabaseId(extractedDbId);
        setShowSnippetBox(false);
        setSnippetInput('');
        setTestResult(null);
        onToast('Konfigurasi berhasil diekstrak dan dimasukkan ke formulir!');
      } else {
        onToast('Format tidak dikenali. Pastikan Anda menempelkan kode firebaseConfig dari Firebase Console.');
      }
    } catch (e: any) {
      onToast('Gagal memproses kode konfigurasi.');
    }
  };

  const handleTestConnection = async () => {
    if (!projectId.trim() || !apiKey.trim()) {
      onToast('Project ID dan API Key tidak boleh kosong.');
      return;
    }

    try {
      setIsTesting(true);
      setTestResult(null);
      const res = await testCustomFirebaseConfig({
        projectId: projectId.trim(),
        apiKey: apiKey.trim(),
        authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
        storageBucket: storageBucket.trim(),
        appId: appId.trim(),
        firestoreDatabaseId: firestoreDatabaseId.trim(),
      });
      setTestResult(res);
      if (res.success) {
        onToast('Uji koneksi ke Firebase berhasil!');
      } else {
        onToast('Koneksi gagal. Periksa kembali API Key dan Project ID.');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Terjadi kesalahan saat uji koneksi: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndApply = () => {
    if (!projectId.trim() || !apiKey.trim()) {
      onToast('Project ID dan API Key wajib diisi.');
      return;
    }

    const newConfig: FirebaseConfig = {
      projectId: projectId.trim(),
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      firestoreDatabaseId: firestoreDatabaseId.trim() || '(default)',
      storageBucket: storageBucket.trim(),
      appId: appId.trim(),
    };

    saveCustomFirebaseConfig(newConfig);
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan ke Database Resmi Sistem bawaan AI Studio? Aplikasi akan dimuat ulang.')) {
      resetToDefaultFirebaseConfig();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-5 sm:p-6 text-white relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
                <Cloud className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Kelola Akun & Database Firebase
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    firebase.google.com
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Masuk ke akun Google Anda atau ganti/rubah database resmi ke proyek Firebase Anda sendiri
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick link shortcuts to official firebase.google.com */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-bold">Akses Resmi:</span>
            <a
              href="https://firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition-colors"
            >
              <span>firebase.google.com</span>
              <ExternalLink className="w-3 h-3 text-amber-300" />
            </a>
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 font-bold text-[11px] transition-colors"
            >
              <span>Buka Firebase Console</span>
              <ExternalLink className="w-3 h-3 text-amber-300" />
            </a>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('auth')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'auth'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>1. Masuk Akun Google / Firebase</span>
            {firebaseUser && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>2. Ganti / Ubah Database Firebase</span>
            {isCustom && (
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] rounded-full font-black">
                Kustom
              </span>
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs sm:text-sm">
          {/* Quota limit advisory if default shared database reaches daily limits */}
          {!isCustom && isQuotaExhausted() && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-950">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-black text-amber-900">
                  Batas Kuota Database Bawaan Tercapai (Resource Exhausted)
                </p>
                <p className="leading-relaxed text-amber-800">
                  Database bawaan bersama telah mencapai batas kuota server Google Cloud. <strong>Data Anda saat ini tetap 100% aman, tersimpan di penyimpanan offline browser, dan tidak ada data yang hilang.</strong>
                </p>
                <p className="leading-relaxed text-amber-900 font-semibold pt-1">
                  💡 Pindah ke tab <strong>"2. Ganti / Ubah Database Firebase"</strong> untuk menghubungkan project Firebase milik akun Google Anda sendiri di <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">firebase.google.com</code> dengan kuota baru yang sepenuhnya milik Anda!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'auth' ? (
            <div className="space-y-5">
              {/* Account Status Card */}
              {firebaseUser ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {firebaseUser.photoURL ? (
                        <img
                          src={firebaseUser.photoURL}
                          alt="Google Avatar"
                          className="w-12 h-12 rounded-full border-2 border-emerald-500 shadow-xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-base shadow-xs">
                          {firebaseUser.displayName?.charAt(0) || 'G'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm sm:text-base">
                            {firebaseUser.displayName || 'Pengguna Akun Google'}
                          </h4>
                          <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-black flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            Terautentikasi di Firebase
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          {firebaseUser.email}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          UID: <code className="font-mono bg-white/70 px-1 py-0.2 rounded border border-emerald-200">{firebaseUser.uid}</code>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleGoogleLogout}
                      disabled={isLoggingOut}
                      className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      title="Keluar dari akun Google"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isLoggingOut ? 'Keluar...' : 'Keluar Akun'}</span>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-emerald-200/70 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="leading-relaxed">
                      Akun Google Anda aktif dan terhubung. Anda sekarang dapat mengelola database di Firebase Console atau menggunakan database proyek kustom Anda.
                    </p>
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shrink-0 flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <span>Buka Console Proyek</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
                    <UserIcon className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="font-black text-slate-900 text-base">
                      Masuk ke Akun Google Firebase Terlebih Dahulu
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sesuai permintaan Anda, silakan login dengan akun Google terlebih dahulu ke server resmi <strong>firebase.google.com</strong> untuk memverifikasi akun dan memungkinkan pergantian database.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isLoggingIn}
                      className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoggingIn ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      )}
                      <span>{isLoggingIn ? 'Menghubungkan ke Google...' : 'Masuk dengan Akun Google'}</span>
                    </button>

                    <a
                      href="https://firebase.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                    >
                      <span>Buka https://firebase.google.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Instructions on switching/replacing database */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Apakah Anda ingin mengganti / merubah ke database project Firebase Anda sendiri?</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Setelah masuk atau membuka akun di <strong>firebase.google.com</strong>, Anda dapat berpindah ke tab <strong>"2. Ganti / Ubah Database Firebase"</strong> di atas. Di sana Anda dapat memasukkan Project ID dan API Key project Firebase milik Anda sendiri agar seluruh data tersimpan langsung di akun pribadi Anda!
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => setActiveTab('config')}
                    className="text-xs font-black text-amber-900 hover:underline flex items-center gap-1"
                  >
                    <span>Lanjut ke Formulir Ganti Database Firebase</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Database Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                isCustom
                  ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCustom ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-xs sm:text-sm">
                        {isCustom ? 'Menggunakan Proyek Firebase Kustom Anda' : 'Menggunakan Database Resmi Bawaan Sistem'}
                      </p>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-slate-300">
                        {isCustom ? 'Kustom' : 'Default'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Project ID: <strong className="font-mono text-slate-800">{currentActiveCfg.projectId}</strong>
                      {currentActiveCfg.firestoreDatabaseId && currentActiveCfg.firestoreDatabaseId !== '(default)' && (
                        <span> | DB: <strong className="font-mono text-slate-800">{currentActiveCfg.firestoreDatabaseId}</strong></span>
                      )}
                    </p>
                  </div>
                </div>

                {isCustom && (
                  <button
                    onClick={handleResetToDefault}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Kembali ke database resmi default bawaan"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Reset ke Default</span>
                  </button>
                )}
              </div>

              {/* Quick Paste Snippet Toggle */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      Punya kode konfigurasi dari Firebase Console?
                    </span>
                  </div>
                  <button
                    onClick={() => setShowSnippetBox(!showSnippetBox)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                  >
                    {showSnippetBox ? 'Tutup Tempel Cepat' : 'Tempel Kode (Quick Paste)'}
                  </button>
                </div>

                {showSnippetBox && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[11px] text-slate-500">
                      Buka <code className="bg-white px-1 py-0.5 rounded border border-slate-200">https://console.firebase.google.com</code> &gt; Project Settings &gt; General &gt; Web Apps, lalu salin kode <code className="text-emerald-700 font-bold">firebaseConfig = &#123; ... &#125;</code> dan tempelkan di bawah:
                    </p>
                    <textarea
                      value={snippetInput}
                      onChange={(e) => setSnippetInput(e.target.value)}
                      placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "my-project.firebaseapp.com",\n  projectId: "my-project",\n  storageBucket: "my-project.firebasestorage.app",\n  messagingSenderId: "...",\n  appId: "..."\n};`}
                      className="w-full h-28 p-3 font-mono text-[11px] bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleParseSnippet}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ekstrak & Isi ke Formulir</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Form Fields */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-slate-500" />
                  <span>Kredensial Database Firebase Anda (firebase.google.com)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Firebase Project ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="contoh: katar-manisjaya-2026"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Firestore Database ID
                    </label>
                    <input
                      type="text"
                      value={firestoreDatabaseId}
                      onChange={(e) => setFirestoreDatabaseId(e.target.value)}
                      placeholder="(default) atau ID database khusus"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Gunakan <code className="font-bold text-slate-600">(default)</code> untuk database standar Firestore
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      API Key (Web API Key) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="contoh: AIzaSy..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Auth Domain
                    </label>
                    <input
                      type="text"
                      value={authDomain}
                      onChange={(e) => setAuthDomain(e.target.value)}
                      placeholder="contoh: my-project.firebaseapp.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Storage Bucket (Opsional)
                    </label>
                    <input
                      type="text"
                      value={storageBucket}
                      onChange={(e) => setStorageBucket(e.target.value)}
                      placeholder="contoh: my-project.firebasestorage.app"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      App ID (Web Client App ID)
                    </label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="contoh: 1:123456789:web:abcdef"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Test Result Message Box */}
              {testResult && (
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">{testResult.success ? 'Koneksi Berhasil' : 'Uji Koneksi Gagal'}</p>
                    <p>{testResult.message}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons: Test Connection & Save */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || !projectId.trim() || !apiKey.trim()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  title="Uji koneksi sebelum menerapkan"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-600' : 'text-slate-600'}`} />
                  <span>{isTesting ? 'Menguji Koneksi...' : 'Uji Koneksi Database'}</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSaveAndApply}
                    disabled={!projectId.trim() || !apiKey.trim()}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan & Terapkan Database Ini</span>
                  </button>
                </div>
              </div>

              {/* Step-by-step Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <h5 className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Panduan Menghubungkan Akun & Database dari firebase.google.com:</span>
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1 leading-relaxed">
                  <li>
                    Buka situs resmi <strong><a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://firebase.google.com</a></strong> dan login dengan akun Google Anda.
                  </li>
                  <li>
                    Klik <strong>Go to console</strong> di kanan atas, lalu klik <strong>Add project</strong> (buat proyek baru atau pilih yang sudah ada).
                  </li>
                  <li>
                    Di sidebar menu, klik <strong>Build &gt; Firestore Database</strong> lalu klik <strong>Create database</strong> (pilih lokasi terdekat seperti <code className="bg-white px-1 py-0.2 rounded border">asia-southeast1 / asia-southeast2</code>).
                  </li>
                  <li>
                    Buka <strong>Project Settings</strong> (ikon gerigi di samping 'Project Overview') &gt; scroll ke bawah ke bagian <strong>Your apps</strong> &gt; buat Web App (<code className="font-mono">&lt;/&gt;</code>).
                  </li>
                  <li>
                    Salin teks konfigurasi <code className="bg-white px-1 py-0.2 rounded border font-mono">firebaseConfig</code> dan tempel di formulir atau di tombol <strong>Tempel Kode</strong> di atas.
                  </li>
                  <li>
                    Pastikan Security Rules di tab <strong>Firestore Database &gt; Rules</strong> disetel mengizinkan akses: <code className="bg-white px-1 py-0.2 rounded border font-mono text-[10px]">allow read, write: if true;</code> atau sesuai kebutuhan Anda.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kredensial disimpan aman secara lokal di peramban Anda.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
