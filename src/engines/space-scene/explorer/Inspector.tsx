/**
 * Selected part details (InfoPanel "inspector" slot), in the plate's hairline
 * grammar: part number + name (中文 beneath), level chip, summary, detail
 * behind "more", group swatch, and "connected to" chips that select the
 * connected part.
 */
import { useId, useState } from 'react';
import { useScene, useSceneContext, useSceneStore, useT } from '../../core/context';
import { tx } from '../../../i18n';
import { resolveColorRef } from '../../../theme/theme';
import { Icon } from '../../widgets/icons';
import type { SpaceSceneExt } from '../index';
import type { Part, PartsFile } from '../schema';

function PartDetails({ part, file }: { part: Part; file: PartsFile }) {
  const { locale } = useSceneContext();
  const t = useT();
  const store = useSceneStore<SpaceSceneExt>();
  const [open, setOpen] = useState(false);
  const detailId = useId();
  const group = file.groups.find((g) => g.id === part.group);
  const connects = part.connects
    .map((id) => file.parts.find((p) => p.id === id))
    .filter((p): p is Part => p !== undefined);
  const detail = tx(part.detail, locale);

  return (
    <section className="space-inspector" aria-label={tx(part.name, locale)}>
      <header className="space-inspector__header">
        <span className="space-inspector__no" aria-hidden="true">
          {String(file.parts.indexOf(part) + 1).padStart(2, '0')}
        </span>
        <h3 className="space-inspector__title">
          {tx(part.name, locale)}
          {locale === 'en' && part.name.zh && (
            <small lang="zh-Hans">{part.name.zh}</small>
          )}
        </h3>
        <span className="atlas-badge">{t('chapter.level', { level: part.level })}</span>
        <button
          type="button"
          className="atlas-control atlas-control--ghost atlas-control--icon space-inspector__close"
          aria-label={t('space.deselect')}
          onClick={() => store.getState().patch({ part: null })}
        >
          <Icon name="close" size={18} />
        </button>
      </header>

      <p className="space-inspector__summary">{tx(part.summary, locale)}</p>

      {detail && (
        <>
          <p id={detailId} className="space-inspector__detail" hidden={!open}>
            {detail}
          </p>
          <button
            type="button"
            className="atlas-control atlas-control--ghost space-inspector__more"
            aria-expanded={open}
            aria-controls={detailId}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? t('space.less') : t('space.more')}
          </button>
        </>
      )}

      {group && (
        <div className="space-inspector__row">
          <span className="space-inspector__label">{t('space.group')}</span>
          <span className="space-chip space-chip--static">
            <span className="atlas-legend__fill" style={{ background: resolveColorRef(group.color) }} aria-hidden="true" />
            {tx(group.name, locale)}
          </span>
        </div>
      )}

      {connects.length > 0 && (
        <div className="space-inspector__row">
          <span className="space-inspector__label">{t('space.connects')}</span>
          <ul className="space-chips">
            {connects.map((p) => (
              <li key={p.id}>
                <button type="button" className="atlas-control space-chip" onClick={() => store.getState().patch({ part: p.id })}>
                  {tx(p.name, locale)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function Inspector({ file }: { file: PartsFile }) {
  const t = useT();
  const partId = useScene<SpaceSceneExt, string | null>((s) => s.part);
  const part = partId ? file.parts.find((p) => p.id === partId) : undefined;
  if (!part) return <p className="space-hint">{t('space.hint')}</p>;
  // Keyed so "more" collapses again when the selection changes.
  return <PartDetails key={part.id} part={part} file={file} />;
}
