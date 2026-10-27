/** Build-only present-day geography contract; monthly resources retain their existing schema. */
import { z } from "zod";
import { bilingual, kebabId, lngLat } from "../../content/schema/common";
import {
  areaGeometry,
  feature,
  featureCollection,
  lineString,
  position,
} from "../../content/schema/geojson";
import { sourceId, sourceIds, sourcesFile } from "../../content/schema/sources";
import { glossaryFile } from "../../content/schema/glossary";
import { geoCamera } from "../../content/schema/camera";
import { theme } from "../../content/schema/common";
import { TOKEN_NAMES } from "../../theme/theme";
import { isIsoDate } from "../../lib/time";
const text = bilingual.refine((t) => !!t.zh.trim(), "Chinese text is required");
export const geographyDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD")
  .refine(isIsoDate, "not a real calendar date");
export const geoContextSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("present") }).strict(),
  z
    .object({
      kind: z.literal("climatology"),
      month: z.number().int().min(1).max(12),
    })
    .strict(),
  z.object({ kind: z.literal("membership"), date: geographyDate }).strict(),
]);
export const geographyOptions = z
  .object({
    asOf: geographyDate,
    geometryEpoch: z.string().trim().min(1),
    dateRange: z.tuple([geographyDate, geographyDate]),
    initialContext: geoContextSchema,
  })
  .strict()
  .superRefine((v, c) => {
    if (v.dateRange[0] > v.dateRange[1] || v.dateRange[1] > v.asOf)
      c.addIssue({
        code: "custom",
        path: ["dateRange"],
        message: "expected ascending dateRange ending on or before asOf",
      });
    if (
      v.initialContext.kind === "membership" &&
      (v.initialContext.date < v.dateRange[0] ||
        v.initialContext.date > v.dateRange[1])
    )
      c.addIssue({
        code: "custom",
        path: ["initialContext"],
        message: "membership date outside dateRange",
      });
  });
const props = z
  .object({
    id: kebabId,
    name: text,
    sources: z.array(sourceId).min(1),
    summary: text.optional(),
    detail: text.optional(),
  })
  .strict();
const point = z
  .object({ type: z.literal("Point"), coordinates: position })
  .strict();
const multiLine = z
  .object({
    type: z.literal("MultiLineString"),
    coordinates: z.array(z.array(position).min(2)).min(1),
  })
  .strict();
const lines = z.discriminatedUnion("type", [lineString, multiLine]);
const country = feature(
  areaGeometry,
  props.extend({ a3: z.string().regex(/^[A-Z]{3}$/) }),
);
const staticLayer = z
  .object({
    id: kebabId,
    kind: z.enum(["point", "line", "area"]),
    label: text,
    color: z
      .string()
      .refine(
        (v) => TOKEN_NAMES.some((t) => v === `token:${t}`),
        "expected a known token",
      ),
    features: featureCollection(
      feature(z.union([point, lines, areaGeometry]), props),
    ),
  })
  .strict()
  .superRefine((l, c) => {
    if (
      [
        "base",
        "geo-countries",
        "geo-membership",
        "geo-anchors",
        "sites",
        "control",
        "battles",
        "borders",
        "movements",
        "labels",
        "participation",
      ].includes(l.id)
    )
      c.addIssue({
        code: "custom",
        path: ["id"],
        message: "reserved layer id",
      });
    const allowed =
      l.kind === "point"
        ? ["Point"]
        : l.kind === "line"
          ? ["LineString", "MultiLineString"]
          : ["Polygon", "MultiPolygon"];
    l.features.features.forEach((f, i) => {
      if (!allowed.includes(f.geometry.type))
        c.addIssue({
          code: "custom",
          path: ["features", "features", i, "geometry"],
          message: `expected ${l.kind} geometry`,
        });
    });
  });
export const geographyFile = z
  .object({
    countries: featureCollection(country),
    layers: z.array(staticLayer),
    anchors: z.array(
      z
        .object({
          id: kebabId,
          name: text,
          at: lngLat,
          sources: z.array(sourceId).min(1),
        })
        .strict(),
    ),
    members: z.array(
      z
        .object({
          id: kebabId,
          a3: z.string().regex(/^[A-Z]{3}$/),
          joined: geographyDate,
          sources: z.array(sourceId).min(1),
        })
        .strict(),
    ),
    referenceItems: z.array(
      z
        .object({
          id: kebabId,
          label: text,
          summary: text,
          detail: text.optional(),
          sourceIds: z.array(sourceId).min(1),
          locationRef: kebabId,
          locationScope: z.literal("country"),
          figure: z
            .string()
            .regex(/^[a-z0-9-]+$/)
            .optional(),
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((g, c) => {
    const unique = (values: string[], path: string) => {
      if (new Set(values).size !== values.length)
        c.addIssue({
          code: "custom",
          path: [path],
          message: "duplicate id or a3",
        });
    };
    unique(
      g.countries.features.map((f) => f.properties.id),
      "countries",
    );
    unique(
      g.countries.features.map((f) => f.properties.a3),
      "countries",
    );
    unique(
      g.members.map((m) => m.id),
      "members",
    );
    unique(
      g.members.map((m) => m.a3),
      "members",
    );
    unique(
      g.layers.map((l) => l.id),
      "layers",
    );
    unique(
      g.anchors.map((a) => a.id),
      "anchors",
    );
    unique(
      g.referenceItems.map((r) => r.id),
      "referenceItems",
    );
    const countries = new Map(
      g.countries.features.map((f) => [f.properties.id, f.properties.a3]),
    );
    if (g.members.length !== countries.size)
      c.addIssue({
        code: "custom",
        path: ["members"],
        message: "members must match countries one-to-one",
      });
    g.members.forEach((m, i) => {
      if (countries.get(m.id) !== m.a3)
        c.addIssue({
          code: "custom",
          path: ["members", i],
          message: "unknown country or mismatched a3",
        });
    });
    g.referenceItems.forEach((r, i) => {
      if (!countries.has(r.locationRef))
        c.addIssue({
          code: "custom",
          path: ["referenceItems", i, "locationRef"],
          message: "unknown country",
        });
    });
    const objectIds = [
      ...countries.keys(),
      ...new Set(
        g.layers.flatMap((l) =>
          l.features.features.map((f) => f.properties.id),
        ),
      ),
      ...g.referenceItems.map((r) => r.id),
    ];
    unique(objectIds, "layers");
  });
const preset = z
  .object({ id: kebabId, label: text, camera: geoCamera })
  .strict();
export const geographyData = z
  .object({
    geography: geographyFile,
    sources: sourcesFile.optional(),
    glossary: glossaryFile.optional(),
    presets: z
      .object({ presets: z.array(preset) })
      .strict()
      .optional(),
    entities: z.array(z.never()).max(0).default([]),
    control: z
      .object({ keyframes: z.array(z.never()).max(0) })
      .strict()
      .default({ keyframes: [] }),
    movements: z.array(z.never()).max(0).default([]),
    events: z.array(z.never()).max(0).default([]),
  })
  .strict()
  .superRefine((d, c) => {
    const known = sourceIds(d.sources);
    const check = (ids: string[], path: (string | number)[]) =>
      ids.forEach((id, i) => {
        if (!known.has(id))
          c.addIssue({
            code: "custom",
            path: [...path, i],
            message: `unknown source ${id}`,
          });
      });
    const g = d.geography;
    g.countries.features.forEach((f, i) =>
      check(f.properties.sources, [
        "geography",
        "countries",
        "features",
        i,
        "properties",
        "sources",
      ]),
    );
    g.layers.forEach((l, i) =>
      l.features.features.forEach((f, j) =>
        check(f.properties.sources, [
          "geography",
          "layers",
          i,
          "features",
          "features",
          j,
          "properties",
          "sources",
        ]),
      ),
    );
    g.anchors.forEach((a, i) =>
      check(a.sources, ["geography", "anchors", i, "sources"]),
    );
    g.members.forEach((m, i) =>
      check(m.sources, ["geography", "members", i, "sources"]),
    );
    g.referenceItems.forEach((r, i) =>
      check(r.sourceIds, ["geography", "referenceItems", i, "sourceIds"]),
    );
  });
const fields = {
  geoContext: geoContextSchema,
  camera: geoCamera,
  layers: z.array(kebabId),
  highlight: z.array(kebabId).max(3),
  selection: kebabId.nullable(),
  caption: text,
};
export const geographyBeat = z.object(fields).strict();
export const geographyChapterState = z
  .object({
    geoContext: geoContextSchema,
    camera: geoCamera.optional(),
    layers: z.array(kebabId).optional(),
    highlight: z.array(kebabId).optional(),
    selection: kebabId.nullable(),
    theme: theme.optional(),
    question: text.optional(),
    summary: text.optional(),
    answer: text.optional(),
    note: text.optional(),
    index: z
      .array(kebabId)
      .refine((v) => new Set(v).size === v.length, "duplicate index id"),
    beats: z.array(geographyBeat).min(1),
  })
  .strict()
  .refine((s) => !s.answer || s.question, {
    path: ["answer"],
    message: "answer needs question",
  });
export type GeographyData = z.output<typeof geographyData>;
export type GeographyFile = z.output<typeof geographyFile>;
export type GeographyChapterState = z.output<typeof geographyChapterState>;
export type GeographyBeat = z.output<typeof geographyBeat>;
