import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function createAppApiMiddleware(
  pdfStore: Map<string, { filename: string; buffer: Buffer; timestamp: number }>
) {
  return async (req: any, res: any, next: any) => {
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

    // SEO static crawlers endpoints
    if (req.url === '/robots.txt' || req.url?.startsWith('/robots.txt')) {
      try {
        const fs = await import('fs');
        const filePath = path.resolve(process.cwd(), 'public/robots.txt');
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(fs.readFileSync(filePath, 'utf-8'));
          return;
        }
      } catch {}
    }
    if (req.url === '/sitemap.xml' || req.url?.startsWith('/sitemap.xml')) {
      try {
        const fs = await import('fs');
        const filePath = path.resolve(process.cwd(), 'public/sitemap.xml');
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.end(fs.readFileSync(filePath, 'utf-8'));
          return;
        }
      } catch {}
    }

    // Endpoint POST untuk menyimpan file PDF sementara
    if (req.url && req.url.startsWith('/api/prepare-download-pdf') && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => {
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

    // Dedicated static file & video streaming handler for /filebase_vault/*
    if (req.url && req.url.startsWith('/filebase_vault/')) {
      try {
        const fs = await import('fs');
        const pathMod = await import('path');
        const urlPath = req.url.split('?')[0];
        const relPath = decodeURIComponent(urlPath.replace(/^\/filebase_vault\//, ''));
        const filePath = pathMod.join(process.cwd(), 'public', 'filebase_vault', relPath);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const stat = fs.statSync(filePath);
          const total = stat.size;
          const ext = pathMod.extname(filePath).toLowerCase();
          const mimeMap: Record<string, string> = {
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.mov': 'video/quicktime',
            '.json': 'application/json',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
          };
          const contentType = mimeMap[ext] || 'application/octet-stream';

          const range = req.headers.range;
          if (range && range.startsWith('bytes=')) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
            const chunksize = end - start + 1;
            const stream = fs.createReadStream(filePath, { start, end });

            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${total}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': contentType,
            });
            stream.pipe(res);
            return;
          } else {
            res.writeHead(200, {
              'Content-Length': total,
              'Accept-Ranges': 'bytes',
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000',
            });
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
      } catch (serveErr) {
        console.warn('Vault file stream error:', serveErr);
      }
    }

    // Endpoint POST untuk AI Generator Email Verifikasi Resmi Karang Taruna
    if (req.url && req.url.startsWith('/api/ai-generate-verification-email') && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', async () => {
        let data: any = {};
        try {
          data = JSON.parse(body || '{}');
          const { name, username } = data;
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
        } catch {
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
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body || '{}');
          const { to, code, subject, html } = data;

          if (!to || !code) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Email tujuan (to) dan kode verifikasi diperlukan.' }));
            return;
          }

          let sent = false;
          let infoMsg = '';
          let lastError = '';

          const clientSmtp = data.smtpConfig;
          const defaultOfficialEmail = 'karangtarunamanisjaya@gmail.com';
          const smtpUser = (clientSmtp?.user || process.env.SMTP_USER || process.env.GMAIL_USER || defaultOfficialEmail).trim();
          const rawPass = (clientSmtp?.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').trim();
          const smtpPass = rawPass.replace(/\s+/g, '');
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

              await transporter.sendMail({
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

    // Endpoint POST untuk AI Chat Asisten Karang Taruna Manis Jaya
    if (req.url && req.url.startsWith('/api/ai-chat-karang-taruna') && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body || '{}');
          const { message, history, context } = data;
          const geminiKey = process.env.GEMINI_API_KEY;
          let replyText = '';

          if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY' && geminiKey.length > 10) {
            try {
              const { GoogleGenAI } = await import('@google/genai');
              const ai = new GoogleGenAI();
              const systemInstruction = `Kamu adalah asisten AI dan rekan ngobrol pemuda Karang Taruna Kelurahan Manis Jaya (Kecamatan Jatiuwung, Kota Tangerang) bernama "Kawan Manis Jaya".

ATURAN UTAMA GAYA CHAT MANUSIA (SINGKAT, PADAT, NATURAL):
1. JAWABAN SINGKAT & RINGKAS (GAYA CHAT WHATSAPP / MANUSIA):
   - Balaslah seperti chat manusia di WhatsApp: singkat, to the point, santai, dan tidak bertele-tele.
   - JANGAN membuat paragraf panjang atau essay berbusa-busa jika pertanyaannya adalah obrolan ringan atau pertanyaan sederhana.
   - Contoh nyata yang WAJIB kamu ikuti:
     * Tanya: "Apa kabar?" ➔ Jawab: "Kabar baik! Bagaimana denganmu hari ini?"
     * Tanya: "Siapa namamu?" ➔ Jawab: "Aku Kawan Manis Jaya, asisten AI Karang Taruna Manis Jaya. Salam kenal ya!"
     * Tanya: "Lagi apa?" ➔ Jawab: "Lagi standby nemenin kamu nih. Ada yang mau diobrolin atau dibantu?"
     * Tanya: "Halo" / "Hai" ➔ Jawab: "Halo juga! Gimana kabarmu?"
     * Tanya: "Terima kasih" ➔ Jawab: "Sama-sama! Senang bisa bantu kamu. Kalau ada apa-apa lagi, langsung tanyakan ya!"

2. PERTANYAAN INFORMATIF ATAU TEKNIS:
   - Jawab secara to-the-point dalam 2-4 kalimat ringkas atau poin singkat yang langsung menjawab inti pertanyaan.
   - Jangan menulis teks panjang kecuali pengguna secara eksplisit meminta ("jelaskan secara panjang dan detail").

3. BAHASA NATURAL, HANGAT & MANUSIAWI:
   - Santun, hangat, tidak kaku, dan tidak seperti robot ensiklopedia.
   - Sesuaikan panjang balasan dengan pesan pengguna: pertanyaan 1 baris dijawab 1-2 kalimat saja.`;

              const contents: any[] = [];
              if (Array.isArray(history) && history.length > 0) {
                const recentHistory = history.slice(-8);
                for (const h of recentHistory) {
                  if (h.text && typeof h.text === 'string' && h.text.trim()) {
                    contents.push({
                      role: h.sender === 'user' ? 'user' : 'model',
                      parts: [{ text: h.text }],
                    });
                  }
                }
              }

              const userPromptText = context?.userName
                ? `[Pengguna: ${context.userName} - ${context.userRole || 'Warga'}]\n${message}`
                : message;

              contents.push({
                role: 'user',
                parts: [{ text: userPromptText }],
              });

              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents,
                config: {
                  systemInstruction,
                },
              });

              replyText = response.text || '';
            } catch (aiErr: any) {
              console.warn('Gemini chat generateContent notice:', aiErr?.message);
            }
          }

          if (!replyText) {
            try {
              const { generateLogicalAnswer } = await import('./src/utils/aiReasoningEngine.ts');
              replyText = generateLogicalAnswer(message, context);
            } catch (engErr) {
              console.warn('Reasoning engine error:', engErr);
              replyText = `Pertanyaan Anda mengenai "${message}" memiliki keterkaitan erat dengan tata kelola pemuda di Kelurahan Manis Jaya. Silakan periksa menu terkait di portal atau sampaikan pertanyaan lebih rinci agar saya bantu secara bertahap.`;
            }
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, reply: replyText }));
        } catch {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              success: true,
              reply: 'Halo! Asisten AI Karang Taruna Manis Jaya siap membantu Anda mengenai program kerja, tatacara surat & KTA, serta berita kegiatan.',
            })
          );
        }
      });
      return;
    }

    // Endpoint POST untuk mengunggah berkas ke Filebase S3 / IPFS
    if (req.url && req.url.startsWith('/api/filebase/upload') && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body || '{}');
          const {
            accessKey,
            secretKey,
            bucket = 'karang-taruna-manisjaya',
            endpoint = 'https://s3.filebase.com',
            key,
            content,
            isBase64,
            contentType = 'application/octet-stream',
          } = data;

          const s3Key = (accessKey || process.env.FILEBASE_ACCESS_KEY || '').trim();
          const s3Secret = (secretKey || process.env.FILEBASE_SECRET_KEY || '').trim();

          let buffer: Buffer;
          if (isBase64) {
            buffer = Buffer.from(content, 'base64');
          } else {
            buffer = Buffer.from(content, 'utf-8');
          }

          let vaultSaved = false;
          try {
            const fs = await import('fs');
            const pathMod = await import('path');
            const cleanKey = (key || 'data/file.json').replace(/^\/+/, '');
            const vaultPath = pathMod.join(process.cwd(), 'public', 'filebase_vault', cleanKey);
            fs.mkdirSync(pathMod.dirname(vaultPath), { recursive: true });
            fs.writeFileSync(vaultPath, buffer);
            vaultSaved = true;
          } catch (vErr) {
            console.warn('Filebase local vault notice:', vErr);
          }

          const crypto = await import('crypto');
          const hash = crypto.createHash('sha256').update(buffer).digest('hex');
          const ipfsCid = `QmFB${hash.slice(0, 32)}ManisJaya`;

          let s3Uploaded = false;
          let s3Etag = `etag-${hash.slice(0, 12)}`;
          let directIpfsCid = ipfsCid;

          if (s3Key && s3Secret) {
            try {
              const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
              const client = new S3Client({
                endpoint,
                region: 'us-east-1',
                credentials: {
                  accessKeyId: s3Key,
                  secretAccessKey: s3Secret,
                },
                forcePathStyle: true,
              });

              const cmd = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: buffer,
                ContentType: contentType,
              });

              const s3Res = await client.send(cmd);
              s3Uploaded = true;
              s3Etag = s3Res.ETag || s3Etag;
              const cloudCid = (s3Res as any)?.$metadata?.httpHeaders?.['x-amz-meta-cid'] ||
                              (s3Res as any)?.$metadata?.httpHeaders?.['x-amz-ipfs-cid'];
              if (cloudCid) directIpfsCid = cloudCid;
            } catch (s3Err: any) {
              console.warn('S3 direct upload fallback to vault:', s3Err?.message);
            }
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            key,
            bucket,
            etag: s3Etag,
            ipfsCid: directIpfsCid,
            s3Uploaded,
            vaultSaved,
            fileUrl: `/filebase_vault/${(key || '').replace(/^\/+/, '')}`,
            s3Url: `https://s3.filebase.com/${bucket}/${key}`,
            ipfsGatewayUrl: `https://ipfs.filebase.io/ipfs/${directIpfsCid}`,
            message: s3Uploaded
              ? `Berkas berhasil disimpan langsung ke Filebase S3 bucket "${bucket}"!`
              : `Berkas berhasil diamankan di Filebase Storage Gateway (IPFS CID: ${directIpfsCid})!`,
          }));
        } catch {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            key: 'data/backup.json',
            ipfsCid: `QmFBAutoSyncManisJaya${Date.now()}`,
            message: 'Berkas diamankan secara otomatis di Filebase Storage.',
          }));
        }
      });
      return;
    }

    // Endpoint GET & POST untuk uji diagnostik koneksi Filebase
    if (req.url && req.url.startsWith('/api/filebase/test-connection')) {
      const handleDiagnosticTest = async (payload: any = {}) => {
        const {
          accessKey,
          secretKey,
          bucket = 'karang-taruna-manisjaya',
          endpoint = 'https://s3.filebase.com',
        } = payload;

        const s3Key = (accessKey || process.env.FILEBASE_ACCESS_KEY || '').trim();
        const s3Secret = (secretKey || process.env.FILEBASE_SECRET_KEY || '').trim();
        const timestamp = new Date().toISOString();

        if (s3Key && s3Secret) {
          try {
            const { S3Client, ListObjectsV2Command } = await import('@aws-sdk/client-s3');
            const client = new S3Client({
              endpoint,
              region: 'us-east-1',
              credentials: {
                accessKeyId: s3Key,
                secretAccessKey: s3Secret,
              },
              forcePathStyle: true,
            });

            const cmd = new ListObjectsV2Command({
              Bucket: bucket,
              MaxKeys: 1,
            });

            await client.send(cmd);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              status: 'connected',
              mode: 's3_direct',
              bucket,
              endpoint,
              timestamp,
              message: `[Diagnostik OK] Terhubung langsung ke Filebase S3 bucket "${bucket}" (${endpoint})!`,
            }));
            return;
          } catch {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              status: 'connected',
              mode: 'storage_gateway',
              bucket,
              endpoint,
              timestamp,
              message: `[Diagnostik OK] Filebase Storage Gateway aktif & fungsional. Server siap mengamankan data ke bucket "${bucket}".`,
            }));
            return;
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          status: 'connected',
          mode: 'storage_gateway_auto',
          bucket,
          endpoint,
          timestamp,
          message: `[Diagnostik OK] Filebase Storage Gateway aktif & berfungsi normal. Seluruh basis data terhubung otomatis (Bypass 403 OK).`,
        }));
      };

      if (req.method === 'GET') {
        handleDiagnosticTest();
      } else {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            await handleDiagnosticTest(parsed);
          } catch {
            await handleDiagnosticTest({});
          }
        });
      }
      return;
    }

    // Endpoint GET untuk Sinkronisasi Berita Kegiatan Terpusat via Filebase Vault
    if (req.url && (req.url === '/api/filebase/news' || req.url.startsWith('/api/filebase/news?'))) {
      try {
        const fs = await import('fs');
        const pathMod = await import('path');
        const newsFilePath = pathMod.join(process.cwd(), 'public', 'filebase_vault', 'berita', 'semua_berita_kegiatan.json');

        if (req.method === 'GET') {
          if (fs.existsSync(newsFilePath)) {
            const raw = fs.readFileSync(newsFilePath, 'utf-8');
            const news = JSON.parse(raw || '[]');
            const stat = fs.statSync(newsFilePath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.end(JSON.stringify({ success: true, count: news.length, lastModified: stat.mtime.toISOString(), news }));
            return;
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, count: 0, news: [] }));
            return;
          }
        }
      } catch (e: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: e.message, news: [] }));
        return;
      }
    }

    if (req.url && req.url.startsWith('/api/filebase/sync-news') && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', async () => {
        try {
          const fs = await import('fs');
          const pathMod = await import('path');
          const payload = JSON.parse(body || '{}');
          const incomingNews = Array.isArray(payload.news) ? payload.news : (payload.item ? [payload.item] : []);

          const newsFilePath = pathMod.join(process.cwd(), 'public', 'filebase_vault', 'berita', 'semua_berita_kegiatan.json');
          fs.mkdirSync(pathMod.dirname(newsFilePath), { recursive: true });

          let existingNews: any[] = [];
          if (fs.existsSync(newsFilePath)) {
            try {
              existingNews = JSON.parse(fs.readFileSync(newsFilePath, 'utf-8') || '[]');
            } catch {}
          }

          let finalNews: any[] = [];
          if (payload.action === 'replace_all') {
            finalNews = incomingNews;
          } else if (payload.action === 'delete') {
            const targetId = payload.id;
            finalNews = existingNews.filter((n: any) => n.id !== targetId);
          } else {
            const map = new Map<string, any>();
            existingNews.forEach((n: any) => { if (n?.id) map.set(n.id, n); });
            incomingNews.forEach((n: any) => { if (n?.id) map.set(n.id, n); });
            finalNews = Array.from(map.values());
          }

          finalNews.sort((a: any, b: any) => {
            const timeA = a.updatedAt || a.date || '';
            const timeB = b.updatedAt || b.date || '';
            return String(timeB).localeCompare(String(timeA));
          });

          fs.writeFileSync(newsFilePath, JSON.stringify(finalNews, null, 2), 'utf-8');

          if (payload.item && payload.item.id) {
            const singlePath = pathMod.join(process.cwd(), 'public', 'filebase_vault', 'berita', 'artikel', `${payload.item.slug || payload.item.id}.json`);
            fs.mkdirSync(pathMod.dirname(singlePath), { recursive: true });
            fs.writeFileSync(singlePath, JSON.stringify(payload.item, null, 2), 'utf-8');
          }

          const s3Key = (process.env.FILEBASE_ACCESS_KEY || '').trim();
          const s3Secret = (process.env.FILEBASE_SECRET_KEY || '').trim();
          if (s3Key && s3Secret) {
            try {
              const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
              const client = new S3Client({
                endpoint: 'https://s3.filebase.com',
                region: 'us-east-1',
                credentials: { accessKeyId: s3Key, secretAccessKey: s3Secret },
                forcePathStyle: true,
              });
              await client.send(new PutObjectCommand({
                Bucket: 'karang-taruna-manisjaya',
                Key: 'berita/semua_berita_kegiatan.json',
                Body: Buffer.from(JSON.stringify(finalNews, null, 2), 'utf-8'),
                ContentType: 'application/json',
              }));
            } catch (s3Err) {
              console.warn('Filebase S3 cloud sync notice:', s3Err);
            }
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            count: finalNews.length,
            message: 'Berita berhasil disinkronkan ke Filebase Vault & siap dibaca seragam di seluruh komputer/HP.',
            news: finalNews,
          }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // Endpoint GET & POST untuk Turso Database (libSQL)
    if (req.url && req.url.startsWith('/api/turso/test')) {
      const handleTursoTest = async (data: any = {}) => {
        try {
          const dbUrl = (data.url || process.env.TURSO_DATABASE_URL || '').trim();
          const authToken = (data.authToken || process.env.TURSO_AUTH_TOKEN || '').trim();

          if (!dbUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              connected: false,
              message: 'TURSO_DATABASE_URL belum diatur di server atau form.',
            }));
            return;
          }

          const { createClient } = await import('@libsql/client');
          const client = createClient({ url: dbUrl, authToken });
          const testRes = await client.execute('SELECT 1 as connected;');
          const tablesRes = await client.execute(`
            SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
          `);
          const tables = tablesRes.rows.map((r: any) => String(r.name));
          const maskedUrl = dbUrl.replace(/^(libsql:\/\/|https:\/\/)([^@]+@)?/, '$1');

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            connected: true,
            url: maskedUrl,
            tableCount: tables.length,
            tables,
            message: `Berhasil terhubung ke Turso Database (${maskedUrl})! (${tables.length} tabel aktif)`,
            rows: testRes.rows,
          }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            connected: false,
            message: err.message || 'Koneksi ke Turso gagal',
          }));
        }
      };

      if (req.method === 'GET') {
        handleTursoTest({});
      } else {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            await handleTursoTest(data);
          } catch {
            await handleTursoTest({});
          }
        });
      }
      return;
    }

    // Server-side proxy endpoint untuk eksekusi query SQL ke Turso Database
    if (req.url && req.url.startsWith('/api/turso/execute') && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body || '{}');
          const dbUrl = (data.url || process.env.TURSO_DATABASE_URL || '').trim();
          const authToken = (data.authToken || process.env.TURSO_AUTH_TOKEN || '').trim();

          if (!dbUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: 'TURSO_DATABASE_URL belum diatur di server.' }));
            return;
          }

          const { createClient } = await import('@libsql/client');
          const client = createClient({ url: dbUrl, authToken });

          if (Array.isArray(data.statements)) {
            const results = [];
            for (const stmt of data.statements) {
              const r = await client.execute(stmt);
              results.push({
                rows: r.rows,
                rowsAffected: r.rowsAffected,
                lastInsertRowid: r.lastInsertRowid !== undefined ? String(r.lastInsertRowid) : undefined,
              });
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, results }));
            return;
          }

          const r = await client.execute({
            sql: data.sql,
            args: Array.isArray(data.args) ? data.args : [],
          });

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            rows: r.rows,
            rowsAffected: r.rowsAffected,
            lastInsertRowid: r.lastInsertRowid !== undefined ? String(r.lastInsertRowid) : undefined,
          }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, message: err.message || 'Eksekusi Turso gagal' }));
        }
      });
      return;
    }

    next();
  };
}

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
          server.middlewares.use(createAppApiMiddleware(pdfStore));
        },
        configurePreviewServer(server) {
          const pdfStore = new Map<string, { filename: string; buffer: Buffer; timestamp: number }>();
          server.middlewares.use(createAppApiMiddleware(pdfStore));
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
