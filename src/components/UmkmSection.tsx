import React, { useState } from 'react';
import { ShoppingBag, MessageCircle, Star, Plus, ExternalLink, ArrowRight } from 'lucide-react';
import { UmkmProduct } from '../types';
import { UmkmRegisterModal } from './UmkmRegisterModal';

interface UmkmSectionProps {
  products: UmkmProduct[];
  onAddProduct: (product: Omit<UmkmProduct, 'id'>) => void;
  onToast: (msg: string) => void;
}

export const UmkmSection: React.FC<UmkmSectionProps> = ({
  products,
  onAddProduct,
  onToast,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['Semua', 'Kuliner', 'Fashion & Merchandise', 'Jasa Kreatif', 'Agrobisnis'];

  const filtered = products.filter((p) => {
    if (selectedCat === 'Semua') return true;
    return p.category === selectedCat;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getWaLink = (item: UmkmProduct) => {
    const text = encodeURIComponent(
      `Halo Kak ${item.owner}, saya melihat produk "${item.name}" di Portal Karang Taruna Manis Jaya. Saya tertarik untuk memesan.`
    );
    const phone = item.whatsapp.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('0') ? `62${phone.slice(1)}` : phone;
    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  return (
    <section id="umkm" className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-2">
              Ekonomi Kreatif Warga
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
              Etalase UMKM & Karya Pemuda Manis Jaya
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
              Dukung perekonomian lokal dengan membeli produk dan menggunakan jasa pemuda kelurahan. 100% diproduksi oleh talenta muda Manis Jaya, Jatiuwung.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Daftarkan Usaha Pemuda
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit mb-8 overflow-x-auto max-w-full">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCat === c
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 overflow-hidden bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 text-xs font-semibold text-white bg-slate-950/70 backdrop-blur-sm px-2.5 py-1 rounded-md">
                    {item.category}
                  </div>
                  {item.rating && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold text-slate-900 bg-white/95 px-2 py-0.5 rounded-md shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="text-xs text-slate-500 mb-1">
                    {item.owner} · {item.rtRw}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-5 pt-0 mt-auto">
                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-xs text-slate-500 block">Harga</span>
                    <span className="text-base font-extrabold text-blue-700 tabular-nums">
                      {formatRupiah(item.price)}
                    </span>
                  </div>
                  {item.priceUnit && (
                    <span className="text-xs text-slate-500">
                      / {item.priceUnit}
                    </span>
                  )}
                </div>

                <a
                  href={getWaLink(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Pesan via WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <UmkmRegisterModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newProduct) => {
            onAddProduct(newProduct);
            onToast('Produk UMKM berhasil didaftarkan ke etalase!');
          }}
        />
      )}
    </section>
  );
};
