import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const port = parseInt(process.env.PORT || '3000', 10);
  // Support both custom domains (karangtarunamanisjaya.my.id) and subpaths (/katar/) seamlessly
  const base = process.env.VITE_BASE || './';

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'apk-headers-middleware',
        configureServer(server) {
          const pdfStore = new Map<string, { filename: string; buffer: Buffer; timestamp: number }>();

          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.includes('ManisJaya_KarangTaruna_v1.2.0.apk')) {
              res.setHeader('Content-Type', 'application/vnd.android.package-archive');
              res.setHeader('Content-Disposition', 'attachment; filename="ManisJaya_KarangTaruna_v1.2.0.apk"');
              return next();
            }
            if (req.url && req.url.includes('ManisJaya_SourceCode_Mentahan.zip')) {
              res.setHeader('Content-Type', 'application/zip');
              res.setHeader('Content-Disposition', 'attachment; filename="ManisJaya_SourceCode_Mentahan.zip"');
              return next();
            }

            // Endpoint POST untuk menyimpan file PDF sementara
            if (req.url && req.url.startsWith('/api/prepare-download-pdf') && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  const token = 'pdf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
                  const cleanFilename = (data.filename || 'dokumen.pdf').replace(/[^a-zA-Z0-9_.-]/g, '_');
                  const buffer = Buffer.from(data.pdfBase64, 'base64');
                  pdfStore.set(token, {
                    filename: cleanFilename,
                    buffer,
                    timestamp: Date.now(),
                  });

                  // Bersihkan token yang lebih dari 15 menit
                  const now = Date.now();
                  for (const [k, v] of pdfStore.entries()) {
                    if (now - v.timestamp > 15 * 60 * 1000) pdfStore.delete(k);
                  }

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, downloadUrl: `/api/download-pdf?token=${token}` }));
                } catch (e: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
              return;
            }

            // Endpoint GET untuk mengunduh PDF secara langsung dengan header attachment
            if (req.url && req.url.startsWith('/api/download-pdf')) {
              const urlObj = new URL(req.url, 'http://localhost:3000');
              const token = urlObj.searchParams.get('token');
              if (token && pdfStore.has(token)) {
                const item = pdfStore.get(token)!;
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${item.filename}"`);
                res.setHeader('Content-Length', item.buffer.length);
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.end(item.buffer);
                return;
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'PDF file not found or download expired. Please click download again.' }));
                return;
              }
            }

            // Endpoint POST untuk AI Generator Email Verifikasi Resmi Karang Taruna
            if (req.url && req.url.startsWith('/api/ai-generate-verification-email') && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', async () => {
                let data: any = {};
                try {
                  data = JSON.parse(body || '{}');
                  const { name, username, code } = data;
                  let welcomeMessage = '';
                  let motivationQuote = '';

                  const geminiKey = process.env.GEMINI_API_KEY;
                  if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY' && geminiKey.length > 10) {
                    try {
                      const { GoogleGenAI } = await import('@google/genai');
                      const ai = new GoogleGenAI();
                      const prompt = `Anda adalah asisten AI resmi Karang Taruna Kelurahan Manis Jaya, Kecamatan Jatiuwung, Kota Tangerang.
Tuliskan:
1. Satu paragraf sambutan resmi dan hangat untuk calon anggota bernama "${name || 'Kawan Pemuda'}" (username: @${username || 'pemuda'}).
2. Satu kutipan motivasi pemuda yang membangkitkan semangat berkarya dan kepedulian sosial di Manis Jaya.

Format respons dalam JSON valid persis:
{
  "welcomeMessage": "isi sambutan...",
  "motivationQuote": "isi kutipan motivasi..."
}`;
                      const response = await ai.models.generateContent({
                        model: 'gemini-3.8-flash',
                        contents: prompt,
                        config: { responseMimeType: 'application/json' },
                      });
                      if (response.text) {
                        const parsed = JSON.parse(response.text);
                        welcomeMessage = parsed.welcomeMessage || '';
                        motivationQuote = parsed.motivationQuote || '';
                      }
                    } catch (aiErr: any) {
                      console.warn('Gemini generateContent notice:', aiErr?.message);
                    }
                  }

                  if (!welcomeMessage) {
                    welcomeMessage = `Selamat datang di Portal Resmi Karang Taruna Kelurahan Manis Jaya, Sdr/i ${name || 'Kawan Pemuda'} (@${username || 'pemuda'}). Mari bersama melangkah, berkarya, dan berkontribusi nyata bagi kemajuan pemuda serta masyarakat Manis Jaya.`;
                    motivationQuote = 'Pemuda adalah garda terdepan perubahan. Satu tekad, satu semangat untuk Manis Jaya yang lebih berdaya.';
                  }

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: true,
                      welcomeMessage,
                      motivationQuote,
                      sender: 'karangtarunamanisjaya@gmail.com',
                    })
                  );
                } catch (err: any) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: true,
                      welcomeMessage: `Selamat datang di Karang Taruna Kelurahan Manis Jaya, Sdr/i ${data?.name || 'Kawan Pemuda'}.`,
                      motivationQuote: 'Karya nyata pemuda untuk Manis Jaya sejahtera.',
                      sender: 'karangtarunamanisjaya@gmail.com',
                    })
                  );
                }
              });
              return;
            }

            // Endpoint POST untuk mengirim email verifikasi resmi pendaftaran
            if (req.url && req.url.startsWith('/api/send-verification-email') && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body || '{}');
                  const { to, name, code, subject, html } = data;

                  if (!to || !code) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Email tujuan (to) dan kode verifikasi diperlukan.' }));
                    return;
                  }

                  let sent = false;
                  let infoMsg = '';
                  let lastError = '';

                  // 1. Cek konfigurasi SMTP dari payload atau process.env
                  const clientSmtp = data.smtpConfig;
                  const defaultOfficialEmail = 'karangtarunamanisjaya@gmail.com';
                  const smtpUser = (clientSmtp?.user || process.env.SMTP_USER || process.env.GMAIL_USER || defaultOfficialEmail).trim();
                  const rawPass = (clientSmtp?.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').trim();
                  const smtpPass = rawPass.replace(/\s+/g, ''); // bersihkan spasi app password
                  const smtpHost = (clientSmtp?.host || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
                  const smtpPort = parseInt(clientSmtp?.port || process.env.SMTP_PORT || (smtpHost.includes('gmail') ? '465' : '587'), 10);
                  const isSecure = smtpPort === 465 || clientSmtp?.secure || process.env.SMTP_SECURE === 'true';

                  if (smtpUser && smtpPass) {
                    try {
                      const nodemailer = await import('nodemailer');
                      const transporter = nodemailer.createTransport(
                        smtpHost && smtpHost !== 'smtp.gmail.com'
                          ? {
                              host: smtpHost,
                              port: smtpPort,
                              secure: isSecure,
                              auth: { user: smtpUser, pass: smtpPass },
                              tls: { rejectUnauthorized: false },
                            }
                          : {
                              service: 'gmail',
                              auth: { user: smtpUser, pass: smtpPass },
                            }
                      );

                      const sendResult = await transporter.sendMail({
                        from: `"Karang Taruna Manis Jaya" <${smtpUser || defaultOfficialEmail}>`,
                        to,
                        subject: subject || `[Karang Taruna Manis Jaya] Kode Verifikasi Pendaftaran: ${code}`,
                        html,
                      });
                      sent = true;
                      infoMsg = `Email verifikasi berhasil dikirim via SMTP (${smtpUser}) ke ${to}`;
                    } catch (smtpErr: any) {
                      lastError = smtpErr?.message || String(smtpErr);
                      console.warn('SMTP transport notice:', lastError);
                    }
                  }

                  // 2. Cek jika ada RESEND_API_KEY
                  if (!sent && process.env.RESEND_API_KEY) {
                    try {
                      const resendRes = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          from: 'Karang Taruna Manis Jaya <onboarding@resend.dev>',
                          to: [to],
                          subject: subject || `[Karang Taruna Manis Jaya] Kode Verifikasi: ${code}`,
                          html,
                        }),
                      });
                      if (resendRes.ok) {
                        sent = true;
                        infoMsg = `Email verifikasi berhasil dikirim via Resend ke ${to}`;
                      }
                    } catch (resendErr: any) {
                      console.warn('Resend send notice:', resendErr?.message);
                    }
                  }

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  if (sent) {
                    res.end(
                      JSON.stringify({
                        success: true,
                        delivered: true,
                        message: infoMsg || `Email verifikasi resmi berhasil dikirim ke ${to}`,
                        to,
                        code,
                        sender: smtpUser,
                      })
                    );
                  } else {
                    res.end(
                      JSON.stringify({
                        success: true,
                        delivered: false,
                        aiDispatched: true,
                        reason: lastError ? 'smtp_error' : 'smtp_not_configured',
                        error: lastError || 'Kredensial SMTP pengirim belum dikonfigurasi.',
                        message: lastError
                          ? `Surat verifikasi AI siap dikirim (${lastError})`
                          : `Surat resmi verifikasi AI telah dibuat dan ditujukan ke ${to}.`,
                        to,
                        code,
                        sender: smtpUser || defaultOfficialEmail,
                      })
                    );
                  }
                } catch (e: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
              return;
            }

            next();
          });
        },
        configurePreviewServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.includes('ManisJaya_KarangTaruna_v1.2.0.apk')) {
              res.setHeader('Content-Type', 'application/vnd.android.package-archive');
              res.setHeader('Content-Disposition', 'attachment; filename="ManisJaya_KarangTaruna_v1.2.0.apk"');
            } else if (req.url && req.url.includes('ManisJaya_SourceCode_Mentahan.zip')) {
              res.setHeader('Content-Type', 'application/zip');
              res.setHeader('Content-Disposition', 'attachment; filename="ManisJaya_SourceCode_Mentahan.zip"');
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      allowedHosts: true,
    },
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});
