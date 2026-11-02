/** Shared resource: the view suspends before orbit HUD hooks can read the session. */
let orbit: typeof import('./orbit-session') | undefined;
let pending: Promise<void> | undefined;
export function readOrbitRuntime(): typeof import('./orbit-session') {
  if (!orbit) throw (pending ??= import('./orbit-session').then(module => { orbit = module; }));
  return orbit;
}
export const getOrbitSession: typeof import('./orbit-session').getOrbitSession = (...args) => readOrbitRuntime().getOrbitSession(...args);
