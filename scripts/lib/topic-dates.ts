/**
 * Date helpers of the topic scaffold (scripts/new-topic.ts), pure so they are
 * unit-tested (tests/new-topic-dates.test.ts): BCE dates on the command line
 * and the default subtitle of a TimeScene topic.
 */

/**
 * `--start -0770-01-01` reads as two options to parseArgs (the value starts
 * with a dash): glue a BCE date to its flag (`--start=-0770-01-01`) first.
 */
export function glueBceDates(argv: readonly string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    const next = argv[i + 1];
    if ((a === '--start' || a === '--end') && next !== undefined && /^-\d{4}(?:-\d{2}){0,2}$/.test(next)) {
      out.push(`${a}=${next}`);
      i++;
    } else out.push(a);
  }
  return out;
}

/** "770–221 BCE" / "公元前770–前221年" for a BCE range, "1947–1991" (both languages) otherwise. */
export function yearRange(start: string, end: string, locale: 'en' | 'zh'): string {
  const year = (d: string) => Number(/^(-?\d{4})/.exec(d)?.[1] ?? Number.NaN);
  const a = year(start);
  const b = year(end);
  if (a >= 0 && b >= 0) return `${a}–${b}`;
  if (locale === 'zh') return a < 0 && b < 0 ? `公元前${-a}–前${-b}年` : `公元前${-a}年–公元${b}年`;
  return a < 0 && b < 0 ? `${-a}–${-b} BCE` : `${-a} BCE–${b} CE`;
}
