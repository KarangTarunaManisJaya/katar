import React, { useState } from 'react';
import { X, Plus, Calendar, MapPin, UploadCloud, CheckCircle } from 'lucide-react';
import { ActivityItem } from '../../data/workspaceData';

interface AddNewsModalProps {
  onClose: () => void;
  onAdd: (activity: ActivityItem) => void;
  onToast: (msg: string) => void;
}

export const AddNewsModal: React.FC<AddNewsModalProps> = ({
  onClose,
  onAdd,
  onToast,
}) => {
  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState<ActivityItem['badge']>('Kegiatan');
  const [badgeColor, setBadgeColor] = useState<ActivityItem['badgeColor']>('green');
  const [date, setDate] = useState('28 Sep 2026');
  const [location, setLocation] = useState('Kelurahan Manis Jaya');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('Iik Andriyana');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      badge,
      badgeColor,
      title,
      date,
      photoCount: 1,
      image: '/src/assets/images/manis_jaya_gate_1790588960710.jpg',
      description,
      location,
      author,
      photos: ['/src/assets/images/manis_jaya_gate_1790588960710.jpg'],
    };

    onAdd(newActivity);
    onToast(`Berita kegiatan "${title}" berhasil ditambahkan!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
              Publikasi Workspace
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Tambah Berita / Kegiatan Baru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dokumentasikan kegiatan Karang Taruna Manis Jaya ke portal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Kegiatan / Berita *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kerja Bakti Pembersihan Lingkungan RW 03"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Badge
              </label>
              <select
                value={badge}
                onChange={(e) => {
                  const val = e.target.value as ActivityItem['badge'];
                  setBadge(val);
                  setBadgeColor(val === 'Dokumentasi' ? 'orange' : 'green');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Kegiatan">Kegiatan</option>
                <option value="Dokumentasi">Dokumentasi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Pelaksanaan
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="28 Sep 2026"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi Kegiatan
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Balai RW 03 Manis Jaya"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Penulis / PIC
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Iik Andriyana"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Uraian & Ringkasan Berita *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan jalannya acara, peserta yang hadir, dan hasil yang dicapai..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          <div className="p-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 text-center">
            <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <span className="text-xs font-medium text-slate-600 block">
              Foto dokumentasi utama otomatis disematkan
            </span>
            <span className="text-[10px] text-slate-400">
              Format JPG, PNG hingga resolusi tinggi
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
            >
              Publikasikan Berita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
