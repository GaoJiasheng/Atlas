/**
 * Per-device preferences in localStorage. Only non-critical preferences live
 * here (docs/02 §iPad): theme override, locale. One session-only UI flag
 * (reading panel collapsed) lives in sessionStorage.
 * Scene state never goes here; it lives in the URL.
 *
 * Reads and writes are wrapped in try/catch: storage can be unavailable
 * (private mode, blocked site data) and the app must still work.
 */
import { useCallback, useSyncExternalStore } from 'react';
import { isTheme, type Theme } from '../theme/theme';
import { isLocale, type Locale } from '../i18n';

export const PREF_KEYS = {
  theme: 'atlas:theme',
  locale: 'atlas:locale',
} as const;
export type PrefName = keyof typeof PREF_KEYS;

const CHANGE_EVENT = 'atlas:pref-change';

function readRaw(name: PrefName): string | null {
  try {
    return window.localStorage.getItem(PREF_KEYS[name]);
  } catch {
    return null;
  }
}

function writeRaw(name: PrefName, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(PREF_KEYS[name]);
    else window.localStorage.setItem(PREF_KEYS[name], value);
  } catch {
    /* storage unavailable: keep the in-memory value for this page view */
  }
  memory.set(name, value);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: name }));
}

// Fallback when storage throws, so toggles still work within the page view.
const memory = new Map<PrefName, string | null>();

function read(name: PrefName): string | null {
  const stored = readRaw(name);
  return stored ?? memory.get(name) ?? null;
}

function subscribe(onChange: () => void): () => void {
  const handler = () => onChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler); // other tabs
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

/* ------------------------------------------------------------------ */
/* Typed accessors                                                     */
/* ------------------------------------------------------------------ */

export function getThemeOverride(): Theme | null {
  const v = read('theme');
  return isTheme(v) ? v : null;
}
export function setThemeOverride(theme: Theme | null): void {
  writeRaw('theme', theme);
}

export function getSavedLocale(): Locale | null {
  const v = read('locale');
  return isLocale(v) ? v : null;
}
export function setSavedLocale(locale: Locale): void {
  writeRaw('locale', locale);
}

/* ------------------------------------------------------------------ */
/* React hooks (server snapshot = defaults, so hydration is stable)    */
/* ------------------------------------------------------------------ */

export function useThemeOverride(): [Theme | null, (t: Theme | null) => void] {
  const value = useSyncExternalStore(subscribe, getThemeOverride, () => null);
  return [value, useCallback((t: Theme | null) => setThemeOverride(t), [])];
}

/* ------------------------------------------------------------------ */
/* Session-only UI state (sessionStorage)                              */
/* ------------------------------------------------------------------ */

/** Docked reading panel collapsed / expanded: per tab, never in the URL. */
export const READER_KEY = 'atlas:reader';

/** `true` = expanded (the default, also when storage is unavailable). */
export function getReaderExpanded(): boolean {
  try {
    return window.sessionStorage.getItem(READER_KEY) !== 'collapsed';
  } catch {
    return true;
  }
}
export function setReaderExpanded(expanded: boolean): void {
  try {
    window.sessionStorage.setItem(READER_KEY, expanded ? 'open' : 'collapsed');
  } catch {
    /* storage unavailable: the state lasts for this page view */
  }
}
