import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Bell,
  CheckCircle2,
  ExternalLink,
  Share2,
  Printer,
  Edit,
  Trash2,
  AlertCircle,
  Repeat,
  Image as ImageIcon,
  Video,
  FileSpreadsheet,
  Check,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  AgendaItem,
  KATEGORI_COLORS,
  STATUS_COLORS,
  PesertaItem,
} from '../../../data/agendaData';

interface AgendaDetailModalProps {
  agenda: AgendaItem;
  onClose: () => void;
  onEdit: (agenda: AgendaItem) => void;
  onDelete: (id: string) => void;
  onUpdateAgenda: (updated: AgendaItem) => void;
  onToast: (msg: string) => void;
}

export const AgendaDetailModal: React.FC<AgendaDetailModalProps> = ({
  agenda,
  onClose,
  onEdit,
  onDelete,
  onUpdateAgenda,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    'detail' | 'panitia_peserta' | 'lokasi' | 'anggaran' | 'dokumentasi' | 'pengingat'
  >('detail');

  const [pesertaList, setPesertaList] = useState<PesertaItem[]>(agenda.daftarPeserta || []);

  const colors = KATEGORI_COLORS[agenda.kategori] || KATEGORI_COLORS['Lainnya'];
  const statusColor = STATUS_COLORS[agenda.statusKegiatan];

  // Helper toggle presence status
  const handleToggleAttendance = (pesertaId: string, newStatus: 'Hadir' | 'Tidak Hadir' | 'Belum Konfirmasi') => {
    const updated = pesertaList.map((p) =>
      p.id === pesertaId ? { ...p, statusKehadiran: newStatus } : p
    );
    setPesertaList(updated);

    const hadirCount = updated.filter((p) => p.statusKehadiran === 'Hadir').length;
    const tidakHadirCount = updated.filter((p) => p.statusKehadiran === 'Tidak Hadir').length;

    const updatedAgenda: AgendaItem = {
      ...agenda,
      daftarPeserta: updated,
      jumlahPesertaHadir: hadirCount,
      jumlahPesertaTidakHadir: tidakHadirCount,
    };
    onUpdateAgenda(updatedAgenda);
    onToast(`Status kehadiran peserta berhasil diperbarui.`);
  };

  // Helper simulate WhatsApp Reminder
  const handleSendWhatsAppReminder = () => {
    const message = `*PENGINGAT KEGIATAN KARANG TARUNA MANIS JAYA*%0A%0A📌 *Kegiatan:* ${encodeURIComponent(
      agenda.namaKegiatan
    )}%0A📅 *Tanggal:* ${agenda.tanggalMulai} ${agenda.tanggalSelesai ? 's/d ' + agenda.tanggalSelesai : ''}%0A⏰ *Waktu:* ${
      agenda.jamMulai
    } - ${agenda.jamSelesai} WIB%0A📍 *Lokasi:* ${encodeURIComponent(agenda.lokasi)}%0A👤 *PJ:* ${encodeURIComponent(
      agenda.penanggungJawab
    )}%0A%0AMohon kehadiran tepat waktu bagi seluruh panitia & peserta yang telah terdaftar. Terima kasih! 🇮🇩`;

    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
    onToast('Membuka WhatsApp untuk mengirim pesan pengingat kegiatan...');
  };

  // Helper print view
  const handlePrint = () => {
    window.print();
    onToast('Menyiapkan dokumen lembar kegiatan untuk dicetak...');
  };

  // Calculate days countdown
  const now = new Date();
  const eventDate = new Date(agenda.tanggalMulai);
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let countdownText = '';
  let countdownColor = '';
  if (agenda.statusKegiatan === 'Selesai') {
    countdownText = '✅ Telah Terlaksana';
    countdownColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (diffDays === 0) {
    countdownText = '🔥 HARI INI!';
    countdownColor = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
  } else if (diffDays > 0) {
    countdownText = `⏳ H-${diffDays} Hari lagi`;
    countdownColor = 'bg-blue-100 text-blue-800 border-blue-300';
  } else {
    countdownText = `Lewat Jadwal (${Math.abs(diffDays)} hari lalu)`;
    countdownColor = 'bg-slate-100 text-slate-700 border-slate-300';
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.bg}`}>
                {agenda.kategori}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor.badge}`}>
                {agenda.statusKegiatan}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${countdownColor}`}>
                {countdownText}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {agenda.namaKegiatan}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {agenda.tanggalMulai} {agenda.tanggalSelesai ? `s/d ${agenda.tanggalSelesai}` : ''}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {agenda.jamMulai} - {agenda.jamSelesai} WIB
              </span>
              <span className="flex items-center gap-1 font-medium truncate">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {agenda.lokasi}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(agenda)}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors"
              title="Edit Agenda"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Cetak Agenda"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 bg-slate-50/60 overflow-x-auto no-scrollbar">
          {[
            { id: 'detail', label: 'Data Kegiatan', icon: FileText },
            { id: 'panitia_peserta', label: 'Peserta & Kepanitiaan', icon: Users },
            { id: 'lokasi', label: 'Lokasi & Maps', icon: MapPin },
            { id: 'anggaran', label: 'Anggaran & LPJ', icon: DollarSign },
            { id: 'dokumentasi', label: 'Dokumentasi', icon: ImageIcon },
            { id: 'pengingat', label: 'Pengingat & Berulang', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: DATA KEGIATAN */}
          {activeTab === 'detail' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Informasi Utama Agenda
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Nama Kegiatan</span>
                      <span className="font-bold text-slate-800 text-right">{agenda.namaKegiatan}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Jenis Kegiatan</span>
                      <span className="font-bold text-blue-700">{agenda.jenisKegiatan}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Kategori</span>
                      <span className="font-bold text-slate-800">{agenda.kategori}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Bidang / Seksi</span>
                      <span className="font-bold text-slate-800">{agenda.bidangSeksi}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Penanggung Jawab</span>
                      <span className="font-bold text-slate-800">{agenda.penanggungJawab}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Waktu & Target Peserta
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Tanggal Mulai</span>
                      <span className="font-bold text-slate-800">{agenda.tanggalMulai}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Tanggal Selesai</span>
                      <span className="font-bold text-slate-800">{agenda.tanggalSelesai || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Waktu / Jam</span>
                      <span className="font-bold text-slate-800">
                        {agenda.jamMulai} - {agenda.jamSelesai} WIB
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Target / Kuota Peserta</span>
                      <span className="font-bold text-slate-800">{agenda.jumlahPeserta} Orang</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Sasaran Peserta</span>
                      <span className="font-bold text-slate-800 text-right">{agenda.targetPeserta}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deskripsi & Tujuan */}
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Deskripsi Kegiatan
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {agenda.deskripsiKegiatan || 'Belum ada rincian deskripsi kegiatan.'}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tujuan & Manfaat Kegiatan
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {agenda.tujuanKegiatan || 'Belum ada catatan tujuan kegiatan.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PESERTA & KEPANITIAAN */}
          {activeTab === 'panitia_peserta' && (
            <div className="space-y-6">
              {/* Inti Kepanitiaan */}
              <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
                  Pejabat & Pengurus Inti Panitia
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <span className="text-slate-400 block text-[10px]">Penanggung Jawab</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{agenda.penanggungJawab}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <span className="text-slate-400 block text-[10px]">Ketua Panitia</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{agenda.ketuaPanitia || '-'}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <span className="text-slate-400 block text-[10px]">Sekretaris</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{agenda.sekretarisPanitia || '-'}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <span className="text-slate-400 block text-[10px]">Bendahara</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{agenda.bendaharaPanitia || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Daftar Panitia */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Struktur & Anggota Panitia Pelaksana ({agenda.daftarPanitia?.length || 0})
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-4">Nama Panitia</th>
                        <th className="py-2.5 px-4">Jabatan / Peran</th>
                        <th className="py-2.5 px-4">Bidang / Seksi</th>
                        <th className="py-2.5 px-4">Kontak / No HP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {agenda.daftarPanitia?.map((panitia) => (
                        <tr key={panitia.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{panitia.nama}</td>
                          <td className="py-2.5 px-4">{panitia.peran}</td>
                          <td className="py-2.5 px-4">{panitia.bidang}</td>
                          <td className="py-2.5 px-4 text-blue-600 font-mono">{panitia.kontak || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Presensi / Kehadiran Peserta */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white space-y-3 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Presensi & Daftar Peserta
                    </h4>
                    <p className="text-xs text-slate-500">
                      Klik status kehadiran untuk memperbarui absensi peserta kegiatan secara langsung.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Hadir: {agenda.jumlahPesertaHadir}</span>
                    </span>
                    <span className="text-xs bg-rose-50 text-rose-700 px-3 py-1 rounded-full font-bold border border-rose-200 flex items-center gap-1">
                      <UserX className="w-3.5 h-3.5" />
                      <span>Tidak Hadir: {agenda.jumlahPesertaTidakHadir}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {pesertaList.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Belum ada data peserta terdaftar.
                    </div>
                  ) : (
                    pesertaList.map((peserta) => (
                      <div
                        key={peserta.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/50 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{peserta.nama}</div>
                          <div className="text-[11px] text-slate-500">{peserta.instansiRt}</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleAttendance(peserta.id, 'Hadir')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                              peserta.statusKehadiran === 'Hadir'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200/80 text-slate-700 hover:bg-emerald-100'
                            }`}
                          >
                            Hadir
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(peserta.id, 'Tidak Hadir')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                              peserta.statusKehadiran === 'Tidak Hadir'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200/80 text-slate-700 hover:bg-rose-100'
                            }`}
                          >
                            Tidak Hadir
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOKASI & MAPS */}
          {activeTab === 'lokasi' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Nama Lokasi Kegiatan
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{agenda.lokasi}</h3>
                    <p className="text-xs text-slate-600">{agenda.alamatLokasi}</p>
                    <p className="text-xs text-slate-500">
                      {agenda.kecamatan}, {agenda.kabupatenKota}
                    </p>
                  </div>
                  {agenda.googleMapsUrl && (
                    <a
                      href={agenda.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Buka di Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Koordinat GPS</span>
                    <span className="font-mono text-slate-800">{agenda.koordinat || 'Tidak disetel'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Petunjuk Arah / Landmark</span>
                    <span className="text-slate-700">{agenda.petunjukLokasi || 'Tidak ada petunjuk khusus.'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ANGGARAN & LPJ */}
          {activeTab === 'anggaran' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    Estimasi Anggaran
                  </span>
                  <div className="text-xl font-black text-blue-950 mt-1">
                    {formatCurrency(agenda.estimasiAnggaran)}
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Realisasi Anggaran
                  </span>
                  <div className="text-xl font-black text-emerald-950 mt-1">
                    {formatCurrency(agenda.realisasiAnggaran)}
                  </div>
                </div>

                <div className="bg-purple-50/70 border border-purple-200 p-4 rounded-2xl">
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                    Selisih / Efisiensi
                  </span>
                  <div className="text-xl font-black text-purple-950 mt-1">
                    {formatCurrency(agenda.estimasiAnggaran - agenda.realisasiAnggaran)}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Status Pertanggungjawaban Keuangan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block">Sumber Pendanaan</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{agenda.sumberDana}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status Pertanggungjawaban (LPJ)</span>
                    <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-full">
                      {agenda.statusPertanggungjawaban}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Nomor Proposal</span>
                    <span className="font-mono text-slate-800 font-semibold">{agenda.nomorProposal || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Nomor LPJ</span>
                    <span className="font-mono text-slate-800 font-semibold">{agenda.nomorLpj || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOKUMENTASI */}
          {activeTab === 'dokumentasi' && (
            <div className="space-y-6">
              {/* Foto Gallery */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Galeri Foto Dokumentasi Kegiatan ({agenda.fotoKegiatan?.length || 0})
                </h4>
                {agenda.fotoKegiatan && agenda.fotoKegiatan.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {agenda.fotoKegiatan.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group relative"
                      >
                        <img
                          src={imgUrl}
                          alt={`Foto kegiatan ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                    Belum ada foto dokumentasi diunggah.
                  </div>
                )}
              </div>

              {/* Tautan Dokumen & Berita */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3 text-xs">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider">
                  Berkas & Berita Terkait
                </h4>
                <div className="space-y-2">
                  {agenda.videoUrl && (
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="flex items-center gap-2 font-medium text-slate-800">
                        <Video className="w-4 h-4 text-red-600" />
                        Dokumentasi Video Acara
                      </span>
                      <a
                        href={agenda.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        Tonton Video <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {agenda.beritaKegiatan && (
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="flex items-center gap-2 font-medium text-slate-800">
                        <FileText className="w-4 h-4 text-blue-600" />
                        {agenda.beritaKegiatan}
                      </span>
                      <span className="text-slate-400 text-[11px]">Rilis Berita</span>
                    </div>
                  )}

                  {agenda.dokumenPendukung?.map((dok, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200"
                    >
                      <span className="flex items-center gap-2 font-medium text-slate-800">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        {dok}
                      </span>
                      <span className="text-xs text-blue-600 font-semibold cursor-pointer">
                        Lihat Berkas
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PENGINGAT & BERULANG */}
          {activeTab === 'pengingat' && (
            <div className="space-y-6">
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Bell className="w-4 h-4 text-amber-600" />
                    <span>Jadwal Pengingat (Notifikasi)</span>
                  </div>
                  <button
                    onClick={handleSendWhatsAppReminder}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Kirim Pengingat WhatsApp</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['H-30', 'H-14', 'H-7', 'H-3', 'H-1', 'Hari-H'].map((rem) => {
                    const isSet = agenda.pengingat?.includes(rem as any);
                    return (
                      <span
                        key={rem}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                          isSet
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-400 border-slate-200 opacity-60'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {rem}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Recurrence */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Repeat className="w-4 h-4 text-blue-600" />
                  <span>Siklus Kegiatan Berulang</span>
                </div>
                <p className="text-xs text-slate-600">
                  Jenis Pengulangan: <span className="font-bold text-blue-700">{agenda.kegiatanBerulang}</span>
                </p>
                {agenda.customRecurrenceDetail && (
                  <p className="text-xs text-slate-500">{agenda.customRecurrenceDetail}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (window.confirm(`Yakin ingin menghapus agenda "${agenda.namaKegiatan}"?`)) {
                onDelete(agenda.id);
                onClose();
              }
            }}
            className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Agenda</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(agenda)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Agenda</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
