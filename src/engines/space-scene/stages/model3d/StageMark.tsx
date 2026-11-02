/** Marks lazily loaded stage content as drawn: set on the first frame after it mounted, once every sibling chunk has arrived. */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { StageBridge } from '../../bridge';

/** Render it after its siblings: frame callbacks run in mount order, so the siblings have drawn by then. */
export function StageMark({ bridge, name }: { bridge: StageBridge; name: 'scene' | 'overlays' }) {
  const invalidate = useThree((s) => s.invalidate);
  const drawn = useRef(false);
  useEffect(() => {
    invalidate();
    return () => {
      drawn.current = false;
      bridge.stageMarks.delete(name);
    };
  }, [bridge, name, invalidate]);
  useFrame(() => {
    if (drawn.current) return;
    drawn.current = true;
    bridge.stageMarks.add(name);
  });
  return null;
}
