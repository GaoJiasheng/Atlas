/** Touch and keyboard access to grid selection, sharing the map's sampler. */
import { useEffect, useState } from 'react';
import type { Locale } from '../core/types';
import type { ClimateGeoController } from './stages/geo/ClimatologyStage';
import { nativeClimateCell } from './lib/climate';
export function ClimateCellControls({
  controller,
  selected,
  locale,
  onInspect,
  compact = false,
  windLayerId,
}: {
  controller: ClimateGeoController | null;
  selected: [number, number] | null;
  locale: Locale;
  onInspect(lon: number, lat: number): unknown;
  compact?: boolean;
  windLayerId?: string | null;
}) {
  const [lon, setLon] = useState('105'),
    [lat, setLat] = useState('0');
  useEffect(() => {
    if (selected) {
      setLon(String(selected[0]));
      setLat(String(selected[1]));
    }
  }, [selected]);
  const wind =
    windLayerId === null
      ? undefined
      : windLayerId
        ? controller?.layerStates().get(windLayerId)
        : [...(controller?.layerStates().values() ?? [])].find((s) => s.status === 'ready' && s.data.resource.kind === 'monthly-wind');
  const grid = wind?.status === 'ready' ? wind.data.resource.grid : null;
  const native = grid ? nativeClimateCell(grid, Number(lon), Number(lat), 'wind') : null;
  const move = (di: number, dj: number) => {
    if (!grid || !native) return;
    onInspect(grid.lon0 + (native.i + di) * grid.dlon, grid.lat0 + (native.j + dj) * grid.dlat);
  };
  return (
    <div className="clim-cell-controls">
      <button type="button" data-inspect-climate onClick={() => onInspect(105, 0)}>
        {locale === 'zh' ? '查看气候格点' : 'Inspect climate cell'}
      </button>
      {!compact && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (e.currentTarget.reportValidity()) onInspect(Number(lon), Number(lat));
            }}
          >
            <label>
              {locale === 'zh' ? '经度' : 'Longitude'}
              <input
                type="number"
                value={lon}
                min={grid?.lon0 ?? -180}
                max={grid ? grid.lon0 + (grid.nx - 1) * grid.dlon : 180}
                step="any"
                onChange={(e) => setLon(e.currentTarget.value)}
                required
              />
            </label>
            <label>
              {locale === 'zh' ? '纬度' : 'Latitude'}
              <input
                type="number"
                value={lat}
                min={grid?.lat0 ?? -85}
                max={grid ? grid.lat0 + (grid.ny - 1) * grid.dlat : 85}
                step="any"
                onChange={(e) => setLat(e.currentTarget.value)}
                required
              />
            </label>
            <button type="submit">{locale === 'zh' ? '查看' : 'Inspect'}</button>
          </form>
          <div className="clim-cell-controls__directions" aria-label={locale === 'zh' ? '按风节点移动' : 'Move by wind nodes'}>
            <button
              type="button"
              disabled={!native || native.i === 0}
              aria-label={locale === 'zh' ? '西一个风节点' : 'One wind node west'}
              onClick={() => move(-1, 0)}
            >
              ←
            </button>
            <button
              type="button"
              disabled={!native || !grid || native.i === grid.nx - 1}
              aria-label={locale === 'zh' ? '东一个风节点' : 'One wind node east'}
              onClick={() => move(1, 0)}
            >
              →
            </button>
            <button
              type="button"
              disabled={!native || native.j === 0}
              aria-label={locale === 'zh' ? '南一个风节点' : 'One wind node south'}
              onClick={() => move(0, -1)}
            >
              ↓
            </button>
            <button
              type="button"
              disabled={!native || !grid || native.j === grid.ny - 1}
              aria-label={locale === 'zh' ? '北一个风节点' : 'One wind node north'}
              onClick={() => move(0, 1)}
            >
              ↑
            </button>
          </div>
        </>
      )}
    </div>
  );
}
