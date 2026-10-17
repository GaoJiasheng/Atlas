/**
 * The lesson's way of writing times (`lesson.json` `notation`, docs/20 D5 / D6) for a chapter body's `<Time>` and
 * `<Dur>`: read at build time from the topic the page belongs to, so a chapter writes times exactly as the lesson's
 * `{t:…}` / `{d:…}` tokens do. A topic without a lesson (or without `notation`) uses the default.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CLOCK12_NOTATIONS, CLOCK24_NOTATIONS, DEFAULT_NOTATION, type Notation } from '../../engines/math-scene/lib/value';

const cache = new Map<string, Notation>();

export function topicNotation(url: URL): Notation {
  const slug = /\/topics\/([^/]+)/.exec(url.pathname)?.[1];
  if (!slug) return DEFAULT_NOTATION;
  const hit = cache.get(slug);
  if (hit) return hit;
  const file = join(process.cwd(), 'src/content/topics', slug, 'data/lesson.json');
  let n: Notation = DEFAULT_NOTATION;
  if (existsSync(file)) {
    const raw = (JSON.parse(readFileSync(file, 'utf8')) as { notation?: Partial<Notation> }).notation ?? {};
    n = {
      clock12: CLOCK12_NOTATIONS.includes(raw.clock12 as Notation['clock12']) ? (raw.clock12 as Notation['clock12']) : DEFAULT_NOTATION.clock12,
      clock24: CLOCK24_NOTATIONS.includes(raw.clock24 as Notation['clock24']) ? (raw.clock24 as Notation['clock24']) : DEFAULT_NOTATION.clock24,
    };
  }
  cache.set(slug, n);
  return n;
}
