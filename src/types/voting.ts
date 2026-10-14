export type VotingCategory =
  | 'ketua_kegiatan'
  | 'musyawarah'
  | 'jadwal_lokasi'
  | 'anggaran';

export interface VotingOption {
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  votesCount: number;
  voterIds: string[]; // List of user IDs or usernames who voted for this option
}

export interface VoterRecord {
  userId: string;
  userName: string;
  userRole?: string;
  avatar?: string;
  optionId: string;
  optionTitle: string;
  votedAt: string;
}

export interface VotingItem {
  id: string;
  title: string;
  category: VotingCategory;
  description: string;
  status: 'active' | 'closed';
  startDate: string;
  endDate: string;
  targetVoters: number;
  quorumPercentage: number;
  options: VotingOption[];
  totalVotes: number;
  voterHistory: VoterRecord[];
  createdBy: string;
  createdAt: string;
  closedAt?: string;
  resultSummary?: string;
}
