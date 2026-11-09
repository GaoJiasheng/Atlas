import {defineConfig}from'vitest/config';
export default defineConfig({cacheDir:'/private/tmp/atlas-muscles-round3-vite',test:{include:['scripts/anatomy/round3/*.test.ts'],environment:'node'}});
