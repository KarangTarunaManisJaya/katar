import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  Image as ImageIcon,
  Eye,
  Share2,
  Download,
  Printer,
  Sparkles,
  ChevronRight,
  LayoutGrid,
  List,
  Newspaper,
  Tag,
  Quote,
  CheckCircle2,
  Award,
  Video,
  Paperclip,
  Trash2,
} from 'lucide-react';
import { ActivityItem } from '../../data/workspaceData';

interface SemuaBeritaViewProps {
  activities: ActivityItem[];
  onSelectActivity: (activity: ActivityItem) => void;
  onAddNews: () => void;
  onToast: (msg: string) => void;
  onDeleteActivity?: (id: string) => void;
}

export const SemuaBeritaView: React.FC<SemuaBeritaViewProps> = ({
  activities,
  onSelectActivity,
  onAddNews,
  onToast,
  onDeleteActivity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<'terbaru' | 'terlama' | 'foto'>('terbaru');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'magazine'>('grid');

  // Categories list
  const categories = [
    'Semua',
    'Sosial',
    'Lingkungan',
    'Olahraga',
    'Keagamaan',
    'Pendidikan',
    'Kesenian & Budaya',
    'Dokumentasi',
  ];

  // Filtering and sorting logic
  const filteredActivities = useMemo(() => {
    let result = activities.filter((act) => {
      const matchSearch =
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.subtitle && act.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (act.tags && act.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchCategory =
        selectedCategory === 'Semua' ||
        (selectedCategory === 'Dokumentasi'
          ? act.badge === 'Dokumentasi' || act.type === 'Dokumentasi'
          : (act.category && act.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
            act.description.toLowerCase().includes(selectedCategory.toLowerCase()));

      return matchSearch && matchCategory;
    });

    if (sortBy === 'terlama') {
      result = [...result].reverse();
    } else if (sortBy === 'foto') {
      result = [...result].sort((a, b) => (b.photoCount || 0) - (a.photoCount || 0));
    }

    return result;
  }, [activities, searchQuery, selectedCategory, sortBy]);

  // Statistics
  const totalPhotos = activities.reduce((acc, curr) => acc + (curr.photoCount || (curr.photos ? curr.photos.length : 1)), 0);
  const featuredItem = activities.find((a) => a.isFeatured) || activities[0];

  const handleShare = (act: ActivityItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Warta Resmi Karang Taruna Manis Jaya: "${act.title}" - Lokasi: ${act.location}. Baca liputan lengkapnya di portal organisasi!`;
    navigator.clipboard?.writeText(text);
    onToast(`Tautan dan ringkasan "${act.title}" berhasil disalin!`);
  };

  const getBadgeStyle = (category?: string, badgeColor?: string) => {
    if (category === 'Sosial' || badgeColor === 'green') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (category === 'Olahraga' || badgeColor === 'orange') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (category === 'Lingkungan') return 'bg-teal-100 text-teal-800 border-teal-200';
    if (category === 'Keagamaan') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 text-slate-800">
      {/* 1. Header Banner & Stats */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Megaphone className="w-3.5 h-3.5 text-blue-300" />
              <span>Portal Warta Resmi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Semua Berita & Dokumentasi Kegiatan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Arsip publikasi rilis pers, liputan kegiatan lapangan, serta dokumentasi foto dan video resmi Karang Taruna Kelurahan Manis Jaya.
            </p>

            {/* Quick Stat Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                <span className="font-bold text-white font-mono">{activities.length}</span>
                <span className="text-slate-300 text-[11px]">Total Berita</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                <span className="font-bold text-emerald-400 font-mono">{totalPhotos}+</span>
                <span className="text-slate-300 text-[11px]">Foto Dokumentasi</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                <span className="font-bold text-amber-300 font-mono">RW 01 - RW 08</span>
                <span className="text-slate-300 text-[11px]">Cakupan Wilayah</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onAddNews}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/40 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Berita Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Search, Filter, Sort & View Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berita berdasarkan judul, tempat, penulis, atau kata kunci..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
                <option value="foto">Terbanyak Foto</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-slate-600">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
                title="Tampilan Grid Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
                title="Tampilan Daftar Rinci"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('magazine')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'magazine' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'hover:text-slate-900'
                }`}
                title="Tampilan Majalah Berita"
              >
                <Newspaper className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Empty State */}
      {filteredActivities.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Tidak Ada Berita Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada berita atau dokumentasi yang cocok dengan kata kunci "<strong>{searchQuery}</strong>" pada kategori {selectedCategory}.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* 4. MAGAZINE VIEW: Featured Top News + Sub News */}
      {viewMode === 'magazine' && filteredActivities.length > 0 && featuredItem && (
        <div className="space-y-6">
          {/* Main Featured Banner Article */}
          <div
            onClick={() => onSelectActivity(featuredItem)}
            className="group cursor-pointer bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="lg:col-span-7 h-64 sm:h-96 relative overflow-hidden bg-slate-100">
              {featuredItem.image ? (
                <img
                  src={featuredItem.image}
                  alt={featuredItem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-md">
                  BERITA UTAMA
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-xs">
                  {featuredItem.category || featuredItem.badge}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-blue-600">
                    <Calendar className="w-3.5 h-3.5" />
                    {featuredItem.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {featuredItem.location}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {featuredItem.title}
                </h2>

                {featuredItem.subtitle && (
                  <p className="text-xs font-semibold text-slate-500">
                    {featuredItem.subtitle}
                  </p>
                )}

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-4">
                  {featuredItem.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Oleh: <strong>{featuredItem.author}</strong>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Baca Selengkapnya</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. GRID VIEW (Modern Cards with full detail) */}
      {(viewMode === 'grid' || viewMode === 'magazine') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            return (
              <div
                key={act.id}
                onClick={() => onSelectActivity(act)}
                className="group cursor-pointer bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Image Cover */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {act.image ? (
                      <img
                        src={act.image}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50/50 text-blue-300">
                        <ImageIcon className="w-10 h-10 mb-1" />
                        <span className="text-[11px] font-bold text-blue-400">Dokumentasi Liputan</span>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${getBadgeStyle(act.category, act.badgeColor)}`}>
                        {act.category || act.badge}
                      </span>
                      {act.priority === 'Penting' && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white shadow-xs">
                          PENTING
                        </span>
                      )}
                    </div>

                    {/* Photo count pill */}
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                      <ImageIcon className="w-3 h-3" />
                      <span>{act.photoCount || (act.photos ? act.photos.length : 1)} Foto</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-blue-600">
                        <Calendar className="w-3.5 h-3.5" />
                        {act.date}
                      </span>
                      {act.time && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {act.time} WIB
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {act.title}
                    </h3>

                    {act.subtitle && (
                      <p className="text-[11px] font-medium text-slate-500 line-clamp-1 italic">
                        {act.subtitle}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {act.description}
                    </p>

                    {/* Metadata highlights (Location & PIC) */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{act.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">PIC: <strong>{act.author}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleShare(act, e)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                      title="Salin Tautan Berita"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteActivity && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Hapus warta "${act.title}"?`)) {
                            onDeleteActivity(act.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                        title="Hapus Berita"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>Detail Berita</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. LIST VIEW (Data-Dense Table-like rows) */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredActivities.map((act) => {
            return (
              <div
                key={act.id}
                onClick={() => onSelectActivity(act)}
                className="group cursor-pointer bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Mini image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {act.image ? (
                      <img src={act.image} alt={act.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(act.category, act.badgeColor)}`}>
                        {act.category || act.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{act.date}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {act.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {act.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {act.location}
                      </span>
                      <span>•</span>
                      <span>Penulis: <strong>{act.author}</strong></span>
                      <span>•</span>
                      <span>{act.photoCount || (act.photos ? act.photos.length : 1)} Foto</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => handleShare(act, e)}
                    className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50"
                    title="Bagikan"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1">
                    <span>Lihat Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
