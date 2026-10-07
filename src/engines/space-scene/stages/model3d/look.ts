/**
 * Theme "look" for the WebGL stage: the active theme plus concrete token
 * values (WebGL cannot use CSS variables). Re-read whenever `<html data-theme>`
 * changes.
 */
import { useEffect, useState } from 'react';
import { isTheme, readThemeTokens, type Theme, type ThemeTokens } from '../../../../theme/theme';

export interface StageLook {
  theme: Theme;
  tokens: ThemeTokens;
}

function readLook(): StageLook {
  const raw = document.documentElement.dataset.theme;
  return { theme: isTheme(raw) ? raw : 'paper', tokens: readThemeTokens() };
}

export function useStageLook(): StageLook {
  const [look, setLook] = useState<StageLook>(readLook);
  useEffect(() => {
    const update = () =>
      setLook((prev) => {
        const next = readLook();
        const same =
          prev.theme === next.theme &&
          (Object.keys(next.tokens) as (keyof ThemeTokens)[]).every((k) => prev.tokens[k] === next.tokens[k]);
        return same ? prev : next;
      });
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    update();
    return () => observer.disconnect();
  }, []);
  return look;
}
