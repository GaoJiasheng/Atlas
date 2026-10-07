/**
 * i18n: locales, typed UI strings (`t`), bilingual content fields (`tx`) and
 * locale-aware paths. Safe for both server and client code.
 */
import en from './ui.en.json';
import zh from './ui.zh.json';

export const LOCALES = ['en', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** BCP 47 tags for `<html lang>`. */
export const HTML_LANG: Record<Locale, string> = { en: 'en', zh: 'zh-Hans' };

export type UiKey = keyof typeof en;

// `satisfies` makes the zh dictionary fail type-checking if a key is missing.
const DICTIONARIES = {
  en,
  zh: zh satisfies Record<UiKey, string>,
} as const satisfies Record<Locale, Record<UiKey, string>>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export type TemplateVars = Record<string, string | number>;

function interpolate(template: string, vars?: TemplateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** UI string for `key` in `locale`, with `{name}` placeholders filled from `vars`. */
export function t(locale: Locale, key: UiKey, vars?: TemplateVars): string {
  const template = DICTIONARIES[locale][key] || DICTIONARIES.en[key];
  return interpolate(template, vars);
}

/** Curried `t` bound to a locale: `const tr = translator('zh'); tr('quiz.heading')`. */
export function translator(locale: Locale): (key: UiKey, vars?: TemplateVars) => string {
  return (key, vars) => t(locale, key, vars);
}

/** A content text field. `zh` may be empty while a topic is drafted. */
export interface BilingualText {
  en: string;
  zh?: string;
}

/**
 * Pick the text for `locale`, falling back to English when the requested
 * language is missing or blank. Plain strings pass through unchanged.
 */
export function tx(field: BilingualText | string | null | undefined, locale: Locale): string {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  const value = field[locale];
  if (typeof value === 'string' && value.trim() !== '') return value;
  return field.en;
}

/** `true` when `tx` would fall back to English for this locale. */
export function isFallback(field: BilingualText, locale: Locale): boolean {
  return locale !== 'en' && !(field[locale] ?? '').trim();
}

/* ------------------------------------------------------------------ */
/* Paths                                                               */
/* ------------------------------------------------------------------ */

/** Normalise a base (`/`, `/atlas`, `/atlas/`) to `''` or `/atlas`. */
export function normalizeBase(base: string): string {
  const trimmed = base.replace(/\/+$/, '');
  if (!trimmed) return '';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** The configured base (from `ATLAS_BASE`) without a trailing slash. */
export function siteBase(): string {
  return normalizeBase(import.meta.env?.BASE_URL ?? "/");
}

/** Prefix an absolute app path (`/en/topics/x/`) with the site base. */
export function withBase(path: string, base: string = siteBase()): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${normalizeBase(base)}${p}`;
}

/** `/en/topics/ww2/` for locale `en` and app path `/topics/ww2/`. */
export function localeHref(locale: Locale, path = '/', base: string = siteBase()): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return withBase(`/${locale}${p}`, base);
}

/** Read the locale segment from a pathname (after the base). */
export function localeFromPath(pathname: string, base: string = siteBase()): Locale | null {
  const b = normalizeBase(base);
  const rest = b && pathname.startsWith(b) ? pathname.slice(b.length) : pathname;
  const seg = rest.split('/')[1];
  return isLocale(seg) ? seg : null;
}

/**
 * Swap the locale segment of `pathname` (which includes the base) for
 * `target`. Paths without a locale segment get one inserted after the base.
 */
export function switchLocalePath(pathname: string, target: Locale, base: string = siteBase()): string {
  const b = normalizeBase(base);
  const rest = b && pathname.startsWith(b) ? pathname.slice(b.length) : pathname;
  const parts = (rest.startsWith('/') ? rest : `/${rest}`).split('/');
  // parts[0] is '' (leading slash)
  if (isLocale(parts[1])) parts[1] = target;
  else parts.splice(1, 0, target);
  const joined = parts.join('/');
  return `${b}${joined === `/${target}` ? `/${target}/` : joined}`;
}
