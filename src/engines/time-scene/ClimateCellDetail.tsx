/** Native-grid readings; zero remains distinct from an unavailable measurement. */
import type { ClimateSample } from './lib/climate';
import type { Locale } from '../core/types';
import { SourceRefs } from '../widgets/SourcePopover';
import { monthText } from './lib/climatology-state';
const format = (value: number | null | undefined, digits: number) =>
  value === null || value === undefined ? '—' : value.toFixed(digits).replace(/^-0(?=\.0+$)/, '0');
const statuses = {
  en: {
    absent: 'Layer off',
    loading: 'Loading',
    error: 'Unable to load',
    outside: 'Outside coverage',
    missing: 'Missing data',
    valid: 'Native grid sample',
  },
  zh: {
    absent: '图层关闭',
    loading: '加载中',
    error: '无法加载',
    outside: '覆盖范围之外',
    missing: '缺测',
    valid: '原生格网读数',
  },
};
export function ClimateCellDetail({
  sample,
  locale,
  onClose,
  visible = ['wind', 'rain'],
}: {
  sample: ClimateSample | null;
  locale: Locale;
  onClose(): void;
  visible?: readonly ('wind' | 'rain')[];
}) {
  if (!sample) return null;
  return (
    <article className="clim-cell-detail" data-climate-cell aria-label={locale === 'zh' ? '区域气候格点' : 'Regional climate cell'}>
      <header>
        <h3>{locale === 'zh' ? '区域气候格点' : 'Regional climate cell'}</h3>
        <button type="button" onClick={onClose} aria-label={locale === 'zh' ? '关闭详情' : 'Close details'}>
          ×
        </button>
      </header>
      <p>
        {monthText(sample.month, locale)} · {format(sample.at[0], 2)}°, {format(sample.at[1], 2)}°
      </p>
      {visible.map((kind) => {
        const layer = sample[kind];
        const valid = layer.status === 'valid';
        return (
          <section key={kind}>
            <h4>
              {kind === 'wind' ? (locale === 'zh' ? '风' : 'Wind') : locale === 'zh' ? '降水' : 'Rain'} · {statuses[locale][layer.status]}
            </h4>
            {'at' in layer && (
              <p>
                {locale === 'zh' ? '原生中心' : 'Native centre'} {format(layer.at[0], 2)}°, {format(layer.at[1], 2)}° · i=
                {layer.i}, j={layer.j}
              </p>
            )}
            {'period' in layer && (
              <p>
                {layer.period.startYear}–{layer.period.endYear} · {layer.units}
                {'pressureHpa' in layer && ` · ${layer.pressureHpa} hPa`}
              </p>
            )}
            {'validYears' in layer && 'period' in layer && (
              <p>
                {locale === 'zh' ? '有效年数' : 'Valid years'} {layer.validYears}/{layer.period.yearsExpected}
              </p>
            )}
            {kind === 'wind' ? (
              <dl>
                <dt>u / v (m/s)</dt>
                <dd>{'u' in layer ? `${format(layer.u, 1)} / ${format(layer.v, 1)}` : '—'}</dd>
                <dt>{locale === 'zh' ? '平均矢量的模' : 'Magnitude of mean vector'} (m/s)</dt>
                <dd>{'s' in layer ? format(layer.s, 1) : '—'}</dd>
                <dt>{locale === 'zh' ? '来向 / 去向' : 'From / towards'}</dt>
                <dd>
                  {valid && 's' in layer && layer.s !== null && layer.s < 0.2
                    ? locale === 'zh'
                      ? '静风；无方向'
                      : 'Calm; no direction'
                    : 'from' in layer
                      ? `${format(layer.from, 1)}° / ${format(layer.towards, 1)}°`
                      : '—'}
                </dd>
              </dl>
            ) : (
              <dl>
                <dt>{locale === 'zh' ? '平均降水率' : 'Mean precipitation rate'} (mm/day)</dt>
                <dd>{'rate' in layer ? format(layer.rate, 1) : '—'}</dd>
              </dl>
            )}
            {'sources' in layer && <SourceRefs ids={layer.sources} locale={locale} />}
          </section>
        );
      })}
      <p>
        {locale === 'zh'
          ? '区域气压层风；高地可能为外推值。格点不是学校观测。'
          : 'Regional pressure-level wind; values over high terrain may be extrapolated. Cells are not school observations.'}
      </p>
      <p>
        {locale === 'zh'
          ? '风取最近节点，雨按所属格子独立取样；不做空间插值。'
          : 'Wind uses its nearest node; rain uses its own containing cell. No spatial interpolation.'}
      </p>
    </article>
  );
}
