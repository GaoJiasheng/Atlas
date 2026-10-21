/**
 * What a screen reader hears of a net (docs/39 §3.7, lib/net-description.ts):
 * the flat net as a shape (a row with squares above and below it, else row
 * by row), rectangles by size and faces by the edge they hang on, a curved
 * net by its pieces; never whether it folds; a folded solid by name and
 * faces, without the name when the name is asked; the notes of a net that
 * does not close; the SOLID card's face counts.
 */
import { describe, expect, it } from 'vitest';
import type { NetSpec, SolidSpec } from '../../src/engines/math-scene/schema';
import { describeNet, solidFacesText } from '../../src/engines/math-scene/lib/net-description';

const CUBE: SolidSpec = { type: 'cuboid', size: [1, 1, 1] };
const spec = (solid: SolidSpec, layout?: NetSpec['layout'], extra: Partial<NetSpec> = {}) => ({ solid, layout, stagger: true, view: 'auto' as const, turn: 0, ...extra });

describe('flat nets', () => {
  it('the cross: a row of 4, one square above and one below the 2nd', () => {
    expect(describeNet(spec(CUBE, { cubeNet: '141-e' }, { fold: 0 }), 'en')).toBe('6 squares: a row of 4; one square above the 2nd; one below the 2nd.');
    expect(describeNet(spec(CUBE, { cubeNet: '141-e' }, { fold: 0 }), 'zh')).toBe('6 个正方形：一排 4 个；第 2 个上面一个；第 2 个下面一个。');
  });
  it('a net with no row of 3 or more is read row by row', () => {
    expect(describeNet(spec(CUBE, { cubeNet: '222' }, { fold: 0 }), 'en')).toBe('6 squares, row by row from the top: 2 in columns 3 to 4; 2 in columns 2 to 3; 2 in columns 1 to 2.');
  });
  it('a column reads like a row turned (left and right of it)', () => {
    const text = describeNet(spec(CUBE, { cells: [[1, 0], [1, 1], [1, 2], [1, 3], [0, 2], [2, 1]] }, { fold: 0 }), 'en');
    expect(text).toMatch(/^6 squares: a row of 4; one (left|right) of the \d(st|nd|rd|th); one (left|right) of the \d(st|nd|rd|th)\.$/);
  });
  it('a cuboid\'s rectangles by size and the edge they hang on', () => {
    const text = describeNet(spec({ type: 'cuboid', size: [3, 2, 1] }, { rects: [[1, 1, 3, 2], [1, 0, 3, 1], [1, 3, 3, 1], [1, 4, 3, 2], [0, 1, 1, 2], [4, 1, 1, 2]] }, { fold: 0 }), 'en');
    expect(text).toMatch(/^6 faces: rectangle 1 \(3 by 2\); rectangle 2 \(3 by 1\) on the bottom edge of rectangle 1;/);
  });
  it('a cylinder and a cone opened out', () => {
    expect(describeNet(spec({ type: 'cylinder', radius: 1, height: 2 }, undefined, { curved: {}, fold: 0 }), 'en')).toBe('a rectangle 6.3 squares long; a circle on its top edge; a circle on its bottom edge');
    expect(describeNet(spec({ type: 'cone', radius: 1, height: 2 }, undefined, { curved: {}, fold: 0 }), 'en')).toBe('a shape like an open fan; a circle on its curved edge');
  });
  it('never says whether it folds', () => {
    for (const layout of [{ cubeNet: '141-e' as const }, { cells: [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]] as [number, number][] }]) {
      const text = describeNet(spec(CUBE, layout, { fold: 0 }), 'en');
      expect(text).not.toMatch(/fold|close|net of|cube/i);
    }
  });
});

describe('solids', () => {
  it('a solid by its name and faces; no name when the name is asked', () => {
    expect(describeNet(spec({ type: 'prism', sides: 3, edge: 2, length: 3 }), 'en')).toBe('A prism: 5 faces · 2 triangles · 3 rectangles.');
    expect(describeNet(spec({ type: 'prism', sides: 3, edge: 2, length: 3 }), 'en', { hideName: true })).toBe('A solid: 5 faces · 2 triangles · 3 rectangles.');
    expect(describeNet(spec({ type: 'sphere', radius: 1 }), 'zh')).toBe('球：1 个曲面。');
  });
  it('a net folded that does not close says what the drawing marks', () => {
    const text = describeNet(spec(CUBE, { cells: [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]] }, { fold: 1 }), 'en');
    expect(text).toMatch(/Folded up\. 2 faces here nothing here$/);
  });
  it('the card\'s faces', () => {
    expect(solidFacesText({ type: 'cuboid', size: [2, 2, 3] }, 'en')).toBe('6 faces · 2 squares · 4 rectangles');
    expect(solidFacesText({ type: 'cylinder', radius: 1, height: 2 }, 'en')).toBe('2 flat faces · 1 curved face');
    expect(solidFacesText({ type: 'cone', radius: 1, height: 2 }, 'zh')).toBe('1 个平的面 · 1 个曲面');
  });
});
