import React, { useState } from 'react';
import { X, Store, CheckCircle } from 'lucide-react';
import { UmkmProduct } from '../types';

interface UmkmRegisterModalProps {
  onClose: () => void;
  onSuccess: (product: Omit<UmkmProduct, 'id'>) => void;
}

export const UmkmRegisterModal: React.FC<UmkmRegisterModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [rtRw, setRtRw] = useState('');
  const [category, setCategory] = useState<UmkmProduct['category']>('Kuliner');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('kemasan / porsi');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseInt(price.replace(/\D/g, ''), 10);
    if (!name.trim() || !owner.trim() || !whatsapp.trim() || isNaN(numPrice)) return;

    onSuccess({
      name,
      owner,
      rtRw,
      category,
      price: numPrice,
      priceUnit,
      description,
      whatsapp: whatsapp.replace(/\D/g, ''),
      image: '/src/assets/images/umkm_creative_youth_1790587923367.jpg',
      rating: 5.0,
    });

    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div>
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
              Etalase Usaha Pemuda
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Daftarkan Produk / Jasa Pemuda
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bebas biaya pendaftaran bagi seluruh pemuda warga Kelurahan Manis Jaya.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              Usaha Berhasil Didaftarkan!
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Produk <span className="font-semibold text-slate-900">{name}</span> milik <span className="font-semibold">{owner}</span> telah tampil di etalase direktori UMKM Karang Taruna dan dapat dipesan langsung oleh warga via WhatsApp.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Selesai & Lihat Etalase
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Produk atau Nama Usaha *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kripik Pisang Renyah Aneka Rasa"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Pemilik Usaha *
                </label>
                <input
                  type="text"
                  required
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Contoh: Andi Pratama"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Domisili RT / RW *
                </label>
                <input
                  type="text"
                  required
                  value={rtRw}
                  onChange={(e) => setRtRw(e.target.value)}
                  placeholder="Contoh: RT 02 / RW 03"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Usaha
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as UmkmProduct['category'])}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Kuliner">Kuliner</option>
                  <option value="Fashion & Merchandise">Fashion / Kaos</option>
                  <option value="Jasa Kreatif">Jasa Kreatif</option>
                  <option value="Kerajinan Tangan">Kerajinan</option>
                  <option value="Agrobisnis">Pertanian / Peternakan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harga Satuan (Rp) *
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="25000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Satuan Harga
                </label>
                <input
                  type="text"
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  placeholder="per bungkus"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor WhatsApp untuk Pemesanan *
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi Singkat Keunggulan Produk *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan bahan, varian rasa, atau fasilitas layanan yang Anda sediakan..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
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
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
              >
                Kirim Pendaftaran Produk
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
