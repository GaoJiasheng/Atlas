import { useEffect, type DependencyList, type RefObject } from 'react';
import { scrollCue } from './scroll-cue';

/**
 * Keep `data-more-start` / `data-more-end` on a scroller while content is hidden past that end
 * (`styles/scene.css` draws the fade and the chevron from them). The axis is whichever one overflows:
 * the rail is a column on larger screens and a chip row on phones. `deps`: whatever remounts or refills it.
 */
export function useScrollCue(ref: RefObject<HTMLElement | null>, deps: DependencyList) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const across = el.scrollWidth - el.clientWidth > el.scrollHeight - el.clientHeight;
      const { start, end } = scrollCue(
        across
          ? { offset: el.scrollLeft, view: el.clientWidth, content: el.scrollWidth }
          : { offset: el.scrollTop, view: el.clientHeight, content: el.scrollHeight },
      );
      el.toggleAttribute('data-more-start', start);
      el.toggleAttribute('data-more-end', end);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      resize.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller names what refills the scroller
  }, deps);
}
