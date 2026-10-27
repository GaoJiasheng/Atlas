import { describe, expect, it } from 'vitest';
import { displayLeg, eventAtDisplayPoint, eventDisplayPoint } from '../../src/engines/time-scene/lib/event-display';
import { eventSchema, staticSite } from '../../src/engines/time-scene/schema';
import type { LngLat } from '../../src/engines/time-scene/lib/geo';

const at: LngLat = [118.8, 32.1];
const project = ([lng, lat]: LngLat) => ({ x: lng, y: lat });
const event = { id: 'voyage', at, displayOffset: [0, -80] as [number, number] };
const fields = { ...event, t: '1405', kind: 'political', importance: 2, title: { en: 'Voyage', zh: '航行' }, summary: { en: 'From Nanjing.', zh: '从南京出发。' } };

describe('screen-only event offsets', () => {
  it('accepts optional, bounded pixel pairs for dated events and static sites', () => {
    expect(eventSchema.parse(fields).displayOffset).toEqual([0, -80]);
    expect(eventSchema.parse({ ...fields, displayOffset: undefined }).displayOffset).toBeUndefined();
    const { t: _, ...siteFields } = fields;
    expect(staticSite.parse({ ...siteFields, kind: 'site' }).displayOffset).toEqual([0, -80]);
    for (const offset of [[97, 0], [0, -97], [NaN, 0], [Infinity, 0], [0], [0, 0, 0]]) {
      expect(eventSchema.safeParse({ ...fields, displayOffset: offset }).success).toBe(false);
    }
  });

  it('shares the shifted anchor between marks, leader labels and hit testing without moving sourced coordinates', () => {
    const original = structuredClone(event);
    const display = eventDisplayPoint(project, event, at[0]);
    expect(display).toEqual({ x: at[0], y: at[1] - 80 });
    expect(eventAtDisplayPoint([event], project, display)).toBe(event.id);
    expect(eventAtDisplayPoint([event], project, { x: at[0], y: at[1] })).toBeNull();
    expect(event).toEqual(original);
    expect(eventDisplayPoint(project, { at }, at[0])).toEqual({ x: at[0], y: at[1] });
  });

  it('keeps nine co-located events individually selectable around the stationary source anchor', () => {
    const events = Array.from({ length: 9 }, (_, i) => ({
      id: `voyage-${i}`,
      at,
      displayOffset: [96 * Math.sin(i * 2 * Math.PI / 9), -96 * Math.cos(i * 2 * Math.PI / 9)] as [number, number],
    }));
    const points = [...events, { id: 'nanjing', at }];
    for (let i = 0; i < points.length; i++) {
      const a = eventDisplayPoint(project, points[i]!, at[0]);
      for (let j = i + 1; j < points.length; j++) {
        const b = eventDisplayPoint(project, points[j]!, at[0]);
        expect(Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))).toBeGreaterThan(44);
      }
    }
    for (const item of points) {
      const display = eventDisplayPoint(project, item, at[0]);
      expect(eventAtDisplayPoint(points, project, display)).toBe(item.id);
    }
  });

  it('chooses the nearest mark when targets overlap and includes the complete 44px square', () => {
    const points = [{ id: 'left', at: [0, 0] as LngLat }, { id: 'right', at: [30, 0] as LngLat }];
    expect(eventAtDisplayPoint(points, project, { x: 20, y: 0 })).toBe('right');
    expect(eventAtDisplayPoint(points, project, { x: -22, y: 22 })).toBe('left');
    expect(eventAtDisplayPoint(points, project, { x: -22.1, y: 0 })).toBeNull();
  });

  it('applies screen offsets after choosing the visible antimeridian world copy', () => {
    const projectWorld = ([lng, lat]: LngLat) => ({ x: lng + 180, y: lat });
    const item = { id: 'date-line', at: [-179, 0] as LngLat, displayOffset: [12, -10] as [number, number] };
    expect(eventDisplayPoint(projectWorld, item, 360)).toEqual({ x: 373, y: -10 });
    expect(eventAtDisplayPoint([item], projectWorld, { x: 373, y: -10 })).toBe(item.id);
  });

  it('draws a leg from the shifted ring back towards the stationary anchor', () => {
    const leg = displayLeg([0, -96], 5)!;
    // Mark-local: the anchor sits 96 px below the ring centre; the leg stops 6 px short of it and starts on the ring.
    expect(leg).toEqual({ x1: -0, y1: 90, x2: -0, y2: 5 });
    const diagonal = displayLeg([60, 80], 4, 10)!;
    expect(Math.hypot(diagonal.x1, diagonal.y1)).toBeCloseTo(90);
    expect(Math.hypot(diagonal.x2, diagonal.y2)).toBeCloseTo(4);
    expect(diagonal.x1 / diagonal.y1).toBeCloseTo(60 / 80);
    expect(displayLeg([3, 4], 2)).toBeNull();
  });
});
