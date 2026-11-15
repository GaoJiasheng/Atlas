/**
 * Words about an angle drawing (docs/76 §3.3): what a screen reader hears,
 * what the ANGLE card and the PLATE rows say, the mono labels of the child's
 * moves ("your attempts"), and the number sentence under a check. A step
 * without degrees (01–04) says "smaller than a right angle", never a size.
 * On a check nothing gives the answer first. Pure.
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { AngleSpec, Task } from '../schema';
import type { TaskState } from './state';
import { arcValue, armsOf, kindOf, litAngle, type Kind } from './angle';
import { drawnSegment, drawnSize, laid, laidRow } from './angle-tasks';

/** An angle's size in words, compared with a right angle (no degrees). */
export function kindText(kind: Kind, locale: Locale): string {
  return t(locale, `math.angle.${kind}`);
}

/** A size for the card: degrees, or (no degrees) the kind. */
export function sizeText(size: number, locale: Locale, degrees: boolean): string {
  return degrees ? `${Math.round(size)}°` : kindText(kindOf(size), locale);
}

/** What the drawing shows, for a screen reader. */
export function describeAngle(spec: AngleSpec, locale: Locale, degrees = true): string {
  const parts: string[] = [];
  if (spec.paper) {
    const p = spec.paper;
    parts.push(t(locale, 'math.angle.paperDesc', { cols: p.cols, rows: p.rows, n: p.segments.length }));
    for (const s of p.segments) if (s.labels) parts.push(t(locale, 'math.angle.segmentDesc', { a: s.labels[0], b: s.labels[1], x: s.to[0] - s.from[0], y: s.to[1] - s.from[1] }));
  } else if (spec.polygon) {
    parts.push(t(locale, 'math.angle.shapeDesc', { n: spec.polygon.points.length }));
  } else {
    const arms = armsOf(spec).length;
    if (arms) parts.push(t(locale, 'math.angle.armsDesc', { n: arms }));
    for (const a of spec.arcs ?? []) {
      const name = a.label ?? '';
      const size = a.label === '?' ? '?' : degrees ? `${arcValue(a)}°` : kindText(kindOf(arcValue(a)), locale);
      parts.push(name && name !== '?' ? `∠${name} ${size}` : size);
    }
    if (spec.square?.length) parts.push(t(locale, 'math.angle.squareDesc', { n: spec.square.length }));
    if (spec.protractor && !spec.protractor.away) parts.push(t(locale, 'math.angle.protractor'));
    if (spec.tester && !spec.tester.away) parts.push(t(locale, 'math.angle.tester'));
  }
  if (spec.notToScale) parts.push(t(locale, 'math.angle.notToScale'));
  return parts.join(' · ');
}

/** The mono caption of an angle task's state ("your attempts", the undo log). */
export function angleActionLabel(task: Task, s: TaskState): string {
  if (task.kind === 'measure-angle') return laid(task, s) ? `LAID · ${(laidRow(task, s) ?? '').toUpperCase()}` : 'PROTRACTOR';
  if (task.kind === 'draw-angle') {
    const x = drawnSize(task, s);
    return x === null ? 'ARM' : `ARM ${Math.round(x)}°`;
  }
  if (task.kind === 'draw-segment') {
    const seg = drawnSegment(task, s);
    return seg ? `LINE (${seg[0].join(',')})-(${seg[1].join(',')})` : `DOTS ${s.dpts.length}`;
  }
  return '';
}

/** A run of steps on dot paper in words: `3 right, 1 up` / `向右 3、向上 1`. */
export function stepsText(dx: number, dy: number, locale: Locale): string {
  const out: string[] = [];
  if (dx) out.push(t(locale, dx > 0 ? 'math.angle.right1' : 'math.angle.left1', { n: Math.abs(dx) }));
  if (dy) out.push(t(locale, dy > 0 ? 'math.angle.up1' : 'math.angle.down1', { n: Math.abs(dy) }));
  return out.join(locale === 'zh' ? '、' : ', ');
}

/** The number sentence under an angle check (never the answer before it is done). */
export function angleLines(task: Task, s: TaskState, locale: Locale, done: boolean): string[] {
  if (task.kind === 'measure-angle') {
    if (s.phase === 0 && task.place) return [];
    return [done ? `${task.answer}°` : '?°'];
  }
  if (task.kind === 'draw-angle') return [`${task.target}°`];
  if (task.kind === 'draw-segment') {
    const seg = drawnSegment(task, s);
    return seg ? [stepsText(seg[1][0] - seg[0][0], seg[1][1] - seg[0][1], locale)] : [];
  }
  return [];
}

/** The angle a beat or a drawing is about, for the card: its size (or ?) and kind. */
export function cardAngle(spec: AngleSpec): { size: number | null; unknown: boolean } | null {
  return litAngle(spec);
}
