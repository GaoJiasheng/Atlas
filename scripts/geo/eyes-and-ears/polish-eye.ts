/**
 * Build-time eye anatomy. Original surfaces, no scanned or copied geometry.
 * References viewed 2026-11-03: NEI How the Eyes Work (cross-section), and
 * Mcorrens, Iris of the Human Eye (Commons, CC BY-SA 3.0; reference only).
 * Mesh vertices are in the existing topic's scene frame, anterior toward −X.
 */
import { BufferGeometry, Float32BufferAttribute, CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

type Part = Record<string, any>;
type V = [number, number, number];
const TAU = Math.PI * 2;
const round = (n: number) => +n.toFixed(6) || 0;
const gauss = (x: number, width: number) => Math.exp(-((x / width) ** 2));
const angularDistance = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

/** Indexed surface with smooth averaged normals, including the angular seam. */
function surface(rows: number, cols: number, point: (u: number, v: number) => V, wrap = true): BufferGeometry {
  const positions: number[] = [], indices: number[] = [];
  const width = wrap ? cols : cols + 1;
  for (let j = 0; j <= rows; j++) for (let i = 0; i < width; i++) positions.push(...point(j / rows, i / cols));
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const next = wrap ? (i + 1) % cols : i + 1;
    const a = j * width + i, b = j * width + next, c = (j + 1) * width + next, d = (j + 1) * width + i;
    indices.push(a, d, b, b, d, c);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function merge(geometries: BufferGeometry[]): BufferGeometry {
  // All pieces have the same minimal attributes; static merging costs one mesh.
  const clean = geometries.map(g => {
    g.deleteAttribute('uv');
    return g.index ? g.toNonIndexed() : g;
  });
  const result = mergeGeometries(clean)!;
  for (const g of geometries) g.dispose();
  for (const g of clean) g.dispose();
  return result;
}

/** Relief is anatomical stroma: collarette, branching striae, crypts, furrows. */
function irisInsert(inner: number): BufferGeometry {
  const outer = .50;
  const radiusAt = (t: number) => inner + (outer - inner) * t;
  function relief(t: number, a: number): number {
    const collarette = .38 + .028 * Math.sin(7 * a + .6) + .015 * Math.sin(13 * a);
    const warp = a + .065 * Math.sin(4 * a + 4 * t) + .027 * Math.sin(11 * a - 3 * t)
      + .014 * Math.sin(19 * a + 8 * t);
    const amplitude = .38 + .62 * Math.pow(.5 + .5 * Math.sin(7 * a + 6 * t + Math.sin(13 * a)), 2);
    const fibres = amplitude * (.0012 * Math.sin(43 * warp + t * 5) + .0010 * Math.sin(71 * warp - t * 3)
      + .0008 * Math.sin(29 * warp + Math.sin(9 * t))) * Math.sin(Math.PI * t);
    let h = .016 * Math.sin(Math.PI * t) + .020 * gauss(t - collarette, .065) + fibres;
    // Discontinuous contraction furrows, rather than lathed circular grooves.
    h -= .0033 * gauss(t - (.78 + .017 * Math.sin(6 * a)), .018) * (.5 + .5 * Math.sin(3 * a + 1));
    h -= .0026 * gauss(t - (.90 + .012 * Math.sin(9 * a)), .014) * (.5 + .5 * Math.sin(5 * a));
    for (let k = 0; k < 15; k++) {
      const angle = k * 2.3999632297;
      const centre = .43 + .105 * Math.sin(k * 4.17);
      // Irregular elongated crypts divide the fine stromal fibres into broader
      // branching trabeculae; larger gaps prevent a regular diaphragm/fan look.
      const offset = angularDistance(a, angle + .052 * Math.sin(t * 9 + k));
      const width = .041 + .027 * (1 + Math.cos(k * 2.1)) / 2;
      const length = .095 + .045 * (1 + Math.sin(k * 1.9)) / 2;
      const depth = .016 + .010 * (1 + Math.sin(k * 3.3)) / 2;
      h -= depth * gauss(offset, width) * gauss(t - centre, length);
      // Raised, curved margins are unequal on the two sides of each crypt.
      h += .0045 * gauss(Math.abs(offset) - width * 1.15, .014)
        * gauss(t - centre, length * 1.25) * (.7 + .3 * Math.sin(k + t * 7));
    }
    // A fine pupillary ruff; the hole itself remains genuinely empty.
    h += .0025 * gauss(t, .025) * (.65 + .35 * Math.sin(57 * a));
    return Math.max(-.004, h);
  }
  const front = surface(40, 256, (t, v) => {
    const a = v * TAU, r = radiusAt(t);
    return [-2.69 - relief(t, a), r * Math.sin(a), r * Math.cos(a)];
  });
  const back = surface(1, 256, (t, v) => {
    const a = -v * TAU, r = radiusAt(t);
    return [-2.675, r * Math.sin(a), r * Math.cos(a)];
  });
  const walls = [inner, outer].map((r, i) => surface(1, 256, (t, v) => {
    const a = (i ? v : -v) * TAU;
    const xFront = -2.69 - relief(i, a);
    return [xFront + (-2.675 - xFront) * t, r * Math.sin(a), r * Math.cos(a)];
  }));
  return merge([front, back, ...walls]);
}

function ciliaryBody(): BufferGeometry {
  const pieces: BufferGeometry[] = [];
  // Back half opened at the same display plane as the pre-existing ciliary ring.
  // Continuous muscle body and varied inward folds (pars plicata), not beads.
  const body = surface(18, 168, (u, v) => {
    const cross = u * TAU, a = Math.PI / 2 + v * Math.PI;
    const process = Math.pow(.5 + .5 * Math.sin(63 * a + .32 * Math.sin(7 * a)), 3);
    const radial = .635 + .045 * Math.cos(cross) - .028 * process * Math.pow(Math.max(0, -Math.cos(cross)), 2);
    return [-2.45 + .048 * Math.sin(cross), radial * Math.sin(a), radial * Math.cos(a)];
  }, false);
  pieces.push(body);
  // Fine zonular bundles have staggered origins and two lens-equator insertions.
  // A reproducible aperiodic phase varies spacing, diameter and branching.
  for (let i = 0; i < 51; i++) {
    const angle = Math.PI / 2 + (i + .5 + .17 * Math.sin(i * 2.4)) / 51 * Math.PI;
    const root = .586 + .008 * Math.sin(i * 2.7);
    for (let branch = 0; branch < (i % 3 === 0 ? 3 : 2); branch++) {
      const delta = (branch - .5) * .009 + .003 * Math.sin(i * 1.3);
      const endAngle = angle + delta;
      const startX = -2.453 + .019 * Math.sin(i * 1.8);
      const endX = -2.47 + (branch === 0 ? -.018 : .025);
      const p = [new Vector3(startX, root * Math.sin(angle), root * Math.cos(angle)),
        new Vector3((startX + endX) / 2 + .003, .49 * Math.sin(angle + delta * .4), .49 * Math.cos(angle + delta * .4)),
        new Vector3(endX, .399 * Math.sin(endAngle), .399 * Math.cos(endAngle))];
      pieces.push(new TubeGeometry(new CatmullRomCurve3(p), 5, .00115 + .00035 * (1 + Math.sin(i * 4.4 + branch)) / 2, 6, false));
    }
  }
  return merge(pieces);
}

export function createEyeMeshes(): Record<string, BufferGeometry> {
  return { 'ciliary-ring': ciliaryBody(), 'iris-aperture-small': irisInsert(.12), 'iris-aperture-large': irisInsert(.24) };
}

const OPTIC_PATH: V[] = [[-1.15,.025,-.20],[-1.02,.02,-.23],[-.86,-.012,-.28],[-.64,-.06,-.34]];

/** Mutates only the existing eye parts and their signal route. No IDs added. */
export function polishEye(parts: Part[], data?: { flows?: Part[] }): void {
  const part = (id: string) => {
    const p = parts.find(p => p.id === id);
    if (!p) throw new Error(`Eye polish: missing ${id}`);
    return p;
  };
  const lathe = (at: V, profile: number[][], more: Part = {}): Part => ({kind:'lathe',at,profile,segments:64,rotation:[0,0,-90],color:'tissue',tint:'token:bone',...more});
  // A true spherical cap, with constant thin shell and a tangent-continuous apex.
  const corneaRadius = (.56 ** 2 + .35 ** 2) / (.35 * 2);
  const centre = -1.08 + corneaRadius;
  const arc = Math.asin(.56 / corneaRadius);
  const cap = Array.from({length:41}, (_,i) => {
    const a = arc * i / 40;
    return [round(corneaRadius * Math.sin(a)), round(centre - corneaRadius * Math.cos(a))];
  });
  const inner = [...cap].reverse().map(([r,x]) => [round(r! * .984), round(x! + .018)]);
  part('cornea').primitive = lathe([-2,0,0], [...cap,...inner,cap[0]!], {color:'glass',arc:178,segments:64});

  // Elliptic parametrisation keeps an actually rounded lens equator: a piecewise
  // square-root height profile would leave a pinched knife edge at the rim.
  const lensProfile = Array.from({length:73}, (_,i) => {
    const a = Math.PI * i / 72;
    const depth = Math.cos(a) >= 0 ? .128 : .172;
    return [round(.40 * Math.sin(a)), round(-depth * Math.cos(a))];
  });
  part('lens').primitive = lathe([-2.47,0,0], lensProfile, {color:'glass',tint:'token:bone',segments:64});
  // An extremely fine capsule edge gives the transparent lens a legible rim,
  // with ample gap behind the iris even in the retained near-view pose.
  const capsule = Array.from({length:25},(_,i)=>[round(.399 + .003 * Math.cos(i / 24 * TAU)),round(.006 * Math.sin(i / 24 * TAU))]);
  part('lens').extra = [lathe([-2.47,0,0], capsule, {color:'membrane',segments:64,arc:178})];

  // Round the selectable iris root; surface detail belongs to each aperture state.
  const irisRoot = Array.from({length:33},(_,i)=>[round(.516 + .021 * Math.cos(i / 32 * TAU)),round(.014 * Math.sin(i / 32 * TAU))]);
  part('iris').primitive = lathe([-2.68,0,0], irisRoot, {tint:'token:ink-2'});
  for (const id of ['ciliary-ring','iris-aperture-small','iris-aperture-large']) {
    const p = part(id);
    p.mesh = id;
    p.material = {color:'tissue',tint:id === 'ciliary-ring' ? 'token:muscle-2' : 'token:ink-2'};
    delete p.primitive;
    delete p.extra;
  }
  part('ciliary-ring').detail.en = part('ciliary-ring').detail.en.replace('The ring and a few radial fibres are enlarged schematic landmarks.', 'The folded ciliary body and fine suspensory bundles are enlarged anatomical landmarks.');
  part('ciliary-ring').detail.zh = part('ciliary-ring').detail.zh.replace('环与少量放射纤维是便于辨认的放大示意。', '有褶皱的睫状体与细悬韧带束是便于辨认的放大结构。');

  const nerve = part('optic-nerve');
  // The root sits against the retinal wall. A hemispherical end-cap would
  // protrude into the eye like a nipple, so this dissected nerve has flat ends.
  nerve.primitive = {kind:'sweep',at:OPTIC_PATH[0],path:OPTIC_PATH.map(v=>v.map((n,i)=>round(n-OPTIC_PATH[0]![i]!))),radius:[.119,.113,.101,.092],radial:24,segments:40,caps:'flat',color:'nerve',tint:'token:bone'};
  // A shallow, off-axis optic disc meets the retinal lining at the nerve root.
  const disc = Array.from({length:41},(_,i)=>[round(.115 * Math.sin(i / 40 * Math.PI)),round(.010 * Math.cos(i / 40 * Math.PI))]);
  nerve.extra = [lathe([-1.155,.025,-.20], disc, {color:'nerve',rotation:[0,10,-90],segments:48})];
  nerve.detail.en = nerve.detail.en.replace('The bundled tube and moving markers are schematic.', 'The optic disc and curved nerve bundle leave the posterior wall on its nasal side; the moving markers are schematic.');
  nerve.detail.zh = nerve.detail.zh.replace('束状管与移动标记都是示意。', '视盘与弯曲神经束从眼球后壁偏鼻侧的位置离开；移动标记是示意。');
  const flow = data?.flows?.find(f => f.id === 'optic-signal');
  if (flow) flow.path = OPTIC_PATH.map(v=>[...v]);
}
