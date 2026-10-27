/** Strict author contract and build-time checks for the beam-steam mechanism. */
import { z } from 'zod';
import { kebabId } from '../../content/schema/common';
import type { PartsFile } from './schema';
import { createMechanismFrame, LINK_ROLES, MECHANISM_ROLES, PORT_ROLES, ROLE_ENDPOINTS, solveMechanism } from './lib/mechanism';
export { LINK_ROLES, MECHANISM_ROLES, PORT_ROLES, ROLE_ENDPOINTS } from './lib/mechanism';

const finite = z.number().finite();
const positive = finite.positive();
const point = z.tuple([finite, finite]);
const vector = z.tuple([finite, finite, finite]);
const branch = z.union([z.literal(1), z.literal(-1)]);
export const mechanismGeometrySchema = z.object({
  beamPivot: point, shaftCentre: point, radiusPivot: point,
  beamHalfM: positive, connectingRodM: positive, orbitM: positive, shortLinkM: positive, radiusRodM: positive,
  innerFraction: z.literal(0.5), beamBranch: branch, parallelBranch: branch, pistonRodM: positive,
  cylinderX: finite, radialDisplayClearanceM: positive, nominalStrokeM: positive,
  pump: z.object({ beamFraction: finite.min(-1).max(1), sliderX: finite, rodM: positive }).strict(),
}).strict();
export type MechanismGeometry = z.output<typeof mechanismGeometrySchema>;
const link = z.object({ part: kebabId, restEndpoints: z.tuple([point, point]) }).strict();
const body = z.object({ part: kebabId }).strict();
const port = z.object({ part: kebabId, openOffset: vector, flow: z.object({ id: kebabId, path: kebabId }).strict() }).strict();
export const mechanismSchema = z.object({
  id: kebabId, kind: z.literal('beam-steam'), origin: vector,
  clock: z.object({ phaseControl: kebabId, rateControl: kebabId, modeControl: kebabId, experimentControl: kebabId }).strict(),
  geometry: mechanismGeometrySchema,
  parts: z.object({ beam: link, innerLink: link, outerLink: link, bottomLink: link, radiusRod: link, driveRod: link,
    centreLink: link, pistonRod: link, pumpRod: link, piston: body, planet: body, sun: body, shaft: body, flywheel: body, pumpPiston: body }).strict(),
  ports: z.object({ upperIn: port, lowerIn: port, upperOut: port, lowerOut: port }).strict(),
}).strict();
export type BeamSteamMechanism = z.output<typeof mechanismSchema>;
export type Mechanism = BeamSteamMechanism;
export interface MechanismIssue { path: (string | number)[]; message: string }
type Context = Pick<PartsFile, 'flows' | 'animations' | 'poses' | 'sim' | 'rig'> & {
  parts: readonly { id: string; primitive?: unknown; mesh?: string; repeat?: unknown; bilateral?: unknown }[];
};
const TRANSFORM_BINDINGS = ['offset', 'rotate', 'play', 'shift', 'stretch', 'bend', 'fill', 'pose', 'at', 'place'] as const;
const asArray = (x: string | string[]) => typeof x === 'string' ? [x] : x;

/** All errors carry the exact parts.json path and target, including ownership conflicts. */
export function mechanismIssues(mechanisms: readonly BeamSteamMechanism[], file: Context): MechanismIssue[] {
  const out: MechanismIssue[] = [], driven = new Map<string, string>(), gated = new Map<string, string>();
  const issue = (path: (string | number)[], message: string) => out.push({ path, message });
  mechanisms.forEach((m, i) => {
    const at = ['mechanisms', i];
    if (file.sim?.kind !== 'table') issue([...at, 'clock'], `mechanism "${m.id}" requires the existing table sim controls`);
    if (mechanisms.findIndex((x) => x.id === m.id) !== i) issue([...at, 'id'], `duplicate mechanism "${m.id}"`);
    const controls = file.sim?.controls ?? [];
    const expected = { phaseControl: [0, 90, 180, 270, 360], rateControl: [8, 10, 12], modeControl: ['manual', 'auto'], experimentControl: ['pressure', 'mechanism', 'governor', 'energy'] };
    for (const key of Object.keys(expected) as (keyof typeof expected)[]) {
      const id = m.clock[key], c = controls.find((x) => x.id === id), values = expected[key];
      const actual = c?.kind === 'step' ? c.values : c?.kind === 'choice' ? c.options.map((o) => o.id) : [];
      const kind = key === 'phaseControl' || key === 'rateControl' ? 'step' : 'choice';
      if (!c || c.kind !== kind || actual.length !== values.length || values.some((v) => !(actual as (string | number)[]).includes(v)))
        issue([...at, 'clock', key], `control "${id}" must be ${kind} with exactly ${values.join(', ')}`);
    }
    if (new Set(Object.values(m.clock)).size !== 4) issue([...at, 'clock'], 'phase, rate, mode and experiment controls must be distinct');
    const own = (id: string, path: (string | number)[]) => {
      const owner = driven.get(id);
      if (owner) issue(path, `part "${id}" is already driven by ${owner}`);
      else driven.set(id, `${m.id}.${path.slice(-1)[0]}`);
      const p = file.parts.find((x) => x.id === id);
      if (!p) { issue(path, `unknown part "${id}"`); return; }
      if (!p.primitive || p.mesh || p.repeat || p.bilateral || Object.values(file.rig?.joints ?? {}).some((j) => j.node === id))
        issue(path, `part "${id}" must be an independent primitive with no mesh, rig, repeat or bilateral`);
      file.animations.forEach((a, n) => { if (a.target === id) issue(['animations', n, 'target'], `part "${id}" already has mechanism driver "${m.id}"`); });
      for (const [name, pose] of Object.entries(file.poses ?? {}))
        if (id in pose.parts || id in pose.contract) issue(['poses', name, id], `part "${id}" already has mechanism driver "${m.id}"`);
      file.sim?.bind.forEach((b, n) => {
        if ('part' in b && asArray(b.part).includes(id)) for (const key of TRANSFORM_BINDINGS)
          if (key in b) issue(['sim', 'bind', n, key], `part "${id}" already has mechanism driver "${m.id}"`);
      });
    };
    for (const role of MECHANISM_ROLES) own(m.parts[role].part, [...at, 'parts', role]);
    for (const role of PORT_ROLES) {
      const p = m.ports[role], path = [...at, 'ports', role]; own(p.part, [...path, 'part']);
      if (Math.hypot(...p.openOffset) <= 0) issue([...path, 'openOffset'], `valve "${p.part}" needs a non-zero openOffset`);
      const f = file.flows.find((x) => x.id === p.flow.id), key = `${p.flow.id}:${p.flow.path}`;
      if (!f) issue([...path, 'flow', 'id'], `unknown flow "${p.flow.id}"`);
      else {
        if ((f.paths ?? []).filter((x) => x.id === p.flow.path).length !== 1) issue([...path, 'flow', 'path'], `unknown or non-unique path "${key}"`);
        if (f.tidal) issue([...path, 'flow'], `gated path "${key}" cannot have a tidal driver`);
      }
      if (gated.has(key)) issue([...path, 'flow'], `path "${key}" is already gated by ${gated.get(key)}`); else gated.set(key, `${m.id}.${role}`);
      file.sim?.bind.forEach((b, n) => {
        if ('flow' in b && asArray(b.flow).includes(p.flow.id) && (!b.paths || b.paths.includes(p.flow.path)) && ['visible', 'intensity', 'state', 'tidal'].some((k) => k in b))
          issue(['sim', 'bind', n], `path "${key}" already has mechanism gate "${m.id}.${role}"`);
      });
    }
    const frame = createMechanismFrame();
    try {
      solveMechanism(0, m.geometry, frame);
      for (const role of LINK_ROLES) {
        const [a, b] = ROLE_ENDPOINTS[role], rest = m.parts[role].restEndpoints;
        for (let k = 0; k < 2; k++) {
          const expectedPoint = frame.points[k === 0 ? a : b];
          if (Math.hypot(rest[k]![0] - expectedPoint[0], rest[k]![1] - expectedPoint[1]) > 1e-9)
            issue([...at, 'parts', role, 'restEndpoints', k], `part "${m.parts[role].part}" endpoints must match the theta=0 solution`);
        }
      }
      const check = () => {
        if (frame.linkResidualM >= 1e-9) throw new Error(`link residual ${frame.linkResidualM} must be <1e-9 m`);
        if (Math.min(...frame.circleHeights) <= 1e-6) throw new Error('circle height must be >1e-6 m');
        if (frame.pumpMarginM2 <= 1e-9) throw new Error('pump square-root margin must be >1e-9 m²');
        if (Math.abs(frame.planetAngleRad) >= Math.PI - 1e-4) throw new Error('drive rod must only rock without crossing ±pi');
        if (frame.clearanceMarginM <= 0) throw new Error('piston excursion exceeds radialDisplayClearanceM');
      };
      for (const phase of [0, 90, 180, 270, 360]) { solveMechanism(phase * Math.PI / 180, m.geometry, frame); check(); }
      let previous = 0, min = Infinity, max = -Infinity;
      for (let n = 0; n < 32768; n++) {
        solveMechanism(n * 2 * Math.PI / 32768, m.geometry, frame);
        min = Math.min(min, frame.points.D[1]); max = Math.max(max, frame.points.D[1]);
        if (frame.clearanceMarginM <= 0) throw new Error('piston excursion exceeds radialDisplayClearanceM');
        if (n % 8 === 0) {
          check();
          if (Math.abs(frame.planetAngleRad - previous) >= Math.PI) throw new Error('adjacent drive-rod angles cross ±pi');
          previous = frame.planetAngleRad;
        }
      }
      if (Math.abs(max - min - m.geometry.nominalStrokeM) > 1e-6) issue([...at, 'geometry', 'nominalStrokeM'], `sampled stroke ${max - min} differs from nominalStrokeM by more than 1e-6 m`);
    } catch (error) { issue([...at, 'geometry'], `${m.id}: ${error instanceof Error ? error.message : String(error)}`); }
  });
  return out;
}
