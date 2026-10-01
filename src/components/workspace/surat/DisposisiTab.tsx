import React, { useState, useMemo } from 'react';
import {
  Share2,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Building,
  Printer,
  Edit2,
  Trash2,
  Check,
  Flame,
  X,
} from 'lucide-react';
import {
  DisposisiItem,
  SuratMasukItem,
  StatusDisposisi,
  InstruksiDisposisi,
} from '../../../types/surat';

interface DisposisiTabProps {
  disposisiList: DisposisiItem[];
  suratMasukList: SuratMasukItem[];
  onAddNew: () => void;
  onEdit: (item: DisposisiItem) => void;
  onDelete: (id: string) => void;
  onComplete: (item: DisposisiItem) => void;
  onPrintLembarDisposisi: (item: DisposisiItem) => void;
  onToast: (msg: string) => void;
}

export const DisposisiTab: React.FC<DisposisiTabProps> = ({
  disposisiList,
  suratMasukList,
  onAddNew,
  onEdit,
  onDelete,
  onComplete,
  onPrintLembarDisposisi,
  onToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterInstruksi, setFilterInstruksi] = useState<string>('semua');

  // Modal for quick complete
  const [completeModalItem, setCompleteModalItem] = useState<DisposisiItem | null>(null);
  const [catatanSelesai, setCatatanSelesai] = useState('');

  const now = new Date();

  const filteredDisposisi = useMemo(() => {
    return disposisiList.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        d.nomorDisposisi.toLowerCase().includes(q) ||
        d.nomorSuratMasuk.toLowerCase().includes(q) ||
        d.perihalSuratMasuk.toLowerCase().includes(q) ||
        d.kepada.toLowerCase().includes(q) ||
        d.dari.toLowerCase().includes(q) ||
        d.instansiSuratMasuk.toLowerCase().includes(q);

      const matchStatus = filterStatus === 'semua' || d.status === filterStatus;
      const matchInstruksi = filterInstruksi === 'semua' || d.instruksi === filterInstruksi;

      return matchSearch && matchStatus && matchInstruksi;
    });
  }, [disposisiList, searchQuery, filterStatus, filterInstruksi]);

  // Check deadline status
  const getDeadlineBadge = (batasWaktu: string, status: StatusDisposisi) => {
    if (status === 'Selesai') {
      return (
        <span className="inline-flex items-center text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Tuntas
        </span>
      );
    }
    const target = new Date(batasWaktu).getTime();
    const today = now.getTime();
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center text-[10px] text-rose-800 font-bold bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded animate-pulse">
          <Flame className="w-3 h-3 mr-1 text-rose-600" /> Terlewat ({Math.abs(diffDays)} hari lalu)
        </span>
      );
    } else if (diffDays <= 2) {
      return (
        <span className="inline-flex items-center text-[10px] text-amber-800 font-bold bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
          <Clock className="w-3 h-3 mr-1 text-amber-600" /> {diffDays === 0 ? 'Hari Ini!' : `${diffDays} hari lagi`}
        </span>
      );
    }
    return (
      <span className="text-[10px] text-slate-500 font-medium">
        Batas: {batasWaktu}
      </span>
    );
  };

  const handleFinishDisposisi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalItem) return;
    onComplete({
      ...completeModalItem,
      status: 'Selesai',
      tanggalSelesai: new Date().toISOString().split('T')[0],
      catatanPenyelesaian: catatanSelesai || 'Disposisi telah ditindaklanjuti sesuai instruksi.',
    });
    onToast(`Disposisi ${completeModalItem.nomorDisposisi} berhasil diselesaikan!`);
    setCompleteModalItem(null);
    setCatatanSelesai('');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-600" />
            Lembar & Alur Disposisi Surat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelacakan instruksi pimpinan, penugasan delegasi pengurus, batas waktu penyelesaian, dan kontrol tindak lanjut surat.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Buat Disposisi Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor disposisi, penerima, instruksi..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-amber-500"
            >
              <option value="semua">Semua Status Disposisi</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Dikerjakan">Dikerjakan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div>
            <select
              value={filterInstruksi}
              onChange={(e) => setFilterInstruksi(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-amber-500"
            >
              <option value="semua">Semua Jenis Instruksi</option>
              <option value="Tindak lanjuti segera">Tindak lanjuti segera</option>
              <option value="Hadiri / Wakili">Hadiri / Wakili</option>
              <option value="Pelajari & beri masukan">Pelajari & beri masukan</option>
              <option value="Siapkan konsep surat balasan">Siapkan konsep surat balasan</option>
              <option value="Koordinasikan dengan bidang terkait">Koordinasikan dengan bidang terkait</option>
              <option value="Arsipkan & catat">Arsipkan & catat</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Menampilkan <b>{filteredDisposisi.length}</b> disposisi</span>
          {(filterStatus !== 'semua' || filterInstruksi !== 'semua' || searchQuery) && (
            <button
              onClick={() => {
                setFilterStatus('semua');
                setFilterInstruksi('semua');
                setSearchQuery('');
              }}
              className="text-amber-700 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Disposisi Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDisposisi.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
              item.status === 'Selesai'
                ? 'border-emerald-200 bg-emerald-50/10'
                : 'border-slate-200'
            }`}
          >
            <div>
              {/* Header card */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {item.nomorDisposisi}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-500 font-medium">Tgl: {item.tanggalDisposisi}</span>
                </div>
                <div>{getDeadlineBadge(item.batasWaktu, item.status)}</div>
              </div>

              {/* Related Incoming Letter */}
              <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Surat Masuk Terkait:
                </div>
                <div className="font-mono text-xs font-bold text-slate-800 line-clamp-1">
                  {item.nomorSuratMasuk}
                </div>
                <div className="text-xs text-slate-700 font-medium line-clamp-1 mt-0.5">
                  {item.perihalSuratMasuk}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  {item.instansiSuratMasuk}
                </div>
              </div>

              {/* Dari & Kepada */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                  <span className="text-[10px] text-blue-600 font-bold block">DARI:</span>
                  <span className="font-semibold text-slate-800">{item.dari}</span>
                </div>
                <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold block">KEPADA:</span>
                  <span className="font-semibold text-slate-800">{item.kepada}</span>
                </div>
              </div>

              {/* Instruksi & Catatan */}
              <div className="mt-3 space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-500">Instruksi: </span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {item.instruksi}
                  </span>
                </div>
                <div className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-200/60 italic text-[11px]">
                  &ldquo;{item.catatan}&rdquo;
                </div>

                {item.status === 'Selesai' && item.catatanPenyelesaian && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                    <span className="font-bold block text-[10px] text-emerald-700">Telah Diselesaikan ({item.tanggalSelesai}):</span>
                    {item.catatanPenyelesaian}
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  item.status === 'Selesai'
                    ? 'bg-emerald-100 text-emerald-700'
                    : item.status === 'Dikerjakan'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.status}
                </span>

                {item.status !== 'Selesai' && (
                  <button
                    onClick={() => {
                      setCompleteModalItem(item);
                      setCatatanSelesai('');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors"
                  >
                    <Check className="w-3 h-3" /> Tandai Selesai
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPrintLembarDisposisi(item)}
                  title="Cetak Lembar Disposisi Resmi"
                  className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(item)}
                  title="Edit Disposisi"
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  title="Hapus Disposisi"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredDisposisi.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <Share2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">Belum ada lembar disposisi yang cocok.</p>
            <p className="text-xs text-slate-400 mt-1">
              Buat disposisi dari tombol di atas atau langsung dari surat masuk.
            </p>
          </div>
        )}
      </div>

      {/* MODAL PENYELESAIAN DISPOSISI */}
      {completeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Selesaikan Disposisi: {completeModalItem.nomorDisposisi}
              </h3>
              <button
                onClick={() => setCompleteModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFinishDisposisi} className="mt-4 space-y-3">
              <div className="text-xs text-slate-600">
                <p><b>Perihal:</b> {completeModalItem.perihalSuratMasuk}</p>
                <p><b>Kepada:</b> {completeModalItem.kepada}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tindak Lanjut / Hasil Penyelesaian:
                </label>
                <textarea
                  rows={3}
                  value={catatanSelesai}
                  onChange={(e) => setCatatanSelesai(e.target.value)}
                  placeholder="Contoh: Telah dihadiri koordinasi pada tanggal ... dan draft balasan telah dikirim."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompleteModalItem(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Simpan & Selesai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
