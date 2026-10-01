import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  MapPin,
  User,
  Coins,
  CheckCircle2,
  Clock,
  Printer,
  Edit,
  ArrowRight,
  ShieldCheck,
  Send,
  Building,
  Users,
  Paperclip,
  Check,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { ProposalItem, ApprovalStage } from '../../../types/proposal';

interface ProposalDetailModalProps {
  proposal: ProposalItem;
  onClose: () => void;
  onEdit: () => void;
  onPrint: () => void;
  onUpdateStatus: (updatedProposal: ProposalItem) => void;
  onLinkToKas?: (proposal: ProposalItem) => void;
  onLinkToAgenda?: (proposal: ProposalItem) => void;
  onLinkToSurat?: (proposal: ProposalItem) => void;
  onToast: (msg: string) => void;
}

export const ProposalDetailModal: React.FC<ProposalDetailModalProps> = ({
  proposal,
  onClose,
  onEdit,
  onPrint,
  onUpdateStatus,
  onLinkToKas,
  onLinkToAgenda,
  onLinkToSurat,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'narasi' | 'rab' | 'dana' | 'panitia' | 'rundown' | 'persetujuan' | 'lampiran'>('narasi');
  const [approvalNote, setApprovalNote] = useState('');

  // Handle Quick Approval
  const handleApproveStage = (roleIndex: number) => {
    const updatedStages = [...proposal.approvalStages];
    updatedStages[roleIndex] = {
      ...updatedStages[roleIndex],
      status: 'Disetujui',
      date: new Date().toISOString().split('T')[0],
      notes: approvalNote || 'Disetujui dan telah diverifikasi sesuai ketentuan organisasi.',
    };

    // Check if all approved
    const allApproved = updatedStages.every((s) => s.status === 'Disetujui');
    const newStatus = allApproved ? 'Disetujui' : proposal.status;

    const updatedProposal: ProposalItem = {
      ...proposal,
      approvalStages: updatedStages,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    onUpdateStatus(updatedProposal);
    setApprovalNote('');
    onToast(`Tahap persetujuan ${updatedStages[roleIndex].role} berhasil disimpan!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {proposal.nomorProposal}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {proposal.kategori}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate mt-0.5">
                {proposal.judul}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Cetak Proposal Resmi (PDF)"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Edit Data Proposal"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-2 border-b border-slate-200 bg-white overflow-x-auto text-xs">
          {[
            { id: 'narasi', label: '1. Isi & Narasi' },
            { id: 'rab', label: `2. RAB (Rp ${(proposal.totalAnggaran / 1000000).toFixed(1)} Jt)` },
            { id: 'dana', label: '3. Sumber Dana' },
            { id: 'panitia', label: '4. Kepanitiaan' },
            { id: 'rundown', label: '5. Rundown' },
            { id: 'persetujuan', label: `6. Persetujuan (${proposal.status})` },
            { id: 'lampiran', label: '7. Lampiran' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-2.5 font-bold border-b-2 transition-all whitespace-nowrap shrink-0 ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs space-y-5 text-slate-700">
          {/* TAB 1: Narasi & Informasi Utama */}
          {activeTab === 'narasi' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Waktu Pelaksanaan</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{proposal.tanggalKegiatan}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Lokasi Kegiatan</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{proposal.lokasiKegiatan}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Penanggung Jawab</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{proposal.penanggungJawab} ({proposal.bidangSeksi})</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">A. Latar Belakang</h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{proposal.latarBelakang}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">B. Dasar Kegiatan</h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{proposal.dasarKegiatan}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">C. Maksud dan Tujuan</h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{proposal.maksudDanTujuan}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">D. Bentuk Kegiatan & Target Peserta</h4>
                <p className="text-slate-600 leading-relaxed">{proposal.bentukKegiatan}</p>
                <div className="mt-2 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-900">
                  <span className="font-bold">Target Peserta:</span> {proposal.targetPeserta}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">E. Penutup</h4>
                <p className="text-slate-600 leading-relaxed">{proposal.penutup}</p>
              </div>
            </div>
          )}

          {/* TAB 2: Rencana Anggaran Biaya (RAB) */}
          {activeTab === 'rab' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div>
                  <span className="text-xs text-emerald-800 font-bold block">Total Usulan Rencana Anggaran Biaya</span>
                  <p className="text-xl font-black text-emerald-900">
                    Rp {proposal.totalAnggaran.toLocaleString('id-ID')}
                  </p>
                </div>
                <button
                  onClick={() => onLinkToKas?.(proposal)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Coins className="w-4 h-4" />
                  Hubungkan ke Kas Organisasi
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-4">Uraian Kebutuhan</th>
                      <th className="py-2.5 px-2 text-center">Vol</th>
                      <th className="py-2.5 px-2">Satuan</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {proposal.rabItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{item.category}</td>
                        <td className="py-2.5 px-4 text-slate-800 font-medium">
                          {item.name}
                          {item.notes && <span className="block text-[10px] text-slate-400">{item.notes}</span>}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-700">{item.volume}</td>
                        <td className="py-2.5 px-2 text-slate-500">{item.unit}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600 tabular-nums">
                          Rp {item.pricePerUnit.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700 tabular-nums">
                          Rp {item.total.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                    <tr>
                      <td colSpan={6} className="py-3 px-4 text-right text-slate-700 uppercase tracking-wider text-[11px]">
                        Total Anggaran Keseluruhan:
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-800 text-sm font-black">
                        Rp {proposal.totalAnggaran.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Sumber Dana */}
          {activeTab === 'dana' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <span className="text-xs text-indigo-700 font-bold block">Dana Terkumpul / Masuk</span>
                  <h3 className="text-2xl font-black text-indigo-900 mt-1">
                    Rp {proposal.totalDanaTerkumpul.toLocaleString('id-ID')}
                  </h3>
                  <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((proposal.totalDanaTerkumpul / (proposal.totalAnggaran || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-indigo-700 mt-1 font-semibold">
                    Ketercapaian: {Math.round((proposal.totalDanaTerkumpul / (proposal.totalAnggaran || 1)) * 100)}% dari Target
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold block">Sisa Kebutuhan Dana</span>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">
                    Rp {Math.max(0, proposal.totalAnggaran - proposal.totalDanaTerkumpul).toLocaleString('id-ID')}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Diharapkan tertutupi dari Sponsor, Bantuan CSR, atau Swadaya Warga.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Rincian Pos Sumber Dana:</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {proposal.danaSources.map((ds) => (
                    <div key={ds.id} className="p-3 bg-white flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-800">{ds.source}</span>
                        {ds.donorName && <p className="text-[11px] text-slate-500 mt-0.5">{ds.donorName}</p>}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-700 tabular-nums">
                          Rp {ds.receivedAmount.toLocaleString('id-ID')} / Rp {ds.targetAmount.toLocaleString('id-ID')}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-medium">{ds.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Kepanitiaan */}
          {activeTab === 'panitia' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Pelindung / Penasehat</span>
                  <p className="font-bold text-slate-800">{proposal.kepanitiaan.pelindung}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Penanggung Jawab</span>
                  <p className="font-bold text-slate-800">{proposal.kepanitiaan.penanggungJawab}</p>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-blue-600 font-bold uppercase block">Ketua Panitia</span>
                  <p className="font-bold text-blue-950">{proposal.kepanitiaan.ketuaPanitia}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Wakil Ketua</span>
                  <p className="font-bold text-slate-800">{proposal.kepanitiaan.wakilKetua || '-'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Sekretaris</span>
                  <p className="font-bold text-slate-800">{proposal.kepanitiaan.sekretaris}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Bendahara</span>
                  <p className="font-bold text-slate-800">{proposal.kepanitiaan.bendahara}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Seksi-Seksi Pelaksana:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-800">Seksi Acara:</span>{' '}
                    <span className="text-slate-600">{proposal.kepanitiaan.seksiAcara.join(', ') || '-'}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-800">Seksi Humas:</span>{' '}
                    <span className="text-slate-600">{proposal.kepanitiaan.seksiHumas.join(', ') || '-'}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-800">Seksi Konsumsi:</span>{' '}
                    <span className="text-slate-600">{proposal.kepanitiaan.seksiKonsumsi.join(', ') || '-'}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-800">Seksi Perlengkapan:</span>{' '}
                    <span className="text-slate-600">{proposal.kepanitiaan.seksiPerlengkapan.join(', ') || '-'}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-800">Seksi Dokumentasi:</span>{' '}
                    <span className="text-slate-600">{proposal.kepanitiaan.seksiDokumentasi.join(', ') || '-'}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-800">Seksi Keamanan:</span>{' '}
                    <span className="text-slate-600">{proposal.kepanitiaan.seksiKeamanan.join(', ') || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Rundown */}
          {activeTab === 'rundown' && (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Waktu</th>
                      <th className="py-2.5 px-2">Durasi</th>
                      <th className="py-2.5 px-4">Agenda Kegiatan</th>
                      <th className="py-2.5 px-3">PJ / Pengisi</th>
                      <th className="py-2.5 px-3">Tempat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {proposal.rundownItems.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">{r.waktu}</td>
                        <td className="py-2.5 px-2 text-slate-500">{r.durasi}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-900">{r.kegiatan}</td>
                        <td className="py-2.5 px-3 text-slate-600">{r.penanggungJawab}</td>
                        <td className="py-2.5 px-3 text-slate-500">{r.tempat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: Alur Persetujuan & Tanda Tangan */}
          {activeTab === 'persetujuan' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Alur Pemeriksaan & Tanda Tangan Pejabat:
                </h4>
                <div className="space-y-2.5">
                  {proposal.approvalStages.map((stage, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        stage.status === 'Disetujui'
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : stage.status === 'Catatan Revisi'
                          ? 'bg-orange-50/40 border-orange-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            stage.status === 'Disetujui'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {stage.status === 'Disetujui' ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{stage.role}</p>
                          <p className="text-[11px] text-slate-500">
                            {stage.officerName} — <span className="text-slate-400">{stage.officerTitle}</span>
                          </p>
                          {stage.notes && <p className="text-[10px] text-slate-600 italic mt-0.5">"{stage.notes}"</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {stage.status === 'Disetujui' ? (
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Disetujui
                            </span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">{stage.date}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApproveStage(idx)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Setujui
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Lampiran Dokumen */}
          {activeTab === 'lampiran' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Berkas Lampiran Proposal:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {proposal.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{att.title}</p>
                        <p className="text-[10px] text-slate-400">{att.type}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {att.includedInPrint ? 'Cetak' : 'Digital'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onLinkToAgenda?.(proposal)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Jadwalkan ke Agenda
            </button>
            <button
              onClick={() => onLinkToSurat?.(proposal)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              Buat Surat Pengantar
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen Proposal (A4)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
