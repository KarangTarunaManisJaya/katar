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

  // 8. Obrolan Santai & Sapaan Manusiawi
  if (
    q === 'halo' ||
    q === 'hai' ||
    q.startsWith('halo ') ||
    q.startsWith('hai ') ||
    q.includes('siapa kamu') ||
    q.includes('siapa namamu') ||
    q.includes('nama kamu') ||
    q.includes('apa kabar') ||
    q.includes('gimana kabar') ||
    q.includes('lagi apa') ||
    q.includes('sedang apa') ||
    q.includes('makasih') ||
    q.includes('terima kasih') ||
    q.includes('selamat pagi') ||
    q.includes('selamat siang') ||
    q.includes('selamat sore') ||
    q.includes('selamat malam')
  ) {
    return handleGreetingLogic(q, context);
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
      `Halo! Senang kamu tertarik dengan kegiatan pemuda di sini. 😊\n\n` +
      `Karang Taruna Kelurahan Manis Jaya punya **5 pilar kegiatan utama** yang rutin bergerak di RW 01 sampai RW 08:\n\n` +
      `1. **Olahraga & Pemuda:** Ada turnamen futsal, bulutangkis, dan senam sehat warga antar-RW.\n` +
      `2. **Sosial & Kepedulian:** Bakti sosial, donor darah, santunan adik-adik yatim/lansia, serta tanggap bencana.\n` +
      `3. **Lingkungan Hidup:** Gotong royong bersih drainase dan Bank Sampah Pemuda agar lingkungan Manis Jaya asri.\n` +
      `4. **Wirausaha & UMKM:** Pelatihan bisnis digital dan pendampingan buat usaha pemuda lokal.\n` +
      `5. **Seni, Budaya & Kreativitas:** Semarak 17 Agustus, pentas seni, dan kreasi konten pemuda.\n\n` +
      `Kamu juga bisa cek agenda terdekat di menu **Katalog Kegiatan & Jadwal** ya. Dari 5 bidang tadi, kamu paling tertarik ikutan di bidang yang mana nih?`
    );
  }

  if (q.includes('surat') || q.includes('ttd') || q.includes('nomor surat')) {
    return (
      `Gampang banget kok buat bikin surat dinas resmi di portal ini! Langkahnya simpel banget:\n\n` +
      `1. Buka menu **Surat Menyurat** di sidebar kiri, lalu klik tombol **+ Buat Surat Baru**.\n` +
      `2. Pilih jenis surat yang kamu butuhkan (misal Surat Undangan, Surat Tugas, atau Permohonan) dan isi tujuannya.\n` +
      `3. Hebatnya, sistem kita otomatis membuatkan **Nomor Surat Baku**, **QR Code legalitas**, dan tanda tangan digital Ketua & Sekretaris.\n` +
      `4. Klik simpan, lalu surat langsung siap dicetak atau diunduh sebagai file PDF rapi berstandar dinas.\n\n` +
      `Lagi ada draft surat apa nih yang mau kamu buat hari ini? Biar saya bantu arahkan!`
    );
  }

  if (q.includes('kta') || q.includes('anggota') || q.includes('daftar') || q.includes('kartu')) {
    return (
      `Mau gabung dan punya KTA Digital resmi Karang Taruna Manis Jaya? Boleh banget, prosesnya cepat dan gratis kok:\n\n` +
      `1. Masuk ke menu **Data Anggota & KTA** di sebelah kiri.\n` +
      `2. Isi formulir data diri (nama lengkap, NIK e-KTP, nomor WhatsApp, dan asal RW kamu di Manis Jaya).\n` +
      `3. Pilih bidang minat yang paling cocok dengan hobi kamu (Olahraga, Humas, Sosial, Lingkungan, atau UMKM).\n` +
      `4. Begitu diverifikasi, KTA Digital kamu langsung terbit lengkap dengan foto, barcode verifikasi, dan stempel resmi yang bisa langsung kamu cetak atau simpan di HP.\n\n` +
      `Yuk langsung daftar! Ada pertanyaan soal pengisian datanya?`
    );
  }

  if (q.includes('aset') || q.includes('pinjam') || q.includes('inventaris') || q.includes('sound') || q.includes('tenda')) {
    return (
      `Bisa banget! Karang Taruna Manis Jaya menyediakan perlengkapan untuk mendukung kegiatan warga (seperti sound system, tenda, kursi, dan proyektor). Alur pinjamnya seperti ini:\n\n` +
      `1. Buka menu **Aset Organisasi**, kamu bisa lihat barang apa saja yang lagi tersedia dan siap pakai.\n` +
      `2. Isi formulir peminjaman singkat: nama penanggung jawab, asal RT/RW, keperluan acara, serta tanggal pinjam & kembali.\n` +
      `3. Pengurus akan segera memverifikasi. Saat serah terima, kita cek kondisi barang bareng-bareng dan dijaga baik-baik ya.\n\n` +
      `Rencananya kamu mau pinjam perlengkapan apa dan buat acara tanggal berapa nih?`
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
      `Wajar banget kok, kita semua pasti pernah ngalamin fase malas atau rasanya berat banget mau mulai sesuatu. 😊\n\n` +
      `Biasanya rasa malas itu muncul bukan karena kita nggak mampu, tapi karena otak kita ngerasa tugasnya terlalu besar atau membebani. Nah, ada trik psikologi yang gampang banget dicoba:\n\n` +
      `1. **Trik 2 Menit:** Janjian sama diri sendiri: "Oke, aku cuma bakal ngerjain ini 2 menit aja." Begitu kamu mulai gerak, kelembaman malasnya bakal hilang dengan sendirinya.\n` +
      `2. **Pecah Jadi Potongan Kecil:** Jangan bayangkan tugasnya sebagai gunung besar. Ambil satu langkah kecil yang bisa selesai dalam 10 menit.\n` +
      `3. **Jauhkan HP Sebentar:** Taruh ponsel di ruangan lain atau di luar jangkauan tangan selama kamu mulai.\n` +
      `4. **Kasih Hadiah ke Diri Sendiri:** Kalau satu target kecil udah kelar, boleh istirahat santai sejenak sambil ngopi atau minum teh.\n\n` +
      `Yuk, coba ambil satu tugas paling gampang sekarang dan lakuin 2 menit dulu. Mau mulai dari hal apa nih?`
    );
  }

  if (q.includes('waktu') || q.includes('mengatur waktu')) {
    return (
      `Mengatur waktu itu sebenarnya seni mengatur prioritas energi kita, bukan sekadar bikin jadwal padat yang bikin pusing. 😉\n\n` +
      `Cara paling simpel adalah pakai metode 4 kuadran:\n` +
      `1. **Penting & Mendesak:** Kerjakan duluan tanpa ditunda (tugas mendesak hari ini).\n` +
      `2. **Penting tapi Nggak Mendesak:** Ini kunci masa depan kamu! Jadwalkan waktu khususnya (belajar skill baru, olahraga, istirahat cukup).\n` +
      `3. **Mendesak tapi Kurang Penting:** Batasi atau minta tolong rekan lain.\n` +
      `4. **Nggak Penting & Nggak Mendesak:** Hindari jebakan scrolling medsos berjam-jam tanpa arah.\n\n` +
      `Kira-kira apa yang paling sering menyita waktu kamu belakangan ini? Cerita yuk!`
    );
  }

  if (q.includes('pemimpin') || q.includes('bos')) {
    return (
      `Pertanyaan keren nih! Perbedaan utamanya ada di **hati dan cara menggerakkan orang**: ✨\n\n` +
      `• **Seorang Bos:** Mengandalkan kekuasaan jabatan. Katanya "Kerjakan!", suka mencari siapa yang salah kalau ada masalah, dan membuat orang bekerja karena takut.\n` +
      `• **Seorang Pemimpin:** Menggerakkan dengan teladan dan empati. Katanya "Ayo kita kerjakan bareng!", membimbing saat timnya bingung, dan ikut bertanggung jawab saat menghadapi tantangan.\n\n` +
      `Di Karang Taruna, kita selalu menanamkan jiwa kepemimpinan yang merangkul dan mendengar, bukan sekadar menyuruh. Menurut kamu, sifat apa lagi yang wajib dipunyai seorang pemimpin idaman?`
    );
  }

  if (q.includes('stres') || q.includes('burnout')) {
    return (
      `Kalau kamu lagi ngerasa stres atau lelah banget, tarik napas dalam-dalam dulu ya. Kamu nggak sendirian kok. 🌿\n\n` +
      `Coba ingat prinsip lingkaran kendali:\n` +
      `1. **Lepaskan yang di luar kendali kita:** Komentar orang lain, masa lalu, atau hal-hal yang belum terjadi.\n` +
      `2. **Fokuskan energi pada apa yang bisa kamu lakukan detik ini:** Rehat sejenak, minum air putih, jalan kaki sebentar, dan tidur yang cukup.\n\n` +
      `Kesehatan mental dan fisikmu jauh lebih berharga dari apa pun. Mau cerita sedikit apa yang lagi bikin kamu kepikiran?`
    );
  }

  return (
    `Kunci ketenangan dan produktivitas adalah membagi hal besar menjadi langkah-langkah kecil yang bisa kita nikmati prosesnya saat ini juga. Kalau ada yang mau diobrolin, jangan sungkan ya!`
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
// 8. Sapaan Ramah & Percakapan Manusiawi (Singkat & Natural)
// -------------------------------------------------------------
function handleGreetingLogic(q: string, context?: ReasoningContext): string {
  const name = context?.userName ? ` ${context.userName}` : '';

  if (q.includes('apa kabar') || q.includes('gimana kabar')) {
    return 'Kabar baik! Bagaimana denganmu hari ini?';
  }

  if (q.includes('siapa kamu') || q.includes('siapa namamu') || q.includes('nama kamu')) {
    return 'Aku Kawan Manis Jaya, asisten AI Karang Taruna Kelurahan Manis Jaya. Salam kenal ya!';
  }

  if (q.includes('lagi apa') || q.includes('sedang apa')) {
    return 'Lagi standby nemenin kamu nih. Ada yang mau diobrolin atau dibantu?';
  }

  if (q.includes('makasih') || q.includes('terima kasih') || q.includes('thanks')) {
    return 'Sama-sama! Senang bisa bantu kamu. Kalau ada apa-apa lagi, langsung tanyakan ya!';
  }

  if (q.includes('selamat pagi')) {
    return `Selamat pagi${name}! Semangat buat harimu ya. Ada yang bisa kubantu?`;
  }

  if (q.includes('selamat siang')) {
    return `Selamat siang${name}! Gimana harimu sejauh ini?`;
  }

  if (q.includes('selamat sore')) {
    return `Selamat sore${name}! Semoga harimu menyenangkan. Ada yang mau diobrolin?`;
  }

  if (q.includes('selamat malam')) {
    return `Selamat malam${name}! Waktunya istirahat santai. Ada yang mau kamu diskusikan?`;
  }

  return `Halo${name}! Senang bisa ngobrol bareng kamu. Ada yang bisa kubantu hari ini?`;
}

// -------------------------------------------------------------
// 9. Pertanyaan Umum Terbuka (Mengalir & Seperti Manusia)
// -------------------------------------------------------------
function handleGeneralDirectLogic(query: string): string {
  const clean = query.replace(/[?.,!]/g, '').trim();
  return (
    `Wah, menarik nih pertanyaannya soal "${clean}"! 😊\n\n` +
    `Kalau kita obrolin secara santai tapi masuk akal, hal ini biasanya sangat berkaitan dengan bagaimana kita melihat pokok persoalannya secara jernih. Begitu kita urai faktor-faktornya satu per satu, biasanya langkah atau kesimpulannya bakal jauh lebih terang dan mudah dipahami.\n\n` +
    `Kira-kira ada hal spesifik atau sudut pandang tertentu dari "${clean}" yang ingin kita bedah lebih dalam? Kasih tahu saya ya, biar obrolan kita makin seru!`
  );
}
