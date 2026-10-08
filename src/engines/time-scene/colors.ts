/** Entity / bloc colours as CSS values (DOM widgets follow theme switches via var()). */
import { resolveColorRef } from '../../theme/theme';
import type { Bloc, Entity } from './schema';
import { blocAt, firstBloc, sideAt, warStatusAt } from './lib/bloc';

export const BLOC_CSS: Record<Bloc, string> = {
  axis: 'var(--accent-axis)',
  allied: 'var(--accent-allied)',
  neutral: 'var(--accent-neutral)',
};

/**
 * Colour of an entity at numeric time `t`: its `color` override, else the colour of its bloc.
 * Not at war at `t` (before `joined`, after `left`) it is `neutral`; entities can change
 * sides. Without `t`: the first bloc (legend swatch).
 */
export function entityCssColor(entity: Entity | undefined, t?: number): string {
  if (!entity) return BLOC_CSS.neutral;
  if (t !== undefined && warStatusAt(entity, t) !== 'at-war') return BLOC_CSS.neutral;
  if (entity.color) return resolveColorRef(entity.color);
  return BLOC_CSS[t === undefined ? firstBloc(entity) : blocAt(entity, t)];
}

/** Colour of the side an entity fights on at `t`, whether or not it is inside its joined / left window (event and movement swatches). */
export function sideCssColor(entity: Entity | undefined, t: number): string {
  if (!entity) return BLOC_CSS.neutral;
  return entity.color ? resolveColorRef(entity.color) : BLOC_CSS[sideAt(entity, t)];
}

/** Key shared by every entity drawn in the same colour at `t` (hatch pattern ids). */
export function colorKey(entity: Entity | undefined, t?: number): string {
  if (!entity) return 'b-neutral';
  if (t !== undefined && warStatusAt(entity, t) !== 'at-war') return 'b-neutral';
  if (entity.color) return `e-${entity.id}`;
  return `b-${t === undefined ? firstBloc(entity) : blocAt(entity, t)}`;
}

/** Same key for the side colour (`sideCssColor`). */
export function sideColorKey(entity: Entity | undefined, t: number): string {
  if (!entity) return 'b-neutral';
  return entity.color ? `e-${entity.id}` : `b-${sideAt(entity, t)}`;
}
