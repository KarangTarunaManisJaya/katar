/**
 * Mesin Penalaran & Obrolan Cerdas Karang Taruna Kelurahan Manis Jaya
 * Dirancang dengan gaya bahasa percakapan luwes, hangat, mengalir, dan bernalar
 * persis seperti gaya mengobrol ChatGPT: komunikatif, masuk akal, dan bersahabat.
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

  // 1. Obrolan Khusus: Karang Taruna Kelurahan Manis Jaya (bila memang menanyakan organisasi/portal)
  const isExplicitKarangTaruna =
    q.includes('karang taruna') ||
    q.includes('katar') ||
    q.includes('manis jaya') ||
    q.includes('jatiuwung') ||
    q.includes('proker') ||
    q.includes('kta digital') ||
    q.includes('cetak kta') ||
    q.includes('kartu tanda anggota') ||
    (q.includes('program kerja') && (q.includes('pemuda') || q.includes('kelurahan') || q.includes('organisasi') || !q.includes('komputer'))) ||
    (q.includes('surat') && (q.includes('dinas') || q.includes('resmi') || q.includes('tugas') || q.includes('ttd digital') || q.includes('nomor surat') || q.includes('kelurahan'))) ||
    (q.includes('proposal') && (q.includes('rab') || q.includes('anggaran') || q.includes('sponsor') || q.includes('lpj'))) ||
    (q.includes('aset') && (q.includes('inventaris') || q.includes('pinjam') || q.includes('sound') || q.includes('tenda'))) ||
    (q.includes('jadwal') && (q.includes('agenda') || q.includes('kegiatan') || q.includes('rapat')) && !q.includes('tidur')) ||
    (q.includes('voling') || (q.includes('voting') && (q.includes('anggota') || q.includes('suara')))) ||
    (q.includes('rw') && (q.includes('01') || q.includes('02') || q.includes('03') || q.includes('04') || q.includes('05') || q.includes('06') || q.includes('07') || q.includes('08')));

  if (isExplicitKarangTaruna) {
    return handleKarangTarunaLogic(q, query, context);
  }

  // 2. Sains, Fisika & Fenomena Alam
  if (
    (q.includes('langit') && (q.includes('biru') || q.includes('warna'))) ||
    (q.includes('laut') && (q.includes('asin') || q.includes('garam'))) ||
    q.includes('gravitasi') ||
    (q.includes('bumi') && (q.includes('bulat') || q.includes('datar') || q.includes('bentuk'))) ||
    q.includes('fotosintesis') ||
    q.includes('matahari') ||
    q.includes('bintang') ||
    q.includes('planet') ||
    q.includes('hujan') ||
    q.includes('petir') ||
    q.includes('kilat') ||
    q.includes('gempa') ||
    q.includes('evolusi') ||
    q.includes('roda') ||
    q.includes('ban') ||
    q.includes('bundar') ||
    q.includes('pesawat') ||
    q.includes('terbang') ||
    q.includes('listrik')
  ) {
    return handleScienceLogic(q, query);
  }

  // 3. Finansial, Ekonomi & Uang
  if (
    q.includes('inflasi') ||
    q.includes('uang') ||
    q.includes('anggaran') ||
    q.includes('keuangan') ||
    q.includes('investasi') ||
    q.includes('gaji') ||
    q.includes('harga naik')
  ) {
    return handleEconomyLogic(q, query);
  }

  // 4. Kesehatan, Tubuh, Tidur & Pola Hidup
  if (
    q.includes('tidur') ||
    q.includes('ngantuk') ||
    q.includes('insomnia') ||
    q.includes('kopi') ||
    q.includes('kafein') ||
    q.includes('olahraga') ||
    q.includes('air putih') ||
    q.includes('sehat') ||
    q.includes('makan')
  ) {
    return handleHealthAndBodyLogic(q, query);
  }

  // 5. Psikologi, Produktivitas, Menunda & Masalah Hidup
  if (
    q.includes('malas') ||
    q.includes('menunda') ||
    q.includes('prokrastinasi') ||
    q.includes('waktu') ||
    q.includes('stres') ||
    q.includes('burnout') ||
    q.includes('grogi') ||
    q.includes('bicara di depan umum') ||
    q.includes('public speaking') ||
    q.includes('keputusan') ||
    q.includes('pemimpin') ||
    q.includes('bos') ||
    q.includes('tujuan hidup') ||
    q.includes('bahagia') ||
    q.includes('marah') ||
    q.includes('galau') ||
    q.includes('kecewa') ||
    q.includes('fokus')
  ) {
    return handlePsychologyAndLifeLogic(q, query);
  }

  // 6. Teknologi, Komputer & AI
  if (
    q.includes('ai') ||
    q.includes('kecerdasan buatan') ||
    q.includes('coding') ||
    q.includes('programming') ||
    q.includes('komputer') ||
    q.includes('internet') ||
    q.includes('algoritma') ||
    q.includes('database') ||
    q.includes('aplikasi') ||
    q.includes('website')
  ) {
    return handleTechLogic(q, query);
  }

  // 7. Berpikir Kritis & Logika
  if (
    q.includes('logika') ||
    q.includes('masuk akal') ||
    q.includes('berpikir') ||
    q.includes('kritis') ||
    q.includes('akal sehat') ||
    q.includes('rasional') ||
    q.includes('argumen') ||
    q.includes('debat') ||
    q.includes('fakta') ||
    q.includes('hoaks')
  ) {
    return handleCriticalThinkingLogic(q, query);
  }

  // 8. Sapaan & Persona Teman Ngobrol
  if (
    q.includes('siapa kamu') ||
    q.includes('kamu siapa') ||
    q.includes('namamu') ||
    q.includes('perkenalkan') ||
    q === 'halo' ||
    q === 'hai' ||
    q.startsWith('halo ') ||
    q.startsWith('hai ') ||
    q.includes('apa kabar') ||
    q.includes('selamat pagi') ||
    q.includes('selamat siang') ||
    q.includes('selamat malam')
  ) {
    return handleGreetingLogic(q, context);
  }

  // 9. Obrolan Bebas Terbuka (Open-Domain ChatGPT Style)
  return handleGeneralDynamicLogic(query);
}

// -------------------------------------------------------------
// 1. Obrolan Karang Taruna Kelurahan Manis Jaya
// -------------------------------------------------------------
function handleKarangTarunaLogic(q: string, query: string, context?: ReasoningContext): string {
  const friendName = context?.userName ? context.userName : 'Kawan';

  if (q.includes('apa itu karang taruna') || q.includes('arti karang taruna') || q.includes('sejarah')) {
    return (
      `Halo ${friendName}! Senang banget kamu nanya tentang hal ini. 😊\n\n` +
      `Kalau diibaratkan, Karang Taruna itu adalah rumah berkumpul dan wadah perjuangan bagi generasi muda di tingkat kelurahan/desa. Bukan sekadar kumpul-kumpul biasa, tapi sebuah wadah resmi untuk memajukan kesejahteraan sosial dan potensi warga.\n\n` +
      `Secara historis, Karang Taruna lahir di Kampung Melayu, Jakarta pada 26 September 1960, dan saat ini diakui resmi oleh negara lewat Permensos No. 25 Tahun 2019. Tujuannya sangat mulia: mencegah problem sosial seperti pengangguran dan kenakalan remaja, dengan cara mengajak pemuda aktif berkarya di bidang olahraga, ekonomi, sosial, dan seni.\n\n` +
      `Nah, di Kelurahan Manis Jaya (Kecamatan Jatiuwung, Kota Tangerang), Karang Taruna menyatukan kekuatan pemuda dari **8 Rukun Warga (RW 01 sampai RW 08)**. Kita bergerak bersama supaya pemuda di Manis Jaya punya ruang berekspresi yang positif dan berdaya saing!`
    );
  }

  if (q.includes('program') || q.includes('kerja') || q.includes('rencana') || q.includes('kegiatan')) {
    return (
      `Wah, ngomongin program kerja di Manis Jaya seru banget nih! 👍\n\n` +
      `Jadi, kegiatan kita nggak dibikin secara asal atau spontan, melainkan dipetakan ke dalam **5 Pilar Utama** yang menjawab kebutuhan nyata warga di 8 RW:\n\n` +
      `1. **Olahraga & Minat Bakat:** Turnamen futsal dan bulutangkis antar-RW. Ini bukan cuma soal keringat, tapi cara paling ampuh buat mencairkan suasana dan merekatkan persaudaraan antar pemuda wilayah.\n` +
      `2. **Aksi Sosial & Kemanusiaan:** Rutin donor darah, santunan anak yatim & lansia, serta tim siaga bencana lingkungan saat musim hujan tiba.\n` +
      `3. **Peduli Lingkungan:** Aksi bersih drainase bersama dan program Bank Sampah Pemuda agar lingkungan Manis Jaya tetap asri dan bebas banjir.\n` +
      `4. **Kemandirian UMKM Pemuda:** Pelatihan jualan online, bazar kreatif, dan pendampingan usaha kecil bagi kawan-kawan yang sedang merintis bisnis.\n` +
      `5. **Seni & Tradisi Kebangsaan:** Peringatan 17 Agustus, pentas seni kreasi lokal, dan Bulan Bakti Pemuda.\n\n` +
      `Kamu bisa cek jadwal dan detail lengkapnya langsung di menu **Kegiatan & Program Kerja** di sebelah kiri. Kira-kira bidang mana nih yang paling bikin kamu tertarik ikutan?`
    );
  }

  if (q.includes('surat') || q.includes('nomor surat') || q.includes('tanda tangan')) {
    return (
      `Nah, untuk urusan surat dinas, di portal ini sekarang sudah dibuat serba rapi dan otomatis! Jadi kamu nggak perlu pusing memikirkan format manual. 📝\n\n` +
      `Begini cara kerjanya:\n\n` +
      `• **Nomor Surat Otomatis:** Sistem menerapkan standar baku dinas \`[Nomor]/KT-MJ/EXT/[Bulan Romawi]/[Tahun]\`, jadi dijamin nomor arsip nggak bakal bentrok atau dobel.\n` +
      `• **Keaslian & Tanda Tangan:** Setiap surat resmi langsung dilengkapi **QR Code verifikasi digital** dan tanda tangan Ketua serta Sekretaris yang sah.\n` +
      `• **Cara Bikinnya:** Tinggal klik menu **Surat Menyurat** ➔ pilih \`+ Buat Surat Baru\` ➔ tentukan jenis suratnya (Surat Tugas, Undangan, atau Permohonan) ➔ isi detailnya, lalu simpan. Kamu langsung bisa mengunduh dan mencetak file PDF resminya.\n\n` +
      `Praktis banget kan? Ada jenis surat tertentu yang lagi butuh kamu buat hari ini?`
    );
  }

  if (q.includes('kta') || q.includes('anggota') || q.includes('daftar') || q.includes('kartu')) {
    return (
      `Pengen punya KTA (Kartu Tanda Anggota) digital resmi Karang Taruna Manis Jaya? Prosesnya gampang banget dan transparan lho! 💳✨\n\n` +
      `Alurnya dibuat masuk akal seperti ini:\n\n` +
      `1. **Isi Identitas Diri:** Masuk ke menu **Data Anggota & KTA**, lalu isi NIK e-KTP, nama lengkap, nomor WhatsApp aktif, dan asal domisili (mulai dari RW 01 sampai RW 08 Kelurahan Manis Jaya).\n` +
      `2. **Pilih Minat Bidang:** Tentukan kamu mau aktif di mana—apakah Olahraga, Humas & Media, Sosial, Lingkungan, atau Wirausaha UMKM. Supaya peranmu nanti benar-benar sesuai passion!\n` +
      `3. **Verifikasi & Terbit:** Setelah data diverifikasi pengurus, kartu KTA digitalmu otomatis terbit dengan barcode unik, pasfoto, dan stempel resmi organisasi yang bisa langsung kamu unduh atau cetak.\n\n` +
      `Yuk langsung daftar di menu **Data Anggota & KTA**. Bangga kan punya identitas resmi sebagai pemuda penggerak Manis Jaya!`
    );
  }

  if (q.includes('aset') || q.includes('pinjam') || q.includes('inventaris') || q.includes('sound') || q.includes('tenda')) {
    return (
      `Untuk peminjaman aset bersama (seperti sound system portable, tenda pleton, meja, atau kursi lipat), kita punya prosedur yang adil dan terbuka untuk seluruh warga dan pengurus. 📦🔊\n\n` +
      `Langkah praktisnya:\n\n` +
      `1. **Cek Ketersediaan:** Buka menu **Aset Organisasi** di portal, lalu pastikan barang yang mau dipinjam berstatus \`Tersedia\` pada tanggal acaramu.\n` +
      `2. **Isi Form Pengajuan:** Masukkan identitas peminjam, nama perwakilan RT/RW, keperluan acara, serta tanggal pinjam dan pengembalian yang pasti.\n` +
      `3. **Serah Terima & Tanggung Jawab:** Saat pengambilan, kondisi barang dicek bersama. Kuncinya sederhana: kita jaga barang inventaris ini bersama-sama, dan kembalikan tepat waktu dalam keadaan bersih serta berfungsi prima agar kawan-kawan lain bisa bergantian memakai.\n\n` +
      `Mau pinjam perlengkapan buat acara apa nih di lingkunganmu?`
    );
  }

  if (q.includes('jadwal') || q.includes('agenda') || q.includes('kalender') || q.includes('kapan')) {
    const agendas = Array.isArray(context?.upcomingAgendas) ? context.upcomingAgendas : [];
    const listStr =
      agendas.length > 0
        ? agendas.slice(0, 3).map((a: any) => `• **${a.namaKegiatan || a.title}** (${a.tanggalMulai || a.date}) - Lokasi: ${a.lokasi || 'Kelurahan Manis Jaya'}`).join('\n')
        : '• Rapat Koordinasi Pengurus Bulanan (Sekretariat Karang Taruna)\n• Turnamen Futsal Pemuda Antar-RW se-Manis Jaya\n• Kerja Bakti Lingkungan & Penghijauan Akhir Pekan';

    return (
      `Ini dia beberapa agenda terdekat yang ada di kalender Karang Taruna Manis Jaya:\n\n${listStr}\n\n` +
      `O ya, kalender jadwal ini bisa dilihat siapa saja secara terbuka (*read-only*) supaya warga dan pemuda selalu terinformasi. Kalau kamu pengurus dan ingin mengajukan kegiatan baru, tinggal login ke akunmu lalu buka menu **Jadwal Kegiatan** ya!`
    );
  }

  if (q.includes('rw') || q.includes('wilayah') || q.includes('kelurahan')) {
    return (
      `Kelurahan Manis Jaya itu posisinya sangat unik dan strategis di Kecamatan Jatiuwung, Kota Tangerang. Di satu sisi kita punya kawasan industri yang dinamis, dan di sisi lain lingkungan pemukiman warga yang rukun.\n\n` +
      `Karang Taruna Manis Jaya sendiri menaungi koordinasi kepemudaan di **8 Rukun Warga (RW 01 sampai RW 08)**. Tiap RW punya sub-unit pemuda tingkat RT masing-masing yang jadi ujung tombak kegiatan warga. Kamu sendiri tinggal atau aktif di RW berapa nih?`
    );
  }

  return (
    `Mengenai hal ini, portal Karang Taruna Kelurahan Manis Jaya sudah menyiapkan sistem yang lengkap buat memudahkan kamu:\n\n` +
    `Mulai dari pembuatan surat dinas resmi dengan barcode, pendaftaran kartu anggota KTA digital, peminjaman aset inventaris, kalender kegiatan, sampai voting aspirasi warga di 8 RW.\n\n` +
    `Semua menunya bisa kamu akses di panel sebelah kiri. Kalau ada langkah yang bikin kamu bingung, bilang aja ke aku ya, biar kita urai bareng-bareng!`
  );
}

// -------------------------------------------------------------
// 2. Sains, Fisika & Fenomena Alam (ChatGPT Conversational Style)
// -------------------------------------------------------------
function handleScienceLogic(q: string, query: string): string {
  if (q.includes('langit') && (q.includes('biru') || q.includes('warna'))) {
    return (
      `Wah, ini pertanyaan klasik yang seru banget kalau dibahas! Pernah nggak kamu lagi jalan siang-siang, terus mendongak ke atas dan kepikiran: *"Kenapa ya langit warnanya biru, bukan merah, hijau, atau ungu?"*\n\n` +
      `Nah, rahasianya ada pada cara cahaya matahari berinteraksi dengan atmosfer bumi kita:\n\n` +
      `Cahaya matahari yang kita lihat tampak putih sebenarnya adalah gabungan dari seluruh warna pelangi. Masing-masing warna ini punya panjang gelombang yang berbeda. Warna merah gelombangnya panjang dan santai, sedangkan warna biru dan ungu gelombangnya sangat pendek dan rapat.\n\n` +
      `Saat sinar matahari memasuki atmosfer bumi kita yang dipenuhi gas (terutama nitrogen dan oksigen), gelombang pendek warna biru ini gampang sekali "tertabrak" partikel udara dan dihamburkan (*scattered*) ke segala arah. Fenomena fisika ini dinamakan **Hamburan Rayleigh (Rayleigh Scattering)**.\n\n` +
      `Mungkin kamu bakal nyeletuk: *"Lho, kalau ungu gelombangnya lebih pendek lagi, kenapa langit nggak berwarna ungu?"*\n` +
      `Pertanyaan cerdas! Itu karena dua alasan: pertama, mata manusia memiliki reseptor yang jauh lebih sensitif terhadap warna biru daripada ungu. Kedua, spektrum matahari memang memancarkan porsi warna biru yang jauh lebih melimpah dibandingkan warna ungu.\n\n` +
      `Makanya, langit siang hari tampak membiru indah di mata kita. Menakjubkan kan cara kerja alam?`
    );
  }

  if (q.includes('laut') && (q.includes('asin') || q.includes('garam'))) {
    return (
      `Pernah nggak kamu kepikiran waktu main ke pantai: *"Dari mana datangnya garam sebanyak ini sampai air laut rasanya asin banget?"* Padahal air hujan dan air sungai yang mengalir ke laut rasanya tawar!\n\n` +
      `Nah, ceritanya adalah proses geologi raksasa yang sudah berjalan selama miliaran tahun:\n\n` +
      `1. **Hujan Sedikit Asam Mengikis Batu:** Air hujan yang turun di daratan mengikat sedikit karbon dioksida di udara, membuatnya sedikit bersifat asam. Saat air hujan membasahi tanah dan bebatuan, ia mengikis mineral-mineral garam alami (terutama natrium dan klorida).\n` +
      `2. **Sungai Membawa Mineral ke Laut:** Sungai-sungai di seluruh dunia kemudian mengalirkan air yang membawa sedikit mineral garam tersebut bermuara ke samudra luas.\n` +
      `3. **Penguapan Tanpa Garam:** Ketika matahari memanaskan air laut, hanya molekul airnya yang menguap ke udara membentuk awan hujan. Mineral garamnya **sama sekali tidak ikut menguap** dan tertinggal di laut.\n\n` +
      `Karena proses siklus ini berulang terus-menerus selama ratusan juta tahun, konsentrasi garam di samudra terus bertambah hingga mencapai rasa asin seperti yang kita kenal sekarang (rata-rata 3,5% garam). Keren ya siklus bumi kita!`
    );
  }

  if (q.includes('roda') || q.includes('ban') || q.includes('bundar')) {
    return (
      `Bayangin kalau ban motor atau mobil kita bentuknya segitiga atau kotak—pasti setiap beberapa sentimeter badan kita bakal terguncang hebat dan mesin cepat jebol! 😅\n\n` +
      `Bentuk bundar (lingkaran) pada roda adalah salah satu penemuan mekanika paling jenius dalam sejarah manusia karena dua alasan utama:\n\n` +
      `Pertama, **Jari-Jari Konstan.** Pada lingkaran, jarak dari titik poros tengah ke permukaan jalan selalu sama persis di setiap sudut putaran. Artinya, bodi kendaraan tetap berjalan di ketinggian yang sama dan stabil tanpa ada sentakan naik-turun.\n\n` +
      `Kedua, **Hemat Energi Lewat Gaya Gesek Gulir (Rolling Friction).** Mendorong atau menyeret benda persegi menghasilkan gaya gesek luncur yang sangat berat. Tapi dengan menggelindingkan roda bundar, titik sentuh dengan jalan berpindah secara halus. Tenaga yang dibutuhkan mesin untuk menggerakkan kendaraan jadi berkurang hingga lebih dari 80%!\n\n` +
      `Itulah mengapa sejak ribuan tahun lalu sampai era mobil listrik modern sekarang, bentuk bundar pada roda tetap tak tergantikan.`
    );
  }

  if (q.includes('gravitasi')) {
    return (
      `Gravitasi itu ibarat lem perekat alam semesta yang bikin kita tetap membumi dan nggak melayang-layang ke luar angkasa.\n\n` +
      `Kalau kita lihat lewat kacamata sains:\n\n` +
      `• **Menurut Newton:** Setiap benda yang punya massa punya daya tarik tak terlihat. Semakin besar massanya (seperti Bumi kita yang super besar), semakin kuat ia menarik benda-benda lain di sekitarnya ke arah pusatnya.\n` +
      `• **Menurut Einstein (Teori Relativitas Umum):** Gravitasi sebenarnya adalah lengkungan ruang dan waktu. Bayangin sebuah kasur busa empuk, lalu ditaruh bola boling berat di tengahnya. Kasur itu bakal melengkung ke bawah kan? Nah, kalau kamu melempar kelereng di kasur itu, kelerengnya bakal bergulir mendekati bola boling. Begitulah cara matahari menahan bumi, dan bumi menahan bulan pada orbitnya!\n\n` +
      `Berkat gravitasi inilah atmosfer kita nggak kabur ke antariksa dan kita bisa bernapas dengan aman hari ini.`
    );
  }

  if (q.includes('bumi bulat') || q.includes('bumi datar')) {
    return (
      `Secara logika ilmiah dan pengamatan sehari-hari, membuktikan bumi bulat itu sebenarnya bisa dilakukan dengan sangat mudah bahkan tanpa perlu naik roket ke luar angkasa lho! 🌍\n\n` +
      `Coba kita perhatikan beberapa bukti nyata ini:\n\n` +
      `1. **Kapal di Laut Lepas:** Waktu ada kapal berlayar menjauh menuju cakrawala, lambung kapal bagian bawah selalu hilang lebih dulu di balik lengkungan air laut, baru kemudian tiang layarnya perlahan tenggelam. Kalau bumi datar, kapal mestinya cuma kelihatan makin kecil tapi tetap utuh sampai batas penglihatan.\n` +
      `2. **Bayangan Saat Gerhana Bulan:** Waktu gerhana bulan, bumi berada persis di antara matahari dan bulan. Bayangan bumi yang jatuh di permukaan bulan **selalu membentuk garis lengkung lingkaran sempurna**. Hanya bentuk bola (sphere) tiga dimensi yang bisa menghasilkan bayangan melengkung dari sudut mana pun ia disinari.\n` +
      `3. **Perbedaan Waktu Siang dan Malam:** Waktu di Tangerang siang bolong terik jam 12.00, kawan kita di London masih subuh, dan di New York masih malam gelap. Perbedaan ini terjadi murni karena bumi berputar secara melingkar mengelilingi porosnya.\n\n` +
      `Jadi secara nalar dan fakta fisika, bentuk bulat bumi itu sangat logis dan terbukti nyata!`
    );
  }

  if (q.includes('pesawat') || q.includes('terbang')) {
    return (
      `Kadang takjub ya kalau melihat pesawat seberat ratusan ton berisi ratusan penumpang dan bagasi bisa melayang santai di langit biru? ✈️\n\n` +
      `Kuncinya ada pada bentuk sayapnya yang dinamakan **Airfoil** dan interaksi gaya fisika:\n\n` +
      `Bentuk sayap pesawat sengaja dibuat melengkung di bagian atas dan relatif datar di bagian bawah. Waktu mesin jet mendorong pesawat melaju kencang ke depan, udara yang lewat di atas sayap bergerak lebih cepat, menciptakan tekanan udara yang lebih rendah dibanding bagian bawahnya (Prinsip Bernoulli).\n\n` +
      `Ditambah lagi, sayap pesawat sedikit dimiringkan ke atas, membelokkan berton-ton massa udara ke arah bawah. Sesuai hukum aksi-reaksi Newton, udara balas mendorong sayap pesawat ke atas dengan gaya angkat (*lift*) yang dahsyat!\n\n` +
      `Begitu gaya angkat ini melampaui berat total pesawat, burung besi ini langsung meluncur terbang ke angkasa dengan stabil.`
    );
  }

  if (q.includes('petir') || q.includes('kilat') || q.includes('listrik')) {
    return (
      `Petir itu pada dasarnya adalah lompatan listrik statis raksasa alami di angkasa!\n\n` +
      `Bayangin di dalam awan badai hitam yang pekat (*Cumulonimbus*), terjadi tabrakan dahsyat antara jutaan kristal es dan butiran air karena angin kencang. Gesekan hebat ini memisahkan muatan listrik: muatan positif terkumpul di puncak awan, dan muatan negatif yang berat mengendap di dasar awan.\n\n` +
      `Dasar awan yang negatif ini kemudian memicu muatan positif di tanah bawahnya. Ketika perbedaan tegangannya mencapai ratusan juta volt dan udara tak sanggup lagi menahannya... *ZAP!* Terjadilah pelepasan elektron secepat kilat!\n\n` +
      `Jalur kilat itu memanaskan udara di sekitarnya hingga mencapai suhu 30.000°C dalam sekejap (lima kali lebih panas dari permukaan matahari!). Udara memuai dengan kecepatan ledakan sonik, dan bunyi ledakan gelombang kejut itulah yang sampai ke telinga kita sebagai guntur atau gluduk.`
    );
  }

  return (
    `Pertanyaan ilmiah mengenai "${query}" ini menarik banget buat diulas!\n\n` +
    `Di alam semesta kita, segala peristiwa fisik selalu tunduk pada hukum sebab-akibat yang terukur. Segala sesuatunya tidak terjadi secara acak, melainkan ada transfer energi, interaksi molekul, atau prinsip mekanika di baliknya.\n\n` +
    `Kalau kamu mau kita bedah lebih spesifik aspek fisika atau mekanisme ilmiahnya, coba ceritakan bagian mana yang paling bikin kamu penasaran!`
  );
}

// -------------------------------------------------------------
// 3. Finansial, Ekonomi & Uang (ChatGPT Conversational Style)
// -------------------------------------------------------------
function handleEconomyLogic(q: string, query: string): string {
  if (q.includes('inflasi') || q.includes('harga naik')) {
    return (
      `Pernah ngerasa nggak, uang Rp50.000 sepuluh tahun lalu rasanya bisa buat belanja banyak hal, tapi sekarang cuma cukup buat sekali atau dua kali makan? Nah, itulah dampak nyata dari apa yang disebut **Inflasi**. 📈\n\n` +
      `Secara sederhana, inflasi itu bukan cuma "harga barang naik", tapi **nilai daya beli uang kita yang sedang menurun**.\n\n` +
      `Kenapa ini bisa terjadi? Ada dua pemicu utamanya:\n` +
      `1. **Banyak Uang Memperebutkan Sedikit Barang (*Demand-Pull*):** Misalnya pas musim mudik lebaran, semua orang mau beli tiket kereta, tapi kursinya terbatas. Otomatis harganya melambung.\n` +
      `2. **Biaya Produksi Melonjak (*Cost-Push*):** Kalau harga minyak, listrik, atau bahan baku naik, pabrik dan pedagang mau nggak mau harus menaikkan harga jual biar nggak bangkrut.\n\n` +
      `*Tips ngobrol santai:* Kalau kita cuma nyimpan semua uang tunai di bawah kasur atau tabungan biasa berbunga nol koma persen, nilainya perlahan 'termakan' inflasi. Makanya penting banget buat mulai belajar investasi di aset produktif atau instrumen yang pertumbuhannya melampaui laju inflasi tahunan!`
    );
  }

  return (
    `Ngomongin soal mengatur uang dan anggaran, kuncinya sebenarnya bukan seberapa banyak gaji yang kita terima, melainkan **seberapa disiplin sistem alokasi kita**. 💡\n\n` +
    `Ada rumus sederhana yang sering dipakai dan sangat manjur:\n\n` +
    `• **50% Kebutuhan Pokok:** Makan harian, tempat tinggal, bensin/transportasi, dan tagihan wajib.\n` +
    `• **30% Keinginan & Hiburan:** Hangout bareng teman, hobi, atau self-reward yang wajar agar hidup tetap seimbang dan nggak stres.\n` +
    `• **20% Tabungan & Dana Darurat:** Membangun benteng pertahanan sebelum kamu melangkah ke investasi yang lebih berisiko.\n\n` +
    `Prioritas pertamamu sebaiknya punya dana darurat minimal 3 bulan biaya hidup dulu. Dengan begitu, kalau tiba-tiba motor mogok atau ada keperluan mendadak, kamu tetap tenang tanpa harus pinjam sana-sini.`
  );
}

// -------------------------------------------------------------
// 4. Kesehatan, Tubuh, Tidur & Pola Hidup
// -------------------------------------------------------------
function handleHealthAndBodyLogic(q: string, query: string): string {
  if (q.includes('kopi') || q.includes('kafein')) {
    return (
      `Banyak orang mengira secangkir kopi itu memberi energi tambahan secara instan. Padahal faktanya secara sains: **kopi tidak menciptakan energi baru, tapi meminjam energi dengan cara 'mengelabui' otak kita!** ☕🧠\n\n` +
      `Begini triknya:\n\n` +
      `Bentuk molekul kafein itu sangat mirip dengan molekul Adenosin (zat kimia alami tubuh yang memicu rasa kantuk). Begitu kopi masuk ke aliran darah, kafein langsung menempel dan 'membajak' reseptor adenosin di otak.\n\n` +
      `Akibatnya, adenosin nggak bisa menempel, otak tidak menerima sinyal lelah, dan kita merasa segar serta fokus!\n\n` +
      `Tapi ingat, kafein punya waktu bertahan di tubuh (*half-life*) sekitar 5 sampai 7 jam. Jadi kalau kamu ngopi jam 5 sore, jam 11 malam masih ada sekitar separuh kafein yang beredar di badanmu. Makanya disarankan menikmati kopi sebelum siang agar tidur malammu tetap nyenyak.`
    );
  }

  if (q.includes('tidur') || q.includes('ngantuk') || q.includes('mengantuk') || q.includes('insomnia')) {
    return (
      `Pernah nggak kamu bertanya-tanya: *"Kenapa sih manusia wajib tidur dan kenapa mata kita bisa terasa berat banget pas mengantuk?"* 😴\n\n` +
      `Tidur itu bukan cuma sekadar "istirahat pasif", tapi proses pembersihan biologis otak yang luar biasa canggih:\n\n` +
      `Sepanjang hari saat kita terjaga dan berpikir, sel-sel otak kita membakar energi dan meninggalkan zat sisa bernama **Adenosin**. Semakin lama kamu melek, adenosin ini makin menumpuk di reseptor otak, mengirimkan sinyal kuat: *"Hai tubuh, bateraimu sudah menipis, istirahat sekarang!"* Itulah rasa kantuk yang kita rasakan.\n\n` +
      `Waktu kita tertidur lelap (*Deep Sleep*), sistem pembersih otak yang disebut **Sistem Glimfatik** bekerja seperti mobil penyiram jalanan—ia mengalirkan cairan untuk menyapu bersih racun-racun metabolik di otak, sekaligus merapikan memori ingatan kita dari jangka pendek ke jangka panjang.\n\n` +
      `*Tips praktis biar tidurnya pulas:* Usahakan matikan atau jauhkan layar ponsel 30-60 menit sebelum tidur ya. Cahaya biru dari layar HP menipu otak kita mengira hari masih siang, sehingga produksi hormon melatonin (hormon tidur) jadi tertunda.`
    );
  }

  return (
    `Menjaga tubuh tetap bugar dan berenergi sebenarnya nggak butuh rahasia yang rumit. Tubuh kita itu seperti mesin biologis yang butuh input berkualitas:\n\n` +
    `1. **Cukupi Air Putih:** Otak kita terdiri dari 75% air. Kurang minum sedikit saja langsung bikin konsentrasi buyar dan kepala pusing.\n` +
    `2. **Gerak Fisik:** Cukup jalan kaki 20-30 menit sehari atau olahraga kardio ringan. Itu sudah cukup merangsang hormon endorfin yang bikin mood kita bahagia dan bersemangat.\n` +
    `3. **Tidur Berkualitas:** 7 sampai 8 jam tidur nyenyak adalah fondasi terbaik untuk regenerasi sel tubuh.\n\n` +
    `Lagi ngerasa tubuh kurang fit di bagian mana nih? Cerita aja!`
  );
}

// -------------------------------------------------------------
// 5. Psikologi, Produktivitas, Menunda & Masalah Hidup
// -------------------------------------------------------------
function handlePsychologyAndLifeLogic(q: string, query: string): string {
  if (q.includes('malas') || q.includes('menunda') || q.includes('prokrastinasi')) {
    return (
      `Jujur ya, hampir semua orang pernah ngalamin momen ini: tahu ada hal penting yang harus dikerjain, tapi tangan rasanya lebih milih scrolling media sosial, nonton video pendek, atau sekadar rebahan. 😅\n\n` +
      `Kabar baiknya: di dunia psikologi dan neurosains, **menunda pekerjaan (prokrastinasi) itu sebenarnya bukan tanda bahwa kamu pemalas atau orang gagal**. Yang sebenarnya terjadi adalah pertarungan di otak antara dua pihak:\n\n` +
      `• **Sistem Limbik (Otak Emosi):** Bagian otak yang mencari kenyamanan instan dan ingin menghindari rasa sakit atau bosan.\n` +
      `• **Prefrontal Cortex (Otak Logika):** Bagian yang mikirin rencana jangka panjang, karier, dan masa depan.\n\n` +
      `Waktu sebuah tugas terasa terlalu besar, rumit, atau membosankan, otak emosi menganggapnya sebagai 'ancaman' dan otomatis kabur mencari kesenangan instan.\n\n` +
      `Nah, ini trik cerdas yang terbukti manjur buat mengatasinya:\n\n` +
      `1. **Aturan 2 Menit (Kecilkan Langkah Pertama):** Jangan berniat "menyelesaikan satu laporan utuh". Cukup janjikan pada dirimu: *"Aku cuma mau buka laptop dan nulis satu paragraf selama 2 menit."* Biasanya, begitu kita mulai bergerak, otak melepaskan dopamin dan kelembaman rasa malas hilang dengan sendirinya!\n` +
      `2. **Jauhkan Pemicu Distraksi:** Taruh HP di ruangan sebelah atau masukkan ke dalam tas saat mau mulai fokus. Makin ribet kamu meraih HP, makin gampang kamu fokus.\n` +
      `3. **Bikin Jadwal yang Spesifik:** Daripada bilang *"Nanti sore aku mau beresin tugas"*, ganti dengan *"Jam 16.00 di meja belajar aku buka dokumen bab satu"*. Kepastian waktu dan tempat melipatgandakan peluang eksekusi.\n\n` +
      `Coba deh langkah paling kecil dulu sekarang. Gimana, tugas apa nih yang lagi pengen kamu cicil?`
    );
  }

  if (q.includes('waktu') || q.includes('manajemen waktu') || q.includes('mengatur waktu')) {
    return (
      `Sering ngerasa waktu 24 jam sehari kayak cepat banget lewat tanpa hasil yang jelas? Kamu nggak sendirian, banyak banget yang merasakan hal yang sama. ⏳\n\n` +
      `Masalah terbesarnya biasanya bukan karena kita kekurangan waktu, tapi karena kita sering tertukar antara hal yang **"Mendesak" (*Urgent*)** dan hal yang **"Penting" (*Important*)**.\n\n` +
      `Coba bayangkan 4 kotak sederhana ini (Matriks Eisenhower):\n\n` +
      `1. **Penting & Mendesak:** Urusan darurat hari ini yang nggak bisa ditunda. Kerjakan sekarang juga.\n` +
      `2. **Penting tapi Tidak Mendesak:** Seperti belajar skill baru, olahraga, membaca buku, merencanakan program kerja Karang Taruna. *Ini rahasianya!* Orang-orang yang tenang dan sukses mencurahkan sebagian besar waktunya di sini sebelum semuanya berubah jadi krisis darurat.\n` +
      `3. **Mendesak tapi Tidak Penting:** Notifikasi grup chat yang ramai, ajakan spontan yang sepele. Batasi atau delegasikan.\n` +
      `4. **Tidak Penting & Tidak Mendesak:** Buka sosmed tanpa tujuan berjam-jam. Ini yang perlu kita kurangi secara sadar.\n\n` +
      `Kuncinya: pilih 1 sampai 3 hal paling penting setiap pagi, lalu selesaikan itu lebih dulu sebelum kamu membuka pintu distraksi lain.`
    );
  }

  if (q.includes('stres') || q.includes('burnout') || q.includes('lelah')) {
    return (
      `Kalau kamu lagi merasa lelah banget, pikiran penuh, atau burnout... tarik napas panjang dulu ya. Itu sinyal alami dari tubuh dan jiwamu bahwa kamu sudah berusaha keras dan kapasitas energimu sedang butuh diisi ulang. 🌿\n\n` +
      `Ada cara pandang yang sangat menenangkan dari filosofi Stoikisme yang bisa kamu coba:\n\n` +
      `**Pemisahan Kendali (*Dichotomy of Control*):**\n` +
      `Dalam hidup, selalu bagi persoalanmu menjadi dua lingkaran:\n` +
      `• Lingkaran yang **bisa kamu kendalikan:** Usahamu, sikapmu, caramu merespons, dan waktu istirahatmu.\n` +
      `• Lingkaran yang **di luar kendalimu:** Reaksi orang lain, omongan orang, masa lalu, dan hal-hal tak terduga.\n\n` +
      `Stres sering datang waktu kita memaksakan diri memikirkan hal-hal di luar kendali kita. Lepaskan yang nggak bisa kamu ubah, dan curahkan 100% perhatianmu pada apa yang bisa kamu lakukan hari ini secara perlahan.\n\n` +
      `Dan ingat: istirahat itu bukan tanda menyerah, tapi bagian penting dari perjalanan agar kita bisa melangkah lebih jauh lagi.`
    );
  }

  if (q.includes('grogi') || q.includes('bicara di depan umum') || q.includes('public speaking')) {
    return (
      `Rasa grogi atau deg-degan waktu mau bicara di depan umum itu 100% manusiawi! Bahkan pembicara hebat dunia pun masih merasakan sensasi kupu-kupu di perut sebelum naik panggung. 🎤✨\n\n` +
      `Biar kamu lebih tenang dan percaya diri, coba tiga mindset ini:\n\n` +
      `1. **Fokus Melayani Pendengar, Bukan Memikirkan Diri Sendiri:** Waktu kita cemas, biasanya kita mikir: *"Duh, penampilanku aneh nggak ya? Nanti kalau aku salah ngomong gimana?"* Alihkan fokusmu jadi: *"Apa manfaat atau inspirasi baik yang bisa aku bagikan ke orang-orang di depanku?"* Begitu niatmu tulus ingin berbagi, rasa takut bakal otomatis surut.\n` +
      `2. **Pegang 3 Poin Inti, Jangan Hafal Kata Per Kata:** Kalau menghafal kalimat demi kalimat, saat lupa satu kata kamu bakal panik. Cukup ingat 3 poin besar: Masalahnya apa ➔ Solusinya bagaimana ➔ Ajakan tindakannya apa.\n` +
      `3. **Manfaatkan Jeda 2 Detik:** Kalau tiba-tiba merasa blank, jangan panik. Diam 2 detik, tersenyum, dan tarik napas. Di mata audiens, jeda itu justru terlihat sangat tenang dan berwibawa!\n\n` +
      `Kamu lagi ada jadwal presentasi atau sambutan di acara apa nih?`
    );
  }

  if (q.includes('pemimpin') || q.includes('bos')) {
    return (
      `Perbedaan antara seorang "Bos" dan seorang "Pemimpin Sejati" itu terasa banget di hati orang-orang di sekitarnya. 🤝\n\n` +
      `Secara sederhana bedanya begini:\n\n` +
      `• **Seorang Bos:** Mengandalkan kekuasaan jabatannya. Sering berkata *"Kerjakan itu"* atau *"Saya atasan kalian"*. Kalau ada masalah, fokusnya mencari siapa yang bersalah.\n` +
      `• **Seorang Pemimpin:** Menggerakkan dengan keteladanan dan empati. Sering berkata *"Mari kita selesaikan bareng-bareng"*. Kalau ada kegagalan, ia maju paling depan untuk bertanggung jawab dan merangkul timnya mencari solusi.\n\n` +
      `Di organisasi kepemudaan seperti Karang Taruna Kelurahan Manis Jaya yang sifatnya gotong royong dan sukarela, kepemimpinan yang melayani (*servant leadership*) adalah kunci utama agar kawan-kawan pemuda merasa dihargai dan punya rasa memiliki (*sense of belonging*).`
    );
  }

  return (
    `Menghadapi hal mengenai "${query}", mari kita renungkan dengan kepala dingin dan hati yang tenang.\n\n` +
    `Dalam hidup, sering kali jalan keluar dari sebuah persoalan tidak serumit yang kita bayangkan saat pikiran sedang kalut. Cobalah pilah apa yang menjadi akar persoalannya, ambil satu langkah kecil konkret yang bisa kamu lakukan hari ini, dan jangan ragu untuk berbagi cerita.\n\n` +
    `Ceritakan lebih banyak kalau kamu ingin mendiskusikannya lebih dalam, aku siap mendengarkan!`
  );
}

// -------------------------------------------------------------
// 6. Teknologi, Komputer & AI
// -------------------------------------------------------------
function handleTechLogic(q: string, query: string): string {
  if (q.includes('ai') || q.includes('kecerdasan buatan')) {
    return (
      `Topik tentang AI (Artificial Intelligence) ini seru banget ya! Kadang ada yang mengira AI itu punya kesadaran seperti manusia atau kekuatan sihir, padahal di baliknya adalah sains komputer dan matematika statistik tingkat tinggi. 🤖💻\n\n` +
      `Model AI modern (seperti Large Language Model) dilatih membaca miliaran teks dan data, mempelajari bagaimana kata-kata dirangkai, serta memahami konteks logika dan pola penalaran manusia.\n\n` +
      `Namun, ada hal penting yang membedakannya dengan manusia:\n` +
      `AI tidak punya kesadaran biologis, tidak punya rasa empati yang lahir dari pengalaman hidup, dan tidak punya moralitas sejati. AI adalah instrumen pengungkit (*amplifier*) yang hebat. Kehebatannya baru benar-benar bermakna ketika diarahkan oleh kebijaksanaan, akal sehat, dan kehangatan manusia.\n\n` +
      `Jadi, orang yang paham cara berkolaborasi dengan AI akan jauh lebih berdaya saing dan produktif dalam berkarya!`
    );
  }

  if (q.includes('internet') || q.includes('jaringan')) {
    return (
      `Pernah kepikiran nggak, waktu kamu mengetik pesan di HP di Manis Jaya dan kirim ke temanmu di belahan dunia lain, pesannya bisa sampai cuma dalam waktu kurang dari satu detik? 🌐⚡\n\n` +
      `Secara sederhana, internet itu adalah jalinan miliaran komputer di seluruh penjuru bumi yang saling terhubung menggunakan bahasa komunikasi yang sama (protokol TCP/IP).\n\n` +
      `Waktu kamu membuka website, datamu dipecah jadi ribuan paket data kecil, melesat melewati pemancar sinyal, kabel fiber optik di dasar laut berkecepatan cahaya, lalu disusun kembali di layar handphone-mu dalam sekejap mata. Luar biasa ya keajaiban rekayasa teknologi manusia!`
    );
  }

  return (
    `Mengenai teknologi "${query}", pada dasarnya prinsip dasarnya selalu bertumpu pada alur logika: **Masukan (Input) ➔ Pemrosesan Data ➔ Hasil (Output)**.\n\n` +
    `Sistem teknologi yang baik selalu dibangun secara modular dan aman agar mempermudah kehidupan manusia sehari-hari. Mau kita bahas sisi teknis atau pengaplikasian praktisnya nih?`
  );
}

// -------------------------------------------------------------
// 7. Berpikir Kritis & Logika
// -------------------------------------------------------------
function handleCriticalThinkingLogic(q: string, query: string): string {
  return (
    `Melatih logika berpikir jernih dan akal sehat itu ibarat mengasah pisau dapur: makin sering dilatih, makin tajam kita membedakan mana yang fakta dan mana yang sekadar asumsi atau hoaks. 🧠💡\n\n` +
    `Ada beberapa tips sederhana yang bisa kamu pakai setiap kali menghadapi argumen atau kabar baru:\n\n` +
    `1. **Bedakan Fakta vs Opini:** Fakta adalah hal yang terbukti secara objektif dan ada datanya. Opini adalah sudut pandang pribadi atau perasaan seseorang tentang fakta tersebut.\n` +
    `2. **Waspadai Kesesatan Berpikir (*Logical Fallacy*):**\n` +
    `   • Misalnya menyerang pribadi orangnya, bukan membahas argumennya (*Ad Hominem*).\n` +
    `   • Atau membesar-besarkan ucapan orang lain supaya tampak salah (*Strawman*).\n` +
    `3. **Prinsip Pisau Cukur Occam (*Occam's Razor*):** Kalau ada dua penjelasan yang bersaing untuk suatu kejadian, penjelasan yang paling sederhana dan paling sedikit membutuhkan asumsi liar biasanya adalah yang paling mendekati kebenaran.\n\n` +
    `Dengan membiasakan diri bertanya *"Apa bukti pendukungnya?"* dan *"Apa hubungan sebab-akibatnya?"*, kita nggak akan gampang terbawa arus atau tertipu kabar burung.`
  );
}

// -------------------------------------------------------------
// 8. Sapaan & Persona Teman Ngobrol
// -------------------------------------------------------------
function handleGreetingLogic(q: string, context?: ReasoningContext): string {
  const name = context?.userName ? context.userName : 'Kawan';
  return (
    `Halo ${name}! Senang sekali bisa mengobrol denganmu hari ini. 😊👋\n\n` +
    `Anggap saja aku sahabat ngobrol dan teman berpikirmu di portal Karang Taruna Kelurahan Manis Jaya. Kita bisa berdiskusi santai tentang apa saja lho:\n\n` +
    `• **Ngobrol Bebas & Kehidupan:** Dari sains seru, teknologi, tips produktivitas dan mengatasi malas, cara mengatur waktu, sampai curhat keseharian.\n` +
    `• **Karang Taruna Manis Jaya:** Segala hal seputar pemuda di 8 RW Manis Jaya—program kerja, bikin surat resmi dinas & tanda tangan digital, cetak KTA, pinjam aset/sound system, dan agenda kegiatan.\n\n` +
    `Lagi ada hal menarik apa yang lagi kamu pikirkan atau ingin kita bahas bareng? Cerita aja ya!`
  );
}

// -------------------------------------------------------------
// 9. Obrolan Bebas Terbuka (Open-Domain ChatGPT Style)
// -------------------------------------------------------------
function handleGeneralDynamicLogic(query: string): string {
  const clean = query.replace(/[?.,!]/g, '').trim();

  return (
    `Wah, pertanyaan yang menarik banget buat diobrolin! Tentang *"#query#"* ya? 😊\n\n`
      .replace('#query#', clean) +
    `Kalau kita telaah bersama-sama dengan akal sehat dan sudut pandang yang luas, hal ini punya beberapa sisi yang asyik untuk diperhatikan:\n\n` +
    `Pertama, setiap persoalan atau pertanyaan selalu berakar dari konteks di baliknya—tidak ada hal yang berdiri sendiri tanpa adanya sebab-akibat. Ketika kita melihat pokok masalahnya secara jernih, kita bisa memisahkan mana bagian yang paling mendasar dan mana yang sekadar faktor pendukung.\n\n` +
    `Kedua, dari sudut pandang praktis, cara terbaik menanggapi hal ini adalah dengan pendekatan yang realistis dan masuk akal. Kita timbang dampaknya, lihat fakta-fakta yang ada di lapangan, lalu tentukan tindakan atau kesimpulan terbaik.\n\n` +
    `Bagaimana menurut pandanganmu sendiri sejauh ini? Kalau ada cerita atau detail situasi tertentu yang sedang kamu alami terkait ini, ceritakan aja ya—senang banget bisa bertukar pikiran bareng kamu!`
  );
}
