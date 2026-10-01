import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  Wallet,
  Sparkles,
  PieChart as PieIcon,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

// Unified interface for activity data
interface ActivityDataPoint {
  label: string;
  kegiatan: number;
  peserta: number;
  anggaran: number;
  subLabel?: string;
  [key: string]: any;
}

// 1. Data Laporan Per Hari (7 Hari Terakhir)
const DATA_HARIAN: ActivityDataPoint[] = [
  { label: 'Senin', tanggal: '22 Sep', kegiatan: 2, peserta: 45, anggaran: 450, kategori: 'Rapat & Sosialisasi' },
  { label: 'Selasa', tanggal: '23 Sep', kegiatan: 1, peserta: 25, anggaran: 200, kategori: 'Administrasi RW' },
  { label: 'Rabu', tanggal: '24 Sep', kegiatan: 3, peserta: 80, anggaran: 850, kategori: 'Pelatihan Pemuda' },
  { label: 'Kamis', tanggal: '25 Sep', kegiatan: 2, peserta: 60, anggaran: 600, kategori: 'Senam Pagi' },
  { label: 'Jumat', tanggal: '26 Sep', kegiatan: 4, peserta: 110, anggaran: 1200, kategori: 'Jumat Berkah & Santunan' },
  { label: 'Sabtu', tanggal: '27 Sep', kegiatan: 6, peserta: 185, anggaran: 2400, kategori: 'Gotong Royong & Futsal' },
  { label: 'Minggu', tanggal: '28 Sep', kegiatan: 5, peserta: 160, anggaran: 2100, kategori: 'Turnamen & Bazar UMKM' },
];

// 2. Data Laporan Per Bulan (Tahun 2026)
const DATA_BULANAN: ActivityDataPoint[] = [
  { label: 'Jan', bulanLengkap: 'Januari 2026', kegiatan: 5, peserta: 190, anggaran: 3.2, target: 4 },
  { label: 'Feb', bulanLengkap: 'Februari 2026', kegiatan: 6, peserta: 240, anggaran: 3.8, target: 5 },
  { label: 'Mar', bulanLengkap: 'Maret 2026', kegiatan: 8, peserta: 350, anggaran: 4.5, target: 6 },
  { label: 'Apr', bulanLengkap: 'April 2026', kegiatan: 7, peserta: 290, anggaran: 4.1, target: 6 },
  { label: 'Mei', bulanLengkap: 'Mei 2026', kegiatan: 9, peserta: 410, anggaran: 5.6, target: 7 },
  { label: 'Jun', bulanLengkap: 'Juni 2026', kegiatan: 11, peserta: 520, anggaran: 6.8, target: 8 },
  { label: 'Jul', bulanLengkap: 'Juli 2026', kegiatan: 12, peserta: 590, anggaran: 7.4, target: 9 },
  { label: 'Agu', bulanLengkap: 'Agustus 2026', kegiatan: 16, peserta: 920, anggaran: 10.5, target: 12 },
  { label: 'Sep', bulanLengkap: 'September 2026', kegiatan: 10, peserta: 480, anggaran: 5.9, target: 8 },
  { label: 'Okt', bulanLengkap: 'Oktober 2026 (Est.)', kegiatan: 8, peserta: 390, anggaran: 4.8, target: 7 },
  { label: 'Nov', bulanLengkap: 'November 2026 (Est.)', kegiatan: 7, peserta: 340, anggaran: 4.2, target: 6 },
  { label: 'Des', bulanLengkap: 'Desember 2026 (Est.)', kegiatan: 11, peserta: 610, anggaran: 7.2, target: 9 },
];

// 3. Data Laporan Per Tahun (Multi-Tahun 2022 - 2026)
const DATA_TAHUNAN: ActivityDataPoint[] = [
  { label: '2022', tahun: '2022', kegiatan: 34, peserta: 1650, anggaran: 22.5, kepuasan: 84 },
  { label: '2023', tahun: '2023', kegiatan: 48, peserta: 2300, anggaran: 31.0, kepuasan: 88 },
  { label: '2024', tahun: '2024', kegiatan: 66, peserta: 3400, anggaran: 42.5, kepuasan: 91 },
  { label: '2025', tahun: '2025', kegiatan: 86, peserta: 4750, anggaran: 56.8, kepuasan: 94 },
  { label: '2026', tahun: '2026 (Berjalan)', kegiatan: 110, peserta: 5340, anggaran: 68.4, kepuasan: 96 },
];

// 4. Data Distribusi Kategori Kegiatan
const DATA_KATEGORI = [
  { name: 'Olahraga & Turnamen', value: 34, color: '#2563eb' },
  { name: 'Sosial & Bakti Warga', value: 28, color: '#10b981' },
  { name: 'Kepemudaan & Pelatihan', value: 20, color: '#8b5cf6' },
  { name: 'Lingkungan & Gotong Royong', value: 12, color: '#f59e0b' },
  { name: 'Kesenian & Keagamaan', value: 6, color: '#ec4899' },
];

interface KegiatanVisualisasiChartsProps {
  onToast: (msg: string) => void;
}

export const KegiatanVisualisasiCharts: React.FC<KegiatanVisualisasiChartsProps> = ({ onToast }) => {
  const [periode, setPeriode] = useState<'harian' | 'bulanan' | 'tahunan'>('bulanan');
  const [metric, setMetric] = useState<'kegiatan' | 'peserta' | 'anggaran'>('kegiatan');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'pie'>('area');

  // Active dataset according to selected period
  const activeData =
    periode === 'harian' ? DATA_HARIAN : periode === 'bulanan' ? DATA_BULANAN : DATA_TAHUNAN;

  // Formatting helpers for Tooltips
  const formatTooltipValue = (value: number) => {
    if (metric === 'kegiatan') return [`${value} Kegiatan`, 'Jumlah Agenda'];
    if (metric === 'peserta') return [`${value} Orang`, 'Partisipasi Warga'];
    if (metric === 'anggaran') {
      if (periode === 'harian') return [`Rp ${value}.000`, 'Dana Kegiatan'];
      return [`Rp ${value} Juta`, 'Realisasi Anggaran'];
    }
    return [value, 'Nilai'];
  };

  const getMetricTitle = () => {
    switch (metric) {
      case 'kegiatan':
        return 'Jumlah Kegiatan Terselenggara';
      case 'peserta':
        return 'Partisipasi Pemuda & Warga (Jiwa)';
      case 'anggaran':
        return periode === 'harian' ? 'Anggaran Kegiatan (Ribu Rp)' : 'Realisasi Anggaran (Juta Rp)';
    }
  };

  // Color scheme based on metric
  const getChartColor = () => {
    switch (metric) {
      case 'kegiatan':
        return { stroke: '#2563eb', fill: '#3b82f6', gradientId: 'colorKegiatan' };
      case 'peserta':
        return { stroke: '#10b981', fill: '#10b981', gradientId: 'colorPeserta' };
      case 'anggaran':
        return { stroke: '#8b5cf6', fill: '#8b5cf6', gradientId: 'colorAnggaran' };
    }
  };

  const activeColor = getChartColor();

  const handleExportData = () => {
    onToast(`Grafik laporan kegiatan (${periode}) berhasil diekspor!`);
  };

  const handlePrintReport = () => {
    window.print();
    onToast('Membuka pratinjau cetak laporan visual kegiatan...');
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 lg:p-7 shadow-xs space-y-6">
      {/* 1. Header with Title & Period Selector Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                Visualisasi Data Kegiatan
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Recharts Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Grafik analitik realisasi kegiatan, keterlibatan warga, dan serapan anggaran.
            </p>
          </div>
        </div>

        {/* Period Selector Tabs: Per Hari | Per Bulan | Per Tahun */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => {
                setPeriode('harian');
                onToast('Menampilkan grafik laporan kegiatan per hari (7 hari terakhir)');
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                periode === 'harian'
                  ? 'bg-white text-blue-600 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per Hari
            </button>
            <button
              onClick={() => {
                setPeriode('bulanan');
                onToast('Menampilkan grafik laporan kegiatan per bulan (Tahun 2026)');
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                periode === 'bulanan'
                  ? 'bg-white text-blue-600 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per Bulan
            </button>
            <button
              onClick={() => {
                setPeriode('tahunan');
                onToast('Menampilkan tren multi-tahun (2022 - 2026)');
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                periode === 'tahunan'
                  ? 'bg-white text-blue-600 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per Tahun
            </button>
          </div>

          {/* Export / Print Buttons */}
          <button
            onClick={handleExportData}
            title="Ekspor CSV / Data"
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrintReport}
            title="Cetak Laporan"
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top 4 Summary Cards based on Selected Period */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Kegiatan */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Total Agenda</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {periode === 'harian' ? '23' : periode === 'bulanan' ? '110' : '344'}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +18.4% vs periode lalu
          </span>
        </div>

        {/* Card 2: Total Peserta */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Partisipasi Warga</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {periode === 'harian' ? '665' : periode === 'bulanan' ? '5.340' : '17.490'}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +24% pemuda aktif
          </span>
        </div>

        {/* Card 3: Total Anggaran */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Alokasi Dana</span>
            <Wallet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {periode === 'harian' ? 'Rp 7,8 Jt' : periode === 'bulanan' ? 'Rp 68,4 Jt' : 'Rp 226 Jt'}
          </div>
          <span className="text-[10px] text-blue-600 font-bold">100% Akuntabel & Terverifikasi</span>
        </div>

        {/* Card 4: Status Penyelesaian */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold">Tingkat Keberhasilan</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">96.8%</div>
          <span className="text-[10px] text-slate-500">Berdasarkan umpan balik warga</span>
        </div>
      </div>

      {/* 3. Sub Controls: Metric Selector & Chart Type Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Metric Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Metrik:
          </span>
          <button
            onClick={() => setMetric('kegiatan')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              metric === 'kegiatan'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Jumlah Kegiatan
          </button>
          <button
            onClick={() => setMetric('peserta')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              metric === 'peserta'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Partisipasi Warga
          </button>
          <button
            onClick={() => setMetric('anggaran')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              metric === 'anggaran'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Realisasi Anggaran
          </button>
        </div>

        {/* Chart Style Toggle: Area / Bar / Pie */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 rounded-lg transition-all ${
              chartType === 'area' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Area & Tren
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-lg transition-all ${
              chartType === 'bar' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Batang (Bar)
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded-lg transition-all ${
              chartType === 'pie' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Kategori (Pie)
          </button>
        </div>
      </div>

      {/* 4. MAIN RECHARTS VISUALIZATION AREA */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/80 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">
              {chartType === 'pie' ? 'Distribusi Kegiatan Menurut Bidang' : getMetricTitle()}
            </h4>
            <p className="text-[11px] text-slate-500">
              {periode === 'harian'
                ? 'Laporan harian rentang 22 September - 28 September 2026'
                : periode === 'bulanan'
                ? 'Laporan bulanan Karang Taruna Kelurahan Manis Jaya Tahun 2026'
                : 'Laporan komparatif multi-tahun kepengurusan'}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
            {periode === 'harian' ? '7 Hari' : periode === 'bulanan' ? '12 Bulan' : '5 Tahun'}
          </span>
        </div>

        {/* Dynamic Chart Display */}
        <div className="w-full h-72 sm:h-80">
          {chartType === 'area' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeColor.fill} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={activeColor.fill} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => formatTooltipValue(Number(val) || 0) as any}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={activeColor.stroke}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#areaGradient)"
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: activeColor.stroke }}
                  activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: activeColor.stroke }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartType === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => formatTooltipValue(Number(val) || 0) as any}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey={metric}
                  fill={activeColor.fill}
                  radius={[8, 8, 0, 0]}
                  barSize={periode === 'harian' ? 28 : periode === 'bulanan' ? 18 : 36}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === 'pie' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DATA_KATEGORI}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name || ''}: ${(Number(percent || 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {DATA_KATEGORI.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}% dari Total Kegiatan`, 'Proporsi'] as any}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-700 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 5. Bottom Insights Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">
              Puncak Kegiatan: Bulan Agustus 2026 (16 Agenda, 920 Partisipan)
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Kegiatan paling diminati adalah Turnamen Olahraga & Peringatan Hari Kemerdekaan RI di Manis Jaya.
            </p>
          </div>
        </div>
        <button
          onClick={() => onToast('Membuka rekap analitik komprehensif kelembagaan')}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-600 shrink-0 shadow-2xs transition-colors"
        >
          Lihat Rincian Laporan
        </button>
      </div>
    </div>
  );
};
