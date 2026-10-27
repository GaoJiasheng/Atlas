/** Inline immutable geography sources: dates change filters, never geometry. */
import type {
  Map as MlMap,
  LayerSpecification,
  MapMouseEvent,
} from "maplibre-gl";
import type { GeographyFile } from "../../geography-schema";
import type { GeographyExt } from "../../lib/geography";
import { geographyHighlightIds, memberIds } from "../../lib/geography";
import type { SceneStore } from "../../../core/store";
import { readThemeTokens } from "../../../../theme/theme";
export function installGeographyLayers(
  map: MlMap,
  g: GeographyFile,
  store: SceneStore<GeographyExt>,
  onSelect: (id: string) => void,
) {
  const ids: string[] = [],
    pickLayers: string[] = [],
    definitions = new Map<string, { source: string; parts: string[] }>();
  const add = (
    id: string,
    collection: unknown,
    kind: "point" | "line" | "area",
    color: string,
  ) => {
    const source = `geography-${id}`,
      parts: string[] = [];
    map.addSource(source, {
      type: "geojson",
      data: collection as GeoJSON.FeatureCollection,
      tolerance: 0,
    });
    const push = (
      suffix: string,
      layer: Omit<LayerSpecification, "id" | "source">,
    ) => {
      const name = `${source}-${suffix}`;
      map.addLayer({ ...layer, id: name, source } as LayerSpecification);
      parts.push(name);
      pickLayers.push(name);
    };
    if (kind === "area") {
      push("fill", {
        type: "fill",
        paint: { "fill-color": color, "fill-opacity": 0.07 },
      });
      push("edge", {
        type: "line",
        paint: { "line-color": color, "line-width": 0.7 },
      });
    } else if (kind === "line")
      push("line", {
        type: "line",
        layout: { "line-join": "round" },
        paint: { "line-color": color, "line-width": 1.4 },
      });
    else
      push("point", {
        type: "circle",
        paint: {
          "circle-color": color,
          "circle-radius": 3,
          "circle-stroke-color": readThemeTokens().paper,
          "circle-stroke-width": 1,
        },
      });
    definitions.set(id, { source, parts });
    ids.push(...parts);
  };
  const tk = readThemeTokens();
  add("geo-countries", g.countries, "area", tk.ink);
  const separateIds = new Set(
    g.layers.flatMap((l) => l.features.features.map((f) => f.properties.id)),
  );
  const anchorFeatures = g.anchors
    .filter((a) => !separateIds.has(a.id))
    .map((a) => ({
      type: "Feature",
      properties: { id: a.id, name: a.name, sources: a.sources },
      geometry: { type: "Point", coordinates: a.at },
    }));
  add(
    "geo-anchors",
    { type: "FeatureCollection", features: anchorFeatures },
    "point",
    tk.ink,
  );
  for (const layer of g.layers)
    add(
      layer.id,
      layer.features,
      layer.kind,
      tk[layer.color.slice(6) as keyof typeof tk] ?? tk.ink,
    );
  const countrySource = definitions.get("geo-countries")!.source;
  map.addLayer({
    id: "geography-members",
    source: countrySource,
    type: "fill",
    filter: ["==", ["get", "id"], ""],
    paint: {
      "fill-color": tk.signal,
      "fill-opacity": 0.22,
      "fill-opacity-transition": { duration: 0 },
    },
  });
  ids.push("geography-members");
  for (const [id, def] of definitions) {
    const kind =
      id === "geo-countries"
        ? "area"
        : id === "geo-anchors"
          ? "point"
          : g.layers.find((l) => l.id === id)!.kind;
    const selected = `${def.source}-selected`;
    map.addLayer({
      id: selected,
      source: def.source,
      type: kind === "point" ? "circle" : "line",
      filter: ["==", ["get", "id"], ""],
      paint:
        kind === "point"
          ? {
              "circle-color": tk.signal,
              "circle-radius": 6,
              "circle-stroke-color": tk.ink,
              "circle-stroke-width": 1,
            }
          : { "line-color": tk.signal, "line-width": 2.6 },
    } as LayerSpecification);
    ids.push(selected);
  }
  let signature = "";
  function update() {
    const s = store.getState(),
      ctx = s.geoContext;
    const highlights = geographyHighlightIds(g, s.highlight, s.geoSelection);
    const members = ctx.kind === "membership" ? memberIds(g, ctx.date) : [];
    const next = JSON.stringify([ctx, s.layers, highlights]);
    if (next === signature) return;
    signature = next;
    for (const [id, def] of definitions) {
      const visible = s.layers.includes(id);
      for (const part of def.parts)
        map.setLayoutProperty(part, "visibility", visible ? "visible" : "none");
      map.setLayoutProperty(
        `${def.source}-selected`,
        "visibility",
        visible ? "visible" : "none",
      );
      map.setFilter(`${def.source}-selected`, [
        "in",
        ["get", "id"],
        ["literal", highlights],
      ]);
    }
    map.setLayoutProperty(
      "geography-members",
      "visibility",
      ctx.kind === "membership" &&
        s.layers.includes("geo-countries") &&
        s.layers.includes("geo-membership")
        ? "visible"
        : "none",
    );
    map.setFilter("geography-members", [
      "in",
      ["get", "id"],
      ["literal", members],
    ]);
  }
  function recolor() {
    const t = readThemeTokens();
    for (const [id, def] of definitions) {
      const color =
        id === "geo-countries" || id === "geo-anchors"
          ? t.ink
          : (t[
              g.layers
                .find((l) => l.id === id)!
                .color.slice(6) as keyof typeof t
            ] ?? t.ink);
      for (const part of def.parts) {
        const kind = part.endsWith("fill")
          ? "fill"
          : part.endsWith("point")
            ? "circle"
            : "line";
        map.setPaintProperty(part, `${kind}-color`, color);
      }
      map.setPaintProperty(
        `${def.source}-selected`,
        id === "geo-anchors" ||
          (id !== "geo-countries" &&
            g.layers.find((l) => l.id === id)?.kind === "point")
          ? "circle-color"
          : "line-color",
        t.signal,
      );
    }
    map.setPaintProperty("geography-members", "fill-color", t.signal);
    signature = "";
    update();
  }
  const click = (e: MapMouseEvent) => {
    const hits = map.queryRenderedFeatures(
      [
        [e.point.x - 22, e.point.y - 22],
        [e.point.x + 22, e.point.y + 22],
      ],
      {
        layers: pickLayers.filter(
          (id) => map.getLayoutProperty(id, "visibility") !== "none",
        ),
      },
    );
    const hit =
      hits.find(
        (f) =>
          f.geometry.type !== "Polygon" && f.geometry.type !== "MultiPolygon",
      ) ?? hits[0];
    if (hit?.properties?.id) {
      onSelect(String(hit.properties.id));
      return true;
    }
    return false;
  };
  update();
  return {
    update,
    raise() {
      for (const id of ids)
        if (!id.endsWith("-fill") && map.getLayer(id)) map.moveLayer(id);
    },
    recolor,
    click,
    ready: () =>
      [...definitions.values()].every((d) => map.isSourceLoaded(d.source)),
    stats: () => ({
      countryCount: g.countries.features.length,
      sourceBuilds: definitions.size,
      countrySetData: 0,
    }),
    destroy() {
      for (const id of ids.reverse()) if (map.getLayer(id)) map.removeLayer(id);
      for (const def of definitions.values())
        if (map.getSource(def.source)) map.removeSource(def.source);
    },
  };
}
