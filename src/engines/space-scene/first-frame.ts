/**
 * The modules a topic's first frame loads beyond the View's shared chunks, read from its data (paths relative
 * to this engine): the simulation modules the host prepares with the data (core/loading-data.ts), the lazy HUD
 * and stage parts the first render shows, and the stage kits (stages/model3d/kits.ts). The build preloads them
 * from the topic page (scripts/lib/first-frame-preload.ts), so none is discovered late in a request chain, and
 * scripts/js-budget.ts counts them. Only `needsMotion` is browser code (SceneRoot); the rest runs in Node.
 */
import type { SpaceSceneData } from './schema';
import { jointOf } from './lib/rig-stage';
import { KIT_MODULES, stageKits } from './stages/model3d/kits';

/** Whether the stage drives joints, contractions or exercise poses (MotionDriver). */
export function needsMotion(file: Pick<SpaceSceneData['parts'], 'rig' | 'animations' | 'poses'>, fitness: SpaceSceneData['fitness']): boolean {
  return file.rig !== undefined || fitness !== undefined
    || file.animations.some((a) => a.kind === 'contract' || (a.kind === 'sequence' && (jointOf(a.target) !== null || a.keys.some((k) => k.contract !== undefined))))
    || Object.values(file.poses ?? {}).some((p) => Object.keys(p.contract).length > 0 || Object.keys(p.joints).length > 0);
}

const SOLVERS: Partial<Record<string, string>> = { 'life-cycle': 'lifecycle', magnet: 'magnet-solver', table: 'table-solver' };
const OVERLAYS: Partial<Record<string, string>> = {
  'force-arrows': 'ForceArrows', 'force-vectors': 'ForceVectors', 'energy-bars': 'EnergyBars', 'catalogue-sky': 'CatalogueSky',
  'paraxial-eye': 'SensesOverlays', 'longitudinal-wave': 'SensesOverlays', 'sound-echo-pulse': 'SoundEchoPulse', 'shadow-cast': 'ShadowCast',
};

export function firstFrameModules(data: Pick<SpaceSceneData, 'parts' | 'fitness'>): string[] {
  const file = data.parts, sim = file.sim;
  const out = new Set<string>();
  const hud = (name: string) => out.add(`hud/${name}.tsx`);
  const stage = (name: string) => out.add(`stages/model3d/${name}.tsx`);
  const explorer = (name: string) => out.add(`explorer/${name}.tsx`);
  const lib = (name: string) => out.add(`lib/sim/${name}.ts`);
  if (sim) {
    lib('sim-tools-runtime');
    lib(SOLVERS[sim.kind] ?? sim.kind);
    if (sim.bind.some((b) => 'part' in b && b.fill)) lib('part-fill-runtime');
    if ([...sim.controls, ...sim.outputs].some((field) => 'format' in field && field.format === 'time')) lib('time-text-runtime');
    explorer('TryIt');
    // The try-it card's own diagram (the same module as the top-right card's).
    if (sim.circuit?.diagram) hud('CircuitCard');
    if (sim.energy) hud('EnergyCard');
    if (sim.lifeCycle) hud('CycleCard');
    if (sim.sort) hud('KeyCard');
    if (sim.microscope) hud('MicroscopeField');
    if (sim.orbitRotation) { lib('orbit-session'); stage('OrbitSceneRoot'); stage('OrbitDriver'); } else stage('TimelineClock');
    if (sim.senses?.profile === 'sound-only') stage('SoundClock');
    if (sim.airfoil) explorer('AirfoilDriver');
    if (sim.bind.some((b) => 'part' in b && b.span)) stage('SpanDriver');
    if (sim.bind.some((b) => 'flow' in b && b.airfoilFlow)) stage('AirfoilFlow');
    if (sim.overlays.length) stage('SimOverlays');
    for (const overlay of sim.overlays) { const name = OVERLAYS[overlay.kind]; if (name) stage(name); }
    if (sim.overlays.some((o) => o.kind === 'energy-bars')) hud('EnergyBarLabels');
    if (sim.kind === 'senses') { hud('SensesStageLabel'); hud('SensesNotesContent'); }
    if (sim.kind === 'table') out.add('lib/table-index.ts');
  }
  hud(sim?.microscope ? 'MicroscopeField' : sim?.foodWeb ? 'FoodWebCard' : sim?.orbitRotation ? 'OrbitCard' : sim?.sort ? 'KeyCard'
    : sim?.lifeCycle ? 'CycleCard' : sim?.energy ? 'EnergyCard' : sim?.circuit?.diagram ? 'CircuitCard' : 'PartChainCard');
  if (file.sites) hud('SitesOverlay');
  if (file.groups.some((g) => g.scale)) hud('GroupScaleBars');
  if (file.views.insets?.length) hud('InsetFrames');
  if (file.animations.length) stage('AnimClocks');
  if (file.mechanisms?.length) stage('MechanismDriver');
  if (file.flows.length) stage('Flows');
  if (file.parts.some((p) => p.mesh)) stage('GltfSource');
  if (needsMotion(file, data.fitness)) stage('MotionDriver');
  if (file.rig && file.parts.some((p) => p.muscle === 'rectus-abdominis')) stage('LineaAlba');
  for (const kit of stageKits(file)) out.add(KIT_MODULES[kit]);
  return [...out];
}
