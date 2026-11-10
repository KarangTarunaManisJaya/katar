/**
 * Turso Database Client & Service
 * Menggunakan @libsql/client untuk menghubungkan seluruh database aplikasi Karang Taruna Manis Jaya ke Turso Database.
 * Menyediakan tabel:
 * - org_live_state: Menyimpan status agregat seluruh sistem
 * - news: Berita & warta kegiatan
 * - members: Data anggota & akun pengurus
 * - assets: Inventaris barang & sarana
 * - agenda: Kalender kegiatan
 * - letters: Arsip surat menyurat
 * - kas: Buku kas & transaksi keuangan
 * - votings: Polling & musyawarah pemuda
 */

import { createClient, Client } from '@libsql/client';

export interface TursoConfig {
  url: string;
  authToken: string;
}

const TURSO_CONFIG_KEY = 'kt_turso_config_v1';

export const getStoredTursoConfig = (): TursoConfig => {
  try {
    const raw = localStorage.getItem(TURSO_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url) {
        return parsed;
      }
    }
  } catch {}

  // Nilai default atau dari environment
  return {
    url: (typeof process !== 'undefined' && process.env?.TURSO_DATABASE_URL) || '',
    authToken: (typeof process !== 'undefined' && process.env?.TURSO_AUTH_TOKEN) || '',
  };
};

export const saveTursoConfig = (config: TursoConfig): void => {
  try {
    localStorage.setItem(TURSO_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save Turso config:', err);
  }
};

export interface TursoExecutor {
  execute: (stmt: string | { sql: string; args?: any[] }) => Promise<{ rows: any[]; rowsAffected?: number }>;
  executeBatch?: (stmts: Array<string | { sql: string; args?: any[] }>) => Promise<void>;
  isProxy?: boolean;
}

let schemaInitializedOnce = false;

/**
 * Buat client libSQL langsung (jika dikonfigurasi manual di browser/CLI)
 * atau otomatis lewat Server Proxy (/api/turso/execute) menggunakan Secrets server.
 */
export const getTursoClient = (customConfig?: Partial<TursoConfig>): TursoExecutor | null => {
  const stored = getStoredTursoConfig();
  const cfg = {
    url: customConfig?.url !== undefined ? customConfig.url : stored.url,
    authToken: customConfig?.authToken !== undefined ? customConfig.authToken : stored.authToken,
  };

  if (cfg.url) {
    try {
      const rawClient = createClient({
        url: cfg.url,
        authToken: cfg.authToken,
      });
      return {
        execute: (stmt) => rawClient.execute(stmt as any) as any,
        executeBatch: async (stmts) => {
          for (const s of stmts) {
            await rawClient.execute(s as any);
          }
        },
        isProxy: false,
      };
    } catch (err) {
      console.warn('Turso client creation failed:', err);
      return null;
    }
  }

  // Gunakan jalur server proxy (/api/turso/execute) di browser
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    return {
      isProxy: true,
      execute: async (stmt: string | { sql: string; args?: any[] }) => {
        const payload = typeof stmt === 'string' ? { sql: stmt, args: [] } : { sql: stmt.sql, args: stmt.args || [] };
        const res = await fetch('/api/turso/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Gagal mengeksekusi query Turso lewat server');
        }
        return {
          rows: Array.isArray(data.rows) ? data.rows : [],
          rowsAffected: data.rowsAffected,
        };
      },
      executeBatch: async (stmts: Array<string | { sql: string; args?: any[] }>) => {
        if (stmts.length === 0) return;
        const normalized = stmts.map((s) => (typeof s === 'string' ? { sql: s, args: [] } : { sql: s.sql, args: s.args || [] }));
        const res = await fetch('/api/turso/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statements: normalized }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Gagal mengeksekusi batch query Turso lewat server');
        }
      },
    };
  }

  return null;
};

/**
 * Inisialisasi skema tabel di Turso jika belum ada
 */
export const initTursoSchema = async (client?: TursoExecutor | Client, force = false): Promise<boolean> => {
  if (schemaInitializedOnce && !force) return true;
  const c = client || getTursoClient();
  if (!c) return false;

  try {
    await c.execute(`
      CREATE TABLE IF NOT EXISTS org_live_state (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        updated_by TEXT,
        reason TEXT,
        device_id TEXT
      );
    `);

    await c.execute(`
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

    await c.execute(`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        username TEXT,
        name TEXT NOT NULL,
        role TEXT,
        rw TEXT,
        phone TEXT,
        email TEXT,
        data TEXT,
        raw_data TEXT,
        updated_at TEXT NOT NULL
      );
    `);

    await c.execute(`
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        category TEXT,
        condition TEXT,
        quantity INTEGER,
        location TEXT,
        data TEXT,
        raw_data TEXT,
        updated_at TEXT NOT NULL
      );
    `);

    await c.execute(`
      CREATE TABLE IF NOT EXISTS agenda (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT,
        time TEXT,
        location TEXT,
        status TEXT,
        data TEXT,
        raw_data TEXT,
        updated_at TEXT NOT NULL
      );
    `);

    await c.execute(`
      CREATE TABLE IF NOT EXISTS letters (
        id TEXT PRIMARY KEY,
        number TEXT,
        type TEXT,
        title TEXT,
        date TEXT,
        status TEXT,
        data TEXT,
        raw_data TEXT,
        updated_at TEXT NOT NULL
      );
    `);

    await c.execute(`
      CREATE TABLE IF NOT EXISTS kas (
        id TEXT PRIMARY KEY,
        type TEXT,
        amount REAL,
        description TEXT,
        date TEXT,
        category TEXT,
        data TEXT,
        raw_data TEXT,
        updated_at TEXT NOT NULL
      );
    `);

    await c.execute(`
      CREATE TABLE IF NOT EXISTS votings (
        id TEXT PRIMARY KEY,
        title TEXT,
        status TEXT,
        data TEXT,
        raw_data TEXT,
        updated_at TEXT NOT NULL
      );
    `);

    await c.execute(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        email TEXT PRIMARY KEY,
        name TEXT,
        username TEXT,
        code TEXT,
        status TEXT,
        verified INTEGER DEFAULT 0,
        opened INTEGER DEFAULT 0,
        channel TEXT,
        updated_at TEXT NOT NULL
      );
    `);

    // Pastikan kolom raw_data & indeks tersedia pada tabel lama yang sudah ada
    const alterStatements = [
      'ALTER TABLE news ADD COLUMN raw_data TEXT;',
      'ALTER TABLE members ADD COLUMN raw_data TEXT;',
      'ALTER TABLE assets ADD COLUMN raw_data TEXT;',
      'ALTER TABLE agenda ADD COLUMN raw_data TEXT;',
      'ALTER TABLE letters ADD COLUMN raw_data TEXT;',
      'ALTER TABLE kas ADD COLUMN raw_data TEXT;',
      'ALTER TABLE votings ADD COLUMN raw_data TEXT;',
      'CREATE INDEX IF NOT EXISTS idx_news_updated_at ON news(updated_at DESC);',
      'CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);',
    ];
    for (const stmt of alterStatements) {
      try {
        await c.execute(stmt);
      } catch {}
    }

    schemaInitializedOnce = true;
    return true;
  } catch (err) {
    console.warn('initTursoSchema notice:', err);
    return false;
  }
};

/**
 * Uji koneksi ke database Turso (otomatis mendeteksi konfigurasi Server Secrets maupun input kustom)
 */
export const testTursoConnection = async (
  config?: TursoConfig
): Promise<{ success: boolean; message: string; tableCount?: number; url?: string; tables?: string[] }> => {
  const hasCustom = Boolean(config?.url?.trim());

  // Jika di browser, uji melalui /api/turso/test agar bisa memakai TURSO_DATABASE_URL dari server
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    try {
      const payload = hasCustom
        ? { url: config?.url?.trim(), authToken: config?.authToken?.trim() || '' }
        : {};
      const res = await fetch('/api/turso/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const c = getTursoClient(hasCustom ? config : undefined);
        if (c && (!data.tableCount || data.tableCount === 0)) {
          await initTursoSchema(c);
          const tablesRes = await c.execute(`
            SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
          `);
          const updatedTables = tablesRes.rows.map((r: any) => String(r.name));
          return {
            success: true,
            url: data.url,
            tableCount: updatedTables.length,
            tables: updatedTables,
            message: `Berhasil terhubung ke Turso Database (${data.url || 'Server Cloud'})! (${updatedTables.length} tabel aktif)`,
          };
        }
        return {
          success: true,
          url: data.url,
          tableCount: data.tableCount,
          tables: data.tables,
          message: data.message || `Berhasil terhubung ke Turso Database! (${data.tableCount ?? 0} tabel aktif)`,
        };
      }
      return {
        success: false,
        message: data.message || 'Konfigurasi URL database Turso belum diisi.',
      };
    } catch (err: any) {
      // Fallback ke client langsung jika endpoint tidak tersedia
      console.warn('Proxy /api/turso/test fallback:', err?.message);
    }
  }

  const c = getTursoClient(config);
  if (!c) {
    return {
      success: false,
      message: 'Konfigurasi URL database Turso belum diisi.',
    };
  }

  try {
    const res = await c.execute('SELECT 1 as connected;');
    if (res.rows.length > 0) {
      await initTursoSchema(c);
      const tablesRes = await c.execute(`
        SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
      `);
      const tables = tablesRes.rows.map((r: any) => String(r.name));

      return {
        success: true,
        tableCount: tables.length,
        tables,
        message: `Berhasil terhubung ke Turso Database! (${tables.length} tabel aktif)`,
      };
    }
    return {
      success: false,
      message: 'Tidak menerima respon dari database Turso.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal terhubung ke Turso: ${err.message || err}`,
    };
  }
};

/**
 * Pindahkan seluruh data lokal ke Turso Database
 */
export const syncAllLocalDataToTurso = async (
  onProgress?: (msg: string, pct: number) => void
): Promise<{ success: boolean; message: string }> => {
  const client = getTursoClient();
  if (!client) {
    return {
      success: false,
      message: 'Koneksi Turso belum dikonfigurasi.',
    };
  }

  try {
    if (onProgress) onProgress('Menyiapkan skema tabel Turso...', 10);
    await initTursoSchema(client);

    // 1. Simpan State Agregat Utama (mengecualikan token/konfigurasi sensitif perangkat)
    if (onProgress) onProgress('Menyinkronkan status agregat sistem...', 30);
    const allLocalData = collectLocalTursoState();

    const nowISO = new Date().toISOString();
    await client.execute({
      sql: `INSERT INTO org_live_state (id, data, updated_at, updated_by, reason, device_id) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
              data = excluded.data, 
              updated_at = excluded.updated_at, 
              reason = excluded.reason,
              device_id = excluded.device_id;`,
      args: ['manisjaya_live', JSON.stringify(allLocalData), nowISO, 'Administrator', 'Migrasi Penuh ke Turso', TURSO_DEVICE_ID],
    });

    // 2. Simpan Berita
    if (onProgress) onProgress('Menyinkronkan data berita & dokumentasi...', 50);
    const rawNews = localStorage.getItem('kt_news_v1');
    if (rawNews) {
      try {
        const newsList = JSON.parse(rawNews);
        if (Array.isArray(newsList)) {
          for (const item of newsList) {
            await client.execute({
              sql: `INSERT INTO news (id, title, badge, badge_color, category, date, description, location, author, image, photos, video_url, video_duration, summary, content, status, slug, ratings, comments, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                      updated_at = excluded.updated_at;`,
              args: [
                String(item.id),
                item.title || '',
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
                nowISO,
              ],
            });
          }
        }
      } catch (e) {
        console.warn('News migration to Turso notice:', e);
      }
    }

    // 3. Simpan Anggota
    if (onProgress) onProgress('Menyinkronkan data anggota & pengurus...', 70);
    const rawMembers = localStorage.getItem('kt_members_v3') || localStorage.getItem('kt_users_list_v3');
    if (rawMembers) {
      try {
        const membersList = JSON.parse(rawMembers);
        if (Array.isArray(membersList)) {
          for (const m of membersList) {
            await client.execute({
              sql: `INSERT INTO members (id, username, name, role, rw, phone, email, data, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                      username = excluded.username,
                      name = excluded.name,
                      role = excluded.role,
                      rw = excluded.rw,
                      phone = excluded.phone,
                      email = excluded.email,
                      data = excluded.data,
                      updated_at = excluded.updated_at;`,
              args: [
                String(m.id || m.username),
                m.username || '',
                m.name || '',
                m.role || m.jabatan || '',
                m.rw || '',
                m.phone || m.telepon || '',
                m.email || '',
                JSON.stringify(m),
                nowISO,
              ],
            });
          }
        }
      } catch (e) {
        console.warn('Members migration notice:', e);
      }
    }

    // 4. Simpan Aset
    if (onProgress) onProgress('Menyinkronkan inventaris aset organisasi...', 75);
    let rawAssets = localStorage.getItem('kt_assets_v1');
    let assetsList: any[] = [];
    if (rawAssets) {
      try {
        assetsList = JSON.parse(rawAssets);
      } catch {}
    }
    if (!assetsList || assetsList.length === 0) {
      try {
        const { db } = await import('./firestoreSyncService');
        const { collection, getDocs } = await import('firebase/firestore');
        const snap = await getDocs(collection(db, 'organizations', 'manisjaya', 'assets'));
        snap.forEach((d) => assetsList.push({ id: d.id, ...d.data() }));
      } catch {}
    }
    if (Array.isArray(assetsList) && assetsList.length > 0) {
      for (const a of assetsList) {
        if (a?.id) {
          await client.execute({
            sql: `INSERT INTO assets (id, name, code, category, condition, quantity, location, raw_data, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    code = excluded.code,
                    category = excluded.category,
                    condition = excluded.condition,
                    quantity = excluded.quantity,
                    location = excluded.location,
                    raw_data = excluded.raw_data,
                    updated_at = excluded.updated_at;`,
            args: [
              String(a.id),
              a.namaAsset || a.name || 'Aset Organisasi',
              a.kodeAsset || a.code || '',
              a.kategori || a.category || 'Peralatan',
              a.kondisi || a.condition || 'Baik',
              Number(a.quantity || a.jumlah || 1),
              a.lokasi || a.location || 'Sekretariat',
              JSON.stringify(a),
              nowISO,
            ],
          });
        }
      }
    }

    // 5. Simpan Agenda
    if (onProgress) onProgress('Menyinkronkan kalender & agenda kegiatan...', 82);
    let rawAgenda = localStorage.getItem('kt_agenda_v1') || localStorage.getItem('kt_agendas_v1');
    let agendaList: any[] = [];
    if (rawAgenda) {
      try {
        agendaList = JSON.parse(rawAgenda);
      } catch {}
    }
    if (!agendaList || agendaList.length === 0) {
      try {
        const { db } = await import('./firestoreSyncService');
        const { collection, getDocs } = await import('firebase/firestore');
        const snap = await getDocs(collection(db, 'organizations', 'manisjaya', 'agenda'));
        snap.forEach((d) => agendaList.push({ id: d.id, ...d.data() }));
      } catch {}
    }
    if (Array.isArray(agendaList) && agendaList.length > 0) {
      for (const ag of agendaList) {
        if (ag?.id) {
          await client.execute({
            sql: `INSERT INTO agenda (id, title, date, time, location, status, raw_data, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title,
                    date = excluded.date,
                    time = excluded.time,
                    location = excluded.location,
                    status = excluded.status,
                    raw_data = excluded.raw_data,
                    updated_at = excluded.updated_at;`,
            args: [
              String(ag.id),
              ag.title || ag.judul || 'Agenda Kegiatan',
              ag.date || ag.tanggal || '',
              ag.time || ag.waktu || '',
              ag.location || ag.lokasi || 'Kelurahan Manis Jaya',
              ag.status || 'Terjadwal',
              JSON.stringify(ag),
              nowISO,
            ],
          });
        }
      }
    }

    // 6. Simpan Surat Menyurat
    if (onProgress) onProgress('Menyinkronkan arsip surat masuk & keluar...', 88);
    let rawLetters = localStorage.getItem('kt_surat_items_v2');
    let lettersList: any[] = [];
    if (rawLetters) {
      try {
        lettersList = JSON.parse(rawLetters);
      } catch {}
    }
    if (!lettersList || lettersList.length === 0) {
      try {
        const { db } = await import('./firestoreSyncService');
        const { collection, getDocs } = await import('firebase/firestore');
        const snap = await getDocs(collection(db, 'organizations', 'manisjaya', 'letters'));
        snap.forEach((d) => lettersList.push({ id: d.id, ...d.data() }));
      } catch {}
    }
    if (Array.isArray(lettersList) && lettersList.length > 0) {
      for (const l of lettersList) {
        if (l?.id) {
          await client.execute({
            sql: `INSERT INTO letters (id, number, type, title, date, status, raw_data, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    number = excluded.number,
                    type = excluded.type,
                    title = excluded.title,
                    date = excluded.date,
                    status = excluded.status,
                    raw_data = excluded.raw_data,
                    updated_at = excluded.updated_at;`,
            args: [
              String(l.id),
              l.letterNumber || l.number || l.nomorSurat || '',
              l.type || l.jenisSurat || 'Surat Keluar',
              l.subject || l.title || l.perihal || 'Surat Karang Taruna',
              l.date || l.tanggalSurat || '',
              l.status || 'Terkirim',
              JSON.stringify(l),
              nowISO,
            ],
          });
        }
      }
    }

    // 7. Simpan Kas Keuangan
    if (onProgress) onProgress('Menyinkronkan buku kas & keuangan...', 93);
    const rawKas = localStorage.getItem('kt_kas_entries_v2');
    let kasList: any[] = [];
    if (rawKas) {
      try {
        kasList = JSON.parse(rawKas);
      } catch {}
    }
    if (!kasList || kasList.length === 0) {
      try {
        const { db } = await import('./firestoreSyncService');
        const { collection, getDocs } = await import('firebase/firestore');
        const snap = await getDocs(collection(db, 'organizations', 'manisjaya', 'kas'));
        snap.forEach((d) => kasList.push({ id: d.id, ...d.data() }));
      } catch {}
    }
    if (Array.isArray(kasList) && kasList.length > 0) {
      for (const k of kasList) {
        if (k?.id) {
          await client.execute({
            sql: `INSERT INTO kas (id, type, amount, description, date, category, raw_data, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    type = excluded.type,
                    amount = excluded.amount,
                    description = excluded.description,
                    date = excluded.date,
                    category = excluded.category,
                    raw_data = excluded.raw_data,
                    updated_at = excluded.updated_at;`,
            args: [
              String(k.id),
              k.type || 'Pemasukan',
              Number(k.amount || k.nominal || 0),
              k.description || k.keterangan || '',
              k.date || k.tanggal || '',
              k.category || k.kategori || 'Kas',
              JSON.stringify(k),
              nowISO,
            ],
          });
        }
      }
    }

    // 8. Simpan Votings / Polling
    if (onProgress) onProgress('Menyinkronkan musyawarah & polling pemuda...', 97);
    const rawVotings = localStorage.getItem('kt_votings_v1');
    let votingsList: any[] = [];
    if (rawVotings) {
      try {
        votingsList = JSON.parse(rawVotings);
      } catch {}
    }
    if (!votingsList || votingsList.length === 0) {
      try {
        const { db } = await import('./firestoreSyncService');
        const { collection, getDocs } = await import('firebase/firestore');
        const snap = await getDocs(collection(db, 'organizations', 'manisjaya', 'votings'));
        snap.forEach((d) => votingsList.push({ id: d.id, ...d.data() }));
      } catch {}
    }
    if (Array.isArray(votingsList) && votingsList.length > 0) {
      for (const v of votingsList) {
        if (v?.id) {
          await client.execute({
            sql: `INSERT INTO votings (id, title, status, raw_data, updated_at)
                  VALUES (?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title,
                    status = excluded.status,
                    raw_data = excluded.raw_data,
                    updated_at = excluded.updated_at;`,
            args: [
              String(v.id),
              v.title || v.judul || 'Musyawarah Pemuda',
              v.status || 'Aktif',
              JSON.stringify(v),
              nowISO,
            ],
          });
        }
      }
    }

    if (onProgress) onProgress('Migrasi seluruh database ke Turso selesai 100%!', 100);

    return {
      success: true,
      message: 'Seluruh database (Berita, Anggota, Aset, Kas, Agenda, Surat, Votings) berhasil dipindahkan ke Turso Database!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal migrasi ke Turso: ${err.message || err}`,
    };
  }
};

/**
 * Mengambil berita terkini dari Turso Database
 */
export const fetchNewsFromTurso = async (): Promise<any[]> => {
  const client = getTursoClient();
  if (!client) return [];

  try {
    const res = await client.execute('SELECT * FROM news ORDER BY updated_at DESC;');
    return res.rows.map((row: any) => {
      let rawObj: any = {};
      if (row.raw_data) {
        try {
          rawObj = JSON.parse(row.raw_data as string);
        } catch {}
      }

      return {
        ...rawObj,
        id: row.id,
        title: row.title,
        badge: row.badge,
        badgeColor: row.badge_color,
        category: row.category,
        date: row.date,
        description: row.description,
        location: row.location,
        author: row.author,
        image: row.image,
        photos: row.photos ? JSON.parse(row.photos as string) : (rawObj.photos || []),
        videoUrl: row.video_url || rawObj.videoUrl,
        videoDuration: row.video_duration || rawObj.videoDuration,
        summary: row.summary || rawObj.summary,
        content: row.content || rawObj.content,
        status: row.status || rawObj.status,
        slug: row.slug || rawObj.slug,
        ratings: row.ratings ? JSON.parse(row.ratings as string) : (rawObj.ratings || []),
        comments: row.comments ? JSON.parse(row.comments as string) : (rawObj.comments || []),
        updatedAt: row.updated_at,
      };
    });
  } catch (err) {
    console.warn('fetchNewsFromTurso notice:', err);
    return [];
  }
};

/**
 * Menyimpan / memperbarui satu item berita ke Turso
 */
export const saveNewsToTurso = async (item: any): Promise<boolean> => {
  const client = getTursoClient();
  if (!client) return false;

  try {
    const nowISO = new Date().toISOString();
    await client.execute({
      sql: `INSERT INTO news (
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
              updated_at = excluded.updated_at;`,
      args: [
        String(item.id),
        item.title || '',
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
    return true;
  } catch (err) {
    console.warn('saveNewsToTurso notice:', err);
    return false;
  }
};

/**
 * Menghapus berita dari Turso
 */
export const deleteNewsFromTurso = async (id: string): Promise<boolean> => {
  const client = getTursoClient();
  if (!client) return false;

  try {
    await client.execute({
      sql: 'DELETE FROM news WHERE id = ?;',
      args: [id],
    });
    return true;
  } catch (err) {
    console.warn('deleteNewsFromTurso notice:', err);
    return false;
  }
};

/**
 * Migrasikan seluruh berita & dokumentasi kegiatan langsung dari Firestore ke Turso
 * Dapat dipanggil langsung dari UI browser maupun modul latar belakang
 */
export const migrateFirestoreNewsToTurso = async (
  onProgress?: (msg: string, pct: number) => void
): Promise<{ success: boolean; message: string; count: number; items?: any[] }> => {
  const client = getTursoClient();
  if (!client) {
    return {
      success: false,
      message: 'Koneksi Turso Database belum dikonfigurasi. Silakan periksa URL & Token.',
      count: 0,
    };
  }

  try {
    if (onProgress) onProgress('Menyiapkan tabel & indeks Turso Database...', 10);
    await initTursoSchema(client);

    if (onProgress) onProgress('Membaca konten berita dari Cloud Firestore & Cache...', 30);
    const newsMap = new Map<string, any>();

    // 1. Ambil dari Firestore
    try {
      const { db } = await import('./firestoreSyncService');
      const { collection, getDocs, doc, getDoc } = await import('firebase/firestore');

      // Dari subkoleksi news
      try {
        const snap = await getDocs(collection(db, 'organizations', 'manisjaya', 'news'));
        snap.forEach((d) => {
          const item = d.data();
          const id = String(item.id || d.id);
          newsMap.set(id, { ...item, id });
        });
      } catch (subErr: any) {
        console.warn('Subcollection read notice during migration:', subErr);
      }

      // Dari dokumen agregat live/state
      try {
        const liveSnap = await getDoc(doc(db, 'organizations', 'manisjaya', 'live', 'state'));
        if (liveSnap.exists()) {
          const liveData = liveSnap.data()?.data;
          const liveNews = liveData?.kt_news_v1 || liveData?.kt_activities_v1 || [];
          if (Array.isArray(liveNews)) {
            liveNews.forEach((item: any) => {
              if (item?.id) {
                const id = String(item.id);
                if (!newsMap.has(id)) {
                  newsMap.set(id, item);
                } else {
                  const existing = newsMap.get(id);
                  newsMap.set(id, { ...existing, ...item, videoUrl: item.videoUrl || existing.videoUrl });
                }
              }
            });
          }
        }
      } catch (aggErr: any) {
        console.warn('Aggregate doc read notice during migration:', aggErr);
      }
    } catch (fireErr) {
      console.warn('Firestore import warning:', fireErr);
    }

    // 2. Gabungkan dengan data lokal jika ada
    try {
      const rawLocal = localStorage.getItem('kt_news_v1');
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            if (item?.id) {
              const id = String(item.id);
              if (!newsMap.has(id)) {
                newsMap.set(id, item);
              } else {
                const existing = newsMap.get(id);
                newsMap.set(id, { ...existing, ...item, videoUrl: item.videoUrl || existing.videoUrl });
              }
            }
          });
        }
      }
    } catch {}

    const newsList = Array.from(newsMap.values());
    if (newsList.length === 0) {
      return {
        success: false,
        message: 'Tidak ada data berita yang ditemukan di Firestore maupun penyimpanan lokal.',
        count: 0,
      };
    }

    if (onProgress) onProgress(`Memindahkan ${newsList.length} artikel berita ke Turso libSQL...`, 55);

    const nowISO = new Date().toISOString();
    let migratedCount = 0;

    for (let i = 0; i < newsList.length; i++) {
      const item = newsList[i];
      const pct = Math.round(55 + ((i + 1) / newsList.length) * 40);
      if (onProgress) onProgress(`Memindahkan [${i + 1}/${newsList.length}]: "${item.title || item.id}"...`, pct);

      await client.execute({
        sql: `INSERT INTO news (
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
          updated_at = excluded.updated_at;`,
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
      migratedCount++;
    }

    // Perbarui agregat di Turso org_live_state
    try {
      await client.execute({
        sql: `INSERT INTO org_live_state (id, data, updated_at, updated_by, reason)
              VALUES (?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                data = excluded.data,
                updated_at = excluded.updated_at,
                reason = excluded.reason;`,
        args: [
          'kt_news_v1',
          JSON.stringify(newsList),
          nowISO,
          'Migrasi Berita Firestore ke Turso',
          `Berhasil memindahkan ${migratedCount} berita ke Turso libSQL`,
        ],
      });
    } catch {}

    if (onProgress) onProgress('Migrasi berita ke Turso selesai 100%!', 100);

    return {
      success: true,
      message: `Berhasil memindahkan ${migratedCount} berita dari Firestore ke Turso Database!`,
      count: migratedCount,
      items: newsList,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal migrasi berita ke Turso: ${err.message || err}`,
      count: 0,
    };
  }
};

// =============================================================================
// TURSO PRIMARY DATABASE SYNC & REAL-TIME ENGINE (DATABASE UTAMA)
// =============================================================================

export interface TursoSyncStatus {
  state: 'connected' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: string | null;
  message?: string;
  sourceDevice?: string;
  isOnline: boolean;
  pendingOfflineCount: number;
}

export const TURSO_PRIMARY_SYNC_KEYS = [
  'kt_assets_v1',
  'kt_asset_peminjaman_v1',
  'kt_asset_mutasi_v1',
  'kt_asset_pengadaan_v1',
  'kt_asset_penghapusan_v1',
  'kt_asset_stock_opname_v1',
  'kt_asset_dokumen_v1',
  'kt_members_v3',
  'kt_agenda_v1',
  'kt_agendas_v1',
  'kt_proposals_v2',
  'kt_laporan_kegiatan_v1',
  'kt_surat_items_v2',
  'kt_surat_masuk_v1',
  'kt_surat_disposisi_v1',
  'kt_disposisi_items_v1',
  'kt_surat_numbering_cfg_v1',
  'kt_kas_entries_v2',
  'kt_users_list_v3',
  'kt_news_v1',
  'kt_activities_v1',
  'kt_votings_v1',
  'kt_categories_v1',
  'kt_org_name',
  'kt_org_address',
  'kt_org_kelurahan',
  'kt_org_kecamatan',
  'kt_org_kota',
  'kt_org_provinsi',
  'kt_email',
  'kt_telepon',
  'kt_website',
  'kt_theme_settings_v1',
  'kt_branding_v1',
] as const;

const TURSO_DEVICE_ID = `turso_dev_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
const TURSO_QUEUE_KEY = 'kt_turso_offline_queue_v1';

let isApplyingTursoRemote = false;
let isInitialTursoResolved = false;
let lastPushedTursoHash = '';
let lastObservedTursoUpdatedAt = '';
let tursoPrimarySyncActive = false;

export const isTursoPrimaryActive = (): boolean => tursoPrimarySyncActive;

export const getPendingTursoOfflineQueue = (): Array<{ id: string; reason: string; timestamp: number }> => {
  try {
    const raw = localStorage.getItem(TURSO_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const addToTursoOfflineQueue = (reason: string) => {
  try {
    const queue = getPendingTursoOfflineQueue();
    queue.push({
      id: `tq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reason,
      timestamp: Date.now(),
    });
    localStorage.setItem(TURSO_QUEUE_KEY, JSON.stringify(queue.slice(-50)));
  } catch {}
};

const clearTursoOfflineQueue = () => {
  try {
    localStorage.removeItem(TURSO_QUEUE_KEY);
  } catch {}
};

function hashTursoString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

const TURSO_LOCAL_ONLY_KEYS = new Set<string>([
  TURSO_CONFIG_KEY,
  TURSO_QUEUE_KEY,
  'kt_auth_user_v3',
  'kt_custom_firebase_config',
  'kt_firestore_offline_queue_v1',
  'kt_firestore_quota_exhausted_until',
  'kt_local_backup_records',
  'kt_active_pengaturan_tab',
  'kt_email_auto_verified',
  'kt_filebase_catalog_v1',
  'kt_filebase_config_v1',
]);

export const isTursoSyncedKey = (key: string | null | undefined): boolean => {
  if (!key) return false;
  if (TURSO_LOCAL_ONLY_KEYS.has(key)) return false;
  if ((TURSO_PRIMARY_SYNC_KEYS as readonly string[]).includes(key)) return true;
  return key.startsWith('kt_') || key.startsWith('theme_');
};

export const collectLocalTursoState = (): Record<string, any> => {
  const data: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (isTursoSyncedKey(key)) {
      const val = localStorage.getItem(key);
      if (val !== null) {
        try {
          data[key] = JSON.parse(val);
        } catch {
          data[key] = val;
        }
      }
    }
  }

  // Selaraskan key agenda (kt_agenda_v1 dan kt_agendas_v1) agar selalu konsisten di seluruh modul
  const agSingular = Array.isArray(data.kt_agenda_v1) ? data.kt_agenda_v1 : null;
  const agPlural = Array.isArray(data.kt_agendas_v1) ? data.kt_agendas_v1 : null;
  if (agPlural && (!agSingular || (agPlural.length > 0 && agSingular.length === 0))) {
    data.kt_agenda_v1 = agPlural;
  } else if (agSingular && (!agPlural || (agSingular.length > 0 && agPlural.length === 0))) {
    data.kt_agendas_v1 = agSingular;
  }

  return data;
};

// -----------------------------------------------------------------------------
// GRANULAR CRUD HELPERS UNTUK MODUL UTAMA (ASSETS & VOTINGS) DI TURSO
// -----------------------------------------------------------------------------

export const fetchAssetsFromTurso = async (): Promise<any[]> => {
  const client = getTursoClient();
  if (!client) return [];

  try {
    const res = await client.execute('SELECT * FROM assets ORDER BY updated_at DESC;');
    return res.rows.map((row: any) => {
      let rawObj: any = {};
      const jsonStr = row.raw_data || row.data;
      if (jsonStr) {
        try {
          rawObj = JSON.parse(jsonStr as string);
        } catch {}
      }
      return {
        ...rawObj,
        id: row.id,
        namaAsset: rawObj.namaAsset || row.name,
        kodeAsset: rawObj.kodeAsset || row.code,
        kategori: rawObj.kategori || row.category,
        kondisi: rawObj.kondisi || row.condition,
        jumlah: rawObj.jumlah ?? row.quantity ?? 1,
        lokasi: rawObj.lokasi || row.location,
        updatedAt: row.updated_at,
      };
    });
  } catch (err) {
    console.warn('fetchAssetsFromTurso notice:', err);
    return [];
  }
};

export const saveAssetToTurso = async (item: any): Promise<boolean> => {
  const client = getTursoClient();
  if (!client || !item?.id) return false;

  try {
    await initTursoSchema(client);
    const nowISO = new Date().toISOString();
    const serialized = JSON.stringify(item);
    await client.execute({
      sql: `INSERT INTO assets (id, name, code, category, condition, quantity, location, data, raw_data, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              code = excluded.code,
              category = excluded.category,
              condition = excluded.condition,
              quantity = excluded.quantity,
              location = excluded.location,
              data = excluded.data,
              raw_data = excluded.raw_data,
              updated_at = excluded.updated_at;`,
      args: [
        String(item.id),
        item.namaAsset || item.name || 'Aset Organisasi',
        item.kodeAsset || item.code || '',
        item.kategori || item.category || 'Peralatan',
        item.kondisi || item.condition || 'Baik',
        Number(item.jumlah || item.quantity || 1),
        item.lokasi || item.location || 'Sekretariat',
        serialized,
        serialized,
        nowISO,
      ],
    });
    return true;
  } catch (err) {
    console.warn('saveAssetToTurso notice:', err);
    return false;
  }
};

export const deleteAssetFromTurso = async (id: string): Promise<boolean> => {
  const client = getTursoClient();
  if (!client || !id) return false;

  try {
    await client.execute({
      sql: 'DELETE FROM assets WHERE id = ?;',
      args: [String(id)],
    });
    return true;
  } catch (err) {
    console.warn('deleteAssetFromTurso notice:', err);
    return false;
  }
};

export const fetchVotingsFromTurso = async (): Promise<any[]> => {
  const client = getTursoClient();
  if (!client) return [];

  try {
    const res = await client.execute('SELECT * FROM votings ORDER BY updated_at DESC;');
    return res.rows.map((row: any) => {
      let rawObj: any = {};
      const jsonStr = row.raw_data || row.data;
      if (jsonStr) {
        try {
          rawObj = JSON.parse(jsonStr as string);
        } catch {}
      }
      return {
        ...rawObj,
        id: row.id,
        title: rawObj.title || row.title,
        status: rawObj.status || row.status,
        updatedAt: row.updated_at,
      };
    });
  } catch (err) {
    console.warn('fetchVotingsFromTurso notice:', err);
    return [];
  }
};

export const saveVotingToTurso = async (item: any): Promise<boolean> => {
  const client = getTursoClient();
  if (!client || !item?.id) return false;

  try {
    await initTursoSchema(client);
    const nowISO = new Date().toISOString();
    const serialized = JSON.stringify(item);
    await client.execute({
      sql: `INSERT INTO votings (id, title, status, data, raw_data, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              title = excluded.title,
              status = excluded.status,
              data = excluded.data,
              raw_data = excluded.raw_data,
              updated_at = excluded.updated_at;`,
      args: [
        String(item.id),
        item.title || item.judul || 'Musyawarah Pemuda',
        item.status || 'active',
        serialized,
        serialized,
        nowISO,
      ],
    });
    return true;
  } catch (err) {
    console.warn('saveVotingToTurso notice:', err);
    return false;
  }
};

export const deleteVotingFromTurso = async (id: string): Promise<boolean> => {
  const client = getTursoClient();
  if (!client || !id) return false;

  try {
    await client.execute({
      sql: 'DELETE FROM votings WHERE id = ?;',
      args: [String(id)],
    });
    return true;
  } catch (err) {
    console.warn('deleteVotingFromTurso notice:', err);
    return false;
  }
};

export const fetchMembersFromTurso = async (): Promise<any[]> => {
  const client = getTursoClient();
  if (!client) return [];

  try {
    const res = await client.execute('SELECT * FROM members ORDER BY updated_at DESC;');
    return res.rows.map((row: any) => {
      let rawObj: any = {};
      const jsonStr = row.raw_data || row.data;
      if (jsonStr) {
        try {
          rawObj = JSON.parse(jsonStr as string);
        } catch {}
      }
      return {
        ...rawObj,
        id: row.id,
        username: rawObj.username || row.username || '',
        name: rawObj.name || row.name || '',
        jabatan: rawObj.jabatan || row.role || '',
        rw: rawObj.rw || row.rw || '',
        phone: rawObj.phone || row.phone || '',
        email: rawObj.email || row.email || '',
        updatedAt: row.updated_at,
      };
    });
  } catch (err) {
    console.warn('fetchMembersFromTurso notice:', err);
    return [];
  }
};

export const saveMemberToTurso = async (m: any): Promise<boolean> => {
  const client = getTursoClient();
  const id = m?.id || m?.username;
  if (!client || !id) return false;

  try {
    await initTursoSchema(client);
    const nowISO = new Date().toISOString();
    const raw = JSON.stringify(m);
    await client.execute({
      sql: `INSERT INTO members (id, username, name, role, rw, phone, email, data, raw_data, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              username = excluded.username, name = excluded.name, role = excluded.role,
              rw = excluded.rw, phone = excluded.phone, email = excluded.email,
              data = excluded.data, raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
      args: [
        String(id),
        m.username || '',
        m.name || '',
        m.role || m.jabatan || '',
        m.rw || '',
        m.phone || m.telepon || '',
        m.email || '',
        raw,
        raw,
        nowISO,
      ],
    });
    return true;
  } catch (err) {
    console.warn('saveMemberToTurso notice:', err);
    return false;
  }
};

export const deleteMemberFromTurso = async (id: string): Promise<boolean> => {
  const client = getTursoClient();
  if (!client || !id) return false;

  try {
    await client.execute({ sql: 'DELETE FROM members WHERE id = ?;', args: [String(id)] });
    return true;
  } catch (err) {
    console.warn('deleteMemberFromTurso notice:', err);
    return false;
  }
};

export const fetchAgendaFromTurso = async (): Promise<any[]> => {
  const client = getTursoClient();
  if (!client) return [];

  try {
    const res = await client.execute('SELECT * FROM agenda ORDER BY updated_at DESC;');
    return res.rows.map((row: any) => {
      let rawObj: any = {};
      const jsonStr = row.raw_data || row.data;
      if (jsonStr) {
        try {
          rawObj = JSON.parse(jsonStr as string);
        } catch {}
      }
      return {
        ...rawObj,
        id: row.id,
        namaKegiatan: rawObj.namaKegiatan || rawObj.title || row.title || 'Agenda Kegiatan',
        tanggalMulai: rawObj.tanggalMulai || rawObj.date || row.date || '',
        lokasi: rawObj.lokasi || rawObj.location || row.location || 'Kelurahan Manis Jaya',
        statusKegiatan: rawObj.statusKegiatan || rawObj.status || row.status || 'Terjadwal',
        updatedAt: row.updated_at,
      };
    });
  } catch (err) {
    console.warn('fetchAgendaFromTurso notice:', err);
    return [];
  }
};

export const saveAgendaToTurso = async (ag: any): Promise<boolean> => {
  const client = getTursoClient();
  if (!client || !ag?.id) return false;

  try {
    await initTursoSchema(client);
    const nowISO = new Date().toISOString();
    const raw = JSON.stringify(ag);
    await client.execute({
      sql: `INSERT INTO agenda (id, title, date, time, location, status, data, raw_data, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              title = excluded.title, date = excluded.date, time = excluded.time,
              location = excluded.location, status = excluded.status,
              data = excluded.data, raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
      args: [
        String(ag.id),
        ag.namaKegiatan || ag.title || ag.judul || 'Agenda Kegiatan',
        ag.tanggalMulai || ag.date || ag.tanggal || '',
        ag.jamMulai ? `${ag.jamMulai} - ${ag.jamSelesai || ''}` : (ag.time || ag.waktu || ''),
        ag.lokasi || ag.location || 'Kelurahan Manis Jaya',
        ag.statusKegiatan || ag.status || 'Terjadwal',
        raw,
        raw,
        nowISO,
      ],
    });
    return true;
  } catch (err) {
    console.warn('saveAgendaToTurso notice:', err);
    return false;
  }
};

export const deleteAgendaFromTurso = async (id: string): Promise<boolean> => {
  const client = getTursoClient();
  if (!client || !id) return false;

  try {
    await client.execute({ sql: 'DELETE FROM agenda WHERE id = ?;', args: [String(id)] });
    return true;
  } catch (err) {
    console.warn('deleteAgendaFromTurso notice:', err);
    return false;
  }
};

export const fetchLettersFromTurso = async (): Promise<any[]> => {
  const client = getTursoClient();
  if (!client) return [];

  try {
    const res = await client.execute('SELECT * FROM letters ORDER BY updated_at DESC;');
    return res.rows.map((row: any) => {
      let rawObj: any = {};
      const jsonStr = row.raw_data || row.data;
      if (jsonStr) {
        try {
          rawObj = JSON.parse(jsonStr as string);
        } catch {}
      }
      return {
        ...rawObj,
        id: row.id,
        nomorSurat: rawObj.nomorSurat || rawObj.letterNumber || rawObj.number || row.number || '',
        jenisSurat: rawObj.jenisSurat || rawObj.type || row.type || 'Surat Keluar',
        perihal: rawObj.perihal || rawObj.subject || rawObj.title || row.title || 'Surat Karang Taruna',
        tanggalSurat: rawObj.tanggalSurat || rawObj.date || row.date || '',
        status: rawObj.status || row.status || 'Draft',
        updatedAt: row.updated_at,
      };
    });
  } catch (err) {
    console.warn('fetchLettersFromTurso notice:', err);
    return [];
  }
};

export const saveLetterToTurso = async (l: any): Promise<boolean> => {
  const client = getTursoClient();
  if (!client || !l?.id) return false;

  try {
    await initTursoSchema(client);
    const nowISO = new Date().toISOString();
    const raw = JSON.stringify(l);
    await client.execute({
      sql: `INSERT INTO letters (id, number, type, title, date, status, data, raw_data, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              number = excluded.number, type = excluded.type, title = excluded.title,
              date = excluded.date, status = excluded.status,
              data = excluded.data, raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
      args: [
        String(l.id),
        l.letterNumber || l.number || l.nomorSurat || '',
        l.type || l.jenisSurat || 'Surat Keluar',
        l.subject || l.title || l.perihal || 'Surat Karang Taruna',
        l.date || l.tanggalSurat || '',
        l.status || 'Terkirim',
        raw,
        raw,
        nowISO,
      ],
    });
    return true;
  } catch (err) {
    console.warn('saveLetterToTurso notice:', err);
    return false;
  }
};

export const deleteLetterFromTurso = async (id: string): Promise<boolean> => {
  const client = getTursoClient();
  if (!client || !id) return false;

  try {
    await client.execute({ sql: 'DELETE FROM letters WHERE id = ?;', args: [String(id)] });
    return true;
  } catch (err) {
    console.warn('deleteLetterFromTurso notice:', err);
    return false;
  }
};

export const fetchKasFromTurso = async (): Promise<any[]> => {
  const client = getTursoClient();
  if (!client) return [];

  try {
    const res = await client.execute('SELECT * FROM kas ORDER BY updated_at DESC;');
    return res.rows.map((row: any) => {
      let rawObj: any = {};
      const jsonStr = row.raw_data || row.data;
      if (jsonStr) {
        try {
          rawObj = JSON.parse(jsonStr as string);
        } catch {}
      }
      return {
        ...rawObj,
        id: row.id,
        jenis: rawObj.jenis || rawObj.type || row.type || 'Keluar',
        nominal: rawObj.nominal ?? rawObj.amount ?? row.amount ?? 0,
        keterangan: rawObj.keterangan || rawObj.description || row.description || '',
        tanggal: rawObj.tanggal || rawObj.date || row.date || '',
        kategori: rawObj.kategori || rawObj.category || row.category || 'Kas',
        updatedAt: row.updated_at,
      };
    });
  } catch (err) {
    console.warn('fetchKasFromTurso notice:', err);
    return [];
  }
};

export const saveKasToTurso = async (k: any): Promise<boolean> => {
  const client = getTursoClient();
  if (!client || !k?.id) return false;

  try {
    await initTursoSchema(client);
    const nowISO = new Date().toISOString();
    const raw = JSON.stringify(k);
    await client.execute({
      sql: `INSERT INTO kas (id, type, amount, description, date, category, data, raw_data, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              type = excluded.type, amount = excluded.amount, description = excluded.description,
              date = excluded.date, category = excluded.category,
              data = excluded.data, raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
      args: [
        String(k.id),
        k.type || k.jenis || 'Pemasukan',
        Number(k.amount || k.nominal || 0),
        k.description || k.keterangan || '',
        k.date || k.tanggal || '',
        k.category || k.kategori || 'Kas',
        raw,
        raw,
        nowISO,
      ],
    });
    return true;
  } catch (err) {
    console.warn('saveKasToTurso notice:', err);
    return false;
  }
};

export const deleteKasFromTurso = async (id: string): Promise<boolean> => {
  const client = getTursoClient();
  if (!client || !id) return false;

  try {
    await client.execute({ sql: 'DELETE FROM kas WHERE id = ?;', args: [String(id)] });
    return true;
  } catch (err) {
    console.warn('deleteKasFromTurso notice:', err);
    return false;
  }
};

export const saveVerificationCodeToTurso = async (params: {
  email: string;
  name?: string;
  username?: string;
  code: string;
  status?: string;
  verified?: boolean;
  opened?: boolean;
  channel?: string;
}): Promise<boolean> => {
  const client = getTursoClient();
  const cleanEmail = (params.email || '').trim().toLowerCase();
  if (!client || !cleanEmail) return false;

  try {
    await initTursoSchema(client);
    const nowISO = new Date().toISOString();
    await client.execute({
      sql: `INSERT INTO verification_codes (email, name, username, code, status, verified, opened, channel, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET
              name = COALESCE(NULLIF(excluded.name, ''), verification_codes.name),
              username = COALESCE(NULLIF(excluded.username, ''), verification_codes.username),
              code = excluded.code,
              status = excluded.status,
              verified = MAX(verification_codes.verified, excluded.verified),
              opened = MAX(verification_codes.opened, excluded.opened),
              channel = COALESCE(NULLIF(excluded.channel, ''), verification_codes.channel),
              updated_at = excluded.updated_at;`,
      args: [
        cleanEmail,
        params.name || '',
        params.username || '',
        params.code,
        params.status || 'pending',
        params.verified ? 1 : 0,
        params.opened ? 1 : 0,
        params.channel || 'turso',
        nowISO,
      ],
    });
    return true;
  } catch (err) {
    console.warn('saveVerificationCodeToTurso notice:', err);
    return false;
  }
};

export const fetchVerificationCodeFromTurso = async (
  email: string
): Promise<{ verified: boolean; opened: boolean; code: string; status: string } | null> => {
  const client = getTursoClient();
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!client || !cleanEmail) return null;

  try {
    const res = await client.execute({
      sql: 'SELECT code, status, verified, opened FROM verification_codes WHERE email = ? LIMIT 1;',
      args: [cleanEmail],
    });
    const row = res.rows[0] as any;
    if (!row) return null;
    return {
      code: String(row.code || ''),
      status: String(row.status || 'pending'),
      verified: Boolean(row.verified) || row.status === 'verified',
      opened: Boolean(row.opened),
    };
  } catch {
    return null;
  }
};

export interface TursoTableStats {
  connected: boolean;
  counts: {
    org_live_state: number;
    news: number;
    members: number;
    assets: number;
    agenda: number;
    letters: number;
    kas: number;
    votings: number;
    verification_codes: number;
  };
  lastUpdatedAt: string | null;
  lastUpdatedBy: string | null;
}

export const getTursoTableStats = async (
  customConfig?: Partial<TursoConfig>
): Promise<TursoTableStats> => {
  const emptyStats: TursoTableStats = {
    connected: false,
    counts: {
      org_live_state: 0,
      news: 0,
      members: 0,
      assets: 0,
      agenda: 0,
      letters: 0,
      kas: 0,
      votings: 0,
      verification_codes: 0,
    },
    lastUpdatedAt: null,
    lastUpdatedBy: null,
  };

  const client = getTursoClient(customConfig);
  if (!client) return emptyStats;

  try {
    await initTursoSchema(client);
    const tables = [
      'org_live_state',
      'news',
      'members',
      'assets',
      'agenda',
      'letters',
      'kas',
      'votings',
      'verification_codes',
    ] as const;

    const counts: any = { ...emptyStats.counts };
    for (const t of tables) {
      try {
        const res = await client.execute(`SELECT COUNT(*) as c FROM ${t};`);
        counts[t] = Number((res.rows[0] as any)?.c ?? 0);
      } catch {
        counts[t] = 0;
      }
    }

    let lastUpdatedAt: string | null = null;
    let lastUpdatedBy: string | null = null;
    try {
      const metaRes = await client.execute({
        sql: 'SELECT updated_at, updated_by FROM org_live_state WHERE id = ? LIMIT 1;',
        args: ['manisjaya_live'],
      });
      const row = metaRes.rows[0] as any;
      if (row) {
        lastUpdatedAt = row.updated_at ? String(row.updated_at) : null;
        lastUpdatedBy = row.updated_by ? String(row.updated_by) : null;
      }
    } catch {}

    return {
      connected: true,
      counts,
      lastUpdatedAt,
      lastUpdatedBy,
    };
  } catch {
    return emptyStats;
  }
};

/**
 * Tarik seluruh state organisasi + tabel berita, anggota, aset, agenda, surat, kas, dan voting dari Turso Database Utama
 */
export const pullFullStateFromTurso = async (): Promise<{
  exists: boolean;
  updated: boolean;
  modifiedKeys: string[];
  updatedAt: string | null;
  updatedBy?: string;
  deviceId?: string;
}> => {
  const client = getTursoClient();
  if (!client) {
    return { exists: false, updated: false, modifiedKeys: [], updatedAt: null };
  }

  try {
    await initTursoSchema(client);

    const stateRes = await client.execute({
      sql: 'SELECT id, data, updated_at, updated_by, reason, device_id FROM org_live_state WHERE id = ? LIMIT 1;',
      args: ['manisjaya_live'],
    });

    const row = stateRes.rows[0] as any;
    const [tursoNews, tursoAssets, tursoVotings, tursoMembers, tursoAgenda, tursoLetters, tursoKas] = await Promise.all([
      fetchNewsFromTurso().catch(() => []),
      fetchAssetsFromTurso().catch(() => []),
      fetchVotingsFromTurso().catch(() => []),
      fetchMembersFromTurso().catch(() => []),
      fetchAgendaFromTurso().catch(() => []),
      fetchLettersFromTurso().catch(() => []),
      fetchKasFromTurso().catch(() => []),
    ]);

    if (
      !row &&
      tursoNews.length === 0 &&
      tursoAssets.length === 0 &&
      tursoVotings.length === 0 &&
      tursoMembers.length === 0 &&
      tursoAgenda.length === 0 &&
      tursoLetters.length === 0 &&
      tursoKas.length === 0
    ) {
      return { exists: false, updated: false, modifiedKeys: [], updatedAt: null };
    }

    const modifiedKeys: string[] = [];
    isApplyingTursoRemote = true;

    try {
      if (row?.data) {
        let remoteData: Record<string, any> = {};
        try {
          remoteData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        } catch {}

        if (remoteData && typeof remoteData === 'object') {
          Object.entries(remoteData).forEach(([key, val]) => {
            if (val === undefined || val === null) return;
            // Jangan menimpa data berita/aset/anggota non-kosong dengan array kosong secara tidak sengaja
            if (
              Array.isArray(val) &&
              val.length === 0 &&
              (key === 'kt_news_v1' || key === 'kt_activities_v1' || key === 'kt_members_v3' || key === 'kt_assets_v1')
            ) {
              const localExisting = localStorage.getItem(key);
              if (localExisting && localExisting !== '[]') return;
            }
            const strVal = typeof val === 'string' ? val : JSON.stringify(val);
            if (localStorage.getItem(key) !== strVal) {
              localStorage.setItem(key, strVal);
              modifiedKeys.push(key);
            }
          });
        }
      }

      if (tursoNews.length > 0) {
        const newsStr = JSON.stringify(tursoNews);
        if (localStorage.getItem('kt_news_v1') !== newsStr) {
          localStorage.setItem('kt_news_v1', newsStr);
          localStorage.setItem('kt_activities_v1', newsStr);
          if (!modifiedKeys.includes('kt_news_v1')) modifiedKeys.push('kt_news_v1');
          if (!modifiedKeys.includes('kt_activities_v1')) modifiedKeys.push('kt_activities_v1');
        }
      }

      if (tursoMembers.length > 0) {
        const membersStr = JSON.stringify(tursoMembers);
        if (localStorage.getItem('kt_members_v3') !== membersStr) {
          localStorage.setItem('kt_members_v3', membersStr);
          if (!modifiedKeys.includes('kt_members_v3')) modifiedKeys.push('kt_members_v3');
        }
      }

      if (tursoAssets.length > 0) {
        const assetsStr = JSON.stringify(tursoAssets);
        if (localStorage.getItem('kt_assets_v1') !== assetsStr) {
          localStorage.setItem('kt_assets_v1', assetsStr);
          if (!modifiedKeys.includes('kt_assets_v1')) modifiedKeys.push('kt_assets_v1');
        }
      }

      if (tursoAgenda.length > 0) {
        const agendaStr = JSON.stringify(tursoAgenda);
        if (localStorage.getItem('kt_agenda_v1') !== agendaStr || localStorage.getItem('kt_agendas_v1') !== agendaStr) {
          localStorage.setItem('kt_agenda_v1', agendaStr);
          localStorage.setItem('kt_agendas_v1', agendaStr);
          if (!modifiedKeys.includes('kt_agenda_v1')) modifiedKeys.push('kt_agenda_v1');
          if (!modifiedKeys.includes('kt_agendas_v1')) modifiedKeys.push('kt_agendas_v1');
        }
      }

      if (tursoLetters.length > 0) {
        const lettersStr = JSON.stringify(tursoLetters);
        if (localStorage.getItem('kt_surat_items_v2') !== lettersStr) {
          localStorage.setItem('kt_surat_items_v2', lettersStr);
          if (!modifiedKeys.includes('kt_surat_items_v2')) modifiedKeys.push('kt_surat_items_v2');
        }
      }

      if (tursoKas.length > 0) {
        const kasStr = JSON.stringify(tursoKas);
        if (localStorage.getItem('kt_kas_entries_v2') !== kasStr) {
          localStorage.setItem('kt_kas_entries_v2', kasStr);
          if (!modifiedKeys.includes('kt_kas_entries_v2')) modifiedKeys.push('kt_kas_entries_v2');
        }
      }

      if (tursoVotings.length > 0) {
        const votingsStr = JSON.stringify(tursoVotings);
        if (localStorage.getItem('kt_votings_v1') !== votingsStr) {
          localStorage.setItem('kt_votings_v1', votingsStr);
          if (!modifiedKeys.includes('kt_votings_v1')) modifiedKeys.push('kt_votings_v1');
        }
      }

      isInitialTursoResolved = true;
      if (row?.updated_at) {
        lastObservedTursoUpdatedAt = String(row.updated_at);
      }

      if (modifiedKeys.length > 0) {
        window.dispatchEvent(new Event('kt_database_restored'));
        window.dispatchEvent(new CustomEvent('kt_cloud_sync_update', { detail: { modifiedKeys, source: 'turso' } }));
        if (modifiedKeys.includes('kt_news_v1') && tursoNews.length > 0) {
          window.dispatchEvent(new CustomEvent('kt_news_updated', { detail: { news: tursoNews } }));
        }
      }

      return {
        exists: true,
        updated: modifiedKeys.length > 0,
        modifiedKeys,
        updatedAt: row?.updated_at ? String(row.updated_at) : new Date().toISOString(),
        updatedBy: row?.updated_by ? String(row.updated_by) : undefined,
        deviceId: row?.device_id ? String(row.device_id) : undefined,
      };
    } finally {
      setTimeout(() => {
        isApplyingTursoRemote = false;
      }, 350);
    }
  } catch (err) {
    console.warn('pullFullStateFromTurso notice:', err);
    return { exists: false, updated: false, modifiedKeys: [], updatedAt: null };
  }
};

/**
 * Simpan seluruh state lokal & tabel terkait ke Turso Database Utama
 */
export const pushFullStateToTurso = async (
  reason = 'Perubahan data aplikasi',
  userName = 'Pengurus'
): Promise<{ success: boolean; skipped?: boolean; message?: string }> => {
  if (isApplyingTursoRemote) return { success: true, skipped: true };

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline) {
    addToTursoOfflineQueue(reason);
    return { success: false, message: 'Perangkat sedang offline. Perubahan diantrekan untuk Turso.' };
  }

  const isExplicitMutation =
    reason.includes('Tambah') ||
    reason.includes('manual') ||
    reason.includes('Hapus') ||
    reason.includes('Ubah') ||
    reason.includes('Update') ||
    reason.includes('Arsip') ||
    reason.includes('Pulihkan') ||
    reason.includes('Inisialisasi') ||
    reason.includes('Migrasi') ||
    reason.includes('Pembaruan');

  if (!isInitialTursoResolved && !isExplicitMutation) {
    return { success: true, skipped: true };
  }

  const client = getTursoClient();
  if (!client) {
    return { success: false, message: 'Client Turso belum tersedia.' };
  }

  try {
    await initTursoSchema(client);

    const localData = collectLocalTursoState();
    const serializedState = JSON.stringify(localData);
    const dataHash = hashTursoString(serializedState);

    if (dataHash === lastPushedTursoHash && !reason.includes('manual') && !reason.includes('Inisialisasi')) {
      return { success: true, skipped: true };
    }

    const nowISO = new Date().toISOString();
    const statements: Array<{ sql: string; args: any[] }> = [
      {
        sql: `INSERT INTO org_live_state (id, data, updated_at, updated_by, reason, device_id)
              VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                data = excluded.data,
                updated_at = excluded.updated_at,
                updated_by = excluded.updated_by,
                reason = excluded.reason,
                device_id = excluded.device_id;`,
        args: ['manisjaya_live', serializedState, nowISO, userName, reason, TURSO_DEVICE_ID],
      },
    ];

    const appendOrphanCleanup = (table: string, activeIds: string[]) => {
      if (activeIds.length > 0) {
        const placeholders = activeIds.map(() => '?').join(', ');
        statements.push({
          sql: `DELETE FROM ${table} WHERE id NOT IN (${placeholders});`,
          args: activeIds,
        });
      } else {
        statements.push({
          sql: `DELETE FROM ${table};`,
          args: [],
        });
      }
    };

    // Sinkronkan tabel granular + bersihkan baris yang sudah dihapus di aplikasi
    if (Array.isArray(localData.kt_members_v3)) {
      const activeIds: string[] = [];
      for (const m of localData.kt_members_v3) {
        const id = m?.id || m?.username;
        if (id) {
          activeIds.push(String(id));
          const raw = JSON.stringify(m);
          statements.push({
            sql: `INSERT INTO members (id, username, name, role, rw, phone, email, data, raw_data, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    username = excluded.username, name = excluded.name, role = excluded.role,
                    rw = excluded.rw, phone = excluded.phone, email = excluded.email,
                    data = excluded.data, raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
            args: [
              String(id),
              m.username || '',
              m.name || '',
              m.role || m.jabatan || '',
              m.rw || '',
              m.phone || m.telepon || '',
              m.email || '',
              raw,
              raw,
              nowISO,
            ],
          });
        }
      }
      if (activeIds.length > 0) appendOrphanCleanup('members', activeIds);
    }

    if (Array.isArray(localData.kt_assets_v1)) {
      const activeIds: string[] = [];
      for (const a of localData.kt_assets_v1) {
        if (a?.id) {
          activeIds.push(String(a.id));
          const raw = JSON.stringify(a);
          statements.push({
            sql: `INSERT INTO assets (id, name, code, category, condition, quantity, location, data, raw_data, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name, code = excluded.code, category = excluded.category,
                    condition = excluded.condition, quantity = excluded.quantity, location = excluded.location,
                    data = excluded.data, raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
            args: [
              String(a.id),
              a.namaAsset || a.name || 'Aset Organisasi',
              a.kodeAsset || a.code || '',
              a.kategori || a.category || 'Peralatan',
              a.kondisi || a.condition || 'Baik',
              Number(a.jumlah || a.quantity || 1),
              a.lokasi || a.location || 'Sekretariat',
              raw,
              raw,
              nowISO,
            ],
          });
        }
      }
      appendOrphanCleanup('assets', activeIds);
    }

    const agendaArr = localData.kt_agendas_v1 || localData.kt_agenda_v1;
    if (Array.isArray(agendaArr)) {
      const activeIds: string[] = [];
      for (const ag of agendaArr) {
        if (ag?.id) {
          activeIds.push(String(ag.id));
          const raw = JSON.stringify(ag);
          statements.push({
            sql: `INSERT INTO agenda (id, title, date, time, location, status, data, raw_data, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title, date = excluded.date, time = excluded.time,
                    location = excluded.location, status = excluded.status,
                    data = excluded.data, raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
            args: [
              String(ag.id),
              ag.namaKegiatan || ag.title || ag.judul || 'Agenda Kegiatan',
              ag.tanggalMulai || ag.date || ag.tanggal || '',
              ag.jamMulai ? `${ag.jamMulai} - ${ag.jamSelesai || ''}` : (ag.time || ag.waktu || ''),
              ag.lokasi || ag.location || 'Kelurahan Manis Jaya',
              ag.statusKegiatan || ag.status || 'Terjadwal',
              raw,
              raw,
              nowISO,
            ],
          });
        }
      }
      appendOrphanCleanup('agenda', activeIds);
    }

    if (Array.isArray(localData.kt_surat_items_v2)) {
      const activeIds: string[] = [];
      for (const l of localData.kt_surat_items_v2) {
        if (l?.id) {
          activeIds.push(String(l.id));
          const raw = JSON.stringify(l);
          statements.push({
            sql: `INSERT INTO letters (id, number, type, title, date, status, data, raw_data, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    number = excluded.number, type = excluded.type, title = excluded.title,
                    date = excluded.date, status = excluded.status,
                    data = excluded.data, raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
            args: [
              String(l.id),
              l.letterNumber || l.number || l.nomorSurat || '',
              l.type || l.jenisSurat || 'Surat Keluar',
              l.subject || l.title || l.perihal || 'Surat Karang Taruna',
              l.date || l.tanggalSurat || '',
              l.status || 'Terkirim',
              raw,
              raw,
              nowISO,
            ],
          });
        }
      }
      appendOrphanCleanup('letters', activeIds);
    }

    if (Array.isArray(localData.kt_kas_entries_v2)) {
      const activeIds: string[] = [];
      for (const k of localData.kt_kas_entries_v2) {
        if (k?.id) {
          activeIds.push(String(k.id));
          const raw = JSON.stringify(k);
          statements.push({
            sql: `INSERT INTO kas (id, type, amount, description, date, category, data, raw_data, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    type = excluded.type, amount = excluded.amount, description = excluded.description,
                    date = excluded.date, category = excluded.category,
                    data = excluded.data, raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
            args: [
              String(k.id),
              k.type || k.jenis || 'Pemasukan',
              Number(k.amount || k.nominal || 0),
              k.description || k.keterangan || '',
              k.date || k.tanggal || '',
              k.category || k.kategori || 'Kas',
              raw,
              raw,
              nowISO,
            ],
          });
        }
      }
      appendOrphanCleanup('kas', activeIds);
    }

    if (Array.isArray(localData.kt_votings_v1)) {
      const activeIds: string[] = [];
      for (const v of localData.kt_votings_v1) {
        if (v?.id) {
          activeIds.push(String(v.id));
          const raw = JSON.stringify(v);
          statements.push({
            sql: `INSERT INTO votings (id, title, status, data, raw_data, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title, status = excluded.status,
                    data = excluded.data, raw_data = excluded.raw_data, updated_at = excluded.updated_at;`,
            args: [
              String(v.id),
              v.title || v.judul || 'Musyawarah Pemuda',
              v.status || 'active',
              raw,
              raw,
              nowISO,
            ],
          });
        }
      }
      appendOrphanCleanup('votings', activeIds);
    }

    if (client.executeBatch) {
      await client.executeBatch(statements);
    } else {
      for (const stmt of statements) {
        await client.execute(stmt);
      }
    }

    lastPushedTursoHash = dataHash;
    lastObservedTursoUpdatedAt = nowISO;
    clearTursoOfflineQueue();

    return { success: true, message: 'Data berhasil disimpan ke Turso Database Utama!' };
  } catch (err: any) {
    addToTursoOfflineQueue(reason);
    console.warn('pushFullStateToTurso notice:', err?.message || err);
    return { success: false, message: err?.message || 'Gagal mengirim data ke Turso' };
  }
};

/**
 * Mulai sinkronisasi utama aplikasi dengan Turso Database (libSQL Cloud)
 * Melakukan penarikan data awal dari Turso dan polling ringan lintas perangkat.
 */
export const startTursoPrimarySync = (
  onStatusChange?: (status: TursoSyncStatus) => void,
  onRemoteUpdateReceived?: (updatedKeys: string[]) => void,
  pollIntervalMs = 8000
): (() => void) => {
  let isMounted = true;
  tursoPrimarySyncActive = true;

  const emitStatus = (
    state: TursoSyncStatus['state'],
    message: string,
    lastSyncedAt: string | null = null,
    sourceDevice?: string
  ) => {
    if (!isMounted) return;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const queue = getPendingTursoOfflineQueue();
    onStatusChange?.({
      state,
      lastSyncedAt,
      message,
      sourceDevice,
      isOnline,
      pendingOfflineCount: queue.length,
    });
  };

  const isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  emitStatus(
    isCurrentlyOnline ? 'syncing' : 'offline',
    isCurrentlyOnline
      ? 'Menghubungkan ke Turso Database Utama (libSQL)...'
      : 'Mode Offline: Perubahan disimpan lokal & otomatis dikirim ke Turso saat online.'
  );

  const bootstrap = async () => {
    try {
      const conn = await testTursoConnection();
      if (!isMounted) return;

      if (!conn.success) {
        emitStatus('error', conn.message || 'Tidak dapat terhubung ke Turso Database.');
        return;
      }

      const pulled = await pullFullStateFromTurso();
      if (!isMounted) return;

      if (!pulled.exists) {
        // Jika Turso masih kosong, inisialisasi dari state lokal
        await syncAllLocalDataToTurso();
        await pushFullStateToTurso('Inisialisasi Turso Database Utama');
        isInitialTursoResolved = true;
        emitStatus(
          'connected',
          'Turso Database Utama aktif & diinisialisasi.',
          new Date().toISOString()
        );
      } else {
        isInitialTursoResolved = true;
        emitStatus(
          'connected',
          'Turso Database Utama Aktif (libSQL Cloud) · Lainnya sebagai Backup',
          pulled.updatedAt || new Date().toISOString()
        );
        if (pulled.updated && pulled.modifiedKeys.length > 0 && pulled.deviceId !== TURSO_DEVICE_ID) {
          onRemoteUpdateReceived?.(pulled.modifiedKeys);
        }
      }
    } catch (err: any) {
      if (isMounted) {
        emitStatus('error', `Koneksi Turso terganggu: ${err?.message || err}`);
      }
    }
  };

  bootstrap();

  // Polling ringan ke Turso org_live_state untuk sinkronisasi antar perangkat
  const pollTimer = setInterval(async () => {
    if (!isMounted) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    const client = getTursoClient();
    if (!client) return;

    try {
      const checkRes = await client.execute({
        sql: 'SELECT updated_at, device_id, updated_by FROM org_live_state WHERE id = ? LIMIT 1;',
        args: ['manisjaya_live'],
      });
      const row = checkRes.rows[0] as any;
      if (!row) return;

      const remoteUpdatedAt = String(row.updated_at || '');
      const remoteDeviceId = String(row.device_id || '');

      if (
        remoteUpdatedAt &&
        remoteUpdatedAt !== lastObservedTursoUpdatedAt &&
        remoteDeviceId !== TURSO_DEVICE_ID
      ) {
        const pulled = await pullFullStateFromTurso();
        if (!isMounted) return;
        emitStatus(
          'connected',
          `Sinkronisasi Turso Utama diperbarui (${row.updated_by || 'perangkat lain'})`,
          remoteUpdatedAt,
          remoteDeviceId
        );
        if (pulled.updated && pulled.modifiedKeys.length > 0) {
          onRemoteUpdateReceived?.(pulled.modifiedKeys);
        }
      }
    } catch {
      // Abaikan gangguan polling sesaat
    }
  }, pollIntervalMs);

  const handleOnline = () => {
    emitStatus('syncing', 'Internet aktif. Mengirim antrean lokal ke Turso Database Utama...');
    pushFullStateToTurso('Sinkronisasi otomatis Turso setelah online kembali')
      .then((res) => {
        if (!isMounted) return;
        if (res.success) {
          emitStatus('connected', 'Turso Database Utama tersinkronisasi!', new Date().toISOString());
        }
      })
      .catch(() => {});
  };

  const handleOffline = () => {
    emitStatus('offline', 'Offline: Data disimpan sementara di browser dan akan dikirim ke Turso saat online.');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    isMounted = false;
    tursoPrimarySyncActive = false;
    clearInterval(pollTimer);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

let isTursoAutoSyncSetup = false;
let tursoPushTimer: any = null;
let tursoBackupTimer: any = null;

/**
 * Mengaktifkan auto-sync ke Turso sebagai Database Utama setiap ada perubahan data lokal,
 * dan memicu pencadangan (backup) secara asinkron & ter-throttle ke database cadangan.
 */
export const enableTursoAutoSync = (
  getUserName: () => string,
  onTriggerBackup?: (reason: string) => void
) => {
  if (isTursoAutoSyncSetup) return;
  isTursoAutoSyncSetup = true;

  const scheduleSync = (reason = 'Perubahan data') => {
    if (isApplyingTursoRemote) return;

    if (tursoPushTimer) clearTimeout(tursoPushTimer);
    tursoPushTimer = setTimeout(() => {
      pushFullStateToTurso(reason, getUserName()).catch(() => {});
    }, 1000);

    if (onTriggerBackup) {
      if (tursoBackupTimer) clearTimeout(tursoBackupTimer);
      // Throttle backup ke Firestore/Filebase tiap 12 detik agar tidak boros kuota
      tursoBackupTimer = setTimeout(() => {
        try {
          onTriggerBackup(reason);
        } catch {}
      }, 12000);
    }
  };

  window.addEventListener('kt_local_data_changed', ((e: CustomEvent) => {
    scheduleSync(e.detail?.reason || 'Perubahan data');
  }) as EventListener);

  window.addEventListener('kt_database_restored', () => {
    scheduleSync('Pemulihan database');
  });

  try {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = (key: string, value: string) => {
      originalSetItem(key, value);
      if (!isApplyingTursoRemote && isTursoSyncedKey(key)) {
        scheduleSync(`Pembaruan ${key}`);
      }
    };
  } catch (err) {
    console.warn('Turso localStorage interceptor notice:', err);
  }

  window.addEventListener('storage', (e) => {
    if (isTursoSyncedKey(e.key)) {
      scheduleSync(`Pembaruan ${e.key}`);
    }
  });
};


