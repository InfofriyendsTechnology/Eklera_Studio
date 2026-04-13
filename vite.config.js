import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'favicon-64.png', 'favicon.svg'],
      manifest: {
        name: 'Eklera Studio',
        short_name: 'Eklera',
        description: 'Smart embroidery repeat calculator — Perfect fit, every time',
        theme_color: '#e91e84',
        background_color: '#141022',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          { src: '/favicon-64.png',        sizes: '64x64',   type: 'image/png' },
          { src: '/icon-192.png',           sizes: '192x192', type: 'image/png', purpose: 'any'      },
          { src: '/icon-192-maskable.png',  sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-512.png',           sizes: '512x512', type: 'image/png', purpose: 'any'      },
          { src: '/icon-512-maskable.png',  sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion'))           return 'motion';
            if (id.includes('react-icons'))             return 'icons';
            if (id.includes('@reduxjs') || id.includes('react-redux')) return 'redux';
            if (id.includes('react-router'))            return 'router';
            if (id.includes('react-dom') || id.includes('react/')) return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
