/** One envelope marker, distinct from the air particles and their 250× clock. */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshBasicMaterial, SphereGeometry, type Mesh } from 'three';
import type { SimOverlay } from '../../sim-schema';
import type { StageBridge } from '../../bridge';
import type { StageLook } from './look';
import { resolveDataColor } from '../../lib/color';

export function SoundEchoPulse({ overlay, bridge, look }: { overlay: Extract<SimOverlay, { kind: 'sound-echo-pulse' }>; bridge: StageBridge; look: StageLook }) {
  const mesh = useRef<Mesh>(null);
  const geometry = useMemo(() => new SphereGeometry(.045, 16, 12), []);
  const material = useMemo(() => new MeshBasicMaterial({ color: resolveDataColor('token:en-sound', look.tokens, look.theme, '') }), [look]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    const m = mesh.current, echo = bridge.senses.soundLab?.echo;
    if (!m) return;
    m.visible = !!echo && echo.hiddenReason === null;
    const x = echo?.pathPosition ?? 0;
    m.position.set(overlay.origin[0] + overlay.axis[0] * x, overlay.origin[1] + overlay.axis[1] * x, overlay.origin[2] + overlay.axis[2] * x);
  });
  return <mesh ref={mesh} geometry={geometry} material={material} visible={false} raycast={() => {}} />;
}
