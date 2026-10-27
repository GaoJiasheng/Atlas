/** Idealised Sun–Earth–Moon author contract (docs/44 §4). No ephemeris. */
import { z } from 'zod';
import { bilingual, kebabId } from '../../content/schema/common';
import { sourceId } from '../../content/schema/sources';
import type { SimControl, SimData } from './sim-schema';
import { ORBIT_LABS, ORBIT_BODIES, ORBIT_INPUTS, ORBIT_STEPS, ORBIT_STATES, orbitQuantity } from './lib/sim/orbit-constants';
export { ORBIT_LABS, ORBIT_BODIES, ORBIT_INPUTS, ORBIT_STEPS, ORBIT_STATES, orbitQuantity } from './lib/sim/orbit-constants';
const pos = z.number().finite().positive();
const finite = z.number().finite();
const vec = z.tuple([finite, finite, finite]);
export const bodyTransformSchema = z
  .object({
    body: z.enum(ORBIT_BODIES),
    attachment: z.enum(['centre', 'surface']),
    localDirection: vec.optional(),
    surfaceFactor: pos.max(1.1).optional(),
    scaleWithRadius: z.boolean().default(true),
    /** Optional anchor in the attachment’s local coordinates, scaled with its geometry. */
    labelPoint: vec.optional(),
  })
  .strict();
export const solarIlluminationSchema = z
  .object({
    body: z.enum(['earth', 'moon']),
    darkFill: finite.min(0).max(0.05).default(0.035),
  })
  .strict();
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const solarRowSchema = z
  .object({
    date: z.string(),
    sunrise_sgt: hhmm,
    solar_noon_sgt: hhmm,
    sunset_sgt: hhmm,
    daylight_minutes: finite.min(720).max(735),
    sunrise_azimuth_deg: finite.min(0).max(360),
    sunset_azimuth_deg: finite.min(0).max(360),
  })
  .strict();
export const solarTableSchema = z
  .object({
    meta: z
      .object({
        kind: z.string(),
        licence: z.string(),
        lat_deg_north: finite,
        lon_deg_east: finite,
        height_m: z.literal(0),
        timezone: z.literal('Asia/Singapore; UTC+08:00; no DST'),
        horizon: z.literal('unobstructed, sea-level astronomical horizon'),
        threshold_solar_centre_deg: finite,
        method: z.string(),
        source: z.string(),
        precision: z.string(),
      })
      .strict(),
    summary: z.record(solarRowSchema),
    days: z.array(solarRowSchema).length(365),
  })
  .strict();
export type SolarTable = z.output<typeof solarTableSchema>;
const byLab = z
  .object(Object.fromEntries(ORBIT_LABS.map((k) => [k, finite.min(0).max(31557600)])) as Record<(typeof ORBIT_LABS)[number], typeof finite>)
  .strict();
export const orbitRotationSchema = z
  .object({
    version: z.literal(1),
    model: z.literal('idealised-circular'),
    units: z.literal('km-s-deg'),
    frame: z.literal('atlas-ecliptic-y-up'),
    bodies: z.tuple([
      z.object({ id: z.literal('sun'), parent: z.null(), radiusKm: pos }).strict(),
      z
        .object({
          id: z.literal('earth'),
          parent: z.literal('sun'),
          radiusKm: pos,
        })
        .strict(),
      z
        .object({
          id: z.literal('moon'),
          parent: z.literal('earth'),
          radiusKm: pos,
        })
        .strict(),
    ]),
    orbit: z.object({ earthRadiusKm: pos, moonReferenceKm: pos }).strict(),
    periods: z.object({ yearSeconds: pos, spinSeconds: pos, moonSeconds: pos }).strict(),
    controls: z.object(Object.fromEntries(ORBIT_INPUTS.map((k) => [k, kebabId])) as Record<(typeof ORBIT_INPUTS)[number], typeof kebabId>).strict(),
    clock: z
      .object({
        seed: kebabId,
        maxSeconds: pos.max(31557600),
        rateByLab: byLab,
      })
      .strict(),
    display: z
      .object({
        scale: kebabId,
        trueScaleMPerKm: pos,
        schematic: z
          .object({
            earthOrbitM: pos,
            moonOrbitM: pos,
            sunRadiusM: pos,
            earthRadiusM: pos,
            moonRadiusM: pos,
          })
          .strict(),
      })
      .strict(),
    solarYear: z
      .object({
        file: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/, 'use a local data/*.json filename without path, protocol or query'),
        control: kebabId,
        year: z.literal(2026),
        lat: z.literal(1.3342),
        lon: z.literal(103.7357),
        zoneHours: z.literal(8),
        thresholdDeg: z.literal(-0.833),
        source: sourceId,
        table: solarTableSchema.optional(),
      })
      .strict(),
    panel: z
      .object({
        byLab: z
          .object({
            moon: z.literal('phase'),
            eclipse: z.literal('apparent-discs'),
            'local-year': z.literal('solar-year'),
          })
          .strict(),
        north: z.literal('earth-axis'),
        shadowNote: bilingual.optional(),
      })
      .strict(),
    sources: z.array(sourceId).min(1),
  })
  .strict();
export type OrbitRotation = z.output<typeof orbitRotationSchema>;
type Issue = { path: (string | number)[]; message: string };
export function orbitIssues(sim: SimData, controls: ReadonlyMap<string, SimControl>): Issue[] {
  const c = sim.orbitRotation;
  if (!c)
    return [
      {
        path: ['orbitRotation'],
        message: 'an orbit-rotation sim needs orbitRotation',
      },
    ];
  const issues: Issue[] = [];
  const err = (path: (string | number)[], message: string) => issues.push({ path: ['outputs', 'bind', 'overlays'].includes(String(path[0])) ? path : ['orbitRotation', ...path], message });
  if (sim.kind !== 'orbit-rotation') err([], 'orbitRotation belongs to orbit-rotation');
  for (const k of ['circuit', 'magnet', 'force', 'energy', 'lifeCycle', 'matter', 'light', 'materials', 'sort', 'table', 'seeds', 'senses'] as const)
    if (sim[k]) err([], `orbit-rotation cannot also configure ${k}`);
  if (new Set(Object.values(c.controls)).size !== 13 || controls.size !== 13) err(['controls'], 'give thirteen distinct one-to-one controls');
  for (const key of ORBIT_INPUTS) {
    const id = c.controls[key],
      ctl = controls.get(id);
    if (!ctl) {
      err(['controls', key], `unknown control ${id}`);
      continue;
    }
    if (key === 'synchronous') {
      if (ctl.kind !== 'toggle') err(['controls', key], 'needs a toggle');
    } else if (key === 'lab' || key === 'scale-mode') {
      const expected = key === 'lab' ? [...ORBIT_LABS] : ['true-scale', 'schematic'];
      if (ctl.kind !== 'choice' || ctl.options.map((o) => o.id).join('|') !== expected.join('|'))
        err(['controls', key], `needs choice options ${expected.join(', ')}`);
    } else if (ctl.kind !== 'step' || ctl.values.join('|') !== ORBIT_STEPS[key]!.join('|'))
      err(['controls', key], `needs the ordered ${key} values from docs/44 §4.2`);
  }
  if (!c.sources.includes('S33') || !c.sources.includes('S36')) err(['sources'], 'include the computed source S33 and design study S36');
  if (c.solarYear.source !== 'S33') err(['solarYear', 'source'], 'the computed table source must be S33');
  if (c.clock.maxSeconds < 31557600) err(['clock', 'maxSeconds'], 'must cover every elapsed seed, through 31557600 seconds');
  if (c.clock.seed !== c.controls.elapsed) err(['clock', 'seed'], 'must map elapsed');
  if (c.display.scale !== c.controls['scale-mode']) err(['display', 'scale'], 'must map scale-mode');
  if (c.solarYear.control !== c.controls['day-index']) err(['solarYear', 'control'], 'must map day-index');
  if (c.clock.rateByLab.eclipse !== 0 || c.clock.rateByLab['local-year'] !== 0) err(['clock', 'rateByLab'], 'static comparison rates must be zero');
  const [s, e, m] = c.bodies,
    ranges = controls.get(c.controls['moon-range']);
  if (c.orbit.earthRadiusKm <= s.radiusKm + e.radiusKm) err(['orbit', 'earthRadiusKm'], 'Sun and Earth intersect');
  for (const r of ranges?.kind === 'step' ? ranges.values : [c.orbit.moonReferenceKm]) {
    if (r <= e.radiusKm + m.radiusKm || c.orbit.earthRadiusKm - r <= s.radiusKm + m.radiusKm)
      err(['orbit', 'moonReferenceKm'], 'bodies must not intersect at any selectable distance');
    const tip = (e.radiusKm * c.orbit.earthRadiusKm) / (s.radiusKm - e.radiusKm);
    if (s.radiusKm <= e.radiusKm || Math.abs(tip - r) <= m.radiusKm) err(['orbit'], 'Moon must remain more than its radius from the shadow cone tip');
  }
  if (new Set(sim.outputs.map((o) => o.from ?? o.id)).size !== 23) err(['outputs'], 'declare every orbit quantity once');
  if (sim.outputs.length !== 23) err([], 'declare exactly 23 orbit outputs');
  for (const [i, o] of sim.outputs.entries()) {
    const from = o.from ?? o.id;
    const expectedUnit =
      from === 'geometric-daylight-hours' || ['local-sunrise', 'local-noon', 'local-sunset'].includes(from)
        ? 'h'
        : from.endsWith('-deg')
          ? 'deg'
          : from.endsWith('-km')
            ? 'km'
            : from === 'moon-lit-percent'
              ? '%'
              : from === 'local-daylight-minutes'
                ? 'min'
                : undefined;
    if (expectedUnit && o.unit !== expectedUnit) err(['outputs', i, 'unit'], `expected ${expectedUnit}`);
    if (from === 'solar-visible' && o.unit) err(['outputs', i, 'unit'], 'solar-visible has no unit');
    if (!orbitQuantity(from)) err(['outputs', i, 'from'], `unknown orbit quantity ${from}`);
    if (o.kind !== orbitQuantity(from)) err(['outputs', i, 'kind'], `wrong kind for ${from}`);
    if (o.kind === 'state')
      for (const st of Object.keys(o.states ?? {})) if (!ORBIT_STATES[from]?.includes(st)) err(['outputs', i, 'states', st], 'unknown orbit state');
  }
  const writers = new Set<string>();
  const illuminated = new Set<string>();
  for (const [i, b] of sim.bind.entries())
    if ('part' in b) {
      const ids = Array.isArray(b.part) ? b.part : [b.part];
      if (b.bodyTransform) {
        const bt = b.bodyTransform;
        if (b.output !== sim.outputs.find((o) => (o.from ?? o.id) === 'body-frame')?.id) err(['bind', i, 'output'], 'bodyTransform requires body-frame');
        if (bt.attachment === 'surface' && (!bt.localDirection || Math.hypot(...bt.localDirection) < 1e-9))
          err(['bind', i, 'bodyTransform', 'localDirection'], 'surface requires a non-zero localDirection');
        if (bt.attachment === 'centre' && (bt.localDirection || bt.surfaceFactor !== undefined))
          err(['bind', i, 'bodyTransform'], 'centre forbids localDirection / surfaceFactor');
        if (bt.body === 'observer' && bt.attachment !== 'centre') err(['bind', i, 'bodyTransform'], 'observer uses centre');
        for (const id of ids) {
          if (writers.has(id)) err(['bind', i, 'bodyTransform'], `duplicate transform writer for ${id}`);
          writers.add(id);
        }
      }
      if (b.solarIllumination) {
        for (const id of ids) {
          if (illuminated.has(id)) err(['bind', i, 'solarIllumination'], 'duplicate illumination writer');
          illuminated.add(id);
          const bt = sim.bind.find((x) => 'part' in x && (Array.isArray(x.part) ? x.part.includes(id) : x.part === id) && x.bodyTransform);
          if (!bt || !('part' in bt) || bt.bodyTransform?.body !== b.solarIllumination.body)
            err(['bind', i, 'solarIllumination'], 'illumination must belong to the matching bodyTransform body');
        }
      }
      if (b.solarIllumination && b.output !== sim.outputs.find((o) => (o.from ?? o.id) === 'solar-directions')?.id)
        err(['bind', i, 'output'], 'solarIllumination requires solar-directions');
    }
  for (const [i, o] of sim.overlays.entries())
    if (o.kind === 'orbit-guides') {
      const ids = Object.values(o.parts);
      if (new Set(ids).size !== 6) err(['overlays', i, 'parts'], 'guide references must be distinct');
      for (const id of ids) {
        if (writers.has(id)) err(['overlays', i, 'parts'], `duplicate transform writer for ${id}`);
        writers.add(id);
      }
    }
  for (const [i, b] of sim.bind.entries())
    if ('part' in b && [b.offset, b.rotate, b.shift, b.place, b.pose, b.at, b.play, b.stretch, b.bend].some(Boolean))
      for (const id of Array.isArray(b.part) ? b.part : [b.part]) if (writers.has(id)) err(['bind', i], `${id}: conflicting transform writer`);
  return issues;
}
/** The table is linked once at build time, never fetched by the orbit runtime. */
export function linkOrbitTable(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const data = raw as Record<string, any>;
  const cfg = data.parts?.sim?.orbitRotation;
  if (!cfg) return raw;
  const key = typeof cfg.solarYear?.file === 'string' ? cfg.solarYear.file.replace(/\.json$/, '') : '';
  if (!key || !(key in data)) return raw;
  const out: Record<string, any> = {
    ...data,
    parts: {
      ...data.parts,
      sim: {
        ...data.parts.sim,
        orbitRotation: {
          ...cfg,
          solarYear: { ...cfg.solarYear, table: data[key] },
        },
      },
    },
  };
  delete out[key];
  return out;
}
export function orbitTableIssues(c: OrbitRotation): Issue[] {
  const out: Issue[] = [];
  const err = (path: (string | number)[], message: string) => out.push({ path: ['orbitRotation', 'solarYear', ...path], message });
  const t = c.solarYear.table;
  if (!t) {
    err(['file'], 'missing local solar year table');
    return out;
  }
  if (t.meta.lat_deg_north !== c.solarYear.lat || t.meta.lon_deg_east !== c.solarYear.lon || t.meta.threshold_solar_centre_deg !== c.solarYear.thresholdDeg)
    err(['table', 'meta'], 'table coordinates / horizon threshold must match configuration');
  t.days.forEach((r, i) => {
    const expected = new Date(Date.UTC(c.solarYear.year, 0, i + 1)).toISOString().slice(0, 10);
    if (r.date !== expected) err(['table', 'days', i, 'date'], `expected unique consecutive date ${expected}`);
    if (!(r.sunrise_sgt < r.solar_noon_sgt && r.solar_noon_sgt < r.sunset_sgt)) err(['table', 'days', i], 'sunrise < noon < sunset required');
  });
  return out;
}
