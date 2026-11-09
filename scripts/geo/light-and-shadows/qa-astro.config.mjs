// Same project configuration; writable dependency cache for this isolated worktree.
import config from '../../../astro.config.mjs';
export default {...config, cacheDir: './.astro', vite: {...config.vite, cacheDir: '/private/tmp/atlas-light-materials-vite'}};
