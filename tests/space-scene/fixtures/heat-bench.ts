/** docs/55 §4.7: seven controls, twenty-four declared outputs, all educational DESIGN/SIM. */
import { simSchema } from '../../../src/engines/space-scene/sim-schema';
import { heatSchema } from '../../../src/engines/space-scene/heat-schema';
const l = (en: string, zh: string = en) => ({ en, zh });
const step = (id: string, values: number[], value: number, unit: string, zh: string) => ({ id, kind: 'step', values, default: value, unit, label: l(id, zh) });
export const HEAT_CONTROLS = [
  step('elapsed-s', Array.from({ length: 11 }, (_, i) => i * 30), 0, 's', '经过时间'),
  step('water-g', [200, 300, 400], 200, 'g', '水的质量'),
  step('heater-w', [0, 50, 100], 100, 'W', '加热功率'),
  step('cool-start-c', [5, 45, 65, 85], 85, '°C', '冷却初温'),
  { id: 'cover', kind: 'choice', default: 'bare', label: l('Cover', '包覆'), options: [{ id: 'bare', label: l('Bare', '裸杯') }, { id: 'wrapped', label: l('Wrapped', '包覆') }] },
  step('bath-c', [5, 25, 45, 65, 85], 85, '°C', '温浴温度'),
  step('rod-c', [5, 25, 45, 65, 85], 25, '°C', '杆温度'),
];
export const heatBench = heatSchema.parse({
  time: 'elapsed-s',
  lumps: {
    heater: { initial: 25, capacity: { mass: { control: 'water-g' }, specific: 4.2 }, power: { control: 'heater-w' } },
    cooler: { initial: { control: 'cool-start-c' }, capacity: { mass: { control: 'water-g' }, specific: 4.2 }, reservoir: { temperature: 25, conductance: { control: 'cover', values: { bare: 2, wrapped: 0.5 } } } },
    'metal-tip': { initial: 25, capacity: 20, reservoir: { temperature: { control: 'bath-c' }, conductance: 1 / 3 } },
    'plastic-tip': { initial: 25, capacity: 20, reservoir: { temperature: { control: 'bath-c' }, conductance: 1 / 30 } },
  },
  expansions: { rod: { temperature: { control: 'rod-c' }, reference: 25, length: 0.1, alpha: 0.000012 } },
  compare: { tips: { first: 'metal-tip', second: 'plastic-tip', epsilon: 0.01 } },
});
const n = (id: string, from: string, unit: string, zh: string) => ({ id, from, label: l(id, zh), unit, decimals: unit === '°C' ? 1 : unit === 'mm' ? 3 : unit === 'K' ? 1 : 0 });
const direction = (id: string, lump: string, zh: string) => ({ id, from: `direction:${lump}`, label: l(id, zh), kind: 'state', states: { warming: l('Warming', '升温'), steady: l('Steady', '稳定'), cooling: l('Cooling', '降温') } });
export const HEAT_OUTPUTS = [
  n('heated-c', 'temperature:heater', '°C', '加热水温'), n('heated-j', 'energy:heater', 'J', '净传入能量'), n('heated-input-j', 'supplied:heater', 'J', '外部供能'),
  n('metal-c', 'temperature:metal-tip', '°C', '金属远端温度'), n('plastic-c', 'temperature:plastic-tip', '°C', '塑料远端温度'),
  n('metal-rate-w', 'rate:metal-tip', 'W', '金属净传入功率'), n('plastic-rate-w', 'rate:plastic-tip', 'W', '塑料净传入功率'),
  { id: 'tip-comparison', from: 'compare:tips', label: l('Tip comparison', '远端温度比较'), kind: 'state', states: { 'first-warmer': l('Metal warmer', '金属较暖'), same: l('Same', '相同'), 'second-warmer': l('Plastic warmer', '塑料较暖') } },
  n('cool-c', 'temperature:cooler', '°C', '冷却水温'), n('cool-rate-w', 'rate:cooler', 'W', '冷却净传入功率'), n('cool-energy-j', 'energy:cooler', 'J', '冷却净传入能量'), n('cool-reservoir-j', 'reservoir-energy:cooler', 'J', '传至环境的净能量'),
  direction('cool-direction', 'cooler', '冷却方向'), direction('heated-direction', 'heater', '加热方向'), direction('metal-direction', 'metal-tip', '金属方向'), direction('plastic-direction', 'plastic-tip', '塑料方向'),
  n('rod-delta-mm', 'delta-mm:rod', 'mm', '杆伸长量'), n('rod-length-mm', 'length-mm:rod', 'mm', '杆长度'), n('heater-rate-w', 'rate:heater', 'W', '加热净传入功率'),
  n('heated-change-k', 'change:heater', 'K', '加热温差'), n('cool-change-k', 'change:cooler', 'K', '冷却温差'), n('heated-reservoir-j', 'reservoir-energy:heater', 'J', '加热传至热库能量'),
  n('metal-energy-j', 'energy:metal-tip', 'J', '金属净传入能量'), n('plastic-energy-j', 'energy:plastic-tip', 'J', '塑料净传入能量'),
];
export const heatSim = () => simSchema.parse({ kind: 'heat', controls: HEAT_CONTROLS, outputs: HEAT_OUTPUTS, bind: [], heat: heatBench });
