import type { MouseEvent } from 'react';
import type { Locale } from '../core/types';
import { switchLocalePath, t } from '../../i18n';
import { setSavedLocale } from '../../lib/prefs';
import { flushUrlSync } from '../core/url-state';

export interface LangToggleProps {
  locale: Locale;
  /** Current pathname (incl. base) for the server-rendered href. */
  path: string;
}

/**
 * Switch EN <-> 中文 on the same page, keeping the query string (scene state)
 * and hash. Works as a plain link without JS.
 */
export function LangToggle({ locale, path }: LangToggleProps) {
  const target: Locale = locale === 'en' ? 'zh' : 'en';

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    flushUrlSync();
    setSavedLocale(target);
    const { pathname, search, hash } = window.location;
    window.location.assign(`${switchLocalePath(pathname, target)}${search}${hash}`);
  };

  return (
    <a
      className="atlas-control"
      href={switchLocalePath(path, target)}
      hrefLang={target === 'zh' ? 'zh-Hans' : 'en'}
      lang={target === 'zh' ? 'zh-Hans' : 'en'}
      aria-label={t(locale, 'lang.switchToLabel')}
      onClick={onClick}
    >
      {t(locale, 'lang.switchTo')}
    </a>
  );
}
