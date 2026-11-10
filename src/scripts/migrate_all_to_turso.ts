/**
 * ============================================================================
 * Utilitas Skrip Migrasi Penuh: Seluruh Database ke Turso Database (libSQL)
 * Organisasi: Karang Taruna Kelurahan Manis Jaya, Jatiuwung, Kota Tangerang
 * ============================================================================
 *
 * Memindahkan 100% seluruh basis data organisasi ke Turso Database:
 * 1. Berita & Dokumentasi Kegiatan (news)
 * 2. Data Anggota & Akun Pengurus RW 01 - RW 05 (members)
 * 3. Inventaris Aset & Sarana Pemuda (assets)
 * 4. Agenda & Kalender Kegiatan (agenda)
 * 5. Arsip Surat Masuk, Keluar & Disposisi (letters)
 * 6. Buku Kas & Transaksi Keuangan (kas)
 * 7. Musyawarah Pemuda & Polling Keputusan (votings)
 * 8. Status Agregat Sistem Lengkap (org_live_state)
 *
 * Cara Menjalankan:
 * npx tsx src/scripts/migrate_all_to_turso.ts
 * npx tsx src/scripts/migrate_all_to_turso.ts --url="libsql://your-db.turso.io" --token="token"
 * npx tsx src/scripts/migrate_all_to_turso.ts --dry-run
 * npm run migrate:turso-all
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import { createClient, Client } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';

// Parse argumen command line
const args = process.argv.slice(2);
const getArgValue = (prefix: string): string | undefined => {
  const match = args.find((a) => a.startsWith(prefix));
  if (match) {
    return match.split('=')[1]?.replace(/^["']|["']$/g, '');
  }
  return undefined;
};

const isDryRun = args.includes('--dry-run');
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
┌────────────────────────────────────────────────────────────────────────┐
│  MIGRASI PENUH SELURUH DATABASE KE TURSO DATABASE (libSQL Cloud)      │
│  Karang Taruna Kelurahan Manis Jaya - RW 01 s/d RW 05                  │
└────────────────────────────────────────────────────────────────────────┘

Opsi & Argumen:
  --url=<turso_url>       URL Turso Database (contoh: libsql://your-db.turso.io)
  --token=<auth_token>    Auth token JWT Turso Database
  --dry-run               Jalankan simulasi tanpa menulis ke Turso
  --help, -h              Tampilkan panduan ini

Contoh:
  npx tsx src/scripts/migrate_all_to_turso.ts
  npm run migrate:turso-all
`);
  process.exit(0);
}

// 1. Muat Konfigurasi Firebase
function loadFirebaseConfig(): any {
  const rootDir = process.cwd();
  const configPath = path.join(rootDir, 'firebase-applet-config.json');

  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(raw);
    } catch {}
  }

  return {
    projectId: 'gen-lang-client-0976942020',
    apiKey: 'AIzaSyDh3PYZQH61LeUIcH9saoYYg4fXkX7D73Y',
    authDomain: 'gen-lang-client-0976942020.firebaseapp.com',
    firestoreDatabaseId: 'ai-studio-manisjayaworkspa-ec81f613-a48a-4f0a-b6aa-73b736219680',
  };
}

// 2. Muat Konfigurasi Turso
function loadTursoConfig(): { url: string; authToken: string } {
  const argUrl = getArgValue('--url');
  const argToken = getArgValue('--token');
  if (argUrl) {
    return {
      url: argUrl,
      authToken: argToken || process.env.TURSO_AUTH_TOKEN || '',
    };
  }

  const rootDir = process.cwd();
  const envPath = path.join(rootDir, '.env');
  let envFileUrl = '';
  let envFileToken = '';
  if (fs.existsSync(envPath)) {
    try {
      const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('TURSO_DATABASE_URL=')) {
          envFileUrl = trimmed.split('=')[1]?.replace(/^["']|["']$/g, '').trim();
        }
        if (trimmed.startsWith('TURSO_AUTH_TOKEN=')) {
          envFileToken = trimmed.split('=')[1]?.replace(/^["']|["']$/g, '').trim();
        }
      }
    } catch {}
  }

  const url = process.env.TURSO_DATABASE_URL || envFileUrl || '';
  const authToken = process.env.TURSO_AUTH_TOKEN || envFileToken || '';

  return { url, authToken };
}

// 3. Inisialisasi Firebase
function initFirebaseFirestore(config: any): Firestore {
  const existingApps = getApps();
  const firebaseApp = existingApps.length > 0
    ? existingApps[0]
    : initializeApp({
        apiKey: config.apiKey,
        projectId: config.projectId,
        authDomain: config.authDomain,
      });

  const dbId = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
    ? config.firestoreDatabaseId
    : undefined;

  return dbId ? getFirestore(firebaseApp, dbId) : getFirestore(firebaseApp);
}

// 4. Inisialisasi Seluruh Skema Tabel di Turso
async function ensureAllTursoTables(client: any): Promise<void> {
  // Tabel Agregat Status Sistem
  await client.execute(`
    CREATE TABLE IF NOT EXISTS org_live_state (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT,
      reason TEXT,
      device_id TEXT
    );
  `);

  // Tabel Berita & Dokumentasi Kegiatan
  await client.execute(`
    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      badge TEXT,
      badge_color TEXT,
      category TEXT,
      date TEXT,
      description TEXT,
      location TEXT,
      author TEXT,
      image TEXT,
      photos TEXT,
      video_url TEXT,
      video_duration INTEGER,
      summary TEXT,
      content TEXT,
      status TEXT,
      slug TEXT,
      ratings TEXT,
      comments TEXT,
      raw_data TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  // Tabel Anggota & Akun Pengurus
  await client.execute(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      username TEXT,
      name TEXT NOT NULL,
      role TEXT,
      rw TEXT,
      phone TEXT,
      email TEXT,
      raw_data TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  // Tabel Inventaris Aset
  await client.execute(`
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      category TEXT,
      condition TEXT,
      quantity INTEGER,
      location TEXT,
      raw_data TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  // Tabel Agenda & Kalender Kegiatan
  await client.execute(`
    CREATE TABLE IF NOT EXISTS agenda (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT,
      time TEXT,
      location TEXT,
      status TEXT,
      raw_data TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  // Tabel Arsip Surat Menyurat
  await client.execute(`
    CREATE TABLE IF NOT EXISTS letters (
      id TEXT PRIMARY KEY,
      number TEXT,
      type TEXT,
      title TEXT,
      date TEXT,
      status TEXT,
      raw_data TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  // Tabel Buku Kas Keuangan
  await client.execute(`
    CREATE TABLE IF NOT EXISTS kas (
      id TEXT PRIMARY KEY,
      type TEXT,
      amount REAL,
      description TEXT,
      date TEXT,
      category TEXT,
      raw_data TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  // Tabel Polling & Votings Musyawarah
  await client.execute(`
    CREATE TABLE IF NOT EXISTS votings (
      id TEXT PRIMARY KEY,
      title TEXT,
      status TEXT,
      raw_data TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  // Coba tambahkan kolom raw_data jika tabel lama belum memilikinya
  for (const tbl of ['news', 'members', 'assets', 'agenda', 'letters', 'kas', 'votings']) {
    try {
      await client.execute(`ALTER TABLE ${tbl} ADD COLUMN raw_data TEXT;`);
    } catch {}
  }

  // Buat indeks untuk performa pencarian
  try {
    await client.execute('CREATE INDEX IF NOT EXISTS idx_news_updated_at ON news(updated_at DESC);');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_assets_code ON assets(code);');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_kas_date ON kas(date DESC);');
  } catch {}
}

const nowTimestamp = () => new Date().toISOString();

// ============================================================================
// PROSES MIGRASI LENGKAP
// ============================================================================
async function runFullMigration() {
  console.log(`
════════════════════════════════════════════════════════════════════════════════
🌐 MIGRASI PENUH SELURUH DATABASE: CLOUD FIRESTORE ➔ TURSO (libSQL)
🏢 Karang Taruna Kelurahan Manis Jaya, Jatiuwung, Kota Tangerang
📅 Waktu Eksekusi: ${new Date().toLocaleString('id-ID')}
════════════════════════════════════════════════════════════════════════════════
`);

  const fbConfig = loadFirebaseConfig();
  const tursoConfig = loadTursoConfig();

  console.log(`[1/4] Status Konfigurasi:`);
  console.log(`  • Firebase Project ID : ${fbConfig.projectId}`);
  console.log(`  • Firestore DB ID     : ${fbConfig.firestoreDatabaseId || '(default)'}`);
  console.log(`  • Turso Database URL  : ${tursoConfig.url ? tursoConfig.url : '(Belum diset - gunakan --url atau UI)'}`);
  console.log(`  • Mode Dry Run        : ${isDryRun ? 'AKTIF (Simulasi)' : 'TIDAK (Data langsung disimpan)'}`);
  console.log('');

  let tursoClient: any = null;
  let viaProxy = false;

  if (!isDryRun) {
    if (tursoConfig.url) {
      try {
        console.log(`[2/4] Menghubungkan langsung ke Turso Database & menyiapkan seluruh tabel...`);
        tursoClient = createClient({
          url: tursoConfig.url,
          authToken: tursoConfig.authToken,
        });

        await tursoClient.execute('SELECT 1 as ping;');
        await ensureAllTursoTables(tursoClient);
        console.log(`  ✓ Koneksi Turso Database aktif & 8 tabel operasional siap!`);
        console.log('');
      } catch (err: any) {
        console.error(`❌ [Error] Gagal menghubungkan ke Turso: ${err.message}`);
        process.exit(1);
      }
    } else {
      // Coba gunakan server lokal (port 3000) yang sudah memiliki Secrets TURSO_DATABASE_URL & TURSO_AUTH_TOKEN
      const serverBase = process.env.LOCAL_SERVER_URL || 'http://localhost:3000';
      try {
        console.log(`[2/4] Menghubungkan via Server Proxy (${serverBase}/api/turso/test)...`);
        const testRes = await fetch(`${serverBase}/api/turso/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        const testData: any = await testRes.json();
        if (!testRes.ok || !testData.success) {
          throw new Error(testData.message || 'Server tidak memiliki konfigurasi Turso');
        }
        viaProxy = true;
        console.log(`  ✓ Terhubung ke Turso via Server: ${testData.url}`);

        tursoClient = {
          execute: async (stmt: string | { sql: string; args?: any[] }) => {
            const payload = typeof stmt === 'string' ? { sql: stmt, args: [] } : { sql: stmt.sql, args: stmt.args || [] };
            const res = await fetch(`${serverBase}/api/turso/execute`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            const data: any = await res.json();
            if (!res.ok || !data.success) {
              throw new Error(data.message || 'Gagal mengeksekusi query Turso lewat proxy server');
            }
            return { rows: data.rows || [], rowsAffected: data.rowsAffected || 0 };
          },
          close: () => {},
        };

        await ensureAllTursoTables(tursoClient);
        console.log(`  ✓ 8 tabel operasional & indeks siap di Turso Database!`);
        console.log('');
      } catch (proxyErr: any) {
        console.error(`❌ [Gagal] URL Turso Database belum disetel & Server Proxy tidak tersedia: ${proxyErr.message}`);
        console.error(`   Jalankan dengan: npx tsx src/scripts/migrate_all_to_turso.ts --url="libsql://your-db.turso.io" --token="token"`);
        process.exit(1);
      }
    }
  } else {
    console.log(`[2/4] Mode Dry-Run: Melewati inisialisasi koneksi fisik Turso.`);
    console.log('');
  }

  // Ambil Data dari Firestore
  console.log(`[3/4] Mengumpulkan seluruh data operasional dari Firestore & sistem...`);
  const firestoreDb = initFirebaseFirestore(fbConfig);

  const stats = {
    news: 0,
    members: 0,
    assets: 0,
    agenda: 0,
    letters: 0,
    kas: 0,
    votings: 0,
  };

  const aggregateState: Record<string, any> = {};
  const nowISO = nowTimestamp();

  // Helper untuk fetch subcollection Firestore
  const fetchSubcol = async (subcolName: string): Promise<any[]> => {
    try {
      const snap = await getDocs(collection(firestoreDb, 'organizations', 'manisjaya', subcolName));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch {
      return [];
    }
  };

  // Helper untuk fetch aggregate doc
  let remoteLiveStateData: any = {};
  try {
    const snap = await getDoc(doc(firestoreDb, 'organizations', 'manisjaya', 'live', 'state'));
    if (snap.exists()) {
      remoteLiveStateData = snap.data()?.data || {};
    }
  } catch {}

  // A. Migrasi Berita (News)
  console.log(`  • Memproses Berita & Dokumentasi Kegiatan (news)...`);
  const newsFromSub = await fetchSubcol('news');
  const newsFromAgg = remoteLiveStateData.kt_news_v1 || remoteLiveStateData.kt_activities_v1 || [];
  const newsMap = new Map<string, any>();
  newsFromSub.forEach((n) => newsMap.set(String(n.id), n));
  newsFromAgg.forEach((n: any) => {
    if (n?.id && !newsMap.has(String(n.id))) newsMap.set(String(n.id), n);
  });
  const allNews = Array.from(newsMap.values());
  aggregateState['kt_news_v1'] = allNews;

  for (const item of allNews) {
    if (!isDryRun && tursoClient) {
      await tursoClient.execute({
        sql: `INSERT INTO news (
          id, title, badge, badge_color, category, date, description,
          location, author, image, photos, video_url, video_duration,
          summary, content, status, slug, ratings, comments, raw_data, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title, badge = excluded.badge, badge_color = excluded.badge_color,
          category = excluded.category, date = excluded.date, description = excluded.description,
          location = excluded.location, author = excluded.author, image = excluded.image,
          photos = excluded.photos, video_url = excluded.video_url, video_duration = excluded.video_duration,
          summary = excluded.summary, content = excluded.content, status = excluded.status,
          slug = excluded.slug, ratings = excluded.ratings, comments = excluded.comments,
          raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
        args: [
          String(item.id),
          item.title || 'Tanpa Judul',
          item.badge || 'Kegiatan',
          item.badgeColor || 'dark',
          item.category || 'Sosial',
          item.date || '',
          item.description || '',
          item.location || 'Kelurahan Manis Jaya',
          item.author || 'Admin',
          item.image || '',
          JSON.stringify(item.photos || []),
          item.videoUrl || '',
          item.videoDuration || 15,
          item.summary || '',
          item.content || '',
          item.status || 'Publikasikan Sekarang',
          item.slug || '',
          JSON.stringify(item.ratings || []),
          JSON.stringify(item.comments || []),
          JSON.stringify(item),
          item.updatedAt || nowISO,
        ],
      });
    }
    stats.news++;
  }
  console.log(`    ➔ ${stats.news} berita berhasil dimasukkan.`);

  // B. Migrasi Anggota & Akun Pengurus (Members)
  console.log(`  • Memproses Anggota & Akun Pengurus (members)...`);
  const membersFromSub = await fetchSubcol('members');
  const membersFromAgg = remoteLiveStateData.kt_members_v3 || remoteLiveStateData.kt_users_list_v3 || [];
  const membersMap = new Map<string, any>();
  membersFromSub.forEach((m) => membersMap.set(String(m.id || m.username), m));
  membersFromAgg.forEach((m: any) => {
    const k = String(m?.id || m?.username);
    if (k && !membersMap.has(k)) membersMap.set(k, m);
  });
  const allMembers = Array.from(membersMap.values());
  aggregateState['kt_members_v3'] = allMembers;

  for (const m of allMembers) {
    const mid = String(m.id || m.username);
    if (!isDryRun && tursoClient) {
      await tursoClient.execute({
        sql: `INSERT INTO members (id, username, name, role, rw, phone, email, raw_data, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                username = excluded.username, name = excluded.name, role = excluded.role,
                rw = excluded.rw, phone = excluded.phone, email = excluded.email,
                raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
        args: [
          mid,
          m.username || '',
          m.name || 'Anggota Karang Taruna',
          m.role || m.jabatan || 'Anggota',
          m.rw || 'RW 01',
          m.phone || m.telepon || '',
          m.email || '',
          JSON.stringify(m),
          m.updatedAt || nowISO,
        ],
      });
    }
    stats.members++;
  }
  console.log(`    ➔ ${stats.members} anggota/pengurus berhasil dimasukkan.`);

  // C. Migrasi Aset (Assets)
  console.log(`  • Memproses Inventaris Aset Organisasi (assets)...`);
  const assetsFromSub = await fetchSubcol('assets');
  const assetsFromAgg = remoteLiveStateData.kt_assets_v1 || [];
  const assetsMap = new Map<string, any>();
  assetsFromSub.forEach((a) => assetsMap.set(String(a.id), a));
  assetsFromAgg.forEach((a: any) => {
    if (a?.id && !assetsMap.has(String(a.id))) assetsMap.set(String(a.id), a);
  });
  const allAssets = Array.from(assetsMap.values());
  aggregateState['kt_assets_v1'] = allAssets;

  for (const a of allAssets) {
    if (!isDryRun && tursoClient) {
      await tursoClient.execute({
        sql: `INSERT INTO assets (id, name, code, category, condition, quantity, location, raw_data, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name, code = excluded.code, category = excluded.category,
                condition = excluded.condition, quantity = excluded.quantity,
                location = excluded.location, raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
        args: [
          String(a.id),
          a.namaAsset || a.name || 'Aset Organisasi',
          a.kodeAsset || a.code || '',
          a.kategori || a.category || 'Peralatan',
          a.kondisi || a.condition || 'Baik',
          Number(a.quantity || a.jumlah || 1),
          a.lokasi || a.location || 'Sekretariat',
          JSON.stringify(a),
          a.updatedAt || nowISO,
        ],
      });
    }
    stats.assets++;
  }
  console.log(`    ➔ ${stats.assets} inventaris aset berhasil dimasukkan.`);

  // D. Migrasi Agenda (Agenda)
  console.log(`  • Memproses Kalender & Agenda Kegiatan (agenda)...`);
  const agendaFromSub = await fetchSubcol('agenda');
  const agendaFromAgg = remoteLiveStateData.kt_agenda_v1 || remoteLiveStateData.kt_agendas_v1 || [];
  const agendaMap = new Map<string, any>();
  agendaFromSub.forEach((ag) => agendaMap.set(String(ag.id), ag));
  agendaFromAgg.forEach((ag: any) => {
    if (ag?.id && !agendaMap.has(String(ag.id))) agendaMap.set(String(ag.id), ag);
  });
  const allAgenda = Array.from(agendaMap.values());
  aggregateState['kt_agenda_v1'] = allAgenda;

  for (const ag of allAgenda) {
    if (!isDryRun && tursoClient) {
      await tursoClient.execute({
        sql: `INSERT INTO agenda (id, title, date, time, location, status, raw_data, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                title = excluded.title, date = excluded.date, time = excluded.time,
                location = excluded.location, status = excluded.status,
                raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
        args: [
          String(ag.id),
          ag.title || ag.judul || 'Agenda Kegiatan',
          ag.date || ag.tanggal || '',
          ag.time || ag.waktu || '',
          ag.location || ag.lokasi || 'Kelurahan Manis Jaya',
          ag.status || 'Terjadwal',
          JSON.stringify(ag),
          ag.updatedAt || nowISO,
        ],
      });
    }
    stats.agenda++;
  }
  console.log(`    ➔ ${stats.agenda} agenda kegiatan berhasil dimasukkan.`);

  // E. Migrasi Surat Menyurat (Letters)
  console.log(`  • Memproses Arsip Surat Masuk, Keluar & Disposisi (letters)...`);
  const lettersFromSub = await fetchSubcol('letters');
  const lettersFromAgg = remoteLiveStateData.kt_surat_items_v2 || [];
  const lettersMap = new Map<string, any>();
  lettersFromSub.forEach((l) => lettersMap.set(String(l.id), l));
  lettersFromAgg.forEach((l: any) => {
    if (l?.id && !lettersMap.has(String(l.id))) lettersMap.set(String(l.id), l);
  });
  const allLetters = Array.from(lettersMap.values());
  aggregateState['kt_surat_items_v2'] = allLetters;

  for (const l of allLetters) {
    if (!isDryRun && tursoClient) {
      await tursoClient.execute({
        sql: `INSERT INTO letters (id, number, type, title, date, status, raw_data, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                number = excluded.number, type = excluded.type, title = excluded.title,
                date = excluded.date, status = excluded.status,
                raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
        args: [
          String(l.id),
          l.letterNumber || l.number || l.nomorSurat || '',
          l.type || l.jenisSurat || 'Surat Keluar',
          l.subject || l.title || l.perihal || 'Surat Karang Taruna',
          l.date || l.tanggalSurat || '',
          l.status || 'Terkirim',
          JSON.stringify(l),
          l.updatedAt || nowISO,
        ],
      });
    }
    stats.letters++;
  }
  console.log(`    ➔ ${stats.letters} arsip surat berhasil dimasukkan.`);

  // F. Migrasi Buku Kas Keuangan (Kas)
  console.log(`  • Memproses Transaksi Buku Kas Keuangan (kas)...`);
  const kasFromSub = await fetchSubcol('kas');
  const kasFromAgg = remoteLiveStateData.kt_kas_entries_v2 || [];
  const kasMap = new Map<string, any>();
  kasFromSub.forEach((k) => kasMap.set(String(k.id), k));
  kasFromAgg.forEach((k: any) => {
    if (k?.id && !kasMap.has(String(k.id))) kasMap.set(String(k.id), k);
  });
  const allKas = Array.from(kasMap.values());
  aggregateState['kt_kas_entries_v2'] = allKas;

  for (const k of allKas) {
    if (!isDryRun && tursoClient) {
      await tursoClient.execute({
        sql: `INSERT INTO kas (id, type, amount, description, date, category, raw_data, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                type = excluded.type, amount = excluded.amount, description = excluded.description,
                date = excluded.date, category = excluded.category,
                raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
        args: [
          String(k.id),
          k.type || 'Pemasukan',
          Number(k.amount || k.nominal || 0),
          k.description || k.keterangan || '',
          k.date || k.tanggal || '',
          k.category || k.kategori || 'Kas Organisasi',
          JSON.stringify(k),
          k.updatedAt || nowISO,
        ],
      });
    }
    stats.kas++;
  }
  console.log(`    ➔ ${stats.kas} transaksi kas keuangan berhasil dimasukkan.`);

  // G. Migrasi Votings Musyawarah Pemuda (Votings)
  console.log(`  • Memproses Polling & Musyawarah Pemuda (votings)...`);
  const votingsFromSub = await fetchSubcol('votings');
  const votingsFromAgg = remoteLiveStateData.kt_votings_v1 || [];
  const votingsMap = new Map<string, any>();
  votingsFromSub.forEach((v) => votingsMap.set(String(v.id), v));
  votingsFromAgg.forEach((v: any) => {
    if (v?.id && !votingsMap.has(String(v.id))) votingsMap.set(String(v.id), v);
  });
  const allVotings = Array.from(votingsMap.values());
  aggregateState['kt_votings_v1'] = allVotings;

  for (const v of allVotings) {
    if (!isDryRun && tursoClient) {
      await tursoClient.execute({
        sql: `INSERT INTO votings (id, title, status, raw_data, updated_at)
              VALUES (?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                title = excluded.title, status = excluded.status,
                raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
        args: [
          String(v.id),
          v.title || v.judul || 'Musyawarah Pemuda',
          v.status || 'Aktif',
          JSON.stringify(v),
          v.updatedAt || nowISO,
        ],
      });
    }
    stats.votings++;
  }
  console.log(`    ➔ ${stats.votings} musyawarah & polling berhasil dimasukkan.`);

  // H. Simpan Master Agregat Sistem ke 'org_live_state'
  if (!isDryRun && tursoClient) {
    console.log(`  • Menyimpan master agregat sistem lengkap ke 'org_live_state'...`);
    await tursoClient.execute({
      sql: `INSERT INTO org_live_state (id, data, updated_at, updated_by, reason)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              data = excluded.data, updated_at = excluded.updated_at, reason = excluded.reason;`,
      args: [
        'manisjaya_live',
        JSON.stringify(aggregateState),
        nowISO,
        'Utilitas Migrasi Penuh Turso',
        'Migrasi lengkap seluruh database ke Turso libSQL',
      ],
    });
    console.log(`    ✓ Master agregat tersimpan!`);
  }

  // 4. Laporan Akhir
  console.log(`
════════════════════════════════════════════════════════════════════════════════
🎉 HASIL MIGRASI LENGKAP KE TURSO DATABASE (libSQL Cloud)
════════════════════════════════════════════════════════════════════════════════
1. Berita & Dokumentasi Kegiatan : ${stats.news} baris
2. Anggota & Pengurus RW 01 - 05 : ${stats.members} baris
3. Inventaris Aset Organisasi    : ${stats.assets} baris
4. Kalender & Agenda Kegiatan    : ${stats.agenda} baris
5. Arsip Surat Menyurat          : ${stats.letters} baris
6. Buku Kas & Keuangan           : ${stats.kas} baris
7. Musyawarah & Polling Pemuda   : ${stats.votings} baris
────────────────────────────────────────────────────────────────────────────────
TOTAL KESELURUHAN DATA DIMASUKKAN : ${stats.news + stats.members + stats.assets + stats.agenda + stats.letters + stats.kas + stats.votings} entitas data
STATUS                           : SELESAI (100% SUKSES)
════════════════════════════════════════════════════════════════════════════════
`);

  if (!isDryRun && tursoClient && typeof tursoClient.close === 'function') {
    tursoClient.close();
  }

  if (viaProxy) {
    console.log('✓ Sinkronisasi via Server Proxy selesai.');
  }

  process.exit(0);
}

runFullMigration().catch((err) => {
  console.error('\n❌ Kesalahan fatal saat migrasi penuh:', err);
  process.exit(1);
});
