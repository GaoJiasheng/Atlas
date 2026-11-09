/**
 * i18n: locales, typed UI strings (`t`), bilingual content fields (`tx`) and
 * locale-aware paths. Safe for both server and client code.
 */
import en from './ui.en.json';
import zh from './ui.zh.json';
import { createUiLoader } from './ui-loader';
import { uiGroup, type UiGroup } from './ui-groups';

export const LOCALES = ['en', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** BCP 47 tags for `<html lang>`. */
export const HTML_LANG: Record<Locale, string> = { en: 'en', zh: 'zh-Hans' };

export type UiKey = keyof typeof en;

// `satisfies` makes the zh dictionary fail type-checking if a key is missing.
const DICTIONARIES = import.meta.env?.SSR !== false ? {
  en,
  zh: zh satisfies Record<UiKey, string>,
} as const satisfies Record<Locale, Record<UiKey, string>> : null;

// The eager dictionaries above are server-only and disappear from browser chunks.
// React's host Suspense boundary retains the translated static HTML during hydration.
const ui = createUiLoader<Locale, Partial<Record<UiKey, string>>>({
  en: () => import('./ui.en.json').then(m => m.default),
  zh: () => import('./ui.zh.json').then(m => m.default),
});
type FeatureGroup = Exclude<UiGroup, 'common'>;
const features = createUiLoader<`${Locale}:${FeatureGroup}`, Partial<Record<UiKey, string>>>({
  'en:space': () => import('./ui.en.json?space').then(m => m.default),
  'zh:space': () => import('./ui.zh.json?space').then(m => m.default),
  'en:time': () => import('./ui.en.json?time').then(m => m.default),
  'zh:time': () => import('./ui.zh.json?time').then(m => m.default),
  'en:math': () => import('./ui.en.json?math').then(m => m.default),
  'zh:math': () => import('./ui.zh.json?math').then(m => m.default),
  'en:index': () => import('./ui.en.json?index').then(m => m.default),
  'zh:index': () => import('./ui.zh.json?index').then(m => m.default),
});

export const loadUi = ui.load;
async function prepareWords(group: UiGroup): Promise<void> {
  await Promise.all(LOCALES.flatMap(locale => [ui.load(locale), ...(group === 'common' ? [] : [features.load(`${locale}:${group}`)])]));
}
const sceneWords = createUiLoader({
  common: () => prepareWords('common'),
  space: () => prepareWords('space'),
  time: () => prepareWords('time'),
  math: () => prepareWords('math'),
});
const sceneGroup = (engine: string): Exclude<UiGroup, 'index'> => engine === 'space-scene' ? 'space' : engine === 'time-scene' ? 'time' : engine === 'math-scene' ? 'math' : 'common';
export const loadSceneUi = (engine: string) => sceneWords.load(sceneGroup(engine));
/** The existing plates show bilingual captions, including inside effects and callbacks.
 * Resolve their dictionaries before mounting any engine, where Suspense cannot catch them.
 */
export function readSceneUi(engine: string): void {
  if (DICTIONARIES) return;
  sceneWords.read(sceneGroup(engine));
}

export function readUi(locale: Locale): Partial<Record<UiKey, string>> {
  return DICTIONARIES?.[locale] ?? ui.read(locale);
}

function wordsFor(locale: Locale, key: UiKey): Partial<Record<UiKey, string>> {
  if (DICTIONARIES) return DICTIONARIES[locale];
  const group = uiGroup(key);
  return group === 'common' ? readUi(locale) : features.read(`${locale}:${group}`);
}

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
  const template = wordsFor(locale, key)[key] || wordsFor('en', key)[key]!;
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
