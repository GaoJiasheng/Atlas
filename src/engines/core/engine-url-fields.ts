/** Shared URL value codecs: no engine runtime is needed to parse a scene link. */
import type { SimValue, SimValues } from '../space-scene/sim-schema';

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** `cells.3~gap.pencil-lead~x.on`, keys sorted; empty map = ''. */
export function encodeSimParam(values: Readonly<Record<string, SimValue>>): string {
  return Object.keys(values)
    .sort()
    .map((k) => {
      const v = values[k]!;
      return `${k}.${typeof v === 'boolean' ? (v ? 'on' : 'off') : String(v)}`;
    })
    .join('~');
}

/** Inverse of `encodeSimParam`; malformed entries are dropped (the engine checks values against its controls). */
export function decodeSimParam(param: string): SimValues {
  const out: SimValues = {};
  if (!param) return out;
  for (const item of param.split('~')) {
    const dot = item.indexOf('.');
    if (dot <= 0) continue;
    const key = item.slice(0, dot);
    const raw = item.slice(dot + 1);
    if (!ID.test(key)) continue;
    if (raw === 'on' || raw === 'off') out[key] = raw === 'on';
    else if (/^-?\d+(\.\d+)?$/.test(raw)) out[key] = Number(raw);
    else if (ID.test(raw)) out[key] = raw;
  }
  return out;
}

export function validOrbitTime(t: unknown, max = 31557600): t is number {
  return typeof t === 'number' && Number.isFinite(t) && t >= 0 && t <= max;
}

export function decodeOrbitTime(s: string | null, max = 31557600): number | null {
  if (s === null || !/^\d+(?:\.\d{1,6})?$/.test(s)) return null;
  const t = Number(s);
  return validOrbitTime(t, max) ? t : null;
}
