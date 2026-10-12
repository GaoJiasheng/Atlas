/**
 * The exercise mannequin (docs/06 动作模式数据手册; `views.exerciseBody`):
 * while an exercise plays, the topic's skin outline (its `context` part) is
 * drawn as a solid matte figure, so the body reads as a whole person, with
 * the region's muscles over it x-ray style.
 *
 * One opaque draw of the skinned skin mesh whose *depth* is pushed `PUSH`
 * metres away from the camera (colour and outline stay where they are): a
 * muscle within that depth under the skin (the near side's) passes the depth
 * test and draws over the figure, the far side's and anything behind the body
 * (a bench under the back, the floor, the far column) stay hidden, and the
 * figure's own surfaces keep their order (the skin mesh is a thin double
 * shell, so a back-face depth pass would cover the muscles). A bar held in
 * front of the body covers it.
 *
 * Matte (roughness .85, a quiet environment), one colour token
 * (`token:mannequin`: warm light grey on paper, mid grey on the dark plate),
 * eased in and out with the exercise; it casts the key light's shadow. The
 * skin's hands are left out (Hands.tsx draws the hands to match the grip).
 */
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DetachedBindMode, FrontSide, MeshStandardMaterial, SkinnedMesh, type Group, type Mesh, type Object3D } from 'three';
import type { PartShape } from './PartNode';
import type { ShapePiece } from './geometry';
import { keepAnimating, MAX_DT, useRuntime } from './runtime';
import { damp } from '../../lib/math';
import { pushDepth } from './pushDepth';
import { withoutHands } from './bodyGeometry';

/** Draw order: after the solid equipment (Equipment.tsx −2), before the muscles (0). */
export const MANNEQUIN_ORDER = -1;
/** Fade rate (~0.4 s). */
export const FADE_RATE = 9;

export function bindSkin(mesh: Mesh | null, piece: ShapePiece) {
  if (!(mesh instanceof SkinnedMesh) || !piece.skin) return;
  // Detached: the bind matrix stays the rest one (as the part's own skinned mesh, PartNode).
  mesh.bindMode = DetachedBindMode;
  mesh.bind(piece.skin.skeleton, piece.skin.bindMatrix);
  mesh.frustumCulled = false;
}

function Pass({ piece, material, order, castShadow }: { piece: ShapePiece; material: MeshStandardMaterial; order: number; castShadow: boolean }) {
  const ref = useRef<Mesh>(null);
  useLayoutEffect(() => bindSkin(ref.current, piece), [piece]);
  return piece.skin ? (
    <skinnedMesh ref={ref as React.Ref<SkinnedMesh>} geometry={piece.geometry} material={material} renderOrder={order} castShadow={castShadow} raycast={() => {}} dispose={null} />
  ) : (
    <mesh ref={ref} geometry={piece.geometry} material={material} renderOrder={order} castShadow={castShadow} raycast={() => {}} dispose={null} />
  );
}

export function Mannequin({ shape, color, on, hands }: { shape: PartShape; color: string; on: boolean; hands: readonly (Object3D | null)[] }) {
  const runtime = useRuntime();
  const paint = useMemo(() => pushDepth(new MeshStandardMaterial({ roughness: 0.85, metalness: 0, envMapIntensity: 0.35, side: FrontSide })), []);
  useEffect(() => () => paint.dispose(), [paint]);
  useEffect(() => {
    paint.color.set(color);
  }, [paint, color]);
  // The skin's own hands give way to the procedural ones (Hands.tsx).
  const pieces = useMemo(
    () =>
      shape.pieces
        .filter((p) => !p.lines)
        .map((p) => {
          const geometry = p.skin ? withoutHands(p.geometry, p.skin, hands) : p.geometry;
          return { piece: geometry === p.geometry ? p : { ...p, geometry }, derived: geometry !== p.geometry };
        }),
    [shape, hands],
  );
  useEffect(() => () => pieces.forEach((p) => p.derived && p.piece.geometry.dispose()), [pieces]);
  const group = useRef<Group>(null);
  const fade = useRef(0);
  useFrame((state, delta) => {
    const target = on ? 1 : 0;
    fade.current = damp(fade.current, target, FADE_RATE, Math.min(delta, MAX_DT));
    if (Math.abs(fade.current - target) < 0.004) fade.current = target;
    paint.opacity = fade.current;
    const transparent = fade.current < 0.999;
    if (paint.transparent !== transparent) {
      paint.transparent = transparent;
      paint.needsUpdate = true;
    }
    if (group.current) group.current.visible = fade.current > 0.004;
    if (fade.current !== target) {
      runtime.shadowDirty = true;
      keepAnimating(state.invalidate);
    }
  });
  return (
    <group ref={group} position={shape.position} visible={false}>
      <group quaternion={shape.quaternion} scale={shape.scale}>
        {pieces.map(({ piece }, i) => (
          <Pass key={i} piece={piece} material={paint} order={MANNEQUIN_ORDER} castShadow />
        ))}
      </group>
    </group>
  );
}
