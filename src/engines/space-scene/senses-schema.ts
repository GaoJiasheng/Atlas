/** Author contract and finite-domain validation for the senses bench. */
import { z } from 'zod';
import { kebabId } from '../../content/schema/common';
import type { SimControl } from './sim-schema';
const positive = z.number().finite().positive();
const ranges = z.object({ near: positive, far: positive }).strict();
const sources = z.array(z.string().regex(/^S\d+$/)).min(1);
export const sensesSchema = z.object({
  eye: z.object({ illumination: kebabId, pupilMm: kebabId, object: kebabId, focus: kebabId, objectsCm: ranges, focalCm: ranges, retinaCm: positive, referencePupilMm: positive, objectHeightsCm: z.tuple([z.number().finite(), z.number().finite()]), sources }).strict(),
  sound: z.object({ active: kebabId, frequencyHz: kebabId, amplitude: kebabId, slowFactor: positive, baseFrequencyHz: positive, baseWavelengthScene: positive, baseDisplacementScene: positive, sources }).strict(),
}).strict();
export type SensesData = z.output<typeof sensesSchema>;
export function sensesIssues(data: SensesData, controls: ReadonlyMap<string, SimControl>) {
  const out: { path: (string | number)[]; message: string }[] = [];
  const issue = (path: (string | number)[], message: string) => out.push({ path, message });
  const e = data.eye, s = data.sound;
  for (const [field, expected] of [['slowFactor',250],['baseFrequencyHz',250],['baseWavelengthScene',1],['baseDisplacementScene',.0125]] as const) if (s[field] !== expected) issue(['sound', field], `this classroom comparison requires ${expected}`);
  if (e.retinaCm !== 4 || e.referencePupilMm !== 2 || e.objectHeightsCm[0] !== 1 || e.objectHeightsCm[1] !== -.5 || e.objectsCm.near !== 12 || e.objectsCm.far !== 40 || e.focalCm.near !== 3 || Math.abs(e.focalCm.far - 40/11) > 1e-12) issue(['eye'], 'use the fixed classroom geometry: u 12/40, f 3/(40/11), retina 4, reference pupil 2, heights 1/-.5');
  const expected = [
    ['eye', 'illumination', e.illumination, 'light-in', 'toggle', [false, true], true],
    ['eye', 'pupilMm', e.pupilMm, 'pupil-mm', 'step', [2, 4], 2],
    ['eye', 'object', e.object, 'object-range', 'choice', ['near', 'far'], 'far'],
    ['eye', 'focus', e.focus, 'lens-focus', 'choice', ['near', 'far'], 'far'],
    ['sound', 'active', s.active, 'sound-active', 'toggle', [false, true], true],
    ['sound', 'frequencyHz', s.frequencyHz, 'frequency-hz', 'step', [250, 500], 250],
    ['sound', 'amplitude', s.amplitude, 'amplitude', 'step', [1, 2], 1],
  ] as const;
  for (const [section, field, id, fixed, kind, values, initial] of expected) {
    const c = controls.get(id), path = [section, field];
    if (id !== fixed) issue(path, `must reference ${fixed}; eye and sound controls are separate`);
    if (!c || c.kind !== kind) { issue(path, `unknown or wrong kind control ${id}: expected ${kind}`); continue; }
    const actual = c.kind === 'choice' ? c.options.map((o) => o.id) : c.kind === 'step' ? c.values : [false, true];
    if (actual.length !== values.length || actual.some((v) => !(values as readonly unknown[]).includes(v))) issue(path, `control must have exactly ${values.join(', ')}`);
    if (c.default !== initial) issue(path, `control default must be ${initial}`);
  }
  for (const u of Object.values(e.objectsCm)) for (const f of Object.values(e.focalCm)) if (!(u > f && f > 0) || !Number.isFinite(u * f / (u - f))) issue(['eye'], 'every object/focal pair must satisfy u > f > 0 and yield finite geometry');
  const d = controls.get(e.pupilMm);
  if (d?.kind === 'step' && d.values.some((x) => !Number.isFinite(x) || x <= 0 || x / 10 >= .5)) issue(['eye', 'pupilMm'], 'positive finite diameter / 10 must be < .5 cm for this paraxial diagram');
  const f = controls.get(s.frequencyHz), a = controls.get(s.amplitude);
  if (f?.kind === 'step' && a?.kind === 'step') for (const frequency of f.values) for (const amplitude of a.values) {
    const lambda = s.baseWavelengthScene * s.baseFrequencyHz / frequency, A = s.baseDisplacementScene * amplitude;
    if (!Number.isFinite(A / lambda) || A / lambda >= 1 / (2 * Math.PI)) issue(['sound'], 'maximum displacement/wavelength must be < 1/(2*pi): particles cannot cross');
  }
  return out;
}
/** Cross-file source references are checked by validate-content, like table sources. */
export function sensesSourceIssues(data: SensesData, sources: ReadonlySet<string>) {
  return (['eye', 'sound'] as const).flatMap((section) => data[section].sources.flatMap((id, i) => sources.has(id) ? [] : [{ path: [section, 'sources', i], message: `unknown source ${id}` }]));
}
