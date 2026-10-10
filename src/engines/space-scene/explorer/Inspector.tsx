/**
 * Selected part details (InfoPanel "inspector" slot), in the plate's hairline
 * grammar: part number + name (中文 beneath), summary, detail behind "more"
 * (blank lines = paragraphs; `[S3]` markers = source superscripts that open
 * the host's source popover), group swatch, "left / right" chips for a
 * bilateral pair (select the other side), and "connected to" chips that
 * select the connected part.
 */
import { useId, useState } from 'react';
import { useScene, useSceneContext, useSceneStore, useT } from '../../core/context';
import { tx } from '../../../i18n';
import { resolveColorRef } from '../../../theme/theme';
import { Icon } from '../../widgets/icons';
import { SourceRefs } from '../../widgets/SourcePopover';
import { detailParagraphs } from '../lib/detail';
import { partNumber } from '../hud/common';
import type { SpaceSceneExt } from '../index';
import type { Part, PartsFile } from '../schema';

function PartDetails({ part, file }: { part: Part; file: PartsFile }) {
  const { locale } = useSceneContext();
  const t = useT();
  const store = useSceneStore<SpaceSceneExt>();
  const [open, setOpen] = useState(false);
  const detailId = useId();
  const group = part.group !== undefined ? file.groups.find((g) => g.id === part.group) : undefined;
  const connects = part.connects
    .map((id) => file.parts.find((p) => p.id === id))
    .filter((p): p is Part => p !== undefined);
  const detail = detailParagraphs(tx(part.detail, locale));

  return (
    <section className="space-inspector" aria-label={tx(part.name, locale)}>
      <header className="space-inspector__header">
        <span className="space-inspector__no" aria-hidden="true">
          {partNumber(file, part.id)}
        </span>
        <h3 className="space-inspector__title">
          {tx(part.name, locale)}
          {locale === 'en' && part.name.zh && (
            <small lang="zh-Hans">{part.name.zh}</small>
          )}
        </h3>
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

      {detail.length > 0 && (
        <>
          <div id={detailId} className="space-inspector__detail" hidden={!open}>
            {detail.map((runs, i) => (
              <p key={i}>
                {runs.map((run, j) => ('text' in run ? run.text : <SourceRefs key={j} ids={run.sources} locale={locale} />))}
              </p>
            ))}
          </div>
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

      {part.pair && part.side && (
        <div className="space-inspector__row">
          <span className="space-inspector__label">{t('space.side')}</span>
          <ul className="space-chips">
            {(['left', 'right'] as const).map((side) => (
              <li key={side}>
                <button
                  type="button"
                  className="atlas-control space-chip"
                  aria-pressed={part.side === side}
                  data-side={side}
                  onClick={() => {
                    if (part.side !== side) store.getState().patch({ part: part.pair! });
                  }}
                >
                  {t(side === 'left' ? 'space.side.left' : 'space.side.right')}
                </button>
              </li>
            ))}
          </ul>
        </div>
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
  const part = partId ? file.parts.find((p) => p.id === partId && !p.context) : undefined;
  if (!part) return <p className="space-hint">{t('space.hint')}</p>;
  // Keyed so "more" collapses again when the selection changes.
  return <PartDetails key={part.id} part={part} file={file} />;
}
