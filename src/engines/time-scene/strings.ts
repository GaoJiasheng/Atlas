/**
 * TimeScene UI strings. Kept with the engine (bilingual objects for `tx()`)
 * so the engine is self-contained; shared site strings live in src/i18n.
 */
import type { BilingualText } from '../../i18n';
import type { Bloc, SceneEvent } from './schema';

export const S = {
  play: { en: 'Play', zh: '播放' },
  pause: { en: 'Pause', zh: '暂停' },
  speed: { en: 'Playback speed', zh: '播放速度' },
  timeline: { en: 'Timeline', zh: '时间轴' },
  time: { en: 'Time', zh: '时间' },
  chapterNode: { en: 'Chapter {n}: {title}, {time}', zh: '第 {n} 章：{title}，{time}' },
  lockedNode: { en: 'Chapter {n}: for when you are a bit older', zh: '第 {n} 章：再长大一点再看' },
  chapterShort: { en: 'Chapter {n}', zh: '第 {n} 章' },
  movement: { en: 'Movement', zh: '行动路线' },
  event: { en: 'Event', zh: '事件' },
  eventNow: { en: 'Happening now', zh: '正在发生' },
  close: { en: 'Close details', zh: '关闭详情' },
  forces: { en: 'People involved', zh: '参与人数' },
  casualties: { en: 'People lost', zh: '伤亡人数' },
  casualtiesGuarded: {
    en: 'The numbers of people lost are shown in parent mode.',
    zh: '伤亡数字在家长模式下显示。',
  },
  versus: { en: 'vs', zh: '对' },
  attacker: { en: 'Attacking', zh: '进攻方' },
  defender: { en: 'Defending', zh: '防守方' },
  layersAndKey: { en: 'Layers and key', zh: '图层和图例' },
  mapFailed: { en: 'The map could not start on this device.', zh: '这台设备无法显示地图。' },
} satisfies Record<string, BilingualText>;

export const LAYER_LABELS = {
  control: { en: 'Who controls where', zh: '控制区' },
  borders: { en: 'Country borders (today)', zh: '国界（今天）' },
  movements: { en: 'Movements', zh: '行动路线' },
  battles: { en: 'Events', zh: '事件' },
  participation: { en: 'Who joined when', zh: '何时加入' },
} satisfies Record<string, BilingualText>;

export const BLOC_LABELS: Record<Bloc, BilingualText> = {
  axis: { en: 'Axis', zh: '轴心国' },
  allied: { en: 'Allies', zh: '同盟国' },
  neutral: { en: 'Neutral', zh: '中立' },
};

export const EVENT_KIND_LABELS: Record<SceneEvent['kind'], BilingualText> = {
  battle: { en: 'Battle', zh: '战斗' },
  landing: { en: 'Landing', zh: '登陆' },
  surrender: { en: 'Surrender', zh: '投降' },
  bombing: { en: 'Bombing', zh: '轰炸' },
  political: { en: 'Political event', zh: '政治事件' },
};

export const RESULT_LABELS: Record<NonNullable<SceneEvent['result']>, BilingualText> = {
  attacker: { en: 'The attacking side won', zh: '进攻方获胜' },
  defender: { en: 'The defending side held', zh: '防守方守住了' },
  draw: { en: 'Neither side won', zh: '双方打平' },
  inconclusive: { en: 'No clear result', zh: '胜负未分' },
};

/** Fill `{name}` placeholders. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
