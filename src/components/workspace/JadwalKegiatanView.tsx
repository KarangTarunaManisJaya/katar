import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  BarChart3,
  FileSpreadsheet,
  FileDown,
  Layers,
  Clock,
  MapPin,
  Users,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  AgendaItem,
  INITIAL_AGENDA_DATA,
  KategoriAgenda,
  KATEGORI_AGENDA_LIST,
  KATEGORI_COLORS,
  STATUS_COLORS,
} from '../../data/agendaData';
import { AgendaCalendarView } from './agenda/AgendaCalendarView';
import { AgendaDetailModal } from './agenda/AgendaDetailModal';
import { AgendaFormModal } from './agenda/AgendaFormModal';
import { AgendaStatsView } from './agenda/AgendaStatsView';

interface JadwalKegiatanViewProps {
  onToast: (msg: string) => void;
  onExploreOther?: () => void;
}

export const JadwalKegiatanView: React.FC<JadwalKegiatanViewProps> = ({ onToast }) => {
  // Persistence state
  const [agendas, setAgendas] = useState<AgendaItem[]>(() => {
    try {
      const saved = localStorage.getItem('kt_agendas_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AGENDA_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem('kt_agendas_v1', JSON.stringify(agendas));
    } catch (e) {
      console.error(e);
    }
  }, [agendas]);

  // View state
  const [mainView, setMainView] = useState<'kalender' | 'tabel' | 'statistik'>('kalender');
  const [calendarMode, setCalendarMode] = useState<'bulanan' | 'mingguan' | 'harian'>('bulanan');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');

  // Modals
  const [selectedAgendaForDetail, setSelectedAgendaForDetail] = useState<AgendaItem | null>(null);
  const [selectedAgendaForEdit, setSelectedAgendaForEdit] = useState<AgendaItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [defaultAddDate, setDefaultAddDate] = useState<string>('');

  // Calendar navigation
  const handlePrevDate = () => {
    const d = new Date(selectedDate);
    if (calendarMode === 'bulanan') {
      d.setMonth(d.getMonth() - 1);
    } else if (calendarMode === 'mingguan') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setSelectedDate(d);
  };

  const handleNextDate = () => {
    const d = new Date(selectedDate);
    if (calendarMode === 'bulanan') {
      d.setMonth(d.getMonth() + 1);
    } else if (calendarMode === 'mingguan') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setSelectedDate(d);
  };

  const handleTodayDate = () => {
    setSelectedDate(new Date());
  };

  // Add on specific date trigger
  const handleAddOnDate = (dateStr: string) => {
    setDefaultAddDate(dateStr);
    setSelectedAgendaForEdit(null);
    setShowAddModal(true);
  };

  // Save (Create or Update)
  const handleSaveAgenda = (item: AgendaItem) => {
    const exists = agendas.some((a) => a.id === item.id);
    if (exists) {
      setAgendas(agendas.map((a) => (a.id === item.id ? item : a)));
      if (selectedAgendaForDetail?.id === item.id) {
        setSelectedAgendaForDetail(item);
      }
    } else {
      setAgendas([item, ...agendas]);
    }
  };

  // Delete
  const handleDeleteAgenda = (id: string) => {
    setAgendas(agendas.filter((a) => a.id !== id));
    onToast('Agenda kegiatan berhasil dihapus.');
  };

  // Export to Excel / CSV simulation
  const handleExportSpreadsheet = () => {
    const headers = ['ID', 'Nama Kegiatan', 'Kategori', 'Tanggal Mulai', 'Jam', 'Lokasi', 'PJ', 'Status', 'Peserta'];
    const rows = filteredAgendas.map((a) => [
      a.id,
      `"${a.namaKegiatan}"`,
      `"${a.kategori}"`,
      a.tanggalMulai,
      `"${a.jamMulai} - ${a.jamSelesai}"`,
      `"${a.lokasi}"`,
      `"${a.penanggungJawab}"`,
      a.statusKegiatan,
      a.jumlahPeserta,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Jadwal_Agenda_Karang_Taruna_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onToast('Berhasil mengekspor rekapitulasi jadwal kegiatan ke berkas CSV / Excel!');
  };

  // Filtered Agendas
  const filteredAgendas = useMemo(() => {
    return agendas.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.namaKegiatan.toLowerCase().includes(q);
        const matchLoc = item.lokasi.toLowerCase().includes(q);
        const matchPic = item.penanggungJawab.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchPic) return false;
      }

      // Kategori
      if (selectedKategori !== 'semua' && item.kategori !== selectedKategori) {
        return false;
      }

      // Status
      if (selectedStatus !== 'semua' && item.statusKegiatan !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [agendas, searchQuery, selectedKategori, selectedStatus]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Banner Khusus Jadwal & Kalender Agenda Pemuda */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-bold tracking-wider uppercase text-blue-100 border border-white/20">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Jadwal & Kalender Terpadu</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Kalender & Agenda Pemuda Karang Taruna
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Pusat penjadwalan terpadu untuk rapat organisasi, turnamen olahraga, aksi lingkungan,
              pelatihan UMKM, kepanitiaan, hingga notifikasi pengingat H-30 sampai Hari-H.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setDefaultAddDate('');
                setSelectedAgendaForEdit(null);
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Jadwalkan Kegiatan</span>
            </button>

            <button
              onClick={handleExportSpreadsheet}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm flex items-center gap-2 text-white transition-all"
              title="Unduh Rekap Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top View Mode Switcher & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main View Buttons */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setMainView('kalender')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                mainView === 'kalender'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Kalender</span>
            </button>

            <button
              onClick={() => setMainView('tabel')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                mainView === 'tabel'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Daftar / Tabel Agenda ({filteredAgendas.length})</span>
            </button>

            <button
              onClick={() => setMainView('statistik')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                mainView === 'statistik'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistik & Rekap</span>
            </button>
          </div>

          {/* Subview Calendar Switcher (Bulanan / Mingguan / Harian) */}
          {mainView === 'kalender' && (
            <div className="flex items-center p-1 bg-blue-50/80 border border-blue-200/60 rounded-xl">
              <button
                onClick={() => setCalendarMode('bulanan')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  calendarMode === 'bulanan'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:text-blue-900'
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setCalendarMode('mingguan')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  calendarMode === 'mingguan'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:text-blue-900'
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setCalendarMode('harian')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  calendarMode === 'harian'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:text-blue-900'
                }`}
              >
                Harian
              </button>
            </div>
          )}
        </div>

        {/* Filter bar: Search, Category, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama agenda, lokasi, atau penanggung jawab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="semua">Semua Kategori Pemuda (14 Kategori)</option>
              {KATEGORI_AGENDA_LIST.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="semua">Semua Status Agenda</option>
              <option value="Direncanakan">Direncanakan</option>
              <option value="Sedang Berjalan">Sedang Berjalan</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditunda">Ditunda</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* RENDER ACTIVE MAIN VIEW */}
      {mainView === 'kalender' && (
        <AgendaCalendarView
          calendarMode={calendarMode}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
          agendas={filteredAgendas}
          onSelectAgenda={(ag) => setSelectedAgendaForDetail(ag)}
          onAddOnDate={handleAddOnDate}
          onPrev={handlePrevDate}
          onNext={handleNextDate}
          onToday={handleTodayDate}
        />
      )}

      {mainView === 'tabel' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Daftar Seluruh Agenda Kegiatan ({filteredAgendas.length})
              </h3>
              <p className="text-xs text-slate-500">
                Kelola jadwal, presensi peserta, anggaran, dan detail kepanitiaan.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedAgendaForEdit(null);
                setShowAddModal(true);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Agenda</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama & Kategori Agenda</th>
                  <th className="py-3 px-4">Waktu & Tanggal</th>
                  <th className="py-3 px-4">Lokasi & Alamat</th>
                  <th className="py-3 px-4">Penanggung Jawab</th>
                  <th className="py-3 px-4">Partisipasi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAgendas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      Tidak ditemukan agenda kegiatan yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredAgendas.map((item) => {
                    const colors = KATEGORI_COLORS[item.kategori] || KATEGORI_COLORS['Lainnya'];
                    const statusColor = STATUS_COLORS[item.statusKegiatan];
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{item.namaKegiatan}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.bg}`}>
                              {item.kategori}
                            </span>
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {item.jenisKegiatan}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{item.tanggalMulai}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.jamMulai} - {item.jamSelesai} WIB
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 truncate">{item.lokasi}</div>
                          <div className="text-[11px] text-slate-500 truncate">{item.alamatLokasi}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{item.penanggungJawab}</div>
                          <div className="text-[11px] text-slate-500 truncate">{item.bidangSeksi}</div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-800">{item.jumlahPesertaHadir}</span>
                          <span className="text-slate-400"> / {item.jumlahPeserta} Hadir</span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusColor.badge}`}>
                            {item.statusKegiatan}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedAgendaForDetail(item)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                              title="Lihat Rincian Kegiatan"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAgendaForEdit(item);
                                setShowAddModal(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                              title="Edit Agenda"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus agenda "${item.namaKegiatan}"?`)) {
                                  handleDeleteAgenda(item.id);
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainView === 'statistik' && <AgendaStatsView agendas={agendas} />}

      {/* DETAIL MODAL */}
      {selectedAgendaForDetail && (
        <AgendaDetailModal
          agenda={selectedAgendaForDetail}
          onClose={() => setSelectedAgendaForDetail(null)}
          onEdit={(ag) => {
            setSelectedAgendaForDetail(null);
            setSelectedAgendaForEdit(ag);
            setShowAddModal(true);
          }}
          onDelete={handleDeleteAgenda}
          onUpdateAgenda={handleSaveAgenda}
          onToast={onToast}
        />
      )}

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <AgendaFormModal
          initialData={selectedAgendaForEdit}
          defaultDate={defaultAddDate}
          onSave={handleSaveAgenda}
          onClose={() => setShowAddModal(false)}
          onToast={onToast}
        />
      )}
    </div>
  );
};
