import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, FileText, PlusCircle, Search, ShieldCheck, Download } from 'lucide-react';
import { KasTransaction } from '../types';

interface FinanceSectionProps {
  transactions: KasTransaction[];
  onAddTransaction: (trx: Omit<KasTransaction, 'id'>) => void;
  onToast: (msg: string) => void;
}

export const FinanceSection: React.FC<FinanceSectionProps> = ({
  transactions,
  onAddTransaction,
  onToast,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New transaction modal form state
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'in' | 'out'>('in');
  const [category, setCategory] = useState<KasTransaction['category']>('Iuran Warga');
  const [pic, setPic] = useState('');
  const [receiptNote, setReceiptNote] = useState('');

  // Calculations
  const totalIn = transactions
    .filter((t) => t.type === 'in')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalOut = transactions
    .filter((t) => t.type === 'out')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBalance = totalIn - totalOut;

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.pic.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(amount.replace(/\D/g, ''), 10);
    if (!desc.trim() || isNaN(num) || num <= 0 || !pic.trim()) {
      return;
    }

    const todayStr = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());

    onAddTransaction({
      date: todayStr,
      description: desc,
      category,
      type,
      amount: num,
      pic,
      receiptNote: receiptNote || 'Tercatat otomatis oleh sistem portal',
    });

    onToast('Transaksi kas baru berhasil dicatat dan diverifikasi!');
    setShowAddModal(false);
    setDesc('');
    setAmount('');
    setPic('');
    setReceiptNote('');
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <section id="kas" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-2">
              Akuntabilitas Publik
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
              Transparansi Kas & Penggunaan Anggaran
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
              Seluruh penerimaan iuran warga, bantuan dana desa, serta alokasi belanja kegiatan dipublikasikan secara terbuka untuk menjaga integritas dan kepercayaan warga.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              Catat Penerimaan / Pengeluaran
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Cetak Rekap
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Current Balance */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">Saldo Kas Tersedia</span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatRupiah(currentBalance)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Teraudit berkala bersama Pembina Kelurahan</span>
            </div>
          </div>

          {/* Total In */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">Total Pemasukan (Bulan Ini)</span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight tabular-nums">
              {formatRupiah(totalIn)}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Dari iuran wajib, donasi warga, dan dana kelurahan
            </div>
          </div>

          {/* Total Out */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">Total Pengeluaran (Bulan Ini)</span>
              <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 tracking-tight tabular-nums">
              {formatRupiah(totalOut)}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Belanja logistik kegiatan, pemeliharaan sarana & alat
            </div>
          </div>
        </div>

        {/* Ledger Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi, PIC, atau kegiatan..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Transaksi
              </button>
              <button
                onClick={() => setFilterType('in')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'in'
                    ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => setFilterType('out')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'out'
                    ? 'bg-white text-rose-700 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pengeluaran
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-xs text-slate-600 uppercase">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Tanggal</th>
                  <th className="py-3.5 px-6 font-semibold">Deskripsi Alokasi</th>
                  <th className="py-3.5 px-4 font-semibold">Kategori</th>
                  <th className="py-3.5 px-6 font-semibold">PIC / Penanggung Jawab</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                      Tidak ada catatan transaksi yang sesuai dengan pencarian Anda.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap tabular-nums">
                        {trx.date}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {trx.description}
                        </div>
                        {trx.receiptNote && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {trx.receiptNote}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-700">
                          {trx.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                        {trx.pic}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <span
                          className={`font-bold tabular-nums text-xs sm:text-sm ${
                            trx.type === 'in' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {trx.type === 'in' ? '+' : '-'} {formatRupiah(trx.amount)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Catat Transaksi Kas Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('in')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      type === 'in'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    + Pemasukan (Kas Masuk)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('out')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      type === 'out'
                        ? 'bg-rose-50 text-rose-700 border-rose-500'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    - Pengeluaran (Belanja/Biaya)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as KasTransaction['category'])}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Iuran Warga">Iuran Warga</option>
                  <option value="Kas Rutin">Kas Rutin Anggota</option>
                  <option value="Donasi">Donasi / Sponsor</option>
                  <option value="Dana Desa">Dana Kelurahan / Desa</option>
                  <option value="Kegiatan">Kegiatan & Lomba</option>
                  <option value="Operasional">Operasional & Perlengkapan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Transaksi *
                </label>
                <input
                  type="text"
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Contoh: Iuran kas bulanan pemuda RT 02"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal (Rupiah) *
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Contoh: 250000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIC / Penanggung Jawab *
                </label>
                <input
                  type="text"
                  required
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  placeholder="Contoh: Bendahara / Ketua RT"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Bukti / Keterangan Kwitansi
                </label>
                <input
                  type="text"
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  placeholder="Kwitansi No. 12/IX/2026"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
