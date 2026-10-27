/** Modern evidence stays in its own coordinate space, never on the ancient main map. */
import { useId, useMemo, useState, useEffect, useRef } from 'react';
import type { Feature, Geometry, Position } from 'geojson';
import type { Locale } from '../core/types';
import { tx } from '../../i18n';
import { SourceRefs } from '../widgets/SourcePopover';
import {
  filterModernPoints, snapshotReferenceId, type DeepTimeBundle, type ModernInsetConfig, type InsetView,
  type FossilMode, type ModernPoint, type ReferenceCard,
} from './lib/deepTime';
import { mercY } from './lib/territory';
import './deep-time.css';

export interface ModernInsetProps {
  bundle: DeepTimeBundle;
  config: ModernInsetConfig;
  locale: Locale;
  selectedMa: number;
  view: InsetView;
  insetVisible: boolean;
  fossilMode: FossilMode;
  fossilsEnabled: boolean;
  highlight: readonly string[];
  selectedObjectId: string | null;
  onSelect(id: string): void;
  onPatch(patch: { inset?: InsetView; insetVisible?: boolean; fossilMode?: FossilMode }): void;
}
const words = (locale: Locale, en: string, zh: string) => locale === 'zh' ? zh : en;
const ma = (n: number) => String(Number(n.toFixed(3)));
const cardPrecision = (precision: ReferenceCard['precision'], locale: Locale) => precision === 'region-only'
  ? words(locale, 'Region only', '仅到地区精度')
  : words(locale, 'Country only', '仅到国家精度');
type Project = (p: Position) => [number, number];
function polygonPath(g: Geometry, project: Project): string {
  const polygons = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  return polygons.flatMap((p) => p.map((r) => r.map((point, i) => {
    const [x, y] = project(point); return `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join('') + 'Z')).join('');
}
function featureId(f: Feature): string { return String(f.id ?? f.properties?.id ?? f.properties?.ADM0_A3 ?? f.properties?.ISO_A3 ?? ''); }

function EvidenceCard({ card, locale, onSelect }: { card: ReferenceCard; locale: Locale; onSelect(id: string): void }) {
  return <article className="ts-evidence-card" data-id={card.id} data-hud-panel="modern-evidence">
    <button className="ts-modern__card-title" onClick={() => onSelect(card.id)} type="button">{tx(card.title, locale)}</button>
    <p className="ts-modern__precision">{tx(card.regionLabel, locale)} · {cardPrecision(card.precision, locale)}</p>
    <p>{tx(card.summary, locale)}<SourceRefs ids={card.sources} locale={locale} /></p>
  </article>;
}

export function ModernInset(props: ModernInsetProps) {
  const { bundle, config, locale, selectedMa, view, insetVisible, fossilMode, fossilsEnabled, highlight, selectedObjectId, onSelect, onPatch } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const [hitRadius, setHitRadius] = useState(22);
  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;
    const measure = () => setHitRadius(Math.max(22, 22 * 360 / Math.max(1, svg.clientWidth)));
    measure(); const observer = new ResizeObserver(measure); observer.observe(svg); return () => observer.disconnect();
  }, [insetVisible]);
  const uid = useId().replace(/:/g, '');
  const bounds = config.views.find((v) => v.id === view)!.bounds;
  const result = useMemo(() => filterModernPoints(bundle.points, { selectedMa, halfWidthMa: config.ageWindowHalfWidthMa, fossilMode, fossilsEnabled, insetVisible, bounds, cards: bundle.cards }), [bundle, selectedMa, config.ageWindowHalfWidthMa, fossilMode, fossilsEnabled, insetVisible, bounds]);
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [view, fossilMode, selectedMa, fossilsEnabled]);
  const evidenceCards = bundle.cards.filter((c) => highlight.includes(c.id) || c.id === selectedObjectId);
  const countryHighlights = new Set(evidenceCards.map((c) => c.linkedCountryFeatureId).filter(Boolean));
  const within = (p: ModernPoint) => p.at[0] >= bounds[0] && p.at[0] <= bounds[2] && p.at[1] >= bounds[1] && p.at[1] <= bounds[3];
  const visible = result.visiblePoints.filter(within);
  const selectedIndex = visible.findIndex((p) => p.id === selectedObjectId);
  useEffect(() => { if (selectedIndex >= 0) setPage(Math.floor(selectedIndex / 20)); }, [selectedIndex, selectedObjectId]);
  const pageCount = Math.ceil(visible.length / 20);
  const actualPage = Math.min(page, Math.max(0, pageCount - 1));
  const projection = useMemo(() => {
    const w = 360; const h = 206; const [west, south, east, north] = bounds;
    const sy = mercY(south); const ny = mercY(north);
    const scale = Math.min(w / (east - west), h / (ny - sy));
    const ox = (w - (east - west) * scale) / 2; const oy = (h - (ny - sy) * scale) / 2;
    const project: Project = (p) => [ox + ((p[0] ?? 0) - west) * scale, oy + (ny - mercY(p[1] ?? 0)) * scale];
    const land = (bundle.land?.features ?? []).map((f) => ({ id: featureId(f), d: polygonPath(f.geometry, project) }));
    const countries = (bundle.countries?.features ?? []).map((f) => ({ id: featureId(f), d: polygonPath(f.geometry, project) }));
    return { project, land, countries };
  }, [bundle.land, bundle.countries, bounds]);
  if (!insetVisible) return null;
  return <section className="ts-modern" data-hud-panel="modern-inset" aria-label={tx(config.label, locale)}>
    <header className="ts-modern__header"><strong>{words(locale, 'TODAY · Modern find locations', '今天 · 现代发现地点')}</strong>
      <button className="ts-modern__icon-button" type="button" onClick={() => onPatch({ insetVisible: false })} aria-label={words(locale, 'Hide modern map', '隐藏现代小图')}>×</button>
    </header>
    <div className="ts-modern__views" role="group" aria-label={words(locale, 'Modern map view', '现代小图视图')}>
      {config.views.map((v) => <button key={v.id} type="button" aria-pressed={view === v.id} onClick={() => onPatch({ inset: v.id })}>{tx(v.label, locale)}</button>)}
    </div>
    <p className="ts-modern__mode">{fossilMode === 'all-mesozoic'
      ? words(locale, 'Finds across the Mesozoic; these did not all live together.', '跨中生代的发现地；并非同时生存。')
      : words(locale, `Age ranges overlap ${ma(result.queryWindowMa![0])}–${ma(result.queryWindowMa![1])} Ma (±5 Ma browsing choice).`, `年龄范围与 ${ma(result.queryWindowMa![0])}–${ma(result.queryWindowMa![1])} 百万年前有交集（±5 Ma 浏览设置）。`)}</p>
    <svg ref={svgRef} className="ts-modern__map" viewBox="0 0 360 206" role="img" aria-label={words(locale, 'Modern land and published collection positions', '现代陆地与已发表的采集记录组位置')}>
      <defs><clipPath id={`modern-clip-${uid}`}><rect x="0" y="0" width="360" height="206" /></clipPath></defs>
      <g clipPath={`url(#modern-clip-${uid})`}>
        <rect width="360" height="206" className="ts-modern__water" />
        {projection.land.map((p, i) => <path key={`${p.id}-${i}`} d={p.d} className="ts-modern__land" fillRule="evenodd" />)}
        {projection.countries.map((p, i) => <path key={`${p.id}-${i}`} d={p.d} className={`ts-modern__country${countryHighlights.has(p.id) ? ' is-highlighted' : ''}`} fillRule="evenodd" />)}
        {visible.map((point) => {
          const [x, y] = projection.project(point.at); const active = highlight.includes(point.id) || point.id === selectedObjectId;
          const isReference = point.kind === 'reference';
          const labelX = Math.max(5, Math.min(220, x + 17)); const labelY = Math.max(15, Math.min(195, y - 15));
          return <g key={point.id} className={`ts-modern__point${active ? ' is-highlighted' : ''}${isReference ? ' is-reference' : ''}`}>
            <circle cx={x} cy={y} r={active ? 4.5 : isReference ? 3.5 : 2} className="ts-modern__dot" />
            <circle cx={x} cy={y} r={hitRadius} className="ts-modern__hit" onClick={() => onSelect(point.id)}><title>{tx(point.title, locale)}</title></circle>
            {(active || isReference) && <g className="ts-modern-label" data-id={point.id}>
              <path d={`M${x},${y}L${labelX},${labelY + 4}`} className="ts-modern__leader" />
              <text x={labelX} y={labelY} className="ts-modern__label" onClick={() => onSelect(point.id)}>{tx(point.title, locale)}</text>
            </g>}
          </g>;
        })}
      </g>
    </svg>
    <p className="ts-modern__counts">{words(locale, `${result.fossilsInView} collections in this view · ${result.fossilsVisible} selected`, `本视图 ${result.fossilsInView} 个采集记录组 · 已选 ${result.fossilsVisible} 个`)}
      <SourceRefs ids={[...new Set(bundle.points.filter((p) => p.kind === 'fossil-collection').flatMap((p) => p.sources))]} locale={locale} /></p>
    {!fossilsEnabled && <p className="ts-modern__note">{words(locale, 'Fossil symbols are off. Reference points and evidence cards remain available.', '化石符号已关闭。参照点与证据卡仍可查看。')}</p>}
    <div className="ts-modern__modes" role="group" aria-label={words(locale, 'Fossil age filter', '化石年代筛选')}>
      <button type="button" aria-pressed={fossilMode === 'age-window'} onClick={() => onPatch({ fossilMode: 'age-window' })}>{words(locale, 'Age window', '浏览年代窗')}</button>
      <button type="button" aria-pressed={fossilMode === 'all-mesozoic'} onClick={() => onPatch({ fossilMode: 'all-mesozoic' })}>{words(locale, 'All selected records', '全部所选记录')}</button>
    </div>
    {evidenceCards.map((c) => <EvidenceCard key={c.id} card={c} locale={locale} onSelect={onSelect} />)}
    <details className="ts-modern__list"><summary>{words(locale, `Browse ${visible.length} points in this view`, `浏览本视图的 ${visible.length} 个点`)}</summary>
      <ul>{visible.slice(actualPage * 20, actualPage * 20 + 20).map((p) => <li key={p.id}><button type="button" aria-pressed={p.id === selectedObjectId} onClick={() => onSelect(p.id)}>{tx(p.title, locale)}{p.kind === 'fossil-collection' && <small>PBDB {p.pbdbCollectionId}</small>}</button></li>)}</ul>
      {pageCount > 1 && <nav className="ts-modern__pages" aria-label={words(locale, 'Find list pages', '发现记录列表分页')}>
        <button type="button" disabled={actualPage === 0} onClick={() => setPage(actualPage - 1)}>{words(locale, 'Previous', '上一页')}</button>
        <span>{actualPage + 1} / {pageCount}</span>
        <button type="button" disabled={actualPage + 1 >= pageCount} onClick={() => setPage(actualPage + 1)}>{words(locale, 'Next', '下一页')}</button>
      </nav>}
    </details>
  </section>;
}

export interface ModernInspectorProps {
  object: ModernPoint | ReferenceCard;
  locale: Locale;
  outsideWindow?: boolean;
  references?: Readonly<Record<string, string>>;
  showAll?(): void;
  onClose(): void;
}
export function ModernInspector({ object, locale, outsideWindow, showAll, onClose, references }: ModernInspectorProps) {
  return <article className="ts-event ts-modern-inspector" data-id={object.id}>
    <header className="ts-event__header"><p className="ts-event__eyebrow">{words(locale, 'MODERN EVIDENCE', '现代证据位置')}</p>
      <button className="ts-modern__icon-button" type="button" onClick={onClose} aria-label={words(locale, 'Close evidence', '关闭证据')}>×</button></header>
    <h3 className="ts-event__title">{tx(object.title, locale)}</h3>
    <p>{tx(object.summary, locale)}<SourceRefs ids={object.sources} locale={locale} /></p>
    {outsideWindow && <p className="ts-modern__outside" role="status">{words(locale, 'This record is outside the current browsing window.', '该记录在当前浏览窗外。')}
      {showAll && <button type="button" onClick={showAll}>{words(locale, 'Show all selected records', '显示全部所选记录')}</button>}</p>}
    {object.kind === 'reference-card'
      ? <p>{tx(object.regionLabel, locale)} · {cardPrecision(object.precision, locale)}</p>
      : <p>{words(locale, 'Modern position', '现代位置')} [{object.at.join(', ')}]
        {object.kind === 'fossil-collection' ? <> · {tx(object.precision, locale)}</> : words(locale, ' · reference only', ' · 仅为参照')}</p>}
    {object.kind === 'reference' && object.role === 'impact-site' && <p>{words(locale, `Event age: ${ma(object.eventAge.ma)} Ma`, `事件年龄：${ma(object.eventAge.ma)} 百万年前`)}</p>}
    {object.kind === 'fossil-collection' && <>
      <p>{words(locale, 'PBDB collection', 'PBDB 采集记录组')} {object.pbdbCollectionId} · {words(locale, `${object.occurrenceAges.length} occurrence records`, `${object.occurrenceAges.length} 条化石出现记录`)}</p>
      <ul className="ts-modern__ages">{object.occurrenceAges.map((a) => <li key={a.pbdbOccurrenceId}>
        <strong>{ma(a.olderMa)}–{ma(a.youngerMa)} Ma</strong> · PBDB {a.pbdbOccurrenceId}
        <p>{tx(a.basis, locale)}<SourceRefs ids={a.sources} locale={locale} /></p>
        {references?.[snapshotReferenceId(a.basis) ?? ''] && <p className="ts-modern__citation"><b>{words(locale, 'Original bibliography (title in original language)', '原始书目（题名保留原文）')}</b> {references[snapshotReferenceId(a.basis)!]}</p>}
      </li>)}</ul>
    </>}
    {object.detail && <p>{tx(object.detail, locale)}</p>}
  </article>;
}

export function ModernIndex({ ids, bundle, locale, onSelect }: { ids: readonly string[]; bundle: DeepTimeBundle; locale: Locale; onSelect(id: string): void }) {
  const byId = new Map([...bundle.points, ...bundle.cards].map((o) => [o.id, o]));
  return <nav className="ts-modern-index" aria-label={words(locale, 'Chapter evidence', '本章证据')}>
    {ids.map((id) => { const object = byId.get(id); return object && <button key={id} type="button" onClick={() => onSelect(id)}>{tx(object.title, locale)}</button>; })}
  </nav>;
}

/** Presentation evidence uses the same filtered picture and named cards as the reader. */
export function ModernEvidence(props: ModernInsetProps) {
  return <aside className="ts-modern-evidence" data-hud-panel="present-evidence"><ModernInset {...props} /></aside>;
}
