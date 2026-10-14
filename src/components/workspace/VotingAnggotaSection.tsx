import React, { useState, useEffect } from 'react';
import {
  Vote,
  Crown,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Printer,
  ChevronRight,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Trash2,
  Lock,
  Unlock,
  Search,
  Filter,
  Check,
  Award,
  Calendar,
  MapPin,
  DollarSign,
  Radio,
  FileText,
  UserCheck,
} from 'lucide-react';
import { VotingItem, VotingCategory, VotingOption } from '../../types/voting';
import { INITIAL_VOTINGS } from '../../data/votingInitialData';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { UserAccount, DEFAULT_USERS } from '../../types/auth';
import { CreateVotingModal } from './voting/CreateVotingModal';
import { VotingBeritaAcaraModal } from './voting/VotingBeritaAcaraModal';
import {
  pushLocalDataToCloud,
  saveVotingToFirestore,
  deleteVotingFromFirestore,
  subscribeVotingsFromFirestore,
} from '../../services/firestoreSyncService';

interface VotingAnggotaSectionProps {
  currentUser: UserAccount;
  onToast: (msg: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const VotingAnggotaSection: React.FC<VotingAnggotaSectionProps> = ({
  currentUser,
  onToast,
  onNavigateToTab,
}) => {
  // Load votings with localStorage and Firestore fallback
  const [votings, setVotings] = useState<VotingItem[]>(() => {
    try {
      const saved = localStorage.getItem('kt_votings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    try {
      localStorage.setItem('kt_votings_v1', JSON.stringify(INITIAL_VOTINGS));
    } catch (e) {}
    return INITIAL_VOTINGS;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | VotingCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVotingForBeritaAcara, setSelectedVotingForBeritaAcara] = useState<VotingItem | null>(null);
  const [expandedVotersVotingId, setExpandedVotersVotingId] = useState<string | null>(null);
  const [castingVoteId, setCastingVoteId] = useState<string | null>(null);

  // Subscribe to real-time Firestore updates and local broadcast events
  useEffect(() => {
    const unsub = subscribeVotingsFromFirestore((remoteList) => {
      if (Array.isArray(remoteList) && remoteList.length > 0) {
        setVotings(remoteList);
        try {
          localStorage.setItem('kt_votings_v1', JSON.stringify(remoteList));
        } catch (e) {}
      }
    });

    const handleSyncEvent = () => {
      try {
        const saved = localStorage.getItem('kt_votings_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setVotings(parsed);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('kt_cloud_sync_update', handleSyncEvent);
    window.addEventListener('kt_database_restored', handleSyncEvent);

    return () => {
      unsub();
      window.removeEventListener('kt_cloud_sync_update', handleSyncEvent);
      window.removeEventListener('kt_database_restored', handleSyncEvent);
    };
  }, []);

  // Save changes locally and push to Cloud Firestore
  const persistVotings = (newList: VotingItem[], reason: string, updatedItem?: VotingItem) => {
    setVotings(newList);
    try {
      localStorage.setItem('kt_votings_v1', JSON.stringify(newList));
    } catch (e) {}

    // Direct Firestore update if specific item is provided
    if (updatedItem) {
      saveVotingToFirestore(updatedItem).catch(() => {});
    }

    pushLocalDataToCloud(reason, currentUser?.name || 'Pengurus').catch(() => {});
  };

  // Cast vote for a specific option
  const handleVote = async (votingId: string, optionId: string) => {
    const targetVoting = votings.find((v) => v.id === votingId);
    if (!targetVoting) return;

    if (targetVoting.status === 'closed') {
      onToast('Pemungutan suara ini telah ditutup.');
      return;
    }

    setCastingVoteId(optionId);

    const safeUser = currentUser || DEFAULT_USERS[0];
    const voterId = safeUser?.id || safeUser?.username || 'user-1';
    const voterName = safeUser?.name || 'Anggota';
    const voterRole = safeUser?.role || 'Anggota Karang Taruna';
    const voterAvatar = safeUser?.avatar;

    // Check if voter already voted for this exact option
    const currentOption = targetVoting.options.find((o) => o.id === optionId);
    if (currentOption?.voterIds.includes(voterId)) {
      onToast(`Anda sudah memilih "${currentOption.title}". Suara Anda telah tercatat.`);
      setCastingVoteId(null);
      return;
    }

    // Clone and update options
    const updatedOptions = targetVoting.options.map((opt) => {
      // Remove previous vote if user changed their choice
      const filteredVoters = opt.voterIds.filter((id) => id !== voterId);
      if (opt.id === optionId) {
        return {
          ...opt,
          votesCount: filteredVoters.length + 1,
          voterIds: [...filteredVoters, voterId],
        };
      } else {
        return {
          ...opt,
          votesCount: filteredVoters.length,
          voterIds: filteredVoters,
        };
      }
    });

    const newTotalVotes = updatedOptions.reduce((acc, curr) => acc + curr.votesCount, 0);

    // Update voter history
    const existingHistoryIndex = targetVoting.voterHistory.findIndex((h) => h.userId === voterId);
    const newHistoryRecord = {
      userId: voterId,
      userName: voterName,
      userRole: voterRole,
      avatar: voterAvatar,
      optionId,
      optionTitle: currentOption?.title || 'Pilihan',
      votedAt: new Date().toISOString(),
    };

    let updatedHistory = [...targetVoting.voterHistory];
    if (existingHistoryIndex >= 0) {
      updatedHistory[existingHistoryIndex] = newHistoryRecord;
    } else {
      updatedHistory.push(newHistoryRecord);
    }

    const updatedVoting: VotingItem = {
      ...targetVoting,
      options: updatedOptions,
      totalVotes: newTotalVotes,
      voterHistory: updatedHistory,
    };

    const nextVotings = votings.map((v) => (v.id === votingId ? updatedVoting : v));
    persistVotings(nextVotings, `Suara baru oleh ${voterName} pada ${targetVoting.title}`, updatedVoting);

    setTimeout(() => {
      setCastingVoteId(null);
      onToast(`🎉 Suara Anda untuk "${currentOption?.title}" berhasil tercatat secara real-time!`);
    }, 250);
  };

  // Close or Reopen voting
  const handleToggleVotingStatus = (votingId: string) => {
    const targetVoting = votings.find((v) => v.id === votingId);
    if (!targetVoting) return;

    const nextStatus = targetVoting.status === 'active' ? 'closed' : 'active';
    const sorted = [...targetVoting.options].sort((a, b) => b.votesCount - a.votesCount);
    const winner = sorted[0];

    const updatedVoting: VotingItem = {
      ...targetVoting,
      status: nextStatus,
      closedAt: nextStatus === 'closed' ? new Date().toISOString() : undefined,
      resultSummary:
        nextStatus === 'closed' && winner
          ? `Keputusan Terpilih: ${winner.title} (${winner.votesCount} Suara)`
          : undefined,
    };

    const nextVotings = votings.map((v) => (v.id === votingId ? updatedVoting : v));
    persistVotings(
      nextVotings,
      `Voting ${nextStatus === 'closed' ? 'ditutup' : 'dibuka kembali'}: ${targetVoting.title}`,
      updatedVoting
    );

    onToast(
      nextStatus === 'closed'
        ? `Sesi voting telah ditutup. Hasil resmi ditetapkan: ${winner?.title || '-'}`
        : 'Sesi voting dibuka kembali untuk pemungutan suara.'
    );
  };

  // Reset votes (for simulation / re-testing)
  const handleResetVotes = (votingId: string) => {
    const targetVoting = votings.find((v) => v.id === votingId);
    if (!targetVoting) return;

    const updatedVoting: VotingItem = {
      ...targetVoting,
      totalVotes: 0,
      voterHistory: [],
      options: targetVoting.options.map((opt) => ({
        ...opt,
        votesCount: 0,
        voterIds: [],
      })),
      resultSummary: undefined,
    };

    const nextVotings = votings.map((v) => (v.id === votingId ? updatedVoting : v));
    persistVotings(nextVotings, `Reset suara voting: ${targetVoting.title}`, updatedVoting);
    onToast(`Suara pada "${targetVoting.title}" berhasil direset.`);
  };

  // Delete voting
  const handleDeleteVoting = (votingId: string) => {
    const targetVoting = votings.find((v) => v.id === votingId);
    if (!targetVoting) return;

    const nextVotings = votings.filter((v) => v.id !== votingId);
    persistVotings(nextVotings, `Menghapus voting: ${targetVoting.title}`);
    deleteVotingFromFirestore(votingId).catch(() => {});
    onToast('Sesi voting berhasil dihapus.');
  };

  // Create new voting
  const handleCreateVoting = (newVoting: VotingItem) => {
    const nextVotings = [newVoting, ...votings];
    persistVotings(nextVotings, `Voting baru dibuat: ${newVoting.title}`, newVoting);
    onToast('🎉 Sesi voting baru berhasil dibuat & dipublikasikan secara real-time!');
  };

  // Category helpers
  const getCategoryMeta = (cat?: VotingCategory) => {
    switch (cat) {
      case 'ketua_kegiatan':
        return {
          label: 'Pemilihan Ketua Kegiatan',
          icon: Crown,
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          gradient: 'from-indigo-600 to-purple-600',
        };
      case 'musyawarah':
        return {
          label: 'Pengambilan Keputusan',
          icon: Vote,
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          gradient: 'from-blue-600 to-cyan-600',
        };
      case 'jadwal_lokasi':
        return {
          label: 'Jadwal & Lokasi Kegiatan',
          icon: MapPin,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
          gradient: 'from-amber-500 to-orange-600',
        };
      case 'anggaran':
        return {
          label: 'Musyawarah Anggaran & Kas',
          icon: DollarSign,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          gradient: 'from-emerald-600 to-teal-600',
        };
      default:
        return {
          label: 'Musyawarah Pemuda',
          icon: Vote,
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          gradient: 'from-blue-600 to-indigo-600',
        };
    }
  };

  // Filter list
  const filteredVotings = votings.filter((item) => {
    if (!item) return false;
    if (activeFilter === 'active' && item.status !== 'active') return false;
    if (activeFilter === 'closed' && item.status !== 'closed') return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchOpts = Array.isArray(item.options) && item.options.some((o) => (o?.title || '').toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchOpts) return false;
    }
    return true;
  });

  const totalVotingsCount = votings.length;
  const activeCount = votings.filter((v) => v?.status === 'active').length;
  const closedCount = votings.filter((v) => v?.status === 'closed').length;
  const totalVotesAcrossAll = votings.reduce((sum, v) => sum + (v?.totalVotes || 0), 0);

  const safeUser = currentUser || DEFAULT_USERS[0];
  const voterId = safeUser?.id || safeUser?.username || 'user-1';
  const isSuperAdminOrAdmin =
    Boolean(safeUser?.isSuperAdmin) ||
    Boolean(safeUser?.role?.toLowerCase().includes('ketua')) ||
    Boolean(safeUser?.role?.toLowerCase().includes('admin'));

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
      {/* 1. Header Section with Real-Time Indicator & Call to Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Vote className="w-3.5 h-3.5 text-blue-600" />
              <span>Fitur Voting Anggota</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Cloud Sync</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pemungutan Suara & Pemilihan Ketua Kegiatan
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Fasilitas demokrasi pemuda Karang Taruna Kelurahan Manis Jaya untuk pengambilan keputusan
            musyawarah, penentuan lokasi kegiatan, dan pemilihan ketua pelaksana secara langsung,
            transparan, dan real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Voting Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Top Snapshot Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block leading-tight">
              {totalVotingsCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Total Sesi Voting</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-lg font-black text-emerald-700 block leading-tight">
              {activeCount}
            </span>
            <span className="text-[11px] text-emerald-800 font-medium">Sedang Aktif (Live)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-lg font-black text-indigo-700 block leading-tight">
              {totalVotesAcrossAll}
            </span>
            <span className="text-[11px] text-indigo-800 font-medium">Suara Masuk</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <span className="text-lg font-black text-purple-700 block leading-tight">
              {closedCount} Selesai
            </span>
            <span className="text-[11px] text-purple-800 font-medium">Hasil Ditetapkan</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({totalVotingsCount})
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
              activeFilter === 'active'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Aktif ({activeCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('closed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === 'closed'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selesai / Terarsip ({closedCount})
          </button>
        </div>

        {/* Category Dropdown & Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pemilihan / kandidat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            <option value="ketua_kegiatan">👑 Ketua Kegiatan</option>
            <option value="musyawarah">🗳 Musyawarah</option>
            <option value="jadwal_lokasi">📍 Jadwal & Lokasi</option>
            <option value="anggaran">💰 Anggaran & Kas</option>
          </select>
        </div>
      </div>

      {/* 4. Voting Cards List */}
      <div className="space-y-5">
        {filteredVotings.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-50/80 border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Vote className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Tidak ada sesi voting ditemukan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || categoryFilter !== 'all' || activeFilter !== 'all'
                ? 'Coba ganti filter atau kata kunci pencarian Anda.'
                : 'Belum ada agenda pemungutan suara aktif. Buat sesi baru sekarang.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Mulai Sesi Voting Baru</span>
            </button>
          </div>
        ) : (
          filteredVotings.map((voting) => {
            const catMeta = getCategoryMeta(voting?.category);
            const CatIcon = catMeta.icon;
            const total = voting?.totalVotes || 0;
            const targetVotersCount = voting?.targetVoters || 30;
            const quorumPct = voting?.quorumPercentage || 50;
            const quorumTargetCount = Math.ceil((targetVotersCount * quorumPct) / 100);
            const quorumMet = total >= quorumTargetCount;
            const participationPct = Math.round((total / (targetVotersCount || 1)) * 100);

            // Determine leading candidate or winner
            const safeOptions = Array.isArray(voting?.options) ? voting.options : [];
            const sortedByVotes = [...safeOptions].sort((a, b) => (b?.votesCount || 0) - (a?.votesCount || 0));
            const leadingVotes = sortedByVotes[0]?.votesCount || 0;

            // Check if current user has voted in this voting
            const safeHistory = Array.isArray(voting?.voterHistory) ? voting.voterHistory : [];
            const userVoteRecord = safeHistory.find((h) => h?.userId === voterId);
            const hasUserVoted = Boolean(userVoteRecord);

            return (
              <div
                key={voting.id}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden bg-white ${
                  voting.status === 'active'
                    ? 'border-slate-200/90 shadow-sm hover:border-blue-300'
                    : 'border-slate-200 bg-slate-50/50 opacity-95'
                }`}
              >
                {/* Voting Card Top Ribbon */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-slate-50/50">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Category Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${catMeta.badgeColor}`}
                      >
                        <CatIcon className="w-3 h-3" />
                        <span>{catMeta.label}</span>
                      </span>

                      {/* Status Badge */}
                      {voting.status === 'active' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Sedang Berlangsung</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" />
                          <span>Selesai & Ditetapkan</span>
                        </span>
                      )}

                      {/* Quorum Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          quorumMet
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {quorumMet
                          ? `✓ Kuorum Sah (${participationPct}%)`
                          : `Menuju Kuorum (${voting.totalVotes}/${quorumTargetCount})`}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {voting.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {voting.description}
                    </p>
                  </div>

                  {/* Quorum & Quick Summary Meter on Right */}
                  <div className="shrink-0 flex flex-col sm:items-end justify-center gap-1">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        <strong>{voting.totalVotes}</strong> dari {voting.targetVoters} Anggota
                      </span>
                    </div>

                    {/* Mini Progress Bar for Quorum */}
                    <div className="w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          quorumMet ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(participationPct, 100)}%` }}
                      />
                    </div>

                    <span className="text-[10px] text-slate-400">
                      Inisiator: {voting.createdBy}
                    </span>
                  </div>
                </div>

                {/* Voting Options Interactive Grid */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Pilihan Suara & Kandidat ({voting.options.length}):
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Klik tombol untuk memberikan hak suara Anda
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {voting.options.map((opt) => {
                      const optPct = total > 0 ? Math.round((opt.votesCount / total) * 100) : 0;
                      const isVotedByUser = opt.voterIds.includes(voterId);
                      const isLeading =
                        leadingVotes > 0 && opt.votesCount === leadingVotes && total > 0;
                      const isCasting = castingVoteId === opt.id;

                      return (
                        <div
                          key={opt.id}
                          className={`relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between gap-3 overflow-hidden ${
                            isVotedByUser
                              ? 'bg-blue-50/70 border-blue-400 shadow-xs ring-1 ring-blue-400'
                              : isLeading && voting.status === 'closed'
                              ? 'bg-amber-50/50 border-amber-300'
                              : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {/* Visual Progress Background */}
                          <div
                            className={`absolute bottom-0 left-0 top-0 opacity-15 pointer-events-none transition-all duration-500 ${
                              isVotedByUser
                                ? 'bg-blue-600'
                                : isLeading
                                ? 'bg-emerald-600'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${optPct}%` }}
                          />

                          {/* Candidate / Option Header */}
                          <div className="relative z-10 flex items-start gap-3">
                            {/* Avatar or Icon */}
                            {opt.avatar ? (
                              <img
                                src={opt.avatar}
                                alt={opt.title}
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  if (!target.dataset.tried && opt.avatar) {
                                    target.dataset.tried = '1';
                                    const filename = opt.avatar.split('/').pop() || '';
                                    target.src = resolveAssetUrl(`/src/assets/images/${filename}`);
                                  } else if (target.dataset.tried === '1' && opt.avatar) {
                                    target.dataset.tried = '2';
                                    const filename = opt.avatar.split('/').pop() || '';
                                    target.src = resolveAssetUrl(`/assets/images/${filename}`);
                                  } else {
                                    target.style.display = 'none';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0 border border-blue-200">
                                {opt.title.slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-sm font-extrabold text-slate-900 truncate">
                                  {opt.title}
                                </h4>
                                {isLeading && total > 0 && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black flex items-center gap-0.5">
                                    <Crown className="w-3 h-3 text-amber-600" />
                                    <span>{voting.status === 'closed' ? 'Terpilih' : 'Unggul'}</span>
                                  </span>
                                )}
                                {isVotedByUser && (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center gap-0.5 shadow-2xs">
                                    <Check className="w-3 h-3" />
                                    <span>Pilihan Anda</span>
                                  </span>
                                )}
                              </div>

                              {opt.subtitle && (
                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                  {opt.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar & Vote Count */}
                          <div className="relative z-10 space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-black text-slate-800 text-sm">
                                {opt.votesCount} <span className="text-[11px] font-normal text-slate-500">Suara</span>
                              </span>
                              <span className="font-extrabold text-blue-700 text-xs">
                                {optPct}%
                              </span>
                            </div>

                            <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  isVotedByUser
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                                    : isLeading
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                    : 'bg-gradient-to-r from-slate-400 to-slate-500'
                                }`}
                                style={{ width: `${optPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Action Button: Beri Suara / Ganti Pilihan */}
                          <div className="relative z-10 pt-1">
                            {voting.status === 'active' ? (
                              <button
                                type="button"
                                disabled={isCasting}
                                onClick={() => handleVote(voting.id, opt.id)}
                                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                  isVotedByUser
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                    : 'bg-white hover:bg-blue-600 text-slate-800 hover:text-white border border-slate-200 hover:border-blue-600 shadow-2xs'
                                }`}
                              >
                                {isVotedByUser ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Sudah Dipilih (Tersimpan)</span>
                                  </>
                                ) : (
                                  <>
                                    <Vote className="w-3.5 h-3.5" />
                                    <span>
                                      {hasUserVoted ? 'Ganti ke Opsi Ini' : 'Pilih Opsi Ini'}
                                    </span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="text-center py-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-xl">
                                {isLeading ? '👑 Keputusan Resmi Forum' : 'Voting Telah Ditutup'}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audit Trail & Voters Ribbon */}
                <div className="px-4 sm:px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Pemilih Tercatat ({safeHistory.length}):</span>
                    </span>

                    {safeHistory.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">
                        Belum ada suara masuk. Jadilah yang pertama memberikan suara!
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {safeHistory.slice(0, 4).map((h, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-semibold text-slate-700"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {h?.userName || 'Anggota'}
                          </span>
                        ))}
                        {safeHistory.length > 4 && (
                          <span className="text-[10px] text-slate-500 font-bold">
                            +{safeHistory.length - 4} lainnya
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions for this Voting */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {/* Berita Acara Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedVotingForBeritaAcara(voting)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-600" />
                      <span>Berita Acara (PDF)</span>
                    </button>

                    {/* Admin Controls */}
                    {isSuperAdminOrAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleVotingStatus(voting.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                            voting.status === 'active'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                          title={voting.status === 'active' ? 'Tutup sesi voting' : 'Buka kembali'}
                        >
                          {voting.status === 'active' ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Tutup</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Buka Kembali</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResetVotes(voting.id)}
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                          title="Reset Suara"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteVoting(voting.id)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-rose-500 hover:text-rose-700 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                          title="Hapus Sesi Voting"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Voting Modal */}
      {showCreateModal && (
        <CreateVotingModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateVoting}
          currentUser={currentUser}
        />
      )}

      {/* Berita Acara & Print Export Modal */}
      {selectedVotingForBeritaAcara && (
        <VotingBeritaAcaraModal
          isOpen={Boolean(selectedVotingForBeritaAcara)}
          onClose={() => setSelectedVotingForBeritaAcara(null)}
          voting={selectedVotingForBeritaAcara}
          onToast={onToast}
        />
      )}
    </div>
  );
};
