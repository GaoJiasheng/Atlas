// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

/**
 * `ATLAS_BASE` lets the same build be served from a sub-path (e.g. GitHub Pages)
 * or packaged by Capacitor. Default `/`.
 */
const rawBase = process.env.ATLAS_BASE ?? '/';
const base = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;

/** PWA scope / start_url must carry the base, with a trailing slash. */
const pwaBase = base.endsWith('/') ? base : `${base}/`;

export default defineConfig({
  output: 'static',
  base,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
      // `/` is handled by src/pages/index.astro (honours a saved locale).
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    react(),
    mdx(),
    // Dev server: no service worker (devOptions.enabled is false by default).
    AstroPWA({
      base: pwaBase,
      scope: pwaBase,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        id: pwaBase,
        name: 'Atlas',
        short_name: 'Atlas',
        description:
          'A bilingual (English / 中文) interactive textbook: watch history unfold and take things apart, one scene at a time.',
        lang: 'en',
        start_url: pwaBase,
        scope: pwaBase,
        display: 'standalone',
        // Paper theme: --bg (#f4ecd8) and --ink (#2b2117), see src/theme/tokens.css.
        theme_color: '#f4ecd8',
        background_color: '#f4ecd8',
        // Relative to the manifest, so they follow the base path.
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell: pages, JS, CSS, icons. The big GeoJSON basemaps (/geo) and
        // models (/models) are deliberately NOT precached; they are cached on first use below.
        globPatterns: ['**/*.{html,js,css,svg,png,webmanifest}'],
        globIgnores: ['geo/**', 'models/**'],
        // Deep links carry scene state in the query string (?ch=...&t=...).
        ignoreURLParametersMatching: [/.*/],
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\/geo\/[^/]+\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'atlas-geo',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /\/models\/[^/]+\.glb$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'atlas-models',
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  devToolbar: { enabled: false },
});
