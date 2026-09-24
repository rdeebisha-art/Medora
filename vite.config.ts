<<<<<<< HEAD
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
>>>>>>> b78ae42cdefbc08d5223a7227bcbd464cfc0d3e3

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
<<<<<<< HEAD
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'MEDORA - Rural Health Companion',
        short_name: 'Medora',
        description: 'Offline-first rural healthcare platform.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
=======
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Medora — Rural Health Companion',
        short_name: 'Medora',
        description: 'Offline-first rural healthcare platform.',
        theme_color: '#0ea5e9',
>>>>>>> b78ae42cdefbc08d5223a7227bcbd464cfc0d3e3
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
<<<<<<< HEAD
=======
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
>>>>>>> b78ae42cdefbc08d5223a7227bcbd464cfc0d3e3
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
<<<<<<< HEAD
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: false
  }
});
=======
        maximumFileSizeToCacheInBytes: 5000000
      }
    })
  ],
})
>>>>>>> b78ae42cdefbc08d5223a7227bcbd464cfc0d3e3
