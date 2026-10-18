/**
 * The docs/30 §4.3 forces bench as a sim (controls, outputs and the `force`
 * data at the spec's numbers): the unit tests run the model on it, and it is
 * the template an author copies for a forces topic.
 */
import { simSchema, type SimData } from '../../../src/engines/space-scene/sim-schema';

const l = (en: string) => ({ en, zh: en });
const opts = (...ids: string[]) => ids.map((id) => ({ id, label: l(id) }));
const states = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, l(id)]));

export const forcesSim: SimData = simSchema.parse({
  kind: 'force',
  controls: [
    { id: 'push', kind: 'choice', default: 'behind', label: l('Push'), options: opts('behind', 'front', 'front-firm', 'side') },
    { id: 'car-start', kind: 'choice', default: 'moving', label: l('Car'), options: opts('rest', 'moving') },
    { id: 'magnet-push', kind: 'toggle', default: false, label: l('Magnet') },
    { id: 'pair', kind: 'choice', default: 'balls', label: l('Pair'), options: opts('balls', 'papers', 'ball-paper', 'ball-crumpled') },
    { id: 'drop-height', kind: 'step', values: [0.5, 1.0, 1.5], default: 1.0, unit: 'm', label: l('Height') },
    { id: 'weigh', kind: 'choice', default: 'none', label: l('Weigh'), options: opts('none', 'small-ball', 'large-ball', 'paper') },
    { id: 'lane', kind: 'choice', default: 'wood', label: l('Lane'), options: opts('glass', 'wood', 'sandpaper') },
    { id: 'block-load', kind: 'step', values: [0, 200, 400], default: 0, unit: 'g', label: l('Load') },
    { id: 'runway', kind: 'choice', default: 'wood', label: l('Runway'), options: opts('glass', 'wood', 'carpet') },
    { id: 'ramp-height', kind: 'step', values: [3, 6, 9], default: 6, unit: 'cm', label: l('Ramp height') },
    { id: 'spring-load', kind: 'step', values: [0, 50, 100, 150, 200, 250, 300, 350, 400], default: 0, unit: 'g', label: l('Load') },
    { id: 'unload', kind: 'toggle', default: false, label: l('Unload') },
    { id: 'squeeze', kind: 'choice', default: 'none', label: l('Squeeze'), options: opts('none', 'light', 'firm') },
  ],
  outputs: [
    { id: 'effect', kind: 'state', label: l('Effect'), states: states('none', 'starts', 'speeds-up', 'slows-down', 'stops', 'turns') },
    { id: 'speed-before', label: l('Before'), unit: 'm/s', decimals: 2 },
    { id: 'speed-after', label: l('After'), unit: 'm/s', decimals: 2 },
    { id: 'push-run', kind: 'timeline', label: l('Push run') },
    { id: 'magnet-run', kind: 'timeline', label: l('Magnet run') },
    { id: 't-left', label: l('Left'), unit: 's', decimals: 2 },
    { id: 't-right', label: l('Right'), unit: 's', decimals: 2 },
    { id: 'landing', kind: 'state', label: l('Landing'), states: states('together', 'left-first', 'right-first') },
    { id: 'drop-run', kind: 'timeline', label: l('Drop run') },
    { id: 'weight', label: l('Weight'), unit: 'N', decimals: 1 },
    { id: 'weigh-note', kind: 'state', label: l('Note'), states: states('none', 'reads', 'too-light') },
    { id: 'f-start', label: l('Start'), unit: 'N', decimals: 1 },
    { id: 'f-move', label: l('Move'), unit: 'N', decimals: 1 },
    { id: 'pull-run', kind: 'timeline', label: l('Pull run') },
    { id: 'distance', label: l('Distance'), unit: 'cm', decimals: 0 },
    { id: 'run-time', label: l('Time'), unit: 's', decimals: 1 },
    { id: 'car-run', kind: 'timeline', label: l('Car run') },
    { id: 'extension', label: l('Extension'), unit: 'cm', decimals: 1 },
    { id: 'spring-length', label: l('Length'), unit: 'cm', decimals: 1 },
    { id: 'load-weight', label: l('Load weight'), unit: 'N', decimals: 1 },
    { id: 'returns', kind: 'state', label: l('Returns'), states: states('loaded', 'returns', 'stays-longer') },
    { id: 'stop-time', label: l('Stop time'), unit: 's', decimals: 1 },
    { id: 'turns', label: l('Turns'), decimals: 1 },
    { id: 'wheel-run', kind: 'timeline', label: l('Wheel run') },
  ],
  force: {
    g: 9.8,
    push: { choice: 'push', start: 'car-start', speed: 0.6, at: 0.25, runway: 1.25, surface: 'glass', dv: { behind: [0.3, 0, 0], front: [-0.3, 0, 0], 'front-firm': [-0.6, 0, 0], side: [0, 0, 0.3] } },
    magnet: { toggle: 'magnet-push', dv: [0.4, 0, 0] },
    fall: {
      air: 1.21,
      height: 'drop-height',
      pair: 'pair',
      slow: 4,
      objects: {
        'small-ball': { part: 'ball-small', m: 0.0282, cd: 0.45, area: 2.835e-4 },
        'large-ball': { part: 'ball-large', m: 0.225, cd: 0.45, area: 1.134e-3 },
        crumpled: { part: 'paper-ball', m: 0.005, cd: 0.6, area: 1.963e-3 },
        flat: { part: 'paper-sheet', m: 0.005, cd: 1.12, area: 6.237e-2, sway: 6 },
      },
      pairs: { balls: ['small-ball', 'large-ball'], papers: ['crumpled', 'flat'], 'ball-paper': ['large-ball', 'flat'], 'ball-crumpled': ['large-ball', 'crumpled'] },
      weigh: { control: 'weigh', map: { 'small-ball': 'small-ball', 'large-ball': 'large-ball', paper: 'flat' } },
    },
    slide: { block: 0.2, load: 'block-load', lane: 'lane', rise: 1.2, speed: 0.15, travel: 0.25, surfaces: { glass: [0.25, 0.2], wood: [0.5, 0.3], sandpaper: [0.9, 0.7] } },
    roll: { height: 'ramp-height', surface: 'runway', loss: 0.2, wheel: 0.011, runway: 1.25, ramp: { angle: 14 }, rolling: { glass: 0.06, wood: 0.09, carpet: 0.25 } },
    spring: { load: 'spring-load', unload: 'unload', per50: 1.0, length: 8.0, limit: 300, beyond: [1.0, 0.3], set: { '350': 0.4, '400': 1.2 } },
    brake: { squeeze: 'squeeze', rps: 2, inertia: 0.032, radius: 0.18, mu: 0.6, hub: 0.005, force: { none: 0, light: 1, firm: 3 } },
  },
});

/** The part ids the fixture's `force` data names (validation context). */
export const FORCES_PARTS = ['ball-small', 'ball-large', 'paper-ball', 'paper-sheet'];
