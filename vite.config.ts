import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { version } from './package.json';

const oneYearInSeconds = 60 * 60 * 24 * 365;
const workerVersionFile = `sw-version-${version}.js`;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'conjugo-worker-version',
      apply: 'build',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: workerVersionFile,
          source: `self.addEventListener('message', (event) => {
  if (event.data?.type === 'CONJUGO_GET_VERSION') {
    event.source?.postMessage({ type: 'CONJUGO_VERSION', version: ${JSON.stringify(version)} });
  }
});\n`,
        });
      },
    },
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'conjugo-logo.webp'],
      manifest: {
        name: 'ConjuGO Verb Trainer',
        short_name: 'ConjuGO',
        description: 'Practice English, French, Spanish, and Italian verb conjugations.',
        theme_color: '#f4f1e8',
        background_color: '#f4f1e8',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        clientsClaim: true,
        importScripts: [workerVersionFile],
        navigateFallback: null,
        globPatterns: ['**/*.{js,css,html,png,webp,svg,ico}'],
        globIgnores: ['**/quiz-*.js', 'sw-version-*.js'],
        // Keep the offline shell under a separate URL so precaching does not intercept online navigations.
        manifestTransforms: [
          (entries) => ({
            manifest: entries.map((entry) => entry.url === 'index.html' ? { ...entry, url: 'index.html?offline' } : entry),
            warnings: [],
          }),
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request, sameOrigin }) => sameOrigin && request.mode === 'navigate',
            handler: 'NetworkOnly',
            options: {
              precacheFallback: { fallbackURL: 'index.html?offline' },
            },
          },
          {
            urlPattern: /\/assets\/quiz-[\w-]+\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'conjugo-quiz-questions',
              expiration: { maxEntries: 4 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 30, maxAgeSeconds: oneYearInSeconds },
            },
          },
        ],
      },
    }),
  ],
});
