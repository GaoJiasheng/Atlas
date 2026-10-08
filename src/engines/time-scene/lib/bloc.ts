/**
 * Which bloc an entity belongs to at a point in time. `bloc` is either one
 * bloc for the whole story or spans in time order (an entity that changes
 * sides). Pure; numeric time as in lib/time.ts.
 */
import type { Bloc, Entity } from '../schema';
import { toNumber } from './time';

/** Bloc valid at `t`: the span holding `t`; before the first span its bloc, in a gap the span that ended last. */
export function blocAt(entity: Pick<Entity, 'bloc'>, t: number): Bloc {
  const { bloc } = entity;
  if (typeof bloc === 'string') return bloc;
  let current = bloc[0]!.bloc;
  for (const span of bloc) {
    if (toNumber(span.from) <= t) current = span.bloc;
    else break;
  }
  return current;
}

/** The bloc the entity starts in (legend swatch, places without a time). */
export function firstBloc(entity: Pick<Entity, 'bloc'>): Bloc {
  return typeof entity.bloc === 'string' ? entity.bloc : entity.bloc[0]!.bloc;
}

/** Every bloc the entity is in at some point, in order of first appearance. */
export function blocsOf(entity: Pick<Entity, 'bloc'>): Bloc[] {
  if (typeof entity.bloc === 'string') return [entity.bloc];
  return [...new Set(entity.bloc.map((s) => s.bloc))];
}

/** True when the entity changes sides (its colour depends on `t`). */
export function changesBloc(entity: Pick<Entity, 'bloc'>): boolean {
  return blocsOf(entity).length > 1;
}

/** Bloc spans as numbers, `[from, to)`; a plain bloc is one span over all time. */
export function blocSpansN(entity: Pick<Entity, 'bloc'>): { bloc: Bloc; from: number; to: number }[] {
  if (typeof entity.bloc === 'string') return [{ bloc: entity.bloc, from: Number.NEGATIVE_INFINITY, to: Number.POSITIVE_INFINITY }];
  return entity.bloc.map((s) => ({
    bloc: s.bloc,
    from: toNumber(s.from),
    to: s.to !== undefined ? toNumber(s.to) : Number.POSITIVE_INFINITY,
  }));
}

/** Bloc at `t` from pre-computed spans (hot path: map rendering). */
export function blocAtSpans(spans: readonly { bloc: Bloc; from: number }[], t: number): Bloc {
  let current = spans[0]!.bloc;
  for (const span of spans) {
    if (span.from <= t) current = span.bloc;
    else break;
  }
  return current;
}
