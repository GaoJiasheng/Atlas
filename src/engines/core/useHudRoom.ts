import { useLayoutEffect, type RefObject } from 'react';
import type { HudActions, HudStore } from './controls';
import { solveHudRoom, measureFreeStage, type HudMeasurements, type FreeStage } from './hud-room';

/** Measure shared HUD once per layout change; expose stage-local framing to every engine. */
export function useHudRoom(root: RefObject<HTMLElement | null>, hud: HudStore, actions: HudActions) {
  useLayoutEffect(() => {
    const scene = root.current;
    if (!scene) return;
    let frame = 0,
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
      frame = 0;
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
      sizes.bottom = (bottom?.height ?? 0) + (drawerVisible ? (reader?.height ?? 0) : 0) + 24;
      if (bounds.width >= 760)
        sizes.left.width =
          Number(getComputedStyle(scene).getPropertyValue('--hud-left-units')) * (Number(scene.style.getPropertyValue('--kt')) || 1);
      if (left && state.leftColumn !== 'collapsed') {
        if (bounds.width < 760) sizes.left.width = left.width;
        sizes.left.height =
          Array.from(scene.querySelectorAll<HTMLElement>('.atlas-left-body > *'))
            .filter(visible)
            .reduce((n, e) => n + e.getBoundingClientRect().height, 0) + 32;
        if (state.leftColumn === 'open')
          sizes.left.metadata = Array.from(scene.querySelectorAll<HTMLElement>('.atlas-title__sub,.atlas-spec,.atlas-title__note')).reduce(
            (n, e) => n + e.getBoundingClientRect().height,
            0,
          );
        else sizes.left.height += sizes.left.metadata;
      }
      if (right) {
        sizes.right.width = right.width;
        if (state.cardOpen && state.legendsOpen)
          sizes.right.height = Array.from(scene.querySelectorAll<HTMLElement>('.atlas-hud__right > *'))
            .filter(visible)
            .reduce((n, e) => n + e.getBoundingClientRect().height, 0);
      }
      if (state.cardOpen) sizes.right.card = box('.atlas-card')?.height ?? 0;
      if (state.legendsOpen)
        sizes.right.legends = Array.from(
          scene.querySelectorAll<HTMLElement>('.atlas-stage__overlay .atlas-legend ul,.atlas-stage__overlay .atlas-ctl__rows'),
        ).reduce((n, e) => n + e.getBoundingClientRect().height, 0);
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
        const blocks = Array.from(scene.querySelectorAll<HTMLElement>('[data-hud-panel]')).filter(
          (e) => e.dataset.hudPanel !== 'perf' && visible(e),
        );
        const rects = blocks.map((e) => {
          const r = e.getBoundingClientRect();
          return { x0: r.left - stage.left, y0: r.top - stage.top, x1: r.right - stage.left, y1: r.bottom - stage.top };
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
        ...scene.querySelectorAll('[data-hud-panel],.atlas-hud__left,.atlas-hud__right,.atlas-hud__dock'),
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
      if (!disposed && !frame) frame = requestAnimationFrame(measure);
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
