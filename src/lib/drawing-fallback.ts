/**
 * Home plate cards: a drawing that fails to load (missing file on a deploy, offline
 * without cache) turns its card into the dotted placeholder plate instead of a broken image.
 * Client-side; the build already renders the placeholder when no drawing exists.
 */
export function initDrawingFallbacks(root: ParentNode = document): void {
  for (const figure of root.querySelectorAll<HTMLElement>('[data-figure="drawing"]')) {
    const img = figure.querySelector('img');
    if (!img) continue;
    const fallback = () => {
      img.remove();
      figure.dataset.figure = 'placeholder';
    };
    if (img.complete && img.naturalWidth === 0) fallback();
    else img.addEventListener('error', fallback, { once: true });
  }
}
