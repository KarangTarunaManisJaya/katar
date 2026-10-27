import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Upload,
  RotateCcw,
  Eraser,
  Check,
  X,
  Sparkles,
  Users,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { getDatabaseMembers, saveMemberSignature } from '../../../utils/memberHelpers';
import { DetailedMember } from '../../../data/membersData';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
  title?: string;
  signatoryName?: string;
  signatoryRole?: string;
  initialSignatureUrl?: string;
  memberId?: string;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title = 'Tanda Tangan Digital Resmi',
  signatoryName = '',
  signatoryRole = '',
  initialSignatureUrl = '',
  memberId,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload' | 'saved'>('draw');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState('#0f172a'); // Hitam pekat resmi
  const [penWidth, setPenWidth] = useState<number>(2.5);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>(initialSignatureUrl || '');
  const [saveToDatabase, setSaveToDatabase] = useState(true);
  const [availableMembersWithSig, setAvailableMembersWithSig] = useState<DetailedMember[]>([]);

  // Load existing members who already have a signature
  useEffect(() => {
    if (isOpen) {
      const list = getDatabaseMembers();
      const withSig = list.filter((m) => Boolean(m.signatureUrl || (m as any).digitalSignatureUrl));
      setAvailableMembersWithSig(withSig);
      setPreviewUrl(initialSignatureUrl || '');
      setHasDrawn(Boolean(initialSignatureUrl));
    }
  }, [isOpen, initialSignatureUrl]);

  // Canvas setup
  useEffect(() => {
    if (isOpen && activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set display resolution vs internal canvas resolution for Retina crispness
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Clear transparent
        ctx.clearRect(0, 0, rect.width, rect.height);

        // If existing signature URL, draw it
        if (previewUrl && previewUrl.startsWith('data:image')) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 20, 20, rect.width - 40, rect.height - 40);
            setHasDrawn(true);
          };
          img.src = previewUrl;
        }
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Pointer event handlers for drawing
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history before drawing stroke
    const rect = canvas.getBoundingClientRect();
    try {
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setStrokeHistory((prev) => [...prev.slice(-10), snap]);
    } catch (err) {
      // ignore
    }

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    setIsDrawing(true);
    setHasDrawn(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
    // Update preview URL from canvas
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setPreviewUrl(dataUrl);
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width * 2, rect.height * 2);
    setHasDrawn(false);
    setStrokeHistory([]);
    setPreviewUrl('');
  };

  const handleUndo = () => {
    if (strokeHistory.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lastSnap = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(lastSnap, 0, 0);
    setStrokeHistory((prev) => prev.slice(0, -1));
    const dataUrl = canvas.toDataURL('image/png');
    setPreviewUrl(dataUrl);
  };

  // Upload image handler with automatic white-background removal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create an offscreen canvas to process the signature
        const offscreen = document.createElement('canvas');
        const maxDim = 600;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        offscreen.width = w;
        offscreen.height = h;
        const octx = offscreen.getContext('2d');
        if (!octx) return;

        octx.drawImage(img, 0, 0, w, h);
        const imgData = octx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Auto remove white/light gray background (make transparent)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If close to white
          if (r > 215 && g > 215 && b > 215) {
            data[i + 3] = 0; // Transparent
          } else if (r > 190 && g > 190 && b > 190) {
            // Soft anti-alias edge
            data[i + 3] = Math.max(0, 255 - (r + g + b) / 3);
          }
        }
        octx.putImageData(imgData, 0, 0);
        const cleanPng = offscreen.toDataURL('image/png');
        setPreviewUrl(cleanPng);
        setHasDrawn(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSavedSignature = (member: DetailedMember) => {
    const sig = member.signatureUrl || (member as any).digitalSignatureUrl;
    if (sig) {
      setPreviewUrl(sig);
      setHasDrawn(true);
    }
  };

  const handleSaveSignature = () => {
    let finalUrl = previewUrl;
    if (activeTab === 'draw' && canvasRef.current && hasDrawn) {
      finalUrl = canvasRef.current.toDataURL('image/png');
    }

    if (!finalUrl) {
      alert('Silakan buat goresan tanda tangan atau unggah gambar terlebih dahulu.');
      return;
    }

    // Save to database if requested
    if (saveToDatabase) {
      const identifier = memberId || signatoryName || signatoryRole;
      if (identifier) {
        saveMemberSignature(identifier, finalUrl);
      }
    }

    onSave(finalUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">{title}</h3>
              <p className="text-[11px] text-slate-500">
                {signatoryName
                  ? `Pejabat: ${signatoryName} ${signatoryRole ? `(${signatoryRole})` : ''}`
                  : 'Tanda tangan digital resmi Karang Taruna'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-100 flex items-center gap-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'draw'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Gores Langsung (Canvas)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah Berkas</span>
          </button>

          {availableMembersWithSig.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Dari Arsip ({availableMembersWithSig.length})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: CANVAS DRAWING */}
          {activeTab === 'draw' && (
            <div className="space-y-3">
              {/* Canvas toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Warna Tinta:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { color: '#0f172a', name: 'Hitam Dokumen' },
                      { color: '#1e3a8a', name: 'Biru Resmi' },
                      { color: '#047857', name: 'Hijau KT' },
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setPenColor(c.color)}
                        title={c.name}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          penColor === c.color ? 'scale-110 border-emerald-500 shadow-xs' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: c.color }}
                      />
                    ))}
                  </div>

                  <span className="text-slate-300 mx-1">|</span>

                  <span className="text-[11px] font-bold text-slate-500">Ketebalan:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { width: 1.5, label: 'Halus' },
                      { width: 2.5, label: 'Sedang' },
                      { width: 3.8, label: 'Tebal' },
                    ].map((w) => (
                      <button
                        key={w.width}
                        type="button"
                        onClick={() => setPenWidth(w.width)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          penWidth === w.width
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={strokeHistory.length === 0}
                    className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-lg hover:bg-slate-100 text-xs font-medium flex items-center gap-1 cursor-pointer"
                    title="Urungkan goresan terakhir"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Undo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCanvas}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Bersihkan area tanda tangan"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Bersihkan</span>
                  </button>
                </div>
              </div>

              {/* Pad Canvas */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-white overflow-hidden shadow-inner touch-none">
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="w-full h-56 cursor-crosshair block"
                />

                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400">
                    <PenTool className="w-8 h-8 mb-1.5 text-slate-300 animate-bounce" />
                    <p className="text-xs font-bold">Goreskan Tanda Tangan Anda di Sini</p>
                    <p className="text-[10px] text-slate-400">Gunakan jari di layar sentuh atau kursor mouse</p>
                  </div>
                )}

                {/* Bottom guide line */}
                <div className="absolute bottom-6 left-12 right-12 border-b border-slate-200 pointer-events-none" />
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD IMAGE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/70 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Pilih Berkas Foto / Scan Tanda Tangan</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mendukung PNG transparan, JPG, WebP. Latar belakang putih otomatis dibersihkan.
                  </p>
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Berkas Komputer / HP</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {previewUrl && (
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Pratinjau Hasil Bersih:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl('');
                        setHasDrawn(false);
                      }}
                      className="text-rose-600 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                  <div className="h-28 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-3 pattern-grid">
                    <img src={previewUrl} alt="Pratinjau TTD" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FROM SAVED ARCHIVE */}
          {activeTab === 'saved' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Pilih tanda tangan digital dari pejabat karang taruna yang sudah terdaftar di database:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto">
                {availableMembersWithSig.map((m) => {
                  const sig = m.signatureUrl || (m as any).digitalSignatureUrl;
                  const isSelected = previewUrl === sig;
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleSelectSavedSignature(m)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-800">{m.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-500 mb-2">{m.jabatan || 'Pengurus'}</span>
                      <div className="h-14 bg-slate-50 rounded border border-slate-150 flex items-center justify-center p-1">
                        <img src={sig} alt={m.name} className="max-h-full max-w-full object-contain" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sync Checkbox */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToDatabase}
                onChange={(e) => setSaveToDatabase(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs leading-snug">
                <span className="font-bold text-emerald-950 block">
                  Simpan Tanda Tangan ke Profil Database Anggota
                </span>
                <span className="text-[11px] text-emerald-800 block mt-0.5">
                  Tanda tangan digital ini akan otomatis muncul pada setiap surat keluar, proposal, dan laporan kegiatan resmi yang ditandatangani oleh pejabat bersangkutan.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveSignature}
            disabled={!hasDrawn && !previewUrl}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Gunakan Tanda Tangan Digital</span>
          </button>
        </div>
      </div>
    </div>
  );
};
