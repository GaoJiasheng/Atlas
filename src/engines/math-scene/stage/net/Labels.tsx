/**
 * The notes on a net (docs/39 §2.0, §3.2): folded all the way and not
 * closed, two pieces on one face ("2 faces here": drawn a little apart, a
 * double ink line), a face nothing covers (dashed, "nothing here"), a piece
 * too short or too long (its face dashed, "a gap here"), each with a hairline
 * leader to a note beside the drawing; the lengths in squares where faces
 * meet on a flat net (`dims`: the hinge drawn bold, the edge on each side
 * counted) and "once round the circle" along a curved face's long edge; a
 * sphere (a circle and its equator).
 */
import type { Locale } from '../../../core/types';
import { t } from '../../../../i18n';
import type { SolidSpec } from '../../schema';
import type { FoldResult, P2 } from '../../lib/net';
import { toScreen, type Fit } from '../../lib/project';
import { poseCamera, projectPose, sphereOf, worldFaces, type NetShape, type Pose, type SolidNet, type WorldFace } from '../../lib/net-view';
import { DashedFace, screenOf } from './Faces';
import type { Vec3 } from '../../lib/solid';

const centre = (pts: readonly P2[]): P2 => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
const NOTE_GAP = 26;

/** The faces of a folded net drawn dashed: a face nothing covers, a face only a piece of the wrong size covers (its gap shows). */
export function dashedFaces(shape: NetShape, result: FoldResult): { id: string; pts: Vec3[]; note: 'math.net.nothing' | 'math.net.gap' }[] {
  if (shape.kind !== 'poly') return [];
  const net = shape.net;
  const out: { id: string; pts: Vec3[]; note: 'math.net.nothing' | 'math.net.gap' }[] = [];
  for (const id of result.missing) {
    const f = net.target.find((x) => x.id === id);
    if (f) out.push({ id, pts: f.pts, note: 'math.net.nothing' });
  }
  const exactly = new Set(result.lands.filter((l, i) => l && result.exact[i]));
  for (const i of result.sizeMismatch) {
    const id = result.lands[i];
    if (!id || exactly.has(id) || out.some((d) => d.id === id)) continue;
    out.push({ id, pts: net.target.find((x) => x.id === id)!.pts, note: 'math.net.gap' });
  }
  return out;
}

export function NetNotes({ shape, result, faces, pose, fit, box, locale }: { shape: NetShape; result: FoldResult; faces: WorldFace[]; pose: Pose; fit: Fit; box: { x: number; y: number; w: number; h: number }; locale: Locale }) {
  if (shape.kind !== 'poly') return null;
  const notes: { at: P2; text: string }[] = [];
  for (const [, j] of result.overlaps) notes.push({ at: centre(screenOf(faces[j]!.pts, pose, fit)), text: t(locale, 'math.net.twoFaces') });
  for (const d of dashedFaces(shape, result)) notes.push({ at: centre(screenOf(d.pts, pose, fit)), text: t(locale, d.note) });
  // Notes beside the drawing (right, else left), top to bottom, apart.
  const xs = faces.flatMap((f) => screenOf(f.pts, pose, fit).map((p) => p[0]));
  const right = Math.max(...xs) + 28;
  const left = Math.min(...xs) - 28;
  const longest = Math.max(...notes.map((n) => n.text.length)) * 7.4;
  const onRight = right + longest <= box.x + box.w || left - longest < box.x;
  const sorted = [...notes].sort((a, b) => a.at[1] - b.at[1]);
  let y = -Infinity;
  const placed = sorted.map((n) => {
    y = Math.max(n.at[1], y + NOTE_GAP);
    return { ...n, y };
  });
  return (
    <g className="ms-net__notes">
      {/* Dashed over the drawing, the hidden-line way: an open face reads even at the back. */}
      {dashedFaces(shape, result).map((d) => (
        <DashedFace key={d.id} pts={d.pts} pose={pose} fit={fit} />
      ))}
      {placed.map((n, i) => {
        const x = onRight ? right : left;
        return (
          <g key={i} className="ms-net__note">
            <circle className="ms-net__note-dot" cx={n.at[0]} cy={n.at[1]} r={2.5} />
            <path className="ms-net__leader" d={`M${n.at[0]},${n.at[1]}L${x + (onRight ? -6 : 6)},${n.y}`} />
            <text x={x} y={n.y} dy="0.36em" textAnchor={onRight ? 'start' : 'end'}>
              {n.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** A length in squares (one decimal at most). */
const len = (v: number) => String(Math.round(v * 10) / 10);

export function NetDims({ shape, pose, fit, spec, defs, locale }: { shape: NetShape; pose: Pose; fit: Fit; spec: SolidNet; defs: string; locale: Locale }) {
  if (shape.kind === 'curved') {
    const strips = worldFaces(shape, pose).filter((f) => f.piece?.face === 'side');
    if (!strips.length) return null;
    const cone = spec.solid.type === 'cone';
    // Along the long edge (the rectangle's far edge, the fan's curved edge), a little inside it; the words inside too.
    const outer: Vec3[] = [...strips.map((f) => (cone ? f.pts[1]! : f.pts[3]!)), strips.at(-1)!.pts[2]!];
    const across: Vec3[] = cone ? outer.map(() => strips[0]!.pts[0]!) : [...strips.map((f) => f.pts[0]!), strips.at(-1)!.pts[1]!];
    const toward = (k: number) => outer.map((q, i) => [q[0] + (across[i]![0] - q[0]) * k, q[1] + (across[i]![1] - q[1]) * k, 0] as Vec3);
    const s = screenOf(toward(0.1), pose, fit);
    const words = screenOf(toward(0.28), pose, fit);
    const mid = words[Math.floor(words.length / 2)]!;
    return (
      <g className="ms-net__dims">
        <path className="ms-net__dim" d={`M${s.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}`} markerStart={`url(#${defs}-arrow)`} markerEnd={`url(#${defs}-arrow)`} />
        <text className="ms-net__dimtext" x={mid[0]} y={mid[1]} dy="0.36em" textAnchor="middle">
          {t(locale, 'math.net.onceRound')}
        </text>
      </g>
    );
  }
  if (shape.kind !== 'poly') return null;
  const net = shape.net;
  if (net.layout === 'cells') return null;
  const items = net.nodes.flatMap((n, i) => {
    if (!n.hinge || n.parent === null) return [];
    const [a, b] = n.hinge;
    const sideOf = (poly: P2[]) => {
      // The polygon's edge along the hinge: its whole length.
      for (let k = 0; k < poly.length; k++) {
        const p = poly[k]!;
        const q = poly[(k + 1) % poly.length]!;
        const d: P2 = [q[0] - p[0], q[1] - p[1]];
        const L = Math.hypot(d[0], d[1]);
        const off = (v: P2) => Math.abs((v[0] - p[0]) * d[1] - (v[1] - p[1]) * d[0]) / L;
        if (off(a) < 1e-7 && off(b) < 1e-7) return L;
      }
      return Math.hypot(b[0] - a[0], b[1] - a[1]);
    };
    const parent = net.nodes[n.parent]!;
    const hs = screenOf([[a[0], a[1], 0], [b[0], b[1], 0]], pose, fit);
    const m: P2 = [(hs[0]![0] + hs[1]![0]) / 2, (hs[0]![1] + hs[1]![1]) / 2];
    const toward = (poly: P2[]) => {
      const c = centre(screenOf(poly.map(([x, y]) => [x, y, 0]), pose, fit));
      const v: P2 = [c[0] - m[0], c[1] - m[1]];
      const L = Math.hypot(v[0], v[1]) || 1;
      return [m[0] + (v[0] / L) * 13, m[1] + (v[1] / L) * 13] as P2;
    };
    return [{ key: i, hinge: hs, mine: { at: toward(n.poly), text: len(sideOf(n.poly)) }, theirs: { at: toward(parent.poly), text: len(sideOf(parent.poly)) } }];
  });
  return (
    <g className="ms-net__dims">
      {items.map((it) => (
        <g key={it.key}>
          <path className="ms-net__hinge" d={`M${it.hinge[0]![0]},${it.hinge[0]![1]}L${it.hinge[1]![0]},${it.hinge[1]![1]}`} />
          {[it.mine, it.theirs].map((l, k) => (
            <text key={k} className="ms-net__dimtext" x={l.at[0]} y={l.at[1]} dy="0.36em" textAnchor="middle">
              {l.text}
            </text>
          ))}
        </g>
      ))}
    </g>
  );
}

/** A sphere: its outline and its equator (the far half dashed). */
export function SphereDrawing({ solid, pose, fit }: { solid: SolidSpec; pose: Pose; fit: Fit }) {
  const cam = poseCamera(pose);
  const { c, r } = sphereOf(solid);
  const [cx, cy] = toScreen(projectPose(c, pose, cam), fit);
  const R = r * fit.s;
  const ry = R * Math.abs(cam.c[2]);
  return (
    <g className="ms-net__sphere">
      <circle className="ms-net__fill ms-net__sphere-fill" cx={cx} cy={cy} r={R} />
      <path className="ms-net__dashed" d={`M${cx - R},${cy}A${R},${ry} 0 0 1 ${cx + R},${cy}`} />
      <path className="ms-net__edge" d={`M${cx - R},${cy}A${R},${ry} 0 0 0 ${cx + R},${cy}`} />
      <circle className="ms-net__edge" cx={cx} cy={cy} r={R} />
    </g>
  );
}
