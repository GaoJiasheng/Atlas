/** Exact cover exceptions listed in docs/69 §4.1.4, including its named risks.
 * Used inside Drawing so catalogue and frontispiece always agree, at both densities.
 * Chapter figures declare invert={false} at their call sites.
 */
export const PHYSICAL_TONE_COVERS = ['light-and-shadows', 'solar-system', 'sun-earth-moon'] as const;
export const coverInverts = (stem: string): boolean => !PHYSICAL_TONE_COVERS.some((name) => name === stem);
