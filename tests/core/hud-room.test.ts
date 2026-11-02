import { afterEach, describe, expect, it, vi } from 'vitest';
import { OPEN_FOLDS, measureFreeStage, solveHudRoom, usesReaderDrawer, type HudMeasurements } from '../../src/engines/core/hud-room';
import { createHudStore, createHudActions, buildKeymap } from '../../src/engines/core/controls';
import { getHudPreferences, setHudPreferences, claimFirstGuide, GUIDE_FIRST_RUN_TEST_KEY, GUIDE_SEEN_KEY, HUD_ROOM_KEY } from '../../src/lib/prefs';
import { hudScale } from '../../src/engines/core/SceneHost';

const sizes: HudMeasurements = {
  top: 90,
  bottom: 90,
  reader: 400,
  edge: 24,
  tab: 44,
  left: { width: 300, height: 580, metadata: 180 },
  right: { width: 264, height: 500, legends: 160, card: 180 },
};
const devices = [
  [1133, 744],
  [744, 1133],
  [1180, 820],
  [820, 1180],
  [1194, 834],
  [834, 1194],
  [1366, 1024],
  [1024, 1366],
  [1280, 800],
  [1440, 900],
  [1512, 982],
  [1920, 1080],
  [2560, 1440],
  [390, 844],
];

describe('HUD room policy', () => {
  for (const [width, height] of devices)
    for (const chrome of [0, 90])
      it(`${width}×${height}, browser chrome ${chrome}: preserves primary stage share`, () => {
        const room = solveHudRoom({ width: width!, height: height! - chrome }, sizes);
        expect(room.meetsShare).toBe(true);
        expect(room.stage.x1 - room.stage.x0).toBeGreaterThanOrEqual(width! * 0.5);
        expect(room.stage.y1 - room.stage.y0).toBeGreaterThanOrEqual((height! - chrome) * 0.6);
        expect(room.folds.reader).toBe(true);
        expect(
          solveHudRoom({ width: width!, height: height! - chrome }, sizes, {
            reader: false,
            cardOpen: true,
            leftColumn: 'compact',
            legendsOpen: false,
          }).folds,
        ).toMatchObject({ reader: false, cardOpen: true, leftColumn: 'compact', legendsOpen: false });
        expect(room.readerWidth).toBeGreaterThanOrEqual(340);
      });
  it('keeps 1080p defaults and follows the precise collapse order on an iPad', () => {
    expect(solveHudRoom({ width: 1920, height: 1080 }, sizes).folds).toEqual(OPEN_FOLDS);
    const room = solveHudRoom({ width: 1180, height: 820 }, sizes);
    expect(room.steps).toEqual(['legends', 'card', 'metadata', 'left']);
    expect(room.folds.leftColumn).toBe('collapsed');
    expect(room.folds.reader).toBe(true);
  });
  it('stops at legends, card and metadata independently when each releases enough height', () => {
    const view = { width: 1920, height: 1080 };
    expect(solveHudRoom(view, { ...sizes, right: { ...sizes.right, height: 1200, legends: 400 } }).steps).toEqual(['legends']);
    expect(solveHudRoom(view, { ...sizes, right: { ...sizes.right, height: 1200, legends: 40, card: 400 } }).steps).toEqual([
      'legends',
      'card',
    ]);
    expect(solveHudRoom(view, { ...sizes, left: { ...sizes.left, height: 1200, metadata: 400 } }).steps).toEqual([
      'legends',
      'card',
      'metadata',
    ]);
  });
  it('hides the metadata when the left column cannot hold its content, even with the stage share met', () => {
    const view = { width: 1920, height: 1080 };
    const spill = solveHudRoom(view, { ...sizes, left: { ...sizes.left, overflow: 90 } });
    expect(spill.steps).toEqual(['metadata']);
    expect(spill.folds.leftColumn).toBe('compact');
    expect(spill.folds.cardOpen && spill.folds.legendsOpen).toBe(true);
    expect(solveHudRoom(view, { ...sizes, left: { ...sizes.left, overflow: 0 } }).folds.leftColumn).toBe('open');
    // A manual choice wins; a phone header never folds for this.
    expect(solveHudRoom(view, { ...sizes, left: { ...sizes.left, overflow: 90 } }, { leftColumn: 'open' }).folds.leftColumn).toBe('open');
    expect(solveHudRoom({ width: 390, height: 844 }, { ...sizes, left: { width: 366, height: 140, metadata: 0, overflow: 90 } }).folds.leftColumn).toBe('open');
  });
  it('narrows the reader only after the left column, never below 340', () => {
    const room = solveHudRoom({ width: 1024, height: 768 }, { ...sizes, reader: 480 });
    expect(room.steps).toEqual(['legends', 'card', 'metadata', 'left', 'reader-width']);
    expect(room.readerWidth).toBe(340);
    expect(room.meetsShare).toBe(true);
  });
  it('manual open and closed choices both win, even when the minimum is impossible', () => {
    const manual = { leftColumn: 'open' as const, reader: true, legendsOpen: true, cardOpen: true, plateOpen: false };
    const room = solveHudRoom({ width: 1180, height: 820 }, sizes, manual);
    expect(room.folds).toMatchObject(manual);
    expect(room.meetsShare).toBe(false);
    expect(room.steps).toEqual(['reader-width']);
    expect(
      solveHudRoom({ width: 1920, height: 1080 }, sizes, { reader: false, leftColumn: 'collapsed', legendsOpen: false }).folds,
    ).toMatchObject({ reader: false, leftColumn: 'collapsed', legendsOpen: false });
  });
  it('can recover expanded defaults after resize while keeping manual overrides', () => {
    const manual = { cardOpen: false };
    expect(solveHudRoom({ width: 1180, height: 820 }, sizes, manual).folds.leftColumn).toBe('collapsed');
    expect(solveHudRoom({ width: 1920, height: 1080 }, sizes, manual).folds).toMatchObject({ leftColumn: 'open', cardOpen: false });
  });
  it('in a portrait drawer the right column bounds the stage: card and key fold, the left column stays', () => {
    const portrait = solveHudRoom({ width: 820, height: 1180 }, { ...sizes, right: { ...sizes.right, width: 330 } });
    expect(portrait.drawer).toBe(true);
    expect(portrait.steps).toEqual(['legends', 'card']);
    expect(portrait.folds).toMatchObject({ legendsOpen: false, cardOpen: false, leftColumn: 'open', reader: true });
    expect(solveHudRoom({ width: 1024, height: 1366 }, sizes).steps).toEqual(['legends', 'card']);
    // A reader who opens the card again keeps it, even below the minimum.
    expect(solveHudRoom({ width: 820, height: 1180 }, sizes, { cardOpen: true }).folds.cardOpen).toBe(true);
  });
  it('a phone keeps its title and chip-row header: only the card and key fold into tabs', () => {
    const phone = solveHudRoom({ width: 390, height: 844 }, { ...sizes, left: { width: 366, height: 140, metadata: 0 } });
    expect(phone.steps).toEqual(['legends', 'card']);
    expect(phone.folds.leftColumn).toBe('open');
    expect(phone.meetsShare).toBe(true);
  });
  it('uses drawers throughout tablet portrait and leaves wide desktop portrait docked', () => {
    for (const [w, h] of [
      [390, 844],
      [820, 1180],
      [1024, 1366],
      [1099, 1400],
      [900, 700],
    ])
      expect(usesReaderDrawer(w!, h!)).toBe(true);
    for (const [w, h] of [
      [1180, 820],
      [1366, 1024],
      [1100, 1400],
    ])
      expect(usesReaderDrawer(w!, h!)).toBe(false);
  });
  it('adds a coarse pointer scale floor while keeping desktop and phone scales', () => {
    expect(hudScale(1180, 820, true)).toBe(1);
    expect(hudScale(1180, 820)).toBeCloseTo(1180 / 1920);
    expect(hudScale(390, 844, true)).toBe(1);
  });
  it('exposes an unobstructed stage-local rectangle for asymmetric framing', () => {
    const blocks = [
      { x0: 0, y0: 0, x1: 44, y1: 800 },
      { x0: 800, y0: 0, x1: 1000, y1: 800 },
      { x0: 44, y0: 700, x1: 800, y1: 800 },
    ];
    expect(measureFreeStage(1000, 800, blocks)).toEqual({ x0: 44, y0: 0, x1: 800, y1: 700 });
    expect(measureFreeStage(1000, 800, [])).toEqual({ x0: 0, y0: 0, x1: 1000, y1: 800 });
  });
});

describe('HUD store, restoration and persistence', () => {
  afterEach(() => vi.unstubAllGlobals());
  const make = () => {
    const hud = createHudStore();
    return { hud, actions: createHudActions(hud, { suppress: (fn) => fn() }) };
  };
  it('all setters record manual choices; stage-only restores the exact previous folds', () => {
    const { hud, actions: a } = make();
    a.setReader(false);
    a.setCard(false);
    a.setPanels(false);
    a.setPlate(false);
    a.setLegends(true);
    a.setLeftColumn('compact');
    const previous = hud.getState();
    a.setStageOnly(true);
    a.setStageOnly(true);
    expect(hud.getState()).toMatchObject({
      stageOnly: true,
      reader: false,
      panelsOpen: false,
      plateOpen: false,
      cardOpen: false,
      legendsOpen: false,
      leftColumn: 'collapsed',
    });
    a.setLeftColumn('open'); // individual tabs still work while stage-only is on
    expect(hud.getState().leftColumn).toBe('open');
    a.setStageOnly(false);
    for (const k of Object.keys(OPEN_FOLDS) as (keyof typeof OPEN_FOLDS)[]) expect(hud.getState()[k]).toEqual(previous[k]);
    expect(hud.getState().beforeStage).toBeNull();
  });
  it('Escape closes the guide before touching HUD/engine state and keys are reserved', () => {
    const { hud, actions: a } = make();
    const escape = vi.fn();
    hud.setState({ controls: { escape, modes: { items: [{ id: 'bad', key: 'z', label: 'bad', on: false }], set: vi.fn() } } });
    a.setGuide(true);
    a.escape();
    expect(hud.getState().guide).toBe(false);
    expect(escape).not.toHaveBeenCalled();
    expect(buildKeymap(hud.getState().controls).filter((k) => k.key === 'z')).toEqual([{ key: 'z', type: 'stageOnly', name: 'stageOnly' }]);
    expect(buildKeymap({})).toContainEqual({ key: '?', type: 'guide', name: 'guide' });
  });
  it('roundtrips manual preferences, stage-only and its restore snapshot per tab', () => {
    const session = new Map<string, string>();
    const local = new Map<string, string>();
    vi.stubGlobal('window', {
      sessionStorage: { getItem: (k: string) => session.get(k) ?? null, setItem: (k: string, v: string) => session.set(k, v) },
      localStorage: { getItem: (k: string) => local.get(k) ?? null, setItem: (k: string, v: string) => local.set(k, v) },
    });
    expect(getHudPreferences()).toEqual({ manual: {}, stageOnly: false, beforeStage: null });
    const saved = { manual: { leftColumn: 'compact' as const, plateOpen: false }, stageOnly: true, beforeStage: OPEN_FOLDS };
    setHudPreferences(saved);
    expect(getHudPreferences()).toEqual(saved);
    expect(session.has(HUD_ROOM_KEY)).toBe(true);
    expect(claimFirstGuide()).toBe(true);
    expect(local.get(GUIDE_SEEN_KEY)).toBe('1');
    expect(claimFirstGuide()).toBe(false);
    session.set(HUD_ROOM_KEY, '{"manual":{"reader":"bad","leftColumn":"invalid"}}');
    expect(getHudPreferences().manual).toEqual({});
    session.set(HUD_ROOM_KEY, 'malformed');
    expect(getHudPreferences().manual).toEqual({});
  });
  it('never auto-opens under automation unless the page opts in', () => {
    const local = new Map<string, string>();
    const storage = { getItem: (k: string) => local.get(k) ?? null, setItem: (k: string, v: string) => local.set(k, v) };
    vi.stubGlobal('window', { sessionStorage: storage, localStorage: storage });
    vi.stubGlobal('navigator', { webdriver: true });
    expect(claimFirstGuide()).toBe(false);
    expect(local.has(GUIDE_SEEN_KEY)).toBe(false);
    local.set(GUIDE_FIRST_RUN_TEST_KEY, '1');
    expect(claimFirstGuide()).toBe(true);
    expect(claimFirstGuide()).toBe(false);
  });
  it('does not auto-open in blocked/private storage and setters remain usable', () => {
    const blocked = {
      getItem: () => {
        throw Error('blocked');
      },
      setItem: () => {
        throw Error('blocked');
      },
    };
    vi.stubGlobal('window', { sessionStorage: blocked, localStorage: blocked });
    expect(claimFirstGuide()).toBe(false);
    expect(getHudPreferences().manual).toEqual({});
    expect(() => setHudPreferences({ manual: {}, stageOnly: false, beforeStage: null })).not.toThrow();
    const { hud, actions } = make();
    actions.setLeftColumn('collapsed');
    expect(hud.getState().leftColumn).toBe('collapsed');
  });
});
