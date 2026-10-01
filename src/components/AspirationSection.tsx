import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Aspiration } from '../types';

interface AspirationSectionProps {
  aspirations: Aspiration[];
  onAddAspiration: (asp: Omit<Aspiration, 'id' | 'votes' | 'status' | 'createdAt'>) => void;
  onVote: (id: string) => void;
  onToast: (msg: string) => void;
}

export const AspirationSection: React.FC<AspirationSectionProps> = ({
  aspirations,
  onAddAspiration,
  onVote,
  onToast,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('Semua');
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});

  // Form states
  const [author, setAuthor] = useState('');
  const [rtRw, setRtRw] = useState('');
  const [category, setCategory] = useState<Aspiration['category']>('Fasilitas & Olahraga');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const categories = [
    'Semua',
    'Fasilitas & Olahraga',
    'Kebersihan & Lingkungan',
    'Pelatihan Pemuda',
    'Keamanan Lingkungan',
  ];

  const filtered = aspirations.filter((a) => {
    if (selectedCat === 'Semua') return true;
    return a.category === selectedCat;
  });

  const handleVoteClick = (id: string) => {
    if (votedIds[id]) {
      onToast('Anda telah memberikan dukungan pada aspirasi ini.');
      return;
    }
    setVotedIds((prev) => ({ ...prev, [id]: true }));
    onVote(id);
    onToast('Dukungan Anda berhasil ditambahkan!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !rtRw.trim() || !title.trim() || !content.trim()) return;

    onAddAspiration({
      author,
      rtRw,
      category,
      title,
      content,
    });

    onToast('Aspirasi Anda berhasil diajukan dan sedang ditinjau pengurus!');
    setAuthor('');
    setRtRw('');
    setTitle('');
    setContent('');
  };

  const getStatusBadge = (status: Aspiration['status']) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <CheckCircle className="w-3.5 h-3.5" />
            Selesai Terealisasi
          </span>
        );
      case 'Dalam Realisasi':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
            <Clock className="w-3.5 h-3.5" />
            Dalam Proses Pengerjaan
          </span>
        );
      case 'Ditinjau Pengurus':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
            <AlertCircle className="w-3.5 h-3.5" />
            Sedang Ditinjau Rapat
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
            Menunggu Tanggapan
          </span>
        );
    }
  };

  return (
    <section id="aspirasi" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-2">
            Saluran Suara Pemuda & Warga
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Forum Aspirasi & Usulan Lingkungan
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Sampaikan usulan program, keluhan fasilitas umum, atau ide kreatif untuk memajukan kelurahan kita. Pengurus Karang Taruna akan menindaklanjuti pada rapat koordinasi mingguan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: List of Aspirations */}
          <div className="lg:col-span-7 space-y-6">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl w-fit overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    selectedCat === cat
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Aspirations Card List */}
            <div className="space-y-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-800">{item.author}</span>
                        <span>·</span>
                        <span>{item.rtRw}</span>
                        <span>·</span>
                        <span>{item.createdAt}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleVoteClick(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        votedIds[item.id]
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="tabular-nums">{item.votes} Dukungan</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mt-2 mb-4">
                    {item.content}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Bidang: {item.category}
                    </span>
                    <div>{getStatusBadge(item.status)}</div>
                  </div>

                  {/* Pengurus Official Response */}
                  {item.response && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-slate-700">
                      <span className="font-semibold text-blue-900 block mb-0.5">
                        Tanggapan Pengurus Karang Taruna:
                      </span>
                      {item.response}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Submit Aspiration Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
              <MessageSquare className="w-4 h-4" />
              Sampaikan Ide Baru
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Formulir Aspirasi Warga
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Usulan yang mendapatkan banyak dukungan akan diprioritaskan untuk diajukan ke Musrenbang Kelurahan.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Anda *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Contoh: Rian Maulana"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Asal Wilayah RT/RW *
                  </label>
                  <input
                    type="text"
                    required
                    value={rtRw}
                    onChange={(e) => setRtRw(e.target.value)}
                    placeholder="Contoh: RT 02 / RW 01"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Usulan
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Aspiration['category'])}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Fasilitas & Olahraga">Fasilitas & Olahraga</option>
                    <option value="Kebersihan & Lingkungan">Kebersihan & Lingkungan</option>
                    <option value="Pelatihan Pemuda">Pelatihan Pemuda</option>
                    <option value="Keamanan Lingkungan">Keamanan Lingkungan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Usulan / Aspirasi *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pengecatan Lapangan Bulutangkis RW 03"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uraian Detail Ide & Manfaat bagi Warga *
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ceritakan latar belakang, kondisi terkini, dan harapan solusi yang ditawarkan..."
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Kirim Aspirasi ke Pengurus
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
