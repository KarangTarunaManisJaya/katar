import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Home,
  ChevronRight,
  TrendingUp,
  Coins,
  Send,
  Calendar,
} from 'lucide-react';
import { ProposalItem } from '../../types/proposal';
import { getInitialProposalsData } from '../../data/proposalsData';
import { ProposalDashboard } from './proposals/ProposalDashboard';
import { ProposalListTable } from './proposals/ProposalListTable';
import { ProposalDetailModal } from './proposals/ProposalDetailModal';
import { ProposalFormModal } from './proposals/ProposalFormModal';
import { ProposalPrintView } from './proposals/ProposalPrintView';

interface ProposalsViewProps {
  onToast: (msg: string) => void;
  onBackToHome?: () => void;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({ onToast, onBackToHome }) => {
  const [proposals, setProposals] = useState<ProposalItem[]>(() => {
    try {
      const saved = localStorage.getItem('kt_proposals_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getInitialProposalsData();
  });

  // Selected filters
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Modals & Active Views
  const [detailProposal, setDetailProposal] = useState<ProposalItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<ProposalItem | null>(null);
  const [printProposal, setPrintProposal] = useState<ProposalItem | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kt_proposals_v2', JSON.stringify(proposals));
  }, [proposals]);

  // Sync across tabs/devices
  useEffect(() => {
    const handleRemoteRefresh = () => {
      try {
        const saved = localStorage.getItem('kt_proposals_v2');
        if (saved) setProposals(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('kt_database_restored', handleRemoteRefresh);
    return () => {
      window.removeEventListener('kt_database_restored', handleRemoteRefresh);
    };
  }, []);

  // Save (Create or Update)
  const handleSaveProposal = (proposal: ProposalItem) => {
    const exists = proposals.some((p) => p.id === proposal.id);
    let updated: ProposalItem[];
    if (exists) {
      updated = proposals.map((p) => (p.id === proposal.id ? proposal : p));
      onToast(`Proposal "${proposal.judul}" berhasil diperbarui.`);
    } else {
      updated = [proposal, ...proposals];
      onToast(`Proposal baru "${proposal.judul}" berhasil diterbitkan!`);
    }
    setProposals(updated);
    setFormOpen(false);
    setEditingProposal(null);
    if (detailProposal && detailProposal.id === proposal.id) {
      setDetailProposal(proposal);
    }
  };

  // Delete
  const handleDeleteProposal = (id: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus proposal "${title}"?`)) {
      setProposals(proposals.filter((p) => p.id !== id));
      if (detailProposal?.id === id) setDetailProposal(null);
      onToast(`Proposal "${title}" telah dihapus.`);
    }
  };

  // Cross-module: Link to Kas
  const handleLinkToKas = (p: ProposalItem) => {
    try {
      const existingKas = JSON.parse(localStorage.getItem('kt_kas_entries_v2') || '[]');
      const newKasEntry = {
        id: `kas-${Date.now()}`,
        tanggal: p.tanggalKegiatan,
        keterangan: `[Pencairan Proposal] ${p.judul}`,
        kategori: p.kategori,
        jenis: 'Keluar',
        nominal: p.totalAnggaran,
        penanggungJawab: p.penanggungJawab,
        status: 'Terealisasi',
      };
      localStorage.setItem('kt_kas_entries_v2', JSON.stringify([newKasEntry, ...existingKas]));
      onToast(`Anggaran proposal Rp ${p.totalAnggaran.toLocaleString('id-ID')} berhasil dicatat ke Kas Organisasi!`);
    } catch {
      onToast('Gagal menghubungkan ke modul Kas.');
    }
  };

  // Cross-module: Link to Agenda
  const handleLinkToAgenda = (p: ProposalItem) => {
    try {
      const existingAgenda = JSON.parse(localStorage.getItem('kt_agenda_v1') || '[]');
      const newAgenda = {
        id: `agenda-${Date.now()}`,
        title: p.judul,
        date: p.tanggalKegiatan,
        time: '08:00 - Selesai',
        location: p.lokasiKegiatan,
        category: p.kategori,
        description: `Pelaksanaan kegiatan berdasarkan ${p.nomorProposal}`,
        status: 'Akan Datang',
        author: p.penanggungJawab,
      };
      localStorage.setItem('kt_agenda_v1', JSON.stringify([newAgenda, ...existingAgenda]));
      onToast(`Kegiatan "${p.judul}" berhasil ditambahkan ke Agenda Organisasi!`);
    } catch {
      onToast('Gagal menghubungkan ke modul Agenda.');
    }
  };

  // Cross-module: Link to Surat Menyurat
  const handleLinkToSurat = (p: ProposalItem) => {
    try {
      const existingSurat = JSON.parse(localStorage.getItem('kt_surat_items_v2') || '[]');
      const newSurat = {
        id: `doc-${Date.now()}`,
        no: existingSurat.length + 1,
        title: `Surat Pengantar Proposal: ${p.judul}`,
        subtitle: `Pengantar pengajuan ${p.nomorProposal}`,
        category: 'Permohonan',
        autoNumber: `SPg/${new Date().getFullYear()}/KT-MJ/${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Draft',
        createdDate: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
        iconBgColor: 'blue',
        recipient: 'Pihak Sponsor / Kelurahan / Instansi Terkait',
        content: `Bersama surat ini kami lampirkan dokumen proposal ${p.judul} (${p.nomorProposal}) dengan total rencana anggaran Rp ${p.totalAnggaran.toLocaleString('id-ID')}.`,
      };
      localStorage.setItem('kt_surat_items_v2', JSON.stringify([newSurat, ...existingSurat]));
      onToast(`Surat pengantar resmi untuk proposal "${p.judul}" berhasil dibuat di Surat Menyurat!`);
    } catch {
      onToast('Gagal menghubungkan ke modul Surat Menyurat.');
    }
  };

  // If in Print View
  if (printProposal) {
    return (
      <ProposalPrintView
        proposal={printProposal}
        onBack={() => setPrintProposal(null)}
        onToast={onToast}
      />
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fadeIn text-slate-800">
      {/* 1. Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Proposal & RAB
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Pengelolaan usulan kegiatan, Rencana Anggaran Biaya (RAB), sponsorship, alur persetujuan, dan cetak resmi
            </p>
          </div>
        </div>

        {/* Action Button & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingProposal(null);
              setFormOpen(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proposal Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Proposal Dashboard (KPIs, Charts, Due Date Alerts) */}
      <ProposalDashboard
        proposals={proposals}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onSelectProposal={(p) => setDetailProposal(p)}
      />

      {/* 3. Proposal List Table (Search, Filters, Actions) */}
      <ProposalListTable
        proposals={proposals}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenDetail={(p) => setDetailProposal(p)}
        onOpenEdit={(p) => {
          setEditingProposal(p);
          setFormOpen(true);
        }}
        onOpenPrint={(p) => setPrintProposal(p)}
        onDelete={handleDeleteProposal}
      />

      {/* 4. Modals */}
      {detailProposal && (
        <ProposalDetailModal
          proposal={detailProposal}
          onClose={() => setDetailProposal(null)}
          onEdit={() => {
            setEditingProposal(detailProposal);
            setDetailProposal(null);
            setFormOpen(true);
          }}
          onPrint={() => {
            setPrintProposal(detailProposal);
            setDetailProposal(null);
          }}
          onUpdateStatus={(updated) => {
            handleSaveProposal(updated);
            setDetailProposal(updated);
          }}
          onLinkToKas={handleLinkToKas}
          onLinkToAgenda={handleLinkToAgenda}
          onLinkToSurat={handleLinkToSurat}
          onToast={onToast}
        />
      )}

      {formOpen && (
        <ProposalFormModal
          initialData={editingProposal}
          existingCount={proposals.length}
          onClose={() => {
            setFormOpen(false);
            setEditingProposal(null);
          }}
          onSave={handleSaveProposal}
        />
      )}
    </div>
  );
};
