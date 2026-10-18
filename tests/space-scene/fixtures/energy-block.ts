/**
 * The docs/31 §2.4 energy block as a sim (controls, outputs and the `energy`
 * data at the spec's numbers, with the 2026-10-18 fact audit's corrections:
 * the dynamo levels off at its 3 W rating, the LED / filament lamps start
 * from the energy that gives the same light, the kettle's heat is the
 * water's): the unit tests run the model on it, and it is the template an
 * author copies for the energy-conversion topic. Flow ids and path ids are
 * the spec's §4.3 names.
 */
import { simSchema, type SimData } from '../../../src/engines/space-scene/sim-schema';

const l = (en: string) => ({ en, zh: en });
const opts = (...ids: string[]) => ids.map((id) => ({ id, label: l(id) }));
const states = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, l(id)]));
const eq = (control: string, v: string | boolean | number) => ({ control, is: { eq: v } });

export const CHAINS = ['whole', 'solar', 'home', 'bounce', 'swing', 'windup', 'torch', 'dynamo', 'gas-to-home'] as const;

/** Flow → its paths (the five energy flows of docs/31 §4.3). */
export const ENERGY_FLOWS: Record<string, string[]> = {
  'light-energy': ['sun-roof-a', 'sun-roof-b', 'sun-plant', 'panel-reflect', 'lamp-room', 'torch-beam', 'headlamp-beam'],
  'electrical-energy': ['panel-inverter', 'inverter-motor', 'inverter-grid', 'grid-db', 'db-fan', 'db-lamp', 'db-speaker', 'db-kettle', 'torch-loop', 'dynamo-lamp'],
  'kinetic-energy': ['motor-car', 'fan-air', 'toy-run', 'pedal-wheel', 'wheel-dynamo'],
  'sound-energy': ['speaker-out-a', 'speaker-out-b', 'speaker-out-c', 'fan-hum', 'motor-hum', 'kettle-hiss', 'toy-tick', 'dynamo-whirr'],
  'heat-energy': ['panel-heat', 'inverter', 'lift-motor', 'fan', 'lamp', 'speaker', 'kettle-water', 'kettle-air', 'torch', 'dynamo', 'headlamp', 'grid-cable', 'toy', 'db'],
};

export const ENERGY_PARTS = [
  'sun', 'solar-panels', 'inverter', 'lift-motor', 'lift-car', 'grid-cable', 'distribution-board', 'fan-blades', 'led-lamp', 'speaker', 'kettle',
  'torch-batteries', 'torch-led', 'windup-spring', 'windup-wheels', 'windup-toy', 'windup-key', 'tennis-ball', 'surface-tile', 'drop-pole', 'swing-seat',
  'rear-wheel', 'bicycle-dynamo', 'headlamp',
];

const air = { id: 'air', label: l('The air around'), sink: true as const };

export const energySim: SimData = simSchema.parse({
  kind: 'energy',
  controls: [
    { id: 'chain', kind: 'choice', default: 'whole', label: l('Chain'), options: opts(...CHAINS) },
    { id: 'sky', kind: 'choice', default: 'clear', label: l('Sky'), options: opts('clear', 'average', 'overcast', 'night') },
    { id: 'lift-at', kind: 'choice', default: 'ground', label: l('Lift'), options: opts('ground', 'top') },
    { id: 'appliance', kind: 'choice', default: 'fan', label: l('Appliance'), options: opts('fan', 'lamp', 'speaker', 'kettle') },
    { id: 'drop', kind: 'step', values: [25, 50, 75, 100], default: 100, unit: 'cm', label: l('Drop') },
    { id: 'surface', kind: 'choice', default: 'tile', label: l('Floor'), options: opts('tile', 'rubber', 'carpet', 'sand') },
    { id: 'winds', kind: 'step', values: [0, 2, 4, 6, 8], default: 0, label: l('Winds') },
    { id: 'torch-on', kind: 'toggle', default: false, label: l('Torch') },
    { id: 'speed', kind: 'step', values: [0, 5, 10, 15, 20, 25], default: 0, unit: 'km/h', label: l('Speed') },
    { id: 'dynamo-on', kind: 'toggle', default: true, label: l('Dynamo') },
    { id: 'lamp-type', kind: 'choice', default: 'led', label: l('Lamp'), options: opts('led', 'filament') },
  ],
  outputs: [
    { id: 'chain-state', kind: 'state', label: l('Chain'), states: states(...CHAINS) },
    { id: 'panel-power', label: l('Panel output'), unit: 'kW', decimals: 2 },
    { id: 'sun-glow', label: l('Sun') },
    { id: 'useful', label: l('Useful'), unit: '%' },
    { id: 'heat', label: l('Heat'), unit: '%' },
    { id: 'sound', label: l('Sound'), unit: '%' },
    { id: 'bounce-height', label: l('Bounce'), unit: 'cm' },
    { id: 'impact-speed', label: l('Speed'), unit: 'm/s', decimals: 2 },
    { id: 'kept', label: l('Kept'), unit: '%' },
    { id: 'lost', label: l('Lost'), unit: '%' },
    { id: 'run-time', label: l('Run time'), unit: 's' },
    { id: 'lamp-power', label: l('Lamp power'), unit: 'W', decimals: 2 },
    { id: 'brightness', label: l('Brightness'), unit: '%' },
    { id: 'wheel-rpm', label: l('Wheel') },
    { id: 'crank-rpm', label: l('Crank') },
    { id: 'lamp-glow', label: l('Lamp glow'), from: 'in:lamp' },
    { id: 'water-warm', label: l('Water'), from: 'in:kettle' },
    { id: 'same-light', label: l('Same light'), from: 'start', unit: '%' },
    { id: 'bounce-run', kind: 'timeline', label: l('Bounce run') },
    { id: 'swing-run', kind: 'timeline', label: l('Swing run') },
    { id: 'toy-run', kind: 'timeline', label: l('Toy run') },
    { id: 'paths', kind: 'vector', label: l('Paths') },
    { id: 'links', kind: 'vector', label: l('Links') },
  ],
  bind: [
    ...Object.keys(ENERGY_FLOWS).map((flow) => ({ output: 'paths', flow, intensity: { full: 1, mode: 'density' } })),
    { output: 'bounce-run', part: 'tennis-ball', play: { channel: 'y', axis: [0, 1, 0] } },
    { output: 'swing-run', part: 'swing-seat', play: { channel: 'angle', turn: [0, 0, 1], pivot: [8.0, 2.4, 0] } },
    { output: 'toy-run', part: 'windup-toy', play: { channel: 'x', axis: [1, 0, 0] } },
  ],
  overlays: [
    { kind: 'energy-bars', timeline: 'bounce-run', near: 'drop-pole', offset: [0.25, 0, 0] },
    { kind: 'energy-bars', timeline: 'swing-run', near: 'swing-seat', offset: [0.6, 0, 0] },
    { kind: 'energy-bars', timeline: 'toy-run', near: 'windup-toy', offset: [0, 0.1, 0], height: 0.2, when: { control: 'winds', is: { ne: 0 } } },
  ],
  energy: {
    g: 9.8,
    chain: 'chain',
    solar: {
      sky: 'sky',
      modules: 12,
      area: 1.953,
      efficiency: 0.21,
      irradiance: { clear: 900, average: 640, overcast: 150, night: 0 },
      glow: { clear: 1, average: 0.8, overcast: 0.35, night: 0 },
      chains: ['solar', 'whole'],
    },
    bounce: { drop: 'drop', surface: 'surface', ratio: { tile: 0.55, rubber: 0.4, carpet: 0.25, sand: 0.05 }, slow: 2, chains: ['bounce'] },
    swing: { length: 2.0, amplitude: 35, loss: 0.03, swings: 8, sample: 0.08 },
    windup: { winds: 'winds', secondsPerTurn: 1.5, speed: 0.08, wheel: 0.009, kinetic: 8, spinUp: 0.2, chains: ['windup'] },
    // The audit (SIM-G-limit): imax² R = 0.5² × 12 = 3 W, so the lamp levels off at its rating.
    dynamo: { speed: 'speed', on: 'dynamo-on', imax: 0.5, v0: 6, lampOhms: 12, rated: 3, wheel: 2.07, crankRatio: 0.37, chains: ['dynamo'] },
    shares: {
      panel: { electrical: 21, heat: 75, light: 4 },
      inverter: { electrical: 95, heat: 5 },
      lift: { kinetic: 80, heat: 15, sound: 5 },
      fan: { kinetic: 60, heat: 38, sound: 2 },
      led: { light: 40, heat: 60 },
      filament: { light: 10, heat: 90 },
      speaker: { sound: 1, heat: 99 },
      kettle: { 'heat-water': 85, heat: 14, sound: 1 },
      battery: { electrical: 95, heat: 5 },
      windup: { heat: 95, sound: 5 },
      dynamo: { electrical: 30, heat: 65, sound: 5 },
      station: { electrical: 55, heat: 45 },
      grid: { electrical: 96, heat: 4 },
    },
    chains: {
      solar: {
        when: [{ control: 'sky', is: { ne: 'night' } }],
        reading: { node: 'panel' },
        nodes: [{ id: 'sun', part: 'sun' }, { id: 'panel', part: 'solar-panels' }, { id: 'inverter', part: 'inverter' }, { id: 'motor', part: 'lift-motor' }, { id: 'car', part: 'lift-car' }, { id: 'grid', part: 'grid-cable' }, air],
        links: [
          { id: 's-light', from: 'sun', to: 'panel', form: 'light', share: 'in', paths: ['light-energy:sun-roof-a', 'light-energy:sun-roof-b'] },
          { id: 's-el', from: 'panel', to: 'inverter', form: 'electrical', share: 'panel.electrical', paths: ['electrical-energy:panel-inverter'], useful: true },
          { id: 's-heat', from: 'panel', to: 'air', form: 'heat', share: 'panel.heat', paths: ['heat-energy:panel-heat'] },
          { id: 's-reflect', from: 'panel', to: 'air', form: 'light', share: 'panel.light', paths: ['light-energy:panel-reflect'] },
          { id: 'i-motor', from: 'inverter', to: 'motor', form: 'electrical', share: 'inverter.electrical', paths: ['electrical-energy:inverter-motor'], when: eq('lift-at', 'top') },
          { id: 'i-grid', from: 'inverter', to: 'grid', form: 'electrical', share: 'inverter.electrical', paths: ['electrical-energy:inverter-grid'], when: eq('lift-at', 'ground') },
          { id: 'i-heat', from: 'inverter', to: 'air', form: 'heat', share: 'inverter.heat', paths: ['heat-energy:inverter'] },
          { id: 'm-car', from: 'motor', to: 'car', form: 'kinetic', share: 'lift.kinetic', paths: ['kinetic-energy:motor-car'] },
          { id: 'm-heat', from: 'motor', to: 'air', form: 'heat', share: 'lift.heat', paths: ['heat-energy:lift-motor'] },
          { id: 'm-sound', from: 'motor', to: 'air', form: 'sound', share: 'lift.sound', paths: ['sound-energy:motor-hum'] },
        ],
      },
      home: {
        reading: { node: 'db', through: ['fan', 'lamp', 'speaker', 'kettle'] },
        nodes: [
          { id: 'grid', part: 'grid-cable' },
          { id: 'db', part: 'distribution-board' },
          { id: 'fan', part: 'fan-blades' },
          { id: 'lamp', part: 'led-lamp' },
          { id: 'speaker', part: 'speaker' },
          { id: 'kettle', part: 'kettle' },
          { id: 'water', label: l('The water') },
          air,
        ],
        links: [
          { id: 'h-in', from: 'grid', to: 'db', form: 'electrical', share: 'in', paths: ['electrical-energy:grid-db'] },
          { id: 'h-fan', from: 'db', to: 'fan', form: 'electrical', share: 'in', paths: ['electrical-energy:db-fan'], when: eq('appliance', 'fan') },
          { id: 'h-lamp', from: 'db', to: 'lamp', form: 'electrical', share: 'in', paths: ['electrical-energy:db-lamp'], when: eq('appliance', 'lamp') },
          { id: 'h-speaker', from: 'db', to: 'speaker', form: 'electrical', share: 'in', paths: ['electrical-energy:db-speaker'], when: eq('appliance', 'speaker') },
          { id: 'h-kettle', from: 'db', to: 'kettle', form: 'electrical', share: 'in', paths: ['electrical-energy:db-kettle'], when: eq('appliance', 'kettle') },
          { id: 'f-kin', from: 'fan', to: 'air', form: 'kinetic', share: 'fan.kinetic', paths: ['kinetic-energy:fan-air'], useful: true },
          { id: 'f-heat', from: 'fan', to: 'air', form: 'heat', share: 'fan.heat', paths: ['heat-energy:fan'] },
          { id: 'f-sound', from: 'fan', to: 'air', form: 'sound', share: 'fan.sound', paths: ['sound-energy:fan-hum'] },
          { id: 'l-light', from: 'lamp', to: 'air', form: 'light', share: 'led.light', paths: ['light-energy:lamp-room'], useful: true },
          { id: 'l-heat', from: 'lamp', to: 'air', form: 'heat', share: 'led.heat', paths: ['heat-energy:lamp'] },
          { id: 'sp-sound', from: 'speaker', to: 'air', form: 'sound', share: 'speaker.sound', paths: ['sound-energy:speaker-out-a', 'sound-energy:speaker-out-b', 'sound-energy:speaker-out-c'], useful: true },
          { id: 'sp-heat', from: 'speaker', to: 'air', form: 'heat', share: 'speaker.heat', paths: ['heat-energy:speaker'] },
          { id: 'k-water', from: 'kettle', to: 'water', form: 'heat', share: 'kettle.heat-water', paths: ['heat-energy:kettle-water'], useful: true },
          { id: 'k-heat', from: 'kettle', to: 'air', form: 'heat', share: 'kettle.heat', paths: ['heat-energy:kettle-air'] },
          { id: 'k-sound', from: 'kettle', to: 'air', form: 'sound', share: 'kettle.sound', paths: ['sound-energy:kettle-hiss'] },
        ],
      },
      bounce: {
        reading: { node: 'floor' },
        nodes: [{ id: 'held', part: 'tennis-ball' }, { id: 'floor', part: 'surface-tile' }, { id: 'top', label: l('At the top of the bounce') }, air],
        links: [
          { id: 'b-fall', from: 'held', to: 'floor', form: 'kinetic', share: 'in' },
          { id: 'b-kept', from: 'floor', to: 'top', form: 'potential', share: 'bounce.potential', useful: true },
          { id: 'b-heat', from: 'floor', to: 'air', form: 'heat', share: 'bounce.heat' },
          { id: 'b-sound', from: 'floor', to: 'air', form: 'sound', share: 'bounce.sound' },
        ],
      },
      swing: {
        reading: { node: 'swinging' },
        nodes: [{ id: 'pulled', part: 'swing-seat' }, { id: 'swinging', label: l('Swinging') }, { id: 'paused', label: l('Paused at a turning point') }, air],
        links: [
          { id: 'w-let-go', from: 'pulled', to: 'swinging', form: 'potential', share: 'in' },
          { id: 'w-left', from: 'swinging', to: 'paused', form: 'potential', share: 'swing.potential', useful: true },
          { id: 'w-heat', from: 'swinging', to: 'air', form: 'heat', share: 'swing.heat' },
          { id: 'w-sound', from: 'swinging', to: 'air', form: 'sound', share: 'swing.sound' },
        ],
      },
      windup: {
        when: [{ control: 'winds', is: { ne: 0 } }],
        nodes: [{ id: 'spring', part: 'windup-spring' }, { id: 'wheels', part: 'windup-wheels' }, air],
        links: [
          { id: 't-run', from: 'spring', to: 'wheels', form: 'kinetic', share: 'in', paths: ['kinetic-energy:toy-run'] },
          { id: 't-heat', from: 'wheels', to: 'air', form: 'heat', share: 'windup.heat', paths: ['heat-energy:toy'] },
          { id: 't-sound', from: 'wheels', to: 'air', form: 'sound', share: 'windup.sound', paths: ['sound-energy:toy-tick'] },
        ],
      },
      torch: {
        when: [{ control: 'torch-on', is: true }],
        reading: { node: 'led' },
        nodes: [{ id: 'cells', part: 'torch-batteries' }, { id: 'led', part: 'torch-led' }, air],
        links: [
          { id: 'c-el', from: 'cells', to: 'led', form: 'electrical', share: 'battery.electrical', paths: ['electrical-energy:torch-loop'] },
          { id: 'c-heat', from: 'cells', to: 'air', form: 'heat', share: 'battery.heat', paths: ['heat-energy:torch'] },
          { id: 'c-light', from: 'led', to: 'air', form: 'light', share: 'led.light', paths: ['light-energy:torch-beam'], useful: true },
          { id: 'c-led-heat', from: 'led', to: 'air', form: 'heat', share: 'led.heat', paths: ['heat-energy:torch'] },
        ],
      },
      dynamo: {
        when: [{ control: 'speed', is: { ne: 0 } }],
        reading: { node: 'dyn', through: ['lamp'] },
        nodes: [{ id: 'rider', part: 'rear-wheel' }, { id: 'dyn', part: 'bicycle-dynamo' }, { id: 'lamp', part: 'headlamp' }, air],
        links: [
          { id: 'd-in', from: 'rider', to: 'dyn', form: 'kinetic', share: 'in', paths: ['kinetic-energy:pedal-wheel', 'kinetic-energy:wheel-dynamo'], when: eq('dynamo-on', true) },
          { id: 'd-free', from: 'rider', to: 'air', form: 'heat', share: 'in', when: eq('dynamo-on', false) },
          { id: 'd-el', from: 'dyn', to: 'lamp', form: 'electrical', share: 'dynamo.electrical', paths: ['electrical-energy:dynamo-lamp'] },
          { id: 'd-heat', from: 'dyn', to: 'air', form: 'heat', share: 'dynamo.heat', paths: ['heat-energy:dynamo'] },
          { id: 'd-sound', from: 'dyn', to: 'air', form: 'sound', share: 'dynamo.sound', paths: ['sound-energy:dynamo-whirr'] },
          { id: 'l-light', from: 'lamp', to: 'air', form: 'light', share: 'filament.light', paths: ['light-energy:headlamp-beam'], useful: true },
          { id: 'l-heat', from: 'lamp', to: 'air', form: 'heat', share: 'filament.heat', paths: ['heat-energy:headlamp'] },
        ],
      },
      'gas-to-home': {
        start: { control: 'lamp-type', values: { led: 25, filament: 100 } },
        reading: { node: 'lamp' },
        nodes: [
          { id: 'gas', label: l('Natural gas') },
          { id: 'station', label: l('Power station') },
          { id: 'grid', part: 'grid-cable' },
          { id: 'lamp', part: 'led-lamp' },
          air,
        ],
        links: [
          { id: 'g-burn', from: 'gas', to: 'station', form: 'potential', share: 'in' },
          { id: 'g-el', from: 'station', to: 'grid', form: 'electrical', share: 'station.electrical' },
          { id: 'g-heat', from: 'station', to: 'air', form: 'heat', share: 'station.heat' },
          { id: 'g-home', from: 'grid', to: 'lamp', form: 'electrical', share: 'grid.electrical', paths: ['electrical-energy:grid-db', 'electrical-energy:db-lamp'] },
          { id: 'g-cable', from: 'grid', to: 'air', form: 'heat', share: 'grid.heat', paths: ['heat-energy:grid-cable'] },
          { id: 'g-led-light', from: 'lamp', to: 'air', form: 'light', share: 'led.light', paths: ['light-energy:lamp-room'], when: eq('lamp-type', 'led'), useful: true },
          { id: 'g-led-heat', from: 'lamp', to: 'air', form: 'heat', share: 'led.heat', paths: ['heat-energy:lamp'], when: eq('lamp-type', 'led') },
          { id: 'g-fil-light', from: 'lamp', to: 'air', form: 'light', share: 'filament.light', paths: ['light-energy:lamp-room'], when: eq('lamp-type', 'filament'), useful: true },
          { id: 'g-fil-heat', from: 'lamp', to: 'air', form: 'heat', share: 'filament.heat', paths: ['heat-energy:lamp'], when: eq('lamp-type', 'filament') },
        ],
      },
      whole: {
        mix: { chains: ['solar', 'home'], scale: 0.6 },
        nodes: [{ id: 'sun', part: 'sun' }, { id: 'panel', part: 'solar-panels' }, { id: 'gas', label: l('Natural gas') }, { id: 'grid', part: 'grid-cable' }, { id: 'home', part: 'distribution-board' }, air],
        links: [
          { id: 'a-light', from: 'sun', to: 'panel', form: 'light', share: 'in' },
          { id: 'a-el', from: 'panel', to: 'grid', form: 'electrical', share: 'panel.electrical' },
          { id: 'a-heat', from: 'panel', to: 'air', form: 'heat', share: 'panel.heat' },
          { id: 'a-reflect', from: 'panel', to: 'air', form: 'light', share: 'panel.light' },
          { id: 'a-gas', from: 'gas', to: 'grid', form: 'electrical', share: 'station.electrical' },
          { id: 'a-station', from: 'gas', to: 'air', form: 'heat', share: 'station.heat' },
          { id: 'a-home', from: 'grid', to: 'home', form: 'electrical', share: 'grid.electrical' },
          { id: 'a-cable', from: 'grid', to: 'air', form: 'heat', share: 'grid.heat' },
          { id: 'a-used', from: 'home', to: 'air', form: 'heat', share: 'in' },
        ],
      },
    },
  },
});
