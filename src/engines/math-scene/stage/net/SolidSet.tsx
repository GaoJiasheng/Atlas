/**
 * A row of small pictures (docs/39 §3.2 `set`: the solids met before, the
 * 11 nets of a cube, quick signs of a non-net, the nets to name a solid
 * from): the stage's width shared out, each picture in its own pose and all
 * at one scale (so their sizes stay true), its label printed under it. Two
 * rows when one would make the pictures too small.
 */
import type { Locale } from '../../../core/types';
import { tx } from '../../../../i18n';
import { plainText } from '../../../../lib/rich-text';
import type { Rect } from '../layout';
import { flatOutline, fitIn, landedFaces, pairOf, poseBounds, shapeOf, specPose, type SolidNet } from '../../lib/net-view';
import { describeNet } from '../../lib/net-description';
import { GroundLines, NetFaces, type FaceTone } from './Faces';
import { SphereDrawing } from './Labels';

const LABEL_H = 30;
const MIN_CELL = 116;

export function SolidSet({ items, box, locale, label }: { items: SolidNet[]; box: Rect; locale: Locale; label: string }) {
  const n = items.length;
  const rows = box.w / n < MIN_CELL && n > 3 ? 2 : 1;
  const cols = Math.ceil(n / rows);
  const cw = box.w / cols;
  const rowH = Math.min(box.h / rows, Math.max(150, cw * 1.15));
  const top = box.y + (box.h - rowH * rows) / 2;
  const cells = items.map((spec, i) => {
    const r = Math.floor(i / cols);
    const inRow = r === rows - 1 ? n - cols * (rows - 1) : cols;
    const x0 = box.x + (box.w - inRow * cw) / 2;
    const c = i - r * cols;
    const shape = shapeOf(spec);
    const pose = specPose(shape, spec);
    const foot = spec.footprint ? flatOutline(shape) : [];
    const draw: Rect = { x: x0 + c * cw + 8, y: top + r * rowH + 6, w: cw - 16, h: rowH - LABEL_H - 12 };
    return { spec, shape, pose, foot, draw, bounds: poseBounds(shape, pose, foot) };
  });
  // One scale for all: the largest every picture fits at.
  const s = Math.min(...cells.map((c) => (c.bounds ? fitIn(c.bounds, c.draw, 0.04).s : Infinity)));
  return (
    <g className="ms-net ms-net--set" role="group" aria-label={label}>
      {cells.map((c, i) => {
        if (!c.bounds) return null;
        const fit = { ...fitIn(c.bounds, c.draw, 0.04), s };
        const lands = landedFaces(c.shape);
        const name = c.spec.label ? plainText(tx(c.spec.label, locale), locale) : '';
        return (
          <g key={i} className="ms-net__item" role="img" aria-label={[name, describeNet(c.spec, locale)].filter(Boolean).join(': ')}>
            {c.foot.length > 0 && <GroundLines lines={c.foot} pose={c.pose} fit={fit} className="ms-net__foot" />}
            {c.shape.kind === 'sphere' ? (
              <SphereDrawing solid={c.shape.solid} pose={c.pose} fit={fit} />
            ) : (
              <NetFaces
                shape={c.shape}
                pose={c.pose}
                fit={fit}
                look={(f) => {
                  if (f.piece) return { tone: (c.spec.tone?.[f.piece.face] as FaceTone | undefined) ?? null, mark: null, ghost: false };
                  const pair = c.spec.pairs ? pairOf(c.shape.solid, lands[f.node!] ?? null) : null;
                  return { tone: pair === null ? null : (`pair-${pair + 1}` as FaceTone), mark: pair === null ? null : (['●', '▲', '■'] as const)[pair]!, ghost: false };
                }}
              />
            )}
            {name && (
              <text className="ms-net__label" x={c.draw.x + c.draw.w / 2} y={c.draw.y + c.draw.h + 22} textAnchor="middle" aria-hidden="true">
                {name}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
