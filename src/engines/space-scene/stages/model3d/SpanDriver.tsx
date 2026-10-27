/** The geometry pass after all part frames and before labels/overlays. No clock. */
import { useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { PartsFile } from '../../schema';
import type { StageBridge } from '../../bridge';
import type { PartHandle } from './PartNode';
import { createSpanRuntime, updateSpan } from './spanRuntime';
import { useRuntime } from './runtime';

export function SpanDriver({ data, bridge, handles }: { data: PartsFile; bridge: StageBridge; handles: Map<string, PartHandle> }) {
  const runtime = useRuntime();
  const entries = useMemo(() => (data.sim?.bind ?? []).flatMap((b) => {
    if (!('part' in b) || !b.span || typeof b.part !== 'string') return [];
    const p = data.parts.find((p) => p.id === b.part)?.primitive;
    return [createSpanRuntime(b.part, b.span, p?.kind === 'cylinder' ? Math.max(p.size[0]!, p.size[1]!) : 0)];
  }), [data]);
  useLayoutEffect(() => {
    for (const entry of entries) bridge.spans.set(entry.part, entry.geometry);
    return () => { for (const entry of entries) bridge.spans.delete(entry.part); };
  }, [entries, bridge]);
  // Registration order at priority 0: all PartNodes above this component finish
  // first. Positive priorities would take over R3F's automatic render loop.
  useFrame(() => {
    for (const entry of entries) if (updateSpan(entry, handles)) { runtime.moved++; runtime.shadowDirty = true; }
  });
  return null;
}
