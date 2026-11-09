// The worktree shares a read-only node_modules symlink. Keep Vite's transient
// caches inside this worktree's authorized temporary directory for the gates.
import config from '../../../astro.config.mjs';
export default {...config,cacheDir:'/private/tmp/atlas-insects-astro-cache',vite:{...config.vite,cacheDir:'/private/tmp/atlas-insects-vite-cache'}};
