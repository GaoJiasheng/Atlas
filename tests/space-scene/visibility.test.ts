import { describe, expect, it } from 'vitest';
import { resolveAllPartDisplays, resolvePartDisplay, XRAY_OPACITY } from '../../src/engines/space-scene/lib/visibility';
import type { SpaceView } from '../../src/engines/space-scene/schema';

const parts = [
  { id: 'a1', group: 'a' },
  { id: 'a2', group: 'a' },
  { id: 'b1', group: 'b' },
];
const all = ['a', 'b'];

function visibleIds(view: SpaceView, part: string | null, layers: string[]): string[] {
  const map = resolveAllPartDisplays(parts, { view, part, layers });
  return parts.filter((p) => map.get(p.id)!.visible).map((p) => p.id);
}

describe('resolvePartDisplay', () => {
  it('assembled: everything in visible layers, solid', () => {
    expect(visibleIds('assembled', null, all)).toEqual(['a1', 'a2', 'b1']);
    expect(visibleIds('assembled', 'a1', all)).toEqual(['a1', 'a2', 'b1']);
    const d = resolvePartDisplay(parts[2]!, { view: 'assembled', part: 'a1', layers: all }, parts);
    expect(d).toEqual({ visible: true, opacity: 1, selected: false, ghost: false });
  });

  it('layers hide whole groups in every view, also the selected part', () => {
    for (const view of ['assembled', 'xray', 'exploded', 'isolate'] as const) {
      expect(visibleIds(view, null, ['a'])).toEqual(['a1', 'a2']);
      expect(visibleIds(view, null, [])).toEqual([]);
    }
    expect(visibleIds('assembled', 'b1', ['a'])).toEqual(['a1', 'a2']);
  });

  it('xray: non-selected parts are see-through ghosts, the selected one is solid', () => {
    const state = { view: 'xray' as const, part: 'a2', layers: all };
    const sel = resolvePartDisplay(parts[1]!, state, parts);
    const other = resolvePartDisplay(parts[0]!, state, parts);
    expect(sel).toEqual({ visible: true, opacity: 1, selected: true, ghost: false });
    expect(other).toEqual({ visible: true, opacity: XRAY_OPACITY, selected: false, ghost: true });
    expect(XRAY_OPACITY).toBe(0.15);
    // Without a selection everything is a ghost.
    expect(resolvePartDisplay(parts[0]!, { ...state, part: null }, parts).ghost).toBe(true);
  });

  it('exploded: same visibility as assembled', () => {
    expect(visibleIds('exploded', 'b1', all)).toEqual(['a1', 'a2', 'b1']);
    expect(visibleIds('exploded', 'b1', ['b'])).toEqual(['b1']);
  });

  it('isolate: only the selected part and its group', () => {
    expect(visibleIds('isolate', 'a1', all)).toEqual(['a1', 'a2']);
    expect(visibleIds('isolate', 'b1', all)).toEqual(['b1']);
    // No selection: behaves like assembled.
    expect(visibleIds('isolate', null, all)).toEqual(['a1', 'a2', 'b1']);
    // Layers still apply.
    expect(visibleIds('isolate', 'a1', ['b'])).toEqual([]);
  });

  it('ignores an unknown selected id', () => {
    expect(visibleIds('isolate', 'ghost', all)).toEqual(['a1', 'a2', 'b1']);
    expect(resolvePartDisplay(parts[0]!, { view: 'xray', part: 'ghost', layers: all }, parts).selected).toBe(false);
  });
});
