/** Entity / bloc colours as CSS values (DOM widgets follow theme switches via var()). */
import { resolveColorRef } from '../../theme/theme';
import type { Bloc, Entity } from './schema';
import { blocAt, firstBloc } from './lib/bloc';

export const BLOC_CSS: Record<Bloc, string> = {
  axis: 'var(--accent-axis)',
  allied: 'var(--accent-allied)',
  neutral: 'var(--accent-neutral)',
};

/**
 * Colour of an entity: its `color` override, else the colour of its bloc at
 * numeric time `t` (entities can change sides; without `t`, the first bloc).
 */
export function entityCssColor(entity: Entity | undefined, t?: number): string {
  if (!entity) return BLOC_CSS.neutral;
  if (entity.color) return resolveColorRef(entity.color);
  return BLOC_CSS[t === undefined ? firstBloc(entity) : blocAt(entity, t)];
}

/** Key shared by every entity drawn in the same colour at `t` (hatch pattern ids). */
export function colorKey(entity: Entity | undefined, t?: number): string {
  if (!entity) return 'b-neutral';
  if (entity.color) return `e-${entity.id}`;
  return `b-${t === undefined ? firstBloc(entity) : blocAt(entity, t)}`;
}
