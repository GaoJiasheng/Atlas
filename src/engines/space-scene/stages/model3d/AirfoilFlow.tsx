/** airfoilFlow provider of the existing flow layer: same GPU points material, time-sampled paths. */
import { useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { useFrame } from '@react-three/fiber';
import {
  BufferGeometry,
  BufferAttribute,
  LineBasicMaterial,
  type Group,
  type PerspectiveCamera,
} from 'three';
import type { Flow, PartsFile } from '../../schema';
import type { SimValues } from '../../sim-schema';
import type { SpaceUiStore } from '../../ui';
import type { StageBridge } from '../../bridge';
import type { StageLook } from './look';
import { resolveDataColor } from '../../lib/color';
import { airfoilInputKey } from '../../lib/sim/airfoil-cache';
import { segmentClear, separationLines } from '../../lib/sim/airfoil-field';
import {
  createFlowMaterial,
  setFlowStops,
  styleFlowMaterial,
} from './flowMaterial';
import { keepAnimating, MAX_DT, prefersReducedMotion } from './runtime';
import { solveAirfoil } from '../../lib/sim/airfoil';
export function AirfoilFlow({
  file,
  flow,
  ui,
  bridge,
  look,
  values,
  on,
  linesOn,
  run,
}: {
  file: PartsFile;
  flow: Flow;
  ui: SpaceUiStore;
  bridge: StageBridge;
  look: StageLook;
  values: SimValues;
  on: boolean;
  linesOn: boolean;
  run: boolean;
}) {
  const selected = useStore(ui, (s) => s.airfoilSelected),
    snapshot = useStore(ui, (s) => s.airfoil),
    launch = useStore(ui, (s) => s.airfoilLaunch),
    d = file.sim!.airfoil!,
    inputKey = airfoilInputKey(d, values);
  const field = snapshot?.inputKey === inputKey ? snapshot.field : null;
  const angle = values[d.angle] as number,
    scalar = solveAirfoil(d, values),
    ref = useRef<Group>(null),
    clock = useRef(0);
  const data = useMemo(() => {
    const origin = d.section.origin,
      c = d.chord,
      z = origin[2] + 0.062;
    const world = (x: number, y: number) => [
      origin[0] + x * c,
      origin[1] + y * c,
      z,
    ];
    const paths = field?.paths ?? [],
      baked = paths.map((p) => {
        const points = new Float32Array((p.xy.length / 2) * 3);
        for (let j = 0; j < p.xy.length / 2; j++)
          points.set(world(p.xy[j * 2]!, p.xy[j * 2 + 1]!), j * 3);
        return {
          points,
          count: points.length / 3,
          length: p.tau[p.tau.length - 1]!,
          closed: false,
        };
      });
    const hair: number[] = [],
      deco: number[] = [];
    paths.forEach((p) => {
      for (let j = 2; j < p.xy.length; j += 2)
        hair.push(
          ...world(p.xy[j - 2]!, p.xy[j - 1]!),
          ...world(p.xy[j]!, p.xy[j + 1]!),
        );
    });
    if (field?.separation)
      for (const path of separationLines(angle))
        for (let j = 1; j < path.length; j++)
          if (j % 4 < 2 && segmentClear(path[j - 1]!, path[j]!, angle))
            deco.push(...world(...path[j - 1]!), ...world(...path[j]!));
    if (angle !== 0)
      for (let j = 0; j < 32; j++) {
        const a = (((-angle * Math.PI) / 180) * j) / 32,
          b = (((-angle * Math.PI) / 180) * (j + 1)) / 32;
        deco.push(
          ...world(0.25 + 0.16 * Math.cos(a), 0.16 * Math.sin(a)),
          ...world(0.25 + 0.16 * Math.cos(b), 0.16 * Math.sin(b)),
        );
      }
    const geometry = (a: number[]) => {
      const g = new BufferGeometry();
      g.setAttribute('position', new BufferAttribute(new Float32Array(a), 3));
      return g;
    };
    if (!linesOn && field?.pressure) {
      const p = field.pressure[selected]!.xy;
      const r = 0.012;
      deco.push(
        ...world(p[0] - r, p[1]),
        ...world(p[0] + r, p[1]),
        ...world(p[0], p[1] - r),
        ...world(p[0], p[1] + r),
      );
    }
    const n = paths.length * 8,
      pg = new BufferGeometry(),
      offset = new Float32Array(n),
      pathIndex = new Float32Array(n),
      rank = new Float32Array(n);
    for (let k = 0; k < paths.length; k++)
      for (let j = 0; j < 8; j++) {
        const i = k * 8 + j;
        pathIndex[i] = k;
        offset[i] = j / 8;
        rank[i] = j === 0 ? -1 : 0;
      }
    pg.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(n * 3), 3),
    );
    pg.setAttribute('aOffset', new BufferAttribute(offset, 1));
    pg.setAttribute('aPath', new BufferAttribute(pathIndex, 1));
    pg.setAttribute('aRank', new BufferAttribute(rank, 1));
    pg.setAttribute(
      'aSeed',
      new BufferAttribute(new Float32Array(n).fill(0.5), 1),
    );
    return {
      baked,
      hair: geometry(hair),
      deco: geometry(deco),
      particles: pg,
      paths,
    };
  }, [field, d, angle, linesOn, selected]);
  const material = useMemo(
    () => (data.baked.length ? createFlowMaterial(data.baked, true) : null),
    [data],
  );
  const line = useMemo(
      () =>
        new LineBasicMaterial({
          transparent: true,
          opacity: 0.5,
          toneMapped: false,
          depthWrite: false,
        }),
      [],
    ),
    decoration = useMemo(
      () => new LineBasicMaterial({ toneMapped: false, depthWrite: false }),
      [],
    );
  useEffect(() => {
    const hex = resolveDataColor(flow.color, look.tokens, look.theme);
    line.color.set(hex);
    decoration.color.set(
      resolveDataColor('token:signal', look.tokens, look.theme),
    );
    if (material) {
      setFlowStops(material, [[0, hex]]);
      styleFlowMaterial(material, look.theme === 'cinema', flow.size, true);
      material.uniforms.uAirfoil.value = 1;
      material.uniforms.uMarkerColor.value.copy(decoration.color);
      data.paths.forEach(
        (p, k) =>
          (material.uniforms.uTauEnd.value[k] = p.tau[p.tau.length - 1]!),
      );
    }
  }, [look, flow, material, line, decoration, data]);
  useEffect(
    () => () => {
      data.hair.dispose();
      data.deco.dispose();
      data.particles.dispose();
      material?.dispose();
    },
    [data, material],
  );
  useEffect(
    () => () => {
      line.dispose();
      decoration.dispose();
    },
    [line, decoration],
  );
  useEffect(() => {
    clock.current = 0;
    bridge.airfoilPulse = 0;
    bridge.invalidate();
  }, [inputKey, launch, bridge]);
  const shown = useMemo(
    () => Object.fromEntries(data.paths.map((p) => [p.id, { visible: false }])),
    [data],
  );
  useEffect(() => {
    bridge.flowPaths.set(flow.id, shown);
    return () => {
      bridge.flowPaths.delete(flow.id);
    };
  }, [bridge, flow.id, shown]);
  useFrame((state, delta) => {
    const visible = on && !!field;
    if (ref.current) ref.current.visible = visible;
    const moving =
      visible &&
      linesOn &&
      run &&
      scalar.mode === 'ideal-attached' &&
      !prefersReducedMotion();
    if (moving)
      clock.current += (Math.min(delta, MAX_DT) * scalar.speed) / d.chord / 80;
    bridge.airfoilPulse = 0;
    if (material) {
      const u = material.uniforms;
      let max = 0;
      for (let k = 0; k < data.paths.length; k++) {
        const p = data.paths[k]!,
          end = p.tau[p.tau.length - 1]!;
        max = Math.max(max, end);
        u.uPhase.value[k] = (clock.current / end) % 1;
        u.uAlpha.value[k] =
          visible && linesOn && p.status === 'complete' ? 1 : 0;
        shown[p.id]!.visible = visible && linesOn;
      }
      u.uPulse.value = clock.current % (max + 1);
      bridge.airfoilPulse = u.uPulse.value;
      u.uOpacity.value = 1;
      const cam = state.camera as PerspectiveCamera;
      u.uScale.value =
        (state.size.height * state.viewport.dpr) /
        (2 * Math.tan(((cam.fov ?? 40) * Math.PI) / 360));
    }
    if (moving) keepAnimating(state.invalidate);
  });
  return (
    <group ref={ref} visible={on && !!field}>
      <lineSegments
        geometry={data.hair}
        material={line}
        visible={linesOn}
        dispose={null}
      />
      <lineSegments geometry={data.deco} material={decoration} dispose={null} />
      {material && (
        <points
          geometry={data.particles}
          material={material}
          frustumCulled={false}
          dispose={null}
        />
      )}
    </group>
  );
}
