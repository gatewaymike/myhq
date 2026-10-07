import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const BG = '#020E0A'; // locked app background (R-367)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Installable web app (operations handoff 2026-10-07, M2). vite-plugin-pwa writes the manifest and the
    // service worker from one config, and its precache list is generated from the build, so it cannot drift.
    VitePWA({
      registerType: 'prompt', // a new version waits for a tap on "Reload"; never swaps mid-entry
      injectRegister: false, // registered from src/app/UpdateBar.tsx
      includeManifestIcons: false, // already in the glob below; avoids duplicate precache entries
      manifest: {
        id: '/',
        name: 'MyHQ',
        short_name: 'MyHQ',
        description: 'Log hydrogen water and inhalation sessions in HQ, one public formula for every device.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: BG,
        theme_color: BG,
        lang: 'en',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The app shell: HTML, JS, CSS and icons. The link-preview image is for other sites, not the app.
        globPatterns: ['**/*.{html,js,css,svg,png}'], // the plugin adds the manifest itself
        globIgnores: ['og-image.png'],
        navigateFallback: '/index.html', // matches the vercel.json rewrite
        cleanupOutdatedCaches: true,
        // Supabase (auth and data) matches no rule below, so it always goes to the network.
        // Google Fonts are cached so the installed app looks right offline; the browser still fetches
        // them from Google the first time, which keeps the privacy page's Google Fonts sentence true.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
