import { Map as MlMap, Marker, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { feature as topoFeature } from 'topojson-client';
import { withBase, tx } from '../../../../i18n';
import { readThemeTokens } from '../../../../theme/theme';
import { BASE_LAYER_IDS } from '../../../../theme/map-style';
import { sourceIds } from '../../../../content/schema/sources';
import { isGeoCamera } from '../../../core/camera';
import { metresPerPixel, scaleBar } from '../../lib/geo';
import { sampleClimate, windGlyphs } from '../../lib/climate';
import { ClimateLoader } from '../../lib/climateLoader';
import { createLeaders } from './leaders';
import { rainGeometry, rainPaint } from './climateStyle';
import { buildGeoStyle, graticule, HI, HI_BBOX, HI_LOAD_ZOOM, LAYER, LOCAL, REGION } from './style';
import type { ClimatologyStageProps, ClimateGeoController, ClimateSnapshot } from './ClimatologyStage';

export function createClimatologyController(options: ClimatologyStageProps & { container: HTMLElement }): ClimateGeoController {
  const { store, topic, data, container } = options,
    definitions = topic.monthlyLayers ?? [],
    period = topic.climatology!;
  let locale = options.locale,
    destroyed = false,
    loaded = false,
    raf = 0,
    renderedMonth = 0,
    commits = 0,
    drawnVectors = 0,
    cells = 0;
  let paintGeneration = 0,
    leaderSignature = '',
    publishedSignature = '';
  let selected: ClimateSnapshot['selected'] = null,
    presentation = false;
  let userGesture = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const layerCounts: Record<string, { drawnVectors: number; cells: number }> = {};
  const geometryBuilds: Record<string, number> = {},
    installed = new Set<string>();
  const windGeometry = new Map<string, Float64Array>();
  const map = new MlMap({
    container,
    style: buildGeoStyle({
      tokens: readThemeTokens(),
      landUrl: withBase('/geo/land-50m.json'),
      graticule: graticule(),
      local: topic.basemap?.local,
      region: topic.basemap?.region,
    }),
    center: [115, 7.5],
    zoom: 3.35,
    maxZoom: topic.basemap?.maxZoom ?? 10,
    minZoom: 1,
    attributionControl: false,
    renderWorldCopies: false,
  });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  Object.assign(svg.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  });
  container.append(svg);
  const scale = document.createElement('div');
  scale.className = 'ts-scale';
  scale.setAttribute('aria-label', locale === 'zh' ? '地图比例尺' : 'Map scale');
  container.append(scale);
  const labelRoot = document.createElement('div');
  labelRoot.className = 'ts-callouts';
  container.append(labelRoot);
  const leaders = createLeaders({
    map,
    container,
    labelRoot,
    onSelect(id) {
      if (!presentation && !options.isPresenting?.()) options.onSelectSite(id);
    },
    panelFilter: (el) => !presentation || (el.getAttribute('data-hud-panel') ?? '').startsWith('present'),
    onBand: (band) => {
      scale.style.transform = `translate(${band.left}px, ${band.bottom - 32}px)`;
    },
  });
  const loader = new ClimateLoader(
    {
      periodId: period.periodId,
      startYear: period.startYear,
      endYear: period.endYear,
      sources: sourceIds(data.sources),
    },
    requestRender,
  );
  const markers = data.events.map((site) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ts-climate-site';
    Object.assign(button.style, {
      minWidth: '44px',
      minHeight: '44px',
      border: 'none',
      color: 'var(--ink)',
      background: 'transparent',
      cursor: 'pointer',
      fontSize: '12px',
    });
    const marker = new Marker({ element: button }).setLngLat(site.at).addTo(map);
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!presentation && !options.isPresenting?.()) {
        selected = { kind: 'site', id: site.id };
        options.onSelectSite(site.id);
        requestRender();
      }
    });
    return { site, button, marker };
  });
  function states(quantity: 'wind' | 'rain') {
    const def =
      definitions.find((d) => d.quantity === quantity && store.getState().layers.includes(d.id)) ??
      definitions.find((d) => d.quantity === quantity);
    return def ? loader.states.get(def.id) : undefined;
  }
  function snapshot(): ClimateSnapshot {
    const month = store.getState().month ?? period.initialMonth;
    const count = (q: 'wind' | 'rain') => {
      const state = states(q);
      return state?.status === 'ready' ? state.data.frames[month - 1]!.valid.reduce((sum, n) => sum + n, 0) : 0;
    };
    return {
      month,
      renderedMonth,
      periodId: period.periodId,
      selected,
      wind: { nativeValid: count('wind'), drawnVectors },
      rain: { nativeValid: count('rain'), cells },
      loads: { ...loader.loads },
      geometryBuilds: { ...geometryBuilds },
      commits,
      layers: Object.fromEntries(
        definitions.map((d) => {
          const state = loader.states.get(d.id);
          return [
            d.id,
            {
              status: state?.status ?? 'loading',
              nativeValid: state?.status === 'ready' ? state.data.frames[month - 1]!.valid.reduce((a, b) => a + b, 0) : 0,
              drawnVectors: layerCounts[d.id]?.drawnVectors ?? 0,
              cells: layerCounts[d.id]?.cells ?? 0,
              ...(state?.status === 'error' ? { error: state.error } : {}),
            },
          ];
        }),
      ),
    };
  }
  function publish() {
    const value = snapshot(),
      signature = JSON.stringify(value);
    if (signature !== publishedSignature) {
      publishedSignature = signature;
      options.onSnapshot?.(value);
    }
  }
  function requestRender() {
    if (!destroyed && !raf) raf = requestAnimationFrame(render);
  }
  function render() {
    raf = 0;
    if (destroyed) return;
    const state = store.getState(),
      month = state.month ?? period.initialMonth,
      tk = readThemeTokens();
    const on = new Set(state.layers);
    drawnVectors = 0;
    cells = 0;
    markers.forEach(({ site, button }) => {
      const chosen = selected?.kind === 'site' ? selected.id === site.id : (state.highlight ?? []).includes(site.id);
      button.textContent = '○';
      button.title = tx(site.title, locale);
      button.setAttribute('aria-label', tx(site.title, locale));
      button.style.color = chosen ? 'var(--signal)' : 'var(--ink)';
      button.style.display = on.has('sites') ? '' : 'none';
    });
    const highlights = selected?.kind === 'site' ? [selected.id] : (state.highlight ?? []);
    const nextLeaderSignature = `${on.has('sites')}|${highlights.join(',')}|${locale}|${presentation}`;
    if (nextLeaderSignature !== leaderSignature) {
      leaderSignature = nextLeaderSignature;
      leaders.setItems(
        on.has('sites')
          ? data.events
              .filter((s) => highlights.includes(s.id))
              .map((s) => ({
                key: `event:${s.id}`,
                id: s.id,
                kind: 'event' as const,
                en: s.title.en,
                zh: s.title.zh,
                note: tx(s.summary, locale),
                at: s.at,
                pinned: true,
                clickable: !presentation,
              }))
          : [],
      );
    }
    leaders.update();
    const bar = scaleBar(metresPerPixel(map.getZoom(), map.getCenter().lat), 120),
      w = Math.round(bar.px),
      half = Math.round(w / 2);
    scale.innerHTML = `<svg height="8" width="${w + 2}" viewBox="-1 0 ${w + 2} 8" aria-hidden="true"><rect x="0" y="3" width="${half}" height="3" class="ts-scale__fill"/><rect x="${half}" y="3" width="${w - half}" height="3" class="ts-scale__open"/><path d="M0 0V8M${half} 2V7M${w} 0V8" class="ts-scale__tick"/></svg><span>${bar.label}</span>`;
    const parts: string[] = [];
    for (const def of definitions) {
      const status = loader.states.get(def.id),
        visible = on.has(def.id);
      layerCounts[def.id] = { drawnVectors: 0, cells: 0 };
      if (status?.status !== 'ready') {
        if (loaded && installed.has(def.id) && def.quantity === 'rain') {
          map.setPaintProperty(`climate-${def.id}-fill`, 'fill-opacity', 0);
          map.setPaintProperty(`climate-${def.id}-line`, 'line-opacity', 0);
        }
        continue;
      }
      if (def.quantity === 'wind' && windGeometry.get(def.id) !== status.data.nodes) {
        windGeometry.set(def.id, status.data.nodes);
        geometryBuilds[def.id] = (geometryBuilds[def.id] ?? 0) + 1;
      }
      if (def.quantity === 'rain' && loaded) {
        const src = `climate-${def.id}`,
          fill = `${src}-fill`,
          line = `${src}-line`;
        if (!installed.has(def.id)) {
          geometryBuilds[def.id] = (geometryBuilds[def.id] ?? 0) + 1;
          map.addSource(src, {
            type: 'geojson',
            data: rainGeometry(status.data),
            tolerance: 0,
          });
          map.addLayer({
            id: fill,
            type: 'fill',
            source: src,
            paint: {
              'fill-color': tk['rain-0'],
              'fill-opacity': 0,
              'fill-color-transition': { duration: 0 },
              'fill-opacity-transition': { duration: 0 },
            },
          });
          map.addLayer({
            id: line,
            type: 'line',
            source: src,
            paint: {
              'line-color': tk.ink,
              'line-width': 0.4,
              'line-opacity': 0,
              'line-opacity-transition': { duration: 0 },
            },
          });
          installed.add(def.id);
          // Coastlines remain above climate fills, including lazy high-resolution coastline.
          for (const id of [BASE_LAYER_IDS.landEdge, HI.edge, LOCAL.edge, LOCAL.today]) if (map.getLayer(id)) map.moveLayer(id);
        }
        const paint = rainPaint(month, tk);
        map.setPaintProperty(fill, 'fill-color', paint.color);
        map.setPaintProperty(fill, 'fill-opacity', visible ? paint.opacity : 0);
        map.setPaintProperty(line, 'line-color', tk.ink);
        map.setPaintProperty(line, 'line-opacity', visible ? paint.lineOpacity : 0);
        if (visible) {
          const n = status.data.frames[month - 1]!.valid.reduce((a, b) => a + b, 0);
          cells += n;
          layerCounts[def.id]!.cells = n;
        }
      }
      if (def.quantity === 'wind' && visible) {
        const glyphs = windGlyphs(status.data, month, container.clientWidth, container.clientHeight, (at) => map.project(at));
        drawnVectors += glyphs.length;
        layerCounts[def.id]!.drawnVectors = glyphs.length;
        const selectedIndex = selected?.kind === 'cell' ? sampleClimate(...selected.at, month, status, undefined).wind : null;
        for (const a of glyphs) {
          const stroke = selectedIndex && 'index' in selectedIndex && selectedIndex.index === a.index ? ' stroke="var(--signal)"' : '';
          if (a.calm) parts.push(`<circle cx="${a.x}" cy="${a.y}" r="3"${stroke}/>`);
          else {
            const ex = a.x + a.dx * a.length,
              ey = a.y + a.dy * a.length;
            parts.push(
              `<path d="M${a.x},${a.y}L${ex},${ey}M${ex - a.dx * 5 - a.dy * 2.5},${ey - a.dy * 5 + a.dx * 2.5}L${ex},${ey}L${ex - a.dx * 5 + a.dy * 2.5},${ey - a.dy * 5 - a.dx * 2.5}"${stroke}/>`,
            );
          }
        }
      }
    }
    let glyphMarkup = `<g fill="none" stroke="var(--ink)" stroke-width="1.2">${parts.join('')}</g>`;
    if (selected?.kind === 'cell') {
      const p = map.project(selected.at);
      glyphMarkup += `<circle cx="${p.x}" cy="${p.y}" r="7" fill="none" stroke="var(--signal)" stroke-width="1.5"/>`;
    }
    // Same-month camera/selection/retry updates can remove unavailable glyphs
    // immediately; only a month change waits for the matching GL paint.
    if (renderedMonth === month) svg.innerHTML = glyphMarkup;
    if (loaded) {
      const generation = ++paintGeneration;
      map.once('render', () => {
        if (destroyed || generation !== paintGeneration) return;
        const settled = definitions
          .filter((d) => on.has(d.id))
          .every((d) => {
            const st = loader.states.get(d.id);
            return (
              st?.status === 'error' ||
              (st?.status === 'ready' && (d.quantity !== 'rain' || (installed.has(d.id) && map.isSourceLoaded(`climate-${d.id}`))))
            );
          });
        if (settled) {
          // GL has painted this month's rain. Commit its SVG wind in the same
          // browser frame, rather than showing a new wind over the old rain.
          svg.innerHTML = glyphMarkup;
          if (renderedMonth !== month) commits++;
          renderedMonth = month;
        }
        publish();
      });
      map.triggerRepaint();
    }
    publish();
  }
  let appliedTransition = -1;
  function sync() {
    const state = store.getState();
    if (state.transition.id !== appliedTransition && isGeoCamera(state.camera)) {
      appliedTransition = state.transition.id;
      userGesture = false;
      const c = state.camera;
      map.stop();
      if (state.transition.instant || reducedMotion)
        map.jumpTo({
          center: c.center,
          zoom: c.zoom,
          bearing: c.bearing ?? 0,
          pitch: c.pitch ?? 0,
        });
      else
        map.flyTo({
          center: c.center,
          zoom: c.zoom,
          bearing: c.bearing ?? 0,
          pitch: c.pitch ?? 0,
          duration: 1600,
        });
    }
    requestRender();
  }
  const unsubscribe = store.subscribe(sync);
  map.on('load', () => {
    loaded = true;
    sync();
    loadHighDetail();
    const staticFiles = [
      ...(topic.basemap?.local ? [{ file: topic.basemap.local, source: LOCAL.src }] : []),
      ...(topic.basemap?.region
        ? [
            { file: topic.basemap.region.land, source: 'land' },
            ...(topic.basemap.region.rivers ? [{ file: topic.basemap.region.rivers, source: REGION.rivers }] : []),
          ]
        : []),
    ];
    for (const item of staticFiles)
      fetch(withBase(`/geo/${item.file}.json`))
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((raw) => {
          if (destroyed) return;
          const fc = raw.type === 'Topology' ? topoFeature(raw, raw.objects[item.file] ?? Object.values(raw.objects)[0]) : raw;
          const features = fc.type === 'FeatureCollection' ? fc.features : [fc];
          if (
            features.some((f: { properties?: Record<string, unknown> }) =>
              ['from', 'to', 't', 'until'].some((key) => f.properties?.[key] !== undefined),
            )
          )
            throw new Error('Climatology basemaps must be undated');
          (map.getSource(item.source) as GeoJSONSource | undefined)?.setData(fc);
          if (item.source === REGION.rivers)
            for (const id of [REGION.riverLine, REGION.riverRec]) map.setFilter(id, ['==', ['get', 'rec'], id === REGION.riverRec]);
        })
        .catch(() => {});
  });
  map.on('move', requestRender);
  map.on('resize', requestRender);
  map.on('sourcedata', requestRender);
  const resizeObserver = new ResizeObserver(() => {
    map.resize();
    leaders.relayout();
    requestRender();
  });
  resizeObserver.observe(container);
  // Clicking or dragging the map must not leave keyboard focus on the canvas (digit presets, `,` / `.`).
  const canvas = map.getCanvas();
  let pointerAt = 0;
  const onPointerDown = () => (pointerAt = performance.now());
  const onCanvasFocus = () => {
    if (performance.now() - pointerAt < 600) canvas.blur();
  };
  container.addEventListener('pointerdown', onPointerDown, true);
  canvas.addEventListener('focus', onCanvasFocus);
  map.on('movestart', (event) => {
    userGesture ||= Boolean((event as { originalEvent?: Event }).originalEvent);
  });
  map.on('wheel', () => {
    userGesture = true;
  });
  map.on('moveend', (event) => {
    const fromUser = userGesture || Boolean((event as { originalEvent?: Event }).originalEvent);
    userGesture = false;
    if (!fromUser) return;
    const c = map.getCenter();
    store.getState().setCamera({
      center: [c.lng, c.lat],
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
    });
  });
  map.on('click', (e) => {
    if (!presentation && !options.isPresenting?.()) {
      selected = { kind: 'cell', at: [e.lngLat.lng, e.lngLat.lat] };
      options.onSelectCell(e.lngLat.lng, e.lngLat.lat);
      requestRender();
    }
  });
  let hiLoading = false;
  function loadHighDetail() {
    if (topic.basemap?.region || hiLoading || !loaded || map.getZoom() < HI_LOAD_ZOOM) return;
    const b = map.getBounds();
    if (b.getEast() < HI_BBOX[0] || b.getWest() > HI_BBOX[2] || b.getNorth() < HI_BBOX[1] || b.getSouth() > HI_BBOX[3]) return;
    hiLoading = true;
    fetch(withBase('/geo/land-10m-sea.json'))
      .then((r) => r.json())
      .then((topo) => {
        if (destroyed) return;
        const fc = topoFeature(topo, topo.objects.sea);
        const source = map.getSource(HI.src) as GeoJSONSource | undefined;
        source?.setData(fc);
        if (map.getLayer(HI.edge)) map.moveLayer(HI.edge);
      })
      .catch(() => {
        hiLoading = false;
      });
  }
  map.on('moveend', loadHighDetail);
  function recolor() {
    if (!loaded || destroyed) return;
    const style = buildGeoStyle({
      tokens: readThemeTokens(),
      landUrl: withBase('/geo/land-50m.json'),
      graticule: graticule(),
      local: topic.basemap?.local,
      region: topic.basemap?.region,
    });
    for (const layer of style.layers)
      if (map.getLayer(layer.id) && 'paint' in layer && layer.paint)
        for (const [key, value] of Object.entries(layer.paint)) map.setPaintProperty(layer.id, key, value);
    requestRender();
  }
  map.on('load', recolor);
  const observer = new MutationObserver(recolor);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  definitions.forEach((d) => loader.load(d));
  sync();
  return {
    sampleClimate: (lon, lat, month = store.getState().month ?? period.initialMonth) =>
      sampleClimate(lon, lat, month, states('wind'), states('rain')),
    ready() {
      return (
        loaded &&
        definitions
          .filter((d) => store.getState().layers.includes(d.id))
          .every((d) => {
            const s = loader.states.get(d.id);
            return (
              s?.status === 'error' ||
              (s?.status === 'ready' && (d.quantity !== 'rain' || (installed.has(d.id) && map.isSourceLoaded(`climate-${d.id}`))))
            );
          }) &&
        renderedMonth === (store.getState().month ?? period.initialMonth)
      );
    },
    retryClimateLayer(id) {
      const def = definitions.find((d) => d.id === id);
      if (def) {
        if (loaded && installed.has(id) && def.quantity === 'rain') {
          map.removeLayer(`climate-${id}-line`);
          map.removeLayer(`climate-${id}-fill`);
          map.removeSource(`climate-${id}`);
          installed.delete(id);
        }
        loader.load(def, true);
      }
    },
    snapshot,
    layerStates: () => loader.states,
    setSelected(value) {
      selected = value;
      if (value?.kind === 'site') {
        const site = data.events.find((s) => s.id === value.id);
        if (site) {
          const p = map.project(site.at);
          if (p.x < 44 || p.x > container.clientWidth - 44 || p.y < 44 || p.y > container.clientHeight - 44)
            store.getState().applyCameraPreset({ center: site.at, zoom: map.getZoom() });
        }
      }
      requestRender();
    },
    setLocale(value) {
      locale = value;
      requestRender();
    },
    setLeadersSvg(svg) {
      leaders.setSvg(svg);
    },
    setGraticule(on) {
      if (loaded) map.setLayoutProperty(LAYER.graticule, 'visibility', on ? 'visible' : 'none');
    },
    setTerritory() {},
    setReference() {},
    setPresentation(on) {
      presentation = on;
    },
    refreshLabels: requestRender,
    fitCamera() {
      const xs = data.events.map((s) => s.at[0]),
        ys = data.events.map((s) => s.at[1]);
      for (const layer of loader.states.values())
        if (layer.status === 'ready') {
          const { grid, kind } = layer.data.resource;
          const half = kind === 'monthly-rain' ? 0.5 : 0;
          xs.push(grid.lon0 - half * grid.dlon, grid.lon0 + (grid.nx - 1 + half) * grid.dlon);
          ys.push(grid.lat0 - half * grid.dlat, grid.lat0 + (grid.ny - 1 + half) * grid.dlat);
        }
      if (!xs.length) return null;
      const c = map.cameraForBounds(
        [
          [Math.min(...xs), Math.min(...ys)],
          [Math.max(...xs), Math.max(...ys)],
        ],
        { padding: 70 },
      );
      if (!c?.center || Array.isArray(c.center) || !('lng' in c.center)) return null;
      return { center: [c.center.lng, c.center.lat], zoom: c.zoom ?? 3.35 };
    },
    plateCamera: () => null,
    stats: () => ({
      features: data.events.length + cells + drawnVectors,
      zoom: map.getZoom(),
      datedLayers: {},
    }),
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      unsubscribe();
      observer.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown, true);
      canvas.removeEventListener('focus', onCanvasFocus);
      leaders.destroy();
      labelRoot.remove();
      scale.remove();
      loader.dispose();
      windGeometry.clear();
      markers.forEach((m) => m.marker.remove());
      svg.remove();
      map.remove();
    },
  };
}
