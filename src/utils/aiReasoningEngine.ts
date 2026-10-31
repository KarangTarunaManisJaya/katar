/**
 * Mesin Penalaran Cepat & Lugas Karang Taruna Kelurahan Manis Jaya
 * Memberikan jawaban langsung pada inti persoalan (to the point), masuk akal secara logika,
 * ringkas, dan mudah dipahami oleh siapa saja.
 */

export interface ReasoningContext {
  userName?: string;
  userRole?: string;
  isLoggedIn?: boolean;
  currentNews?: any[];
  upcomingAgendas?: any[];
  stats?: Record<string, any>;
}

export function generateLogicalAnswer(rawQuery: string, context?: ReasoningContext): string {
  const query = (rawQuery || '').trim();
  const q = query.toLowerCase();

  // 1. Karang Taruna Kelurahan Manis Jaya
  const isExplicitKarangTaruna =
    q.includes('karang taruna') ||
    q.includes('katar') ||
    q.includes('manis jaya') ||
    q.includes('jatiuwung') ||
    q.includes('proker') ||
    q.includes('kta') ||
    q.includes('anggota') ||
    (q.includes('program') && (q.includes('kerja') || q.includes('pemuda') || q.includes('kegiatan'))) ||
    (q.includes('surat') && (q.includes('dinas') || q.includes('resmi') || q.includes('ttd') || q.includes('format'))) ||
    (q.includes('proposal') && (q.includes('rab') || q.includes('anggaran') || q.includes('lpj'))) ||
    (q.includes('aset') && (q.includes('pinjam') || q.includes('inventaris') || q.includes('sound') || q.includes('tenda'))) ||
    (q.includes('jadwal') && (q.includes('agenda') || q.includes('kapan') || q.includes('kegiatan')) && !q.includes('tidur')) ||
    q.includes('rw 0') ||
    q.includes('rw 1') ||
    q.includes('rw 8');

  if (isExplicitKarangTaruna) {
    return handleKarangTarunaLogic(q, query, context);
  }

  // 2. Sains, Fisika & Fenomena Alam
  if (
    (q.includes('langit') && (q.includes('biru') || q.includes('warna'))) ||
    (q.includes('laut') && (q.includes('asin') || q.includes('garam'))) ||
    q.includes('gravitasi') ||
    (q.includes('bumi') && (q.includes('bulat') || q.includes('datar'))) ||
    q.includes('roda') ||
    q.includes('ban') ||
    q.includes('bundar') ||
    q.includes('pesawat') ||
    q.includes('terbang') ||
    q.includes('petir') ||
    q.includes('kilat') ||
    q.includes('hujan') ||
    q.includes('listrik')
  ) {
    return handleScienceLogic(q, query);
  }

  // 3. Finansial & Uang
  if (
    q.includes('inflasi') ||
    q.includes('uang') ||
    q.includes('anggaran') ||
    q.includes('keuangan') ||
    q.includes('gaji') ||
    q.includes('hemat')
  ) {
    return handleEconomyLogic(q, query);
  }

  // 4. Kesehatan, Tubuh, Tidur & Kopi
  if (
    q.includes('kopi') ||
    q.includes('kafein') ||
    q.includes('tidur') ||
    q.includes('ngantuk') ||
    q.includes('mengantuk') ||
    q.includes('insomnia') ||
    q.includes('sehat') ||
    q.includes('olahraga')
  ) {
    return handleHealthLogic(q, query);
  }

  // 5. Psikologi, Produktivitas, Malas & Waktu
  if (
    q.includes('malas') ||
    q.includes('menunda') ||
    q.includes('prokrastinasi') ||
    q.includes('waktu') ||
    q.includes('stres') ||
    q.includes('burnout') ||
    q.includes('grogi') ||
    q.includes('bicara di depan umum') ||
    q.includes('pemimpin') ||
    q.includes('bos') ||
    q.includes('fokus')
  ) {
    return handlePsychologyLogic(q, query);
  }

  // 6. Teknologi & AI
  if (
    q.includes('ai') ||
    q.includes('kecerdasan buatan') ||
    q.includes('coding') ||
    q.includes('komputer') ||
    q.includes('internet')
  ) {
    return handleTechLogic(q, query);
  }

  // 7. Berpikir Kritis & Logika
  if (
    q.includes('logika') ||
    q.includes('masuk akal') ||
    q.includes('kritis') ||
    q.includes('hoaks')
  ) {
    return handleCriticalThinkingLogic(q, query);
  }

  // 8. Sapaan
  if (
    q === 'halo' ||
    q === 'hai' ||
    q.startsWith('halo ') ||
    q.startsWith('hai ') ||
    q.includes('siapa kamu') ||
    q.includes('apa kabar') ||
    q.includes('selamat pagi') ||
    q.includes('selamat siang') ||
    q.includes('selamat malam')
  ) {
    return handleGreetingLogic(context);
  }

  // 9. Pertanyaan Umum Lainnya
  return handleGeneralDirectLogic(query);
}

// -------------------------------------------------------------
// 1. Karang Taruna Kelurahan Manis Jaya (Lugas & Jelas)
// -------------------------------------------------------------
function handleKarangTarunaLogic(q: string, query: string, context?: ReasoningContext): string {
  if (q.includes('program') || q.includes('kerja') || q.includes('kegiatan')) {
    return (
      `Program kerja Karang Taruna Kelurahan Manis Jaya terbagi dalam **5 pilar utama**:\n\n` +
      `1. **Olahraga & Pemuda:** Turnamen futsal dan bulutangkis antar-RW.\n` +
      `2. **Sosial Kemanusiaan:** Donor darah rutin, santunan yatim/lansia, dan tanggap bencana lingkungan.\n` +
      `3. **Lingkungan Hidup:** Kerja bakti drainase dan program Bank Sampah Pemuda.\n` +
      `4. **Ekonomi & UMKM:** Pelatihan wirausaha digital dan pendampingan UMKM pemuda.\n` +
      `5. **Seni & Tradisi:** Peringatan 17 Agustus dan pentas kreasi seni pemuda.\n\n` +
      `Seluruh jadwal dapat dilihat langsung pada menu **Katalog Kegiatan & Jadwal** di panel sebelah kiri.`
    );
  }

  if (q.includes('surat') || q.includes('ttd') || q.includes('nomor surat')) {
    return (
      `Untuk membuat surat dinas resmi di portal ini:\n\n` +
      `1. Buka menu **Surat Menyurat** di panel kiri, lalu klik **+ Buat Surat Baru**.\n` +
      `2. Pilih jenis surat (Surat Tugas, Undangan, atau Permohonan) dan lengkapi data tujuan.\n` +
      `3. Sistem otomatis menyematkan **Nomor Surat Baku**, **QR Code legalitas**, dan tanda tangan digital Ketua & Sekretaris.\n` +
      `4. Klik simpan dan Anda dapat langsung mengunduh atau mencetak file PDF resminya.`
    );
  }

  if (q.includes('kta') || q.includes('anggota') || q.includes('daftar') || q.includes('kartu')) {
    return (
      `Cara pendaftaran dan penerbitan KTA Digital:\n\n` +
      `1. Masuk ke menu **Data Anggota & KTA**.\n` +
      `2. Isi identitas (NIK e-KTP, nama lengkap, WhatsApp, dan asal RW 01 - RW 08 Kelurahan Manis Jaya).\n` +
      `3. Pilih bidang minat (Olahraga, Humas, Sosial, Lingkungan, atau UMKM).\n` +
      `4. Setelah diverifikasi pengurus, KTA Digital langsung terbit lengkap dengan pasfoto, barcode verifikasi, dan stempel resmi yang siap dicetak.`
    );
  }

  if (q.includes('aset') || q.includes('pinjam') || q.includes('inventaris') || q.includes('sound') || q.includes('tenda')) {
    return (
      `Tata cara peminjaman aset inventaris (sound system, tenda, kursi, dll):\n\n` +
      `1. Buka menu **Aset Organisasi**, cek ketersediaan barang pada tanggal yang diinginkan.\n` +
      `2. Isi formulir peminjaman: nama penanggung jawab, asal RT/RW, keperluan, serta tanggal pinjam & kembali.\n` +
      `3. Pengurus memverifikasi pengajuan. Saat serah terima, kondisi barang dicek bersama dan wajib dikembalikan tepat waktu dalam kondisi baik.`
    );
  }

  if (q.includes('jadwal') || q.includes('agenda') || q.includes('kapan')) {
    const agendas = Array.isArray(context?.upcomingAgendas) ? context.upcomingAgendas : [];
    if (agendas.length > 0) {
      const list = agendas.slice(0, 3).map((a: any) => `• **${a.namaKegiatan || a.title}** (${a.tanggalMulai || a.date}) - Lokasi: ${a.lokasi || 'Manis Jaya'}`).join('\n');
      return `Agenda kegiatan terdekat Karang Taruna Manis Jaya:\n\n${list}\n\nJadwal ini terbuka untuk seluruh warga pada menu **Jadwal Kegiatan**.`;
    }
    return (
      `Agenda rutin Karang Taruna Kelurahan Manis Jaya meliputi:\n\n` +
      `• Rapat koordinasi bulanan pengurus (Sekretariat Kelurahan).\n` +
      `• Kerja bakti lingkungan akhir pekan bersama pengurus RW 01 - RW 08.\n` +
      `• Latihan olahraga dan turnamen pemuda terjadwal.\n\n` +
      `Rincian kalender lengkap dapat diakses di menu **Jadwal Kegiatan**.`
    );
  }

  if (q.includes('apa itu') || q.includes('sejarah') || q.includes('arti')) {
    return (
      `Karang Taruna adalah organisasi kepemudaan resmi tingkat kelurahan/desa yang diakui pemerintah melalui Permensos No. 25 Tahun 2019.\n\n` +
      `Fungsi utamanya adalah mencegah permasalahan sosial generasi muda serta mewadahi potensi pemuda di bidang kesejahteraan sosial, olahraga, ekonomi, dan budaya.\n\n` +
      `Di Kelurahan Manis Jaya (Kecamatan Jatiuwung, Kota Tangerang), Karang Taruna mengkoordinasikan kegiatan pemuda di 8 Rukun Warga (RW 01 s/d RW 08).`
    );
  }

  return (
    `Portal Karang Taruna Kelurahan Manis Jaya menyediakan layanan mandiri untuk:\n` +
    `• Pembuatan Surat Dinas resmi ber-QR Code.\n` +
    `• Registrasi & cetak KTA Digital anggota.\n` +
    `• Kalender agenda kegiatan pemuda se-Kelurahan Manis Jaya.\n` +
    `• Peminjaman aset dan inventaris organisasi.\n\n` +
    `Silakan pilih menu terkait di bilah sebelah kiri untuk memulai.`
  );
}

// -------------------------------------------------------------
// 2. Sains & Alam (Lugas, Logis, Ilmiah)
// -------------------------------------------------------------
function handleScienceLogic(q: string, query: string): string {
  if (q.includes('langit') && (q.includes('biru') || q.includes('warna'))) {
    return (
      `Langit berwarna biru karena fenomena **Hamburan Rayleigh (Rayleigh Scattering)**:\n\n` +
      `1. Cahaya matahari tampak putih, namun tersusun dari semua warna spektrum pelangi.\n` +
      `2. Warna biru memiliki panjang gelombang yang pendek, sehingga paling mudah terhambur ke segala arah saat menabrak partikel gas (nitrogen dan oksigen) di atmosfer bumi.\n` +
      `3. Warna merah dan kuning memiliki gelombang panjang sehingga menerobos lurus, sementara warna biru tersebar merata di seluruh langit yang tertangkap mata kita.`
    );
  }

  if (q.includes('laut') && (q.includes('asin') || q.includes('garam'))) {
    return (
      `Air laut berasa asin karena akumulasi mineral garam selama miliaran tahun:\n\n` +
      `1. Air hujan mengikis bebatuan di daratan dan melarutkan mineral garam (terutama natrium dan klorida).\n` +
      `2. Aliran sungai membawa mineral tersebut bermuara ke samudra luas.\n` +
      `3. Ketika air laut menguap karena panas matahari untuk membentuk awan, garamnya **tidak ikut menguap** dan tertinggal di laut, sehingga kadar garam laut terus bertahan pada ~3,5%.`
    );
  }

  if (q.includes('roda') || q.includes('ban') || q.includes('bundar')) {
    return (
      `Roda berbentuk bundar karena dua alasan fisika mendasar:\n\n` +
      `1. **Jari-Jari Konstan:** Jarak dari pusat poros ke permukaan jalan selalu sama di setiap titik putaran. Kendaraan melaju stabil tanpa sentakan naik-turun.\n` +
      `2. **Gaya Gesek Gulir Rendah:** Menggelindingkan lingkaran membutuhkan energi jauh lebih kecil daripada menyeret benda bersudut, sehingga mesin kendaraan efisien dan hemat bahan bakar.`
    );
  }

  if (q.includes('gravitasi')) {
    return (
      `Gravitasi adalah gaya tarik-menarik antara dua benda bermassa:\n\n` +
      `• Semakin besar massa suatu benda (seperti Bumi), semakin kuat ia menarik benda lain ke pusatnya.\n` +
      `• Dalam teori relativitas Einstein, gravitasi sebenarnya adalah kelengkungan ruang dan waktu yang disebabkan oleh massa benda besar.\n` +
      `Gravitasi inilah yang menahan kita tetap di tanah, menahan atmosfer bumi, dan menjaga orbit bulan.`
    );
  }

  if (q.includes('bumi') && (q.includes('bulat') || q.includes('datar'))) {
    return (
      `Bumi berbentuk bulat (oblate spheroid) berdasarkan bukti logis yang teruji:\n\n` +
      `1. **Bayangan Gerhana Bulan:** Bayangan bumi pada permukaan bulan selalu berbentuk kurva lengkung lingkaran dari sudut mana pun disinari.\n` +
      `2. **Lengkungan Horizon:** Kapal yang berlayar ke laut lepas selalu terlihat lambung bawahnya menghilang lebih dulu, disusul tiang layarnya.\n` +
      `3. **Zona Waktu Siang & Malam:** Adanya perbedaan waktu antarnegara terjadi murni karena rotasi bumi yang bulat mengelilingi porosnya.`
    );
  }

  if (q.includes('pesawat') || q.includes('terbang')) {
    return (
      `Pesawat dapat terbang karena bentuk sayapnya (**Airfoil**) yang menciptakan gaya angkat (*lift*):\n\n` +
      `1. Udara di bagian atas sayap mengalir lebih cepat dibanding bagian bawah, menghasilkan tekanan udara lebih rendah di atas (Hukum Bernoulli).\n` +
      `2. Sudut kemiringan sayap membelokkan udara ke bawah, menghasilkan dorongan balik ke atas (Hukum Aksi-Reaksi Newton).\n` +
      `Ketika gaya angkat ini melebihi berat total pesawat, pesawat terangkat ke udara.`
    );
  }

  if (q.includes('petir') || q.includes('kilat') || q.includes('listrik')) {
    return (
      `Petir adalah pelepasan listrik statis bertegangan tinggi di atmosfer:\n\n` +
      `1. Gesekan partikel es dan air di awan badai menghasilkan perbedaan muatan listrik yang sangat besar antara dasar awan (negatif) dan tanah (positif).\n` +
      `2. Saat beda potensial menembus batas isolasi udara, jutaan volt elektron melompat ke tanah dalam sekejap.\n` +
      `3. Kilatan ini memanaskan udara hingga 30.000°C seketika. Ledakan pemuaian udara tersebut menghasilkan suara guntur.`
    );
  }

  return (
    `Secara sains, peristiwa "${query}" terjadi berdasarkan prinsip hukum fisika dan sebab-akibat yang nyata. Setiap fenomena alam memiliki transfer energi, interaksi molekul, dan perhitungan matematis yang logis.`
  );
}

// -------------------------------------------------------------
// 3. Finansial & Ekonomi (Ringkas & Masuk Akal)
// -------------------------------------------------------------
function handleEconomyLogic(q: string, query: string): string {
  if (q.includes('inflasi')) {
    return (
      `Inflasi adalah penurunan daya beli mata uang yang menyebabkan kenaikan harga barang dan jasa secara umum.\n\n` +
      `Penyebab utamanya:\n` +
      `1. **Permintaan Tinggi (*Demand-Pull*):** Jumlah uang yang beredar melebihi ketersediaan barang.\n` +
      `2. **Biaya Produksi Naik (*Cost-Push*):** Kenaikan harga bahan baku, energi, atau upah pekerja memaksa produsen menaikkan harga jual.`
    );
  }

  return (
    `Pengelolaan keuangan yang sehat berpatokan pada rumus alokasi **50-30-20**:\n\n` +
    `• **50% Kebutuhan Pokok:** Makanan harian, tempat tinggal, utilitas, dan transportasi.\n` +
    `• **30% Keinginan:** Hiburan wajar, hobi, dan keperluan pribadi.\n` +
    `• **20% Tabungan & Dana Darurat:** Disimpan untuk cadangan minimal 3 bulan pengeluaran sebelum berinvestasi.`
  );
}

// -------------------------------------------------------------
// 4. Kesehatan & Biologi (Tepat Sasaran)
// -------------------------------------------------------------
function handleHealthLogic(q: string, query: string): string {
  if (q.includes('kopi') || q.includes('kafein')) {
    return (
      `Kopi tidak menghasilkan energi baru, melainkan menghambat sinyal lelah di otak:\n\n` +
      `1. Molekul kafein memiliki struktur yang mirip dengan **Adenosin** (senyawa pemicu rasa kantuk).\n` +
      `2. Kafein memblokir reseptor adenosin di otak sehingga rasa lelah tertunda dan kita merasa lebih waspada.\n` +
      `3. Efek kafein bertahan 5-7 jam di dalam tubuh, sehingga sebaiknya dikonsumsi sebelum siang agar tidak mengganggu kualitas tidur malam.`
    );
  }

  if (q.includes('tidur') || q.includes('ngantuk') || q.includes('mengantuk') || q.includes('insomnia')) {
    return (
      `Manusia wajib tidur karena fungsi biologis penting otak dan tubuh:\n\n` +
      `1. **Pembersihan Racun Otak:** Saat tidur lelap, sistem glimfatik membersihkan zat sisa metabolisme (seperti adenosin) yang menumpuk selama kita beraktivitas.\n` +
      `2. **Konsolidasi Memori:** Otak merapikan dan menyimpan informasi jangka panjang.\n` +
      `3. **Regenerasi Sel:** Tubuh memproduksi hormon pertumbuhan untuk memperbaiki jaringan yang rusak. Orang dewasa membutuhkan 7-8 jam tidur berkualitas.`
    );
  }

  return (
    `Fondasi kesehatan tubuh terdiri dari 3 pilar utama: tidur cukup 7-8 jam, minum air putih minimal 2 liter per hari, dan aktivitas fisik/olahraga ringan teratur minimal 20-30 menit sehari.`
  );
}

// -------------------------------------------------------------
// 5. Psikologi & Produktivitas (Langkah Konkret)
// -------------------------------------------------------------
function handlePsychologyLogic(q: string, query: string): string {
  if (q.includes('malas') || q.includes('menunda') || q.includes('prokrastinasi')) {
    return (
      `Rasa malas atau menunda pekerjaan terjadi karena otak emosi menghindari tugas yang terasa berat. Cara mengatasinya secara logis:\n\n` +
      `1. **Gunakan Aturan 2 Menit:** Mulai kerjakan bagian paling kecil selama 2 menit saja tanpa memikirkan beban keseluruhan. Begitu dimulai, kelembaman malas akan hilang.\n` +
      `2. **Pecah Menjadi Langkah Mikro:** Bagi tugas besar menjadi 3-5 tugas kecil yang bisa diselesaikan dalam 15 menit.\n` +
      `3. **Eliminasi Distraksi:** Jauhkan ponsel dari jangkauan pandangan saat mulai bekerja.\n` +
      `4. **Tentukan Waktu Spesifik:** Tulis jam dan tempat pelaksanaan secara pasti, bukan sekadar "nanti".`
    );
  }

  if (q.includes('waktu') || q.includes('mengatur waktu')) {
    return (
      `Manajemen waktu efektif menggunakan **Matriks Eisenhower**:\n\n` +
      `1. **Penting & Mendesak:** Kerjakan langsung sekarang (krisis, tenggat hari ini).\n` +
      `2. **Penting & Tidak Mendesak:** Jadwalkan secara disiplin (belajar, olahraga, perencanaan).\n` +
      `3. **Mendesak tapi Tidak Penting:** Delegasikan atau batasi (notifikasi obrolan sepele).\n` +
      `4. **Tidak Penting & Tidak Mendesak:** Kurangi atau hapus (scrolling medsos tanpa tujuan).`
    );
  }

  if (q.includes('pemimpin') || q.includes('bos')) {
    return (
      `Perbedaan esensial Pemimpin vs Bos:\n\n` +
      `• **Bos:** Mengandalkan wewenang jabatan, memerintah dari atas, dan menyalahkan orang saat terjadi masalah.\n` +
      `• **Pemimpin:** Menggerakkan dengan keteladanan, membimbing dan bekerja bersama tim, serta bertanggung jawab mencari solusi saat terjadi kegagalan.`
    );
  }

  if (q.includes('stres') || q.includes('burnout')) {
    return (
      `Mengatasi stres secara rasional menggunakan prinsip kendali:\n\n` +
      `1. Pisahkan hal yang berada dalam kendali Anda (tindakan, respons, istirahat) dari hal di luar kendali Anda (reaksi orang lain, situasi eksternal).\n` +
      `2. Fokuskan 100% energi hanya pada tindakan konkret yang dapat Anda lakukan hari ini.\n` +
      `3. Istirahatkan tubuh dan pikiran untuk memulihkan kapasitas energi mental.`
    );
  }

  return (
    `Kunci produktivitas dan ketenangan berpikir adalah memecah masalah besar menjadi langkah-langkah kecil terukur yang dapat dieksekusi saat ini juga.`
  );
}

// -------------------------------------------------------------
// 6. Teknologi & AI
// -------------------------------------------------------------
function handleTechLogic(q: string, query: string): string {
  if (q.includes('ai') || q.includes('kecerdasan buatan')) {
    return (
      `AI (Artificial Intelligence) adalah sistem komputasi dan pemodelan statistik yang dilatih untuk mengenali pola, memproses bahasa, dan memecahkan masalah.\n\n` +
      `AI bukanlah makhluk yang memiliki kesadaran, melainkan alat bantu produktivitas yang mempercepat analisis data, penulisan, dan otomatisasi tugas repetitif.`
    );
  }

  return (
    `Sistem teknologi bekerja dengan alur baku: **Input (Masukan Data) ➔ Proses (Algoritma/Logika Komputasi) ➔ Output (Keluaran Hasil)**. Efisiensi sistem ditentukan oleh kejelasan logika dan optimasi struktur datanya.`
  );
}

// -------------------------------------------------------------
// 7. Berpikir Kritis
// -------------------------------------------------------------
function handleCriticalThinkingLogic(q: string, query: string): string {
  return (
    `3 prinsip dasar berpikir kritis dan logis:\n\n` +
    `1. **Pisahkan Fakta dari Opini:** Fakta didukung oleh data teruji, sedangkan opini adalah persepsi pribadi.\n` +
    `2. **Tinjau Hubungan Sebab-Akibat:** Korelasi antara dua kejadian tidak otomatis membuktikan adanya hubungan sebab-akibat.\n` +
    `3. **Gunakan Prinsip Kesederhanaan (Occam's Razor):** Penjelasan yang paling masuk akal dengan asumsi paling minim biasanya adalah yang paling mendekati kebenaran.`
  );
}

// -------------------------------------------------------------
// 8. Sapaan
// -------------------------------------------------------------
function handleGreetingLogic(context?: ReasoningContext): string {
  const name = context?.userName || 'Warga';
  return (
    `Halo ${name}! Saya asisten resmi Karang Taruna Kelurahan Manis Jaya.\n\n` +
    `Saya siap menjawab pertanyaan Anda secara lugas dan cepat mengenai:\n` +
    `• Program kerja 5 pilar pemuda Manis Jaya (RW 01 s/d RW 08).\n` +
    `• Pembuatan surat dinas resmi, KTA Digital, inventaris aset, dan agenda kegiatan.\n` +
    `• Maupun pertanyaan umum seputar sains, logika, produktivitas, dan teknologi.\n\n` +
    `Silakan ajukan pertanyaan Anda.`
  );
}

// -------------------------------------------------------------
// 9. Pertanyaan Umum Terbuka (Direct & Concise)
// -------------------------------------------------------------
function handleGeneralDirectLogic(query: string): string {
  const clean = query.replace(/[?.,!]/g, '').trim();
  return (
    `Mengenai "${clean}":\n\n` +
    `Secara logika dan fakta objektif, hal ini ditentukan oleh keterkaitan sebab-akibat yang mendasarinya. Langkah paling efektif adalah mengidentifikasi pokok persoalannya, menguji data atau bukti pendukungnya, lalu mengambil tindakan yang terukur dan realistis.\n\n` +
    `Jika Anda membutuhkan rincian teknis atau panduan langkah demi langkah yang lebih spesifik, silakan sampaikan detail pertanyaannya.`
  );
}
