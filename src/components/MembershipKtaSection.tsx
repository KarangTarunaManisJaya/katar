import React, { useState } from 'react';
import { CreditCard, QrCode, Download, Check, Sparkles, UserCheck, Shield, Printer } from 'lucide-react';
import { ORGANISASI_INFO } from '../data/mockData';

interface MembershipKtaSectionProps {
  onToast: (msg: string) => void;
}

export const MembershipKtaSection: React.FC<MembershipKtaSectionProps> = ({ onToast }) => {
  const [fullName, setFullName] = useState('Dimas Wahyu Pratama');
  const [nik, setNik] = useState('3275081908990003');
  const [rtRw, setRtRw] = useState('RT 03 / RW 04');
  const [interest, setInterest] = useState('Bidang Kewirausahaan & UMKM');
  const [phone, setPhone] = useState('081298765432');
  const [showNik, setShowNik] = useState(false);
  const [isGenerated, setIsGenerated] = useState(true);

  const ktaNumber = `KT-MJ/2026/${nik.slice(-4) || '1042'}`;
  const validUntil = 'Desember 2027';

  const maskedNik = showNik
    ? nik
    : nik.length >= 8
    ? `${nik.slice(0, 4)}••••••••${nik.slice(-4)}`
    : nik;

  const handlePrint = () => {
    window.print();
    onToast('Menyiapkan pratinjau cetak Kartu Tanda Anggota (E-KTA)...');
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(ktaNumber);
    onToast(`Nomor KTA ${ktaNumber} berhasil disalin!`);
  };

  return (
    <section id="kta-section" className="py-16 sm:py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Form: Registration & Customizer */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
                Kartu Tanda Anggota Digital
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
                Penerbitan E-KTA Pemuda Mandiri
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Setiap pemuda usia 13–45 tahun yang berdomisili di Kelurahan Manis Jaya berhak mendapatkan identitas resmi keanggotaan Karang Taruna untuk kemudahan akses pelatihan dan program kemitraan.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap Sesuai KTP / KK
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      NIK (16 Digit)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNik(!showNik)}
                      className="text-[11px] text-blue-400 hover:text-blue-300"
                    >
                      {showNik ? 'Sembunyikan' : 'Perlihatkan'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    placeholder="3275..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Wilayah Domisili RT / RW
                  </label>
                  <input
                    type="text"
                    value={rtRw}
                    onChange={(e) => setRtRw(e.target.value)}
                    placeholder="Contoh: RT 02 / RW 04"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Peminatan Divisi / Bakat Utama
                </label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Bidang Kepemudaan & Olahraga">Bidang Kepemudaan & Olahraga</option>
                  <option value="Bidang Kewirausahaan & UMKM">Bidang Kewirausahaan & UMKM</option>
                  <option value="Bidang Kesejahteraan Sosial & Relawan">Bidang Kesejahteraan Sosial & Relawan</option>
                  <option value="Bidang Komunikasi, IT & Media">Bidang Komunikasi, IT & Media</option>
                  <option value="Bidang Seni Budaya & Tradisi">Bidang Seni Budaya & Tradisi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor WhatsApp Aktif
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Cetak / Unduh E-KTA
                </button>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 transition-colors"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  Salin Nomor KTA
                </button>
              </div>
            </div>
          </div>

          {/* Right Preview: Dignified Indonesian Karang Taruna Electronic Card */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pratinjau Kartu Tanda Anggota Resmi (Live Preview)</span>
            </div>

            {/* The E-KTA Card Component */}
            <div className="w-full max-w-md bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-2xl p-6 border-2 border-amber-400/40 shadow-2xl relative overflow-hidden">
              {/* Card Gold Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500" />

              {/* Watermark Crest */}
              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-blue-600/10 blur-xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-sm shadow-md">
                    KT
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">
                      KARTU TANDA ANGGOTA ELEKTRONIK
                    </div>
                    <div className="text-sm font-extrabold text-white tracking-wide">
                      {ORGANISASI_INFO.name}
                    </div>
                    <div className="text-[9px] text-slate-300">
                      {ORGANISASI_INFO.wilayah}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    STATUS AKTIF
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Photo Placeholder */}
                <div className="col-span-4">
                  <div className="w-full aspect-[3/4] rounded-xl bg-slate-800 border border-amber-400/30 overflow-hidden flex flex-col items-center justify-center text-center p-2">
                    <div className="w-12 h-12 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-base mb-1 shadow">
                      {fullName ? fullName.slice(0, 2).toUpperCase() : 'KT'}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">FOTO DIGITAL</span>
                  </div>
                </div>

                {/* Member Details */}
                <div className="col-span-8 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Nomor Anggota</span>
                    <span className="font-mono font-bold text-amber-300 tracking-wider text-sm tabular-nums">
                      {ktaNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Nama Lengkap</span>
                    <span className="font-bold text-white text-sm line-clamp-1">
                      {fullName || 'Nama Calon Anggota'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">NIK</span>
                      <span className="font-mono text-slate-200 text-[11px] tabular-nums">
                        {maskedNik || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Wilayah</span>
                      <span className="font-semibold text-slate-200 text-[11px]">
                        {rtRw || '-'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Divisi Peminatan</span>
                    <span className="text-blue-300 font-medium text-[11px] line-clamp-1">
                      {interest}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <div>
                  <span>Berlaku s/d: </span>
                  <span className="text-slate-200 font-medium">{validUntil}</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[9px] text-slate-400">
                  <QrCode className="w-3.5 h-3.5 text-amber-300" />
                  <span>KTA-VERIFIED</span>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-slate-400 mt-4 max-w-sm">
              Kartu ini sah sebagai identitas anggota di lingkungan Kelurahan Manis Jaya untuk hak suara rapat temu karya dan pendaftaran pelatihan kerja.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
