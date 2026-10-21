/**
 * The faces of a net in one pose (docs/39 §3.2): painted back to front
 * (`lib/project.ts paintOrder`), each a paper fill with a 1 px ink outline;
 * the inside of the card a lighter fill so a half-folded net reads inside
 * from outside; a colour (a pair ● ▲ ■, a tone, the face given, the child's
 * face) laid over the fill; a curved face as strips with only its own edges
 * and its silhouette drawn; the answer ("Show me") dashed. Shared by the
 * beat, the check, a set of pictures and an option's picture.
 */
import type { ReactNode } from 'react';
import type { Vec3 } from '../../lib/solid';
import { facesViewer, paintOrder, toScreen, type Fit } from '../../lib/project';
import { poseCamera, projectPose, worldFaces, type NetShape, type Pose, type WorldFace } from '../../lib/net-view';
import type { P2 } from '../../lib/net';

export type FaceTone = 'cold' | 'hot' | 'signal' | 'pair-1' | 'pair-2' | 'pair-3' | 'given' | 'placed';

export interface FaceLook {
  tone: FaceTone | null;
  /** Printed at the face's centre: a pair's mark, a letter, a number, a name. */
  mark: string | null;
  /** "Show me": the face drawn dashed. */
  ghost: boolean;
}

/** A face's corners on the screen. */
export const screenOf = (pts: readonly Vec3[], pose: Pose, fit: Fit): P2[] => {
  const cam = poseCamera(pose);
  return pts.map((p) => toScreen(projectPose(p, pose, cam), fit));
};

const path = (pts: readonly P2[], close = true) => `M${pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('L')}${close ? 'Z' : ''}`;
const centre = (pts: readonly P2[]): P2 => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
/** A polygon's area on the screen (for the size of its mark). */
const area = (pts: readonly P2[]) => Math.abs(pts.reduce((s, p, i) => s + p[0] * pts[(i + 1) % pts.length]![1] - pts[(i + 1) % pts.length]![0] * p[1], 0)) / 2;

export interface FacesProps {
  shape: NetShape;
  pose: Pose;
  fit: Fit;
  /** How each face looks (`node` for a polyhedron's piece; a curved piece by its face). */
  look(f: WorldFace): FaceLook;
  /** Faces moved off their place (two on one face, drawn a little apart). */
  faces?: WorldFace[];
}

export function NetFaces({ shape, pose, fit, look, faces: given }: FacesProps): ReactNode {
  const faces = given ?? worldFaces(shape, pose);
  const cam = poseCamera(pose);
  const order = paintOrder(faces.map((f) => f.pts), cam);
  const screen = faces.map((f) => screenOf(f.pts, pose, fit));
  const out = faces.map((f) => facesViewer(f.outside, cam));
  // A curved face: the line between two strips that face different ways is its silhouette.
  const silhouette = (i: number): P2[] | null => {
    const f = faces[i]!;
    const k = f.piece?.strip;
    if (k === undefined || !out[i]) return null;
    const next = faces.findIndex((g) => g.piece?.strip === k + 1 && g.piece.face === f.piece!.face);
    const prev = faces.findIndex((g) => g.piece?.strip === k - 1 && g.piece.face === f.piece!.face);
    const s = screen[i]!;
    const cone = s.length === 3;
    const lines: P2[] = [];
    if (next >= 0 && !out[next]) lines.push(...(cone ? [s[2]!, s[0]!] : [s[1]!, s[2]!]));
    if (prev >= 0 && !out[prev]) lines.push(...(cone ? [s[0]!, s[1]!] : [s[3]!, s[0]!]));
    return lines.length ? lines : null;
  };
  return (
    <g className="ms-net__faces">
      {order.map((i) => {
        const f = faces[i]!;
        const s = screen[i]!;
        const l = look(f);
        const curved = !!f.piece;
        const edges = f.outline.map((k) => [s[k]!, s[(k + 1) % s.length]!] as [P2, P2]);
        const sil = silhouette(i);
        const c = centre(s);
        const size = Math.sqrt(area(s));
        return (
          <g key={i} className="ms-net__face" data-side={out[i] ? 'out' : 'in'} data-tone={l.tone ?? undefined} data-curved={curved || undefined} data-ghost={l.ghost || undefined}>
            <path className="ms-net__fill" d={path(s)} />
            {l.tone && <path className="ms-net__tint" d={path(s)} />}
            <path className="ms-net__edge" d={curved ? edges.map(([a, b]) => path([a, b], false)).join('') : path(s)} />
            {sil && <path className="ms-net__edge" d={Array.from({ length: sil.length / 2 }, (_, k) => path([sil[2 * k]!, sil[2 * k + 1]!], false)).join('')} />}
            {l.mark && size > 18 && (
              <text className="ms-net__mark" x={c[0]} y={c[1]} dy="0.36em" textAnchor="middle" fontSize={Math.max(12, Math.min(28, size * 0.32))} aria-hidden="true">
                {l.mark}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Lines on the ground (squared paper, the flat outline), projected. */
export function GroundLines({ lines, pose, fit, className }: { lines: [Vec3, Vec3][]; pose: Pose; fit: Fit; className: string }) {
  if (!lines.length) return null;
  const d = lines.map(([a, b]) => path(screenOf([a, b], pose, fit), false)).join('');
  return <path className={className} d={d} />;
}

/** A polygon dashed in ink (an open face, the answer). */
export function DashedFace({ pts, pose, fit, className = 'ms-net__dashed' }: { pts: Vec3[]; pose: Pose; fit: Fit; className?: string }) {
  return <path className={className} d={path(screenOf(pts, pose, fit))} />;
}
