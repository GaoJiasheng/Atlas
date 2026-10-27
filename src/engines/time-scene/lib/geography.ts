/** Date-free geography scenes and inclusive membership dates; no historical playhead. */
import type {
  Chapter,
  ChapterState,
  SceneSnapshot,
  TopicMeta,
} from "../../core/types";
import type { SceneStore } from "../../core/store";
import type { UrlState } from "../../core/url-state";
import type { TimeSceneExt } from "../index";
import type { GeographyFile, GeographyChapterState } from "../geography-schema";
import { isIsoDate } from "../../../lib/time";
export type GeoContext =
  | { kind: "present" }
  | { kind: "climatology"; month: number }
  | { kind: "membership"; date: string };
export type GeographyExt = TimeSceneExt & {
  geoContext: GeoContext;
  geoSelection: string | null;
  beat: number | null;
};
export function validGeoContext(
  value: unknown,
  range?: readonly [string, string],
): value is GeoContext {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.kind === "present") return Object.keys(v).length === 1;
  if (v.kind === "climatology")
    return (
      Object.keys(v).length === 2 &&
      Number.isInteger(v.month) &&
      Number(v.month) >= 1 &&
      Number(v.month) <= 12
    );
  return (
    v.kind === "membership" &&
    Object.keys(v).length === 2 &&
    typeof v.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.date) &&
    isIsoDate(v.date) &&
    (!range || (v.date >= range[0] && v.date <= range[1]))
  );
}
export function memberIds(
  g: Pick<GeographyFile, "members">,
  date: string,
): string[] {
  return g.members
    .filter((m) => m.joined <= date)
    .sort((a, b) => a.a3.localeCompare(b.a3))
    .map((m) => m.id);
}
export function geographyHash(value: unknown): string {
  let h = 2166136261;
  for (const ch of JSON.stringify(value)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
export function geographyObjects(g: GeographyFile) {
  const countries = g.countries.features.map((f) => ({
    id: f.properties.id,
    title: f.properties.name,
    summary: f.properties.summary ?? f.properties.name,
    detail: f.properties.detail,
    sources: f.properties.sources,
    kind: "country",
    locationRef: f.properties.id,
  }));
  const seen = new Set(countries.map((v) => v.id));
  const features = g.layers.flatMap((l) =>
    l.features.features.flatMap((f) => {
      if (seen.has(f.properties.id)) return [];
      seen.add(f.properties.id);
      return [
        {
          id: f.properties.id,
          title: f.properties.name,
          summary: f.properties.summary ?? f.properties.name,
          detail: f.properties.detail,
          sources: f.properties.sources,
          kind: l.kind,
          locationRef: f.properties.id,
        },
      ];
    }),
  );
  const anchors = g.anchors
    .filter((a) => !seen.has(a.id))
    .map((a) => ({
      id: a.id,
      title: a.name,
      summary: a.name,
      detail: undefined,
      sources: a.sources,
      kind: "point",
      locationRef: a.id,
    }));
  const refs = g.referenceItems.map((r) => ({
    id: r.id,
    title: r.label,
    summary: r.summary,
    detail: r.detail,
    sources: r.sourceIds,
    kind: "reference",
    locationRef: r.locationRef,
    figure: r.figure,
  }));
  return [...countries, ...features, ...anchors, ...refs];
}
/** Authored multi-object highlights survive selecting their authored location. */
export function geographyHighlightIds(
  g: GeographyFile,
  highlight: readonly string[],
  selection: string | null | undefined,
): string[] {
  const chosen = geographyObjects(g).find((object) => object.id === selection);
  return chosen && !highlight.includes(chosen.locationRef)
    ? [chosen.locationRef]
    : [...highlight];
}

export const climateCell = (
  id: string | null | undefined,
): [number, number] | null => {
  const m = id?.match(/^cell-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
  return m ? [Number(m[1]), Number(m[2])] : null;
};
export function geographyLayers(
  layers: readonly string[],
  ctx: GeoContext,
  monthly: readonly { id: string }[],
): string[] {
  const climate = new Set(monthly.map((l) => l.id));
  return layers.filter(
    (id) =>
      (ctx.kind === "climatology" || !climate.has(id)) &&
      (ctx.kind === "membership" || id !== "geo-membership"),
  );
}
export function geographyChapterFields(raw: ChapterState) {
  const s = raw as GeographyChapterState;
  const b = s.beats?.[0];
  return {
    t: null,
    month: undefined,
    beat: 0,
    geoContext: b?.geoContext ?? s.geoContext,
    geoSelection: b ? b.selection : s.selection,
    highlight: b?.highlight ?? s.highlight ?? [],
    ...(b?.camera ? { camera: b.camera } : {}),
    ...(b?.layers ? { layers: b.layers } : {}),
  };
}
export function geographyBeatScene(
  store: SceneStore<TimeSceneExt>,
  chapters: readonly Chapter[],
  chapter: string,
  index: number,
): SceneSnapshot<GeographyExt> {
  const target = store
    .getState()
    .chapterTarget(chapter) as SceneSnapshot<GeographyExt>;
  const b = (
    chapters.find((c) => c.id === chapter)?.state as GeographyChapterState
  )?.beats?.[index];
  return {
    ...target,
    chapter,
    beat: b ? index : 0,
    t: null,
    month: undefined,
    geoContext: b?.geoContext ?? target.geoContext,
    geoSelection: b ? b.selection : target.geoSelection,
    camera: b?.camera ?? target.camera,
    layers: b?.layers ?? target.layers,
    highlight: b?.highlight ?? target.highlight,
  };
}
export function geographyUrlBaseline(
  store: SceneStore<TimeSceneExt>,
  chapters: readonly Chapter[],
  state: Pick<SceneSnapshot<TimeSceneExt>, "chapter" | "beat">,
): SceneSnapshot<GeographyExt> | null {
  if (!state.chapter) return null;
  return {
    ...geographyBeatScene(store, chapters, state.chapter, state.beat ?? 0),
    beat: 0,
    geoContext: undefined as unknown as GeoContext,
  };
}
export function geographyUrlPatch(
  store: SceneStore<TimeSceneExt>,
  chapters: readonly Chapter[],
  decoded: UrlState,
  topic: TopicMeta,
): Partial<SceneSnapshot<GeographyExt>> {
  const chapter = chapters.some((c) => c.id === decoded.chapter)
    ? decoded.chapter!
    : chapters[0]?.id;
  if (!chapter) return {};
  const beats =
    (chapters.find((c) => c.id === chapter)?.state as GeographyChapterState)
      ?.beats ?? [];
  const index =
    Number.isInteger(decoded.beat) &&
    decoded.beat! >= 0 &&
    decoded.beat! < beats.length
      ? decoded.beat!
      : 0;
  const baseline = geographyBeatScene(store, chapters, chapter, index);
  const { t: _t, month: _m, geoContext, beat: _b, ...rest } = decoded;
  const ctx =
    validGeoContext(geoContext, topic.geography?.dateRange) &&
    (geoContext.kind !== "climatology" ||
      (!!topic.climatology && !!topic.monthlyLayers?.length))
      ? geoContext
      : baseline.geoContext;
  return {
    ...baseline,
    ...Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined),
    ),
    chapter,
    beat: index,
    t: null,
    month: undefined,
    geoContext: ctx,
    ...(ctx.kind !== "climatology" && climateCell(baseline.geoSelection)
      ? { geoSelection: null }
      : {}),
    layers: geographyLayers(
      rest.layers ?? baseline.layers,
      ctx,
      topic.monthlyLayers ?? [],
    ),
  };
}
export function setGeoContext(
  store: SceneStore<GeographyExt>,
  context: unknown,
  topic: TopicMeta,
): boolean {
  if (
    !validGeoContext(context, topic.geography?.dateRange) ||
    (context.kind === "climatology" &&
      (!topic.climatology || !topic.monthlyLayers?.length))
  )
    return false;
  const s = store.getState();
  s.patch({
    geoContext: context,
    layers: geographyLayers(s.layers, context, topic.monthlyLayers ?? []),
    ...(context.kind !== "climatology" && climateCell(s.geoSelection)
      ? { geoSelection: null }
      : {}),
  });
  return true;
}
