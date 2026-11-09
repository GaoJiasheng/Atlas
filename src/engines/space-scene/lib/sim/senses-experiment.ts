/** PLATE output grouping, independent of the optional senses model's schema metadata. */
export function sensesExperiment(from: string): 'eye-light' | 'eye-focus' | 'sound' | 'transmission' | 'echo' | null {
  if (['aperture-area', 'relative-light'].includes(from)) return 'eye-light';
  if (['image-distance', 'magnification', 'retinal-top-y', 'blur-diameter', 'focus-state', 'eye-state'].includes(from)) return 'eye-focus';
  if (['speed-mps', 'one-way-ms', 'propagation-state'].includes(from)) return 'transmission';
  if (from === 'echo-ms') return 'echo';
  return ['sound-state', 'source-drive', 'visual-hz', 'wavelength-scene', 'displacement-max', 'amplitude-level'].includes(from) ? 'sound' : null;
}
