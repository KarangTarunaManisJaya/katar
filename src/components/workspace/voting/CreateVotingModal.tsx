import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Vote,
  Crown,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  Info,
  UserCheck,
} from 'lucide-react';
import { VotingItem, VotingCategory } from '../../../types/voting';
import { INITIAL_MEMBERS } from '../../../data/membersData';
import { UserAccount } from '../../../types/auth';
import { resolveAssetUrl } from '../../../utils/assetUrl';

interface CreateVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (voting: VotingItem) => void;
  currentUser: UserAccount;
}

export const CreateVotingModal: React.FC<CreateVotingModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VotingCategory>('ketua_kegiatan');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });
  const [targetVoters, setTargetVoters] = useState(34);
  const [quorumPercentage, setQuorumPercentage] = useState(50);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ambil daftar anggota lengkap dari database / localStorage 'kt_members_v3' dengan fallback
  const availableMembers = useMemo(() => {
    try {
      const saved = localStorage.getItem('kt_members_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_MEMBERS;
  }, []);

  // Dynamic Options / Candidates (Dikosongkan secara default agar user dapat menambah manual atau memilih dari anggota)
  const [options, setOptions] = useState<
    Array<{
      id: string;
      title: string;
      subtitle: string;
      avatar?: string;
    }>
  >([
    {
      id: 'opt-new-1',
      title: '',
      subtitle: '',
    },
    {
      id: 'opt-new-2',
      title: '',
      subtitle: '',
    },
  ]);

  if (!isOpen) return null;

  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        id: `opt-new-${Date.now()}`,
        title: '',
        subtitle: '',
      },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (
    index: number,
    field: 'title' | 'subtitle' | 'avatar',
    val: string
  ) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: val };
    setOptions(updated);
  };

  const handleSelectMemberAsOption = (index: number, memberId: string) => {
    const member = availableMembers.find((m: any) => m.id === memberId);
    if (!member) return;
    const updated = [...options];
    updated[index] = {
      ...updated[index],
      title: member.name,
      subtitle: `${member.jabatan || 'Anggota'} - ${member.divisi || member.rw || 'Karang Taruna'}`,
      avatar: member.avatar ? resolveAssetUrl(member.avatar) : undefined,
    };
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validOptions = options.filter((o) => o.title.trim().length > 0);
    if (validOptions.length < 2) {
      setErrorMessage('Mohon masukkan minimal 2 pilihan/kandidat yang valid.');
      return;
    }
    setErrorMessage(null);

    const newVoting: VotingItem = {
      id: `vote-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim() || 'Pemungutan suara resmi anggota Karang Taruna Kelurahan Manis Jaya.',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(endDate).toISOString(),
      targetVoters: Number(targetVoters) || 34,
      quorumPercentage: Number(quorumPercentage) || 50,
      totalVotes: 0,
      voterHistory: [],
      createdBy: `${currentUser.name} (${currentUser.role || 'Pengurus'})`,
      createdAt: new Date().toISOString(),
      options: validOptions.map((opt, i) => ({
        id: `opt-${Date.now()}-${i}`,
        title: opt.title.trim(),
        subtitle: opt.subtitle.trim(),
        avatar: opt.avatar,
        votesCount: 0,
        voterIds: [],
      })),
    };

    onCreate(newVoting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Vote className="w-6 h-6 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 text-[10px] font-extrabold uppercase tracking-wider">
                  Demokrasi Digital
                </span>
                <span className="text-white/60 text-xs">• Real-Time</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Buat Sesi Pemungutan Suara / Voting
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Judul & Kategori */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Pemilihan / Pengambilan Keputusan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pemilihan Ketua Pelaksana Bulan Bakti Gotong Royong 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kategori Pemungutan Suara
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VotingCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                >
                  <option value="ketua_kegiatan">👑 Pemilihan Ketua Kegiatan / Panitia</option>
                  <option value="musyawarah">🗳 Musyawarah & Pengambilan Keputusan</option>
                  <option value="jadwal_lokasi">📍 Penentuan Jadwal & Lokasi Kegiatan</option>
                  <option value="anggaran">💰 Persetujuan Anggaran & Kas Organisasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Batas Akhir Voting (Deadline)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Deskripsi / Penjelasan Singkat
              </label>
              <textarea
                rows={2}
                placeholder="Jelaskan tujuan pemungutan suara, konteks kegiatan, dan kriteria pengambilan keputusan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Target Jumlah Pemilih
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={2}
                    max={200}
                    value={targetVoters}
                    onChange={(e) => setTargetVoters(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                  />
                  <span className="text-[11px] text-slate-500 font-semibold shrink-0">Anggota</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Batas Kuorum Sah
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={quorumPercentage}
                    onChange={(e) => setQuorumPercentage(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                  />
                  <span className="text-[11px] text-slate-500 font-semibold shrink-0">% Suara</span>
                </div>
              </div>
            </div>
          </div>

          {/* Opsi & Calon Kandidat */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Daftar Pilihan / Calon Kandidat ({options.length})</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {category === 'ketua_kegiatan'
                    ? 'Pilih langsung dari anggota Karang Taruna atau ketik nama calon.'
                    : 'Ketik nama pilihan atau opsi keputusan yang ditawarkan.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Opsi</span>
              </button>
            </div>

            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700 flex-1 truncate">
                      {opt.title ? opt.title : `Opsi / Kandidat #${idx + 1}`}
                    </span>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value === '__EMPTY__') {
                          const updated = [...options];
                          updated[idx] = { ...updated[idx], title: '', subtitle: '', avatar: undefined };
                          setOptions(updated);
                        } else if (e.target.value) {
                          handleSelectMemberAsOption(idx, e.target.value);
                        }
                      }}
                      className="text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 px-2.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                    >
                      <option value="" disabled>
                        + Pilih dari Anggota
                      </option>
                      {availableMembers.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.jabatan || m.rw || 'Anggota'})
                        </option>
                      ))}
                      {(opt.title || opt.subtitle) && (
                        <option value="__EMPTY__">
                          ✖ Kosongkan Pilihan Ini
                        </option>
                      )}
                    </select>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus opsi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Nama Calon / Opsi Keputusan *"
                      value={opt.title}
                      onChange={(e) => handleOptionChange(idx, 'title', e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500 font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="Keterangan / Jabatan / Visi Singkat"
                      value={opt.subtitle}
                      onChange={(e) => handleOptionChange(idx, 'subtitle', e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message if validation fails */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Info Banner */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Setiap anggota yang terdaftar memiliki hak 1 (satu) suara. Hasil pemungutan suara
              dapat dipantau secara real-time dan Berita Acara resmi dapat langsung dicetak atau
              diekspor setelah kuorum tercapai.
            </p>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publikasikan Voting Real-Time</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
