import React from 'react';
import { Printer, ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { ProposalItem } from '../../../types/proposal';

interface ProposalPrintViewProps {
  proposal: ProposalItem;
  onBack: () => void;
  onToast: (msg: string) => void;
}

export const ProposalPrintView: React.FC<ProposalPrintViewProps> = ({ proposal, onBack, onToast }) => {
  const currentYear = new Date().getFullYear();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden on print) */}
      <div className="print:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Proposal
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF (A4)
          </button>
        </div>
      </div>

      {/* Official A4 Document Container */}
      <div className="bg-white max-w-4xl mx-auto p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 font-serif leading-relaxed text-sm">
        {/* Kop Surat Resmi */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center relative">
          <div className="flex items-center justify-between gap-4">
            <div className="w-20 h-20 flex items-center justify-center p-1 border border-slate-300 rounded-full shrink-0">
              <img
                src="/assets/images/manis_jaya_gate_1790588960710.jpg"
                alt="Logo Karang Taruna"
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex-1 text-center font-sans">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-slate-700">
                PENGURUS KARANG TARUNA KELURAHAN MANIS JAYA
              </h3>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-950 tracking-wide mt-0.5">
                KARANG TARUNA MANIS JAYA
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Kecamatan Jatiuwung, Kota Tangerang, Provinsi Banten 15136
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Sekretariat: Jl. Raya Manis Jaya No. 01 | Email: karangtaruna@manisjaya.desa.id | Telp: (021) 590-2134
              </p>
            </div>

            <div className="w-20 shrink-0 hidden sm:block text-right">
              <span className="text-[10px] font-mono font-bold text-slate-400">REV-2026/A4</span>
            </div>
          </div>
        </div>

        {/* Judul & Nomor Proposal */}
        <div className="text-center font-sans mb-8">
          <h1 className="text-lg sm:text-xl font-black uppercase text-slate-950 tracking-wide underline underline-offset-4">
            PROPOSAL KEGIATAN
          </h1>
          <h2 className="text-base sm:text-lg font-bold text-blue-900 mt-1 uppercase">
            {proposal.judul}
          </h2>
          <p className="text-xs font-mono text-slate-600 mt-1">
            Nomor: <strong>{proposal.nomorProposal}</strong>
          </p>
          {proposal.tema && (
            <p className="text-xs italic text-slate-700 mt-1">
              "Tema: {proposal.tema}"
            </p>
          )}
        </div>

        {/* Batang Tubuh Proposal */}
        <div className="space-y-6 text-justify leading-relaxed">
          {/* 1. Latar Belakang */}
          <div>
            <h4 className="font-sans font-bold text-slate-950 text-sm mb-1 uppercase tracking-wide">
              I. LATAR BELAKANG
            </h4>
            <p className="indent-8 text-slate-800 whitespace-pre-line leading-relaxed">{proposal.latarBelakang}</p>
          </div>

          {/* 2. Dasar Kegiatan */}
          <div>
            <h4 className="font-sans font-bold text-slate-950 text-sm mb-1 uppercase tracking-wide">
              II. DASAR KEGIATAN
            </h4>
            <p className="text-slate-800 whitespace-pre-line leading-relaxed pl-4">{proposal.dasarKegiatan}</p>
          </div>

          {/* 3. Maksud dan Tujuan */}
          <div>
            <h4 className="font-sans font-bold text-slate-950 text-sm mb-1 uppercase tracking-wide">
              III. MAKSUD DAN TUJUAN
            </h4>
            <p className="text-slate-800 whitespace-pre-line leading-relaxed pl-4">{proposal.maksudDanTujuan}</p>
          </div>

          {/* 4. Bentuk Kegiatan dan Target Peserta */}
          <div>
            <h4 className="font-sans font-bold text-slate-950 text-sm mb-1 uppercase tracking-wide">
              IV. BENTUK KEGIATAN & SASARAN PESERTA
            </h4>
            <p className="indent-8 text-slate-800 leading-relaxed mb-2">{proposal.bentukKegiatan}</p>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded font-sans text-xs">
              <span className="font-bold">Target Peserta:</span> {proposal.targetPeserta}
            </div>
          </div>

          {/* 5. Waktu dan Tempat */}
          <div>
            <h4 className="font-sans font-bold text-slate-950 text-sm mb-1 uppercase tracking-wide">
              V. WAKTU DAN TEMPAT PELAKSANAAN
            </h4>
            <table className="w-full font-sans text-xs border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 font-bold bg-slate-100 w-44">Hari / Tanggal</td>
                  <td className="py-2 px-3">{proposal.tanggalKegiatan}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 font-bold bg-slate-100">Lokasi / Tempat</td>
                  <td className="py-2 px-3">{proposal.lokasiKegiatan}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-100">Penanggung Jawab</td>
                  <td className="py-2 px-3">{proposal.penanggungJawab} ({proposal.bidangSeksi})</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 6. Susunan Kepanitiaan */}
          <div className="break-before-page">
            <h4 className="font-sans font-bold text-slate-950 text-sm mb-2 uppercase tracking-wide">
              VI. SUSUNAN KEPANITIAAN
            </h4>
            <div className="font-sans text-xs space-y-1.5 pl-4">
              <p><strong>Pelindung:</strong> {proposal.kepanitiaan.pelindung}</p>
              <p><strong>Penanggung Jawab:</strong> {proposal.kepanitiaan.penanggungJawab}</p>
              <p><strong>Ketua Panitia:</strong> {proposal.kepanitiaan.ketuaPanitia}</p>
              <p><strong>Wakil Ketua:</strong> {proposal.kepanitiaan.wakilKetua || '-'}</p>
              <p><strong>Sekretaris:</strong> {proposal.kepanitiaan.sekretaris}</p>
              <p><strong>Bendahara:</strong> {proposal.kepanitiaan.bendahara}</p>
              <div className="pt-1.5 grid grid-cols-2 gap-2">
                <p><strong>Seksi Acara:</strong> {proposal.kepanitiaan.seksiAcara.join(', ') || '-'}</p>
                <p><strong>Seksi Humas:</strong> {proposal.kepanitiaan.seksiHumas.join(', ') || '-'}</p>
                <p><strong>Seksi Konsumsi:</strong> {proposal.kepanitiaan.seksiKonsumsi.join(', ') || '-'}</p>
                <p><strong>Seksi Perlengkapan:</strong> {proposal.kepanitiaan.seksiPerlengkapan.join(', ') || '-'}</p>
                <p><strong>Seksi Dokumentasi:</strong> {proposal.kepanitiaan.seksiDokumentasi.join(', ') || '-'}</p>
                <p><strong>Seksi Keamanan:</strong> {proposal.kepanitiaan.seksiKeamanan.join(', ') || '-'}</p>
              </div>
            </div>
          </div>

          {/* 7. Rencana Anggaran Biaya (RAB) */}
          <div className="break-inside-avoid">
            <h4 className="font-sans font-bold text-slate-950 text-sm mb-2 uppercase tracking-wide">
              VII. RENCANA ANGGARAN BIAYA (RAB)
            </h4>
            <table className="w-full font-sans text-xs border border-slate-300 border-collapse">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-2 text-center border-r border-slate-300 w-10">No</th>
                  <th className="py-2 px-3 text-left border-r border-slate-300">Uraian Kebutuhan</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300 w-14">Vol</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300 w-16">Satuan</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300">Harga Satuan</th>
                  <th className="py-2 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {proposal.rabItems.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-1.5 px-2 text-center border-r border-slate-200">{idx + 1}</td>
                    <td className="py-1.5 px-3 border-r border-slate-200">
                      <strong>[{item.category}]</strong> {item.name}
                    </td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200">{item.volume}</td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200">{item.unit}</td>
                    <td className="py-1.5 px-3 text-right border-r border-slate-200 tabular-nums">
                      Rp {item.pricePerUnit.toLocaleString('id-ID')}
                    </td>
                    <td className="py-1.5 px-3 text-right font-semibold tabular-nums">
                      Rp {item.total.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                <tr>
                  <td colSpan={5} className="py-2 px-3 text-right uppercase tracking-wider">
                    Total Anggaran Biaya:
                  </td>
                  <td className="py-2 px-3 text-right text-sm font-black">
                    Rp {proposal.totalAnggaran.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 8. Penutup */}
          <div>
            <h4 className="font-sans font-bold text-slate-950 text-sm mb-1 uppercase tracking-wide">
              VIII. PENUTUP
            </h4>
            <p className="indent-8 text-slate-800 leading-relaxed">{proposal.penutup}</p>
          </div>
        </div>

        {/* Lembar Pengesahan / Kolom Tanda Tangan Resmi */}
        <div className="break-inside-avoid mt-12 pt-6 font-sans text-xs">
          <div className="text-right mb-6">
            <p>Manis Jaya, {proposal.tanggalProposal}</p>
          </div>

          {/* Panitia Pelaksana */}
          <div className="grid grid-cols-2 gap-8 text-center mb-10">
            <div>
              <p className="font-bold">Ketua Panitia Pelaksana</p>
              <div className="h-20 flex items-center justify-center italic text-slate-300 text-xs">
                (Tanda Tangan Digital)
              </div>
              <p className="font-bold underline text-slate-900">{proposal.kepanitiaan.ketuaPanitia}</p>
            </div>
            <div>
              <p className="font-bold">Sekretaris Panitia</p>
              <div className="h-20 flex items-center justify-center italic text-slate-300 text-xs">
                (Tanda Tangan Digital)
              </div>
              <p className="font-bold underline text-slate-900">{proposal.kepanitiaan.sekretaris}</p>
            </div>
          </div>

          {/* Mengetahui Pimpinan & Lurah */}
          <div className="text-center font-bold mb-4 uppercase text-[11px] tracking-wider text-slate-600">
            Mengetahui & Menyetujui:
          </div>

          <div className="grid grid-cols-2 gap-8 text-center relative">
            {/* Stempel Organisasi */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 w-28 h-28 border-2 border-red-600/60 rounded-full flex items-center justify-center text-red-600/70 font-bold text-[9px] uppercase tracking-tighter text-center pointer-events-none rotate-12">
              KARANG TARUNA<br />MANIS JAYA<br />KOTA TANGERANG
            </div>

            <div>
              <p className="font-bold">Ketua Karang Taruna Manis Jaya</p>
              <div className="h-20 flex items-center justify-center italic text-slate-300 text-xs">
                (Tanda Tangan & Stempel)
              </div>
              <p className="font-bold underline text-slate-900">IIK ANDRIYANA</p>
            </div>

            <div>
              <p className="font-bold">Lurah Kelurahan Manis Jaya</p>
              <div className="h-20 flex items-center justify-center italic text-slate-300 text-xs">
                (Tanda Tangan & Cap Kelurahan)
              </div>
              <p className="font-bold underline text-slate-900">DRS. H. MULYADI, M.SI</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP. 19740512 199803 1 004</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
