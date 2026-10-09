import type { Locale } from '../core/types';
import { switchLocalePath, t } from '../../i18n';
import { setSavedLocale } from '../../lib/prefs';
import { flushUrlSync } from '../core/url-state';
import { Dropdown, type DropdownItem } from './Dropdown';

export interface LangToggleProps {
  locale: Locale;
  /** Current pathname (incl. base) for the server-rendered hrefs. */
  path: string;
  variant?: 'site' | 'hud';
}

const LOCALE_ORDER: readonly Locale[] = ['en', 'zh'];

/**
 * "EN ▾" / "中文 ▾" menu listing English and 中文. Switching keeps the path,
 * query string (scene state) and hash; the items are real links.
 */
export function LangToggle({ locale, path, variant = 'site' }: LangToggleProps) {
  const items: DropdownItem[] = LOCALE_ORDER.map((l) => ({
    id: l,
    label: t(locale, l === 'en' ? 'lang.name.en' : 'lang.name.zh'),
    href: switchLocalePath(path, l),
    lang: l === 'zh' ? 'zh-Hans' : 'en',
  }));

  return (
    <Dropdown
      variant={variant}
      label={t(locale, 'lang.label')}
      text={t(locale, 'lang.short')}
      items={items}
      selectedId={locale}
      onPick={(item, event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        if (item.id === locale) return;
        flushUrlSync();
        setSavedLocale(item.id as Locale);
        const { pathname, search, hash } = window.location;
        window.location.assign(`${switchLocalePath(pathname, item.id as Locale)}${search}${hash}`);
      }}
    />
  );
}
