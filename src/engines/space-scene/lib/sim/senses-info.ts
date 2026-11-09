import type { SensesData } from '../../senses-schema';
export { sensesExperiment } from './senses-experiment';
export const SENSES_STATES: Readonly<Record<string, readonly string[]>> = {
  'focus-state': ['on-retina', 'before-retina', 'behind-retina'],
  'eye-state': ['dark', 'lit'], 'sound-state': ['still', 'vibrating'],
  'source-drive': ['off', 'amplitude-one', 'amplitude-two'], 'propagation-state': ['no-medium', 'source-off', 'transmitted'],
};
export const SENSES_NUMBERS = ['aperture-area', 'relative-light', 'image-distance', 'magnification', 'retinal-top-y', 'blur-diameter', 'visual-hz', 'wavelength-scene', 'displacement-max', 'amplitude-level'] as const;
export const SOUND_LAB_NULLABLE = ['speed-mps', 'one-way-ms', 'echo-ms'] as const;
export function sensesQuantity(from: string, data?: SensesData): 'number' | 'state' | null {
  if (data?.profile === 'sound-only' && (['focus-state','eye-state'].includes(from) || (SENSES_NUMBERS as readonly string[]).slice(0,6).includes(from))) return null;
  if ((SOUND_LAB_NULLABLE as readonly string[]).includes(from) || from === 'propagation-state') return data?.soundLab ? (from === 'propagation-state' ? 'state' : 'number') : null;
  return Object.prototype.hasOwnProperty.call(SENSES_STATES, from) ? 'state' : (SENSES_NUMBERS as readonly string[]).includes(from) ? 'number' : null;
}
