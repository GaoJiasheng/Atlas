/** Build-time checks of local climate resources, shared with validator tests. */
import type { TopicMeta } from '../../src/content/schema/topic';
import { validateClimateResource } from '../../src/engines/time-scene/lib/climate';

export interface MonthlyResourceIssue {
  file: string;
  message: string;
}

export function monthlyResourceIssues(
  topic: Pick<TopicMeta, 'temporalMode' | 'climatology' | 'monthlyLayers'> & Pick<Partial<TopicMeta>, 'basemap'>,
  sources: ReadonlySet<string>,
  readGeo: (stem: string) => unknown,
): MonthlyResourceIssue[] {
  const issues: MonthlyResourceIssue[] = [];
  if (topic.temporalMode !== 'climatology' || !topic.climatology) return issues;
  const basemaps = [topic.basemap?.local, topic.basemap?.region?.land, topic.basemap?.region?.rivers].filter((file): file is string =>
    Boolean(file),
  );
  for (const stem of basemaps) {
    const visit = (value: unknown, path: string) => {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) {
        value.forEach((item, i) => visit(item, `${path}.${i}`));
        return;
      }
      for (const [key, item] of Object.entries(value)) {
        if (key === 'properties' && item && typeof item === 'object') {
          for (const time of ['from', 'to', 't', 'until'])
            if (Object.hasOwn(item, time))
              issues.push({
                file: `public/geo/${stem}.json`,
                message: `${path}.properties.${time}: climatology basemaps must be undated`,
              });
        } else visit(item, `${path}.${key}`);
      }
    };
    visit(readGeo(stem), stem);
  }
  const period = topic.climatology;
  for (const [i, source] of (period.keySources ?? []).entries())
    if (!sources.has(source)) issues.push({ file: 'topic.yaml', message: `climatology.keySources.${i}: unknown source ${source}` });
  for (const [index, layer] of (topic.monthlyLayers ?? []).entries()) {
    const file = `public/geo/${layer.file}.json`;
    for (const [sourceIndex, source] of layer.sources.entries())
      if (!sources.has(source))
        issues.push({
          file: 'topic.yaml',
          message: `monthlyLayers.${index}.sources.${sourceIndex}: unknown source ${source}`,
        });
    if (layer.periodId !== period.periodId)
      issues.push({
        file: 'topic.yaml',
        message: `monthlyLayers.${index}.periodId: must match topic climatology.periodId`,
      });
    const raw = readGeo(layer.file);
    if (raw === undefined) {
      issues.push({
        file,
        message: `monthly layer "${layer.id}": file not found`,
      });
      continue;
    }
    try {
      const data = validateClimateResource(raw, {
        quantity: layer.quantity,
        periodId: period.periodId,
        startYear: period.startYear,
        endYear: period.endYear,
        sources,
      });
      // The source chips in the layer key and the sampled resource must agree.
      const declared = new Set(layer.sources);
      if (data.sources.length !== declared.size || data.sources.some((id) => !declared.has(id)))
        issues.push({
          file,
          message: 'sources: must match the monthly layer sources',
        });
    } catch (error) {
      const parsed = error as {
        issues?: { path: (string | number)[]; message: string }[];
      };
      if (parsed.issues)
        for (const issue of parsed.issues)
          issues.push({
            file,
            message: `${issue.path.join('.')}: ${issue.message}`,
          });
      else
        issues.push({
          file,
          message: `monthly layer: ${(error as Error).message}`,
        });
    }
  }
  return issues;
}
