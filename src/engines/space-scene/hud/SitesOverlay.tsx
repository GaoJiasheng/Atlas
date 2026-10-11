/**
 * Muscle attachment markers (docs/16 §6.3, M6) in the `leaders` SVG: for the
 * selected muscle part and the parts the chapter / beat lists in `sites`, an
 * origin is a hollow dot, an insertion a solid one (screen-constant, HUD ink),
 * a broad attachment a hairline through its points, and a dashed line joins
 * the origin's and the insertion's centroids: the muscle's line of pull. The
 * stage projects the points every frame (`bridge.sites`, following the
 * bones); this writes only `cx` / `cy` / `d` / opacity. Clicking a marker
 * (44 px target) selects the bone it sits on.
 */
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useScene, useSceneContext, useSceneStore, useT } from '../../core/context';
import { tx } from '../../../i18n';
import { activeSites, pullLines, siteKey } from '../lib/sites';
import type { SpaceSceneExt } from '../index';
import type { PartsFile } from '../schema';
import type { StageBridge } from '../bridge';

export function SitesOverlay({ file, bridge }: { file: PartsFile; bridge: StageBridge }) {
  const { locale } = useSceneContext();
  const t = useT();
  const store = useSceneStore<SpaceSceneExt>();
  const s = useScene<SpaceSceneExt, { part: string | null; sites: string[] }>((st) => ({ part: st.part, sites: st.sites }));
  const sites = file.sites;
  const active = useMemo(() => activeSites(sites, s.part, s.sites), [sites, s.part, s.sites]);
  const lines = useMemo(() => (sites ? pullLines(sites, active) : []), [sites, active]);
  const root = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    bridge.invalidate();
  }, [bridge, active]);

  useEffect(() => {
    const g = root.current;
    if (!g || !sites) return;
    const update = () => {
      for (const el of g.querySelectorAll<SVGElement>('[data-key]')) {
        const pt = bridge.sites.get(el.dataset.key!);
        if (!pt) {
          el.style.opacity = '0';
          continue;
        }
        el.setAttribute('cx', pt.x.toFixed(1));
        el.setAttribute('cy', pt.y.toFixed(1));
        el.style.opacity = pt.shown ? '' : '0';
      }
      for (const el of g.querySelectorAll<SVGPathElement>('[data-path]')) {
        const keys = el.dataset.path!.split(' ');
        const pts = keys.map((k) => bridge.sites.get(k));
        if (pts.some((p) => !p)) continue;
        el.setAttribute('d', pts.map((p, i) => `${i ? 'L' : 'M'}${p!.x.toFixed(1)} ${p!.y.toFixed(1)}`).join(''));
        el.style.opacity = pts.every((p) => p!.shown) ? '' : '0';
      }
    };
    bridge.listeners.add(update);
    update();
    return () => {
      bridge.listeners.delete(update);
    };
  }, [bridge, sites, active]);

  if (!sites || active.length === 0) return null;
  const name = (id: string) => {
    const p = file.parts.find((x) => x.id === id);
    return p ? tx(p.short ?? p.name, locale) : id;
  };
  return (
    <g ref={root} className="space-sites" data-sites={active.map((i) => sites[i]!.muscle).join(',')}>
      {lines.map((l) => (
        <path key={`pull-${l.origin}`} className="space-sites__pull" data-path={`${siteKey(l.origin, 'c')} ${siteKey(l.insertion, 'c')}`} />
      ))}
      {active.map((i) => {
        const site = sites[i]!;
        return site.points.length > 1 ? (
          <path key={`spread-${i}`} className="space-sites__spread" data-path={site.points.map((_, j) => siteKey(i, j)).join(' ')} />
        ) : null;
      })}
      {active.flatMap((i) => {
        const site = sites[i]!;
        const label = t(site.kind === 'origin' ? 'space.sites.origin' : 'space.sites.insertion', { bone: name(site.bone) });
        const select = () => store.getState().patch({ part: site.bone });
        return site.points.map((_, j) => (
          <g key={`${i}-${j}`} className="space-sites__mark" data-kind={site.kind}>
            <circle
              className="space-sites__hit"
              data-key={siteKey(i, j)}
              r={22}
              role="button"
              tabIndex={-1}
              aria-label={label}
              onClick={(e) => {
                e.stopPropagation();
                select();
              }}
            >
              <title>{label}</title>
            </circle>
            <circle className="space-sites__dot" data-key={siteKey(i, j)} r={4.2} />
          </g>
        ));
      })}
    </g>
  );
}
