/** Node-only QA expectations: unused catalogue text may stay selection-loading. */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import type { CatalogueIndex } from '../../src/engines/time-scene/catalogueSchema';

type Chapter = { id: string; state: { catalogueIndex?: CatalogueIndex; beats?: { catalogueIndex?: CatalogueIndex }[] } };
export function catalogueQaLayers(topic: string, snapshot: { chapter: string | null; layers: string[]; beat?: unknown }) {
  const dir = resolve(import.meta.dirname, '../../src/content/topics', topic);
  const metadata = parse(readFileSync(resolve(dir, 'topic.yaml'), 'utf8')) as { datedLayers?: { id: string; catalogue?: unknown }[] };
  const chapters = readdirSync(resolve(dir, 'chapters')).filter((file) => file.endsWith('.mdx')).map((file) => {
    const text = readFileSync(resolve(dir, 'chapters', file), 'utf8');
    return parse(/^---\n([\s\S]*?)\n---/.exec(text)![1]!) as Chapter;
  });
  const state = chapters.find((chapter) => chapter.id === snapshot.chapter)?.state;
  const index = typeof snapshot.beat === 'number' ? state?.beats?.[snapshot.beat]?.catalogueIndex ?? state?.catalogueIndex : state?.catalogueIndex;
  return {
    geometry: (metadata.datedLayers ?? []).filter((layer) => snapshot.layers.includes(layer.id)).map((layer) => layer.id),
    indexed: (index ?? []).filter((group) => snapshot.layers.includes(group.layerId)).map((group) => group.layerId),
  };
}
