/** Circular astronomy snapshot contract; docs/65 §4. */
import { z } from 'zod';
import { kebabId } from '../../content/schema/common';
import { sourceId } from '../../content/schema/sources';
import type { SimControl } from './sim-schema';
import { SOLAR_BODIES, SOLAR_INPUTS, SOLAR_CHOICES, SOLAR_STEPS } from './lib/sim/solar-constants';
export { PLANETS, SOLAR_BODIES, SOLAR_INPUTS, SOLAR_CHOICES, SOLAR_STEPS, SOLAR_STATES } from './lib/sim/solar-constants';
const body = z.object({ id: z.enum(SOLAR_BODIES), radiusKm: z.number().finite().positive(), aAu: z.number().finite().positive().optional(), periodYears: z.number().finite().positive().optional() }).strict();
const edge = z.tuple([z.string().regex(/^\d+$/), z.string().regex(/^\d+$/)]);
export const solarSystemSchema = z.object({ version: z.literal(1), bodies: z.array(body).length(9), controls: z.object(Object.fromEntries(SOLAR_INPUTS.map(k => [k, kebabId])) as Record<typeof SOLAR_INPUTS[number], typeof kebabId>).strict(), patterns: z.object({ orion: z.array(edge), crux: z.array(edge), scorpius: z.array(edge) }).strict(), sources: z.array(sourceId).min(1) }).strict().superRefine((c, ctx) => {
    c.bodies.forEach((b, i) => { if (b.id !== SOLAR_BODIES[i])
        ctx.addIssue({ code: 'custom', path: ['bodies', i, 'id'], message: `expected ${SOLAR_BODIES[i]} in Sun + eight-planet order` }); if (b.id === 'sun' ? (b.aAu !== undefined || b.periodYears !== undefined) : (!b.aAu || !b.periodYears || b.radiusKm >= b.aAu * 149597870.7))
        ctx.addIssue({ code: 'custom', path: ['bodies', i], message: 'Sun has no orbit; planets need positive period and orbit larger than radius' }); });
    const ids = Object.values(c.controls);
    if (new Set(ids).size !== ids.length)
        ctx.addIssue({ code: 'custom', path: ['controls'], message: 'control mappings must be one-to-one' });
    for (const [key, edges] of Object.entries(c.patterns)) {
        const seen = new Set<string>();
        edges.forEach(([a, b], i) => { const keyEdge = [a, b].sort().join(':'); if (a === b || seen.has(keyEdge))
            ctx.addIssue({ code: 'custom', path: ['patterns', key, i], message: 'no self edge or duplicate undirected edge' }); seen.add(keyEdge); });
    }
});
export type SolarSystem = z.output<typeof solarSystemSchema>;
export function solarControlIssues(c: SolarSystem, controls: readonly SimControl[]) { const issues: {
    path: (string | number)[];
    message: string;
}[] = []; for (const key of SOLAR_INPUTS) {
    const ctl = controls.find(x => x.id === c.controls[key]);
    const opts = SOLAR_CHOICES[key], steps = SOLAR_STEPS[key];
    const ok = ctl && (opts ? ctl.kind === 'choice' && JSON.stringify(ctl.options.map(o => o.id)) === JSON.stringify(opts) : steps ? ctl.kind === 'step' && JSON.stringify(ctl.values) === JSON.stringify(steps) : ctl.kind === 'toggle');
    if (!ok)
        issues.push({ path: ['solarSystem', 'controls', key], message: `${key} needs its documented control kind and ordered values` });
} return issues; }
