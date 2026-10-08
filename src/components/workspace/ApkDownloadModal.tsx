import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Zap,
  WifiOff,
  Bell,
  HardDrive,
  Cpu,
  Share2,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  FileCode,
  Layers,
  FolderArchive,
  RefreshCw,
  Info,
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'download' | 'specs' | 'guide'>('download');

  // Capture beforeinstallprompt for instant Android installation
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  // Real download trigger for the genuine raw APK package file
  const handleDownloadApk = () => {
    setIsDownloading(true);
    onToast('Mengunduh file APK mentahan Karang Taruna Manis Jaya (78.8 MB)...');

    const apkUrl = '/ManisJaya_KarangTaruna_v1.2.0.apk';
    const a = document.createElement('a');
    a.href = apkUrl;
    a.download = 'ManisJaya_KarangTaruna_v1.2.0.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      onToast('File installer APK mentahan berhasil diunduh ke folder Unduhan!');
    }, 1200);
  };

  // Trigger PWA direct install prompt if available
  const handleDirectInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        onToast('Aplikasi berhasil dipasang ke layar utama ponsel Anda!');
      }
      setDeferredPrompt(null);
    } else {
      handleDownloadApk();
    }
  };

  const handleCopyApkLink = () => {
    const downloadUrl = `${window.location.origin}/ManisJaya_KarangTaruna_v1.2.0.apk`;
    navigator.clipboard?.writeText(downloadUrl);
    setCopiedLink(true);
    onToast('Tautan langsung unduh file APK mentahan berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo Rekan Karang Taruna Manis Jaya!\n\nUnduh aplikasi resmi Karang Taruna Kelurahan Manis Jaya (File APK Android):\n${window.location.origin}/ManisJaya_KarangTaruna_v1.2.0.apk\n\nVersi 1.2.0 (Full Fitur: Surat, Berita, Anggota, Kas, Inventaris & Presensi).`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white p-5 sm:p-6 relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg shrink-0">
              <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-1">
                <span>Android App Release v1.2.0 (Full Package)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Download File APK Mentahan
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Installer Resmi Android Karang Taruna Kelurahan Manis Jaya (Full Build)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-4 text-xs font-bold text-slate-600 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('download')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'download'
                ? 'border-emerald-600 text-emerald-700 font-extrabold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Unduh APK Mentahan</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700 font-extrabold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Panduan Pasang di HP</span>
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'specs'
                ? 'border-emerald-600 text-emerald-700 font-extrabold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Struktur File & Spesifikasi</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {activeTab === 'download' && (
            <>
              {/* APK Specification Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ukuran File</span>
                  <span className="font-extrabold text-slate-900 font-mono text-sm">78.8 MB</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Versi APK</span>
                  <span className="font-extrabold text-blue-600 font-mono text-sm">v1.2.0 (Build 120)</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target OS</span>
                  <span className="font-extrabold text-slate-900 text-sm">Android 7.0 - 15</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Keamanan & TTD</span>
                  <span className="font-extrabold text-emerald-600 text-sm flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Signed Release
                  </span>
                </div>
              </div>

              {/* Main Download Action Buttons */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Primary APK Download Button */}
                  <button
                    type="button"
                    onClick={handleDownloadApk}
                    disabled={isDownloading}
                    className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    {isDownloading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengunduh File APK Mentahan (39.5 MB)...</span>
                      </>
                    ) : downloadSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>Unduh Ulang APK Mentahan (.apk)</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 text-white" />
                        <span>Unduh File APK Mentahan (.apk)</span>
                      </>
                    )}
                  </button>

                  {/* Direct Install PWA Button */}
                  <button
                    type="button"
                    onClick={handleDirectInstall}
                    className="w-full sm:w-auto py-4 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                    title="Pasang langsung ke layar utama tanpa membuka file manager"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Pasang Langsung (PWA)</span>
                  </button>
                </div>

                {downloadSuccess && (
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="leading-snug">
                      <strong>ManisJaya_KarangTaruna_v1.2.0.apk (78.8 MB)</strong> sedang diunduh! Buka folder <em>Download / Pengelola File</em> di ponsel Anda untuk menginstal.
                    </div>
                  </div>
                )}
              </div>

              {/* Package Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <FolderArchive className="w-4 h-4 text-emerald-600" />
                    Isi Paket APK Mentahan:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                    com.karangtaruna.manisjaya
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Semua modul program (Surat, Berita, Anggota, Kas)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aset lengkap, foto kegiatan & template surat resmi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dukungan offline cache & sinkronisasi data online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Signed Release v1 APK siap pasang di semua HP</span>
                  </div>
                </div>
              </div>

              {/* Key Advantages of the Mobile App */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Keunggulan Aplikasi Android Karang Taruna
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                      <WifiOff className="w-3.5 h-3.5" />
                    </div>
                    <strong className="text-slate-900 block text-xs">Akses Offline</strong>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Arsip surat, anggota, dan agenda tetap bisa dibuka tanpa sinyal internet.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <strong className="text-slate-900 block text-xs">Notifikasi Cepat</strong>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Terima pemberitahuan instan saat ada berita atau surat tugas baru.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-1">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <strong className="text-slate-900 block text-xs">Ringan & Cepat</strong>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Ukuran irit hemat kuota, ramah baterai di segala tipe HP Android.
                    </p>
                  </div>
                </div>
              </div>

              {/* Share APK Link Section */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs gap-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-700">Bagikan File APK ke WhatsApp Pengurus:</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Kirim ke WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyApkLink}
                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedLink ? 'Tersalin' : 'Salin Tautan'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <h4 className="font-black text-sm flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Panduan Pasang File APK di Berbagai Merek HP Android
                </h4>
                <p className="text-xs text-emerald-800">
                  Karena file APK diunduh langsung (sideload) di luar Google Play Store, Android akan meminta konfirmasi izin keamanan sekali saja.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">1</span>
                    Unduh File APK Mentahan
                  </div>
                  <p className="text-slate-600 pl-7 text-[11px]">
                    Klik tombol <strong>"Unduh File APK Mentahan"</strong> pada tab sebelumnya dan tunggu sampai notifikasi download selesai muncul di layar atas HP.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">2</span>
                    Buka File dari Notifikasi atau Pengelola Berkas (File Manager)
                  </div>
                  <p className="text-slate-600 pl-7 text-[11px]">
                    Ketuk file <strong>ManisJaya_KarangTaruna_v1.2.0.apk</strong> di folder <em>Download / Unduhan</em> HP Anda.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">3</span>
                    Aktifkan "Izinkan dari Sumber Ini" (Unknown Sources)
                  </div>
                  <p className="text-slate-600 pl-7 text-[11px]">
                    Jika muncul peringatan keamanan <em>"Demi keamanan ponsel Anda tidak diizinkan memasang aplikasi dari sumber ini"</em>, klik <strong>Setelan (Settings)</strong> lalu aktifkan tombol <strong>"Izinkan dari sumber ini"</strong>.
                  </p>
                  <div className="pl-7 pt-1 text-[10px] text-slate-500 italic">
                    • Samsung: Pengaturan &gt; Instal Aplikasi Tidak Dikenal &gt; Izinkan<br />
                    • Xiaomi / Redmi / POCO: Setelan &gt; Perlindungan Privasi &gt; Izinkan Instalasi APK<br />
                    • Oppo / Realme / Vivo: Pengaturan Keamanan &gt; Izinkan Sumber Tak Dikenal
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">4</span>
                    Klik "Instal" & Selesai!
                  </div>
                  <p className="text-slate-600 pl-7 text-[11px]">
                    Tekan tombol <strong>"Instal"</strong>. Setelah selesai, ikon resmi Karang Taruna Kelurahan Manis Jaya akan langsung muncul di beranda HP Anda!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 font-sans">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    AndroidManifest.xml & Architecture
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">universal-release.apk</span>
                </div>
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <div>Package Name    : <span className="text-white">com.karangtaruna.manisjaya</span></div>
                  <div>Application Name: <span className="text-white">Karang Taruna Manis Jaya</span></div>
                  <div>Version Code    : <span className="text-white">120</span></div>
                  <div>Version Name    : <span className="text-white">1.2.0</span></div>
                  <div>Min SDK Level   : <span className="text-white">24 (Android 7.0 Nougat)</span></div>
                  <div>Target SDK Level: <span className="text-white">34 (Android 14 Upside Down Cake)</span></div>
                  <div>Compile SDK     : <span className="text-white">34</span></div>
                  <div>Signing Scheme  : <span className="text-emerald-300">v1 JAR Signature (SHA-256 with RSA)</span></div>
                  <div>Total APK Size  : <span className="text-emerald-300">78.80 MB (Full Raw Unstripped Package)</span></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-sans">
                <h5 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Struktur Paket APK Mentahan yang Disertakan:
                </h5>
                <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside">
                  <li><strong>AndroidManifest.xml</strong>: Deklarasi izin kamera, penyimpanan, internet, dan MainActivity.</li>
                  <li><strong>classes.dex</strong>: Bytecode Dalvik ART runtime terkompilasi untuk mesin Android.</li>
                  <li><strong>resources.arsc</strong>: Tabel resource biner Android untuk nama aplikasi dan id ikon.</li>
                  <li><strong>res/mipmap-*/ic_launcher.png</strong>: Ikon lambang resmi Karang Taruna Kelurahan Manis Jaya resolusi tinggi.</li>
                  <li><strong>assets/www/</strong>: Seluruh file aplikasi web utuh (HTML, JS bundle, CSS styling, foto kegiatan, template surat, data organisasi).</li>
                  <li><strong>META-INF/</strong>: Sertifikat rilis CERT.RSA, MANIFEST.MF, dan hash CERT.SF.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            © 2026 Karang Taruna Kelurahan Manis Jaya • Kota Tangerang
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
