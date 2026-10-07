/** Material preset ids (mirrors MATERIAL_PRESETS in ../schema.ts, kept zod-free for the client). */
export const MATERIAL_PRESET_IDS = ['metal', 'plastic', 'copper', 'glass', 'rubber', 'matte'] as const;
export type MaterialPreset = (typeof MATERIAL_PRESET_IDS)[number];
