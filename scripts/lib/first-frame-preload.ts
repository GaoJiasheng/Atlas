import type { AstroIntegration } from 'astro';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { measureBudgets } from '../js-budget';

/**
 * Preload each SpaceScene page's first-visit modules from its HTML (docs/02 §性能预算): every chunk its first frame
 * imports, statically or chosen by the topic's data (space-scene/first-frame.ts), is requested with the page instead
 * of when the import that needs it is reached, so no chunk waits in a request chain. Runs before the service worker
 * build reads the pages (AstroPWA comes after this integration).
 */
export function firstFramePreload(): AstroIntegration {
  return {
    name: 'atlas-first-frame-preload',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const dist = fileURLToPath(dir);
        for (const page of measureBudgets(dist, undefined, { firstVisit: true })) {
          if (page.engine !== 'space-scene') continue;
          const file = `${dist}/${page.locale}/topics/${page.topic}/index.html`;
          const html = readFileSync(file, 'utf8');
          const base = html.match(/component-url="([^"]*?)_astro\//)?.[1];
          if (base === undefined) throw new Error(`No island script in ${file}`);
          const referenced = new Set([...html.matchAll(/(?:component-url|renderer-url|src|href)="[^"]*?(_astro\/[^"?#]+\.js)/g)].map((m) => m[1]));
          const links = page.files.filter((f) => !referenced.has(f)).map((f) => `<link rel="modulepreload" href="${base}${f}">`).join('');
          writeFileSync(file, html.replace('</head>', `${links}</head>`));
        }
      },
    },
  };
}
