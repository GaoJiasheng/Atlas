import type { GlossaryTerm } from '../../content/schema/glossary';

/** Read glossary data without importing its optional rich-text renderer. */
export function topicGlossary(data: unknown): readonly GlossaryTerm[] {
  if (!data || typeof data !== 'object' || !('glossary' in data)) return [];
  const file = (data as { glossary?: { terms?: GlossaryTerm[] } }).glossary;
  return file?.terms ?? [];
}
