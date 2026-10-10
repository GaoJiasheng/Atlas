/**
 * Leader-label targets (pure, unit-tested): a label names a part id, or a
 * whole group as `group:<group id>` (docs/12 §8 G12: one placard at the
 * bounding centre of the group's visible parts, text = the group's name).
 * Which list applies: the beat's `labels` in the presentation, else the
 * chapter's `labels`, else every part (the HUD then caps it by camera distance).
 */
import type { Vec3 } from './math';

export const GROUP_LABEL_PREFIX = 'group:';

/** The group id of a `group:<id>` label, or `null` for a part label. */
export function labelGroup(id: string): string | null {
  return id.startsWith(GROUP_LABEL_PREFIX) ? id.slice(GROUP_LABEL_PREFIX.length) : null;
}

export const groupLabelId = (group: string): string => `${GROUP_LABEL_PREFIX}${group}`;

/** Labels at most while presenting (docs/12 §8 G1). */
export const PRESENT_LABEL_CAP = 6;

/**
 * The labels asked for, or `null` when none are listed (then every visible
 * part is a candidate): the beat's own list while presenting, else the
 * chapter's; capped at `PRESENT_LABEL_CAP` while presenting.
 */
export function listedLabels(input: { presenting: boolean; beat: readonly string[] | null; chapter: unknown }): string[] | null {
  const own = Array.isArray(input.chapter) ? input.chapter.filter((x): x is string => typeof x === 'string') : null;
  const list = input.presenting && input.beat ? [...input.beat] : own;
  return list && input.presenting ? list.slice(0, PRESENT_LABEL_CAP) : list;
}

/** One part of a group: its label-anchor centre now and the half extents of its bounds. */
export interface BoxMember {
  center: Vec3;
  half: Vec3;
}

/**
 * Bounding box of `members` (centre and half extents) written into `out`;
 * returns false (out untouched) when there are none.
 */
export function unionBox(members: Iterable<BoxMember>, out: { center: Vec3; half: Vec3 }): boolean {
  let any = false;
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const m of members) {
    any = true;
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i]!, m.center[i]! - m.half[i]!);
      max[i] = Math.max(max[i]!, m.center[i]! + m.half[i]!);
    }
  }
  if (!any) return false;
  for (let i = 0; i < 3; i++) {
    out.center[i] = (min[i]! + max[i]!) / 2;
    out.half[i] = (max[i]! - min[i]!) / 2;
  }
  return true;
}
