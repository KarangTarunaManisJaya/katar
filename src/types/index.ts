export interface Pengurus {
  id: string;
  name: string;
  role: string;
  division: string;
  period: string;
  photoUrl?: string;
  phone?: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  category: 'Olahraga' | 'Sosial & Lingkungan' | 'Pelatihan' | 'Peringatan Hari Besar' | 'Seni & Budaya';
  date: string;
  time: string;
  location: string;
  description: string;
  quota: number;
  registeredCount: number;
  image: string;
  status: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai';
}

export interface KasTransaction {
  id: string;
  date: string;
  description: string;
  category: 'Iuran Warga' | 'Kas Rutin' | 'Donasi' | 'Dana Desa' | 'Kegiatan' | 'Operasional';
  type: 'in' | 'out';
  amount: number;
  pic: string;
  receiptNote?: string;
}

export interface UmkmProduct {
  id: string;
  name: string;
  category: 'Kuliner' | 'Fashion & Merchandise' | 'Jasa Kreatif' | 'Kerajinan Tangan' | 'Agrobisnis';
  owner: string;
  rtRw: string;
  price: number;
  priceUnit?: string;
  description: string;
  whatsapp: string;
  image: string;
  rating?: number;
}

export interface MemberKTA {
  id: string;
  ktaNumber: string;
  fullName: string;
  nik: string;
  rtRw: string;
  interest: string;
  phone: string;
  joinDate: string;
  status: 'Aktif';
}

export interface Aspiration {
  id: string;
  author: string;
  rtRw: string;
  category: 'Fasilitas & Olahraga' | 'Kebersihan & Lingkungan' | 'Pelatihan Pemuda' | 'Keamanan Lingkungan';
  title: string;
  content: string;
  votes: number;
  status: 'Diajukan' | 'Ditinjau Pengurus' | 'Dalam Realisasi' | 'Selesai';
  createdAt: string;
  response?: string;
}
