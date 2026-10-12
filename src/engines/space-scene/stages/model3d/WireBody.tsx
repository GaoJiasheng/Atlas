/**
 * The wire figure (docs/06 动作模式数据手册 · body styles; `views.exerciseBody:
 * wire`, the default when the glb has a `skin-wire` node): while an exercise
 * plays the body reads as a technical schematic — the low-poly `skin-wire`
 * mesh's feature edges (creases over 20°, open borders) as ink hairlines at
 * 55 %, over a flat 8 % ink silhouette, with the region's muscles over it.
 *
 * Three draws of the same skinned mesh, each with its depth pushed back
 * (pushDepth.ts) so the near side's muscles pass in front of it:
 *  1. a depth-only pass (opaque, before the muscles): the figure hides its own
 *     far side and what lies behind it, as the mannequin does;
 *  2. the silhouette fill (transparent): only the front-most surface passes
 *     its depth test, so the fill is one even 8 % wash, not layered;
 *  3. the edges (transparent, pushed a little less, so they pass the depth
 *     pass and hide behind the muscles): hidden-line, never a mesh soup.
 *
 * A glb without `skin-wire` draws the skin outline decimated at load to
 * ~4 000 triangles (bodyGeometry.ts) instead. The skin's hands are left out
 * (Hands.tsx draws them). Eased in and out with the exercise; no shadow.
 */
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { LineBasicMaterial, MeshBasicMaterial, SkinnedMesh, type BufferGeometry, type Group, type Material, type Object3D } from 'three';
import type { PartShape } from './PartNode';
import type { ShapePiece } from './geometry';
import { keepAnimating, MAX_DT } from './runtime';
import { damp } from '../../lib/math';
import { PUSH, pushDepth } from './pushDepth';
import { bindSkin, FADE_RATE, MANNEQUIN_ORDER } from './Mannequin';
import { decimateSkinned, edgesOf, withoutHands } from './bodyGeometry';

/** Feature-edge crease angle (degrees). */
export const WIRE_CREASE = 20;
/** Ink opacity of the edges and of the silhouette fill. */
export const WIRE_LINE_OPACITY = 0.55;
export const WIRE_FILL_OPACITY = 0.08;
/** Triangles of the stand-in wire mesh (a glb without `skin-wire`). */
const STAND_IN_TRIANGLES = 4000;
/** The edges sit this much nearer than the depth pass (metres): in front of it, still behind a muscle under the skin. */
const EDGE_LEAD = 0.008;

/**
 * Skinned line segments: a SkinnedMesh the renderer draws as `LINES` (the
 * basic material skins lines like triangles), so the edges follow the bones
 * on the GPU as the figure's surfaces do.
 */
class SkinnedLines extends SkinnedMesh {
  constructor(geometry: BufferGeometry, material: Material) {
    super(geometry, material);
    const self = this as unknown as { isMesh: boolean; isLine: boolean; isLineSegments: boolean };
    self.isMesh = false;
    self.isLine = true;
    self.isLineSegments = true;
  }
}

interface WirePrep {
  piece: ShapePiece;
  fill: BufferGeometry;
  edges: BufferGeometry;
  /** Geometries made here (disposed with it). */
  owned: BufferGeometry[];
}

function prepare(shape: PartShape, standIn: boolean, hands: readonly (Object3D | null)[]): WirePrep | null {
  const piece = shape.pieces.find((p) => p.skin && !p.lines);
  if (!piece?.skin) return null;
  const owned: BufferGeometry[] = [];
  let fill = withoutHands(piece.geometry, piece.skin, hands);
  if (fill !== piece.geometry) owned.push(fill);
  if (standIn) {
    const low = decimateSkinned(fill, STAND_IN_TRIANGLES);
    owned.push(low);
    fill = low;
  }
  const edges = edgesOf(fill, WIRE_CREASE);
  owned.push(edges);
  return { piece, fill, edges, owned };
}

export function WireBody({
  shape,
  standIn,
  color,
  on,
  hands,
}: {
  /** The glb's `skin-wire` mesh, or the skin outline (`standIn`: decimated here). */
  shape: PartShape;
  standIn: boolean;
  /** Ink colour (token). */
  color: string;
  on: boolean;
  /** The hand joints' bones (their triangles are left out). */
  hands: readonly (Object3D | null)[];
}) {
  // Built when first shown (the stand-in's decimation takes a moment).
  const shown = useRef(false);
  if (on) shown.current = true;
  const wanted = shown.current;
  const prep = useMemo(() => (wanted ? prepare(shape, standIn, hands) : null), [wanted, shape, standIn, hands]);
  useEffect(() => () => prep?.owned.forEach((g) => g.dispose()), [prep]);

  const mats = useMemo(() => {
    const depth = pushDepth(new MeshBasicMaterial({ colorWrite: false }));
    const fill = pushDepth(new MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false }));
    const line = pushDepth(new LineBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false }), PUSH - EDGE_LEAD);
    return { depth, fill, line };
  }, []);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  useEffect(() => {
    mats.fill.color.set(color);
    mats.line.color.set(color);
  }, [mats, color]);

  const lines = useMemo(() => (prep ? new SkinnedLines(prep.edges, mats.line) : null), [prep, mats]);
  useLayoutEffect(() => {
    if (!lines || !prep) return;
    bindSkin(lines, prep.piece);
    lines.renderOrder = MANNEQUIN_ORDER;
    lines.raycast = () => {};
  }, [lines, prep]);
  const depthRef = useRef<SkinnedMesh>(null);
  const fillRef = useRef<SkinnedMesh>(null);
  useLayoutEffect(() => {
    if (!prep) return;
    bindSkin(depthRef.current, prep.piece);
    bindSkin(fillRef.current, prep.piece);
  }, [prep]);

  const group = useRef<Group>(null);
  const fade = useRef(0);
  useFrame((state, delta) => {
    const target = on && prep ? 1 : 0;
    fade.current = damp(fade.current, target, FADE_RATE, Math.min(delta, MAX_DT));
    if (Math.abs(fade.current - target) < 0.004) fade.current = target;
    mats.fill.opacity = WIRE_FILL_OPACITY * fade.current;
    mats.line.opacity = WIRE_LINE_OPACITY * fade.current;
    if (group.current) group.current.visible = fade.current > 0.004;
    if (fade.current !== target) keepAnimating(state.invalidate);
  });
  if (!prep) return null;
  return (
    <group ref={group} position={shape.position} visible={false}>
      <group quaternion={shape.quaternion} scale={shape.scale}>
        <skinnedMesh ref={depthRef} geometry={prep.fill} material={mats.depth} renderOrder={MANNEQUIN_ORDER} raycast={() => {}} dispose={null} />
        <skinnedMesh ref={fillRef} geometry={prep.fill} material={mats.fill} renderOrder={MANNEQUIN_ORDER} raycast={() => {}} dispose={null} />
        {lines && <primitive object={lines} dispose={null} />}
      </group>
    </group>
  );
}
