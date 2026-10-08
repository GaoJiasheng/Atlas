/**
 * Theme resolution. Priority (highest first):
 *   1. user override (localStorage `atlas:theme`, set by ThemeToggle)
 *   2. scene theme (URL `theme=` or the current chapter's `state.theme`)
 *   3. topic default (`theme:` in topic.yaml)
 *   4. site default `paper`
 * The same rules run in the pre-paint inline script (BaseLayout.astro).
 */
export const THEMES = ['paper', 'cinema'] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = 'paper';

export function isTheme(value: unknown): value is Theme {
  return value === 'paper' || value === 'cinema';
}

export function resolveTheme(input: {
  override?: Theme | null;
  scene?: Theme | null;
  topic?: Theme | null;
}): Theme {
  return input.override ?? input.scene ?? input.topic ?? DEFAULT_THEME;
}

/** Apply to <html data-theme>. No-op on the server. */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (root.dataset.theme !== theme) root.dataset.theme = theme;
}

/** Token names engines can read. Keep in sync with tokens.css. */
export const TOKEN_NAMES = [
  'paper',
  'panel',
  'ink-2',
  'ink-3',
  'hair',
  'line',
  'cold',
  'hot',
  'loop',
  'neutral',
  'signal',
  'xray',
  'cut',
  'bg',
  'surface',
  'surface-2',
  'ink',
  'ink-muted',
  'border',
  'land',
  'land-edge',
  'water',
  'rivers',
  'accent',
  'accent-axis',
  'accent-allied',
  'accent-neutral',
  'accent-1',
  'accent-2',
  'accent-3',
  'accent-4',
  'glow',
  'glow-blur',
  'glow-strength',
  'stage-bg',
] as const;
export type TokenName = (typeof TOKEN_NAMES)[number];
export type ThemeTokens = Record<TokenName, string>;

/** Read the current token values from computed style (client only). */
export function readThemeTokens(el: Element = document.documentElement): ThemeTokens {
  const style = getComputedStyle(el);
  const out = {} as ThemeTokens;
  for (const name of TOKEN_NAMES) out[name] = style.getPropertyValue(`--${name}`).trim();
  return out;
}

/**
 * Resolve a data colour reference (`token:accent-1` or `#hex`) to a CSS value.
 * With `tokens` it returns the concrete colour (for canvas/WebGL); without, a
 * `var(--x)` expression (for DOM/SVG, follows theme switches automatically).
 */
export function resolveColorRef(ref: string, tokens?: Partial<Record<string, string>>): string {
  if (!ref.startsWith('token:')) return ref;
  const name = ref.slice('token:'.length);
  if (tokens) return tokens[name] ?? '';
  return `var(--${name})`;
}
