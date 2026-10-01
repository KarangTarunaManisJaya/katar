import React, { useState } from 'react';
import {
  Users,
  Mail,
  FileText,
  BarChart3,
  Package,
  Calendar,
  Newspaper,
  ShieldCheck,
  Settings,
  Search,
  Plus,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  WORKSPACE_MEMBERS,
  WORKSPACE_LETTERS,
  WORKSPACE_PROPOSALS,
  WORKSPACE_ASSETS,
  WorkspaceMember,
  OfficialLetter,
  ProposalItem,
  OrganizationAsset,
} from '../../data/workspaceData';

interface ViewProps {
  onToast: (msg: string) => void;
  onBackToHome: () => void;
}

export const MembersView: React.FC<ViewProps> = ({ onToast, onBackToHome }) => {
  const [members, setMembers] = useState<WorkspaceMember[]>(WORKSPACE_MEMBERS);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Anggota');
  const [rw, setRw] = useState('RW 03');
  const [phone, setPhone] = useState('');

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.rw.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newMember: WorkspaceMember = {
      id: `m-${Date.now()}`,
      name,
      role,
      rw,
      phone: phone || '0812-xxxx-xxxx',
      status: 'Aktif',
      joinDate: 'Sep 2026',
    };
    setMembers([newMember, ...members]);
    onToast(`Anggota "${name}" berhasil ditambahkan ke direktori!`);
    setShowAddModal(false);
    setName('');
    setPhone('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Direktori Anggota Karang Taruna
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data pengurus harian dan anggota resmi Kelurahan Manis Jaya (Total: {members.length} anggota).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Anggota
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, jabatan, atau RW..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-5">Nama Lengkap</th>
                <th className="py-3 px-5">Jabatan / Seksi</th>
                <th className="py-3 px-4">Wilayah</th>
                <th className="py-3 px-5">Kontak WhatsApp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-5 font-bold text-slate-900">{m.name}</td>
                  <td className="py-3.5 px-5 text-slate-600">{m.role}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{m.rw}</td>
                  <td className="py-3.5 px-5 text-slate-500 font-mono">{m.phone}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{m.joinDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Tambah Anggota Baru</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama calon anggota..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Jabatan / Divisi</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Seksi Olahraga / Relawan"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Wilayah RW</label>
                  <input
                    type="text"
                    value={rw}
                    onChange={(e) => setRw(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const LettersView: React.FC<ViewProps> = ({ onToast }) => {
  const [letters, setLetters] = useState<OfficialLetter[]>(WORKSPACE_LETTERS);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Surat Menyurat & Arsip Digital
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Penomoran surat dinas, permohonan rekomendasi, dan surat keputusan Karang Taruna Manis Jaya.
          </p>
        </div>
        <button
          onClick={() => onToast('Fitur pembuatan nomor surat otomatis siap digunakan!')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Buat Surat Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {letters.map((l) => (
          <div key={l.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {l.type}
              </span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {l.status}
              </span>
            </div>
            <div>
              <p className="font-mono text-xs font-bold text-slate-900">{l.letterNumber}</p>
              <h4 className="text-sm font-bold text-slate-800 mt-1">{l.subject}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Tujuan / Dari: {l.recipientOrSender}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>{l.date}</span>
              <button
                onClick={() => onToast(`Mengunduh berkas ${l.letterNumber}...`)}
                className="text-blue-600 font-semibold hover:underline"
              >
                Unduh PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProposalsView: React.FC<ViewProps> = ({ onToast }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Proposal Kegiatan & Kemitraan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengajuan rencana anggaran biaya (RAB) dan program ke instansi pemerintah / swasta.
          </p>
        </div>
        <button
          onClick={() => onToast('Formulir draf proposal baru dibuka')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Ajukan Proposal Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase">
            <tr>
              <th className="py-3 px-5">Nama Proposal</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-5">Anggaran Pengajuan</th>
              <th className="py-3 px-4">Tanggal Pengajuan</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {WORKSPACE_PROPOSALS.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-5 font-bold text-slate-900">{p.title}</td>
                <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                <td className="py-3.5 px-5 font-semibold text-blue-700 tabular-nums">
                  Rp {p.budget.toLocaleString('id-ID')}
                </td>
                <td className="py-3.5 px-4 text-slate-500">{p.submittedDate}</td>
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AssetsView: React.FC<ViewProps> = ({ onToast }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Inventaris Aset & Peralatan Organisasi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data peralatan sound system, tenda, kursi, dan sarana olahraga inventaris Karang Taruna.
          </p>
        </div>
        <button
          onClick={() => onToast('Pencatatan aset baru dibuka')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Aset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {WORKSPACE_ASSETS.map((ast) => (
          <div key={ast.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {ast.category}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {ast.condition}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">{ast.name}</h4>
            <div className="text-xs text-slate-500 space-y-1 pt-1">
              <div>Jumlah: <span className="font-semibold text-slate-800">{ast.quantity} Unit</span></div>
              <div>Lokasi: <span className="text-slate-700">{ast.location}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
