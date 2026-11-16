/**
 * Rotation map reader and HUD parts (docs/72 E-CD2/E-CD3), lazy-loaded with the map: the PLATE
 * readout (left column), the selected object's detail (reader, under the chapter head) and the
 * chapter's object index (reader end). Selection is the store's single highlighted object.
 */
import { useEffect, useState } from 'react';
import type { Locale } from '../core/types';
import { SceneSlot, useScene, useSceneStore } from '../core/context';
import { t } from '../../i18n';
import { HudFold } from './hud/HudFold';
import { SourceRefs } from '../widgets/SourcePopover';
import type { GeoController } from './stages/geo/controller';
import type { TimeSceneExt } from './index';
import { GPS_DEG_PER_MM, type RotationApi, type RotationObjects } from './rotation-map';
import './rotation.css';

const words = (locale: Locale, en: string, zh: string) => (locale === 'zh' ? zh : en);
const NONE: RotationApi['stats'] extends () => infer S ? S | null : never = null;

function useRotation(controller: GeoController | null) {
  const api = (controller as (GeoController & { rotation?: RotationApi }) | null)?.rotation ?? null;
  const [, force] = useState(0);
  useEffect(() => api?.subscribe(() => force((n) => n + 1)), [api]);
  return api;
}

export default function RotationPanels({ controller, locale, ids, presenting }: { controller: GeoController | null; locale: Locale; ids: readonly string[]; presenting: boolean }) {
  const api = useRotation(controller);
  const store = useSceneStore<TimeSceneExt>();
  const stats = api?.stats() ?? NONE;
  const layers = useScene<TimeSceneExt, string[]>((s) => s.layers);
  const gpsOn = layers.includes('cd-gps');
  const objects = api?.objects() ?? null;
  const selected = presenting ? null : api?.selected() ?? null;
  return (
    <>
      <SceneSlot name="plate">
        <HudFold className="ts-plate cd-plate" panel="rotation-plate" kind="plate" headClassName="ts-plate__head" title={<>{t('en', 'hud.plate').toLocaleUpperCase('en')} <small lang="zh-Hans">{t('zh', 'hud.plate')}</small></>}>
          <dl className="ts-plate__rows" role="status">
            <div className="ts-plate__row" data-rotation="selected"><dt>{words(locale, 'Selected age', '所选年代')}</dt><dd>{stats && Number.isFinite(stats.selectedMa) ? `${stats.selectedMa} Ma` : '—'}</dd></div>
            <div className="ts-plate__row" data-rotation="model"><dt>{words(locale, 'Model', '模型')}</dt><dd>{objects ? (objects.manifest.plateLabel ?? objects.manifest.modelId.toUpperCase()) : '—'} · ROTATION{objects && <SourceRefs ids={objects.manifest.sources} locale={locale} />}</dd></div>
            <div className="ts-plate__row" data-rotation="projection"><dt>{words(locale, 'Projection', '投影')}</dt><dd>{stats?.projection === 'mercator' ? words(locale, 'Mercator', '墨卡托') : words(locale, 'Globe · detail to 85°', '球面 · 细节至 85°')}</dd></div>
            <div className="ts-plate__row" data-rotation="status"><dt>{words(locale, 'Map', '地图')}</dt><dd>{!stats || stats.status === 'loading' ? words(locale, 'Loading', '加载中') : stats.status === 'unavailable' ? words(locale, 'Unavailable', '不可用') : stats.lod === 'scrub' ? words(locale, 'Coarse while moving', '移动中 · 粗略') : words(locale, 'Full detail', '完整细节')}</dd></div>
            {stats?.presentOnlyVisible && layers.includes('cd-seafloor') && <div className="ts-plate__row" data-rotation="seafloor"><dt>{words(locale, 'Ocean-floor age', '洋底年龄')}</dt><dd><span className="cd-ramp" aria-hidden="true" />{words(locale, 'young → old, 10 Myr bands', '年轻 → 古老，每档 1000 万年')}</dd></div>}
            {stats?.presentOnlyVisible && layers.includes('cd-stripes') && <div className="ts-plate__row" data-rotation="stripes"><dt>{words(locale, 'Magnetic stripes', '磁条带')}</dt><dd>{words(locale, 'shaded = above the average field', '着色 = 高于平均磁场')}</dd></div>}
            {stats?.presentOnlyVisible && gpsOn && <div className="ts-plate__row" data-rotation="gps"><dt>{words(locale, 'GPS arrows', 'GPS 箭头')}</dt><dd>{words(locale, `10 mm a year = ${10 * GPS_DEG_PER_MM}° of arc`, `每年 10 毫米 = ${10 * GPS_DEG_PER_MM}° 弧长`)}</dd></div>}
          </dl>
          <p className="ts-geology-plate__note">{words(locale, "Continuous rotation, today's coastlines · east–west positions are a model convention", '连续旋转，今天的海岸线 · 东西位置为模型约定')}</p>
        </HudFold>
      </SceneSlot>
      {selected && objects && <SceneSlot name="readerTop"><RotationInspector id={selected} objects={objects} locale={locale} at={api?.positionAt(selected) ?? null} onClose={() => store.getState().patch({ highlight: [] })} /></SceneSlot>}
      {objects && ids.length > 0 && <SceneSlot name="readerEnd">
        <section className="ts-index" aria-labelledby="cd-index-title">
          <h3 id="cd-index-title" className="ts-index__title">{words(locale, 'In this chapter', '本章索引')}</h3>
          <ul className="ts-index__list">
            {ids.map((id) => { const text = objects.text[id]; return text && <li key={id}>
              <button type="button" className="ts-index__row" data-time-target={id} aria-pressed={selected === id} disabled={presenting} onClick={() => api?.select(id, true)}>{locale === 'zh' ? text.title.zh : text.title.en}</button>
            </li>; })}
          </ul>
        </section>
      </SceneSlot>}
    </>
  );
}

function RotationInspector({ id, objects, locale, at, onClose }: { id: string; objects: RotationObjects; locale: Locale; at: [number, number] | null; onClose(): void }) {
  const text = objects.text[id];
  const fossil = objects.fossils?.points.find((p) => p.id === id);
  const group = objects.fossils?.groups.find((g) => g.id === id);
  const station = objects.gps?.stations.find((s) => s.id === id);
  const title = text ? (locale === 'zh' ? text.title.zh : text.title.en) : fossil ? words(locale, `PBDB collection ${id.slice(9)}`, `PBDB 采集记录组 ${id.slice(9)}`) : id;
  const speed = station ? Math.hypot(station.vNorthMm, station.vEastMm) : 0;
  return (
    <article className="ts-event cd-inspector" data-id={id}>
      <header className="ts-event__header"><p className="ts-event__eyebrow">{fossil ? words(locale, 'FOSSIL RECORD · FOUND TODAY HERE', '化石记录 · 今天的发现地') : station ? words(locale, 'GPS STATION · TODAY', 'GPS 测站 · 今天') : words(locale, 'ON THE MAP', '地图对象')}</p>
        <button className="ts-modern__icon-button" type="button" onClick={onClose} aria-label={words(locale, 'Close detail', '关闭详情')}>×</button></header>
      <h3 className="ts-event__title">{title}</h3>
      {text && <p>{locale === 'zh' ? text.summary.zh : text.summary.en}<SourceRefs ids={text.sources} locale={locale} /></p>}
      {group && <p>{words(locale, `${group.members.length} collections in the snapshot. Dots show where fossils are found today, carried with their plate; they are records, not a census.`, `快照中有 ${group.members.length} 组采集记录。点表示化石今天的发现地，随所在板块一起转动；它们是记录，不是普查。`)}</p>}
      {station && <p data-gps="">{words(locale, `North ${station.vNorthMm.toFixed(1)} mm a year, east ${station.vEastMm.toFixed(1)} mm a year; about ${(speed / 10).toFixed(1)} cm a year, relative to the IGS14 reference frame (epoch ${station.epoch}).`, `向北每年 ${station.vNorthMm.toFixed(1)} 毫米，向东每年 ${station.vEastMm.toFixed(1)} 毫米；合计约每年 ${(speed / 10).toFixed(1)} 厘米，相对 IGS14 参考框架（历元 ${station.epoch}）。`)}</p>}
      {fossil && <>
        <p>{words(locale, `Country code ${fossil.cc} · ${fossil.occ.length} occurrence records`, `国家代码 ${fossil.cc} · ${fossil.occ.length} 条出现记录`)}</p>
        <ul className="ts-modern__ages">{fossil.occ.map((o) => <li key={o.n}><strong>{Number(o.older.toFixed(3))}–{Number(o.younger.toFixed(3))} Ma</strong> · <i>{o.name}</i> · PBDB {o.n}
          {objects.fossils?.references[o.ref] && <p className="ts-modern__citation">{objects.fossils.references[o.ref]}</p>}</li>)}</ul>
      </>}
      {!station && !at && <p>{words(locale, 'Not on the map at this age: the model does not carry this place back this far.', '这个年代地图上没有它：模型没有把这里带回这么早。')}</p>}
    </article>
  );
}
