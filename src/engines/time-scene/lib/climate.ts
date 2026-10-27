/** Monthly climate arrays: shared by build validation and the browser. No dates or interpolation. */
import { z } from 'zod';
import { bilingual, kebabId } from '../../../content/schema/common';
import { sourceId } from '../../../content/schema/sources';

export const monthlyLayerSchema = z
  .object({
    id: kebabId,
    type: z.literal('monthly-climatology'),
    quantity: z.enum(['wind', 'rain']),
    file: kebabId,
    label: bilingual,
    periodId: kebabId,
    sources: z.array(sourceId).min(1),
  })
  .strict();
export type MonthlyLayer = z.infer<typeof monthlyLayerSchema>;
const finite = z.number().finite();
const gridSchema = z
  .object({
    nx: z.number().int().min(2).max(1024),
    ny: z.number().int().min(2).max(1024),
    lon0: finite,
    lat0: finite,
    dlon: finite.positive(),
    dlat: finite.positive(),
    layout: z.literal('south-to-north-row-major'),
  })
  .strict();
const periodSchema = z
  .object({
    id: kebabId,
    startYear: z.number().int(),
    endYear: z.number().int(),
    statistic: z.literal('mean-of-calendar-month-means'),
    yearsExpected: z.number().int().positive(),
  })
  .strict();
const common = {
  schemaVersion: z.literal(1),
  crs: z.literal('EPSG:4326'),
  period: periodSchema,
  grid: gridSchema,
  sources: z.array(sourceId).min(1),
  licenceFamily: z.literal('PD-derived'),
  notes: z.string(),
};
const yearArray = z.array(z.number().int().nonnegative());
const windFrame = z
  .object({
    month: z.number().int().min(1).max(12),
    u: z.array(finite.min(-150).max(150).nullable()),
    v: z.array(finite.min(-150).max(150).nullable()),
    validYears: yearArray,
  })
  .strict();
const rainFrame = z
  .object({
    month: z.number().int().min(1).max(12),
    values: z.array(finite.min(0).max(1000).nullable()),
    validYears: yearArray,
  })
  .strict();
export const climateResourceSchema = z
  .discriminatedUnion('kind', [
    z
      .object({
        ...common,
        kind: z.literal('monthly-wind'),
        pressureHpa: finite.positive().max(1100),
        units: z.literal('m/s'),
        frames: z.array(windFrame).length(12),
      })
      .strict(),
    z
      .object({
        ...common,
        kind: z.literal('monthly-rain'),
        units: z.literal('mm/day'),
        frames: z.array(rainFrame).length(12),
      })
      .strict(),
  ])
  .superRefine((data, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
    const { grid: g, period: p } = data;
    const size = g.nx * g.ny;
    if (size * 12 > 1_000_000) issue(['grid'], 'nx*ny*12 exceeds 1,000,000');
    if (p.startYear > p.endYear || p.yearsExpected !== p.endYear - p.startYear + 1)
      issue(['period', 'yearsExpected'], 'must equal endYear-startYear+1');
    const half = data.kind === 'monthly-rain' ? 0.5 : 0;
    if (g.lon0 - half * g.dlon < -180 || g.lon0 + (g.nx - 1 + half) * g.dlon > 180)
      issue(['grid', 'lon0'], 'longitude extent must lie within -180…180; no dateline wrapping');
    if (g.lat0 - half * g.dlat < -85 || g.lat0 + (g.ny - 1 + half) * g.dlat > 85)
      issue(['grid', 'lat0'], 'latitude extent must lie within -85…85');
    data.frames.forEach((f, monthIndex) => {
      const base = ['frames', monthIndex];
      if (f.month !== monthIndex + 1) issue([...base, 'month'], 'frames must occur exactly once in ascending month order 1…12');
      const arrays = 'u' in f ? { u: f.u, v: f.v, validYears: f.validYears } : { values: f.values, validYears: f.validYears };
      for (const [name, values] of Object.entries(arrays))
        if (values.length !== size) issue([...base, name], `must contain nx*ny (${size}) entries`);
      f.validYears.forEach((years, index) => {
        if (years > p.yearsExpected) issue([...base, 'validYears', index], 'exceeds yearsExpected');
        const value = 'u' in f ? f.u[index] : f.values[index];
        if ('u' in f && (f.u[index] === null) !== (f.v[index] === null)) issue([...base, 'v', index], 'u and v must be null together');
        if (value !== null && years === 0) issue([...base, 'validYears', index], 'non-null values require at least one valid year');
      });
    });
  });
export type ClimateResource = z.infer<typeof climateResourceSchema>;
export type ClimateGrid = ClimateResource['grid'];
export type ClimatePeriod = ClimateResource['period'];
export interface ClimateValidationContext {
  quantity: 'wind' | 'rain';
  periodId: string;
  startYear: number;
  endYear: number;
  sources?: ReadonlySet<string>;
  pressureHpa?: number;
}
export function validateClimateResource(input: unknown, context: ClimateValidationContext): ClimateResource {
  const data = climateResourceSchema.parse(input);
  const errors: z.ZodIssue[] = [];
  const fail = (path: (string | number)[], message: string) => errors.push({ code: z.ZodIssueCode.custom, path, message });
  if (data.kind !== `monthly-${context.quantity}`) fail(['kind'], 'must match layer quantity');
  for (const key of ['startYear', 'endYear'] as const)
    if (data.period[key] !== context[key]) fail(['period', key], 'must match topic climatology');
  if (data.period.id !== context.periodId) fail(['period', 'id'], 'must match topic periodId');
  if (data.kind === 'monthly-wind' && context.pressureHpa !== undefined && data.pressureHpa !== context.pressureHpa)
    fail(['pressureHpa'], `must equal ${context.pressureHpa}`);
  data.sources.forEach((id, i) => {
    if (context.sources && !context.sources.has(id)) fail(['sources', i], `unknown source ${id}`);
  });
  if (errors.length) throw new z.ZodError(errors);
  return data;
}

export interface PackedFrame {
  month: number;
  values: Float64Array;
  v?: Float64Array;
  valid: Uint8Array;
  validYears: Float64Array;
}
export interface ClimateData {
  resource: ClimateResource;
  frames: PackedFrame[];
  /** Immutable native node coordinates, constructed once per parsed resource. */
  nodes: Float64Array;
}
export function packClimate(resource: ClimateResource): ClimateData {
  const g = resource.grid;
  const nodes = new Float64Array(g.nx * g.ny * 2);
  for (let j = 0; j < g.ny; j++)
    for (let i = 0; i < g.nx; i++) {
      const index = 2 * (j * g.nx + i);
      nodes[index] = g.lon0 + i * g.dlon;
      nodes[index + 1] = g.lat0 + j * g.dlat;
    }
  return {
    resource,
    nodes,
    frames: resource.frames.map((f) => {
      const values = 'u' in f ? f.u : f.values;
      return {
        month: f.month,
        values: Float64Array.from(values, (v) => v ?? 0),
        ...('v' in f ? { v: Float64Array.from(f.v, (v) => v ?? 0) } : {}),
        valid: Uint8Array.from(values, (v) => (v === null ? 0 : 1)),
        validYears: Float64Array.from(f.validYears),
      };
    }),
  };
}
export function windVector(u: number, v: number) {
  const s = Math.hypot(u, v);
  const calm = s < 0.2;
  const towards = calm ? null : ((Math.atan2(u, v) * 180) / Math.PI + 360) % 360;
  return {
    u,
    v,
    s,
    towards,
    from: towards === null ? null : (towards + 180) % 360,
    calm,
    length: calm ? 0 : Math.max(8, Math.min(36, 3 * s)),
  };
}
export function rainBin(value: number | null): number | null {
  if (value === null) return null;
  return [1, 2, 4, 8, 16, 32].filter((edge) => value >= edge).length;
}
export interface NativeCell {
  i: number;
  j: number;
  index: number;
  at: [number, number];
}
export function nativeClimateCell(grid: ClimateGrid, lon: number, lat: number, quantity: 'wind' | 'rain'): NativeCell | null {
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  const { nx, ny, lon0, lat0, dlon, dlat } = grid;
  const half = quantity === 'rain' ? 0.5 : 0;
  if (lon < lon0 - half * dlon || lon > lon0 + (nx - 1 + half) * dlon || lat < lat0 - half * dlat || lat > lat0 + (ny - 1 + half) * dlat)
    return null;
  // ceil(x-.5) chooses lower node at a tie; floor(x+.5) chooses east/north rain cell.
  const pick = (x: number, n: number) => Math.max(0, Math.min(n - 1, quantity === 'wind' ? Math.ceil(x - 0.5) : Math.floor(x + 0.5)));
  const i = pick((lon - lon0) / dlon, nx),
    j = pick((lat - lat0) / dlat, ny);
  return { i, j, index: j * nx + i, at: [lon0 + i * dlon, lat0 + j * dlat] };
}
export type ClimateLoadState = { status: 'loading' | 'error'; error?: string } | { status: 'ready'; data: ClimateData };
export function sampleClimateLayer(
  state: ClimateLoadState | undefined,
  quantity: 'wind' | 'rain',
  lon: number,
  lat: number,
  month: number,
) {
  if (!state) return { status: 'absent' as const };
  if (state.status !== 'ready')
    return {
      status: state.status,
      ...(state.status === 'error' ? { error: state.error } : {}),
    };
  const { resource: resource, frames } = state.data;
  const common = {
    month,
    period: resource.period,
    units: resource.units,
    sources: resource.sources,
    ...(resource.kind === 'monthly-wind' ? { pressureHpa: resource.pressureHpa } : {}),
  };
  const native = nativeClimateCell(resource.grid, lon, lat, quantity);
  if (!native) return { ...common, status: 'outside' as const };
  const f = frames[month - 1];
  if (!f)
    return {
      ...common,
      status: 'error' as const,
      error: 'month must be an integer 1…12',
    };
  const validYears = f.validYears[native.index];
  if (!f.valid[native.index])
    return {
      ...common,
      ...native,
      validYears,
      status: 'missing' as const,
      ...(quantity === 'wind' ? { u: null, v: null, s: null, towards: null, from: null } : { rate: null }),
    };
  return {
    ...common,
    ...native,
    validYears,
    status: 'valid' as const,
    ...(quantity === 'wind' ? windVector(f.values[native.index]!, f.v![native.index]!) : { rate: f.values[native.index] }),
  };
}
export function sampleClimate(lon: number, lat: number, month: number, wind?: ClimateLoadState, rain?: ClimateLoadState) {
  return {
    at: [lon, lat] as [number, number],
    month,
    wind: sampleClimateLayer(wind, 'wind', lon, lat, month),
    rain: sampleClimateLayer(rain, 'rain', lon, lat, month),
  };
}
export type ClimateSample = ReturnType<typeof sampleClimate>;
/** Project local east/north via a 10 km endpoint. Map bearing/pitch own the screen direction. */
export function projectWind(lon: number, lat: number, u: number, v: number, project: (at: [number, number]) => { x: number; y: number }) {
  const vector = windVector(u, v),
    start = project([lon, lat]);
  if (vector.calm) return { ...vector, x: start.x, y: start.y, dx: 0, dy: 0 };
  const radians = Math.PI / 180,
    R = 6_371_000;
  const end = project([
    lon + ((u / vector.s) * 10_000) / (R * Math.cos(lat * radians)) / radians,
    lat + ((v / vector.s) * 10_000) / R / radians,
  ]);
  const size = Math.hypot(end.x - start.x, end.y - start.y);
  return {
    ...vector,
    x: start.x,
    y: start.y,
    dx: size ? (end.x - start.x) / size : 0,
    dy: size ? (end.y - start.y) / size : 0,
  };
}
export function windGlyphs(
  data: ClimateData,
  month: number,
  width: number,
  height: number,
  project: (at: [number, number]) => { x: number; y: number },
) {
  const { grid: g } = data.resource,
    f = data.frames[month - 1]!;
  const kept: (ReturnType<typeof projectWind> & { index: number })[] = [];
  for (let j = 0; j < g.ny && kept.length < 300; j++)
    for (let i = 0; i < g.nx && kept.length < 300; i++) {
      const index = j * g.nx + i;
      if (!f.valid[index]) continue;
      const arrow = projectWind(data.nodes[2 * index]!, data.nodes[2 * index + 1]!, f.values[index]!, f.v![index]!, project);
      if (
        arrow.x < 0 ||
        arrow.y < 0 ||
        arrow.x > width ||
        arrow.y > height ||
        kept.some((p) => Math.hypot(p.x - arrow.x, p.y - arrow.y) < 44)
      )
        continue;
      kept.push({ ...arrow, index });
    }
  return kept;
}
