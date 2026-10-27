/** Strict author contract and cross checks for docs/45 E-AF1–4. */
import { z } from 'zod';
import { kebabId } from '../../content/schema/common';
import type { PartsFile } from './schema';
import type { SimData } from './sim-schema';
import { airfoilOutline } from './lib/sim/airfoil-field';
const finite = z.number().finite();
export const airfoilSchema = z
  .object({
    model: z.literal('joukowski-illustrative-v1'),
    angle: kebabId,
    speed: kebabId,
    atmosphere: z.discriminatedUnion('kind', [
      z
        .object({
          kind: z.literal('constant'),
          density: finite.positive().max(2),
        })
        .strict(),
      z
        .object({ kind: z.literal('nasa-troposphere'), altitude: kebabId })
        .strict(),
    ]),
    profile: z.object({ epsilon: z.literal(0.08) }).strict(),
    chord: finite.min(0.05).max(5),
    area: finite.min(0.01).max(20),
    section: z
      .object({ part: kebabId, origin: z.tuple([finite, finite, finite]) })
      .strict(),
    stall: z
      .object({
        tag: z.literal('illustrative'),
        peakDeg: z.literal(12),
        knots: z.tuple([
          z.tuple([z.literal(12), z.literal(1)]),
          z.tuple([z.literal(16), z.literal(0.85)]),
          z.tuple([z.literal(20), z.literal(0.6)]),
        ]),
        source: z.string().min(1),
      })
      .strict(),
    sources: z.array(z.string().min(1)).min(1),
    plot: z.object({ y: kebabId }).strict(),
  })
  .strict();
export type AirfoilData = z.output<typeof airfoilSchema>;
export interface AirfoilIssue {
  path: (string | number)[];
  message: string;
}
export function airfoilIssues(sim: SimData): AirfoilIssue[] {
  const out: AirfoilIssue[] = [],
    issue = (path: AirfoilIssue['path'], message: string) =>
      out.push({ path, message }),
    d = sim.airfoil;
  if ((sim.kind === 'airfoil') !== !!d)
    issue(['airfoil'], 'kind airfoil and airfoil data must be paired');
  if (!d) return out;
  const ids = [
    d.angle,
    d.speed,
    ...(d.atmosphere.kind === 'nasa-troposphere'
      ? [d.atmosphere.altitude]
      : []),
  ];
  if (new Set(ids).size !== ids.length)
    issue(['airfoil'], 'physical controls must be distinct');
  ids.forEach((id, i) => {
    const c = sim.controls.find((c) => c.id === id),
      limits = [
        [-20, 20],
        [0, 60],
        [0, 10000],
      ][i]!;
    if (c?.kind !== 'step')
      issue(
        ['airfoil', i === 0 ? 'angle' : i === 1 ? 'speed' : 'atmosphere'],
        'expected a step control',
      );
    else if (
      c.values.some(
        (v) => !Number.isFinite(v) || v < limits[0]! || v > limits[1]!,
      )
    )
      issue(
        ['controls', sim.controls.indexOf(c), 'values'],
        `airfoil values must be finite in ${limits.join('…')}`,
      );
  });
  const view = sim.controls.find((c) => c.id === 'flow-view');
  if (
    view?.kind !== 'choice' ||
    view.options
      .map((o) => o.id)
      .sort()
      .join(',') !== 'pressure,streamlines'
  )
    issue(
      ['controls'],
      'airfoil flow-view must be a choice with pressure and streamlines',
    );
  const y = sim.outputs.find((o) => o.id === d.plot.y);
  if (y?.kind !== 'number' || !['cl', 'lift-n'].includes(y.from ?? y.id))
    issue(['airfoil', 'plot', 'y'], 'expected a cl or lift-n number output');
  const providers = sim.bind.filter((b) => 'flow' in b && b.airfoilFlow);
  if (providers.length !== 1)
    issue(['bind'], 'airfoil needs exactly one airfoilFlow provider');
  providers.forEach((b) => {
    if (!('flow' in b)) return;
    const i = sim.bind.indexOf(b),
      o = sim.outputs.find((o) => o.id === b.output);
    if (
      typeof b.flow !== 'string' ||
      o?.kind !== 'state' ||
      (o.from ?? o.id) !== 'flow-state' ||
      b.control ||
      b.paths ||
      b.state ||
      b.intensity ||
      b.stops ||
      b.visible
    )
      issue(
        ['bind', i],
        'airfoilFlow needs a single flow and flow-state output; no other mechanisms',
      );
  });
  sim.outputs.forEach((o, i) => {
    if (o.kind === 'number' && o.tag !== 'sim')
      issue(['outputs', i, 'tag'], 'airfoil number outputs must be tagged sim');
    if (
      o.kind === 'state' &&
      Object.keys(o.states ?? {})
        .sort()
        .join(',') !==
        ['still', 'ideal-attached', 'separated-illustration'].sort().join(',')
    )
      issue(
        ['outputs', i, 'states'],
        'flow-state needs exactly still, ideal-attached, separated-illustration labels',
      );
  });
  return out;
}
/** Geometric checks run with the full parts file, rather than widening shared registries. */
export function airfoilPartIssues(file: PartsFile): AirfoilIssue[] {
  const d = file.sim?.airfoil;
  if (!d || !file.sim) return [];
  const out: AirfoilIssue[] = [],
    issue = (path: AirfoilIssue['path'], message: string) =>
      out.push({ path, message });
  const p = file.parts.find((p) => p.id === d.section.part),
    o = d.section.origin,
    shape = airfoilOutline();
  if (
    !p ||
    p.context ||
    p.bilateral ||
    p.mesh ||
    p.extra ||
    p.repeat ||
    p.primitive?.kind !== 'extrude'
  )
    issue(
      ['sim', 'airfoil', 'section', 'part'],
      'section must be one non-context, non-bilateral extrude',
    );
  if (p?.primitive?.kind === 'extrude') {
    const q = p.primitive,
      at = q.at ?? [0, 0, 0];
    if (
      q.shape.length !== 128 ||
      q.shape.some(
        (v, i) =>
          Math.hypot(
            v[0] - shape[i * 2]! * d.chord,
            v[1] - shape[i * 2 + 1]! * d.chord,
          ) >
          1e-5 * d.chord,
      ) ||
      q.depth !== 0.12 ||
      (q.bevel ?? 0) !== 0 ||
      q.holes?.length ||
      q.scale ||
      q.rotation ||
      q.mirror ||
      at.some((v, i) => Math.abs(v - o[i]!) > 1e-9)
    )
      issue(
        ['parts', file.parts.indexOf(p), 'primitive'],
        'section needs the 128 Joukowski points × chord, origin, depth .12, bevel 0 and no extra transform',
      );
  }
  const pivot = [o[0] + 0.25 * d.chord, o[1], o[2]],
    isTurn = (b: SimData['bind'][number]) =>
      'part' in b &&
      b.control === d.angle &&
      !!b.rotate &&
      b.rotate.per === -1 &&
      b.rotate.origin === 0 &&
      !b.rotate.settle &&
      JSON.stringify(b.rotate.axis) === '[0,0,1]' &&
      JSON.stringify(b.rotate.pivot) === JSON.stringify(pivot);
  for (const id of [
    d.section.part,
    ...(file.parts.some((p) => p.id === 'chord-marker')
      ? ['chord-marker']
      : []),
  ]) {
    const binds = file.sim.bind.filter(
      (b) =>
        'part' in b && (Array.isArray(b.part) ? b.part : [b.part]).includes(id),
    );
    if (
      binds.filter(isTurn).length !== 1 ||
      binds.some(
        (b) =>
          'part' in b &&
          (b.pose ||
            b.offset ||
            b.place ||
            b.shift ||
            b.play ||
            b.at ||
            b.bend ||
            b.stretch ||
            (b.rotate && !isTurn(b))),
      ) ||
      file.animations.some((a) => a.target === id) ||
      Object.values(file.poses ?? {}).some((pose) => id in pose.parts)
    )
      issue(
        ['sim', 'bind'],
        `${id}: only the specified angle rotate is allowed (same quarter-chord pivot)`,
      );
  }
  if (
    file.sim.bind.some(
      (b) =>
        'part' in b &&
        (Array.isArray(b.part) ? b.part : [b.part]).includes(
          'inflow-reference',
        ) &&
        !!b.rotate,
    )
  )
    issue(['sim', 'bind'], 'inflow-reference must stay fixed');
  const provider = file.sim.bind.find((b) => 'flow' in b && b.airfoilFlow);
  if (provider && 'flow' in provider) {
    const f = file.flows.find((f) => f.id === provider.flow);
    if (
      !f ||
      f.path.length ||
      f.paths ||
      f.tidal ||
      f.bilateral ||
      f.count !== 128 ||
      f.speed !== 1 ||
      f.spread !== 0 ||
      !f.whenRun ||
      f.clip ||
      !f.flat
    )
      issue(
        ['flows'],
        'airfoilFlow needs count128 speed1 spread0 whenRun true clip false flat true, no paths/tidal/bilateral',
      );
    if (
      file.sim.bind.some(
        (b) =>
          b !== provider &&
          'flow' in b &&
          (Array.isArray(b.flow) ? b.flow : [b.flow]).includes(
            provider.flow as string,
          ) &&
          (b.state || b.paths || b.intensity || b.stops || b.airfoilFlow),
      )
    )
      issue(
        ['sim', 'bind'],
        'provider cannot combine with another flow mechanism',
      );
  }
  file.sim.overlays.forEach((v, i) => {
    if (
      v.kind === 'airfoil-pressure' &&
      (v.part !== d.section.part ||
        !file.groups.some((g) => g.id === v.group) ||
        v.when.control !== 'flow-view' ||
        !(typeof v.when.is === 'object' && 'eq' in v.when.is) ||
        v.when.is.eq !== 'pressure')
    )
      issue(
        ['sim', 'overlays', i],
        'pressure needs section.part, a valid group and flow-view=pressure',
      );
  });
  return out;
}
export function airfoilSourceIssues(
  d: AirfoilData,
  sources: ReadonlyMap<string, { design?: boolean }>,
): AirfoilIssue[] {
  const out: AirfoilIssue[] = [];
  d.sources.forEach((id, i) => {
    if (!sources.has(id))
      out.push({ path: ['sources', i], message: `unknown source ${id}` });
  });
  if (
    !d.sources.includes(d.stall.source) ||
    sources.get(d.stall.source)?.design !== true
  )
    out.push({
      path: ['stall', 'source'],
      message: 'stall.source must be in sources and design:true',
    });
  return out;
}
