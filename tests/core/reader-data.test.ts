import { describe, expect, it } from 'vitest';
import { topicGlossary } from '../../src/engines/core/reader-data';
import { topicGlossary as existing } from '../../src/engines/widgets/GlossaryCard';

describe('optional glossary loading', () => {
  it('preserves data extraction and references without loading the renderer', () => {
    const terms = [{ id: 'test', term: { en: 'Test', zh: '测试' }, definition: { en: 'Definition', zh: '定义' }, see: [] }];
    for (const data of [undefined, null, false, '', {}, { glossary: {} }, { glossary: { terms } }]) {
      expect(topicGlossary(data)).toEqual(existing(data));
    }
    expect(topicGlossary({ glossary: { terms } })).toBe(terms);
  });
});
