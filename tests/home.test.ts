import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { topicSchema } from '../src/content/schema/topic';
import manifest from '../src/lib/illustrations.json';
import {
  FRONT_LAYOUTS,
  FRONT_WIDTH,
  catalogueLayout,
  composeFrontispiece,
  estimateLabelWidth,
  leaderPath,
  pickFeatured,
  relaxLabels,
  snapAnchor,
  topicStats,
} from '../src/lib/home';

const ROOT = join(import.meta.dirname, '..');
const TOPICS = join(ROOT, 'src/content/topics');

function loadData(slug: string): Record<string, unknown> {
  const dir = join(TOPICS, slug, 'data');
  return Object.fromEntries(
    readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => [f.replace(/\.json$/, ''), JSON.parse(readFileSync(join(dir, f), 'utf8'))]),
  );
}

const topics = readdirSync(TOPICS).map((slug) => ({
  slug,
  data: topicSchema.parse(parseYaml(readFileSync(join(TOPICS, slug, 'topic.yaml'), 'utf8'))),
}));

describe('topicStats', () => {
  it('counts history maps, object anatomies and lessons from their data', () => {
    expect(topicStats('time-scene', loadData('ww2'), 11)).toEqual([
      { n: 11, key: 'index.stats.chapters' },
      { n: 78, key: 'index.stats.events' },
      { n: 12, key: 'index.stats.keyframes' },
    ]);
    expect(topicStats('space-scene', loadData('aircon'), 5)).toEqual([
      { n: 5, key: 'index.stats.chapters' },
      { n: 37, key: 'index.stats.parts' },
    ]);
    expect(topicStats('space-scene', loadData('circuits'), 6)).toEqual([
      { n: 6, key: 'index.stats.chapters' },
      { n: 36, key: 'index.stats.parts' },
    ]);
    expect(topicStats('space-scene', loadData('magnets'), 6)).toEqual([
      { n: 6, key: 'index.stats.chapters' },
      { n: 39, key: 'index.stats.parts' },
    ]);
    expect(topicStats('space-scene', loadData('forces'), 6)).toEqual([
      { n: 6, key: 'index.stats.chapters' },
      { n: 46, key: 'index.stats.parts' },
    ]);
    expect(topicStats('space-scene', loadData('energy-conversion'), 6)).toEqual([
      { n: 6, key: 'index.stats.chapters' },
      { n: 53, key: 'index.stats.parts' },
    ]);
    expect(topicStats('space-scene', loadData('mosquito'), 6)).toEqual([
      { n: 6, key: 'index.stats.chapters' },
      { n: 52, key: 'index.stats.parts' },
    ]);
    expect(topicStats('math-scene', loadData('fractions'), 14)).toEqual([
      { n: 12, key: 'index.stats.steps' },
      { n: 51, key: 'index.stats.beats' },
      { n: 8, key: 'index.stats.questions' },
    ]);
    expect(topicStats('math-scene', loadData('area-perimeter'), 13)).toEqual([
      { n: 11, key: 'index.stats.steps' },
      { n: 45, key: 'index.stats.beats' },
      { n: 8, key: 'index.stats.questions' },
    ]);
    expect(topicStats('math-scene', loadData('telling-time'), 13)).toEqual([
      { n: 11, key: 'index.stats.steps' },
      { n: 46, key: 'index.stats.beats' },
      { n: 8, key: 'index.stats.questions' },
    ]);
    expect(topicStats('math-scene', loadData('multiplication-division'), 14)).toEqual([
      { n: 12, key: 'index.stats.steps' },
      { n: 54, key: 'index.stats.beats' },
      { n: 8, key: 'index.stats.questions' },
    ]);
    expect(topicStats('math-scene', loadData('decimals'), 17)).toEqual([
      { n: 15, key: 'index.stats.steps' },
      { n: 69, key: 'index.stats.beats' },
      { n: 8, key: 'index.stats.questions' },
    ]);
    expect(topicStats('math-scene', loadData('measuring'), 15)).toEqual([
      { n: 13, key: 'index.stats.steps' },
      { n: 58, key: 'index.stats.beats' },
      { n: 8, key: 'index.stats.questions' },
    ]);
  });

  it('drops zero counts and tolerates missing files', () => {
    expect(topicStats('time-scene', {}, 0)).toEqual([]);
    expect(topicStats('space-scene', { parts: { parts: [] } }, 2)).toEqual([{ n: 2, key: 'index.stats.chapters' }]);
  });
});

describe('illustrations', () => {
  it('every published topic names a drawing that has been processed (webp 1x + 2x within budget, mask)', () => {
    const known = manifest as Record<string, { mask: string[] }>;
    for (const { slug, data } of topics.filter((t) => t.data.status === 'published')) {
      expect(data.illustration, slug).toBeDefined();
      const stem = data.illustration!;
      expect(known[stem]?.mask, stem).toHaveLength(16);
      for (const [file, budget] of [
        [`${stem}.webp`, 92 * 1024],
        [`${stem}@2x.webp`, 266 * 1024],
      ] as const) {
        const path = join(ROOT, 'public/illustrations', file);
        expect(existsSync(path), file).toBe(true);
        expect(statSync(path).size, file).toBeLessThanOrEqual(budget);
      }
    }
  });
});

describe('pickFeatured', () => {
  const t = (id: string, featured: boolean | number, hasIllustration = true) => ({ id, featured, hasIllustration });

  it('puts ranked topics first, then plain true in catalogue order, skipping undrawn ones', () => {
    const picked = pickFeatured([t('a', true), t('b', 2), t('c', false), t('d', 1), t('e', 3, false), t('f', true)]);
    expect(picked.map((p) => p.id)).toEqual(['d', 'b', 'a', 'f']);
  });

  it('falls back to the first drawn topics and caps at five', () => {
    const many = Array.from({ length: 8 }, (_, i) => t(`t${i}`, false, i !== 1));
    expect(pickFeatured(many).map((p) => p.id)).toEqual(['t0', 't2', 't3', 't4', 't5']);
  });

  it('features the five featured published topics (the muscle series is not featured), the grasshopper in the largest slot', () => {
    const published = topics
      .filter((x) => x.data.status === 'published')
      .map((x) => ({ id: x.slug, featured: x.data.featured, hasIllustration: !!x.data.illustration }));
    const picked = pickFeatured(published);
    expect(picked).toHaveLength(5);
    expect(picked[0]?.id).toBe('grasshopper');
  });
});

describe('composeFrontispiece', () => {
  const label = (en: string, zh: string) => ({ en, zh });
  const LABELS = [
    label('Grasshopper', '蝗虫'),
    label('Second World War', '第二次世界大战'),
    label('Air conditioner', '空调'),
    label('First World War', '第一次世界大战'),
    label('Fractions', '分数'),
  ];
  const masks = manifest as Record<string, { mask: string[] }>;
  const stems = ['grasshopper', 'ww2', 'aircon', 'ww1', 'fractions'];

  for (const layout of ['wide', 'narrow'] as const) {
    for (let n = 1; n <= FRONT_LAYOUTS[layout].slots.length; n++) {
      it(`${layout}, ${n} drawing(s): labels never overlap and stay in the box, anchors land on ink`, () => {
        const items = stems.slice(0, n).map((s, i) => ({ mask: masks[s]?.mask, label: LABELS[i]! }));
        const comp = composeFrontispiece(items, layout);
        expect(comp.items).toHaveLength(n);
        const spans = comp.items.map((it) => {
          const l = it.label;
          const x0 = l.align === 'start' ? l.x : l.x - l.width;
          return { x0, x1: x0 + l.width, y: l.y };
        });
        for (const s of spans) {
          expect(s.x0).toBeGreaterThanOrEqual(-0.5);
          expect(s.x1).toBeLessThanOrEqual(FRONT_WIDTH + 0.5);
          expect(s.y).toBeLessThanOrEqual(comp.height);
        }
        for (let i = 0; i < spans.length; i++) {
          for (let j = i + 1; j < spans.length; j++) {
            const a = spans[i]!;
            const b = spans[j]!;
            const sameRow = Math.abs(a.y - b.y) < 40;
            expect(sameRow && Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0), `labels ${i} and ${j}`).toBe(false);
          }
        }
        for (const it of comp.items) {
          expect(it.leader).toMatch(/^M[\d.-]+ [\d.-]+H[\d.-]+L[\d.-]+ [\d.-]+$/);
          expect(it.anchor.x).toBeGreaterThan(it.x - 20);
          expect(it.anchor.x).toBeLessThan(it.x + it.w + 20);
        }
      });
    }
  }

  it('drops items beyond the layout capacity (the phone shows two)', () => {
    const items = LABELS.map((l) => ({ label: l }));
    expect(composeFrontispiece(items, 'narrow').items).toHaveLength(2);
    expect(composeFrontispiece(items, 'wide').items).toHaveLength(5);
    expect(composeFrontispiece([], 'wide').items).toHaveLength(0);
  });
});

describe('frontispiece helpers', () => {
  it('snaps an anchor to the nearest inked cell', () => {
    const mask = Array.from({ length: 16 }, (_, r) => (r === 12 ? '0000000000ff0000' : '0000000000000000'));
    const [x, y] = snapAnchor(mask, 0.5, 0.5);
    expect(x).toBeCloseTo(10.5 / 16);
    expect(y).toBeCloseTo(12.5 / 16);
    expect(snapAnchor(undefined, 0.3, 0.4)).toEqual([0.3, 0.4]);
  });

  it('spreads labels that share a band', () => {
    const labels = [
      { x: 100, y: 50, align: 'start' as const, width: 300 },
      { x: 200, y: 60, align: 'start' as const, width: 300 },
    ];
    relaxLabels(labels);
    expect(labels[0]!.x + labels[0]!.width).toBeLessThanOrEqual(labels[1]!.x);
  });

  it('estimates wider labels for longer names', () => {
    expect(estimateLabelWidth({ en: 'Second World War', zh: '第二次世界大战' }, 660)).toBeGreaterThan(
      estimateLabelWidth({ en: 'Fractions', zh: '分数' }, 660),
    );
  });

  it('ticks a leader outwards, longer when it climbs past the label text', () => {
    expect(leaderPath({ x: 100, y: 50, align: 'start' }, { x: 300, y: 300 }, 26)).toBe('M100 50H86L300 300');
    const climbing = leaderPath({ x: 100, y: 790, align: 'start' }, { x: 250, y: 600 }, 26);
    const tick = Number(/H([\d.]+)/.exec(climbing)?.[1]);
    expect(100 - tick).toBeGreaterThan(14);
  });
});

describe('catalogueLayout', () => {
  const make = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `t${i}`, subject: (['history', 'science', 'biology'] as const)[i % 3]! }));

  it('stays one grid up to the threshold', () => {
    expect(catalogueLayout(make(9)).mode).toBe('grid');
  });

  it('splits into subject sections (SUBJECTS order, empty ones left out) past it', () => {
    const c = catalogueLayout(make(10));
    expect(c.mode).toBe('sections');
    if (c.mode !== 'sections') return;
    expect(c.sections.map((s) => s.subject)).toEqual(['science', 'history', 'biology']);
    expect(c.sections.reduce((n, s) => n + s.items.length, 0)).toBe(10);
  });
});
