/**
 * ============================================================================
 * Utilitas Skrip Migrasi: Cloud Firestore ke Turso Database (libSQL Cloud)
 * Organisasi: Karang Taruna Kelurahan Manis Jaya, Jatiuwung, Kota Tangerang
 * ============================================================================
 *
 * Deskripsi:
 * Mengambil seluruh konten berita & dokumentasi kegiatan dari Google Cloud
 * Firestore (koleksi /organizations/manisjaya/news serta dokumen agregat
 * /organizations/manisjaya/live/state) dan memindahkannya ke Turso Database
 * (tabel 'news' pada libSQL Cloud) agar tersimpan terpusat, permanen, dan real-time.
 *
 * Cara Menjalankan CLI:
 * 1. Default (menggunakan environment variable atau config):
 *    npx tsx src/scripts/migrate_news_firestore_to_turso.ts
 *
 * 2. Menggunakan argumen eksplisit:
 *    npx tsx src/scripts/migrate_news_firestore_to_turso.ts --url="libsql://your-db.turso.io" --token="eyJhbGciOi..."
 *
 * 3. Menggunakan npm script:
 *    npm run migrate:turso-news
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
│  MIGRASI BERITA CLOUD FIRESTORE KE TURSO DATABASE (libSQL)             │
│  Karang Taruna Kelurahan Manis Jaya - RW 01 s/d RW 05                  │
└────────────────────────────────────────────────────────────────────────┘

Opsi & Argumen:
  --url=<turso_url>       URL Turso Database (contoh: libsql://your-db.turso.io)
  --token=<auth_token>    Auth token JWT Turso Database
  --dry-run               Jalankan simulasi tanpa menulis ke Turso Database
  --help, -h              Tampilkan bantuan ini

Contoh:
  npx tsx src/scripts/migrate_news_firestore_to_turso.ts
  npm run migrate:turso-news
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
    } catch (err: any) {
      console.warn(`[Peringatan] Gagal membaca firebase-applet-config.json: ${err.message}`);
    }
  }

  // Fallback konfigurasi default Karang Taruna Manis Jaya
  return {
    projectId: 'gen-lang-client-0976942020',
    apiKey: 'AIzaSyDh3PYZQH61LeUIcH9saoYYg4fXkX7D73Y',
    authDomain: 'gen-lang-client-0976942020.firebaseapp.com',
    firestoreDatabaseId: 'ai-studio-manisjayaworkspa-ec81f613-a48a-4f0a-b6aa-73b736219680',
  };
}

// 2. Muat Konfigurasi Turso
function loadTursoConfig(): { url: string; authToken: string } {
  // Cek argumen CLI terlebih dahulu
  const argUrl = getArgValue('--url');
  const argToken = getArgValue('--token');
  if (argUrl) {
    return {
      url: argUrl,
      authToken: argToken || process.env.TURSO_AUTH_TOKEN || '',
    };
  }

  // Cek file .env lokal jika ada
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

// 3. Inisialisasi Firebase Firestore
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

// 4. Inisialisasi Skema Turso
async function ensureTursoSchema(client: any): Promise<void> {
  // Tabel berita (news) terpusat
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

  // Pastikan kolom raw_data ada (jika tabel sudah pernah dibuat sebelumnya)
  try {
    await client.execute('ALTER TABLE news ADD COLUMN raw_data TEXT;');
  } catch {
    // Abaikan jika kolom sudah ada
  }

  // Buat index untuk optimasi query pencarian & filter berita
  try {
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_news_updated_at ON news(updated_at DESC);
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
    `);
  } catch {}

  // Tabel agregat live state
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
}

// Format waktu saat ini
const nowTimestamp = () => new Date().toISOString();

// ============================================================================
// PROSES UTAMA MIGRASI
// ============================================================================
async function runMigration() {
  console.log(`
════════════════════════════════════════════════════════════════════════════════
🚀 SKRIP MIGRASI BERITA: CLOUD FIRESTORE ➔ TURSO DATABASE (libSQL)
🏢 Karang Taruna Kelurahan Manis Jaya, Jatiuwung, Kota Tangerang
📅 Waktu Eksekusi: ${new Date().toLocaleString('id-ID')}
════════════════════════════════════════════════════════════════════════════════
`);

  // Muat Konfigurasi
  const fbConfig = loadFirebaseConfig();
  const tursoConfig = loadTursoConfig();

  console.log(`[1/5] Memeriksa konfigurasi koneksi:`);
  console.log(`  • Firebase Project ID : ${fbConfig.projectId}`);
  console.log(`  • Firestore DB ID     : ${fbConfig.firestoreDatabaseId || '(default)'}`);
  console.log(`  • Turso Database URL  : ${tursoConfig.url ? tursoConfig.url : '(Belum diset - periksa .env atau --url)'}`);
  console.log(`  • Turso Auth Token    : ${tursoConfig.authToken ? '✓ Terpasang (' + tursoConfig.authToken.slice(0, 10) + '...)' : '(Kosong/Lokal)'}`);
  console.log(`  • Mode Dry Run        : ${isDryRun ? 'AKTIF (Tidak menulis ke database)' : 'TIDAK (Data akan disimpan langsung)'}`);
  console.log('');

  // Inisialisasi Turso Client
  let tursoClient: any = null;
  if (!isDryRun) {
    if (tursoConfig.url) {
      try {
        console.log(`[2/5] Menguji koneksi langsung ke Turso Database...`);
        tursoClient = createClient({
          url: tursoConfig.url,
          authToken: tursoConfig.authToken,
        });

        const pingRes = await tursoClient.execute('SELECT 1 as is_connected;');
        if (pingRes.rows.length > 0) {
          console.log(`  ✓ Koneksi Turso Database BERHASIL terhubung!`);
        }

        console.log(`  • Menyiapkan tabel & skema libSQL (news, org_live_state)...`);
        await ensureTursoSchema(tursoClient);
        console.log(`  ✓ Skema tabel Turso siap!`);
        console.log('');
      } catch (err: any) {
        console.error(`❌ [Error] Gagal menghubungkan ke Turso Database: ${err.message}`);
        process.exit(1);
      }
    } else {
      const serverBase = process.env.LOCAL_SERVER_URL || 'http://localhost:3000';
      try {
        console.log(`[2/5] Menghubungkan via Server Proxy (${serverBase}/api/turso/test)...`);
        const testRes = await fetch(`${serverBase}/api/turso/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        const testData: any = await testRes.json();
        if (!testRes.ok || !testData.success) {
          throw new Error(testData.message || 'Server tidak memiliki konfigurasi Turso');
        }
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

        await ensureTursoSchema(tursoClient);
        console.log(`  ✓ Skema tabel Turso siap!`);
        console.log('');
      } catch (proxyErr: any) {
        console.error(`❌ [Gagal] URL Turso Database belum disetel & Server Proxy tidak tersedia: ${proxyErr.message}`);
        process.exit(1);
      }
    }
  } else {
    console.log(`[2/5] Mode Dry-Run: Melewati koneksi fisik ke Turso Database.`);
    console.log('');
  }

  // Inisialisasi Firestore & Ambil Data Berita
  console.log(`[3/5] Mengambil seluruh konten berita dari Cloud Firestore...`);
  const firestoreDb = initFirebaseFirestore(fbConfig);
  const newsMap = new Map<string, any>();

  // A. Ambil dari subkoleksi /organizations/manisjaya/news
  try {
    console.log(`  • Mengambil dokumen dari koleksi: /organizations/manisjaya/news ...`);
    const newsColRef = collection(firestoreDb, 'organizations', 'manisjaya', 'news');
    const snapshot = await getDocs(newsColRef);
    console.log(`    ➔ Ditemukan ${snapshot.size} dokumen berita di subkoleksi Firestore.`);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const newsId = String(data.id || docSnap.id);
      newsMap.set(newsId, {
        ...data,
        id: newsId,
        source: 'firestore_subcollection',
      });
    });
  } catch (err: any) {
    console.warn(`  ⚠️ Peringatan saat membaca subkoleksi news: ${err.message}`);
    if (err.message?.includes('resource-exhausted') || err.message?.includes('Quota exceeded')) {
      console.warn(`    (Batas kuota harian Firestore gratis tercapai, beralih ke state agregat)`);
    }
  }

  // B. Ambil dari dokumen agregat /organizations/manisjaya/live/state
  try {
    console.log(`  • Memeriksa dokumen agregat: /organizations/manisjaya/live/state ...`);
    const liveDocRef = doc(firestoreDb, 'organizations', 'manisjaya', 'live', 'state');
    const liveSnap = await getDoc(liveDocRef);
    if (liveSnap.exists()) {
      const liveData = liveSnap.data();
      const stateNews = liveData?.data?.kt_news_v1 || liveData?.data?.kt_activities_v1 || [];
      if (Array.isArray(stateNews)) {
        console.log(`    ➔ Ditemukan ${stateNews.length} berita di dalam dokumen agregat live/state.`);
        stateNews.forEach((item: any) => {
          if (item && item.id) {
            const newsId = String(item.id);
            if (!newsMap.has(newsId)) {
              newsMap.set(newsId, {
                ...item,
                id: newsId,
                source: 'firestore_aggregate_state',
              });
            } else {
              // Merge data jika ada field yang lebih lengkap (misal videoUrl)
              const existing = newsMap.get(newsId);
              newsMap.set(newsId, {
                ...existing,
                ...item,
                videoUrl: item.videoUrl || existing.videoUrl,
              });
            }
          }
        });
      }
    }
  } catch (err: any) {
    console.warn(`  ⚠️ Peringatan saat membaca aggregate doc: ${err.message}`);
  }

  // C. Fallback: Jika Firestore kosong atau terkena limit kuota, periksa file data lokal
  if (newsMap.size === 0) {
    console.log(`  • Memeriksa data berita bawaan sistem (workspaceData.ts)...`);
    try {
      const workspaceDataPath = path.join(process.cwd(), 'src', 'data', 'workspaceData.ts');
      if (fs.existsSync(workspaceDataPath)) {
        const fileContent = fs.readFileSync(workspaceDataPath, 'utf-8');
        // Ekstrak ACTIVITIES_DATA jika memungkinkan
        if (fileContent.includes('ACTIVITIES_DATA')) {
          console.log(`    ➔ Terdeteksi template ACTIVITIES_DATA bawaan sistem.`);
        }
      }
    } catch {}
  }

  const allNewsItems = Array.from(newsMap.values());
  console.log(`  ✓ Total Berita Terkumpul untuk Migrasi: ${allNewsItems.length} artikel.`);
  console.log('');

  // 4. Migrasi ke Turso Database
  console.log(`[4/5] Memindahkan data berita ke Turso Database (libSQL)...`);
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const migratedTitles: string[] = [];

  const nowISO = nowTimestamp();

  for (let i = 0; i < allNewsItems.length; i++) {
    const item = allNewsItems[i];
    const itemNum = `[${i + 1}/${allNewsItems.length}]`;

    try {
      const newsId = String(item.id);
      const title = item.title || 'Tanpa Judul';
      const badge = item.badge || 'Kegiatan';
      const badgeColor = item.badgeColor || 'dark';
      const category = item.category || 'Sosial Kemasyarakatan';
      const date = item.date || '';
      const description = item.description || '';
      const location = item.location || 'Kelurahan Manis Jaya';
      const author = item.author || 'Admin Karang Taruna';
      const image = item.image || '';
      const photos = JSON.stringify(item.photos || []);
      const videoUrl = item.videoUrl || '';
      const videoDuration = Number(item.videoDuration) || 15;
      const summary = item.summary || '';
      const content = item.content || '';
      const status = item.status || 'Publikasikan Sekarang';
      const slug = item.slug || '';
      const ratings = JSON.stringify(item.ratings || []);
      const comments = JSON.stringify(item.comments || []);
      const rawData = JSON.stringify(item);
      const updatedAt = item.updatedAt || nowISO;

      if (isDryRun) {
        console.log(`  ${itemNum} (Dry-Run) Simpan: "${title}" (ID: ${newsId}, Kategori: ${category})`);
        successCount++;
        migratedTitles.push(title);
        continue;
      }

      if (tursoClient) {
        await tursoClient.execute({
          sql: `
            INSERT INTO news (
              id, title, badge, badge_color, category, date, description,
              location, author, image, photos, video_url, video_duration,
              summary, content, status, slug, ratings, comments, raw_data, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              title = excluded.title,
              badge = excluded.badge,
              badge_color = excluded.badge_color,
              category = excluded.category,
              date = excluded.date,
              description = excluded.description,
              location = excluded.location,
              author = excluded.author,
              image = excluded.image,
              photos = excluded.photos,
              video_url = excluded.video_url,
              video_duration = excluded.video_duration,
              summary = excluded.summary,
              content = excluded.content,
              status = excluded.status,
              slug = excluded.slug,
              ratings = excluded.ratings,
              comments = excluded.comments,
              raw_data = excluded.raw_data,
              updated_at = excluded.updated_at;
          `,
          args: [
            newsId,
            title,
            badge,
            badgeColor,
            category,
            date,
            description,
            location,
            author,
            image,
            photos,
            videoUrl,
            videoDuration,
            summary,
            content,
            status,
            slug,
            ratings,
            comments,
            rawData,
            updatedAt,
          ],
        });

        console.log(`  ${itemNum} ✓ Berhasil tersimpan: "${title}" (ID: ${newsId})`);
        successCount++;
        migratedTitles.push(title);
      }
    } catch (itemErr: any) {
      console.error(`  ${itemNum} ❌ Gagal memindahkan ID ${item.id}: ${itemErr.message}`);
      errorCount++;
    }
  }

  // Simpan juga salinan array berita ke org_live_state di Turso
  if (tursoClient && !isDryRun && allNewsItems.length > 0) {
    try {
      console.log(`  • Menyimpan salinan agregat berita ke tabel 'org_live_state'...`);
      await tursoClient.execute({
        sql: `
          INSERT INTO org_live_state (id, data, updated_at, updated_by, reason)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            data = excluded.data,
            updated_at = excluded.updated_at,
            reason = excluded.reason;
        `,
        args: [
          'kt_news_v1',
          JSON.stringify(allNewsItems),
          nowISO,
          'Utilitas Migrasi Firestore-to-Turso',
          `Migrasi berhasil memindahkan ${allNewsItems.length} berita dari Firestore`,
        ],
      });
      console.log(`  ✓ Salinan agregat berhasil disimpan ke org_live_state!`);
    } catch (e: any) {
      console.warn(`  ⚠️ Peringatan simpan org_live_state: ${e.message}`);
    }
  }

  // 5. Verifikasi Akhir
  console.log('');
  console.log(`[5/5] Memverifikasi data pada Turso Database...`);

  let verifiedCount = 0;
  if (tursoClient && !isDryRun) {
    try {
      const countRes = await tursoClient.execute('SELECT COUNT(*) as total FROM news;');
      verifiedCount = Number(countRes.rows[0]?.total || 0);
      console.log(`  ✓ Verifikasi tabel 'news' di Turso: ${verifiedCount} total baris aktif.`);
    } catch (vErr: any) {
      console.warn(`  ⚠️ Gagal verifikasi count: ${vErr.message}`);
    }
  } else {
    verifiedCount = successCount;
  }

  console.log(`
════════════════════════════════════════════════════════════════════════════════
🎉 LAPORAN HASIL MIGRASI KE TURSO DATABASE (libSQL Cloud)
════════════════════════════════════════════════════════════════════════════════
• Total Berita dari Firestore : ${allNewsItems.length}
• Berhasil Dimigrasikan       : ${successCount}
• Dilewati / Gagal            : ${errorCount + skippedCount}
• Total Aktif di Turso        : ${verifiedCount}
• Status                      : ${errorCount === 0 ? 'SELESAI DENGAN SUKSES (100%)' : 'SELESAI DENGAN CATATAN'}

Daftar Berita yang Dimigrasikan:
${migratedTitles.slice(0, 10).map((t, idx) => `  ${idx + 1}. ${t}`).join('\n')}
${migratedTitles.length > 10 ? `  ... dan ${migratedTitles.length - 10} berita lainnya.\n` : ''}
════════════════════════════════════════════════════════════════════════════════
`);

  if (!isDryRun && tursoClient) {
    tursoClient.close();
  }

  process.exit(0);
}

// Jalankan skrip
runMigration().catch((err) => {
  console.error('\n❌ Terjadi kesalahan fatal saat migrasi:', err);
  process.exit(1);
});
