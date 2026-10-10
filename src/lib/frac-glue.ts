/**
 * Keep "fraction = fraction" groups on one line (docs/15 §4.2). A stacked
 * fraction is an atomic inline, so a browser may break the line right before
 * or after it, which in Chinese (a break opportunity between any two
 * characters) left an "=" or "+" alone at a line start. The operator beside a
 * fraction (and a plain number it works with, as in "= 1") is wrapped together
 * with the fraction in a `white-space: nowrap` span (`.atlas-nowrap`): "<Frac> = 1"
 * and "<Frac> + <Frac> = <Frac>" never split. Used by the MDX rehype plugin
 * (astro.config.mjs) for `<Frac>` in chapter bodies and by `renderRich` for
 * `{3/4}` tokens in data text.
 */
const OP = '[=+\\u2212<>\\u2260\\u2248\\u00D7\\u00F7]';
const NUM = '\\d+(?:\\.\\d+)?';
const WHOLE = new RegExp(`^\\s*${OP}\\s*$`);
const LEAD = new RegExp(`^\\s*${OP}\\s*(?:${NUM})?`);
const TRAIL = new RegExp(`(?:${NUM})?\\s*${OP}\\s*$`);

/** A piece of text beside a fraction: `glue` pieces (operator, number) belong to the fraction's nowrap group. */
export interface TextPiece {
  text: string;
  glue: boolean;
}

/** Split the text next to a fraction (`before`: a fraction precedes it, `after`: one follows) into glue and plain pieces. */
export function splitGlue(text: string, before: boolean, after: boolean): TextPiece[] {
  if (before && after && WHOLE.test(text)) return [{ text, glue: true }];
  const out: TextPiece[] = [];
  let rest = text;
  if (before) {
    const m = LEAD.exec(rest);
    if (m && m[0].trim() !== '') {
      out.push({ text: m[0], glue: true });
      rest = rest.slice(m[0].length);
    }
  }
  let tail: TextPiece | null = null;
  if (after) {
    const m = TRAIL.exec(rest);
    if (m && m[0].trim() !== '') {
      tail = { text: m[0], glue: true };
      rest = rest.slice(0, m.index);
    }
  }
  if (rest) out.push({ text: rest, glue: false });
  if (tail) out.push(tail);
  return out;
}

/** A node in a run of text and fractions. */
export interface RunItem<T> {
  node: T;
  /** A fraction, or a glue piece of text. */
  glued: boolean;
}

/** Group consecutive glued items (two or more) into runs; everything else passes through. */
export function groupRuns<T>(items: RunItem<T>[]): (T | T[])[] {
  const out: (T | T[])[] = [];
  let run: T[] = [];
  const flush = () => {
    if (run.length > 1) out.push(run);
    else out.push(...run);
    run = [];
  };
  for (const it of items) {
    if (it.glued) run.push(it.node);
    else {
      flush();
      out.push(it.node);
    }
  }
  flush();
  return out;
}

interface HastNode {
  type: string;
  name?: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const isFrac = (n: HastNode | undefined) => n !== undefined && (n.type === 'mdxJsxTextElement' || n.type === 'mdxJsxFlowElement') && n.name === 'Frac';

/** rehype plugin: wrap every operator group beside a `<Frac>` in an MDX body in a nowrap span. */
export function rehypeFracGlue() {
  const walk = (node: HastNode) => {
    const kids = node.children;
    if (!kids) return;
    if (!kids.some(isFrac)) {
      for (const k of kids) walk(k);
      return;
    }
    const items: RunItem<HastNode>[] = [];
    kids.forEach((k, i) => {
      if (isFrac(k)) items.push({ node: k, glued: true });
      else if (k.type === 'text' && typeof k.value === 'string') {
        for (const p of splitGlue(k.value, isFrac(kids[i - 1]), isFrac(kids[i + 1]))) items.push({ node: { type: 'text', value: p.text }, glued: p.glue });
      } else {
        walk(k);
        items.push({ node: k, glued: false });
      }
    });
    node.children = groupRuns(items).map((g) => (Array.isArray(g) ? { type: 'element', tagName: 'span', properties: { className: ['atlas-nowrap'] }, children: g } : g));
  };
  return (tree: HastNode) => walk(tree);
}
