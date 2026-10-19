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

                  // 1. Cek konfigurasi SMTP di process.env
                  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
                  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
                  const smtpHost = process.env.SMTP_HOST;

                  if (smtpUser && smtpPass) {
                    try {
                      const nodemailer = await import('nodemailer');
                      const transporter = nodemailer.createTransport(
                        smtpHost
                          ? {
                              host: smtpHost,
                              port: parseInt(process.env.SMTP_PORT || '587', 10),
                              secure: process.env.SMTP_SECURE === 'true',
                              auth: { user: smtpUser, pass: smtpPass },
                            }
                          : {
                              service: 'gmail',
                              auth: { user: smtpUser, pass: smtpPass },
                            }
                      );

                      await transporter.sendMail({
                        from: `"Karang Taruna Manis Jaya" <${smtpUser}>`,
                        to,
                        subject: subject || `[Karang Taruna Manis Jaya] Kode Verifikasi Pendaftaran: ${code}`,
                        html,
                      });
                      sent = true;
                      infoMsg = `Email verifikasi berhasil dikirim via SMTP ke ${to}`;
                    } catch (smtpErr: any) {
                      console.warn('SMTP transport notice:', smtpErr?.message);
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

                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: true,
                      delivered: sent,
                      message: infoMsg || `Email verifikasi resmi diproses untuk ${to}`,
                      to,
                      code,
                    })
                  );
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
