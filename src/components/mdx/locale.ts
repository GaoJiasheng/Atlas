/** Locale of the page an MDX component is rendered into (`/zh/…` -> zh). */
import { DEFAULT_LOCALE, isLocale, localeFromPath, type Locale } from '../../i18n';

export function pageLocale(url: URL, current: string | undefined): Locale {
  return localeFromPath(url.pathname) ?? (isLocale(current) ? current : DEFAULT_LOCALE);
}
