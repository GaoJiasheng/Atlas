/** Measure built topic code, including the selected engine and its static import closure.
 * Run: pnpm tsx scripts/js-budget.ts [--dist dist] [--check] [topic ...]
 * KB means 1024 bytes. Each emitted file is gzipped separately (HTTP transfer size).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// space-scene is a ratchet (docs/02 target 300 KB): lowered as the 3D stage is split further, never raised.
export const BUDGET_KB: Readonly<Record<string, number>> = { 'space-scene': 509, 'math-scene': 300, 'time-scene': 481, simulation: 300 };
export interface Chunk { imports: string[]; dynamicImports: string[]; modules: string[] }
export interface BudgetResult { topic: string; engine: string; gzipKB: number; budgetKB: number; files: string[] }

export function staticClosure(roots: readonly string[], graph: Readonly<Record<string, Pick<Chunk, 'imports'>>>): string[] {
  const seen = new Set<string>();
  function visit(id: string) {
    if (seen.has(id)) return;
    const chunk = graph[id];
    if (!chunk) throw new Error(`Missing JS chunk: ${id}`);
    seen.add(id);
    chunk.imports.forEach(visit);
  }
  roots.forEach(visit);
  return [...seen].sort();
}

export function assertBudgets(results: readonly BudgetResult[]) {
  const over = results.filter((r) => !Number.isFinite(r.gzipKB) || r.gzipKB > r.budgetKB);
  if (over.length) throw new Error(over.map((r) => `${r.topic}: ${r.gzipKB.toFixed(2)} KB gz > ${r.budgetKB} KB (${r.engine})`).join('\n'));
}

const decode = (s: string) => s.replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&amp;', '&');
function asset(url: string): string {
  const at = url.indexOf('_astro/');
  if (at < 0) throw new Error(`Expected local built JS: ${url}`);
  return url.slice(at).split(/[?#]/)[0]!;
}

export function measureBudgets(dist = 'dist', topics?: readonly string[]): BudgetResult[] {
  const root = resolve(dist);
  if (!existsSync(resolve(root, 'en/topics'))) throw new Error(`Build first: ${root}/en/topics is missing`);
  const graph: Record<string, Chunk> = {};
  const code = new Map<string, string>();
  const engineEntries = new Map<string, string>();
  // The client graph records original module ownership so conditional lazy roots can be
  // counted without relying on hashed filenames. Older builds can still be measured.
  const manifest = resolve(root, '_astro/js-budget-graph.json');
  if (existsSync(manifest)) Object.assign(graph, JSON.parse(readFileSync(manifest, 'utf8')));
  for (const name of readdirSync(resolve(root, '_astro')).filter((n) => n.endsWith('.js'))) {
    const id = `_astro/${name}`;
    const source = readFileSync(resolve(root, id), 'utf8');
    code.set(id, source);
    const ast = ts.createSourceFile(id, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const imports: string[] = [], dynamicImports: string[] = [];
    const local = (s: string) => relative(root, resolve(root, dirname(id), s)).replaceAll('\\', '/');
    function walk(node: ts.Node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) imports.push(local(node.moduleSpecifier.text));
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) dynamicImports.push(local(node.arguments[0].text));
      if (ts.isObjectLiteralExpression(node)) {
        const props = node.properties.filter(ts.isPropertyAssignment);
        const engine = props.find((p) => p.name.getText(ast) === 'id');
        const load = props.find((p) => p.name.getText(ast) === 'load');
        if (engine && ts.isStringLiteral(engine.initializer) && load) {
          const match = load.initializer.getText(ast).match(/import\(["']([^"']+)["']\)/);
          if (match) engineEntries.set(engine.initializer.text, local(match[1]!));
        }
      }
      ts.forEachChild(node, walk);
    }
    walk(ast);
    // Astro removes CSS-only JS stubs after Rollup emits the graph. The actual
    // output imports are authoritative; module ownership comes from the graph.
    graph[id] = { imports, dynamicImports, modules: graph[id]?.modules ?? [] };
  }
  const moduleChunk = (suffix: string) => Object.entries(graph).find(([, c]) => c.modules.some((m) => m.endsWith(`/src/engines/${suffix}`)))?.[0];
  const gz = new Map([...code].map(([id, source]) => [id, gzipSync(source).length]));
  const slugs = topics?.length ? [...topics] : readdirSync(resolve(root, 'en/topics')).sort();
  return slugs.map((topic) => {
    const html = readFileSync(resolve(root, `en/topics/${topic}/index.html`), 'utf8');
    const engine = html.match(/data-engine="([^"]+)"/)?.[1];
    if (!engine || !(engine in BUDGET_KB)) throw new Error(`Missing engine for ${topic}`);
    const roots = new Set<string>();
    for (const match of html.matchAll(/(?:component-url|renderer-url|src)="([^"]+\.js(?:\?[^"]*)?)"/g)) roots.add(asset(decode(match[1]!)));
    for (const match of html.matchAll(/<link\b[^>]*rel="modulepreload"[^>]*href="([^"]+)"[^>]*>/g)) roots.add(asset(decode(match[1]!)));
    // Inline module scripts may have static imports too (e.g. service-worker registration).
    for (const match of html.matchAll(/<script\b[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/g)) {
      for (const imp of match[1]!.matchAll(/(?:from\s*|import\s*)["']([^"']+\.js)["']/g)) roots.add(asset(imp[1]!));
    }
    const data = JSON.parse(readFileSync(resolve(root, `topics/${topic}/data.json`), 'utf8'));
    let entry = moduleChunk(`${engine}/View.tsx`) ?? engineEntries.get(engine);
    if (engine === 'time-scene') {
      const mode = html.match(/temporalMode&quot;:\[0,&quot;([^&]+)&quot;/)?.[1];
      const view = mode === 'climatology' ? 'ClimatologyView' : mode === 'geography' ? 'GeographyView' : null;
      if (view) entry = moduleChunk(`time-scene/${view}.tsx`) ?? Object.keys(graph).find((id) => id.startsWith(`_astro/${view}.`));
    }
    if (!entry) throw new Error(`Missing built engine entry: ${engine}`);
    roots.add(entry);
    if (engine === 'space-scene') {
      const stage = moduleChunk('space-scene/stages/model3d/Model3DStage.tsx') ?? Object.keys(graph).find((id) => id.startsWith('_astro/Model3DStage.'));
      if (!stage) throw new Error('Missing Model3DStage');
      roots.add(stage);
    }
    if (engine === 'time-scene') {
      const mode = html.match(/temporalMode&quot;:\[0,&quot;([^&]+)&quot;/)?.[1];
      const name = mode === 'climatology' || mode === 'geography' ? 'stages/geo/climatologyController' : data.deepTime?.reconstruction ? 'reconstruction-map' : 'stages/geo/controller';
      const controller = moduleChunk(`time-scene/${name}.ts`) ?? Object.keys(graph).find(id => id.startsWith(`_astro/${name.split('/').at(-1)}.`));
      if (!controller) throw new Error(`Missing map controller for ${topic}`);
      roots.add(controller);
      if (data.deepTime) for (const name of ['ModernInset', 'deep-time-transport']) {
        const id = Object.keys(graph).find(id => id.startsWith(`_astro/${name}.`));
        if (id) roots.add(id);
      }
    }
    // Selected conditional feature roots are added below; never count unrelated dynamic imports.
    for (const suffix of firstScreenModules(engine, data, html)) {
      const id = moduleChunk(suffix);
      if (id) roots.add(id); // In an older/eager build it is already in the entry closure.
    }
    const files = staticClosure([...roots], graph);
    return { topic, engine, gzipKB: files.reduce((sum, id) => {
      const bytes = gz.get(id);
      if (bytes === undefined) throw new Error(`Missing built JS: ${id}`);
      return sum + bytes;
    }, 0) / 1024, budgetKB: BUDGET_KB[engine]!, files };
  });
}

function firstScreenModules(engine: string, data: any, html = ''): string[] {
  const modules: string[] = [];
  const add = (path: string) => modules.push(`${engine}/${path}`);
  if (engine === 'space-scene') {
    const file = data.parts, sim = file.sim;
    const stage = (name: string) => add(`stages/model3d/${name}.tsx`);
    const hud = (name: string) => add(`hud/${name}.tsx`);
    if (sim) {
      const model = ({ 'life-cycle': 'lifecycle', magnet: 'magnet-solver', table: 'table-solver' } as Record<string, string>)[sim.kind] ?? sim.kind;
      add(`lib/sim/${model}.ts`);
      add('explorer/TryIt.tsx');
      // The try-it card's own diagrams (each one fetched only for the sims that have it).
      if (sim.circuit?.diagram) hud('CircuitCard');
      if (sim.energy) hud('EnergyCard');
      if (sim.lifeCycle) hud('CycleCard');
      if (sim.sort) hud('KeyCard');
      if (sim.microscope) hud('MicroscopeField');
      if (sim.airfoil) { add('explorer/AirfoilPlot.tsx'); add('explorer/AirfoilPressure.tsx'); }
      if (/&quot;curve&quot;:\[0,\{&quot;x&quot;/.test(html)) add('explorer/TryCurve.tsx');
      if (!sim.orbitRotation) stage('TimelineClock');
      if (sim.orbitRotation) { stage('OrbitSceneRoot'); stage('OrbitDriver'); add('lib/sim/orbit-session.ts'); }
      if (sim.senses?.profile === 'sound-only') stage('SoundClock');
      if (sim.airfoil) add('explorer/AirfoilDriver.tsx');
      if (sim.bind.some((b: any) => 'part' in b && b.span)) stage('SpanDriver');
      if (sim.bind.some((b: any) => 'flow' in b && b.airfoilFlow)) stage('AirfoilFlow');
      if (sim.overlays.length) stage('SimOverlays');
      const overlayModules: Record<string, string> = { 'force-arrows': 'ForceArrows', 'force-vectors': 'ForceVectors', 'energy-bars': 'EnergyBars', 'catalogue-sky': 'CatalogueSky', 'paraxial-eye': 'SensesOverlays', 'longitudinal-wave': 'SensesOverlays', 'sound-echo-pulse': 'SoundEchoPulse', 'shadow-cast': 'ShadowCast' };
      for (const overlay of sim.overlays) if (overlayModules[overlay.kind]) stage(overlayModules[overlay.kind]!);
      if (sim.overlays.some((o: any) => o.kind === 'energy-bars')) hud('EnergyBarLabels');
      if (sim.kind === 'senses') { hud('SensesStageLabel'); hud('SensesNotesContent'); }
    }
    hud(sim?.microscope ? 'MicroscopeField' : sim?.foodWeb ? 'FoodWebCard' : sim?.orbitRotation ? 'OrbitCard' : sim?.sort ? 'KeyCard' : sim?.lifeCycle ? 'CycleCard' : sim?.energy ? 'EnergyCard' : sim?.circuit?.diagram ? 'CircuitCard' : 'PartChainCard');
    if (file.sites) hud('SitesOverlay');
    if (file.groups.some((g: any) => g.scale)) hud('GroupScaleBars');
    if (file.views.insets?.length) hud('InsetFrames');
    if (file.animations.length) stage('AnimClocks');
    if (file.mechanisms?.length) stage('MechanismDriver');
    if (file.flows.length) stage('Flows');
    if (file.parts.some((p: any) => p.mesh)) stage('GltfSource');
    // Stage kits (stages/model3d/kits.ts) the stage waits for before it renders.
    if (file.rig) add('stages/model3d/bodyKit.ts');
    if (sim?.magnet || file.parts.some((p: any) => p.primitive?.kind === 'filings' || p.extra?.some((e: any) => e.kind === 'filings'))) add('lib/sim/field.ts');
    const moving = file.rig || data.fitness || file.animations.some((a: any) => a.kind === 'contract' || (a.kind === 'sequence' && (a.target.startsWith('joint:') || a.keys.some((k: any) => k.contract)))) || Object.values(file.poses ?? {}).some((p: any) => Object.keys(p.contract ?? {}).length || Object.keys(p.joints ?? {}).length);
    if (moving) stage('MotionDriver');
    // GLTF body helpers are requested only when the topic contains exercise poses.
    if (file.rig && data.training) { stage('Mannequin'); stage('WireBody'); stage('Hands'); stage('Equipment'); }
  } else if (engine === 'math-scene') {
    const model = data.lesson?.steps[0]?.beats[0]?.model;
    const kind = model?.kind ?? data.lesson?.steps[0]?.views[0] ?? 'bar';
    const models: Record<string, string> = { bar: 'BarModel', circle: 'CircleModel', numberline: model?.scale === 'whole' ? 'WholeLine' : model?.scale === 'decimal' ? 'DecimalLine' : 'NumberLine', wall: 'Rows', barmodel: 'BarModelDiagram', array: 'ArrayModel', blocks: 'BlocksModel', 'decimal-grid': 'DecimalGrid', 'place-value': 'PlaceValueChart', money: 'MoneyModel', instrument: 'Instrument', clock: 'ClockModel', timeline: 'Timeline', net: 'NetModel' };
    if (models[kind]) add(`stage/${models[kind]}.tsx`);
  }
  return modules;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const distAt = args.indexOf('--dist');
  const dist = distAt < 0 ? 'dist' : args.splice(distAt, 2)[1]!;
  const check = args.includes('--check');
  const topics = args.filter((arg) => arg !== '--check');
  const results = measureBudgets(dist, topics);
  for (const r of results) console.log(`${r.topic.padEnd(30)} ${r.engine.padEnd(12)} ${r.gzipKB.toFixed(2).padStart(7)} KB gz / ${r.budgetKB} KB${r.gzipKB > r.budgetKB ? ' OVER' : ''}`);
  if (check) assertBudgets(results);
}
