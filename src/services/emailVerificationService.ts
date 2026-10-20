/**
 * Layanan Pengiriman Email Verifikasi Resmi Karang Taruna Kelurahan Manis Jaya
 * Mendukung pengiriman melalui Server API (/api/send-verification-email), 
 * Web Relay, dan pencatatan cloud Firestore.
 */

import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from './firestoreSyncService';

export interface SendVerificationEmailParams {
  to: string;
  name: string;
  username: string;
  code: string;
}

export interface SendVerificationEmailResult {
  success: boolean;
  delivered: boolean;
  message: string;
  channel: 'server_smtp' | 'resend' | 'cloud_firestore' | 'email_relay';
  deliveryDetails?: string;
  error?: string;
  reason?: string;
  timestamp: string;
}

export const OFFICIAL_SENDER_EMAIL = 'karangtarunamanisjaya@gmail.com';
export const OFFICIAL_SENDER_NAME = 'Karang Taruna Kelurahan Manis Jaya';

export interface EmailValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validasi ketat format email pengguna
 * - Wajib diisi
 * - Format email harus valid (memiliki @ dan domain/TLD yang valid)
 * - Tidak boleh mengandung spasi atau karakter ilegal
 */
export function validateEmailAddress(email: string): EmailValidationResult {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: 'Alamat email wajib diisi untuk menerima 6 digit kode verifikasi pendaftaran.',
    };
  }

  // Cek spasi
  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Data email tidak valid: Alamat email tidak boleh mengandung spasi.',
    };
  }

  // Cek titik ganda berturut-turut
  if (/\.\./.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Data email tidak valid: Alamat email tidak boleh mengandung titik berturut-turut (..).',
    };
  }

  // Standard RFC 5322 regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Data email tidak valid! Masukkan format email yang benar (contoh: nama@gmail.com).',
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      errorMessage: 'Data email tidak valid: Alamat email harus memiliki tepat satu tanda @.',
    };
  }

  const [local, domain] = parts;
  if (!local || local.length > 64) {
    return {
      isValid: false,
      errorMessage: 'Data email tidak valid: Nama pengguna sebelum @ tidak boleh kosong atau lebih dari 64 karakter.',
    };
  }

  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return {
      isValid: false,
      errorMessage: 'Data email tidak valid: Domain email harus memiliki ekstensi (contoh: .com, .id, .org).',
    };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return {
      isValid: false,
      errorMessage: 'Data email tidak valid: Ekstensi domain tidak lengkap (contoh: .com atau .id).',
    };
  }

  return {
    isValid: true,
  };
}

export function getVerificationUrl(to: string, code: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/?action=verify_email&email=${encodeURIComponent(to)}&code=${encodeURIComponent(code)}`;
  }
  return `https://karangtarunamanisjaya.my.id/?action=verify_email&email=${encodeURIComponent(to)}&code=${encodeURIComponent(code)}`;
}

/**
 * Generate template HTML email resmi Karang Taruna Manis Jaya
 */
export function generateOfficialVerificationEmailHtml(params: SendVerificationEmailParams): string {
  const { to, name, username, code } = params;
  const verifyUrl = getVerificationUrl(to, code);

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode Verifikasi Pendaftaran Karang Taruna Manis Jaya</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d213a 0%, #153457 50%, #0f3d64 100%); padding: 35px 30px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 50px; padding: 6px 16px; margin-bottom: 12px;">
                      <span style="color: #93c5fd; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Autentikasi Resmi</span>
                    </div>
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px;">KARANG TARUNA MANIS JAYA</h1>
                    <p style="color: #cbd5e1; font-size: 12px; margin: 0; font-weight: 400;">Kelurahan Manis Jaya, Kec. Jatiuwung, Kota Tangerang</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 35px 30px 30px 30px;">
              <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0 0 14px 0;">Verifikasi Pendaftaran Akun Pengguna</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">
                Halo <strong>${name}</strong> (Username: <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #2563eb; font-weight: 600;">@${username}</code>),
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Terima kasih telah mendaftar ke Sistem Karang Taruna Kelurahan Manis Jaya. Berikut adalah 6 digit kode verifikasi resmi akun Anda:
              </p>

              <!-- Verification Code Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 20px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border: 2px dashed #3b82f6; border-radius: 16px; padding: 24px 20px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #3b82f6; letter-spacing: 1px; margin-bottom: 6px;">Kode Verifikasi Resmi Anda</div>
                    <div style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #1e3a8a; font-family: 'Courier New', Courier, monospace; margin: 4px 0;">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 1-Click Auto Fill & Activation Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.35);">
                      Buka & Verifikasi Akun Otomatis
                    </a>
                    <p style="font-size: 11px; color: #64748b; margin-top: 8px;">
                      Klik tombol di atas untuk mengisi kode 6-digit secara otomatis di aplikasi saat email dibuka
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #92400e;">
                      <strong>Peringatan Keamanan:</strong> Jangan berikan angka verifikasi ini kepada siapapun termasuk pengurus organisasi. Jika Anda tidak merasa melakukan pendaftaran akun, silakan abaikan pesan email ini.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0;">
                Pengirim Resmi: <strong style="color: #0f172a;">karangtarunamanisjaya@gmail.com</strong><br>
                Website Resmi: <a href="https://karangtarunamanisjaya.my.id" style="color: #2563eb; text-decoration: none; font-weight: 600;">karangtarunamanisjaya.my.id</a><br>
                Sekretariat: Kelurahan Manis Jaya, Jatiuwung, Kota Tangerang.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} Karang Taruna Kelurahan Manis Jaya. Seluruh hak cipta dilindungi undang-undang.<br>
                Pesan ini dikirim secara otomatis oleh Sistem Portal Kepemudaan Manis Jaya.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Mengirimkan email verifikasi resmi ke email yang dimasukkan pengguna
 */
export async function sendOfficialVerificationEmail(
  params: SendVerificationEmailParams
): Promise<SendVerificationEmailResult> {
  const { to, name, username, code } = params;
  const timestamp = new Date().toISOString();
  const subject = `[Karang Taruna Manis Jaya] Kode Verifikasi Pendaftaran: ${code}`;
  const htmlContent = generateOfficialVerificationEmailHtml(params);

  // 1. Simpan pencatatan token verifikasi di Firestore database agar terverifikasi dan aman
  try {
    const cleanEmailKey = to.toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
    const docRef = doc(db, 'verification_codes', cleanEmailKey);
    await setDoc(
      docRef,
      {
        email: to,
        name,
        username,
        code,
        status: 'pending',
        verified: false,
        opened: false,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (firestoreErr) {
    console.warn('Firestore verification record notice:', firestoreErr);
  }

  // 2. Kirim melalui Server API Backend (/api/send-verification-email) via SMTP / Nodemailer
  try {
    let smtpConfig: any = null;
    try {
      const savedSmtp = localStorage.getItem('kt_smtp_config');
      if (savedSmtp) smtpConfig = JSON.parse(savedSmtp);
    } catch {}

    const response = await fetch('/api/send-verification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        name,
        username,
        code,
        subject,
        html: htmlContent,
        smtpConfig,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.delivered) {
        // Tandai di Firestore status 'sent'
        try {
          const cleanEmailKey = to.toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
          await setDoc(
            doc(db, 'verification_codes', cleanEmailKey),
            { status: 'sent', sentAt: serverTimestamp(), deliveryChannel: 'smtp' },
            { merge: true }
          );
        } catch {}

        return {
          success: true,
          delivered: true,
          message: data.message || `Email verifikasi resmi telah dikirim ke ${to}. Silakan periksa Kotak Masuk atau folder Spam email Anda.`,
          channel: 'server_smtp',
          deliveryDetails: data.message || `Terkirim via SMTP Server (${data.sender || 'Resmi'})`,
          timestamp,
        };
      } else {
        return {
          success: false,
          delivered: false,
          reason: data.reason || 'smtp_not_configured',
          error: data.error,
          message: data.message || `Server SMTP pengirim belum dihubungkan. Email otomatis ke ${to} belum terkirim.`,
          channel: 'server_smtp',
          deliveryDetails: data.error || data.message,
          timestamp,
        };
      }
    }
  } catch (apiErr: any) {
    console.info('Server API send error:', apiErr);
    return {
      success: false,
      delivered: false,
      reason: 'network_error',
      error: apiErr?.message || String(apiErr),
      message: 'Tidak dapat menghubungi server pengirim email.',
      channel: 'server_smtp',
      deliveryDetails: apiErr?.message || String(apiErr),
      timestamp,
    };
  }

  return {
    success: false,
    delivered: false,
    reason: 'unknown',
    message: `Email otomatis belum terkirim ke ${to}.`,
    channel: 'server_smtp',
    timestamp,
  };
}

/**
 * Generate direct webmail URL for common email providers (Gmail, Outlook, Yahoo)
 */
export function getEmailProviderWebUrl(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  if (domain.includes('gmail.com') || domain.includes('googlemail.com')) {
    return 'https://mail.google.com';
  }
  if (domain.includes('outlook.com') || domain.includes('hotmail.com') || domain.includes('live.com')) {
    return 'https://outlook.live.com';
  }
  if (domain.includes('yahoo.com')) {
    return 'https://mail.yahoo.com';
  }
  return `https://${domain}`;
}

/**
 * Direct Gmail Compose Link with pre-filled official verification email
 */
export function getDirectGmailComposeUrl(to: string, code: string, name: string): string {
  const subject = `[Karang Taruna Manis Jaya] Kode Verifikasi Pendaftaran: ${code}`;
  const body = `Halo ${name},\n\nTerima kasih telah mendaftar ke Sistem Karang Taruna Kelurahan Manis Jaya.\n\nKode Verifikasi Resmi 6 Digit Anda adalah:\n\n>>> ${code} <<<\n\nMasukkan 6 digit angka di atas pada formulir pendaftaran untuk mengaktifkan akun Anda.\n\nPengirim Resmi: karangtarunamanisjaya@gmail.com\nWebsite: https://karangtarunamanisjaya.my.id\n\nSalam Pemuda,\nPengurus Karang Taruna Kelurahan Manis Jaya`;
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Mailto URL fallback
 */
export function getMailtoUrl(to: string, code: string, name: string): string {
  const subject = `[Karang Taruna Manis Jaya] Kode Verifikasi Pendaftaran: ${code}`;
  const body = `Halo ${name},\n\nKode Verifikasi Resmi Anda: ${code}\nPengirim Resmi: karangtarunamanisjaya@gmail.com\n\nKarang Taruna Kelurahan Manis Jaya`;
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function cleanEmailKey(email: string): string {
  return (email || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
}

/**
 * Memproses URL jika dibuka dari tautan email verifikasi (?action=verify_email&email=...&code=...)
 */
export function processIncomingVerificationUrl(): { email: string; code: string; autoVerify: boolean } | null {
  if (typeof window === 'undefined') return null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const code = (urlParams.get('code') || urlParams.get('verifyCode') || urlParams.get('otp') || '').trim();
    const email = (urlParams.get('email') || '').trim();
    const action = urlParams.get('action');

    if (code && code.length === 6) {
      // Hapus query parameters dari URL tanpa reload agar bersih dan aman
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);

      // Tandai dibuka di Firestore dan broadcast ke seluruh tab terbuka
      markEmailVerificationOpened(email, code);

      return {
        email,
        code,
        autoVerify: action === 'verify_email' || Boolean(email),
      };
    }
  } catch (err) {
    console.warn('Gagal memproses tautan verifikasi email:', err);
  }
  return null;
}

/**
 * Menandai token verifikasi telah dibuka dari email
 */
export async function markEmailVerificationOpened(email: string, code: string): Promise<void> {
  const timestamp = Date.now();

  // Broadcast via BroadcastChannel ke tab lain yang sedang terbuka
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('kt_email_verification');
      channel.postMessage({ email, code, verified: true, opened: true, timestamp });
      setTimeout(() => channel.close(), 1000);
    }
  } catch {}

  // Broadcast via localStorage storage event
  try {
    localStorage.setItem('kt_email_auto_verified', JSON.stringify({ email, code, timestamp }));
  } catch {}

  // Update status ke Firestore
  if (email) {
    try {
      const docRef = doc(db, 'verification_codes', cleanEmailKey(email));
      await setDoc(
        docRef,
        {
          verified: true,
          opened: true,
          code,
          openedAt: serverTimestamp(),
          status: 'verified',
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore update opened notice:', e);
    }
  }
}

/**
 * Mendengarkan verifikasi email secara real-time via Firestore snapshot, BroadcastChannel, dan storage event.
 * Ketika email dibuka oleh penerima di perangkat/tab manapun, callback dipanggil otomatis dan 6 digit terisi!
 */
export function listenToEmailVerification(
  email: string,
  onVerified: (code: string) => void
): () => void {
  if (!email || typeof window === 'undefined') return () => {};
  const targetEmail = email.trim().toLowerCase();
  let unsubFirestore: (() => void) | null = null;
  let broadcastChannel: BroadcastChannel | null = null;

  // 1. Listen via BroadcastChannel
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel('kt_email_verification');
      broadcastChannel.onmessage = (event) => {
        const data = event.data;
        if (data && (!data.email || data.email.toLowerCase() === targetEmail) && data.code) {
          onVerified(data.code);
        }
      };
    }
  } catch {}

  // 2. Listen via storage event (cross-tab)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'kt_email_auto_verified' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && (!parsed.email || parsed.email.toLowerCase() === targetEmail) && parsed.code) {
          onVerified(parsed.code);
        }
      } catch {}
    }
  };
  window.addEventListener('storage', handleStorage);

  // 3. Listen via Firestore Realtime
  try {
    const docRef = doc(db, 'verification_codes', cleanEmailKey(targetEmail));
    unsubFirestore = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if ((data.verified || data.opened || data.status === 'verified') && data.code) {
            onVerified(data.code);
          }
        }
      },
      (err) => {
        console.warn('Firestore verification listener notice:', err);
      }
    );
  } catch {}

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (broadcastChannel) {
      try {
        broadcastChannel.close();
      } catch {}
    }
    if (unsubFirestore) {
      try {
        unsubFirestore();
      } catch {}
    }
  };
}
