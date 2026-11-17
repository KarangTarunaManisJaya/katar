import { collectAllOrganizationData, restoreOrganizationData, OrganizationBackupPayload } from './googleDriveService';

export interface CloudflareBackupConfig {
  workerUrl: string;
  apiSecret: string;
  autoBackup: boolean;
  lastBackupAt?: string | null;
  lastStatus?: string;
}

const CF_CONFIG_KEY = 'kt_cloudflare_backup_config_v1';
let lastPushedCloudflareHash = '';

const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash |= 0;
  }
  return String(hash);
};

export const getCloudflareBackupConfig = (): CloudflareBackupConfig => {
  try {
    const raw = localStorage.getItem(CF_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        workerUrl: String(parsed.workerUrl || '').trim(),
        apiSecret: String(parsed.apiSecret || '').trim(),
        autoBackup: parsed.autoBackup !== false,
        lastBackupAt: parsed.lastBackupAt || null,
        lastStatus: parsed.lastStatus || undefined,
      };
    }
  } catch {}
  return {
    workerUrl: '',
    apiSecret: '',
    autoBackup: true,
    lastBackupAt: null,
  };
};

export const saveCloudflareBackupConfig = (config: CloudflareBackupConfig): void => {
  try {
    localStorage.setItem(
      CF_CONFIG_KEY,
      JSON.stringify({
        workerUrl: (config.workerUrl || '').trim(),
        apiSecret: (config.apiSecret || '').trim(),
        autoBackup: config.autoBackup !== false,
        lastBackupAt: config.lastBackupAt || null,
        lastStatus: config.lastStatus || undefined,
      })
    );
  } catch (err) {
    console.warn('saveCloudflareBackupConfig notice:', err);
  }
};

const buildAuthHeaders = (apiSecret?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiSecret && apiSecret.trim()) {
    headers['Authorization'] = `Bearer ${apiSecret.trim()}`;
  }
  return headers;
};

const isJsonContent = (res: Response): boolean =>
  (res.headers.get('content-type') || '').toLowerCase().includes('application/json');

export const testCloudflareBackupConnection = async (
  customConfig?: Partial<CloudflareBackupConfig>
): Promise<{
  success: boolean;
  message: string;
  mode?: string;
  configured?: boolean;
}> => {
  const stored = getCloudflareBackupConfig();
  const workerUrl = (customConfig?.workerUrl !== undefined ? customConfig.workerUrl : stored.workerUrl).trim();
  const apiSecret = (customConfig?.apiSecret !== undefined ? customConfig.apiSecret : stored.apiSecret).trim();

  // 1. Jika URL Worker diisi langsung, uji langsung endpoint Cloudflare Worker (berfungsi di AI Studio & GitHub Pages statis)
  if (workerUrl) {
    try {
      const cleanUrl = workerUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}?action=health`, {
        method: 'GET',
        headers: buildAuthHeaders(apiSecret),
      });
      const data = isJsonContent(res) ? await res.json().catch(() => ({})) : {};
      if (!res.ok || data.success === false) {
        return {
          success: false,
          configured: true,
          message: data.message || `Cloudflare Worker merespons HTTP ${res.status}. Pastikan URL & Token sesuai.`,
        };
      }
      return {
        success: true,
        configured: true,
        mode: data.storage || 'cloudflare-worker',
        message:
          data.message ||
          `Terhubung ke Cloudflare Backup (${data.storage || 'Workers/KV/D1/R2'}) di ${cleanUrl}!`,
      };
    } catch (err: any) {
      return {
        success: false,
        configured: true,
        message: `Gagal menghubungi Cloudflare Worker: ${err?.message || err}`,
      };
    }
  }

  // 2. Jika URL browser kosong, cek apakah server environment mempunyai konfigurasi Cloudflare
  if (typeof fetch !== 'undefined') {
    try {
      const res = await fetch('/api/cloudflare/test', {
        method: 'GET',
      });
      if (res.ok && isJsonContent(res)) {
        const data = await res.json();
        return {
          success: Boolean(data.success),
          configured: Boolean(data.configured),
          mode: data.mode,
          message: data.message || 'Status server Cloudflare berhasil diperiksa.',
        };
      }
    } catch {}
  }

  return {
    success: false,
    configured: false,
    message:
      'URL Cloudflare Backup Worker belum diisi. Masukkan URL Worker dari dash.cloudflare.com atau atur Secrets server.',
  };
};

export const pushBackupToCloudflare = async (
  reason = 'Cadangan otomatis dari Turso Database Utama',
  userName = 'Pengurus'
): Promise<{ success: boolean; skipped?: boolean; message: string }> => {
  const cfg = getCloudflareBackupConfig();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline) {
    return { success: false, skipped: true, message: 'Perangkat sedang offline.' };
  }

  if (!cfg.autoBackup && !reason.toLowerCase().includes('manual')) {
    return { success: true, skipped: true, message: 'Auto-backup Cloudflare dinonaktifkan.' };
  }

  const getJsonSafe = (key: string, fallback: any = []) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const bundle: OrganizationBackupPayload & {
    reason?: string;
    source?: string;
    extraState?: {
      news: any[];
      agendas: any[];
      usersList: any[];
      votings: any[];
    };
  } = {
    ...collectAllOrganizationData(userName),
    reason,
    source: 'turso_primary',
    extraState: {
      news: getJsonSafe('kt_news_v1', []),
      agendas: getJsonSafe('kt_agendas_v1', []),
      usersList: getJsonSafe('kt_users_list_v3', []),
      votings: getJsonSafe('kt_votings_v1', []),
    },
  };

  const hash = simpleHash(JSON.stringify({ database: bundle.database, extraState: bundle.extraState }));
  if (hash === lastPushedCloudflareHash && !reason.toLowerCase().includes('manual')) {
    return { success: true, skipped: true, message: 'Data cadangan Cloudflare sudah mutakhir.' };
  }

  // Jalur 1: Cloudflare Worker URL langsung (berfungsi di AI Studio & GitHub Pages)
  if (cfg.workerUrl) {
    try {
      const cleanUrl = cfg.workerUrl.replace(/\/+$/, '');
      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: buildAuthHeaders(cfg.apiSecret),
        body: JSON.stringify({
          action: 'backup',
          reason,
          updatedBy: userName,
          payload: bundle,
        }),
      });
      const data = isJsonContent(res) ? await res.json().catch(() => ({})) : {};
      if (!res.ok || data.success === false) {
        return {
          success: false,
          message: data.message || `Gagal menyimpan backup ke Cloudflare Worker (HTTP ${res.status}).`,
        };
      }
      lastPushedCloudflareHash = hash;
      const nowISO = new Date().toISOString();
      saveCloudflareBackupConfig({
        ...cfg,
        lastBackupAt: nowISO,
        lastStatus: `Tersinkron (${data.storage || 'Cloudflare'})`,
      });
      return {
        success: true,
        message: data.message || 'Cadangan penuh berhasil disimpan ke Cloudflare (dash.cloudflare.com)!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal kirim backup ke Cloudflare Worker: ${err?.message || err}`,
      };
    }
  }

  // Jalur 2: Server-side proxy (/api/cloudflare/backup) jika env vars dikonfigurasi di server
  if (typeof fetch !== 'undefined') {
    try {
      const res = await fetch('/api/cloudflare/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          updatedBy: userName,
          payload: bundle,
        }),
      });
      if (isJsonContent(res)) {
        const data = await res.json();
        if (res.ok && data.success) {
          lastPushedCloudflareHash = hash;
          const nowISO = new Date().toISOString();
          saveCloudflareBackupConfig({
            ...cfg,
            lastBackupAt: nowISO,
            lastStatus: `Tersinkron (${data.mode || 'Cloudflare API'})`,
          });
          return {
            success: true,
            message: data.message || 'Cadangan penuh berhasil dikirim ke Cloudflare!',
          };
        }
        return {
          success: false,
          skipped: data.configured === false,
          message: data.message || 'Cloudflare Backup belum dikonfigurasi.',
        };
      }
    } catch {}
  }

  return {
    success: false,
    skipped: true,
    message: 'Endpoint Cloudflare Backup belum diisi.',
  };
};

const applyExtraStateFromBackup = (payload: any) => {
  if (!payload || !payload.extraState) return;
  try {
    const { news, agendas, usersList, votings } = payload.extraState;
    if (Array.isArray(news)) {
      const serializedNews = JSON.stringify(news);
      localStorage.setItem('kt_news_v1', serializedNews);
      localStorage.setItem('kt_activities_v1', serializedNews);
      window.dispatchEvent(new CustomEvent('kt_news_updated', { detail: { news } }));
    }
    if (Array.isArray(agendas)) {
      localStorage.setItem('kt_agendas_v1', JSON.stringify(agendas));
    }
    if (Array.isArray(usersList)) {
      localStorage.setItem('kt_users_list_v3', JSON.stringify(usersList));
    }
    if (Array.isArray(votings)) {
      localStorage.setItem('kt_votings_v1', JSON.stringify(votings));
    }
    window.dispatchEvent(new Event('kt_database_restored'));
  } catch {}
};

export const pullBackupFromCloudflare = async (): Promise<{
  success: boolean;
  message: string;
  payload?: OrganizationBackupPayload;
}> => {
  const cfg = getCloudflareBackupConfig();

  if (cfg.workerUrl) {
    try {
      const cleanUrl = cfg.workerUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}?action=restore`, {
        method: 'GET',
        headers: buildAuthHeaders(cfg.apiSecret),
      });
      const data = isJsonContent(res) ? await res.json().catch(() => ({})) : {};
      if (!res.ok || data.success === false || !data.payload) {
        return {
          success: false,
          message: data.message || 'Belum ada data cadangan tersimpan di Cloudflare Worker.',
        };
      }
      restoreOrganizationData(data.payload);
      applyExtraStateFromBackup(data.payload);
      return {
        success: true,
        payload: data.payload,
        message: 'Data cadangan berhasil dipulihkan dari Cloudflare (dash.cloudflare.com)!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal menarik backup dari Cloudflare: ${err?.message || err}`,
      };
    }
  }

  try {
    const res = await fetch('/api/cloudflare/restore', { method: 'GET' });
    if (isJsonContent(res)) {
      const data = await res.json();
      if (res.ok && data.success && data.payload) {
        restoreOrganizationData(data.payload);
        applyExtraStateFromBackup(data.payload);
        return {
          success: true,
          payload: data.payload,
          message: 'Data cadangan berhasil dipulihkan dari Cloudflare!',
        };
      }
      return {
        success: false,
        message: data.message || 'Belum ada cadangan tersimpan di Cloudflare.',
      };
    }
  } catch {}

  return {
    success: false,
    message: 'Masukkan URL Cloudflare Backup Worker terlebih dahulu.',
  };
};

export const CLOUDFLARE_WORKER_SCRIPT = `// Skrip Cloudflare Worker Backup — Karang Taruna Manis Jaya
// Pasang di dash.cloudflare.com -> Workers & Pages -> Create Worker
// Bind salah satu penyimpanan di Settings -> Bindings:
// 1. KV Namespace dengan nama variable: BACKUP_KV   (Paling mudah & gratis)
// 2. Atau R2 Bucket dengan nama variable: BACKUP_R2
// 3. Atau D1 Database dengan nama variable: BACKUP_D1
// Opsional: tambahkan Secret variable BACKUP_SECRET untuk keamanan Bearer Token

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (env.BACKUP_SECRET) {
      const auth = request.headers.get("Authorization") || "";
      if (auth !== "Bearer " + env.BACKUP_SECRET) {
        return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401, headers: cors });
      }
    }

    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "health";
    const key = "kt_manisjaya_latest_backup.json";

    const detectStorage = () => {
      if (env.BACKUP_KV) return "Cloudflare KV";
      if (env.BACKUP_R2) return "Cloudflare R2";
      if (env.BACKUP_D1) return "Cloudflare D1";
      return "Cloudflare Worker (Belum ada Binding KV/R2/D1)";
    };

    if (request.method === "GET" && action === "health") {
      return new Response(JSON.stringify({
        success: true,
        storage: detectStorage(),
        message: "Cloudflare Worker Backup aktif (" + detectStorage() + ")"
      }), { status: 200, headers: cors });
    }

    if (request.method === "GET" && action === "restore") {
      let raw = null;
      if (env.BACKUP_KV) raw = await env.BACKUP_KV.get(key);
      else if (env.BACKUP_R2) {
        const obj = await env.BACKUP_R2.get(key);
        if (obj) raw = await obj.text();
      } else if (env.BACKUP_D1) {
        await env.BACKUP_D1.exec("CREATE TABLE IF NOT EXISTS kt_backups (id TEXT PRIMARY KEY, payload TEXT, updated_at TEXT);");
        const row = await env.BACKUP_D1.prepare("SELECT payload FROM kt_backups WHERE id = ?").bind("latest").first();
        if (row) raw = row.payload;
      }

      if (!raw) {
        return new Response(JSON.stringify({ success: false, message: "Belum ada backup tersimpan." }), { status: 404, headers: cors });
      }
      return new Response(JSON.stringify({ success: true, payload: JSON.parse(raw) }), { status: 200, headers: cors });
    }

    if (request.method === "POST") {
      const body = await request.json();
      if (body.action === "backup" && body.payload) {
        const serialized = JSON.stringify(body.payload);
        if (env.BACKUP_KV) await env.BACKUP_KV.put(key, serialized);
        if (env.BACKUP_R2) await env.BACKUP_R2.put(key, serialized, { httpMetadata: { contentType: "application/json" } });
        if (env.BACKUP_D1) {
          await env.BACKUP_D1.exec("CREATE TABLE IF NOT EXISTS kt_backups (id TEXT PRIMARY KEY, payload TEXT, updated_at TEXT);");
          await env.BACKUP_D1.prepare(
            "INSERT INTO kt_backups (id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at;"
          ).bind("latest", serialized, new Date().toISOString()).run();
        }
        return new Response(JSON.stringify({
          success: true,
          storage: detectStorage(),
          message: "Cadangan berhasil disimpan ke " + detectStorage()
        }), { status: 200, headers: cors });
      }
    }

    return new Response(JSON.stringify({ success: false, message: "Permintaan tidak dikenali." }), { status: 400, headers: cors });
  }
};`;
