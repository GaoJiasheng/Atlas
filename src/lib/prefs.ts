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

/** Bottom strip folded / expanded: MathScene's three panels, SpaceScene's chapter axis (a hairline when folded). Per tab, never in the URL. */
export const PANELS_KEY = 'atlas:panels';

/** `true` = expanded (the default, also when storage is unavailable). */
export function getPanelsExpanded(): boolean {
  try {
    return window.sessionStorage.getItem(PANELS_KEY) !== 'collapsed';
  } catch {
    return true;
  }
}
export function setPanelsExpanded(expanded: boolean): void {
  try {
    window.sessionStorage.setItem(PANELS_KEY, expanded ? 'open' : 'collapsed');
  } catch {
    /* storage unavailable: the state lasts for this page view */
  }
}

/** Top-right card (part chain / participation card) folded into a side tab / expanded: per tab, never in the URL. */
export const CARD_KEY = 'atlas:card';

/** `true` = expanded (the default, also when storage is unavailable). */
export function getCardExpanded(): boolean {
  try {
    return window.sessionStorage.getItem(CARD_KEY) !== 'collapsed';
  } catch {
    return true;
  }
}
export function setCardExpanded(expanded: boolean): void {
  try {
    window.sessionStorage.setItem(CARD_KEY, expanded ? 'open' : 'collapsed');
  } catch {
    /* storage unavailable: the state lasts for this page view */
  }
}

/** The left column's plate block (SpaceScene: elevation, state rows, selection) folded / expanded: per tab, never in the URL. */
export const PLATE_KEY = 'atlas:plate';

/** `true` = expanded (the default, also when storage is unavailable). */
export function getPlateExpanded(): boolean {
  try {
    return window.sessionStorage.getItem(PLATE_KEY) !== 'collapsed';
  } catch {
    return true;
  }
}
export function setPlateExpanded(expanded: boolean): void {
  try {
    window.sessionStorage.setItem(PLATE_KEY, expanded ? 'open' : 'collapsed');
  } catch {
    /* storage unavailable: the state lasts for this page view */
  }
}

/** Manual HUD choices belong to this tab. Solver defaults are never persisted. */
export const HUD_ROOM_KEY = 'atlas:hud-room';
export const GUIDE_SEEN_KEY = 'atlas:guide-seen';
import { OPEN_FOLDS, type HudOverrides, type HudFolds } from '../engines/core/hud-room';
export interface HudPreferences { manual: HudOverrides; stageOnly: boolean; beforeStage: HudFolds | null }
function validFolds(value: unknown): HudOverrides {
  const out: HudOverrides = {};
  if (!value || typeof value !== 'object') return out;
  for (const key of Object.keys(OPEN_FOLDS) as (keyof HudFolds)[]) {
    const v = (value as Record<string, unknown>)[key];
    if (key === 'leftColumn') {
      if (v === 'open' || v === 'compact' || v === 'collapsed') out.leftColumn = v;
    } else if (typeof v === 'boolean') out[key] = v;
  }
  return out;
}
export function getHudPreferences(): HudPreferences {
  const fallback: HudPreferences = { manual: {}, stageOnly: false, beforeStage: null };
  try {
    const raw = window.sessionStorage.getItem(HUD_ROOM_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { manual: validFolds(parsed.manual), stageOnly: parsed.stageOnly === true,
        beforeStage: parsed.beforeStage ? { ...OPEN_FOLDS, ...validFolds(parsed.beforeStage) } : null };
    }
    // Honour choices made before HUD room, without treating absent keys as overrides.
    for (const [key, field] of [[READER_KEY, 'reader'], [PANELS_KEY, 'panelsOpen'], [CARD_KEY, 'cardOpen'], [PLATE_KEY, 'plateOpen']] as const) {
      const v = window.sessionStorage.getItem(key);
      if (v === 'open' || v === 'collapsed') fallback.manual[field] = v === 'open';
    }
  } catch { /* storage unavailable or malformed */ }
  return fallback;
}
export function setHudPreferences(value: HudPreferences): void {
  try { window.sessionStorage.setItem(HUD_ROOM_KEY, JSON.stringify(value)); } catch { /* page-local state still works */ }
}
/** A successful write is required before auto-opening; private/blocked storage stays quiet. */
export function claimFirstGuide(): boolean {
  try {
    if (window.localStorage.getItem(GUIDE_SEEN_KEY)) return false;
    window.localStorage.setItem(GUIDE_SEEN_KEY, '1');
    return true;
  } catch { return false; }
}
