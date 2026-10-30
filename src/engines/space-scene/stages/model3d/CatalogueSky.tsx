/** Independently loaded catalogue. Points and original links meet only in memory. */
import { useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei/web/Html';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { SimData, SimOverlay, SimValues } from '../../sim-schema';
import type { StageBridge } from '../../bridge';
import type { PartHandle } from './PartNode';
import type { StageLook } from './look';
import { resolveDataColor } from '../../lib/color';
import { parseStarCatalogue, skySnapshot, type StarCatalogue } from '../../lib/sim/solar-sky';
import type { SolarSystem } from '../../solar-system-schema';
import { useRuntime } from './runtime';
type Overlay = Extract<SimOverlay, {
    kind: 'catalogue-sky';
}>;
export function CatalogueSky({ overlay, sim, values, on, look, bridge, handles }: {
    overlay: Overlay;
    sim: SimData;
    values: SimValues;
    on: boolean;
    look: StageLook;
    bridge: StageBridge;
    handles: Map<string, PartHandle>;
}) {
    const runtime = useRuntime();
    const [catalogue, setCatalogue] = useState<StarCatalogue | null>(null), [error, setError] = useState(false), [retry, setRetry] = useState(0);
    const invalidate = useThree(s => s.invalidate);
    const c = sim.solarSystem!;
    useEffect(() => { let active = true; setError(false); setCatalogue(null); fetch(`${import.meta.env.BASE_URL}catalogues/solar-system/${overlay.catalogue}`).then(r => { if (!r.ok)
        throw new Error('catalogue load failed'); return r.json(); }).then(v => { const data = parseStarCatalogue(v, c.patterns); if (active) {
        setCatalogue(data);
        invalidate();
    } }).catch(() => { if (active) {
        setError(true);
        invalidate();
    } }); return () => { active = false; }; }, [overlay.catalogue, c, retry, invalidate]);
    const sky = useMemo(() => catalogue ? skySnapshot(c, values, catalogue, overlay.radius) : null, [c, values, catalogue, overlay.radius]);
    const data = useMemo(() => { const points: number[] = [], lines: number[] = []; if (sky) {
        for (const s of sky.rows)
            if (s.shown)
                points.push(...s.position);
        if (values[c.controls.patternLinks] === true && !sky.depth) {
            const target = String(values[c.controls.skyTarget]) as keyof SolarSystem['patterns'];
            const byHip = new Map(sky.rows.map(s => [s.hip, s]));
            for (const [a, b] of c.patterns[target]) {
                const A = byHip.get(a), B = byHip.get(b);
                if (A?.shown && B?.shown)
                    lines.push(...A.position, ...B.position);
            }
        }
    } const pg = new BufferGeometry(), lg = new BufferGeometry(); pg.setAttribute('position', new Float32BufferAttribute(points, 3)); lg.setAttribute('position', new Float32BufferAttribute(lines, 3)); return { pg, lg }; }, [sky, c, values]);
    useEffect(() => () => { data.pg.dispose(); data.lg.dispose(); }, [data]);
    useEffect(() => { bridge.solarSky = { status: error ? 'error' : sky ? 'ready' : 'loading', ...(sky ? { utc: sky.utc, latitude: sky.latitude, depth: sky.depth, rows: sky.rows } : {}) }; }, [sky, error, bridge]);
    const anchors = useMemo(() => { const result = new Map<string, number[]>(); if (!sky)
        return result; for (const [target, edges] of Object.entries(c.patterns)) {
        const hip = new Set(edges.flat());
        const selected = sky.rows.filter(s => hip.has(s.hip) && s.shown);
        if (selected.length) {
            const mean = selected.reduce((p, s) => p.map((v, i) => v + s.position[i]!), [0, 0, 0]).map(v => v / selected.length);
            result.set(`${target}-pattern`, mean);
            if (values[c.controls.skyTarget] === target) {
                result.set('sky-stars', mean);
                result.set('depth-stars', mean);
            }
        }
    } return result; }, [sky, c, values]);
    useFrame(() => { if (!on || values[c.controls.lab] !== 'sky')
        return; for (const [id, p] of anchors) {
        const h = handles.get(id);
        if (!h)
            continue;
        if (h.object.position.x !== p[0] || h.object.position.y !== p[1] || h.object.position.z !== p[2])
            runtime.moved++;
        h.object.position.set(p[0]!, p[1]!, p[2]!);
        h.object.updateWorldMatrix(true, true);
        h.point[0] = h.point[1] = h.point[2] = 0;
        h.offset[0] = h.offset[1] = h.offset[2] = 0;
    } });
    const shown = on && values[c.controls.lab] === 'sky';
    const color = resolveDataColor('token:ink', look.tokens, look.theme);
    return <group visible={shown}>{sky && <><points geometry={data.pg} frustumCulled={false}><pointsMaterial color={color} size={.075} sizeAttenuation transparent depthWrite={false} toneMapped={false}/></points><lineSegments geometry={data.lg} frustumCulled={false}><lineBasicMaterial color={resolveDataColor('token:signal', look.tokens, look.theme)} transparent opacity={.65} toneMapped={false}/></lineSegments></>}{shown && (error || !sky) && <Html center><div style={{ background: 'var(--panel-solid)', color: 'var(--ink)', padding: '12px', whiteSpace: 'nowrap' }}>{error ? <button style={{ minHeight: 44 }} onClick={() => setRetry(v => v + 1)}>Retry star catalogue / 重试星表</button> : 'Loading star catalogue / 正在载入星表'}</div></Html>}</group>;
}
