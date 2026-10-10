/** Material preset ids (mirrors MATERIAL_PRESETS in ../schema.ts, kept zod-free for the client). */
export const MATERIAL_PRESET_IDS = [
  'casing',
  'steel',
  'powder',
  'stainless',
  'copper',
  'rubber',
  'plastic',
  'glass',
  'enamel',
  'brass',
  'metal',
  'matte',
] as const;
export type MaterialPreset = (typeof MATERIAL_PRESET_IDS)[number];

/** The ten material families; `metal` and `matte` are aliases. */
export type MaterialFamily = Exclude<MaterialPreset, 'metal' | 'matte'>;

export const PRESET_ALIASES: Record<'metal' | 'matte', MaterialFamily> = { metal: 'steel', matte: 'plastic' };
