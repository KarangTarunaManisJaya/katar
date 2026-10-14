import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const port = parseInt(process.env.PORT || '3000', 10);
  // Auto-detect GitHub Pages deployment under /katar/ repository
  const isGitHub = process.env.GITHUB_ACTIONS === 'true' || process.env.GITHUB_PAGES === 'true';
  const base = process.env.VITE_BASE || (isGitHub ? '/katar/' : './');

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
                res.setHeader('Cache-Control', 'no-cache');
                res.end(item.buffer);
                return;
              }
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
