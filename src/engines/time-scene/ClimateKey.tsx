import type { Locale, TopicMeta } from '../core/types';
import { SourceRefs } from '../widgets/SourcePopover';
import { tx } from '../../i18n';
import type { ClimateGeoController, ClimateSnapshot } from './stages/geo/ClimatologyStage';
export function ClimateKey({
  topic,
  locale,
  layers,
  snapshot,
  controller,
}: {
  topic: TopicMeta;
  locale: Locale;
  layers: string[];
  snapshot: ClimateSnapshot | null;
  controller: ClimateGeoController | null;
}) {
  const zh = locale === 'zh';
  return (
    <div className="ts-climate-key" data-climate-key>
      {(topic.monthlyLayers ?? [])
        .filter((d) => layers.includes(d.id))
        .map((layer) => {
          const status = snapshot?.layers[layer.id];
          const loaded = controller?.layerStates().get(layer.id);
          const resource = loaded?.status === 'ready' ? loaded.data.resource : null;
          return (
            <div key={layer.id} style={{ marginBlock: 8 }}>
              <strong>{tx(layer.label, locale)}</strong>
              {status?.status === 'error' ? (
                <div role="status">
                  {zh ? '资料加载失败' : 'Data could not load'}{' '}
                  <button type="button" style={{ minHeight: 44 }} onClick={() => controller?.retryClimateLayer(layer.id)}>
                    {zh ? '重试' : 'Retry'}
                  </button>
                </div>
              ) : status?.status !== 'ready' ? (
                <div role="status">{zh ? '正在加载…' : 'Loading…'}</div>
              ) : layer.quantity === 'wind' ? (
                <div>{zh ? '5 m/s → 15 px；箭头朝去向；○ 静风 <0.2 m/s' : '5 m/s → 15 px; arrows point towards; ○ calm <0.2 m/s'}</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['0–<1', '1–<2', '2–<4', '4–<8', '8–<16', '16–<32', '≥32'].map((range, i) => (
                    <span key={range}>
                      <i
                        style={{
                          display: 'inline-block',
                          width: 14,
                          height: 10,
                          background: `var(--rain-${i})`,
                          border: '1px solid var(--line)',
                          marginRight: 3,
                        }}
                      />
                      {range}
                    </span>
                  ))}{' '}
                  <span>mm/day</span>
                  <span>□ {zh ? '无数据' : 'No data'}</span>
                </div>
              )}
              {resource && (
                <p>
                  {resource.period.startYear}–{resource.period.endYear} · {resource.grid.dlon}° × {resource.grid.dlat}°
                  {'pressureHpa' in resource ? ` · ${resource.pressureHpa} hPa` : ''}
                </p>
              )}
              <SourceRefs ids={[...new Set([...layer.sources, ...(topic.climatology?.keySources ?? [])])]} locale={locale} />
            </div>
          );
        })}
      <p>
        {zh
          ? '区域气压层风；高地可能为外推值。格点不是学校观测。'
          : 'Regional pressure-level wind; values over high terrain may be extrapolated. Cells are not school observations.'}
      </p>
    </div>
  );
}
