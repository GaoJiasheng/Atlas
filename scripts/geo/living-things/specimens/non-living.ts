/**
 * Specimens #1–#3 (docs/38 §3.2): the three things on the bench that are not
 * alive. Each in its own frame (footprint centre on the floor, ≤ 7 cm square).
 */
import { bevel, blade, cyl, ellipsoid, lathe, sphere, sweep, wing, type Model, type Prim } from '../kit';

const RED = '#b23a2e';

/** #1 A toy car: body, cabin, four black wheels. No marks, no lettering. */
export function toyCar(): Model {
  const wheels: Prim[] = [];
  for (const x of [-0.019, 0.019]) {
    for (const z of [-0.0145, 0.0145]) wheels.push(cyl([x, 0.0075, z], 0.0075, 0.0075, 0.006, 'rubber', { rotation: [90, 0, 0] }));
  }
  return {
    primitive: bevel([0, 0.0125, 0], [0.062, 0.012, 0.03], 0.004, 'plastic', { tint: RED }),
    extra: [bevel([-0.004, 0.0235, 0], [0.032, 0.012, 0.026], 0.005, 'plastic', { tint: RED }), ...wheels],
  };
}

/** #2 A flat, rounded river pebble. */
export function pebble(): Model {
  return { primitive: ellipsoid([0, 0.0105, 0], 0.023, [1.32, 0.46, 0.98], 'abrasive', { tint: '#8f8b84', rotation: [0, 25, 0] }), extra: [] };
}

const FAKE_GREEN = '#4c9447';
const FAKE_PINK = '#de7ba0';

/** #3 A plastic flower in a plastic stand: a dead-straight stem, two identical smooth leaves, six identical petals. */
export function plasticFlower(): Model {
  const leaf = blade(0.026, 0.009, 0.45, 10, 1.4);
  const leafA = wing([0.0012, 0.045, 0], leaf, [0.75, 0.55, 0.35], [-0.42, 0, 0.9], 'plastic', { tint: FAKE_GREEN });
  const petals: Prim[] = [];
  const petal = blade(0.016, 0.009, 0.6, 10, 1.2);
  for (let k = 0; k < 6; k++) {
    const a = (k * 60 * Math.PI) / 180;
    const out = [Math.cos(a), 0.45, Math.sin(a)];
    petals.push(wing([0.0015 * Math.cos(a), 0.092, 0.0015 * Math.sin(a)], petal, out, [-Math.sin(a), 0, Math.cos(a)], 'plastic', { tint: FAKE_PINK }));
  }
  return {
    primitive: lathe([0, 0, 0], [[0, 0], [0.013, 0], [0.012, 0.012], [0.0125, 0.013], [0, 0.013]], 'plastic', { tint: FAKE_GREEN }),
    extra: [
      sweep([[0, 0.012, 0], [0, 0.09, 0]], 0.0013, 'plastic', { tint: FAKE_GREEN, radial: 8 }),
      leafA,
      wingFlip(leafA),
      ...petals,
      sphere([0, 0.094, 0], 0.0035, 'plastic', { tint: FAKE_PINK }),
    ],
  };
}

/** The second leaf of the plastic flower: the same leaf turned half a turn about the stem (identical, as moulded). */
function wingFlip(p: Prim): Prim {
  return wing([-0.0012, 0.045, 0], (p.shape ?? p.outline) as [number, number][], [-0.75, 0.55, -0.35], [0.42, 0, -0.9], 'plastic', { tint: FAKE_GREEN });
}
