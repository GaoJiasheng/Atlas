import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MapOverlay, mapOverlayDefaultOpen } from '../../src/engines/time-scene/MapOverlay';

describe('map layers and key overlay', () => {
  it.each([390, 759, 760, 900, 1024])('starts folded at %i px, even when the stage fills the viewport', (width) => {
    expect(mapOverlayDefaultOpen(width)).toBe(false);
  });

  it('preserves desktop defaults only when the map stage has room', () => {
    expect(mapOverlayDefaultOpen(1025, 720)).toBe(true);
    expect(mapOverlayDefaultOpen(1920, 1200)).toBe(true);
    expect(mapOverlayDefaultOpen(1280, 719)).toBe(false);
  });

  it.each(['Layers and key', '图层与图例'])('keeps a native, labelled disclosure and mounted controls for %s', (label) => {
    const html = renderToStaticMarkup(createElement(MapOverlay, {
      label,
      legend: 'entities',
      children: createElement('button', { type: 'button', 'data-layer': 'sites' }, 'Sites'),
    }));
    expect(html).toMatch(/^<details[^>]*data-legend="entities"[^>]*>/);
    expect(html).not.toMatch(/^<details[^>]*\sopen(?:=|\s|>)/);
    expect(html).toContain(`aria-label="${label}" aria-expanded="false"`);
    expect(html).toContain('class="ts-overlay__summary"');
    expect(html).toContain('data-layer="sites"');
  });
});
