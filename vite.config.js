import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Spelling Bee Trainer',
        short_name: 'SpellingBee',
        description: 'Práctica para concurso de deletreo en inglés',
        theme_color: '#ff5405',
        background_color: 'slate-100',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'spelling-bee-s.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'spelling-bee-l.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
