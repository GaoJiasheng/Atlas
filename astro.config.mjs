// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

/**
 * `ATLAS_BASE` lets the same build be served from a sub-path (e.g. GitHub Pages)
 * or packaged by Capacitor. Default `/`.
 */
const rawBase = process.env.ATLAS_BASE ?? '/';
const base = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;

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
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  devToolbar: { enabled: false },
});
