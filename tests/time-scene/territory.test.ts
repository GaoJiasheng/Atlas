import { describe, expect, it } from 'vitest';
import {
  alternativeSpots,
  labelGeometry,
  labelText,
  latOfMercY,
  mercY,
  pairCrossfade,
  placeLabels,
  polylabel,
  pxPerUnit,
  shortName,
  signedDistance,
  textAtBlend,
  tierFor,
  TIER_MIN_AREA,
} from '../../src/engines/time-scene/lib/territory';
import { buildTimeModel } from '../../src/engines/time-scene/lib/model';
import { timeSceneGeoData } from '../../src/engines/time-scene/schema';
import entities from '../../src/content/topics/ww2/data/entities.json';
import control from '../../src/content/topics/ww2/data/control.json';
import movements from '../../src/content/topics/ww2/data/movements.json';
import events from '../../src/content/topics/ww2/data/events.json';
import sources from '../../src/content/topics/ww2/data/sources.json';

const square = (x: number, y: number, s: number) => [
  [x, y],
  [x + s, y],
  [x + s, y + s],
  [x, y + s],
  [x, y],
];

describe('polylabel', () => {
  it('finds the centre of a square and its inscribed radius', () => {
    const p = polylabel([square(0, 0, 10)], 0.01);
    expect(p.x).toBeCloseTo(5, 1);
    expect(p.y).toBeCloseTo(5, 1);
    expect(p.r).toBeCloseTo(5, 1);
  });

  it('puts the pole of an L-shape inside its thick corner, not on the (outside) centroid', () => {
    // 10×10 square minus the top-right 6×6: arms 4 wide, the corner block is 4×4 at the origin.
    const L = [
      [0, 0],
      [10, 0],
      [10, 4],
      [4, 4],
      [4, 10],
      [0, 10],
      [0, 0],
    ];
    const p = polylabel([L], 0.01);
    expect(signedDistance(p.x, p.y, [L])).toBeGreaterThan(0);
    expect(p.r).toBeGreaterThan(1.9);
    expect(p.r).toBeLessThanOrEqual(2.9);
    // The area centroid of this L lies at (≈3.1, ≈3.1); the pole sits where the arms meet, well inside both.
    expect(p.x).toBeLessThan(4);
    expect(p.y).toBeLessThan(4);
  });

  it('respects holes', () => {
    const p = polylabel([square(0, 0, 10), square(3, 3, 4)], 0.01);
    expect(signedDistance(p.x, p.y, [square(0, 0, 10), square(3, 3, 4)])).toBeGreaterThan(0);
    // Best spot: a corner of the frame, equidistant from both outer edges and the hole's corner: x = √2 (3 − x).
    expect(p.r).toBeCloseTo((3 * Math.SQRT2) / (1 + Math.SQRT2), 1);
  });

  it('is degenerate-safe', () => {
    expect(
      polylabel([
        [
          [1, 1],
          [1, 1],
          [1, 1],
        ],
      ]).r,
    ).toBe(0);
    expect(polylabel([[]]).r).toBe(0);
  });
});

describe('labelGeometry', () => {
  it('labels the largest polygon of a multipolygon, in Mercator units', () => {
    const g = labelGeometry([[square(0, 0, 2)], [square(20, 0, 10)]])!;
    expect(g.at[0]).toBeCloseTo(25, 0);
    expect(g.at[1]).toBeCloseTo(5, 0);
    expect(g.r).toBeGreaterThan(4.5);
    expect(g.area).toBeGreaterThan(99);
    // Mercator round trip.
    expect(latOfMercY(mercY(48.2))).toBeCloseTo(48.2, 6);
    expect(g.my).toBeCloseTo(mercY(g.at[1]), 6);
  });

  it('falls back to the centroid for tiny polygons', () => {
    const g = labelGeometry([[square(103.6, 1.2, 0.2)]])!;
    expect(g.at[0]).toBeCloseTo(103.7, 3);
    expect(g.r).toBeGreaterThan(0);
    expect(g.r).toBeLessThan(0.2);
  });

  it('returns null for empty geometry', () => {
    expect(labelGeometry([])).toBeNull();
  });

  it('places every ww2 control area anchor inside its largest polygon', () => {
    const model = buildTimeModel(timeSceneGeoData.parse({ entities, control, movements, events, sources }), []);
    let checked = 0;
    for (const { keyframe } of model.keyframes) {
      for (const f of keyframe.features.features) {
        const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
        const g = labelGeometry(polys);
        if (!g || g.area < 0.1) continue;
        const merc = polys.map((poly) => poly.map((ring) => ring.map((p) => [p[0]!, mercY(p[1]!)])));
        expect(merc.some((poly) => signedDistance(g.mx, g.my, poly) > 0)).toBe(true);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(100);
  });
});

describe('labelText', () => {
  it('uses the short form of `label`, else the holder name', () => {
    expect(shortName('Denmark (German-occupied)')).toBe('Denmark');
    expect(shortName('丹麦（德国占领）')).toBe('丹麦');
    expect(shortName('German-occupied Poland')).toBe('German-occupied Poland');
    expect(labelText({ en: 'Burma (Japanese-occupied)', zh: '缅甸（日占）' }, { en: 'Japan', zh: '日本' })).toEqual({ en: 'Burma', zh: '缅甸' });
    expect(labelText(undefined, { en: 'Japan', zh: '日本' })).toEqual({
      en: 'Japan',
      zh: '日本',
    });
    expect(labelText(undefined, undefined)).toBeNull();
  });
});

describe('tierFor', () => {
  it('picks one of three tiers by screen area, none below the smallest', () => {
    expect(tierFor(TIER_MIN_AREA[1] * 2)).toBe(1);
    expect(tierFor(TIER_MIN_AREA[1])).toBe(1);
    expect(tierFor(TIER_MIN_AREA[1] - 1)).toBe(2);
    expect(tierFor(TIER_MIN_AREA[2])).toBe(2);
    expect(tierFor(TIER_MIN_AREA[3])).toBe(3);
    expect(tierFor(TIER_MIN_AREA[3] - 1)).toBeNull();
    expect(tierFor(0)).toBeNull();
  });

  it('screen area follows zoom: ×4 per zoom level', () => {
    expect(pxPerUnit(3) / pxPerUnit(2)).toBeCloseTo(2, 9);
    expect(pxPerUnit(0)).toBeCloseTo(512 / 360, 9);
  });
});

describe('pairCrossfade', () => {
  const c = (key: string, holder: string, text: string, x: number, y: number) => ({ key, holder, text, x, y });

  it('pairs the same holder and text within 40 px, closest first', () => {
    const prev = [c('0:1', 'germany', 'Germany', 100, 100), c('0:2', 'italy', 'Italy', 300, 300)];
    const next = [c('1:1', 'germany', 'Germany', 120, 110), c('1:5', 'italy', 'Italy', 400, 300)];
    const pairs = pairCrossfade(prev, next);
    const moved = pairs.find((p) => p.prev && p.next);
    expect(moved?.prev?.key).toBe('0:1');
    expect(moved?.next?.key).toBe('1:1');
    // Italy moved 100 px: two labels, one fading out, one in.
    expect(pairs.filter((p) => p.prev?.holder === 'italy' && !p.next)).toHaveLength(1);
    expect(pairs.filter((p) => p.next?.holder === 'italy' && !p.prev)).toHaveLength(1);
    expect(pairs).toHaveLength(3);
    // The same territory reshaped (the caller says so): one gliding label even 100 px away.
    const glide = pairCrossfade(prev, next, 40, (a) => a.holder === 'italy');
    expect(glide.filter((p) => p.prev && p.next)).toHaveLength(2);
  });

  it('does not pair a different text or holder, and pairs each label once', () => {
    const prev = [c('a', 'germany', 'Germany', 0, 0), c('b', 'germany', 'Germany', 10, 0)];
    const next = [c('x', 'germany', 'Germany', 8, 0), c('y', 'germany', 'German-occupied France', 0, 0), c('z', 'vichy', 'Germany', 0, 0)];
    const pairs = pairCrossfade(prev, next);
    const both = pairs.filter((p) => p.prev && p.next);
    expect(both).toHaveLength(1);
    expect(both[0]!.prev!.key).toBe('b');
    expect(both[0]!.next!.key).toBe('x');
    expect(pairs).toHaveLength(4);
  });
});

describe('pairCrossfade with different text (retext)', () => {
  const c = (key: string, holder: string, text: string, x: number, y: number) => ({ key, holder, text, x, y });

  it('pairs the same holder with different text within the retext distance, after same-text pairs', () => {
    const prev = [c('0:1', 'russia', 'Russia', 100, 100)];
    const next = [c('1:1', 'russia', 'Soviet Russia', 180, 100)];
    // Without the option: two labels cross-fading (the old double text).
    expect(pairCrossfade(prev, next).filter((p) => p.prev && p.next)).toHaveLength(0);
    const glide = pairCrossfade(prev, next, 40, undefined, 120);
    expect(glide).toHaveLength(1);
    expect(glide[0]!.prev!.key).toBe('0:1');
    expect(glide[0]!.next!.key).toBe('1:1');
    // 130 px away is too far; another holder never pairs.
    expect(pairCrossfade(prev, [c('x', 'russia', 'Soviet Russia', 230, 100)], 40, undefined, 120)).toHaveLength(2);
    expect(pairCrossfade(prev, [c('y', 'ukraine', 'Soviet Russia', 110, 100)], 40, undefined, 120)).toHaveLength(2);
  });

  it('prefers the same-text partner and pairs each label once', () => {
    const prev = [c('a', 'germany', 'Germany', 0, 0)];
    const next = [c('b', 'germany', 'Occupied France', 10, 0), c('c', 'germany', 'Germany', 90, 0)];
    const pairs = pairCrossfade(prev, next, 40, (a, b) => a.text === b.text, 120);
    const both = pairs.filter((p) => p.prev && p.next);
    expect(both).toHaveLength(1);
    expect(both[0]!.next!.key).toBe('c');
    expect(pairs).toHaveLength(2);
  });

  it('switches the text at half the crossfade', () => {
    expect(textAtBlend('Russia', 'Soviet Russia', 0.49)).toBe('Russia');
    expect(textAtBlend('Russia', 'Soviet Russia', 0.5)).toBe('Soviet Russia');
  });
});

describe('placeLabels', () => {
  const l = (key: string, x: number, y: number, priority: number, text = key) => ({ key, text, x, y, w: 80, h: 24, priority });

  it('keeps larger areas first, drops overlaps, obstacles, off-stage boxes and near duplicates, caps the count', () => {
    const kept = placeLabels(
      [l('small', 105, 100, 1), l('big', 100, 100, 10), l('far', 400, 100, 5), l('panel', 600, 300, 9), l('edge', 10, 300, 8), l('dup', 300, 200, 4, 'far')],
      {
        stage: { w: 800, h: 400 },
        obstacles: [{ x: 560, y: 260, w: 100, h: 100 }],
        cap: 24,
      },
    );
    expect(kept.map((k) => k.key)).toEqual(['big', 'far']);
    // Its own spot under a panel: the first free alternative is used.
    const moved = placeLabels(
      [
        {
          ...l('a', 100, 100, 1),
          alternatives: () => [
            { x: 120, y: 100 },
            { x: 300, y: 100 },
          ],
        },
      ],
      {
        stage: { w: 800, h: 400 },
        obstacles: [{ x: 40, y: 60, w: 120, h: 80 }],
        cap: 24,
      },
    );
    expect(moved[0]?.alt).toBe(1);
    expect(moved[0]?.at).toEqual({ x: 300, y: 100 });
    const capped = placeLabels([l('a', 100, 100, 3), l('b', 300, 100, 2), l('c', 500, 100, 1)], { stage: { w: 800, h: 400 }, obstacles: [], cap: 2 });
    expect(capped.map((k) => k.key)).toEqual(['a', 'b']);
  });
});

describe('alternativeSpots', () => {
  it('offers spots inside the area with enough clearance, nearest first', () => {
    const g = labelGeometry([[square(0, 0, 40)], [square(0, 0, 0)]])!;
    // Inside a 40×40 square (r = 20) a label needing 5 units fits up to 15 units from the centre.
    const spots = alternativeSpots(g, 5);
    expect(spots.length).toBeGreaterThan(0);
    for (const o of spots) expect(Math.max(Math.abs(o.dx), Math.abs(o.dy))).toBeLessThanOrEqual(15 + 1e-6);
    const d = spots.map((o) => Math.round(Math.hypot(o.dx, o.dy) * 1e6) / 1e6);
    expect(d).toEqual([...d].sort((a, b) => a - b));
    expect(alternativeSpots(g, 25)).toEqual([]);
  });
});
