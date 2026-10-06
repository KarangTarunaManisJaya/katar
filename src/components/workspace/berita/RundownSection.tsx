import React from 'react';
import { Plus, Trash2, Clock, User, Calendar, Award } from 'lucide-react';

export interface RundownItem {
  id: string;
  time: string;
  activity: string;
  pic: string;
}

export interface VipGuest {
  id: string;
  name: string;
  title: string;
  status: string;
}

interface RundownSectionProps {
  rundown: RundownItem[];
  onChangeRundown: (items: RundownItem[]) => void;
  vipGuests: VipGuest[];
  onChangeVipGuests: (guests: VipGuest[]) => void;
}

export const RundownSection: React.FC<RundownSectionProps> = ({
  rundown,
  onChangeRundown,
  vipGuests,
  onChangeVipGuests,
}) => {
  const addRundownRow = () => {
    const newItem: RundownItem = {
      id: `rd-${Date.now()}`,
      time: '08:00 - 09:00',
      activity: '',
      pic: 'Panitia Pelaksana',
    };
    onChangeRundown([...rundown, newItem]);
  };

  const updateRundown = (id: string, field: keyof RundownItem, value: string) => {
    onChangeRundown(
      rundown.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeRundown = (id: string) => {
    onChangeRundown(rundown.filter((item) => item.id !== id));
  };

  const addVipGuest = () => {
    const newGuest: VipGuest = {
      id: `vip-${Date.now()}`,
      name: '',
      title: 'Tamu Undangan',
      status: 'Hadir',
    };
    onChangeVipGuests([...vipGuests, newGuest]);
  };

  const updateVipGuest = (id: string, field: keyof VipGuest, value: string) => {
    onChangeVipGuests(
      vipGuests.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const removeVipGuest = (id: string) => {
    onChangeVipGuests(vipGuests.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* 1. Susunan Acara / Rundown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <label className="font-bold text-slate-800 text-xs">
              Susunan Acara / Rundown Kegiatan ({rundown.length} Sesi)
            </label>
          </div>
          <button
            type="button"
            onClick={addRundownRow}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[11px] font-bold transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Tambah Sesi Acara</span>
          </button>
        </div>

        {rundown.length === 0 ? (
          <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
            Belum ada rundown. Klik <strong>Tambah Sesi Acara</strong> untuk membuat jadwal acara terstruktur.
          </div>
        ) : (
          <div className="space-y-2">
            {rundown.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs"
              >
                <div className="col-span-3 sm:col-span-2 font-mono">
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => updateRundown(item.id, 'time', e.target.value)}
                    placeholder="08:00 - 08:30"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-900 font-medium focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-6 sm:col-span-6">
                  <input
                    type="text"
                    value={item.activity}
                    onChange={(e) => updateRundown(item.id, 'activity', e.target.value)}
                    placeholder={`Sesi ${index + 1}: Registrasi / Sambutan / Inti`}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <input
                    type="text"
                    value={item.pic}
                    onChange={(e) => updateRundown(item.id, 'pic', e.target.value)}
                    placeholder="PIC / Pengisi"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRundown(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Hapus sesi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Tamu Undangan VIP & Tokoh yang Hadir */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <label className="font-bold text-slate-800 text-xs">
              Tamu Undangan VIP & Tokoh yang Hadir ({vipGuests.length})
            </label>
          </div>
          <button
            type="button"
            onClick={addVipGuest}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[11px] font-bold transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Tambah Tokoh VIP</span>
          </button>
        </div>

        {vipGuests.length > 0 && (
          <div className="space-y-2">
            {vipGuests.map((g) => (
              <div
                key={g.id}
                className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs"
              >
                <div className="col-span-5 sm:col-span-5">
                  <input
                    type="text"
                    value={g.name}
                    onChange={(e) => updateVipGuest(g.id, 'name', e.target.value)}
                    placeholder="Nama Tokoh / Pejabat"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-4 sm:col-span-4">
                  <input
                    type="text"
                    value={g.title}
                    onChange={(e) => updateVipGuest(g.id, 'title', e.target.value)}
                    placeholder="Jabatan / Instansi"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <select
                    value={g.status}
                    onChange={(e) => updateVipGuest(g.id, 'status', e.target.value)}
                    className="w-full px-1.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Diwakilkan">Diwakilkan</option>
                    <option value="Menunggu">Menunggu</option>
                  </select>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeVipGuest(g.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
