/**
 * AI Email Verification Service
 * Karang Taruna Kelurahan Manis Jaya
 * 
 * Menggunakan Gemini AI (gemini-3.8-flash) untuk membuat pesan sambutan resmi,
 * personal, dan inspiratif dalam email verifikasi pendaftaran anggota Karang Taruna,
 * serta mengotomatiskan pengiriman email dari karangtarunamanisjaya@gmail.com.
 */

import {
  OFFICIAL_SENDER_EMAIL,
  OFFICIAL_SENDER_NAME,
  getVerificationUrl,
  cleanEmailKey,
} from './emailVerificationService';
import { db } from './firestoreSyncService';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface AIEmailParams {
  to: string;
  name: string;
  username: string;
  code: string;
}

export interface AIEmailContent {
  subject: string;
  welcomeMessage: string;
  motivationQuote: string;
  htmlContent: string;
  senderEmail: string;
  senderName: string;
}

/**
 * Fallback generator berbasis aturan cerdas untuk menghasilkan pesan sambutan
 * yang ramah, santun, dan formal khas Karang Taruna Manis Jaya
 */
function generateFallbackWelcome(name: string, username: string): { welcome: string; quote: string } {
  const quotes = [
    'Pemuda adalah agen perubahan. Mari bersama melangkah, berkarya, dan memberikan dampak nyata bagi warga Kelurahan Manis Jaya.',
    'Satu tekad, satu semangat untuk kemajuan kepemudaan dan kesejahteraan sosial di lingkungan Manis Jaya.',
    'Bersama pemuda Karang Taruna, jadikan setiap ide dan kreasi menjadi kontribusi bermakna bagi masyarakat.',
  ];
  const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    welcome: `Selamat datang dan terima kasih telah bergabung, Sdr/i ${name} (@${username})! Karang Taruna Kelurahan Manis Jaya menyambut hangat kehadiran Anda sebagai bagian dari wadah pemuda yang berdedikasi, kreatif, dan peduli sesama.`,
    quote: selectedQuote,
  };
}

/**
 * Meminta AI (Gemini 3.8 Flash via API server) untuk menyusun sambutan khusus
 */
export async function generateAIEmailContent(params: AIEmailParams): Promise<AIEmailContent> {
  const { to, name, username, code } = params;
  let welcomeMessage = '';
  let motivationQuote = '';

  try {
    const res = await fetch('/api/ai-generate-verification-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, code }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.welcomeMessage) welcomeMessage = data.welcomeMessage;
      if (data.motivationQuote) motivationQuote = data.motivationQuote;
    }
  } catch (err) {
    console.info('Penyusunan sambutan AI beralih ke generator lokal:', err);
  }

  // Jika belum terisi dari server, gunakan generator cerdas lokal
  if (!welcomeMessage || !motivationQuote) {
    const fallback = generateFallbackWelcome(name, username);
    welcomeMessage = welcomeMessage || fallback.welcome;
    motivationQuote = motivationQuote || fallback.quote;
  }

  const subject = `[Karang Taruna Manis Jaya] Kode Verifikasi Pendaftaran Anggota: ${code}`;
  const verifyUrl = getVerificationUrl(to, code);

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d213a 0%, #153457 50%, #0f3d64 100%); padding: 36px 30px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(59, 130, 246, 0.2); border: 1px solid rgba(147, 197, 253, 0.4); border-radius: 50px; padding: 5px 16px; margin-bottom: 12px;">
                <span style="color: #93c5fd; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">🤖 AI Otomasi Verifikasi Anggota</span>
              </div>
              <h1 style="color: #ffffff; font-size: 23px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px;">KARANG TARUNA MANIS JAYA</h1>
              <p style="color: #cbd5e1; font-size: 12px; margin: 0; font-weight: 400;">Kelurahan Manis Jaya, Kec. Jatiuwung, Kota Tangerang</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 35px 30px 25px 30px;">
              <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0 0 14px 0;">Verifikasi Pendaftaran Anggota Baru</h2>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 0 12px 12px 0; margin-bottom: 22px;">
                <p style="font-size: 13.5px; line-height: 1.6; color: #334155; margin: 0 0 8px 0;">
                  ${welcomeMessage}
                </p>
                <p style="font-size: 12px; font-style: italic; color: #64748b; margin: 0;">
                  "${motivationQuote}"
                </p>
              </div>

              <p style="font-size: 13.5px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                Gunakan <strong>6 digit angka verifikasi</strong> di bawah untuk mengaktifkan akun kepemudaan Anda di Portal Karang Taruna Kelurahan Manis Jaya:
              </p>

              <!-- Verification Code Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 22px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%); border: 2px dashed #2563eb; border-radius: 16px; padding: 24px 20px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #2563eb; letter-spacing: 1.5px; margin-bottom: 6px;">
                      6 Digit Angka Verifikasi Resmi
                    </div>
                    <div style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #1e3a8a; font-family: 'Courier New', Courier, monospace; margin: 4px 0;">
                      ${code}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
                      Dikirim resmi untuk akun <strong>@${username}</strong> (${to})
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 1-Click Auto Fill & Activation Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 26px 0;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.35);">
                      Buka & Verifikasi Akun Otomatis
                    </a>
                    <p style="font-size: 11px; color: #64748b; margin-top: 8px;">
                      Klik tombol untuk mengisi 6 digit angka secara otomatis di aplikasi saat email ini dibuka
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Advisory -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 12px 16px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 11.5px; line-height: 1.5; color: #92400e;">
                      <strong>Perhatian Keamanan:</strong> Jangan berikan angka verifikasi ini kepada pihak manapun. Sistem Karang Taruna Kelurahan Manis Jaya tidak pernah meminta kata sandi Anda.
                    </p>
                  </td>
                </tr>
              </table>

              <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 12px; color: #64748b; line-height: 1.6;">
                <div>Pengirim Resmi: <strong style="color: #0f172a;">${OFFICIAL_SENDER_EMAIL}</strong></div>
                <div>Organisasi: <strong>Karang Taruna Kelurahan Manis Jaya</strong></div>
                <div>Sekretariat: Jl. Raya Manis Jaya, Kec. Jatiuwung, Kota Tangerang, Banten</div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} Karang Taruna Kelurahan Manis Jaya. Seluruh hak cipta dilindungi.<br>
                Email otomatis ini diproses oleh AI Assistant Resmi Portal Manis Jaya.
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

  return {
    subject,
    welcomeMessage,
    motivationQuote,
    htmlContent,
    senderEmail: OFFICIAL_SENDER_EMAIL,
    senderName: OFFICIAL_SENDER_NAME,
  };
}

/**
 * Rekam riwayat pengiriman email ke Firestore database untuk audit log
 */
export async function logAIEmailDispatch(params: {
  to: string;
  name: string;
  username: string;
  code: string;
  delivered: boolean;
  channel: string;
}) {
  try {
    const key = cleanEmailKey(params.to);
    const docRef = doc(db, 'verification_codes', key);
    await setDoc(
      docRef,
      {
        email: params.to,
        name: params.name,
        username: params.username,
        code: params.code,
        status: params.delivered ? 'sent' : 'pending',
        sender: OFFICIAL_SENDER_EMAIL,
        channel: params.channel,
        verified: false,
        opened: false,
        aiGenerated: true,
        sentAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore log notice:', err);
  }
}
