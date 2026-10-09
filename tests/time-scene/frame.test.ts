import { describe, expect, it } from 'vitest';
import { timeSceneGeoData } from '../../src/engines/time-scene/schema';
import { buildTimeModel } from '../../src/engines/time-scene/lib/model';
import { frameAt } from '../../src/engines/time-scene/lib/frame';
import { blocsOf, changesBloc } from '../../src/engines/time-scene/lib/bloc';
import { areaLabelPoint, lineLength, pointAlong, sliceLine } from '../../src/engines/time-scene/lib/geo';
import { toNumber } from '../../src/engines/time-scene/lib/time';
import entities from '../../src/content/topics/sample-time/data/entities.json';
import control from '../../src/content/topics/sample-time/data/control.json';
import movements from '../../src/content/topics/sample-time/data/movements.json';
import events from '../../src/content/topics/sample-time/data/events.json';
import sources from '../../src/content/topics/sample-time/data/sources.json';

const data = timeSceneGeoData.parse({ entities, control, movements, events, sources });
const model = buildTimeModel(data, [
  { id: 'first-look', t: '2000-01-15' },
  { id: 'second-look', t: '2000-03-11' },
  { id: 'third-look', t: '2000-07-01' },
]);

describe('geo helpers', () => {
  const line = [
    [0, 0],
    [10, 0],
    [10, 10],
  ];
  it('measures and slices polylines', () => {
    expect(lineLength(line)).toBe(20);
    expect(sliceLine(line, 0)).toEqual([
      [0, 0],
      [0, 0],
    ]);
    expect(sliceLine(line, 0.25)).toEqual([
      [0, 0],
      [5, 0],
    ]);
    expect(sliceLine(line, 0.75)).toEqual([
      [0, 0],
      [10, 0],
      [10, 5],
    ]);
    expect(sliceLine(line, 1)).toEqual(line);
    expect(pointAlong(line, 0.5)).toEqual([10, 0]);
  });
  it('finds a label point in the largest ring', () => {
    const small = [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ],
    ];
    const big = [
      [
        [10, 10],
        [14, 10],
        [14, 14],
        [10, 14],
        [10, 10],
      ],
    ];
    expect(areaLabelPoint([small, big])).toEqual([12, 12]);
    // The largest polygon whose centroid passes `onScreen`; none on screen: the largest overall.
    expect(areaLabelPoint([small, big], ([x]) => x < 5)?.[0]).toBeCloseTo(0.5, 6);
    expect(areaLabelPoint([small, big], () => false)).toEqual([12, 12]);
  });
});

describe('buildTimeModel (sample-time)', () => {
  it('spans all data and chapter times', () => {
    expect(model.scale).toBe('date');
    expect(model.min).toBe(toNumber('2000-01-01'));
    expect(model.max).toBe(toNumber('2000-08-01'));
    expect(model.chapterNodes.map((c) => c.id)).toEqual(['first-look', 'second-look', 'third-look']);
    expect(model.keyframes).toHaveLength(3);
  });
  it('gives events an active window covering their period', () => {
    const meeting = model.events.find((e) => e.event.id === 'sample-meeting')!;
    expect(meeting.start).toBe(toNumber('2000-03-10'));
    expect(meeting.end).toBeCloseTo(toNumber('2000-03-13'), 10);
  });
});

describe('frameAt', () => {
  it('chapter one: first keyframe only, nothing moving, no events yet', () => {
    const f = frameAt(model, toNumber('2000-01-15'));
    expect(f.control.prevIndex).toBe(0);
    expect(f.control.prevOpacity).toBe(1);
    expect(f.movements).toEqual([]);
    expect(f.events).toEqual([]);
    expect(f.participation.map((p) => p.entityId).sort()).toEqual(['north-sample', 'south-sample']);
  });

  it('chapter two: the battle is active and the crossing is under way', () => {
    const f = frameAt(model, toNumber('2000-03-11'), ['sample-meeting']);
    expect(f.events).toEqual([{ id: 'sample-meeting', active: true }]);
    const crossing = f.movements.find((m) => m.m.movement.id === 'sample-crossing')!;
    expect(crossing.progress).toBeGreaterThan(0.3);
    expect(crossing.progress).toBeLessThan(0.4);
    expect(crossing.coords[0]).toEqual([-150, 13]);
    expect(crossing.coords[crossing.coords.length - 1]).toEqual(crossing.head);
    // Crossfading toward the April keyframe (last 30% of Jan..Apr).
    expect(f.control.blend).toBeGreaterThan(0);
    expect(f.control.nextIndex).toBe(1);
  });

  it('the crossing movement spans a keyframe boundary', () => {
    const before = frameAt(model, toNumber('2000-03-31'));
    const after = frameAt(model, toNumber('2000-04-02'));
    expect(before.control.prevIndex).toBe(0);
    expect(after.control.prevIndex).toBe(1);
    expect(before.movements.some((m) => m.m.movement.id === 'sample-crossing')).toBe(true);
    expect(after.movements.some((m) => m.m.movement.id === 'sample-crossing')).toBe(true);
  });

  it('east-sample lights up when it joins and fades afterwards', () => {
    const atJoin = frameAt(model, toNumber('2000-04-01'));
    const later = frameAt(model, toNumber('2000-07-01'));
    expect(atJoin.participation.find((p) => p.entityId === 'east-sample')?.flash).toBe(1);
    expect(later.participation.find((p) => p.entityId === 'east-sample')?.flash).toBe(0);
    expect(frameAt(model, toNumber('2000-03-01')).participation.some((p) => p.entityId === 'east-sample')).toBe(false);
  });

  it('shows highlighted future events, hides other future events', () => {
    const f = frameAt(model, toNumber('2000-01-15'), ['sample-agreement']);
    expect(f.events).toEqual([{ id: 'sample-agreement', active: false }]);
  });

  it('points the arrow tail behind the head', () => {
    const f = frameAt(model, toNumber('2000-02-01'));
    const m = f.movements.find((x) => x.m.movement.id === 'sample-crossing')!;
    expect(m.progress).toBe(0);
    // At the start the tail is mirrored from the path ahead: north of the head.
    expect(m.tail[1]).toBeGreaterThan(m.head[1]);
  });
});

describe('sample-time data exercises every layer', () => {
  it('has 3 entities (every bloc, one changing sides), 3 keyframes, 2 movements, 3 dated events + 1 site', () => {
    expect(new Set(data.entities.flatMap((e) => blocsOf(e)))).toEqual(new Set(['axis', 'allied', 'neutral']));
    expect(data.entities.some((e) => changesBloc(e))).toBe(true);
    expect(data.control.keyframes).toHaveLength(3);
    expect(data.movements).toHaveLength(2);
    expect(new Set(data.events.map((e) => e.kind)).size).toBe(4);
    expect(model.events).toHaveLength(3);
    expect(model.sites.map((e) => e.id)).toEqual(['sample-site']);
    expect(new Set(data.events.map((e) => e.importance)).size).toBe(3);
    expect(data.events.some((e) => e.sensitive)).toBe(true);
  });
});
