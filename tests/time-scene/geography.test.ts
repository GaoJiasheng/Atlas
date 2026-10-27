import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { topicSchema } from "../../src/content/schema/topic";
import {
  geographyData,
  geographyChapterState,
} from "../../src/engines/time-scene/geography-schema";
import {
  geographyHash,
  geographyHighlightIds,
  geographyObjects,
  memberIds,
  validGeoContext,
  geographyBeatScene,
  geographyUrlPatch,
  geographyUrlBaseline,
  setGeoContext,
  type GeographyExt,
} from "../../src/engines/time-scene/lib/geography";
import { createSceneStore } from "../../src/engines/core/store";
import { timeSceneEngine } from "../../src/engines/time-scene";
import {
  decodeSceneState,
  encodeSceneState,
  mergeSearch,
} from "../../src/engines/core/url-state";
import {
  remapClimateSources,
  packClimate,
  sampleClimate,
  validateClimateResource,
} from "../../src/engines/time-scene/lib/climate";
import type { Chapter, SceneSnapshot } from "../../src/engines/core/types";
import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import type {
  Map as MlMap,
  SourceSpecification,
  LayerSpecification,
} from "maplibre-gl";
import { installGeographyLayers } from "../../src/engines/time-scene/stages/geo/geographyLayers";
vi.mock("../../src/theme/theme", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../src/theme/theme")>()),
  readThemeTokens: () => new Proxy({}, { get: () => "#abcdef" }),
}));
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const raw = {
  geography: read("src/content/topics/southeast-asia/data/geography.json"),
  sources: read("src/content/topics/southeast-asia/data/sources.json"),
};
const data = geographyData.parse(raw),
  g = data.geography;
const topic = topicSchema.parse(
  read("src/content/topics/southeast-asia/topic.yaml"),
);
const bi = { en: "Fixture", zh: "测试" },
  camera = { center: [116, 8], zoom: 3 };
const state = {
  geoContext: { kind: "climatology", month: 1 },
  camera,
  layers: ["base", "geo-countries", "clim-wind", "clim-rain"],
  highlight: [],
  selection: null,
  index: [],
  beats: [
    {
      geoContext: { kind: "climatology", month: 1 },
      caption: bi,
      selection: null,
      camera,
      layers: ["base", "geo-countries", "clim-wind", "clim-rain"],
      highlight: [],
    },
    {
      geoContext: { kind: "climatology", month: 7 },
      caption: bi,
      selection: null,
      camera: { center: [102, 20], zoom: 4 },
      layers: ["base", "geo-countries", "clim-wind"],
      highlight: [],
    },
  ],
};
const chapter = {
  id: "climate",
  order: 1,
  title: bi,
  sensitive: false,
  quiz: [],
  state,
} as Chapter;
function makeStore() {
  return createSceneStore<GeographyExt>({
    chapters: [chapter],
    defaults: {
      chapter: null,
      camera: null,
      layers: [],
      ...timeSceneEngine.defaults(topic, undefined),
    } as SceneSnapshot<GeographyExt>,
    fromChapterState: timeSceneEngine.fromChapterState,
  });
}
describe("present-day geography contract", () => {
  it("preserves eleven real country shapes and groups source river features", () => {
    expect(g.countries.features).toHaveLength(11);
    expect(
      g.layers.find((l) => l.id === "geo-rivers")!.features.features,
    ).toHaveLength(5);
    expect(
      geographyObjects(g).filter((o) => o.id === "river-mekong"),
    ).toHaveLength(1);
    expect(
      g.referenceItems.find((r) => r.id === "case-bukit-timah")?.locationRef,
    ).toBe("geo-sgp");
  });
  it.each([
    ["1967-08-07", 0],
    ["1967-08-08", 5],
    ["1984-01-06", 5],
    ["1984-01-07", 6],
    ["1995-07-27", 6],
    ["1995-07-28", 7],
    ["1997-07-22", 7],
    ["1997-07-23", 9],
    ["1999-04-30", 10],
    ["2025-10-25", 10],
    ["2025-10-26", 11],
    ["2026-10-27", 11],
  ])("inclusive membership on %s = %d", (date, count) => {
    const before = geographyHash(g.countries);
    expect(memberIds(g, date)).toHaveLength(count);
    expect(geographyHash(g.countries)).toBe(before);
  });
  it("installs country geometry once and changes only filters for membership dates", () => {
    const sources: Record<string, SourceSpecification> = {},
      layers: LayerSpecification[] = [];
    const map = {
      addSource: vi.fn((id: string, v: SourceSpecification) => {
        sources[id] = v;
      }),
      addLayer: vi.fn((v: LayerSpecification) => {
        layers.push(v);
      }),
      setFilter: vi.fn(),
      setLayoutProperty: vi.fn(),
      setPaintProperty: vi.fn(),
    };
    const store = makeStore();
    const render = installGeographyLayers(
      map as unknown as MlMap,
      g,
      store,
      () => {},
    );
    const count = map.addSource.mock.calls.length;
    for (const date of [
      "1967-08-07",
      "1967-08-08",
      "1997-07-23",
      "2025-10-26",
    ]) {
      store.getState().patch({
        geoContext: { kind: "membership", date },
        layers: ["geo-countries", "geo-membership"],
      });
      render.update();
    }
    expect(map.addSource).toHaveBeenCalledTimes(count);
    expect(map.setFilter).toHaveBeenLastCalledWith("geography-members", [
      "in",
      ["get", "id"],
      ["literal", memberIds(g, "2025-10-26")],
    ]);
    expect((sources["geography-geo-countries"] as { data: unknown }).data).toBe(
      g.countries,
    );
    expect(
      validateStyleMin({ version: 8, sources, layers }).map((e) => e.message),
    ).toEqual([]);
  });
  it("counts country ids once, preserves both simultaneous 1997 members, and never reaches 8", () => {
    const ids = memberIds(g, "1997-07-23");
    expect(ids).toContain("geo-lao");
    expect(ids).toContain("geo-mmr");
    expect(new Set(ids).size).toBe(9);
    expect(memberIds(g, "1967-08-08").sort()).toEqual([
      "geo-idn",
      "geo-mys",
      "geo-phl",
      "geo-sgp",
      "geo-tha",
    ]);
  });
  it("rejects bad contexts, dates, empty Chinese, unknown source/location and duplicate membership", () => {
    for (const ctx of [
      { kind: "climatology", month: 0 },
      { kind: "climatology", month: 13 },
      { kind: "climatology", month: 1.5 },
      { kind: "climatology", month: NaN },
      { kind: "membership", date: "1997-02-30" },
      { kind: "membership", date: "1997" },
      { kind: "present", month: 1 },
      { kind: "unknown" },
    ])
      expect(validGeoContext(ctx)).toBe(false);
    expect(
      geographyChapterState.safeParse({ ...state, time: "2020" }).success,
    ).toBe(false);
    const d = structuredClone(raw);
    d.geography.members.push(d.geography.members[0]);
    d.geography.referenceItems[0].locationRef = "missing";
    d.geography.countries.features[0].properties.name.zh = "";
    d.geography.countries.features[0].properties.sources = ["S999"];
    expect(geographyData.safeParse(d).success).toBe(false);
  });
  it("preserves authored paired highlights and isolates a different manual selection", () => {
    expect(geographyHighlightIds(g, ["geo-lao", "geo-mmr"], "geo-lao")).toEqual(
      ["geo-lao", "geo-mmr"],
    );
    expect(
      geographyHighlightIds(
        g,
        ["sea-south-china", "sea-java"],
        "sea-south-china",
      ),
    ).toEqual(["sea-south-china", "sea-java"]);
    expect(geographyHighlightIds(g, ["geo-lao", "geo-mmr"], "geo-tls")).toEqual(
      ["geo-tls"],
    );
    expect(
      geographyHighlightIds(g, ["geo-lao", "geo-mmr"], "case-bukit-timah"),
    ).toEqual(["geo-sgp"]);
  });
  it("permits only the geo TimeScene branch", () => {
    expect(topicSchema.safeParse({ ...topic, stage: "diagram" }).success).toBe(
      false,
    );
    expect(
      topicSchema.safeParse({
        ...topic,
        engine: "space-scene",
        stage: "model3d",
      }).success,
    ).toBe(false);
  });
  it("hydrates beat before applying valid context override and canonicalizes invalid overrides", () => {
    const store = makeStore();
    const patch = geographyUrlPatch(
      store,
      [chapter],
      decodeSceneState("ch=climate&b=2&gc=c&m=1&t=1967"),
      topic,
    );
    expect(patch).toMatchObject({
      beat: 1,
      t: null,
      month: undefined,
      geoContext: { kind: "climatology", month: 1 },
      camera: { center: [102, 20], zoom: 4 },
    });
    const invalid = geographyUrlPatch(
      store,
      [chapter],
      decodeSceneState("ch=climate&b=2&gc=c&m=13"),
      topic,
    );
    expect(invalid.geoContext).toEqual({ kind: "climatology", month: 7 });
    store.getState().hydrate(invalid);
    const s = store.getState().snapshot();
    const search = mergeSearch(
      "?t=1967&at=bad&utm=keep",
      encodeSceneState(s, geographyUrlBaseline(store, [chapter], s)!),
    );
    expect(search).toContain("gc=c");
    expect(search).toContain("m=7");
    expect(search).not.toMatch(/[?&](?:at|t)=/);
    expect(search).toContain("utm=keep");
  });
  it("accepts direct membership dates without changing the chosen beat camera", () => {
    const store = makeStore();
    const patch = geographyUrlPatch(
      store,
      [chapter],
      decodeSceneState("ch=climate&b=1&gc=a&at=2025-10-26"),
      topic,
    );
    expect(patch).toMatchObject({
      beat: 0,
      geoContext: { kind: "membership", date: "2025-10-26" },
      camera,
    });
    const p = geographyUrlPatch(
      store,
      [chapter],
      decodeSceneState("gc=p&m=7&at=2025-10-26&t=1967"),
      topic,
    );
    expect(p.geoContext).toEqual({ kind: "present" });
    expect(p.layers).not.toContain("clim-wind");
  });
  it("context transitions clear stale climate selections and reject programmatic invalid values", () => {
    const store = makeStore();
    store.getState().patch({ geoSelection: "cell-105-0" });
    expect(
      setGeoContext(store, { kind: "membership", date: "1967-08-08" }, topic),
    ).toBe(true);
    expect(store.getState()).toMatchObject({
      geoSelection: null,
      geoContext: { kind: "membership", date: "1967-08-08" },
    });
    expect(store.getState().layers).not.toContain("clim-wind");
    const before = store.getState().snapshot();
    expect(
      setGeoContext(store, { kind: "membership", date: "1800-01-01" }, topic),
    ).toBe(false);
    expect(store.getState().snapshot()).toEqual(before);
    expect(
      geographyBeatScene(store, [chapter], "climate", 1).geoContext,
    ).toEqual({ kind: "climatology", month: 7 });
  });
  it("keeps exact shared climate samples while remapping only source metadata", () => {
    const resources = topic.monthlyLayers!.map((l) => {
      const original = read(`public/geo/${l.file}.json`);
      const before = JSON.stringify(original);
      const remapped = remapClimateSources(original, l.sourceMap);
      const packed = packClimate(
        validateClimateResource(remapped, {
          quantity: l.quantity,
          periodId: topic.climatology!.periodId,
          startYear: 1991,
          endYear: 2020,
          sources: new Set(
            raw.sources.sources.map((s: { id: string }) => s.id),
          ),
        }),
      );
      expect(JSON.stringify(original)).toBe(before);
      expect(packed.resource.sources).toEqual(l.sources);
      return { status: "ready" as const, data: packed };
    });
    const s = sampleClimate(105, 0, 1, resources[0], resources[1]);
    expect(s.wind).toMatchObject({ index: 132, u: 1.1373713, v: -4.9311786 });
    expect(s.rain).toMatchObject({ index: 126, rate: 3.784817 });
    const july = sampleClimate(105, 0, 7, resources[0], resources[1]);
    expect(july.wind).toMatchObject({ u: 0.11203182, v: 3.5973375 });
    expect(july.rain).toMatchObject({ rate: 3.726351 });
    expect(
      sampleClimate(85, 0, 1, resources[0], resources[1]).wind.status,
    ).toBe("outside");
  });
});
