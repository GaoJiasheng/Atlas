import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Color, DoubleSide, MeshBasicMaterial, type Mesh } from 'three';
import type { SimOverlay } from '../../sim-schema';
import { resolveDataColor } from '../../lib/color';
import { damp, type Vec3 } from '../../lib/math';
import type { PartHandle } from './PartNode';
import { keepAnimating, MAX_DT } from './runtime';
import type { StageLook } from './look';
import { ARROW_LENGTH, ARROW_LIFT, ARROW_FLOOR, ARROW_VERTS, HEAD_L, arrowIndex, arrowLength, writeArrow } from './arrowGeometry';

export default function ForceArrows({
  overlay,
  value,
  on,
  handles,
  look,
  snapKey,
}: {
  overlay: Extract<SimOverlay, { kind: 'force-arrows' }>;
  value: number;
  on: boolean;
  handles: Map<string, PartHandle>;
  look: StageLook;
  snapKey: number;
}) {
  const ref = useRef<Mesh>(null);
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(2 * ARROW_VERTS * 3), 3));
    g.setIndex(arrowIndex());
    return g;
  }, []);
  const material = useMemo(() => new MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, side: DoubleSide }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  const pull = useMemo(() => new Color(resolveDataColor(overlay.pull ?? 'token:signal', look.tokens, look.theme, '#cc6328')), [overlay.pull, look]);
  const push = useMemo(() => new Color(resolveDataColor(overlay.push ?? 'token:cold', look.tokens, look.theme, '#4f7f8c')), [overlay.push, look]);
  const m = useRef({ v: value, fade: 0, snap: true, last: '' });
  useEffect(() => {
    m.current.snap = true;
  }, [snapKey]);
  const full = overlay.length ?? ARROW_LENGTH;
  const lift = overlay.lift ?? ARROW_LIFT;

  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const s = m.current;
    const snap = s.snap;
    s.snap = false;
    const a = handles.get(overlay.between[0]);
    const b = handles.get(overlay.between[1]);
    const shown = on && a !== undefined && b !== undefined && a.visible && b.visible && Math.abs(value) >= ARROW_FLOOR;
    s.v = snap ? value : damp(s.v, value, 7, dt);
    if (Math.abs(s.v - value) < 0.01) s.v = value;
    const fadeTo = shown ? 1 : 0;
    s.fade = snap ? fadeTo : damp(s.fade, fadeTo, 8, dt);
    if (Math.abs(s.fade - fadeTo) < 0.003) s.fade = fadeTo;
    const mesh = ref.current;
    if (!mesh) return;
    mesh.visible = s.fade > 0;
    material.opacity = s.fade;
    material.color.copy(s.v >= 0 ? pull : push);
    if (a && b && s.fade > 0) {
      const pa: Vec3 = [a.object.position.x + a.point[0], a.object.position.y + a.point[1] + lift, a.object.position.z + a.point[2]];
      const pb: Vec3 = [b.object.position.x + b.point[0], b.object.position.y + b.point[1] + lift, b.object.position.z + b.point[2]];
      const key = `${pa.join()}|${pb.join()}|${s.v}`;
      if (key !== s.last) {
        s.last = key;
        const span = Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]) || 1;
        const d: Vec3 = [(pb[0] - pa[0]) / span, (pb[1] - pa[1]) / span, (pb[2] - pa[2]) / span];
        const back: Vec3 = [-d[0], -d[1], -d[2]];
        const len = Math.max(arrowLength(s.v, full), HEAD_L * full * 0.5);
        const pos = geometry.getAttribute('position') as BufferAttribute;
        const arr = pos.array as Float32Array;
        // A pull points each arrow at the other part; a push points it away.
        writeArrow(arr, 0, pa, s.v >= 0 ? d : back, len, full);
        writeArrow(arr, ARROW_VERTS, pb, s.v >= 0 ? back : d, len, full);
        pos.needsUpdate = true;
        geometry.computeBoundingSphere();
      }
    }
    if (s.v !== value || s.fade !== fadeTo) keepAnimating(state.invalidate);
  });

  return <mesh ref={ref} geometry={geometry} material={material} renderOrder={3} frustumCulled={false} visible={false} />;
}


