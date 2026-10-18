/**
 * What a try-it card's controls change (docs/30 F2, F6; pure, unit-tested):
 * which timelines its "Run again" (and key G) plays from the start — the
 * ids the card lists, or for `replay: true` the timeline outputs whose run
 * changes with one of the card's controls (`vary`, `also`): their key
 * differs at another value — and which state outputs the card's controls
 * or the chapter's own settings move (the PLATE block names the first).
 */
import type { SimData, SimTry, SimValues } from '../../sim-schema';
import { evaluateSim, type SimOutputs } from './index';
import { isTimeline } from './timeline';

type Card = Pick<SimTry, 'vary' | 'also' | 'observe' | 'replay'>;

/** Of the outputs `ids`, those whose value (`key`: what to compare) changes when one of the card's controls (and `more`) takes another value. */
export function changedByCard(sim: SimData, values: SimValues, card: Card, ids: readonly string[], key: (v: SimOutputs[string]) => string, more: readonly string[] = []): string[] {
  const read = (v: SimValues) => {
    const out = evaluateSim(sim, v, card.observe);
    return ids.map((id) => key(out[id]!));
  };
  const here = read(values);
  const changed = new Set<string>();
  for (const id of new Set([card.vary, ...(card.also ?? []), ...more])) {
    const c = sim.controls.find((x) => x.id === id);
    if (!c) continue;
    const all = c.kind === 'toggle' ? [false, true] : c.kind === 'step' ? c.values : c.options.map((o) => o.id);
    for (const v of all) {
      if (v === values[id]) continue;
      read({ ...values, [id]: v }).forEach((k, i) => {
        if (k !== here[i]) changed.add(ids[i]!);
      });
    }
  }
  return ids.filter((id) => changed.has(id));
}

export function cardTimelines(sim: SimData, values: SimValues, card: Card): string[] {
  if (!card.replay) return [];
  if (card.replay !== true) return [...card.replay];
  const ids = sim.outputs.filter((o) => o.kind === 'timeline').map((o) => o.id);
  return changedByCard(sim, values, card, ids, (v) => (isTimeline(v) ? v.key : ''));
}

/** The state outputs the card's controls, or the controls the chapter sets (`set`), move (in the outputs' order). */
export function cardStates(sim: SimData, values: SimValues, card: Card, set: Readonly<SimValues> = {}): string[] {
  const ids = sim.outputs.filter((o) => o.kind === 'state').map((o) => o.id);
  return changedByCard(sim, values, card, ids, (v) => String(v), Object.keys(set));
}
