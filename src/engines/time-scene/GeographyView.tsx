/** Present-day map contexts composed with the shared monthly climate stage. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EngineViewProps, SceneSnapshot } from "../core/types";
import {
  SceneSlot,
  useHud,
  useScene,
  useSceneContext,
  useSceneControls,
  useSceneStore,
} from "../core/context";
import type { SceneControls } from "../core/controls";
import { ChapterAxis } from "../core/axis/ChapterAxis";
import { flatIndex, stepBeat } from "../core/axis/axis";
import { chapterNumbers, isBackground } from "../core/chapters";
import { usePresentation } from "../core/presentation";
import { tx } from "../../i18n";
import { ControlPanel, type ControlRow } from "../widgets/ControlPanel";
import { SourceRefs } from "../widgets/SourcePopover";
import { ClimatologyReaderTop } from "./ClimatologyReader";
import type {
  GeographyData,
  GeographyChapterState,
  GeographyBeat,
} from "./geography-schema";
import type { ClimatologyGeoData } from "./schema";
import {
  geographyBeatScene,
  geographyUrlBaseline,
  geographyObjects,
  geographyHash,
  memberIds,
  climateCell,
  geographyLayers,
  setGeoContext,
  type GeographyExt,
  type GeoContext,
} from "./lib/geography";
import { monthText, cycleMonth } from "./lib/climatology-state";
import {
  ClimatologyStage,
  type ClimateGeoController,
  type ClimateSnapshot,
} from "./stages/geo/ClimatologyStage";
import { ClimateCellControls } from "./ClimateCellControls";
import { ClimateKey } from "./ClimateKey";
import { ClimateCellDetail } from "./ClimateCellDetail";
import "./climatology.css";
import "./time-scene.css";
import "./geography.css";
export default function GeographyView({
  topic,
  data,
  chapters,
  locale,
}: EngineViewProps) {
  const geo = data as GeographyData,
    g = geo.geography,
    store = useSceneStore<GeographyExt>(),
    { hud, revealReader } = useSceneContext();
  const state = useScene<GeographyExt, SceneSnapshot<GeographyExt>>((s) => ({
    chapter: s.chapter,
    geoContext: s.geoContext,
    geoSelection: s.geoSelection,
    beat: s.beat,
    t: s.t,
    camera: s.camera,
    layers: s.layers,
    highlight: s.highlight,
    theme: s.theme,
  }));
  const [overlayOpen, setOverlayOpen] = useState(
    () => window.matchMedia("(min-width: 760px)").matches,
  );
  const [controller, setController] = useState<ClimateGeoController | null>(
      null,
    ),
    [snapshot, setSnapshot] = useState<ClimateSnapshot | null>(null);
  const ref = useRef(controller);
  ref.current = controller;
  const open = useHud((h) => h.panelsOpen),
    chapter = chapters.find((c) => c.id === state.chapter) ?? chapters[0]!,
    ctx = state.geoContext,
    zh = locale === "zh";
  const objects = useMemo(() => geographyObjects(g), [g]),
    selected = objects.find((o) => o.id === state.geoSelection),
    cell = ctx.kind === "climatology" ? climateCell(state.geoSelection) : null;
  const applyBeat = useCallback(
    (id: string, index: number, instant = false) => {
      const ch = chapters.find((c) => c.id === id);
      if (
        !ch ||
        !Number.isInteger(index) ||
        index < 0 ||
        index >= (ch.state as GeographyChapterState).beats.length
      )
        return false;
      const target = geographyBeatScene(store, chapters, id, index);
      target.layers = geographyLayers(
        target.layers,
        target.geoContext,
        topic.monthlyLayers ?? [],
      );
      store.getState().applyState(target, { instant });
      return true;
    },
    [chapters, store, topic.monthlyLayers],
  );
  const select = useCallback(
    (id: string | null) => {
      const s = store.getState();
      const at = climateCell(id);
      if (at && s.geoContext.kind !== "climatology") {
        if (!topic.climatology || !topic.monthlyLayers?.length) return false;
        s.patch({
          geoContext: {
            kind: "climatology",
            month: topic.climatology.initialMonth,
          },
          layers: [
            ...s.layers.filter((l) => l !== "geo-membership"),
            ...topic.monthlyLayers.map((l) => l.id),
          ],
        });
      }
      if (
        id &&
        !objects.some((o) => o.id === id) &&
        !(store.getState().geoContext.kind === "climatology" && climateCell(id))
      )
        return false;
      const item = objects.find((o) => o.id === id);
      const target = item?.locationRef;
      const layer = g.countries.features.some((f) => f.properties.id === target)
        ? "geo-countries"
        : (g.layers.find((l) =>
            l.features.features.some((f) => f.properties.id === target),
          )?.id ?? (target ? "geo-anchors" : null));
      s.patch({
        geoSelection: id,
        ...(layer && !s.layers.includes(layer)
          ? { layers: [...s.layers, layer] }
          : {}),
      });
      if (id) {
        revealReader?.();
        hud.setState({ reader: true });
      }
      return true;
    },
    [store, objects, revealReader, hud, g, topic],
  );
  const context = useCallback(
    (value: unknown) => setGeoContext(store, value, topic),
    [store, topic],
  );
  const contextText = (value: GeoContext) =>
    value.kind === "present"
      ? zh
        ? "今天的地图"
        : "Present-day map"
      : value.kind === "membership"
        ? `${zh ? "入会日期" : "Membership date"} · ${value.date}`
        : `${monthText(value.month, locale)} · ${topic.climatology?.startYear ?? "—"}–${topic.climatology?.endYear ?? "—"}`;
  const presentation = usePresentation<
    GeographyBeat,
    SceneSnapshot<GeographyExt>
  >({
    beatsOf: (c) => (c.state as GeographyChapterState).beats,
    captionOf: (b, l) => tx(b.caption, l),
    applyBeat: (b, o) => {
      applyBeat(b.chapter, b.index, o.instant);
    },
    saveState: () => store.getState().snapshot(),
    restoreState: (s) => store.getState().applyState(s),
    readout: <span>{contextText(ctx)}</span>,
  });
  const beatRef = useRef(presentation.beats);
  beatRef.current = presentation.beats;
  const step = useCallback(
    (delta: -1 | 1) => {
      const s = store.getState(),
        i = stepBeat(beatRef.current, s.chapter, s.beat, true, delta);
      if (i === null) return;
      if (presentation.isPresenting())
        presentation.controls.go(i, { instant: false });
      else {
        const b = beatRef.current[i]!;
        applyBeat(b.chapter, b.index);
      }
    },
    [store, presentation.controls, presentation.isPresenting, applyBeat],
  );
  const monthStep = useCallback(
    (delta: -1 | 1) => {
      const c = store.getState().geoContext;
      if (c.kind === "climatology")
        context({ kind: "climatology", month: cycleMonth(c.month, delta) });
    },
    [store, context],
  );
  useEffect(
    () => controller?.setPresentation(presentation.presenting),
    [controller, presentation.presenting],
  );
  useEffect(
    () => controller?.setSelected(cell ? { kind: "cell", at: cell } : null),
    [controller, state.geoSelection, ctx.kind],
  );
  const members = ctx.kind === "membership" ? memberIds(g, ctx.date) : [];
  const hash = useMemo(() => geographyHash(g.countries), [g]);
  const toggle = useCallback(
    (id: string, on: boolean) => {
      const s = store.getState();
      if (
        ![
          "geo-countries",
          "geo-membership",
          "geo-anchors",
          ...g.layers.map((l) => l.id),
          ...(topic.monthlyLayers ?? []).map((l) => l.id),
        ].includes(id)
      )
        return false;
      if (s.layers.includes(id) !== on) s.toggleLayer(id);
      s.patch({
        layers: geographyLayers(
          store.getState().layers,
          s.geoContext,
          topic.monthlyLayers ?? [],
        ),
      });
      return true;
    },
    [store, g, topic.monthlyLayers],
  );
  const controls = useMemo<SceneControls>(
    () => ({
      presets: {
        items: [
          { id: "world", label: { en: "World", zh: "世界" } },
          { id: "theatre", label: { en: "Whole area", zh: "全区域" } },
          ...(geo.presets?.presets ?? []).map((p) => ({
            id: p.id,
            label: p.label,
          })),
        ],
        set: (id, opts) => {
          const c =
            id === "world"
              ? { center: [105, 8] as [number, number], zoom: 1.2 }
              : id === "theatre"
                ? { center: [116, 8] as [number, number], zoom: 3 }
                : geo.presets?.presets.find((p) => p.id === id)?.camera;
          if (c) store.getState().applyCameraPreset(c, opts);
        },
      },
      modes: {
        items: [
          {
            id: "presentation",
            key: "p",
            label: { en: "Present", zh: "演示" },
            on: presentation.presenting,
            status: presentation.status,
          },
        ],
        set: (id, on, opts) => {
          if (id !== "presentation") return;
          if (on) {
            const s = store.getState();
            presentation.start(
              Math.max(0, flatIndex(beatRef.current, s.chapter, s.beat)),
              opts.instant,
            );
          } else presentation.stop(true);
        },
      },
      beats: presentation.controls,
      beatStep: step,
      monthStep,
      labels: true,
      urlBaseline: (raw) =>
        geographyUrlBaseline(
          store,
          chapters,
          raw as SceneSnapshot<GeographyExt>,
        ),
      status: [contextText(ctx)],
      specRows: [
        {
          id: "geography-shapes",
          label: { en: "Map", zh: "地图" },
          value: zh ? "今天的国形" : "Present-day shapes",
          source: "ref",
        },
        {
          id: "geography-epoch",
          label: { en: "Cartography", zh: "制图快照" },
          value: topic.geography!.geometryEpoch,
          source: "ref",
        },
        ...(ctx.kind === "climatology"
          ? [
              {
                id: "climate-period",
                label: { en: "Climate baseline", zh: "气候基准期" },
                value: `${topic.climatology?.startYear ?? "—"}–${topic.climatology?.endYear ?? "—"}`,
                source: "ref" as const,
              },
            ]
          : []),
      ],
      ready: () => ref.current?.ready() ?? false,
      stats: () => ({
        ...ref.current?.stats(),
        geography: {
          context: store.getState().geoContext,
          countryCount: g.countries.features.length,
          geometryHash: hash,
        },
      }),
      escape: () => {
        if (presentation.isPresenting()) {
          presentation.stop(true);
          return true;
        }
        if (store.getState().geoSelection) {
          select(null);
          return true;
        }
        return false;
      },
      test: {
        setGeoContext: context as never,
        selectGeography: select as never,
        goToGeographyBeat: ((id: string, i: number) =>
          applyBeat(id, i, true)) as never,
        toggleGeographyLayer: toggle as never,
        sampleClimate: ((x: number, y: number, m?: number) =>
          store.getState().geoContext.kind === "climatology"
            ? ref.current?.sampleClimate(x, y, m)
            : null) as never,
        geography: (() => {
          const s = store.getState(),
            m =
              s.geoContext.kind === "membership"
                ? memberIds(g, s.geoContext.date)
                : [];
          const at =
            s.geoContext.kind === "climatology"
              ? climateCell(s.geoSelection)
              : null;
          return {
            context: s.geoContext,
            geometryHash: hash,
            countryCount: g.countries.features.length,
            memberIds: m,
            memberCount: m.length,
            selection: s.geoSelection,
            visibleLayerIds: geographyLayers(
              s.layers,
              s.geoContext,
              topic.monthlyLayers ?? [],
            ),
            climateSample: at ? ref.current?.sampleClimate(...at) : null,
            climatology:
              s.geoContext.kind === "climatology"
                ? ref.current?.snapshot()
                : null,
          };
        }) as never,
      },
    }),
    [
      geo,
      g,
      store,
      chapters,
      ctx,
      locale,
      topic,
      presentation.controls,
      presentation.presenting,
      presentation.status,
      presentation.start,
      presentation.stop,
      presentation.isPresenting,
      step,
      monthStep,
      context,
      select,
      applyBeat,
      toggle,
      hash,
      snapshot,
    ],
  );
  useSceneControls(controls);
  const numbers = chapterNumbers(chapters),
    axis = chapters.map((c) => ({
      id: c.id,
      number: isBackground(c)
        ? "BG"
        : String(numbers.get(c.id) ?? 0).padStart(2, "0"),
      title: tx(c.title, locale),
      beats: (c.state as GeographyChapterState).beats.map((b) =>
        tx(b.caption, locale),
      ),
    }));
  const layerRows: ControlRow[] = [
    {
      kind: "layer",
      id: "geo-countries",
      label: { en: "Present-day countries", zh: "今天的国家" },
    },
    {
      kind: "layer",
      id: "geo-anchors",
      label: { en: "Location markers", zh: "位置标记" },
    },
    ...g.layers.map((l) => ({
      kind: "layer" as const,
      id: l.id,
      label: l.label,
    })),
    ...(ctx.kind === "membership"
      ? [
          {
            kind: "layer" as const,
            id: "geo-membership",
            label: { en: "Members by date", zh: "按日期加入的成员" },
          },
        ]
      : []),
    ...(ctx.kind === "climatology"
      ? (topic.monthlyLayers ?? []).map((l) => ({
          kind: "layer" as const,
          id: l.id,
          label: l.label,
        }))
      : []),
    { kind: "mode", id: "labels" },
  ];
  const dates = [
    ...new Set([
      topic.geography!.dateRange[0],
      ...g.members.map((m) => m.joined),
      topic.geography!.asOf,
    ]),
  ].sort();
  const contextControl = (
    <div className="geo-context-control">
      {ctx.kind === "climatology" ? (
        <>
          <label>
            {zh ? "月份" : "Month"}
            <input
              aria-label={zh ? "月份" : "Month"}
              type="range"
              min={1}
              max={12}
              value={ctx.month}
              onChange={(e) =>
                context({
                  kind: "climatology",
                  month: Number(e.currentTarget.value),
                })
              }
            />
          </label>
          <p>
            {monthText(ctx.month, locale)} ·{" "}
            {zh
              ? "多年各月平均，不是预报"
              : "Calendar-month means, not a forecast"}
          </p>
        </>
      ) : ctx.kind === "membership" ? (
        <>
          <label>
            {zh ? "入会日期" : "Membership date"}
            <select
              data-membership-date
              value={ctx.date}
              onChange={(e) =>
                context({ kind: "membership", date: e.currentTarget.value })
              }
            >
              {!dates.includes(ctx.date) && (
                <option value={ctx.date}>{ctx.date}</option>
              )}
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label>
            {zh ? "查看日期" : "Explore date"}
            <input
              type="date"
              min={topic.geography!.dateRange[0]}
              max={topic.geography!.dateRange[1]}
              value={ctx.date}
              onChange={(e) =>
                context({ kind: "membership", date: e.currentTarget.value })
              }
            />
          </label>
        </>
      ) : (
        <p>
          {zh
            ? "地理上下文：没有历史日期"
            : "Geography context: no historical date"}
        </p>
      )}
    </div>
  );
  const at = flatIndex(presentation.beats, state.chapter, state.beat),
    authored = (chapter.state as GeographyChapterState).beats[state.beat ?? 0]
      ?.geoContext;
  const member = selected
    ? g.members.find((m) => m.id === selected.locationRef)
    : null;
  const selectedFigure =
    selected && "figure" in selected && typeof selected.figure === "string"
      ? selected.figure
      : null;
  const [visibleFigure, setVisibleFigure] = useState<string | null>(null);
  useEffect(() => {
    setVisibleFigure(
      selectedFigure &&
        [
          ...document.querySelectorAll<HTMLElement>(`[id="${selectedFigure}"]`),
        ].some((e) => e.getClientRects().length)
        ? selectedFigure
        : null,
    );
  }, [chapter.id, selectedFigure, selected?.id]);
  const detail = selected ? (
    <article
      className="clim-cell-detail"
      data-geography-selection={selected.id}
    >
      <header>
        <h3>{tx(selected.title, locale)}</h3>
        <button
          type="button"
          aria-label={zh ? "关闭详情" : "Close details"}
          onClick={() => select(null)}
        >
          ×
        </button>
      </header>
      {selected.kind === "reference" && (
        <p>{zh ? "国家尺度参考" : "Country-scale reference"}</p>
      )}
      <p>
        {tx(selected.summary, locale)}{" "}
        <SourceRefs ids={selected.sources} locale={locale} />
      </p>
      {selected.detail && <p>{tx(selected.detail, locale)}</p>}
      {member && ctx.kind === "membership" && (
        <p>
          {member.joined} ·{" "}
          {member.joined <= ctx.date
            ? zh
              ? "到所选日期已加入"
              : "Member by selected date"
            : zh
              ? "当时未加入"
              : "Not yet joined"}{" "}
          <SourceRefs ids={member.sources} locale={locale} />
        </p>
      )}
      {visibleFigure && visibleFigure === selectedFigure && (
        <button
          type="button"
          onClick={() => {
            [
              ...document.querySelectorAll<HTMLElement>(
                `[id="${visibleFigure}"]`,
              ),
            ]
              .find((e) => e.getClientRects().length)
              ?.scrollIntoView({ block: "start", behavior: "smooth" });
          }}
        >
          {zh ? "查看图示" : "View figure"}
        </button>
      )}
    </article>
  ) : cell ? (
    <ClimateCellDetail
      sample={controller?.sampleClimate(...cell) ?? null}
      locale={locale}
      onClose={() => select(null)}
      visible={[
        ...new Set(
          (topic.monthlyLayers ?? [])
            .filter((l) => state.layers.includes(l.id))
            .map((l) => l.quantity),
        ),
      ]}
    />
  ) : undefined;
  return (
    <div
      className="ts-stage clim-stage geo-stage"
      data-temporal-mode="geography"
      data-presenting={presentation.presenting ? "" : undefined}
    >
      <ClimatologyStage
        store={store}
        data={geo as unknown as ClimatologyGeoData}
        topic={topic}
        locale={locale}
        geography={g}
        onSelectGeography={select}
        isPresenting={presentation.isPresenting}
        onSelectSite={select}
        onSelectCell={(x, y) => select(`cell-${x}-${y}`)}
        onController={setController}
        onSnapshot={setSnapshot}
      />
      {presentation.element}
      <SceneSlot name="plate">
        <section className="geo-readout">
          <h3>GEOGRAPHY · {zh ? "地理" : "Present-day shapes"}</h3>
          <p>{contextText(ctx)}</p>
          {ctx.kind === "climatology" && (
            <p>
              {[...(controller?.layerStates().values() ?? [])]
                .filter((s) => s.status === "ready")
                .map((s) =>
                  s.status === "ready"
                    ? `${s.data.resource.kind === "monthly-wind" ? `${s.data.resource.pressureHpa} hPa` : s.data.resource.units} · ${s.data.resource.grid.dlon}° × ${s.data.resource.grid.dlat}°`
                    : "",
                )
                .join(" · ")}
            </p>
          )}
          {ctx.kind === "membership" && (
            <p data-member-count>
              {state.layers.includes("geo-membership")
                ? `${members.length} ${zh ? "个成员" : "members"}`
                : zh
                  ? "成员图层已关闭"
                  : "Membership layer off"}
            </p>
          )}
        </section>
      </SceneSlot>
      <SceneSlot name="stageOverlay">
        <details
          className="atlas-overlay-card ts-overlay"
          open={overlayOpen}
          onToggle={(e) => setOverlayOpen(e.currentTarget.open)}
        >
          <summary>{zh ? "图层与图例" : "Layers and key"}</summary>
          <ControlPanel
            layers={layerRows}
            tools={[
              {
                kind: "mode",
                id: "presentation",
                label: { en: "Present", zh: "演示" },
              },
              { kind: "hud" },
            ]}
          />
          {contextControl}
          {ctx.kind === "membership" && (
            <p>
              {zh
                ? "强调色：到所选日期已加入 · 浅色：当时未加入。全部使用今天的国形。"
                : "Accent: member by selected date · pale: not yet joined. All shapes are present-day."}
            </p>
          )}
          {ctx.kind === "climatology" && (
            <>
              <ClimateKey
                topic={topic}
                locale={locale}
                layers={state.layers}
                snapshot={snapshot}
                controller={controller}
              />
              <ClimateCellControls
                controller={controller}
                locale={locale}
                selected={cell}
                onInspect={(x, y) => select(`cell-${x}-${y}`)}
                compact
              />
            </>
          )}
        </details>
      </SceneSlot>
      <SceneSlot name="bottomBar">
        <ChapterAxis
          chapters={axis}
          chapter={state.chapter}
          beat={state.beat}
          open={open}
          onOpen={(panelsOpen) => hud.setState({ panelsOpen })}
          onChapter={(id) => store.getState().goToChapter(id)}
          onBeat={(id, i) => applyBeat(id, i)}
          locale={locale}
        />
      </SceneSlot>
      <SceneSlot name="readerTop">
        <ClimatologyReaderTop
          chapter={chapter}
          beat={state.beat}
          month={ctx.kind === "climatology" ? ctx.month : 1}
          authoredMonth={
            authored?.kind === "climatology"
              ? authored.month
              : ctx.kind === "climatology"
                ? ctx.month
                : 1
          }
          onStep={step}
          canPrev={at > 0}
          canNext={at < presentation.beats.length - 1}
          sites={[]}
          onClose={() => select(null)}
          cellDetail={detail}
          selectionKey={state.geoSelection ?? ""}
          locale={locale}
        />
        <details className="geo-phone-context">
          <summary>{contextText(ctx)}</summary>
          {contextControl}
          {ctx.kind === "climatology" && (
            <ClimateCellControls
              controller={controller}
              locale={locale}
              selected={cell}
              onInspect={(x, y) => select(`cell-${x}-${y}`)}
              compact
            />
          )}
        </details>
      </SceneSlot>
      <SceneSlot name="readerEnd">
        <section className="clim-index">
          <h3>{zh ? "本章索引" : "In this chapter"}</h3>
          <ul>
            {(chapter.state as GeographyChapterState).index.map((id) => {
              const item = objects.find((o) => o.id === id),
                at = climateCell(id);
              return item || at ? (
                <li key={id}>
                  <button
                    type="button"
                    data-geography-index={id}
                    aria-pressed={state.geoSelection === id}
                    onClick={() => select(id)}
                  >
                    <b>
                      {item
                        ? tx(item.title, locale)
                        : `${zh ? "气候格点" : "Climate cell"} ${at![0]}°, ${at![1]}°`}
                    </b>
                    <span>
                      {item
                        ? tx(item.summary, locale)
                        : zh
                          ? "查看原生格网读数"
                          : "Inspect native-grid readings"}
                    </span>
                  </button>
                </li>
              ) : null;
            })}
          </ul>
        </section>
      </SceneSlot>
    </div>
  );
}
