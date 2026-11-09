/**
 * How strongly a map marker is drawn. Outside a beat the map is browsed, so
 * every marker stays legible. A beat is about what it names: unlabelled markers
 * step back so they do not pile up around the one the caption means.
 */
export type MarkerFocus = 'map' | 'beat' | 'named';

export function markerFocus(focus: MarkerFocus, active: boolean, highlighted: boolean): number {
  if (highlighted) return 1;
  if (focus === 'map') return active ? 1 : 0.6;
  if (focus === 'beat') return active ? 1 : 0.3;
  return active ? 0.45 : 0.16;
}
