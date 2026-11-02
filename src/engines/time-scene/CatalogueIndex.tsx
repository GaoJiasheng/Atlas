import { useEffect, useMemo, useState } from 'react';
import { tx } from '../../i18n';
import type { Locale } from '../core/types';
import type { CatalogueEntry } from './catalogueSchema';
import { cataloguePage } from './lib/catalogue';
export function CatalogueIndex({ entries, locale, pick, onSelect, onRows }: { entries: CatalogueEntry[]; locale: Locale; pick: string | null; onSelect(id: string): boolean; onRows(count: number): void }) {
  const [query, setQuery] = useState(''), [search, setSearch] = useState(''), [page, setPage] = useState(0);
  useEffect(() => { const timer = setTimeout(() => { setSearch(query); setPage(0); }, 150); return () => clearTimeout(timer); }, [query]);
  const found = useMemo(() => cataloguePage(entries, search, page), [entries, search, page]);
  useEffect(() => { onRows(found.rows.length); }, [found.rows.length, onRows]);
  useEffect(() => setPage(0), [entries]);
  return <section className="ts-catalogue-index" data-catalogue-index="">
    <h3>{locale === 'en' ? 'Layer catalogue' : '图层目录'} · {entries.length}</h3>
    <input type="search" aria-label={locale === 'en' ? 'Search catalogue' : '搜索目录'} placeholder={locale === 'en' ? 'Name or ID' : '名称或编号'} value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
    <ul>{found.rows.map((entry) => <li key={entry.id}><button type="button" data-catalogue-row={entry.id} aria-pressed={pick === entry.id} onClick={() => onSelect(entry.id)}>{tx(entry.title, locale)} <small>{entry.id}</small></button></li>)}</ul>
    {found.total > 50 && <nav aria-label={locale === 'en' ? 'Catalogue pages' : '目录分页'}><button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>←</button><span>{page + 1} / {Math.ceil(found.total / 50)}</span><button type="button" disabled={(page + 1) * 50 >= found.total} onClick={() => setPage(page + 1)}>→</button></nav>}
  </section>;
}
