import React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Eye,
  Plus,
} from 'lucide-react';
import {
  AgendaItem,
  KATEGORI_COLORS,
  STATUS_COLORS,
} from '../../../data/agendaData';

interface AgendaCalendarViewProps {
  calendarMode: 'bulanan' | 'mingguan' | 'harian';
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  agendas: AgendaItem[];
  onSelectAgenda: (agenda: AgendaItem) => void;
  onAddOnDate: (dateStr: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const DAYS_NAME = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const AgendaCalendarView: React.FC<AgendaCalendarViewProps> = ({
  calendarMode,
  selectedDate,
  onSelectDate,
  agendas,
  onSelectAgenda,
  onAddOnDate,
  onPrev,
  onNext,
  onToday,
}) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Helper format YYYY-MM-DD
  const formatIsoDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const selectedIso = formatIsoDate(selectedDate);
  const todayIso = formatIsoDate(new Date());

  // Bulanan logic
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDayOfMonth.getDate();

  // Days array for monthly grid
  const monthCells: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];
  
  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    monthCells.push({ date: d, isCurrentMonth: false, dateStr: formatIsoDate(d) });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    monthCells.push({ date: dateObj, isCurrentMonth: true, dateStr: formatIsoDate(dateObj) });
  }

  // Next month leading days to fill 35 or 42 cells
  const remaining = (7 - (monthCells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const dateObj = new Date(year, month + 1, d);
    monthCells.push({ date: dateObj, isCurrentMonth: false, dateStr: formatIsoDate(dateObj) });
  }

  // Mingguan logic (7 days from Monday to Sunday of the selected week)
  const currentDayIndex = (selectedDate.getDay() + 6) % 7;
  const mondayOfWeek = new Date(selectedDate);
  mondayOfWeek.setDate(selectedDate.getDate() - currentDayIndex);

  const weekDays: { date: Date; dateStr: string; label: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayOfWeek);
    d.setDate(mondayOfWeek.getDate() + i);
    weekDays.push({
      date: d,
      dateStr: formatIsoDate(d),
      label: DAYS_NAME[i],
    });
  }

  // Helper to filter agendas on a given date
  const getAgendasForDate = (dateStr: string) => {
    return agendas.filter((item) => {
      if (item.tanggalMulai === dateStr) return true;
      if (item.tanggalSelesai && dateStr >= item.tanggalMulai && dateStr <= item.tanggalSelesai) {
        return true;
      }
      return false;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Calendar Header Navigation */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {calendarMode === 'bulanan' && `${MONTH_NAMES[month]} ${year}`}
              {calendarMode === 'mingguan' &&
                `Pekan ${weekDays[0].date.getDate()} ${MONTH_NAMES[weekDays[0].date.getMonth()]} - ${weekDays[6].date.getDate()} ${MONTH_NAMES[weekDays[6].date.getMonth()]} ${year}`}
              {calendarMode === 'harian' &&
                `${DAYS_NAME[(selectedDate.getDay() + 6) % 7]}, ${selectedDate.getDate()} ${MONTH_NAMES[month]} ${year}`}
            </h3>
            <p className="text-xs text-slate-500">
              {calendarMode === 'bulanan' && 'Melihat seluruh jadwal kegiatan pemuda dalam 1 bulan penuh.'}
              {calendarMode === 'mingguan' && 'Jadwal kegiatan per jam dan per hari dalam sepekan.'}
              {calendarMode === 'harian' && 'Rundown & agenda terperinci kegiatan sepanjang hari ini.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToday}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold shadow-xs"
          >
            Hari Ini
          </button>
          <div className="flex items-center rounded-lg border border-slate-300 bg-white shadow-xs">
            <button
              onClick={onPrev}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-l-lg transition-colors"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-200" />
            <button
              onClick={onNext}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-r-lg transition-colors"
              title="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. TAMPILAN BULANAN */}
      {calendarMode === 'bulanan' && (
        <div className="p-2 sm:p-4">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {DAYS_NAME.map((day, idx) => (
              <div
                key={day}
                className={`text-center py-2 text-xs font-bold ${
                  idx >= 5 ? 'text-rose-600' : 'text-slate-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {monthCells.map((cell, idx) => {
              const dayAgendas = getAgendasForDate(cell.dateStr);
              const isToday = cell.dateStr === todayIso;
              const isSelected = cell.dateStr === selectedIso;

              return (
                <div
                  key={idx}
                  onClick={() => onSelectDate(cell.date)}
                  className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                      : cell.isCurrentMonth
                      ? 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50'
                      : 'border-slate-100 bg-slate-50/40 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    {dayAgendas.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                        {dayAgendas.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[60px] sm:max-h-[70px] no-scrollbar">
                    {dayAgendas.slice(0, 2).map((ag) => {
                      const colors = KATEGORI_COLORS[ag.kategori] || KATEGORI_COLORS['Lainnya'];
                      return (
                        <div
                          key={ag.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAgenda(ag);
                          }}
                          className={`text-[10px] sm:text-[11px] p-1 rounded font-medium truncate flex items-center gap-1 hover:shadow-xs transition-shadow ${colors.bg}`}
                          title={`${ag.jamMulai} - ${ag.namaKegiatan} (${ag.lokasi})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
                          <span className="truncate">{ag.namaKegiatan}</span>
                        </div>
                      );
                    })}
                    {dayAgendas.length > 2 && (
                      <div className="text-[10px] text-blue-600 font-semibold px-1">
                        +{dayAgendas.length - 2} kegiatan lagi
                      </div>
                    )}
                  </div>

                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddOnDate(cell.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 transition-opacity"
                      title="Tambah agenda pada tanggal ini"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TAMPILAN MINGGUAN */}
      {calendarMode === 'mingguan' && (
        <div className="p-3 sm:p-5 overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[700px]">
            {weekDays.map((colDay) => {
              const dayAgendas = getAgendasForDate(colDay.dateStr);
              const isToday = colDay.dateStr === todayIso;
              const isSelected = colDay.dateStr === selectedIso;

              return (
                <div
                  key={colDay.dateStr}
                  className={`rounded-xl border p-2.5 flex flex-col min-h-[360px] ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/20'
                      : isToday
                      ? 'border-blue-300 bg-slate-50/70'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div
                    onClick={() => onSelectDate(colDay.date)}
                    className="cursor-pointer pb-2 border-b border-slate-100 mb-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase">
                        {colDay.label}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-sm font-black w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday ? 'bg-blue-600 text-white' : 'text-slate-800'
                          }`}
                        >
                          {colDay.date.getDate()}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {MONTH_NAMES[colDay.date.getMonth()].slice(0, 3)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddOnDate(colDay.dateStr);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      title="Tambah agenda"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Agenda list for this day */}
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {dayAgendas.length === 0 ? (
                      <div className="text-[11px] text-slate-400 text-center py-6">
                        Tidak ada agenda
                      </div>
                    ) : (
                      dayAgendas.map((ag) => {
                        const colors = KATEGORI_COLORS[ag.kategori] || KATEGORI_COLORS['Lainnya'];
                        const statusColor = STATUS_COLORS[ag.statusKegiatan];
                        return (
                          <div
                            key={ag.id}
                            onClick={() => onSelectAgenda(ag)}
                            className="p-2 rounded-lg border border-slate-200 hover:border-blue-400 bg-white shadow-xs hover:shadow-sm cursor-pointer transition-all space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${colors.bg}`}
                              >
                                {ag.kategori}
                              </span>
                              <span
                                className={`text-[9px] font-semibold px-1 rounded ${statusColor.badge}`}
                              >
                                {ag.statusKegiatan}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-900 line-clamp-2">
                              {ag.namaKegiatan}
                            </h5>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{ag.jamMulai} - {ag.jamSelesai}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{ag.lokasi}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TAMPILAN HARIAN */}
      {calendarMode === 'harian' && (
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left sidebar: Day summary & Add button */}
            <div className="w-full md:w-72 shrink-0 space-y-4">
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-center">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  {DAYS_NAME[(selectedDate.getDay() + 6) % 7]}
                </div>
                <div className="text-4xl font-black text-blue-950 my-1">
                  {selectedDate.getDate()}
                </div>
                <div className="text-xs font-semibold text-blue-800">
                  {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200/60 text-xs text-slate-600">
                  Total {getAgendasForDate(selectedIso).length} Agenda Terjadwal
                </div>
              </div>

              <button
                onClick={() => onAddOnDate(selectedIso)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Jadwalkan Agenda Hari Ini</span>
              </button>
            </div>

            {/* Right: Daily Timeline */}
            <div className="flex-1 space-y-3">
              {getAgendasForDate(selectedIso).length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">
                      Tidak Ada Agenda Pemuda Pada Tanggal Ini
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Jadwalkan kegiatan baru seperti rapat pleno, kerja bakti, turnamen, atau pelatihan kepemudaan.
                    </p>
                  </div>
                  <button
                    onClick={() => onAddOnDate(selectedIso)}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Jadwalkan Sekarang</span>
                  </button>
                </div>
              ) : (
                getAgendasForDate(selectedIso).map((item) => {
                  const colors = KATEGORI_COLORS[item.kategori] || KATEGORI_COLORS['Lainnya'];
                  const statusColor = STATUS_COLORS[item.statusKegiatan];
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-blue-400 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.bg}`}
                          >
                            {item.kategori}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor.badge}`}
                          >
                            {item.statusKegiatan}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.jenisKegiatan}
                          </span>
                        </div>

                        <button
                          onClick={() => onSelectAgenda(item)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Detail</span>
                        </button>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900">{item.namaKegiatan}</h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {item.deskripsiKegiatan}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>
                            {item.jamMulai} - {item.jamSelesai} WIB
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                          <span className="truncate">{item.lokasi}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>PJ: {item.penanggungJawab}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
