/** Sandbox-only verification: shared node_modules is read-only. Change only
 * Astro's cache destination in memory; project config/build inputs are intact.
 * NODE_OPTIONS="--import=./scripts/geo/saturn-v/local-astro-cache.mjs" pnpm check
 */
import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(url.endsWith('/astro/dist/cli/flags.js'))return {...result,source:String(result.source).replace('function flagsToAstroInlineConfig(flags) {\n  return {','function flagsToAstroInlineConfig(flags) {\n  return {\n    cacheDir: "/private/tmp/atlas-leftover-polish/astro-cache/",')};
 return result;
}});
