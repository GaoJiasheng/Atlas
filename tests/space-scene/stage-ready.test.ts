import { describe, expect, it } from 'vitest';
import { createBridge, stageReady } from '../../src/engines/space-scene/bridge';

describe('stage readiness', () => {
  it('waits for the lazily mounted scene, and for the overlays when the scene asks for them', () => {
    const bridge = createBridge();
    expect(stageReady(bridge)).toBe(false);
    bridge.stageMarks.add('scene');
    expect(stageReady(bridge)).toBe(true);
    bridge.overlaysExpected = true;
    expect(stageReady(bridge)).toBe(false);
    bridge.stageMarks.add('overlays');
    expect(stageReady(bridge)).toBe(true);
  });
});
