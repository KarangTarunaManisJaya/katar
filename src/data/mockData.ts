import { Pengurus, AgendaEvent, KasTransaction, UmkmProduct, Aspiration } from '../types';

export const ORGANISASI_INFO = {
  name: 'Karang Taruna Manis Jaya',
  tagline: 'Aditya Karya Mahatva Yodha',
  subtagline: 'Pemuda Berdaya, Berbudaya, dan Mandiri untuk Manis Jaya Maju',
  wilayah: 'Kelurahan Manis Jaya, Kecamatan Jatiuwung, Kota Tangerang',
  kota: 'Kota Tangerang, Banten',
  periode: 'Masa Bakti 2024 - 2027',
  sekretariat: 'Balai Pemuda & Warga Kelurahan Manis Jaya, Jl. Pajajaran No. 12, Kec. Jatiuwung, Kota Tangerang, Banten 15136',
  githubRepo: 'https://github.com/jalansuci19-create/karang-taruna-manis-jaya',
  kontak: {
    whatsapp: '081289123456',
    email: 'karangtarunamanisjaya@gmail.com',
    instagram: '@karangtarunamanisjaya',
    youtube: 'Karang Taruna Manis Jaya Official',
  },
  stats: [
    { label: 'Pemuda Terdaftar', value: 0, unit: 'Orang' },
    { label: 'Program Berjalan', value: 0, unit: 'Agenda' },
    { label: 'UMKM Pemuda', value: 0, unit: 'Usaha' },
    { label: 'Transparansi Kas', value: 100, unit: '%' },
  ]
};

// Data pengurus, agenda, transaksi kas, UMKM, dan aspirasi: Bersih & kosong saat peluncuran sistem
export const MOCK_PENGURUS: Pengurus[] = [];
export const MOCK_EVENTS: AgendaEvent[] = [];
export const MOCK_TRANSACTIONS: KasTransaction[] = [];
export const MOCK_UMKM: UmkmProduct[] = [];
export const MOCK_ASPIRATIONS: Aspiration[] = [];
