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
      allowedHosts: [
        'karangtaruna.ai.studio',
        'karangtarunamanisjaya.ai.studio',
        '.ai.studio',
        '.run.app',
        '.github.io',
        'localhost',
        '127.0.0.1',
      ],
    },
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: [
        'karangtaruna.ai.studio',
        'karangtarunamanisjaya.ai.studio',
        '.ai.studio',
        '.run.app',
        '.github.io',
        'localhost',
        '127.0.0.1',
      ],
    },
  };
});
