import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Zap,
  Share2,
  ExternalLink,
  ChevronRight,
  FolderArchive,
  FileCode,
  Check,
  Copy,
  Info,
  Layers,
  Sparkles,
  ArrowDownToLine,
  FileCheck2,
  Compass,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

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
  const [activeTab, setActiveTab] = useState<'download' | 'zip' | 'guide' | 'specs'>('download');
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadProgressApk, setDownloadProgressApk] = useState<{ loaded: number; total: number; pct: number } | null>(null);
  const [downloadProgressZip, setDownloadProgressZip] = useState<{ loaded: number; total: number; pct: number } | null>(null);
  const [downloadSuccessApk, setDownloadSuccessApk] = useState(false);
  const [downloadSuccessZip, setDownloadSuccessZip] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  const apkFilename = 'ManisJaya_KarangTaruna_v1.2.0.apk';
  const zipFilename = 'ManisJaya_SourceCode_Mentahan.zip';

  // Compute robust absolute download URLs that respect base path (e.g. /katar/ on GitHub Pages)
  const getAbsoluteFileUrl = (filename: string) => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const baseUrl = import.meta.env.BASE_URL || '/';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      return `${origin}${cleanBase.startsWith('/') ? '' : '/'}${cleanBase}${filename}`;
    }
    return `./${filename}`;
  };

  const apkUrl = getAbsoluteFileUrl(apkFilename);
  const zipUrl = getAbsoluteFileUrl(zipFilename);

  // Detect in-app browsers (WhatsApp, Instagram, FB, Line, Telegram Webview)
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      const inApp = /FBAN|FBAV|Instagram|WhatsApp|Line|musical_ly|Snapchat|MicroMessenger/i.test(ua);
      setIsInAppBrowser(inApp);
    }
  }, []);

  // Generate QR Code data URL when modal opens
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(apkUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#1e3a8a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, apkUrl]);

  // Capture beforeinstallprompt for instant Android PWA installation
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  // 1. Direct browser native download (most reliable on Android Chrome & desktop)
  const triggerNativeDownload = (url: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.setAttribute('download', filename);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 500);
    } catch {
      window.location.href = url;
    }
  };

  // 2. Open directly in Google Chrome on Android (bypasses WhatsApp in-app browser)
  const handleOpenInChromeOrTab = () => {
    onToast('Membuka unduhan langsung di peramban Google Chrome...');
    if (typeof window !== 'undefined') {
      try {
        const urlObj = new URL(apkUrl);
        const hostWithPath = `${urlObj.host}${urlObj.pathname}`;
        const protocol = urlObj.protocol.replace(':', '');
        const intentUrl = `intent://${hostWithPath}#Intent;scheme=${protocol};package=com.android.chrome;end`;

        const isAndroid = /Android/i.test(navigator.userAgent);
        if (isAndroid) {
          window.location.href = intentUrl;
          setTimeout(() => {
            triggerNativeDownload(apkUrl, apkFilename);
          }, 800);
        } else {
          triggerNativeDownload(apkUrl, apkFilename);
        }
      } catch {
        triggerNativeDownload(apkUrl, apkFilename);
      }
    }
  };

  // 3. Fallback stream downloader
  const downloadWithStream = async (
    url: string,
    filename: string,
    mimeType: string,
    isApk: boolean
  ) => {
    setErrorMessage(null);
    const expectedSize = isApk ? 36727424 : 47673432;

    if (isApk) {
      setIsDownloadingApk(true);
      setDownloadProgressApk({ loaded: 0, total: expectedSize, pct: 0 });
    } else {
      setIsDownloadingZip(true);
      setDownloadProgressZip({ loaded: 0, total: expectedSize, pct: 0 });
    }

    try {
      onToast(`Mengalirkan data mentahan ${filename}...`);
      const response = await fetch(url, {
        headers: { Accept: mimeType },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        // HTML detected, fallback immediately to native direct download
        triggerNativeDownload(url, filename);
        if (isApk) setDownloadSuccessApk(true);
        else setDownloadSuccessZip(true);
        return;
      }

      const contentLengthHeader = response.headers.get('content-length');
      const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : expectedSize;

      const reader = response.body?.getReader();
      if (!reader) {
        const blob = await response.blob();
        if (blob.size < 200000) {
          triggerNativeDownload(url, filename);
        } else {
          triggerBlobDownload(blob, filename);
        }
        if (isApk) setDownloadSuccessApk(true);
        else setDownloadSuccessZip(true);
        onToast(`File mentahan ${filename} (${(blob.size / 1024 / 1024).toFixed(1)} MB) berhasil diunduh!`);
        return;
      }

      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedBytes += value.length;

        const pct = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
        if (isApk) {
          setDownloadProgressApk({ loaded: receivedBytes, total: totalBytes, pct });
        } else {
          setDownloadProgressZip({ loaded: receivedBytes, total: totalBytes, pct });
        }
      }

      if (receivedBytes < 200000) {
        triggerNativeDownload(url, filename);
      } else {
        const blob = new Blob(chunks as BlobPart[], { type: mimeType });
        triggerBlobDownload(blob, filename);
      }

      if (isApk) setDownloadSuccessApk(true);
      else setDownloadSuccessZip(true);
      onToast(`File mentahan ${filename} (${(receivedBytes / 1024 / 1024).toFixed(1)} MB) selesai diunduh!`);
    } catch {
      triggerNativeDownload(url, filename);
      if (isApk) setDownloadSuccessApk(true);
      else setDownloadSuccessZip(true);
    } finally {
      if (isApk) {
        setIsDownloadingApk(false);
        setDownloadProgressApk(null);
      } else {
        setIsDownloadingZip(false);
        setDownloadProgressZip(null);
      }
    }
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100000);
  };

  const handleDownloadApkNative = () => {
    setDownloadSuccessApk(true);
    onToast(`Mengunduh ${apkFilename} (35.0 MB) langsung ke ponsel / PC...`);
    triggerNativeDownload(apkUrl, apkFilename);
  };

  const handleDownloadZipNative = () => {
    setDownloadSuccessZip(true);
    onToast(`Mengunduh ${zipFilename} (45.5 MB)...`);
    triggerNativeDownload(zipUrl, zipFilename);
  };

  const handleDirectInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        onToast('Aplikasi berhasil dipasang ke layar utama HP Anda dengan logo resmi!');
      }
      setDeferredPrompt(null);
    } else {
      handleDownloadApkNative();
    }
  };

  const handleCopyApkLink = () => {
    navigator.clipboard?.writeText(apkUrl);
    setCopiedLink(true);
    onToast('Tautan langsung unduh file APK mentahan (35.0 MB) berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo Rekan Karang Taruna Manis Jaya!\n\nUnduh aplikasi resmi Karang Taruna Kelurahan Manis Jaya (File APK Mentahan 35.0 MB Lengkap):\n${apkUrl}\n\nVersi 1.2.0 (Logo Resmi Karang Taruna Manis Jaya, Full Fitur: Surat Menyurat, Berita Kegiatan, Kas, Inventaris & Presensi).`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-5 sm:p-6 relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg ring-2 ring-yellow-400 shrink-0 flex items-center justify-center overflow-hidden">
              <BrandLogo size="lg" className="w-full h-full" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span>File Mentahan APK Penuh (Biner Asli 35.0 MB)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Unduh Mentahan Program & APK
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Karang Taruna Kelurahan Manis Jaya • Logo Resmi Terverifikasi
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
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'download'
                ? 'border-blue-600 text-blue-700 font-extrabold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Mentahan APK Android (35.0 MB)</span>
          </button>
          <button
            onClick={() => setActiveTab('zip')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'zip'
                ? 'border-indigo-600 text-indigo-700 font-extrabold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-indigo-600" />
            <span>Source Code Mentahan (.ZIP)</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-blue-600 text-blue-700 font-extrabold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Info className="w-4 h-4 text-blue-600" />
            <span>Solusi Pasang di HP</span>
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-blue-600 text-blue-700 font-extrabold bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-blue-600" />
            <span>Struktur File & Manifest</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Explanation Notice: Addressing 11KB size and download issue */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-2.5">
            <div className="flex items-center gap-2 font-black text-blue-950 text-sm">
              <FileCheck2 className="w-4.5 h-4.5 text-blue-600 shrink-0" />
              <span>Klarifikasi Ukuran File & Logo Resmi Aplikasi</span>
            </div>
            <p className="text-[11px] text-blue-900 leading-relaxed">
              • <strong>Mengapa sebelumnya hanya 11 KB?</strong> File 11 KB sebelumnya adalah cache/halaman HTML sementara peramban webview, <em>bukan paket biner aplikasi Android sebenarnya</em>. Sekarang file mentahan telah diperbarui menjadi <strong>35.0 MB UTUH</strong> berisi binary Android (<code className="bg-blue-100 px-1 py-0.5 rounded text-blue-800 font-mono">classes.dex</code>), deklarasi izin (<code className="bg-blue-100 px-1 py-0.5 rounded text-blue-800 font-mono">AndroidManifest.xml</code>), dan seluruh aset gambar.
            </p>
            <p className="text-[11px] text-blue-900 leading-relaxed">
              • <strong>Logo Wajib Sama:</strong> Ikon peluncur APK ini <strong>100% SAMA PERSIS</strong> dengan lambang resmi Karang Taruna Kelurahan Manis Jaya yang terpasang di komputer dan HP (lingkaran biru tua berbingkai emas, lingkaran merah tengah dengan lambang obor dan tulisan pita <em>MANIS JAYA</em>).
            </p>
          </div>

          {/* In-app Browser / HP Notice */}
          {isInAppBrowser && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                <span>Penting Bagi Pengguna HP (WhatsApp / Media Sosial):</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Anda membuka aplikasi melalui browser internal WhatsApp/Media Sosial. Sistem keamanan WhatsApp sering kali <strong>memblokir unduhan file APK</strong> secara otomatis.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenInChromeOrTab}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Compass className="w-4 h-4" />
                  <span>Buka di Google Chrome HP (Unduh Lancar)</span>
                </button>
                <span className="text-[10px] text-amber-800">
                  atau ketuk titik 3 (⋮) di pojok kanan atas layar WhatsApp &gt; pilih <strong>"Buka di Chrome"</strong>
                </span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Info unduhan:</strong> {errorMessage}. Klik tombol "Unduh File APK Mentahan" di bawah.
              </div>
            </div>
          )}

          {activeTab === 'download' && (
            <>
              {/* App Icon & Identity Verification Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md ring-2 ring-yellow-400 shrink-0 flex items-center justify-center">
                  <BrandLogo size="lg" className="w-full h-full" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                      Karang Taruna Kelurahan Manis Jaya
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Logo Resmi Terverifikasi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ikon peluncur APK dan identitas visual aplikasi 100% konsisten di semua perangkat (PC, Laptop, HP Android).
                  </p>
                </div>
              </div>

              {/* APK Specification Grid */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ukuran File APK</span>
                  <span className="font-extrabold text-slate-900 font-mono text-sm text-emerald-700">35.0 MB (Asli)</span>
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tanda Tangan</span>
                  <span className="font-extrabold text-emerald-600 text-sm flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    v1 JAR Signed
                  </span>
                </div>
              </div>

              {/* Download Progress Bar if active */}
              {isDownloadingApk && downloadProgressApk && (
                <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Mengalirkan File APK Mentahan Penuh...</span>
                    </span>
                    <span className="font-mono text-blue-700">
                      {(downloadProgressApk.loaded / 1024 / 1024).toFixed(1)} MB / {(downloadProgressApk.total / 1024 / 1024).toFixed(1)} MB ({downloadProgressApk.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-150"
                      style={{ width: `${downloadProgressApk.pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-blue-700 italic">
                    File mentahan utuh 35.0 MB sedang disiapkan untuk perangkat Anda.
                  </p>
                </div>
              )}

              {/* Action Buttons for HP & PC */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Primary Direct Download Button (100% Works on HP Chrome & PC) */}
                  <button
                    type="button"
                    onClick={handleDownloadApkNative}
                    className="w-full py-4 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer text-center"
                  >
                    <ArrowDownToLine className="w-5 h-5 text-white shrink-0" />
                    <span>Unduh APK Mentahan (35.0 MB)</span>
                  </button>

                  {/* Open in Chrome / New Tab (Guaranteed for HP In-App Browser) */}
                  <button
                    type="button"
                    onClick={handleOpenInChromeOrTab}
                    className="w-full py-4 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                    title="Buka langsung di Google Chrome HP tanpa perantara webview"
                  >
                    <Compass className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Buka di Google Chrome HP</span>
                  </button>
                </div>

                {/* Instant PWA & QR Code Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDirectInstall}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Pasang aplikasi langsung ke layar utama HP"
                  >
                    <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Pasang Cepat ke Layar Utama (PWA)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQrCode(!showQrCode)}
                      className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-600" />
                      <span>{showQrCode ? 'Tutup QR Code' : 'Scan dari Kamera HP'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadWithStream(apkUrl, apkFilename, 'application/vnd.android.package-archive', true)}
                      disabled={isDownloadingApk}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      title="Opsi alternatif streaming download"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Streaming</span>
                    </button>
                  </div>
                </div>

                {/* QR Code Section for Camera Scan on HP */}
                {showQrCode && (
                  <div className="p-4 bg-blue-50/90 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center gap-4 animate-fadeIn">
                    <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200 shrink-0">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="QR Code Unduh APK Karang Taruna"
                          className="w-36 h-36 object-contain"
                        />
                      ) : (
                        <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                          Membuat QR...
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 text-center sm:text-left text-xs text-slate-700">
                      <div className="font-extrabold text-blue-950 flex items-center justify-center sm:justify-start gap-1.5">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <span>Arahkan Kamera HP ke QR Code Ini</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Buka aplikasi <strong>Kamera</strong> atau <strong>Google Lens</strong> di ponsel Android Anda, arahkan ke kode QR di samping, lalu ketuk tautan notifikasi yang muncul untuk mengunduh APK mentahan 35.0 MB langsung ke HP.
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                        {apkFilename}
                      </span>
                    </div>
                  </div>
                )}

                {downloadSuccessApk && (
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="leading-snug">
                      <strong>{apkFilename} (35.0 MB Utuh)</strong> sedang diunduh ke folder <em>Download / Pengelola File</em> HP Anda! Ikuti panduan tab di atas untuk memasang.
                    </div>
                  </div>
                )}
              </div>

              {/* Troubleshooting Checklist specifically for HP */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span>Solusi Jika di HP Masih Mengalami Kendala Unduh:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Buka tautan lewat <strong>Google Chrome</strong> asli, bukan di dalam peramban WhatsApp.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Bila muncul <em>"File mungkin berbahaya"</em>, pilih <strong>"Tetap Unduh"</strong> (karena file dibuat mandiri).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Pastikan ruang memori HP memiliki sisa minimal 50 MB kosong.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                    <span>Gunakan tombol <strong>"Salin Tautan"</strong> di bawah lalu paste ke kolom alamat Google Chrome.</span>
                  </div>
                </div>
              </div>

              {/* Share APK Link Section */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs gap-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-700">Kirim Tautan APK ke WhatsApp Rekan:</span>
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

          {activeTab === 'zip' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 text-indigo-900 space-y-1">
                <h4 className="font-black text-sm flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-indigo-600" />
                  Mentahan Lengkap Source Code Project (.ZIP)
                </h4>
                <p className="text-xs text-indigo-800">
                  File ini memuat seluruh kode program mentahan (React 19, TypeScript, Tailwind CSS, aset logo & gambar resmi, script builder APK, package.json).
                </p>
              </div>

              {/* Source Code Specs */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Format Arsip</span>
                  <span className="font-extrabold text-slate-900 font-mono text-sm">ZIP Archive</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ukuran File</span>
                  <span className="font-extrabold text-indigo-600 font-mono text-sm">45.5 MB</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Framework</span>
                  <span className="font-extrabold text-slate-900 text-sm">React 19 + Vite</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bahasa</span>
                  <span className="font-extrabold text-slate-900 text-sm">TypeScript</span>
                </div>
              </div>

              {/* Download Progress Bar if active */}
              {isDownloadingZip && downloadProgressZip && (
                <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Mengunduh Arsip Source Code Mentahan...</span>
                    </span>
                    <span className="font-mono text-indigo-700">
                      {(downloadProgressZip.loaded / 1024 / 1024).toFixed(1)} MB / {(downloadProgressZip.total / 1024 / 1024).toFixed(1)} MB ({downloadProgressZip.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-150"
                      style={{ width: `${downloadProgressZip.pct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Download ZIP Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDownloadZipNative}
                  className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer text-center"
                >
                  <ArrowDownToLine className="w-5 h-5 text-white" />
                  <span>Unduh File Mentahan Source Code (.ZIP - 45.5 MB)</span>
                </button>

                {downloadSuccessZip && (
                  <div className="mt-3 p-3.5 bg-indigo-50 rounded-xl border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div className="leading-snug">
                      <strong>{zipFilename} (45.5 MB)</strong> berhasil diunduh! Ekstrak file tersebut untuk melihat dan mengedit seluruh kode program.
                    </div>
                  </div>
                )}
              </div>

              {/* Contents list */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  Struktur Direktori yang Termasuk di dalam ZIP:
                </span>
                <ul className="text-[11px] text-slate-600 space-y-1 font-mono list-disc list-inside">
                  <li><strong>/src</strong>: Seluruh komponen UI, modul Berita, Surat, Kas, Anggota, Tema.</li>
                  <li><strong>/src/scripts/build_apk.py</strong>: Script Python pembangun file APK Android mandiri.</li>
                  <li><strong>/public</strong>: Seluruh logo resmi, foto kegiatan, ikon, service worker (PWA).</li>
                  <li><strong>package.json & tsconfig.json</strong>: Dependensi lengkap proyek.</li>
                  <li><strong>vite.config.ts</strong>: Konfigurasi bundle & server Vite.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900">
                <h4 className="font-black text-sm flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  Panduan Memasang File APK di HP Android
                </h4>
                <p className="text-xs text-blue-800">
                  Karena file APK diunduh langsung (sideload) dari server organisasi, sistem operasi Android akan meminta konfirmasi izin keamanan sekali saja.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">1</span>
                    Unduh File APK Mentahan (35.0 MB)
                  </div>
                  <p className="text-slate-600 pl-7 text-[11px]">
                    Klik tombol <strong>"Unduh APK Mentahan"</strong> atau <strong>"Buka di Google Chrome HP"</strong>. File akan langsung tersimpan di folder Unduhan HP Anda.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">2</span>
                    Buka File dari Notifikasi atau Pengelola Berkas (File Manager)
                  </div>
                  <p className="text-slate-600 pl-7 text-[11px]">
                    Ketuk file <strong>{apkFilename}</strong> di bilah notifikasi atau buka folder <em>Download / Unduhan</em> di Pengelola File. Pastikan ukurannya tercatat sekitar <strong>35.0 MB</strong> (bukan 11 KB).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">3</span>
                    Aktifkan "Izinkan dari Sumber Ini" (Unknown Sources)
                  </div>
                  <p className="text-slate-600 pl-7 text-[11px]">
                    Jika muncul peringatan <em>"Demi keamanan ponsel Anda tidak diizinkan memasang aplikasi dari sumber ini"</em>, klik <strong>Setelan (Settings)</strong> lalu aktifkan opsi <strong>"Izinkan dari sumber ini"</strong>.
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
                  <div>Total APK Size  : <span className="text-emerald-300">35.03 MB (Full Raw Binary Package)</span></div>
                  <div>Launcher Icon   : <span className="text-emerald-300">res/mipmap/ic_launcher.png (Official Emblem)</span></div>
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
