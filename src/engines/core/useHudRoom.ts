import { useLayoutEffect, type RefObject } from 'react';
import type { HudActions, HudStore } from './controls';
import { solveHudRoom, measureFreeStage, type HudMeasurements, type FreeStage } from './hud-room';

/** Rows of the chapter rail the left column keeps before it hides its metadata (the rest scrolls). */
const RAIL_MIN_ROWS = 3;

/** Measure shared HUD once per layout change; expose stage-local framing to every engine. */
export function useHudRoom(root: RefObject<HTMLElement | null>, hud: HudStore, actions: HudActions) {
  useLayoutEffect(() => {
    const scene = root.current;
    if (!scene) return;
    let frame = 0,
      timer = 0,
      disposed = false;
    const sizes: HudMeasurements = {
      top: 100,
      bottom: 90,
      reader: 400,
      edge: 24,
      tab: 44,
      left: { width: 240, height: 500, metadata: 180 },
      right: { width: 264, height: 500, legends: 140, card: 180 },
    };
    const visible = (el: Element) => {
      for (let e: Element | null = el; e && e !== scene.parentElement; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
      }
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const box = (selector: string) => scene.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
    /** Height a block wants: its box, or its content when a max-height made it scroll. */
    const natural = (e: HTMLElement) => Math.max(e.getBoundingClientRect().height, e.scrollHeight);
    /** Outermost visible HUD blocks inside a column (nested blocks are part of their parent). */
    const panelsIn = (column: string) =>
      Array.from(scene.querySelectorAll<HTMLElement>(`${column} [data-hud-panel]`)).filter(
        (e) => visible(e) && !e.parentElement?.closest(`${column} [data-hud-panel]`),
      );
    /** A folded block keeps its title rows (its fold controls / summary); without one, a 44 px row. */
    const headRow = (e: HTMLElement) =>
      Array.from(e.querySelectorAll<HTMLElement>(':scope > summary, [data-fold-control]'))
        .filter(visible)
        .reduce((n, h) => n + h.getBoundingClientRect().height, 0) || 44;
    /** A column's stacked height: its laid-out children plus what its HUD blocks would need unclipped. */
    const stackHeight = (column: string, counts: (e: HTMLElement) => boolean) =>
      Array.from(scene.querySelectorAll<HTMLElement>(`${column} > *`))
        .filter(visible)
        .reduce((n, e) => n + e.getBoundingClientRect().height, 0) +
      panelsIn(column)
        .filter(counts)
        .reduce((n, e) => n + Math.max(0, e.scrollHeight - e.getBoundingClientRect().height), 0);
    /** How far the left column's content runs past its box: the rail counted at a few rows (it is
     * meant to scroll), every other block at its natural height (a squeezed PLATE included). */
    const leftOverflow = () => {
      const body = scene.querySelector<HTMLElement>('.atlas-left-body');
      if (!body || !visible(body)) return 0;
      let need = 0;
      for (const c of Array.from(body.children) as HTMLElement[]) {
        if (!visible(c)) continue;
        if (c.dataset.hudPanel !== 'rail') {
          // Its box, plus whatever a squeezed block hides in its own scroll boxes (a PLATE body, an overflowing panel).
          need += [c, ...c.querySelectorAll<HTMLElement>('*')]
            .filter((e) => e.scrollHeight > e.clientHeight + 1 && (e === c || /auto|scroll/.test(getComputedStyle(e).overflowY)))
            .reduce((n, e) => n + e.scrollHeight - e.clientHeight, c.getBoundingClientRect().height);
          continue;
        }
        const list = c.querySelector<HTMLElement>('.atlas-rail__list');
        const height = c.getBoundingClientRect().height;
        const row = list?.firstElementChild?.getBoundingClientRect().height ?? 0;
        const chrome = height - (list?.clientHeight ?? 0);
        const natural = chrome + (list?.scrollHeight ?? 0);
        need += Math.min(natural, chrome + RAIL_MIN_ROWS * row) + (Number.parseFloat(getComputedStyle(c).marginTop) || 0);
      }
      return need - body.clientHeight;
    };
    const observed = new Set<Element>();
    const resize = new ResizeObserver(() => schedule());
    let syncingPlate = false;
    const pendingPlates = new WeakMap<HTMLButtonElement, boolean>();
    const plateSync = () => {
      // Compatibility boundary: drive each existing engine's own React header
      // so conditionally mounted PLATE bodies also reopen. Phase 2 can replace
      // the local state with useHud/actions and remove this adapter.
      const open = hud.getState().plateOpen;
      for (const head of scene.querySelectorAll<HTMLButtonElement>(
        '.atlas-plate [data-hud-panel="plate"] > button[aria-expanded]:not([data-fold-control])',
      )) {
        if (!head.classList.contains('atlas-fold')) head.classList.add('atlas-fold');
        if (head.hasAttribute('data-fold-tab') === open) head.toggleAttribute('data-fold-tab', !open);
        if (head.getAttribute('aria-expanded') === String(open)) {
          pendingPlates.delete(head);
          continue;
        }
        if (pendingPlates.get(head) === open) continue;
        pendingPlates.set(head, open);
        syncingPlate = true;
        try {
          head.click();
        } finally {
          syncingPlate = false;
        }
      }
    };
    const measure = () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      frame = 0;
      timer = 0;
      if (disposed) return;
      plateSync();
      const state = hud.getState(),
        bounds = scene.getBoundingClientRect();
      const top = box('.atlas-topbar'),
        bottom = box('.atlas-hud__dock'),
        reader = box('.atlas-reader');
      const left = box('.atlas-hud__left'),
        right = box('.atlas-hud__right');
      if (top) sizes.top = top.bottom - bounds.top;
      const drawer = scene.querySelector('.atlas-panel__toggle');
      const drawerVisible = drawer && visible(drawer);
      sizes.sheet = drawerVisible ? (reader?.height ?? 0) : 0;
      sizes.bottom = (bottom?.height ?? 0) + sizes.sheet + 24;
      if (bounds.width >= 760)
        sizes.left.width =
          Number(getComputedStyle(scene).getPropertyValue('--hud-left-units')) * (Number(scene.style.getPropertyValue('--kt')) || 1);
      if (left && state.leftColumn !== 'collapsed') {
        if (bounds.width < 760) sizes.left.width = left.width;
        // Engine blocks (PLATE, dated layers, geology …) count at their natural height, so a block
        // squeezed into a scroll box still presses on the column; the rail is meant to scroll.
        sizes.left.height = stackHeight('.atlas-left-body', (e) => e.dataset.hudPanel !== 'rail') + 32;
        if (state.leftColumn === 'open')
          sizes.left.metadata = Array.from(scene.querySelectorAll<HTMLElement>('.atlas-title__sub,.atlas-spec,.atlas-title__note')).reduce(
            (n, e) => n + e.getBoundingClientRect().height,
            0,
          );
        else sizes.left.height += sizes.left.metadata;
        sizes.left.overflow = leftOverflow() + (state.leftColumn === 'compact' ? sizes.left.metadata : 0);
      } else sizes.left.overflow = 0;
      if (right) {
        // Measured open only: a folded card shifts the column by its tab, which must not flip the solver back.
        if (state.cardOpen) sizes.right.width = right.width;
        // Every visible [data-hud-panel] of the right column counts, shared or engine-private (keys,
        // readouts, overlays): the card is what the card fold frees; every other block folds to its
        // title row with the legends, so it frees its natural height less that row.
        if (state.cardOpen && state.legendsOpen) {
          const blocks = panelsIn('.atlas-hud__right');
          const isCard = (e: HTMLElement) => e.dataset.hudPanel === 'card' || !!e.closest('.atlas-card');
          sizes.right.height = stackHeight('.atlas-hud__right', () => true);
          sizes.right.card = blocks.filter(isCard).reduce((n, e) => n + natural(e), 0);
          sizes.right.legends = blocks
            .filter((e) => !isCard(e) && e.dataset.hudPanel !== 'card-tab')
            .reduce((n, e) => n + Math.max(0, natural(e) - headRow(e)), 0);
        }
      }
      // Keep the natural reader width independently of the solver's narrowed width.
      sizes.reader = Math.min(640, Math.max(340, 400 * Math.max(1, Number(scene.style.getPropertyValue('--k')) || 1)));
      const room = solveHudRoom({ width: bounds.width, height: bounds.height }, sizes, state.manual);
      const patch = state.stageOnly ? {} : room.folds;
      const styleWidth = `${room.readerWidth}px`;
      if (scene.style.getPropertyValue('--room-reader-width') !== styleWidth) scene.style.setProperty('--room-reader-width', styleWidth);
      const drawerValue = room.drawer ? 'true' : 'false';
      if (scene.dataset.drawer !== drawerValue) scene.dataset.drawer = drawerValue;
      const stage = box('.atlas-stage');
      let freeStage: FreeStage | null = null;
      if (stage) {
        // H / presentation: the faded HUD stops counting at once, not when its fade ends.
        const hudOff = scene.dataset.hud === 'off';
        const blocks = Array.from(scene.querySelectorAll<HTMLElement>('[data-hud-panel]')).filter(
          (e) => e.dataset.hudPanel !== 'perf' && !(hudOff && e.closest('.hud-fade')) && visible(e),
        );
        const local = (r: DOMRect | FreeStage): FreeStage =>
          'x0' in r
            ? { x0: r.x0 - stage.left, y0: r.y0 - stage.top, x1: r.x1 - stage.left, y1: r.y1 - stage.top }
            : { x0: r.left - stage.left, y0: r.top - stage.top, x1: r.right - stage.left, y1: r.bottom - stage.top };
        const rects = blocks.flatMap((e) => {
          const r = e.getBoundingClientRect();
          if (e.dataset.hudPanel !== 'overlay') return [local(r)];
          // The overlay slot is a scrolling column: its cards (clipped to the column) are the obstacles, not its full height.
          return Array.from(e.children)
            .filter(visible)
            .map((c) => {
              const b = c.getBoundingClientRect();
              return local({ x0: Math.max(b.left, r.left), y0: Math.max(b.top, r.top), x1: Math.min(b.right, r.right), y1: Math.min(b.bottom, r.bottom) });
            })
            .filter((b) => b.x1 > b.x0 && b.y1 > b.y0);
        });
        freeStage = measureFreeStage(stage.width, stage.height, rects);
      }
      if (
        JSON.stringify(state.freeStage) !== JSON.stringify(freeStage) ||
        JSON.stringify(state.room) !== JSON.stringify(room) ||
        Object.entries(patch).some(([k, v]) => state[k as keyof typeof state] !== v)
      )
        hud.setState({ ...patch, room, freeStage });
      const current = new Set<Element>([
        scene,
        ...scene.querySelectorAll('[data-hud-panel],.atlas-hud__left,.atlas-hud__right,.atlas-hud__dock,.atlas-stage,.atlas-stage__overlay > *'),
      ]);
      for (const el of observed)
        if (!current.has(el)) {
          resize.unobserve(el);
          observed.delete(el);
        }
      for (const el of current)
        if (!observed.has(el)) {
          resize.observe(el);
          observed.add(el);
        }
    };
    function schedule() {
      if (disposed || frame) return;
      // Next frame, or sooner when frames are slow (a busy WebGL stage): rotation and resize must not wait on the renderer.
      frame = requestAnimationFrame(measure);
      timer = window.setTimeout(measure, 100);
    }
    const mutations = new MutationObserver(schedule);
    mutations.observe(scene, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'class',
        'hidden',
        'data-folded',
        'data-hud',
        'data-reader',
        'data-card',
        'data-left',
        'data-sheet',
        'data-panels',
        'data-legends',
        'data-stage-only',
        'aria-expanded',
      ],
    });
    resize.observe(scene);
    observed.add(scene);
    const off = hud.subscribe((s, p) => {
      if (s.manual !== p.manual || s.stageOnly !== p.stageOnly || s.plateOpen !== p.plateOpen || s.controls !== p.controls) schedule();
    });
    const plateClick = (e: MouseEvent) => {
      const head =
        e.target instanceof Element
          ? e.target.closest('.atlas-plate [data-hud-panel="plate"] > button[aria-expanded]:not([data-fold-control])')
          : null;
      if (head && !syncingPlate) {
        e.preventDefault();
        e.stopPropagation();
        actions.setPlate(!hud.getState().plateOpen);
        plateSync();
      }
    };
    scene.addEventListener('click', plateClick, true);
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    scene.addEventListener('transitionend', schedule);
    document.fonts?.ready.then(schedule);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      resize.disconnect();
      mutations.disconnect();
      off();
      scene.removeEventListener('click', plateClick, true);
      scene.removeEventListener('transitionend', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
    };
  }, [root, hud, actions]);
}
