import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { uiWords, type UiGroup } from './ui-groups';

/** SSR keeps complete dictionaries. Browser imports share one source of truth. */
export function uiWordChunks(): Plugin {
  return {
    name: 'atlas-ui-words',
    enforce: 'post',
    transform(_code, id, options) {
      const match = id.match(/\/src\/i18n\/ui\.(?:en|zh)\.json(?:\?(space|time|math|index))?$/);
      if (!match || options?.ssr) return;
      const dictionary = JSON.parse(readFileSync(id.split('?')[0]!, 'utf8')) as Record<string, string>;
      return { code: `export default ${JSON.stringify(uiWords(dictionary, (match[1] ?? 'common') as UiGroup))};`, map: null };
    },
  };
}
