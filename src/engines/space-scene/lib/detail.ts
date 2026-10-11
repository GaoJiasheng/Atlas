/**
 * A part's `detail` text as paragraphs of text runs and source markers
 * (`[S3]`, `[S3, S7]`, shared `[M3]`; pure, unit-tested). The inspector renders markers as
 * the same source superscripts as `<Num s>` in chapter bodies.
 */

/** `[S3]` / `[S3, S7]` source markers (ids in data/sources.json; `[M3]` a shared source). */
const MARKER = /\[([SM][1-9]\d*(?:\s*,\s*[SM][1-9]\d*)*)\]/g;

/** Source ids cited by `[S#]` / `[M#]` markers in a text (the schema checks them against data/sources.json and the shared sources). */
export function detailSourceIds(text: string): string[] {
  return [...text.matchAll(MARKER)].flatMap((m) => m[1]!.split(/\s*,\s*/));
}

export type DetailRun = { text: string } | { sources: string[] };

/** Paragraphs split on blank lines; each paragraph is a list of runs. */
export function detailParagraphs(text: string): DetailRun[][] {
  return text
    .split(/\n\s*\n/)
    .map((para) => para.replace(/\s*\n\s*/g, ' ').trim())
    .filter((para) => para.length > 0)
    .map((para) => {
      const runs: DetailRun[] = [];
      let last = 0;
      for (const m of para.matchAll(MARKER)) {
        const before = para.slice(last, m.index).replace(/\s+$/, '');
        if (before) runs.push({ text: before });
        runs.push({ sources: m[1]!.split(/\s*,\s*/) });
        last = m.index + m[0].length;
      }
      const rest = para.slice(last);
      if (rest.trim()) runs.push({ text: rest });
      return runs;
    });
}
