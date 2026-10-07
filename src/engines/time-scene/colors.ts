/** Entity / bloc colours as CSS values (DOM widgets follow theme switches via var()). */
import { resolveColorRef } from '../../theme/theme';
import type { Bloc, Entity } from './schema';

export const BLOC_CSS: Record<Bloc, string> = {
  axis: 'var(--accent-axis)',
  allied: 'var(--accent-allied)',
  neutral: 'var(--accent-neutral)',
};

export function entityCssColor(entity: Entity | undefined): string {
  if (!entity) return BLOC_CSS.neutral;
  return entity.color ? resolveColorRef(entity.color) : BLOC_CSS[entity.bloc];
}
